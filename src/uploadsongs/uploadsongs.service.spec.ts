import { Test, TestingModule } from '@nestjs/testing';
import { UploadsongsService } from './uploadsongs.service';

describe('UploadsongsService', () => {
  let service: UploadsongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsongsService],
    }).compile();

    service = module.get<UploadsongsService>(UploadsongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
