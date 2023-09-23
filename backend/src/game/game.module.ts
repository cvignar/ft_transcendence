import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

@Module({
	providers: [GameService, PrismaService, UserService],
	controllers: [GameController],
})
export class GameModule {}
