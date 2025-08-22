/**
 * 產品管理頁面組件
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
  CubeIcon
} from '@heroicons/react/24/outline';
import { useQuoteStore } from '../../stores/useQuoteStore';
import type { Product } from '../../types';

/**
 * 產品表單驗證 Schema
 */
const productSchema = z.object({
  name: z.string().min(1, '產品名稱為必填'),
  description: z.string().optional(),
  unit: z.string().min(1, '單位為必填'),
  price: z.number().min(0, '價格不能為負數')
});

type ProductFormData = z.infer<typeof productSchema>;

/**
 * 產品管理頁面組件
 * 提供產品資料的完整 CRUD 操作
 */
export function ProductManagement(): JSX.Element {
  const { 
    products, 
    loading, 
    fetchProducts,
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useQuoteStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /**
   * 載入產品資料
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * 表單處理
   */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  });

  /**
   * 過濾產品列表
   */
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  /**
   * 開啟新增產品模態框
   */
  const handleAddProduct = (): void => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      unit: '個',
      price: 0
    });
    setIsModalOpen(true);
  };

  /**
   * 開啟編輯產品模態框
   * Updated: 2024-12-28
   */
  const handleEditProduct = (product: Product): void => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || '', // 產品說明對應到 description 欄位
      unit: product.unit,
      price: product.default_price
    });
    setIsModalOpen(true);
  };

  /**
   * 提交表單
   * Updated: 2024-12-28
   */
  const onSubmit = async (data: ProductFormData): Promise<void> => {
    try {
      if (editingProduct) {
        // 更新產品時，description 欄位對應產品說明
        const productUpdateData = {
          name: data.name,
          description: data.description || null,
          default_price: data.price,
          unit: data.unit
        };
        await updateProduct(editingProduct.id, productUpdateData);
      } else {
        // 新增產品時，description 欄位對應產品說明
        const productCreateData = {
          name: data.name,
          description: data.description || null,
          default_price: data.price,
          unit: data.unit
        };
        await createProduct(productCreateData);
      }

      // 操作成功後關閉Modal並重置表單
      closeModal();
    } catch (error) {
      console.error('儲存產品資料失敗:', error);
    }
  };

  /**
   * 刪除產品
   */
  const handleDeleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteProduct(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('刪除產品失敗:', error);
    }
  };

  /**
   * 關閉模態框
   */
  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  /**
   * 格式化價格顯示
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">產品管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理產品資料，包括產品名稱、說明、預設價格、單位等資訊
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新增產品
          </button>
        </div>
      </div>

      {/* 搜尋 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="搜尋產品名稱或說明..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 產品統計 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    總產品數
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.length}
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
                <CubeIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    平均價格
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.length > 0 ? formatPrice(
                      products.reduce((sum, product) => sum + product.default_price, 0) / products.length
                    ) : '$0'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 產品列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? '找不到符合條件的產品' : '尚無產品資料'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? '請嘗試其他搜尋條件' : '點擊上方按鈕新增第一個產品'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <li 
                key={product.id} 
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleEditProduct(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CubeIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
  
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-500 whitespace-pre-wrap">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            單位：{product.unit}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {formatPrice(product.default_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleEditProduct(product)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(product.id)}
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

      {/* 新增/編輯產品模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingProduct ? '編輯產品' : '新增產品'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        產品名稱 *
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
                        產品說明
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          單位 *
                        </label>
                        <select
                          {...register('unit')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="個">個</option>
                          <option value="件">件</option>
                          <option value="組">組</option>
                          <option value="套">套</option>
                          <option value="台">台</option>
                          <option value="支">支</option>
                          <option value="張">張</option>
                          <option value="本">本</option>
                          <option value="包">包</option>
                          <option value="盒">盒</option>
                          <option value="月">月</option>
                          <option value="年">年</option>
                          <option value="小時">小時</option>
                          <option value="天">天</option>
                        </select>
                        {errors.unit && (
                          <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          價格 *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register('price', { valueAsNumber: true })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                        )}
                      </div>
                    </div>


                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? '儲存中...' : editingProduct ? '更新' : '新增'}
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
                      刪除產品
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        確定要刪除此產品嗎？此操作無法復原。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(deleteConfirm)}
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