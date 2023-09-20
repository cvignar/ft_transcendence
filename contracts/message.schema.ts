import { z, z as zod} from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { ChannelSchema } from './channel.schema';

export const MessageSchema = zod.object({
	id: zod.number().int(),
	msg: zod.string(),
	//history: zod.string().array(),
	//unsent: zod.boolean().default(false),
	createdAt: zod.date().default(new Date('now')),
	//updatedAt: zod.date(),
	owner: UserSchema,
	userId: zod.number().int(),
	channel: ChannelSchema,
	cid: zod.number().int(),
});


const NewMessageSchema = zod.object({
	//id: zod.number().int(),
	message: zod.string(),
	email: zod.string().email(),
	channelId: zod.number().int(),
})

export namespace CreateMessage {
	export class Request extends createZodDto(NewMessageSchema) {}
}

const MessagePreviewSchema = zod.object({
	id: zod.number().int(),
	msg: zod.string(),
	createdAt: zod.date(),
	updatedAt: zod.date(),
	ownerName: zod.string(),
	ownerId: zod.number().int(),
	channelId: zod.number().int(),
	email: zod.string().email(),
	invite: zod.boolean(),
});

export namespace MessagePreview {
	export class Response extends createZodDto(MessagePreviewSchema) {}
}