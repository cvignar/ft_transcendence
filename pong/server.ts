import { config } from "dotenv";
config();
import https from 'https';
import * as socketIO from 'socket.io';
import express from 'express';
import { GameCmd, GameCommand, GameMode, GameScheme, GameStatus, Side } from './static/common.js';
import { Pong } from './Pong.js';
import { routes } from './routes.js';
import { GamesSet, Result} from './GamesSet.js';
import {io as ioc, Socket} from 'socket.io-client'
import { ControlOptions, Options } from './static/options.js';
import fs from 'fs';
const port = process.env.PONG_PORT ? parseInt(process.env.PONG_PORT) : 0;
const app = express();
const server = new https.Server({
	key: fs.readFileSync('/ssl/ft_transcendence.key'),
	cert: fs.readFileSync('/ssl/ft_transcendence.crt'),
}, app);
const io = new socketIO.Server(server);
const games = new GamesSet();
let access_token: any = undefined;
let socketToBackend: Socket;


export function gebugPrinting(param1: any | undefined, param2: any | undefined) {
	if (Options.debug) {
		console.log(param1, param2);
	}
}

export function deletePongAndNotifyPlayers(socketId: string) {
	const playersDeletedPong = games.deletePong(socketId);
	if (playersDeletedPong) {
		if (playersDeletedPong.owner) {
			io.sockets.sockets.get(playersDeletedPong.owner.socketId)?.emit("pong deleted");
			gebugPrinting(playersDeletedPong.owner.name, "pong deleted");
		}
		if (playersDeletedPong.partner) {
			io.sockets.sockets.get(playersDeletedPong.partner.socketId)?.emit("pong deleted");
		}
	}
}

routes(app, port);
if (port) {
	server.listen(port, () => {
		console.log("Server starts on port", port);
	});
} else {
	console.log("port is not assigned");
	process.exit(1);
}

