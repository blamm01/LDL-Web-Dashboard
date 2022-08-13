import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [],
  controllers: [ApiController, AuthController],
  providers: [],
})
export class ApiModule {}