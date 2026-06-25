import { useCallback, useRef } from "react";

/**
 * 事件处理函数的引用，防止函数被重新创建
 * @param callback 事件处理函数
 * @returns 
 */
export function useEvent<T extends (...args: any[]) => any>(callback: T) {
    const callbackRef = useRef(callback);

    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>): ReturnType<T> => {
        return callbackRef.current(...args);
    }, []);
}

export default useEvent