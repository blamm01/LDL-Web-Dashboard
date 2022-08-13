import { Controller, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  @Get()
  root(@Req() req: Request, @Res() res: Response) {
    res.render('dashboard', {
      data: res.locals.user
    });
  }
}
