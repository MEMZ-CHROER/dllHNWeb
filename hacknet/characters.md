---
title: 人物与剧情档案
---

# 人物与剧情档案

本页整理了 Hacknet 主线剧情中的主要人物与组织，信息基于游戏源码中的任务、邮件与对话数据。

---

## 人物总览

| 人物/组织 | 身份 | 在剧情中的作用 |
|---|---|---|
| **Bit** | 神秘黑客 | 开场即与你联系，全程引导主线 |
| **CSEC** | 黑客组织 | 招募并发布任务的平台 |
| **Entropy** | 敌对黑客组织 | 中期可选的另一条派系线 |
| **V** | 消息板用户 | lelzSec 相关剧情的高频联系人 |
| **/el** | 消息板运营者 | lelzSec 板块的幕后运营者 |
| **Naix** | 独立黑客 | 主题切换（Theme Hack）剧情的参与者 |
| **X-C Proj. : Bradford** | 项目联络人 | Entropy 线的项目联系人 |
| **Polar Star / 北极星** | 组织 | 一组"试炼"性质的服务器 |
| **Tom Wilkins** | — | 剧情邮件高频发件人之一 |
| **Matt Trobbiani** | — | 剧情邮件高频发件人之一 |

---

## 主要人物

### Bit 🅱️

- **首封邮件**: 《First Contact》
- **关键台词**:
  > "I don't know you, and I'm sad to say that I never will, but if you're reading this it means you might be the only person that can make things right."
  > "Right now I'm trapped. There's no way out, and not enough time, and I need your help."

Bit 是最神秘也最重要的角色。他从头到尾引导你完成一系列任务（`BitMissionIntro` → `BitMission0/1/2` → `BitPath` 终局），把你卷入 CSEC、Entropy、EnTech 的漩涡。

**真相线索**：游戏数据文件 `BitSpeech.txt` 中，Bit 留下一段以 **"14 DAY TIMER EXPIRED : INITIALIZING FAILSAFE"** 开头的自白：

> "My name is Bit, and if you're reading this, I'm already dead."

这暗示 **Bit 在你读到这些文字时已经遇害**——他设置了一个定时故障保险机制，在失联 14 天后自动把信息逐步发给下一个接手的人。终局剧情（`BitPath` / EnTech 公司）会揭示 Bit 生前的工作与遭遇。

### CSEC

- **发件人**: `CSEC Hub Services`（17 封）、`CSEC Admin`（5 封）
- **角色**: 早期招募你的黑客组织，运营任务板（Hub）。

CSEC 通过一套 **试炼（Gauntlet）** 系统筛选新人——你需要在 `CSEC Crossroads Server`、`CSEC Invitation Gauntlet`、`CSEC Gauntlet 02/03` 等服务器中展示实力。通过后获得访问 **CSEC** 主服务器（密码 `admin`）的权限，开始承接 `#CLIENT#` 匿名客户的任务。

### Entropy

- **发件人**: `Entropy`（14 封）、`Entropy Mailbot`（8 封）
- **角色**: 与 CSEC 对立/竞争的另一个黑客组织。

Entropy 通过自己的任务板发布任务（`EntropyMission1.1 → 1.2 → 2 → 3`），涉及 PP Marketing、PointClicker、X-C 项目等目标。SlashBot 新闻对他们评价负面。**选择帮助 Entropy 会改变你对 CSEC 的立场**，影响后期剧情走向。

### V

- **发件人**: 9 封
- **角色**: 与 lelzSec 剧情相关的关键联系人，发布包括北极星试炼在内的一系列任务。

### /el（slash bot 运营者）

- **相关服务器**: `/el Message Board`（sec=6，全游戏最高安全等级之一）、`/el's Secure SecuLock Drive`（密码 `ithoughtyouweremakingtea`）
- **角色**: lelzSec 消息板的运营者，掌握着高端信息渠道。想撬开他的资料库可不容易。

### Naix

- **发件人**: 4 封（含 `naix@jmail.com`）
- **相关服务器**: **Naix Root Gateway** `173.194.35.172`（密码 `roxxane`）、`Proxy_Node-X04`、`KyonBox` `176.194.38.111`
- **角色**: 主题黑客（Theme Hack）剧情线的关键人物——一个偏好"更换系统主题"这种另类攻击手法的黑客。

### Polar Star / 北极星

- **发件人**: `Polar Star`（2 封）
- **相关服务器**: `Shrine of the Polar Star` → `Trial of Patience/Haste/Diligence/Focus` → `Head of the Polar Star`
- **角色**: 一套以"试炼"命名的组织，考验玩家的耐心、速度、勤奋与专注。

---

## 剧情时间线

```
第一封邮件（CSEC 招募）
    ↓
SSH 破解教程（Viper-Battlestation）
    ↓
Bit 出现：《First Contact》 → 删除 SecurityTracer.exe
    ↓
BitMission 0 / 1 / 2（Bit 逐步抛出难题）
    ↓
CSEC 试炼（Gauntlet）→ 任务板开放
    ↓
自由任务：#CLIENT# / V / Naix 等发来的委托
    ├──（可选）Entropy 派系线
    ├──（可选）lelzSec / 北极星试炼
    ↓
终局：BitPath / EnTech 公司 → Bit 的真相
    ↓
结局 → Credits Server（226.187.99.3）
```

---

## 背景设定速记

- **HacknetOS**：游戏中的系统环境，按 Bit 的说法"本不该以现在的形态发布"——其中内置了会自动激活的追踪器。
- **EnTech**：终局剧情的关键公司，Bit 生前与之相关，其基础设施（`156.151.x.x` 网段）是终局任务的主要战场。
- **Bitwise**：与 Bit 相关的服务器集群（`Bitwise Repo Base`、`Bitwise Drop Server`、`Bitwise Relay 01`），藏有揭示 Bit 身份与结局的关键资料。
