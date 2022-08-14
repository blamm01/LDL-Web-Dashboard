import {
  Controller,
  Req,
  Res,
  Get,
  UseFilters,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { NotFoundFilter } from '../filters/NotFound/notfound.filter';
import { Request, Response } from 'express';
import { bot } from '../../main';
import { GuildMember, PermissionFlagsBits } from 'discord.js';
import config from '../../../config';

@Controller('dashboard')
export class DashboardController {
  @Get()
  getDashboardPage(@Req() req: Request, @Res() res: Response) {
    res.render('dashboard', {
      data: res.locals.user,
    });
  }

  @Get(':id')
  async getServerPage(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    if (!id || typeof id !== 'string')
      throw new BadRequestException('Validation Failed');
    let guild;
    try {
      guild = await bot.guilds.fetch(id);
    } catch (e) {
      return res.redirect('/');
    }
    let member: GuildMember | undefined;
    try {
      member = await guild.members.fetch(res.locals.user.user.id || null);
    } catch (e) {
      return res.redirect('/');
    }
    if(!member.permissions.has(PermissionFlagsBits.Administrator)) return res.redirect('/')
    res.render('server', {
      member: guild,
      guild: guild,
      config: config,
      req: req,
      res: res,
      data: res.locals.user,
    })
  }
}
