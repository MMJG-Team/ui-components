# @mmjg/ui-components 📦

@mmjg/ui-components 是面向 UI 开发场景打造的公共组件与工具通用库，核心服务于前端 UI 开发工作，聚焦整合各类可复用的前端能力，为整体 UI 体系提供标准化、通用化的技术支撑。

## 模块结构 🏗️

该模块采用清晰的分层结构，主要包含以下三个核心部分：

```
src/
├── components/  # 组件库
├── modules/     # 功能模块
├── hooks/       # React 自定义钩子
└── index.ts     # 入口文件
```

## 安装方式 📥

### 使用 pnpm

```bash
pnpm add @mmjg/ui-components
```

## 维护方式 🔧

### **启动文档服务** 🚀

```bash
# 进入包目录
cd packages/@mmjg/ui-components

# 启动开发服务器
pnpm run dev
```

### **构建文档** 📚

```bash
pnpm run build:docs
```

构建后的文档将输出到 `doc_build` 目录，可部署到静态网站服务器。
