/*
  Warnings:

  - Added the required column `last4` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cost_data" DROP CONSTRAINT "cost_data_api_key_id_fkey";

-- AlterTable: Step 1 - Add column as nullable first
ALTER TABLE "api_keys" ADD COLUMN "last4" VARCHAR(4);

-- Backfill: Step 2 - Populate existing rows with last 4 chars of encrypted_key
-- Note: This uses encrypted key's last 4 chars as placeholder for existing data
-- New API keys will get proper last4 from original key via application code
UPDATE "api_keys" SET "last4" = RIGHT("encrypted_key", 4) WHERE "last4" IS NULL;

-- AlterTable: Step 3 - Make column NOT NULL after backfill
ALTER TABLE "api_keys" ALTER COLUMN "last4" SET NOT NULL;

-- CreateIndex
CREATE INDEX "api_keys_last4_idx" ON "api_keys"("last4");

-- AddForeignKey
ALTER TABLE "cost_data" ADD CONSTRAINT "cost_data_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
