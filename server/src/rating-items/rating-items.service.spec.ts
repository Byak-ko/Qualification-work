import { Test, TestingModule } from '@nestjs/testing';
import { RatingItemsService } from './rating-items.service';

describe('RatingItemsService', () => {
  let service: RatingItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatingItemsService],
    }).compile();

    service = module.get<RatingItemsService>(RatingItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
