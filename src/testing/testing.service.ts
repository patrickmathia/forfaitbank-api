import { Injectable } from "@nestjs/common";
import { exec } from "child_process";
import * as util from "util";

@Injectable()
export class TestingService {
	execute = util.promisify(exec);

	private async run(cmd: string, response: { msg: string }) {
		const resolve = ({ stdout, stderr }) => {
			console.log(stdout, stderr);
			return response;
		};

		const reject = ({ reason }) => {
			return reason;
		};
		return await this.execute(cmd).then(resolve, reject);
	}

	async startDb() {
		const cmd = "npm run pretest:e2e";
		return await this.run(cmd, { msg: "Testing database started successfully." });
	}

	async stopDb() {
		const cmd = "npm run db:test:rm";
		return await this.run(cmd, { msg: "Testing database stopped successfully." });
	}

	async restartDb() {
		const cmd = "npm run db:test:restart"
		return await this.run(cmd, { msg: "Testing database restarted successfully." });
	}
}
