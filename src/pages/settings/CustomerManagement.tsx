/**
 * 客戶管理頁面組件
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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

import type { Customer } from '../../types';
import { useCustomerStore } from '../../stores/customerStore';

/**
 * 客戶表單驗證 Schema
 */
const customerSchema = z.object({
  company_name: z.string().min(1, '公司名稱為必填'),
  contact_person: z.string().min(1, '聯絡人為必填'),
  phone: z.string().min(1, '電話為必填'),
  email: z.string().email('請輸入有效的電子郵件').optional().or(z.literal('')),
  address: z.string().optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

/**
 * 客戶管理頁面組件
 * 提供客戶資料的完整 CRUD 操作
 */
export function CustomerManagement(): JSX.Element {
  const { 
    customers, 
    loading, 
    fetchCustomers,
    createCustomer, 
    updateCustomer, 
    deleteCustomer 
  } = useCustomerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /**
   * 載入客戶資料
   */
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /**
   * 表單處理
   */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema)
  });

  /**
   * 過濾客戶列表
   */
  const filteredCustomers = customers.filter(customer =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  /**
   * 開啟新增客戶模態框
   */
  const handleAddCustomer = (): void => {
    setEditingCustomer(null);
    reset();
    setIsModalOpen(true);
  };

  /**
   * 開啟編輯客戶模態框
   */
  const handleEditCustomer = (customer: Customer): void => {
    setEditingCustomer(customer);
    reset({
      company_name: customer.company_name,
      contact_person: customer.contact_person,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  /**
   * 提交表單
   */
  const onSubmit = async (data: CustomerFormData): Promise<void> => {
    try {
      const customerData = {
        company_name: data.company_name,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
      } else {
        await createCustomer(customerData);
      }

      // 操作成功後關閉Modal並重置表單
      closeModal();
    } catch (error) {
      console.error('儲存客戶資料失敗:', error);
    }
  };

  /**
   * 刪除客戶
   */
  const handleDeleteCustomer = async (id: string): Promise<void> => {
    try {
      await deleteCustomer(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('刪除客戶失敗:', error);
    }
  };

  /**
   * 關閉模態框
   */
  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客戶管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理客戶資料，包括公司名稱、聯絡人、電話、地址等資訊
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleAddCustomer}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新增客戶
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
            placeholder="搜尋客戶名稱、聯絡人或電話..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 客戶列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? '找不到符合條件的客戶' : '尚無客戶資料'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? '請嘗試其他搜尋條件' : '點擊上方按鈕新增第一個客戶'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <li key={customer.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.company_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          聯絡人：{customer.contact_person}
                        </p>
                        <p className="text-sm text-gray-500">
                          電話：{customer.phone}
                        </p>
                        {customer.email && (
                          <p className="text-sm text-gray-500">
                            信箱：{customer.email}
                          </p>
                        )}
                        {customer.address && (
                          <p className="text-sm text-gray-500 truncate">
                            地址：{customer.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditCustomer(customer)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(customer.id)}
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

      {/* 新增/編輯客戶模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingCustomer ? '編輯客戶' : '新增客戶'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        公司名稱 *
                      </label>
                      <input
                        type="text"
                        {...register('company_name')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.company_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        聯絡人 *
                      </label>
                      <input
                        type="text"
                        {...register('contact_person')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.contact_person && (
                        <p className="mt-1 text-sm text-red-600">{errors.contact_person.message}</p>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        地址
                      </label>
                      <textarea
                        {...register('address')}
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
                    {isSubmitting ? '儲存中...' : editingCustomer ? '更新' : '新增'}
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
                      刪除客戶
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        確定要刪除此客戶嗎？此操作無法復原。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(deleteConfirm)}
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