---
title: 全流程攻略
---

# Hacknet 主线全流程攻略

本攻略基于原版 Hacknet / OpenHacknet 源码任务数据整理，按游戏推进顺序排列。  
涉及的关键服务器、密码均来自游戏真实数据。

> 提示：全程记得**清日志**——入侵后 `cd log` → `rm *`，不然会被追踪。

---

## 阶段 0 · 教程：SSH 破解

**任务文件**: `SSHCrackMission.xml`

开局你收到来自 **CSEC** 的招募邀请，第一步是完成一场"SSH 破解"测试。

1. `scan` 找到 **Viper-Battlestation**（玩家的练习节点）
2. 从该节点的 `/bin` 获取 `SSHcrack.exe`
3. `exe SSHcrack 22` 破解 22 端口
4. 端口数达到要求后 `exe PortHack` 获取管理员权限

完成后你会收到 CSEC 的后续任务。

---

## 阶段 1 · Bit 的"第一封邮件"

**任务文件**: `BitMissionIntro.xml` | 发件人：**Bit**

正当你忙活着任务板的事，一个神秘人 **Bit** 发来邮件 **《First Contact》**：

> "Right now I'm trapped. There's no way out, and not enough time, and I need your help."
> "HacknetOS wasn't meant to be released as it is now — after a while an automated tracker will activate itself — we can't let that happen."

**目标**：连接你自己的节点（netMap 上绿色的那个），在 `bin` 里找到并删除 `SecurityTracer.exe`。

之后回复邮件，进入 Bit 的系列任务（`BitMission0/1/2`）：

- **BitMission0** — 一台 "Bitwise Test PC"（sec=1）
- **BitMission1** — "P. Anderson's Bedroom PC"（sec=1）
- **BitMission2** — 帮 Bit 找到 **Entropy 的测试服务器**（`199.59.149.230`，sec=1，带代理）

Bit 会一步步把你卷入一场更大的事件——随着剧情推进你会发现，**Bit 可能已经不在人世了**（详见 [人物与剧情档案](/hacknet/characters)）。

---

## 阶段 2 · CSEC 招募测试（Gauntlet）

**任务文件**: `MainHub/Intro/` 系列 | 发件人：**CSEC Hub Services**

完成教程后，CSEC 会邀请你参加**新人试炼**。你要逐一破解：

| 服务器 | 安全等级 | 特点 |
|---|---|---|
| CSEC Crossroads Server `101.0.89.154` | 0 | 入口/岔路口 |
| CSEC Public Drop Server | 3 | 代理 |
| CSEC Invitation Gauntlet | 2 | 防火墙 + 代理 |
| CSEC Gauntlet 02 | 2 | 代理 |
| CSEC Gauntlet 03 | 3 | 防火墙 + 代理 |

通过试炼后你获得 CSEC 的信任，可以访问 **CSEC** 主服务器（`ContractHubComp.xml`，sec=5，密码 `admin`）以及 **CSEC Assets Server**（sec=4，管理员密码 `csec-5xg3D11`）。

此后任务板（Hub）向你开放，你可以接下 **#CLIENT#**（匿名客户）发布的各类任务。

---

## 阶段 3 · 任务板任务

**发件人**: CSEC Hub Services (17 封) / #CLIENT# (11 封) / V (9 封)

这个阶段是自由任务阶段，围绕几张地图展开：

### Decypher 系列（解密任务）
- **DEC Solutions Web Server** `101.0.89.154`（sec=2，防火墙+代理）
- **Joseph Scott's Battlestation** `101.0.89.154`（sec=3）
- **DEC Solutions Mainframe** `101.0.89.154`（sec=5，防火墙+代理）
- **Macrosoft Workhorse Server 04** `168.61.82.245`（sec=3，防火墙+代理）
- **Macrosoft Storage Server** `168.61.82.246`（sec=5）

### KFC 系列（CFC 公司）
- **www.cfc.com**（sec=2）
- **CFC Records Repository** `202.7.177.65`（sec=2，防火墙+代理）
- **CFC Corporate Mainframe**（sec=5，防火墙+代理）

### Pacemaker 系列（医疗起搏器）
- **KBT-PM 2.44** `202.6.141.219`（sec=1）
- **Kellis Biotech Client Services** `66.96.147.84`（sec=4，防火墙）
- **Kellis Biotech Production Asset Server** `66.96.148.1`（sec=4，防火墙）
- **Eidolon Soft Production Server** `111.105.22.1`（sec=4，防火墙）

### 核心服务器（中后期解锁）
- **ISP Management Server** `68.144.93.18`（sec=5，防火墙+代理，密码 `tracert`）
- **Death Row Records Database** `168.51.178.4`（sec=5，防火墙+代理，密码 `texas`）
- **Universal Medical** `208.93.170.15`（sec=5，防火墙+代理，密码 `codeine`）
- **International Academic Database** `129.67.0.11`（sec=5，防火墙+代理，密码 `techtonic`）
- **JMail.com** `74.125.237.119`（sec=5）
- **Timekeeper's Vault** `24.43.69.78`（sec=5）
- **www.reddit.com**（sec=4）
- **Network Education Archives**（sec=6）

---

## 阶段 4 · Entropy 派系线（可选分支）

**任务文件**: `Entropy/` 系列 | 发件人：**Entropy / Entropy Mailbot**

