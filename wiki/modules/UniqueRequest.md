# UniqueRequest

UniqueRequest（唯一请求管理器）是 `@mmjg/ui-components` 提供的一个框架无关的纯 TypeScript 类，用于解决异步请求的**竞态问题**。当连续发起多次请求时，它会自动取消上一次尚未完成的请求，并保证只有最新一次请求的结果会被正常返回，旧请求的结果会被丢弃并以错误形式拒绝。

## 简介

- 基于 `class` 实现，不依赖 React，可在任意 TS/JS 环境复用。
- 基于 axios 的 `AbortController` / `AbortSignal` 机制实现请求取消。
- 通过自增的 `requestId` 标识每次请求，仅当当前请求 ID 与最新 ID 一致时才返回结果，从而丢弃过时响应。
- 暴露 `isLoading` 只读属性查询加载状态，`cancel()` 用于手动中止。
- 同时提供具名导出与默认导出。

## 源码位置

[UniqueRequest.ts](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/src/modules/UniqueRequest.ts)

## 类型定义

```ts
import { AxiosError, type AxiosRequestConfig } from "axios";

export const ABORT_ERROR_MESSAGE = AxiosError.ERR_CANCELED

export const isAbortError = (error: any) => error.message === ABORT_ERROR_MESSAGE

export class UniqueRequest {
    private abortController: AbortController | null = null;
    private requestId: number = 0;
    private loading: boolean = false;

    async request<P, C extends AxiosRequestConfig, R>(
        api: (params: P, config?: C) => Promise<R>,
        params: P,
        config?: C
    ): Promise<R>

    get isLoading(): boolean

    cancel(): void
}

export default UniqueRequest
```

## 实现原理

### 取消标识

模块导出常量 `ABORT_ERROR_MESSAGE = AxiosError.ERR_CANCELED`（即字符串 `'ERR_CANCELED'`），作为统一的中止错误标识。辅助函数 `isAbortError(error)` 通过比较 `error.message === ABORT_ERROR_MESSAGE` 判断一个错误是否为取消错误。

### request 流程

`request()` 是核心方法，其执行步骤如下：

1. **生成请求 ID**：先 `++this.requestId` 得到本次请求的 `currentRequestId`，用于后续判断是否仍为最新请求。
2. **取消上一次请求**：若 `this.abortController` 不为空，调用其 `abort(ABORT_ERROR_MESSAGE)` 中止上一次请求，触发其 `signal` 上的取消。
3. **创建新的 AbortController**：实例化新的 `AbortController` 赋值给 `this.abortController`，并将 `loading` 置为 `true`。
4. **合并 signal**：将传入的 `config` 与 `signal: this.abortController.signal` 合并，得到 `configWithSignal`，再调用 `api(params, configWithSignal)` 发起请求。
5. **结果校验**：请求成功后，比较 `currentRequestId === this.requestId`：
   - 相等则说明仍是最新请求，正常 `return result`；
   - 不等则说明已被更新的请求取代，抛出 `new Error(ABORT_ERROR_MESSAGE)`。
6. **异常处理**：在 `catch` 中，若错误是取消错误（`error.code === AxiosError.ERR_CANCELED` 或 `error.message === ABORT_ERROR_MESSAGE`），统一抛出 `new Error(ABORT_ERROR_MESSAGE)`；否则原样 `throw error`。
7. **状态复位**：`finally` 中，仅当 `currentRequestId === this.requestId`（即本次为最新请求）时，才将 `loading` 置为 `false` 并将 `abortController` 置为 `null`，避免旧请求覆盖新请求的状态。

### isLoading 与 cancel

- `isLoading` 是只读 getter，返回内部 `loading` 字段。
- `cancel()` 主动中止当前请求：若存在 `abortController` 则调用 `abort(ABORT_ERROR_MESSAGE)` 并置空，最后将 `loading` 复位为 `false`。

### 竞态解决机制

通过「自增 ID + AbortController」双重保障：AbortController 负责在网络层中止旧请求；requestId 负责在应用层丢弃旧响应。即便旧请求因某种原因未被真正中止而仍返回，也会因 ID 不匹配而被拒绝，从而保证只有最新结果生效。

## API 参考

| 方法 / 属性 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `request(api, params, config?)` | 执行最新请求，自动取消之前的请求 | `api: (params: P, config?: C) => Promise<R>`；`params: P`；`config?: C`（axios 请求配置） | `Promise<R>` —— 最新请求的结果；旧请求/被取消请求会 reject `Error(ABORT_ERROR_MESSAGE)` |
| `isLoading`（getter） | 查询当前是否处于加载中 | 无 | `boolean` |
| `cancel()` | 手动取消当前请求并复位加载状态 | 无 | `void` |
| `ABORT_ERROR_MESSAGE`（导出常量） | 取消错误标识，值为 `AxiosError.ERR_CANCELED` | —— | `string` |
| `isAbortError(error)`（导出函数） | 判断错误是否为取消错误 | `error: any` | `boolean` |

## 使用示例

```ts
import { UniqueRequest, ABORT_ERROR_MESSAGE, isAbortError } from '@mmjg/ui-components'
import axios from 'axios'

// 假设有一个支持 signal 的 API 函数
type User = { id: number; name: string }
const fetchUser = (params: { id: number }, config?: AxiosRequestConfig) =>
  axios.get<User>(`/api/user/${params.id}`, config).then(res => res.data)

const unique = new UniqueRequest()

// 模拟用户快速连续输入，触发多次请求
async function onSearchChange(id: number) {
  try {
    const user = await unique.request(fetchUser, { id })
    console.log('最新结果：', user)
  } catch (error: any) {
    if (isAbortError(error) || error.message === ABORT_ERROR_MESSAGE) {
      console.log('该请求已被新请求取代或手动取消，忽略结果')
      return
    }
    throw error // 非取消错误，继续抛出
  }
}

// 手动取消
// unique.cancel()
```

## 注意事项

- **依赖 axios**：本模块从 axios 导入 `AxiosError` 与 `AxiosRequestConfig`，`ABORT_ERROR_MESSAGE` 取自 `AxiosError.ERR_CANCELED`。`api` 函数需支持将 `signal` 透传给 axios（即接收并使用 `config`），否则取消无法真正生效。
- **取消错误的识别**：源码 `catch` 块同时检查 `error.code === AxiosError.ERR_CANCELED` 与 `error.message === ABORT_ERROR_MESSAGE` 两种情况。调用方判断取消错误时应使用导出的 `isAbortError(error)`（基于 message）或同时检查 code。
- **旧请求结果被丢弃**：当 `currentRequestId !== this.requestId` 时，即便请求成功也会被抛出 `Error(ABORT_ERROR_MESSAGE)`，调用方需在 `catch` 中识别并静默处理。
- **loading 由最新请求复位**：`finally` 仅在本次为最新请求时才复位 `loading` 与 `abortController`，因此 `isLoading` 反映的是「最新请求」的加载状态，而非任意一次请求的状态。
- **cancel 不区分新旧**：`cancel()` 直接作用于当前 `abortController`，并立即将 `loading` 置为 `false`；若在最新请求之后立即调用，最新请求也会被中止。
- **AbortController 复用**：每次 `request` 都会新建 `AbortController`，不会跨请求复用同一实例。

---

← [SyncTaskQueue](./SyncTaskQueue.md) · → [VerticalViewportMonitor](./VerticalViewportMonitor.md)
