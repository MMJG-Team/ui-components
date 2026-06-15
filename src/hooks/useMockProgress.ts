import { useRef, useState } from "react";

export type IUseMockProgressOptions = {
    step?: number | (() => number)
    stopCondition?: number | (() => number)
    updateInterval?: number | (() => number)

}

/**
 * 适配值
 * @param value 
 * @returns 
 */
const adaptValue = (value: number | (() => number)) => {
    if (typeof value === 'function') {
        return value()
    }
    return value
}

/**
 * 模拟进度条
 * @param options 
 * @returns 
 */
export function useMockProgress(options: IUseMockProgressOptions = {}) {
    const { step = 10, stopCondition = 90, updateInterval = 100 } = options

    const timer = useRef<NodeJS.Timeout>(null)
    const [progress, setProgress] = useState(0)

    const start = () => {
        setProgress(0)

        const add = (current: number) => {
            setProgress(current)

            if (current >= adaptValue(stopCondition)) {
                return
            }

            timer.current = setTimeout(() => {
                add(current + adaptValue(step))
            }, adaptValue(updateInterval))
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