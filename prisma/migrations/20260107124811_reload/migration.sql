/*
  Warnings:

  - You are about to drop the column `joined_organization_at` on the `BficiaryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `BficiaryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `organization_status` on the `BficiaryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `joined_organization_at` on the `VolunteerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `VolunteerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `organization_status` on the `VolunteerProfile` table. All the data in the column will be lost.
  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BficiaryProfile" DROP CONSTRAINT "BficiaryProfile_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "CampaignRegistration" DROP CONSTRAINT "CampaignRegistration_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "CampaignRegistration" DROP CONSTRAINT "CampaignRegistration_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationProfile" DROP CONSTRAINT "OrganizationProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerProfile" DROP CONSTRAINT "VolunteerProfile_organization_id_fkey";

-- AlterTable
ALTER TABLE "BficiaryProfile" DROP COLUMN "joined_organization_at",
DROP COLUMN "organization_id",
DROP COLUMN "organization_status";

-- AlterTable
ALTER TABLE "VolunteerProfile" DROP COLUMN "joined_organization_at",
DROP COLUMN "organization_id",
DROP COLUMN "organization_status";

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "CampaignRegistration";

-- DropTable
DROP TABLE "OrganizationProfile";

-- DropTable
DROP TABLE "Post";

-- DropEnum
DROP TYPE "CampaignStatus";

-- DropEnum
DROP TYPE "CampaignType";
