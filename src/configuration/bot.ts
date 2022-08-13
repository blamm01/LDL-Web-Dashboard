import * as Discord from 'discord.js';
import config from '../../config';

const Client = new Discord.Client({
  intents: [],
});

export default () => {
  Client.login(config.CLIENT_TOKEN).then(() =>
    console.log(`Logged in as ${Client.user.tag}`),
  );

  return Client;
};
