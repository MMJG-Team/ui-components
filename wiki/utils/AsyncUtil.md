# AsyncUtil

AsyncUtil 是 `@mmjg/ui-components` 的工具集（utils）中提供的一组异步辅助函数。它通过命名空间（namespace）方式导出，包含「可取消的延迟」与「模拟流式分片输出」两个函数，常用于需要在浏览器/Node 中精确控制异步时序、或模拟大语言模型（LLM）逐字流式输出的场景。

## 简介

- 框架无关的纯 TypeScript 函数，不依赖 React。
- 以**命名空间**形式导出：在 `src/utils/index.ts` 中通过 `export * as AsyncUtil from './AsyncUtil'` 聚合，因此调用形如 `AsyncUtil.delay(ms)`、`AsyncUtil.mockAsyncChunk(...)`。
- `delay(ms)` 返回一个「带 `cancel` 的 Promise」，可在 resolved 之前随时取消并 reject。
- `mockAsyncChunk(content, options)` 将一段文本按 `chunkSize` 分片逐段输出，模拟流式/分块异步输出，返回一个取消函数。

## 源码位置

[AsyncUtil.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/utils/AsyncUtil.ts)

## 函数清单

| 函数 | 说明 | 返回值 |
| --- | --- | --- |
| `delay(ms)` | 创建一个可在超时前取消的延迟 Promise | `{ promise: Promise<void>, cancel: () => void }` |
| `mockAsyncChunk(content, options)` | 按固定分片大小逐段模拟异步流式输出 | `() => void`（取消函数） |

## delay

### 签名

```ts
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
```

### 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `ms` | `number` | 延迟的毫秒数，到达后 Promise resolve |

### 返回值

`{ promise: Promise<void>; cancel: () => void }`

- `promise`：在 `ms` 毫秒后 resolve 的 Promise。
- `cancel()`：清除底层 `setTimeout` 并调用 `reject()` 使 Promise 立即变为 rejected 状态。

### 原理

函数在 Promise 构造器外部用 `let` 声明了 `timer` 与 `reject` 两个变量，随后在 `new Promise` 的执行器（executor）内部对它们赋值：

```ts
let timer: NodeJS.Timeout;
let reject: (reason?: any) => void;

const promise = new Promise((resolve, rej) => {
    timer = setTimeout(resolve, ms)
    reject = rej
})
```

由于 **Promise 的执行器是同步执行**的——`new Promise(executor)` 会在构造过程中立即调用 `executor`，因此 `timer` 与 `reject` 在 `new Promise(...)` 返回之前就已被赋值。返回的对象所引用的 `cancel` 闭包能够安全地访问这两个变量，调用 `clearTimeout(timer)` 取消定时器，并调用 `reject()` 使 Promise 进入 rejected 状态。这是该函数得以正常工作的关键原因。

## mockAsyncChunk

### 签名

