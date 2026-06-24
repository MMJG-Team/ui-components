import { useEffect, useState } from "react";

const getWindowSize = () => (typeof window !== 'undefined' ? {
    width: window.innerWidth,
    height: window.innerHeight,
} : {
    width: 0,
    height: 0,
})

/**
 * 监听窗口大小变化
 * @returns 窗口大小
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState(getWindowSize())

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return windowSize;
}

export default useWindowSize