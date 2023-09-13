import path from 'path';
import { Options } from './static/options.js';
import express from 'express';
import * as url from 'url';
import bodyParser from 'body-parser';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export class UserData {
    constructor(app) {
        this.nickname = '';
        this.id = '';
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.get('/', (request, response) => {
            if (request && request.query) {
                this.nickname = request.query['nickname'];
                this.id = request.query['id'];
            }
            response.header('Content-Type: text/html');
            response.sendFile(path.join(__dirname, '/html/index.html'));
        });
        app.post('/', (request, response) => {
            if (request && request.body) {
                this.nickname = request.body['nickname'];
                this.id = request.body['id'];
            }
            response.header('Content-Type: text/html');
            response.sendFile(path.join(__dirname, '/html/index.html'));
        });
    }
    getNickname() {
        const nick = this.nickname;
        this.nickname = '';
        return nick;
    }
    getId() {
        const id = this.id;
        this.id = '';
        return id;
    }
}
export function routes(app) {
    app.set('port', Options.port);
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
