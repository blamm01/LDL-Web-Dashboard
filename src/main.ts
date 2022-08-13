import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import LoadOAuthClient from './configuration/oauth';
import LoadMongo from './configuration/mongodb';
import LoadBot from './configuration/bot';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import config from '../config';

LoadMongo();
const bot = LoadBot();

const OAuthClient = LoadOAuthClient();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useStaticAssets(path.join(__dirname, 'public'));
  app.setBaseViewsDir(path.join(__dirname, 'views'));
  app.setViewEngine('ejs');

  await app.listen(config.PORT);
}

bootstrap();

export { OAuthClient, bot };
