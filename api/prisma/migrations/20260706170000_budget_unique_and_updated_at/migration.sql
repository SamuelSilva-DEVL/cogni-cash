-- AlterTable
ALTER TABLE "budgets" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "budgets_account_id_category_id_month_year_key" ON "budgets"("account_id", "categoryId", "month", "year");
