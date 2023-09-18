import http from 'http';
import * as socketIO from 'socket.io';
import express from 'express';
``;
import { GameCmd, GameCommand, GameMode } from './static/common.js';
import { Options } from './static/options.js';
import { Pong } from './Pong.js';
import { routes } from './routes.js';
import { GamesSet } from './GamesSet.js';
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
const games = new GamesSet();
export function gebugPprinting(param1, param2) {
    if (Options.debug) {
        console.log(param1, param2);
    }
}
export function deletePongAndNotifyPlayers(socketId) {
    var _a, _b;
    const playersDeletedPong = games.deletePong(socketId);
    if (playersDeletedPong) {
        if (playersDeletedPong.owner) {
            (_a = io.sockets.sockets.get(playersDeletedPong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('pong deleted');
            gebugPprinting(playersDeletedPong.owner.name, 'pong deleted');
        }
        if (playersDeletedPong.partner) {
            (_b = io.sockets.sockets.get(playersDeletedPong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('pong deleted');
        }
    }
}
routes(app);
server.listen(Options.port, () => {
    console.log('Server starts on port', Options.port);
});
io.on('connection', (socket) => {
    socket.on('new player', (user) => {
        const player = games.newPlayer(socket.id, user);
        if (player) {
            socket.emit('player created', player.name);
        }
        else {
            socket.emit('player not created');
        }
        gebugPprinting(player === null || player === void 0 ? void 0 : player.name, player ? 'new player' : 'new player not created');
    });
    socket.on('disconnect', (reason) => {
        const player = games.deletePlayer(socket.id);
        gebugPprinting(player === null || player === void 0 ? void 0 : player.name, reason);
    });
    socket.on('get partners list', () => {
        const partnersList = games.getPartnersList(socket.id);
        socket.emit('partners list', partnersList);
        gebugPprinting(games.getPlayer(socket.id), 'partnersList:' + partnersList);
    });
    socket.on('controls', (msg) => {
        var _a;
        const playerNames = games.controls(socket.id, msg);
        if (playerNames) {
            socket.emit('players', playerNames);
            socket.emit('pong launched');
        }
        if (msg.paddle_y == 0 || msg.cmd != GameCmd.MOUSE) {
            gebugPprinting((_a = games.getPlayer(socket.id)) === null || _a === void 0 ? void 0 : _a.name, GameCommand[msg.cmd] + ' controls');
        }
    });
    socket.on('partner choosed', (socket_id) => {
        const partner = games.getPlayer(socket.id);
        if (partner) {
            const choosedOwner = games.getPlayer(socket_id);
            if (choosedOwner) {
                const choosedOwnerSocket = io.sockets.sockets.get(socket_id);
                if (choosedOwnerSocket) {
                    choosedOwnerSocket.emit('confirm partner', [partner.socketId, partner.name]);
                    return;
                }
            }
        }
        socket.emit('partner unavailable');
    });
    socket.on('partner confirmation', (socket_id) => {
        var _a, _b, _c;
        const partner = games.setPartner(socket.id, socket_id);
        const pong = games.getPong(socket.id);
        if (partner && pong) {
            (_a = io.sockets.sockets.get(partner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('pong launched');
            socket.emit('players', pong.getPlayerNames);
            (_b = io.sockets.sockets.get(partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('players', pong.getPlayerNames);
        }
        else {
            socket.emit('partner unavailable');
            (_c = io.sockets.sockets.get(socket_id)) === null || _c === void 0 ? void 0 : _c.emit('partner unavailable');
        }
    });
    socket.on('refusal', (socket_id) => {
        var _a;
        if (games.getPlayer(socket.id)) {
            (_a = io.sockets.sockets.get(socket_id)) === null || _a === void 0 ? void 0 : _a.emit('partner unavailable');
        }
    });
});
// Calculation loop
setInterval(function () {
    var _a, _b;
    let socketIdForDelete = undefined;
    for (const socketId of games.getPongs().keys()) {
        const pong = games.getPong(socketId);
        if (pong) {
            if (pong.mode == GameMode.STOPPING) {
                if (!socketIdForDelete) {
                    socketIdForDelete = socketId;
                }
                break;
            }
            pong.calculate();
            if (pong.owner) {
                (_a = io.sockets.sockets.get(pong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('state', pong.getPongState(pong.owner.side));
            }
            if (pong.partner) {
                (_b = io.sockets.sockets.get(pong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('state', pong.getPongState(pong.partner.side));
            }
        }
    }
    if (socketIdForDelete) {
        deletePongAndNotifyPlayers(socketIdForDelete);
    }
}, Pong.calculation_period);