游戏中期会接触到 **Entropy**——一个和 CSEC 对着干的黑客组织（SlashBot 新闻对他们持负面态度）。如果选择帮助他们：

- **Entropy Asset Cache**（sec=1，防火墙）
- **PP Marketing Inc.** `74.125.237.119`（sec=2，防火墙+代理）
- **PointClicker**（sec=2，防火墙+代理）
- **X-C Project Tablet**（sec=2，防火墙+代理，密码 `cyberdisk`）
- **Milburg High IT Office**（sec=2，防火墙+代理）
- **Entropy Asset Server**（sec=4）
- **Entropy Contract Database**（sec=5）
- **Entropy test Server** `199.59.149.230`（sec=1，代理）

> ⚠️ Entropy 线有分支后果：帮 Entropy 会直接影响你对 **CSEC** 的立场，后期某些剧情走向会改变。

---

## 阶段 5 · lelzSec / 北极星试炼

**任务文件**: `lelzSec/` 系列 | 发件人：**V** / **Polar Star**

**lelzSec** 是一条高端支线，围绕消息板运营者 **/el** 展开：

### Nortron 系列
- **Nortron Mail Server**（sec=1，防火墙）
- **Nortron Web Server**（sec=2，防火墙）
- **Nortron Internal Services**（sec=2，防火墙）
- **Nortron Mainframe**（sec=5，防火墙）

### SecuLock
- **Stormrider** `199.89.130.68`（sec=2，密码 `ithoughtyouweremakingtea`）
- **/el's Secure SecuLock Drive** `69.172.201.208`（sec=4，密码 `ithoughtyouweremakingtea`）

### 北极星试炼（Polar Snake）
一序列递增难度的试炼服务器：

| 试炼 | IP | 安全等级 | 特点 |
|---|---|---|---|
| Shrine of the Polar Star | `103.31.7.34` | 0 | 起点 |
| Trial of Patience | `103.31.7.38` | 1 | 代理 |
| Head of the Polar Star | `103.33.8.162` | 1 | — |
| Tail of Diligence | `103.31.8.2` | 2 | 防火墙 |
| Trial of Haste | `103.31.7.41` | 3 | 代理 |
| Trial of Diligence | `103.31.8.1` | 4 | 防火墙 |
| Trial of Focus | `103.31.7.211` | 5 | 防火墙 + 代理 |

还有 **/el Message Board**（sec=6），属于游戏中最高的安全等级之一。

---

## 阶段 6 · 终局：Bit 的真相（EnTech / BitPath）

**任务文件**: `BitPath/` 系列 | 发件人：**Bit**（最后阶段）

剧情高潮围绕 **EnTech** 公司展开——Bit 的故事和这家公司紧密相连。你需要潜入 EnTech 的整个基础设施：

| 服务器 | IP | 安全等级 | 管理员密码 |
|---|---|---|---|
| EnTech Workstation Core | `156.151.0.0` | 1 | — |
| EnTech Web Server | — | 4 | `ax889msjA` |
| EnTech Workstation _001~_012 | `156.151.0.x` | 5 | — |
| En_Prometheus | `156.151.1.1` | 5 | `d88vAnnX` |
| En_Romulus | `156.151.1.12` | 5 | `h7ggNKl2` |
| EnTech Mail Server | `156.151.59.82` | 5 | `ax889msjA` |
| EnTech External Contractor Relay | `156.151.59.35` | 5 | `ax889msjA` |
| EnTech_Offline_Cycling_Backup | — | 5 | 防火墙+代理 |
| Bitwise Repo Base | `23.236.62.147` | 5 | `tenzen` |
| Bitwise Drop Server | `108.160.165.139` | 5 | 防火墙 |

**Bitwise** 系列服务器（`Bitwise Drop Server`、`Bitwise Repo Base`、`Bitwise Relay 01`）是解开 Bit 身份的关键线索——在那里你会发现 Bit 留下的"自动化遗言"。

最终任务 `bit02_finale01` 会带你走向结局。

---

## 结局

**任务文件**: `CreditsMission.xml` → **Credits Server** `226.187.99.3`

通关后进入 Credits 服务器，观看制作人员名单。

> 💡 存档里可以查看 BitSpeech：`Content/BitSpeech.txt` 记载了一段 **"14 DAY TIMER EXPIRED : INITIALIZING FAILSAFE"** 的文本——
>
> > "My name is Bit, and if you're reading this, I'm already dead."
>
> 这暗示 Bit 的剧情线基于一个**定时触发的自动化机制**：Bit 在失联 14 天后，"故障保险"自动向你发出所有信息。

---

## 关键密码速查

| 服务器 | 密码 |
|---|---|
| CSEC | `admin` |
| CSEC Assets Server | `csec-5xg3D11` |
| ISP Management Server | `tracert` |
| Death Row Database | `texas` |
| Universal Medical | `codeine` |
| International Academic DB | `techtonic` |
| Bitwise Repo Base | `tenzen` |
| EnTech 系（Web/Mail/Relay） | `ax889msjA` |
| En_Prometheus | `d88vAnnX` |
| En_Romulus | `h7ggNKl2` |
| Naix Root Gateway | `roxxane` |
| SecuLock / Stormrider | `ithoughtyouweremakingtea` |
| X-C Project Tablet | `cyberdisk` |

> 普通用户的密码往往来自常见密码库（`passwords.txt`），破解不了就试试那些常用弱密码。
