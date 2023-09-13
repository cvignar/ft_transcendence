/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `direct` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `isPassword` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `private` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `losses` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `matchCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `matchHistory` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `playTime` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `winRate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Msg` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserBlocking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserFollows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_blocked` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_invite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_owner` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `owner` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Msg" DROP CONSTRAINT "Msg_cid_fkey";

-- DropForeignKey
ALTER TABLE "Msg" DROP CONSTRAINT "Msg_userId_fkey";

-- DropForeignKey
ALTER TABLE "Mute" DROP CONSTRAINT "Mute_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Mute" DROP CONSTRAINT "Mute_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserBlocking" DROP CONSTRAINT "_UserBlocking_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserBlocking" DROP CONSTRAINT "_UserBlocking_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- DropForeignKey
ALTER TABLE "_admin" DROP CONSTRAINT "_admin_A_fkey";

-- DropForeignKey
ALTER TABLE "_admin" DROP CONSTRAINT "_admin_B_fkey";

-- DropForeignKey
ALTER TABLE "_blocked" DROP CONSTRAINT "_blocked_A_fkey";

-- DropForeignKey
ALTER TABLE "_blocked" DROP CONSTRAINT "_blocked_B_fkey";

-- DropForeignKey
ALTER TABLE "_invite" DROP CONSTRAINT "_invite_A_fkey";

-- DropForeignKey
ALTER TABLE "_invite" DROP CONSTRAINT "_invite_B_fkey";

-- DropForeignKey
ALTER TABLE "_member" DROP CONSTRAINT "_member_A_fkey";

-- DropForeignKey
ALTER TABLE "_member" DROP CONSTRAINT "_member_B_fkey";

-- DropForeignKey
ALTER TABLE "_owner" DROP CONSTRAINT "_owner_A_fkey";

-- DropForeignKey
ALTER TABLE "_owner" DROP CONSTRAINT "_owner_B_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "createdAt",
DROP COLUMN "direct",
DROP COLUMN "isPassword",
DROP COLUMN "password",
DROP COLUMN "picture",
DROP COLUMN "private",
DROP COLUMN "updatedAt",
ADD COLUMN     "owner" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "losses",
DROP COLUMN "matchCount",
DROP COLUMN "matchHistory",
DROP COLUMN "playTime",
DROP COLUMN "rank",
DROP COLUMN "score",
DROP COLUMN "updatedAt",
DROP COLUMN "winRate",
DROP COLUMN "wins";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "Msg";

-- DropTable
DROP TABLE "Mute";

-- DropTable
DROP TABLE "_UserBlocking";

-- DropTable
DROP TABLE "_UserFollows";

-- DropTable
DROP TABLE "_admin";

-- DropTable
DROP TABLE "_blocked";

-- DropTable
DROP TABLE "_invite";

-- DropTable
DROP TABLE "_member";

-- DropTable
DROP TABLE "_owner";
