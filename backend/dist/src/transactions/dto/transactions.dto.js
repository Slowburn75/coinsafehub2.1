"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectWalletDto = exports.CreateInvestmentDto = exports.ClientUpdateDto = exports.AdminSettingsDto = exports.UpdateTransactionDto = exports.TransferDto = exports.WithdrawalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class WithdrawalDto {
}
exports.WithdrawalDto = WithdrawalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WithdrawalDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "withdrawal_method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Chase' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "bank_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123456789' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "account_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '021000021' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "routing_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "account_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "wallet_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mainnet' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawalDto.prototype, "network", void 0);
class TransferDto {
}
exports.TransferDto = TransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'recipient@coinsafe.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "recipient_email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Internal settlement' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "note", void 0);
class UpdateTransactionDto {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "transaction_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Approved' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Approved', 'Declined']),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "status", void 0);
class AdminSettingsDto {
}
exports.AdminSettingsDto = AdminSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminSettingsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminSettingsDto.prototype, "transaction_limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminSettingsDto.prototype, "status", void 0);
class ClientUpdateDto {
}
exports.ClientUpdateDto = ClientUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClientUpdateDto.prototype, "client_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "recovered_balance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "total_deposit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "bonus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "referal_bonus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "profit_bonus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "investment_balance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Case phase 1-4' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientUpdateDto.prototype, "case_phase", void 0);
class CreateInvestmentDto {
}
exports.CreateInvestmentDto = CreateInvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'starter', enum: ['starter', 'gold'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['starter', 'gold']),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'account_balance', enum: ['account_balance', 'credit_card', 'crypto_wallet'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['account_balance', 'credit_card', 'crypto_wallet']),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "paymentMethod", void 0);
class ConnectWalletDto {
}
exports.ConnectWalletDto = ConnectWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bitcoin', enum: ['bitcoin', 'ethereum', 'tether', 'binance'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['bitcoin', 'ethereum', 'tether', 'binance']),
    __metadata("design:type", String)
], ConnectWalletDto.prototype, "walletType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'word1 word2 ... word12' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectWalletDto.prototype, "phraseKey", void 0);
//# sourceMappingURL=transactions.dto.js.map