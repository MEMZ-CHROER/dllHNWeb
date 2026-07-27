---
title: 快速入门
---

# Hacknet 玩法指南

## 什么是 Hacknet？

Hacknet 是一个终端模拟黑客游戏。你通过输入命令来探索网络、破解服务器、窃取数据。

---

## 基本操作

| 命令 | 功能 | 说明 |
|---|---|---|
| `ls` / `dir` | 列出当前目录文件 | 查看当前文件夹的内容 |
| `cd <文件夹>` | 切换目录 | 进入子文件夹，`cd ..` 返回上级 |
| `cat <文件>` | 查看文件内容 | `cat Analysis.txt` |
| `connect <IP>` | 连接目标服务器 | `connect 192.168.1.1` |
| `disconnect` / `dc` | 断开当前连接 | 回到自己的电脑 |
| `scan` | 扫描目标端口 | 显示目标开放的所有端口 |
| `probe` / `nmap` | 侦察目标 | 查看目标系统信息、防火墙、代理状态 |
| `exe <程序> <参数>` | 运行可执行文件 | 如 `exe SSHcrack 22` |

---

## 端口破解系统

每台服务器都有若干开放端口：

| 端口 | 程序 | 名称 |
|---|---|---|
| 22 | SSHcrack.exe | SSH 破解 |
| 21 | FTPBounce.exe | FTP 反弹 |
| 25 | SMTPoverflow.exe | SMTP 溢出 |
| 80 | WebServerWorm.exe | Web 服务器蠕虫 |
| 1433 | SQL_MemCorrupt.exe | SQL 内存破坏 |
| 3724 | WoWHack.exe | WoW 服务破解 |

每个破解程序占用一定 **RAM**。你的电脑总 RAM 有限，运行的程序越多可用 RAM 越少。

---

## 防火墙

部分服务器有防火墙：

1. 使用 `solve` 命令进入防火墙界面
2. 按正确顺序点击序列破解
3. 4-6 层，逐层深入
4. 成功后可获得目标管理员权限

---

## 代理

有代理的服务器必须先绕过才能连接。使用 `SSLTrojan.exe` 或代理破解工具。

---

## 追踪系统

- 连接时间越长，追踪进度越高
- 追踪完成后管理员会踢出你
- 使用 `TraceKill.exe` 可以清除追踪
- 追踪状态显示在屏幕左下角

---

## 文件系统

| 路径 | 说明 |
|---|---|
| `/home` | 用户目录 |
| `/bin` | 破解程序目录 |
| `/sys` | 系统文件（x-server.sys 主题配置） |
| `/log` | 系统日志 |

`scp <源> <目标>` 在不同机器间传文件。

---

## 进程管理

- `ps` — 查看运行中的进程
- `kill <PID>` — 终止进程
- `reboot` — 重启系统（清除所有程序）

---

## 常用工具

- `SecurityTracer.exe` — 反追踪
- `Decypher.exe` — 解密文件
- `Sequencer.exe` — 自动化破解
- `ForkBomb.exe` — 系统炸弹
- `PortHack.exe` — 一键端口破解

---

## 主题配置

- `x-server.sys` 控制系统主题配色
- 可用主题：`TerminalOnlyBlack` / `HacknetBlue` / `HacknetWhite` / `GreenCompact` / `Amber` / `PastleSim`
- 修改后执行 `reloadtheme` 立即生效
