import http from 'http';
import socketIO from './node_modules/socket.io/dist/index.js';
import express from 'express';
import { GameMode, GameStatus, Player, Side } from './static/common.js';
import { Options } from './static/options.js';
import { Pong } from './pong.js';
import { routes } from './routes.js';
import * as pong_connect from './pong_connect.js';
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
//const userData = new UserData(app);

let players = new Map<string, Player>();
let pongs = new Map<string, Pong>();

routes(app);
server.listen(Options.port, () => {
	console.log('Server starts on port', Options.port);
});

io.on('connection', (socket) => {
	socket.on('new player', (user: {name: string, id: number} | null) => {
		pong_connect.newPlayer(socket, players, user);
	});
	socket.on('disconnect', (reason) => {
		pong_connect.disconnect(socket, players, pongs, reason);
	});
	socket.on('get partners list', () => {
		pong_connect.getPartnersList(socket, players, pongs);
	});
	socket.on('controls', (msg) => {
		pong_connect.controls(socket, players, pongs, msg);
	});
	socket.on('state', () => {
		pong_connect.state(socket, players, pongs);
	});
	socket.on('partner choosed', (socket_id) => {
		pong_connect.partnerChoosed(socket, io, players, socket_id);
	});
	socket.on('partner confirmation', (socket_id) => {
		pong_connect.partnerConfirmation(socket, io, players, pongs, socket_id);
	});
	socket.on('refusal', (socket_id) => {
		pong_connect.refusal(socket, io, players, socket_id);
	});
});

// Calculation loop
setInterval(function() {
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
}, Pong.calculation_period);