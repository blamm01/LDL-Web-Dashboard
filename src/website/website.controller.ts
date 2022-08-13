import { Controller, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebsiteProvider } from "./providers/website"

@Controller()
export class WebsiteController {
  constructor(private websiteProvider: WebsiteProvider) {}

  @Get()
  async getRootPage(@Req() req: Request, @Res() res: Response) {
    const user = (await this.websiteProvider.getUser(req.cookies.token)) || undefined;

    res.render('root', {
      data: user || undefined
    });
  }

  @Get('commands')
  async getCommandsPage(@Req() req: Request, @Res() res: Response) {
    const user = (await this.websiteProvider.getUser(req.cookies.token)) || undefined;

    res.render('commands', {
      data: user || undefined
    });
  }

  @Get('faqs')
  async getFaqsPage(@Req() req: Request, @Res() res: Response) {
    const user = (await this.websiteProvider.getUser(req.cookies.token)) || undefined;

    res.render('faqs', {
      data: user || undefined
    });
  }

  @Get('pp')
  async getPPPage(@Req() req: Request, @Res() res: Response) {
    const user = (await this.websiteProvider.getUser(req.cookies.token)) || undefined;

    res.render('pp', {
      data: user || undefined
    });
  }

  @Get('tos')
  async getTosPage(@Req() req: Request, @Res() res: Response) {
    const user = (await this.websiteProvider.getUser(req.cookies.token)) || undefined;

    res.render('tos', {
      data: user || undefined
    });
  }
}
