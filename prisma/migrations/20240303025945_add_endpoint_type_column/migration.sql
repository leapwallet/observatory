-- CreateEnum
CREATE TYPE "EndpointType" AS ENUM ('latest_block', 'balance');

-- AlterTable
ALTER TABLE "response_codes" ADD COLUMN     "endpointType" "EndpointType" NOT NULL DEFAULT 'latest_block';
