# Public Tunneling Integration

Pair HookRelay with Cloudflare Tunnel or Tailscale Funnel:
```bash
# Start HookRelay on port 4040
node dist/bin.js listen --port 4040

# In another terminal:
cloudflared tunnel --url http://localhost:4040
```
