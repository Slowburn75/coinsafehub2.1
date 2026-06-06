import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
interface SuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>>;
    private getSuccessMessage;
}
export {};
