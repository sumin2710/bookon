import { Test, TestingModule } from '@nestjs/testing';
import { KopisapiService } from './kopisapi.service';

describe('KopisapiService', () => {
  let service: KopisapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KopisapiService],
    }).compile();

    service = module.get<KopisapiService>(KopisapiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
