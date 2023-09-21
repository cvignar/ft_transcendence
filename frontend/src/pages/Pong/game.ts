import { GameCmd, GameMode, GameStatus, ServerMsg, Sound } from '../../../../pong/static/common';
import { Controls, Selector } from '../../../../pong/static/controls';
import { Score, Image, Sounds } from '../../../../pong/static/image';
import { ControlOptions } from '../../../../pong/static/options';


export function game(socket: any) {

	let nickname: string | null = '';
	let renderTimer = 0;
	const browserState = new ServerMsg();
	const image = new Image('canvas');
	const controls = new Controls(socket, image);
	const selector = new Selector('PARTNERS');
	const sounds = new Sounds();
	const score = new Score();

	// Player
	socket.emit('new player');
	socket.on('player not created', function() {
		while(!nickname) {
			nickname = window.prompt('Enter Your Nickname:');
		}
		socket.emit('new player', ({name: nickname, id: -1}));
	});
	socket.on('player created', function(nick_name: string | null) {
		nickname = nick_name;
	});
	socket.on('players', function(players: string[]) {
		score.setPlayers(players[0], players[1]);
		score.showPlayers();
	});

	// Select partners
	selector.select.addEventListener('focusin', function() {
		selector.clear();
		socket.emit('get partners list');
	});
	socket.on('partners list', function(partnersList: any) {
		selector.fill(partnersList);
		sounds.playSound(Sound.SPEEDUP);
	});
	selector.select.addEventListener('change', function(socket_id: { target: { value: any; }; }) {
		socket.emit('partner choosed', socket_id.target.value);
		sounds.playSound(Sound.SPEEDUP);
	});

	// Confirm partner
	socket.on('confirm partner', function(partner: any[]) {
		let pauseBefor = true;
		if (controls.gameStatus != GameStatus.PAUSED) {
			pauseBefor = false;
			controls.pause();
		}
		sounds.playSound(Sound.SPEEDUP);
		const yes = window.confirm('Player '+partner[1]+' wants to join your game');
		if (yes) {
			socket.emit('partner confirmation', partner[0]);
			controls.new();
			controls.gameIsOn = false;
		} else {
			if (!pauseBefor) {
				controls.pause();
			}
			socket.emit('refusal', partner[0]);
		}
	});
	
	// Alert 'partner unavailable'
	socket.on('partner unavailable', function() {
		let pauseBefor = true;
		if (controls.gameStatus != GameStatus.PAUSED) {
			pauseBefor = false;
			controls.pause();
		}
		sounds.playSound(Sound.SPEEDUP);
		alert('Sorry, partner is unavailable');
		if (!pauseBefor) {
			controls.pause();
		}
	});

	// Confirm start partner game
	socket.on('start partner game', function() {
		sounds.playSound(Sound.SPEEDUP);
		const yes = window.confirm('Start new game?');
		if (yes) {
			setTimeout(function() {
				controls.new();
			}, ControlOptions.game_startTime );
		} else {
			socket.emit('partner refused');
			controls.stop();
		}
	});

	// Alert 'partner refused'
	socket.on('partner refused', function() {
		sounds.playSound(Sound.SPEEDUP);
		alert('Sorry, partner refused');
	});

	// Pong events
	socket.on('pong launched', function(cmd: GameCmd) {
		if (image.valid()) {

			if (cmd) {
				setTimeout(function() {
					controls.emitCmd(cmd);
				}, ControlOptions.game_startTime );
			}

			renderTimer = setInterval(function() {
				sounds.play(browserState);
				controls.colorizeButtons(browserState);
				image.render(browserState, score.get(browserState));
			}, Image.rendering_period);
		}
	});
	socket.on('state', function(state: ServerMsg) {
		browserState.copy(state);
		if (score.mode == GameMode.STOPPING) {
			controls.stop();
		}
	});
	socket.on('pong deleted', function() {
		sounds.playSound(Sound.SPEEDUP);
		controls.gameIsOn = false;
		controls.normalizeButtons();
		score.clear();
		clearInterval(renderTimer);
		image.clear();
	});
	
	socket.on('disconnect', function() {
		clearInterval(renderTimer);
	});
}