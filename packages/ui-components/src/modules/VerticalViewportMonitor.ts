import { throttle } from 'lodash-es';

// 定义回调函数类型
export type ViewportCallback = (element: HTMLElement, direction?: 'up' | 'down') => void;

// 纵向视口监控器配置选项
export interface VerticalViewportMonitorOptions {
    root?: HTMLElement;
    onEnter?: ViewportCallback;
    onLeave?: ViewportCallback;
    throttleDelay?: number;
}

// 纵向视口监控器：支持多个元素，仅判断垂直方向可见性
export class VerticalViewportMonitor {
    private elements: HTMLElement[];
    private visibleStatus: Map<HTMLElement, boolean>;
    private options: Required<VerticalViewportMonitorOptions>;
    private handleScroll: (...args: any[]) => void;

    constructor(
        elements: HTMLElement | HTMLElement[],
        options: VerticalViewportMonitorOptions = {}
    ) {
        // 确保elements是一个数组
        this.elements = Array.isArray(elements) ? elements : [elements];

        // 初始化配置选项，添加默认值
        this.options = {
            root: document.body,
            onEnter: () => { },
            onLeave: () => { },
            throttleDelay: 100,
            ...options
        };

        // 存储每个元素的可见状态
        this.visibleStatus = new Map();
        this.elements.forEach(el => {
            this.visibleStatus.set(el, false);
        });

        // 绑定节流处理函数
        this.handleScroll = throttle(() => {
            this.checkVisibility();
        }, this.options.throttleDelay);

        // 初始检查
        this.checkVisibility();

        const root = this.options.root;

        // 绑定事件监听
        root.addEventListener('scroll', this.handleScroll);
        root.addEventListener('resize', this.handleScroll);
    }

    // 检查所有元素的纵向可见性
    private checkVisibility(): void {
        const root = this.options.root;
        const viewportHeight = root.clientHeight;

        const rootRect = root.getBoundingClientRect();

        this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();

            const top = rect.top - rootRect.top;
            // 仅判断垂直方向：元素是否有垂直方向的部分在视口内
            // 元素顶部 <= 视口底部 且 元素底部 >= 视口顶部
            const isVisibleNow = top <= viewportHeight && rect.bottom >= rootRect.top;
            const isVisible = this.visibleStatus.get(element) || false;

            // 状态变化时触发回调
            if (isVisibleNow && !isVisible) {
                this.options.onEnter(element);
                this.visibleStatus.set(element, true);
            } else if (!isVisibleNow && isVisible) {
                const direction = top > viewportHeight ? 'up' : 'down';
                this.options.onLeave(element, direction);

                this.visibleStatus.set(element, false);
            }
        });
    }

    // 添加新元素到监控列表
    addElement(element: HTMLElement): void {
        if (!this.visibleStatus.has(element)) {
            this.elements.push(element);
            this.visibleStatus.set(element, false);
            this.checkVisibility(); // 立即检查一次新元素
        }
    }

    // 从监控列表移除元素
    removeElement(element: HTMLElement): void {
        const index = this.elements.indexOf(element);
        if (index !== -1) {
            this.elements.splice(index, 1);
            this.visibleStatus.delete(element);
        }
    }

    // 获取当前所有可见元素
    getVisibleElements(): HTMLElement[] {
        return Array.from(this.visibleStatus.entries())
            .filter(([_, isVisible]) => isVisible)
            .map(([element]) => element);
    }

    // 停止监控，清理事件监听
    destroy(): void {
        const root = this.options.root;
        root.removeEventListener('scroll', this.handleScroll);
        root.removeEventListener('resize', this.handleScroll);
        this.elements = [];
        this.visibleStatus.clear();
    }
}

export default VerticalViewportMonitor