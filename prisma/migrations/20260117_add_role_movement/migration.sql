-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "movement" (
    "id" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "concept" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movement_userId_idx" ON "movement"("userId");

-- CreateIndex
CREATE INDEX "movement_date_idx" ON "movement"("date");

-- AddForeignKey
ALTER TABLE "movement" ADD CONSTRAINT "movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

