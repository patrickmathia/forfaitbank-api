import { Controller, Post } from "@nestjs/common"
import { GuestService } from "./guest.service"

@Controller("guest")
export class GuestController {
  constructor(private guestService: GuestService) {}

  @Post("create")
  create() {
    return this.guestService.create()
  }
}
