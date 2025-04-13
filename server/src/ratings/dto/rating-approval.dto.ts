import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { RatingApprovalStatus, ReviewLevel } from '../../entities/rating-approval.entity';
  
export class RatingApprovalDto {
  ratingId: number;

  @IsEnum(RatingApprovalStatus)
  status: RatingApprovalStatus;

  @IsOptional()
  @IsObject()
  comments: Record<number, string>; 
}

export class RatingApprovalCommentsDto {
  reviewLevel: ReviewLevel;
  comments: Record<number, string>;
}