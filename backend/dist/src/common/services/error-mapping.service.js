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
exports.ErrorMappingService = void 0;
const common_1 = require("@nestjs/common");
let ErrorMappingService = class ErrorMappingService {
    constructor() {
        this.mappings = new Map();
        this.initializeMappings();
    }
    initializeMappings() {
        const fieldErrors = {
            fullName: 'Full name',
            email: 'Email address',
            password: 'Password',
            password2: 'Password confirmation',
            confirmPassword: 'Password confirmation',
            oldPassword: 'Current password',
            newPassword: 'New password',
            phone: 'Phone number',
            dob: 'Date of birth',
            country: 'Country',
            address: 'Address',
            preferred_withdrawal_method: 'Withdrawal method',
            crypto_wallet_address: 'Crypto wallet address',
            otp: 'Verification code',
            pin: 'Security PIN',
            user_id: 'User ID',
            client_id: 'Client ID',
            action: 'Action',
            amount: 'Amount',
            payment_method: 'Payment method',
            withdrawal_method: 'Withdrawal method',
            recipient_email: 'Recipient email',
            wallet_address: 'Wallet address',
            bank_name: 'Bank name',
            account_number: 'Account number',
            routing_number: 'Routing number',
            account_name: 'Account holder name',
            note: 'Note',
            plan: 'Recovery plan',
            paymentMethod: 'Payment method',
            walletType: 'Wallet type',
            phraseKey: 'Phrase key',
            transaction_limit: 'Transaction limit',
            recovered_balance: 'Recovered balance',
            total_deposit: 'Total deposit',
            bonus: 'Bonus',
            referal_bonus: 'Referral bonus',
            profit_bonus: 'Profit bonus',
            investment_balance: 'Investment balance',
            transaction_type: 'Transaction type',
            status: 'Status',
        };
        const messageMappings = {
            'must be longer than or equal to': 'must be at least',
            'must be shorter than or equal to': 'must be at most',
            'must be a string': 'is required',
            'must be a number': 'must be a number',
            'must be a valid email': 'must be a valid email address',
            'must be a boolean': 'must be true or false',
            'must be a date string': 'must be a valid date',
            'must be one of the following values': 'has an invalid value',
            'should not exist': 'is not a recognized field',
        };
        const globalErrors = [
            ['Invalid email or password', { status: 401, userMessage: 'Incorrect email or password.' }],
            ['Email already registered', { status: 409, userMessage: 'An account with this email already exists.' }],
            ['Passwords do not match', { status: 400, userMessage: 'The passwords you entered do not match.' }],
            ['Account is suspended', { status: 403, userMessage: 'Your account has been suspended. Please contact support.' }],
            ['Invalid or expired verification code', { status: 400, userMessage: 'This verification code is invalid or has expired.' }],
            ['Email already verified', { status: 400, userMessage: 'This email has already been verified.' }],
            ['Invalid or expired reset link', { status: 400, userMessage: 'This password reset link is invalid or has expired.' }],
            ['Current password is incorrect', { status: 400, userMessage: 'Your current password is incorrect.' }],
            ['Cannot delete your own account', { status: 400, userMessage: 'You cannot delete your own account.' }],
            ['Cannot delete superuser accounts', { status: 403, userMessage: 'Superuser accounts cannot be deleted.' }],
            ['Cannot freeze your own account', { status: 400, userMessage: 'You cannot change the status of your own account.' }],
            ['Cannot freeze superuser accounts', { status: 403, userMessage: 'Superuser accounts cannot be modified this way.' }],
            ['User not found', { status: 404, userMessage: 'This user could not be found.' }],
            ['Token has been revoked', { status: 401, userMessage: 'Your session has expired. Please log in again.' }],
            ['Invalid refresh token', { status: 401, userMessage: 'Your session has expired. Please log in again.' }],
            ['User not found or inactive', { status: 401, userMessage: 'Your account is not active. Please contact support.' }],
        ];
        for (const [key, mapping] of globalErrors) {
            this.mappings.set(key.toLowerCase(), mapping);
        }
        this.fieldNames = fieldErrors;
        this.messageMappings = messageMappings;
    }
    mapValidationError(constraint, property) {
        const fieldName = this.fieldNames[property] || property;
        const messageMappings = this.messageMappings;
        let userMessage = constraint;
        for (const [raw, friendly] of Object.entries(messageMappings)) {
            if (constraint.toLowerCase().includes(raw.toLowerCase())) {
                const match = constraint.match(/(\d+)\s*(characters|digits|items)/);
                if (match && raw.includes('longer than')) {
                    userMessage = `${fieldName} must be at least ${match[1]} characters long.`;
                }
                else if (match && raw.includes('shorter than')) {
                    userMessage = `${fieldName} must be at most ${match[1]} characters long.`;
                }
                else {
                    userMessage = `${fieldName} ${friendly}.`;
                }
                break;
            }
        }
        if (userMessage === constraint) {
            userMessage = `${fieldName} is invalid.`;
        }
        return { field: property, message: userMessage };
    }
    mapErrorMessage(rawMessage) {
        const lower = rawMessage.toLowerCase().trim();
        for (const [key, mapping] of this.mappings.entries()) {
            if (lower.includes(key)) {
                return { status: mapping.status, message: mapping.userMessage, field: mapping.field };
            }
        }
        if (lower.includes('not found')) {
            return { status: 404, message: 'The requested resource could not be found.' };
        }
        if (lower.includes('unauthorized') || lower.includes('unauthenticated')) {
            return { status: 401, message: 'Please log in to continue.' };
        }
        if (lower.includes('forbidden') || lower.includes('permission')) {
            return { status: 403, message: 'You do not have permission to perform this action.' };
        }
        return { status: 400, message: 'Something went wrong. Please try again.' };
    }
};
exports.ErrorMappingService = ErrorMappingService;
exports.ErrorMappingService = ErrorMappingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ErrorMappingService);
//# sourceMappingURL=error-mapping.service.js.map