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

export function gebugPprinting(param1: any | undefined, param2: any | undefined) {
	if (Options.debug) {
		console.log(param1, param2);
	}
}

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
		gebugPprinting(player?.name, player ? 'new player' : 'new player not created');
	});
	socket.on('disconnect', (reason) => {
		const player = games.deletePlayer(socket.id);
		gebugPprinting(player?.name, reason);
	});
	socket.on('get partners list', () => {
		const partnersList = games.getPartnersList(socket.id);
		socket.emit('partners list', partnersList);
		gebugPprinting('partnersList:', partnersList);
	});
	socket.on('controls', (msg) => {
		const player = games.getPlayer(socket.id);
		const playerNames = games.controls(player, msg);
		if (playerNames) {
			socket.emit('players', playerNames);
		}
		if (msg.paddle_y == 0 || msg.cmd != GameCmd.MOUSE) {
			gebugPprinting(player?.name, GameCommand[msg.cmd]+'controls');
		}
	});
	socket.on('partner choosed', (socket_id) => {
		const mySocketIdAndName = games.getMySocketIdAndName_if(socket.id, socket_id);
		if (mySocketIdAndName) {
			const choosedPartnerSocket = io.sockets.sockets.get(socket_id);
			if (choosedPartnerSocket) {
				choosedPartnerSocket.emit('confirm partner', mySocketIdAndName);
				return;
			}
		}
		socket.emit('partner unavailable');
	});
	socket.on('partner confirmation', (socket_id) => {
		const partner = games.setPartner_if(socket.id, socket_id);
		if (partner) {
			const playersDeletedPong = games.deletePong(partner.socketId);
			if (playersDeletedPong) {
				if (playersDeletedPong.owner) {
					io.sockets.sockets.get(playersDeletedPong.owner.socketId)?.emit('pong deleted');
				}
				if (playersDeletedPong.partner) {
					io.sockets.sockets.get(playersDeletedPong.partner.socketId)?.emit('pong deleted');
				}
			}
			const ownePong = games.getPong(socket.id);
			

		}



	});
});

// Calculation loop
setInterval(function() {
	games.calculate_sendState(io);
}, Pong.calculation_period);