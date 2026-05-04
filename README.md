# tutupanel

兔兔互助队社区面板，部署在 https://tutuhuliduionline.top

扫码访问：

<img src="src/tutu-qr.png" alt="tutuhuliduionline.top QR code" width="200" />

## 功能

1. 留言板：发文字 + 上传图片
2. 喂食打卡：每日早/中/晚记录
3. 养兔须知：饲养与互动注意事项

## 技术栈

- Next.js (App Router) + Tailwind
- SQLite (better-sqlite3) + 本地文件存储
- Caddy 反向代理 → Next.js (port 3000)

> 完整部署步骤见 [`deploy/README.md`](deploy/README.md)。

## To-do

### 视觉风格
- [ ] 自托管中文字体（思源黑体 / 霞鹜文楷）替代系统字体

### 布局
- [ ] 移动端底部 Tab 栏（替代顶部 Tab）
- [ ] 须知按 emoji / 类别加色彩 accent 条

### 可选增强
- [ ] 兔兔历史档案展示
- [ ] 兔兔档案卡（每只兔一个 profile：照片 / 体重 / 偏好）
