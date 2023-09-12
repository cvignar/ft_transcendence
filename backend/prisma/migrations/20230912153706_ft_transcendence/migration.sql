/*
  Warnings:

  - You are about to drop the column `dm` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `isPassword` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `private` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `type` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "dm",
DROP COLUMN "isPassword",
DROP COLUMN "private",
ADD COLUMN     "type" TEXT NOT NULL;
