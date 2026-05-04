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

- [ ] **修复管理员伪登录**：`saveToken` 不验证就标绿，导致编辑 tips 时才报 401；加 `GET /api/admin/verify` 端点，登录时先校验
- [ ] **改线上 `ADMIN_TOKEN`**：`deploy/tutupanel.service` 默认还是 `change-me`，`sudo systemctl edit tutupanel` 改成强口令后 `daemon-reload && restart`
- [ ] 兔兔历史档案展示
- [ ] 兔兔档案卡（每只兔一个 profile：照片 / 体重 / 偏好）
- [ ] 图片上传压缩 + 缩略图（sharp，webp，列表用缩略图，lightbox 才加载原图）
- [ ] 留言列表 cursor 分页（首屏 20 条，下滑加载）
- [ ] 发布 / 打卡 / tips 编辑改乐观更新，省一次全量拉取
- [ ] POST / upload 加 IP 速率限制
- [ ] 上传文件用 magic-number 校验，不信任 MIME
- [ ] 删留言时一并 unlink `/uploads/` 里的图片
- [ ] 客户端 SWR 缓存，切 tab 回来不再闪骨架
- [ ] 管理员 token 比对用 `timingSafeEqual`
- [ ] 无障碍：图片 alt、表单 label、深色对比度
- [ ] PWA（manifest + service worker，可装主屏 / 离线读 tips）
- [ ] 喂食打卡看板：连续天数 + 月度热力图
