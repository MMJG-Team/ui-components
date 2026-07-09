# 响应式与 ResizeObserver 模式

## 简介

`@mmjg/ui-components` 中需要感知容器尺寸的场景（典型如 [Masonry](../components/Masonry.md) 瀑布流）统一基于 `ResizeObserver` 实现。本页梳理库内两种 `ResizeObserver` 封装、容器引用约定、debounce 合并、列数响应与触底加载五种模式。

## 两种 ResizeObserver 用法

库内存在两个 `ResizeObserver` 封装，定位不同：

### useBoxSizeObserver：自监听

[useBoxSizeObserver](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/hooks/useBoxSizeObserver.ts) 返回一个 `[ref, boxSize]` 元组，调用方把 `ref` 挂到目标元素上即可监听其自身尺寸变化，适合「我自己的盒子变了我需要知道」的场景：

```ts
export function useBoxSizeObserver() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [boxSize, setBoxSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setBoxSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        })

        const element = ref.current;
        if (element) {
            observer.observe(element);
        }

        return () => {
            observer.disconnect();
        }
    }, [])

    return [ref, boxSize] as const;
}
```

注意 `useEffect` 依赖为空数组，observer 只在挂载时创建一次，卸载时 `disconnect`。

### useResizeObserver：外部监听

[Masonry 内部的 useResizeObserver](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useResizeObserver.ts) 接收一个 `element`（或返回元素的函数）与 `callback`，监听任意外部元素：

```ts
export type useResizeObserverOptions = {
    callback: (entries: ResizeObserverEntry[]) => void
    element?: HTMLElement | (() => HTMLElement)
}

export default function useResizeObserver(options: useResizeObserverOptions) {
    const element = typeof options.element === 'function' ? options.element() : options.element;
    const observerRef = useRef<ResizeObserver>(null);

    const callback = useEvent(options.callback);

    useEffect(() => {
        if (!element) {
            return
        }
        if (!observerRef.current) {
            observerRef.current = new ResizeObserver(callback);
            observerRef.current.observe(element);
        }
        return () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        }
    }, [element]);
}
```

这里用 [useEvent](./useEvent-稳定回调模式.md) 包裹 `callback`，使回调始终引用最新闭包而不会触发 observer 重建；`useEffect` 仅依赖 `element`，元素变化时才会断开重连。

## 容器引用约定

上述两个封装及多个 Masonry 内部 hook 都接受 `HTMLElement | (() => HTMLElement)` 形式的容器引用，并采用统一的 resolve 模式：

```ts
const container = typeof options.container === 'function' ? options.container() : options.container;
```

**为什么用函数形式**：在 hook 调用时机，`ref.current` 往往还是 `null`（DOM 尚未挂载）。传入一个 `() => containerRef.current!` 的惰性求值函数，可以让 hook 在 `useEffect` 内部、DOM 已挂载后再读取真实元素，规避「hook 调用时 ref 为空」的问题。Masonry 中统一这样使用：

```ts
useResizeObserver({
    element: () => containerRef.current!,
    callback: onResize,
});
```

## debounce 合并

