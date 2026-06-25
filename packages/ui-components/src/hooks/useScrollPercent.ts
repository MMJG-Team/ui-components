import { useEffect, useState } from "react";

const resolveScrollContainer = (scrollContainer: HTMLElement | (() => HTMLElement)) => {
    if (typeof scrollContainer === 'function') {
        return scrollContainer()
    }
    return scrollContainer
}

/**
 * 监听滚动事件，计算滚动百分比
 * @param scrollContainer 滚动容器
 * @returns 
 *  - scrollPercent: 滚动百分比
 *  - scrollTo: 滚动到指定位置
 */
export function useScrollPercent(scrollContainer: HTMLElement | (() => HTMLElement)) {
    const [scrollPercent, setScrollPercent] = useState(0)

    const getScrollPercent = () => {
        const container = resolveScrollContainer(scrollContainer)
        if (!container) {
            return 0;
        }
        
        const { scrollTop, scrollHeight, clientHeight } = container
        
        if (scrollHeight <= clientHeight) {
            return 0;
        }

        const scrollPercent = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        return scrollPercent;
    };

    const scrollTo = (percent: number) => {
        const container = resolveScrollContainer(scrollContainer)
        if (!container) {  
            return;
        }

        const scrollHeight = container.scrollHeight;
        const scrollTop = Math.round((scrollHeight * percent) / 100);
        
        container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        const container = resolveScrollContainer(scrollContainer)
        if (!container) {
            return;
        }

        const handleScroll = () => {
            const scrollPercent = getScrollPercent();
            setScrollPercent(scrollPercent);
        }

        container.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
        
    }, [])

    return {
        scrollPercent,
        scrollTo
    }
}

export default useScrollPercent 