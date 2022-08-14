import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { InformationController } from './information.controller';

@Module({
  imports: [],
  controllers: [InformationController],
  providers: [],
})
export class InformationModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware)
        .forRoutes(InformationController)
    }
}