---
title: CSEL 独立版
---

# CSEL 独立版 — Code Recovery

基于 OpenHacknet 源码 fork 的独立游戏。  
讲述 CSEL 团队在 NexusCorp 内网渗透的故事。

## 故事背景

玩家是 NexusCorp 内部的程序员，某天外网连接被 NS（网络安全部门）切断。  
通过唯一一条细线连接到 CSEL 的 IRC 服务器，目标：收集 NS 窃取 CSEL 核心代码的证据，通过 Upload Server 传出去。

## 技术特点

- **完全独立**：不依赖原版 Hacknet，独立可执行
- **原汁原味**：保留 OpenHacknet 全部功能
- **新剧情线**：替换原版 Hacknet 故事

## 内置功能

- 剧情驱动的状态机（Stage 枚举）
- 4 个调试节点（D1-D4）用于跳过剧情阶段
- NS 入侵系统（ForkBomb 攻击、文件加密、UI 崩溃）
- TraceV2 追踪系统（25 分钟倒计时）
- 8 台 NSCS 核心服务器集群
- Watchdog AI Boss + Upload Server 终局
- ~70 个 CSEL 专属节点

## 编译

```bash
cd CSEL
dotnet build CSEL.csproj
# 输出到 bin/Debug/net472/CSEL.exe
# 记得复制 CSELNodes/ 到输出目录
```

## 命令

| 命令 | 功能 |
|---|---|
| `crackall` | 一键破全端口 |
| `find` | 全网搜索 |
| `sysinfo` / `wmi` | 系统信息 |
| `clog` | 清目标日志 |
| `kfbs` | 杀所有 ForkBomb |
| `xrestore` | 恢复 x-server.sys |
| `hack` | 一键入侵 |
| `pscan` | 递归节点拓扑 |
