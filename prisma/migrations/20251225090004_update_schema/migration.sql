/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestCategory" AS ENUM ('EDUCATION', 'MEDICAL', 'HOUSE_WORK', 'TRANSPORT', 'FOOD', 'SHELTER', 'OTHER');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('STANDARD', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "Appreciation" DROP CONSTRAINT "Appreciation_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_activity_id_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropEnum
DROP TYPE "ActivityType";

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "volunteer_id" TEXT,
    "accepted_at" TIMESTAMP(3),
    "request_category" "RequestCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "urgency_level" "UrgencyLevel" NOT NULL DEFAULT 'STANDARD',
    "district" "District" NOT NULL,
    "address_detail" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "recurrence" "RecurrenceType" NOT NULL DEFAULT 'NONE',
    "status" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "activity_images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "HelpRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "HelpRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
