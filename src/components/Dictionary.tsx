import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, X, Check, FolderPlus } from 'lucide-react';
import { clsx } from 'clsx';
import type { LibraryCategory, LibraryItem } from '../utils/storage';
import { saveLibrary } from '../utils/storage';

interface DictionaryProps {
  library: LibraryCategory[];
  onAddItem: (item: LibraryItem) => void;
  onLibraryChange?: (library: LibraryCategory[]) => void;
}

export const Dictionary = ({ library, onAddItem, onLibraryChange }: DictionaryProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set([0]));
  const [hoveredItem, setHoveredItem] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [editingItem, setEditingItem] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showAddForm, setShowAddForm] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newContent, setNewContent] = useState('');

  // 分类编辑状态
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<'blue' | 'purple'>('blue');

  const toggleCategory = (index: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddItem = (item: LibraryItem) => {
    onAddItem(item);
  };

  const handleDeleteItem = async (categoryIdx: number, itemIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个词条吗？')) return;

    const newLibrary = library.map((cat, idx) => {
      if (idx === categoryIdx) {
        return {
          ...cat,
          items: cat.items.filter((_, i) => i !== itemIdx)
        };
      }
      return cat;
    });

    onLibraryChange?.(newLibrary);
    await saveLibrary(newLibrary);
  };

  const handleStartEdit = (categoryIdx: number, itemIdx: number, item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem({ categoryIdx, itemIdx });
    setEditLabel(item.label);
    setEditContent(item.content);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editLabel.trim() || !editContent.trim()) return;

    const newLibrary = library.map((cat, cIdx) => {
      if (cIdx === editingItem.categoryIdx) {
        return {
          ...cat,
          items: cat.items.map((item, iIdx) =>
            iIdx === editingItem.itemIdx
              ? { ...item, label: editLabel.trim(), content: editContent.trim() }
              : item
          )
        };
      }
      return cat;
    });

    onLibraryChange?.(newLibrary);
    await saveLibrary(newLibrary);
    setEditingItem(null);
    setEditLabel('');
    setEditContent('');
  };

  const handleAddNewItem = async (categoryIdx: number) => {
    if (!newLabel.trim() || !newContent.trim()) return;

    const newItem: LibraryItem = {
      label: newLabel.trim(),
      content: newContent.trim(),
    };

    const newLibrary = library.map((cat, idx) => {
      if (idx === categoryIdx) {
        return {
          ...cat,
          items: [...cat.items, newItem]
        };
      }
      return cat;
    });

    onLibraryChange?.(newLibrary);
    await saveLibrary(newLibrary);
    setShowAddForm(null);
    setNewLabel('');
    setNewContent('');
  };

  // 分类管理功能
  const handleStartEditCategory = (categoryIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(categoryIdx);
    setEditCategoryName(library[categoryIdx]?.category || '');
  };

  const handleSaveCategoryEdit = async () => {
    if (editingCategory === null || !editCategoryName.trim()) return;

    const newLibrary = library.map((cat, idx) => {
      if (idx === editingCategory) {
        return { ...cat, category: editCategoryName.trim() };
      }
      return cat;
    });

    onLibraryChange?.(newLibrary);
    await saveLibrary(newLibrary);
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = async (categoryIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个指令组吗？组内的所有词条也会被删除。')) return;

    const newLibrary = library.filter((_, idx) => idx !== categoryIdx);
    onLibraryChange?.(newLibrary);
    await saveLibrary(newLibrary);

    // 更新展开状态
    const newExpanded = new Set(expandedCategories);
    newExpanded.delete(categoryIdx);
    setExpandedCategories(newExpanded);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    const newCategory: LibraryCategory = {
      category: newCategoryName.trim(),
      colorType: newCategoryColor,
      items: []
    };

    const newLibrary = [...library, newCategory];
    onLibraryChange?.(newLibrary);
    await saveLibrary(newLibrary);
    setShowAddCategory(false);
    setNewCategoryName('');
    setNewCategoryColor('blue');

    // 自动展开新分类
    setExpandedCategories(prev => new Set([...prev, newLibrary.length - 1]));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 添加新分类按钮 */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        {showAddCategory ? (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="新指令组名称"
              className="w-full mb-2 px-2 py-1 text-xs bg-white dark:bg-gray-700 border rounded"
            />
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setNewCategoryColor('blue')}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded border',
                  newCategoryColor === 'blue'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-drawing" />
                <span>绘画</span>
              </button>
              <button
                onClick={() => setNewCategoryColor('purple')}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded border',
                  newCategoryColor === 'purple'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-llm" />
                <span>LLM</span>
              </button>
            </div>
            <div className="flex justify-end gap-1">
              <button
                onClick={() => setShowAddCategory(false)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleAddNewCategory}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCategory(true)}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FolderPlus size={14} />
            <span>新建指令组</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {library.map((category, categoryIdx) => (
          <div key={categoryIdx} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            {/* 分类标题 */}
            {editingCategory === categoryIdx ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800">
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    category.colorType === 'blue' ? 'bg-drawing' : 'bg-llm'
                  )}
                />
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border rounded"
                  autoFocus
                />
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={handleSaveCategoryEdit}
                  className="p-1 text-green-500 hover:text-green-600"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleCategory(categoryIdx)}
                className="group w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.has(categoryIdx) ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      category.colorType === 'blue' ? 'bg-drawing' : 'bg-llm'
                    )}
                  />
                  <span>{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{category.items.length}</span>
                  {/* 分类操作按钮 */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartEditCategory(categoryIdx, e)}
                      className="p-0.5 text-gray-400 hover:text-blue-500"
                      title="重命名"
                    >
                      <Edit2 size={10} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategory(categoryIdx, e)}
                      className="p-0.5 text-gray-400 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </button>
            )}

            {/* 分类内容 */}
            {expandedCategories.has(categoryIdx) && (
              <div className="px-3 pb-2">
                {/* 词条列表 */}
                <div className="flex flex-wrap gap-1.5">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="relative group"
                      onMouseEnter={() => setHoveredItem({ categoryIdx, itemIdx })}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {editingItem?.categoryIdx === categoryIdx && editingItem?.itemIdx === itemIdx ? (
                        // 编辑模式
                        <div className="w-48 p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            placeholder="名称"
                            className="w-full mb-2 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 border rounded"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="内容"
                            rows={3}
                            className="w-full mb-2 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 border rounded resize-none"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 text-green-500 hover:text-green-600"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 显示模式
                        <>
                          <button
                            onClick={() => handleAddItem(item)}
                            className={clsx(
                              'flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all duration-150',
                              category.colorType === 'blue'
                                ? 'bg-drawing/10 border-drawing/30 text-drawing-dark dark:text-drawing-light hover:bg-drawing/20'
                                : 'bg-llm/10 border-llm/30 text-llm-dark dark:text-llm-light hover:bg-llm/20'
                            )}
                          >
                            <span>{item.label}</span>
                            <Plus size={12} className="opacity-50" />
                          </button>

                          {/* 悬停操作按钮 */}
                          <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded shadow-sm">
                            <button
                              onClick={(e) => handleStartEdit(categoryIdx, itemIdx, item, e)}
                              className="p-0.5 text-blue-500 hover:text-blue-600"
                              title="编辑"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteItem(categoryIdx, itemIdx, e)}
                              className="p-0.5 text-red-500 hover:text-red-600"
                              title="删除"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>

                          {/* 悬停预览 */}
                          {hoveredItem?.categoryIdx === categoryIdx && hoveredItem?.itemIdx === itemIdx && (
                            <div className="absolute z-10 left-0 bottom-full mb-1 w-48 p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600 text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-1">预览:</div>
                              <div className="text-gray-800 dark:text-gray-200 line-clamp-3">
                                {item.content}
                              </div>
                              {item.preview && (
                                <img
                                  src={item.preview}
                                  alt={item.label}
                                  className="mt-2 w-full h-20 object-cover rounded"
                                />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* 添加新词条按钮 */}
                {showAddForm === categoryIdx ? (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="词条名称"
                      className="w-full mb-2 px-2 py-1 text-xs bg-white dark:bg-gray-700 border rounded"
                    />
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="词条内容"
                      rows={2}
                      className="w-full mb-2 px-2 py-1 text-xs bg-white dark:bg-gray-700 border rounded resize-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setShowAddForm(null)}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleAddNewItem(categoryIdx)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(categoryIdx)}
                    className="mt-2 flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Plus size={12} />
                    <span>添加词条</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
