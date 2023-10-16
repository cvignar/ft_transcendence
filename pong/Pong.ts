import { Player, Result } from './GamesSet.js';
import { PongOptions } from './static/options.js';
import * as geometry from './static/geometry.js';
import {
	GameMode,
	GameStatus,
	GameCmd,
	Side,
	Sound,
	BrowserMsg,
	ServerMsg,
	PONG_INFINITY,
} from './static/common.js';

export class Ball extends geometry.Circle {
	visibility: boolean;
	constructor(x: number, y: number, r: number) {
		super(x, y, r);
		this.visibility = false;
	}
	move(pathStart: geometry.Vec, speed: geometry.Vec, dt: number) {
		this.center.x = pathStart.x + Math.round(speed.x * dt);
		this.center.y = pathStart.y + Math.round(speed.y * dt);
	}
}

export class Paddle extends geometry.Rectangle {
	visibility: boolean;
	y_: number;
	constructor(x: number, y: number, w: number, h: number) {
		super(x, y, w, h);
		this.visibility = true;
		this.y_ = 0;
	}
	set_dy0(dy: number) {
		if (this.v0.y + dy < 0 || this.v0.y + dy > Pong.paddle_yPosLimit)
			return;
		this.v0.y += dy;
		this.v1.y += dy;
	}
	set_y0(y: number) {
		if (y < 0 || y > Pong.paddle_yPosLimit)
			return;
		this.v0.y = y;
		this.v1.y = this.v0.y + Pong.paddle_height;
	}
	getZone(ballCenterY: number): number {
		let zone: number =
			(this.v0.y + Pong.paddle_height / 2 - ballCenterY) / Pong.paddle_zoneHeight;
		zone = zone < 0 ? Math.floor(-zone) : Math.floor(zone);
		return zone + 1;
	}
	speedometer(): number {
		let dy: number = this.v0.y - this.y_;
		this.y_ = this.v0.y;
		dy = dy < 0 ? -dy : dy;
		return dy / PongOptions.paddle_height + 1;
	}
}

