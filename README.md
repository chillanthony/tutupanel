# tutupanel

兔兔互助队社区面板，部署在 https://tutuhuliduionline.top

## 功能

1. 留言板：发文字 + 上传图片
2. 喂食打卡：每日早/中/晚记录
3. 养兔须知：饲养与互动注意事项

## 技术栈

- Next.js (App Router) + Tailwind
- SQLite (better-sqlite3) + 本地文件存储
- Caddy 反向代理 → Next.js (port 3000)

## To-do

- [ ] DNS 指向服务器（配置 A 记录）
- [ ] 移动端样式检查（真机验证）

> 完整部署步骤见 [`deploy/README.md`](deploy/README.md)。
