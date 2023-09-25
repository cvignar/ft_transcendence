export enum Side {
	NO,
	BOTTOM,
	TOP,
	RIGHT,
	LEFT,
}

export enum GameScheme {
	GENERAL,
	REVERSE,
}

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
	gamesPlayed: number;
	gameHistory: number;
	winRate: number;
	playTime: number;
	score: number;
	rank: number;
}