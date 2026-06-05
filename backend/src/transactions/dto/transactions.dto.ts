import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawalDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '1' })
  @IsString()
  withdrawal_method: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  pin: string;

  @ApiPropertyOptional({ example: 'Chase' })
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  account_number?: string;

  @ApiPropertyOptional({ example: '021000021' })
  @IsOptional()
  @IsString()
  routing_number?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  account_name?: string;

  @ApiPropertyOptional({ example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' })
  @IsOptional()
  @IsString()
  wallet_address?: string;

  @ApiPropertyOptional({ example: 'Mainnet' })
  @IsOptional()
  @IsString()
  network?: string;
}

export class TransferDto {
  @ApiProperty({ example: 2000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'recipient@coinsafe.com' })
  @IsString()
  recipient_email: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  pin: string;

  @ApiPropertyOptional({ example: 'Internal settlement' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTransactionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  transaction_type: string;

  @ApiProperty({ example: 'Approved' })
  @IsString()
  @IsIn(['Approved', 'Declined'])
  status: string;
}

export class AdminSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  transaction_limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class ClientUpdateDto {
  @ApiProperty()
  @IsString()
  client_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  recovered_balance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  total_deposit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  referal_bonus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  profit_bonus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  investment_balance?: number;
}

export class CreateInvestmentDto {
  @ApiProperty({ example: 'starter', enum: ['starter', 'gold'] })
  @IsString()
  @IsIn(['starter', 'gold'])
  plan: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'account_balance', enum: ['account_balance', 'credit_card', 'crypto_wallet'] })
  @IsString()
  @IsIn(['account_balance', 'credit_card', 'crypto_wallet'])
  paymentMethod: string;
}

export class ConnectWalletDto {
  @ApiProperty({ example: 'bitcoin', enum: ['bitcoin', 'ethereum', 'tether', 'binance'] })
  @IsString()
  @IsIn(['bitcoin', 'ethereum', 'tether', 'binance'])
  walletType: string;

  @ApiProperty({ example: 'word1 word2 ... word12' })
  @IsString()
  phraseKey: string;
}
