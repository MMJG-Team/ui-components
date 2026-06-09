import { useEffect, useRef, useState } from "react";
import useEvent from "../../../hooks/useEvent";
import { debounce } from "lodash-es";

export interface UseScrollViewAreaOptions {
    // 容器元素
    container: HTMLElement | (() => HTMLElement)
    // 屏幕外的预加载高度
    overscanHeight?: number
    // 加载更多触发阈值，默认值为 100
    loadMoreThreshold?: number
    /**
     * 滚动事件回调，更新可见区域
     */
    onScroll?: (viewRange: [number, number]) => void
    /**
     * 加载更多回调，当滚动到可见区域底部时触发
     * @returns 
     */
    onLoadMore?: () => void
}

/**
 * 滚动视图区域，返回渲染区域的纵向坐标
 * @param options 
 * @returns 
 */
export default function useScrollViewArea(options: UseScrollViewAreaOptions) {
    const container = typeof options.container === 'function' ? options.container() : options.container;

    const { overscanHeight = 0, loadMoreThreshold = 0 } = options

    /**
     * 渲染区域，[start, end] 表示渲染区域的纵向坐标
     */
    const [viewRange, setViewRange] = useState<[number, number]>([0, Infinity])

    // 当前滚动条是否已经超过加载更多触发阈值
    const alreayOverLoadMoreThreshold = useRef(false)

    /**
     * 计算渲染区域
     */
    const calcViewRange = useEvent(() => {
        const { scrollTop, scrollHeight, clientHeight } = container

        const top = Math.max(0, scrollTop - overscanHeight)
        const bottom = Math.min(scrollHeight, scrollTop + clientHeight + overscanHeight)

        // diff 渲染区域是否有变化
        if (top === viewRange[0] && bottom === viewRange[1]) {
            return viewRange
        }

        const newViewRange = [top, bottom] as [number, number]
        setViewRange(newViewRange)

        return newViewRange
    })

    /**
     * 检测是否加载更多
     */
    const checkShouldLoadMore = useEvent(() => {
        const { scrollTop, scrollHeight, clientHeight } = container

        // 检测是否有滚动条, 考虑加载更多触发阈值
        const hasScrollBar = clientHeight < (scrollHeight - loadMoreThreshold)

        const bottom = scrollTop + clientHeight
        // 检测是否滚动超过加载更多触发阈值
        const overLoadMoreThreshold = bottom >= (scrollHeight - loadMoreThreshold)
        /**
         * 加载更多条件
         * 1. 当没有滚动条时，直接加载更多
         * 2. 当有滚动条时，检测是否滚动到可见区域底部
         */
        const shouldLoadMore = (
            !hasScrollBar ||
            (!alreayOverLoadMoreThreshold.current && overLoadMoreThreshold)
        )

        // 更新 当前滚动条 是否已经超过 加载更多 触发阈值
        alreayOverLoadMoreThreshold.current = overLoadMoreThreshold
        console.log('shouldLoadMore', shouldLoadMore)
        if (shouldLoadMore) {
            options.onLoadMore?.()
        }
    })

    /**
     * 滚动事件
     * 1. 更新渲染区域
     * 2. 检测是否加载更多
     */
    const onScroll = useEvent(() => {
        const newViewRange = calcViewRange()

        options.onLoadMore && checkShouldLoadMore()

        options.onScroll?.(newViewRange)
    })

    /**
     * 元素变化，添加滚动事件监听
     */
    useEffect(() => {
        if (!container) {
            return
        }

        // 初始化触发一次
        onScroll()

        container.addEventListener('scroll', onScroll)
        return () => container.removeEventListener('scroll', onScroll)
    }, [container])

    return [viewRange, calcViewRange] as const
}