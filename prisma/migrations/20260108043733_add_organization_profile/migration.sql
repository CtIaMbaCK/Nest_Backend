-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "BficiaryProfile" ADD COLUMN     "joined_organization_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "organization_status" "OrgStatus";

-- AlterTable
ALTER TABLE "VolunteerProfile" ADD COLUMN     "joined_organization_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "organization_status" "OrgStatus";

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BficiaryProfile" ADD CONSTRAINT "BficiaryProfile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
