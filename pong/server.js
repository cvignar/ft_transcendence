var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config } from 'dotenv';
config();
import http from 'http';
import * as socketIO from 'socket.io';
import express from 'express';
import { GameCmd, GameCommand, GameMode } from './static/common.js';
import { Pong } from './Pong.js';
import { routes } from './routes.js';
import { GamesSet } from './GamesSet.js';
import { io as ioc } from 'socket.io-client';
import { ControlOptions, Options } from './static/options.js';
const port = process.env.PONG_PORT ? parseInt(process.env.PONG_PORT) : 0;
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
const games = new GamesSet();
let access_token = undefined;
export function gebugPprinting(param1, param2) {
    if (Options.debug) {
        console.log(param1, param2);
    }
}
export function deletePongAndNotifyPlayers(socketId) {
    var _a, _b, _c, _d;
    const playersDeletedPong = games.deletePong(socketId);
    if (playersDeletedPong) {
        if (playersDeletedPong.owner) {
            (_a = io.sockets.sockets.get(playersDeletedPong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('pong deleted');
            (_b = io.sockets.sockets.get(playersDeletedPong.owner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('partner game off');
            gebugPprinting(playersDeletedPong.owner.name, 'pong deleted');
        }
        if (playersDeletedPong.partner) {
            (_c = io.sockets.sockets.get(playersDeletedPong.partner.socketId)) === null || _c === void 0 ? void 0 : _c.emit('pong deleted');
            (_d = io.sockets.sockets.get(playersDeletedPong.partner.socketId)) === null || _d === void 0 ? void 0 : _d.emit('partner game off');
        }
    }
}
routes(app, port);
if (port) {
    server.listen(port, () => {
        console.log('Server starts on port', port);
    });
}
else {
    console.log('port is not assigned');
    process.exit(1);
}
io.on('connection', (socket) => {
    socket.on('new player', (user) => {
        const player = games.newPlayer(socket.id, user);
        if (player) {
            socket.emit('player created', user === null || user === void 0 ? void 0 : user.scheme);
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
        var _a;
        const partnersList = games.getPartnersList(socket.id);
        socket.emit('partners list', partnersList);
        gebugPprinting(((_a = games.getPlayer(socket.id)) === null || _a === void 0 ? void 0 : _a.name) + ' partnersList: ', partnersList);
    });
    socket.on('controls', (msg) => {
        var _a, _b, _c, _d;
        const player = games.getPlayer(socket.id);
        if (player) {
            let pong = games.getPong(player.socketId);
            if (pong) {
                if (msg.cmd == GameCmd.NEW && !pong.partner) {
                }
                else {
                    pong.setControls(msg, player.side);
                    if (msg.cmd == GameCmd.NEW || msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
                        if ((_a = pong.owner) === null || _a === void 0 ? void 0 : _a.socketId) {
                            (_b = io.sockets.sockets.get(pong.owner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('players', pong.getPlayerNames());
                        }
                        if ((_c = pong.partner) === null || _c === void 0 ? void 0 : _c.socketId) {
                            (_d = io.sockets.sockets.get(pong.partner.socketId)) === null || _d === void 0 ? void 0 : _d.emit('players', pong.getPlayerNames());
                        }
                    }
                }
            }
            else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
                pong = games.nwePong(player);
                socket.emit('pong launched', msg.cmd);
            }
        }
        if (msg.paddle_y == 0 && msg.cmd != GameCmd.MOUSE && msg.cmd != GameCmd.NOCMD) {
            gebugPprinting(player === null || player === void 0 ? void 0 : player.name, GameCommand[msg.cmd] + ' controls');
        }
    });
    socket.on('partner choosed', (socket_id) => {
        const partner = games.getPlayer(socket.id);
        if (partner) {
            const choosedOwner = games.getPlayer(socket_id);
            if (choosedOwner) {
                const choosedOwnerSocket = io.sockets.sockets.get(socket_id);
                if (choosedOwnerSocket) {
                    setTimeout(function () {
                        choosedOwnerSocket === null || choosedOwnerSocket === void 0 ? void 0 : choosedOwnerSocket.emit('confirm partner', [socket.id, partner.name]);
                    }, ControlOptions.game_startTime);
                    return;
                }
            }
        }
        socket.emit('partner unavailable');
    });
    socket.on('partner confirmation', (socket_id) => {
        var _a, _b;
        const partner = games.setPartner(socket.id, socket_id);
        const pong = games.getPong(socket.id);
        if (partner && pong) {
            (_a = io.sockets.sockets.get(partner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('pong launched');
        }
        else {
            socket.emit('partner unavailable');
            (_b = io.sockets.sockets.get(socket_id)) === null || _b === void 0 ? void 0 : _b.emit('partner unavailable');
        }
    });
    socket.on('refusal', (socket_id) => {
        var _a;
        if (games.getPlayer(socket.id)) {
            (_a = io.sockets.sockets.get(socket_id)) === null || _a === void 0 ? void 0 : _a.emit('partner unavailable');
        }
    });
    socket.on('start partner game', () => {
        let opposer = games.getOpposer(socket.id);
        if (opposer) {
            let opposerSocket = io.sockets.sockets.get(opposer);
            if (opposerSocket) {
                setTimeout(function () {
                    opposerSocket === null || opposerSocket === void 0 ? void 0 : opposerSocket.emit('start partner game');
                }, ControlOptions.game_startTime);
            }
        }
    });
    socket.on('partner refused', () => {
        let opposer = games.getOpposer(socket.id);
        if (opposer) {
            let opposerSocket = io.sockets.sockets.get(opposer);
            if (opposerSocket) {
                setTimeout(function () {
                    opposerSocket === null || opposerSocket === void 0 ? void 0 : opposerSocket.emit('partner refused');
                }, ControlOptions.game_startTime);
            }
        }
    });
});
// Calculation loop
setInterval(function () {
    var _a, _b, _c, _d, _e, _f;
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
                (_a = io.sockets.sockets.get(pong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('state', pong.getPongState(pong.owner.side));
                if (pong.partnerGameOn) {
                    (_b = io.sockets.sockets.get(pong.owner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('partner game on');
                    pong.partnerGameOn = false;
                }
                if (pong.partnerGameOff) {
                    (_c = io.sockets.sockets.get(pong.owner.socketId)) === null || _c === void 0 ? void 0 : _c.emit('partner game off');
                    pong.partnerGameOff = false;
                }
            }
            if (pong.partner) {
                (_d = io.sockets.sockets.get(pong.partner.socketId)) === null || _d === void 0 ? void 0 : _d.emit('state', pong.getPongState(pong.partner.side));
                if (pong.partnerGameOn) {
                    (_e = io.sockets.sockets.get(pong.partner.socketId)) === null || _e === void 0 ? void 0 : _e.emit('partner game on');
                    pong.partnerGameOn = false;
                }
                if (pong.partnerGameOff) {
                    (_f = io.sockets.sockets.get(pong.partner.socketId)) === null || _f === void 0 ? void 0 : _f.emit('partner game off');
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
function tokenRequest() {
    return __awaiter(this, void 0, void 0, function* () {
        const pongAuth = {
            email: process.env.PONG_EMAIL,
            username: process.env.PONG_NAME,
            password: process.env.PONG_PASS,
        };
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const request = new Request(`http://${process.env.BACK_HOST}:${process.env.BACK_PORT}/auth/login`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(pongAuth),
        });
        try {
            access_token = yield (yield fetch(request)).json();
        }
        catch (e) {
            if (access_token) {
                console.log('cannot get new token');
            }
        }
        if (access_token) {
            gebugPprinting('access_token: ', access_token.access_token);
        }
    });
}
if (access_token) {
    setInterval(tokenRequest, Pong.tokenRequest_period);
}
// Send game results loop
setInterval(function () {
    return __awaiter(this, void 0, void 0, function* () {
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
        }
        else {
            yield tokenRequest();
        }
    });
}, Pong.sendResult_period);
