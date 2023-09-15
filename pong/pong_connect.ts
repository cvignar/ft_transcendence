import { Options } from './static/options.js';
import { Side, GameCmd, GameCommand, BrowserMsg, Player, Partners, GameStatus, GameMode } from './static/common.js';
import { Pong } from './Pong';

let players = new Map<string, Player>();
let pongs = new Map<string, Pong>();
let pongsPartners = new Map<string, Pong>(); // Index pongs by partners

export function findPong(player: Player): Pong | null {
	let pong = pongs.get(player.socketId);
	if (pong) {
		return pong;
	}
	for (const socketId of pongs.keys()) {
		pong = pongs.get(socketId);
		if (pong && pong.partner && pong.partner.socketId == player.socketId) {
			return pong;
		}
	}
	return null;
}

export function deletePong(pongs: any, socketId: any, io: any) {
	let pong = pongs.get(socketId);
	if (pong) {
		if (pong.owner) {
			io.sockets.sockets.get(pong.owner.socketId)?.emit('pong deleted');
			if (Options.debug) {
				console.log(pong.owner.name, 'pong deleted');
			}
		}
		if (pong.partner) {
			io.sockets.sockets.get(pong.partner.socketId)?.emit('pong deleted');
			if (Options.debug) {
				console.log(pong.partner.name, 'partner pong deleted');
			}
		}
		pongs.delete(socketId);
	}
}

export function newPlayer(socket: any, players: any, user: {name: string, id: number} | null) {
	if (user) {
		players.set(socket.id, new Player(socket.id, user));
		socket.emit('player created', user.name);
		if (Options.debug) {
			console.log(players.get(socket.id)?.name, 'new player');
		}
	} else {
		socket.emit('player not crated');
	}
}

export function disconnect(socket: any, players: any, pongs: any, reason: any) {
	const player = players.get(socket.id);
	if (Options.debug) {
		console.log(player, reason);
	}
	if (!player) {
		return;
	}
	const pong = findPong(pongs, player);
	if (pong) {
		pong.mode = GameMode.STOPPING;
	}
	players.delete(socket.id);
}

export function getPartnersList(socket: any, players: any, pongs: any) {
	if (!players.has(socket.id)) {
		return;
	}
	const partners = new Partners;
	const partnersList = partners.getPartnersList(pongs, socket.id);
	socket.emit('partners list', partnersList);
	if (Options.debug) {
		console.log(partnersList);
	}
}

export function controls(socket: any, players: any, pongs: any, msg: BrowserMsg) {
	const player = players.get(socket.id);
	if (Options.debug && (msg.paddle_y == 0 || msg.cmd != GameCmd.MOUSE)) {
		console.log(player.name, GameCommand[msg.cmd], 'controls');
	}
	if (!player) {
		return;
	}
	let pong = findPong(pongs, player);
	if (pong) {
		pong.setControls(msg, player.side);
	} else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
		pong = new Pong;
		player.side = Side.RIGHT;
		pong.setOwner(player);
		socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
		pongs.set(socket.id, pong);
		socket.emit('pong launched');
	}
}

export function state(socket: any, players: any, pongs: any) {
	const player = players.get(socket.id);
	const pong = pongs.get(socket.id);
	if (player && pong) {
		socket.emit('state', pong.getPongState(player.side));
	}
}

export function partnerChoosed(socket: any, io: any, players: any, socket_id: any) {
	if (!players.has(socket.id)) {
		return;
	}
	const partnerSocket = io.sockets.sockets.get(socket_id);
	if (partnerSocket && players.has(partnerSocket.id)) {
		partnerSocket.emit('confirm partner', [socket.id, players.get(socket.id)?.nickname]);
	} else {
		socket.emit('partner unavailable');
	}
}

export function partnerConfirmation(socket: any, io: any, players: any, pongs: any, socket_id: any) {
	if (!players.has(socket.id)) {
		return;
	}
	const partnerSocket = io.sockets.sockets.get(socket_id);
	if (!partnerSocket) {
		socket.emit('partner unavailable');
		return;
	}
	const partner = players.get(partnerSocket.id);
	if (!partner) {
		socket.emit('partner unavailable');
		return;
	}
	const pong = pongs.get(socket.id);
	if (pong) {
		if (pongs.delete(partnerSocket.id)) {
			partnerSocket.emit('pong deleted');
		}
		partner.side = pong.setPartner(partner);
		socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
		partnerSocket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
		// pongs.set(partnerSocket.id, pong);
		partnerSocket.emit('pong launched');
	} else {
		partnerSocket.emit('partner unavailable');
	}
}

export function refusal(socket: any, io: any, players: any, socket_id: any) {
	if (!players.has(socket.id)) {
		return;
	}
	const partnerSocket = io.sockets.sockets.get(socket_id);
	if (partnerSocket) {
		partnerSocket.emit('partner unavailable');
	}
}

export function calculatePongs() {
	let socketIdForDelete: any  = null;
	for (const socketId of pongs.keys()) {
		let pong = pongs.get(socketId);
		if (pong) {
			if (pong.mode == GameMode.STOPPING) {
				if (!socketIdForDelete) {
					socketIdForDelete = socketId;
				}
				break;
			}
			pong.calculate();
			if (pong.owner) {
				io.sockets.sockets.get(pong.owner.socketId)?.emit('state', pong.getPongState(pong.owner.side));
			}
			if (pong.partner) {
				io.sockets.sockets.get(pong.partner.socketId)?.emit('state', pong.getPongState(pong.partner.side));
			}
		}
	}
	if (socketIdForDelete) {
		pong_connect.deletePong(pongs, socketIdForDelete, io);
	}
}