# Menu3D · 3D 旋转菜单组件

## 简介

`Menu3D` 是一个围绕 Y 轴旋转的 3D 环形菜单组件，菜单项均匀分布在圆环上，可通过鼠标拖拽手动旋转、悬停时暂停自动旋转。其核心特征如下：

- **环形分布**：菜单项按 `360 / menus.length` 等分角度，沿 `translateZ(rotateRadius)` 排布在圆环上。
- **自动旋转**：基于 `requestAnimationFrame` 的恒速旋转，悬停时进入衰减停转，离开后恢复。
- **鼠标拖拽**：通过 `useMouseDragOffset` 捕获水平拖拽偏移，叠加到 `rotateY`。
- **背向淡出**：根据当前旋转角度计算每项透明度，背向用户的项逐渐淡出。
- **自定义渲染**：`customItemRender` 可覆盖默认的菜单项内容。

## 源码位置

- [index.tsx](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Menu3D/index.tsx)
- [useRotateAnimation.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Menu3D/hooks/useRotateAnimation.ts)
- [style.module.less](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Menu3D/style.module.less)

## 实现原理

### 整体结构

组件由外层容器（绑定 `onMouseEnter/onMouseLeave/onMouseDown`）与内层 `component-menu3d-rotate`（承载旋转样式）组成，菜单项作为子节点逐个渲染。挂载前通过 `useMounted` 返回的 `mounted` 控制隐藏，避免初始闪烁。

### 角度与位置

```ts
const itemRotateDeg = 360 / menus.length;
const currentItemRotate = itemRotateDeg * index;
// transform: rotateY(currentItemRotate) translateZ(rotateRadius)
```

每个菜单项以自身索引角度 `rotateY(currentItemRotate)` 先旋转，再沿 Z 轴外推 `rotateRadius`，形成圆环。`backfaceVisibility` 控制背面是否可见（默认 `true` 即 `visible`）。

### 透明度计算

为让背向用户的菜单项淡出，依据当前累计旋转角 `rotateRuntime.current.rotateY` 计算每项透明度：

```ts
const opacity =
    Math.abs(180 - ((currentItemRotate + rotateRuntime.rotateY) % 360)) / 180;
```

该项与旋转中心的相对角度越接近 `180°`（即完全背向），透明度越接近 `0`；越接近 `0°`（即正对用户），透明度越接近 `1`。

### 旋转动画（useRotateAnimation）

`useRotateAnimation` hook 维护一个 `useRef<RotateRuntime>` 运行时上下文（含 `rotateX`、`rotateY`、`speed`、`decaySpeed`、`rAFIndex`），默认 `speed = 0.2`、`decaySpeed = 0.005`。其工作流程：

- **运行态**：`rotateStatus === RotateStatus.running` 时，`rotateAnimation` 通过 `requestAnimationFrame` 递归调度，每帧调用 `nextRotateFrame()` 将 `rotateY` 按 `speed` 递增（`% 360` 取模），并 `setRotateStyle({ transform })` 写入样式。
- **暂停态**：`rotateStatus === RotateStatus.paused` 时不再启动新动画，并通过 `cancelRotateAnimation` 调用 `createRotateEnding()` 生成衰减函数——每帧 `speed -= decaySpeed`，直到 `speed <= 0` 停止，实现「惯性减速」的自然停转效果。
- **手动控制**：`rotateController(direction, { deg })` 直接累加 `rotateY/rotateX` 并立即 `setRotateStyle`，用于响应拖拽。
- **状态切换**：`setRotateStatus` 切换 `running/paused`，`useEffect([rotateStatus])` 负责启停。

### 交互联动

- `onMouseEnter` → `setRotateStatus(RotateStatus.paused)`：悬停暂停。
- `onMouseLeave` → `setRotateStatus(RotateStatus.running)`：离开恢复。
- `useMouseDragOffset` 返回 `xOffset/yOffset`，在 `useEffect([xOffset, yOffset])` 中调用 `rotateController(RotateDirection.horizontal, { deg: xOffset * 0.2 })`，即拖拽水平偏移乘以 `0.2` 系数叠加到旋转角。

### 复用的通用 hooks

组件复用了 `src/hooks` 下的通用 hooks：`useMounted`（挂载标记）、`useMouseDragOffset`（拖拽偏移）、`useEvent`（稳定事件引用，避免依赖数组抖动）。

## API 参考

### Menu3DProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `menus` | 菜单数据（必填） | `Menu[]` | — |
| `menuClassName` | 菜单项类名 | `string` | — |
| `rotateRadius` | 旋转半径（圆环半径，px） | `number` | `200` |
| `backfaceVisibility` | 背面是否可见 | `boolean` | `true` |
| `customItemRender` | 自定义菜单项渲染 | `(menu: Menu) => React.ReactNode` | — |
| `onMenuClick` | 点击菜单回调，参数为菜单 `id` | `(menu: string) => void` | — |

`Menu` 类型：`{ id: string; title: string; icon: React.ReactNode }`。

### useRotateAnimation 导出

| 导出 | 说明 |
| --- | --- |
| `RotateStatus` | 旋转状态枚举：`running`、`paused` |
| `RotateDirection` | 旋转方向枚举：`vertical`、`horizontal` |
| `useRotateAnimation(rotateConfig?)` | 默认导出，返回 `{ rotateStyle, rotateRuntime, setRotateStatus, rotateController }` |

## 使用示例

### 基础用法

```tsx
import { Menu3D } from "@mmjg/ui-components";

const menus = [
    { id: "home", title: "首页", icon: <IconHome /> },
    { id: "user", title: "用户", icon: <IconUser /> },
    { id: "setting", title: "设置", icon: <IconSetting /> },
];

export default function Demo() {
    return (
        <Menu3D
            menus={menus}
            rotateRadius={200}
            onMenuClick={(id) => console.log("click", id)}
        />
    );
}
```

### 自定义菜单项

```tsx
<Menu3D
    menus={menus}
    customItemRender={(menu) => (
        <div className="my-menu">
            {menu.icon}
            <span>{menu.title}</span>
        </div>
    )}
/>
```

## 注意事项

- **依赖 `preserve-3d`**：旋转效果依赖 `.module.less` 中父级设置 `transform-style: preserve-3d` 与 `perspective`，覆盖样式时勿破坏该属性。
- **`menus.length` 不可为 0**：`itemRotateDeg = 360 / menus.length`，空数组会导致除零得到 `Infinity`，使用前请保证至少一项。
- **`onMenuClick` 参数为 `id`**：回调签名是 `(menu: string) => void`，传入的是菜单项的 `id` 而非整个 `Menu` 对象。
- **挂载前隐藏**：`useMounted` 未挂载时容器带 `hidden` 类，首帧不参与布局，避免旋转初始角闪烁。
- **`rotateRuntime` 为 ref**：透明度计算读取的是 `rotateRuntime.current.rotateY`（ref，不触发重渲染），实际旋转角更新由 `rotateStyle`（state）驱动，二者在帧内基本同步。

---

← [组件总览](./README.md) · → [Shimmer](./Shimmer.md)
