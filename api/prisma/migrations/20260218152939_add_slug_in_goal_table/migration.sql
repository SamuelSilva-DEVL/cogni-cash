/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `goals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "goals_slug_key" ON "goals"("slug");
