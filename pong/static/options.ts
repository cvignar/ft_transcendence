//import { config } from 'dotenv'
//config();
export class Options {
	static width: number = 800;
	static maxWins: number = 6;
	static serveNum: number = 2;
	static debug: boolean = false;
	static height: number = Math.round(this.width / 4) * 3;
	static header: string =
		'Pong ' + this.width.toString() + ':' + this.height.toString();
	static line_width: number = Math.round(this.width / 200);
	static ball_radius: number = 2 * this.line_width;
	static paddle_width: number = this.line_width;
	static paddle_height: number = 16 * this.line_width;
	static paddle_zones: number = 8;
	static paddle_zoneHeight: number = this.paddle_height / this.paddle_zones;
	static paddleStart_yPos: number =
		Math.round(this.height / 2) - Math.round(this.paddle_height / 2);
	static leftPaddle_xPos: number = this.paddle_width;
	static rightPaddle_xPos: number = this.width - 2 * this.paddle_width;
}

export class PongOptions extends Options {
	static fieldOfBallCenter_xPos: number =
		this.leftPaddle_xPos + this.paddle_width + this.ball_radius;
	static fieldOfBallCenter_yPos: number = this.ball_radius;
	static fieldOfBallCenter_width: number =
		this.width - 2 * this.fieldOfBallCenter_xPos;
	static fieldOfBallCenter_heigth: number = this.height - 2 * this.ball_radius;
	static limitField_offset: number = this.width;
	static limitField_xPos: number = -this.limitField_offset;
	static limitField_yPos: number = -this.limitField_offset;
	static limitField_width: number = this.width + 2 * this.limitField_offset;
	static limitField_heigth: number = this.height + 2 * this.limitField_offset;
	static paddle_yPosLimit: number =
		this.height - Math.round((this.paddle_height * 3) / 2);
	static ball_startXpos: number = Math.round(this.width / 2);
	static ball_startYposMin: number = this.paddle_height;
	static ball_startYposMax: number = this.height - 2 * this.paddle_height;
	static ball_startSpeed: number = 100 * this.line_width;
	static ball_StartClicksForSpeedup: number = 12;
	static ball_speedUp: number = 1.2;
	static ball_speedUpMax: number = 6;
	static calculation_period: number = 1000 / 60;
	static sendResult_period: number = 1000;
	static tokenRequest_period: number = 179990000;// 300 min
	static playerDisconnect_timeout: number = 1000 * 20;// 20 sec
}

export class ControlOptions extends Options {
	static key_space: number = 32;
	static key_a: number = 65;
	static key_n: number = 78;
	static key_s: number = 83;
	static key_t: number = 84;
	static key_arrowUp: number = 38;
	static key_arrowDown: number = 40;
	static paddle_keyMove: number = Math.round(this.paddle_height / 8);
	static key_interval: number = 1000 / 100;
	static game_startTime: number = 500;

}

export class ImageOptions extends Options {
	static color_back: string = 'black';
	static color_dividingNet: string = 'Silver';
	static color_ball: string = 'white';
	static color_paddle: string = 'white';
	static color_score: string = 'Silver';

	static dividingNet_width: number = this.line_width;
	static dividingNet_xPos: number = Math.round(this.width / 2 - this.dividingNet_width / 2);
	static score_yPos: number = 4 * this.line_width;
	static scoreLeft_xPos: number = this.dividingNet_xPos - 4 * this.line_width;
	static scoreRight_xPos: number = this.dividingNet_xPos + this.dividingNet_width + 4 * this.line_width;
	static score_fontSize: number = 18 * this.line_width;
	static score_font: string = this.score_fontSize.toString() + 'px ' + 'Courier Prime';
	static score_font1: string = this.score_fontSize.toString() + 'px ' + 'Share Tech Mono';
	static score_font2: string = this.score_fontSize.toString() + 'px ' + 'VT323';
	static msg_fontSize: number = 12 * this.line_width;
	static msg_yPos: number = this.height / 5 * 2;
	static msg_xPos: number = this.width / 2;
}
