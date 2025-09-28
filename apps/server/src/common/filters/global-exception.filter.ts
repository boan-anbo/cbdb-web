import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that catches all exceptions and returns
 * proper error details to the client
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An error occurred';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      // Handle HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
        details = (exceptionResponse as any).error || (exceptionResponse as any).details;
      }
    } else if (exception instanceof Error) {
      // Handle regular errors
      message = exception.message;
      details = {
        name: exception.name,
        stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    } else {
      // Handle unknown errors
      message = 'Unknown error occurred';
      details = exception;
    }

    // Log the error
    this.logger.error(
      `Error ${status} on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send response with full error details
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      details,
    });
  }
}