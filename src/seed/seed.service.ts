import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { Student } from '../student/entities/student.entity';
import { initialData } from './data/seed-student.data';
import { DataSource, In } from 'typeorm';
import { ResearchGroup } from '../research-group/entities/research-group.entity';
import { User } from '../user/entities/user.entity';
import { researchGroupData } from './data/seed-researchgroups.data';

@Injectable()
export class SeedService {
  constructor(
    private readonly studentService: StudentService,
    private readonly dataSource: DataSource,
  ) {}

  async runSeed() {
    await this.insertNewStudents();
    await this.insertResearchGroups();
    return 'SEED EXECUTED';
  }

  private async insertNewStudents() {
    await this.studentService.deleteAllStudents();
    const students = initialData.students;

    const insertPromises: Promise<Student | undefined>[] = [];

    students.forEach((student) => {
      insertPromises.push(this.studentService.createStudent(student));
    });

    await Promise.all(insertPromises);
    return true;
  }

  private async insertResearchGroups() {
    // ResearchGroup.createdBy es obligatorio -> usamos el primer admin existente
    const admin = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: 'admin' })
      .getOne();

    if (!admin) {
      throw new NotFoundException(
        'No admin user found: create an admin user before running the seed',
      );
    }

    // Los estudiantes ya fueron borrados, así que no hay FK que bloquee
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(ResearchGroup)
      .execute();

    await this.dataSource.transaction(async (manager) => {
      for (const {
        memberEmails,
        ...data
      } of researchGroupData.researchGroups) {
        const group = await manager.save(
          manager.create(ResearchGroup, { ...data, createdBy: admin }),
        );

        if (memberEmails.length > 0) {
          // update() NO dispara @BeforeUpdate, así que el nickname no se altera
          await manager.update(
            Student,
            { email: In(memberEmails) },
            { researchGroup: group },
          );
        }
      }
    });

    return true;
  }
}
