-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPEND');

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "rentAmount" SET DEFAULT 100.0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
