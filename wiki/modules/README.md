# 模块（Modules）

`@mmjg/ui-components` 的模块（Modules）是一组**框架无关的纯 TypeScript 类**，不依赖 React，可在任意 TS/JS 运行环境（浏览器、Node、其他前端框架）中复用。它们封装了通用的运行时行为模式，如串行任务调度、请求竞态控制与视口可见性追踪。

## 简介

- **纯 TS 类实现**：不引入任何 React 概念（无 hooks、无组件、无 JSX），仅依赖少量轻量运行时库。
- **目录组织**：源码统一位于 `src/modules/` 下，通过 `src/modules/index.ts` 聚合导出。
- **事件机制**：部分模块使用 [mitt](https://github.com/developit/mitt) 提供轻量级事件发射能力。
- **节流控制**：部分模块使用 lodash-es 的 `throttle` / `debounce` 做频率控制。
- **资源清理**：所有模块均提供显式的清理方法（`clear` / `cancel` / `destroy`），便于在卸载或销毁场景下释放监听与引用，避免内存泄漏。
- **命名与默认导出**：每个模块均同时提供具名导出与默认导出。

## 模块清单

| 模块 | 说明 | 核心能力 | 清理方法 | 源码 |
| --- | --- | --- | --- | --- |
| [SyncTaskQueue](./SyncTaskQueue.md) | 同步阻塞队列 | 串行化异步任务执行，前一个任务完成后再执行下一个 | `clear()` | [SyncTaskQueue.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/modules/SyncTaskQueue.ts) |
| [UniqueRequest](./UniqueRequest.md) | 唯一请求管理器 | 自动取消上一次未完成请求，只让最新请求结果生效，解决竞态 | `cancel()` | [UniqueRequest.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/modules/UniqueRequest.ts) |
| [VerticalViewportMonitor](./VerticalViewportMonitor.md) | 纵向视口监控器 | 监听元素在垂直方向的进入/离开视口，触发回调 | `destroy()` | [VerticalViewportMonitor.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/modules/VerticalViewportMonitor.ts) |

## 共性特征

1. **基于 class 实现**：三者均以 ES6 `class` 形式定义，状态封装在实例字段中，通过方法对外暴露行为。
2. **事件与节流依赖**：
   - `SyncTaskQueue` 使用 `mitt` 发射 `completed` 事件。
   - `VerticalViewportMonitor` 使用 lodash-es 的 `throttle` 对滚动/缩放回调做节流。
3. **显式生命周期清理**：
   - `SyncTaskQueue.clear()` —— 清空队列并重置运行状态。
   - `UniqueRequest.cancel()` —— 中止当前请求并复位 `loading`。
   - `VerticalViewportMonitor.destroy()` —— 移除事件监听并清空内部集合。
4. **双重导出**：每个文件同时 `export class X` 与 `export default X`，便于按需导入。

## 阅读顺序

建议按以下顺序阅读：

1. [SyncTaskQueue](./SyncTaskQueue.md) —— 串行任务队列基础。
2. [UniqueRequest](./UniqueRequest.md) —— 请求竞态的取消式解决方案。
3. [VerticalViewportMonitor](./VerticalViewportMonitor.md) —— 视口可见性追踪。

---

← [首页](../Home.md) · → [SyncTaskQueue](./SyncTaskQueue.md)
