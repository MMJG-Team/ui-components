# BorderEffect · 旋转渐变描边组件

## 简介

`BorderEffect` 是一个旋转渐变描边效果组件，通过 `conic-gradient` 渐变背景配合 CSS `mask-composite: exclude` 遮罩，仅在元素边缘（padding 区域）显示旋转的渐变光带，形成流光描边。其核心特征如下：

- **渐变描边**：基于圆锥渐变（`conic-gradient`）生成可旋转的彩色边框。
- **遮罩裁剪**：通过 `mask-composite: exclude` 仅保留 padding 区域，使内部内容不被渐变覆盖。
- **CSS 变量驱动**：`width`、`color`、`duration` 写入 `--border-width`、`--border-color`、`--border-effect-duration`。
- **默认渐变合成**：未传 `effects` 时，根据 `color` 自动合成 `color 0%..10%` + `transparent 10%..100%` 的渐变。
- **条件渲染**：仅当 `children` 存在时渲染。

## 源码位置

- [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/BorderEffect/index.tsx)
- [style.module.less](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/BorderEffect/style.module.less)

## 实现原理

### DOM 结构

组件由三层嵌套构成：

1. 外层 `border-effect`（容器，承载 CSS 变量与 `borderRadius`）；
2. 中层 `border-effect-core` > `border-effect-core-inner`（承载 `conic-gradient` 背景并旋转）；
3. 内容层 `border-effect-content`（承载 `children`，覆盖在描边之上）。

### 渐变合成（effectStyle）

`effectStyle` 通过 `useMemo` 依据 `color` 与 `effects` 计算：

- 若 `effects` 为空且 `color` 已设置，自动合成四段渐变停靠点：
  - `color 0%`、`color 10%`（前 10% 为彩色）
  - `transparent 10%`、`transparent 100%`（其余为透明）
- 若 `effects` 非空，直接使用使用者提供的 `{ percent, color }[]`。

最终生成 `backgroundImage`：

```css
conic-gradient(from 0deg, color0 p0%, color1 p1%, ...)
```

### 遮罩裁剪

`.module.less` 中通过 `mask` / `-webkit-mask` 配合 `mask-composite: exclude`（或 `composite`）将内部内容区域排除，仅保留 `padding`（即描边宽度 `--border-width`）区域可见，实现「只有边框显示渐变」的效果。`--border-width` 决定描边粗细，`--border-color` 为回退色，`--border-effect-duration` 决定内层旋转周期。

### CSS 变量写入

```tsx
useEffect(() => {
    containerRef.current?.style.setProperty("--border-width", `${width}px`);
}, [width]);
useEffect(() => {
    containerRef.current?.style.setProperty("--border-color", color);
}, [color]);
useEffect(() => {
    containerRef.current?.style.setProperty("--border-effect-duration", `${duration}s`);
}, [duration]);
```

### 旋转动画

内层 `border-effect-core-inner` 通过 `@keyframes` 执行 `rotate(0deg) → rotate(360deg)` 的 360° 旋转，周期由 `--border-effect-duration` 控制，使圆锥渐变沿中心轴持续转动，形成流光描边视觉效果。

## API 参考

### BorderEffectProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `className` | 容器类名 | `string` | — |
| `style` | 内容层内联样式 | `React.CSSProperties` | — |
| `children` | 子内容（为空时不渲染） | `React.ReactNode` | — |
| `width` | 描边宽度（px） | `number` | `2` |
| `color` | 描边颜色 | `string` | `"#ffffffff"` |
| `duration` | 旋转周期（秒） | `number` | `2` |
| `borderRadius` | 圆角 | `CSSProperties["borderRadius"]` | `2` |
| `effects` | 自定义渐变停靠点 | `{ percent: number; color: string }[]` | `[]` |

### 关联的 CSS 变量

| 变量 | 来源 | 用途 |
| --- | --- | --- |
| `--border-width` | `width` | 描边粗细（padding 区域宽度） |
| `--border-color` | `color` | 描边回退色 |
| `--border-effect-duration` | `duration` | 内层旋转动画周期 |

## 使用示例

### 基础用法

```tsx
import { BorderEffect } from "@mmjg/ui-components";

export default function Demo() {
    return (
        <BorderEffect width={2} color="#3b82f6" duration={2} borderRadius={8}>
            <div style={{ padding: 16 }}>带流光描边的内容</div>
        </BorderEffect>
    );
}
```

### 自定义多段渐变

```tsx
<BorderEffect
    width={3}
    duration={3}
    effects={[
        { percent: 0, color: "#ff0000" },
        { percent: 25, color: "#00ff00" },
        { percent: 50, color: "#0000ff" },
        { percent: 100, color: "transparent" },
    ]}
>
    <div className="card" />
</BorderEffect>
```

## 注意事项

- **`effects` 与 `color` 的关系**：`effects` 为空时才会用 `color` 合成默认渐变；一旦传入 `effects`，`color` 仅作为 CSS 变量回退色，不再参与渐变合成。
- **依赖 `mask-composite`**：浏览器需支持 `mask-composite: exclude`（或 `-webkit-mask-composite`），旧版浏览器可能无法正确裁剪出描边区域。
- **`borderRadius` 同步三层**：容器、core、内容层均应用 `borderRadius`，自定义样式时注意保持一致以避免圆角错位。
- **空 `children` 不渲染**：组件在 `children` 为假值时直接返回 `false`。
- **内层旋转占用合成层**：内层元素持续旋转会创建合成层，页面内大量并排使用时注意性能开销。

---

← [组件总览](./README.md) · → [PartitionLayout](./PartitionLayout.md)
