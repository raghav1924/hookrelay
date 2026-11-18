# Deployment & Production Operations — HookRelay

**Target:** Local Webhook Interceptor, HMAC Signer & Replay Studio  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))

---

## 1. Container Deployment (Docker)

```bash
docker build -t hookrelay:latest .
docker run -d -p 4040:4040 --name hookrelay hookrelay:latest
```

## 2. Process Manager (PM2)

```bash
npm install -g pm2
pm2 start dist/bin.js --name "hookrelay" -- studio --port 4040
```

## 3. Systemd Service Unit

```ini
[Unit]
Description=HookRelay Background Service
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/hookrelay
ExecStart=/usr/bin/node dist/bin.js studio --port 4040
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
