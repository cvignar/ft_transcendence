import { Pong } from './Pong.js';
import { deletePongAndNotifyPlayers } from './server.js';
import { GameMode, GameScheme, GameStatus, Side } from './static/common.js';
import { Options, PongOptions } from './static/options.js';


export class Player {
	socketId: string;
	name: string;
	id: number = 0;
	side: Side = 0;
	scheme: GameScheme = GameScheme.GENERAL;
	disconnectTime: number = 0;
	timeOutOf: boolean = false;
	imWatching: string = '';
	constructor(socketId: string, user: {name: string, id: number, side: Side, scheme: GameScheme}) {
		this.socketId = socketId;
		this.name = user.name;
		this.id = user.id;
		this.side = user.side;
		this.scheme = user.scheme;
		this.disconnectTime = 0;
		this.timeOutOf = false;
		this.imWatching = '';
	}
}

export class Result {
	private player1: number | undefined = undefined;
	private player2: number | undefined = undefined;
	private score1: number = 0;
	private score2: number = 0;
	private startTime: number = 0;
	private endTime: number = 0;
	private duration: number = 0;
	private isActual = false;
	constructor() {}
	setIsActual(isActual: boolean): Result {
		this.isActual = isActual;
		return this;
	}
	getIsActual(): boolean {
		return this.isActual;
	}
	set(pong: Pong): Result {
		if (pong.mode == GameMode.PARTNER_GAME) {
			this.player1 = pong.getLeftPlayer()?.id;
			this.player2 = pong.getRightPlayer()?.id;
			if (this.player1 && this.player2) {
				if (this.player1 > 0 || this.player2 > 0) {
					this.score1 = pong.leftScore;
					this.score2 = pong.rightScore;
					this.startTime = pong.gameStartTime;
					this.endTime = pong.gameEndTime;
					this.duration = pong.gameEndTime - pong.gameStartTime;
					this.duration = this.duration > 0 ? this.duration : 0;
					this.isActual = true;
				}
			}
		}
		return this;
	}
	makeRestoredKey(userId: number): Result {
		this.player1 = userId;
		this.player2 = -1;
		this.score1 = 0;
		this.score2 = 0;
		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;
		this.isActual = true;
		return this;
	}
	makeInterruptedKey(pong: Pong): Result {
		this.set(pong);
		this.score1 = Options.maxWins;
		this.score2 = Options.maxWins;
		return this;
	}
	get(): {
			player1: number | undefined,
			player2: number | undefined,
			score1: number,
			score2: number,
			startTime: number,
			endTime: number,
			duration: number
			} {
		return {
			player1: this.player1,
			player2: this.player2,
			score1: this.score1,
			score2: this.score2,
			startTime: this.startTime,
			endTime: this.endTime,
			duration: this.duration
		};
	}
}

