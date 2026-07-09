# useWindowSize · 窗口尺寸监听 hook

## 简介

监听浏览器窗口（`window`）的尺寸变化，实时返回当前的 `width` / `height`。

- SSR 安全：服务端环境下返回 `{ width: 0, height: 0 }`，避免访问 `window` 报错。
- 通过 `resize` 事件监听，并在 `useEffect` 清理时 `removeEventListener`。
- 初始值由 `getWindowSize()` 惰性求值，保证服务端 / 客户端首屏一致。

## 源码位置

[useWindowSize.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useWindowSize.ts)

## 类型签名

```ts
function useWindowSize(): { width: number; height: number }
```

## 实现原理

1. **`getWindowSize` 工具函数**：通过 `typeof window !== 'undefined'` 判断运行环境。在浏览器下返回 `{ width: window.innerWidth, height: window.innerHeight }`；在服务端（无 `window`）下返回 `{ width: 0, height: 0 }`。
2. **惰性初始状态**：`useState(getWindowSize)` 将 `getWindowSize` 作为初始化函数传入，仅在首次渲染时调用一次，避免每次渲染重复求值。
3. **`resize` 监听**：`useEffect(() => { ... }, [])` 在挂载后向 `window` 注册 `resize` 事件，回调 `handleResize` 读取最新的 `window.innerWidth` / `window.innerHeight` 并 `setWindowSize`。
4. **清理**：effect 返回 `() => window.removeEventListener('resize', handleResize)`，卸载时移除监听。

## 参数

无参数。

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `width` | `number` | 窗口可视区宽度（`window.innerWidth`）；服务端为 `0`。 |
| `height` | `number` | 窗口可视区高度（`window.innerHeight`）；服务端为 `0`。 |

## 使用示例

```tsx
import { useWindowSize } from '@mmjg/ui-components'

function Demo() {
  const { width, height } = useWindowSize()
  return <div>当前窗口：{width} × {height}</div>
}
```

## 注意事项

- **SSR**：服务端渲染时返回 `{ width: 0, height: 0 }`，客户端水合后会立即触发一次 `resize` 之外的更新；若需在挂载后才读取真实尺寸，可配合 [useMounted](./useMounted.md)。
- **高频事件**：`resize` 事件可能高频触发，本 hook 未做节流 / 防抖；如需降低更新频率，可在使用方包裹防抖逻辑。
- 依赖数组为空，监听器仅在挂载 / 卸载时注册 / 移除。

← [Hooks 总览](./README.md) · → [useBoxSizeObserver](./useBoxSizeObserver.md)
