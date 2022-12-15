import { TestingService } from "./testing.service";
import { Controller, Get } from "@nestjs/common";

@Controller("testing")
export class TestingController {
	constructor(private testingService: TestingService) {}

	@Get("start")
	startTestDb() {
		return this.testingService.startDb();
	}

	@Get("stop")
	stopTestDb() {
		return this.testingService.stopDb();
	}

	
	@Get("restart")
	restartTestDb() {
		return this.testingService.restartDb();
	}
}
