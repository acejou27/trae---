-- 為產品表新增備註欄位
-- 建立日期: 2024-12-28
-- 作者: Assistant

-- 為 products 表新增 notes 欄位
ALTER TABLE products ADD COLUMN notes TEXT;

-- 更新現有產品的備註欄位（將現有的 description 複製到 notes）
UPDATE products SET notes = description WHERE description IS NOT NULL;

-- 新增註解
COMMENT ON COLUMN products.description IS '產品說明';
COMMENT ON COLUMN products.notes IS '產品備註';