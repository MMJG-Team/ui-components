# Masonry · 瀑布流布局组件

## 简介

`Masonry` 是一个泛型高性能瀑布流（Masonry Layout）组件，适用于图片墙、无限滚动列表等场景。其核心特征如下：

- **泛型约束**：通过 `Masonry<Item>` 接受任意满足 `{ id, src, naturalWidth, naturalHeight }` 约束的数据项，保留完整类型推导。
- **响应式列数**：支持 `breakPointConfig` 断点配置与 `maxColumnCount` 上限，容器宽度变化时自动重算列数。
- **虚拟滚动**：基于可视区域 `[start, end]` 做窗口化渲染，配合 `overscanHeight=3000` 上下预渲染，仅渲染视口内的项。
- **命令式 ref**：通过 `forwardRef` + `useImperativeHandle` 暴露 `MasonryRef`，支持 `getScrollElement`、`scrollToTop`、`scrollIntoView`。
- **滚动加载**：触底或无滚动条时自动触发 `onLoadMore`。
- **类实例架构**：布局算法封装在 `MasonryLayout` 类中，脱离 React 生命周期，由 hooks 投影为视图数据。

## 源码位置

- [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/index.tsx)
- [types.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/types.ts)
- [MasonryLayout.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/models/MasonryLayout.ts)
- [ImageModel.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/models/ImageModel.ts)
- [useColumnCount.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useColumnCount.ts)
- [useMasonryLayout.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useMasonryLayout.ts)
- [useResizeObserver.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useResizeObserver.ts)
- [useScrollViewArea.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useScrollViewArea.ts)
- [style.module.less](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/style.module.less)

## 实现原理

### 分层架构：类 + Hooks 投影

`Masonry` 采用「纯逻辑下沉为类、可复用行为沉淀为 hooks、可渲染单元封装为组件」的分层设计：

1. **`MasonryLayout` 类**（`models/MasonryLayout.ts`）：核心布局算法，不依赖 React。持有 `container`、`columnCount`、`gap`、`padding`、`items`、`viewRange` 等状态，对外暴露 `reLayout()`、`reCalcViewArea()`、`setOptions()`、`getColumnHeight()` 等方法。
2. **`useMasonryLayout` hook**：通过 `useRef` 持有 `MasonryLayout` 实例，将 `columnCount`、`items`、`viewRange` 等参数传入，并把实例方法投影为 React 可消费的 `viewableItemsLayout` 数据与 `reLayout` 回调。
3. **`Masonry` 组件**：组合各 hooks，渲染列容器与项。

### 列数计算（useColumnCount）

`useColumnCount` 依据容器宽度与配置计算当前列数，优先级如下：

1. 若显式传入 `columnCount`，直接采用；
2. 否则若提供 `breakPointConfig`，将断点键升序排列，找到容器宽度所属区间，取对应列数；
3. 若以上均无，回退到默认值 `DEFAULT_COLUMN_COUNT = 4`；
4. 最后与 `maxColumnCount` 取 `Math.min` 作为上限约束。

返回 `[currentColumnCount, reCalc]` 元组，`reCalc` 可在容器尺寸变化时手动触发重算。

### 列宽与项高（MasonryLayout）

`columnWidth` 为只读 getter，计算公式为：

```
columnWidth = (container.clientWidth - (columnCount - 1) * gap - padding.left - padding.right) / columnCount
```

单项高度按图片原始宽高比缩放：

```
height = item.naturalHeight / item.naturalWidth * columnWidth
```

若结果小于 `minItemHeight`，则取 `minItemHeight` 作为下限。每个项的「盒子高度」`boxHeight = height + itemPayloadHeight`，`itemPayloadHeight` 用于在图片之外附加固定高度（如标题栏）。

### 列分配与最短列策略

布局时遍历所有项，调用 `findShortestColumn(columnHeights)` 找到当前总高最小的列进行放置。为避免浮点误差导致选择抖动，引入 `EPSILON = 0.00000001` 作为近似相等阈值，平局时取索引较小的列。项落入列后，该列高度更新为 `top + boxHeight + gap`。

### 可视区域与虚拟滚动（useScrollViewArea）

`useScrollViewArea` 追踪容器可见的纵向坐标范围 `[start, end]`，配合 `overscanHeight = 3000` 做上下预渲染。`MasonryLayout.reCalcViewArea()` 遍历已布局项，将底边 `bottom = top + height` 落在 `[start, end]` 之外的项标记 `hidden = true`，仅将可见项收入 `viewableItemsLayout`。当滚动触底或容器无滚动条时，触发 `onLoadMore`。

### 尺寸监听（useResizeObserver + debounce）

`useResizeObserver` 监听容器尺寸变化，回调经 lodash `debounce(10ms)` 防抖后依次执行 `reLayout()`（全量重排）、`reCalcViewRange()`（重算可视区域）、`reCalcColumnCount()`（重算列数）。

### 命令式 ref

通过 `useImperativeHandle` 暴露 `MasonryRef`，`scrollIntoView` 内部以 `ITEM_CLASS_NAME_PREFIX = "masonry-item"` 拼接类名 `masonry-item-${id}`，调用 `containerRef.current.querySelector` 定位目标项后执行原生 `scrollIntoView`。注意 `itemRender` 回调中会将该类名通过 `className` 参数传给使用者，使用者需将其绑定到自定义渲染元素的根节点，定位才能生效。

### ImageModel 模型

`ImageModel<T>` 是一个独立的图片加载与记录管理类，便于使用者在调用 `Masonry` 前预加载图片并取得 `naturalWidth/naturalHeight`：

