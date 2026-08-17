---
title: C# 文件与 JSON 处理
---

# C# 文件与 JSON 处理

> 程序落地离不开读写文件、存配置、交换数据。C# 的 `System.IO` 和 `System.Text.Json` 把这两件事做得非常简单。

## 1. 路径与文件基础（System.IO）

```csharp
using System.IO;

var dir = @"C:\data";
string file = Path.Combine(dir, "notes.txt");   // 跨平台拼接路径，别手拼 "\\"

// 文件操作（一次性 API，最常用）
if (File.Exists(file))
{
    string all = File.ReadAllText(file);              // 读全部文本
    string[] lines = File.ReadAllLines(file);         // 按行读
    byte[] bytes = File.ReadAllBytes(file);           // 读二进制
}

File.WriteAllText(file, "内容");                      // 覆盖写
File.AppendAllText(file, "追加");                     // 追加写
File.Copy(file, @"C:\data\copy.txt", overwrite: true);
File.Delete(file);

// 目录
Directory.CreateDirectory(@"C:\data\sub");
var files = Directory.GetFiles(@"C:\data");           // 列出文件
var dirs = Directory.GetDirectories(@"C:\data");      // 列出子目录
```

**一次性 API（`File.ReadAll*`/`WriteAll*`）最适合小文件**——简洁安全。大文件用流式。

## 2. 流式读写（大文件）

```csharp
// 逐行处理大文件（不整文件读进内存）
using var reader = new StreamReader(@"C:\big.log");
string? line;
while ((line = reader.ReadLine()) is not null)
{
    // 处理每一行
}

// 写入
using var writer = new StreamWriter(@"C:\out.txt", append: true);
writer.WriteLine("一行日志");
```

`using` 保证资源释放（Stream/Reader 都要释放）。C# 8 起 `using var` 在作用域结束时自动释放。

## 3. JSON 序列化（System.Text.Json）

现代首选 `System.Text.Json`（内置、快、无第三方依赖）。

```csharp
using System.Text.Json;

// 定义一个 DTO（数据对象）
public record Config
{
    public string Name { get; init; } = "";
    public int Version { get; init; } = 1;
    public List<string> Tags { get; init; } = new();
}

// 序列化（对象 → JSON 字符串）
var cfg = new Config { Name = "app", Version = 2, Tags = new() { "a", "b" } };
string json = JsonSerializer.Serialize(cfg, new JsonSerializerOptions { WriteIndented = true });
Console.WriteLine(json);
// {
//   "Name": "app",
//   "Version": 2,
//   "Tags": ["a","b"]
// }

// 反序列化（JSON 字符串 → 对象）
var back = JsonSerializer.Deserialize<Config>(json);
Console.WriteLine(back?.Name);   // app

// 读 JSON 文件
string fromFile = File.ReadAllText("config.json");
var cfg2 = JsonSerializer.Deserialize<Config>(fromFile);

// 写 JSON 文件
File.WriteAllText("config.json", json);
```

**忽略大小写 / 宽松解析**：

```csharp
var opts = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true,   // 属性名不区分大小写
    WriteIndented = true,
};
```

## 4. 字典/动态 JSON 处理

```csharp
// 处理不确定结构的 JSON
using JsonDocument doc = JsonDocument.Parse(json);
var root = doc.RootElement;
string name = root.GetProperty("Name").GetString() ?? "";
int ver = root.GetProperty("Version").GetInt32();

// 或者用 Dictionary<string, object?>（简单场景）
var dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(json);
```

## 5. 实战：批量处理文件 + JSON

```csharp
// 把某目录下所有 .txt 文件的内容转成 JSON 清单
var dir = @"C:\logs";
var entries = Directory.GetFiles(dir, "*.txt")
    .Select(path =>
    {
        var lines = File.ReadAllLines(path);
        return new
        {
            FileName = Path.GetFileName(path),
            LineCount = lines.Length,
            Size = new FileInfo(path).Length,
        };
    });

string result = JsonSerializer.Serialize(entries, new JsonSerializerOptions { WriteIndented = true });
File.WriteAllText(Path.Combine(dir, "manifest.json"), result);
```

## 要点速记

- 路径用 `Path.Combine`，别手拼分隔符
- 小文件用 `File.ReadAllText/WriteAllText`，大文件用 `StreamReader/Writer`
- `using`（或 `using var`）保证流资源释放
- JSON 用内置 `System.Text.Json`，`record`/DTO + 序列化选项搞定 90% 场景
- 不确定结构用 `JsonDocument`/`JsonElement` 或 `Dictionary<string, object?>`
