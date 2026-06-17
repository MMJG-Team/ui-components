import { debounce, divide } from "lodash-es";
import { useImperativeHandle, useMemo, useRef } from "react";
import classNames from "classnames";
import type { MasonryProps, MasonryRef } from "./types";
import useColumnCount from "./hooks/useColumnCount";
import useMasonryLayout from "./hooks/useMasonryLayout";
import useResizeObserver from "./hooks/useResizeObserver";
import useScrollViewArea from "./hooks/useScrollViewArea";
import React from "react";
import styles from "./style.module.less";

export * from "./models/ImageModel";
export type * from "./types";

const ITEM_CLASS_NAME_PREFIX = "masonry-item";

/**
 * 瀑布流组件
 * @param props
 * @returns
 */
export const Masonry = React.forwardRef(function InternalMasonry<
    Item extends {
        id: string | number;
        src: string;
        naturalWidth: number;
        naturalHeight: number;
    },
>(props: MasonryProps<Item>, ref: React.Ref<MasonryRef>) {
    const {
        className,
        footerClassName,
        gap = 8,
        padding = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        },
        // 头部
        header,
        columnCount,
        breakPointConfig,
        maxColumnCount,
        items,
        // item 最小高度
        minItemHeight = 0,
        // item 附加的额外高度
        itemPayloadHeight = 0,
        // item 自定义渲染函数
        itemRender,
        footer,
        // 空数据时显示的内容
        empty,
        loadMoreThreshold = 0,
        onLoadMore,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * 滚动到顶部
     * @param behavior 滚动行为
     */
    const scrollToTop = (behavior: ScrollBehavior = "instant") => {
        containerRef.current?.scrollTo({
            top: 0,
            behavior,
        });
    };

    /**
     * 滚动事件
     */
    const onScroll = () => {
        props.onScroll?.();
    };

    /**
     * 滚动到指定元素
     * @param id 元素 id
     * @param options 滚动选项
     */
    const scrollIntoView = (
        id: number | string,
        options: ScrollIntoViewOptions = {
            block: "end",
            behavior: "smooth",
        },
    ) => {
        const target = containerRef.current?.querySelector(
            `.${ITEM_CLASS_NAME_PREFIX}-${id}`,
        );
        target?.scrollIntoView(options);
    };

    /**
     * 当前列数
     * 根据【容器宽度】，【列数配置】，【断点配置】计算 当前列数
     */
    const [currentColumnCount, reCalcColumnCount] = useColumnCount({
        container: () => containerRef.current!,
        columnCount,
        breakPointConfig,
        maxColumnCount,
    });

    /**
     * 滚动视图区域，返回可见区域的纵向坐标
     */
    const [viewRange, reCalcViewRange] = useScrollViewArea({
        container: () => containerRef.current!,
        overscanHeight: 3000,
        loadMoreThreshold,
        onLoadMore,
    });

    /**
     * 创建瀑布流实例 - 计算每个 item 的高度，并将 items 分配到不同的列中。
     */
    const { viewableItemsLayout, reLayout, masonryLayoutRef } =
        useMasonryLayout<Item>(containerRef, {
            gap,
            padding,
            columnCount: currentColumnCount ?? 0,
            items,
            // item 最小高度
            minItemHeight,
            // item 附加的额外高度
            itemPayloadHeight,
            // 可见区域，[start, end] 表示可见区域的纵向坐标
            viewRange,
        });

    /**
     * 容器大小变化
     * 1. 实时重新布局
     * 2. 重新计算可见区域
     * 3. 重新计算列数
     */
    const onResize = debounce(() => {
        reLayout();
        reCalcViewRange();
        reCalcColumnCount();
    }, 10);

    /**
     * 监听容器 resize，根据宽度动态切换列数
     */
    useResizeObserver({
        element: () => containerRef.current!,
        callback: onResize,
    });

    /**
     * 容器样式
     */
    const containerStyle = useMemo(
        () => ({
            columnCount: currentColumnCount ?? 0,
            gap: `${gap}px`,
            padding: `${padding.top ?? 0}px ${padding.right ?? 0}px ${padding.bottom ?? 0}px ${padding.left ?? 0}px`,
        }),
        [currentColumnCount, gap, padding],
    );

    /**
     * 列宽度
     */
    const columnWidth = masonryLayoutRef.current?.columnWidth ?? 0;

    // console.log('new', viewableItemsLayout)
    useImperativeHandle(
        ref,
        () => ({
            /**
             * 获取滚动元素
             */
            getScrollElement: () => containerRef.current!,
            /**
             * 滚动到顶部
             */
            scrollToTop: (behavior: ScrollBehavior = "instant") =>
                scrollToTop(behavior),
            /**
             * 滚动到指定元素
             * @param id 元素 id
             * @param options 滚动选项
             */
            scrollIntoView: (
                id: string | number,
                options: ScrollIntoViewOptions = {
                    block: "end",
                    behavior: "smooth",
                },
            ) => scrollIntoView(id, options),
        }),
        [scrollToTop, scrollIntoView],
    );

    return (
        <div
            ref={containerRef}
            className={classNames(styles["masonry"], className)}
            onScroll={onScroll}
        >
            {header}

            {items.length > 0 ? (
                <div
                    className={styles["masonry-columns"]}
                    style={containerStyle}
                >
                    {viewableItemsLayout.map((columnItems, index) => (
                        <div
                            key={index}
                            className={styles["masonry-column"]}
                            style={{
                                height:
                                    masonryLayoutRef.current?.getColumnHeight(
                                        index,
                                    ) ?? 0,
                            }}
                        >
                            {columnItems.map((item, rowIndex) => (
                                <div
                                    key={item.id}
                                    className={styles["masonry-item"]}
                                    style={{
                                        transform: `translateY(${item.top}px)`,
                                        height: `${item.boxHeight}px`,
                                    }}
                                >
                                    {itemRender?.({
                                        item,
                                        className: `${ITEM_CLASS_NAME_PREFIX}-${item.id}`,
                                        rowIndex,
                                        columnIndex: index,
                                        columnWidth,
                                        height: item.height,
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                empty
            )}

            <div
                className={classNames(
                    styles["masonry-footer"],
                    footerClassName,
                )}
            >
                {footer}
            </div>
        </div>
    );
});

export default Masonry;
