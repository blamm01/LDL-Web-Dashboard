import {
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
    const token = req.headers.authorization || req.cookies['token'];

    if (!token) return res.redirect('/');
    if (!isJWT(token)) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    let decoded;
    try {
      decoded = verify(token, config.JWT_TOKEN);
    } catch (err) {}

    if (!decoded) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    if (!decoded.userId || !decoded.uuid) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    const data = await userSchema.findOne({ _id: decoded.uuid });
    if (!data) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    if((data.expires_in + data.lastUpdated) <= Date.now()) {
      await data.delete();
      return res.redirect('/')
    }

    data.guilds = data.guilds.filter(g => {
      const guild = bot.guilds.cache.get(g.id);
      if(!guild) return false;
      return true;
    })

    res.locals.user = data;

    next();
  }
}
