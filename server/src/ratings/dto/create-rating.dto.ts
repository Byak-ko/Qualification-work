import { 
  IsArray, 
  IsNotEmpty, 
  IsString, 
  ValidateNested, 
  ArrayMinSize, 
  IsNumber, 
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDate
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RatingType } from 'src/entities/rating.entity';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(RatingType)
  @IsNotEmpty()
  type: RatingType;

  @IsArray()
  @ArrayMinSize(1)
  respondentIds: number[];

  @IsArray()
  @IsOptional()
  reviewerDepartmentsIds?: number[];

  @IsArray()
  @IsOptional()
  reviewerUnitsIds?: number[];
  
  @IsArray()
  @IsOptional()
  reviewerIds?: number[];

  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsOptional()
  endedAt: Date;

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

  @IsOptional()
  @IsBoolean()
  isDocNeed: boolean;
}
