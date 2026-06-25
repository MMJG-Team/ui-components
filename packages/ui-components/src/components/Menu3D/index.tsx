import React, { useEffect, type MouseEventHandler } from "react";
import useRotateAnimation, {
    RotateDirection,
    RotateStatus,
} from "./hooks/useRotateAnimation";
import useMouseDragOffset from "../../hooks/useMouseDragOffset";
import useEvent from "../../hooks/useEvent";

import styles from "./style.module.less";
import classNames from "classnames";
import useMounted from "../../hooks/useMounted";

type Menu = {
    id: string;
    title: string;
    icon: React.ReactNode;
};

export type Menu3DProps = {
    menus: Menu[];
    menuClassName?: string;
    rotateRadius?: number;
    backfaceVisibility?: boolean;
    customItemRender?: (menu: Menu) => React.ReactNode;
    onMenuClick?: (menu: string) => void;
};

/**
 * 3D 菜单组件
 * @param props
 * @returns
 */
export function Menu3D(props: Menu3DProps) {
    const {
        menus,
        menuClassName,
        rotateRadius = 200,
        backfaceVisibility = true,
        customItemRender,
        onMenuClick = () => {},
    } = props;
    const itemRotateDeg = 360 / menus.length;

    const { mounted } = useMounted();
    const { xOffset, yOffset, onMouseDown } = useMouseDragOffset();
    const { rotateStyle, rotateRuntime, setRotateStatus, rotateController } =
        useRotateAnimation();

    const onMouseEnter = useEvent(() => setRotateStatus(RotateStatus.paused));
    const onMouseLeave = useEvent(() => setRotateStatus(RotateStatus.running));

    useEffect(() => {
        rotateController(RotateDirection.horizontal, { deg: xOffset * 0.2 });
    }, [xOffset, yOffset]);

    return (
        <div
            className={classNames([
                styles["component-menu3d"],
                !mounted && styles["hidden"],
            ])}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseDown={
                onMouseDown as unknown as MouseEventHandler<HTMLDivElement>
            }
        >
            <div
                className={styles["component-menu3d-rotate"]}
                style={{
                    ...rotateStyle,
                }}
            >
                {menus.map(({ id, title, icon }, index) => {
                    const currentItemRotate = itemRotateDeg * index;

                    const opacity =
                        Math.abs(
                            180 -
                                ((currentItemRotate +
                                    rotateRuntime.current.rotateY) %
                                    360),
                        ) / 180;

                    return (
                        <div
                            key={id}
                            className={classNames([
                                styles["component-menu3d-menu"],
                                menuClassName,
                            ])}
                            style={{
                                opacity,
                                transform: `rotateY(${currentItemRotate}deg) translateZ(${rotateRadius}px)`,
                                backfaceVisibility: backfaceVisibility
                                    ? "visible"
                                    : "hidden",
                            }}
                            onClick={() => onMenuClick(id)}
                        >
                            {customItemRender ? (
                                customItemRender({ id, title, icon })
                            ) : (
                                <div
                                    className={
                                        styles["component-menu3d-menu-content"]
                                    }
                                >
                                    <div
                                        className={
                                            styles[
                                                "component-menu3d-menu-content-title"
                                            ]
                                        }
                                    >
                                        {icon}
                                        <div>{title} </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Menu3D;
