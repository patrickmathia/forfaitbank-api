-- DropForeignKey
ALTER TABLE "packages" DROP CONSTRAINT "packages_operationId_fkey";

-- AlterTable
ALTER TABLE "operations" DROP COLUMN "subId",
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "grandpaId" INTEGER,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "operationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