io.on("connection", (socket) => {
	socket.on("new player", (user: { name: string; id: number; side: Side; scheme: GameScheme } | undefined) => {
		const player = games.newPlayer(socket.id, user);
		if (player) {
			socket.emit("player created", user?.scheme);
			const pong = games.getPong(socket.id);
			if (pong) {
				if (pong.leftScore >= Options.maxWins ||
					pong.rightScore >= Options.maxWins)
				{
					pong.status = GameStatus.INACTIVE;
				} else {
					pong.status = GameStatus.PLAYING;
				}
				if (user && user.id > 0) {
					const result: Result = new Result();
					games.setResult(result.makeRestoredKey(user.id));
					socket.emit('pong restored');
					socket.emit("players", pong.getPlayerNames());
				}
			}
		} else {
			socket.emit("player not created");
		}
		gebugPrinting(player?.name, player ? "new player" : "new player not created");
	});
	
	socket.on("stop watch", (user: { name: string; id: number; side: Side; scheme: GameScheme } | undefined) => {
		socket.emit("pong deleted");
		const player = games.newPlayer(socket.id, user);
		if (player) {
			socket.emit("player created", user?.scheme);
		} else {
			socket.emit("player not created");
		}
		gebugPrinting(player?.name, player ? "new player" : "new player not created");
	});
	
	socket.on("disconnect", (reason) => {
		let player = games.deletePlayer(socket.id);
		if (player == null) {
			player = games.getPlayer(socket.id);
		}
		if (player) {
			const pong = games.getPong(socket.id);
			if (pong && pong.isPartnerGameInProgressPaused()) {
				const opposerSocketId = pong.getOpposerSocketId(socket.id);
				if (opposerSocketId) {
					io.sockets.sockets.get(opposerSocketId)?.emit('partner disconnected');
				}
			}
		}
		gebugPrinting(player?.name, reason);
	});
	
	socket.on("get partners list", () => {
		const partnersList = games.getPartnersList(socket.id);
		socket.emit("partners list", partnersList);
		gebugPrinting(games.getPlayer(socket.id)?.name + " partnersList: ", partnersList);
	});
	
	socket.on("controls", (msg) => {
		let player = games.getPlayer(socket.id);
		if (msg.paddle_y == 0 && msg.cmd != GameCmd.MOUSE && msg.cmd != GameCmd.NOCMD) {
			gebugPrinting(player?.name, GameCommand[msg.cmd] + " controls");
		}
		if (player) {
			if (player.imWatching) {
				const watchingPong = games.getPong(player.imWatching);
				if (watchingPong) {
					if (watchingPong.isPartnerGameInProgress()) {
						return;
					} else {
						socket.emit("pong deleted");
						player = games.newPlayerFrom(player);
						gebugPrinting(player?.name, player ? "new player" : "new player not created");
						if (player) {
							socket.emit("player created", player.scheme);
						} else {
							socket.emit("player not created");
							return;
						}
					}
				}
			}
			let pong = games.getPong(socket.id);
			if (pong) {
				if (msg.cmd == GameCmd.NEW && !pong.partner) {
				} else {
					pong.setControls(msg, player.side);
					if (msg.cmd == GameCmd.NEW || msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
						if (pong.owner?.socketId) {
							io.sockets.sockets.get(pong.owner.socketId)?.emit("players", pong.getPlayerNames());
						}
						if (pong.partner?.socketId) {
							io.sockets.sockets.get(pong.partner.socketId)?.emit("players", pong.getPlayerNames());
						}
					}
				}
			} else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
				pong = games.nwePong(player);
				socket.emit("pong launched", msg.cmd);
			}
		}
	});
	
	socket.on("partner choosed", (socket_id) => {
		const player = games.getPlayer(socket.id);
		gebugPrinting(player?.name, "choosing partner");
		if (player) {
			const choosedOwner = games.getPlayer(socket_id);
			if (choosedOwner) {
				const choosedOwnerSocket = io.sockets.sockets.get(socket_id);
				if (choosedOwnerSocket) {
					setTimeout(function () {
						choosedOwnerSocket?.emit("confirm partner", [socket.id, player.name]);
					}, ControlOptions.game_startTime);
					return;
				}
			}
		}
		socket.emit("partner unavailable");
	});
	
	socket.on('invite partner', (user_id: number) => {
		const inviter = games.getPlayer(socket.id);
		if (inviter) {
			const pong = games.getPong(socket.id);
			if (pong && pong.owner) {
				games.deletePong(pong.owner.socketId);
			}
			const invited = games.getPlayerById(user_id);
			if (invited) {
				const invitedSocket = io.sockets.sockets.get(invited.socketId);
				if (invitedSocket) {
					io.sockets.sockets.get(invited.socketId)?.emit('confirm partner', [ socket.id, inviter.name ]);
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
	
	socket.on("refusal", (socket_id) => {
		if (games.getPlayer(socket.id)) {
			io.sockets.sockets.get(socket_id)?.emit("partner unavailable");
		}
	});
	
	socket.on('start partner game', () => {
		let opposerSocketId = games.getOpposerSocketIdOnStart(socket.id);
		if (opposerSocketId) {
			let opposerSocket = io.sockets.sockets.get(opposerSocketId);
			if (opposerSocket) {
				setTimeout(function () {
					opposerSocket?.emit("start partner game");
				}, ControlOptions.game_startTime);
			}
		}
	});
	
	socket.on('partner refused', () => {
		let opposerSocketId = games.getOpposerSocketIdOnStart(socket.id);
		if (opposerSocketId) {
			let opposerSocket = io.sockets.sockets.get(opposerSocketId);
			if (opposerSocket) {
				setTimeout(function () {
					opposerSocket?.emit("partner refused");
				}, ControlOptions.game_startTime);
			}
		}
	});
	
	socket.on('whatch game', (user_id) => {
		const player = games.getPlayer(socket.id);
		if (player) {
			const showPlayer = games.getPlayerById(user_id);
			if (showPlayer) {
				const pong = games.getPong(showPlayer.socketId);
				if (pong) {
					deletePongAndNotifyPlayers(socket.id);// delete player's pong if it is
					pong.whatchers.add(player.socketId);
					player.imWatching = showPlayer.socketId;
					socket.emit("players", pong.getPlayerNames());
					socket.emit("pong restored");
				}
			}
		}
	});
	
});

// Calculation loop
setInterval(function () {
	let pongSocketIdForDelete = undefined;
	for (const socketId of games.getPongs().keys()) {
		const pong = games.getPong(socketId);
		if (pong) {
			games.checkResult(pong);
			games.checkPlayerForDelete(pong);
			if (pong.mode == GameMode.STOPPING) {
				if (!pongSocketIdForDelete) {
					pongSocketIdForDelete = socketId;
				}
				continue;
			}
			pong.calculate();
			let ownerState;
			if (pong.owner) {
				ownerState = pong.getPongState(pong.owner.side);
				io.sockets.sockets.get(pong.owner.socketId)?.emit("state", ownerState);
			}
			if (pong.partner) {
				io.sockets.sockets.get(pong.partner.socketId)?.emit("state", pong.getPongState(pong.partner.side));
			}
			if (pong.whatchers.size) {
				if (ownerState) {
					ownerState.mode = GameMode.AUTO_GAME;
				}
				for (const watcherSocketId of pong.whatchers.keys()) {
					io.sockets.sockets.get(watcherSocketId)?.emit("state", ownerState);
				}
			}
		}
	}
	if (pongSocketIdForDelete) {
		deletePongAndNotifyPlayers(pongSocketIdForDelete);
		pongSocketIdForDelete = undefined;
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
	headers.append("Content-Type", "application/json");
	const request = new Request(`https://${process.env.HOST_NAME}:${process.env.BACK_PORT}/auth/login`, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(pongAuth),
	});
	try {
		access_token = await (await fetch(request)).json();
	} catch (e) {

		gebugPrinting("cannot get new token, ", e);
	}
	if (access_token) {
		gebugPrinting("access_token: ", access_token.jwtAccess);
	}
}

if (access_token) {
	setInterval(tokenRequest, Pong.tokenRequest_period);
}

// Send game results and disconnect timeout players loop
setInterval(async function() {
	if (access_token) {
		if (games.isResultInQueue()) {
			if (!socketToBackend || !socketToBackend?.connected) {
				const sockOpt = {
					transposts: ['websocket'],
					transportOptions: {
						polling: {
							extraHeaders: {
								token: access_token.jwtAccess,
								iampong: process.env.PONG_SECRET
							}
						}
					}
				};
				socketToBackend = ioc(`wss://${process.env.HOST_NAME}:${process.env.BACK_PORT}`, sockOpt);
			}
			if (socketToBackend.connected) {
				const result = games.getNextResultFromQueue();
				socketToBackend.emit('save game', result?.get());
				gebugPrinting('game start or result sended', '');
			} else {
				gebugPrinting('game start or result NOT sended', '');
			}
		}
	} else {
		await tokenRequest();
	}
	const playerSocketId = games.getNextPlayerForDeleteFromQueue();
	if (playerSocketId) {
		const player = games.deletePlayer(playerSocketId);
		gebugPrinting(player?.name, 'disconnect timeout, deleted');
	}
}, Pong.sendResult_period);
