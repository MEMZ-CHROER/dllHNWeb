---
title: C# .NET 工具链与常用库
---

# C# .NET 工具链与常用库

> 写 C# 不只是写代码——dotnet CLI、csproj、NuGet 和一堆常用库构成了日常开发。本篇把"工程化"部分讲清楚。

## 1. dotnet CLI（最常用的命令）

```bash
dotnet --version              # SDK 版本
dotnet new console -o MyApp   # 新建控制台项目
dotnet new classlib -o MyLib   # 新建类库
dotnet new xunit -o MyTests    # 新建测试项目

dotnet build                  # 编译
dotnet run                    # 编译并运行（控制台项目）
dotnet test                   # 跑测试
dotnet publish -c Release     # 发布（产出可部署文件）

dotnet add package Newtonsoft.Json   # 添加 NuGet 包
dotnet list package           # 列出已装包
dotnet sln add MyApp MyLib    # 把项目加入解决方案
```

**项目结构**：

```
MySolution.sln
├─ MyApp/          # 控制台/应用
│  └─ MyApp.csproj
├─ MyLib/          # 类库（被引用）
│  └─ MyLib.csproj
└─ MyTests/        # 测试
   └─ MyTests.csproj
```

## 2. csproj 关键配置

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>        <!-- 目标框架 -->
    <Nullable>enable</Nullable>                       <!-- 可空引用类型 -->
    <ImplicitUsings>enable</ImplicitUsings>           <!-- 隐式 using -->
    <OutputType>Exe</OutputType>                      <!-- Exe=应用 / 默认=库 -->
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <ProjectReference Include="..\MyLib\MyLib.csproj" />
  </ItemGroup>
</Project>
```

**多目标构建**（一套代码出多框架版本）：

```xml
<TargetFrameworks>net8.0;net472</TargetFrameworks>
```

配合 `#if NET8_0` 条件编译写平台差异代码。

## 3. NuGet（包管理）

```bash
# 搜索
dotnet package search json          # 或浏览器 nuget.org

# 添加（会写进 csproj）
dotnet add package System.Text.Json

# 指定版本
dotnet add package Newtonsoft.Json --version 13.0.3

# 私有源（企业内网/镜像）
dotnet nuget add source http://my-nuget-server -n MySource
```

**选包原则**：优先官方（`Microsoft.Extensions.*`、`System.*`）；量大成熟的社区包（Newtonsoft.Json 老项目、Serilog 日志、Dapper 轻量 ORM）按需引入，**别为了小功能引大依赖**。

## 4. 常用库清单（按场景）

| 场景 | 推荐库 | 说明 |
|---|---|---|
| JSON | `System.Text.Json`（内置）/ `Newtonsoft.Json` | 内置更快；老代码/复杂场景用 Newtonsoft |
| HTTP | `HttpClient`（内置） | `System.Net.Http`，异步请求 |
| 日志 | `Microsoft.Extensions.Logging` / Serilog | 分级日志，结构化 |
| 数据库（轻量） | `Dapper` | SQL 直写 + 映射，简单快 |
| 数据库（完整 ORM） | `EF Core` | 全功能 ORM，实体映射 |
| 配置 | `Microsoft.Extensions.Configuration` | 读 JSON/环境变量/命令行 |
| 依赖注入 | `Microsoft.Extensions.DependencyInjection` | 内置 DI 容器 |
| 测试 | xUnit / NUnit / MSTest | 单测框架 |
| Mock | Moq / NSubstitute | 模拟依赖 |
| 命令行解析 | `CommandLineParser` | 参数解析 |

## 5. HttpClient 基础用法

```csharp
using var http = new HttpClient();
http.Timeout = TimeSpan.FromSeconds(10);
http.DefaultRequestHeaders.UserAgent.ParseAdd("MyApp/1.0");

// GET 文本
string html = await http.GetStringAsync("https://example.com");

// GET + 反序列化 JSON
var json = await http.GetStringAsync("https://api.example.com/users");
var users = System.Text.Json.JsonSerializer.Deserialize<List<User>>(json);

// POST JSON
var resp = await http.PostAsJsonAsync("https://api.example.com/users",
    new { name = "张三", age = 30 });
if (resp.IsSuccessStatusCode) { /* ... */ }
```

**注意**：`HttpClient` 应该**复用**（作为单例/长生命周期），不要每次 new（会耗尽 socket）。

## 6. 发布与部署

```bash
dotnet publish -c Release -o ./publish     # 框架依赖发布
dotnet publish -c Release -r win-x64 --self-contained   # 自包含（带运行时，可拷走）
```

- **框架依赖**（默认）：目标机器要装 .NET 运行时，体积小
- **自包含**：带上运行时，拷贝即用，体积大（几十 MB）
- 单文件：`-p:PublishSingleFile=true`

## 要点速记

- `dotnet new/build/run/test/publish` 五条命令覆盖日常
- csproj 是声明式配置：`TargetFramework`/`PackageReference`/`ProjectReference`
- NuGet 是生态入口，选包遵循"官方优先、够用就好"
- `HttpClient` 做单例复用，别循环 new
- 发布选"框架依赖"还是"自包含"看目标机器环境
