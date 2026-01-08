-- AlterTable
ALTER TABLE "BficiaryProfile" ADD COLUMN     "joined_organization_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "organization_status" TEXT;

-- AlterTable
ALTER TABLE "VolunteerProfile" ADD COLUMN     "joined_organization_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "organization_status" TEXT;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "type" TEXT NOT NULL DEFAULT 'NEWS',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BficiaryProfile" ADD CONSTRAINT "BficiaryProfile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
