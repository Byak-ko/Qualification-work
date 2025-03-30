import { IsArray, IsNotEmpty, IsString, ValidateNested, ArrayMinSize, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @ArrayMinSize(1)
  respondentIds: number[]

  @IsArray()
  @ArrayMinSize(1)
  reviewerIds: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingItemDto)
  items: RatingItemDto[];
}

export class RatingItemDto {
  @IsString()
  name: string;

  @IsNumber()
  maxScore: number;

  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  comment: string;
}
