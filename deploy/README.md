# 部署说明

## 1. 服务器准备

```bash
# Node 20+ 已安装
sudo useradd -m -s /bin/bash tutupanel
sudo mkdir -p /srv/tutupanel
sudo chown tutupanel:tutupanel /srv/tutupanel
```

## 2. 拉代码 + 构建

```bash
sudo -u tutupanel -i
cd /srv/tutupanel
git clone https://github.com/chillanthony/tutupanel.git .
npm ci
npm run build
mkdir -p data public/uploads
```

## 3. systemd 启动

```bash
sudo cp deploy/tutupanel.service /etc/systemd/system/
# 编辑 /etc/systemd/system/tutupanel.service 修改 ADMIN_TOKEN
sudo systemctl daemon-reload
sudo systemctl enable --now tutupanel
sudo systemctl status tutupanel
```

## 4. Caddy 反向代理

把 `deploy/Caddyfile` 内容合并到 `/etc/caddy/Caddyfile`，然后：

```bash
sudo systemctl reload caddy
```

## 5. DNS

将 `tutuhuliduionline.top` 的 A 记录指向服务器公网 IP。Caddy 会自动签 HTTPS。

## 更新

```bash
sudo -u tutupanel -i
cd /srv/tutupanel
git pull
npm ci
npm run build
exit
sudo systemctl restart tutupanel
```

## 数据备份

数据库 + 图片在以下两个目录，备份这俩就够了：

- `/srv/tutupanel/data/tutupanel.db`
- `/srv/tutupanel/public/uploads/`
