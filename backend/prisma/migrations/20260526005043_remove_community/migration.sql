/*
  Warnings:

  - You are about to drop the column `communityId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `communityId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `communityId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Community` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_communityId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_communityId_fkey";

-- DropIndex
DROP INDEX "Issue_communityId_createdAt_idx";

-- DropIndex
DROP INDEX "Issue_communityId_status_idx";

-- DropIndex
DROP INDEX "Post_communityId_category_idx";

-- DropIndex
DROP INDEX "Post_communityId_createdAt_idx";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "communityId";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "communityId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "communityId";

-- DropTable
DROP TABLE "Community";

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_createdAt_idx" ON "Issue"("createdAt");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "Post"("category");
