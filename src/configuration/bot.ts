import * as Discord from 'discord.js';
import config from '../../config';

const Client = new Discord.Client({
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMembers,
  ],
});

export default () => {
  Client.login(config.CLIENT_TOKEN).then(() =>
    console.log(`Logged in as ${Client.user.tag}`),
  );

  return Client;
};
