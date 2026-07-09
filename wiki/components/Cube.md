# Cube · CSS 3D 立方体组件

## 简介

`Cube` 是一个基于 CSS 3D Transform 的立方体组件，六个面可独立自定义渲染，支持自动旋转。其核心特征如下：

- **六面结构**：通过 `CubeFace` 枚举定义前、后、左、右、上、下六面，由 `cubeConfigs` 映射各自的旋转矩阵。
- **CSS 3D 变换**：使用 `transform-style: preserve-3d` 与 `translateZ(size/2)` 将六面拼合成立方体。
- **自动旋转**：`autoRotate` 启用时附加 `cube-core-auto-rotate` 类，执行 10s 线性无限旋转动画。
- **CSS 变量驱动**：`size`、`padding` 写入 `--cube-size`、`--cube-padding`。
- **自定义面渲染**：`customRenderFace` 按面枚举返回内容，覆盖默认随机色方块。

## 源码位置

- [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Cube/index.tsx)
- [style.module.less](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Cube/style.module.less)

## 实现原理

### CubeFace 枚举与 cubeConfigs

```ts
enum CubeFace {
    Front = "front",
    Back = "back",
    Left = "left",
    Right = "right",
    Top = "top",
    Bottom = "bottom",
}

const cubeConfigs = [
    { face: CubeFace.Front,  rotate: "rotateX(0deg)" },
    { face: CubeFace.Back,   rotate: "rotateY(180deg)" },
    { face: CubeFace.Left,   rotate: "rotateY(90deg)" },
    { face: CubeFace.Right,  rotate: "rotateY(-90deg)" },
    { face: CubeFace.Top,    rotate: "rotateX(90deg)" },
    { face: CubeFace.Bottom, rotate: "rotateX(-90deg)" },
];
```

每个面先以自身旋转矩阵定向，再统一沿 Z 轴外推 `size / 2` 像素，使六面分别落在立方体的六个表面上。

### 面的变换

```tsx
<div
    className={classNames(styles["cube-face"], styles[config.face])}
    style={{ transform: `${config.rotate} translateZ(${size / 2}px)` }}
>
    {customRenderFace?.(config.face)}
</div>
```

`styles[config.face]` 为每个面提供对应的类名（`front`/`back`/`left`/`right`/`top`/`bottom`），便于在 `.module.less` 中针对单面定制样式。

### CSS 变量写入

```tsx
useEffect(() => {
    containerRef.current?.style.setProperty("--cube-size", `${size}px`);
}, [size]);
useEffect(() => {
    containerRef.current?.style.setProperty("--cube-padding", `${padding}px`);
}, [padding]);
```

`--cube-size` 决定立方体边长，`--cube-padding` 决定外层留白（影响可视区域与透视距离）。

### 自动旋转

```tsx
<div className={classNames(
    styles["cube-core"],
    autoRotate && !rotateClassName && styles["cube-core-auto-rotate"],
    rotateClassName,
)}>
```

`autoRotate` 为 `true` 且未传入 `rotateClassName` 时，附加 `cube-core-auto-rotate` 类。`.module.less` 中该类绑定 10s 线性（`linear`）无限（`infinite`）的 `@keyframes`，关键帧为 `rotateX(-20deg) rotateY(0deg → 360deg)`，使立方体绕 Y 轴匀速旋转并带固定俯视角。若传入 `rotateClassName`，则由使用者的自定义类名接管旋转控制，内置自动旋转不启用。

### 默认面内容

未提供 `customRenderFace` 时，默认渲染一个填充随机 `rgba` 颜色的方块：

```ts
const randomColor = (opacity = 0.5) =>
    `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${opacity})`;
```

### 容器结构

```tsx
<div ref={containerRef} className={classNames(styles["cube"], rootClassName)}>
    <div className={classNames(styles["cube-core"], /* auto-rotate 类 */)}>
        {cubeConfigs.map(/* 渲染六面 */)}
    </div>
</div>
```

外层 `cube` 承载 CSS 变量与 `perspective`，内层 `cube-core` 承载 `preserve-3d` 与旋转动画，六面作为子节点拼接。

## API 参考

### CubeProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `rootClassName` | 外层容器类名 | `string` | — |
| `rotateClassName` | 自定义旋转类名（传入后禁用内置自动旋转） | `string` | — |
| `size` | 立方体边长（px） | `number` | `100` |
| `padding` | 外层留白（px） | `number` | `50` |
| `autoRotate` | 是否启用内置自动旋转 | `boolean` | `true` |
| `customRenderFace` | 按面自定义渲染 | `(face: CubeFace) => React.ReactNode` | 默认随机色方块 |

### CubeFace 枚举

| 成员 | 值 |
| --- | --- |
| `CubeFace.Front` | `"front"` |
| `CubeFace.Back` | `"back"` |
| `CubeFace.Left` | `"left"` |
| `CubeFace.Right` | `"right"` |
| `CubeFace.Top` | `"top"` |
| `CubeFace.Bottom` | `"bottom"` |

> 注：`CubeFace` 枚举在源码中未单独导出，使用 `customRenderFace` 时回调参数即为此枚举值。

## 使用示例

### 基础用法

```tsx
import { Cube } from "@mmjg/ui-components";

export default function Demo() {
    return <Cube size={120} padding={60} autoRotate />;
}
```

### 自定义六面内容

```tsx
import { Cube } from "@mmjg/ui-components";

const faces = {
    front: "前",
    back: "后",
    left: "左",
    right: "右",
    top: "上",
    bottom: "下",
};

export default function Demo() {
    return (
        <Cube
            size={160}
            autoRotate
            customRenderFace={(face) => (
                <div className="cube-face-content">{faces[face]}</div>
            )}
        />
    );
}
```

## 注意事项

- **依赖 `preserve-3d` 与 `perspective`**：3D 效果依赖 `.module.less` 中 `cube` 设置 `perspective`、`cube-core` 设置 `transform-style: preserve-3d`，覆盖样式时勿破坏。
- **`rotateClassName` 优先级**：传入 `rotateClassName` 后内置 `cube-core-auto-rotate` 不再生效，需由自定义类名提供旋转动画。
- **`customRenderFace` 默认随机色**：未传入时每次渲染生成随机颜色，适合演示但不稳定；生产环境建议显式传入渲染函数。
- **`size` 影响面位置**：面的 `translateZ(size/2)` 由内联样式计算，修改 `size` 会同步重排六面位置。
- **`--cube-padding` 与透视**：`padding` 通过 CSS 变量影响外层留白与可视区域，过小可能导致旋转时面被裁切。

---

← [组件总览](./README.md) · → [返回组件总览](./README.md)
