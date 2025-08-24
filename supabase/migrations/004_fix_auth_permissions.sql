-- 修復認證權限問題
-- Created: 2024-12-28
-- 確保所有用戶都能正常登錄和訪問系統

-- 確保 anon 角色有基本的讀取權限
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA auth TO anon;

-- 確保 authenticated 角色有完整權限
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- 檢查並修復可能的權限問題
-- 確保 user_profiles 表的 RLS 策略正確
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- 重新創建更寬鬆的 RLS 策略
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IS NOT NULL  -- 允許已認證用戶查看（用於調試）
    );

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (
        auth.uid() = user_id AND 
        auth.uid() IS NOT NULL
    );

-- 確保觸發器函數有正確的權限
DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- 重新創建更強健的用戶資料創建函數
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- 使用 INSERT ... ON CONFLICT 避免重複插入
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1),
            '用戶'
        )
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 記錄錯誤但不阻止用戶註冊
        RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新創建觸發器
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 添加一個函數來檢查和修復缺失的用戶資料
CREATE OR REPLACE FUNCTION ensure_user_profile(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    SELECT user_uuid, '用戶'
    WHERE NOT EXISTS (
        SELECT 1 FROM user_profiles WHERE user_id = user_uuid
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to ensure user profile for user %: %', user_uuid, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 為現有用戶創建缺失的個人資料
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN user_profiles up ON au.id = up.user_id
        WHERE up.user_id IS NULL
    LOOP
        PERFORM ensure_user_profile(user_record.id);
    END LOOP;
END
$$;

-- 註釋
COMMENT ON FUNCTION create_user_profile() IS '自動為新用戶創建個人資料，包含錯誤處理';
COMMENT ON FUNCTION ensure_user_profile(UUID) IS '確保指定用戶有個人資料記錄';