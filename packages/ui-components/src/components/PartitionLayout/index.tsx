import classNames from "classnames";
import styles from "./style.module.less";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useBoxSizeObserver, useMouseDragOffset } from "../../hooks";

export type PartitionLayoutProps = {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;

    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    gap?: CSSProperties["gap"];
    subContent?: React.ReactNode;
    subContentDefaultWidth?: CSSProperties["width"];
    limit?: {
        childrenMinWidth?: number;
        subContentMinWidth?: number;
    };

    draglineClassName?: string;
};

// layout default width
const DEFAULT_WIDTH = "100%";
// layout default height
const DEFAULT_HEIGHT = "100%";
// sub content default width
const DEFAULT_SUB_CONTENT_DEFAULT_WIDTH = "30%";
// layout default gap
const DEFAULT_GAP = 0;
// children default min width
const DEFAULT_CHILDREN_MIN_WIDTH = 0;
// sub content default min width
const DEFAULT_SUB_CONTENT_MIN_WIDTH = 0;

/**
 * Partition layout component
 * @param props
 * @returns
 */
export const PartitionLayout = (props: PartitionLayoutProps) => {
    const {
        className,
        style,
        children,

        width = DEFAULT_WIDTH,
        height = DEFAULT_HEIGHT,
        gap = DEFAULT_GAP,
        subContent,
        subContentDefaultWidth = DEFAULT_SUB_CONTENT_DEFAULT_WIDTH,
        limit = {
            childrenMinWidth: DEFAULT_CHILDREN_MIN_WIDTH,
            subContentMinWidth: DEFAULT_SUB_CONTENT_MIN_WIDTH,
        },

        draglineClassName,
    } = props;

    /**
     * Container ref
     * @description Container ref to observe the size of the container
     */
    const [containerRef, containerSize] = useBoxSizeObserver();

    /**
     * Sub content width
     * @description Sub content width in percent or pixel
     */
    const [subContentWidth, setSubContentWidth] = useState(
        subContentDefaultWidth,
    );

    const { isDragging, onMouseDown } = useMouseDragOffset({
        onDrag: (offset) => {
            setSubContentWidth((current) => {
                // if current is percent
                if (typeof current === "string" && current.endsWith("%")) {
                    // convert percent to pixel
                    const currentPx =
                        (parseFloat(current) / 100) * containerSize.width;

                    // calculate next pixel
                    const nextPx = currentPx - offset.xOffset;
                    // clamp next pixel to min width and max width
                    const safeNextPx = Math.min(
                        Math.max(nextPx, limit.subContentMinWidth ?? 0),
                        containerSize.width,
                    );

                    // convert pixel to percent
                    const nextPercent =
                        (safeNextPx / containerSize.width) * 100;

                    return `${nextPercent}%`;
                }

                // if current is pixel
                const currentPx = parseFloat(String(current));
                const nextPx = currentPx - offset.xOffset;

                const safeNextPx = Math.min(
                    Math.max(nextPx, limit.subContentMinWidth ?? 0),
                    containerSize.width,
                );

                return safeNextPx;
            });
        },
    });

    // layout style
    const layoutStyle = useMemo(
        () => ({
            width,
            height,
            gap: subContent ? gap : 0,
            ...style,
        }),
        [width, height, gap, style, subContent],
    );

    // children style
    const childrenStyle = useMemo(
        () => ({
            minWidth: limit.childrenMinWidth ?? 0,
        }),
        [limit.childrenMinWidth],
    );

    // sub content style
    const subContentStyle = useMemo(() => {
        return subContent
            ? {
                  width: subContentWidth,
                  minWidth: limit.subContentMinWidth ?? 0,
              }
            : {
                  width: 0,
                  minWidth: 0,
                  opacity: 0,
              };
    }, [subContent, subContentWidth, limit.subContentMinWidth]);

    return (
        <div
            ref={containerRef}
            className={classNames(styles["partition-layout"], className)}
            style={layoutStyle}
        >
            <div
                className={styles["partition-layout-content"]}
                style={childrenStyle}
            >
                {children}
            </div>

            {subContent && (
                <div
                    className={classNames(
                        styles["partition-layout-drag-line"],
                        isDragging && styles["dragging"],
                        draglineClassName,
                    )}
                    onMouseDown={(e) => onMouseDown(e)}
                ></div>
            )}

            <div
                className={classNames(
                    styles["partition-layout-sub-content"],
                    isDragging && styles["dragging"],
                )}
                style={subContentStyle}
            >
                {subContent}
            </div>
        </div>
    );
};

export default PartitionLayout;
