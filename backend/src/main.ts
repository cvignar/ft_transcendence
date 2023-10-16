import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
//import {Z} from 'nestjs-zod';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync('/ssl/ft_transcendence.key'),
		cert: fs.readFileSync('/ssl/ft_transcendence.crt'),
	}
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		httpsOptions,
	});

	const config = new DocumentBuilder()
		.setTitle('ft_transcendence')
		.setDescription('The ft_transcendence description')
		.setVersion('1.0')
		.addTag('pong72')
		.build();

	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			methodKey,
	};

	const document = SwaggerModule.createDocument(app, config, options);
	SwaggerModule.setup('api', app, document);

	app.useGlobalPipes(new ZodValidationPipe());

	const whitelist = [
		`https://${process.env.FRONT_HOST}`,
		`https://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}`,
		`https://${process.env.PONG_HOST}`,
		`https://${process.env.PONG_HOST}:${process.env.PONG_PORT}`,
		`https://${process.env.HOST_NAME}`,
		`https://${process.env.HOST_NAME}:${process.env.FRONT_PORT}`,
		`https://${process.env.HOST_NAME}:${process.env.PONG_PORT}`,
	];

	const corsOptions = {
		credentials: true,
		origin: (origin, callback) => {
			if (whitelist.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error(`${origin} Not allowed by CORS`));
			}
		},
	};

	app.enableCors(corsOptions);
	app.use(function (
		request: Request,
		response: Response,
		next: NextFunction,
	) {
		response.setHeader('Access-Control-Allow-Credentials', 'true');
		response.setHeader(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept',
		);
		next();
	},
	cookieParser());

	await app.listen(3000);
}
bootstrap();
