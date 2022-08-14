import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthController } from './auth/auth.controller';
import { SettingsController } from './settings/settings.controller';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [ApiController, AuthController],
  providers: [],
})
export class ApiModule {}