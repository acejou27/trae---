-- 創建報價單分享表
CREATE TABLE IF NOT EXISTS quote_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id VARCHAR(255) UNIQUE NOT NULL, -- 公開分享的唯一ID
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE, -- 過期時間，NULL表示永不過期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_quote_shares_share_id ON quote_shares(share_id);
CREATE INDEX IF NOT EXISTS idx_quote_shares_quote_id ON quote_shares(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_shares_created_by ON quote_shares(created_by);
CREATE INDEX IF NOT EXISTS idx_quote_shares_is_active ON quote_shares(is_active);

-- 設置RLS (Row Level Security)
ALTER TABLE quote_shares ENABLE ROW LEVEL SECURITY;

-- 創建RLS政策
-- 任何人都可以讀取活躍的分享記錄（用於公開查看）
CREATE POLICY "Anyone can view active quote shares" ON quote_shares
  FOR SELECT
  USING (is_active = true);

-- 只有登入用戶可以創建分享
CREATE POLICY "Authenticated users can create shares" ON quote_shares
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 只有分享的創建者可以更新分享
CREATE POLICY "Users can update their own shares" ON quote_shares
  FOR UPDATE
  USING (created_by = auth.uid());

-- 只有分享的創建者可以刪除分享
CREATE POLICY "Users can delete their own shares" ON quote_shares
  FOR DELETE
  USING (created_by = auth.uid());

-- 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_quote_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_shares_updated_at_trigger
  BEFORE UPDATE ON quote_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_shares_updated_at();

-- 授予權限
GRANT SELECT ON quote_shares TO anon;
GRANT ALL PRIVILEGES ON quote_shares TO authenticated;