import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Module({
	providers: [GameService, PrismaService, UserService, JwtAuthGuard],
	controllers: [],
})
export class GameModule {}
