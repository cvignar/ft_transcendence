import { z as zod } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ChannelSchema } from './channel.schema';
import { MuteSchema } from './mute.schema';
import { MessageSchema } from './message.schema';
import { Status } from './enums';
import { GameScheme, Side } from '../pong/static/common';

export const CreateUserSchema = zod.object({
  id: zod.number().int(),
  username: zod.string().max(32),
  email: zod.string().email({ message: 'Invalid email' }),
  hash: zod.string(),
});

export namespace CreateUser {
  export class Request extends createZodDto(CreateUserSchema) {}
}

const UpdateUsernameSchema = CreateUserSchema.pick({ username: true });

export namespace UpdateUsername {
  export class Request extends createZodDto(UpdateUsernameSchema) {}
}

const UpdateEmailSchema = CreateUserSchema.pick({ email: true });

export namespace UpdateUser {
  export class Request extends createZodDto(UpdateEmailSchema) {}
}

export const UserSchema = zod.object({
  id: zod.number(),
  id42: zod.number(),
  createdAt: zod.date().default(new Date('now')),
  updatedAt: zod.date(),
  email: zod.string().email(),
  username: zod.string(),  
  hash: zod.password(),
  avatar: zod.string().optional(),
  hashedRtoken: zod.string().optional(),
  twoFAsecret: zod.string().optional(),
  twoFA: zod.boolean().default(false),
  prefferedTableSide: zod.nativeEnum(Side).default(Side.RIGHT),
  pongColorScheme: zod.nativeEnum(GameScheme).default(GameScheme.GENERAL),
  gamesWon: zod.number().int().default(0),
  gamesLost: zod.number().int().default(0),
  gamesPlayed: zod.number().int().default(0),
  gameHistory: zod.number().array(),
  winRate: zod.number().optional(),
  playTime: zod.number().int().default(0),
  score: zod.number().int().default(0),
  rank: zod.number().int().optional(),
  friends: zod.number().int().array(),
  adding: zod.number().int().array(), 
  added: zod.number().int().array(),
  blocks: zod.number().int().array(),
  blocking: zod.number().int().array(),
  blocked: zod.number().int().array(),
  owner: zod.array(ChannelSchema),
  admin: zod.array(ChannelSchema),
  member: zod.array(ChannelSchema),
  invited: zod.array(ChannelSchema),
  chanBlocked: zod.array(ChannelSchema),
  Muted: zod.array(MuteSchema),
  messages: zod.array(MessageSchema),
  jwtAccess: zod.string().default(""),
});

export namespace User {
  export class response extends createZodDto(UserSchema) {}
}

const MemberPreviewSchema = zod.object({
  id: zod.number().int(),
  username: zod.string(),
  avatar: zod.string(),
  email: zod.string().email(),
  status: zod.nativeEnum(Status).default(Status.offline),
  isOwner: zod.boolean().default(false),
  isAdmin: zod.boolean().default(false),
  isInvited: zod.boolean().default(false),
  isBlocked: zod.boolean().default(false),
  isMuted: zod.boolean().default(false),
  isFriend: zod.boolean().default(false),
});

export namespace MemberPreview {
  export class Response extends createZodDto(MemberPreviewSchema) {}
}

const ProfileSchema = zod.object({
  id: zod.number().int(),
  id42: zod.number().int(),
	updatedAt: zod.date(),
	email: zod.string().email(),
	username: zod.string(),
	avatar: zod.string(),
	twoFA: zod.boolean(),
	prefferedTableSide: zod.nativeEnum(Side).default(Side.RIGHT),
	pongColorScheme: zod.nativeEnum(GameScheme).default(GameScheme.GENERAL),
	gamesWon: zod.number().int(),
  gamesLost: zod.number().int(),
	gamesPlayed: zod.number().int(),
	gameHistory: zod.array(zod.number()),
	winRate: zod.number(),
	playTime: zod.number(),
	score: zod.number(),
	rank: zod.number(),
	friends: zod.array(zod.number()),
	adding: zod.array(zod.number()),
	added: zod.array(zod.number()),
	blocks: zod.array(zod.number()),
	blocking: zod.array(zod.number()),
	blocked: zod.array(zod.number()),
});

export namespace Profile {
  export class Response extends createZodDto(ProfileSchema) {}
}