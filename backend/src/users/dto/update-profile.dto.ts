import { IsOptional, IsString, IsEmail, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email change not yet supported' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '123 Main St, New York, NY 10001' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'bank', enum: ['bank', 'crypto'] })
  @IsOptional()
  @IsString()
  preferred_withdrawal_method?: string;

  @ApiPropertyOptional({ example: '0x...' })
  @IsOptional()
  @IsString()
  crypto_wallet_address?: string;
}
