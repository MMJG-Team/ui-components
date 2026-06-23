/**
 * 延迟执行
 * @param ms 
 * @returns 
 */
export const delay = (ms: number) => {
    let timer: NodeJS.Timeout;
    let reject: (reason?: any) => void;

    const promise = new Promise((resolve, rej) => {
        timer = setTimeout(resolve, ms)
        reject = rej
    })

    return {
        promise,
        cancel: () => {
            clearTimeout(timer)
            reject()
        }
    }
}

/**
 * 模拟异步流式分片
 * @param content 
 * @param options 
 */
export const mockAsyncChunk = (
    content: string,
    options: {
        chunkSize?: number,
        delayMs?: number,
        onChunk: (current: string, chunk: string) => void,
        onComplete?: (final: string) => void,
    }
) => {
    const { chunkSize = 1, delayMs = 5, onChunk, onComplete } = options


    let temp = '';
    let canceled = false;

    (async () => {
        for (let i = 0; i < content.length; i += chunkSize) {
            const chunk = content.slice(i, i + chunkSize)
            temp += chunk
            onChunk(temp, chunk)
            await delay(delayMs).promise;

            if (canceled) {
                break;
            }
        }
        onComplete?.(content)
    })()

    return () => {
        canceled = true;
    }
}
