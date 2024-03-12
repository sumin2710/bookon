import { Test, TestingModule } from '@nestjs/testing';
import { EventTimeService } from './event-time.service';

describe('EventTimeService', () => {
  let service: EventTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventTimeService],
    }).compile();

    service = module.get<EventTimeService>(EventTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
