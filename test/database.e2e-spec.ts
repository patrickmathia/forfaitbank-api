import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";

describe("AppController (e2e)", () => {
	let app: INestApplication;
	let prisma: PrismaService;

	jest.setTimeout(30000);

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
			})
		);

		await app.init();
		await app.listen(3300);

		prisma = app.get(PrismaService);
		pactum.request.setBaseUrl("http://localhost:3300");
		pactum.request.setDefaultTimeout(30000);
	});

	afterAll(async () => {
		await prisma.$disconnect();
		app.close();
	});

	describe("Database", () => {
		it("should stop", async () => {
			return await pactum
				.spec()
				.get("/db/stop")
				.expectStatus(200)
				.expectBodyContains("Testing database stopped successfully.");
		});

		it("should start", async () => {
			return await pactum
				.spec()
				.get("/db/start")
				.expectStatus(200)
				.expectBodyContains("Testing database started successfully.");
		});

		it("should restart", async () => {
			return await pactum
				.spec()
				.get("/db/restart")
				.expectStatus(200)
				.expectBodyContains("Testing database restarted successfully.");
		});
	});
});
