import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}
	@Get('/search/:id')
	searchUserByName(@Param('id', ParseIntPipe) id: number) {
		const user = this.usersService.findUser(id);
		if (user) return user;
		else throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
	}
}
