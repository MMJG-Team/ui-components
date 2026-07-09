# useEvent 稳定回调模式

## 简介

`useEvent` 是 `@mmjg/ui-components` hooks 体系的**基石 hook**，返回一个引用在组件生命周期内永远稳定、但调用时始终执行最新闭包的回调函数。它解决了 React 事件监听器与副作用中「闭包陈旧」与「依赖抖动」两类问题，被库内多个 hook 与组件复用。本页解析其实现原理与使用模式。

## 问题背景

在 React 中，组件每次渲染都会创建新的函数闭包。当把这样的回调注册到 `addEventListener`、`ResizeObserver`、拖拽监听等「命令式」API 时，会面临两难：

- **若不把回调放进 `useEffect` 依赖**：回调内部捕获的 props / state 永远停留在首次注册时的值，形成「陈旧闭包」（stale closure），读到的是过期数据。
- **若把回调放进 `useEffect` 依赖**：每次渲染回调引用都变化，导致 effect 反复清理并重新注册监听器，造成「依赖抖动」（resubscribe churn），既浪费性能，又可能在重注册间隙丢失事件。

`useEvent` 通过「稳定引用 + 最新闭包」同时消除这两个问题。

## 实现解析

源码位于 [useEvent.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useEvent.ts)，仅 16 行：

```ts
import { useCallback, useRef } from "react";

/**
 * 事件处理函数的引用，防止函数被重新创建
 * @param callback 事件处理函数
 * @returns 
 */
export function useEvent<T extends (...args: any[]) => any>(callback: T) {
    const callbackRef = useRef(callback);

    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>): ReturnType<T> => {
        return callbackRef.current(...args);
    }, []);
}

export default useEvent
```

实现要点：

1. **`useRef` 持有最新回调**：`const callbackRef = useRef(callback)` 创建一个 ref，初始值为首次传入的 `callback`。
2. **渲染期同步赋值**：`callbackRef.current = callback` 直接写在函数体顶层（而非 `useEffect` 内）。每次渲染都会同步把最新的 `callback` 写入 ref，因此即便渲染被并发特性中断，ref 内也始终是最新的闭包。
3. **空依赖 `useCallback`**：返回的函数由 `useCallback(..., [])` 包裹，依赖数组为空，故返回值引用在组件整个生命周期内保持不变；但它内部读取的是 `callbackRef.current`，实际执行的是最新的回调。

这种组合让调用方既拿到一个永不变的稳定引用（可安全作为 `useEffect` 依赖而不触发重执行），又能在每次调用时读到最新的 props / state。

> **关键**：不要把 `callbackRef.current = callback` 放进 `useEffect`。若改在 effect 内赋值，则在 effect 提交前调用会拿到旧闭包。刻意在渲染阶段赋值是本模式的核心。

## 何时使用

在以下场景应使用 `useEvent` 包裹回调：

- 注册到 `addEventListener` / `removeEventListener` 的事件处理函数。
- 传给 `ResizeObserver`、`MutationObserver`、`IntersectionObserver` 的回调。
- 拖拽相关处理函数（`onMouseDown` / `onMouseMove` / `onMouseUp`）。
- 任何需要稳定引用、又必须读取最新闭包的副作用场景。

判断标准：如果一段回调需要被「注册一次、长期存活」，同时又依赖会变化的 props / state，就适合用 `useEvent`。

## 库内使用案例

### useMouseDragOffset

[useMouseDragOffset](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useMouseDragOffset.ts) 在 `onMouseDown` 中向 `document` 注册 `mousemove` / `mouseup` 监听，并在抬起时移除。三个处理函数均用 `useEvent` 包裹，保证引用稳定、闭包最新：

```ts
const onMouseDown = useEvent((e: React.MouseEvent) => {
    cache.current.mousePosition = { x: e.pageX, y: e.pageY }
    document.body.style.cursor = 'move'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
})

const onMouseMove = useEvent((e: MouseEvent) => {
    const { x, y } = cache.current.mousePosition;
    setOffset({ xOffset: e.pageX - x, yOffset: e.pageY - y })
    // ...
})

const onMouseUp = useEvent((e: MouseEvent) => {
    e.stopPropagation();
    setOffset({ xOffset: 0, yOffset: 0 })
    document.body.style.cursor = 'default'
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
})
```

由于 `onMouseMove` / `onMouseUp` 引用稳定，`removeEventListener` 能正确移除当初 `addEventListener` 注册的同一个函数。

### useAutoLoadMore

[useAutoLoadMore](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useAutoLoadMore.ts) 用 `useEvent` 包裹经 `debounce` 处理后的检查函数，使内部 `useEffect` 的依赖（`params.hasMore`、`params.onLoadMore`）变化时不至于频繁重建 observer 与重绑监听：

```ts
const checkForResize = useEvent(debounce(checkShouldLoadMore, resizeInterval))
const checkForScroll = useEvent(debounce(checkShouldLoadMore, scrollInterval))

useEffect(() => {
    const scrollElement = resolveContainer()
    if (!scrollElement) return

    const observer = new ResizeObserver(() => checkForResize())
    observer.observe(scrollElement)
    scrollElement.addEventListener('scroll', checkForScroll)

    return () => {
        observer.disconnect();
        scrollElement.removeEventListener('scroll', checkForScroll)
    }
}, [params.hasMore, params.onLoadMore])
```

### Menu3D

[Menu3D](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Menu3D/index.tsx) 用 `useEvent` 包裹 `onMouseEnter` / `onMouseLeave`，使悬停暂停 / 恢复旋转的逻辑始终引用最新的 `setRotateStatus`：

```ts
const onMouseEnter = useEvent(() => setRotateStatus(RotateStatus.paused));
const onMouseLeave = useEvent(() => setRotateStatus(RotateStatus.running));
```

### Masonry 内部 hooks

[useResizeObserver](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useResizeObserver.ts) 与 [useScrollViewArea](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useScrollViewArea.ts) 均用 `useEvent` 包裹传入的回调，使 observer / 监听器只在元素变化时重建，而非每次渲染重建。

## 与 React 19 useEventHook 的关系

`useEvent` 在概念上与 React 团队长期讨论的 `useEvent`（RFC 中的 `useEventHook`）是同一思想：提供一个「稳定引用 + 最新闭包」的回调。React 官方版本曾计划在 React 19 周期引入，其语义与本库实现一致——返回的函数引用恒定，但调用时执行最新渲染的闭包。

区别在于实现机制：React 官方版本若落地，会在编译器与运行时层面做更严格的保证（如渲染期赋值的安全性、并发模式下的行为）；本库实现则是一个简洁的 `useRef` + `useCallback` 组合，在当前 React 18 运行时下已能满足库内需求。若官方 `useEvent` 正式发布，库内的 `useEvent` 可平滑替换为其官方实现，调用方代码无需改动。

详细的 API 参考见 [useEvent](../hooks/useEvent.md)。

---

← [响应式与 ResizeObserver 模式](./响应式与-ResizeObserver-模式.md) · [useEvent](../hooks/useEvent.md)
