import classNames from "classnames";
import styles from "./style.module.less";
import { useEffect, useRef, type ReactNode } from "react";

export type ShimmerProps = {
    className?: string;
    style?: React.CSSProperties;
    color?: string;
    children: ReactNode;
};

/**
 *  shimmer 组件
 * @param props 组件 props
 * @returns
 */
export const Shimmer = (props: ShimmerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                "--container-width",
                `${containerRef.current?.clientWidth || 0}px`,
            );
        }
    }, [props.children]);

    return (
        props.children && (
            <div
                className={classNames(styles.shimmer, props.className)}
                style={props.style}
                ref={containerRef}
            >
                {props.children}
            </div>
        )
    );
};

export default Shimmer;
