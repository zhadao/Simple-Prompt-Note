import { useState, useRef, useEffect } from 'react';
import { Settings, Image, MessageSquare, PanelRight, X, Edit2, Check, Languages, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { Dictionary } from './components/Dictionary';
import { SettingsModal } from './components/SettingsModal';
import { SaveToLibraryModal } from './components/SaveToLibraryModal';
import { useTheme } from './hooks/useTheme';
import { useSettings, useLibrary } from './hooks/useStorage';
import type { LibraryItem, LibraryCategory } from './utils/storage';

import { translateText, polishText, customProcess } from './utils/deepseek';

interface Tab {
  id: string;
  name: string;
  mode: 'drawing' | 'llm';
  content: string;
}

const defaultTabs: Tab[] = [
  { id: '1', name: 'MJ绘图', mode: 'drawing', content: '' },
  { id: '2', name: '代码助手', mode: 'llm', content: '' },
  { id: '3', name: '文案润色', mode: 'llm', content: '' },
];

function App() {
  const [tabs, setTabs] = useState<Tab[]>(defaultTabs);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDictionary, setShowDictionary] = useState(true);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState('');
  const [localLibrary, setLocalLibrary] = useState<LibraryCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { theme, setTheme, isInitialized: themeInitialized } = useTheme();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { library, loading: libraryLoading } = useLibrary();

  useEffect(() => {
    if (library) {
      setLocalLibrary(library);
    }
  }, [library]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleContentChange = (content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, content } : tab
    ));
  };

  const handleAddFromDictionary = (item: LibraryItem) => {
    const currentContent = activeTab.content;
    // 所有模式都使用逗号分隔，保持紧凑格式
    const separator = currentContent ? ', ' : '';
    const newContent = currentContent + separator + item.content;
    handleContentChange(newContent);
  };

  const handleAddTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: `新标签 ${tabs.length + 1}`,
      mode: 'llm',
      content: '',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleDeleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) {
      alert('至少保留一个标签');
      return;
    }
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleStartEditTab = (tab: Tab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
  };

  const handleSaveTabName = () => {
    if (editingTabId && editingTabName.trim()) {
      setTabs(prev => prev.map(tab => 
        tab.id === editingTabId ? { ...tab, name: editingTabName.trim() } : tab
      ));
    }
    setEditingTabId(null);
    setEditingTabName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTabName();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingTabName('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab.content);
  };

  const handleClear = () => {
    handleContentChange('');
  };

  const handleSaveToLibraryClick = () => {
    if (!activeTab.content.trim()) {
      alert('内容为空，无法保存');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveToLibrary = async (
    categoryIndex: number | 'new',
    itemLabel: string,
    newCategoryName?: string,
    newCategoryColor?: 'blue' | 'purple'
  ) => {
    try {
      const { getLibrary, saveLibrary } = await import('./utils/storage');
      const currentLibrary = await getLibrary();

      const newItem: LibraryItem = {
        label: itemLabel,
        content: activeTab.content,
      };

      let newLibrary: LibraryCategory[];

      if (categoryIndex === 'new' && newCategoryName && newCategoryColor) {
        // 创建新分类
        newLibrary = [...currentLibrary, {
          category: newCategoryName,
          colorType: newCategoryColor,
          items: [newItem]
        }];
      } else if (typeof categoryIndex === 'number') {
        // 保存到现有分类
        newLibrary = currentLibrary.map((cat, idx) =>
          idx === categoryIndex
            ? { ...cat, items: [...cat.items, newItem] }
            : cat
        );
      } else {
        throw new Error('无效的保存参数');
      }

      await saveLibrary(newLibrary);
      setLocalLibrary(newLibrary);
      setIsSaveModalOpen(false);
      alert('已保存到词典');
    } catch (error) {
      console.error('保存到词典失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleTranslate = async () => {
    if (!activeTab.content.trim()) {
      alert('内容为空，无法翻译');
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await translateText({ 
        content: activeTab.content,
        targetLang: 'en'
      });
      
      if (result.error) {
        alert('翻译失败：' + result.error);
      } else {
        handleContentChange(result.translated);
      }
    } catch (error) {
      alert('翻译出错：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePolish = async () => {
    if (!activeTab.content.trim()) {
      alert('内容为空，无法润色');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await polishText(activeTab.content);

      if (result.error) {
        alert('润色失败：' + result.error);
      } else {
        handleContentChange(result.translated);
      }
    } catch (error) {
      alert('润色出错：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomProcess = async () => {
    if (!activeTab.content.trim()) {
      alert('内容为空，无法处理');
      return;
    }

    if (!settings?.customPrompt) {
      alert('请先在设置中配置自定义提示词');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await customProcess(activeTab.content);

      if (result.error) {
        alert('处理失败：' + result.error);
      } else {
        handleContentChange(result.translated);
      }
    } catch (error) {
      alert('处理出错：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (settingsLoading || libraryLoading || !themeInitialized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 顶部 Tab 栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={clsx(
                'group flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap cursor-pointer',
                activeTabId === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {tab.mode === 'drawing' ? (
                <Image size={14} className="text-drawing" />
              ) : (
                <MessageSquare size={14} className="text-llm" />
              )}
              
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editingTabName}
                  onChange={(e) => setEditingTabName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTabName}
                  autoFocus
                  className="w-24 px-1 text-sm bg-white dark:bg-gray-600 border border-blue-500 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>{tab.name}</span>
              )}
              
              {/* 标签操作按钮 */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleStartEditTab(tab, e)}
                  className="p-0.5 text-gray-400 hover:text-blue-500"
                  title="重命名"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={(e) => handleDeleteTab(tab.id, e)}
                  className="p-0.5 text-gray-400 hover:text-red-500"
                  title="删除"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {/* 作者签名 */}
          <a
            href="https://github.com/zhadao/Simple-Prompt-Note"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400/50 dark:text-gray-500/50 hover:text-gray-500 dark:hover:text-gray-400 transition-colors mr-1 select-none"
            title="by ZhaDa0"
          >
            by ZhaDa0
          </a>
          <button
            onClick={() => setShowDictionary(!showDictionary)}
            className={clsx(
              'p-1.5 rounded transition-colors',
              showDictionary
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
            title="切换词典显示"
          >
            <PanelRight size={16} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="设置"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧工作台 */}
        <div
          className={clsx(
            'flex-1 p-3 overflow-hidden transition-all duration-300 flex flex-col',
            showDictionary ? 'w-3/5' : 'w-full'
          )}
        >
          {/* 文本编辑区域 */}
          <textarea
            ref={textareaRef}
            value={activeTab.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={activeTab.mode === 'drawing' 
              ? '在此输入绘画提示词，或从右侧词典添加...' 
              : '在此输入LLM提示词，或从右侧词典添加...'}
            className={clsx(
              'flex-1 w-full p-4 text-sm bg-gray-50 dark:bg-gray-800/50 rounded border resize-none focus:outline-none focus:ring-2',
              activeTab.mode === 'drawing' 
                ? 'border-drawing/30 focus:ring-drawing/50 text-gray-900 dark:text-gray-100'
                : 'border-llm/30 focus:ring-llm/50 text-gray-900 dark:text-gray-100'
            )}
            style={{ fontFamily: 'system-ui, monospace', lineHeight: '1.6' }}
          />
          
          {/* 底部操作栏 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                title="复制"
              >
                <span>复制</span>
              </button>
              <button
                onClick={handleClear}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                title="清空"
              >
                <span>清空</span>
              </button>
              {/* 自定义按钮 */}
              {settings?.customPrompt && settings.customLabel && (
                <button
                  onClick={handleCustomProcess}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors disabled:opacity-50"
                  title={settings.customLabel}
                >
                  <span>{isProcessing ? '处理中...' : settings.customLabel}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePolish}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors disabled:opacity-50"
                title="润色"
              >
                <Sparkles size={16} />
                <span>{isProcessing ? '处理中...' : '润色'}</span>
              </button>
              <button
                onClick={handleTranslate}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
                title="翻译"
              >
                <Languages size={16} />
                <span>{isProcessing ? '处理中...' : '翻译'}</span>
              </button>
              <button
                onClick={handleSaveToLibraryClick}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                title="保存到词典"
              >
                <Check size={16} />
                <span>保存到词典</span>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧词典 */}
        {showDictionary && (
          <div className="w-2/5 min-w-[280px] max-w-[350px] border-l border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="h-full p-3 overflow-y-auto">
              <Dictionary 
                library={localLibrary} 
                onAddItem={handleAddFromDictionary}
                onLibraryChange={setLocalLibrary}
              />
            </div>
          </div>
        )}
      </div>

      {/* 设置模态框 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={(newSettings) => {
          updateSettings(newSettings);
          if (newSettings.theme !== theme) {
            setTheme(newSettings.theme);
          }
        }}
      />

      {/* 保存到词典模态框 */}
      <SaveToLibraryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        library={localLibrary}
        defaultName={activeTab.name}
        content={activeTab.content}
        mode={activeTab.mode}
        onSave={handleSaveToLibrary}
      />
    </div>
  );
}

export default App;
