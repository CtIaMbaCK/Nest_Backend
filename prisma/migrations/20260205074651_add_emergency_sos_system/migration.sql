-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('NEW', 'COMPLETED');

-- CreateTable
CREATE TABLE "emergency_requests" (
    "id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "emergency_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_requests_status_created_at_idx" ON "emergency_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "emergency_requests_beneficiary_id_idx" ON "emergency_requests"("beneficiary_id");

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "BficiaryProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
