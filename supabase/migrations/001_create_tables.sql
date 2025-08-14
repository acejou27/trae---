-- 報價單系統資料庫初始化
-- 建立日期: 2024-12-18
-- 作者: SOLO Coding

-- 建立使用者表 (users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立客戶表 (customers)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立產品表 (products)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    default_price DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT '個',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立專案負責人表 (staff)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立銀行資料表 (banks)
CREATE TABLE banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    branch VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立報價單表 (quotes)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    bank_id UUID NOT NULL,
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

-- 建立報價單項目表 (quote_items)
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    product_id UUID,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT '個',
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- 建立索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_customers_company_name ON customers(company_name);
CREATE INDEX idx_customers_contact_person ON customers(contact_person);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_staff_name ON staff(name);
CREATE INDEX idx_staff_is_active ON staff(is_active);
CREATE INDEX idx_banks_bank_name ON banks(bank_name);
CREATE INDEX idx_banks_is_active ON banks(is_active);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_staff_id ON quotes(staff_id);
CREATE INDEX idx_quotes_quote_date ON quotes(quote_date DESC);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON quote_items(product_id);
CREATE INDEX idx_quote_items_sort_order ON quote_items(sort_order);

-- 設定權限
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT SELECT ON customers TO anon;
GRANT ALL PRIVILEGES ON customers TO authenticated;
GRANT SELECT ON products TO anon;
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT SELECT ON staff TO anon;
GRANT ALL PRIVILEGES ON staff TO authenticated;
GRANT SELECT ON banks TO anon;
GRANT ALL PRIVILEGES ON banks TO authenticated;
GRANT SELECT ON quotes TO anon;
GRANT ALL PRIVILEGES ON quotes TO authenticated;
GRANT SELECT ON quote_items TO anon;
GRANT ALL PRIVILEGES ON quote_items TO authenticated;

-- 插入初始資料
INSERT INTO customers (company_name, contact_person, phone, email, address) VALUES
('振禾有限公司', '王經理', '02-12345678', 'manager@example.com', '台北市中正區重慶南路一段122號'),
('科技創新股份有限公司', '李總監', '02-87654321', 'director@tech.com', '新北市板橋區文化路二段182號');

INSERT INTO products (name, description, default_price, unit) VALUES
('全自動網站', '依照模版並客製設定一個形象網站(10頁以內)\n可提供一組免費網址\n每個月提供8-16篇SEO文章\n提供一組客製化AI機器人以及每月2000則訊息(超出部分依1000/1000購月收費)\n提供AI預約系統\n合約期間內微調機器人以及之後升級功能皆不另外收費', 9000.00, '月'),
('網站設定費', '一次性設定費用', 5000.00, '次');

INSERT INTO staff (name, title, phone, email) VALUES
('周振豪', '專案經理', '0902-272168', 'chou@example.com'),
('張專員', '技術專員', '0912-345678', 'chang@example.com');

INSERT INTO banks (bank_name, account_number, account_name, branch) VALUES
('玉山銀行', '13339400338l2', '808 中原分行', '中原分行'),
('台新銀行', '12345678901', '812 信義分行', '信義分行');