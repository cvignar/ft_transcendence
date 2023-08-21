import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUserById(id: string): Promise<UserModel>;
    signupUser(userData: {
        id: string;
        username?: string;
        email: string;
    }): Promise<UserModel>;
}
