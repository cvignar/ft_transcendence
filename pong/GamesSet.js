import { Pong } from './Pong.js';
import { deletePongAndNotifyPlayers } from './server.js';
import { GameMode } from './static/common.js';
export class Player {
    constructor(socketId, user) {
        this.id = 0;
        this.side = 0;
        this.socketId = socketId;
        this.name = user.name;
        this.id = user.id;
        this.side = user.side;
    }
}
export class Result {
    constructor() {
        this.player1 = undefined;
        this.player2 = undefined;
        this.score1 = 0;
        this.score2 = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.duration = 0;
        this.isActual = false;
    }
    setIsActual(isActual) {
        this.isActual = isActual;
    }
    getIsActual() {
        return this.isActual;
    }
    set(pong) {
        var _a, _b;
        if (pong.mode == GameMode.PARTNER_GAME) {
            this.player1 = (_a = pong.getLeftPlayer()) === null || _a === void 0 ? void 0 : _a.id;
            this.player2 = (_b = pong.getRightPlayer()) === null || _b === void 0 ? void 0 : _b.id;
            if (this.player1 && this.player2) {
                if (this.player1 > 0 && this.player2 > 0) {
                    this.score1 = pong.leftScore;
                    this.score2 = pong.rightScore;
                    this.startTime = pong.gameStartTime;
                    this.endTime = pong.gameEndTime;
                    this.duration = pong.gameEndTime - pong.gameStartTime;
                    this.isActual = true;
                }
            }
        }
    }
    get() {
        return {
            player1: this.player1,
            player2: this.player2,
            score1: this.score1,
            score2: this.score2,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration
        };
    }
}
export class GamesSet {
    constructor() {
        this.players = new Map;
        this.pongs = new Map;
        this.pongsIdx = new Map;
        this.resultQueue = new Array();
    }
    getPongs() {
        return this.pongs;
    }
    size() {
        return this.pongs.size;
    }
    playersSize() {
        return this.players.size;
    }
    getPlayer(socketId) {
        const player = this.players.get(socketId);
        if (player) {
            return player;
        }
        return undefined;
    }
    getPlayerById(userId) {
        for (const socketId of this.players.keys()) {
            const player = this.getPlayer(socketId);
            if (player && player.id == userId) {
                return player;
            }
        }
        return undefined;
    }
    getPong(socketId) {
        let pong = this.pongs.get(socketId);
        if (pong) {
            return pong;
        }
        else {
            pong = this.pongsIdx.get(socketId);
            if (pong) {
                return pong;
            }
        }
        return undefined;
    }
    newPlayer(socketId, user) {
        if (user && user.name && user.side) {
            if (this.players.has(socketId)) {
                this.deletePlayer(socketId);
            }
            const player = new Player(socketId, user);
            this.players.set(socketId, player);
            return player;
        }
        return undefined;
    }
    deletePlayer(socketId) {
        const pong = this.getPong(socketId);
        if (pong) {
            pong.mode = GameMode.STOPPING;
        }
        const player = this.players.get(socketId);
        this.players.delete(socketId);
        return player;
    }
    nwePong(owner) {
        const pong = new Pong;
        pong.owner = owner;
        this.pongs.set(owner.socketId, pong);
        return pong;
    }
    deletePong(socketId) {
        let players = undefined;
        const pong = this.getPong(socketId);
        if (pong) {
            players = { owner: pong.owner, partner: pong.partner };
            if (players.owner) {
                this.pongs.delete(players.owner.socketId);
            }
            if (players.partner) {
                this.pongsIdx.delete(players.partner.socketId);
            }
        }
        return players;
    }
    setPartner(pongSocketId, partnerSocketId) {
        const partner = this.getPlayer(partnerSocketId);
        if (partner) {
            const pong = this.getPong(pongSocketId);
            if (pong) {
                const partnerPong = this.getPong(partnerSocketId);
                if (partnerPong) {
                    deletePongAndNotifyPlayers(partner.socketId);
                }
                pong.setPartner(partner);
                this.pongsIdx.set(partner.socketId, pong);
                return partner;
            }
        }
        return undefined;
    }
    getPartnersList(excludeId) {
        let partnersList = new Array;
        if (this.players.has(excludeId)) {
            for (const socketId of this.pongs.keys()) {
                if (socketId != excludeId) {
                    const pong = this.pongs.get(socketId);
                    if (pong && !pong.partner && pong.owner) {
                        const partner = { socket_id: socketId, nick_name: pong.owner.name };
                        partnersList.push(partner);
                    }
                }
            }
        }
        return partnersList;
    }
    getOpposerSocketId(socketId) {
        let player = this.getPlayer(socketId);
        if (player) {
            let pong = this.getPong(socketId);
            if (pong && pong.partner && pong.partner == player) {
                if (pong.owner) {
                    return pong.owner.socketId;
                }
            }
            else if (pong && pong.owner && pong.owner == player) {
                if (pong.partner) {
                    return pong.partner.socketId;
                }
            }
        }
        return undefined;
    }
    checkResult(pong) {
        if (pong.gameResult.getIsActual()) {
            this.resultQueue.push(pong.gameResult);
            pong.gameResult.setIsActual(false);
        }
    }
    getNextResult() {
        if (this.resultQueue.length) {
            return this.resultQueue.shift();
        }
        return undefined;
    }
}
