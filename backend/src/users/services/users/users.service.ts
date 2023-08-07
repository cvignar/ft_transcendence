import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
	findUser() {
		return {
			email: "example@mail.com",
			password: "1234567",
		};
	}
}
