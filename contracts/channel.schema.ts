import { number, z } from 'nestjs-zod/z';
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

export const CreateDirectChannelSchema = z.object({
	channelId: z.number(),
	userId: z.number(),
});

export namespace CreateDirectChannel {
	export class Request extends createZodDto(CreateDirectChannelSchema) {}
}

export const MemberSchema = z.object({
		id: z.number().int(),
		name: z.string()
	});

export const ChannelSchema = z.object({
	name: z.string().max(32),
	picture: z.string().optional(),
	type: z.nativeEnum(typeEnum),
	password: z.password().optional(),
	email: z.string().email(),
	members: MemberSchema.array(),
	owners: UserSchema.array(),
	//admins: UserSchema.array(),
	//invited: UserSchema.array(),
	//banned: UserSchema.array(),
	//muted: MuteSchema.array(),
	//messages: MessageSchema.array(),
});

const CreateProtectedChannelSchema = ChannelSchema.pick({
	name: true,
	type: true,
	password: true,
	email: true,
	members: true,
});

//export namespace CreateProtectedChannel {
//	export class Request extends createZodDto(CreateProtectedChannelSchema) {}
//}

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
	invitedId: z.number(),
	newPassword: z.password(),
});

export namespace UpdateChannel {
	export class Request extends createZodDto(UpdateChannelSchema) {}
}

const ChannelPreviewSchema = z.object({
	id: z.number(),
	type: z.nativeEnum(typeEnum),
	name: z.string(),
	updatedAt: z.string(),
	lastMessage: z.string(),
	unreadCount: z.number().optional(),
	ownerEmail: z.string(),
	ownerId: z.number()
});

export namespace ChannelPreview {
	export class Request extends createZodDto(ChannelPreviewSchema) {}
}