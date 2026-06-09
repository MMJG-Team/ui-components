export type BaseItem = {
    id: string | number
    naturalWidth: number
    naturalHeight: number
}

export type ItemLayout<Item extends BaseItem> = Item & {
    columnIndex: number
    top: number
    // 图片高度
    height: number
    // 盒子高度 = 图片高度 + 附加高度
    boxHeight: number
    // 是否不渲染
    hidden?: boolean
}

export type MasonryLayoutOptions<Item extends BaseItem> = {
    columnCount: number
    gap: number
    padding: {
        top?: number
        bottom?: number
        left?: number
        right?: number
    }
    items: Item[]
    // 项最小高度限制，默认不限制
    minItemHeight?: number
    // item 附加的额外高度
    itemPayloadHeight?: number
    // 可见区域，[start, end] 表示可见区域的纵向坐标
    viewRange?: [number, number]
}

// 定义一个极小值，用于判断两个浮点数是否近似相等
const EPSILON = 0.00000001;
/**
 * 找到最短的列索引
 * @param columnsHeights 列高数组
 * @returns 最短列的索引
 */
function findShortestColumn(columnsHeights: number[]) {
    let minHeight = Infinity;
    let shortestColumnIndex = 0;

    for (let i = 0; i < columnsHeights.length; i++) {
        const currentHeight = columnsHeights[i];

        // 如果当前列高比已知最小值小很多, 则更新最小值和最短列索引
        if (currentHeight < minHeight - EPSILON) {
            minHeight = currentHeight;
            shortestColumnIndex = i;
        }
        // 如果当前列高与已知最小值非常接近（在误差范围内）
        else if (Math.abs(currentHeight - minHeight) <= EPSILON) {
            // 这里进行平局打破策略，选择索引较小的列
            if (i < shortestColumnIndex) {
                shortestColumnIndex = i;
            }
        }
    }

    return shortestColumnIndex;
}

/**
 * 瀑布流布局
 */
