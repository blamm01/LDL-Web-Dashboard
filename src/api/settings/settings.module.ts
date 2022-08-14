import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SettingsController } from './settings.controller';

@Module({
  imports: [],
  controllers: [SettingsController],
  providers: [],
})
export class SettingsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware)
        .forRoutes(SettingsController)
    }
}