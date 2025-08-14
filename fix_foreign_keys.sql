-- 修正資料庫外鍵約束
-- 建立日期: 2024-12-19
-- 說明: 為quotes和quote_items表格添加外鍵約束

-- 首先刪除現有的表格（如果存在）
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;

-- 重新建立quotes表格（包含外鍵約束）
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    quote_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 5.00,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 重新建立quote_items表格（包含外鍵約束）
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT '個',
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- 重新建立索引
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_staff_id ON quotes(staff_id);
CREATE INDEX idx_quotes_bank_id ON quotes(bank_id);
CREATE INDEX idx_quotes_quote_date ON quotes(quote_date DESC);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON quote_items(product_id);
CREATE INDEX idx_quote_items_sort_order ON quote_items(sort_order);

-- 設定權限
GRANT ALL PRIVILEGES ON quotes TO authenticated;
GRANT SELECT ON quotes TO anon;
GRANT ALL PRIVILEGES ON quote_items TO authenticated;
GRANT SELECT ON quote_items TO anon;

-- 插入測試資料
INSERT INTO quotes (customer_id, staff_id, bank_id, quote_number, contact_person, quote_date, valid_until, subtotal, tax_rate, tax_amount, total, status, notes)
SELECT 
    c.id as customer_id,
    s.id as staff_id,
    b.id as bank_id,
    'Q-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001' as quote_number,
    '王經理' as contact_person,
    CURRENT_DATE as quote_date,
    CURRENT_DATE + INTERVAL '30 days' as valid_until,
    14000.00 as subtotal,
    5.00 as tax_rate,
    700.00 as tax_amount,
    14700.00 as total,
    'draft' as status,
    '測試報價單' as notes
FROM customers c, staff s, banks b
WHERE c.company_name = '振禾有限公司'
    AND s.name = '周振豪'
    AND b.bank_name = '玉山銀行'
LIMIT 1;

-- 插入報價單項目測試資料
INSERT INTO quote_items (quote_id, product_id, product_name, description, quantity, unit, unit_price, amount, sort_order)
SELECT 
    q.id as quote_id,
    p.id as product_id,
    p.name as product_name,
    p.description,
    1 as quantity,
    p.unit,
    p.default_price as unit_price,
    p.default_price as amount,
    1 as sort_order
FROM quotes q, products p
WHERE p.name = '全自動網站'
LIMIT 1;

INSERT INTO quote_items (quote_id, product_id, product_name, description, quantity, unit, unit_price, amount, sort_order)
SELECT 
    q.id as quote_id,
    p.id as product_id,
    p.name as product_name,
    p.description,
    1 as quantity,
    p.unit,
    p.default_price as unit_price,
    p.default_price as amount,
    2 as sort_order
FROM quotes q, products p
WHERE p.name = '網站設定費'
LIMIT 1;