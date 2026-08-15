---
title: 终端命令速查
---

# 终端命令速查

常用 Linux / bash 命令速查表。Hacknet 的终端界面本质上是仿 Linux 命令行，学会这些命令对你的黑客技术也有帮助 😉

---

## 1. 文件与目录

| 命令 | 作用 | 示例 |
|---|---|---|
| `pwd` | 显示当前目录 | `pwd` |
| `ls` | 列出文件 | `ls -la`（含隐藏文件、详情） |
| `cd` | 切换目录 | `cd /var/log`、`cd ..` |
| `mkdir` | 建目录 | `mkdir project` |
| `touch` | 建空文件 | `touch README.md` |
| `cp` | 复制 | `cp a.txt b.txt`、`cp -r dir1 dir2` |
| `mv` | 移动/重命名 | `mv old.txt new.txt` |
| `rm` | 删除 | `rm file`、`rm -rf dir` ⚠️ |
| `cat` | 打印文件内容 | `cat config.yml` |
| `less` | 分页查看 | `less big.log`（q 退出） |
| `head` / `tail` | 看开头/结尾 | `tail -f log`（实时跟踪） |

## 2. 权限与用户

| 命令 | 作用 | 示例 |
|---|---|---|
| `sudo` | 用管理员身份执行 | `sudo apt update` |
| `chmod` | 改权限 | `chmod +x script.sh` |
| `chown` | 改属主 | `sudo chown user:user file` |
| `whoami` | 当前用户 | `whoami` |
| `su` | 切换用户 | `su root` |

## 3. 进程

| 命令 | 作用 | 示例 |
|---|---|---|
| `ps` | 查看进程 | `ps aux` |
| `top` / `htop` | 实时进程监控 | `top` |
| `kill` | 结束进程 | `kill -9 1234` |
| `jobs` / `fg` / `bg` | 前后台任务 | `sleep 100 &` |

## 4. 网络

| 命令 | 作用 | 示例 |
|---|---|---|
| `ping` | 测连通 | `ping example.com` |
| `curl` | HTTP 请求 | `curl -I https://example.com` |
| `wget` | 下载文件 | `wget https://.../file.zip` |
| `ssh` | 远程登录 | `ssh user@host` |
| `scp` | 远程复制 | `scp file user@host:/tmp/` |
| `netstat` / `ss` | 查看端口 | `ss -tlnp` |
| `traceroute` | 路由跟踪 | `traceroute example.com` |

## 5. 文本处理（高频组合拳）

| 命令 | 作用 | 示例 |
|---|---|---|
| `grep` | 按模式搜索 | `grep -rn "TODO" src/` |
| `sed` | 流编辑 | `sed -i 's/old/new/g' file` |
| `awk` | 按列处理 | `awk '{print $1}' file` |
| `sort` | 排序 | `sort -n`（按数字） |
| `uniq` | 去重 | `sort f \| uniq -c`（统计出现次数） |
| `wc` | 计数 | `wc -l file`（行数） |
| `\|`（管道） | 上一个命令输出给下一个 | `cat log \| grep error \| wc -l` |

## 6. 压缩与归档

| 命令 | 作用 | 示例 |
|---|---|---|
| `tar` | 打包 | `tar -czf out.tar.gz dir/` |
| `unzip` | 解压 zip | `unzip file.zip` |
| `zip` | 压缩 zip | `zip -r out.zip dir/` |
| `xz` / `gzip` | 压缩文件 | `gzip file` |

## 7. 系统

| 命令 | 作用 | 示例 |
|---|---|---|
| `df` | 磁盘空间 | `df -h` |
| `du` | 目录占用 | `du -sh *` |
| `uname` | 内核信息 | `uname -a` |
| `which` | 命令路径 | `which python3` |
| `history` | 历史命令 | `history` |
| `man` | 查看手册 | `man ls` |

---

## 10 个高频组合用法

```bash
# 1. 统计日志里某个错误出现次数
grep "ERROR" app.log | wc -l

# 2. 找最大的 5 个文件
du -sh * | sort -rh | head -5

# 3. 看端口被谁占用
ss -tlnp | grep :8080

# 4. 批量改文件名（a.txt -> b.txt）
rename 's/a/b/' *.txt      # 或 for f in *.txt; do mv $f ${f/a/b}; done

# 5. 后台跑个任务，日志写到文件
nohup ./server > server.log 2>&1 &

# 6. 实时跟踪多个日志
tail -f log1.log log2.log

# 7. 递归搜索并替换目录下所有文件
grep -rl "旧文字" . | xargs sed -i 's/旧文字/新文字/g'

# 8. 杀掉匹配名字的进程
pkill -f "node server.js"

# 9. 统计文件行数最多的 5 个 .cs 文件
find . -name "*.cs" | xargs wc -l | sort -rn | head -6

# 10. 连接远程服务器（Hacknet 里的 sshcrack 成功后的效果）
ssh -p 2222 user@1.2.3.4
```

> ⚠️ 小心 `rm -rf`、`dd`、`mkfs` 这类破坏性命令——执行前再三确认路径。
