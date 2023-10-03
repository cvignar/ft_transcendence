import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController, AuthGateway } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { Oauth42Strategy } from './oauth42.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '300m' },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway, Oauth42Strategy],
  exports: [AuthService],
})
export class AuthModule {}
