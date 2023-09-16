import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { ChannelSchema } from './channel.schema';

export const MessageSchema = z.object({
	id: z.number().int(),
	msg: z.string(),
	history: z.string().array(),
	unsent: z.boolean().default(false),
	createdAt: z.date().default(new Date('now')),
	updatedAt: z.date(),
	owner: UserSchema,
	userId: z.number().int(),
	channel: ChannelSchema,
	cid: z.number().int(),
});



const CreateMessageSchema = z.object({
	email: z.string().email(),
});
