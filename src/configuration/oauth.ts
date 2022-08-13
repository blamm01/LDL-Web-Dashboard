import DiscordOAuth from '../classes/oauth';
import config from '../../config';

export default () => {
  const OAuth = new DiscordOAuth({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: config.CALLBACK_URL,
    scopes: config.SCOPES,
  });

  return OAuth;
};
