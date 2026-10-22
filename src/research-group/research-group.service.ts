import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResearchGroup } from './entities/research-group.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateResearchGroupDto } from './dtos/create-researchgroup.dto';
import { User } from '../user/entities/user.entity';
import { AssignStudentsToResearchGroup } from './dtos/assign-students.dto';
import { Student } from '../student/entities/student.entity';
import { count } from 'rxjs';

@Injectable()
export class ResearchGroupService {
  private readonly logger = new Logger('ResearchGroupService');

  constructor(
    @InjectRepository(ResearchGroup)
    private readonly researchGroupRepository: Repository<ResearchGroup>,
    private readonly datasource: DataSource,
  ) {}

  async create(dto: CreateResearchGroupDto, user: User) {
    try {
      const existing = await this.researchGroupRepository.findOneBy([
        { acronym: dto.acronym },
        { name: dto.name },
      ]);

      if (existing !== null) {
        throw new ConflictException(
          `Research group ${dto.name} already exists`,
        );
      }

      const created = this.researchGroupRepository.create({
        ...dto,
        createdBy: user,
      });

      return await this.researchGroupRepository.save(created);
    } catch (error) {
      this.handleException(error);
    }
  }

  async assignStudents(id: string, dto: AssignStudentsToResearchGroup) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const researchGroup = await queryRunner.manager.findOne(ResearchGroup, {
        where: { id },
      });

      if (!researchGroup) {
        throw new NotFoundException('Research group not found');
      }

      const studentIds = [...new Set(dto.studentIds)];
      const students = await queryRunner.manager.find(Student, {
        where: { id: In(studentIds) },
      });
      const foundIds = new Set(students.map((student) => student.id));
      const missingIds = studentIds.filter(
        (studentId) => !foundIds.has(studentId),
      );

      if (missingIds.length > 0) {
        throw new NotFoundException(
          `Students not found: ${missingIds.join(', ')}`,
        );
      }

      const currentStudentIds = new Set(
        researchGroup.students?.map((student) => student.id),
      );

      const studentsToAssign = students.filter(
        (student) => !currentStudentIds.has(student.id),
      );

      for (const student of studentsToAssign) {
        student.researchGroup = researchGroup;
      }

      if (studentsToAssign.length > 0) {
        await queryRunner.manager.save(Student, studentsToAssign);
      }

      const updatedResearchGroup = await queryRunner.manager.findOne(
        ResearchGroup,
        {
          where: { id },
          relations: { students: true },
        },
      );

      const studentNumberBeforeCommitting = await queryRunner.manager.count(
        Student,
        {
          where: { researchGroup: { id } },
        },
      );

      if (studentNumberBeforeCommitting > researchGroup.maxMembers) {
        throw new ConflictException(
          'Students Limit exceeded, try again with fewer members',
        );
      }

      await queryRunner.commitTransaction();
      return updatedResearchGroup;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.handleException(error);
    } finally {
      await queryRunner.release();
    }
  }

  private handleException(error: any): never {
    if (error instanceof HttpException) throw error;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23505') throw new ConflictException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
