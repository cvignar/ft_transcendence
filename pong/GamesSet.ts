import { Pong } from './Pong.js';
import { deletePongAndNotifyPlayers } from './server.js';
import { BrowserMsg, GameCmd, GameCommand, GameMode, Side } from './static/common.js';
import { ControlOptions } from './static/options.js';


export class Player {
	socketId: string;
	name: string;
	id: number;
	side: Side;
	constructor(socketId: string, user: {name: string, id: number}) {
		this.socketId = socketId;
		this.name = user.name;
		this.id = user.id;
		this.side = Side.RIGHT;
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
	set(pong: Pong) {
		if (pong.mode == GameMode.PARTNER_GAME) {
			this.player1 = pong.getLeftPlayer()?.id;
			this.player2 = pong.getRightPlayer()?.id;
			this.score1 = pong.leftScore;
			this.score2 = pong.rightScore;
			this.startTime = pong.gameStartTime;
			this.endTime = pong.gameEndTime;
			this.duration = pong.gameEndTime - pong.gameStartTime;
		}
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
	private players:	Map<string, Player>;
	private pongs:		Map<string, Pong>;
	private pongsIdx:	Map<string, Pong>;
	constructor() {
		this.players = new Map<string, Player>;
		this.pongs = new Map<string, Pong>;
		this.pongsIdx = new Map<string, Pong>;
	}
	getPongs() {
		return this.pongs;
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
	newPlayer(socketId: string, user: {name: string, id: number} | undefined): Player | undefined {
		if (user && user.name) {
			const player = new Player(socketId, user);
			this.players.set(socketId, player);
			return player;
		}
		return undefined;
	}
	deletePlayer(socketId: string): Player | undefined {
		const pong = this.getPong(socketId);
		if (pong) {
			pong.mode = GameMode.STOPPING;
		}
		const player = this.players.get(socketId);
		this.players.delete(socketId);
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
				if (partnerPong) {
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
	getOpposer(socketId: string): string | undefined {
		let player = this.getPlayer(socketId);
		if (player) {
			let pong = this.getPong(socketId);
			if (pong && pong.partner && pong.partner == player) {
				if (pong.owner) {
					return pong.owner.socketId;
				}
			} else if (pong && pong.owner && pong.owner == player) {
				if (pong.partner) {
					return pong.partner.socketId;
				}
			}
		}
		return undefined;
	}
}