---
title: C# 调试与单元测试
---

# C# 调试与单元测试

> 会写代码只是开始，会**找到问题在哪**才是生产力。本篇讲调试器用法 + 日志 + 单元测试，覆盖从"出 bug"到"防 bug"。

## 1. 调试器基础（Visual Studio / VS Code）

| 操作 | 快捷键 (VS) | 作用 |
|---|---|---|
| 断点 | `F9` | 代码执行到这就停 |
| 开始调试 | `F5` | 运行到第一个断点 |
| 步过 | `F10` | 执行当前行，不进函数内部 |
| 步入 | `F11` | 进入函数内部 |
| 步出 | `Shift+F11` | 跳出当前函数 |
| 继续 | `F5`（调试中） | 跑到下一个断点 |
| 停止 | `Shift+F5` | 结束调试 |

**调试窗口**：
- **Watch / 监视**：输入表达式看值（如 `list.Count`、`x * 2`）
- **即时窗口 / Immediate**：调试中直接输表达式求值（`? x.ToString()`）
- **调用堆栈 / Call Stack**：看"现在是从哪一路调进来的"
- **局部变量 / Locals**：当前作用域所有变量

**条件断点**（只在满足条件时停）：
```csharp
// 在断点上右键 → 条件：i > 100 时才停
for (int i = 0; i < 1000; i++) { Process(i); }
```

## 2. 异常调试

- **异常设置（Exception Settings）**：勾选"首次出现时中断"，异常一抛就停（能看到最原始的位置）
- **调用堆栈**是定位异常的钥匙：从顶层往下找，最靠近"自己代码"的帧通常是根因
- 别吞异常：

```csharp
// ❌ 吞掉异常，问题被藏起来
catch (Exception e) { /* 什么都不做 */ }

// ✅ 记录关键信息
catch (Exception e)
{
    Console.WriteLine($"{e.GetType().Name}: {e.Message}\n{e.StackTrace}");
    throw;      // 或重新抛出（保留堆栈）
}
```

## 3. 日志与断言

```csharp
using System.Diagnostics;

Debug.WriteLine("仅在 DEBUG 编译下输出");
Trace.WriteLine("Debug + Release 都输出");

// 断言：开发期检查不变量，失败立即停
Debug.Assert(value >= 0, "value 不能为负");
```

正式项目用日志库（`Microsoft.Extensions.Logging` / Serilog / NLog），支持分级（Trace/Info/Warn/Error）和输出到文件/控制台。

## 4. 单元测试（xUnit 示例）

测试框架三选一：**xUnit**、NUnit、MSTest，语法类似。xUnit 最流行。

```csharp
// 被测代码：一个简单的计算器
public class Calculator
{
    public int Add(int a, int b) => a + b;
    public int Divide(int a, int b) => b == 0
        ? throw new DivideByZeroException()
        : a / b;
}
```

测试项目引用被测项目后：

```csharp
using Xunit;

public class CalculatorTests
{
    private readonly Calculator _calc = new();

    [Fact]                                  // 普通测试
    public void Add_ReturnsSum()
    {
        var result = _calc.Add(2, 3);
        Assert.Equal(5, result);
    }

    [Theory]                                // 参数化测试：多组数据
    [InlineData(1, 2, 3)]
    [InlineData(-1, 1, 0)]
    [InlineData(0, 0, 0)]
    public void Add_VariousInputs_ReturnsCorrect(int a, int b, int expected)
    {
        Assert.Equal(expected, _calc.Add(a, b));
    }

    [Fact]
    public void Divide_ByZero_Throws()
    {
        Assert.Throws<DivideByZeroException>(() => _calc.Divide(10, 0));
    }
}
```

运行：`dotnet test`（或 IDE 的测试资源管理器）。

## 5. 测试原则（别写成"为测而测"）

- **测行为，不测实现**：关注输入 → 输出，别断言内部调用次数（除非必要）
- **一个测试一个断言主题**：失败时能立刻知道哪错了
- **AAA 结构**：Arrange（准备）→ Act（执行）→ Assert（断言）
- **覆盖边界**：空值、空集合、零、负数、超长——bug 常在边界
- 测试要**快**：别在测试里连数据库/真实网络，用 mock 或内存实现

## 要点速记

- 调试三件套：断点 + Watch + 调用堆栈；异常设置"首次中断"定位根因
- 别吞异常，记录 `Message` + `StackTrace`
- `Debug.Assert` 在开发期守不变量
- 单元测试用 xUnit + `[Fact]`/`[Theory]`，`dotnet test` 一键跑
- 测试测"输入→输出"的行为，覆盖边界值
