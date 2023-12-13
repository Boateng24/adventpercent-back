import { Test, TestingModule } from '@nestjs/testing';
import { DbconnectionService } from './dbconnection.service';

describe('DbconnectionService', () => {
  let service: DbconnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbconnectionService],
    }).compile();

    service = module.get<DbconnectionService>(DbconnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
