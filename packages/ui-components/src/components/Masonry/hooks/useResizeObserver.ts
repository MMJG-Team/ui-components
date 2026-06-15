import { useRef, useEffect } from "react";
import useEvent from "../../../hooks/useEvent";

export type useResizeObserverOptions = {
    callback: (entries: ResizeObserverEntry[]) => void
    element?: HTMLElement | (() => HTMLElement)
}

/**
 * 监听容器 resize 
 * @param options 
 */
export default function useResizeObserver(options: useResizeObserverOptions) {

    const element = typeof options.element === 'function' ? options.element() : options.element;

    const observerRef = useRef<ResizeObserver>(null);

    const callback = useEvent(options.callback);

    useEffect(() => {
        // 没有容器时直接返回
        if (!element) {
            return
        }

        if (!observerRef.current) {
            observerRef.current = new ResizeObserver(callback);
            observerRef.current.observe(element);
        }

        return () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        }
    }, [element]);
}