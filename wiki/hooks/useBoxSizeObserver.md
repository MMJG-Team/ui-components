# useBoxSizeObserver · 元素尺寸观测 hook

## 简介

基于 `ResizeObserver` 监听指定元素内容区（`contentRect`）的尺寸变化，返回用于绑定到元素上的 `ref` 与最新的 `boxSize`。

- 返回 `[ref, boxSize] as const` 元组，`ref` 需挂载到目标 DOM 节点。
- 初始 `boxSize` 为 `{ width: 0, height: 0 }`，观测启动后由 `entry.contentRect` 更新。
- 在 `useEffect` 清理时调用 `observer.disconnect()` 释放观测器。

## 源码位置

[useBoxSizeObserver.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useBoxSizeObserver.ts)

## 类型签名

```ts
function useBoxSizeObserver(): [
  ref: React.MutableRefObject<HTMLDivElement | null>,
  boxSize: { width: number; height: number }
]
```

## 实现原理

1. **ref 创建**：`const ref = useRef<HTMLDivElement | null>(null)`，类型限定为 `HTMLDivElement`，需绑定到 `div` 节点。
2. **状态初始化**：`const [boxSize, setBoxSize] = useState({ width: 0, height: 0 })`。
3. **`ResizeObserver` 注册**：`useEffect(() => { ... }, [])` 在挂载后创建 `new ResizeObserver((entries) => { ... })`，遍历 `entries` 取 `entry.contentRect.width` / `height` 写入状态。
4. **观测目标**：读取 `ref.current`，若存在则 `observer.observe(element)`。
5. **清理**：effect 返回 `() => observer.disconnect()`，卸载时断开所有观测。

由于 effect 依赖为空，观测器仅创建一次；若目标元素后续更换，需要重新挂载组件或自行扩展依赖。

## 参数

无参数。

## 返回值

返回 `as const` 元组：

| 位置 | 字段 | 类型 | 说明 |
| --- | --- | --- | --- |
| 0 | `ref` | `React.MutableRefObject<HTMLDivElement \| null>` | 绑定到目标 `div` 的 ref。 |
| 1 | `boxSize` | `{ width: number; height: number }` | 元素内容区尺寸，初始为 `{0, 0}`。 |

## 使用示例

```tsx
import { useBoxSizeObserver } from '@mmjg/ui-components'

function Demo() {
  const [ref, boxSize] = useBoxSizeObserver()
  return (
    <div ref={ref} style={{ width: '50%', resize: 'both', overflow: 'auto' }}>
      内容区尺寸：{boxSize.width.toFixed(0)} × {boxSize.height.toFixed(0)}
    </div>
  )
}
```

## 注意事项

- **ref 类型限定为 `HTMLDivElement`**：需绑定到 `div` 元素；若用于其它标签需调整泛型。
- **观测时机**：`observer.observe` 读取的是 `ref.current`，必须在 `useEffect` 执行时该 ref 已指向 DOM，因此需确保 ref 正确挂载到渲染树中的节点。
- **仅观测 `contentRect`**：返回的是内容盒尺寸，不包含 `padding` / `border`。
- effect 依赖为空，观测器只创建一次；若目标元素在生命周期内被替换，需通过重新挂载或扩展实现来重观测。

← [Hooks 总览](./README.md) · → [useMouseDragOffset](./useMouseDragOffset.md)
