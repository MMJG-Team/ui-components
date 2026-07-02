import { useRef, useState } from "react"
import useEvent from "./useEvent"

/**
 * 鼠标拖拽 - 捕获鼠标移动时的偏移量
 * @returns
 */
export function useMouseDragOffset(options?: {
    onDrag?: (offset: { xOffset: number, yOffset: number }) => void
    onDragEnd?: () => void
}) {
    // 缓存状态
    const cache = useRef({
        // 鼠标位置
        mousePosition: {
            x: 0,
            y: 0
        }
    })

    // 鼠标移动时的偏移量
    const [offset, setOffset] = useState({
        xOffset: 0,
        yOffset: 0
    })

    // 是否正在拖拽
    const [isDragging, setIsDragging] = useState(false)

    /**
     * 鼠标按下
     */
    const onMouseDown = useEvent((e: React.MouseEvent) => {
        const { pageX, pageY } = e;

        cache.current.mousePosition = {
            x: pageX,
            y: pageY
        }

        document.body.style.cursor = 'move'

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    })

    /**
     * 鼠标移动
     */
    const onMouseMove = useEvent((e: MouseEvent) => {
        const { pageX, pageY } = e;
        const { x, y } = cache.current.mousePosition;

        const newOffset = {
            xOffset: pageX - x,
            yOffset: pageY - y
        }

        setOffset(newOffset)
        options?.onDrag?.(newOffset)

        if (!isDragging) {
            setIsDragging(true)
        }

        cache.current.mousePosition = {
            x: pageX,
            y: pageY
        }
    })

    /**
     * 鼠标抬起
     */
    const onMouseUp = useEvent((e: MouseEvent) => {
        e.stopPropagation();

        setOffset({
            xOffset: 0,
            yOffset: 0
        })

        document.body.style.cursor = 'default'
        
        setIsDragging(false)
        options?.onDragEnd?.()
        
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    })

    return {
        ...offset,
        isDragging,
        onMouseDown,
    }
}

export default useMouseDragOffset
