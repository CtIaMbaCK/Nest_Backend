/*
  Warnings:

  - You are about to drop the column `latitude` on the `BficiaryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `BficiaryProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BficiaryProfile" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "HelpRequest" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
