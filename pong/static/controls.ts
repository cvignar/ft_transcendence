import { BrowserMsg, GameCmd, GameMode, GameStatus, ServerMsg, Sound, getGameCmd } from './common.js';
import { Image } from './image.js';
import { ControlOptions } from './options.js';

export class Controls extends ControlOptions {
	msg: BrowserMsg = new BrowserMsg;
	socket: any;
	image: Image;
	interval: any = 0;
	gameMode: GameMode = GameMode.WAITING;
	gameStatus: GameStatus = GameStatus.INACTIVE;
	gameIsOn: boolean = false;
	bttnNew: any;
	bttnTrnng: any;
	bttnAuto: any;
	bttnPause: any;
	bttnStop: any;
	bttnUp: any;
	bttnDown: any;
	bttnSnd: any;
	pongArea: any;
	constructor(socket: any, image: Image) {
		super();
		this.socket = socket;
		this.image = image;

		// Mouse controls
		this.image.canvas.addEventListener('mousemove', (mouse: { offsetY: any; }) => {
			this.mousemove(mouse.offsetY);
		});
		this.image.canvas.addEventListener('click', () => {
			this.pause();
		});
		this.image.canvas.addEventListener('mousemove', (mouse: { offsetY: number; }) => {
			this.image.mousemove(mouse.offsetY);
		});
		this.image.canvas.addEventListener('mouseout', () => {
			this.image.mouseOn = false;
		});

		// Keys controls
		document.addEventListener('keydown', (event) => {
			if (!this.blockPongHotKeys()) {
				this.keydown(event.keyCode);
			}
		});
		document.addEventListener('keyup', (event) => {
			if (!this.blockPongHotKeys()) {
				if (event.keyCode == Controls.key_s &&
					this.gameMode == GameMode.PARTNER_GAME &&
					this.gameIsOn)
				{
					return;
				} else {
					this.keyup(event.keyCode);
				}
			}
		});

		// Button controls
		this.bttnNew = document.getElementById('NEW');
		if (this.bttnNew) {
			this.bttnNew.addEventListener('click', () => {
				this.startPartnerGame();
			});
		}
		this.bttnTrnng = document.getElementById('TRNNG');
		if (this.bttnTrnng) {
			this.bttnTrnng.addEventListener('click', () => {
				this.click(this.bttnTrnng.id);
			});
		}
		this.bttnAuto = document.getElementById('AUTO');
		if (this.bttnAuto) {
			this.bttnAuto.addEventListener('click', () => {
				this.click(this.bttnAuto.id);
			});
		}
		this.bttnPause = document.getElementById('PAUSE');
		if (this.bttnPause) {
			this.bttnPause.addEventListener('click', () => {
				this.click(this.bttnPause.id);
			});
		}
		this.bttnStop = document.getElementById('STOP');
		if (this.bttnStop) {
			this.bttnStop.addEventListener('click', () => {
				if (!this.isStopBlocking()) {
					this.click(this.bttnStop.id);
				}
			});
		}
		this.bttnUp = document.getElementById('Up');
		this.bttnUp.addEventListener('mousedown', () => {
			this.keydown(Controls.key_arrowUp);
		});
		this.bttnUp.addEventListener('mouseup', () => {
			this.keyup(Controls.key_arrowUp);
		});

		this.bttnDown = document.getElementById('Down');
		this.bttnDown.addEventListener('mousedown', () => {
			this.keydown(Controls.key_arrowDown);
		});
		this.bttnDown.addEventListener('mouseup', () => {
			this.keyup(Controls.key_arrowDown);
		});
	}

