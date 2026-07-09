# useMouseDragOffset · 鼠标拖拽偏移 hook

## 简介

捕获鼠标拖拽过程中的偏移量与拖拽状态，并返回可直接绑定到目标元素的事件处理器。

- 通过 `document` 级别的 `mousemove` / `mouseup` 监听实现拖拽跟随，松手即自动解绑。
- 三个内部处理器（`onMouseDown` / `onMouseMove` / `onMouseUp`）均由 [useEvent](./useEvent.md) 包裹，引用稳定。
- 拖拽期间将 `document.body` 的 `cursor` 设为 `move`，松手后恢复 `default`。
- 通过 `onDrag` / `onDragEnd` 选项回调向调用方汇报偏移量与结束时机。

## 源码位置

[useMouseDragOffset.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useMouseDragOffset.ts)

## 类型签名

```ts
function useMouseDragOffset(options?: {
  onDrag?: (offset: { xOffset: number; yOffset: number }) => void
  onDragEnd?: () => void
}): {
  xOffset: number
  yOffset: number
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
}
```

## 实现原理

1. **缓存 ref**：`const cache = useRef({ mousePosition: { x: 0, y: 0 } })`，用于记录上一次鼠标位置，避免将其放入 state 触发额外渲染。
2. **状态**：`offset`（`{ xOffset, yOffset }`）记录相对起点的累计偏移；`isDragging` 标记是否处于拖拽中。
3. **`onMouseDown`**（由 [useEvent](./useEvent.md) 包裹，参数为 `React.MouseEvent`）：
   - 从事件取出 `pageX` / `pageY` 写入 `cache.current.mousePosition` 作为起点；
   - 将 `document.body.style.cursor` 置为 `'move'`；
   - 向 `document` 注册 `mousemove`（`onMouseMove`）与 `mouseup`（`onMouseUp`）。
4. **`onMouseMove`**（由 [useEvent](./useEvent.md) 包裹，参数为原生 `MouseEvent`）：
   - 计算 `newOffset = { xOffset: pageX - x, yOffset: pageY - y }`；
   - `setOffset(newOffset)` 并调用 `options?.onDrag?.(newOffset)`；
   - 若 `!isDragging` 则 `setIsDragging(true)`；
   - 将 `cache.current.mousePosition` 更新为当前 `pageX` / `pageY`。
5. **`onMouseUp`**（由 [useEvent](./useEvent.md) 包裹）：
   - `e.stopPropagation()`；
   - `setOffset({ xOffset: 0, yOffset: 0 })` 重置偏移；
   - 将 `document.body.style.cursor` 恢复为 `'default'`；
   - `setIsDragging(false)` 并调用 `options?.onDragEnd?.()`；
   - 从 `document` 移除 `mousemove` / `mouseup` 监听。

> 说明：`onMouseDown` 中引用了在其之后声明的 `onMouseMove` / `onMouseUp`。由于三者均由 `useEvent` 返回稳定引用，而 `onMouseDown` 仅在用户实际点击时才被调用（此时三者已全部初始化），因此可以正常工作。

## 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 可选配置对象。 | `{ onDrag?: (offset) => void; onDragEnd?: () => void }` | `undefined` |
| `options.onDrag` | 拖拽过程中持续触发的回调，入参为最新偏移量。 | `(offset: { xOffset: number; yOffset: number }) => void` | `undefined` |
| `options.onDragEnd` | 拖拽结束（松手）时触发。 | `() => void` | `undefined` |

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `xOffset` | `number` | 相对起点的水平偏移；松手后归零。 |
| `yOffset` | `number` | 相对起点的垂直偏移；松手后归零。 |
| `isDragging` | `boolean` | 是否正在拖拽。 |
| `onMouseDown` | `(e: React.MouseEvent) => void` | 绑定到目标元素的鼠标按下处理器。 |

## 使用示例

```tsx
import { useMouseDragOffset } from '@mmjg/ui-components'

function Demo() {
  const { xOffset, yOffset, isDragging, onMouseDown } = useMouseDragOffset({
    onDrag: (offset) => console.log('drag', offset),
    onDragEnd: () => console.log('end'),
  })

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        transform: `translate(${xOffset}px, ${yOffset}px)`,
        cursor: isDragging ? 'move' : 'grab',
      }}
    >
      拖拽我
    </div>
  )
}
```

## 注意事项

- **偏移在松手后归零**：`onMouseUp` 会将 `xOffset` / `yOffset` 重置为 `0`，若需保留最终偏移请在 `onDragEnd` 中自行保存。
- **全局监听**：拖拽期间监听挂在 `document` 上，松手即移除；不会在无拖拽时占用监听。
- **body 光标副作用**：会直接修改 `document.body.style.cursor`，多实例同时拖拽可能相互覆盖。
- **触控事件**：本 hook 仅处理鼠标事件（`mousedown` / `mousemove` / `mouseup`），不支持触摸 / 触控笔。

← [Hooks 总览](./README.md) · → [useScrollPercent](./useScrollPercent.md)
