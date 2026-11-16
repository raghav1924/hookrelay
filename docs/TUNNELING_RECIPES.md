# Cloudflare & Tailscale Tunneling Recipes

Recipes for receiving live webhooks on your laptop:
```bash
# Cloudflare Tunnel
cloudflared tunnel --url http://localhost:4040

# Tailscale Funnel
tailscale funnel 4040
```
