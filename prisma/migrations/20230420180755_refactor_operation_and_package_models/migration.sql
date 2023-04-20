/*
  Warnings:

  - The primary key for the `operations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `billType` on the `operations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `operations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `value` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `billType` on the `packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OperationBillType" AS ENUM ('ten', 'fifty', 'hundred');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('opened', 'reserved', 'concluded');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('opened', 'closed');

-- DropForeignKey
ALTER TABLE "operations" DROP CONSTRAINT "operations_parentOperationId_fkey";

-- DropForeignKey
ALTER TABLE "packages" DROP CONSTRAINT "packages_operationId_fkey";

-- AlterTable
ALTER TABLE "operations" DROP CONSTRAINT "operations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "billType",
ADD COLUMN     "billType" "OperationBillType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OperationStatus" NOT NULL,
ALTER COLUMN "parentOperationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "operations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "operations_id_seq";

-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "value" INTEGER NOT NULL,
DROP COLUMN "billType",
ADD COLUMN     "billType" "OperationBillType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PackageStatus" NOT NULL,
ALTER COLUMN "operationId" SET DATA TYPE TEXT,
ALTER COLUMN "grandpaId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_parentOperationId_fkey" FOREIGN KEY ("parentOperationId") REFERENCES "operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
