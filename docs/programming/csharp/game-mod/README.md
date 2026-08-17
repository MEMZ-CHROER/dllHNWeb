---
title: 用 C# 开发游戏 Mod
---

# 用 C# 开发游戏 Mod

> Mod（游戏模组）= 在不改游戏源码的前提下，向游戏注入自己的代码。Unity 游戏（C# 写的）天生适合 C# Mod 开发，主流工具是 **BepInEx** 框架 + **Harmony** 补丁库。本篇讲通用原理与流程。

## 1. 为什么 C# 游戏能打 Mod

Unity 游戏用 C# 编写，编译成 IL（中间语言）。IL 在运行时被 CLR 加载执行——**Mod 工具可以利用这一点，在游戏启动时注入自己的程序集**，从而"插"进游戏的逻辑。这不需要游戏源码，只需要运行时的"钩子"。

## 2. 两大工具

| 工具 | 作用 |
|---|---|
| **BepInEx** | 游戏 Mod 加载框架：启动时加载 `plugins/` 目录下的所有插件，管理生命周期、配置、日志 |
| **Harmony** | .NET 补丁库：运行时修改任意类的方法逻辑，不碰原代码文件 |

两者配合：BepInEx 负责"加载我的 Mod"，Harmony 负责"改游戏的逻辑"。

## 3. 一个最小 Mod（BepInEx 插件）

```csharp
using BepInEx;
using BepInEx.Logging;

namespace MyFirstMod
{
    [BepInPlugin("com.example.myfirstmod", "My First Mod", "1.0.0")]
    public class MainPlugin : BaseUnityPlugin
    {
        internal static ManualLogSource Log;   // 日志

        private void Awake()
        {
            Log = Logger;                       // BepInEx 的日志系统
            Log.LogInfo("我的第一个 Mod 已加载！");

            // 在这里初始化补丁、订阅事件、读配置…
        }

        private void Update()                   // 每帧调用（Unity 生命周期）
        {
            // 每帧逻辑
        }
    }
}
```

- `[BepInPlugin(GUID, 名称, 版本)]`：声明插件身份
- `BaseUnityPlugin`：继承它获得生命周期（`Awake`/`Update`）和 `Logger`
- 编译产物 `MyFirstMod.dll` 放进游戏的 `BepInEx/plugins/` 目录即可

## 4. Harmony 补丁：改游戏逻辑

Harmony 能"插"进任意方法，三种补丁类型：

| 类型 | 时机 | 用途 |
|---|---|---|
| **Prefix** | 原方法**执行前** | 拦截/修改参数/跳过原方法 |
| **Postfix** | 原方法**执行后** | 读取/修改返回值、补逻辑 |
| **Transpiler** | 编译期改 IL | 高级，重写方法体 |

```csharp
using HarmonyLib;

public class PlayerPatch
{
    // Postfix：在原方法执行后运行，能看/改返回值
    [HarmonyPostfix]
    public static void AfterDamage(ref int __result)
    {
        // __result 是原方法的返回值（ref 修改它）
        if (__result < 0) __result = 0;          // 伤害不低于 0
    }
}

// 在插件 Awake 里打补丁
Harmony harmony = new Harmony("com.example.myfirstmod");
harmony.PatchAll();     // 扫描本程序集所有 [Harmony*] 方法并应用
```

- `__result`：原方法返回值（`ref` 可改）
- `__instance`：原方法的 `this`（实例方法）
- `__args`/具名参数：访问方法参数

**Prefix 拦截（可选不执行原方法）**：

```csharp
[HarmonyPrefix]
public static bool BeforeDamage(int amount)
{
    if (amount == 0) return false;   // 返回 false = 跳过原方法
    return true;
}
```

## 5. 完整工作流

```
1. 装 BepInEx 到游戏目录（解压即可，自动初始化）
2. 创建类库项目，引用 BepInEx.dll + 0Harmony.dll（从 BepInEx 目录拿）
3. 写 [BepInPlugin] 插件 + [Harmony*] 补丁
4. dotnet build 编译成 dll
5. 拷 dll 进 游戏/BepInEx/plugins/
6. 启动游戏 → 看 BepInEx 日志确认加载
```

```xml
<!-- csproj：引用 BepInEx 程序集 -->
<ItemGroup>
  <Reference Include="BepInEx">
    <HintPath>..\Game\BepInEx\core\BepInEx.dll</HintPath>
  </Reference>
  <Reference Include="0Harmony">
    <HintPath>..\Game\BepInEx\core\0Harmony.dll</HintPath>
  </Reference>
</ItemGroup>
```

## 6. 常见坑

| 坑 | 说明 |
|---|---|
| **GUID 唯一** | `BepInPlugin` 的 GUID 全站唯一，别抄别人的 |
| **版本匹配** | BepInEx 与游戏/Unity 版本要匹配（有的游戏用旧版 BepInEx） |
| **补丁失败** | `PatchAll` 失败会在日志里报错——看 `BepInEx/LogOutput.log` |
| **改返回值用 ref** | Postfix 里改返回值必须是 `ref __result` |
| **别碰存档/封禁** | 多人游戏 Mod 可能违反服务条款，先确认 |
| **引用打包** | 若 Mod 带依赖 DLL，放插件目录或启用 BepInEx 的依赖加载 |

## 7. 调试与发布

```bash
# 查看游戏日志（Mod 加载状态、报错）
BepInEx/LogOutput.log

# 发布：把插件 dll（+依赖）拷进 plugins/，压缩成 Mod 包
```

调试建议：用 `Log.LogInfo`/`Log.LogError` 分级输出，别用 `Console.WriteLine`（可能看不到）。

## 要点速记

- BepInEx 负责"加载 Mod"，Harmony 负责"改逻辑"，两者是 C# 游戏 Mod 的标准组合
- 最小插件：`[BepInPlugin]` + 继承 `BaseUnityPlugin`
- 补丁三件套：`Prefix`（前）/`Postfix`（后）/`Transpiler`（改 IL），用 `__result`/`__instance` 访问上下文
- 出了事先看 `LogOutput.log`，别瞎猜
- 动手前确认游戏的 Mod 支持程度与规则
