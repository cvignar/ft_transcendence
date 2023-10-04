import { config } from 'dotenv'
config();
import http from 'http';
import * as socketIO from 'socket.io';
import express from 'express';
import { GameCmd, GameCommand, GameMode, GameScheme, Side } from './static/common.js';
import { Pong } from './Pong.js';
import { routes } from './routes.js';
import { GamesSet} from './GamesSet.js';
import {io as ioc} from 'socket.io-client'
import { ControlOptions, Options } from './static/options.js';
const port = process.env.PONG_PORT ? parseInt(process.env.PONG_PORT) : 0;
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
const games = new GamesSet();
let access_token: any = undefined;

export function gebugPprinting(param1: any | undefined, param2: any | undefined) {
	if (Options.debug) {
		console.log(param1, param2);
	}
}

export function deletePongAndNotifyPlayers(socketId: string) {
	const playersDeletedPong = games.deletePong(socketId);
	if (playersDeletedPong) {
		if (playersDeletedPong.owner) {
			io.sockets.sockets.get(playersDeletedPong.owner.socketId)?.emit('pong deleted');
			io.sockets.sockets.get(playersDeletedPong.owner.socketId)?.emit('partner game off');
			gebugPprinting(playersDeletedPong.owner.name, 'pong deleted');
		}
		if (playersDeletedPong.partner) {
			io.sockets.sockets.get(playersDeletedPong.partner.socketId)?.emit('pong deleted');
			io.sockets.sockets.get(playersDeletedPong.partner.socketId)?.emit('partner game off');
		}
	}
}

routes(app, port);
if (port) {
	server.listen(port, () => {
		console.log('Server starts on port', port);
	});
} else {
	console.log('port is not assigned');
	process.exit(1);
}

io.on('connection', (socket) => {

	socket.on('new player', (user: {name: string, id: number, side: Side, scheme: GameScheme} | undefined) => {
		const player = games.newPlayer(socket.id, user);
		if (player) {
			socket.emit('player created', user?.scheme);
		} else {
			socket.emit('player not created');
		}
		gebugPprinting(player?.name, player ? 'new player' : 'new player not created');
	});

	socket.on('disconnect', (reason) => {
		const player = games.deletePlayer(socket.id);
		gebugPprinting(player?.name, reason);
	});

	socket.on('get partners list', () => {
		const partnersList = games.getPartnersList(socket.id);
		socket.emit('partners list', partnersList);
		gebugPprinting(games.getPlayer(socket.id)?.name+' partnersList: ', partnersList);
	});

	socket.on('controls', (msg) => {
		const player = games.getPlayer(socket.id);
		if (player) {
			let pong = games.getPong(player.socketId);
			if (pong) {
				if (msg.cmd == GameCmd.NEW && !pong.partner) {
				} else {
					pong.setControls(msg, player.side);
					if (msg.cmd == GameCmd.NEW || msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
						if (pong.owner?.socketId) {
							io.sockets.sockets.get(pong.owner.socketId)?.emit('players', pong.getPlayerNames());
						}
						if (pong.partner?.socketId) {
							io.sockets.sockets.get(pong.partner.socketId)?.emit('players', pong.getPlayerNames());
						}
					}
				}
			} else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
				pong = games.nwePong(player);
				socket.emit('pong launched', msg.cmd);
			}
		}
		if (msg.paddle_y == 0 && msg.cmd != GameCmd.MOUSE && msg.cmd != GameCmd.NOCMD) {
			gebugPprinting(player?.name, GameCommand[msg.cmd]+' controls');
		}
	});

	socket.on('partner choosed', (socket_id) => {
		const partner = games.getPlayer(socket.id);
		if (partner) {
			const choosedOwner = games.getPlayer(socket_id);
			if (choosedOwner) {
				const choosedOwnerSocket = io.sockets.sockets.get(socket_id);
				if (choosedOwnerSocket) {
					setTimeout(function() {
						choosedOwnerSocket?.emit('confirm partner', [ socket.id, partner.name ]);
					}, ControlOptions.game_startTime );
					return;
				}
			}
		}
		socket.emit('partner unavailable');
	});

	socket.on('invite partner', (user_id: number) => {
		const inviter = games.getPlayer(socket.id);
		if (inviter) {
			const invited = games.getPlayerById(user_id);
			if (invited) {
				const invitedSocket = io.sockets.sockets.get(invited.socketId);
				if (invitedSocket) {
					setTimeout(function() {
						invitedSocket?.emit('confirm partner', [ socket.id, inviter.name ]);
					}, ControlOptions.game_startTime );
					return;
				}
			}
		}
		socket.emit('partner unavailable');
	});

	socket.on('partner confirmation', (socket_id) => {
		const player = games.getPlayer(socket.id);
		if (player) {
			let pong = games.getPong(socket.id);
			if (!pong) {
				pong = games.nwePong(player);
				socket.emit('pong launched');
			}
			const partner = games.setPartner(socket.id, socket_id);
			if (partner && pong) {
				io.sockets.sockets.get(partner.socketId)?.emit('pong launched');
				return;
			}
		}
		socket.emit('partner unavailable');
		io.sockets.sockets.get(socket_id)?.emit('partner unavailable');
	});

	socket.on('refusal', (socket_id) => {
		if (games.getPlayer(socket.id)) {
			io.sockets.sockets.get(socket_id)?.emit('partner unavailable');
		}
	});

	socket.on('start partner game', () => {
		let opposerSocketId = games.getOpposerSocketId(socket.id);
		if (opposerSocketId) {
			let opposerSocket = io.sockets.sockets.get(opposerSocketId);
			if (opposerSocket) {
				setTimeout(function() {
					opposerSocket?.emit('start partner game');
				}, ControlOptions.game_startTime );
			}
		}
	});

	socket.on('partner refused', () => {
		let opposerSocketId = games.getOpposerSocketId(socket.id);
		if (opposerSocketId) {
			let opposerSocket = io.sockets.sockets.get(opposerSocketId);
			if (opposerSocket) {
				setTimeout(function() {
					opposerSocket?.emit('partner refused');
				}, ControlOptions.game_startTime );
			}
		}
	});
});

