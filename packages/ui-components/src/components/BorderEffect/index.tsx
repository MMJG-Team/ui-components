import classNames from "classnames";
import styles from "./style.module.less";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

export type BorderEffectProps = {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    width?: number;
    color?: string;
    duration?: number;
    borderRadius?: CSSProperties["borderRadius"];
    effects?: {
        percent: number;
        color: string;
    }[];
};

export const BorderEffect = (props: BorderEffectProps) => {
    const {
        className,
        style,
        children,
        width = 2,
        color = "#ffffffff",
        duration = 2,
        borderRadius = 2,
        effects = [],
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * container style
     */
    const containerStyle = useMemo(
        () => ({
            borderRadius,
        }),
        [borderRadius],
    );

    /**
     * content style
     */
    const contentStyle = useMemo(
        () => ({
            ...style,
            borderRadius,
        }),
        [borderRadius, style],
    );

    const effectStyle = useMemo(() => {
        const style: CSSProperties = {};
        const adaptedEffects = [...effects];

        if (color && adaptedEffects.length === 0) {
            adaptedEffects.push(
                {
                    color,
                    percent: 0,
                },
                {
                    color,
                    percent: 10,
                },
                {
                    color: "transparent",
                    percent: 10,
                },
                {
                    color: "transparent",
                    percent: 100,
                },
            );
        }

        if (adaptedEffects.length > 0) {
            style["backgroundImage"] = `conic-gradient(
                    from 0deg,
                    ${adaptedEffects
                        .map((item) => `${item.color} ${item.percent}%`)
                        .join(",")}
                )`;
        }

        return style;
    }, [color, effects]);

    useEffect(() => {
        if (containerRef.current && typeof width === "number") {
            containerRef.current.style.setProperty(
                "--border-width",
                `${width}px`,
            );
        }
    }, [width]);

    useEffect(() => {
        if (containerRef.current && color) {
            containerRef.current.style.setProperty("--border-color", color);
        }
    }, [color]);

    useEffect(() => {
        if (containerRef.current && typeof duration === "number") {
            containerRef.current.style.setProperty(
                "--border-effect-duration",
                `${duration}s`,
            );
        }
    }, [duration]);

    return (
        children && (
            <div
                ref={containerRef}
                className={classNames(styles["border-effect"], className)}
                style={containerStyle}
            >
                <div
                    className={styles["border-effect-core"]}
                    style={{
                        borderRadius,
                    }}
                >
                    <div
                        className={styles["border-effect-core-inner"]}
                        style={effectStyle}
                    ></div>
                </div>

                <div
                    className={styles["border-effect-content"]}
                    style={contentStyle}
                >
                    {children}
                </div>
            </div>
        )
    );
};

export default BorderEffect;
