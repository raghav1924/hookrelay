# HMAC Signature Verification Security

HookRelay implements constant-time cryptographic signature verification to prevent timing attacks:
- Uses `crypto.timingSafeEqual` over raw buffer digests.
- Enforces replay attack prevention via timestamp drift tolerance windows (default: 300 seconds).
