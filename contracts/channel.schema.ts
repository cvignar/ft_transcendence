import { string, z as zod } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from './user.schema';
import { MuteSchema } from './mute.schema';
import { MessageSchema } from './message.schema';
import { typeEnum } from './enums';
export const DirectChannelSchema = zod.object({
	channelId: zod.number(),
	userId: zod.number(),
});

export namespace DirectChannel {
	export class Request extends createZodDto(DirectChannelSchema) {}
}

export const MemberSchema = zod.object({
		id: zod.number().int(),
		name: zod.string()
	});

export const ChannelSchema = zod.object({
	id: zod.number().int(),
	name: zod.string().max(32),
	picture: zod.string().optional(),
	createdAt: zod.date().default(new Date('now')),
	updatedAt: zod.date(),
	type: zod.nativeEnum(typeEnum),
	password: zod.password().optional(),
	owners: zod.array(UserSchema),
	admins: zod.array(UserSchema),
	members: zod.array(UserSchema),
	inviteds: zod.array(UserSchema),
	blocked: zod.array(UserSchema),
	muted: zod.array(MuteSchema),
	messages: zod.array(MessageSchema),
});

export const whiteSpaceResExp = new RegExp('/\s/');

const CreateChannelSchema = zod.object({
	name: zod.string(),
	type: zod.nativeEnum(typeEnum),
	password: zod.password().optional().nullable(),
	email: zod.string().email(),
	members: zod.array(zod.object({
		id: zod.number().int(),
		name: zod.string(),
	})),
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

export namespace CreateChannel {
	export class Request extends createZodDto(CreateChannelSchema) {
		
	}
}

const CreateDirectChannelSchema = zod.object({
	id: zod.number().int(),
	email: zod.string().email(),
});
export namespace CreateDirectChannel {
	export class Request extends createZodDto(CreateDirectChannelSchema) {}
}

const UpdateChannelSchema = zod.object({
	id: zod.number().int(),
	type: zod.nativeEnum(typeEnum),
	email: zod.string().email(),
	password: zod.password().min(1).nullable(),
	memberId: zod.number().int().default(-1),
	newPassword: zod.password().nullable(),
});

export namespace UpdateChannel {
	export class Request extends createZodDto(UpdateChannelSchema) {}
}

const ChannelPreviewSchema = zod.object({
	id: zod.number(),
	type: zod.nativeEnum(typeEnum),
	name: zod.string(),
	picture: zod.string(),
	updatedAt: zod.string(),
	lastMessage: zod.string(),
	unreadCount: zod.number().optional(),
	ownerEmail: zod.string(),
	ownerId: zod.number()
});

export namespace ChannelPreview {
	export class Response extends createZodDto(ChannelPreviewSchema) {}
}

const SearchPreviewSchema = zod.object({
	id: zod.number().int(),
	key: zod.number().int(),
	name: zod.string(),
	picture: zod.string(),
	tag: zod.string(),
	type: zod.string(),
});

export namespace SearchPreview {
	export class Response extends createZodDto(SearchPreviewSchema) {}
}