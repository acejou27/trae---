/**
 * 選擇框組件
 * Created: 2024-12-28
 */

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cn } from '../../utils/cn';

/**
 * 選項介面
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * 選擇框組件屬性介面
 */
interface SelectProps {
  value?: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 通用選擇框組件
 * 基於 Headless UI 的 Listbox 組件，提供下拉選單功能
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = '請選擇...',
  label,
  error,
  disabled = false,
  className
}: SelectProps): JSX.Element {
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-default rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm',
              error ? 'border-red-300' : 'border-gray-300',
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
            )}
          >
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    cn(
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          'block truncate',
                          selected ? 'font-medium' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}