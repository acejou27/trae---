-- 創建用戶個人資料表
-- Created: 2024-12-28

-- 創建 user_profiles 表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    job_title VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 確保每個用戶只有一個個人資料記錄
    UNIQUE(user_id)
);

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 創建更新時間戳的觸發器
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- 啟用行級安全性 (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 政策：用戶只能查看和修改自己的個人資料
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 授予權限給 authenticated 角色
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 創建一個函數來自動為新用戶創建個人資料記錄
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器：當新用戶註冊時自動創建個人資料
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 註釋
COMMENT ON TABLE user_profiles IS '用戶個人資料表';
COMMENT ON COLUMN user_profiles.id IS '主鍵';
COMMENT ON COLUMN user_profiles.user_id IS '關聯的認證用戶ID';
COMMENT ON COLUMN user_profiles.display_name IS '顯示名稱';
COMMENT ON COLUMN user_profiles.job_title IS '職務';
COMMENT ON COLUMN user_profiles.phone IS '聯絡電話';
COMMENT ON COLUMN user_profiles.created_at IS '創建時間';
COMMENT ON COLUMN user_profiles.updated_at IS '更新時間';