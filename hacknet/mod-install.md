---
title: Mod 推荐安装指南
---

# Hacknet Mod 推荐安装指南

Hacknet 本体内容有限，扩展玩法靠 **BepInEx 插件**。本文是一份"装了就能玩"的推荐清单与安装步骤——清单参考了一台已安装以下全部 mod 的 Steam 正版实例（`BepInEx/plugins/`），均为社区常见 mod，可放心组合使用。

> 想自己写 mod？先看 [模组开发指南](/hacknet/mods) 与 [快速模组教程](/hacknet/mod-tutorial)。

---

## 0. 前置：BepInEx 本身

Hacknet 是 **32 位（x86）** Unity 游戏，所以要用 **BepInEx 5 的 x86/win-x86 版本**：

1. 去 BepInEx 的 GitHub Releases 下载 `BepInEx_x86_5.x.x.x.zip`
2. 把压缩包**全部内容**解压到游戏根目录 `Hacknet/`
3. **启动一次游戏再退出**，`BepInEx/plugins/` 目录会自动生成
4. 之后每个 mod 就是往 `plugins/` 放一个（或几个）`.dll`，有 `Configs/`、`assets/` 的 mod 要连同整个目录一起复制

---

## 1. 必装框架：Pathfinder

Pathfinder 是 Hacknet 社区**最主流的 mod 框架**，提供类型安全的命令注册、事件与数据访问 API，一大批功能 mod 依赖它。**想装功能 mod，先装 Pathfinder。**

| 文件 | 版本 | 作用 |
|---|---|---|
| `PathfinderAPI.dll` | v5.0 | 框架本体，命令/事件/数据 API |
| `PathfinderUpdater.dll` | v5.0 | 启动时自动检查 Pathfinder 的 GitHub 更新 |

两个文件版本需匹配（参考实例中均为 v5.0）。安装顺序：**PathfinderAPI → 依赖它的 mod**。

---

## 2. 推荐功能 Mod 清单

下表来自一台已装好的正版实例。功能一栏**标注了证据来源**，未标来源的为按名称推断，装上后可在游戏里跑一跑确认。

| Mod | 版本 | 功能 | 依赖 |
|---|---|---|---|
| **CSEL Mod** | v1.3.0 | 本站 [CSEL Mod](/csel-mod)，命令增强（GUID `dev.csel.extension`） | 无 |
| **KernelExtensions** | v0.5.1 | 基于 Pathfinder 的实用功能扩展（官方描述："adds some useful things for Hacknet via Pathfinder API"） | PathfinderAPI |
| **ZeroDayToolKit** | v1.0.4 | 零日工具集（GUID `kr.o_r.prodzpod.zerodaytoolkit`），带音效，可用 `Configs/` 里的 cfg 调音量；内含二进制编解码、beep 等命令 | 无 |
| **KernelFix** | — | 命名看是内核修复补丁，内置打包工具（costura），修复类补丁 | 无 |
| **TempestGadgets** | — | 从命名看是 UI / 特效小工具（内含 gradient / frequency / duration 相关代码） | — |
| **SRPortToolkit** | — | 端口 / 防火墙工具集（内含 firewall / daemons / connections 相关命令） | — |
| **RtSpPortCreaker** | — | 端口破解工具 | — |
| **METEC** | — | 含远程桌面（`mstsc`）相关功能 | — |
| **KT0Startup** | — | 新手启动工具（原模板名 `HacknetPluginTemplate`，含 hnpathfinder / firewall 相关） | — |
| **Some tools** | — | 命名看是小工具合集（frequency / amplitude 相关） | — |

### 按用途推荐组合

- **基础党**（够了）：Pathfinder + KernelExtensions + CSEL Mod
- **工具党**：上面再加 ZeroDayToolKit + SRPortToolkit + RtSpPortCreaker
- **全都要**：上面全部装（参考实例就是全部装的，兼容）

---

## 3. 安装步骤（一步步来）

1. 装好 BepInEx（见第 0 节），确认 `plugins/` 目录存在
2. 下载 **PathfinderAPI + PathfinderUpdater**，把两个 `.dll` 放进 `BepInEx/plugins/`
3. 逐个下载想装的 mod，`.dll` 放 `plugins/`；**有子目录的一起复制**：
   - ZeroDayToolKit → `Configs/kr.o_r.prodzpod.zerodaytoolkit.cfg` 也要复制
   - 带 `assets/` 的（如扫描线修复图）→ `assets/` 整个复制
4. 启动游戏，看日志 `BepInEx/LogOutput.log` 里每个插件是否 `loaded`
5. 验证：游戏内跑 mod 新增的命令，能出效果就装好了

---

## 4. 排障速查

| 症状 | 原因 | 解决 |
|---|---|---|
| Mod 没生效 | DLL 不在 `plugins/`，或依赖缺失 | 看 `LogOutput.log`；依赖 Pathfinder 的先装 Pathfinder |
| 启动崩溃 | 架构不符（x64/AnyCPU） | 用 BepInEx x86，插件必须按 x86 编译 |
| 版本冲突 | 同款 mod 新旧混放 | `plugins/` 里只留一个对应 DLL |
| 卡加载 | Mod 与新版本游戏不兼容 | 把 dll 逐个移出 `plugins/` 定位问题项 |

---

## 5. 卸载

- 把对应 `.dll` 移出/删除 `BepInEx/plugins/`
- 删掉它生成的配置条目（如 `Configs/kr.o_r.prodzpod.zerodaytoolkit.cfg`）
- 保留 `BepInEx/core/` 不动，那是框架本体
