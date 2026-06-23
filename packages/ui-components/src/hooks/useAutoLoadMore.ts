import { debounce } from "lodash-es"
import useEvent from "./useEvent"
import { useEffect } from "react"

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
    onLoadMore: (check: () => void) => void
}) {

    const resolveContainer = () => {
        return typeof container === 'function' ? container() : container
    }

    const checkShouldLoadMore = useEvent(debounce(() => {
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
            scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight
        ) {
            params.onLoadMore?.(checkShouldLoadMore)
            return
        }
    }, 1000))

    useEffect(() => {
        const scrollElement = resolveContainer()
        if (!scrollElement) {
            return
        }

        const observer = new ResizeObserver(() => {
            checkShouldLoadMore()
        })

        observer.observe(scrollElement)

        return () => {
            observer.disconnect()
        }
    }, [params.hasMore, params.onLoadMore])

    return {
        checkShouldLoadMore
    }
}

export default useAutoLoadMore