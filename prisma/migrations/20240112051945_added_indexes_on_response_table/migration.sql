-- CreateIndex
CREATE INDEX "response_codes_chain_id_idx" ON "response_codes"("chain_id");

-- CreateIndex
CREATE INDEX "response_codes_type_idx" ON "response_codes"("type");

-- CreateIndex
CREATE INDEX "response_codes_httpResponseCode_idx" ON "response_codes"("httpResponseCode");

-- CreateIndex
CREATE INDEX "response_codes_responseTime_idx" ON "response_codes"("responseTime");
