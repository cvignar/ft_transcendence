import { BrowserMsg, GameCmd, GameMode, GameStatus, ServerMsg, Sound } from './common.js';
import { Controls, Selector } from './controls.js';
import { Score, Image, Sounds } from './image.js';
import { PongOptions } from './options.js';

var socket = io();
var nickname = '';
var renderTimer = 0;
var serverPollTimer = 0;
var browserState = new ServerMsg();
const controls = new Controls(socket);
const selector = new Selector('PARTNERS');
const image = new Image('canvas');
const sounds = new Sounds();
const score = new Score();

// Mouse controls
var canvas = document.getElementById('canvas');
canvas.addEventListener('mousemove', function(mouse) {
	image.mouseOn = true;
	controls.mousemove(mouse.offsetY);
	image.mousemove(mouse.offsetY);
	image.mouseOn = false;
});
canvas.addEventListener('click', function() {
	controls.pause();
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
	var pauseBefor = true;
	if (controls.gameStatus != GameStatus.PAUSED) {
		pauseBefor = false;
		controls.pause();
	}
	sounds.playSound(Sound.SPEEDUP);
	const yes = confirm('Player '+partner[1]+' wants to join your game');
	if (yes) {
		socket.emit('partner confirmation', partner[0]);
		controls.new();
	} else {
		if (!pauseBefor) {
			controls.pause();
		}
		socket.emit('refusal', partner[0]);
	}
});

// Alert 'partner unavailable'
socket.on('partner unavailable', function() {
	var pauseBefor = true;
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

// Pong events
socket.on('pong launched', function() {
	if (image.valid()) {
		if (controls.lastCmd == GameCmd.TRNNG || 
			controls.lastCmd == GameCmd.AUTO)
		{
			setTimeout(function() {
			controls.emitCmd(controls.lastCmd);
			}, PongOptions.calculation_period );
		}
		renderTimer = setInterval(function() {
			sounds.play(browserState);
			controls.colorizeButtons(browserState);
			image.render(browserState, score.get(browserState), controls.msg);
		}, Image.rendering_period);
	}
});
socket.on('state', function(state) {
		browserState.copy(state);
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
