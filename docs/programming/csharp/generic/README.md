---
title: C# 泛型、委托与事件
---

# C# 泛型、委托与事件

> 泛型让类型成为参数，委托让方法成为参数，事件让"发生的事"能被订阅。三个机制让代码从"重复"走向"通用"。

## 1. 泛型：类型也是参数

```csharp
// 泛型方法：交换任意类型
static void Swap<T>(ref T a, ref T b)
{
    (a, b) = (b, a);
}

// 泛型类：仓库
public class Box<T>
{
    public T Value { get; set; }
}

var box = new Box<int> { Value = 42 };
var sbox = new Box<string> { Value = "hello" };
```

**泛型约束**（限制 T 必须满足什么）：

```csharp
public static T Max<T>(T a, T b) where T : IComparable<T>   // T 必须可比较
    => a.CompareTo(b) >= 0 ? a : b;

public class Repository<T> where T : class, new()   // T: 引用类型 + 有无参构造
{
    public T Create() => new();
}
```

常用约束：`where T : class`（引用类型）、`struct`（值类型）、`IComparable<T>`、`new()`（无参构造）。

## 2. 委托：方法当参数传

```csharp
// 声明一个委托类型（指向方法的"签名"）
public delegate int Calculator(int x, int y);

static int Add(int a, int b) => a + b;

Calculator calc = Add;          // 委托指向方法
Console.WriteLine(calc(3, 4));  // 7
```

**现代写法：直接用系统内置委托，不用自定义**：

| 内置委托 | 用途 |
|---|---|
| `Func<T1, T2, TResult>` | 有返回值（最多 16 个参数） |
| `Action<T>` | 无返回值 |
| `Predicate<T>` | 返回 bool（用于判定） |

```csharp
Func<int, int, int> add = (a, b) => a + b;        // Lambda
Action<string> print = s => Console.WriteLine(s);
Predicate<int> isEven = n => n % 2 == 0;

var nums = new List<int> { 1, 2, 3, 4 };
Console.WriteLine(nums.Find(isEven));              // 2
print($"结果: {add(1, 2)}");                        // 结果: 3
```

## 3. Lambda 表达式

`(参数) => 表达式` 的简写，本质是匿名方法：

```csharp
List<int> nums = new() { 1, 2, 3, 4, 5 };

// 完整 Lambda
var evens = nums.Where(n => n % 2 == 0);
// 带语句体
var doubled = nums.Select(n => { return n * 2; });
// 无参数
Action greet = () => Console.WriteLine("hi");
```

**闭包**：Lambda 能捕获外部变量（小心循环变量）：

```csharp
for (int i = 0; i < 3; i++)
{
    // 捕获 i：所有 lambda 看到的是同一个 i 的最终值
    actions.Add(() => Console.WriteLine(i));   // 都输出 3（旧版行为）
}
```

## 4. 事件：发布/订阅模式

```csharp
public class Button
{
    // 声明事件（委托类型的"安全封装"）
    public event EventHandler? Clicked;

    public void Click()
    {
        Clicked?.Invoke(this, EventArgs.Empty);   // 触发事件
    }
}

// 订阅者
var btn = new Button();
btn.Clicked += (sender, e) => Console.WriteLine("按钮被点了！");
btn.Click();   // 输出：按钮被点了！
```

- **`event` 比公开委托更安全**：外部只能 `+=`/`-=`，不能直接调用/赋值
- 标准事件签名：`EventHandler`（sender, e）或 `EventHandler<TEventArgs>`
- 带数据的事件：`public event EventHandler<ProgressEventArgs>? Progress;`

## 5. 综合示例：一个可扩展的处理器

```csharp
public class StringProcessor
{
    // 用 Func 链让调用方自定义处理步骤
    private readonly List<Func<string, string>> _steps = new();

    public StringProcessor AddStep(Func<string, string> step)
    {
        _steps.Add(step);
        return this;    // 链式调用
    }

    public string Process(string input)
    {
        foreach (var step in _steps)
            input = step(input);
        return input;
    }
}

var p = new StringProcessor()
    .AddStep(s => s.Trim())
    .AddStep(s => s.ToUpper())
    .AddStep(s => s.Replace(" ", "_"));

Console.WriteLine(p.Process("  hello world  "));   // HELLO_WORLD
```

## 要点速记

- 泛型消灭重复，约束保障安全
- 用 `Func`/`Action`/`Predicate`，少自己声明委托
- Lambda 是简洁的方法注入；注意循环变量的闭包陷阱
- `event` 用 `+=`/`-=` 订阅，比公开委托安全
- 委托 + 泛型 + Lambda = LINQ、管道、配置系统的基础，理解了它们，看任何框架源码都顺畅
