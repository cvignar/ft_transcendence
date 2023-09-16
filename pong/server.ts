import http from 'http';
import socketIO from './node_modules/socket.io/dist/index.js';
import express from 'express';
import { GameCmd, GameCommand } from './static/common.js';
import { Options } from './static/options.js';
import { Pong } from './Pong';
import { routes } from './routes.js';
import * as pong_connect from './pong_connect.js';
import { GamesSet } from './GamesSet';
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
const games = new GamesSet();

routes(app);
server.listen(Options.port, () => {
	console.log('Server starts on port', Options.port);
});

io.on('connection', (socket) => {
	socket.on('new player', (user: {name: string, id: number} | null) => {
		const player = games.newPlayer(socket.id, user);
		if (player) {
			socket.emit('player created', player.name);
		} else {
			socket.emit('player not created');
		}
	});
	socket.on('disconnect', (reason) => {
		games.deletePlayer(socket.id, reason);
	});
	socket.on('get partners list', () => {
		if (games.getPlayer(socket.id)) {
			socket.emit('partners list', games.getPartnersList(socket.id));
		}
	});
	socket.on('controls', (msg) => {
		const player = games.getPlayer(socket.id);
		if (player) {
			let pong = games.getPong(socket.id);
			if (pong) {
				pong.setControls(msg, player.side);
				if (msg.cmd == GameCmd.NEW || msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
					const left = pong.getLeftPlayer();
					const right = pong.getRightPlayer();
					socket.emit('players', [ left ? left.name : 'auto',right ? right.name : 'auto' ]);
				}
			} else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
				pong = games.nwePong(player);
				pong.setControls(msg, player.side);
				const left = pong.getLeftPlayer();
				const right = pong.getRightPlayer();
				socket.emit('players', [ left ? left.name : 'auto',right ? right.name : 'auto' ]);
			}
		}
		if (Options.debug && (msg.paddle_y == 0 || msg.cmd != GameCmd.MOUSE)) {
			console.log(player?.name, GameCommand[msg.cmd], 'controls');
		}
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
	games.calculate_sendState(io);
}, Pong.calculation_period);