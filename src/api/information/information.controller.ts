import { Controller, ForbiddenException, Get, Param, Res, ValidationPipe } from '@nestjs/common';
import { ChannelType, Guild, GuildMember, PermissionFlagsBits } from 'discord.js';
import { Response } from 'express';
import { bot } from '../../main';
import { GetGuildDTO } from './dto/GetGuild.dto';

@Controller('api/information')
export class InformationController {
    @Get()
    root(@Res() res: Response) {
        res.send({
            data: res.locals.user,
        })
    }

    @Get('guilds/:id')
    async getGuild(@Res() res: Response, @Param(new ValidationPipe()) param: GetGuildDTO) {
        let guild: Guild | undefined;
        try {
            guild = await bot.guilds.fetch({
                cache: true,
                guild: param.id
            })
        } catch(err) {
            throw new ForbiddenException("Guild not found")
        }

        let member: GuildMember | null;
        try {
            member = await guild.members.fetch({
                cache: true,
                user: res.locals.user.user.id
            })
        } catch(err) {
            member = null
        }

        if(!member) throw new ForbiddenException("Member not found");
        if(!member.permissions.has(PermissionFlagsBits.Administrator)) throw new ForbiddenException("Requested user isn't an administrator")
        let newGuild = JSON.parse(JSON.stringify(guild));
        newGuild.members = newGuild.members.map((m) => guild.members.cache.get(m))
        newGuild.channels = newGuild.channels.map((c) => guild.channels.cache.get(c))
        newGuild.texts = newGuild.channels.filter((c) => (guild.channels.cache.get(c.id))?.type == ChannelType.GuildText)
        newGuild.voices = newGuild.channels.filter((c) => (guild.channels.cache.get(c.id))?.type == ChannelType.GuildVoice)
        newGuild.roles = newGuild.roles.map((r) => guild.roles.cache.get(r))
        return res.send({
            data: newGuild
        })
    }
}