# useMockProgress · 模拟进度 hook

## 简介

模拟进度条递增过程，适用于异步任务完成前展示「假进度」的场景。

- 通过递归 `setTimeout` 逐步累加进度，到达停止条件后自动停住。
- `step` / `stopCondition` / `updateInterval` 均支持传入数值或返回数值的函数。
- 提供 `start` / `complete` / `stop` 三个控制方法，`complete` 会立即将进度置为 `100`。

## 源码位置

[useMockProgress.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useMockProgress.ts)

## 类型签名

```ts
export type IUseMockProgressOptions = {
  step?: number | (() => number)
  stopCondition?: number | (() => number)
  updateInterval?: number | (() => number)
}

function useMockProgress(options?: IUseMockProgressOptions): {
  progress: number
  start: () => void
  complete: () => void
  stop: () => void
}
```

## 实现原理

1. **`adaptValue` 工具函数**：判断入参为函数则调用取值，否则直接返回，使三个选项均可接受「数值」或「返回数值的函数」。
2. **解构默认值**：`const { step = 10, stopCondition = 90, updateInterval = 100 } = options`，分别默认 `10` / `90` / `100`。
3. **定时器 ref**：`const timer = useRef<NodeJS.Timeout>(null)`，初始为 `null`，用于持有当前 `setTimeout` 句柄。
4. **状态**：`const [progress, setProgress] = useState(0)`。
5. **`start()`**：先 `setProgress(0)`，再定义递归函数 `add(current)`：
   - `setProgress(current)`；
   - 若 `current >= adaptValue(stopCondition)` 则返回（停止递增）；
   - 否则 `timer.current = setTimeout(() => add(current + adaptValue(step)), adaptValue(updateInterval))`。
   - 最后调用 `add(0)` 启动。
6. **`complete()`**：先调用 `stop()` 清理定时器，再 `setProgress(100)`。
7. **`stop()`**：若 `timer.current` 存在则 `clearTimeout(timer.current)`。

## 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 可选配置对象。 | `IUseMockProgressOptions` | `{}` |
| `options.step` | 每次递增的步长。 | `number \| (() => number)` | `10` |
| `options.stopCondition` | 停止递增的阈值（达到即停）。 | `number \| (() => number)` | `90` |
| `options.updateInterval` | 两次递增之间的间隔（毫秒）。 | `number \| (() => number)` | `100` |

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `progress` | `number` | 当前进度（`0`–`100`）。 |
| `start` | `() => void` | 从 `0` 开始模拟递增。 |
| `complete` | `() => void` | 停止递增并将进度置为 `100`。 |
| `stop` | `() => void` | 仅停止递增，不改变当前进度。 |

## 使用示例

```tsx
import { useEffect } from 'react'
import { useMockProgress } from '@mmjg/ui-components'

function Demo({ done }: { done: boolean }) {
  const { progress, start, complete } = useMockProgress({
    step: 5,
    stopCondition: 90,
    updateInterval: 200,
  })

  useEffect(() => {
    start()
    return () => complete()
  }, [])

  useEffect(() => {
    if (done) complete()
  }, [done])

  return <progress value={progress} max={100} />
}
```

## 注意事项

- **定时器不会在卸载时自动清理**：本 hook 未在 `useEffect` 中注册清理，调用方应在卸载或任务结束时显式调用 `stop()` / `complete()`，否则 `setTimeout` 链可能继续执行并触发已卸载组件的状态更新。
- **`step` / `stopCondition` / `updateInterval` 仅在 `start` 时读取**：由于 `start` 闭包捕获的是当前渲染的值，若希望运行中动态调整参数，需重新调用 `start`。
- **`timer` 类型为 `NodeJS.Timeout`**：在浏览器环境下实际为 `number`，类型上以 Node 环境标注，使用时注意类型兼容。
- 多次连续调用 `start` 会叠加 `setTimeout` 链，建议先 `stop` 再 `start`。

← [Hooks 总览](./README.md) · → [useAutoLoadMore](./useAutoLoadMore.md)
