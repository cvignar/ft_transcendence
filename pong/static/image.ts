import { GameMode, GameScheme, GameStatus, ServerMsg, Side, Sound } from './common.js';
import { Options, ImageOptions, PongOptions } from './options.js';

export class Score {
	private left: number = 0;
	private right: number = 0;
	private leftPlayer: string = '';
	private rightPlayer: string = '';
	gameIsOn: boolean = false;
	mode: GameMode = GameMode.WAITING;
	windowLeft = document.getElementById('LEFT');
	windowRight = document.getElementById('RIGHT');
	get(state: ServerMsg): Score {
		if (state.sound == Sound.GAME_START) {
			this.left = 0;
			this.right = 0;
			this.gameIsOn = true;
			if (Options.debug) console.log(this.leftPlayer, this.left,':',this.right, this.rightPlayer);
		}
		if (state.sound == Sound.APPLAUSE) {
			this.gameIsOn = false;
		}
		if (this.gameIsOn) {
			if (this.left != state.leftScore) {
				this.left = state.leftScore;
				if (Options.debug) console.log(this.leftPlayer, this.left,':',this.right, this.rightPlayer);
			}
			if (this.right != state.rightScore) {
				this.right = state.rightScore;
				if (Options.debug) console.log(this.leftPlayer, this.left,':',this.right, this.rightPlayer);
			}
		}
		this.mode = state.mode;
		return this;
	}
	setPlayers(left: string, right: string) {
		this.leftPlayer = left;
		this.rightPlayer = right;
	}
	showPlayers() {
		if (this.windowLeft) {
			if (this.leftPlayer != 'auto') {
				this.windowLeft.style.fontWeight = 'bold';
				this.windowLeft.textContent = this.leftPlayer;
			} else {
				this.windowLeft.style.fontWeight = 'normal';
				this.windowLeft.textContent = 'auto';
			}
		}
		if (this.windowRight) {
			if (this.rightPlayer != 'auto') {
				this.windowRight.style.fontWeight = 'bold';
				this.windowRight.textContent = this.rightPlayer;
			} else {
				this.windowRight.style.fontWeight = 'normal';
				this.windowRight.textContent = 'auto';
			}
		}
	}
	setLeftPlayer(leftPlayer: string) {
		this.leftPlayer = leftPlayer;
	}
	setRightPlayer(rightPlayer: string) {
		this.rightPlayer = rightPlayer;
	}
	getLeftPlayer() {
		return this.leftPlayer;
	}
	getRightPlayer() {
		return this.rightPlayer;
	}
	getLeft() {
		return this.left;
	}
	getRight() {
		return this.right;
	}
	clear() {
		this.left = 0;
		this.right = 0;
		this.leftPlayer = '|';
		this.rightPlayer = '|';
		this.gameIsOn = false;
		this.showPlayers();
	}
}

