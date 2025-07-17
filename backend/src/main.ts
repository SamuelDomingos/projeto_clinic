import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir acesso de outros computadores
  app.enableCors({
    origin: true, // Permite todas as origens
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
