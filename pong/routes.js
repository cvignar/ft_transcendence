import path from 'path';
import express from 'express';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export function routes(app, port) {
    app.set('port', port);
    app.use('/', express.static(__dirname + '/html'));
    app.use('/static', express.static(__dirname + '/static'));
    app.use('/sounds', express.static(__dirname + '/sounds'));
    app.get('/', function (request, response) {
        response.header('Content-Type: text/html');
        response.sendFile(path.join(__dirname, '/html/index.html'));
    });
    app.get('/socket.io.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/node_modules/socket.io/client-dist/socket.io.js'));
    });
    app.get('/socket.io.js.map', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/node_modules/socket.io/client-dist/socket.io.js.map'));
    });
    app.get('/game.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/static/game.js'));
    });
    app.get('/controls.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/static/controls.js'));
    });
    app.get('/image.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/static/image.js'));
    });
    app.get('/options.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/static/options.js'));
    });
    app.get('/common.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/static/common.js'));
    });
    app.get('/geometry.js', function (request, response) {
        response.header('Content-Type: text/javascript');
        response.sendFile(path.join(__dirname, '/static/geometry.js'));
    });
}
