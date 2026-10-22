import { Controller } from '@nestjs/common';
import { ResearchGroupService } from './research-group.service';

@Controller('research-group')
export class ResearchGroupController {
  constructor(private readonly researchGroupService: ResearchGroupService) {}
}