- `loadRecords(sourceRecords, options)`：通过 `new Image()` 异步加载，`onload` 时读取 `naturalWidth/naturalHeight`；`options.aspectRatio` 为 `[widthRatio, heightRatio]` 时直接覆盖原始尺寸；`options.reset` 为 `true` 时先清空再加载；`onerror` 时该条记录被过滤。
- `updateRecord(record)`：按 `id` 局部合并更新。
- `removeRecord(id)`、`clearRecords()`：删除与清空。

## API 参考

### MasonryProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `className` | 容器类名 | `string` | — |
| `header` | 顶部固定内容 | `React.ReactNode` | — |
| `items` | 数据项数组（必填） | `Item[]` | — |
| `breakPointConfig` | 断点列数配置，键为容器宽度阈值 | `Record<number, number>` | — |
| `columnCount` | 固定列数，优先级高于断点配置 | `number` | — |
| `maxColumnCount` | 列数上限，与计算结果取 `min` | `number` | — |
| `gap` | 列间距与项间距 | `number` | `8` |
| `padding` | 容器内边距 | `{ top?; bottom?; left?; right? }` | `{ 0, 0, 0, 0 }` |
| `itemPayloadHeight` | 每项附加的额外高度 | `number` | `0` |
| `itemRender` | 项自定义渲染函数 | `(params: { className, item, rowIndex, columnIndex, columnWidth, height }) => React.ReactNode` | — |
| `minItemHeight` | 项最小高度限制 | `number` | `0` |
| `footerClassName` | 页脚类名 | `string` | — |
| `footer` | 页脚内容 | `React.ReactNode` | — |
| `empty` | 空数据时显示的内容 | `React.ReactNode` | — |
| `loadMoreThreshold` | 加载更多触发阈值 | `number` | `0` |
| `onLoadMore` | 滚动到底部或无滚动条时的回调 | `() => void` | — |
| `onScroll` | 滚动事件回调 | `() => void` | — |

`Item` 约束：`{ id: string | number; src: string; naturalWidth: number; naturalHeight: number }`。

### MasonryRef（通过 ref 暴露）

| 方法 | 说明 | 类型 |
| --- | --- | --- |
| `getScrollElement` | 获取内部滚动元素 | `() => HTMLElement \| null` |
| `scrollToTop` | 滚动到顶部 | `(behavior?: ScrollBehavior) => void` |
| `scrollIntoView` | 滚动到指定项 | `(id: string \| number, options?: ScrollIntoViewOptions) => void` |

> 类型声明 `MasonryRef.scrollIntoView` 签名为 `(id) => void`，实际实现额外接受 `options` 并以 `{ block: "end", behavior: "smooth" }` 作为默认值。

### 导出的模型与类型

| 导出 | 说明 |
| --- | --- |
| `ImageModel<T>` | 图片加载与记录管理类 |
| `ImageRecord<T>` | 图片记录类型（含 `src`、`naturalWidth`、`naturalHeight`） |
| `SourceImageRecord<T>` | 源图片记录类型（仅含 `src`） |
| `MasonryLayout<Item>` | 瀑布流布局类（默认导出于 `models/MasonryLayout.ts`） |
| `MasonryProps<Item>`、`MasonryRef` | 组件 props 与 ref 类型 |

## 使用示例

### 基础用法

```tsx
import { Masonry, useRef } from "react";
import { Masonry } from "@mmjg/ui-components";

const items = [
    { id: 1, src: "/img/1.jpg", naturalWidth: 400, naturalHeight: 600 },
    { id: 2, src: "/img/2.jpg", naturalWidth: 800, naturalHeight: 400 },
];

export default function Demo() {
    return (
        <Masonry
            items={items}
            gap={8}
            breakPointConfig={{ 0: 2, 768: 3, 1200: 4 }}
            maxColumnCount={5}
            itemRender={({ item, className, columnWidth, height }) => (
                <img
                    className={className}
                    src={item.src}
                    style={{ width: columnWidth, height }}
                />
            )}
            onLoadMore={() => console.log("load more")}
        />
    );
}
```

### 命令式滚动控制

```tsx
import { useRef } from "react";
import { Masonry, type MasonryRef } from "@mmjg/ui-components";

export default function Demo() {
    const ref = useRef<MasonryRef>(null);

    return (
        <>
            <button onClick={() => ref.current?.scrollToTop("smooth")}>
                回到顶部
            </button>
            <button onClick={() => ref.current?.scrollIntoView(42)}>
                定位到 id=42
            </button>
            <Masonry ref={ref} items={items} itemRender={({ item, className }) => (
                <img className={className} src={item.src} />
            )} />
        </>
    );
}
```

## 注意事项

- **`scrollIntoView` 依赖类名绑定**：`itemRender` 回调中的 `className` 形如 `masonry-item-${id}`，必须绑定到自定义渲染元素的根节点，否则 `querySelector` 无法定位。
- **`loadMoreThreshold` 默认为 `0`**：源码 `index.tsx` 中默认值为 `0`（`types.ts` 注释写作 `100`，以实现为准），需要提前触发请显式设置。
- **数据项须含原始尺寸**：`items` 中的 `naturalWidth/naturalHeight` 是计算项高的依据；若未知，可先用 `ImageModel.loadRecords` 预加载获取。
- **`debounce` 依赖 lodash**：尺寸变化回调使用 `lodash-es` 的 `debounce`（10ms），请确保宿主已安装。
- **空数据渲染**：`items.length === 0` 时渲染 `empty`，列容器不挂载。
- **`viewRange` 触发重算而非重排**：`MasonryLayout.setOptions` 仅在 `columnCount`、`gap`、`items` 变化时执行 `reLayout`，`viewRange` 变化只执行 `reCalcViewArea`，避免滚动时全量重排。

---

← [组件总览](./README.md) · → [Menu3D](./Menu3D.md)
