# useScrollPercent · 滚动百分比 hook

## 简介

计算指定滚动容器的滚动百分比，并提供按百分比平滑滚动到目标位置的方法。

- 容器参数支持「直接传元素」或「传返回元素的函数」两种形式，由 `resolveScrollContainer` 统一适配。
- 通过 `scroll` 事件监听实时更新百分比，`useEffect` 清理时移除监听。
- `scrollTo(percent)` 调用原生 `scrollTo({ behavior: 'smooth' })` 实现平滑滚动。

## 源码位置

[useScrollPercent.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useScrollPercent.ts)

## 类型签名

```ts
function useScrollPercent(
  scrollContainer: HTMLElement | (() => HTMLElement)
): {
  scrollPercent: number
  scrollTo: (percent: number) => void
}
```

## 实现原理

1. **`resolveScrollContainer`**：辅助函数判断 `scrollContainer`，若为函数则调用取值，否则直接返回，兼容两种传参形式。
2. **状态**：`const [scrollPercent, setScrollPercent] = useState(0)`，初始为 `0`。
3. **`getScrollPercent`**：
   - 解析容器，若不存在返回 `0`；
   - 取 `scrollTop` / `scrollHeight` / `clientHeight`；
   - 若 `scrollHeight <= clientHeight`（无滚动条）返回 `0`；
   - 否则返回 `Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)`。
4. **`scrollTo(percent)`**：解析容器后计算 `scrollTop = Math.round((scrollHeight * percent) / 100)`，调用 `container.scrollTo({ top, behavior: 'smooth' })`。
5. **`scroll` 监听**：`useEffect(() => { ... }, [])` 解析容器，若存在则注册 `scroll` 事件，回调中调用 `getScrollPercent` 并 `setScrollPercent`；清理函数移除监听。

> 注意：effect 依赖为空，容器只在挂载时解析一次。若运行期间容器实例发生变化，需通过重新挂载组件来重建监听。

## 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `scrollContainer` | 滚动容器元素，或返回该元素的函数。 | `HTMLElement \| (() => HTMLElement)` | 必填 |

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scrollPercent` | `number` | 当前滚动百分比（`0`–`100`），无滚动条时为 `0`。 |
| `scrollTo` | `(percent: number) => void` | 平滑滚动到指定百分比位置。 |

## 使用示例

```tsx
import { useRef } from 'react'
import { useScrollPercent } from '@mmjg/ui-components'

function Demo() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollPercent, scrollTo } = useScrollPercent(() => ref.current!)

  return (
    <>
      <div>已滚动 {scrollPercent}%</div>
      <button onClick={() => scrollTo(100)}>滚到底部</button>
      <div ref={ref} style={{ height: 200, overflow: 'auto' }}>
        <div style={{ height: 1000 }}>长内容…</div>
      </div>
    </>
  )
}
```

## 注意事项

- **容器解析时机**：effect 依赖为空，容器在挂载时只解析一次；若容器实例后续变更，需要让组件重新挂载才能重建监听。
- **无滚动条时返回 0**：当 `scrollHeight <= clientHeight` 时，百分比固定为 `0`，不会出现负值或除零。
- **`scrollTo` 使用 smooth**：依赖浏览器原生平滑滚动支持。
- 容器为函数形式时，会在每次 `getScrollPercent` / `scrollTo` / effect 内重新调用求值，便于配合 ref 延迟取值。

← [Hooks 总览](./README.md) · → [useMockProgress](./useMockProgress.md)
