import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { AuthMiddleware } from '../website/middleware/auth.middleware';
import { WebsiteController } from './website.controller';
import { WebsiteProvider } from './providers/website';

@Module({
  imports: [],
  controllers: [WebsiteController, DashboardController],
  providers: [WebsiteProvider],
})
export class WebsiteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(DashboardController);
  }
}
