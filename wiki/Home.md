# 🏠 ui-components Wiki 首页

> 本 Wiki 是 [`@mmjg/ui-components`](https://github.com/MMJG-Team/ui-components) 项目的官方知识库，由对源码的深度分析沉淀而成，旨在系统性地记录该组件库的**架构设计、代码风格、编码规范、工程化实践与各模块的运行原理**。

---

## 📖 关于本项目

`@mmjg/ui-components` 是 [MMJG-Team](https://github.com/MMJG-Team) 在研发过程中沉淀出来的组件库，技术栈基于 **React 18 + TypeScript**，使用 **pnpm monorepo** 组织代码，由 **Rolldown** 打包构建，文档站点基于 **Rspress** 搭建。

整个库按职责划分为四大类导出：

| 分类                      | 数量 | 说明                    | 入口                      |
| ------------------------- | ---- | ----------------------- | ------------------------- |
| **视图组件 (components)** | 6 个 | 可直接渲染的 React 组件 | `src/components/index.ts` |
| **React Hooks**           | 8 个 | 可复用的状态/行为逻辑   | `src/hooks/index.ts`      |
| **功能模块 (modules)**    | 3 个 | 与框架解耦的纯逻辑类    | `src/modules/index.ts`    |
| **工具函数 (utils)**      | 1 组 | 通用异步工具            | `src/utils/index.ts`      |

所有内容统一从包根 [`src/index.ts`](../packages/ui-components/src/index.ts) 通过 `export *` 聚合对外暴露。

---

## 🗺️ Wiki 导航

### 第一部分：项目总览

- [项目概览](./01-项目概览.md)
- [架构设计](./02-架构设计.md)
- [技术栈与依赖](./03-技术栈与依赖.md)
- [工程化配置](./04-工程化配置.md)
- [目录结构详解](./05-目录结构详解.md)
- [编码规范与代码风格](./06-编码规范与代码风格.md)

### 第二部分：组件参考手册

- [组件总览](./components/README.md)
- [Masonry 瀑布流](./components/Masonry.md)
- [Menu3D 3D 菜单](./components/Menu3D.md)
- [Shimmer 流光效果](./components/Shimmer.md)
- [BorderEffect 动态边框](./components/BorderEffect.md)
- [PartitionLayout 分栏布局](./components/PartitionLayout.md)
- [Cube 3D 立方体](./components/Cube.md)

### 第三部分：Hooks 参考手册

- [Hooks 总览](./hooks/README.md)
- [useEvent](./hooks/useEvent.md) — 稳定回调（基石 hook）
- [useMounted](./hooks/useMounted.md)
- [useWindowSize](./hooks/useWindowSize.md)
- [useBoxSizeObserver](./hooks/useBoxSizeObserver.md)
- [useMouseDragOffset](./hooks/useMouseDragOffset.md)
- [useScrollPercent](./hooks/useScrollPercent.md)
- [useMockProgress](./hooks/useMockProgress.md)
- [useAutoLoadMore](./hooks/useAutoLoadMore.md)

### 第四部分：模块与工具

- [模块总览](./modules/README.md)
- [SyncTaskQueue 同步任务队列](./modules/SyncTaskQueue.md)
- [UniqueRequest 唯一请求管理器](./modules/UniqueRequest.md)
- [VerticalViewportMonitor 视口监控器](./modules/VerticalViewportMonitor.md)
- [AsyncUtil 异步工具](./utils/AsyncUtil.md)

### 第五部分：工程化与发布

- [开发流程](./workflow/开发流程.md)
- [构建与发布](./workflow/构建与发布.md)
- [Changesets 版本管理](./workflow/Changesets-版本管理.md)
- [CI/CD 自动化](./workflow/CI-CD-自动化.md)

### 第六部分：实践指南

- [新增组件指南](./guides/新增组件指南.md)
- [CSS Modules 与 Less 规范](./guides/CSS-Modules-与-Less-规范.md)
- [响应式与 ResizeObserver 模式](./guides/响应式与-ResizeObserver-模式.md)
- [useEvent 稳定回调模式](./guides/useEvent-稳定回调模式.md)

### 附录

- [术语表](./appendix/术语表.md)

---

## 🔍 如何阅读本 Wiki

- **新人入门**：按「第一部分」顺序阅读，建立全局认知。
- **查阅 API**：直接进入对应分类（组件 / Hooks / 模块）的参考手册。
- **参与贡献**：阅读「第六部分 实践指南」与 [开发流程](./workflow/开发流程.md)。
- **理解原理**：重点关注 [架构设计](./02-架构设计.md) 与各模块页中的「实现原理」小节。

> 💡 本 Wiki 中的代码引用均带有可点击的源码链接（`file:///` 协议），可在 IDE 中直接跳转。
