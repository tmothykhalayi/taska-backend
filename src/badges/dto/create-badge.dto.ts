import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateBadgeDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsNumber()
  milestone: number;

  @IsNumber()
  userId: number;
}