import { Module } from '@nestjs/common';
import { ApiController } from './api/api.controller';
import { AuthController } from './api/auth/auth.controller';
import { WebsiteModule } from './website/website.module';

@Module({
  imports: [WebsiteModule],
  controllers: [ApiController, AuthController],
  providers: [],
})
export class AppModule {}
