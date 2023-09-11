-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "id42" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "hash" TEXT NOT NULL,
    "avatar" TEXT,
    "hashedRtoken" TEXT,
    "twoFAsecret" TEXT,
    "twoFA" BOOLEAN DEFAULT false,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gameHistory" INTEGER[],
    "winRate" DOUBLE PRECISION,
    "playTime" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 1200,
    "rank" INTEGER,
    "friends" INTEGER[],
    "adding" INTEGER[],
    "added" INTEGER[],
    "blocks" INTEGER[],
    "blocking" INTEGER[],
    "blocked" INTEGER[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_email_key" ON "users"("id", "email");
