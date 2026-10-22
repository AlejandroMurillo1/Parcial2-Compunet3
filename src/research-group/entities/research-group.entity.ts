import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Student } from '../../student/entities/student.entity';

@Entity()
export class ResearchGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('text', { unique: true })
  name: string;
  
  @Column('text', { unique: true })
  acronym: string;
  
  @Column('int')
  maxMembers: number;
  
  @OneToMany(() => Student, (student) => student.researchGroup)
  students?: Student[];
  
  @ManyToOne(() => User, { nullable: false })
  createdBy: User;
}