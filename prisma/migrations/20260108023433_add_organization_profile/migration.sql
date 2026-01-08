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

-- AddForeignKey
ALTER TABLE "OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
