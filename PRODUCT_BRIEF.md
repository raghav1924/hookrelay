# HookRelay — Product Brief

**Product Name:** `hookrelay` (CLI: `hookrelay`)  
**Date:** 2026-11-09  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))  
**GitHub Repository:** `https://github.com/raghav1924/hookrelay`  
**License:** MIT  

---

## 1. Executive Summary & Problem Discovery
In November 2026, building modern web applications, AI agent tools, and full-stack SaaS involves receiving frequent webhooks from Stripe, GitHub, Supabase, Resend, and autonomous AI agents.
However, developers and engineering teams encounter persistent friction:
1. **Local Webhook Debugging Drag:** Testing incoming webhooks locally requires clunky tunnels (ngrok) and manual curl scripting. If an event fails, reproducing and replaying that exact signed payload against local endpoints (`localhost:3000/api/webhooks`) is tedious.
2. **Cryptographic Signature Verification Blindspot:** Webhook signatures (HMAC-SHA256, Stripe `Stripe-Signature`, GitHub `X-Hub-Signature-256`, Supabase hooks) are tricky to verify and simulate without real live events.
3. **No Local In-Memory Inspection Studio:** Existing tools (like RequestBin or Hookdeck) either charge subscriptions, require external cloud sign-ups, or leak private test data to third-party servers.
4. **Agent-to-Backend Event Testing:** When AI agents trigger asynchronous events or background webhooks, developers need an instant, zero-dependency local proxy to intercept, inspect, validate, and replay them on demand.

---

## 2. Product Solution: HookRelay
**HookRelay** is a developer-first, zero-dependency Local Webhook Interceptor, Cryptographic Verifier, Replay Engine & Live Visual Studio.

### Core Capabilities:
- 🚀 **Instant Local Webhook Gateway:** Starts a local HTTP server that accepts webhooks on any endpoint (`POST /webhooks/:provider` or custom routes) with zero configuration.
- 🔐 **Built-in Signature Verifier & Faker:** Simulates and verifies cryptographic signatures out of the box:
  - **Stripe:** `Stripe-Signature` (HMAC-SHA256 `t=timestamp,v1=signature`)
  - **GitHub:** `X-Hub-Signature-256` (`sha256=hash`)
  - **Supabase / Custom HMAC:** Generic secret-keyed SHA256/SHA512 verification
- 🔁 **One-Click Replay Engine:** Replay any captured payload directly to a local target URL (e.g., `http://localhost:3000/api/webhooks/stripe`) with preserved or freshly re-signed timestamps and headers.
- 💻 **Terminal Dashboard (ANSI UI):** Live stream of incoming webhook requests with method, status, payload size, headers, and signature validation badges.
- 🌐 **Interactive Dark-Mode Web Studio (`--web`):** Sleek, Linear/Vercel-inspired browser dashboard on `http://localhost:4040` featuring:
  - Live real-time incoming request timeline
  - Formatted JSON payload viewer with syntax coloring
  - Headers inspector and signature analysis
  - Built-in Mock Webhook Generator (triggers realistic Stripe `checkout.session.completed`, GitHub `push`, or Supabase `INSERT` events locally)
  - One-click "Replay to Target" button
- 📄 **Export & Fixture Generation (`--export`):** Saves captured webhook payloads as reusable test fixtures for Jest, Vitest, or integration tests.
- ⚡ **Zero External Dependencies:** Built with pure TypeScript and Node.js standard libraries (`http`, `crypto`, `fs`).

---

## 3. Tech Stack & Architecture
- **Language:** TypeScript 5.9 (Strict mode)
- **Runtime:** Node.js (>=18.0.0, zero external dependencies)
- **Cryptography:** Native `node:crypto` (HMAC-SHA256, timing-safe buffer comparison)
- **Design System:** Dark-mode terminal typography + Responsive Web Studio (CSS Variables, Flexbox/Grid, Real-time polling/SSE)
- **Testing:** Native Node.js test runner (`node:test`, `node:assert`)
