import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;

    response.status(status).json({
      success: false,
      statusCode: status,
      message:
        typeof payload === 'object' && payload && 'message' in payload
          ? (payload as { message: string | string[] }).message
          : exception instanceof Error
            ? exception.message
            : 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
