import React, { useState, useEffect } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import type { LibraryCategory } from '../utils/storage';

interface SaveToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  library: LibraryCategory[];
  defaultName: string;
  content: string;
  mode: 'drawing' | 'llm';
  onSave: (categoryIndex: number | 'new', itemLabel: string, newCategoryName?: string, newCategoryColor?: 'blue' | 'purple') => void;
}

export const SaveToLibraryModal: React.FC<SaveToLibraryModalProps> = ({
  isOpen,
  onClose,
  library,
  defaultName,
  content,
  mode,
  onSave,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [itemLabel, setItemLabel] = useState(defaultName);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<'blue' | 'purple'>(mode === 'drawing' ? 'blue' : 'purple');

  useEffect(() => {
    if (isOpen) {
      setItemLabel(defaultName);
      setSelectedCategory(0);
      setIsCreatingNew(false);
      setNewCategoryName('');
      setNewCategoryColor(mode === 'drawing' ? 'blue' : 'purple');
    }
  }, [isOpen, defaultName, mode]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!itemLabel.trim()) {
      alert('请输入词条名称');
      return;
    }

    if (isCreatingNew) {
      if (!newCategoryName.trim()) {
        alert('请输入新分类名称');
        return;
      }
      onSave('new', itemLabel.trim(), newCategoryName.trim(), newCategoryColor);
    } else {
      onSave(selectedCategory, itemLabel.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">保存到词典</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 词条名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              词条命名
            </label>
            <input
              type="text"
              value={itemLabel}
              onChange={(e) => setItemLabel(e.target.value)}
              placeholder="输入词条名称"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* 保存到 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              保存到
            </label>

            {/* 新建分类开关 */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1.5 text-xs rounded border transition-colors',
                  isCreatingNew
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Plus size={12} />
                <span>新建分类</span>
              </button>
            </div>

            {isCreatingNew ? (
              // 新建分类表单
              <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="新分类名称"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewCategoryColor('blue')}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded border transition-colors',
                      newCategoryColor === 'blue'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-drawing" />
                    <span>绘画</span>
                  </button>
                  <button
                    onClick={() => setNewCategoryColor('purple')}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded border transition-colors',
                      newCategoryColor === 'purple'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-llm" />
                    <span>LLM</span>
                  </button>
                </div>
              </div>
            ) : (
              // 选择现有分类
              <div className="max-h-40 overflow-y-auto space-y-1">
                {library.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(index)}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm rounded border transition-colors text-left',
                      selectedCategory === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full',
                        category.colorType === 'blue' ? 'bg-drawing' : 'bg-llm'
                      )}
                    />
                    <span className="flex-1 truncate">{category.category}</span>
                    <span className="text-xs text-gray-400">{category.items.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 内容预览 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              内容预览
            </label>
            <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 line-clamp-3">
              {content}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            <Check size={16} />
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
