"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_mapping_service_1 = require("../services/error-mapping.service");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor() {
        this.errorMapper = new error_mapping_service_1.ErrorMappingService();
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let body = {
            success: false,
            message: 'Something went wrong. Please try again later.',
            statusCode: status,
        };
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
                const rawMessage = exceptionResponse.message;
                if (Array.isArray(rawMessage)) {
                    const errors = {};
                    for (const msg of rawMessage) {
                        if (typeof msg === 'string') {
                            const result = this.parseClassValidatorMessage(msg);
                            if (result) {
                                errors[result.field] = result.message;
                            }
                        }
                        else if (typeof msg === 'object' && msg.property) {
                            const detail = msg;
                            const constraint = detail.constraints
                                ? Object.values(detail.constraints)[0]
                                : 'is invalid';
                            const mapped = this.errorMapper.mapValidationError(constraint, detail.property);
                            errors[mapped.field] = mapped.message;
                        }
                    }
                    if (Object.keys(errors).length > 0) {
                        body = {
                            success: false,
                            message: 'Please correct the highlighted fields.',
                            errors,
                            statusCode: status,
                        };
                    }
                    else {
                        body = {
                            success: false,
                            message: 'Please correct the highlighted fields.',
                            statusCode: status,
                        };
                    }
                }
                else if (typeof rawMessage === 'string') {
                    const mapped = this.errorMapper.mapErrorMessage(rawMessage);
                    body = {
                        success: false,
                        message: mapped.message,
                        errors: mapped.field ? { [mapped.field]: mapped.message } : undefined,
                        statusCode: mapped.status,
                    };
                }
                else {
                    body = {
                        success: false,
                        message: 'Something went wrong. Please try again.',
                        statusCode: status,
                    };
                }
            }
            else if (typeof exceptionResponse === 'string') {
                const mapped = this.errorMapper.mapErrorMessage(exceptionResponse);
                body = {
                    success: false,
                    message: mapped.message,
                    statusCode: mapped.status,
                };
            }
        }
        else if (this.isPrismaError(exception)) {
            const prismaErr = exception;
            status = common_1.HttpStatus.CONFLICT;
            if (prismaErr.code === 'P2002') {
                const target = prismaErr.meta?.target || [];
                const field = target[0] || 'field';
                const fieldNames = {
                    email: 'Email address',
                    code: 'Referral code',
                };
                const friendlyField = fieldNames[field] || field;
                body = {
                    success: false,
                    message: `This ${friendlyField.toLowerCase()} is already in use.`,
                    errors: { [field]: `This ${friendlyField.toLowerCase()} is already in use.` },
                    statusCode: status,
                };
            }
            else if (prismaErr.code === 'P2025') {
                status = common_1.HttpStatus.NOT_FOUND;
                body = {
                    success: false,
                    message: 'The requested record could not be found.',
                    statusCode: status,
                };
            }
            else {
                body = {
                    success: false,
                    message: 'Something went wrong. Please try again later.',
                    statusCode: status,
                };
            }
        }
        else {
            console.error('[Unhandled Error]', exception);
            body = {
                success: false,
                message: 'Something went wrong. Please try again later.',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
        response.status(status).json(body);
    }
    parseClassValidatorMessage(msg) {
        const words = msg.split(' ');
        if (words.length < 2)
            return null;
        if (msg.startsWith('property ') && msg.includes('should not exist')) {
            const field = words[1];
            const friendlyName = this.errorMapper.fieldNames?.[field] || field;
            return {
                field,
                message: `${friendlyName} is not a recognized field. Please try again.`,
            };
        }
        const property = words[0];
        const rest = words.slice(1).join(' ');
        if (property.length < 2)
            return null;
        const mapped = this.errorMapper.mapValidationError(rest, property);
        return mapped;
    }
    isPrismaError(err) {
        return (typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            typeof err.code === 'string' &&
            err.code.startsWith('P'));
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map