import { DatabaseService } from "./database.service";
import { Controller, Get } from "@nestjs/common";

@Controller("db")
export class DatabaseController {
	constructor(private dbService: DatabaseService) {}

	@Get("start")
	startTestDb() {
		return this.dbService.startDb();
	}

	@Get("stop")
	stopTestDb() {
		return this.dbService.stopDb();
	}

	@Get("restart")
	restartTestDb() {
		return this.dbService.restartDb();
	}
}
