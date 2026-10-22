import {
  IsInt,
  IsPositive,
  IsString,
  IsUppercase,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateResearchGroupDto {
  @IsString()
  @MinLength(3)
  name: string;
  
  @IsString()
  @Matches(/^[A-Z]{2,5}$/)
  @IsUppercase()
  acronym: string;
  
  @IsInt()
  @IsPositive()
  maxMembers: number;
}