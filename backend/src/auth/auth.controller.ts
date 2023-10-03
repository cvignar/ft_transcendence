import {
	Body,
	Controller,
  Redirect,
	Post,
	HttpCode,
	HttpStatus,
	UseGuards,
	Get,
	Request,
  Req,
  Res,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Oauth42Guard } from './oauth42.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser'

@WebSocketGateway()
export class AuthGateway {

  @WebSocketServer()
  server;
}


@Controller('auth')
export class AuthController {
	constructor(
    private authService: AuthService,
    private userService: UserService,
    private authGateway: AuthGateway,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    ) {}

	//@HttpCode(HttpStatus.OK)
	@Post('login')
	signIn(
		@Body()
		signInDto: {
			email: string;
			username: string;
			password: string;
		},
	) {
		return this.authService.signIn(
			signInDto.email,
			signInDto.username,
			signInDto.password,
		);
	}

  @Get('intra42')
  @UseGuards(Oauth42Guard)
  auth42(): void {
    return ;
  }

  @Get('callback')
  @UseGuards(Oauth42Guard)
  // @Redirect("http://localhost:5173/Auth")
  async callback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    console.log(req.user.user.id42);
    let user: User = await this.userService.getUserById(req.user.user.id);
    if (!user)
    {
      res.redirect("http://localhost:5173/Auth");
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id42, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    this.userService.updateJWTAccess(user.id, token);
    res.cookie("accessToken", token);
    res.redirect("http://localhost:5173/")
  }

  @Get('intra42/return')
  @UseGuards(Oauth42Guard)
  @Redirect('/')
  oauth42Callback(@Req() req: any){
    console.log('RETURN VALUE: ',req.cookie);
    // req.cookieParser()
    return ; // await this.authService.validateIntraUser();
  }

	@UseGuards(AuthGuard)
	@Get('profile')
	getProfile(@Request() req) {

		return req.user;
	}
}
