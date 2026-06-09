import type { ImageRecord, SourceImageRecord } from "../types";

/**
 * 加载图片记录选项
 */
export interface LoadRecordsOptions {
    // 是否重置图片记录
    reset?: boolean;
    // 图片宽高比
    aspectRatio?: [number, number] | null;
}



/**
 * 图片模型
 */
export class ImageModel<T extends Record<string, any>> {
    private records: ImageRecord<T>[] = [];

    /**
     * 获取所有图片记录
     * @returns 图片记录数组
     */
    getRecords(): ImageRecord<T>[] {
        return this.records;
    }

    /**
     * 加载图片
     * @param sourceRecords 图片记录
     */
    async loadRecords(
        sourceRecords: SourceImageRecord<T>[],
        options: LoadRecordsOptions = {
            reset: false,
            aspectRatio: null,
        }
    ) {
        const { reset = false, aspectRatio = null } = options;

        if (reset) {
            this.clearRecords();
        }

        const imageRecords = await Promise.all<ImageRecord<T> | null>(sourceRecords.map((record) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = record.src;

                img.onload = () => {
                    if (aspectRatio) {
                        const [widthRatio, heightRatio] = aspectRatio;

                        resolve({
                            ...record,
                            naturalWidth: widthRatio,
                            naturalHeight: heightRatio,
                        });
                    } else {
                        resolve({
                            ...record,
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                        });
                    }
                }

                img.onerror = () => {
                    resolve(null);
                }
            })
        }))

        const validRecords = imageRecords.filter((record) => record !== null);

        this.records.push(...validRecords);
    }

    /**
     * 更新图片记录
     * @param record 图片记录
     */
    updateRecord(record: Partial<ImageRecord<T>>) {
        this.records = this.records.map((item) => {
            if (item.id === record.id) {
                return {
                    ...item,
                    ...record,
                };
            }

            return item;
        })
    }

    /**
     * 移除图片记录
     * @param record 图片记录
     */
    removeRecord(id: number) {
        this.records = this.records.filter((item) => item.id !== id);
    }

    /**
     * 清空所有图片记录
     */
    clearRecords() {
        this.records = [];
    }
}

export default ImageModel;
