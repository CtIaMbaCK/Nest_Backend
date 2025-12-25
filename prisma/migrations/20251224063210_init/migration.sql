-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTEER', 'BENEFICIARY', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'DENIED', 'BANNED');

-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('PARENT', 'SPOUSE', 'CHILD', 'SIBLING', 'RELATIVE', 'FRIEND', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EDUCATION', 'MEDICAL', 'HOUSE_WORK', 'TRANSPORT', 'DONATION', 'OTHER');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'APPROVED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VulnerabilityType" AS ENUM ('POOR', 'DISABLED', 'ELDERLY', 'SICKNESS', 'ORPHAN', 'OTHER');

-- CreateEnum
CREATE TYPE "District" AS ENUM ('QUAN_1', 'QUAN_3', 'QUAN_4', 'QUAN_5', 'QUAN_6', 'QUAN_7', 'QUAN_8', 'QUAN_10', 'QUAN_11', 'QUAN_12', 'BINH_TAN', 'BINH_THANH', 'GO_VAP', 'PHU_NHUAN', 'TAN_BINH', 'TAN_PHU', 'TP_THU_DUC', 'HUYEN_BINH_CHANH', 'HUYEN_CAN_GIO', 'HUYEN_CU_CHI', 'HUYEN_HOC_MON', 'HUYEN_NHA_BE');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('TEACHING', 'EDUCATION', 'MEDICAL', 'PSYCHOLOGICAL', 'LEGAL', 'SOCIAL_WORK', 'DISASTER_RELIEF', 'FUNDRAISING', 'LOGISTICS', 'COMMUNICATION', 'TRANSLATION', 'IT_SUPPORT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "force_change_password" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerProfile" (
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "skill" "Skill"[],
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "total_thanks" INTEGER NOT NULL DEFAULT 0,
    "preferred_districts" "District"[],
    "cccd_front_file" TEXT,
    "cccd_back_file" TEXT,

    CONSTRAINT "VolunteerProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "BficiaryProfile" (
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "vulnerability_type" "VulnerabilityType" NOT NULL,
    "situation_description" TEXT,
    "health_condition" TEXT,
    "proof_files" TEXT[],
    "cccd_front_file" TEXT,
    "cccd_back_file" TEXT,
    "guardian_name" TEXT,
    "guardian_phone" TEXT,
    "guardian_relation" "GuardianRelation",

    CONSTRAINT "BficiaryProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "volunteer_id" TEXT,
    "accepted_at" TIMESTAMP(3),
    "activity_type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
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

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appreciation" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appreciation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Appreciation_sender_id_activity_id_key" ON "Appreciation"("sender_id", "activity_id");

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BficiaryProfile" ADD CONSTRAINT "BficiaryProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appreciation" ADD CONSTRAINT "Appreciation_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
