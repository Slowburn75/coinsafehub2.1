import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
interface WrappedResponse<T> {
    data: T;
    meta?: {
        timestamp: string;
        path: string;
    };
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<WrappedResponse<T>>;
}
export {};
