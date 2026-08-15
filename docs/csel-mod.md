---
title: CSEL Mod
---

# CSEL Extension — Mod for Hacknet

## 概述

CSEL Extension 是一个 BepInEx 插件，同时兼容原版 Hacknet（Steam）和开源版 Hacknet。  
一套代码，双平台构建。

## 双平台构建

```bash
# 编译为开源版 Hacknet
build_open.bat

# 编译为原版 Hacknet
build_original.bat
```

通过编译开关控制目标平台。

## 命令列表

| 命令 | 说明 |
|---|---|
| `crackall` | 破解目标所有端口、绕过代理、解锁防火墙 |
| `find <关键词>` | 在全网搜索文件名或内容 |
| `sysinfo` | 显示系统信息 |
| `wmi` | 显示当前位置和连接状态 |
| `clog` | 清除目标机器的 /log 目录 |
| `kfbs` | 杀死当前系统上所有 ForkBomb 进程 |
| `xrestore` | 恢复被删除的 x-server.sys，修复 UI |
| `pscan` | 从当前节点递归扫描网络拓扑 |
| `ga` | 无需破解，直接获得当前节点管理员权限 |
| `listmods` | 列出加载的模组 |
| `fullscreen` | 切换全屏 |
| `listdir` | 显示目标机器目录树 |

## Harmony 补丁

| 补丁 | 目标方法 | 说明 |
|---|---|---|
| P1 | `MainMenu.DrawBackgroundAndTitle` | F5 面板 + 版本水印 |
| P2 | `ProgramRunner.ExecuteProgram` | 拦截 CSEL 自定义命令，跳过 "No Command" 错误 |

## 安装

将编译产物 `CSEL.dll` 放入游戏的 `BepInEx/plugins/` 目录即可。
