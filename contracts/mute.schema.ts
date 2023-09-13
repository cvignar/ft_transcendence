import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { ChannelSchema } from './channel.schema';

export const MuteSchema = z.object({
	id: z.number().int(),
	finishAt: z.dateString(),
	checkAt: z.dateString(),
	finished: z.boolean(),
	user: UserSchema,
	userId: z.number().int(),
	channel: ChannelSchema,
	channelId: z.number().int(),
});
