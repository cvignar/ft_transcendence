// Dependencies
import * as url from 'url';
import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from './node_modules/socket.io/dist/index.js';
import { GameCommand, GameCmd, Side, Player, BrowserMsg } from './static/common.js';
import { Options } from './static/options.js';
import { Pong } from './pong.js';
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export class Partners {
    constructor() {
        this.partner = {};
        this.partnersList = new Array;
    }
    getPartnersList(pongs, excludingId) {
        for (let socketId of pongs.keys()) {
            if (socketId != excludingId &&
                (pongs.get(socketId).leftPlayer == '' || pongs.get(socketId).rightPlayer == '')) {
                this.partner = { socket_id: socketId, nick_name: pongs.get(socketId).owner };
                this.partnersList.push(this.partner);
            }
        }
        return this.partnersList;
    }
}
let nickname = '';
let players = new Map();
let pongs = new Map();
app.set('port', 5000);
app.use('/', express.static(__dirname + '/html'));
app.use('/static', express.static(__dirname + '/static'));
app.use('/sounds', express.static(__dirname + '/sounds'));
// Routes
app.get('/', function (request, response) {
    response.header('Content-Type: text/html');
    response.sendFile(path.join(__dirname, '/html/index.html'));
});
app.get('/game', function (request, response) {
    nickname = request.query.nickname;
    response.header('Content-Type: text/html');
    response.sendFile(path.join(__dirname, '/html/game.html'));
});
app.get('/socket.io.js', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/node_modules/socket.io/client-dist/socket.io.js'));
});
app.get('/socket.io.js.map', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/node_modules/socket.io/client-dist/socket.io.js.map'));
});
app.get('/game.js', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/static/game.js'));
});
app.get('/controls.js', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/static/controls.js'));
});
app.get('/image.js', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/static/image.js'));
});
app.get('/options.js', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/static/options.js'));
});
app.get('/common.js', function (request, response) {
    response.header('Content-Type: text/javascript');
    response.sendFile(path.join(__dirname, '/static/common.js'));
});
// Server start
server.listen(5000, function () {
    console.log('Server starts on port', Options.port);
});
// On connection
io.on('connection', function (socket) {
    socket.on('get partners list', function () {
        if (!players.has(socket.id)) {
            return;
        }
        const partners = new Partners;
        const partnersList = partners.getPartnersList(pongs, socket.id);
        socket.emit('partners list', partnersList);
        if (Options.debug)
            console.log(partnersList);
    });
    socket.on('disconnect', function (reason) {
        var _a;
        const playerNickname = (_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname;
        if (players.delete(socket.id) && Options.debug) {
            console.log(playerNickname, reason);
        }
        const pong = pongs.get(socket.id);
        if (pong) {
            let msg = new BrowserMsg;
            msg.cmd = GameCmd.STOP;
            pong.setControls(msg, undefined);
            pongs.delete(socket.id);
        }
    });
    socket.on('new player', function (nick_name) {
        var _a;
        if (!(!nickname && !nick_name)) {
            if (!nickname) {
                nickname = nick_name;
            }
            players.set(socket.id, new Player(nickname, Side.RIGHT));
            socket.emit('player created', nickname);
            if (Options.debug)
                console.log((_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname, 'new player');
            nickname = '';
        }
        else {
            socket.emit('player not crated');
            nickname = '';
        }
    });
    socket.on('controls', function (msg) {
        const player = players.get(socket.id);
        if (Options.debug && msg.paddle_y == 0 && msg.cmd != GameCmd.MOUSE) {
            console.log(player === null || player === void 0 ? void 0 : player.nickname, GameCommand[msg.cmd], 'controls');
        }
        if (!player) {
            return;
        }
        let pong = pongs.get(socket.id);
        if (pong) {
            if (msg.cmd == GameCmd.STOP) {
                pong.setControls(msg, player.side);
                pongs.delete(socket.id);
                socket.emit('pong deleted');
            }
            else if (msg.cmd == GameCmd.NEW && (!pong.leftPlayer || !pong.rightPlayer)) {
                return;
            }
            else {
                pong.setControls(msg, player.side);
                socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
            }
        }
        else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
            pong = new Pong;
            player.side = Side.RIGHT;
            pong.setOwner(player);
            socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
            pongs.set(socket.id, pong);
            socket.emit('pong launched');
        }
    });
    socket.on('state', function () {
        const player = players.get(socket.id);
        const pong = pongs.get(socket.id);
        if (player && pong) {
            socket.emit('state', pong.getPongState(player.side));
        }
    });
    socket.on('partner choosed', function (socket_id) {
        var _a;
        if (!players.has(socket.id)) {
            return;
        }
        const partnerSocket = io.sockets.sockets.get(socket_id);
        if (partnerSocket && players.has(partnerSocket.id)) {
            partnerSocket.emit('confipm partner', [socket.id, (_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname]);
        }
        else {
            socket.emit('partner unavailable');
        }
    });
    socket.on('partner confirmation', function (socket_id) {
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
            pongs.set(partnerSocket.id, pong);
            partnerSocket.emit('pong launched');
        }
        else {
            partnerSocket.emit('partner unavailable');
        }
    });
    socket.on('refusal', function (socket_id) {
        if (!players.has(socket.id)) {
            return;
        }
        const partnerSocket = io.sockets.sockets.get(socket_id);
        if (partnerSocket) {
            partnerSocket.emit('partner unavailable');
        }
    });
});
// Calculation loop
setInterval(function () {
    var _a;
    for (const socketId of pongs.keys()) {
        (_a = pongs.get(socketId)) === null || _a === void 0 ? void 0 : _a.calculate();
    }
}, Pong.calculation_period);
