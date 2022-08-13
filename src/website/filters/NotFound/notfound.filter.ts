import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebsiteProvider } from "../../providers/website"

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  async catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    const user = (await (new WebsiteProvider()).getUser(request.cookies.token)) || undefined;

    response.status(exception.getStatus()).render('404', {
      data: user || undefined
    });
  }
}