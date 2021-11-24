/*
  Warnings:

  - You are about to drop the column `lockTTL` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "lockTTL",
ADD COLUMN     "lockAt" TIMESTAMP(3),
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;
