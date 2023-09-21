var _a, _b, _c, _d;
export class Options {
}
_a = Options;
Options.port = 12080;
Options.host = '10.12.4.10';
Options.pong_server = 'ws://' + _a.host + ':' + _a.port.toString();
Options.pong_httpServer = 'http://' + _a.host + ':' + _a.port.toString();
Options.width = 800;
Options.maxWins = 6;
Options.serveNum = 2;
Options.debug = true;
Options.height = Math.round(_a.width / 4) * 3;
Options.header = 'Pong ' + _a.width.toString() + ':' + _a.height.toString();
Options.line_width = Math.round(_a.width / 200);
Options.ball_radius = 2 * _a.line_width;
Options.paddle_width = _a.line_width;
Options.paddle_height = 16 * _a.line_width;
Options.paddle_zones = 8;
Options.paddle_zoneHeight = _a.paddle_height / _a.paddle_zones;
Options.paddleStart_yPos = Math.round(_a.height / 2) - Math.round(_a.paddle_height / 2);
Options.leftPaddle_xPos = _a.paddle_width;
Options.rightPaddle_xPos = _a.width - 2 * _a.paddle_width;
export class PongOptions extends Options {
}
_b = PongOptions;
PongOptions.fieldOfBallCenter_xPos = _b.leftPaddle_xPos + _b.paddle_width + _b.ball_radius;
PongOptions.fieldOfBallCenter_yPos = _b.ball_radius;
PongOptions.fieldOfBallCenter_width = _b.width - 2 * _b.fieldOfBallCenter_xPos;
PongOptions.fieldOfBallCenter_heigth = _b.height - 2 * _b.ball_radius;
PongOptions.limitField_offset = _b.width;
PongOptions.limitField_xPos = -_b.limitField_offset;
PongOptions.limitField_yPos = -_b.limitField_offset;
PongOptions.limitField_width = _b.width + 2 * _b.limitField_offset;
PongOptions.limitField_heigth = _b.height + 2 * _b.limitField_offset;
PongOptions.paddle_yPosLimit = _b.height - Math.round((_b.paddle_height * 3) / 2);
PongOptions.ball_startXpos = Math.round(_b.width / 2);
PongOptions.ball_startYposMin = _b.paddle_height;
PongOptions.ball_startYposMax = _b.height - 2 * _b.paddle_height;
PongOptions.ball_startSpeed = 100 * _b.line_width;
PongOptions.ball_StartClicksForSpeedup = 12;
PongOptions.ball_speedUp = 1.2;
PongOptions.ball_speedUpMax = 6;
PongOptions.calculation_period = 1000 / 60;
export class ControlOptions extends Options {
}
_c = ControlOptions;
ControlOptions.key_space = 32;
ControlOptions.key_a = 65;
ControlOptions.key_n = 78;
ControlOptions.key_s = 83;
ControlOptions.key_t = 84;
ControlOptions.key_arrowUp = 38;
ControlOptions.key_arrowDown = 40;
ControlOptions.paddle_keyMove = Math.round(_c.paddle_height / 8);
ControlOptions.key_interval = 1000 / 100;
ControlOptions.game_startTime = 1000;
export class ImageOptions extends Options {
}
_d = ImageOptions;
ImageOptions.color_back = 'black';
ImageOptions.color_dividingNet = 'Silver';
ImageOptions.color_ball = 'white';
ImageOptions.color_paddle = 'white';
ImageOptions.color_score = 'Silver';
ImageOptions.dividingNet_width = _d.line_width;
ImageOptions.dividingNet_xPos = Math.round(_d.width / 2 - _d.dividingNet_width / 2);
ImageOptions.score_yPos = 4 * _d.line_width;
ImageOptions.scoreLeft_xPos = _d.dividingNet_xPos - 4 * _d.line_width;
ImageOptions.scoreRight_xPos = _d.dividingNet_xPos + _d.dividingNet_width + 4 * _d.line_width;
ImageOptions.score_fontSize = 18 * _d.line_width;
ImageOptions.score_font = _d.score_fontSize.toString() + 'px ' + 'Courier Prime';
ImageOptions.score_font1 = _d.score_fontSize.toString() + 'px ' + 'Share Tech Mono';
ImageOptions.score_font2 = _d.score_fontSize.toString() + 'px ' + 'VT323';
ImageOptions.rendering_period = 1000 / 100;
