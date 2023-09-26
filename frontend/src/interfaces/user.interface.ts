import { GameScheme, Side } from '../../../pong/static/common';

export interface Profile {
	id: number;
	updatedAt: Date;
	email: string;
	username: string;
	avatar: string;
	twoFA: boolean;
	prefferedTableSide: Side;
	pongColorScheme: GameScheme;
	gamesWon: number;
	gamesLost: number;
	gamesPlayed: number;
	gameHistory: number[];
	winRate: number;
	playTime: number;
	score: number;
	rank: number;
	friends: number[];
	adding: number[];
	added: number[];
	blocks: number[];
	blocking: number[];
	blocked: number[];
}

export interface UpdateUser {
	id: number | null;
	username: string | undefined;
	avatar: string | undefined;
	prefferedTableSide: Side;
	pongColorScheme: GameScheme;
}