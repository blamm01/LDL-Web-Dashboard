import { Controller, Req, Res, Get, UseFilters } from '@nestjs/common';
import { NotFoundFilter } from '../filters/NotFound/notfound.filter';
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
