"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ResponseTransformInterceptor = class ResponseTransformInterceptor {
    intercept(context, next) {
        const handler = context.getHandler();
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
            const message = this.getSuccessMessage(method, request.route?.path || '');
            const customMessage = data?.message;
            const responseData = data?.message ? { ...data, message: undefined } : data;
            if (data?.message)
                delete responseData.message;
            return {
                success: true,
                message: customMessage || message,
                data: customMessage ? responseData : data,
            };
        }));
    }
    getSuccessMessage(method, path) {
        const resource = path.split('/').pop()?.replace(/_/g, ' ') || 'resource';
        switch (method) {
            case 'POST':
                return `${resource} created successfully.`;
            case 'PATCH':
            case 'PUT':
                return `${resource} updated successfully.`;
            case 'DELETE':
                return `${resource} deleted successfully.`;
            default:
                return 'Request completed successfully.';
        }
    }
};
exports.ResponseTransformInterceptor = ResponseTransformInterceptor;
exports.ResponseTransformInterceptor = ResponseTransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseTransformInterceptor);
//# sourceMappingURL=response-transform.interceptor.js.map