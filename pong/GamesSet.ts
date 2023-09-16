import { Pong } from './Pong';
import { GameMode, Side } from './static/common';
import { Options } from './static/options';


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

export class GamesSet {
	private players:	Map<string, Player>;
	private pongs:		Map<string, Pong>;
	private pongsIdx:	Map<string, Pong>;
	constructor() {
		this.players = new Map<string, Player>;
		this.pongs = new Map<string, Pong>;
		this.pongsIdx = new Map<string, Pong>;
	}
	size(): number {
		return this.pongs.size;
	}
	playersSize(): number {
		return this.players.size;
	}
	getPlayer(socketId: string): Player | null {
		const player = this.players.get(socketId);
		if (player) {
			return player;
		}
		return null;
	}
	getPong(socketId: string): Pong | null {
		let pong = this.pongs.get(socketId);
		if (pong) {
			return pong;
		} else {
			pong = this.pongsIdx.get(socketId);
			if (pong) {
				return pong;
			}
		}
		return null;
	}
	newPlayer(socketId: string, user: {name: string, id: number} | null): Player | null {
		if (!user) {
			return null;
		}
		const player = new Player(socketId, user);
		this.players.set(socketId, player);
		if (Options.debug) {
			console.log(player.name, 'new player');
		}
		return player;
	}
	deletePlayer(socketId: string, reason: string) {
		const player = this.players.get(socketId);
		if (Options.debug) {
			console.log(player?.name, reason);
		}
		if (!player) {
			this.players.delete(socketId);
		}
		const pong = this.getPong(socketId);
		if (pong) {
			pong.mode = GameMode.STOPPING;
		}
	}
	nwePong(owner: Player): Pong {
		const pong = new Pong;
		pong.owner = owner;
		this.pongs.set(owner.socketId, pong);
		return pong;
	}
	deletePong(socketId: string): { owner: Player | null, partner: Player | null} | null {
		let players = null;
		const pong = this.getPong(socketId);
		if (pong) {
			players = { owner: pong.owner, partner: pong.partner };
			if (players.owner) {
				this.pongs.delete(players.owner.socketId);
				if (Options.debug) {
					console.log(players.owner.name, 'pong deleted');
				}
			}
			if (players.partner) {
				this.pongsIdx.delete(players.partner.socketId);
				if (Options.debug) {
					console.log(players.partner.name, 'partner pong deleted');
				}
			}
		}
		return players;
	}
	calculate_sendState(io: any) {
		let socketIdForDelete = null;
		for (const socketId of this.pongs.keys()) {
			const pong = this.pongs.get(socketId);
			if (pong) {
				if (pong.mode == GameMode.STOPPING) {
					if (!socketIdForDelete) {
						socketIdForDelete = socketId;
					}
					break;
				}
				pong.calculate();
				if (pong.owner) {
					io.sockets.sockets.get(pong.owner.socketId).emit('state', pong.getPongState(pong.owner.side));
				}
				if (pong.partner) {
					io.sockets.sockets.get(pong.partner.socketId).emit('state', pong.getPongState(pong.partner.side));
				}
			}
		}
		if (socketIdForDelete) {
			let playersDeletedPong = this.deletePong(socketIdForDelete);
			if (playersDeletedPong) {
				if (playersDeletedPong.owner) {
					io.sockets.sockets.get(playersDeletedPong.owner.socketId)?.emit('pong deleted');
				}
				if (playersDeletedPong.partner) {
					io.sockets.sockets.get(playersDeletedPong.partner.socketId)?.emit('pong deleted');
				}
			}
		}
	}
	getPartnersList(excludeId: string): any {
		let partnersList = new Array<{ socket_id: string, nick_name: string }>;
		for (const socketId of this.pongs.keys() ) {
			if (socketId != excludeId) {
				const pong = this.pongs.get(socketId);
				if (pong && !pong.partner && pong.owner) {
					const partner = { socket_id: socketId, nick_name: pong.owner.name };
					partnersList.push(partner);
				}
			}
		}
		if (Options.debug) {
			console.log('partnersList:', partnersList);
		}
		return partnersList;
	}
	controls() {
		const player = games
	}
}