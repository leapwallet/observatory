-- CreateIndex
CREATE INDEX "response_codes_url_idx" ON "response_codes"("url");

-- CreateIndex
CREATE INDEX "response_codes_priority_idx" ON "response_codes"("priority");

-- CreateIndex
CREATE INDEX "response_codes_endpointType_idx" ON "response_codes"("endpointType");
