import { useEffect, useState } from "react";

/**
 * 监听组件挂载状态
 * @param onMounted 组件挂载时调用
 * @param onUnmounted 组件卸载时调用
 * @returns 组件挂载状态
 */
export function useMounted(onMounted?: () => void, onUnmounted?: () => void) {
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
        onMounted?.()

        return () => {
            setMounted(false)
            onUnmounted?.()
        }
    }, [])

    return { mounted }
}

export default useMounted;