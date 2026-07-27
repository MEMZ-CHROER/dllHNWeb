---
title: 主线剧情
---

# Hacknet 主线剧情

基于 OpenHacknet 源码中的任务 XML 文件和脚本内容还原。

---

## 序幕：Bit 的遗言

> *"My name is Bit, and if you're reading this, I'm already dead."*

游戏开场是一段来自 **Bit** 的录音——一名已经遇害的黑客。他通过预先录制的邮件系统，在死后一步步引导玩家完成他的遗愿。

---

## 第一阶段：教程与初次接触

玩家启动 HacknetOS，完成系统初始化后，收到 Bit 的第一封邮件 **"First Contact"**：

> 我不知道你是谁，也永远不会知道。但如果你读到这封信，你可能是唯一能让事情回到正轨的人。
>
> 我现在被困住了。没有出路，时间也不够。我需要你的帮助。

Bit 的指令很简单：连接到自己的节点，找到并删除 `SecurityTracer.exe`。这个程序是 HacknetOS 自带的追踪器——它不应该被发布出来。

完成之后，Bit 发来 **"Maiden Flight"**，指导玩家破解第一台测试服务器 `bitMission00`，学习使用 `scan`、`probe`、`SSHcrack` 和 `PortHack`。

Bit 的后续邮件 **"Something in return"** 告诫玩家一个最重要的习惯：**清日志**。

> 如果你会忘记我告诉你的任何事，那请记住这一件——别马虎。删除你的日志。
> 你在任何现代操作系统上做的每一件事都会被记录在 \~/log 文件夹里。进去，\>rm \*。

---

## 第二阶段：阵营选择

完成 Bit 的初始任务后，玩家面临阵营选择：

### Entropy（黑客行动主义）

初始阵营。Entropy 是一群崇尚混乱的黑客活动分子。玩家通过完成合约提升声望：
- **声望 3**：解锁 Entropy 任务线
- **最终任务**：从三家公司的服务器上窃取 HacknetOS 源代码，完成一次轰动性的黑客行动

### CSEC（雇佣黑客组织）

CSEC 是一个黑客雇佣组织，总部位于 **mainHub**。玩家可以通过 Entropy 的邀请或直接联系加入 CSEC。
- **声望 1**：获得 ThemeChanger.exe
- **声望 4**：Bit 任务线接入 CSEC 中枢
- **声望 7**：触发 **Project Junebug**（心脏起搏器相关任务）
- **声望 10**：强制启动 Bit Path 最终任务线

---

## 第三阶段：Bit 之路（主线核心）

这是游戏的核心剧情。Bit 生前在 **EnTech** 公司工作，创造了 PortHack。他发现了 EnTech 的一个危险项目，并因此丧命。

玩家通过一系列任务深入调查 EnTech：
1. **BitAdv_Intro** — 潜入 EnTech 的系统，搜集情报
2. **BitAdv_Recovery** — 恢复被加密的数据，使用 Decypher.exe 破解 `.dec` 文件
3. 揭露 EnTech 开发危险技术的真相

途中会遇到 **Naix**——一名敌对黑客。在 "Theme Hack" 事件后，Naix 会追踪并攻击玩家的电脑。

---

## 最终章：终结 PortHack

Bit 的最后一封邮件 **"Terminal"** 发来：

> 我意识到我没有时间写完这一切了——要学的东西太多，而我一件都来不及做。

Bit 请求玩家摧毁 **PorthackHeart** 服务器——这是 PortHack 系统的核心，一旦被摧毁，PortHack 就再也不能被用作武器。

连接至 `porthackHeart` 服务器，在其上运行 PortHack。PorthackHeart 守护进程检测到这一操作后，会"碎裂心脏"。

随后，游戏播放 Bit 的最终演说录音，屏幕滚动显示 Bit 的遗言，演职员表伴随 "Bit(Ending)" 音乐滚动。

---

## 结局

- **Bit Path 结局（正统结局）**：毁掉 PorthackHeart → Bit 的最终演讲 → 演职员表
- **Entropy 结局**：从三台公司服务器窃取 HacknetOS 源代码 → 闪白结束
- **DLC Labyrinths 结局**：涉及飞机失事调查、Striker 角色线 → 独立结局

---

## 关键人物

| 角色 | 说明 |
|---|---|
| **Bit** | 已故黑客，游戏叙述者。整个游戏是 Bit 死前录制的邮件序列 |
| **V** | CSEC 联系人，Bit 的朋友，在 Bit 之路中引导玩家 |
| **Naix** | 敌对黑客，在 Theme Hack 事件后追踪和攻击玩家 |
| **Striker** | DLC 角色，涉及航空公司任务线 |

## 关键地点

| 节点 id | 说明 |
|---|---|
| `mainHub` | CSEC 总部，任务发布中心 |
| `entropy00` | Entropy 总部 |
| `bitMission00` | Bit 的测试服务器 |
| `EnTechWeb / EnTechMainframe` | EnTech 公司系统 |
| `porthackHeart` | PortHack 核心服务器（最终目标） |
| `pacemaker01` | 医院心脏起搏器服务器 |
