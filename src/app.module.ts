import { Module } from '@nestjs/common';
import { ApiController } from './api/api.controller';
import { ApiModule } from './api/api.module';
import { AuthController } from './api/auth/auth.controller';
import { WebsiteModule } from './website/website.module';

@Module({
  imports: [WebsiteModule, ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
