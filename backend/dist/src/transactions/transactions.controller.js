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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = exports.InvestmentsController = exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const transactions_dto_1 = require("./dto/transactions.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
let TransactionsController = class TransactionsController {
    constructor(service) {
        this.service = service;
    }
    async accountSummary(user) {
        return this.service.getAccountSummary(user.sub);
    }
    async list(user) {
        return this.service.getTransactions(user.sub);
    }
    async userDeposits(user) {
        return this.service.getUserDeposits(user.sub);
    }
    async depositAddresses() {
        return this.service.getDepositAddresses();
    }
    async withdrawalMethods() {
        return this.service.getWithdrawalMethods();
    }
    async deposit(user, body, receipt) {
        return this.service.deposit(user.sub, body.amount, body.payment_method, body.wallet_address, receipt);
    }
    async withdraw(user, dto) {
        return this.service.withdraw(user.sub, dto);
    }
    async transfer(user, dto) {
        return this.service.transfer(user.sub, dto);
    }
    async adminDashboard() {
        return this.service.getAdminDashboard();
    }
    async transactionList() {
        return this.service.getTransactionList();
    }
    async updateTransaction(dto) {
        return this.service.updateTransaction(dto);
    }
    async updateSettings(dto) {
        return this.service.updateAdminSettings(dto);
    }
    async getSettings() {
        return this.service.getAdminSettings();
    }
    async updateClient(dto) {
        return this.service.updateClient(dto);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)('account_summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account financial summary' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "accountSummary", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user transaction history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('user_deposit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user deposit history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "userDeposits", null);
__decorate([
    (0, common_1.Get)('deposit_addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform wallet addresses for deposit' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "depositAddresses", null);
__decorate([
    (0, common_1.Get)('withdrawal_method'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available withdrawal methods' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "withdrawalMethods", null);
__decorate([
    (0, common_1.Post)('deposit'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a deposit request' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)('withdrawal'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a withdrawal request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transactions_dto_1.WithdrawalDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an internal P2P transfer' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transactions_dto_1.TransferDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('admin_dashboard'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get admin dashboard stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "adminDashboard", null);
__decorate([
    (0, common_1.Get)('transaction_list'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'support_agent', 'compliance_officer', 'auditor'),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] List all transactions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "transactionList", null);
__decorate([
    (0, common_1.Post)('update_transaction'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'finance_manager'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Approve or decline a transaction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transactions_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Patch)('admin_setting'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update system settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transactions_dto_1.AdminSettingsDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('admin_setting'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get current system settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('client_update'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'finance_manager'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update user financial balances' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transactions_dto_1.ClientUpdateDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "updateClient", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('trans'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
let InvestmentsController = class InvestmentsController {
    constructor(service) {
        this.service = service;
    }
    async create(user, dto) {
        return this.service.createInvestment(user.sub, dto);
    }
};
exports.InvestmentsController = InvestmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new investment/recovery plan enrollment' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transactions_dto_1.CreateInvestmentDto]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "create", null);
exports.InvestmentsController = InvestmentsController = __decorate([
    (0, swagger_1.ApiTags)('Investments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], InvestmentsController);
let WalletController = class WalletController {
    constructor(service) {
        this.service = service;
    }
    async connect(user, dto) {
        return this.service.connectWallet(user.sub, dto);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Connect an external crypto wallet' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transactions_dto_1.ConnectWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "connect", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], WalletController);
//# sourceMappingURL=transactions.controller.js.map