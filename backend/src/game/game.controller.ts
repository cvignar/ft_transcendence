import { Body, Controller, Post } from '@nestjs/common';
import { SaveGame } from 'contracts/game.schema';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}

	@Post('save')
	async saveGame(@Body() gameData: SaveGame.request) {
		return await this.gameService.saveGame(gameData);
	}
}
