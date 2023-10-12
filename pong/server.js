var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config } from "dotenv";
config();
import http from 'http';
import * as socketIO from 'socket.io';
import express from 'express';
import { GameCmd, GameCommand, GameMode, GameStatus } from './static/common.js';
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
let socketToBackend;
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
            (_a = io.sockets.sockets.get(playersDeletedPong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit("pong deleted");
            gebugPprinting(playersDeletedPong.owner.name, "pong deleted");
        }
        if (playersDeletedPong.partner) {
            (_b = io.sockets.sockets.get(playersDeletedPong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit("pong deleted");
        }
    }
}
routes(app, port);
if (port) {
    server.listen(port, () => {
        console.log("Server starts on port", port);
    });
}
else {
    console.log("port is not assigned");
    process.exit(1);
}
io.on("connection", (socket) => {
    socket.on("new player", (user) => {
        const player = games.newPlayer(socket.id, user);
        if (player) {
            socket.emit("player created", user === null || user === void 0 ? void 0 : user.scheme);
            const pong = games.getPong(socket.id);
            if (pong) {
                socket.emit("player created");
                pong.status = GameStatus.PLAYING;
                socket.emit("pong restored");
            }
        }
        else {
            socket.emit("player not created");
        }
        gebugPprinting(player === null || player === void 0 ? void 0 : player.name, player ? "new player" : "new player not created");
    });
    socket.on("disconnect", (reason) => {
        var _a, _b;
        const player = games.deletePlayer(socket.id);
        if (player) {
            const pong = games.getPong(socket.id);
            if (pong && pong.mode == GameMode.PARTNER_GAME && pong.status == GameStatus.PAUSED) {
                if (pong.owner) {
                    (_a = io.sockets.sockets.get(pong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('partner disconnected');
                }
                if (pong.partner) {
                    (_b = io.sockets.sockets.get(pong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('partner disconnected');
                }
            }
        }
        gebugPprinting(player === null || player === void 0 ? void 0 : player.name, reason);
    });
    socket.on("get partners list", () => {
        var _a;
        const partnersList = games.getPartnersList(socket.id);
        socket.emit("partners list", partnersList);
        gebugPprinting(((_a = games.getPlayer(socket.id)) === null || _a === void 0 ? void 0 : _a.name) + " partnersList: ", partnersList);
    });
    socket.on("controls", (msg) => {
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
                            (_b = io.sockets.sockets.get(pong.owner.socketId)) === null || _b === void 0 ? void 0 : _b.emit("players", pong.getPlayerNames());
                        }
                        if ((_c = pong.partner) === null || _c === void 0 ? void 0 : _c.socketId) {
                            (_d = io.sockets.sockets.get(pong.partner.socketId)) === null || _d === void 0 ? void 0 : _d.emit("players", pong.getPlayerNames());
                        }
                    }
                }
            }
            else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
                pong = games.nwePong(player);
                socket.emit("pong launched", msg.cmd);
            }
        }
        if (msg.paddle_y == 0 && msg.cmd != GameCmd.MOUSE && msg.cmd != GameCmd.NOCMD) {
            gebugPprinting(player === null || player === void 0 ? void 0 : player.name, GameCommand[msg.cmd] + " controls");
        }
    });
    socket.on("partner choosed", (socket_id) => {
        const player = games.getPlayer(socket.id);
        gebugPprinting(player === null || player === void 0 ? void 0 : player.name, "choosing partner");
        if (player) {
            const choosedOwner = games.getPlayer(socket_id);
            if (choosedOwner) {
                const choosedOwnerSocket = io.sockets.sockets.get(socket_id);
                if (choosedOwnerSocket) {
                    setTimeout(function () {
                        choosedOwnerSocket === null || choosedOwnerSocket === void 0 ? void 0 : choosedOwnerSocket.emit("confirm partner", [socket.id, player.name]);
                    }, ControlOptions.game_startTime);
                    return;
                }
            }
        }
        socket.emit("partner unavailable");
    });
    socket.on('invite partner', (user_id) => {
        var _a;
        const inviter = games.getPlayer(socket.id);
        if (inviter) {
            // const user = {
            // 	name: inviter.name,
            // 	id: inviter.id,
            // 	side: inviter.side,
            // 	scheme: inviter.scheme,
            // };
            // inviter = games.newPlayer(socket.id, user);
            // if (inviter) {
            // socket.emit("player created", inviter.scheme);
            const pong = games.getPong(socket.id);
            if (pong && pong.owner) {
                games.deletePong(pong.owner.socketId);
            }
            const invited = games.getPlayerById(user_id);
            if (invited) {
                console.log(games.getPlayers());
                const invitedSocket = io.sockets.sockets.get(invited.socketId);
                if (invitedSocket) {
                    (_a = io.sockets.sockets.get(invited.socketId)) === null || _a === void 0 ? void 0 : _a.emit('confirm partner', [socket.id, inviter.name]);
                    return;
                }
            }
            // }
        }
        socket.emit('partner unavailable');
    });
    socket.on('partner confirmation', (socket_id) => {
        var _a, _b;
        const player = games.getPlayer(socket.id);
        if (player) {
            let pong = games.getPong(socket.id);
            if (!pong) {
                pong = games.nwePong(player);
                socket.emit('pong launched');
            }
            const partner = games.setPartner(socket.id, socket_id);
            if (partner && pong) {
                (_a = io.sockets.sockets.get(partner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('pong launched');
                return;
            }
        }
        socket.emit('partner unavailable');
        (_b = io.sockets.sockets.get(socket_id)) === null || _b === void 0 ? void 0 : _b.emit('partner unavailable');
    });
    socket.on("refusal", (socket_id) => {
        var _a;
        if (games.getPlayer(socket.id)) {
            (_a = io.sockets.sockets.get(socket_id)) === null || _a === void 0 ? void 0 : _a.emit("partner unavailable");
        }
    });
    socket.on('start partner game', () => {
        let opposerSocketId = games.getOpposerSocketId(socket.id);
        if (opposerSocketId) {
            let opposerSocket = io.sockets.sockets.get(opposerSocketId);
            if (opposerSocket) {
                setTimeout(function () {
                    opposerSocket === null || opposerSocket === void 0 ? void 0 : opposerSocket.emit("start partner game");
                }, ControlOptions.game_startTime);
            }
        }
    });
    socket.on('partner refused', () => {
        let opposerSocketId = games.getOpposerSocketId(socket.id);
        if (opposerSocketId) {
            let opposerSocket = io.sockets.sockets.get(opposerSocketId);
            if (opposerSocket) {
                setTimeout(function () {
                    opposerSocket === null || opposerSocket === void 0 ? void 0 : opposerSocket.emit("partner refused");
                }, ControlOptions.game_startTime);
            }
        }
    });
});
// Calculation loop
setInterval(function () {
    var _a, _b;
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
            if (pong.owner) {
                (_a = io.sockets.sockets.get(pong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit("state", pong.getPongState(pong.owner.side));
            }
            if (pong.partner) {
                (_b = io.sockets.sockets.get(pong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit("state", pong.getPongState(pong.partner.side));
            }
        }
    }
    if (pongSocketIdForDelete) {
        deletePongAndNotifyPlayers(pongSocketIdForDelete);
        pongSocketIdForDelete = undefined;
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
            gebugPprinting("cannot get new token, ", ``);
        }
        if (access_token) {
            gebugPprinting("access_token: ", access_token.jwtAccess);
        }
    });
}
if (access_token) {
    setInterval(tokenRequest, Pong.tokenRequest_period);
}
// Send game results and disconnect timeout players loop
setInterval(function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (access_token) {
            if (games.isResultInQueue()) {
                if (!socketToBackend || !(socketToBackend === null || socketToBackend === void 0 ? void 0 : socketToBackend.connected)) {
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
                    socketToBackend = ioc(`ws://${process.env.BACK_HOST}:${process.env.BACK_PORT}`, sockOpt);
                }
                if (socketToBackend.connected) {
                    const result = games.getNextResultFromQueue();
                    socketToBackend.emit('save game', result === null || result === void 0 ? void 0 : result.get());
                    gebugPprinting('game start or result sended', '');
                }
                else {
                    gebugPprinting('game start or result NOT sended', '');
                }
            }
        }
        else {
            yield tokenRequest();
        }
        const playerSocketId = games.getNextPlayerForDeleteFromQueue();
        if (playerSocketId) {
            const player = games.deletePlayer(playerSocketId);
            gebugPprinting(player === null || player === void 0 ? void 0 : player.name, 'disconnect timeout, deleted');
        }
    });
}, Pong.sendResult_period);
