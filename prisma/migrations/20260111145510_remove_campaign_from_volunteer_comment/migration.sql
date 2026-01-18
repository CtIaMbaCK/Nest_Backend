/*
  Warnings:

  - You are about to drop the column `campaign_id` on the `volunteer_comments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "volunteer_comments" DROP CONSTRAINT "volunteer_comments_campaign_id_fkey";

-- AlterTable
ALTER TABLE "volunteer_comments" DROP COLUMN "campaign_id";
