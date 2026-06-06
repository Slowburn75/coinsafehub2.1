import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private errorMapper;
    catch(exception: unknown, host: ArgumentsHost): void;
    private parseClassValidatorMessage;
    private isPrismaError;
}
