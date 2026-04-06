import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export const USER_STATUSES = ['active', 'inactive'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsIn(USER_STATUSES)
  status: UserStatus;
}