import { ExecutionContext, Injectable, ContextType } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

	// handleRequest(context: ExecutionContext) {
	// 	const req = context.switchToHttp().getRequest();
	// 	console.log(req.user)
	// 	const user = req.user;
	// 	if (!user) {
	// 		console.log('computer says no');
	// 		throw new UnauthorizedException("Unauthorised");
	// 	}
	// 	return user;
	// }
}
