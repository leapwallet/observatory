/*
  Warnings:

  - Added the required column `url` to the `response_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "response_codes" ADD COLUMN     "url" TEXT NOT NULL;
