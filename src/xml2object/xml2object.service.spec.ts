import { Test, TestingModule } from '@nestjs/testing';
import { Xml2objectService } from './xml2object.service';

describe('Xml2objectService', () => {
  let service: Xml2objectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Xml2objectService],
    }).compile();

    service = module.get<Xml2objectService>(Xml2objectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
