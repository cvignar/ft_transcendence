import { Injectable, UnauthorizedException, Req, Res} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, username: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (user?.hash !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: user.id,
    };
  }

  async validateIntraUser(id: number, username : string, email : string) : Promise<any>{
    const user = await this.usersService.getUserByEmail(email);
    if (user)
    {
      // return user;
      const payload = { sub: user.id42, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return {
        access_token: token,
        user: user,
      };
    }
    else
    {
      const user = await this.usersService.createUser({
        username: username,
        hash: "",
        email: email,
        id42: Number(id),
      });
      const payload = { sub: user.id42, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return {
        access_token: token,
        user: user
      }
    }
  }
}
