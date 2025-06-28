# Waxberry-FE: A React AI Application Template

---

**Waxberry-FE** is a robust front-end engineering template built with React 18 and Webpack 5. It integrates powerful components like `monaco-editor`, `xyflow`, and `mermaid` to provide a versatile platform for displaying various data formats, enabling flow task creation, code previewing, and log monitoring, primarily focused on AI application scenarios.

This project is designed to accelerate the development of AI-driven web applications, offering a structured approach to managing complex UIs and interactions.

---

## 📖 Table of Contents

*   [Project Description](#project-description)
*   [🛠️ Technology Stack](#-technology-stack)
*   [🌟 Key Features](#-key-features)
*   [📂 Project Structure](#-project-structure)
*   [🚀 Quick Start](#-quick-start)
*   [💡 Usage Guide](#-usage-guide)
*   [🤝 Contributing](#-contributing)
*   [📜 License](#-license)
*   [📧 Contact](#-contact)

---

## Project Description

- A front-end engineering template built with React and Webpack, featuring built-in dependencies like `monaco-editor`, `xyflow`, and `mermaid` for displaying various data formats, implementing flow task creation, code preview, and log monitoring functionalities.
- Project Environment: React 18 + Webpack 5. Recommended Node.js v22+ and npm v10+.
- Please pull from the `master` branch; other branches are for development purposes.

## 🛠️ Technology Stack

*   **React 18:** A powerful JavaScript library for building user interfaces.
*   **Webpack 5:** A modern module bundler for JavaScript applications.
*   **react-router:** A declarative routing solution.
*   **Monaco Editor:** A powerful code editor for the web (core of VS Code).
*   **xyflow (React Flow):** A library for building interactive node-based editors.
*   **Mermaid:** A tool for generating diagrams and flowcharts from text.
*   **Sass/SCSS:** A powerful CSS preprocessor for theme management.
*   **i18next:** An internationalization framework.

## 🌟 Key Features

*   **Modular AI Application Development:** All functional modules are centralized in `src/pages/waxberryAi`, using a modular structure for managing list pages, detail pages, and functional pages, facilitating team collaboration and maintenance.
*   **Multiple AI Model Support:** The project revolves around three types of AI models: **Application Models**, **Agent Models**, and **Small Models**, each including AI chat and project generation display capabilities.
*   **Rich AI Chat Features:**
  *   Support for multiple data format displays (e.g., text, code, charts).
  *   File upload functionality for convenient data input.
  *   Custom table and formula input support for complex data processing needs.
*   **Intelligent Project Generation and Display:**
  *   Natural language-guided AI generation of task flows, code blocks, monitoring information, and user requirements.
  *   Integration of `monaco-editor` for code block preview and editing.
  *   Utilization of `xyflow` for rendering and displaying complex task flows.
  *   Generation of easy-to-understand flowcharts and diagrams through `mermaid`.
*   **Unified API Request Management:** All interface requests are uniformly encapsulated and intercepted by `src/utils/request.js`, ensuring request standardization and security.
*   **Internationalization Support:** Support for Chinese and English localization, with language packages configured in the `src/locales` folder, easily extensible for multiple languages.
*   **Theme Switching:** Support for dark/light theme switching, with styles in `src/pages/waxberryAi/theme/`, providing a personalized user experience.
*   **Flexible Route Management:** Page routing managed by `react-router`, configured in `App.jsx`, with route components determining which pages use the base layout, facilitating page organization and access control.

<!-- TODO: Add screenshots or GIFs here -->
**[Screenshots/Demo Videos]**
Future screenshots or GIF animations can be added here to better demonstrate the project's functionality.

## 📂 Project Structure

```
WAXBERRY-FE
├── dist/                # Build output directory
├── public/              # Static assets, such as HTML templates, favicon, etc.
├── src/                 # Source code directory
│   ├── assets/          # Static assets, such as images, fonts, etc.
│   ├── components/      # Reusable UI components
│   ├── config/          # Global configuration
│   ├── layouts/         # Page layout components
│   ├── locales/         # Internationalization language packs
│   ├── pages/waxberryAi/# Core business modules, AI-related pages and features
│   │   ├── agent/       # Agent model related pages
│   │   ├── agentRun/    # Agent runtime pages
│   │   ├── components/  # AI module internal components
│   │   ├── g6demo/      # G6 chart library demo (if used)
│   │   ├── img/         # AI module image resources
│   │   ├── industrialPromptWords/ # Industrial prompt word management
│   │   ├── industryResources/     # Industry resource management
│   │   ├── mcp/         # Model control panel
│   │   ├── myWaxberry/  # My AI applications
│   │   ├── personalData/# Personal data management
│   │   ├── smallModel/  # Small model related pages
│   │   ├── theme/       # AI module theme styles
│   │   ├── waxberry/    # Core AI features (e.g., main page)
│   │   ├── waxberryDetail/# AI detail pages
│   │   ├── waxberryDevStep/# AI development steps
│   │   ├── waxberryMarket/# AI marketplace
│   │   ├── index.jsx    # AI module entry
│   │   ├── index.scss   # AI module styles
│   │   ├── overview.jsx # Overview page
│   │   └── overview.scss# Overview page styles
│   ├── utils/           # Utility functions, such as request.js
│   ├── App.jsx          # Main application component, including route configuration
│   ├── App.test.js      # Application test file
│   ├── context.js       # React Context API
│   ├── index.js         # Application entry file
│   ├── reportWebVitals.js# Web Vitals reporting
│   └── setupTests.js    # Test setup file
├── .babelrc             # Babel configuration file
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables
├── .gitignore           # Git ignore file
├── package-lock.json    # npm dependency lock file
├── package.json         # Project metadata and dependencies
├── README.md            # Project documentation
├── webpack.config.js    # Webpack configuration file
└── yarn.lock            # Yarn dependency lock file (if using yarn)
```

## 🚀 Quick Start

**Requirements:**
*   Node.js: v22+
*   npm: v10+ (npm recommended as project includes `package-lock.json`)

**Steps:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/waxberry-fe.git # Replace with your repository URL
    cd waxberry-fe
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # Or if you prefer using yarn (ensure yarn is installed):
    # yarn install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    # Or
    # yarn start
    ```
    The project will start at `http://localhost:8000` (or another port as shown in the console).

4.  **Build for production:**
    ```bash
    npm run build
    # Or
    # yarn build
    ```
    Build files will be output to the `dist/` directory.

## 💡 Usage Guide

After starting the project, you can access the application in your browser. Here are some examples of core features:

1.  **Navigation:** Use the left menu or top bar to navigate to different AI model pages (Application Models, Agent Models, Small Models).
2.  **AI Chat:** Enter questions or instructions in the chat interface, observe AI responses, and try features like file upload and table input.
3.  **Project Generation:** On relevant pages, use natural language to guide AI in generating task flows, code blocks, and more.
4.  **Theme Switching:** Look for the theme switch button (usually in the top right or settings) to toggle between dark and light modes.

## 🤝 Contributing

We welcome contributions to the Waxberry-FE project! Whether it's submitting bug reports, suggesting new features, or contributing code directly, your input is valuable to the project's development.

**How to Contribute:**

1.  **Report Bugs:**
  *   Search in GitHub Issues to check if the same or similar issue exists.
  *   If not, submit a new Issue with detailed description, including reproduction steps, expected and actual behavior, error messages, and environment information (browser, OS, etc.).
2.  **Suggest New Features:**
  *   Submit a new Issue in GitHub Issues, describing the feature you'd like to add and how it solves problems or brings benefits.
3.  **Code Contributions:**
  *   Fork the repository.
  *   Create your feature branch (`git checkout -b feature/AmazingFeature`).
  *   Make changes and ensure consistent code style.
  *   Write tests (if applicable).
  *   Commit your changes (`git commit -m 'Add some AmazingFeature'`).
  *   Push to the remote branch (`git push origin feature/AmazingFeature`).
  *   Open a Pull Request, ensuring your PR description is clear and linked to relevant Issues (if any).

Before submitting code, ensure it passes linting checks and all tests are successful.

## License
Apache License - see the [LICENSE](LICENSE) file for details

