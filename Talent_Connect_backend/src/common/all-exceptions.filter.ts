import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let detail: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const resp = exception.getResponse();
            message = typeof resp === 'string' ? resp : (resp as any).message || message;
        } else if (exception instanceof Error) {
            message = exception.message;
            detail = exception.stack;
        }

        this.logger.error(
            `[${request.method}] ${(request as any).url} → ${status}: ${JSON.stringify(message)}`,
            detail,
        );

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: (request as any).url,
        });
    }
}
