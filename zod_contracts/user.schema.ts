import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

const UserSchema = z.object({
	id: z.number().int(),
	username: z.string(),
	email: z.string().email({message: 'invalid email'}),
	avatar: z.string().max(65_000), //optional
	gamesWon: z.number().int(),
	gamesLost: z.number().int(),
	gamesPlayed: z.number().int(),
	rank: z.number().int(),
	score: z.number().int(),
	added: z.array(z.number().int()),
	adding: z.array(z.number().int()),
	friends: z.array(z.number().int()),
	blocked: z.array(z.number().int()),
	blocking: z.array(z.number().int()),
	blocks: z.array(z.number().int()),
	// @Exclude()
	hash: z.string(),
	// @Exclude()
	hashedRtoken: z.string(),
});


/** 
 * @description
 * This is the schema for the request body of the POST /user/create endpoint.
 */

const CreateUserSchema = UserSchema.pick({
	id: true,
	username: true,
	email: true,
	hash: true,
});

export namespace CreateUser {
	export class Request extends createZodDto(CreateUserSchema) {}
}

/**
 * @description
 * This is the schema for the request body of the POST /user/update_username endpoint.
*/

const UpdateUsernameSchema = UserSchema.pick({
	id: true,
	username: true,
});

export namespace UpdateUsername {
	export class Request extends createZodDto(UpdateUsernameSchema) {}
}

/**
 * @description
 * This is the schema for the request body of the POST /user/update_email endpoint.
 */

const UpdateEmailSchema = UserSchema.pick({
	id: true,
	email: true,
});

export namespace UpdateEmail {
	export class Request extends createZodDto(UpdateEmailSchema) {}
}

/**
 * @description
 * This is the schema for the request body of the POST /user/update_avatar endpoint.
 */

const UpdateAvatarSchema = UserSchema.pick({
	id: true,
	avatar: true,
});

export namespace UpdateAvatar {
	export class Request extends createZodDto(UpdateAvatarSchema) {}
}
