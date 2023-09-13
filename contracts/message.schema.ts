import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { ChannelSchema } from './channel.schema';

export const MessageSchema = z.object({
	id: z.number().int(),
	msg: z.string(),
	owner: UserSchema,
	ownerId: z.number().int(),
	channel: ChannelSchema,
	channelId: z.number().int(),
});



const CreateMessageSchema = z.object({
	email: z.string().email(),
});
