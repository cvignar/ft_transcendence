import { Options } from './options.js';

export enum GameMode {
	WAITING,
	PARTNER_GAME,
	TRNNG_GAME,
	AUTO_GAME,
	STOPPING,
}

export enum GameStatus {
	INACTIVE,
	PLAYING,
	PAUSED,
}

export enum GameCmd {
	NOCMD,
	MOUSE,
	NEW,
	STOP,
	PAUSE,
	TRNNG,
	AUTO,
}

export const GameCommand: string[] = [
	'NOCMD',
	'MOUSE',
	'NEW',
	'STOP',
	'PAUSE',
	'TRNNG',
	'AUTO',
];

export enum GameScheme {
	GENERAL=1,
	REVERSE=2,
}

export function getGameCmd(command: string): GameCmd {
	let cmd: GameCmd = 1;
	while (GameCommand[cmd]) {
		if (command == GameCommand[cmd]) {
			return cmd;
		}
		cmd++;
	}
	return 0;
}

export enum Objects {
	OUTSIDE,
	LEFT_FIELD,
	RIGHT_FIELD,
	LEFT_RACKET,
	RIGHT_RACKET,
}

export enum Side {
	NO,
	BOTTOM,
	TOP,
	RIGHT,
	LEFT,
}

export enum Sound {
	HUSH,
	GAME_START,
	BALL_TOP,
	BALL_BOTTOM,
	BALL_LOSS_LEFT,
	BALL_LOSS_RIGHT,
	BALL_LEFT,
	BALL_RIGHT,
	SIREN_LEFT,
	SIREN_RIGHT,
	DEADLOCK,
	SERVE,
	SPEEDUP,
	APPLAUSE,
}

export const PONG_INFINITY: number = 9999;

export class BrowserMsg {
	cmd: GameCmd = GameCmd.NOCMD;
	paddle_y: number = 0;
	constructor() {}
	clear() {
		this.cmd = GameCmd.NOCMD;
		this.paddle_y = 0;
	}
}

export class ServerMsg {
	ballCenter_x: number;
	ballCenter_y: number;
	paddleSide: Side;
	leftPaddle_y: number;
	rightPaddle_y: number;
	leftScore: number;
	rightScore: number;
	mode: GameMode;
	status: GameStatus;
	sound: Sound;
	constructor() {
		this.ballCenter_x = PONG_INFINITY;
		this.ballCenter_y = PONG_INFINITY;
		this.paddleSide = Side.RIGHT;
		this.leftPaddle_y = Options.paddleStart_yPos;
		this.rightPaddle_y = Options.paddleStart_yPos;
		this.leftScore = 0;
		this.rightScore = 0;
		this.mode  = GameMode.WAITING;
		this.status  = GameStatus.INACTIVE;
		this.sound = Sound.HUSH;
	}
	copy(state: ServerMsg) {
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