import {z as zod} from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

const SaveGameSchema = zod.object({
	player1: zod.number().int(),
	player2: zod.number().int(),
	score1: zod.number().int(),
	score2: zod.number().int(),
	startTime: zod.number(),
	endTime: zod.number(),
	duration: zod.number()
});

export namespace SaveGame {
	export class Request extends createZodDto(SaveGameSchema) {}
}