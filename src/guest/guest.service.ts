import { Injectable } from "@nestjs/common"
import { AuthService } from "./../auth/auth.service"
import { OperationService } from "./../operation/operation.service"
import { PrismaService } from "./../prisma/prisma.service"
import { MockService } from "./../mock/mock.service"

@Injectable()
export class GuestService {
  constructor(
    private auth: AuthService,
    private operation: OperationService,
    private prisma: PrismaService,
    private mock: MockService
  ) {}

  async create() {
    const user = this.mock.user()

    const accessToken = await this.auth.signup(user)

    const { id: userId } = await this.prisma.user.findFirst({
      where: { email: user.email },
      select: { id: true },
    })

    await this.operation.create(userId, this.mock.operation.concluded())
    await this.operation.create(userId, this.mock.operation.reserved())
    await this.operation.create(userId, this.mock.operation.parent())

    return accessToken
  }
}
