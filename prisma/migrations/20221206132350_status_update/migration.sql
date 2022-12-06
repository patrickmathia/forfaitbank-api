/*
  Warnings:

  - You are about to drop the column `parentId` on the `operations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "operations" DROP CONSTRAINT "operations_parentId_fkey";

-- AlterTable
ALTER TABLE "operations" DROP COLUMN "parentId",
ADD COLUMN     "parentOperationId" INTEGER,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "packages" ALTER COLUMN "status" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_parentOperationId_fkey" FOREIGN KEY ("parentOperationId") REFERENCES "operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
