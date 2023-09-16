import { Options } from './static/options.js';
import { Side, GameCmd, GameCommand, Player, Partners, GameMode } from './static/common.js';
import { Pong } from './Pong';
let players = new Map();
let pongs = new Map();
let pongsPartners = new Map(); // Index pongs by partners
export function findPong(player) {
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
export function deletePong(pongs, socketId, io) {
    var _a, _b;
    let pong = pongs.get(socketId);
    if (pong) {
        if (pong.owner) {
            (_a = io.sockets.sockets.get(pong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('pong deleted');
            if (Options.debug) {
                console.log(pong.owner.name, 'pong deleted');
            }
        }
        if (pong.partner) {
            (_b = io.sockets.sockets.get(pong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('pong deleted');
            if (Options.debug) {
                console.log(pong.partner.name, 'partner pong deleted');
            }
        }
        pongs.delete(socketId);
    }
}
export function newPlayer(socket, players, user) {
    var _a;
    if (user) {
        players.set(socket.id, new Player(socket.id, user));
        socket.emit('player created', user.name);
        if (Options.debug) {
            console.log((_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.name, 'new player');
        }
    }
    else {
        socket.emit('player not crated');
    }
}
export function disconnect(socket, players, pongs, reason) {
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
export function getPartnersList(socket, players, pongs) {
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
export function controls(socket, players, pongs, msg) {
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
    }
    else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
        pong = new Pong;
        player.side = Side.RIGHT;
        pong.setOwner(player);
        socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
        pongs.set(socket.id, pong);
        socket.emit('pong launched');
    }
}
export function state(socket, players, pongs) {
    const player = players.get(socket.id);
    const pong = pongs.get(socket.id);
    if (player && pong) {
        socket.emit('state', pong.getPongState(player.side));
    }
}
export function partnerChoosed(socket, io, players, socket_id) {
    var _a;
    if (!players.has(socket.id)) {
        return;
    }
    const partnerSocket = io.sockets.sockets.get(socket_id);
    if (partnerSocket && players.has(partnerSocket.id)) {
        partnerSocket.emit('confirm partner', [socket.id, (_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname]);
    }
    else {
        socket.emit('partner unavailable');
    }
}
export function partnerConfirmation(socket, io, players, pongs, socket_id) {
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
    }
    else {
        partnerSocket.emit('partner unavailable');
    }
}
export function refusal(socket, io, players, socket_id) {
    if (!players.has(socket.id)) {
        return;
    }
    const partnerSocket = io.sockets.sockets.get(socket_id);
    if (partnerSocket) {
        partnerSocket.emit('partner unavailable');
    }
}
export function calculatePongs() {
    var _a, _b;
    let socketIdForDelete = null;
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
                (_a = io.sockets.sockets.get(pong.owner.socketId)) === null || _a === void 0 ? void 0 : _a.emit('state', pong.getPongState(pong.owner.side));
            }
            if (pong.partner) {
                (_b = io.sockets.sockets.get(pong.partner.socketId)) === null || _b === void 0 ? void 0 : _b.emit('state', pong.getPongState(pong.partner.side));
            }
        }
    }
    if (socketIdForDelete) {
        pong_connect.deletePong(pongs, socketIdForDelete, io);
    }
}
