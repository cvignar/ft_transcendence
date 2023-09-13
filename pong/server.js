import http from 'http';
import socketIO from './node_modules/socket.io/dist/index.js';
import express from 'express';
import { Side } from './static/common.js';
import { Options } from './static/options.js';
import { Pong } from './pong.js';
import { UserData, routes } from './routes.js';
import * as pong_connect from './pong_connect.js';
const app = express();
const server = new http.Server(app);
const io = new socketIO.Server(server);
const userData = new UserData(app);
//app.use(cors({
//	origin: 'http://localhost:5000',
//	optionsSuccessStatus: 200
//}));
export let nickname = '';
let players = new Map();
let pongs = new Map();
routes(app);
server.listen(Options.port, () => {
    console.log('Server starts on port', Options.port);
});
io.on('connection', (socket) => {
    console.log("Hello!");
    socket.on('new player', (nick_name) => {
        pong_connect.newPlayer(socket, players, userData.getNickname(), nick_name);
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
setInterval(function () {
    var _a, _b;
    for (const socketId of pongs.keys()) {
        let pong = pongs.get(socketId);
        if (pong) {
            pong.calculate();
            (_a = io.sockets.sockets.get(socketId)) === null || _a === void 0 ? void 0 : _a.emit('state', pong.getPongState(pong.ownerSide));
            (_b = io.sockets.sockets.get(pong.partnerSocketId)) === null || _b === void 0 ? void 0 : _b.emit('state', pong.getPongState(pong.ownerSide == Side.LEFT ? Side.RIGHT : Side.LEFT));
        }
    }
}, Pong.calculation_period);
