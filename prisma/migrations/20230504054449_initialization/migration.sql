-- CreateEnum
CREATE TYPE "types" AS ENUM ('ecostake', 'fallback_falooda', 'load_balancer_1');

-- CreateTable
CREATE TABLE "response_codes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "chain_name" TEXT NOT NULL,
    "type" "types" NOT NULL,

    CONSTRAINT "response_codes_pkey" PRIMARY KEY ("id")
);
