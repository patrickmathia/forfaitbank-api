import { ConfigModule, ConfigService } from "@nestjs/config"
import { PrismaService } from "./../prisma/prisma.service"
import { Test, TestingModule } from "@nestjs/testing"
import { PackageService } from "./package.service"
import { Package } from "@prisma/client"

describe("PackageService", () => {
  let service: PackageService
  let prisma: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: "./test/.env.test" })],
      providers: [PackageService, PrismaService, ConfigService],
    }).compile()
    service = module.get<PackageService>(PackageService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterAll(async () => {
    await prisma.cleanDatabase()
  })

  let packageId: number;

  describe("should create", () => {
    it("closed", async () => {
      const pkg = (await service.create({
        billType: "fifty",
        value: 2500,
      })) as Package

      expect(pkg.status).toBe("closed")
      expect(pkg.value).toBe(2500)

      packageId = pkg.id
    })
    it("opened", async () => {
      const pkg = (await service.create({
        billType: "hundred",
        value: 2400,
      })) as Package

      expect(pkg.status).toBe("opened")
      expect(pkg.value).toBe(2400)
    })
    it("multiple", async () => {
      const pkg = await service.create({
        billType: "ten",
        value: 2500,
      })

      expect(pkg).toStrictEqual({ count: 5 })
    })
  })

  it("should find one", async () => {
    const pkg = await service.findOne(packageId)

    expect(pkg).toBeDefined()
  })

  it("should delete", async () => {
    await service.remove(packageId)
    
    const pkg = await service.findOne(packageId)
    
    expect(pkg).toBeNull()
  })
})
