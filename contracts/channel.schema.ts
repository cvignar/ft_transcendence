import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { MuteSchema } from './mute.schema';
import { MessageSchema } from './Message.schema';

export enum typeEnum {
	DIRECT = 'direct',
	PRIVATE = 'private',
	PROTECTED = 'protected',
	PUBLIC = 'public',
}

// const ChannelTypeEnum = z.nativeEnum(typeEnum);

export const ChannelSchema = z.object({
	id: z.number().int(),
	name: z.string().max(32),
	picture: z.string(),
	type: z.nativeEnum(typeEnum),
	password: z.password().optional(),
	email: z.string(),
	owners: UserSchema.array(),
	admins: UserSchema.array(),
	members: UserSchema.array(),
	invited: UserSchema.array(),
	banned: UserSchema.array(),
	muted: MuteSchema.array(),
	messages: MessageSchema.array(),
});

const CreateProtectedChannelSchema = ChannelSchema.pick({
	name: true,
	type: true,
	password: true,
	email: true,
	members: true,
});

export namespace CreateProtectedChannel {
	export class Request extends createZodDto(CreateProtectedChannelSchema) {}
}

const CreateChannelSchema = CreateProtectedChannelSchema.omit({
	password: true,
});

export namespace CreateChannel {
	export class Request extends createZodDto(CreateChannelSchema) {
		
	}
}

const CreateDirectMessagesChannelSchema = ChannelSchema.pick({
	id: true,
	email: true,
});
export namespace CreateDirectMessagesChannel {
	export class Request extends createZodDto(CreateChannelSchema) {}
}

const UpdateChannelSchema = z.object({
	channelId: z.number(),
	type: z.nativeEnum(typeEnum),
	email: z.string().email(),
	password: z.password(),
	memberId: z.number(),
	verifyPassword: z.password(),
});

export namespace UpdateChannel {
	export class Request extends createZodDto(UpdateChannelSchema) {}
}

