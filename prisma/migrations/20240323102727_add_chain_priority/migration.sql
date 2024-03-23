-- AlterTable
ALTER TABLE "response_codes" ADD COLUMN     "chainPriority" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "response_codes_chainPriority_idx" ON "response_codes"("chainPriority");
