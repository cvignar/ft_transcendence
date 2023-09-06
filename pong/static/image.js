import { GameMode, GameStatus, Side, Sound } from './common.js';
import { Options, ImageOptions } from './options.js';
import * as geometry from './geometry.js';
export class Score {
    constructor() {
        this.left = 0;
        this.right = 0;
        this.leftPlayer = '';
        this.rightPlayer = '';
        this.gameIsOn = false;
        this.mode = GameMode.WAITING;
        this.windowLeft = document.getElementById('LEFT');
        this.windowRight = document.getElementById('RIGHT');
    }
    get(state) {
        if (state.sound == Sound.GAME_START) {
            this.left = 0;
            this.right = 0;
            this.gameIsOn = true;
            if (Options.debug)
                console.log(this.leftPlayer, this.left, ':', this.right, this.rightPlayer);
        }
        if (state.sound == Sound.APPLAUSE) {
            this.gameIsOn = false;
        }
        if (this.gameIsOn) {
            if (this.left != state.leftScore) {
                this.left = state.leftScore;
                if (Options.debug)
                    console.log(this.leftPlayer, this.left, ':', this.right, this.rightPlayer);
            }
            if (this.right != state.rightScore) {
                this.right = state.rightScore;
                if (Options.debug)
                    console.log(this.leftPlayer, this.left, ':', this.right, this.rightPlayer);
            }
        }
        this.mode = state.mode;
        return this;
    }
    setPlayers(left, right) {
        this.leftPlayer = left;
        this.rightPlayer = right;
    }
    showPlayers() {
        if (this.windowLeft) {
            if (this.leftPlayer != '') {
                this.windowLeft.style.fontWeight = 'bold';
                this.windowLeft.textContent = this.leftPlayer;
            }
            else {
                this.windowLeft.style.fontWeight = 'normal';
                this.windowLeft.textContent = 'auto';
            }
        }
        if (this.windowRight) {
            if (this.rightPlayer != '') {
                this.windowRight.style.fontWeight = 'bold';
                this.windowRight.textContent = this.rightPlayer;
            }
            else {
                this.windowRight.style.fontWeight = 'normal';
                this.windowRight.textContent = 'auto';
            }
        }
    }
    setLeftPlayer(leftPlayer) {
        this.leftPlayer = leftPlayer;
    }
    setRightPlayer(rightPlayer) {
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
    setPlayer(player) {
        if (player[1] == Side.RIGHT) {
            this.rightPlayer = player[0];
        }
        else if (player[1] == Side.LEFT) {
            this.leftPlayer = player[0];
        }
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
    constructor() {
        this.bttnSnd = document.getElementById('SOUND');
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
        this.game_start.src = 'sounds/game_start.mp3';
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
        this.ball = new Audio();
        this.ball.preload = 'auto';
        this.ball.src = 'sounds/ball.mp3';
        this.ball_loss_left = new Audio();
        this.ball_loss_left.preload = 'auto';
        this.ball_loss_left.src = 'sounds/ball_loss_left.mp3';
        this.ball_loss_right = new Audio();
        this.ball_loss_right.preload = 'auto';
        this.ball_loss_right.src = 'sounds/ball_loss_right.mp3';
        this.ball_left = new Audio();
        this.ball_left.preload = 'auto';
        this.ball_left.src = 'sounds/ball_left.mp3';
        this.ball_right = new Audio();
        this.ball_right.preload = 'auto';
        this.ball_right.src = 'sounds/ball_right.mp3';
        this.siren_left = new Audio();
        this.siren_left.preload = 'auto';
        this.siren_left.src = 'sounds/siren_left.mp3';
        this.siren_right = new Audio();
        this.siren_right.preload = 'auto';
        this.siren_right.src = 'sounds/siren_right.mp3';
        this.deadlock = new Audio();
        this.deadlock.preload = 'auto';
        this.deadlock.src = 'sounds/deadlock.mp3';
        this.serve = new Audio();
        this.serve.preload = 'auto';
        this.serve.src = 'sounds/serve.mp3';
        this.speedup = new Audio();
        this.speedup.preload = 'auto';
        this.speedup.src = 'sounds/speedup.mp3';
        this.applause = new Audio();
        this.applause.preload = 'auto';
        this.applause.src = 'sounds/applause.mp3';
    }
    playSound(sound) {
        if (this.on) {
            switch (sound) {
                case Sound.GAME_START:
                    this.game_start.play();
                    break;
                case Sound.BALL:
                    this.ball.play();
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
                    if (this.deadloc_on)
                        this.deadlock.play();
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
        }
        else if (sound == Sound.APPLAUSE) {
            return true;
        }
        return false;
    }
    on_off() {
        if (this.on) {
            if (this.deadloc_on && Options.debug) {
                this.deadloc_on = false;
            }
            else {
                this.on = false;
            }
        }
        else {
            this.on = true;
            if (Options.debug) {
                this.deadloc_on = true;
            }
        }
        if (this.bttnSnd) {
            if (this.on) {
                this.bttnSnd.style.fontWeight = 'bold';
            }
            else {
                this.bttnSnd.style.fontWeight = 'normal';
            }
            if (Options.debug && this.deadloc_on) {
                this.bttnSnd.style.color = 'DarkRed';
            }
            else {
                this.bttnSnd.style.color = 'black';
            }
        }
    }
    play(state) {
        return this.playSound(state.sound);
    }
}
export class Image extends ImageOptions {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
        this.pathStartTime = 0;
        this.pathStart = new geometry.Vec(0, 0);
        this.ballSpeed = new geometry.Vec(0, 0);
        this.ball = new geometry.Vec(0, 0);
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas)
            return;
        this.canvas.width = Image.width;
        this.canvas.height = Image.height;
        this.context = this.canvas.getContext('2d');
        if (!this.context)
            return;
    }
    valid() {
        if (!this.canvas || !this.context) {
            console.error(`HTMLElement '${this.canvasId}' not found or context identifier not supported`);
            return false;
        }
        return true;
    }
    ballMove(pathStart, speed, dt) {
        this.ball.x = pathStart.x + Math.round(speed.x * dt / 1000);
        this.ball.y = pathStart.y + Math.round(speed.y * dt / 1000);
    }
    render(state, score) {
        if (state.sound != 0) {
            this.pathStartTime = Date.now();
            this.pathStart.x = state.ballCenter_x;
            this.pathStart.y = state.ballCenter_y;
            this.ballSpeed.x = state.ballSpeed_x;
            this.ballSpeed.y = state.ballSpeed_y;
        }
        if (state.status != GameStatus.PAUSED) {
            let dt = (Date.now() - this.pathStartTime);
            this.ballMove(this.pathStart, this.ballSpeed, dt);
        }
        else {
            this.pathStartTime = Date.now();
            this.pathStart.x = state.ballCenter_x;
            this.pathStart.y = state.ballCenter_y;
            this.ball.x = state.ballCenter_x;
            this.ball.y = state.ballCenter_y;
        }
        this.clear();
        this.drawBack();
        this.drawScore(score);
        this.drawDividingNet();
        this.drawLeftPaddle(state.leftPaddle_y);
        this.drawRightPaddle(state.rightPaddle_y);
        this.drawBall(this.ball.x, this.ball.y);
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
    drawScore(score) {
        this.context.fillStyle = Image.color_score;
        this.context.font = Image.score_font1;
        this.context.textBaseline = 'top';
        this.context.textAlign = 'right';
        this.context.fillText(score.getLeft(), Image.scoreLeft_xPos, Image.score_yPos);
        this.context.textAlign = 'left';
        this.context.fillText(score.getRight(), Image.scoreRight_xPos, Image.score_yPos);
    }
    drawDividingNet() {
        this.context.fillStyle = Image.color_dividingNet;
        this.context.beginPath();
        this.context.rect(Image.dividingNet_xPos, 0, Image.dividingNet_width, Image.height);
        this.context.fill();
    }
    drawLeftPaddle(y) {
        this.context.fillStyle = Image.color_paddle;
        this.context.beginPath();
        this.context.rect(Image.leftPaddle_xPos, Image.height - 1 - y, Image.paddle_width, -Image.paddle_height);
        this.context.fill();
    }
    drawRightPaddle(y) {
        this.context.fillStyle = Image.color_paddle;
        this.context.beginPath();
        this.context.rect(Image.rightPaddle_xPos, Image.height - 1 - y, Image.paddle_width, -Image.paddle_height);
        this.context.fill();
    }
    drawBall(x, y) {
        this.context.fillStyle = Image.color_ball;
        this.context.beginPath();
        this.context.arc(x, Image.height - 1 - y, Image.ball_radius, 0, 2 * Math.PI);
        this.context.fill();
    }
}
