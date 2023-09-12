import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';




const CreateUserSchema = z.object({
	username: z.string(),
	hash: z.password(),
	email: z.string().email(),
	id42: z.number()
})

export namespace CreateUser {
	export class Request extends createZodDto(CreateUserSchema) {}
}
