import { Module } from '@nestjs/common';
import { OAuthController } from './oAuth.controller';
import { OAuthService } from './oAuth.service';

@Module({
  controllers: [OAuthController],
  providers: [OAuthService]
})
export class OAuthModule {}
