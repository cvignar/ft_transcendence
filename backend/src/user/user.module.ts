import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaService, JwtAuthGuard],
	exports: [UserService],
})
export class UserModule {}
