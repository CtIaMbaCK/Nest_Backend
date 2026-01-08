-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EVENT', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PEDING', 'APPROVED', 'REJECTED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "OrganizationProfile" (
    "user_id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "representative_name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "district" "District" NOT NULL,
    "address_detail" TEXT NOT NULL,
    "business_license" TEXT,
    "verification_docs" TEXT[],
    "total_campaigns" INTEGER NOT NULL DEFAULT 0,
    "total_volunteers" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'APPROVED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "district" "District" NOT NULL,
    "address_detail" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "cover_image" TEXT,
    "images" TEXT[],
    "target_volunteers" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRegistration" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "CampaignRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRegistration_campaign_id_volunteer_id_key" ON "CampaignRegistration"("campaign_id", "volunteer_id");

-- AddForeignKey
ALTER TABLE "OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegistration" ADD CONSTRAINT "CampaignRegistration_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRegistration" ADD CONSTRAINT "CampaignRegistration_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
