import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger, NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProgramDto } from './dto/create-program.dto';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from '../student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { Student } from '../student/entities/student.entity';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);
  // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    private readonly datasource: DataSource,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
  //   - nombre o código repetido -> 409 Conflict (no 500)
  async create(createProgramDto: CreateProgramDto, user: User) {
    try {
      const existing = await this.programRepository.findOneBy({
        name: createProgramDto.name,
        code: createProgramDto.code,
      });

      if (existing) {
        throw new ConflictException('Program already exists');
      }

      const program = this.programRepository.create({
        ...createProgramDto,
        createdBy: user,
      });

      return await this.programRepository.save(program);
    } catch (error) {
      this.handleException(error);
    }
  }

  // TODO Reto 1: findAll(paginationDto) -> lista paginada (limit / skip)
  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, skip } = paginationDto;
      return await this.programRepository.find({
        skip: skip,
        take: limit,
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe
  async findOne(id: string) {
    try {
      const program = await this.programRepository.findOne({
        where: { id },
        relations: { students: true },
      });

      if (!program) {
        throw new NotFoundException('Program not found');
      }

      return program;
    } catch (error) {
      this.handleException(error);
    }
  }

  // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
  //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
  //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
  //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
  //   Si algún id no existe: 404 y rollback.
  async assignStudents(id: string, assignStudentsDto: AssignStudentsDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const studentId of assignStudentsDto.studentIds) {
        const result = await queryRunner.manager.update(
          Student,
          { studentId },
          { program: { id } },
        );
        if (!result.affected)
          throw new NotFoundException(
            `Student with email ${studentId} not found`,
          );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      await queryRunner.release();
    }
    return await this.findOne(id);
  }

  async assignStudentsV2(id: string, assignStudentsDto: AssignStudentsDto) {
    const program = await this.programRepository.preload({
      id,
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentStudents = await queryRunner.manager.find(Student, {
        where: { program: { id } },
      });

      for (const studentId of assignStudentsDto.studentIds) {
        const existing = currentStudents.find(
          (student) => student.id === studentId,
        );

        if (existing) {
          existing.program = program;
        } else {
          const student = await this.studentRepository.findOneBy({
            id: studentId,
          });

          if (student !== null) {
            currentStudents.push(student);
          } else {
            throw new NotFoundException('Student was not found')
          }
        }
      }

      program.students = currentStudents;
      await queryRunner.manager.save(program);
      await queryRunner.commitTransaction();

      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      await queryRunner.release();
    }
  }

  // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
  //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.

  async bulkCreate(bulkCreateDto: BulkCreateProgramDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentPrograms = await queryRunner.manager.find(Program);

      for (const createProgram of bulkCreateDto.programs) {
        const programCreated = this.programRepository.create(createProgram);
        const existing = currentPrograms.find(
          (program) => program.name === programCreated.name,
        );
        if (existing) {
          throw new ConflictException('Program already exists');
        } else {
          await queryRunner.manager.save(programCreated);
          currentPrograms.push(programCreated);
        }
      }
      await queryRunner.commitTransaction();
      return currentPrograms;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      await queryRunner.release();
    }
  }

  private handleException(error: any): never {
    if (error instanceof HttpException) throw error;

    if (error.code === '23505') throw new ConflictException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
