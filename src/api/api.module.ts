import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthController } from './auth/auth.controller';
import { SettingsController } from './settings/settings.controller';
import { SettingsModule } from './settings/settings.module';
import { InformationController } from './information/information.controller';
import { InformationModule } from './information/information.module';

@Module({
  imports: [SettingsModule, InformationModule],
  controllers: [ApiController, AuthController, InformationController],
  providers: [],
})
export class ApiModule {}