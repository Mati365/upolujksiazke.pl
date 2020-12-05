import {Response, Request} from 'express';
import {
  ArgumentsHost, Catch,
  ExceptionFilter, HttpException, HttpStatus,
} from '@nestjs/common';

@Catch()
export class ServeStaticExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = (
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    );

    if (exception.code === 'ENOENT')
      res.sendStatus(HttpStatus.NOT_FOUND);
    else {
      res
        .status(status)
        .json(
          {
            code: status,
            message: exception.message,
            timestamp: new Date().toISOString(),
            path: req.url,
          },
        );
    }
  }
}
