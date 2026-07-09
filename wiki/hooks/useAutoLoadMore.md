# useAutoLoadMore · 自动加载更多 hook

## 简介

监听滚动容器的滚动与尺寸变化，在到达底部或滚动条消失时自动触发加载更多。

- 解决「窗口被拖大导致滚动条消失、用户无法触发加载更多」的场景：当 `scrollHeight <= clientHeight` 时也会触发。
- 同时注册 `ResizeObserver`（监听容器尺寸变化）与 `scroll` 事件，二者均经 `lodash-es` 的 `debounce` 防抖。
- 防抖后的检查函数再用 [useEvent](./useEvent.md) 稳定化，保证监听器引用不变。
- `checkInterval` 支持数值或 `{ scroll, resize }` 对象，分别控制两类事件的防抖时长。

## 源码位置

[useAutoLoadMore.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useAutoLoadMore.ts)

## 类型签名

```ts
function useAutoLoadMore(
  container: HTMLElement | (() => HTMLElement),
  params: {
    hasMore: boolean
    checkInterval?: number | { scroll?: number; resize?: number }
    onLoadMore: (check: () => void) => void
  }
): { checkShouldLoadMore: () => void }
```

## 实现原理

1. **常量**：`DEFAULT_CHECK_INTERVAL = 1000`，作为 `checkInterval` 的默认值。
2. **`checkInterval` 归一化**：`useMemo` 依据 `checkInterval` 类型将其拆为 `{ scroll, resize }`：
   - 若为数值，则 `scroll` 与 `resize` 均取该值；
   - 若为对象，则直接使用其 `scroll` / `resize` 字段；
   - 二者缺省时回退到 `DEFAULT_CHECK_INTERVAL`（`1000`）。
3. **`resolveContainer`**：判断 `container` 为函数则调用取值，否则直接返回，与 [useScrollPercent](./useScrollPercent.md) 的 resolve 模式一致。
4. **`checkShouldLoadMore`**：
   - 解析容器，不存在则返回；
   - 若 `!params.hasMore` 则返回；
   - 当 `scrollHeight <= clientHeight`（无滚动条）**或** `Math.ceil(scrollTop) + Math.ceil(clientHeight) >= scrollHeight`（滚动到底）时，调用 `params.onLoadMore?.(checkShouldLoadMore)`，把检查函数自身回传给调用方，便于加载完成后再次校验。
5. **防抖 + 稳定化**：
   - `checkForResize = useEvent(debounce(checkShouldLoadMore, resizeInterval))`；
   - `checkForScroll = useEvent(debounce(checkShouldLoadMore, scrollInterval))`。
6. **副作用注册**：`useEffect(() => { ... }, [params.hasMore, params.onLoadMore])`：
   - 解析容器，不存在则返回；
   - `new ResizeObserver(() => checkForResize())` 并 `observer.observe(scrollElement)`；
   - `scrollElement.addEventListener('scroll', checkForScroll)`；
   - 清理函数执行 `observer.disconnect()` 与 `removeEventListener('scroll', checkForScroll)`。
7. **返回**：`{ checkShouldLoadMore }`，调用方可手动触发一次检查（例如数据更新后）。

## 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `container` | 滚动容器元素，或返回该元素的函数。 | `HTMLElement \| (() => HTMLElement)` | 必填 |
| `params` | 配置对象。 | 见下 | 必填 |
| `params.hasMore` | 是否还有更多数据可加载。 | `boolean` | 必填 |
| `params.checkInterval` | 防抖间隔；数值时同时用于 scroll 与 resize。 | `number \| { scroll?: number; resize?: number }` | `1000` |
| `params.onLoadMore` | 触发加载更多的回调，入参为 `check` 检查函数。 | `(check: () => void) => void` | 必填 |

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `checkShouldLoadMore` | `() => void` | 手动触发一次加载检查；通常在数据更新、容器尺寸变化后调用。 |

## 使用示例

```tsx
import { useRef, useState } from 'react'
import { useAutoLoadMore } from '@mmjg/ui-components'

function Demo() {
  const ref = useRef<HTMLDivElement>(null)
  const [list, setList] = useState<number[]>(Array.from({ length: 20 }, (_, i) => i))
  const [hasMore, setHasMore] = useState(true)

  const { checkShouldLoadMore } = useAutoLoadMore(() => ref.current!, {
    hasMore,
    checkInterval: { scroll: 200, resize: 500 },
    onLoadMore: (check) => {
      // 模拟异步请求
      setTimeout(() => {
        setList((prev) => [...prev, ...Array.from({ length: 20 }, (_, i) => prev.length + i)])
        if (list.length > 100) setHasMore(false)
        // 加载完成后再次校验是否仍需继续加载
        check()
      }, 300)
    },
  })

  return (
    <div ref={ref} style={{ height: 300, overflow: 'auto' }}>
      {list.map((i) => (
        <div key={i} style={{ height: 30 }}>item {i}</div>
      ))}
    </div>
  )
}
```

## 注意事项

- **滚动条消失也会触发**：当容器被撑大至 `scrollHeight <= clientHeight` 时，只要 `hasMore` 为真即触发 `onLoadMore`，这是本 hook 的核心设计目的。
- **effect 依赖 `hasMore` / `onLoadMore`**：二者变化时会重建 `ResizeObserver` 与 `scroll` 监听；若 `onLoadMore` 每次渲染都为新引用，会导致频繁重建，建议用 [useEvent](./useEvent.md) 或 `useCallback` 稳定化。
- **防抖时长**：`checkInterval` 默认 `1000ms`，滚动 / 尺寸变化会在防抖窗口后才真正校验，避免高频触发。
- **`onLoadMore` 入参 `check`**：加载完成后调用 `check()` 可立即复检，适用于一次加载后内容仍不足以产生滚动条的场景。
- 依赖 `lodash-es` 的 `debounce`，需确保运行环境已安装该依赖。

← [Hooks 总览](./README.md) · → [Hooks 总览](./README.md)
