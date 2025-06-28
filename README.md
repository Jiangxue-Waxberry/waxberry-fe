# Waxberry-FE: React AI 应用模板

---

**Waxberry-FE** 是一个基于 React 18 和 Webpack 5 构建的健壮前端工程模板。它集成了 `monaco-editor`、`xyflow` 和 `mermaid` 等强大组件，为显示各种数据格式、实现流程任务创建、代码预览和日志监控提供了多功能平台，主要专注于 AI 应用场景。

本项目旨在加速 AI 驱动的 Web 应用程序开发，为管理复杂的 UI 和交互提供结构化方法。

---

## 📖 目录

*   [项目描述](#项目描述)
*   [🛠️ 技术栈](#️-技术栈)
*   [🌟 核心功能](#-核心功能)
*   [📂 项目结构](#-项目结构)
*   [🚀 快速开始](#-快速开始)
*   [💡 使用指南](#-使用指南)
*   [🤝 贡献指南](#-贡献指南)
*   [📜 许可证](#-许可证)
*   [📧 联系方式](#-联系方式)

---

## 项目描述

- 基于 React 和 Webpack 构建的前端工程模板，内置 `monaco-editor`、`xyflow` 和 `mermaid` 等依赖，用于显示各种数据格式，实现流程任务创建、代码预览和日志监控功能。
- 项目环境：React 18 + Webpack 5。推荐 Node.js v22+ 和 npm v10+。
- 请从 `master` 分支拉取；其他分支用于开发目的。

## 🛠️ 技术栈

*   **React 18:** 用于构建用户界面的强大 JavaScript 库。
*   **Webpack 5:** 现代 JavaScript 应用程序模块打包器。
*   **react-router:** 声明式路由解决方案。
*   **Monaco Editor:** 强大的 Web 代码编辑器（VS Code 的核心）。
*   **xyflow (React Flow):** 用于构建交互式基于节点的编辑器的库。
*   **Mermaid:** 从文本生成图表和流程图的工具。
*   **Sass/SCSS:** 强大的 CSS 预处理器，用于主题管理。
*   **i18next:** 国际化框架。

## 🌟 核心功能

*   **模块化 AI 应用开发:** 所有功能模块集中在 `src/pages/waxberryAi` 中，使用模块化结构管理列表页面、详情页面和功能页面，便于团队协作和维护。
*   **多 AI 模型支持:** 项目围绕三种类型的 AI 模型：**应用模型**、**代理模型**和**小模型**，每种都包括 AI 聊天和项目生成显示功能。
*   **丰富的 AI 聊天功能:**
  *   支持多种数据格式显示（如文本、代码、图表）。
  *   文件上传功能，方便数据输入。
  *   自定义表格和公式输入支持，满足复杂数据处理需求。
*   **智能项目生成和显示:**
  *   自然语言引导的 AI 生成任务流程、代码块、监控信息和用户需求。
  *   集成 `monaco-editor` 进行代码块预览和编辑。
  *   利用 `xyflow` 渲染和显示复杂的任务流程。
  *   通过 `mermaid` 生成易于理解的流程图和图表。
*   **统一 API 请求管理:** 所有接口请求由 `src/utils/request.js` 统一封装和拦截，确保请求标准化和安全性。
*   **国际化支持:** 支持中英文本地化，语言包配置在 `src/locales` 文件夹中，易于扩展到多种语言。
*   **主题切换:** 支持暗色/亮色主题切换，样式在 `src/pages/waxberryAi/theme/` 中，提供个性化用户体验。
*   **灵活的路由管理:** 页面路由由 `react-router` 管理，在 `App.jsx` 中配置，路由组件决定哪些页面使用基础布局，便于页面组织和访问控制。

<!-- TODO: 在此处添加截图或 GIF -->
**[截图/演示视频]**
未来可以在此处添加截图或 GIF 动画，以更好地展示项目功能。

## 📂 项目结构

```
WAXBERRY-FE
├── dist/                # 构建输出目录
├── public/              # 静态资源，如 HTML 模板、favicon 等
├── src/                 # 源代码目录
│   ├── assets/          # 静态资源，如图片、字体等
│   ├── components/      # 可复用 UI 组件
│   ├── config/          # 全局配置
│   ├── layouts/         # 页面布局组件
│   ├── locales/         # 国际化语言包
│   ├── pages/waxberryAi/# 核心业务模块，AI 相关页面和功能
│   │   ├── agent/       # 代理模型相关页面
│   │   ├── agentRun/    # 代理运行时页面
│   │   ├── components/  # AI 模块内部组件
│   │   ├── g6demo/      # G6 图表库演示（如果使用）
│   │   ├── img/         # AI 模块图片资源
│   │   ├── industrialPromptWords/ # 工业提示词管理
│   │   ├── industryResources/     # 行业资源管理
│   │   ├── mcp/         # 模型控制面板
│   │   ├── myWaxberry/  # 我的 AI 应用
│   │   ├── personalData/# 个人数据管理
│   │   ├── smallModel/  # 小模型相关页面
│   │   ├── theme/       # AI 模块主题样式
│   │   ├── waxberry/    # 核心 AI 功能（如主页面）
│   │   ├── waxberryDetail/# AI 详情页面
│   │   ├── waxberryDevStep/# AI 开发步骤
│   │   ├── waxberryMarket/# AI 市场
│   │   ├── index.jsx    # AI 模块入口
│   │   ├── index.scss   # AI 模块样式
│   │   ├── overview.jsx # 概览页面
│   │   └── overview.scss# 概览页面样式
│   ├── utils/           # 工具函数，如 request.js
│   ├── App.jsx          # 主应用组件，包括路由配置
│   ├── App.test.js      # 应用测试文件
│   ├── context.js       # React Context API
│   ├── index.js         # 应用入口文件
│   ├── reportWebVitals.js# Web Vitals 报告
│   └── setupTests.js    # 测试设置文件
├── .babelrc             # Babel 配置文件
├── .env.development     # 开发环境变量
├── .env.production      # 生产环境变量
├── .gitignore           # Git 忽略文件
├── package-lock.json    # npm 依赖锁定文件
├── package.json         # 项目元数据和依赖
├── README.md            # 项目文档
├── webpack.config.js    # Webpack 配置文件
└── yarn.lock            # Yarn 依赖锁定文件（如果使用 yarn）
```

## 🚀 快速开始

**要求:**
*   Node.js: v22+
*   npm: v10+（推荐使用 npm，因为项目包含 `package-lock.json`）

**步骤:**

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/your-username/waxberry-fe.git # 替换为您的仓库 URL
    cd waxberry-fe
    ```
2.  **安装依赖:**
    ```bash
    npm install
    # 或者如果您喜欢使用 yarn（确保已安装 yarn）：
    # yarn install
    ```
3.  **启动开发服务器:**
    ```bash
    npm start
    # 或者
    # yarn start
    ```
    项目将在 `http://localhost:8000` 启动（或控制台显示的其他端口）。

4.  **构建生产版本:**
    ```bash
    npm run build
    # 或者
    # yarn build
    ```
    构建文件将输出到 `dist/` 目录。

## 💡 使用指南

启动项目后，您可以在浏览器中访问应用程序。以下是一些核心功能的示例：

1.  **导航:** 使用左侧菜单或顶部栏导航到不同的 AI 模型页面（应用模型、代理模型、小模型）。
2.  **AI 聊天:** 在聊天界面中输入问题或指令，观察 AI 响应，并尝试文件上传和表格输入等功能。
3.  **项目生成:** 在相关页面上，使用自然语言引导 AI 生成任务流程、代码块等。
4.  **主题切换:** 寻找主题切换按钮（通常在右上角或设置中）在暗色和亮色模式之间切换。

## 🤝 贡献指南

我们欢迎对 Waxberry-FE 项目的贡献！无论是提交错误报告、建议新功能还是直接贡献代码，您的输入对项目的发展都很有价值。

**如何贡献:**

1.  **报告错误:**
  *   在 GitHub Issues 中搜索，检查是否存在相同或类似的问题。
  *   如果没有，提交新的 Issue，包含详细描述，包括重现步骤、预期和实际行为、错误信息和环境信息（浏览器、操作系统等）。
2.  **建议新功能:**
  *   在 GitHub Issues 中提交新的 Issue，描述您想要添加的功能以及它如何解决问题或带来好处。
3.  **代码贡献:**
  *   Fork 仓库。
  *   创建您的功能分支（`git checkout -b feature/AmazingFeature`）。
  *   进行更改并确保代码风格一致。
  *   编写测试（如果适用）。
  *   提交您的更改（`git commit -m 'Add some AmazingFeature'`）。
  *   推送到远程分支（`git push origin feature/AmazingFeature`）。
  *   打开 Pull Request，确保您的 PR 描述清晰并链接到相关 Issues（如果有）。

在提交代码之前，确保它通过 linting 检查并且所有测试都成功。

## 📜 许可证
Apache License - 详情请参阅 [LICENSE](LICENSE) 文件


---

**感谢您对 Waxberry-FE 项目的兴趣和支持！**

