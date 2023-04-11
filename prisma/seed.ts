import { PrismaClient, User } from "@prisma/client"
import * as argon from "argon2"

const prisma = new PrismaClient()

async function main() {
  const hash = await argon.hash('password')

  const patrick: User = await prisma.user.upsert({
    where: { email: "patrick@forfaitbank.com" },
    update: {},
    create: {
      name: "Patrick Matias",
      email: "patrick@forfaitbank.com",
      address: "Rua Paris, Lisboa - PT",
      birthdate: new Date(2001, 10, 11),
      cpf: "324.564.787-01",
      hash,
    },
  })

  console.log({ patrick })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
