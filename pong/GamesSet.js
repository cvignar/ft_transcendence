import { Pong } from './Pong.js';
import { deletePongAndNotifyPlayers } from './server.js';
import { GameMode, GameScheme, GameStatus } from './static/common.js';
import { Options, PongOptions } from './static/options.js';
export class Player {
    constructor(socketId, user) {
        this.id = 0;
        this.side = 0;
        this.scheme = GameScheme.GENERAL;
        this.disconnectTime = 0;
        this.timeOutOf = false;
        this.socketId = socketId;
        this.name = user.name;
        this.id = user.id;
        this.side = user.side;
        this.scheme = user.scheme;
        this.disconnectTime = 0;
        this.timeOutOf = false;
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
                if (this.player1 > 0 || this.player2 > 0) {
                    this.score1 = pong.leftScore;
                    this.score2 = pong.rightScore;
                    this.startTime = pong.gameStartTime;
                    this.endTime = pong.gameEndTime;
                    this.duration = pong.gameEndTime - pong.gameStartTime;
                    this.duration = this.duration > 0 ? this.duration : 0;
                    this.isActual = true;
                }
            }
        }
    }
    makeRestoredKey(userId) {
        this.player1 = userId;
        this.player2 = -1;
        this.score1 = 0;
        this.score2 = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.duration = 0;
        this.isActual = true;
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
        this.deletePlayerQueue = new Array();
    }
    getPongs() {
        return this.pongs;
    }
    getPlayers() {
        return this.players;
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
    setResult(result) {
        this.resultQueue.push(result);
    }
    getPlayerById(userId) {
        const duplicates = new Array;
        for (const socketId of this.players.keys()) {
            const player = this.getPlayer(socketId);
            if (player && player.id == userId) {
                duplicates.push(player);
            }
        }
        while (duplicates.length > 1) {
            const player = duplicates.shift();
            if (player) {
                const result = this.deletePlayer(player.socketId);
                if (result === null) {
                    duplicates.push(player);
                }
            }
        }
        if (duplicates.length === 1) {
            return duplicates.shift();
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
        if (user && user.name && user.side && user.scheme) {
            if (this.players.has(socketId)) {
                this.deletePlayer(socketId);
            }
            let player = this.getPlayerById(user.id);
            if (player && player.id > 0) {
                if (player) {
                    const pong = this.getPong(player.socketId);
                    if (pong) {
                        if (pong.mode == GameMode.PARTNER_GAME && pong.status == GameStatus.PAUSED) {
                            player.disconnectTime = 0;
                            player.timeOutOf = false;
                            const priorSocketId = player.socketId;
                            this.renewPlayerSocketId(priorSocketId, socketId);
                            return player;
                        }
                        else {
                            this.deletePlayer(player.socketId);
                        }
                    }
                }
            }
            player = new Player(socketId, user);
            this.players.set(socketId, player);
            return player;
        }
        return undefined;
    }
    deletePlayer(socketId) {
        const player = this.players.get(socketId);
        if (player) {
            const pong = this.getPong(socketId);
            if (pong) {
                // Partner game is interrupted
                if (pong.mode == GameMode.PARTNER_GAME &&
                    pong.leftScore < Options.maxWins &&
                    pong.rightScore < Options.maxWins) {
                    // The player just disconnected
                    if (player.disconnectTime == 0) {
                        player.disconnectTime = Date.now();
                        pong.status = GameStatus.PAUSED;
                        return null;
                    }
                    // Generating the signal that the partner game is interrupted
                    pong.leftScore = Options.maxWins;
                    pong.rightScore = Options.maxWins;
                    pong.gameResult.set(pong);
                }
                pong.mode = GameMode.STOPPING;
            }
            this.players.delete(socketId);
        }
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
            if (pong && pong.atGameStart) {
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
        }
        return undefined;
    }
    checkResult(pong) {
        if (pong.gameResult.getIsActual()) {
            this.resultQueue.push(pong.gameResult);
            pong.gameResult.setIsActual(false);
        }
    }
    getNextResultFromQueue() {
        if (this.resultQueue.length) {
            return this.resultQueue.shift();
        }
        return undefined;
    }
    isResultInQueue() {
        if (this.resultQueue.length) {
            return true;
        }
        return false;
    }
    checkPlayerForDelete(pong) {
        if (pong.owner &&
            pong.owner.disconnectTime != 0 &&
            pong.owner.timeOutOf == false &&
            Date.now() - pong.owner.disconnectTime > PongOptions.playerDisconnect_timeout) {
            this.deletePlayerQueue.push(pong.owner.socketId);
            pong.owner.timeOutOf = true;
        }
        if (pong.partner &&
            pong.partner.disconnectTime != 0 &&
            pong.partner.timeOutOf == false &&
            Date.now() - pong.partner.disconnectTime > PongOptions.playerDisconnect_timeout) {
            this.deletePlayerQueue.push(pong.partner.socketId);
            pong.partner.timeOutOf = true;
        }
    }
    getNextPlayerForDeleteFromQueue() {
        if (this.deletePlayerQueue.length) {
            return this.deletePlayerQueue.shift();
        }
        return undefined;
    }
    isPlayerForDeleteInQueue() {
        if (this.deletePlayerQueue.length) {
            return true;
        }
        return false;
    }
    renewPlayerSocketId(prior, renewed) {
        const player = this.players.get(prior);
        if (player) {
            this.players.delete(prior);
            this.players.set(renewed, player);
            player.socketId = renewed;
        }
        let pong = this.pongs.get(prior);
        if (pong) {
            this.pongs.delete(prior);
            this.pongs.set(renewed, pong);
        }
        pong = this.pongsIdx.get(prior);
        if (pong) {
            this.pongsIdx.delete(prior);
            this.pongsIdx.set(renewed, pong);
        }
    }
}
