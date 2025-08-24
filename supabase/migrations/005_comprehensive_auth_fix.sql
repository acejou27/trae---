-- 全面修復認證系統問題
-- Created: 2024-12-28
-- 解決 AuthSessionMissingError 和權限問題

-- 1. 確保 user_profiles 表的權限設置正確
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- 2. 為 user_profiles 表設置完整權限
GRANT SELECT ON user_profiles TO anon;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

-- 3. 確保序列權限正確
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. 重新創建更強健的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- 創建新的 RLS 策略，允許更靈活的訪問
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON user_profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 5. 重新創建觸發器函數，增加錯誤處理
DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- 檢查是否已存在個人資料
    SELECT EXISTS(
        SELECT 1 FROM user_profiles WHERE user_id = NEW.id
    ) INTO profile_exists;
    
    -- 如果不存在，則創建
    IF NOT profile_exists THEN
        INSERT INTO user_profiles (user_id, display_name, job_title, phone)
        VALUES (
            NEW.id,
            COALESCE(
                NEW.raw_user_meta_data->>'full_name',
                NEW.raw_user_meta_data->>'name',
                split_part(NEW.email, '@', 1),
                '用戶'
            ),
            '',
            ''
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created user profile for user: %', NEW.id;
    ELSE
        RAISE LOG 'User profile already exists for user: %', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 記錄錯誤但不阻止用戶註冊
        RAISE WARNING 'Failed to create user profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新創建觸發器
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 6. 創建一個函數來修復現有用戶的個人資料
CREATE OR REPLACE FUNCTION fix_missing_user_profiles()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    created_count INTEGER := 0;
BEGIN
    -- 為所有沒有個人資料的用戶創建記錄
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN user_profiles up ON au.id = up.user_id
        WHERE up.user_id IS NULL
    LOOP
        BEGIN
            INSERT INTO user_profiles (user_id, display_name, job_title, phone)
            VALUES (
                user_record.id,
                COALESCE(
                    user_record.raw_user_meta_data->>'full_name',
                    user_record.raw_user_meta_data->>'name',
                    split_part(user_record.email, '@', 1),
                    '用戶'
                ),
                '',
                ''
            )
            ON CONFLICT (user_id) DO NOTHING;
            
            created_count := created_count + 1;
            RAISE LOG 'Created missing profile for user: %', user_record.id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create profile for user %: % - %', user_record.id, SQLSTATE, SQLERRM;
        END;
    END LOOP;
    
    RAISE LOG 'Created % missing user profiles', created_count;
    RETURN created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 執行修復函數
SELECT fix_missing_user_profiles();

-- 8. 創建一個檢查函數來驗證權限設置
CREATE OR REPLACE FUNCTION check_auth_permissions()
RETURNS TABLE(
    table_name TEXT,
    grantee TEXT,
    privilege_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        t.grantee::TEXT,
        t.privilege_type::TEXT
    FROM information_schema.role_table_grants t
    WHERE t.table_schema = 'public' 
    AND t.table_name = 'user_profiles'
    AND t.grantee IN ('anon', 'authenticated')
    ORDER BY t.table_name, t.grantee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 添加註釋
COMMENT ON FUNCTION create_user_profile() IS '自動為新用戶創建個人資料，包含完整錯誤處理和重複檢查';
COMMENT ON FUNCTION fix_missing_user_profiles() IS '修復現有用戶缺失的個人資料記錄';
COMMENT ON FUNCTION check_auth_permissions() IS '檢查認證相關表的權限設置';

-- 10. 顯示權限檢查結果
SELECT * FROM check_auth_permissions();

-- 11. 顯示統計信息
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_count
FROM auth.users
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_count
FROM user_profiles;