import classNames from "classnames";
import styles from "./style.module.less";
import { useEffect, useRef } from "react";

export interface CubeProps {
    rootClassName?: string;
    rotateClassName?: string;

    size?: number;
    padding?: number;
    autoRotate?: boolean;
    customRenderFace?: (face: CubeFace) => React.ReactNode;
}

enum CubeFace {
    Front = "front",
    Back = "back",
    Left = "left",
    Right = "right",
    Top = "top",
    Bottom = "bottom",
}

const cubeConfigs = [
    {
        face: CubeFace.Front,
        rotate: "rotateX(0deg)",
    },
    {
        face: CubeFace.Back,
        rotate: "rotateY(180deg)",
    },
    {
        face: CubeFace.Left,
        rotate: "rotateY(90deg)",
    },
    {
        face: CubeFace.Right,
        rotate: "rotateY(-90deg)",
    },
    {
        face: CubeFace.Top,
        rotate: "rotateX(90deg)",
    },
    {
        face: CubeFace.Bottom,
        rotate: "rotateX(-90deg)",
    },
];

/**
 * Generate random color
 * @param opacity
 * @returns
 */
const randomColor = (opacity = 0.5) => {
    return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${opacity})`;
};

/**
 * Cube component
 * @param props
 * @returns
 */
export const Cube = (props: CubeProps) => {
    const {
        rootClassName,
        rotateClassName,
        size = 100,
        padding = 50,
        autoRotate = true,
        customRenderFace = () => (
            <div
                className={styles["cube-face-default-content"]}
                style={{
                    backgroundColor: randomColor(),
                }}
            ></div>
        ),
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty("--cube-size", `${size}px`);
        }
    }, [size]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                "--cube-padding",
                `${padding}px`,
            );
        }
    }, [padding]);

    return (
        <div
            ref={containerRef}
            className={classNames(styles["cube"], rootClassName)}
        >
            <div
                className={classNames(
                    styles["cube-core"],
                    autoRotate &&
                        !rotateClassName &&
                        styles["cube-core-auto-rotate"],
                    rotateClassName,
                )}
            >
                {cubeConfigs.map((config) => (
                    <div
                        key={config.face}
                        className={classNames(
                            styles["cube-face"],
                            styles[config.face],
                        )}
                        style={{
                            transform: `${config.rotate} translateZ(${size / 2}px)`,
                        }}
                    >
                        {customRenderFace?.(config.face)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cube;