export class Sounds {
	on: boolean;
	deadloc_on: boolean;
	game_start: any;
	ball_top: any;
	ball_bottom: any;
	ball_loss_left: any;
	ball_loss_right: any;
	ball_left: any;
	ball_right: any;
	siren_left: any;
	siren_right: any;
	deadlock: any;
	serve: any;
	speedup: any;
	applause:  any;
	bttnSnd = document.getElementById('SOUND');
	constructor(path: string) {
		this.on = true;
		this.deadloc_on = false;

		// Siund button
		this.bttnSnd = document.getElementById('SOUND');
		if (this.bttnSnd) {
			this.bttnSnd.addEventListener('click', () => {
				this.on_off();
			});
		}

		this.game_start = new Audio();
		this.game_start.preload = 'auto';
		this.game_start.src = `${path}sounds/game_start.mp3`;

		// First start sounds fo Safari policy
		document.addEventListener('focusin', () => {
			this.game_start.play();
			if (this.bttnSnd) {
				this.bttnSnd.style.fontWeight = 'bold';
			}
		}, { once: true });
		document.addEventListener('mousedown', () => {
			this.game_start.play();
			if (this.bttnSnd) {
				this.bttnSnd.style.fontWeight = 'bold';
			}
		}, { once: true });

		// Sounds

		this.ball_top = new Audio();
		this.ball_top.preload = 'auto';
		this.ball_top.src = `${path}sounds/ball.mp3`;

		this.ball_bottom = new Audio();
		this.ball_bottom.preload = 'auto';
		this.ball_bottom.src = `${path}sounds/ball.mp3`;

		this.ball_loss_left = new Audio();
		this.ball_loss_left.preload = 'auto';
		this.ball_loss_left.src = `${path}sounds/ball_loss_left.mp3`;
		this.ball_loss_right = new Audio();
		this.ball_loss_right.preload = 'auto';
		this.ball_loss_right.src = `${path}sounds/ball_loss_right.mp3`;

		this.ball_left = new Audio();
		this.ball_left.preload = 'auto';
		this.ball_left.src = `${path}sounds/ball_left.mp3`;
		this.ball_right = new Audio();
		this.ball_right.preload = 'auto';
		this.ball_right.src = `${path}sounds/ball_right.mp3`;

		this.siren_left = new Audio();
		this.siren_left.preload = 'auto';
		this.siren_left.src = `${path}sounds/siren_left.mp3`;

		this.siren_right = new Audio();
		this.siren_right.preload = 'auto';
		this.siren_right.src = `${path}sounds/siren_right.mp3`;

		this.deadlock = new Audio();
		this.deadlock.preload = 'auto';
		this.deadlock.src = `${path}sounds/deadlock.mp3`;

		this.serve = new Audio();
		this.serve.preload = 'auto';
		this.serve.src = `${path}sounds/serve.mp3`;

		this.speedup = new Audio();
		this.speedup.preload = 'auto';
		this.speedup.src = `${path}sounds/speedup.mp3`;

		this.applause = new Audio();
		this.applause.preload = 'auto';
		this.applause.src = `${path}sounds/applause.mp3`;
	}
	playSound(sound: Sound): boolean {
		if (this.on) {
			switch (sound) {
				case Sound.GAME_START:
					this.game_start.play();
					break;
				case Sound.BALL_TOP:
					this.ball_top.play();
					break;
				case Sound.BALL_BOTTOM:
					this.ball_bottom.play();
					break;
				case Sound.BALL_LOSS_LEFT:
					this.ball_loss_left.play();
					break;
				case Sound.BALL_LOSS_RIGHT:
					this.ball_loss_right.play();
					break;
				case Sound.BALL_LEFT:
					this.ball_left.play();
					break;
				case Sound.BALL_RIGHT:
					this.ball_right.play();
					break;
				case Sound.SIREN_LEFT:
					this.siren_left.play();
					break;
				case Sound.SIREN_RIGHT:
					this.siren_right.play();
					break;
				case Sound.DEADLOCK:
					if (this.deadloc_on) this.deadlock.play();
					break;
				case Sound.SERVE:
					this.serve.play();
					break;
				case Sound.SPEEDUP:
					this.speedup.play();
					break;
				case Sound.APPLAUSE:
					this.applause.play();
					return true;
			}
		} else if (sound == Sound.APPLAUSE) {
			return true;
		}
		return false;
	}
	on_off() {
		if (this.on) {
			if (this.deadloc_on && Options.debug) {
				this.deadloc_on = false;
			} else {
				this.on = false;
			}
		} else {
			this.on = true;
			if (Options.debug) {
				this.deadloc_on = true;
			}
		}
		if (this.bttnSnd) {
			if (this.on) {
				this.bttnSnd.style.fontWeight = 'bold';
			} else {
				this.bttnSnd.style.fontWeight = 'normal';
			}
			if (Options.debug && this.deadloc_on) {
				this.bttnSnd.style.color = 'DarkRed' ;
			} else {
				this.bttnSnd.style.color = 'black';
			}
		}
	}
	play(state: ServerMsg): boolean {
		return this.playSound(state.sound);
	}
}