export class Pong extends PongOptions {
	owner: Player | undefined = undefined;
	partner: Player | undefined = undefined;
	whatchers: Set<string> = new Set<string>;
	gameStartTime: number = 0;
	gameEndTime: number = 0;
	gameResult: Result = new Result;
	mode: GameMode = GameMode.WAITING;
	status: GameStatus = GameStatus.INACTIVE;
	leftScore: number = 0;
	rightScore: number = 0;
	clickCounter: number = 0;
	serveCounter: number = 0;
	newGame: boolean = true;
	atGameStart: boolean = false;
	gameIsOn: boolean = false;
	pathStartTime: number = Date.now();
	pathStart: geometry.Vec = new geometry.Vec(0, 0);
	ballSpeed: geometry.Vec = new geometry.Vec(0, 0);
	ballSpeedUp: number = 1.0;
	autoPaddle_dY: number = 0;
	saveClickCounter: number = 0;
	ballClicksForSpeedup: number = Pong.ball_StartClicksForSpeedup;
	state: ServerMsg = new ServerMsg;
	soundQueue: Sound[] = new Array();
	soundQueue_: Sound[] = new Array();
	fieldOfBallCenter: geometry.Rectangle = new geometry.Rectangle(
		Pong.fieldOfBallCenter_xPos,
		Pong.fieldOfBallCenter_yPos,
		Pong.fieldOfBallCenter_width,
		Pong.fieldOfBallCenter_heigth,
	);
	limitField: geometry.Rectangle = new geometry.Rectangle(
		Pong.limitField_xPos,
		Pong.limitField_yPos,
		Pong.limitField_width,
		Pong.limitField_heigth,
	);
	ball: Ball = new Ball(0, 0, Pong.ball_radius);
	leftPaddle: Paddle = new Paddle(
		Pong.leftPaddle_xPos,
		Pong.paddleStart_yPos,
		Pong.paddle_width,
		Pong.paddle_height,
	);
	rightPaddle: Paddle = new Paddle(
		Pong.rightPaddle_xPos,
		Pong.paddleStart_yPos,
		Pong.paddle_width,
		Pong.paddle_height,
	);
	PRNG(max: number): number {
		return Math.round(Math.random() * max);
	}
	servePreparation(serveExchange: boolean) {
		this.ball.center.x = Pong.ball_startXpos;
		this.ball.center.y = Math.round(
			Pong.ball_startYposMin + this.PRNG(Pong.ball_startYposMax),
		);
		this.ballSpeed.y = Math.round(
			Pong.ball_startSpeed / 2 - this.PRNG(Pong.ball_startSpeed),
		);
		this.ballSpeed.x = Math.round(
			Math.sqrt(
				Pong.ball_startSpeed * Pong.ball_startSpeed -
					this.ballSpeed.y * this.ballSpeed.y,
			),
		);
		this.ballSpeed.mult(this.ballSpeedUp);
		if (this.serveCounter == 0) {
			this.serveCounter = this.PRNG(2) ? Pong.serveNum : -Pong.serveNum;
		}
		if (serveExchange)
			this.serveCounter =
				this.serveCounter < 0 ? Pong.serveNum : -Pong.serveNum;
		if (this.serveCounter < 0) {
			this.ballSpeed.x *= -1;
			this.serveCounter =
				this.serveCounter == -1 ? Pong.serveNum : this.serveCounter + 1;
		} else if (this.serveCounter > 0) {
			this.serveCounter =
				this.serveCounter == 1 ? -Pong.serveNum : this.serveCounter - 1;
		}
	}
	gameAndSetPreparation() {
		if (this.newGame) {
			this.servePreparation(true);
			this.pathStartTime = Date.now();
			this.pathStart.copy(this.ball.center);
			this.ball.visibility = false;
			this.clickCounter = 0;
			this.leftScore = 0;
			this.rightScore = 0;
			this.atGameStart = true;
			this.newGame = false;
		} else if (!this.atGameStart) {
			if (this.limitField.pointInside(this.ball.center)) {
				this.ball.visibility = true;
				const dt: number = (Date.now() - this.pathStartTime) / 1000;
				this.ball.move(this.pathStart, this.ballSpeed, dt);
			} else {
				if (
					this.leftScore >= Pong.maxWins ||
					this.rightScore >= Pong.maxWins
				) {
					if (this.leftScore > Pong.maxWins) {
						this.leftScore = Pong.maxWins
					}
					if (this.rightScore > Pong.maxWins) {
						this.rightScore = Pong.maxWins
					}
					this.setSound(Sound.APPLAUSE);
					this.gameEndTime = Date.now();
					this.gameResult.set(this);
					this.ball.visibility = false;
					this.newGame = true;
					this.status = GameStatus.INACTIVE;
					this.gameIsOn = false;
				} else {
					this.servePreparation(false);
					this.setSound(Sound.SERVE);
					this.pathStartTime = Date.now();
					this.pathStart.copy(this.ball.center);
					this.status = GameStatus.PLAYING;
				}
			}
		}
	}
	isBallHit(paddle: Paddle): boolean {
		if (
			this.ball.center.y - Pong.ball_radius > paddle.v1.y ||
			this.ball.center.y + Pong.ball_radius < paddle.v0.y
		)
			return false;
		return true;
	}
	deadlocksFixing(): boolean {
		if (this.ballSpeed.y == 0) {
			this.ballSpeed.recalcAtConstLen_byX(
				Math.round(
					Math.abs(this.ballSpeed.x * 0.99) * 
					(1 - 2 * this.PRNG(2))
				)
			);
			if (Pong.debug) this.setSound(Sound.DEADLOCK);
			return true;
		}
		if (Math.abs(this.ballSpeed.x) < Math.abs(0.15 * this.ballSpeed.y)) {
			const signX: number = this.ballSpeed.x < 0 ? -1 : 1;
			this.ballSpeed.recalcAtConstLen_byX(
				Math.round(
					signX * Math.abs(this.ballSpeed.y * 0.3)
				)
			);
			if (Pong.debug) this.setSound(Sound.DEADLOCK);
			return true;
		}
		return false;
	}
	paddleHit(paddle: Paddle) {
		const zone = paddle.getZone(this.ball.center.y);
		if (zone == 1) {
			this.ballSpeed.x *= -1;
		} else if (zone == 2) {
			this.ballSpeed.recalcAtConstLen_byX(
				Math.round(
					-1.05 * this.ballSpeed.x * paddle.speedometer()
				)
			);
		} else if (zone == 3) {
			this.ballSpeed.recalcAtConstLen_byX(
				Math.round(
					-1.1 * this.ballSpeed.x * paddle.speedometer()
				)
			);
		} else {
			this.ballSpeed.recalcAtConstLen_byX(
				Math.round(
					-0.99 * this.ballSpeed.x * (2 - paddle.speedometer())
				)
			);
			this.ballSpeed.y *= -1;
		}
	}
	accelerator() {
		this.clickCounter++;
		if (
			!(this.clickCounter % this.ballClicksForSpeedup) &&
			this.ballSpeedUp <= Pong.ball_speedUpMax
		) {
			this.setSound(Sound.SPEEDUP); 
			this.ballSpeedUp *= Pong.ball_speedUp;
			this.ballClicksForSpeedup = Math.round(this.ballClicksForSpeedup * Pong.ball_speedUp);
			this.clickCounter = 0;
			this.ballSpeed.mult(Pong.ball_speedUp);
		}
	}
	autoGamer(paddle: Paddle) {
		if (this.saveClickCounter != this.clickCounter) {
			this.autoPaddle_dY = this.PRNG(Pong.paddle_height + 2);
			this.saveClickCounter = this.clickCounter;
		}
		if (
			(paddle.v0.x == Pong.leftPaddle_xPos && this.ballSpeed.x < 0) ||
			(paddle.v0.x == Pong.rightPaddle_xPos && this.ballSpeed.x > 0)
		) {
			let hitPointYpos: number =
				this.ball.center.y - Pong.paddle_height + this.autoPaddle_dY;
			if (hitPointYpos < 0) {
				hitPointYpos = 0;
			}
			if (hitPointYpos > Pong.paddle_yPosLimit) {
				hitPointYpos = Pong.paddle_yPosLimit;
			}
			paddle.setY(hitPointYpos);
		}
	}
	oneBallPath() {
		if (this.atGameStart) {
			this.setSound(Sound.SERVE);
			this.setSound(Sound.GAME_START);
			this.gameStartTime = Date.now()
			this.pathStartTime = Date.now();
			this.gameResult.set(this);
			this.gameIsOn = true;
			this.atGameStart = false;
		}
		this.ball.visibility = true;
		const dt: number = (Date.now() - this.pathStartTime) / 1000;
		this.ball.move(this.pathStart, this.ballSpeed, dt);
		const side: Side = this.fieldOfBallCenter.pointOutside(this.ball.center);
		if (side) {
			if (side == Side.BOTTOM) {
				this.setSound(Sound.BALL_BOTTOM);
				if (!this.deadlocksFixing()) this.ballSpeed.y *= -1;
				this.ball.center.y = this.fieldOfBallCenter.v0.y;
			} else if (side == Side.TOP) {
				this.setSound(Sound.BALL_TOP);
				if (!this.deadlocksFixing()) this.ballSpeed.y *= -1;
				this.ball.center.y = this.fieldOfBallCenter.v1.y;
			} else if (side == Side.LEFT) {
				if (!this.isBallHit(this.leftPaddle)) {
					this.rightScore++;
					this.status = GameStatus.INACTIVE;
					if (this.ballSpeedUp < 3) this.setSound(Sound.BALL_LOSS_LEFT);
					this.setSound(Sound.SIREN_LEFT);
					return;
				}
				this.setSound(Sound.BALL_LEFT);
				if (!this.deadlocksFixing()) this.paddleHit(this.leftPaddle);
				this.ball.center.x = this.fieldOfBallCenter.v0.x;
				this.accelerator();
			} else if (side == Side.RIGHT) {
				if (!this.isBallHit(this.rightPaddle)) {
					this.leftScore++;
					this.status = GameStatus.INACTIVE;
					if (this.ballSpeedUp < 3) this.setSound(Sound.BALL_LOSS_RIGHT);
					this.setSound(Sound.SIREN_RIGHT);
					return;
				}
				this.setSound(Sound.BALL_RIGHT);
				if (!this.deadlocksFixing()) this.paddleHit(this.rightPaddle);
				this.ball.center.x = this.fieldOfBallCenter.v1.x;
				this.accelerator();
			}
			this.pathStart.copy(this.ball.center);
			this.pathStartTime = Date.now();
		}
	}
	getPongState(side: Side): ServerMsg {
		this.state.ballCenter_x = this.ball.visibility
			? this.ball.center.x
			: PONG_INFINITY;
		this.state.ballCenter_y = this.ball.visibility
			? this.ball.center.y
			: PONG_INFINITY;
		this.state.paddleSide = side;
		this.state.leftPaddle_y = this.leftPaddle.visibility
			? this.leftPaddle.v0.y
			: PONG_INFINITY;
		this.state.rightPaddle_y = this.rightPaddle.visibility
			? this.rightPaddle.v0.y
			: PONG_INFINITY;
		this.state.leftScore = this.leftScore;
		this.state.rightScore = this.rightScore;
		this.state.mode = this.mode;
		this.state.status = this.status;
		this.state.sound = this.getSound(side);
		return this.state;
	}
	setControls(msg: BrowserMsg, side: Side | undefined) {
		if (!side) {
			side = Side.RIGHT;
		}
		if (msg.cmd == GameCmd.STOP || this.mode == GameMode.STOPPING) {
			this.mode = GameMode.STOPPING;
			return;
		}
		if (this.mode != GameMode.AUTO_GAME) {
			if (msg.cmd == GameCmd.MOUSE) {
				if (side == Side.LEFT && msg.paddle_y > 0) {
					this.leftPaddle.set_y0(msg.paddle_y);
				}
				if (side == Side.RIGHT && msg.paddle_y > 0) {
					this.rightPaddle.set_y0(msg.paddle_y);
				}
			} else if (msg.cmd == GameCmd.NOCMD) {
				if (side == Side.LEFT) {
					this.leftPaddle.set_dy0(msg.paddle_y);
				}
				if (side == Side.RIGHT) {
					this.rightPaddle.set_dy0(msg.paddle_y);
				}
			}
		}
		if (msg.cmd != GameCmd.NOCMD && msg.cmd != GameCmd.MOUSE) {
			if (this.mode == GameMode.WAITING) {
				if (msg.cmd == GameCmd.NEW) {
					this.mode = GameMode.PARTNER_GAME;
					this.status = GameStatus.PLAYING;
					this.ballSpeedUp = 1;
				} else if (msg.cmd == GameCmd.TRNNG) {
					this.mode = GameMode.TRNNG_GAME;
					this.status = GameStatus.PLAYING;
					this.ballSpeedUp = 1;
				} else if (msg.cmd == GameCmd.AUTO) {
					this.mode = GameMode.AUTO_GAME;
					this.status = GameStatus.PLAYING;
					this.ballSpeedUp = 1;
				}
			} else if (this.mode == GameMode.PARTNER_GAME) {
				if (msg.cmd == GameCmd.NEW && this.atGameStart) {
					this.status = GameStatus.PLAYING;
				}
			} else if (this.mode == GameMode.TRNNG_GAME || this.mode == GameMode.AUTO_GAME) {
				if (msg.cmd == GameCmd.NEW) {
					this.mode = GameMode.PARTNER_GAME;
					this.status = GameStatus.INACTIVE;
					this.newGame = true;
					this.atGameStart = false;
					this.ballSpeedUp = 1;
				} else if (
					msg.cmd == GameCmd.PAUSE &&
					this.status != GameStatus.INACTIVE
				) {
					this.status =
						this.status == GameStatus.PAUSED
							? GameStatus.PLAYING
							: GameStatus.PAUSED;
				} else if (msg.cmd == GameCmd.TRNNG) {
					this.mode = GameMode.TRNNG_GAME;
					if (this.atGameStart) {
						this.status = GameStatus.PLAYING;
					}
				} else if (msg.cmd == GameCmd.AUTO) {
					this.mode = GameMode.AUTO_GAME;
					if (this.atGameStart) {
						this.status = GameStatus.PLAYING;
					}
				}
			}
		}
	}
	calculate() {
		if (this.status == GameStatus.INACTIVE) {
			this.gameAndSetPreparation();
		} else if (this.status == GameStatus.PAUSED) {
			this.pathStartTime = Date.now();
			this.pathStart.copy(this.ball.center);
		} else if (this.status == GameStatus.PLAYING) {
			if (this.mode != GameMode.PARTNER_GAME && !this.partner) {
				if (this.mode == GameMode.AUTO_GAME) {
					this.autoGamer(this.leftPaddle);
					this.autoGamer(this.rightPaddle);
				} else if (this.mode == GameMode.TRNNG_GAME) {
					if (this.owner) {
						if (this.owner.side == Side.RIGHT) {
							this.autoGamer(this.leftPaddle);
						} else if (this.owner.side == Side.LEFT)
							this.autoGamer(this.rightPaddle);
					}
				}
			}
			this.oneBallPath();
		}
		this.leftPaddle.speedometer();
		this.rightPaddle.speedometer();
	}
	setSound(sound: Sound) {
		this.soundQueue.push(sound);
		if (this.mode == GameMode.PARTNER_GAME) {
			this.soundQueue_.push(sound);
		}
	}
	getSound(side: Side): Sound {
		let sound = undefined;
		if (this.mode == GameMode.PARTNER_GAME) {
			if (side == Side.RIGHT) {
				sound = this.soundQueue.shift();
			} else {
				sound = this.soundQueue_.shift();
			}
		} else {
			sound = this.soundQueue.shift();
		}
		return !sound ? Sound.HUSH : sound;
	}
	setPartner(partner: Player){
		if (this.owner) {
			if (this.owner.side == Side.RIGHT) {
				partner.side = Side.LEFT;
			} else if (this.owner.side == Side.LEFT) {
				partner.side = Side.RIGHT;
			}
			this.partner = partner;
		}
	}
	swapPlayers() {
		if (this.owner) {
			if (this.owner.side == Side.RIGHT) {
				this.owner.side = Side.LEFT;
			} else if (this.owner.side == Side.LEFT) {
				this.owner.side = Side.RIGHT;
			} else {
				this.owner.side = Side.RIGHT;
			}
			if (this.partner) {
				if (this.owner.side == Side.RIGHT) {
					this.partner.side = Side.LEFT;
				} else if (this.owner.side == Side.LEFT) {
					this.partner.side = Side.RIGHT;
				} else {
					this.partner.side = Side.LEFT;
				}
			}
		}
	}
	getLeftPlayer(): Player | undefined {
		if (this.owner) {
			if (this.owner.side == Side.LEFT && this.mode != GameMode.AUTO_GAME) {
				return this.owner;
			} else if (this.partner) {
				if (this.partner.side == Side.LEFT && this.mode == GameMode.PARTNER_GAME) {
					return this.partner;
				}
			}
		}
		return undefined;
	}
	getRightPlayer(): Player | undefined {
		if (this.owner) {
			if (this.owner.side == Side.RIGHT && this.mode != GameMode.AUTO_GAME) {
				return this.owner;
			} else if (this.partner) {
				if (this.partner.side == Side.RIGHT && this.mode == GameMode.PARTNER_GAME) {
					return this.partner;
				}
			}
		}
		return undefined;
	}
	getPlayerNames(): [ left: string, right: string ] {
		if (this.mode == GameMode.AUTO_GAME) {
			return [ 'auto', 'auto' ]
		}
		const left = this.getLeftPlayer();
		const right = this.getRightPlayer();
		return [ left ? left.name : 'auto', right ? right.name : 'auto' ]
	}
	isPartnerGameInProgress(): boolean {
		if (this.mode == GameMode.PARTNER_GAME &&
			this.gameIsOn)
		{
			return true;
		}
		return false;
	}
	isPartnerGameInProgressPaused(): boolean {
		if (this.isPartnerGameInProgress() &&
			this.status == GameStatus.PAUSED)
		{
			return true;
		}
		return false;
	}
	getOpposerSocketId(playerSocketId: string): string | undefined {
		if (this.partner && this.partner.socketId == playerSocketId) {
			if (this.owner) {
				return this.owner.socketId;
			}
		} else if (this.owner && this.owner.socketId == playerSocketId) {
			if (this.partner) {
				return this.partner.socketId;
			}
		}
		return undefined;
	}
}
