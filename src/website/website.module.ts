import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { AuthMiddleware } from '../website/middleware/auth.middleware';
import { WebsiteController } from './website.controller';
import { WebsiteProvider } from './providers/website';
import { APP_FILTER } from '@nestjs/core';
import { NotFoundFilter } from './filters/NotFound/notfound.filter';

@Module({
  imports: [],
  controllers: [WebsiteController, DashboardController],
  providers: [WebsiteProvider, {
    provide: APP_FILTER,
    useClass: NotFoundFilter
  }],
})
export class WebsiteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(DashboardController);
  }
}
