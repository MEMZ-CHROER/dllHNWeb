---
title: C# 入门教程
---

# C# 入门教程

本教程面向完全没接触过 C# 的读者，从环境搭建到写出几个能跑的简单程序，全程含可运行代码。

> 这不是 Hacknet 的教程——C# 是通用编程语言，学会它你可以写游戏、写工具、写网站后端。

---

## 1. 环境搭建

C# 由 .NET 平台承载。去 [dotnet.microsoft.com](https://dotnet.microsoft.com) 下载 **.NET SDK**（不是 Runtime，SDK 才能编译）。

装好后打开终端验证：

```bash
dotnet --version    # 输出如 8.0.100
```

## 2. 第一个程序：Hello World

```bash
mkdir HelloWorld
cd HelloWorld
dotnet new console    # 生成一个控制台项目
dotnet run            # 编译并运行
```

项目里的 `Program.cs`：

```csharp
Console.WriteLine("Hello, World!");
```

`Console.WriteLine` 就是"向控制台打印一行"。`Program.cs` 是程序入口。

## 3. 变量与数据类型

```csharp
int age = 28;              // 整数
double price = 19.99;      // 浮点数
string name = "Lxy";       // 字符串（文本）
char letter = 'A';         // 单个字符
bool isCool = true;        // 布尔值

Console.WriteLine($"{name} is {age} years old");
```

- `//` 是注释
- `$"..."` 叫**字符串插值**，把变量嵌进文本里，`{变量名}` 处会被替换成值

## 4. 输入、条件与循环

写一个"猜数字"游戏，一次把输入、`if`、`while` 全用上：

```csharp
Random rng = new Random();
int secret = rng.Next(1, 101);   // 1~100 随机数
int guess = 0;

while (guess != secret)
{
    Console.Write("猜一个 1~100 的数: ");
    string? input = Console.ReadLine();
    guess = int.Parse(input!);      // 把文本转成整数

    if (guess > secret)
        Console.WriteLine("太大了！");
    else if (guess < secret)
        Console.WriteLine("太小了！");
    else
        Console.WriteLine("答对了！");
}
```

- `while (条件)` 循环直到条件为假
- `int.Parse` 把字符串 `"42"` 变成数字 `42`
- `string?` 和 `input!` 是 C# 的可空类型语法，先不用纠结

## 5. 方法（函数）

把逻辑包进方法里，代码能复用：

```csharp
int Add(int a, int b) => a + b;          // 表达式体写法

string Greet(string name, int count = 1)  // 参数可给默认值
{
    string msg = $"你好，{name}！";
    for (int i = 0; i < count; i++)        // for 循环
        Console.WriteLine(msg);
    return msg;
}

Add(3, 4);        // 7
Greet("Lxy");     // 打印一次
Greet("Lxy", 3);  // 打印三次
```

## 6. 集合：List 和 Dictionary

```csharp
List<string> names = new List<string> { "Bit", "Naix", "Kaguya" };
names.Add("Striker");
foreach (string n in names)
    Console.WriteLine(n);

Dictionary<string, int> scores = new Dictionary<string, int>();
scores["Alice"] = 95;
scores["Bob"] = 88;
Console.WriteLine(scores["Alice"]);   // 95
```

- `List<T>` 动态数组，`foreach` 遍历
- `Dictionary<K,V>` 键值对，像查字典

## 7. 类与对象

```csharp
class Player
{
    public string Name { get; set; }      // 属性（Property）
    public int Hp { get; set; }

    public Player(string name, int hp)    // 构造函数
    {
        Name = name;
        Hp = hp;
    }

    public void TakeDamage(int dmg) => Hp -= dmg;
}

Player p = new Player("Player One", 100);
p.TakeDamage(25);
Console.WriteLine($"{p.Name} 剩 {p.Hp} HP");   // Player One 剩 75 HP
```

- `class` 定义类型，字段/属性存数据，方法做行为
- 构造函数 `Player(...)` 在 `new` 时初始化对象

## 8. 异常处理

程序出错了不要崩，用 `try`/`catch` 兜住：

```csharp
try
{
    int x = int.Parse("不是数字");
}
catch (FormatException)
{
    Console.WriteLine("输入不是合法的数字");
}
finally
{
    Console.WriteLine("这段总会执行");
}
```

## 9. 简单程序示例

### 计算器

```csharp
Console.Write("输入表达式（如 3 + 4）: ");
var parts = Console.ReadLine()!.Split(' ');
int a = int.Parse(parts[0]);
string op = parts[1];
int b = int.Parse(parts[2]);
int result = op switch
{
    "+" => a + b,
    "-" => a - b,
    "*" => a * b,
    "/" => b == 0 ? 0 : a / b,   // 三目运算：防除零
    _   => 0
};
Console.WriteLine($"{a} {op} {b} = {result}");
```

### 统计一个文件的行数

```csharp
string path = "data.txt";
int lines = 0;
foreach (string line in File.ReadLines(path))
    lines++;
Console.WriteLine($"{path} 有 {lines} 行");
```

## 10. 下一步

- **继续学**：方法重载、接口、LINQ、async/await
- **写点真东西**：用 C# 写控制台小工具、Unity 游戏（C# 是 Unity 的官方语言）、ASP.NET Core 网站
- **多目标构建**：一个项目同时编译到 .NET Framework 4.7.2 和 .NET 8 是常见需求，用 csproj 里的 `<TargetFrameworks>` 就能做到

### ➡️ C# 进阶系列

入门学完，往下深入：

- [🧱 面向对象深入](/programming/csharp/oop) — 继承/多态/接口 vs 抽象类/组合/record
- [🔗 LINQ 与集合操作](/programming/csharp/linq) — 声明式操作集合，查询语法与性能
- [⚡ 异步与并发编程](/programming/csharp/async) — async/await 与并行处理
- [🧩 泛型、委托与事件](/programming/csharp/generic) — 让类型和方法都能"参数化"
- [📁 文件与 JSON 处理](/programming/csharp/io-json) — 读写文件与数据交换
- [🐛 调试与单元测试](/programming/csharp/debug) — 从"出 bug"到"防 bug"
