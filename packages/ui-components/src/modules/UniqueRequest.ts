import { AxiosError, type AxiosRequestConfig } from "axios";

export const ABORT_ERROR_MESSAGE = AxiosError.ERR_CANCELED

/**
 * 判断是否为 abort
 * @param error 
 * @returns 
 */
export const isAbortError = (error: any) => error.message === ABORT_ERROR_MESSAGE

/**
 * [竞态问题解决方案]
 * 
 * 唯一请求管理器，用于自动取消之前的请求
 */
export class UniqueRequest {
    private abortController: AbortController | null = null;
    private requestId: number = 0;
    private loading: boolean = false;

    /**
     * 执行最新请求，自动取消之前的请求
     * @param apiFn API 函数，支持 AbortSignal
     * @param params 请求参数
     * @returns Promise<API响应结果>
     */
    async request<P, C extends AxiosRequestConfig, R>(
        api: (params: P, config?: C) => Promise<R>,
        params: P,
        config?: C
    ): Promise<R> {
        // 生成新的请求ID
        const currentRequestId = ++this.requestId;

        // 取消之前的请求
        if (this.abortController) {
            this.abortController.abort(ABORT_ERROR_MESSAGE);
        }

        // 创建新的AbortController
        this.abortController = new AbortController();
        this.loading = true;

        const configWithSignal = {
            ...(config || {}),
            signal: this.abortController.signal,
        } as unknown as C;

        try {
            // 发起请求，传递signal
            const result = await api(params, configWithSignal);

            // 检查是否为最新请求
            if (currentRequestId === this.requestId) {
                return result;
            } else {
                // 不是最新请求，抛出异常
                throw new Error(ABORT_ERROR_MESSAGE);
            }
        } catch (error: any) {
            // 检查是否为取消错误
            if (error.code === AxiosError.ERR_CANCELED || error.message === ABORT_ERROR_MESSAGE) {
                throw new Error(ABORT_ERROR_MESSAGE);
            }
            throw error;
        } finally {
            // 只有在最新请求完成时才更新loading状态
            if (currentRequestId === this.requestId) {
                this.loading = false;
                this.abortController = null;
            }
        }
    }

    /**
     * 获取当前加载状态
     */
    get isLoading(): boolean {
        return this.loading;
    }

    /**
     * 手动取消当前请求
     */
    cancel(): void {
        if (this.abortController) {
            this.abortController.abort(ABORT_ERROR_MESSAGE);
            this.abortController = null;
        }
        this.loading = false;
    }
}