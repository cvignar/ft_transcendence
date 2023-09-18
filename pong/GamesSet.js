import { Pong } from './Pong.js';
import { deletePongAndNotifyPlayers } from './server.js';
import { GameCmd, GameMode, Side } from './static/common.js';
export class Player {
    constructor(socketId, user) {
        this.socketId = socketId;
        this.name = user.name;
        this.id = user.id;
        this.side = Side.RIGHT;
    }
}
export class GamesSet {
    constructor() {
        this.players = new Map;
        this.pongs = new Map;
        this.pongsIdx = new Map;
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
        if (user && user.name) {
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
                this.pongs.set(partner.socketId, pong);
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
    controls(socketId, msg) {
        const player = this.getPlayer(socketId);
        if (player) {
            let pong = this.getPong(player.socketId);
            if (pong) {
                pong.setControls(msg, player.side);
                if (msg.cmd == GameCmd.NEW || msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
                    return pong.getPlayerNames();
                }
            }
            else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
                pong = this.nwePong(player);
                pong.setControls(msg, player.side);
                return pong.getPlayerNames();
            }
        }
        return undefined;
    }
}
