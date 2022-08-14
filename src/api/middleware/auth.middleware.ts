import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  Next,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import userSchema from '../../schemas/user';
import { verify, sign } from 'jsonwebtoken';
import { isJWT } from 'class-validator';
import config from '../../../config';
import { bot } from '../../main';
import { PermissionFlagsBits } from 'discord.js';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: () => void,
  ) {
    const token = req.headers.authorization;

    if (!token) throw new ForbiddenException("Authorization token is missing")
    if (!isJWT(token)) throw new ForbiddenException("Authorization token is not JWT token")

    let decoded;
    try {
      decoded = verify(token, config.JWT_TOKEN);
    } catch (err) {}

    if (!decoded) throw new ForbiddenException("Invalid authorization token")
    if (!decoded.userId || !decoded.uuid) throw new ForbiddenException("Invalid authorization token")

    const data = await userSchema.findOne({ _id: decoded.uuid });
    if (!data) throw new ForbiddenException("Data linked to authorization token can't be found")

    data.guilds = data.guilds.filter(g => {
      const guild = bot.guilds.cache.get(g.id);
      if(!guild) return false;
      const member = guild.members.cache.get(data.userId);
      if(!member || !member.permissions.has(PermissionFlagsBits.Administrator)) return false;
      return true;
    })

    res.locals.user = data;

    next();
  }
}
