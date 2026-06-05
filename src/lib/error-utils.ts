export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  statusCode: number;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  statusCode: number;
}

/**
 * Extracts a user-friendly error message and field-level errors from any API error.
 */
export function parseApiError(err: any): ParsedApiError {
  // New unified format: { success: false, message, errors }
  if (err?.body?.success === false) {
    return {
      message: err.body.message || 'Something went wrong. Please try again.',
      fieldErrors: err.body.errors || {},
      statusCode: err.body.statusCode || 400,
    };
  }

  // Legacy format: { detail: "..." }
  if (err?.body?.detail) {
    return {
      message: String(err.body.detail),
      fieldErrors: {},
      statusCode: err.status || 400,
    };
  }

  // Legacy format: { message: "..." }
  if (err?.body?.message) {
    const msg = Array.isArray(err.body.message)
      ? err.body.message.join('. ')
      : String(err.body.message);
    return {
      message: msg,
      fieldErrors: {},
      statusCode: err.status || 400,
    };
  }

  // Error with just a message string
  if (err?.message) {
    return {
      message: String(err.message),
      fieldErrors: {},
      statusCode: err.status || 500,
    };
  }

  return {
    message: 'Something went wrong. Please try again.',
    fieldErrors: {},
    statusCode: 500,
  };
}

/**
 * Formats field errors for display, combining them into a readable message.
 */
export function formatFieldErrors(fieldErrors: Record<string, string>): string {
  return Object.values(fieldErrors).join('\n');
}
