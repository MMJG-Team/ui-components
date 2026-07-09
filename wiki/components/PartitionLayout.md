# PartitionLayout · 可拖拽分栏布局组件

## 简介

`PartitionLayout` 是一个可拖拽的分栏布局组件，提供主内容区与侧栏（subContent）的双栏结构，支持拖拽分割线调整侧栏宽度，并在窄屏下自动堆叠。其核心特征如下：

- **双栏 + 拖拽**：主内容与 `subContent` 并排，中间分割线可水平拖拽调整侧栏宽度。
- **百分比与像素双模**：侧栏宽度支持 `%` 与 `px`，拖拽时自动换算并按最小宽度约束夹取（clamp）。
- **响应式堆叠**：容器宽度小于 `breakPoint` 时切换为 `stack` 模式，隐藏分割线、侧栏浮动。
- **尺寸观测**：通过 `useBoxSizeObserver` 实时获取容器尺寸。
- **样式 memo 化**：布局、子内容、侧栏样式均通过 `useMemo` 计算，避免多余重渲染。

## 源码位置

- [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/PartitionLayout/index.tsx)
- [style.module.less](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/PartitionLayout/style.module.less)

## 实现原理

### 默认常量

文件顶部定义了一组默认常量，作为 props 缺省值：

```ts
const DEFAULT_WIDTH = "100%";
const DEFAULT_HEIGHT = "100%";
const DEFAULT_SUB_CONTENT_DEFAULT_WIDTH = "30%";
const DEFAULT_GAP = 0;
const DEFAULT_CHILDREN_MIN_WIDTH = 0;
const DEFAULT_SUB_CONTENT_MIN_WIDTH = 0;
const DEFAULT_BREAK_POINT = 0;
```

### 尺寸观测（useBoxSizeObserver）

`useBoxSizeObserver` 返回 `[containerRef, containerSize]`，其中 `containerSize = { width, height }` 实时反映容器尺寸。组件据此判断布局模式与拖拽换算。

### 布局模式

```ts
const layoutMode = containerSize.width < breakPoint ? "stack" : "normal";
```

- `normal`：双栏并排，渲染分割线。
- `stack`：堆叠模式，不渲染分割线，侧栏浮动。

容器类名按模式切换：`partition-layout-${layoutMode}`。

### 拖拽与宽度计算（useMouseDragOffset）

`useMouseDragOffset` 的 `onDrag(offset)` 回调中，根据当前 `subContentWidth` 是百分比还是像素分别处理：

- **百分比模式**：先将 `%` 换算为像素 `currentPx = parseFloat(current)/100 * containerSize.width`，计算 `nextPx = currentPx - offset.xOffset`（拖拽向左则侧栏变宽），再夹取到 `[subContentMinWidth, containerSize.width - childrenMinWidth]`，最后换回百分比。
- **像素模式**：直接 `nextPx = parseFloat(current) - offset.xOffset`，同样夹取。

夹取逻辑保证侧栏不小于 `subContentMinWidth`，且主内容区不小于 `childrenMinWidth`。

### 渲染结构

```tsx
<div className="partition-layout partition-layout-{layoutMode}" style={layoutStyle}>
    <div className="partition-layout-content" style={childrenStyle}>{children}</div>
    {layoutMode === "normal" && subContent && (
        <div className="partition-layout-drag-line" onMouseDown={onMouseDown} />
    )}
    <div className="partition-layout-sub-content" style={subContentStyle}>{subContent}</div>
</div>
```

`subContent` 为空时，侧栏样式置 `width: 0; opacity: 0` 并附加 `hidden` 类；`gap` 仅在存在 `subContent` 时生效。拖拽中（`isDragging`）时分割线与侧栏附加 `dragging` 类，便于定制拖拽态样式。

### 样式 memo

`layoutStyle`、`childrenStyle`、`subContentStyle` 均通过 `useMemo` 依据相关依赖计算，避免每次渲染都生成新对象。

## API 参考

### PartitionLayoutProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `className` | 容器类名 | `string` | — |
| `style` | 容器内联样式 | `React.CSSProperties` | — |
| `children` | 主内容 | `React.ReactNode` | — |
| `width` | 容器宽度 | `CSSProperties["width"]` | `"100%"` |
| `height` | 容器高度 | `CSSProperties["height"]` | `"100%"` |
| `gap` | 主内容与侧栏间距 | `CSSProperties["gap"]` | `0` |
| `subContent` | 侧栏内容 | `React.ReactNode` | — |
| `subContentDefaultWidth` | 侧栏初始宽度（`%` 或 `px`） | `CSSProperties["width"]` | `"30%"` |
| `limit` | 最小宽度约束 | `{ childrenMinWidth?: number; subContentMinWidth?: number }` | `{ 0, 0 }` |
| `draglineClassName` | 分割线类名 | `string` | — |
| `breakPoint` | 响应式断点（容器宽度低于此值则堆叠） | `number` | `0` |

## 使用示例

### 基础双栏

```tsx
import { PartitionLayout } from "@mmjg/ui-components";

export default function Demo() {
    return (
        <PartitionLayout
            subContentDefaultWidth="30%"
            gap={4}
            limit={{ childrenMinWidth: 320, subContentMinWidth: 200 }}
            subContent={<DetailPanel />}
        >
            <ListView />
        </PartitionLayout>
    );
}
```

### 响应式堆叠

```tsx
<PartitionLayout
    breakPoint={768}
    subContentDefaultWidth="320px"
    subContent={<Sidebar />}
>
    <Article />
</PartitionLayout>
```

## 注意事项

- **`breakPoint` 默认 `0`**：默认不启用响应式堆叠，始终为 `normal` 双栏；需响应式请显式设置断点。
- **拖拽方向**：向左拖拽增大侧栏宽度（`nextPx = currentPx - offset.xOffset`），与直觉一致。
- **单位混用**：`subContentDefaultWidth` 决定初始单位，拖拽过程中保持该单位（百分比内部会做像素换算后再转回百分比），不会跨单位切换。
- **`limit` 默认均为 `0`**：不设置 `limit` 时侧栏可被拖到 0 或占满容器，建议根据业务设置最小宽度。
- **`gap` 仅在有侧栏时生效**：`subContent` 为空时 `gap` 被强制为 `0`。
- **`subContent` 为空时侧栏不卸载**：侧栏节点仍渲染，但宽高置 0 且 `opacity: 0`，并附加 `hidden` 类，而非条件移除。

---

← [组件总览](./README.md) · → [Cube](./Cube.md)
