# useMounted · 组件挂载状态 hook

## 简介

监听组件的挂载 / 卸载状态，并支持在挂载与卸载时机注入回调。

- 通过 `useState(false)` + `useEffect([])` 实现，挂载后置为 `true`，卸载时置回 `false`。
- 可选 `onMounted` / `onUnmounted` 回调，分别在挂载完成与清理阶段执行。
- 返回 `{ mounted }`，便于在 SSR 或首屏避免服务端 / 客户端不一致时做条件渲染。

## 源码位置

[useMounted.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useMounted.ts)

## 类型签名

```ts
function useMounted(
  onMounted?: () => void,
  onUnmounted?: () => void
): { mounted: boolean }
```

## 实现原理

1. **状态初始化**：`const [mounted, setMounted] = useState(false)`，初始为 `false`。
2. **挂载副作用**：`useEffect(() => { ... }, [])` 以空依赖仅在挂载后执行一次：
   - `setMounted(true)` 将状态置为 `true`；
   - 调用可选的 `onMounted?.()`。
3. **清理副作用**：effect 返回的清理函数在卸载时执行：
   - `setMounted(false)` 将状态置回 `false`；
   - 调用可选的 `onUnmounted?.()`。

由于 effect 依赖为 `[]`，`onMounted` / `onUnmounted` 只在挂载 / 卸载时各调用一次；若回调闭包依赖外部变量，需自行用 [useEvent](./useEvent.md) 等方式稳定化以避免读到旧值。

## 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `onMounted` | 组件挂载完成后执行的回调。 | `() => void` | `undefined` |
| `onUnmounted` | 组件即将卸载时执行的回调。 | `() => void` | `undefined` |

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mounted` | `boolean` | 组件是否已挂载；挂载后为 `true`，卸载后为 `false`。 |

## 使用示例

```tsx
import { useMounted } from '@mmjg/ui-components'

function Demo() {
  const { mounted } = useMounted(
    () => console.log('mounted'),
    () => console.log('unmounted'),
  )

  return <div>{mounted ? '已挂载' : '挂载中'}</div>
}
```

## 注意事项

- 首次渲染（服务端）时 `mounted` 为 `false`，挂载后的客户端渲染才为 `true`，因此可用来规避 SSR 下的水合不一致。
- `onMounted` / `onUnmounted` 因 effect 依赖为空只执行一次；若回调内部依赖频繁变化的外部变量，需配合 [useEvent](./useEvent.md) 以始终调用最新闭包。
- 不要在 `onUnmounted` 中触发需要组件已挂载前提的逻辑，此时组件已进入卸载流程。

← [Hooks 总览](./README.md) · → [useWindowSize](./useWindowSize.md)
