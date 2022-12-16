import { PrismaService } from "./../prisma/prisma.service";
import { EditUserDto } from "./dto/edit-user.dto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from "argon2";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async editUser(userId: number, dto: EditUserDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				id: userId,
			},
		});

		// check password
		const pwMatches = await argon.verify(user.hash, dto.password);
		if (!pwMatches) throw new ForbiddenException("Incorrect password.");
		delete dto.password;

		if (dto.newPassword) {
			var hash = await argon.hash(dto.newPassword);
			delete dto.newPassword;
		}

		const updatedUser = await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...dto,
				hash,
			},
		});

		delete updatedUser.hash;
		return updatedUser;
	}
}
