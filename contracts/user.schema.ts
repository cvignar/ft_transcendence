import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

const UserSchema = z.object({
	id: z.number().int(),
	username: z.string(),
	email: z.string().email({message: 'invalid email'}),
});

export namespace CreateUser {
	export class Request extends createZodDto(UserSchema) {}
}

