// TODO Reto 2: reglas de validación con class-validator
//   - studentIds: arreglo NO vacío, cada elemento debe ser un UUID
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignStudentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID({} as unknown as undefined, { each: true })
  studentIds: string[];
}
