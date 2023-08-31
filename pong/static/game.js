import { GameCmd, GameMode, GameStatus, Sound } from './common.js';
import { Controls, Selector } from './controls.js';
import { Score, Image, Sounds } from './image.js';

var socket = io();
var nickname = '';
var renderTimer = 0;
const controls = new Controls(socket);
const selector = new Selector('PARTNERS');
const image = new Image('canvas');
const sounds = new Sounds();
const score = new Score();

// Mouse controls
var canvas = document.getElementById('canvas');
canvas.addEventListener('mousemove', function(mouse) {
	controls.mousemove(mouse.offsetY);
});

// Player
socket.emit('new player');
socket.on('player not crated', function() {
	while(!nickname) {
		nickname = window.prompt('Enter Your Nickname:');
	}
	socket.emit('new player', nickname);
});
socket.on('player created', function(nick_name) {
	nickname = nick_name;
});
socket.on('players', function(players) {
	score.setPlayers(players[0], players[1]);
	score.showPlayers();
});

// Select partners
selector.select.addEventListener('focusin', function() {
	selector.clear();
	socket.emit('get partners list');
});
socket.on('partners list', function(partnersList) {
	selector.fill(partnersList);
	sounds.playSound(Sound.SPEEDUP);
});
selector.select.addEventListener('change', function(socket_id) {
	socket.emit('partner choosed', socket_id.target.value);
	sounds.playSound(Sound.SPEEDUP);
});

// Confipm partner
socket.on('confipm partner', function(partner) {
	if (controls.gameStatus != GameStatus.PAUSED) {
		controls.pause();
	}
	sounds.playSound(Sound.SPEEDUP);
	const yes = confirm('Player '+partner[1]+' wants to join your game');
	if (yes) {
		socket.emit('partner confirmation', partner[0]);
		controls.new();
	} else {
		controls.pause();
		socket.emit('refusal', partner[0]);
	}
});

// Alert 'partner unavailable'
socket.on('partner unavailable', function() {
	controls.pause();
	sounds.playSound(Sound.SPEEDUP);
	alert('Sorry, partner is unavailable');
	controls.pause();
});

// Pong events
socket.on('pong launched', function() {
	if (image.valid()) {
		if (controls.lastCmd == GameCmd.TRNNG || 
			controls.lastCmd == GameCmd.AUTO)
		{
			setTimeout(function() {
			controls.emitCmd(controls.lastCmd);
			}, Image.rendering_period );
		}
		renderTimer = setInterval(function() {
			socket.emit('state');
		}, Image.rendering_period);
	}
});
socket.on('state', function(state) {
	sounds.play(state);
	controls.colorizeButtons(state);
	image.render(state, score.get(state));
	if (score.mode == GameMode.STOPPING) {
		controls.stop();
	}
});
socket.on('pong deleted', function() {
	sounds.playSound(Sound.SPEEDUP);
	controls.normalizeButtons();
	score.clear();
	clearInterval(renderTimer);
	image.clear();
});

socket.on('disconnect', function() {
	clearInterval(renderTimer);
});
