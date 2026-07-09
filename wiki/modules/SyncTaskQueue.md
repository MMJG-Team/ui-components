# SyncTaskQueue

SyncTaskQueue（同步阻塞队列）是 `@mmjg/ui-components` 提供的一个框架无关的纯 TypeScript 类，用于将多个异步任务按入队顺序**串行执行**。任意时刻最多只有一个任务在运行，后续任务必须等待前一个任务 `resolve` 后才会被取出执行。

## 简介

- 基于 `class` 实现，不依赖 React，可在任意 TS/JS 环境复用。
- 内部使用 [mitt](https://github.com/developit/mitt) 作为事件发射器，在队列全部执行完毕时触发 `completed` 事件。
- 通过 `add()` 入队后自动调用 `run()` 启动消费；`run()` 内部用 `running` 标志保证不会重入。
- 提供 `clear()` 清空队列并复位运行状态，避免残留任务继续执行。
- 同时提供具名导出与默认导出。

## 源码位置

[SyncTaskQueue.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/modules/SyncTaskQueue.ts)

## 类型定义

```ts
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

export class SyncTaskQueue {
    event = mitt<SyncTaskQueueEvents>()
    queue: Task[] = []
    running = false
    add(fn: Task['fn']): void
    async run(): Promise<void>
    clear(): void
}

export default SyncTaskQueue
```

## 实现原理

### 任务封装

每个被加入队列的函数 `fn` 会被包装成一个 `Task` 对象，其中 `id` 通过 `Math.random().toString(36).slice(2)` 生成一个随机字符串，用作任务标识；`fn` 保存原始的异步函数引用。随后该任务被 `push` 到内部 `queue` 数组末尾。

### 自动启动消费

`add()` 在入队后会立即调用 `this.run()`。`run()` 是一个异步方法，其行为如下：

1. **重入保护**：进入方法时先检查 `this.running`，若已有任务正在消费循环中，则直接 `return`，避免并发消费导致乱序。新入队任务会被既有的 `while` 循环自然消费。
2. **串行消费**：置 `running = true` 后进入 `while (this.queue.length > 0)` 循环，每次 `shift()` 取出队首任务并 `await task.fn()`。由于使用 `await`，下一个任务必须等待当前任务完成（resolve 或 reject）才会执行，从而保证串行语义。
3. **完成事件**：无论循环是否抛错，`finally` 块都会将 `running` 置回 `false`，并通过 `this.event.emit(SyncTaskQueueEventType.Completed)` 发射 `completed` 事件，通知外部全部任务已处理完毕。

### 清理

`clear()` 直接将 `queue` 置为空数组并将 `running` 置为 `false`。需要特别注意：`clear()` 仅清空待执行队列并复位标志位，**不会中断当前正在 `await` 的任务**；当前任务执行完毕后，由于 `queue` 已空，`while` 循环会自然结束。

### 事件订阅

外部可通过实例的 `event` 属性（mitt 实例）订阅事件，例如：

```ts
queue.event.on(SyncTaskQueueEventType.Completed, () => { /* ... */ })
```

## API 参考

| 方法 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `add(fn)` | 将异步函数包装为 `Task` 入队，并自动触发消费循环 | `fn: () => Promise<void>` —— 无入参、返回 `Promise<void>` 的异步函数 | `void` |
| `run()` | 启动串行消费循环；若已有循环在运行则直接返回 | 无 | `Promise<void>` |
| `clear()` | 清空队列并将 `running` 复位为 `false` | 无 | `void` |
| `event`（属性） | mitt 事件实例，用于订阅 `completed` 事件 | —— | `mitt<SyncTaskQueueEvents>` |
| `queue`（属性） | 当前待执行任务数组 | —— | `Task[]` |
| `running`（属性） | 是否正在消费循环中 | —— | `boolean` |

## 使用示例

```ts
import { SyncTaskQueue, SyncTaskQueueEventType } from '@mmjg/ui-components'

const queue = new SyncTaskQueue()

// 订阅全部完成事件
queue.event.on(SyncTaskQueueEventType.Completed, () => {
  console.log('所有任务执行完毕')
})

queue.add(async () => {
  console.log('任务 1 开始')
  await fetch('/api/1')
  console.log('任务 1 完成')
})

queue.add(async () => {
  console.log('任务 2 开始')
  await fetch('/api/2')
  console.log('任务 2 完成')
})

// 任务 1 与任务 2 将严格按入队顺序串行执行

// 需要时清空剩余任务
// queue.clear()
```

## 注意事项

- **任务签名约束**：`Task.fn` 必须是 `() => Promise<void>`，即不接受参数且返回 `Promise<void>`。需要传参或返回值的场景应在闭包中自行处理。
- **错误传播**：若某个任务的 `fn` 抛出异常（reject），异常会从 `run()` 的 `await` 处冒泡；由于没有 `try/catch` 包裹 `await`，未捕获的异常会中断当前 `run()` 调用，但 `finally` 仍会复位 `running` 并发射 `completed`。调用方若需容错，应在 `fn` 内部 `try/catch`。
- **clear 不中止在途任务**：`clear()` 不会取消正在执行的任务，仅阻止后续任务运行。
- **重入安全性**：由于 `run()` 在 `running` 为 `true` 时直接返回，连续多次 `add()` 不会产生多个并发消费循环。
- **id 仅供标识**：`Task.id` 由 `Math.random()` 生成，仅作标识用途，不保证全局唯一性，未在内部用于去重或查找。

---

← [模块总览](./README.md) · → [UniqueRequest](./UniqueRequest.md)
