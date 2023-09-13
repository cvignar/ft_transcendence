import { Injectable } from '@nestjs/common';
import { PrismaService } from 'backend/src/prisma/prisma.service';

@Injectable()
export class OAuthService {
	constructor(private prisma: PrismaService) {}

	async login(user: any) {}
}
