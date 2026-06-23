import mitt from "mitt"

export interface Task {
    id: string
    fn: () => Promise<void>
}

// 事件类型
export enum SyncTaskQueueEventType {
    Completed = 'completed'
}

// 事件定义
export type SyncTaskQueueEvents = {
    [SyncTaskQueueEventType.Completed]: void,
}

/**
 * 同步阻塞队列
 */
export class SyncTaskQueue {
    event = mitt<SyncTaskQueueEvents>()

    queue: Task[] = []

    running = false

    add(fn: Task['fn']) {
        const task = {
            id: Math.random().toString(36).slice(2),
            fn,
        }

        this.queue.push(task)

        this.run()
    }

    async run() {
        if (this.running) {
            return
        }

        this.running = true

        try {
            while (this.queue.length > 0) {
                const task = this.queue.shift()
                if (task) {
                    await task.fn()
                }
            }
        } finally {
            this.running = false;
            this.event.emit(SyncTaskQueueEventType.Completed)
        }
    }

    clear() {
        this.queue = []
        this.running = false
    }
}

export default SyncTaskQueue