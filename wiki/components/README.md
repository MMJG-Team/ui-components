# 组件总览

## 简介

`@mmjg/ui-components` 的 **components** 分类提供 6 个视图组件，覆盖布局、动效与可视化交互场景。所有组件均以 **具名 + 默认** 两种方式导出，基于 React 18 + TypeScript 实现，统一使用 `classNames` 库做类名合成、`*.module.less`（Less CSS Modules）管理样式。

## 组件清单

| 组件 | 一句话描述 | 适用场景 |
| --- | --- | --- |
| [Masonry](./Masonry.md) | 高性能瀑布流布局组件，支持虚拟滚动与命令式滚动控制 | 图片墙、无限滚动列表 |
| [Menu3D](./Menu3D.md) | 围绕 Y 轴旋转的 3D 环形菜单，支持鼠标拖拽与悬停暂停 | 创意导航、可视化切换 |
| [Shimmer](./Shimmer.md) | 文本/容器流光动效组件，通过 CSS 变量驱动 | 骨架屏、标题高光 |
| [BorderEffect](./BorderEffect.md) | 旋转渐变描边效果，基于 conic-gradient 与 mask 实现 | 卡片描边、强调容器 |
| [PartitionLayout](./PartitionLayout.md) | 可拖拽分栏布局，支持响应式堆叠 | 双栏编辑器、主从面板 |
| [Cube](./Cube.md) | CSS 3D 立方体，六面可自定义渲染 | 展示型 3D 动效 |

## 通用模式

纵观六个组件的源码，可归纳出贯穿全局的几条设计取向，亦与 [编码规范与代码风格](../06-编码规范与代码风格.md) 一致。

### 1. CSS 变量驱动的运行时样式

[Shimmer](./Shimmer.md)、[BorderEffect](./BorderEffect.md)、[Cube](./Cube.md) 三个动效类组件均采用同一套模式：props 不直接写成内联 style，而是通过 `useEffect` 监听后调用 `ref.current.style.setProperty("--xxx", value)` 写入 CSS 自定义属性，再由 `*.module.less` 中引用该变量驱动动画与外观。这样做的好处是：

- 避免每次 props 变化触发组件重渲染；
- 动画关键帧可直接读取变量，无需 JS 介入；
- 样式与逻辑解耦，统一交给 Less + CSS Modules 管理。

```tsx
// 典型写法
useEffect(() => {
    containerRef.current?.style.setProperty("--border-width", `${width}px`);
}, [width]);
```

### 2. forwardRef + useImperativeHandle 命令式逃生舱

组件以 props 声明式驱动为主，但对需要外部操控的场景（如滚动控制）通过 `forwardRef` + `useImperativeHandle` 暴露 ref API。典型代表是 [Masonry](./Masonry.md)，其 `MasonryRef` 暴露 `getScrollElement`、`scrollToTop`、`scrollIntoView` 三个方法。

### 3. 类实例 + Hooks 投影

[Masonry](./Masonry.md) 采用「纯逻辑下沉为类、可复用行为沉淀为 hooks、可渲染单元封装为组件」的分层架构：核心布局算法封装在 `MasonryLayout` 类中（不依赖 React），由 `useMasonryLayout` hook 持有实例并通过 `useRef` 维持引用，再投影为 React 可消费的布局数据。`useColumnCount`、`useScrollViewArea`、`useResizeObserver` 分别承担列数计算、可视区域追踪、尺寸监听职责。

### 4. classNames 合成 + Less CSS Modules

所有组件统一使用 `classNames`（项目内导入名为 `classNames`，来自 `classnames` 库）做条件类名合成，样式文件统一命名为 `style.module.less`，通过 `import styles from "./style.module.less"` 引入并以 `styles["xxx"]` 形式引用类名。

```tsx
import classNames from "classnames";
import styles from "./style.module.less";

<div className={classNames(styles["component"], className)} />
```

## 导出方式

库根入口 [src/index.ts](../../packages/ui-components/src/index.ts) 通过 `export * from "./components"` 聚合组件导出，每个组件目录的 `index.tsx` 同时提供具名导出与默认导出：

```ts
export const Masonry = forwardRef(function InternalMasonry(/* ... */) { /* ... */ });
export default Masonry;
```

使用时两种方式均可：

```tsx
import { Masonry } from "@mmjg/ui-components";
import Masonry from "@mmjg/ui-components/dist/Masonry"; // 默认导出
```

## 相关文档

- [架构设计](../02-架构设计.md)
- [技术栈与依赖](../03-技术栈与依赖.md)
- [编码规范与代码风格](../06-编码规范与代码风格.md)

---

← [首页](../Home.md) · → [Masonry](./Masonry.md)
