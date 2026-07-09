# VerticalViewportMonitor

VerticalViewportMonitor（纵向视口监控器）是 `@mmjg/ui-components` 提供的一个框架无关的纯 TypeScript 类，用于追踪一组 HTML 元素在**垂直方向**上相对某个根容器视口的可见性，并在元素进入或离开视口时触发回调。它仅关注垂直方向，不对水平方向做判断。

## 简介

- 基于 `class` 实现，不依赖 React，可在任意浏览器环境复用。
- 使用 lodash-es 的 `throttle` 对 `scroll` / `resize` 事件做节流，默认节流间隔 `100ms`。
- 通过 `getBoundingClientRect` 计算元素相对根容器的纵向位置，判断是否进入视口。
- 内部用 `Map<HTMLElement, boolean>` 记录每个元素的上一次可见状态，仅在状态变化时触发 `onEnter` / `onLeave`，避免重复回调。
- 支持 `addElement` / `removeElement` 动态增删监控元素，`destroy` 统一清理监听与引用。
- 同时提供具名导出与默认导出。

## 源码位置

[VerticalViewportMonitor.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/modules/VerticalViewportMonitor.ts)

## 类型定义

```ts
import { throttle } from 'lodash-es';

export type ViewportCallback = (element: HTMLElement, direction?: 'up' | 'down') => void;

export interface VerticalViewportMonitorOptions {
    root?: HTMLElement;
    onEnter?: ViewportCallback;
    onLeave?: ViewportCallback;
    throttleDelay?: number;
}

export class VerticalViewportMonitor {
    constructor(elements: HTMLElement | HTMLElement[], options?: VerticalViewportMonitorOptions)
    addElement(element: HTMLElement): void
    removeElement(element: HTMLElement): void
    getVisibleElements(): HTMLElement[]
    destroy(): void
}

export default VerticalViewportMonitor
```

## 实现原理

### 构造与初始化

构造函数接收一个元素或元素数组，以及可选的配置项 `options`（默认为空对象）。初始化步骤：

1. **归一化元素**：若传入单个 `HTMLElement`，则包装为单元素数组；否则直接使用传入数组。
2. **合并默认配置**：将 `options` 与默认值合并，得到 `Required<VerticalViewportMonitorOptions>`：
   - `root` 默认为 `document.body`；
   - `onEnter` / `onLeave` 默认为空函数 `() => {}`；
   - `throttleDelay` 默认为 `100`。
3. **初始化可见状态映射**：建立 `visibleStatus: Map<HTMLElement, boolean>`，将每个元素初始状态置为 `false`。
4. **绑定节流处理函数**：用 `throttle(() => this.checkVisibility(), throttleDelay)` 创建 `handleScroll`，使高频滚动/缩放事件被节流。
5. **初始检查**：立即调用一次 `checkVisibility()`，对初始就处于视口内的元素触发 `onEnter`。
6. **绑定事件监听**：在 `root` 上监听 `scroll` 与 `resize` 事件，回调均为节流后的 `handleScroll`。

### 可见性判断（checkVisibility）

私有方法 `checkVisibility()` 遍历 `elements`，对每个元素：

1. 调用 `element.getBoundingClientRect()` 得到元素矩形 `rect`，调用 `root.getBoundingClientRect()` 得到根容器矩形 `rootRect`，并读取 `root.clientHeight` 作为 `viewportHeight`。
2. 计算元素相对根容器顶部的偏移：`top = rect.top - rootRect.top`。
3. 判断当前是否可见：
   ```
   isVisibleNow = top <= viewportHeight && rect.bottom >= rootRect.top
   ```
   即元素顶部不超过视口底部，且元素底部不小于视口顶部（存在垂直方向的重叠区域）。
4. 读取上一次状态 `isVisible`，仅在状态翻转时触发回调：
   - 由不可见 → 可见：调用 `onEnter(element)`，并将状态置为 `true`。
   - 由可见 → 不可见：计算滚动方向 `direction = top > viewportHeight ? 'up' : 'down'`，调用 `onLeave(element, direction)`，并将状态置为 `false`。

### 方向推断

当元素离开视口时，若元素顶部位于视口底部之下（`top > viewportHeight`），视为「向下离开」（`direction = 'down'`），否则视为「向上离开」（`direction = 'up'`）。

### 增删元素

