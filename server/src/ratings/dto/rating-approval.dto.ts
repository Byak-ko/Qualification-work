import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { RatingApprovalStatus } from '../../entities/rating-approval.entity';
  
  export class RatingApprovalDto {

    ratingId: number;

    @IsEnum(RatingApprovalStatus)
    status: RatingApprovalStatus;

    @IsOptional()
    @IsObject()
    comments: Record<number, string>; 
  }
  