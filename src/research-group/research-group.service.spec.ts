import { Test, TestingModule } from '@nestjs/testing';
import { ResearchGroupService } from './research-group.service';

describe('ResearchGroupService', () => {
  let service: ResearchGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResearchGroupService],
    }).compile();

    service = module.get<ResearchGroupService>(ResearchGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
