-- DropForeignKey
ALTER TABLE "snapshots" DROP CONSTRAINT "snapshots_account_id_fkey";

-- DropIndex
DROP INDEX "snapshots_account_id_month_year_key";

-- AlterTable
ALTER TABLE "snapshots" DROP COLUMN "account_id",
ADD COLUMN     "account_member_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_account_member_id_key" ON "snapshots"("account_member_id");

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_account_member_id_fkey" FOREIGN KEY ("account_member_id") REFERENCES "account_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