export class Image extends ImageOptions {
	canvasId: string;
	leftPaddle_y: number;
	rightPaddle_y: number;
	mouse_y: number;
	mouseOn: boolean;
	canvas: any;
	context: any;
	constructor(canvasId: string) {
		super();
		this.canvasId = canvasId;
		this.leftPaddle_y = 0;
		this.rightPaddle_y = 0;
		this.mouse_y = 0;
		this.mouseOn = false;
		this.canvas	= document.getElementById(this.canvasId);
		if (!this.canvas) {
			console.log("Canvas not defined");
			return;
		}
		this.canvas.width = Image.width;
		this.canvas.height = Image.height;
		this.context = this.canvas.getContext('2d');
		if (!this.context) {
			console.log("Canvas.context not defined");
			return;
		}
	}
	valid(): Boolean {
		if (!this.canvas || !this.context) {
			console.error(`HTMLElement '${this.canvasId}' not found or context identifier not supported`);
			return false;
		}
		return true;
	}
	mousemove(y: number) {
		this.mouseOn = true;
		this.mouse_y = Options.height - 1 - y - Options.paddle_height / 2;
		if (this.mouse_y < Options.paddle_height / 2 ||
			this.mouse_y > PongOptions.paddle_yPosLimit - Options.paddle_height / 2)
		{
			this.mouseOn = false;
		}
	}
	renderData(browserState: ServerMsg) {
		if ((browserState.mode == GameMode.PARTNER_GAME ||
			browserState.mode == GameMode.TRNNG_GAME) &&
			this.mouseOn)
		{
			if (browserState.paddleSide == Side.RIGHT) {
				this.leftPaddle_y = browserState.leftPaddle_y;
				this.rightPaddle_y = this.mouse_y;
			} else {
				this.leftPaddle_y = this.mouse_y;
				this.rightPaddle_y = browserState.rightPaddle_y;
			}
		} else {
			this.leftPaddle_y = browserState.leftPaddle_y;
			this.rightPaddle_y = browserState.rightPaddle_y;
		}
	}
	render(browserState: ServerMsg, score: Score) {
		this.renderData(browserState);
		this.clear();
		this.drawBack();
		this.drawScore(score);
		this.drawDividingNet();
		this.drawRightPaddle(this.rightPaddle_y);
		this.drawBall(browserState.ballCenter_x, browserState.ballCenter_y);
		this.drawLeftPaddle(this.leftPaddle_y);
		if (browserState.mode == GameMode.PARTNER_GAME &&
			browserState.status == GameStatus.PAUSED) {
				this.drawMsg('waiting...');
			}
		if (score.getLeft() == Image.maxWins || score.getRight() == Image.maxWins) {
			this.drawMsg('GAME OVER');
		}
		}
	clear() {
		this.context.clearRect(0, 0, Image.width, Image.height);
	}
	drawBack() {
		this.context.fillStyle = Image.color_back;
		this.context.beginPath();
		this.context.rect(0, 0, Image.width, Image.height);
		this.context.fill();
	}
	drawScore(score: Score) {
		this.context.fillStyle = Image.color_score;
		this.context.font = Image.score_font1;
		this.context.textBaseline = 'top';
		this.context.textAlign = 'right';
		this.context.fillText(score.getLeft(), Image.scoreLeft_xPos, Image.score_yPos);
		this.context.textAlign = 'left';
		this.context.fillText(score.getRight(), Image.scoreRight_xPos, Image.score_yPos);
	}
	drawMsg(msg: string) {
		this.context.fillStyle = Image.color_score;
		this.context.font = Image.msg_fontSize;
		this.context.textBaseline = 'center';
		this.context.textAlign = 'center';
		this.context.fillText(msg, Image.msg_xPos, Image.msg_yPos);
	}
	drawDividingNet() {
		this.context.fillStyle = Image.color_dividingNet;
		this.context.beginPath();
		this.context.rect(Image.dividingNet_xPos, 0, Image.dividingNet_width, Image.height);
		this.context.fill();
	}
	drawLeftPaddle(y: number) {
		this.context.fillStyle = Image.color_paddle;
		this.context.beginPath();
		this.context.rect(Image.leftPaddle_xPos, Image.height - 1 - y, Image.paddle_width, -Image.paddle_height);
		this.context.fill();

	}
	drawRightPaddle(y: number) {
		this.context.fillStyle = Image.color_paddle;
		this.context.beginPath();
		this.context.rect(Image.rightPaddle_xPos, Image.height - 1 - y, Image.paddle_width, -Image.paddle_height);
		this.context.fill();
	}
	drawBall(x: number, y: number) {
		this.context.fillStyle = Image.color_ball;
		this.context.beginPath();
		this.context.arc(x, Image.height - 1 - y, Image.ball_radius, 0, 2 * Math.PI);
		this.context.fill();
	}
	changeScheme(scheme: GameScheme) {
		if (scheme == GameScheme.GENERAL) {
			Image.color_back = 'black';
			Image.color_dividingNet = 'Silver';
			Image.color_ball = 'white';
			Image.color_paddle = 'white';
			Image.color_score = 'Silver';
		} else if (scheme == GameScheme.REVERSE) {
			Image.color_back = 'white';
			Image.color_dividingNet = 'Silver';
			Image.color_ball = 'black';
			Image.color_paddle = 'black';
			Image.color_score = 'Silver';
		}
	}
}