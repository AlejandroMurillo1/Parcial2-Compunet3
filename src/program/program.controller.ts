import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from '../student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  // TODO Reto 1: POST   /api/program  -> crear programa
  @Post()
  create(@Body() createProgramDto: CreateProgramDto, @GetUser() user: User){
    return this.programService.create(createProgramDto, user);
  }
  // TODO Reto 1: GET    /api/program -> listar (paginado con PaginationDto)
  @Get()
  findAll(@Query() paginationDto: PaginationDto){
    return this.programService.findAll(paginationDto);
  }
  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  @Patch(':id/students')
  addStudents(
    @Param('id') programId: string,
    @Body() assignStudentsDto: AssignStudentsDto,
  ) {
    return this.programService.assignStudentsV2(programId, assignStudentsDto);
  }
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  @Post('bulk')
  bulkCreate(@Body() bulkCreateDto: BulkCreateProgramDto){
    return this.programService.bulkCreate(bulkCreateDto);
  }
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
