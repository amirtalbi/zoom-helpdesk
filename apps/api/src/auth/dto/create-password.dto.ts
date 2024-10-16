import { IsString, MinLength } from 'class-validator';

export class CreatePasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}