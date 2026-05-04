# 部署说明

> 假设服务器已安装 Node 20+ 与 Caddy，并且你直接用现有用户（比如 `root` 或 `ubuntu`）运行。

## 1. 拉代码 + 构建

```bash
sudo mkdir -p /srv/tutupanel
sudo chown "$USER":"$USER" /srv/tutupanel
cd /srv/tutupanel
git clone https://github.com/chillanthony/tutupanel.git .
npm ci
npm run build
mkdir -p data public/uploads
```

## 2. systemd 启动

```bash
sudo cp deploy/tutupanel.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now tutupanel
sudo systemctl status tutupanel
```

## 3. Caddy 反向代理

把 `deploy/Caddyfile` 内容合并到 `/etc/caddy/Caddyfile`，然后：

```bash
sudo systemctl reload caddy
```

## 更新

```bash
cd /srv/tutupanel
git pull
npm ci
npm run build
sudo systemctl restart tutupanel
```

## 数据备份

数据库 + 图片在以下两个目录，备份这俩就够了：

- `/srv/tutupanel/data/tutupanel.db`
- `/srv/tutupanel/public/uploads/`
