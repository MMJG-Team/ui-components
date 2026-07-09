# CSS Modules 与 Less 规范

## 简介

`@mmjg/ui-components` 的所有视图组件统一使用 **CSS Modules + Less** 管理样式。这一组合提供了样式隔离、类名哈希、Less 嵌套与变量等能力，并配合「CSS 自定义属性驱动」的运行时样式模式，实现 props 到动画的解耦。本页记录库内的相关约定。

## 为什么用 CSS Modules

CSS Modules 会将每个 `.module.less` 文件中的类名编译为带哈希的全局唯一名称，从而带来两项核心收益：

- **样式隔离**：不同组件的同名类（如 `.container`）互不冲突，无需人工命名空间。
- **哈希命名**：类名形如 `style__container___a1b2c`，避免与宿主应用样式冲突，也难以被外部覆写。

这使得库可以安全地嵌入任意宿主应用而不污染其全局样式。

## 命名约定

| 约定 | 说明 |
| --- | --- |
| 文件名 | 统一为 `style.module.less`，置于组件目录内 |
| 导入方式 | `import styles from "./style.module.less"` |
| 类名访问 | 以 kebab-case 命名类，用方括号语法 `styles["class-name"]` 访问 |

kebab-case 类名（如 `border-effect-content`）必须用方括号语法访问，因为点号 / 标识符语法无法解析连字符。参考 [BorderEffect](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/BorderEffect/index.tsx)：

```tsx
import styles from "./style.module.less";

<div className={classNames(styles["border-effect"], className)}>
    <div className={styles["border-effect-core"]}>
        <div className={styles["border-effect-core-inner"]} />
    </div>
    <div className={styles["border-effect-content"]}>{children}</div>
</div>
```

## 哈希规则

类名哈希规则由构建配置 [packages/ui-components/rolldown.config.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/rolldown.config.ts) 中的 postcss 插件定义：

```ts
postcss({
    modules: {
        // 自定义类名哈希规则
        generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
})
```

各占位符含义：

| 占位符 | 含义 | 示例 |
| --- | --- | --- |
| `[name]` | 源文件名（不含扩展名） | `style` |
| `[local]` | 原始类名 | `border-effect` |
| `[hash:base64:5]` | 5 位 base64 哈希 | `a1b2c` |

最终类名形如 `style__border-effect___a1b2c`，既有可读性（含源文件与原始类名），又保证唯一性。

## CSS 自定义属性模式

库内组件普遍采用「在组件根选择器声明 `--vars`，由 JS 在 `useEffect` 中写入，CSS 中通过 `var()` 消费」的模式，尤其在动画场景下让 CSS 关键帧接管运行时，JS 仅负责初始写入。

### Shimmer 示例

[Shimmer](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Shimmer/style.module.less) 在 `.shimmer-container` 中声明变量，并在 `::after` 光带与 `@keyframes` 中消费：

```less
.shimmer-container {
    --container-width: 0px;
    --shimmer-width: 10px;
    --shimmer-color: #f5f5f5;
    --shimmer-duration: 2s;

    &::after {
        left: calc(var(--shimmer-width) * -2);
        width: var(--shimmer-width);
        background-image: linear-gradient(270deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%);
        animation: shimmer var(--shimmer-duration) linear infinite;
    }

    @keyframes shimmer {
        30% { transform: translateX(calc(var(--container-width) * 2)) rotate(30deg); }
    }
}
```

对应 [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Shimmer/index.tsx) 中通过 `useEffect` 写入变量：

```tsx
useEffect(() => {
    containerRef.current?.style.setProperty("--shimmer-width", `${width}px`);
}, [width]);
useEffect(() => {
    containerRef.current?.style.setProperty("--shimmer-color", color);
}, [color]);
```

### BorderEffect 示例

[BorderEffect](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/BorderEffect/style.module.less) 同样在根选择器声明变量并用于 `@keyframes`：

```less
.border-effect {
    --border-width: 2px;
    --border-color: #ffffffff;
    --border-effect-duration: 2s;

    .border-effect-core-inner {
        background-image: conic-gradient(from 0deg, var(--border-color) 0%, var(--border-color) 10%, transparent 10%, transparent 100%);
        animation: border-effect-border var(--border-effect-duration) linear infinite;
    }
}
```

### Cube 示例

[Cube](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Cube/style.module.less) 用 `--cube-size` / `--cube-padding` 驱动尺寸与定位：

```less
.cube {
    --cube-size: 100px;
    --cube-padding: 50px;

    padding: var(--cube-padding);

    .cube-core {
        width: var(--cube-size);
        height: var(--cube-size);
    }

    .cube-face {
        top: calc(50% - var(--cube-size) / 2);
        left: calc(50% - var(--cube-size) / 2);
    }
}
```

## 类型声明

为了让 TypeScript 识别 `.module.less` 的导入，[packages/ui-components/global.d.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/global.d.ts) 声明了模块类型：

```ts
// 匹配 *.module.less
declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

这样 `import styles from "./style.module.less"` 得到的 `styles` 是一个 `Record<string, string>`，任意类名访问都返回字符串（运行时由 CSS Modules 提供实际哈希名）。该声明同时保证未使用的类名访问不会报类型错误。

同一文件中还声明了 `*.json`、`*.svg`、`*.png`、`*.gif` 等静态资源模块。

## Less 嵌套与 keyframes

库内 `.less` 文件大量使用 Less 的嵌套语法组织样式层级，并将 `@keyframes` 定义在组件根选择器内部，使其作用域与组件绑定。[BorderEffect](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/BorderEffect/style.module.less) 是典型示例：

```less
.border-effect {
    position: relative;
    overflow: hidden;

    .border-effect-content {
        margin: var(--border-width);
    }

    .border-effect-core {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: var(--border-width);

        // 内容裁剪，只显示padding区域
        mask-image: linear-gradient(#000000, #000000), linear-gradient(#000000, #000000);
        mask-clip: content-box, border-box;
        mask-composite: exclude;

        .border-effect-core-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150%;
            aspect-ratio: 1 / 1;
            animation: border-effect-border var(--border-effect-duration) linear infinite;

            @keyframes border-effect-border {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
        }
    }
}
```

嵌套使 DOM 层级与样式层级一一对应，可读性更强；`@keyframes` 内联在用到它的选择器附近，便于追踪动画来源。

---

← [新增组件指南](./新增组件指南.md) · [编码规范与代码风格](../06-编码规范与代码风格.md)
