// Chrome Storage 封装工具

const STORAGE_KEY = 'simpleprompt_data';
const LIBRARY_VERSION_KEY = 'simpleprompt_library_version';
const CURRENT_LIBRARY_VERSION = 4; // 每次更新默认词典时递增

export interface Settings {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  theme: 'system' | 'light' | 'dark';
  language: 'zh' | 'en';
  translatePrompt: string;
  polishPrompt: string;
  customPrompt: string;
  customLabel: string;
}

export interface LibraryItem {
  label: string;
  content: string;
  preview?: string;
}

export interface LibraryCategory {
  category: string;
  colorType: 'blue' | 'purple';
  items: LibraryItem[];
}

export interface AppData {
  settings: Settings;
  library: LibraryCategory[];
}

const defaultSettings: Settings = {
  apiKey: '',
  apiBaseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  theme: 'system',
  language: 'zh',
  translatePrompt: '你是一个专业的翻译助手，请将以下内容翻译为英文，保持原有的格式和含义：',
  polishPrompt: '你是一个AI提示词撰写专家，请根据以下原有提示词进行表述优化，更符合LLM或midjourney的语法规范，使其更加专业、流畅和清晰。请直接输出改进后的提示词：',
  customPrompt: '',
  customLabel: '自定义',
};

const defaultLibrary: LibraryCategory[] = [
  {
    category: '画质 (Quality)',
    colorType: 'blue',
    items: [
      { label: '4K', content: '4k resolution' },
      { label: '大师作', content: 'masterpiece, best quality' },
      { label: '超高清', content: 'ultra highres, 8k uhd' },
      { label: '电影摄像', content: 'cinematic lighting, film grain, depth of field, bokeh, anamorphic lens' },
      { label: 'C4D渲染', content: 'Cinema 4D render, octane render, 3D modeling, volumetric lighting, subsurface scattering' },
    ],
  },
  {
    category: '风格 (Style)',
    colorType: 'blue',
    items: [
      { label: '赛博朋克', content: 'cyberpunk style, neon lights' },
      { label: '写实', content: 'photorealistic, realistic' },
      { label: '动漫', content: 'anime style, manga' },
      { label: '矢量', content: 'vector art, flat design, clean lines, minimalistic, svg style' },
      { label: '游戏UI', content: 'game UI design, HUD interface, sci-fi panel, futuristic dashboard, holographic display' },
      { label: '毛绒', content: 'plush toy, fluffy texture, soft material, fuzzy surface, cute stuffed animal' },
      { label: '哑光', content: 'matte finish, soft lighting, muted colors, non-reflective surface, diffused shadows' },
    ],
  },
  {
    category: 'LLM 指令',
    colorType: 'purple',
    items: [
      { label: '代码解释', content: '请解释这段代码的逻辑，并优化时间复杂度。' },
      { label: '文案润色', content: '请润色以下文案，使其更加专业和流畅。' },
      { label: '翻译助手', content: '请将以下内容翻译成英文，保持原意。' },
      {
        label: '助学导师',
        content: '你是一位资深的助学导师，擅长将复杂的知识以通俗易懂的方式传授给学生。请针对我提出的问题，以循序渐进的方式讲解核心概念，提供具体示例帮助理解，并给出练习建议以巩固学习成果。'
      },
      {
        label: '产品经理',
        content: '你是一位经验丰富的产品经理，具备敏锐的市场洞察力和用户需求分析能力。请帮我分析以下产品需求，评估其可行性，提供功能优先级建议，并给出产品迭代规划思路。'
      },
      {
        label: '资深主美',
        content: '你是一位资深的游戏/影视主美，拥有出色的审美能力和美术把控力。请对以下美术设计进行评审，从构图、色彩、风格统一性等角度给出专业意见，并提供优化方向。'
      },
      {
        label: '资深程序',
        content: '你是一位资深程序员，精通多种编程语言和架构设计。请帮我 review 以下代码，指出潜在的性能瓶颈、安全隐患和可维护性问题，并给出重构建议。'
      },
      {
        label: '知识结构',
        content: '请通过搜索和思考，全面总结以下领域的知识和技术框架，包括：核心概念、关键技术、学习路径、推荐资源、实践项目建议。帮助我建立系统化的知识体系。'
      },
      {
        label: '中文对话',
        content: '请使用中文回答我的所有问题，保持专业、清晰、友好的交流风格。'
      },
    ],
  },
];

export async function getData(): Promise<AppData> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY, LIBRARY_VERSION_KEY]);

    // 检查是否需要更新默认词典
    const savedVersion = result[LIBRARY_VERSION_KEY] || 0;
    const needsLibraryUpdate = savedVersion < CURRENT_LIBRARY_VERSION;

    if (result[STORAGE_KEY]) {
      const data = result[STORAGE_KEY] as AppData;

      // 如果需要更新默认词典，合并新词条
      if (needsLibraryUpdate) {
        console.log(`Updating library from version ${savedVersion} to ${CURRENT_LIBRARY_VERSION}`);
        data.library = mergeDefaultLibrary(data.library, defaultLibrary);
        // 合并新的默认设置，保留用户自定义的其他设置
        data.settings = { ...defaultSettings, ...data.settings };
        await chrome.storage.local.set({
          [STORAGE_KEY]: data,
          [LIBRARY_VERSION_KEY]: CURRENT_LIBRARY_VERSION
        });
      }

      return data;
    }
  } catch (error) {
    console.error('Failed to get data from storage:', error);
  }

  // 首次安装，设置版本号
  await chrome.storage.local.set({ [LIBRARY_VERSION_KEY]: CURRENT_LIBRARY_VERSION });

  return {
    settings: defaultSettings,
    library: defaultLibrary,
  };
}

// 合并默认词典：保留用户自定义的分类和词条，添加新的默认词条
function mergeDefaultLibrary(userLibrary: LibraryCategory[], defaultLib: LibraryCategory[]): LibraryCategory[] {
  const merged = [...userLibrary];

  for (const defaultCategory of defaultLib) {
    const existingCategoryIndex = merged.findIndex(
      cat => cat.category === defaultCategory.category
    );

    if (existingCategoryIndex >= 0) {
      // 分类已存在，合并词条
      const existingCategory = merged[existingCategoryIndex];
      const existingLabels = new Set(existingCategory.items.map(item => item.label));

      for (const defaultItem of defaultCategory.items) {
        if (!existingLabels.has(defaultItem.label)) {
          existingCategory.items.push(defaultItem);
        }
      }
    } else {
      // 分类不存在，添加整个分类
      merged.push({ ...defaultCategory });
    }
  }

  return merged;
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  } catch (error) {
    console.error('Failed to save data to storage:', error);
  }
}

export async function getSettings(): Promise<Settings> {
  const data = await getData();
  return { ...defaultSettings, ...data.settings };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const data = await getData();
  data.settings = { ...data.settings, ...settings };
  await saveData(data);
}

export async function getLibrary(): Promise<LibraryCategory[]> {
  const data = await getData();
  return data.library || defaultLibrary;
}

export async function saveLibrary(library: LibraryCategory[]): Promise<void> {
  const data = await getData();
  data.library = library;
  await saveData(data);
}

export async function exportData(): Promise<string> {
  const data = await getData();
  return JSON.stringify(data, null, 2);
}

export async function importData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString) as AppData;
    await saveData(data);
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

export async function resetData(): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: {
      settings: defaultSettings,
      library: defaultLibrary,
    },
    [LIBRARY_VERSION_KEY]: CURRENT_LIBRARY_VERSION
  });
}
