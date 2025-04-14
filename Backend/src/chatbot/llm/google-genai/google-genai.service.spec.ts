import { Test, TestingModule } from '@nestjs/testing';
import { GoogleGenaiService } from './google-genai.service';

describe('GoogleGenaiService', () => {
  let service: GoogleGenaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleGenaiService],
    }).compile();

    service = module.get<GoogleGenaiService>(GoogleGenaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
