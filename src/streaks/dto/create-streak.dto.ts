import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateStreakDto {
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsDateString()
  lastCompletedDate: string;
}