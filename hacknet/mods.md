---
title: 模组开发指南
---

# Hacknet 模组开发指南

本指南教你为 Hacknet 编写 BepInEx 插件模组。所有机制均基于游戏源码中的实际加载方式（`ExtensionLoader.cs` + Harmony）。

> 实战参考：本站的 [CSEL Mod](/csel-mod/) 就是一个完整的 BepInEx 插件，同时兼容原版 Hacknet 和开源版。

---

## 1. 两种模组方式

Hacknet 支持两种扩展途径：

| 方式 | 说明 | 适用 |
|---|---|---|
| **BepInEx 插件** | 基于 BepInEx 5/6 的插件，用 Harmony 补丁改动游戏行为 | 命令、机制改动，最常用 |
| **扩展目录**（Extensions/） | 游戏启动时由 `ExtensionLoader` 加载，自带曲目/主题等资源 | 分发完整内容包 |

两者可以配合使用：插件负责逻辑，扩展目录负责资源。

---

## 2. 环境准备

```text
Hacknet 根目录/
├─ BepInEx/
│  ├─ core/        ← BepInEx 运行时（Hacknet 已内置）
│  ├─ config/
│  └─ plugins/     ← 把编译好的 DLL 放这里
├─ Hacknet.exe
├─ winhttp.dll     ← BepInEx 的 doorstop 注入器
```

在 csproj 中引用：

```xml
<Reference Include="Hacknet">
  <HintPath>..\Hacknet.dll</HintPath>
</Reference>
<Reference Include="BepInEx">
  <HintPath>..\BepInEx\core\BepInEx.dll</HintPath>
</Reference>
<Reference Include="0Harmony">
  <HintPath>..\BepInEx\core\0Harmony.dll</HintPath>
</Reference>
```

---

## 3. 插件主类

BepInEx 通过 **`BepInPlugin`** 特性识别插件，`ExtensionLoader` 在启动时扫描并加载：

```csharp
[BepInPlugin("com.yourname.mymod", "My Mod", "1.0.0")]
public class MyMod : BaseUnityPlugin
{
    private void Awake()
    {
        Logger.LogInfo("MyMod loaded!");
        // 在这里注册 Harmony 补丁
    }
}
```

三个参数依次是 **GUID / 名称 / 版本**——GUID 必须是全局唯一的。

---

## 4. Harmony 补丁：核心机制

Hacknet 的 `ExtensionLoader` 会遍历你程序集里所有标了 **`[HarmonyPatch]`** 的类并自动应用。这是 CSEL Mod 的做法，也是官方源码支持的加载方式。

### 拦截一条游戏命令

游戏命令统一走 `ProgramRunner.ExecuteProgram`，拦截它就能注册自定义命令（**CSEL Mod 就是这么做的**）：

```csharp
[HarmonyPatch(typeof(ProgramRunner), "ExecuteProgram")]
public class Patch_ExecuteProgram
{
    static bool Prefix(string name, ref object[] args, ref string outStr)
    {
        if (name != "mymod") return true;   // 放行原版命令

        outStr = "Hello from MyMod!";
        return false;                        // 吞掉原逻辑
    }
}
```

- `Prefix` 返回 `false` 表示**不执行原方法**
- 返回 `true` 表示继续走原逻辑

### 修改游戏表现

比如在标题画面加水印（CSEL Mod 的 P1 补丁）：

```csharp
[HarmonyPatch(typeof(MainMenu), "DrawBackgroundAndTitle")]
public class Patch_MainMenuDraw
{
    static void Postfix()
    {
        // 在这里画你的自定义 UI / 版本号水印
    }
}
```

---

## 5. 访问游戏对象

Hacknet 的核心状态挂在 **`OS.currentInstance`**（或 `os`）上：

```csharp
// 获取当前操作系统实例
var os = OS.currentInstance;

// 给玩家弹一条通知
os.write("My mod notification");

// 访问玩家节点
var playerComp = os.thisComputer;
```

常用类：
- `OS` — 全局系统状态、邮件、节点地图
- `Computer` — 单台服务器（IP、端口、管理员）
- `ProgramRunner` — 命令执行入口
- `PortExploits` — 端口破解程序数据

---

## 6. 用扩展目录分发资源

`ExtensionLoader` 还支持加载完整的扩展包（曲目、主题、内容）：

```csharp
public static class ExtensionLoader
{
    // 扫描并加载扩展
    // 支持曲目替换：LoadExtensionStartTrackAsCurrentSong(info)
}
```

把内容放进 `Extensions/<你的扩展名>/Content/`，由 `ExtensionInfo` 描述扩展元数据。适合分发：
- 自定义音乐（`LoadExtensionStartTrackAsCurrentSong` 相关逻辑）
- 主题 / 图标 / 贴图资源
- 更大的内容包（和 DLC 目录结构类似）

---

## 7. 编译与安装

```bash
# 编译（以 CSEL Mod 为例，双平台构建脚本见 csel-mod 页面）
dotnet build
```

把产出的 `MyMod.dll` 丢进：

```
BepInEx/plugins/MyMod.dll
```

启动游戏，看控制台输出有没有你的 `Logger.LogInfo` 消息，成功即加载。

---

## 8. 常见坑

| 坑 | 解决方案 |
|---|---|
| 插件没加载 | 确认 GUID 唯一、DLL 在 `plugins/` 下、没缺 BepInEx 引用 |
| 命令没生效 | 检查 `Prefix` 里参数名/类型是否和原方法签名一致 |
| 双平台不兼容 | 原版和开源版的部分 API 有差异，用条件编译区分 |
| Harmony 补丁没应用 | 确认类有 `[HarmonyPatch]`、方法签名匹配目标 |

---

## 参考资料

- 完整可参考实现：**CSEL Mod**（本网站的 [csel-mod](/csel-mod/) 页面，含命令列表与补丁表）
- 游戏源码：Hacknet 开源仓库（`ExtensionLoader.cs`、`ProgramRunner.cs`、`Programs.cs` 是核心参考文件）
