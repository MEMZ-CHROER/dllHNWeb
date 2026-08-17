---
title: C# 字符串与文本处理
---

# C# 字符串与文本处理

> 字符串是写代码时打交道最多的类型。C# 的字符串处理能力很强，但有几个"性能陷阱"和"正确姿势"必须掌握。

## 1. String 是不可变的

`string` 一旦创建就**不能修改**——所有"修改"操作（`Replace`/`ToUpper`/`+`）都返回**新字符串**：

```csharp
string s = "hello";
string t = s.ToUpper();    // 返回 "HELLO"，s 还是 "hello"
```

**性能陷阱**：循环里用 `+` 拼接会产生大量垃圾字符串：

```csharp
// ❌ 循环拼接：每次 + 都创建一个新字符串，O(n²) 性能灾难
string result = "";
for (int i = 0; i < 10000; i++)
    result += i.ToString();

// ✅ 用 StringBuilder（可变缓冲区，一次拼接）
var sb = new StringBuilder();
for (int i = 0; i < 10000; i++)
    sb.Append(i);
string result2 = sb.ToString();
```

## 2. 字符串插值与格式化

```csharp
string name = "张三";
int age = 30;

// 插值（最推荐）
string msg = $"{name} 今年 {age} 岁";

// 格式化说明
string money = $"{1234.5:C}";      // 货币：¥1,234.50（文化相关）
string padded = $"{42:D5}";        // 00042
string hex = $"{255:X}";           // FF
string num = $"{3.14159:F2}";      // 3.14

// string.Format（老写法）
string old = string.Format("{0} 今年 {1} 岁", name, age);
```

## 3. 常用字符串方法速查

```csharp
string s = "  Hello, World!  ";

s.Trim();                    // "Hello, World!"（去两端空白）
s.Contains("World");         // true
s.StartsWith("He");          // true
s.EndsWith("!");             // true
s.Replace("World", "C#");    // "Hello, C#!"
s.ToLower(); s.ToUpper();    // 大小写
s.Substring(7, 5);           // "World"
s.IndexOf("World");          // 7（找不到返回 -1）
s.Split(',');                // ["Hello", " World!  "]
string.Join("-", new[]{"a","b","c"});   // "a-b-c"
s.Length;                    // 15
s[0];                        // ' '（索引器取字符）

// 空判断（现代写法）
string.IsNullOrEmpty(s);
string.IsNullOrWhiteSpace(s);   // 含全空白

// 反转（借助 LINQ）
var rev = new string(s.Reverse().ToArray());
```

## 4. 正则表达式实战

```csharp
using System.Text.RegularExpressions;

// 判断是否匹配
bool isEmail = Regex.IsMatch("user@example.com",
    @"^[\w.+-]+@[\w-]+\.[\w.]+$");

// 提取捕获组
var m = Regex.Match("我的手机是 138-1234-5678",
    @"(\d{3})-(\d{4})-(\d{4})");
if (m.Success)
    Console.WriteLine($"{m.Groups[1]}-{m.Groups[2]}-{m.Groups[3]}");

// 替换（用 $1 引用捕获组）
string censored = Regex.Replace("电话 138-1234-5678",
    @"\d{3}-\d{4}-\d{4}", "***-****-****");

// 性能：大量匹配时预编译 + 静态
var rx = new Regex(@"\d+", RegexOptions.Compiled);
rx.IsMatch("123");      // true
```

**正则常用符号**：`\d` 数字、`\w` 字母数字下划线、`\s` 空白、`^`/`$` 行首尾、`.` 任意、`*`/`+`/`?` 数量、`[a-z]` 字符类、`(abc)` 捕获组、`(?:abc)` 非捕获组、`(?=x)` 正向预查。

## 5. 字符串比较：等号 vs Compare

```csharp
// 默认：区分大小写，按文化（Culture）比较
"abc" == "ABC";                     // false
string.Equals("abc", "ABC", StringComparison.OrdinalIgnoreCase);  // true

// 大小写不敏感比较（性能更好）
"hello".Equals("HELLO", StringComparison.OrdinalIgnoreCase);   // true

// 排序比较
string.Compare("a", "b");           // <0
```

**建议**：判断相等用 `==` 或 `Equals`，需要忽略大小写时显式传 `StringComparison`，别用 `.ToLower() ==`（会创建新字符串）。

## 6. 编码与字节

```csharp
using System.Text;

string text = "中文测试";
byte[] utf8 = Encoding.UTF8.GetBytes(text);     // 字符串 → UTF-8 字节
string back = Encoding.UTF8.GetString(utf8);    // 字节 → 字符串

// 从文件/流读时指定编码（默认 UTF-8）
File.WriteAllText("f.txt", text, Encoding.UTF8);
```

## 要点速记

- `string` 不可变——大量拼接用 `StringBuilder`
- 插值 `` $"" `` 是首选，格式化说明符很强大
- 相等判断显式传 `StringComparison`，别用 `.ToLower() ==`
- 正则捕获组 + `$1` 替换非常实用；高频用 `RegexOptions.Compiled`
- 默认编码是 UTF-8，处理中文/跨平台别忘指定
