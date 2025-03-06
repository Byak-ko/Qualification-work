import { Test, TestingModule } from '@nestjs/testing';
import { RatingItemsController } from './rating-items.controller';

describe('RatingItemsController', () => {
  let controller: RatingItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingItemsController],
    }).compile();

    controller = module.get<RatingItemsController>(RatingItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