export default class MasonryLayout<Item extends BaseItem> {
    /**
     * 容器元素
     */
    private container: HTMLElement | null = null
    /**
     * 列数
     */
    private columnCount: number = 0;
    /**
     * 间距
     */
    private gap: number = 0;
    /**
     * 内边距
     */
    private padding: {
        top: number
        bottom: number
        left: number
        right: number
    } = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }
    /**
     * 列总高度
     */
    private columnHeights: number[] = [];
    /**
     * items
     */
    private items: Item[] = []
    /**
     * item 布局数组
     */
    private itemsLayout: ItemLayout<Item>[][] = []
    /**
     * 项最小高度限制，默认不限制
     */
    private minItemHeight?: number = 0
    /**
     * item 附加的额外高度
     */
    private itemPayloadHeight: number = 0
    /**
     * 可见区域，[start, end] 表示可见区域的纵向坐标范围
     */
    private viewRange?: [number, number]
    /**
     * 可见区域内的 items
     */
    private viewableItemsLayout: ItemLayout<Item>[][] = []

    get columnWidth() {
        if (!this.container) {
            return 0
        }

        // 计算每列宽度，考虑间距
        const totalGap = (this.columnCount - 1) * this.gap
        const totalPadding = this.padding.left + this.padding.right
        return (this.container.clientWidth - totalGap - totalPadding) / this.columnCount
    }

    constructor(container: HTMLElement, options: MasonryLayoutOptions<Item>) {
        this.container = container
        this.columnCount = options.columnCount
        this.gap = options.gap
        this.padding = Object.assign(this.padding, options.padding)
        this.minItemHeight = options.minItemHeight ?? 0
        this.itemPayloadHeight = options.itemPayloadHeight ?? 0

        this.items = options.items
        this.viewRange = options.viewRange
    }

    /**
     * 计算 item 高度
     * @param item 
     * @returns 
     */
    private calcItemHeight(item: Item) {
        if (!this.container) {
            return 0
        }

        const height = item.naturalHeight / item.naturalWidth * this.columnWidth

        // 如果设置了项最小高度限制，且计算出的高度低于限制，则返回限制值
        if (this.minItemHeight && height < this.minItemHeight) {
            return this.minItemHeight
        }

        return height
    }

    /**
     * 将 items 添加到布局中
     * @param items 
     */
    private addItemsToLayout(items: Item[]) {
        items.forEach((item, index) => {
            const height = this.calcItemHeight(item)
            const boxHeight = height + this.itemPayloadHeight

            // push 到当前 columnHeights 高度值最小的列
            const minHeightColumnIndex = findShortestColumn(this.columnHeights)

            // 获取当前位置的 top 值
            const top = this.columnHeights[minHeightColumnIndex]

            this.itemsLayout[minHeightColumnIndex].push({
                ...item,
                columnIndex: minHeightColumnIndex,
                top,
                height,
                boxHeight,
            })

            // 更新当前列的高度
            this.columnHeights[minHeightColumnIndex] = top + boxHeight + this.gap
        })
    }

    /**
     * 获取 items 布局
     * @returns 
     */
    public getItemsLayout() {
        return this.itemsLayout
    }

    /**
     * 获取可见区域内的 items 布局
     * @returns 
     */
    public getViewableItemsLayout() {
        return this.viewableItemsLayout
    }

    /**
     * 获取列高度
     * @param index 
     * @returns 
     */
    public getColumnHeight(index: number) {
        return this.columnHeights[index] ?? 0
    }

    /**
     * 判断是否需要重新布局
     * @param key 
     * @returns 
     */
    public shouldReLayoutOptionKey(key: keyof MasonryLayoutOptions<Item>) {
        return ['columnCount', 'gap', 'items'].includes(key)
    }

    /**
     * 判断是否需要重新计算可见区域
     * @param key 
     * @returns 
     */
    public shouldReCalcViewAreaOptionKey(key: keyof MasonryLayoutOptions<Item>) {
        return ['viewRange'].includes(key)
    }

    /**
     * 设置选项
     * @param options 
     */
    public setOptions(options: Partial<MasonryLayoutOptions<Item>>) {
        let reLayout = false;
        let reCalcViewArea = false;

        // 遍历 options 中的每个属性，判断是否与当前值不同
        (Object.keys(options) as (keyof MasonryLayoutOptions<Item>)[]).forEach((key) => {
            if (options[key] !== this[key]) {
                this[key] = options[key] as any

                if (this.shouldReLayoutOptionKey(key)) {
                    reLayout = true
                }
                if (this.shouldReCalcViewAreaOptionKey(key)) {
                    reCalcViewArea = true
                }
            }
        })

        if (reLayout) {
            this.reLayout()
            return;
        }

        if (reCalcViewArea) {
            this.reCalcViewArea()
        }
    }

    /**
     * 添加 items
     * @param items 
     */
    public addItems(items: Item[]) {
        this.items.push(...items)

        this.addItemsToLayout(items)
    }

    /**
     * 全量刷新布局
     */
    public reLayout() {
        if (!this.container || !this.columnCount) {
            return
        }

        console.time('[reLayout use time]')
        console.log('[reLayout]', this.columnCount, this.items.length)

        this.itemsLayout = new Array(this.columnCount).fill(0).map(() => [])
        this.columnHeights = new Array(this.columnCount).fill(0)

        this.addItemsToLayout(this.items)
        this.reCalcViewArea()

        console.timeEnd('[reLayout use time]')
    }

    /**
     * 重新计算可见区域
     * @param range 
     */
    public reCalcViewArea() {
        if (!this.container || !this.columnCount) {
            return
        }

        const viewRange = this.viewRange ?? [0, Infinity]
        console.log('[reCalcViewArea]', viewRange)

        const [start, end] = viewRange

        // 收集可见区域内的元素
        this.viewableItemsLayout = new Array(this.columnCount).fill(0).map(() => [])

        /**
         * 遍历 itemsLayout，判断每个元素的 矩形 是否在可见区域 viewRange 内
         * 不在可见区域内的元素，将其 hidden 设置为 true
         * 在可见区域内的元素，将其 hidden 设置为 false
         */
        this.itemsLayout.forEach((column, columnIndex) => {
            const viewableItems = this.viewableItemsLayout[columnIndex]

            column.forEach((item) => {
                // 元素的底部位置
                const bottom = item.top + item.height

                const shouldHide = bottom < start || item.top > end
                item.hidden = shouldHide

                if (!shouldHide) {
                    viewableItems.push(item)
                }
            })
        })
    }

    public dispose() {
        this.container = null
        this.itemsLayout = []
        this.columnHeights = []
    }
}