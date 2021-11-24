/*
  Warnings:

  - Changed the type of `ticketType` on the `Ticket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ticketType",
ADD COLUMN     "ticketType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TicketType";
