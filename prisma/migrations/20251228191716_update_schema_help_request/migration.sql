-- AlterTable
ALTER TABLE "HelpRequest" ADD COLUMN     "completion_notes" TEXT,
ADD COLUMN     "done_at" TIMESTAMP(3),
ADD COLUMN     "proof_images" TEXT[];
