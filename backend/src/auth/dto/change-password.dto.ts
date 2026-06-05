import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass!1' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'NewPass!2' })
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'NewPass!2' })
  @IsString()
  confirmPassword: string;
}
