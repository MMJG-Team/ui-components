# useEvent · 稳定引用的事件回调 hook

## 简介

返回一个引用在组件生命周期内永远稳定的回调函数，调用时始终执行最新一次渲染传入的闭包。它是 `@mmjg/ui-components` hooks 体系的**基石 hook**。

- 通过 `useRef` 持有最新回调，并在**渲染阶段**直接赋值（而非在 `useEffect` 内更新），保证每次调用都拿到最新闭包。
- 返回值由 `useCallback` 以空依赖 `[]` 包裹，函数引用恒定不变。
- 适用于一切需要稳定引用的副作用场景：`addEventListener`、`ResizeObserver`、`setTimeout`、`setInterval` 等。
- 被 [useMouseDragOffset](./useMouseDragOffset.md) 与 [useAutoLoadMore](./useAutoLoadMore.md) 直接复用。

## 源码位置

[useEvent.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useEvent.ts)

## 类型签名

```ts
function useEvent<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => ReturnType<T>
```

## 实现原理

1. **`useRef` 持有回调**：`const callbackRef = useRef(callback)` 创建一个 ref，初始值为首次传入的 `callback`。
2. **渲染期同步赋值**：在函数体顶层（而非 `useEffect` 内）执行 `callbackRef.current = callback`。每次渲染都会同步把最新的 `callback` 写入 ref，因此即便渲染被并发特性中断，ref 内也始终是最新的闭包。
3. **空依赖 `useCallback`**：返回 `useCallback((...args) => callbackRef.current(...args), [])`。由于依赖数组为空，返回的函数引用在组件整个生命周期内保持不变；但因为它读取的是 `callbackRef.current`，实际执行的是最新的回调。

这种「稳定引用 + 最新闭包」的组合，避免了把回调写进依赖数组导致的监听器反复解绑 / 重绑，也无需在 `useEffect` 依赖中列出函数。

## 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `callback` | 需要被稳定化的事件处理函数。 | `T`（`(...args: any[]) => any` 的子类型） | 必填 |

## 返回值

返回一个**引用恒定**的函数，签名与传入的 `callback` 一致（`(...args: Parameters<T>) => ReturnType<T>`）。调用它等同于调用最新的 `callback`。

## 使用示例

```tsx
import { useEffect } from 'react'
import { useEvent } from '@mmjg/ui-components'

function Demo({ count, onLog }: { count: number; onLog: (n: number) => void }) {
  // handleClick 引用永远不变，但每次点击都能读到最新的 count
  const handleClick = useEvent(() => {
    onLog(count)
  })

  useEffect(() => {
    // 因为 handleClick 引用稳定，此 effect 只会在挂载时注册一次
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [handleClick])

  return <button onClick={handleClick}>click me ({count})</button>
}
```

## 注意事项

- **不要在 `useEffect` 内更新 ref**：本 hook 刻意在渲染阶段赋值，以确保并发渲染下也能拿到最新值；若改在 effect 内赋值，则在 effect 提交前调用会拿到旧闭包。
- **返回函数引用恒定**：可安全地作为 `useEffect` / `useCallback` 的依赖而不会触发重新执行。
- **不替代 `useCallback` 的记忆化语义**：`useEvent` 解决的是「最新闭包 + 稳定引用」，若调用方依赖返回值的具体引用相等性做渲染优化，仍需按场景评估。
- 本 hook 仅做转发，不捕获错误；传入回调自身的异常会原样抛出。

← [Hooks 总览](./README.md) · → [useMounted](./useMounted.md)
