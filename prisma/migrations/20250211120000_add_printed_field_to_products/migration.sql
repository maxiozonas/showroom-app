-- Add printed field to products table

-- Add column with default false
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "printed" BOOLEAN NOT NULL DEFAULT false;

-- Update data: all enabled products should be marked as printed
UPDATE "Product" SET "printed" = true WHERE "enabled" = true;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Product_printed_idx" ON "Product"("printed");
CREATE INDEX IF NOT EXISTS "Product_printed_createdAt_idx" ON "Product"("printed", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Product_brand_printed_idx" ON "Product"("brand", "printed");
CREATE INDEX IF NOT EXISTS "Product_categoryId_printed_idx" ON "Product"("categoryId", "printed");