// Calculation loop
setInterval(function() {
	let socketIdForDelete = undefined;
	for (const socketId of games.getPongs().keys()) {
		const pong = games.getPong(socketId);
		if (pong) {
			if (pong.mode == GameMode.STOPPING) {
				if (!socketIdForDelete) {
					socketIdForDelete = socketId;
				}
				continue;
			}
			pong.calculate();
			if (pong.owner) {
				io.sockets.sockets.get(pong.owner.socketId)?.emit('state', pong.getPongState(pong.owner.side));
				if (pong.partnerGameOn) {
					io.sockets.sockets.get(pong.owner.socketId)?.emit('partner game on');
					pong.partnerGameOn = false;
				}
				if (pong.partnerGameOff) {
					io.sockets.sockets.get(pong.owner.socketId)?.emit('partner game off');
					pong.partnerGameOff = false;
				}
			}
			if (pong.partner) {
				io.sockets.sockets.get(pong.partner.socketId)?.emit('state', pong.getPongState(pong.partner.side));
				if (pong.partnerGameOn) {
					io.sockets.sockets.get(pong.partner.socketId)?.emit('partner game on');
					pong.partnerGameOn = false;
				}
				if (pong.partnerGameOff) {
					io.sockets.sockets.get(pong.partner.socketId)?.emit('partner game off');
					pong.partnerGameOff = false;
				}
			}
			games.checkResult(pong);
		}
	}
	if (socketIdForDelete) {
		deletePongAndNotifyPlayers(socketIdForDelete);
		socketIdForDelete = undefined;
	}
}, Pong.calculation_period);

// Token request
async function tokenRequest() {
	const pongAuth = {
		email: process.env.PONG_EMAIL,
		username: process.env.PONG_NAME,
		password: process.env.PONG_PASS,
	};
	const headers = new Headers();
	headers.append("Content-Type", "application/json")
	const request = new Request(`http://${process.env.BACK_HOST}:${process.env.BACK_PORT}/auth/login`, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(pongAuth),
	});
	try {
		access_token = await (await fetch(request)).json();
	} catch (e) {
		if (access_token) {
			console.log('cannot get new token');
		}
	}
	if (access_token) {
		gebugPprinting('access_token: ', access_token.access_token);
	}
}

if (access_token) {
	setInterval(tokenRequest, Pong.tokenRequest_period);
}

// Send game results loop
setInterval(async function() {
	const result = games.getNextResult();
	if (access_token) {
		if (result) {
			const sockOpt = {
				transposts: ['websocket'],
				transportOptions: {
					polling: {
						extraHeaders: {
							Token: access_token.access_token
						}
					}
				}
			};
			const socket = ioc(`ws://${process.env.BACK_HOST}:${process.env.BACK_PORT}`, sockOpt);
			socket.emit('save game', result.get());
		}
	} else {
		await tokenRequest();
	}
}, Pong.sendResult_period);