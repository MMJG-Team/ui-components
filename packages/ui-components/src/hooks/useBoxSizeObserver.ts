import { useEffect, useRef, useState } from "react";

/**
 * 监听元素大小变化
 * @returns 元素大小
 */
export function useBoxSizeObserver() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [boxSize, setBoxSize] = useState({
        width: 0,
        height: 0,
    })

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

export default useBoxSizeObserver