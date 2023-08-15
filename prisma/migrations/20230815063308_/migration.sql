-- AlterEnum
ALTER TYPE "types" ADD VALUE 'nms';

-- AlterTable
ALTER TABLE "response_codes" ADD COLUMN     "chain_id" TEXT,
ALTER COLUMN "chain_name" DROP NOT NULL;
