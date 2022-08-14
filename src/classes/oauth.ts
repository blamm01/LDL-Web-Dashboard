import fetch from 'node-fetch';

interface CreateOAuthOptions {
  clientId: string;
  clientSecret: string;
  scopes: Array<string>;
  callbackURL: string;
}

interface RequestTokenOptions {
  client_id: string;
  client_secret: string;
  code?: string;
  refresh_token?: string;
  grant_type: string;
  redirect_uri: string;
  scopes: Array<string>;
}

class DiscordOAuthClass {
  clientId: string;
  clientSecret: string;
  scopes: Array<string>;
  callbackURL: string;

  constructor(options: CreateOAuthOptions) {
    for (const key in options) {
      this[key] = options[key];
    }
  }

  encode(obj: object) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    return str.join('&');
    // return new URLSearchParams(Object.entries(obj)).toString();
  }

  async fetch(
    method: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE',
    params: string,
    headers: any,
    options: object,
  ) {
    const url = `https://discord.com/api${params}`;

    const body =
      !options || typeof options !== 'object'
        ? null
        : this.encode(options)

    const request = await fetch(url, {
      method: method,
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    const data = await request.json();
    if (data.error) throw new Error(`${data.error}`);

    return data;
  }

  async requestToken(
    grantType: 'authorization_code' | 'refresh_token',
    options: {
      refreshToken?: string;
      code?: string;
    },
  ) {
    const opts: RequestTokenOptions = {
      grant_type: grantType,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scopes: this.scopes,
      redirect_uri: this.callbackURL,
    };

    if (grantType == 'refresh_token') opts.refresh_token = options.refreshToken;
    else if (grantType == 'authorization_code') opts.code = options.code;

    return await this.fetch('POST', '/oauth2/token', null, opts);
  }

  generateOAuthURL(opt) {
    const obj = {
      scope: (Array.isArray(opt.scope) ? opt.scope : this.scopes).join(' '),
      client_id: this.clientId,
      redirect_uri: opt.url || this.callbackURL,
      response_type: "code",
      permissions: opt.permissions,
      guild_id: opt.guild_id,
    }

    return `https://discord.com/oauth2/authorize?${this.encode(obj)}`
  }

  async FetchMe(opt: { type: 'Bearer' | 'Bot'; access_token: string }) {
    return await this.fetch(
      'GET',
      '/users/@me',
      {
        authorization: `${opt.type} ${opt.access_token}`,
      },
      null,
    );
  }

  async FetchGuilds(opt: { type: 'Bearer' | 'Bot'; access_token: string }) {
    return await this.fetch(
      'GET',
      '/users/@me/guilds',
      {
        authorization: `${opt.type} ${opt.access_token}`,
      },
      null,
    );
  }
}

export default DiscordOAuthClass;
