---
title: C# 异步与并发编程
---

# C# 异步与并发编程

> `async/await` 让异步代码写得像同步一样直白。核心思想：**遇到耗时操作，先交出控制权，别阻塞线程；完成后回来继续。**

## 1. async / await 基础

```csharp
// 模拟耗时操作（IO/网络/数据库）
static async Task<string> FetchDataAsync(string url)
{
    await Task.Delay(1000);              // 模拟网络延迟（不阻塞线程）
    return $"来自 {url} 的数据";
}

static async Task Main()
{
    Console.WriteLine("开始");
    string result = await FetchDataAsync("https://example.com");  // 等，但没阻塞线程
    Console.WriteLine(result);
}
```

规则：
- 方法标记 `async`，返回 `Task`（无值）或 `Task<T>`（有值）
- 用 `await` 等一个 Task 完成，语法上像同步，但**线程不阻塞**（执行权让给调用者）
- **永远不要用 `async void`**（除了事件处理器）——异常无法捕获，会崩

## 2. Task 与 `Task<T>`

```csharp
Task t = Task.Run(() => DoWork());        // 放到线程池执行
Task<int> t2 = Task.Run(() => Compute()); // 返回结果

int result = await t2;                    // 拿结果
t.Wait();                                 // 同步等待（可能死锁，少用）
await Task.WhenAll(t, t2);                // 等所有完成
var first = await Task.WhenAny(t, t2);    // 等最先完成的
```

**并行发起多个任务**：

```csharp
var tasks = Enumerable.Range(0, 5).Select(async i =>
{
    await Task.Delay(100 * i);
    return i * i;
});
int[] results = await Task.WhenAll(tasks);   // [0, 1, 4, 9, 16]
```

## 3. 同步上下文与 ConfigureAwait（库作者要懂）

在 UI 程序里，`await` 之后默认回到 UI 线程（同步上下文）。

```csharp
// 库代码里（不是 UI 程序），避免不必要的上下文切换：
var data = await httpClient.GetStringAsync(url).ConfigureAwait(false);
```

- 库/后端代码：`ConfigureAwait(false)` 提升性能、防死锁
- UI 代码：不写（需要回 UI 线程改控件）

## 4. 并行处理（Parallel 类）

计算密集型、CPU 并行：

```csharp
var items = Enumerable.Range(1, 10000).ToArray();

Parallel.ForEach(items, item =>
{
    // 每个 item 可能在不同线程跑
    var sq = item * item;
});

// 或者并行 LINQ
var result = items.AsParallel().Where(x => x % 2 == 0).ToArray();
```

注意：`Parallel.ForEach` 里别写会修改共享状态的操作（需要锁或改用函数式）。

## 5. 常见坑与最佳实践

| 坑 | 说明 / 解法 |
|---|---|
| **`async void`** | 异常抓不到 → 用 `async Task`（事件处理除外） |
| **同步等待死锁** | UI 线程 `.Wait()/.Result` 等 async → 用 `await` 到底 |
| **忘 await** | 返回的 Task 被丢弃，异常静默 → 总是 await 或明确处理 |
| **任务阻塞** | 循环里 `.Wait()` → 改 `await Task.WhenAll` |
| **状态共享** | 多个 Task 改同一个 List → 用锁或 `ConcurrentBag` |

```csharp
// 并发安全的集合
using System.Collections.Concurrent;
var bag = new ConcurrentBag<int>();
Parallel.ForEach(Enumerable.Range(1, 1000), i => bag.Add(i * i));
```

## 6. 取消操作（CancellationToken）

```csharp
static async Task LoopAsync(CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        await Task.Delay(100, ct);   // 传入 ct，取消时抛 OperationCanceledException
    }
}

using var cts = new CancellationTokenSource();
cts.CancelAfter(500);                // 0.5 秒后取消
try { await LoopAsync(cts.Token); }
catch (OperationCanceledException) { Console.WriteLine("已取消"); }
```

## 要点速记

- `async` 方法是"声明可等待"，`await` 才是"实际等待"
- 返回 `Task`/`Task<T>`，永不 `async void`
- IO/网络/数据库 用 `async/await`（线程友好）；CPU 密集用 `Parallel`/`AsParallel`
- 批量任务 `Task.WhenAll`；取消用 `CancellationToken`
- 共享状态用并发集合或锁，别裸改
