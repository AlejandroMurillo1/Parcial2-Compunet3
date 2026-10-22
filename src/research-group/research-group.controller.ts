import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ResearchGroupService } from './research-group.service';
import { CreateResearchGroupDto } from './dtos/create-researchgroup.dto';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { Auth } from '../user/decorators/auth.decorator';
import { ValidRoles } from '../user/enums/valid-roles.enum';
import { AssignStudentsToResearchGroup } from './dtos/assign-students.dto';

@Controller('research-group')
export class ResearchGroupController {
  constructor(private readonly researchGroupService: ResearchGroupService) {}

  @Auth(ValidRoles.admin)
  @Post()
  create(@Body() createRgDTO: CreateResearchGroupDto, @GetUser() user: User) {
    return this.researchGroupService.create(createRgDTO, user);
  }

  @Auth(ValidRoles.admin)
  @Patch(':id/members')
  addStudents(
    @Body() studentIds: AssignStudentsToResearchGroup,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.researchGroupService.assignStudents(id, studentIds);
  }
}
