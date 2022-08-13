import { Injectable } from '@nestjs/common';
import { isJWT } from 'class-validator';
import userSchema from '../../schemas/user';
import { sign, verify } from "jsonwebtoken";
import { bot } from '../../main';
import config from '../../../config';

@Injectable()
export class WebsiteProvider {
  async getUser(token: string) {
    if (!token || !isJWT(token)) return null;

    let decoded;
    try {
      decoded = verify(token, config.JWT_TOKEN);
    } catch (err) {}

    if (!decoded) return null

    if (!decoded.userId || !decoded.uuid) return null

    const data = await userSchema.findOne({ _id: decoded.uuid });
    if (!data) return null

    data.guilds = data.guilds.filter((g) => {
      const guild = bot.guilds.cache.get(g.id);
      if (!guild) return false;
      return true;
    });

    return data;
  }
}
