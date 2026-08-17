---
title: C# LINQ 与集合操作
---

# C# LINQ 与集合操作

> LINQ（Language Integrated Query）让集合操作变成"声明式"的：你描述**要什么**，而不是**怎么遍历**。

## 1. 两种语法：查询式 vs 方法式

```csharp
var nums = new[] { 1, 2, 3, 4, 5, 6 };

// 查询语法（像 SQL）
var evensQuery = from n in nums where n % 2 == 0 select n;

// 方法语法（链式，更常用）
var evensMethod = nums.Where(n => n % 2 == 0);
```

两者结果一样，方法语法更灵活（能组合更多操作符），日常更推荐。

## 2. 常用操作符速查

```csharp
var people = new[]
{
    new { Name = "张三", Age = 30, City = "北京" },
    new { Name = "李四", Age = 25, City = "上海" },
    new { Name = "王五", Age = 35, City = "北京" },
    new { Name = "赵六", Age = 22, City = "上海" },
};

// Where：过滤
var adults = people.Where(p => p.Age >= 30);

// Select：投影（挑字段）
var names = people.Select(p => p.Name);

// OrderBy / ThenBy：排序（支持多级）
var sorted = people.OrderBy(p => p.City).ThenByDescending(p => p.Age);

// GroupBy：分组
var byCity = people.GroupBy(p => p.City);
foreach (var g in byCity)
    Console.WriteLine($"{g.Key}: {g.Count()} 人");   // Key = 组名

// Join：连接（类似 SQL JOIN）
var cities = new[] { new { Name = "北京", Code = "BJ" }, new { Name = "上海", Code = "SH" } };
var joined = from p in people
             join c in cities on p.City equals c.Name
             select new { p.Name, c.Code };

// 聚合
var maxAge = people.Max(p => p.Age);       // 35
var sum = people.Sum(p => p.Age);          // 总和
var avg = people.Average(p => p.Age);      // 平均

// Any / All / Contains：判定
var hasShanghai = people.Any(p => p.City == "上海");
var allAdult = people.All(p => p.Age >= 18);

// First / FirstOrDefault：取第一个（找不到时 First 抛异常）
var first = people.FirstOrDefault(p => p.City == "北京");
var firstOrNull = people.FirstOrDefault(p => p.Age > 100);  // null
```

## 3. 延迟执行 vs 立即执行（关键概念）

```csharp
var query = people.Where(p => p.Age > 20);   // ⏳ 还没执行！
// query 是一个"查询计划"，遍历时才真正跑

var list = query.ToList();   // 立即执行：ToList/ToArray/ToDictionary/Count
```

- **延迟**：`Where`/`Select`/`OrderBy`——创建查询，遍历时才执行
- **立即**：`ToList()`/`ToArray()`/`Count()`/`First()`——立刻执行

**坑**：延迟查询每次遍历都会重新执行。集合在查询后变了，结果也会变：

```csharp
var q = nums.Where(n => n > 2);
nums[0] = 99;
foreach (var n in q) Console.Write(n);   // 会包含 99，因为查询执行时看的是"当时的数据"
```

## 4. 性能与注意事项

- **用 `ToList()` 快照**：查询结果要复用/被修改，先 ToList 冻结
- **大集合用 `AsParallel()`**（PLINQ）并行化：`nums.AsParallel().Where(...)`
- **字典查找 O(1)**：频繁按键查，`ToDictionary()` 比 `Where().First()` 快得多
- **避免在 Where 里做昂贵操作**（如数据库查询/IO），它会执行多次
- 匿名类型适合中间投影；跨方法传递用具名类或 record

## 5. 实战：统计文本中的词频

```csharp
var text = "the quick brown fox jumps over the lazy dog the fox";
var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);

var freq = words
    .GroupBy(w => w)
    .Select(g => new { Word = g.Key, Count = g.Count() })
    .OrderByDescending(x => x.Count)
    .ThenBy(x => x.Word);

foreach (var item in freq.Take(5))
    Console.WriteLine($"{item.Word}: {item.Count}");
```

## 要点速记

- 方法语法链式最灵活，`Where`/`Select`/`OrderBy`/`GroupBy`/`Join` 是核心五件套
- 分清**延迟**（Where/Select）和**立即**（ToList/Count/First）
- 惰性查询会"看当前数据"——要快照就 `ToList()`
- 组合操作符先过滤再投影，减少数据量
- 大集合 + 计算密集 → `AsParallel()`
