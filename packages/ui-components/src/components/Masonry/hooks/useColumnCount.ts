import { useState, useEffect } from "react";
import type { MasonryProps } from "../types";

export type useColumnCountOptions = Pick<MasonryProps<any>, 'columnCount' | 'breakPointConfig' | 'maxColumnCount'> & {
    container?: HTMLElement | (() => HTMLElement)
}

const DEFAULT_COLUMN_COUNT = 4;

/**
 * 获取当前列数
 * @param options 
 * @returns 
 */
const useColumnCount = (options: useColumnCountOptions) => {
    const { columnCount, breakPointConfig, maxColumnCount, container = () => document.body } = options;

    const containerElement = typeof container === 'function' ? container() : container;

    const [currentColumnCount, setCurrentColumnCount] = useState(columnCount);

    /**
     * 应用最大列数限制
     */
    const applyMaxColumnCount = (count: number) => {
        if (maxColumnCount != null && typeof maxColumnCount === 'number') {
            return Math.min(count, maxColumnCount);
        }
        return count;
    };

    /**
     * 重新计算列数
     */
    const reCalc = () => {
        let count: number;
        // 优先使用传入的 columnCount
        if (columnCount != null && typeof columnCount === 'number') {
            count = columnCount;
            setCurrentColumnCount(applyMaxColumnCount(count));
            return;
        }
        
        if (!breakPointConfig) {
            count = DEFAULT_COLUMN_COUNT;
            setCurrentColumnCount(applyMaxColumnCount(count));
            return
        }

        if (!containerElement) {
            return;
        }

        const breakPoints = Object.keys(breakPointConfig).map(Number).sort((a, b) => a - b);
        const width = containerElement.clientWidth;
        let index = 0;
        for (let i = 0; i < breakPoints.length; i++) {
            if (width >= breakPoints[i]) {
                index = i;
            }
        }
        count = breakPointConfig[breakPoints[index]];
        
        setCurrentColumnCount(applyMaxColumnCount(count));
    }

    useEffect(() => {
        reCalc()
    }, [columnCount, breakPointConfig, maxColumnCount, containerElement]);

    return [currentColumnCount, reCalc] as const;
}

export default useColumnCount;