---
title: DllHN
---

# DllHN — DLL Hacknet

## 概述

将 Hacknet 游戏本体编译为 `Hacknet.dll`，通过 `HacknetLauncher.exe` 加载运行。  
模组以 DLL 形式放入 `BepInEx/plugins/`，通过 BepInExLoader 自动加载。

## 架构

```
HacknetLauncher.exe
      ↓
  Hacknet.dll        ← 游戏本体编译为 DLL
      ↓
  BepInEx Loader     ← 扫描 BepInEx/plugins/*.dll
      ↓
  模组插件 (CSEL等)  ← Harmony 打补丁扩展功能
```

## 核心文件

| 文件 | 说明 |
|---|---|
| `HacknetLauncher.exe` | 轻量启动器 |
| `Hacknet.dll` | 游戏主程序 |
| `BepInExLoader.cs` | DLL 模组加载器 |
| `FNA.dll` | MonoGame/FNA 图形后端 |

## 模组加载流程

1. 启动器加载 `Hacknet.dll`
2. `BepInExLoader.Initialize()` 扫描 `BepInEx/plugins/` 下所有 DLL
3. 识别带有 `[BepInPlugin]` 特性的类型
4. 创建 Harmony 实例，批量应用补丁（支持/失败计数）
5. 调用插件的 `Load()` 方法
6. 黑名单机制跳过已知不兼容的补丁
