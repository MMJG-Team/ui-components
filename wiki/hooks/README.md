# Hooks 总览

## 简介

`@mmjg/ui-components` 内置一组轻量级 React Hooks，覆盖事件稳定性、挂载状态、窗口与元素尺寸观测、鼠标拖拽、滚动百分比、模拟进度与自动加载更多等常见场景。

- 全部 hooks 同时提供**命名导出**与**默认导出**，可按需引入。
- 均为纯函数式实现，遵循 React 函数组件心智模型，依赖 `useRef` / `useState` / `useEffect` / `useCallback` / `useMemo` 等原生 API。
- 事件监听与观测器（`ResizeObserver`、`addEventListener`）统一在 `useEffect` 返回值中做清理，避免内存泄漏。

## Hooks 列表

按下「基石优先」顺序排列：基础工具在前，依赖基础工具的组合型 hooks 在后。

| # | Hook | 说明 |
| --- | --- | --- |
| 1 | [useEvent](./useEvent.md) | 返回稳定引用的回调函数，始终调用最新闭包，是其它 hooks 的基石。 |
| 2 | [useMounted](./useMounted.md) | 监听组件挂载 / 卸载状态，可注入 `onMounted` / `onUnmounted` 回调。 |
| 3 | [useWindowSize](./useWindowSize.md) | 监听浏览器窗口尺寸变化，SSR 安全。 |
| 4 | [useBoxSizeObserver](./useBoxSizeObserver.md) | 基于 `ResizeObserver` 监听指定元素的内容区尺寸变化。 |
| 5 | [useMouseDragOffset](./useMouseDragOffset.md) | 捕获鼠标拖拽过程中的偏移量与拖拽状态，返回可绑定的事件处理器。 |
| 6 | [useScrollPercent](./useScrollPercent.md) | 计算滚动容器的滚动百分比，并提供平滑滚动到指定位置的方法。 |
| 7 | [useMockProgress](./useMockProgress.md) | 模拟进度条递增，支持自定义步长、停止条件与更新间隔。 |
| 8 | [useAutoLoadMore](./useAutoLoadMore.md) | 监听滚动 / 尺寸变化自动触发加载更多，处理滚动条消失场景。 |

## 基石 hook

[`useEvent`](./useEvent.md) 是整个 hooks 体系的**基石 hook**。它通过 `useRef` 持有最新的回调，再以空依赖 `useCallback` 返回一个永不变化的函数引用，从而让传入 `addEventListener`、`ResizeObserver` 等需要稳定引用的场景既能拿到最新闭包，又不会因引用变化导致反复解绑 / 重绑。

直接复用 `useEvent` 的 hooks：

- [useMouseDragOffset](./useMouseDragOffset.md) —— `onMouseDown` / `onMouseMove` / `onMouseUp` 三个处理器均由 `useEvent` 包裹，保证注册到 `document` 上的监听器引用稳定。
- [useAutoLoadMore](./useAutoLoadMore.md) —— 经 `lodash-es` 的 `debounce` 包裹后的检查函数再用 `useEvent` 稳定化，确保 `ResizeObserver` 与 `scroll` 监听器不会在每次渲染后失效。

此外，`useEvent` 所体现的「稳定回调 + `useEffect` 返回值清理」模式，也是 [useBoxSizeObserver](./useBoxSizeObserver.md)（`ResizeObserver`）与 [useScrollPercent](./useScrollPercent.md)（`scroll` 监听）所共同遵循的设计范式。

## 通用模式

本组 hooks 在实现上呈现出若干一致的模式：

- **容器参数的 resolve 模式**：[useScrollPercent](./useScrollPercent.md) 与 [useAutoLoadMore](./useAutoLoadMore.md) 的容器参数均声明为 `HTMLElement | (() => HTMLElement)`，内部通过辅助函数（`resolveScrollContainer` / `resolveContainer`）兼容「直接传元素」与「传返回元素的函数」两种形式，便于在 ref 当前值尚未确定的场景下延迟求值。
- **`as const` 元组或对象返回**：[useBoxSizeObserver](./useBoxSizeObserver.md) 返回 `[ref, boxSize] as const` 元组；其余 hooks 多以对象形式聚合返回值，便于解构与按需取用。
- **`useEvent` 稳定回调**：需要长期挂载到 `document` 或观测器上的回调统一用 `useEvent` 包裹，避免依赖数组膨胀或监听器频繁重建。
- **`useEffect` 返回值清理**：所有注册副作用（事件监听、`ResizeObserver`、`setTimeout`）均在 `useEffect` 的清理函数中执行 `removeEventListener` / `disconnect` / `clearTimeout`，保证组件卸载时不残留副作用。
- **函数或数值的适配**：[useMockProgress](./useMockProgress.md) 的 `adaptValue` 与上述容器的 resolve 模式类似，允许参数以「数值」或「返回数值的函数」两种形式传入。

## 导出

全部 hooks 通过 `src/hooks/index.ts` 以 `export *` 形式聚合再导出：

[index.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/index.ts) 为统一入口，按 `export *` 聚合再导出全部 hooks。

→ [useEvent](./useEvent.md)
