import { debounce } from "lodash-es"
import useEvent from "./useEvent"
import { useEffect, useMemo } from "react"

const DEFAULT_CHECK_INTERVAL = 1000

/**
 * 自动加载更多
 * 
 * 【场景描述】：
 * - 分页的 pageNum 是一个定值，但窗口的大小用户可以自由拖拽，因此可能出现窗口被推拽得较大的情况下，滚动条消失，导致用户无法触发加载更多。
 * 【处理方案】：
 * - 监听滚动容器大小变化，当滚动容器滚动条消失时，如果还有更多则触发加载更多。
 */
export function useAutoLoadMore(container: HTMLElement | (() => HTMLElement), params: {
    hasMore: boolean
    checkInterval?: number | {
        scroll?: number,
        resize?: number,
    }
    onLoadMore: (check: () => void) => void
}) {
    const { checkInterval = DEFAULT_CHECK_INTERVAL } = params ?? {}

    const {
        scroll: scrollInterval = DEFAULT_CHECK_INTERVAL,
        resize: resizeInterval = DEFAULT_CHECK_INTERVAL
    } = useMemo(() => {
        if (typeof checkInterval === 'number') {
            return {
                scroll: checkInterval,
                resize: checkInterval,
            }
        }

        return checkInterval
    }, [checkInterval])

    const resolveContainer = () => {
        return typeof container === 'function' ? container() : container
    }

    /**
     * 检查是否需要加载更多
     * @returns 
     */
    const checkShouldLoadMore = () => {
        const scrollElement = resolveContainer()
        if (!scrollElement) {
            return
        }

        if (!params.hasMore) {
            return
        }

        /**
         * 1. 判断是否没有滚动条，没有则加载更多
         * 2. 或者判断是否滚动到了底部，滚动到底部则加载更多
         */
        if (
            scrollElement.scrollHeight <= scrollElement.clientHeight ||
            Math.ceil(scrollElement.scrollTop) + Math.ceil(scrollElement.clientHeight) >= scrollElement.scrollHeight
        ) {
            params.onLoadMore?.(checkShouldLoadMore)
            return
        }
    }

    const checkForResize = useEvent(debounce(checkShouldLoadMore, resizeInterval))
    const checkForScroll = useEvent(debounce(checkShouldLoadMore, scrollInterval))

    useEffect(() => {
        const scrollElement = resolveContainer()
        if (!scrollElement) {
            return
        }

        // 监听滚动容器大小变化
        const observer = new ResizeObserver(() => checkForResize())
        observer.observe(scrollElement)

        // 监听滚动事件
        scrollElement.addEventListener('scroll', checkForScroll)

        return () => {
            observer.disconnect();
            scrollElement.removeEventListener('scroll', checkForScroll)
        }
    }, [params.hasMore, params.onLoadMore])

    return {
        checkShouldLoadMore
    }
}

export default useAutoLoadMore