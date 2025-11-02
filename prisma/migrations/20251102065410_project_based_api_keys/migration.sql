/*
  Warnings:

  - You are about to drop the column `team_id` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `cost_data` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Made the column `project_id` on table `cost_data` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."api_keys" DROP CONSTRAINT "api_keys_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cost_data" DROP CONSTRAINT "cost_data_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cost_data" DROP CONSTRAINT "cost_data_team_id_fkey";

-- DropIndex
DROP INDEX "public"."api_keys_team_id_idx";

-- DropIndex
DROP INDEX "public"."cost_data_team_id_date_idx";

-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "team_id",
ADD COLUMN     "project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cost_data" DROP COLUMN "team_id",
ALTER COLUMN "project_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_members_user_id_idx" ON "project_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "api_keys_project_id_idx" ON "api_keys"("project_id");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_data" ADD CONSTRAINT "cost_data_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
