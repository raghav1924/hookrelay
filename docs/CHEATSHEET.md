# HookRelay CLI Cheatsheet

```bash
# Intercept webhooks locally
hookrelay listen --port 4040

# Forward to local backend
hookrelay listen --port 4040 --forward http://localhost:3000/api/webhooks

# Trigger mock Stripe event
hookrelay mock stripe payment_intent.succeeded
```
