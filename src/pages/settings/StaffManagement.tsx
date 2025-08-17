/**
 * 負責人管理頁面組件
 * Created: 2024-12-28
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

import type { Staff } from '../../types';
import { useStaffStore } from '../../stores/staffStore';

/**
 * 負責人表單驗證 Schema
 */
const staffSchema = z.object({
  name: z.string().min(1, '姓名為必填'),
  title: z.string().min(1, '職稱為必填'),
  phone: z.string().min(1, '電話為必填'),
  email: z.string().email('請輸入有效的電子郵件').optional().or(z.literal(''))
});

type StaffFormData = z.infer<typeof staffSchema>;

/**
 * 負責人管理頁面組件
 * 提供負責人資料的完整 CRUD 操作
 */
export function StaffManagement(): JSX.Element {
  const { 
    staff, 
    loading,
    fetchStaff,
    createStaff, 
    updateStaff, 
    deleteStaff 
  } = useStaffStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  // 移除departmentFilter，因為資料庫中不存在department欄位

  /**
   * 載入負責人資料
   */
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  /**
   * 表單處理
   */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema)
  });

  // 移除部門相關功能，因為資料庫中不存在department欄位

  /**
   * 過濾負責人列表
   */
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.title && member.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.phone.includes(searchTerm) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  /**
   * 開啟新增負責人模態框
   */
  const handleAddStaff = (): void => {
    setEditingStaff(null);
    reset({
      name: '',
      title: '',
      phone: '',
      email: ''
    });
    setIsModalOpen(true);
  };

  /**
   * 開啟編輯負責人模態框
   */
  const handleEditStaff = (staffMember: Staff): void => {
    setEditingStaff(staffMember);
    reset({
      name: staffMember.name,
      title: staffMember.title || '',
      phone: staffMember.phone,
      email: staffMember.email || ''
    });
    setIsModalOpen(true);
  };

  /**
   * 提交表單
   * Updated: 2024-12-28
   */
  const onSubmit = async (data: StaffFormData): Promise<void> => {
    try {
      const staffData = {
        name: data.name,
        title: data.title,
        phone: data.phone,
        email: data.email || undefined
      };

      // 執行創建或更新操作
      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
      } else {
        await createStaff(staffData);
      }

      // 操作成功後關閉Modal並重置表單
      closeModal();
    } catch (error) {
      console.error('儲存負責人資料失敗:', error);
      // 發生錯誤時不關閉Modal，讓用戶可以重試
    }
  };

  /**
   * 刪除負責人
   */
  const handleDeleteStaff = async (id: string): Promise<void> => {
    try {
      await deleteStaff(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('刪除負責人失敗:', error);
    }
  };

  /**
   * 關閉模態框
   */
  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingStaff(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">負責人管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理專案負責人資料，包括姓名、職稱、聯絡方式等資訊
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleAddStaff}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新增負責人
          </button>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="搜尋姓名、職稱、電話或信箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {/* 移除部門篩選功能 */}
      </div>

      {/* 負責人統計 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    總負責人數
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {staff.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        {/* 移除部門統計 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    有信箱聯絡
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {staff.filter(member => member.email).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 負責人列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-6 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? '找不到符合條件的負責人' : '尚無負責人資料'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? '請嘗試其他搜尋條件' : '點擊上方按鈕新增第一個負責人'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredStaff.map((staffMember) => (
              <li key={staffMember.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200" onClick={() => handleEditStaff(staffMember)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {staffMember.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {staffMember.name}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {staffMember.title || '未設定職稱'}
                          </span>
                          {/* 移除部門顯示 */}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            電話：{staffMember.phone}
                          </p>
                          {staffMember.email && (
                            <p className="text-sm text-gray-500">
                              信箱：{staffMember.email}
                            </p>
                          )}
                        </div>
                        {/* 移除備註顯示 */}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStaff(staffMember);
                      }}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(staffMember.id);
                      }}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 新增/編輯負責人模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingStaff ? '編輯負責人' : '新增負責人'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        姓名 *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        職稱 *
                      </label>
                      <input
                        type="text"
                        {...register('title')}
                        placeholder="例如：專案經理、業務代表、技術主管等"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        電話 *
                      </label>
                      <input
                        type="text"
                        {...register('phone')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>


                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? '儲存中...' : editingStaff ? '更新' : '新增'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      刪除負責人
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        確定要刪除此負責人嗎？此操作無法復原。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteStaff(deleteConfirm)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  刪除
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}