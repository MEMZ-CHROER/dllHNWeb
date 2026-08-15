---
title: 快速模组教程
---

# Hacknet 快速模组制作教程

Hacknet 的模组是 **BepInEx 插件**。本站的 [CSEL Mod](/csel-mod) 就是一个现成范本——最快的做法是**复制它改成你自己的**。

> 想先搞懂原理再看这篇速成：完整的机制讲解见 [模组开发指南](/hacknet/mods)。

---

## 1. 认识 CSEL Mod 的结构

CSEL Mod 源码在 `OpenHacknet-main/CSEL/`，核心就这几样：

```
CSEL/
├─ CSEL.csproj           # 项目定义（net472 + 引用 BepInEx/Hacknet/FNA）
├─ build_open.bat        # 编译 → 开源版
├─ build_original.bat    # 编译 → Steam 原版
└─ src/
   ├─ Plugin.cs          # 插件入口（继承 HacknetPlugin）
   ├─ Commands.cs        # 命令处理（patch OS.threadExecute 前缀）
   └─ ...
```

**一条核心规则**：插件类要继承 **`HacknetPlugin`**（来自 `BepInEx.Hacknet`），不是 `BaseUnityPlugin`。

```csharp
[BepInPlugin("dev.csel.extension", "CSEL Extension", "1.3.0")]
public class CSELPlugin : HacknetPlugin
{
    public override bool Load()
    {
        // 在这里注册 Harmony 补丁、初始化
        return true;
    }
}
```

## 2. 最快路径：复制 CSEL 改成自己的

1. 复制 `CSEL/` 目录，改名成 `MyMod/`
2. 改 `CSEL.csproj` 里的 `<AssemblyName>` 和 `<RootNamespace>`
3. 改 `Plugin.cs` 里的 `[BepInPlugin("你的.GUID", "你的名字", "1.0.0")]`（GUID 全局唯一）
4. 在 `Commands.cs` 的 `switch` 里加你自己的命令分支：

```csharp
case "hi":
    os.write("Hello from " + os.hostname + "!");
    break;
```

5. 跑 `build_original.bat` 或 `build_open.bat`，把产出的 DLL 丢进游戏的 `BepInEx/plugins/`，完事。

## 3. 从一个空白项目开始（最小示例）

不想复制，就手动建这三个文件：

### Plugin.cs

```csharp
using BepInEx;
using BepInEx.Hacknet;
using HarmonyLib;

namespace MyMod
{
    [BepInPlugin("dev.me.mymod", "My HN Mod", "1.0.0")]
    public class MyMod : HacknetPlugin
    {
        public override bool Load()
        {
            HarmonyInstance.PatchAll();   // 自动应用下面所有 [HarmonyPatch]
            return true;
        }
    }
}
```

### AddHiCommand.cs —— 拦截命令

```csharp
using Hacknet;
using HarmonyLib;

namespace MyMod
{
    [HarmonyPatch(typeof(OS), "threadExecute")]
    class Patch_Hi
    {
        static bool Prefix(OS __instance, string name)
        {
            if (name.ToLower() != "hi") return true;   // 不是我们的命令，放行
            __instance.write("Hello from MyMod!");
            return false;                               // 吞掉原逻辑
        }
    }
}
```

### MyMod.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Library</OutputType>
    <TargetFramework>net472</TargetFramework>
    <PlatformTarget>x86</PlatformTarget>
  </PropertyGroup>
  <ItemGroup>
    <Reference Include="Hacknet"  HintPath="..\bin\Debug\net472\Hacknet.dll" />
    <Reference Include="BepInEx.Core"  HintPath="..\bin\Debug\net472\BepInEx\core\BepInEx.Core.dll" />
    <Reference Include="BepInEx.Hacknet" HintPath="..\bin\Debug\net472\BepInEx\core\BepInEx.Hacknet.dll" />
    <Reference Include="0Harmony" HintPath="..\bin\Debug\net472\BepInEx\core\0Harmony.dll" />
  </ItemGroup>
</Project>
```

编译：`dotnet build`，把 `MyMod.dll` 放进 `BepInEx/plugins/`。

## 4. 双平台构建（可选，CSEL Mod 的进阶玩法）

CSEL Mod 一套代码同时出开源版和 Steam 原版，靠 csproj 里的条件编译：

```xml
<PropertyGroup>
  <OpenHacknet Condition="'$(OpenHacknet)' == ''">true</OpenHacknet>
</PropertyGroup>
<PropertyGroup Condition="'$(OpenHacknet)' == 'true'">
  <DefineConstants>$(DefineConstants);OPENHACKNET</DefineConstants>
</PropertyGroup>
```

构建时用参数切平台：

```bash
dotnet build -p:OpenHacknet=true    # 编译给开源版
dotnet build -p:OpenHacknet=false   # 编译给 Steam 原版
```

## 5. 常见坑

| 坑 | 解决 |
|---|---|
| 插件没加载 | 类必须继承 `HacknetPlugin`；GUID 唯一；DLL 在 `plugins/` 下 |
| 命令没反应 | `Prefix` 参数名/类型要和原方法签名一致；确认返回 `false` 且 `name` 匹配 |
| 双平台报错 | 用 `#if OPENHACKNET` 区分两版 API 差异 |
| x86/AnyCPU 崩溃 | 目标平台必须 `x86`（游戏是 32 位） |

---

**参考实现**：完整源码在 [CSEL Mod](/csel-mod) 与游戏开源仓库的 `CSEL/` 目录。
