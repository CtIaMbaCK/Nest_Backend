/*
  Warnings:

  - A unique constraint covering the columns `[volunteer_id,help_request_id,source]` on the table `point_history` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[volunteer_id,campaign_id,source]` on the table `point_history` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Appreciation" DROP CONSTRAINT "Appreciation_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "Appreciation" DROP CONSTRAINT "Appreciation_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "Appreciation" DROP CONSTRAINT "Appreciation_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "CampaignRegistration" DROP CONSTRAINT "CampaignRegistration_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "HelpRequest" DROP CONSTRAINT "HelpRequest_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_target_id_fkey";

-- DropForeignKey
ALTER TABLE "certificate_templates" DROP CONSTRAINT "certificate_templates_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "communication_posts" DROP CONSTRAINT "communication_posts_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "issued_certificates" DROP CONSTRAINT "issued_certificates_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "issued_certificates" DROP CONSTRAINT "issued_certificates_template_id_fkey";

-- DropForeignKey
ALTER TABLE "issued_certificates" DROP CONSTRAINT "issued_certificates_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "point_history" DROP CONSTRAINT "point_history_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "volunteer_comments" DROP CONSTRAINT "volunteer_comments_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "volunteer_comments" DROP CONSTRAINT "volunteer_comments_volunteer_id_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "done_at" TIMESTAMP(3),
ADD COLUMN     "proof_images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "point_history_volunteer_id_help_request_id_source_key" ON "point_history"("volunteer_id", "help_request_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "point_history_volunteer_id_campaign_id_source_key" ON "point_history"("volunteer_id", "campaign_id", "source");

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegistration" ADD CONSTRAINT "CampaignRegistration_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_posts" ADD CONSTRAINT "communication_posts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_comments" ADD CONSTRAINT "volunteer_comments_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_comments" ADD CONSTRAINT "volunteer_comments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "certificate_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
