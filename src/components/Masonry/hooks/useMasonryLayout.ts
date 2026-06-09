import { useEffect, useRef, useState } from "react"
import MasonryLayout, { type BaseItem, type ItemLayout, type MasonryLayoutOptions } from "../models/MasonryLayout"

/**
 * 瀑布流布局 hook
 * @param containerRef 
 * @param options 
 * @returns 
 */
export default function useMasonryLayout<Item extends BaseItem>(
    containerRef: React.RefObject<HTMLElement | null>,
    options: MasonryLayoutOptions<Item>
) {
    const masonryLayoutRef = useRef<MasonryLayout<Item>>(null)
    const [viewableItemsLayout, setViewableItemsLayout] = useState<ItemLayout<Item>[][]>([])

    /**
     * 创建瀑布流布局实例
     * @returns 
     */
    const createMasonryLayout = () => {
        if (!containerRef.current) {
            return;
        }

        if (!masonryLayoutRef.current) {
            const masonryLayout = new MasonryLayout<Item>(containerRef.current, options)

            masonryLayoutRef.current = masonryLayout
        }
    }

    /**
     * 销毁瀑布流布局实例
     * @returns 
     */
    const disposeMasonryLayout = () => {
        if (!masonryLayoutRef.current) {
            return
        }

        masonryLayoutRef.current.dispose()
        masonryLayoutRef.current = null
    }

    /**
     * 重新布局 瀑布流
     * @returns 
     */
    const reLayout = () => {
        if (!masonryLayoutRef.current) {
            return
        }

        masonryLayoutRef.current.reLayout()
        setViewableItemsLayout(masonryLayoutRef.current.getViewableItemsLayout())
    }

    /**
     * 重新计算可见区域
     */
    const reCalcViewArea = (range: [number, number]) => {
        if (!masonryLayoutRef.current) {
            return
        }

        masonryLayoutRef.current.setOptions({ viewRange: range })
        setViewableItemsLayout(masonryLayoutRef.current.getViewableItemsLayout())
    }

    /**
     * 容器元素变化，创建或销毁瀑布流布局实例
     */
    useEffect(() => {
        createMasonryLayout();
        return () => disposeMasonryLayout()
    }, [containerRef.current])

    /**
     * 选项变化，更新瀑布流布局
     */
    useEffect(() => {
        if (!masonryLayoutRef.current) {
            return
        }

        masonryLayoutRef.current.setOptions(options)
        setViewableItemsLayout(masonryLayoutRef.current.getViewableItemsLayout())
    }, [options])

    return {
        viewableItemsLayout,
        reLayout,
        reCalcViewArea,
        masonryLayoutRef
    }
}