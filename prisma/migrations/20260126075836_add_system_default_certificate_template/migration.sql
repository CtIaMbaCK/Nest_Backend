-- AlterTable
ALTER TABLE "certificate_templates" ADD COLUMN     "is_system_default" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "issued_certificates" ALTER COLUMN "organization_id" DROP NOT NULL;
