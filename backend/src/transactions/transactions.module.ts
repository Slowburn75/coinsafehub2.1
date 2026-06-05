import { Module } from '@nestjs/common';
import { TransactionsController, InvestmentsController, WalletController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController, InvestmentsController, WalletController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
