---
title: C# 面向对象深入
---

# C# 面向对象深入

> 承接 [C# 入门教程](/programming/csharp/)，本篇深入面向对象的核心机制：继承、多态、接口、抽象类，以及设计上的取舍。

## 1. 封装：属性与访问修饰符

封装 = 隐藏内部状态，通过公开接口访问。C# 用属性（Property）而不是公开字段：

```csharp
public class BankAccount
{
    // 私有字段（外部不可见）
    private decimal _balance;

    // 属性：读受控、写受控
    public decimal Balance => _balance;

    public decimal BalancePublic { get; private set; }   // get 公开，set 私有

    public string AccountNo { get; init; }               // init = 只能在构造时赋值

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        _balance += amount;
    }
}
```

访问修饰符从小到严：`public` → `internal` → `protected` → `private protected` → `private`。

## 2. 继承：base、virtual、override

```csharp
public class Animal
{
    public string Name { get; set; }

    public Animal(string name) => Name = name;

    public virtual string Speak() => "...";   // virtual：允许子类重写
}

public class Dog : Animal
{
    public Dog(string name) : base(name) { }  // 调父类构造函数

    public override string Speak() => "汪！";  // override：重写
}

public sealed class Cat : Animal              // sealed：禁止再被继承
{
    public Cat(string name) : base(name) { }
    public override string Speak() => "喵~";
}
```

- **`virtual`**：父类允许重写
- **`override`**：子类重写（必须有对应的 virtual/abstract）
- **`new`**：隐藏父类成员（不推荐，会破坏多态）
- **`sealed`**：类不允许被继承

## 3. 多态：一个引用，多种行为

```csharp
var animals = new List<Animal> { new Dog("旺财"), new Cat("咪咪") };

foreach (var a in animals)
    Console.WriteLine($"{a.Name}：{a.Speak()}");
// 输出：旺财：汪！  咪咪：喵~
```

核心：**用父类引用调用虚方法，运行时决定执行哪个版本**（运行期多态）。这让"一套代码处理多种类型"成为可能。

## 4. 接口 vs 抽象类（最常问的区分）

| | 抽象类 `abstract class` | 接口 `interface` |
|---|---|---|
| 继承数量 | 只能继承**一个** | 可实现**多个** |
| 成员 | 可以有字段/构造/实现 | 默认纯声明（C# 8 后有默认实现） |
| 语义 | "是什么"（is-a） | "能做什么"（can-do） |
| 演进 | 加成员会破坏子类 | 加成员默认实现不破坏（可选） |

```csharp
public interface IFlyable
{
    void Fly();          // 只声明，实现方负责
}

public abstract class Bird
{
    public abstract string Species { get; }   // 抽象属性，子类必须实现
    public void Breathe() => Console.WriteLine("呼吸");  // 普通方法，可直接用
}

// 一个类可以继承一个抽象类 + 实现多个接口
public class Sparrow : Bird, IFlyable
{
    public override string Species => "麻雀";
    public void Fly() => Console.WriteLine("扑棱扑棱飞");
}
```

**经验法则**：能描述"能做什么"就用接口；要共享"是什么"的基类逻辑就用抽象类。

## 5. 组合优于继承

继承是最强耦合的关系，滥用会变"面条"（深层继承难维护）。能用组合就不用继承：

```csharp
// ❌ 继承实现"会飞"（类爆炸：飞行的狗、会叫的飞机…）
public class FlyingDog : Dog { public void Fly() { } }

// ✅ 组合：把能力做成接口 + 实现对象
public class FlyingBehavior
{
    public void Execute() => Console.WriteLine("飞起来了");
}

public class Dog
{
    private readonly FlyingBehavior? _fly;   // 可选的飞行能力
    public Dog(FlyingBehavior? fly = null) => _fly = fly;
    public void TryFly() => _fly?.Execute();
}
```

## 6. record：不可变的数据类型（C# 9+）

纯数据载体用 `record`，自带值相等性、`ToString`、`with` 复制：

```csharp
public record Person(string Name, int Age);

var p1 = new Person("张三", 30);
var p2 = p1 with { Age = 31 };        // 非破坏性复制
Console.WriteLine(p1 == new Person("张三", 30));   // true（按值比较）
```

## 要点速记

- 优先**组合**而非继承
- 接口描述"能力"，抽象类描述"本质"
- `sealed` 类防继承，`sealed override` 防继续重写
- 数据对象用 `record`，行为对象用 `class`
- 属性用 `get`/`init`/`private set` 控制可变性，别用公开字段