```ts
export const mockAsyncChunk = (
    content: string,
    options: {
        chunkSize?: number,
        delayMs?: number,
        onChunk: (current: string, chunk: string) => void,
        onComplete?: (final: string) => void,
    }
) => () => void
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | `string` | —— | 待分片输出的完整文本 |
| `options.chunkSize` | `number` | `1` | 每个分片的字符长度 |
| `options.delayMs` | `number` | `5` | 每个分片之间的延迟毫秒数 |
| `options.onChunk` | `(current: string, chunk: string) => void` | —— | 每输出一个分片时触发；`current` 为截至当前的累计字符串，`chunk` 为本次新增的分片 |
| `options.onComplete` | `(final: string) => void` | —— | 全部分片输出完成时触发，`final` 为原始的完整 `content` |

### 返回值

`() => void`：一个取消函数，调用后会将内部 `canceled` 标志置为 `true`，使循环在下一次检查时 `break`。

### 原理

函数内部维护两个局部变量：`temp`（累计字符串，初始为 `''`）与 `canceled`（取消标志，初始为 `false`）。随后立即启动一个异步立即执行函数（IIFE）：

```ts
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
```

1. **分片迭代**：以 `chunkSize` 为步长遍历 `content`，每次用 `content.slice(i, i + chunkSize)` 取出当前分片。
2. **累计与回调**：将分片追加到 `temp`，调用 `onChunk(temp, chunk)`，把「截至当前的累计内容」与「本次分片」一并传出。
3. **节拍延迟**：每个分片后 `await delay(delayMs).promise`，用 `delay` 制造可被取消的固定间隔。
4. **取消检查**：每次 `await` 之后检查 `canceled`，若已被置位则 `break` 跳出循环。
5. **完成回调**：循环结束（无论是否被取消）后调用 `onComplete?.(content)`，传入**原始完整文本** `content` 而非累计的 `temp`。

返回的取消函数仅将 `canceled` 置为 `true`：

```ts
return () => {
    canceled = true;
}
```

需要注意：取消是「协作式」的——它不会中断正在 `await` 的 `delay`，而是在下一次循环检查时生效；并且即便取消，`onComplete` 仍会被调用。

## 使用示例

```ts
import { AsyncUtil } from '@mmjg/ui-components'

// 1) 可取消的延迟
const t = AsyncUtil.delay(1000)
t.promise.then(() => console.log('1 秒后触发'))
// 在超时前取消，promise 将 reject
// t.cancel()

// 2) 模拟流式分片输出（类似 LLM 逐字输出）
const cancel = AsyncUtil.mockAsyncChunk('Hello, 世界！', {
  chunkSize: 2,
  delayMs: 30,
  onChunk: (current, chunk) => {
    process.stdout.write(chunk)
  },
  onComplete: (final) => {
    console.log('\n流式输出完成，完整内容长度：', final.length)
  },
})

// 需要中止时调用
// cancel()
```

## 注意事项

- **命名空间调用**：本工具以 `export * as AsyncUtil` 命名空间导出，调用须写作 `AsyncUtil.delay(ms)` 与 `AsyncUtil.mockAsyncChunk(...)`，而非直接 `delay(...)`（除非从 `'@mmjg/ui-components/utils/AsyncUtil'` 子路径单独导入 `delay` / `mockAsyncChunk`）。
- **delay 的 reject 无原因**：`cancel()` 调用 `reject()` 时不传参，因此 reject 的值为 `undefined`；使用 `.catch` 或 `try/await` 捕获时需注意 error 为 `undefined`。
- **变量先声明后赋值的安全性**：`delay` 中 `timer`、`reject` 在 Promise 执行器内赋值，依赖执行器同步执行这一特性；切勿尝试将 `cancel` 在 `new Promise(...)` 之前同步调用（实际场景下也不会发生，因为对象尚未返回）。
- **NodeJS.Timeout 类型**：`timer` 标注为 `NodeJS.Timeout`，在浏览器环境下 `setTimeout` 返回 `number`；该类型在浏览器中可能需配合 `global.d.ts` 的类型声明，否则 TS 可能报类型不兼容。
- **取消是协作式的**：`mockAsyncChunk` 的 `cancel` 不会立即终止 `await delay(...)`，而是在下一次循环迭代检查 `canceled` 时 `break`，存在最多一个 `delayMs` 的延迟。
- **onComplete 仍会被调用**：即使循环因取消而 `break`，`onComplete?.(content)` 仍会执行；若需区分「正常完成」与「被取消」，调用方需自行维护状态，或在使用取消函数后忽略 `onComplete`。
- **onComplete 传入原始 content**：`onComplete` 收到的是原始 `content`（完整文本），而非累计的 `temp`；若取消时未输出完，`final` 仍是完整文本。
- **chunkSize 不做边界校验**：`chunkSize` 应为正整数；若传入 0 或负数会导致死循环（`i` 永不增长），调用方需自行保证合法性。

---

← [首页](../Home.md)
