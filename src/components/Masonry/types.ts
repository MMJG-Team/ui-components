
export type SourceImageRecord<T extends Record<string, any>> = T & {
    src: string;
}

export type ImageRecord<T extends Record<string, any> = Record<string, any>> = SourceImageRecord<T & {
    naturalWidth: number;
    naturalHeight: number;
}>

/**
 * 瀑布流组件属性
 */
export type MasonryProps<Item extends {
    id: string | number
    src: string
    naturalWidth: number
    naturalHeight: number
}> = {
    // 容器类名
    className?: string
    // 头部
    header?: React.ReactNode,
    // 数据
    items: Item[],
    // 断点配置
    breakPointConfig?: Record<number, number>
    // 列数
    columnCount?: number
    // 最大列数，与 columnCount / breakPointConfig 计算出的列数取 min
    maxColumnCount?: number
    // 间距
    gap?: number
    // 内边距
    padding?: {
        top?: number
        bottom?: number
        left?: number
        right?: number
    },
    // 每一项附加的额外高度
    itemPayloadHeight?: number
    // 项渲染函数
    itemRender?: ((params: {
        className: string
        item: Item
        rowIndex: number
        columnIndex: number
        columnWidth: number
        height: number
    }) => React.ReactNode)
    // 项最小高度限制，默认不限制
    minItemHeight?: number
    // 页脚类名
    footerClassName?: string
    // 页脚内容
    footer?: React.ReactNode
    // 空数据时显示的内容
    empty?: React.ReactNode
    // 加载更多触发阈值，默认值为 100
    loadMoreThreshold?: number
    // 加载更多回调，当滚动到可见区域底部时触发
    onLoadMore?: () => void
    // 滚动事件
    onScroll?: () => void
}

export type MasonryRef = {
    /**
     * 获取滚动元素
     */
    getScrollElement: () => HTMLElement | null
    /**
     * 滚动到顶部
     */
    scrollToTop: (behavior?: ScrollBehavior) => void
    /**
     * 滚动到指定项
     * @param id 项 id
     */
    scrollIntoView: (id: string | number) => void
}