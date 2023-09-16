import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { ChannelSchema } from './channel.schema';

export const MuteSchema = z.object({
	id: z.number().int(),
	finishAt: z.date(),
	checkAt: z.date().default(new Date('now')),
	finished: z.boolean().default(false),
	muted: UserSchema,
	userId: z.number().int(),
	channel: ChannelSchema,
	cid: z.number().int(),
});
