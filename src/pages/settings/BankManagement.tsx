/**
 * 銀行資料管理頁面組件
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
  BanknotesIcon
} from '@heroicons/react/24/outline';

import type { Bank } from '../../types';
import { useBankStore } from '../../stores/bankStore';

/**
 * 銀行資料表單驗證 Schema
 */
const bankSchema = z.object({
  bank_name: z.string().min(1, '銀行名稱為必填'),
  account_name: z.string().min(1, '戶名為必填'),
  account_number: z.string().min(1, '帳號為必填'),
  branch: z.string().optional(),
  swift_code: z.string().optional(),
  notes: z.string().optional()
});

type BankFormData = z.infer<typeof bankSchema>;

/**
 * 銀行資料管理頁面組件
 * 提供銀行帳戶資料的完整 CRUD 操作
 */
export function BankManagement(): JSX.Element {
  const { 
    banks, 
    loading,
    fetchBanks,
    createBank, 
    updateBank, 
    deleteBank 
  } = useBankStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /**
   * 載入銀行資料
   */
  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  /**
   * 表單處理
   */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema)
  });

  /**
   * 過濾銀行列表
   */
  const filteredBanks = banks.filter(bank =>
    bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.account_number.includes(searchTerm) ||
    (bank.branch_name && bank.branch_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /**
   * 開啟新增銀行模態框
   */
  const handleAddBank = (): void => {
    setEditingBank(null);
    reset({
      bank_name: '',
      account_name: '',
      account_number: '',
      branch: '',
      swift_code: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  /**
   * 開啟編輯銀行模態框
   */
  const handleEditBank = (bank: Bank): void => {
    setEditingBank(bank);
    reset({
      bank_name: bank.bank_name,
      account_name: bank.account_name,
      account_number: bank.account_number,
      branch: bank.branch_name || '',
      swift_code: bank.swift_code || '',
      notes: bank.notes || ''
    });
    setIsModalOpen(true);
  };

  /**
   * 提交表單
   */
  const onSubmit = async (data: BankFormData): Promise<void> => {
    try {
      const bankData = {
        ...data,
        branch_name: data.branch || undefined,
        swift_code: data.swift_code || undefined,
        notes: data.notes || undefined,
        is_active: true
      };

      if (editingBank) {
        await updateBank(editingBank.id, bankData);
      } else {
        await createBank(bankData);
      }

      // 操作成功後關閉Modal並重置表單
      closeModal();
    } catch (error) {
      console.error('儲存銀行資料失敗:', error);
    }
  };

  /**
   * 刪除銀行
   */
  const handleDeleteBank = async (id: string): Promise<void> => {
    try {
      await deleteBank(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('刪除銀行失敗:', error);
    }
  };

  /**
   * 關閉模態框
   */
  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingBank(null);
    reset();
  };

  /**
   * 格式化帳號顯示（隱藏部分數字）
   */
  const formatAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    const visibleStart = accountNumber.slice(0, 3);
    const visibleEnd = accountNumber.slice(-3);
    const hiddenLength = accountNumber.length - 6;
    return `${visibleStart}${'*'.repeat(Math.max(hiddenLength, 3))}${visibleEnd}`;
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">銀行資料管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理銀行帳戶資料，用於報價單的匯款資訊顯示
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleAddBank}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新增銀行帳戶
          </button>
        </div>
      </div>

      {/* 搜尋欄 */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="搜尋銀行名稱、戶名、帳號或分行..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 銀行統計 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    總銀行帳戶
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {banks.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    銀行數量
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(banks.map(bank => bank.bank_name)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    有SWIFT代碼
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {banks.filter(bank => bank.swift_code).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 銀行列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="p-6 text-center">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? '找不到符合條件的銀行帳戶' : '尚無銀行帳戶資料'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? '請嘗試其他搜尋條件' : '點擊上方按鈕新增第一個銀行帳戶'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredBanks.map((bank) => (
              <li key={bank.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <BanknotesIcon className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {bank.bank_name}
                          </p>
                          {bank.swift_code && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              國際匯款
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          戶名：{bank.account_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          帳號：{formatAccountNumber(bank.account_number)}
                        </p>
                        {bank.branch_name && (
                          <p className="text-sm text-gray-500">
                            分行：{bank.branch_name}
                          </p>
                        )}
                        {bank.swift_code && (
                          <p className="text-sm text-gray-500">
                            SWIFT：{bank.swift_code}
                          </p>
                        )}
                        {bank.notes && (
                          <p className="text-sm text-gray-500 whitespace-pre-wrap">
                            備註：{bank.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditBank(bank)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(bank.id)}
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

      {/* 新增/編輯銀行模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingBank ? '編輯銀行帳戶' : '新增銀行帳戶'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        銀行名稱 *
                      </label>
                      <input
                        type="text"
                        {...register('bank_name')}
                        placeholder="例如：台灣銀行、中國信託等"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.bank_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.bank_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        戶名 *
                      </label>
                      <input
                        type="text"
                        {...register('account_name')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.account_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.account_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        帳號 *
                      </label>
                      <input
                        type="text"
                        {...register('account_number')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.account_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.account_number.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        分行
                      </label>
                      <input
                        type="text"
                        {...register('branch')}
                        placeholder="例如：台北分行、信義分行等"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SWIFT代碼
                      </label>
                      <input
                        type="text"
                        {...register('swift_code')}
                        placeholder="國際匯款用，例如：BKTWTWTP"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        備註
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={2}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? '儲存中...' : editingBank ? '更新' : '新增'}
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
                      刪除銀行帳戶
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        確定要刪除此銀行帳戶嗎？此操作無法復原。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteBank(deleteConfirm)}
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