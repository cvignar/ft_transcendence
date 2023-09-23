import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { SaveGame } from '../../../contracts/game.schema';

@Injectable()
export class GameService {
	constructor(
		private prismaService: PrismaService,
		private userService: UserService,
	) {}

	calculateScores([...scores]) {
		const [a, b] = scores;
		const expectedScore = (self, opponent) => {
			return 1 / (1 + 10 ** ((opponent - self) / 400));
		};

		const newScore = (score, index) => {
			return (
				score +
				32 * (index - expectedScore(index ? a : b, index ? b : a))
			);
		};
		return [newScore(a, 1), newScore(b, 0)];
	}

	async saveGame(gameData: SaveGame.Request) {
		const game = await this.prismaService.game.create({
			data: {
				player1: gameData.player1,
				player2: gameData.player2,
				score1: gameData.score1,
				score2: gameData.score2,
				startTime: new Date(gameData.startTime),
				endTime: new Date(gameData.endTime),
				duration: gameData.duration,
			},
		});
		this.userService.updatePlayTime(gameData.player1, gameData.duration);
		this.userService.updatePlayTime(gameData.player2, gameData.duration);
		try {
			const looserId =
				gameData.score1 < gameData.score2
					? gameData.player1
					: gameData.player2;
			const winnerId =
				gameData.score1 > gameData.score2
					? gameData.player1
					: gameData.player2;
			const winner =
				await this.userService.updateGamesWinPlayed(winnerId);
			const looser =
				await this.userService.updateGamesLostPlayed(looserId);
			const oldScores = [winner.score, looser.score];
			const newScores = await this.calculateScores(oldScores);
			if (Math.floor(newScores[0]) === 1200) {
				newScores[0]++;
			}
			if (Math.floor(newScores[1]) === 1200) {
				newScores[1]++;
			}
			await this.prismaService.user.update({
				where: { id: winnerId },
				data: {
					score: Math.floor(newScores[0]),
					gameHistory: { push: game.id },
				},
			});
			this.userService.updateRanks();
		} catch (e) {
			throw new ForbiddenException('saveGame error: ', e);
		}
	}

	async getGame(gameId: number) {
		try {
			const game = await this.prismaService.game.findUnique({
				where: { id: gameId },
			});
			return game;
		} catch (e) {
			throw new ForbiddenException('getGame error: ', e);
		}
	}

	async getLastGames() {
		const games = await this.prismaService.game.findMany({
			orderBy: { endTime: 'desc' },
		});
		return games;
	}
}
