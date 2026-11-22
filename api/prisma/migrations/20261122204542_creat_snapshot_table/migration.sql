-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_telephone_key";

-- AlterTable
ALTER TABLE "budgets" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "snapshots" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalVariableExpenses" DECIMAL(10,2) NOT NULL,
    "totalFixedExpenses" DECIMAL(10,2) NOT NULL,
    "totalIncomes" DECIMAL(10,2) NOT NULL,
    "account_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_account_id_month_year_key" ON "snapshots"("account_id", "month", "year");

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "budgets_account_id_category_id_month_year_key" RENAME TO "budgets_account_id_categoryId_month_year_key";
