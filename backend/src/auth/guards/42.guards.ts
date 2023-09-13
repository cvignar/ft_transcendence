// import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";

// @Injectable()
// export class FourtyTwoGuard extends AuthGuard("42") {
// 	async canActivate(context: ExecutionContext): Promise<boolean> {
// 		const result = (await super.canActivate(context)) as boolean;
// 		// const request = context.switchToHttp().getRequest();
// 		// await super.logIn(request);
// 		return result;
// 	}
// }







// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';

// @Injectable()
// export class FtOauthGuard extends AuthGuard('42') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const activate: boolean = (await super.canActivate(context)) as boolean;
//     const request: Request = context.switchToHttp().getRequest();
//     await super.logIn(request);
//     return activate;
//   }
// }

// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Request } from 'express';

// @Injectable()
// export class AuthenticatedGuard implements CanActivate {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req: Request = context.switchToHttp().getRequest();
//     return req.isAuthenticated();
//   }
// }