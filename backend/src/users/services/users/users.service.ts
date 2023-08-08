import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {

	users = [
		{
			id: 1,
			name: 'John',
			email: 'john@mail.com',
			password: '001',
		},
		{
			id: 2,
			name: 'Doe',
			email: 'doe@mail.com',
			password: '002',
		},
		{
			id: 3,
			name: 'Jane',
			email: 'jane@mail.com',
			password: '003',
		},
	];

	findUser(id: number) {
		return this.users.find((user) => user.id === id);
	}
}
