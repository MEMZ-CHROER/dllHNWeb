---
title: C# 性能优化与最佳实践
---

# C# 性能优化与最佳实践

> 大多数时候"写得对"比"写得快"重要，但理解 C# 的底层行为能帮你避开那些**想当然的坑**。本篇讲最常见的性能陷阱和优化姿势。

## 1. 值类型 vs 引用类型

```csharp
struct Point { public int X, Y; }    // 值类型（struct）：存在栈上/内联
class PointClass { public int X, Y; } // 引用类型（class）：对象在堆上，变量是引用

var p1 = new Point();        // 值：拷贝 p1，互不影响
var p2 = p1; p2.X = 100;     // p1.X 还是 0

var c1 = new PointClass();   // 引用：c1/c2 指向同一个对象
var c2 = c1; c2.X = 100;     // c1.X 也是 100
```

**场景选择**：
- 小、不可变、频繁创建的数据（坐标/ID/小结构）→ `struct`（避免堆分配）
- 大对象、需要共享引用、会被放入集合经常变 → `class`

**`struct` 的坑**：装箱（见下）、复制开销（大 struct 拷贝贵）、集合里修改要用 `ref`。

## 2. 装箱与拆箱（Boxing）

值类型转 `object`/接口时会在堆上"装箱"（分配对象），频繁发生是性能杀手：

```csharp
int i = 42;
object o = i;        // 装箱：堆上分配
int j = (int)o;      // 拆箱

// ❌ 集合里的值类型会装箱（旧 API）
ArrayList list = new ArrayList();
list.Add(42);        // int → object 装箱

// ✅ 用泛型集合，零装箱
List<int> list2 = new List<int>();
list2.Add(42);       // 无装箱
```

**优化**：用泛型集合（`List<T>`）替代非泛型（`ArrayList`）；避免频繁的 `object` 转换。

## 3. 减少垃圾回收压力（GC）

GC 是自动的，但**分配越少，GC 越轻松**，程序越平滑：

```csharp
// ❌ 每次调用创建新对象（热路径上）
string Build(int n) => n.ToString() + " items";

// ✅ 复用缓冲区
var sb = new StringBuilder(32);
void Build(int n) { sb.Clear(); sb.Append(n); sb.Append(" items"); }

// ❌ 闭包/匿名对象在热循环里会分配
for (int i = 0; i < 1_000_000; i++)
    items.Select(x => x * i);   // 每次迭代可能分配

// 大数组复用
ArrayPool<byte>.Shared.Return(buf);   // 归还大数组给池子复用
var buf = ArrayPool<byte>.Shared.Rent(1024);
```

**判断**：写高频代码时，问"这一行会不会分配对象？"。用 `dotnet-trace`/Profiler 看分配热点。

## 4. 字符串优化的正确姿势

（详见[字符串与文本处理](/programming/csharp/strings/)）

- 拼接用 `StringBuilder`
- 用 `string.Concat`/插值替代 `+`（编译器已优化常量拼接）
- 比较忽略大小写用 `StringComparison.OrdinalIgnoreCase`，别 `.ToLower()`
- 正则高频用 `RegexOptions.Compiled` + 复用实例

## 5. Span&lt;T&gt; 与内存片段（进阶）

`Span<T>` 是"内存的视图"，零拷贝切片、零分配：

```csharp
string csv = "a,b,c,d";
ReadOnlySpan<char> span = csv;
var parts = span.Split(',');
// Span 操作不会分配新字符串

// 只读子串
ReadOnlySpan<char> first = csv.AsSpan(0, 3);   // "a,b"
```

适合解析协议、日志处理等高性能场景。

## 6. 常见优化清单（按性价比）

| 优化 | 难度 | 收益 |
|---|---|---|
| 泛型集合替代非泛型 | 低 | 高（消灭装箱） |
| `StringBuilder` 替代循环拼接 | 低 | 高 |
| 避免热循环分配对象 | 中 | 高 |
| `struct` 用于小值类型 | 中 | 中 |
| `AsParallel`/并行 | 中 | 视场景 |
| `ArrayPool` 复用大数组 | 中 | 中 |
| `Span<T>` 零拷贝解析 | 高 | 特定场景 |

## 7. 度量优先，别瞎优化

```csharp
// 用 Stopwatch 先测，再决定要不要优化
var sw = System.Diagnostics.Stopwatch.StartNew();
DoWork();
sw.Stop();
Console.WriteLine($"耗时: {sw.ElapsedMilliseconds} ms");
```

**原则**：先写对 → 用 Profile（`dotnet-trace`/VS 性能探查器）找热点 → 只优化热点 → 别优化"感觉慢"但实际不是瓶颈的代码。

## 要点速记

- 值类型 vs 引用：小的/频繁创建的用 `struct`，共享的用 `class`
- 泛型集合消灭装箱；`StringBuilder` 消灭拼接垃圾
- GC 压力来自"分配"——减少分配就是优化 GC
- `Span<T>` 零拷贝是进阶利器
- **先度量再优化**，只动热点
