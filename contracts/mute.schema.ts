import { z as zod } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { ChannelSchema } from './channel.schema';

export const MuteSchema = zod.object({
	id: zod.number().int(),
	finishAt: zod.date(),
	checkAt: zod.date().default(new Date('now')),
	finished: zod.boolean().default(false),
	muted: UserSchema,
	userId: zod.number().int(),
	channel: ChannelSchema,
	cid: zod.number().int(),
});