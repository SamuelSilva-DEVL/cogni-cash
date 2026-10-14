-- CreateEnum
CREATE TYPE "expenseKind" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "incomeRecurrence" AS ENUM ('ONCE', 'MONTHLY');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "expense_kind" "expenseKind",
ADD COLUMN "recurrence" "incomeRecurrence";
