# ui-components 📦

ui-components 是 公共组件和工具库，为 UI 相关组件提供共享的功能模块、工具函数和 React 组件，旨在提高开发效率并确保代码复用性。

## 模块结构 🏗️

该模块采用清晰的分层结构，主要包含以下三个核心部分：

```
src/
├── components/  # React 组件库
├── modules/     # 功能模块
├── utils/       # 工具函数
└── index.ts     # 模块入口文件
```

## 核心职能 📋

### React 组件 (Components) 🎨

- **Masonry**: 提供高性能瀑布流组件，支持响应式布局、动态列数调整和自定义渲染，便于在各插件中展示图片等内容

## 安装方式 📥

### 使用 pnpm

```bash
pnpm add ui-components
```

## 维护方式 🔧

### **启动文档服务** 🚀

```bash
# 进入包目录
cd packages/ui-components

# 启动开发服务器
pnpm run dev
```

### **构建文档** 📚

```bash
pnpm run build:docs
```

构建后的文档将输出到 `doc_build` 目录，可部署到静态网站服务器。