	blockPongHotKeys(): boolean {
		const active = document.activeElement;
		if (active instanceof HTMLElement && (active.isContentEditable
			|| active.tagName === 'INPUT'
			|| active.tagName === 'TEXTAREA'))
			return true;
		return false;
	}
	keydown(key: number) {
		if (!this.interval) {
			let requiredKey: boolean = true;
			this.msg.clear();
			switch (key) {
				case Controls.key_arrowUp:
					this.msg.paddle_y = Controls.paddle_keyMove;
					break;
				case Controls.key_arrowDown:
					this.msg.paddle_y = -Controls.paddle_keyMove;
					break;
				default:
					requiredKey = false;
			}
			if (requiredKey) {
				this.interval = setInterval(() => {
					this.socket.emit('controls', this.msg);
				}, Controls.key_interval);
			}
		}
	}
	keyup(key: number): GameCmd {
		let requiredKey: boolean = true;
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = 0;
		}
		this.msg.clear();
		switch (key) {
			case Controls.key_n:
				this.msg.cmd = GameCmd.NEW;
				break;
			case Controls.key_t:
				this.msg.cmd = GameCmd.TRNNG;
				break;
			case Controls.key_a:
				this.msg.cmd = GameCmd.AUTO;
				break;
			case Controls.key_space:
				this.msg.cmd = GameCmd.PAUSE;
				break;
			case Controls.key_s:
				if (!this.isStopBlocking()) {
					this.msg.cmd = GameCmd.STOP;
				}
				break;
			case Controls.key_arrowUp:
				this.image.mouseOn = false;
				this.msg.paddle_y = Controls.paddle_keyMove;
				break;
			case Controls.key_arrowDown:
				this.image.mouseOn = false;
				this.msg.paddle_y = -Controls.paddle_keyMove;
				break;
			default:
				requiredKey = false;
		}
		if (requiredKey) {
			this.socket.emit('controls', this.msg);
			return this.msg.cmd;
		}
		return GameCmd.NOCMD;
	}
	click(command: string): GameCmd {
		this.msg.clear();
		this.msg.cmd = getGameCmd(command);
		this.socket.emit('controls', this.msg);
		return this.msg.cmd;
	}
	mousemove(y: number) {
		this.msg.clear();
		this.msg.cmd = GameCmd.MOUSE;
		this.msg.paddle_y = Controls.height - 1 - y - Controls.paddle_height / 2;
		this.socket.emit('controls', this.msg);
	}
	statusesChanged(state: ServerMsg): boolean {
		if (state.sound == Sound.GAME_START && !state.leftScore && !state.rightScore) {
			this.gameIsOn = true;
			this.gameMode = state.mode;
			this.gameStatus = state.status;
			return true;
		} else if (state.sound == Sound.APPLAUSE) {
			this.gameIsOn = false;
			this.gameMode = state.mode;
			this.gameStatus = state.status;
			return true;
		}
		if (this.gameMode != state.mode || this.gameStatus != state.status) {
			this.gameMode = state.mode;
			this.gameStatus = state.status;
			return true;
		}
		return false
	}
	colorizeButtons(state: ServerMsg) {
		if (!this.statusesChanged(state)) {
			return;
		}
		// NEW
		if (this.gameMode == GameMode.PARTNER_GAME) {
			this.bttnNew.style.fontWeight = 'bold';
			if (this.gameIsOn) {
				this.bttnNew.style.color = 'DarkGreen' ;
			} else {
				this.bttnNew.style.color = 'black';
			}
		} else {
			this.bttnNew.style.fontWeight = 'normal';
			this.bttnNew.style.color = 'black';
		}
		// TRNNG
		if (this.gameMode == GameMode.TRNNG_GAME) {
			this.bttnTrnng.style.fontWeight = 'bold';
			if (this.gameIsOn) {
				this.bttnTrnng.style.color = 'DarkGreen' ;
			} else {
				this.bttnTrnng.style.color = 'black';
			}
		} else if (this.gameMode == GameMode.AUTO_GAME) {
				this.bttnTrnng.style.fontWeight = 'bold';
				this.bttnTrnng.style.color = 'black';
		} else {
			this.bttnTrnng.style.fontWeight = 'normal';
			this.bttnTrnng.style.color = 'black';
		}
		// AUTO
		if (this.gameMode == GameMode.AUTO_GAME) {
			this.bttnAuto.style.fontWeight = 'bold';
			if (this.gameIsOn) {
				this.bttnAuto.style.color = 'DarkGreen' ;
			} else {
				this.bttnAuto.style.color = 'black';
			}
		} else if (this.gameMode == GameMode.TRNNG_GAME) {
			this.bttnAuto.style.fontWeight = 'bold';
			this.bttnAuto.style.color = 'black';
		} else {
			this.bttnAuto.style.fontWeight = 'normal';
			this.bttnAuto.style.color = 'black';
		}
		// PAUSE
		if (this.gameMode == GameMode.TRNNG_GAME || this.gameMode == GameMode.AUTO_GAME) {
			this.bttnPause.style.fontWeight = 'bold';
			if (this.gameStatus == GameStatus.PAUSED) {
				this.bttnPause.style.color = 'DarkGreen' ;
			} else if (this.gameStatus == GameStatus.PLAYING) {
				this.bttnPause.style.color = 'black';
			} else {
				this.bttnPause.style.fontWeight = 'normal';
				this.bttnPause.style.color = 'black';
			}
		} else {
			this.bttnPause.style.fontWeight = 'normal';
			this.bttnPause.style.color = 'black';
		}
		// STOP
		if (!this.isStopBlocking()) {
			this.bttnStop.style.fontWeight = 'bold';
		} else {
			this.bttnStop.style.fontWeight = 'normal';
		}
		// UP/DOWN
		if (this.gameMode != GameMode.AUTO_GAME) {
			this.bttnUp.style.fontWeight = 'bold';
			this.bttnDown.style.fontWeight = 'bold';
		} else {
			this.bttnUp.style.fontWeight = 'normal';
			this.bttnDown.style.fontWeight = 'normal';
		}
		// WAITING
		if (this.gameMode == GameMode.WAITING) {
			this.bttnTrnng.style.fontWeight = 'bold';
			this.bttnTrnng.style.color = 'black';
			this.bttnAuto.style.fontWeight = 'bold';
			this.bttnAuto.style.color = 'black';
			this.bttnPause.style.fontWeight = 'normal';
			this.bttnPause.style.color = 'black';
			this.bttnStop.style.fontWeight = 'normal';
			this.bttnStop.style.color = 'black';
			this.bttnUp.style.fontWeight = 'normal';
			this.bttnUp.style.color = 'black';
			this.bttnDown.style.fontWeight = 'normal';
			this.bttnDown.style.color = 'black';
		}
	}
	normalizeButtons() {
		let state = new ServerMsg;
		state.mode = GameMode.WAITING;
		state.status = GameStatus.INACTIVE;
		this.colorizeButtons(state);
	}
	emitCmd(cmd: GameCmd) {
		this.msg.clear();
		this.msg.cmd = cmd;
		this.socket.emit('controls', this.msg);
	}
	isStopBlocking(): boolean {
		if (this.gameMode == GameMode.PARTNER_GAME && this.gameIsOn) {
			return true;
		}
		return false;
	}
	isPauseBlocking(): boolean {
		if ((this.gameMode == GameMode.TRNNG_GAME || this.gameMode == GameMode.AUTO_GAME) &&
			(this.gameStatus = GameStatus.PLAYING || this.gameStatus == GameStatus.PAUSED) &&
			this.gameIsOn) {
			return true;
		}
		return false;
	}
	new() {
		this.msg.clear();
		this.msg.cmd = GameCmd.NEW;
		this.socket.emit('controls', this.msg);
	}
	pause() {
		this.msg.clear();
		this.msg.cmd = GameCmd.PAUSE;
		this.socket.emit('controls', this.msg);
	}
	stop() {
		this.msg.clear();
		this.msg.cmd = GameCmd.STOP;
		this.socket.emit('controls', this.msg);
	}
	startPartnerGame() {
	if (this.gameMode == GameMode.PARTNER_GAME) {
		this.socket.emit('start partner game');
	}
}
}

export class Selector {
	select: any;
	selectList: any;
	option: any;
	lastChoice: any;
	value: any;
	constructor(selectorId: string) {
		this.select = document.getElementById(selectorId);
		this.selectList = document.createElement('select');
		this.select.appendChild(this.selectList);

		this.option = document.createElement('option');
		this.selectList.appendChild(this.option);
		this.option.value = '';
		this.option.text = '--yourself--';
	}
	clear() {
		while (this.selectList.length > 1) {
			this.selectList.remove(1);
		}
	}
	fill(partnersList: any) {
		for (let i = 0; i < partnersList.length; ++i) {
			this.option = document.createElement('option');
			this.option.text = partnersList[i].nick_name;
			this.option.value = partnersList[i].socket_id;
			this.selectList.appendChild(this.option);
		}
	}
}