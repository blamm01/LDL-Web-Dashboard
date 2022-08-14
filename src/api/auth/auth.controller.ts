import {
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { query, Request, Response } from 'express';
import Headers from '../../decorators/headers.decorator';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { GetUserHeadersDTO } from './dtos/GetUserHeaders.dto';
import { bot, OAuthClient } from '../../main';
import config from '../../../config';
import * as Discord from 'discord.js';
import userSchema from '../../schemas/user';
import { PermissionFlagsBits } from 'discord.js';
import { sign, verify } from 'jsonwebtoken';
import { IsString } from 'class-validator';
import { getUserCallbackDTO } from './dtos/GetUserCallback.dto';
import { async } from 'rxjs';

@Controller('api/auth')
export class AuthController {
  @Get('/')
  getUser(@Headers(new ValidationPipe()) headers: GetUserHeadersDTO, @Res() res: Response) {
    const payload = {
      session: headers.authorization,
    };

    res.status(204).send()
  }

  @Get('/callback')
  async getUserCallback(
    @Query(new ValidationPipe()) query: getUserCallbackDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const code = query.code;
    let OAuthData;
    try {
      OAuthData = await OAuthClient.requestToken('authorization_code', {
        code,
      });
    } catch (err) {
      throw new HttpException(
        {
          message: 'Unable to request data',
          error: `${err}`,
          statusCode: 401,
        },
        401,
      );
    }

    const user = await OAuthClient.FetchMe({
      type: 'Bearer',
      access_token: OAuthData.access_token,
    });

    if (!user) throw new UnauthorizedException('Unable to fetch user');

    let guilds = await OAuthClient.FetchGuilds({
      type: 'Bearer',
      access_token: OAuthData.access_token,
    });

    guilds = guilds.filter((g) => new Discord.BitField(g.permissions).has('8'));
    let availableGuilds = []
    await guilds.forEach(async(g: any) => await (new Promise(async(ful) => {
      const guild = bot.guilds.cache.get(g.id);
      if(!guild) return;
      g.avatar = await guild.iconURL() || null;
      availableGuilds.push(g)
      console.log(g)
      ful(true)
    })))

    let userData = await userSchema.findOne({ userId: user.id });
    if (!userData)
      userData = new userSchema({
        userId: user.id,
        accessToken: OAuthData.access_token,
        refreshToken: OAuthData.refresh_token,
        expires_in: OAuthData.expires_in * 1000,
        user: {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
            : null,
        },
        guilds: availableGuilds
      });

    const id = userData._id.toString();
    const TokenPayload = {
      userId: user.id,
      uuid: id,
    };

    userData.guilds = availableGuilds;
    userData.secretAccessKey = sign(TokenPayload, config.JWT_TOKEN);
    await userData.save();
    res.cookie('token', userData.secretAccessKey);
    res.redirect('/');
  }

  @Get('/login')
  getLogin(@Req() req: Request, @Res() res: Response) {
    res.redirect(OAuthClient.generateOAuthURL({
      scope: config.SCOPES
    }))
  }

  @Get('/logout')
  getLogout(@Res() res: Response) {
    res.clearCookie("token")
    res.redirect('/')
  }

  @Get('/invite')
  async getInvite(@Res() res: Response) {
    res.redirect(OAuthClient.generateOAuthURL({
      scope: [
        ...config.SCOPES,
        "bot"
      ],
      permissions: "536098499710"
    }))
  }
}