- `addElement(element)`：仅在 `visibleStatus` 中不存在该元素时才添加——`push` 到 `elements` 并在 `visibleStatus` 中置为 `false`，随后立即 `checkVisibility()` 检查一次，保证新加入元素若已在视口内会立即触发 `onEnter`。
- `removeElement(element)`：通过 `indexOf` 找到元素后 `splice` 移除，并在 `visibleStatus` 中 `delete` 对应条目。

### 查询可见元素

`getVisibleElements()` 遍历 `visibleStatus` 的 entries，过滤出值为 `true` 的条目并映射回元素数组返回。

### 销毁

`destroy()` 从 `root` 上移除 `scroll` 与 `resize` 监听，并将 `elements` 置为空数组、`visibleStatus` 清空，释放引用。

## API 参考

| 方法 / 属性 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `constructor(elements, options?)` | 创建监控器，归一化元素、合并默认配置、绑定节流监听并执行初始检查 | `elements: HTMLElement \| HTMLElement[]`；`options?: VerticalViewportMonitorOptions` | `VerticalViewportMonitor` 实例 |
| `addElement(element)` | 向监控列表添加新元素（已存在则忽略），并立即检查一次可见性 | `element: HTMLElement` | `void` |
| `removeElement(element)` | 从监控列表移除元素并清理其状态记录 | `element: HTMLElement` | `void` |
| `getVisibleElements()` | 返回当前处于可见状态的所有元素 | 无 | `HTMLElement[]` |
| `destroy()` | 移除事件监听、清空元素列表与状态映射 | 无 | `void` |

### 配置项 VerticalViewportMonitorOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `root` | `HTMLElement` | `document.body` | 作为视口参照的根容器，监听其 `scroll` / `resize` |
| `onEnter` | `ViewportCallback` | `() => {}` | 元素由不可见变为可见时触发，参数为 `element` |
| `onLeave` | `ViewportCallback` | `() => {}` | 元素由可见变为不可见时触发，参数为 `element, direction` |
| `throttleDelay` | `number` | `100` | 滚动/缩放回调的节流间隔（毫秒） |

## 使用示例

```ts
import { VerticalViewportMonitor } from '@mmjg/ui-components'

const scroller = document.getElementById('scroller')!
const items = Array.from(document.querySelectorAll<HTMLElement>('.item'))

const monitor = new VerticalViewportMonitor(items, {
  root: scroller,
  throttleDelay: 80,
  onEnter: (el) => {
    el.classList.add('in-view')
    console.log('进入视口', el)
  },
  onLeave: (el, direction) => {
    el.classList.remove('in-view')
    console.log('离开视口，方向：', direction, el)
  },
})

// 动态追加元素
const newItem = document.createElement('div')
newItem.className = 'item'
scroller.appendChild(newItem)
monitor.addElement(newItem)

// 查询当前可见元素
console.log('当前可见：', monitor.getVisibleElements())

// 卸载时清理
// monitor.destroy()
```

## 注意事项

- **仅判断垂直方向**：可见性判断只考虑纵向重叠（`top <= viewportHeight && rect.bottom >= rootRect.top`），不关心水平方向是否重叠，适合纵向滚动列表场景。
- **root 需为滚动容器**：`root`（默认 `document.body`）应为实际发生滚动的容器；若滚动发生在其他元素上而 `root` 仍为 `document.body`，则监听不到滚动事件，回调不会触发。
- **节流不可取消**：`handleScroll` 由 lodash `throttle` 创建，`destroy()` 仅通过 `removeEventListener` 解绑，未调用 throttle 的 `cancel`；解绑后引用被释放即可，但若在销毁前手动持有 `handleScroll` 引用需自行注意。
- **初始检查会立即触发 onEnter**：构造函数会立即调用一次 `checkVisibility()`，初始就可见的元素会在构造阶段就触发 `onEnter`。
- **addElement 去重**：`addElement` 以 `visibleStatus.has(element)` 判断是否已存在，重复添加同一元素会被忽略。
- **direction 语义**：`direction` 仅在 `onLeave` 时提供，`onEnter` 不传该参数；其取值为 `'up'` 或 `'down'`。
- **必须调用 destroy**：长时间存活的页面或单页应用中，不再使用监控器时应调用 `destroy()` 移除监听，避免内存泄漏与无效回调。

---

← [UniqueRequest](./UniqueRequest.md) · → [模块总览](./README.md)
