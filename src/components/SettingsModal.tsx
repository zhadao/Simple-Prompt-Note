import React, { useState, useEffect } from 'react';
import { X, Download, Upload, AlertTriangle, Moon, Sun, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import type { Settings } from '../utils/storage';
import { saveSettings, exportData, importData, resetData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<Settings | null>(settings);
  const [activeTab, setActiveTab] = useState<'api' | 'appearance' | 'data'>('api');
  const [importError, setImportError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCustomModelInput, setShowCustomModelInput] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen || !localSettings) return null;

  const handleSave = async () => {
    if (localSettings) {
      await saveSettings(localSettings);
      onSettingsChange(localSettings);
    }
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simpleprompt-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await importData(text);
      if (success) {
        setImportError(null);
        window.location.reload();
      } else {
        setImportError('导入失败，请检查文件格式');
      }
    } catch {
      setImportError('导入失败，请检查文件格式');
    }
  };

  const handleReset = async () => {
    await resetData();
    window.location.reload();
  };

  const tabs = [
    { id: 'api', label: 'API 配置' },
    { id: 'appearance', label: '外观' },
    { id: 'data', label: '数据管理' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">设置</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab 导航 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DeepSeek API Key
                </label>
                <input
                  type="password"
                  value={localSettings.apiKey}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  您的 API Key 仅存储在本地浏览器中
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={localSettings.apiBaseUrl}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, apiBaseUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  模型
                </label>
                <select
                  value={localSettings.model === 'custom' ? 'custom' : localSettings.model}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'custom') {
                      setShowCustomModelInput(true);
                    } else {
                      setShowCustomModelInput(false);
                      setLocalSettings({ ...localSettings, model: value });
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="deepseek-chat">deepseek-chat</option>
                  <option value="deepseek-coder">deepseek-coder</option>
                  <option value="custom">自定义</option>
                </select>
                {showCustomModelInput && (
                  <input
                    type="text"
                    placeholder="请输入自定义模型名称"
                    onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                    className="mt-2 w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  翻译系统提示词
                </label>
                <textarea
                  value={localSettings.translatePrompt}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, translatePrompt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  润色系统提示词
                </label>
                <textarea
                  value={localSettings.polishPrompt}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, polishPrompt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  自定义按钮名称
                </label>
                <input
                  type="text"
                  value={localSettings.customLabel}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, customLabel: e.target.value })
                  }
                  placeholder="自定义"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  自定义系统提示词
                </label>
                <textarea
                  value={localSettings.customPrompt}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, customPrompt: e.target.value })
                  }
                  rows={3}
                  placeholder="请输入自定义提示词，用于处理文本..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  设置后可在主界面使用自定义按钮处理文本
                </p>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  主题
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'system', label: '跟随系统', icon: Monitor },
                    { value: 'light', label: '浅色', icon: Sun },
                    { value: 'dark', label: '深色', icon: Moon },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setLocalSettings({ ...localSettings, theme: value as Settings['theme'] })
                      }
                      className={clsx(
                        'flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded border transition-colors',
                        localSettings.theme === value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Download size={16} />
                  导出备份
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Upload size={16} />
                  导入备份
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              {importError && (
                <div className="p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded">
                  {importError}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <AlertTriangle size={16} />
                    重置所有数据
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                      确定要重置所有数据吗？此操作不可恢复。
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                      >
                        确认重置
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
