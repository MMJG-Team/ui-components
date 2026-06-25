import { useEffect, useRef, useState, type CSSProperties } from "react";
import useEvent from "./useEvent";

/**
 * 旋转状态
 */
export enum RotateStatus {
    running,
    paused
}

export enum RotateDirection {
    vertical,
    horizontal
}

/**
 * 旋转运行时上下文
 */
type RotateRuntime = {
    // X旋转角度
    rotateX: number
    // Y旋转角度
    rotateY: number
    // 旋转速度/帧
    speed: number
    // 暂停动画：动画衰减速度/帧
    decaySpeed: number
    // 帧处理器标记
    rAFIndex?: number
}

// 默认旋转动画配置
const defaultRotateConfig = {
    rotateX: 0,
    rotateY: 0,
    speed: 0.2,
    decaySpeed: 0.005
}

/**
 * 旋转动画
 * @returns
 */
export default function useRotateAnimation(
    rotateConfig: RotateRuntime = defaultRotateConfig
) {
    const rotateRuntime = useRef<RotateRuntime>({
        ...rotateConfig
    })
    // 旋转样式
    const [rotateStyle, setRotateStyle] = useState<CSSProperties>({})
    // 旋转状态
    const [rotateStatus, setRotateStatus] = useState(RotateStatus.running);

    /**
     * 计算下一帧的旋转角度
     */
    function nextRotateFrame(targetSpeed?: number) {
        const { rotateY, speed } = rotateRuntime.current;
        const nextRotate = (rotateY + (targetSpeed! ?? speed)) % 360;

        rotateRuntime.current.rotateY = nextRotate
    }

    /**
     * 旋转控制器
     */
    const rotateController = useEvent((direction: RotateDirection, config: any) => {
        const { deg } = config;

        switch (direction) {
            case RotateDirection.horizontal:
                rotateRuntime.current.rotateY += deg
                break;
            case RotateDirection.vertical:
                rotateRuntime.current.rotateX += deg
                break;
            default:
                break;
        }

        // cancelRAF();
        setRotateStyle({
            transform: `rotateY(${rotateRuntime.current.rotateY}deg)`
        })
    })

    /**
     * cancel rAF
     */
    const cancelRAF = useEvent(() => {
        if (rotateRuntime.current.rAFIndex) {
            cancelAnimationFrame(rotateRuntime.current.rAFIndex);
        }
    })

    /**
     * 旋转动画
     */
    const rotateAnimation = useEvent(() => {
        cancelRAF();

        rotateRuntime.current.rAFIndex = requestAnimationFrame(() => {
            nextRotateFrame()

            setRotateStyle({
                transform: `rotateY(${rotateRuntime.current.rotateY}deg)`
            })

            rotateAnimation()
        })
    })

    /**
     * 创建 旋转暂停动画
     */
    const createRotateEnding = useEvent(() => {
        let { speed } = rotateRuntime.current
        const { decaySpeed } = rotateRuntime.current

        cancelRAF();

        const rotateEnding = () => {
            speed -= decaySpeed

            rotateRuntime.current.rAFIndex = requestAnimationFrame(() => {
                nextRotateFrame(speed)

                setRotateStyle({
                    transform: `rotateY(${rotateRuntime.current.rotateY}deg)`
                })
    
                if (speed > 0) {
                    rotateEnding()
                }
            })
        }
        
        return rotateEnding
    })

    /**
     * 暂停动画
     */
    const cancelRotateAnimation = useEvent(() => {
        const rotateEnding = createRotateEnding();
        rotateEnding();
    })

    useEffect(() => {
        if (rotateStatus === RotateStatus.paused) {
            return;
        }

        rotateAnimation()

        return () => cancelRotateAnimation()
    }, [rotateStatus])
 
    return { rotateStyle, rotateRuntime, setRotateStatus, rotateController };
}