import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { WithdrawalDto, TransferDto, UpdateTransactionDto, AdminSettingsDto, ClientUpdateDto, CreateInvestmentDto, ConnectWalletDto } from './dto/transactions.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('trans')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  // ── Read ──────────────────────────────────────────────────────────

  @Get('account_summary')
  @ApiOperation({ summary: 'Get account financial summary' })
  async accountSummary(@CurrentUser() user: any) {
    return this.service.getAccountSummary(user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get user transaction history' })
  async list(@CurrentUser() user: any) {
    return this.service.getTransactions(user.sub);
  }

  @Get('user_deposit')
  @ApiOperation({ summary: 'Get user deposit history' })
  async userDeposits(@CurrentUser() user: any) {
    return this.service.getUserDeposits(user.sub);
  }

  @Get('deposit_addresses')
  @ApiOperation({ summary: 'Get platform wallet addresses for deposit' })
  async depositAddresses() {
    return this.service.getDepositAddresses();
  }

  @Get('withdrawal_method')
  @ApiOperation({ summary: 'Get available withdrawal methods' })
  async withdrawalMethods() {
    return this.service.getWithdrawalMethods();
  }

  // ── Write ─────────────────────────────────────────────────────────

  @Post('deposit')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a deposit request' })
  @UseInterceptors(FileInterceptor('receipt'))
  async deposit(
    @CurrentUser() user: any,
    @Body() body: any,
    @UploadedFile() receipt?: any,
  ) {
    return this.service.deposit(user.sub, body.amount, body.payment_method, body.wallet_address, receipt);
  }

  @Post('withdrawal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a withdrawal request' })
  async withdraw(@CurrentUser() user: any, @Body() dto: WithdrawalDto) {
    return this.service.withdraw(user.sub, dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an internal P2P transfer' })
  async transfer(@CurrentUser() user: any, @Body() dto: TransferDto) {
    return this.service.transfer(user.sub, dto);
  }

  // ── Admin ─────────────────────────────────────────────────────────

  @Get('admin_dashboard')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiTags('Admin')
  @ApiOperation({ summary: '[Admin] Get admin dashboard stats' })
  async adminDashboard() {
    return this.service.getAdminDashboard();
  }

  @Get('transaction_list')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin', 'support_agent', 'compliance_officer', 'auditor')
  @ApiTags('Admin')
  @ApiOperation({ summary: '[Admin] List all transactions' })
  async transactionList() {
    return this.service.getTransactionList();
  }

  @Post('update_transaction')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin', 'finance_manager')
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiOperation({ summary: '[Admin] Approve or decline a transaction' })
  async updateTransaction(@Body() dto: UpdateTransactionDto) {
    return this.service.updateTransaction(dto);
  }

  @Patch('admin_setting')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiOperation({ summary: '[Admin] Update system settings' })
  async updateSettings(@Body() dto: AdminSettingsDto) {
    return this.service.updateAdminSettings(dto);
  }

  @Get('admin_setting')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiTags('Admin')
  @ApiOperation({ summary: '[Admin] Get current system settings' })
  async getSettings() {
    return this.service.getAdminSettings();
  }

  @Post('client_update')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin', 'finance_manager')
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin')
  @ApiOperation({ summary: '[Admin] Update user financial balances' })
  async updateClient(@Body() dto: ClientUpdateDto) {
    return this.service.updateClient(dto);
  }
}

@ApiTags('Investments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly service: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investment/recovery plan enrollment' })
  async create(@CurrentUser() user: any, @Body() dto: CreateInvestmentDto) {
    return this.service.createInvestment(user.sub, dto);
  }
}

@ApiTags('Wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly service: TransactionsService) {}

  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connect an external crypto wallet' })
  async connect(@CurrentUser() user: any, @Body() dto: ConnectWalletDto) {
    return this.service.connectWallet(user.sub, dto);
  }
}