容器尺寸变化时，ResizeObserver 可能在单次拖拽中连续触发多次回调。Masonry 将 resize 回调用 [lodash](https://lodash.com/) 的 `debounce` 合并，避免每次微小变化都重算布局：

```ts
import { debounce } from "lodash-es";

const onResize = debounce(() => {
    reLayout();
    reCalcViewRange();
    reCalcColumnCount();
}, 10);
```

10ms 的 debounce 间隔足以合并同一帧内的连续触发，又不会引入明显延迟。该回调在尺寸稳定后统一执行三件事：重新布局、重算可见区域、重算列数。

## 列数响应

[useColumnCount](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useColumnCount.ts) 根据容器宽度与断点配置动态计算列数：

```ts
const useColumnCount = (options: useColumnCountOptions) => {
    const { columnCount, breakPointConfig, maxColumnCount, container = () => document.body } = options;
    const containerElement = typeof container === 'function' ? container() : container;
    const [currentColumnCount, setCurrentColumnCount] = useState(columnCount);

    const applyMaxColumnCount = (count: number) => {
        if (maxColumnCount != null && typeof maxColumnCount === 'number') {
            return Math.min(count, maxColumnCount);
        }
        return count;
    };

    const reCalc = () => {
        let count: number;
        // 优先使用传入的 columnCount
        if (columnCount != null && typeof columnCount === 'number') {
            count = columnCount;
            setCurrentColumnCount(applyMaxColumnCount(count));
            return;
        }
        if (!breakPointConfig) {
            count = DEFAULT_COLUMN_COUNT; // 4
            setCurrentColumnCount(applyMaxColumnCount(count));
            return
        }
        if (!containerElement) {
            return;
        }

        const breakPoints = Object.keys(breakPointConfig).map(Number).sort((a, b) => a - b);
        const width = containerElement.clientWidth;
        let index = 0;
        for (let i = 0; i < breakPoints.length; i++) {
            if (width >= breakPoints[i]) {
                index = i;
            }
        }
        count = breakPointConfig[breakPoints[index]];
        setCurrentColumnCount(applyMaxColumnCount(count));
    }

    useEffect(() => {
        reCalc()
    }, [columnCount, breakPointConfig, maxColumnCount, containerElement]);

    return [currentColumnCount, reCalc] as const;
}
```

关键逻辑：

- **优先级**：显式 `columnCount` > `breakPointConfig` > 默认值 `4`。
- **断点匹配**：`breakPointConfig` 是 `Record<number, number>`（键为最小宽度阈值，值为对应列数）。将键升序排序后，找到容器宽度能命中的最大断点，取其列数。
- **上限约束**：通过 `Math.min(count, maxColumnCount)` 应用最大列数限制，避免在大屏下列数过多。

## 触底加载

[useScrollViewArea](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/components/Masonry/hooks/useScrollViewArea.ts) 负责可见区域计算与触底加载触发：

```ts
export default function useScrollViewArea(options: UseScrollViewAreaOptions) {
    const container = typeof options.container === 'function' ? options.container() : options.container;
    const { overscanHeight = 0, loadMoreThreshold = 0 } = options
    const [viewRange, setViewRange] = useState<[number, number]>([0, Infinity])
    const alreayOverLoadMoreThreshold = useRef(false)

    const calcViewRange = useEvent(() => {
        const { scrollTop, scrollHeight, clientHeight } = container
        const top = Math.max(0, scrollTop - overscanHeight)
        const bottom = Math.min(scrollHeight, scrollTop + clientHeight + overscanHeight)
        if (top === viewRange[0] && bottom === viewRange[1]) {
            return viewRange
        }
        const newViewRange = [top, bottom] as [number, number]
        setViewRange(newViewRange)
        return newViewRange
    })

    const checkShouldLoadMore = useEvent(() => {
        const { scrollTop, scrollHeight, clientHeight } = container
        const hasScrollBar = clientHeight < (scrollHeight - loadMoreThreshold)
        const bottom = scrollTop + clientHeight
        const overLoadMoreThreshold = bottom >= (scrollHeight - loadMoreThreshold)

        const shouldLoadMore = (
            !hasScrollBar ||
            (!alreayOverLoadMoreThreshold.current && overLoadMoreThreshold)
        )
        alreayOverLoadMoreThreshold.current = overLoadMoreThreshold
        if (shouldLoadMore) {
            options.onLoadMore?.()
        }
    })
    // ...
}
```

核心机制：

- **可视区裁剪**：`viewRange` 为 `[top, bottom]`，其中 `top = max(0, scrollTop - overscanHeight)`，`bottom = min(scrollHeight, scrollTop + clientHeight + overscanHeight)`。`overscanHeight`（Masonry 传 3000）用于在可视区上下各预渲染一段，避免滚动时空白。
- **触底判定**：当 `bottom >= scrollHeight - loadMoreThreshold` 时视为触底；若 `hasScrollBar` 为假（无滚动条，即内容不足以撑出滚动），也直接触发加载更多，覆盖「窗口拉大后滚动条消失」的场景。
- **去重**：`alreayOverLoadMoreThreshold` 记录是否已越过阈值，避免持续触底时重复触发，只有「从未越过 → 越过」的边沿才触发。

Masonry 中将其与列数、布局联动：

```ts
const [viewRange, reCalcViewRange] = useScrollViewArea({
    container: () => containerRef.current!,
    overscanHeight: 3000,
    loadMoreThreshold,
    onLoadMore,
});
```

---

← [Hooks 总览](../hooks/README.md) · [Masonry 瀑布流](../components/Masonry.md)
