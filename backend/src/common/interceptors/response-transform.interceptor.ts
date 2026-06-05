import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data as unknown as SuccessResponse<T>;
        }

        // Determine message from method and path
        const message = this.getSuccessMessage(method, request.route?.path || '');

        // If data has its own message, use it
        const customMessage = data?.message;
        const responseData = data?.message ? { ...data, message: undefined } : data;
        if (data?.message) delete (responseData as any).message;

        return {
          success: true,
          message: customMessage || message,
          data: customMessage ? responseData : data,
        };
      }),
    );
  }

  private getSuccessMessage(method: string, path: string): string {
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
}
