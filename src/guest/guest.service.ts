import { Injectable } from "@nestjs/common"
import { AuthService } from "./../auth/auth.service"
import { OperationService } from "./../operation/operation.service"
import { MockService } from "./../mock/mock.service"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class GuestService {
  constructor(
    private auth: AuthService,
    private operation: OperationService,
    private jwt: JwtService,
    private mock: MockService
  ) {}

  async create() {
    const { user: mockUser, operation } = this.mock

    const { access_token } = await this.auth.signup(mockUser())

    const user = this.jwt.decode(access_token)

    await this.operation.create(user.sub, operation.concluded())
    await this.operation.create(user.sub, operation.reserved())
    await this.operation.create(user.sub, operation.parent())

    return { access_token }
  }
}
