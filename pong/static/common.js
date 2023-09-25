import { Options } from './options.js';
export var GameMode;
(function (GameMode) {
    GameMode[GameMode["WAITING"] = 0] = "WAITING";
    GameMode[GameMode["PARTNER_GAME"] = 1] = "PARTNER_GAME";
    GameMode[GameMode["TRNNG_GAME"] = 2] = "TRNNG_GAME";
    GameMode[GameMode["AUTO_GAME"] = 3] = "AUTO_GAME";
    GameMode[GameMode["STOPPING"] = 4] = "STOPPING";
})(GameMode || (GameMode = {}));
export var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["INACTIVE"] = 0] = "INACTIVE";
    GameStatus[GameStatus["PLAYING"] = 1] = "PLAYING";
    GameStatus[GameStatus["PAUSED"] = 2] = "PAUSED";
})(GameStatus || (GameStatus = {}));
export var GameCmd;
(function (GameCmd) {
    GameCmd[GameCmd["NOCMD"] = 0] = "NOCMD";
    GameCmd[GameCmd["MOUSE"] = 1] = "MOUSE";
    GameCmd[GameCmd["NEW"] = 2] = "NEW";
    GameCmd[GameCmd["STOP"] = 3] = "STOP";
    GameCmd[GameCmd["PAUSE"] = 4] = "PAUSE";
    GameCmd[GameCmd["TRNNG"] = 5] = "TRNNG";
    GameCmd[GameCmd["AUTO"] = 6] = "AUTO";
})(GameCmd || (GameCmd = {}));
export const GameCommand = [
    'NOCMD',
    'MOUSE',
    'NEW',
    'STOP',
    'PAUSE',
    'TRNNG',
    'AUTO',
];
export var GameScheme;
(function (GameScheme) {
    GameScheme[GameScheme["GENERAL"] = 0] = "GENERAL";
    GameScheme[GameScheme["REVERSE"] = 1] = "REVERSE";
})(GameScheme || (GameScheme = {}));
export function getGameCmd(command) {
    let cmd = 1;
    while (GameCommand[cmd]) {
        if (command == GameCommand[cmd]) {
            return cmd;
        }
        cmd++;
    }
    return 0;
}
export var Objects;
(function (Objects) {
    Objects[Objects["OUTSIDE"] = 0] = "OUTSIDE";
    Objects[Objects["LEFT_FIELD"] = 1] = "LEFT_FIELD";
    Objects[Objects["RIGHT_FIELD"] = 2] = "RIGHT_FIELD";
    Objects[Objects["LEFT_RACKET"] = 3] = "LEFT_RACKET";
    Objects[Objects["RIGHT_RACKET"] = 4] = "RIGHT_RACKET";
})(Objects || (Objects = {}));
export var Side;
(function (Side) {
    Side[Side["NO"] = 0] = "NO";
    Side[Side["BOTTOM"] = 1] = "BOTTOM";
    Side[Side["TOP"] = 2] = "TOP";
    Side[Side["RIGHT"] = 3] = "RIGHT";
    Side[Side["LEFT"] = 4] = "LEFT";
})(Side || (Side = {}));
export var Sound;
(function (Sound) {
    Sound[Sound["HUSH"] = 0] = "HUSH";
    Sound[Sound["GAME_START"] = 1] = "GAME_START";
    Sound[Sound["BALL_TOP"] = 2] = "BALL_TOP";
    Sound[Sound["BALL_BOTTOM"] = 3] = "BALL_BOTTOM";
    Sound[Sound["BALL_LOSS_LEFT"] = 4] = "BALL_LOSS_LEFT";
    Sound[Sound["BALL_LOSS_RIGHT"] = 5] = "BALL_LOSS_RIGHT";
    Sound[Sound["BALL_LEFT"] = 6] = "BALL_LEFT";
    Sound[Sound["BALL_RIGHT"] = 7] = "BALL_RIGHT";
    Sound[Sound["SIREN_LEFT"] = 8] = "SIREN_LEFT";
    Sound[Sound["SIREN_RIGHT"] = 9] = "SIREN_RIGHT";
    Sound[Sound["DEADLOCK"] = 10] = "DEADLOCK";
    Sound[Sound["SERVE"] = 11] = "SERVE";
    Sound[Sound["SPEEDUP"] = 12] = "SPEEDUP";
    Sound[Sound["APPLAUSE"] = 13] = "APPLAUSE";
})(Sound || (Sound = {}));
export const PONG_INFINITY = 9999;
export class BrowserMsg {
    constructor() {
        this.cmd = GameCmd.NOCMD;
        this.paddle_y = 0;
    }
    clear() {
        this.cmd = GameCmd.NOCMD;
        this.paddle_y = 0;
    }
}
export class ServerMsg {
    constructor() {
        this.ballCenter_x = PONG_INFINITY;
        this.ballCenter_y = PONG_INFINITY;
        this.paddleSide = Side.RIGHT;
        this.leftPaddle_y = Options.paddleStart_yPos;
        this.rightPaddle_y = Options.paddleStart_yPos;
        this.leftScore = 0;
        this.rightScore = 0;
        this.mode = GameMode.WAITING;
        this.status = GameStatus.INACTIVE;
        this.sound = Sound.HUSH;
    }
    copy(state) {
        this.ballCenter_x = state.ballCenter_x;
        this.ballCenter_y = state.ballCenter_y;
        this.paddleSide = state.paddleSide;
        this.leftPaddle_y = state.leftPaddle_y;
        this.rightPaddle_y = state.rightPaddle_y;
        this.leftScore = state.leftScore;
        this.rightScore = state.rightScore;
        this.mode = state.mode;
        this.status = state.status;
        this.sound = state.sound;
    }
}
