/**
 * 用戶個人資料管理 Hook
 * 提供用戶個人資料的CRUD操作
 * Created: 2024-12-28
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id?: string;
  user_id: string;
  display_name: string;
  job_title: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  clearError: () => void;
}

/**
 * 用戶個人資料管理 Hook
 * @returns {UseUserProfileReturn} 個人資料狀態和操作方法
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 清除錯誤
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 載入用戶個人資料
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setError('用戶未登錄');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setProfile(data);
      } else {
        // 如果沒有個人資料記錄，創建預設值
        const defaultProfile: UserProfile = {
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          job_title: '',
          phone: ''
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('載入個人資料失敗:', err);
      setError('載入個人資料失敗');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.user_metadata?.full_name, user?.email]);

  // 儲存用戶個人資料
  const saveProfile = useCallback(async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      setError('用戶未登錄');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: saveError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: profileData.display_name.trim(),
          job_title: profileData.job_title.trim(),
          phone: profileData.phone.trim()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      if (data) {
        setProfile(data);
      }

      // 重新載入資料以確保同步
      await loadProfile();
    } catch (err) {
      console.error('儲存個人資料失敗:', err);
      setError('儲存個人資料失敗');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id, loadProfile]);

  // 當用戶登錄狀態改變時自動載入個人資料
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [user?.id, loadProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    loadProfile,
    saveProfile,
    clearError
  };
};

export default useUserProfile;