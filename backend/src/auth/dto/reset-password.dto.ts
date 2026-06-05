import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'NewStr0ng!Pass' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'NewStr0ng!Pass' })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ description: 'Base64-encoded user ID from email link' })
  @IsString()
  uidb64: string;

  @ApiProperty({ description: 'Reset token from email link' })
  @IsString()
  token: string;
}
