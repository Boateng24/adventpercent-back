import { Test, TestingModule } from '@nestjs/testing';
import { UploadsongsController } from './uploadsongs.controller';

describe('UploadsongsController', () => {
  let controller: UploadsongsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsongsController],
    }).compile();

    controller = module.get<UploadsongsController>(UploadsongsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