export class GamesSet {
	private players:			Map<string, Player>;
	private pongs:				Map<string, Pong>;
	private pongsIdx:			Map<string, Pong>;
	private resultQueue:		Result[];
	private deletePlayerQueue:	string[];
	constructor() {
		this.players = new Map<string, Player>;
		this.pongs = new Map<string, Pong>;
		this.pongsIdx = new Map<string, Pong>;
		this.resultQueue = new Array();
		this.deletePlayerQueue = new Array();
	}
	getPongs() {
		return this.pongs;
	}
	getPlayers() {
		return this.players;
	}
	size(): number {
		return this.pongs.size;
	}
	playersSize(): number {
		return this.players.size;
	}
	getPlayer(socketId: string): Player | undefined {
		const player = this.players.get(socketId);
		if (player) {
			return player;
		}
		return undefined;
	}
	setResult(result: Result) {
		this.resultQueue.push(result);
	}
	getPlayerById(userId: number): Player | undefined {
		const duplicates = new Array<Player>;
		for (const socketId of this.players.keys()) {
			const player = this.getPlayer(socketId);
			
			if (player && player.id == userId) {
				duplicates.push(player);
			}
		}
		while(duplicates.length > 1) {
			const player = duplicates.shift();
			if (player) {
				const result = this.deletePlayer(player.socketId);
				if (result === null) {
					duplicates.push(player);
				}
			}
		}
		if (duplicates.length === 1) {
			return duplicates.shift();
		}
		return undefined;
	}
	getPong(socketId: string): Pong | undefined {
		let pong = this.pongs.get(socketId);
		if (pong) {
			return pong;
		} else {
			pong = this.pongsIdx.get(socketId);
			if (pong) {
				return pong;
			}
		}
		return undefined;
	}
	newPlayer(socketId: string, user: {name: string, id: number, side: Side, scheme: GameScheme} | undefined): Player | undefined {
		if (user && user.name && user.side && user.scheme) {
			if (this.players.has(socketId)) {
				this.deletePlayer(socketId);
			}
			let player = this.getPlayerById(user.id)
			if (player && player.id > 0) {
				if (player) {
					const pong = this.getPong(player.socketId)
					if (pong) {
						if (pong.isPartnerGameInProgressPaused()) {
							player.disconnectTime = 0;
							player.timeOutOf = false;
							const priorSocketId = player.socketId;
							this.renewPlayerSocketId(priorSocketId, socketId);
							return player;
						} else {
							this.deletePlayer(player.socketId);
						}
					}
				}
			}
			player = new Player(socketId, user);
			this.players.set(socketId, player);
			return player;
		}
		return undefined;
	}
	newPlayerFrom(player: Player): Player | undefined {
		const user = {
			name: player.name,
			id: player.id,
			side: player.side,
			scheme: player.scheme,
		};
		return this.newPlayer(player.socketId, user);
	}
	deletePlayer(socketId: string): Player | undefined | null {
		const player = this.players.get(socketId);
		if (player) {
			const pong = this.getPong(socketId);
			if (pong) {
				// Partner game is interrupted
				if (pong.isPartnerGameInProgress()) {
					// The player just disconnected
					if (player.disconnectTime == 0) {
						player.disconnectTime = Date.now();
						pong.status = GameStatus.PAUSED;
						return null;
					}
					// Generating the signal to backend that the partner game is interrupted
					const interruptedKey = new Result;
					this.setResult(interruptedKey.makeInterruptedKey(pong));
				}
				pong.mode = GameMode.STOPPING;
			}
			const watchingPong = this.getPong(player.imWatching)
			if (watchingPong) {
				watchingPong.whatchers.delete(socketId);
			}
			this.players.delete(socketId);
		}
		return player;
	}
	nwePong(owner: Player): Pong {
		const pong = new Pong;
		pong.owner = owner;
		this.pongs.set(owner.socketId, pong);
		return pong;
	}
	deletePong(socketId: string): { owner: Player | undefined, partner: Player | undefined} | undefined {
		let players = undefined;
		const pong = this.getPong(socketId);
		if (pong) {
			players = { owner: pong.owner, partner: pong.partner };
			if (players.owner) {
				this.pongs.delete(players.owner.socketId);
			}
			if (players.partner) {
				this.pongsIdx.delete(players.partner.socketId);
			}
		}
		return players;
	}
	setPartner(pongSocketId: string, partnerSocketId: string): Player | undefined {
		const partner = this.getPlayer(partnerSocketId)
		if (partner) {
			const pong = this.getPong(pongSocketId);
			if (pong) {
				const partnerPong = this.getPong(partnerSocketId);
				if (partnerPong ) {
					deletePongAndNotifyPlayers(partner.socketId);
				}
				pong.setPartner(partner);
				this.pongsIdx.set(partner.socketId, pong);
				return partner;
			}
		}
		return undefined;
	}
	getPartnersList(excludeId: string): any {
		let partnersList = new Array<{ socket_id: string, nick_name: string }>;
		if (this.players.has(excludeId)) {
			for (const socketId of this.pongs.keys() ) {
				if (socketId != excludeId) {
					const pong = this.pongs.get(socketId);
					if (pong && !pong.partner && pong.owner) {
						const partner = { socket_id: socketId, nick_name: pong.owner.name };
						partnersList.push(partner);
					}
				}
			}
		}
		return partnersList;
	}
	getOpposerSocketIdOnStart(socketId: string): string | undefined {
		let player = this.getPlayer(socketId);
		if (player) {
			let pong = this.getPong(socketId);
			if (pong && pong.atGameStart) {
				return pong.getOpposerSocketId(socketId);
			}
		}
		return undefined;
	}
	checkResult(pong: Pong) {
		if (pong.gameResult.getIsActual()) {
			this.resultQueue.push(pong.gameResult);
			pong.gameResult.setIsActual(false);
		}
	}
	getNextResultFromQueue(): Result | undefined {
		if (this.resultQueue.length) {
			return this.resultQueue.shift();
		}
		return undefined;
	}
	isResultInQueue(): boolean {
		if (this.resultQueue.length) {
			return true;
		}
		return false;
	}
	checkPlayerForDelete(pong: Pong) {
		if (pong.owner &&
			pong.owner.disconnectTime != 0 &&
			pong.owner.timeOutOf == false &&
			Date.now() - pong.owner.disconnectTime > PongOptions.playerDisconnect_timeout)
		{
				this.deletePlayerQueue.push(pong.owner.socketId);
				pong.owner.timeOutOf = true;
		}
		if (pong.partner &&
			pong.partner.disconnectTime != 0 &&
			pong.partner.timeOutOf == false &&
			Date.now() - pong.partner.disconnectTime > PongOptions.playerDisconnect_timeout)
		{
				this.deletePlayerQueue.push(pong.partner.socketId);
				pong.partner.timeOutOf = true;
		}
	}
	getNextPlayerForDeleteFromQueue(): string | undefined {
		if (this.deletePlayerQueue.length) {
			return this.deletePlayerQueue.shift();
		}
		return undefined;
	}
	isPlayerForDeleteInQueue(): boolean {
		if (this.deletePlayerQueue.length) {
			return true;
		}
		return false;
	}
	renewPlayerSocketId(prior: string, renewed: string) {
		const player = this.players.get(prior);
		if (player) {
			this.players.delete(prior);
			this.players.set(renewed, player);
			player.socketId = renewed;
		}
		let pong = this.pongs.get(prior);
		if (pong) {
			this.pongs.delete(prior);
			this.pongs.set(renewed, pong);
		}
		pong = this.pongsIdx.get(prior);
		if (pong) {
			this.pongsIdx.delete(prior);
			this.pongsIdx.set(renewed, pong);
		}
	}
}