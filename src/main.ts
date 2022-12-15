import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: "*",
			credentials: true,
			allowedHeaders: "*",
			optionsSuccessStatus: 200,
		},
	});
	await app.listen(3000);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		})
	);
}
bootstrap();
