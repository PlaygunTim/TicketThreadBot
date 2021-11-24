-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ADMIN', 'GENERAL', 'MODERATION');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketType" "TicketType" NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "lockTTL" INTEGER NOT NULL DEFAULT 604800
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_id_key" ON "Ticket"("id");
