-- CreateEnum
CREATE TYPE "AccountMemberRole" AS ENUM ('OWNER', 'DEPENDENT', 'VIEWER');

-- CreateTable
CREATE TABLE "whitelabels" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whitelabels_pkey" PRIMARY KEY ("id")
);

-- Insert default whitelabel for existing data
INSERT INTO "whitelabels" ("id", "name", "status", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000001', 'Legacy', 'active', CURRENT_TIMESTAMP);

-- AlterTable accounts: add nullable first, backfill, then required
ALTER TABLE "accounts" ADD COLUMN "whitelabel_id" TEXT;
UPDATE "accounts" SET "whitelabel_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "accounts" ALTER COLUMN "whitelabel_id" SET NOT NULL;

-- AlterTable users: add nullable first, backfill, then required
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE "users" ADD COLUMN "whitelabel_id" TEXT;
UPDATE "users" SET "whitelabel_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "users" ALTER COLUMN "whitelabel_id" SET NOT NULL;

-- AlterTable account_members: migrate role to enum
ALTER TABLE "account_members" ADD COLUMN "role_new" "AccountMemberRole" NOT NULL DEFAULT 'DEPENDENT';
UPDATE "account_members" SET "role_new" = 'OWNER' WHERE LOWER(COALESCE("role", 'member')) = 'owner';
UPDATE "account_members" SET "role_new" = 'VIEWER' WHERE LOWER(COALESCE("role", 'member')) = 'viewer';
ALTER TABLE "account_members" DROP COLUMN "role";
ALTER TABLE "account_members" RENAME COLUMN "role_new" TO "role";

-- CreateTable member_invites
CREATE TABLE "member_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "AccountMemberRole" NOT NULL DEFAULT 'DEPENDENT',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" TEXT NOT NULL,
    "whitelabel_id" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,

    CONSTRAINT "member_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_whitelabel_id_email_key" ON "users"("whitelabel_id", "email");
CREATE INDEX "accounts_whitelabel_id_idx" ON "accounts"("whitelabel_id");
CREATE UNIQUE INDEX "member_invites_token_key" ON "member_invites"("token");
CREATE UNIQUE INDEX "member_invites_whitelabel_id_email_account_id_key" ON "member_invites"("whitelabel_id", "email", "account_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_whitelabel_id_fkey" FOREIGN KEY ("whitelabel_id") REFERENCES "whitelabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_whitelabel_id_fkey" FOREIGN KEY ("whitelabel_id") REFERENCES "whitelabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_invites" ADD CONSTRAINT "member_invites_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_invites" ADD CONSTRAINT "member_invites_whitelabel_id_fkey" FOREIGN KEY ("whitelabel_id") REFERENCES "whitelabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_invites" ADD CONSTRAINT "member_invites_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
