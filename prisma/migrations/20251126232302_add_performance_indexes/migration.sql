-- DropIndex
DROP INDEX "QRHistory_createdAt_idx";

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Product_updatedAt_idx" ON "Product"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Product_enabled_createdAt_idx" ON "Product"("enabled", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Product_brand_enabled_idx" ON "Product"("brand", "enabled");

-- CreateIndex
CREATE INDEX "QRHistory_createdAt_idx" ON "QRHistory"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "QRHistory_productId_createdAt_idx" ON "QRHistory"("productId", "createdAt" DESC);
