import { useCallback, useRef } from "react";

export function useEvent<T extends (...args: any[]) => any>(callback: T) {
    const callbackRef = useRef(callback);

    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>): ReturnType<T> => {
        return callbackRef.current(...args);
    }, [callback]);
}

export default useEvent