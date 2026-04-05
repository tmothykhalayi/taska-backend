import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQuoteDto {
  @IsNotEmpty()
  text: string;

  @IsOptional()
  author?: string;
}