/*
  Warnings:

  - The `position` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('goa', 'def', 'mid', 'for');

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "position",
ADD COLUMN     "position" "Position" NOT NULL DEFAULT 'mid';
