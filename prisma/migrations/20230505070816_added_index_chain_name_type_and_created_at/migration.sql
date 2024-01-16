-- CreateIndex
CREATE INDEX "response_codes_chain_name_type_idx" ON "response_codes"("chain_name", "type");

-- CreateIndex
CREATE INDEX "response_codes_createdAt_idx" ON "response_codes"("createdAt");
