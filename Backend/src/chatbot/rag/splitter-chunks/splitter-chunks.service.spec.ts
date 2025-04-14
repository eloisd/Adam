import { Test, TestingModule } from '@nestjs/testing';
import { SplitterChunksService } from './splitter-chunks.service';

describe('SplitterChunksService', () => {
  let service: SplitterChunksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SplitterChunksService],
    }).compile();

    service = module.get<SplitterChunksService>(SplitterChunksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
