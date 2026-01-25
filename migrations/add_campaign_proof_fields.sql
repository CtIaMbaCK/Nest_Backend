-- Add proof_images and done_at columns to Campaign table
ALTER TABLE "Campaign"
ADD COLUMN IF NOT EXISTS "proof_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "done_at" TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN "Campaign"."proof_images" IS 'Ảnh minh chứng hoàn thành campaign';
COMMENT ON COLUMN "Campaign"."done_at" IS 'Thời điểm hoàn thành campaign';
