import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";

@Module({
	imports: [UserModule, PassportModule, JwtModule.register({
		secret: process.env.JWT_SECRET,
		signOptions: { expiresIn: '1d' },})],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}