# SimplePrompt - 提示词备忘录

一个极简、本地化的 AI 提示词管理 Chrome 扩展，支持 DeepSeek API 翻译润色。

## ✨ 功能特性

### 🎨 绘画提示词管理
- **画质增强**：4K、大师作、超高清、电影摄像、C4D渲染
- **风格多样**：赛博朋克、写实、动漫、矢量、游戏UI、毛绒、哑光
- **快速添加**：点击词条以逗号分隔添加到工作台

### 🤖 LLM 指令库
- **智能助手**：代码解释、文案润色、翻译助手
- **专业角色**：助学导师、产品经理、资深主美、资深程序、知识结构
- **中文对话**：强制使用中文交流的提示词

### 📝 工作台功能
- **多标签管理**：支持创建、重命名、删除标签
- **实时编辑**：多行文本编辑，支持从词典快速添加
- **一键操作**：复制、清空、润色、翻译、自定义处理、保存到词典

### 🎯 词典管理
- **分类管理**：支持新建、重命名、删除指令组
- **词条管理**：编辑、删除、添加新词条
- **自定义分类**：支持设置分类颜色（蓝色-绘画/紫色-LLM）
- **智能保存**：保存到词典时可选择已有分类或创建新分类

### 🔧 工具集成
- **DeepSeek API**：支持文本翻译和润色
- **自定义处理**：可配置自定义提示词处理文本
- **数据备份**：导出/导入 JSON 格式备份
- **主题切换**：支持浅色/深色/跟随系统
- **自动更新**：默认词典自动更新，保留用户自定义内容

### 🎪 悬浮窗模式
- **常驻按钮**：25px 圆形按钮，点击展开
- **独立窗口**：800x600 独立编辑窗口

## 📦 安装方法

### 方法一：从源码加载（推荐）
1. 克隆本仓库：
   ```bash
   git clone https://github.com/zhadao/Simple-Prompt-Note.git
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建项目：
   ```bash
   npm run build
   ```
4. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
5. 开启 "开发者模式"
6. 点击 "加载已解压的扩展程序"
7. 选择 `dist` 目录

### 方法二：直接加载
1. 下载发布的 `dist` 文件夹
2. 按照上述步骤 4-7 加载

## 🚀 使用指南

### 基础操作
1. **添加提示词**：点击右侧词典中的词条，自动添加到左侧工作台
2. **保存到词典**：点击 "保存到词典" 按钮，选择分类或创建新分类
3. **编辑词条**：鼠标悬停在词条上，点击编辑按钮
4. **创建标签**：点击 "+" 按钮创建新标签，支持重命名和删除

### 高级功能
1. **翻译文本**：点击 "翻译" 按钮，调用 DeepSeek API 翻译为英文
2. **润色文本**：点击 "润色" 按钮，调用 DeepSeek API 优化表达
3. **自定义处理**：
   - 在设置中配置自定义按钮名称和提示词
   - 主界面会显示自定义按钮
   - 点击使用自定义提示词处理文本
4. **数据备份**：在设置中点击 "导出备份" 保存数据
5. **主题切换**：在设置中选择喜欢的主题模式（浅色/深色/跟随系统）

### API 配置
1. 点击右上角设置按钮
2. 在 "API 配置" 标签页中：
   - 输入 DeepSeek API Key
   - 可选择配置自定义翻译/润色/自定义提示词
3. 点击保存

## 🛠 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **图标库**：Lucide React
- **扩展 API**：Chrome Extension Manifest V3
- **API 集成**：DeepSeek API

## 📁 项目结构

```
SimplePrompt/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Dictionary.tsx   # 词典组件
│   │   ├── SettingsModal.tsx # 设置模态框
│   │   └── SaveToLibraryModal.tsx # 保存对话框
│   ├── hooks/               # 自定义钩子
│   │   ├── useTheme.ts      # 主题管理
│   │   └── useStorage.ts    # 存储管理
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # Chrome 存储封装
│   │   └── deepseek.ts      # DeepSeek API 封装
│   ├── App.tsx              # 主应用
│   ├── content.tsx          # 内容脚本（悬浮窗）
│   ├── background.ts        # 后台脚本
│   └── style.css            # 全局样式
├── public/                  # 静态资源
├── dist/                    # 构建输出
├── manifest.json            # 扩展配置
├── package.json             # 项目配置
└── README.md                # 项目说明
```

## 🔮 未来规划

- [ ] 支持更多 AI API 集成
- [ ] 添加提示词模板库
- [ ] 实现云同步功能
- [ ] 支持批量编辑和导入
- [ ] 添加更多语言支持

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- GitHub: [zhadao](https://github.com/zhadao)
- 邮箱: <zhadaosizi@qq.com>
- Bilibili: [扎导ZHA]([https://space.bilibili.com/3546738841417351](https://space.bilibili.com/491873894?spm_id_from=333.1387.0.0))
- 项目地址: [Simple-Prompt-Note](https://github.com/zhadao/Simple-Prompt-Note)

---

**享受提示词管理的乐趣！** 🎉
