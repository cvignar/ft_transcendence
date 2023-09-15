import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
//import {Z} from 'nestjs-zod';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('The ft_transcendence description')
    .setVersion('1.0')
    .addTag('pong72')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();

  //const { httpAdapter } = app.get(HttpAdapterHost);
  //app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  //app.get(PrismaService);
  await app.listen(3000);
}
bootstrap();
