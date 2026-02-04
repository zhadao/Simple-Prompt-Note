import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Copy, Trash2, Languages, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface PromptBlock {
  id: string;
  content: string;
  type: 'tag' | 'text';
}

interface WorkbenchProps {
  mode: 'drawing' | 'llm';
  blocks: PromptBlock[];
  onBlocksChange: (blocks: PromptBlock[]) => void;
}

export const Workbench: React.FC<WorkbenchProps> = ({ mode, blocks, onBlocksChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const content = inputValue.trim();
      if (content) {
        const newBlock: PromptBlock = {
          id: Date.now().toString(),
          content,
          type: mode === 'drawing' ? 'tag' : 'text',
        };
        onBlocksChange([...blocks, newBlock]);
        setInputValue('');
      }
    }
  };

  const handleBlockClick = (id: string) => {
    const newSelected = new Set(selectedBlocks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBlocks(newSelected);
  };

  const handleRemoveBlock = (id: string) => {
    onBlocksChange(blocks.filter(b => b.id !== id));
    const newSelected = new Set(selectedBlocks);
    newSelected.delete(id);
    setSelectedBlocks(newSelected);
  };

  const handleCopy = () => {
    const text = blocks.map(b => b.content).join(mode === 'drawing' ? ', ' : '\n\n');
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    onBlocksChange([]);
    setSelectedBlocks(new Set());
  };

  const handleTranslate = () => {
    // TODO: 调用 DeepSeek API 进行翻译
    console.log('Translate:', blocks.map(b => b.content).join(', '));
  };

  const handlePolish = () => {
    // TODO: 调用 DeepSeek API 进行润色
    console.log('Polish:', blocks.map(b => b.content).join(', '));
  };

  const getBlockClasses = (_block: PromptBlock, isSelected: boolean) => {
    const baseClasses = 'cursor-pointer transition-all duration-200 group relative';
    
    if (mode === 'drawing') {
      // 绘画模式：紧凑排列，蓝色系
      return clsx(
        baseClasses,
        'inline-flex items-center px-2 py-1 m-1 text-sm rounded',
        'border border-drawing',
        isSelected 
          ? 'bg-highlight/20 border-highlight' 
          : 'bg-drawing/10 hover:bg-drawing/20'
      );
    } else {
      // LLM 模式：整行显示，紫色系
      return clsx(
        baseClasses,
        'block w-full px-3 py-2 mb-2 text-sm rounded',
        'border border-llm',
        isSelected 
          ? 'bg-highlight/20 border-highlight' 
          : 'bg-llm/10 hover:bg-llm/20'
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 输入区域 */}
      <div className="mb-3">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={mode === 'drawing' ? '输入关键词，按回车或逗号添加...' : '输入提示词，按回车添加...'}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-drawing dark:focus:ring-drawing-light text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* 积木展示区域 */}
      <div className={clsx(
        "flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700",
        mode === 'drawing' ? 'flex flex-wrap content-start' : 'flex flex-col'
      )}>
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            {mode === 'drawing' ? '添加绘画关键词...' : '添加 LLM 提示词...'}
          </div>
        ) : (
          blocks.map((block) => (
            <div
              key={block.id}
              onClick={() => handleBlockClick(block.id)}
              className={getBlockClasses(block, selectedBlocks.has(block.id))}
            >
              <span className="text-gray-800 dark:text-gray-200">{block.content}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBlock(block.id);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="复制"
          >
            <Copy size={16} />
            <span>复制</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="清空"
          >
            <Trash2 size={16} />
            <span>清空</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePolish}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
            title="润色"
          >
            <Sparkles size={16} />
            <span>润色</span>
          </button>
          <button
            onClick={handleTranslate}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="翻译"
          >
            <Languages size={16} />
            <span>翻译</span>
          </button>
        </div>
      </div>
    </div>
  );
};
