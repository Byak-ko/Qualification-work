import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RatingItemResponseDto {
  @IsInt()
  id: number;

  @IsNumber()
  score: number;

  @IsArray()
  @IsString({ each: true })
  documents: string[];
}

export class FillRatingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingItemResponseDto)
  items: RatingItemResponseDto[];
}
