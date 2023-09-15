import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

export enum Status {
  online = 'online',
  offline = 'offline',
  playing = 'playing'
}

export const UserSchema = z.object({
  id: z.number().int(),
  username: z.string().max(32),
  email: z.string().email({ message: 'Invalid email' }),
  hash: z.string(),
});

// export class UserDTO extends createZodDto(UserSchema) {}

export namespace CreateUser {
  export class Request extends createZodDto(UserSchema) {}
}

const UpdateUsernameSchema = UserSchema.pick({ username: true });

export namespace UpdateUsername {
  export class Request extends createZodDto(UpdateUsernameSchema) {}
}

const UpdateEmailSchema = UserSchema.pick({ email: true });

export namespace UpdateUser {
  export class Request extends createZodDto(UpdateEmailSchema) {}
}
