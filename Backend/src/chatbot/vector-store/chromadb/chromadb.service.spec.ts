import { Test, TestingModule } from '@nestjs/testing';
import { ChromadbService } from './chromadb.service';

describe('ChromadbService', () => {
  let service: ChromadbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChromadbService],
    }).compile();

    service = module.get<ChromadbService>(ChromadbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
