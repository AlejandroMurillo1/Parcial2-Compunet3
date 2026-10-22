// TODO Reto 1: reglas de validación con class-validator
//   - name: string, mínimo 3 caracteres
//   - code: string de 3 a 6 letras MAYÚSCULAS (ej. "SIS", "MED")
//   - credits: entero positivo
import {
  IsInt,
  IsPositive,
  IsString,
  IsUppercase,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @MinLength(3)
  name:string;

  @IsString()
  @Matches(/^[A-Z]{3,6}$/)
  @IsUppercase()
  code:string;

  @IsInt()
  @IsPositive()
  credits:number;

}
