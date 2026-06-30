import classNames from "classnames";
import styles from "./style.module.less";
import { useEffect, useRef, type ReactNode } from "react";

export type ShimmerProps = {
    className?: string;
    style?: React.CSSProperties;
    children: ReactNode;

    /**
     * shimmer 类型
     * @default "text"
     * @description shimmer 类型，可选值为 "text" 或 "container"
     *
     * "text" 是文本流光效果
     * "container" 是容器流光效果
     */
    type?: "text" | "container";
    /**
     * shimmer 颜色
     * @default "#ffffffff"
     * @description shimmer 颜色，默认值为 "#ffffffff"
     */
    color?: string;
    /**
     * shimmer 持续时间
     * @default 2
     * @description shimmer 持续时间，默认值为 2 秒
     */
    duration?: number;
};

/**
 *  shimmer 组件
 * @param props 组件 props
 * @returns
 */
export const Shimmer = (props: ShimmerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        className,
        style,
        children,
        type = "text",
        color = "#ffffffff",
        duration = 2,
    } = props;

    useEffect(() => {
        if (containerRef.current && color) {
            containerRef.current.style.setProperty("--shimmer-color", color);
        }
    }, [color]);

    useEffect(() => {
        if (containerRef.current && typeof duration === "number") {
            containerRef.current.style.setProperty(
                "--shimmer-duration",
                `${duration}s`,
            );
        }
    }, [duration]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                "--container-width",
                `${containerRef.current?.clientWidth || 0}px`,
            );
        }
    }, [children]);

    return (
        children && (
            <div
                className={classNames(
                    styles.shimmer,
                    styles[`shimmer-${type}`],
                    className,
                )}
                style={style}
                ref={containerRef}
            >
                {children}
            </div>
        )
    );
};

export default Shimmer;
