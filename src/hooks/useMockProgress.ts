import { useEffect, useRef, useState } from "react";

/**
 * 模拟进度条
 * @returns 
 */
export function useMockProgress() {
    const timer = useRef<NodeJS.Timeout>(null)
    const [progress, setProgress] = useState(0)

    const start = () => {
        setProgress(0)

        const add = (current: number) => {
            setProgress(current)

            if (current >= 90) {
                return
            }

            timer.current = setTimeout(() => {
                add(current + 10)
            }, 100)
        }

        add(0)
    }

    const complete = () => {
        stop()
        setProgress(100)
    }

    const stop = () => {
        if (timer.current) {
            clearTimeout(timer.current)
        }

    }

    return {
        progress,
        start,
        complete,
        stop
    }
}

export default useMockProgress;