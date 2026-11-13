# HookRelay Architecture & Cryptographic Engine

This document provides a detailed technical architecture of **HookRelay**'s local webhook interceptor, HMAC verification pipeline, and replay architecture.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## Architectural Workflow

```
Inbound Webhook HTTP Request (Stripe, GitHub, Supabase, etc.)
                          │
                          ▼
             [ Local Ingress Proxy (Port 4040) ]
                          │
                          ├────────────────────────┐
                          ▼                        ▼
             [ Signature Verifier ]      [ Payload Buffer ]
             - Timing-safe HMAC check    - JSON normalization
             - Tolerance timestamp audit - Metadata tagging
                          │                        │
                          └───────────┬────────────┘
                                      │
                                      ▼
                        [ In-Memory Event Journal ]
                                      │
                       ┌──────────────┴──────────────┐
                       ▼                             ▼
              [ Forwarding Relay ]         [ Dark-Mode Studio ]
              (Target: localhost:3000)      (Live Inspector :4040)
                       │
                       ▼
              [ One-Click Replay ]
```

---

## 1. Timing-Safe HMAC Cryptographic Verification (`src/core/verifier.ts`)

To defend against timing side-channel attacks during webhook verification, HookRelay uses native constant-time comparisons (`crypto.timingSafeEqual`):
- **Stripe V1 Scheme:** Extracts timestamp $t$ and signatures $v_1$ from `stripe-signature`. Reconstructs signature target $t \cdot \text{payload}$ and computes HMAC-SHA256 with the webhook signing secret.
- **GitHub SHA256 Scheme:** Verifies `sha256=` prefixed signature headers against raw request byte buffers.
- **Replay Attack Tolerance:** Enforces a configurable 300-second timestamp drift ceiling to mitigate message replay attacks.

---

## 2. In-Memory Ring Buffer Journal

HookRelay buffers incoming events in a FIFO circular journal with zero disk I/O latency, making it ideal for high-throughput testing during batch webhook deliveries without database locks.

