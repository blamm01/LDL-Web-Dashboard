import {
  Controller,
  Get,
  Param,
  Res,
  Post,
  ForbiddenException,
  Req,
  Body,
} from '@nestjs/common';
import {
    ChannelType,
  Guild,
  GuildChannel,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';
import { Request, Response } from 'express';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { bot } from '../../main';
import {
  PostLogChannelParams,
  PostLogChannelBody,
} from './dtos/PostLogChannel.dto';
import caidatSchema from '../../schemas/guild-caidats';
import { GetLogChannel } from './dtos/GetLogChannel.dto';

@Controller('api/settings')
export class SettingsController {
  @Get()
  root() {
    return 'Hello World';
  }

  @Post('/:id/log')
  async postLogChannel(
    @Param(new ValidationPipe()) param: PostLogChannelParams,
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ValidationPipe()) body: PostLogChannelBody,
  ) {
    const id = param.id;
    let log = body.log;

    let guild: Guild | undefined;

    try {
      guild = await bot.guilds.fetch({
        guild: id,
        cache: true,
      });
    } catch (err) {
      throw new ForbiddenException('Guild not found');
    }

    let member: GuildMember | undefined;

    try {
      member = await guild.members.fetch({
        user: res.locals.user.userId,
        cache: true,
      });
    } catch (err) {
      throw new ForbiddenException('Member not found');
    }

    if (!member.permissions.has(PermissionFlagsBits.Administrator))
      throw new ForbiddenException(
        'Requested user is not allowed to do this action',
      );

    if (!log || typeof log !== 'string') log = null;
    if (log) {
      try {
        let channel = await guild.channels.fetch(log, {
          cache: true,
        });
        if(channel.type !== ChannelType.GuildText) throw new Error("Channel is not a text channel")
      } catch (err) {
        log = null
      }
    }

    let caidatData = await caidatSchema.findOne({ _id: guild.id });
    if (!caidatData) {
      caidatData = await caidatSchema.create({
        _id: guild.id,
        logchannelid: log,
      });
    } else {
      caidatData.logchannelid = log;
    }
    try {
        await caidatData.save()
    } catch(err) {
        console.log(err)
    }

    res.send()
  }

  @Get('/:id/log')
  async getLogChannel(
    @Param(new ValidationPipe()) param: GetLogChannel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const id = param.id;

    let guild: Guild | undefined;

    try {
      guild = await bot.guilds.fetch({
        guild: id,
        cache: true,
      });
    } catch (err) {
      throw new ForbiddenException('Guild not found');
    }

    let member: GuildMember | undefined;

    try {
      member = await guild.members.fetch({
        user: res.locals.user.userId,
        cache: true,
      });
    } catch (err) {
      throw new ForbiddenException('Member not found');
    }

    if (!member.permissions.has(PermissionFlagsBits.Administrator))
      throw new ForbiddenException(
        'Requested user is not allowed to do this action',
      );

    let caidatData = await caidatSchema.findOne({ _id: guild.id });
    res.send({
        data: caidatData?.logchannelid ? caidatData.logchannelid : null
    })
  }
}
