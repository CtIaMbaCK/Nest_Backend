-- CreateEnum
CREATE TYPE "PointSource" AS ENUM ('HELP_REQUEST', 'CAMPAIGN', 'MANUAL', 'BONUS');

-- AlterTable
ALTER TABLE "VolunteerProfile" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "point_history" (
    "id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "source" "PointSource" NOT NULL,
    "description" TEXT,
    "help_request_id" TEXT,
    "campaign_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_comments" (
    "id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "comment" TEXT NOT NULL,
    "rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template_image_url" TEXT NOT NULL,
    "text_box_config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_certificates" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "certificate_data" JSONB NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMP(3),
    "notes" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issued_certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_comments" ADD CONSTRAINT "volunteer_comments_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_comments" ADD CONSTRAINT "volunteer_comments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_comments" ADD CONSTRAINT "volunteer_comments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "certificate_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
