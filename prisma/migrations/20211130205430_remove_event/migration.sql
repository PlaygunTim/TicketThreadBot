/*
  Warnings:

  - The values [EVENT] on the enum `CloseReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CloseReason_new" AS ENUM ('CHAT_REPORT', 'VC_REPORT', 'DMS_REPORT', 'OFF_PLATFORM_REPORT', 'OTHER_REPORT', 'MOD_GENERATED_CHAT_INTERVENTION', 'MOD_GENERATED_VC_INTERVENTION', 'MOD_GENERATED_DMS_INTERVENTION', 'MOD_GENERATED_PROFILE_INTERVENTION', 'MOD_GENERATED_OFF_PLATFORM_INTERVENTION', 'SPAM_TICKET', 'INVALID_TICKET', 'SUGGESTION', 'MODERATION_COMPLAINT', 'GREETER_ENQUIRY', 'STAFF_APP_ENQUIRY', 'OTHER');
ALTER TABLE "Ticket" ALTER COLUMN "closeReason" TYPE "CloseReason_new" USING ("closeReason"::text::"CloseReason_new");
ALTER TYPE "CloseReason" RENAME TO "CloseReason_old";
ALTER TYPE "CloseReason_new" RENAME TO "CloseReason";
DROP TYPE "CloseReason_old";
COMMIT;