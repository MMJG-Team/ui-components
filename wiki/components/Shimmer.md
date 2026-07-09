# Shimmer · 流光动效组件

## 简介

`Shimmer` 是一个文本/容器流光（shimmer）动效组件，通过 CSS 自定义属性驱动，适用于骨架屏高光、标题流光等场景。其核心特征如下：

- **两种模式**：`type="text"` 为文本流光（基于 `background-clip: text`），`type="container"` 为容器流光（倾斜光带扫过）。
- **CSS 变量驱动**：`width`、`color`、`duration` 通过 `useEffect` 写入 `--shimmer-width`、`--shimmer-color`、`--shimmer-duration`，避免内联样式重渲染。
- **容器宽度自适应**：`--container-width` 取自 `container.clientWidth`，在 `children` 变化时重新写入。
- **条件渲染**：仅当 `children` 存在时渲染。

## 源码位置

- [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Shimmer/index.tsx)
- [style.module.less](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Shimmer/style.module.less)

## 实现原理

### CSS 变量写入

组件持有 `containerRef`，在多个 `useEffect` 中分别监听 `width`、`color`、`duration`，通过 `ref.style.setProperty` 写入对应 CSS 变量：

```tsx
useEffect(() => {
    containerRef.current?.style.setProperty("--shimmer-width", `${width}px`);
}, [width]);
useEffect(() => {
    containerRef.current?.style.setProperty("--shimmer-color", color);
}, [color]);
useEffect(() => {
    containerRef.current?.style.setProperty("--shimmer-duration", `${duration}s`);
}, [duration]);
```

此外 `--container-width` 在 `children` 变化时取 `container.clientWidth` 写入，供容器流光计算光带位移使用。这种「props → CSS 变量 → 关键帧」的链路让动画完全由 CSS 接管，JS 只负责初始写入。

### 文本流光（type="text"）

文本流光依赖 `background-clip: text`，将渐变背景裁剪到文字形状。需要注意：使用 `background-clip: text` 时文字本身的 `color` 会失效，需改用 `backgroundColor` 承载渐变。流光颜色由 `--shimmer-color` 提供，扫过周期由 `--shimmer-duration` 控制。

### 容器流光（type="container"）

容器流光在元素上叠加一条宽度为 `--shimmer-width` 的倾斜光带，配合 `--container-width` 做位移动画，形成扫光效果。`width` 仅在该模式下生效。

### 类名合成

```tsx
className={classNames(styles.shimmer, styles[`shimmer-${type}`], className)}
```

通过 `shimmer-text` / `shimmer-container` 切换两种模式的样式规则。

## API 参考

### ShimmerProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `className` | 容器类名 | `string` | — |
| `style` | 容器内联样式 | `React.CSSProperties` | — |
| `children` | 子内容（必填，为空时不渲染） | `React.ReactNode` | — |
| `type` | 流光类型 | `"text" \| "container"` | `"text"` |
| `width` | 流光宽度（仅 `container` 生效） | `number` | `10` |
| `color` | 流光颜色 | `string` | `"#ffffffff"` |
| `duration` | 动画周期（秒） | `number` | `2` |

### 关联的 CSS 变量

| 变量 | 来源 | 用途 |
| --- | --- | --- |
| `--shimmer-width` | `width` | 容器流光的光带宽度 |
| `--shimmer-color` | `color` | 流光颜色 |
| `--shimmer-duration` | `duration` | 动画周期 |
| `--container-width` | `container.clientWidth` | 容器流光位移参考宽度 |

## 使用示例

### 文本流光

```tsx
import { Shimmer } from "@mmjg/ui-components";

export default function Demo() {
    return (
        <Shimmer type="text" color="#ffffff" duration={2}>
            <h1>欢迎使用 @mmjg/ui-components</h1>
        </Shimmer>
    );
}
```

### 容器流光

```tsx
<Shimmer type="container" width={20} color="#ffffffff" duration={1.5}>
    <div className="card" style={{ width: 320, height: 180 }} />
</Shimmer>
```

## 注意事项

- **`type="text"` 时文字 `color` 失效**：因使用 `background-clip: text`，文字颜色由 `backgroundColor` 渐变承载，自定义样式时勿依赖 `color` 属性。
- **`width` 仅对 `container` 生效**：`type="text"` 模式下 `width` 不影响渲染。
- **`--container-width` 依赖挂载后测量**：该变量在 `children` 变化的 `useEffect` 中取 `clientWidth`，若容器初始宽度为 0（如父级未布局完成），首帧位移可能不准，需在布局稳定后使用。
- **空 `children` 不渲染**：组件在 `children` 为假值时直接返回 `false`，不会输出 DOM 节点。
- **颜色默认带 alpha**：默认 `#ffffffff` 为不透明白色，需要半透明效果请显式传入带 alpha 通道的颜色值。

---

← [组件总览](./README.md) · → [BorderEffect](./BorderEffect.md)
