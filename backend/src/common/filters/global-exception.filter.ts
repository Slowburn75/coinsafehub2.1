import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorMappingService } from '../services/error-mapping.service';

interface ValidationErrorDetail {
  property: string;
  constraints?: Record<string, string>;
  children?: ValidationErrorDetail[];
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  statusCode: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private errorMapper = new ErrorMappingService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorResponse = {
      success: false,
      message: 'Something went wrong. Please try again later.',
      statusCode: status,
    };

    // ── NestJS HttpException ────────────────────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Validation errors (class-validator) — parse per-field
      if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
        const rawMessage = (exceptionResponse as any).message;

        if (Array.isArray(rawMessage)) {
          // It's a validation error array from class-validator
          const errors: Record<string, string> = {};
          for (const msg of rawMessage) {
            if (typeof msg === 'string') {
              // Parse "property - constraint" format or "property constraint"
              const result = this.parseClassValidatorMessage(msg);
              if (result) {
                errors[result.field] = result.message;
              }
            } else if (typeof msg === 'object' && msg.property) {
              const detail = msg as ValidationErrorDetail;
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
          } else {
            body = {
              success: false,
              message: 'Please correct the highlighted fields.',
              statusCode: status,
            };
          }
        } else if (typeof rawMessage === 'string') {
          const mapped = this.errorMapper.mapErrorMessage(rawMessage);
          body = {
            success: false,
            message: mapped.message,
            errors: mapped.field ? { [mapped.field]: mapped.message } : undefined,
            statusCode: mapped.status,
          };
        } else {
          body = {
            success: false,
            message: 'Something went wrong. Please try again.',
            statusCode: status,
          };
        }
      } else if (typeof exceptionResponse === 'string') {
        const mapped = this.errorMapper.mapErrorMessage(exceptionResponse);
        body = {
          success: false,
          message: mapped.message,
          statusCode: mapped.status,
        };
      }
    }

    // ── Prisma Known Request Errors ──────────────────────────────────
    else if (this.isPrismaError(exception)) {
      const prismaErr = exception as any;
      status = HttpStatus.CONFLICT;

      if (prismaErr.code === 'P2002') {
        const target = prismaErr.meta?.target as string[] || [];
        const field = target[0] || 'field';
        const fieldNames: Record<string, string> = {
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
      } else if (prismaErr.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        body = {
          success: false,
          message: 'The requested record could not be found.',
          statusCode: status,
        };
      } else {
        body = {
          success: false,
          message: 'Something went wrong. Please try again later.',
          statusCode: status,
        };
      }
    }

    // ── Unknown errors — log and return generic ──────────────────────
    else {
      console.error('[Unhandled Error]', exception);
      body = {
        success: false,
        message: 'Something went wrong. Please try again later.',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    response.status(status).json(body);
  }

  /**
   * Parses a class-validator error string like:
   * "fullName must be longer than or equal to 2 characters"
   * "email must be an email"
   * "property full_name should not exist"
   */
  private parseClassValidatorMessage(msg: string): { field: string; message: string } | null {
    const words = msg.split(' ');

    if (words.length < 2) return null;

    // "property X should not exist"
    if (msg.startsWith('property ') && msg.includes('should not exist')) {
      const field = words[1];
      const friendlyName = (this.errorMapper as any).fieldNames?.[field] || field;
      return {
        field,
        message: `${friendlyName} is not a recognized field. Please try again.`,
      };
    }

    // First word is the property name
    const property = words[0];
    const rest = words.slice(1).join(' ');

    // Skip if first word doesn't look like a property (contains uppercase or is too short)
    if (property.length < 2) return null;

    const mapped = this.errorMapper.mapValidationError(rest, property);
    return mapped;
  }

  private isPrismaError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      typeof (err as any).code === 'string' &&
      (err as any).code.startsWith('P')
    );
  }
}
