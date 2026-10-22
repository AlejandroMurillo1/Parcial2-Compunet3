import { Module } from '@nestjs/common';
import { ResearchGroupService } from './research-group.service';
import { ResearchGroupController } from './research-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchGroup } from './entities/research-group.entity';
import { UserModule } from '../user/user.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResearchGroup]),
    UserModule,
    StudentModule,
  ],
  controllers: [ResearchGroupController],
  providers: [ResearchGroupService],
})
export class ResearchGroupModule {}
