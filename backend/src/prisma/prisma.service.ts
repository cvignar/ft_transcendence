import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	[x: string]: any;
	private _message: any;
	public get message(): any {
		return this._message;
	}
	public set message(value: any) {
		this._message = value;
	}
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.get('DATABASE_URL'),
				},
			},
		});
	}

	async onModuleInit() {
		await this.$connect();
	}
}
