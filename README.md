# ⚡ HookRelay

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-emerald.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Security](https://img.shields.io/badge/HMAC-SHA256-cyan.svg)](https://nodejs.org/api/crypto.html)

**Developer-first Local Webhook Interceptor, Cryptographic Verifier, Replay Engine & Live Visual Studio.**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Cryptographic Verification](#-supported-webhook-protocols) • [Web Studio](#-interactive-webhook-studio) • [CLI Flags](#-cli-options--flags)

</div>

---

## 💡 Why HookRelay?

In modern full-stack SaaS, microservices, and AI agent architectures, applications depend on asynchronous webhooks from **Stripe, GitHub, Supabase, Resend**, and autonomous coding agents.

However, local webhook development is notoriously painful:
- Setting up tunnels (ngrok) and manual curl commands for every test case is clunky.
- Validating cryptographic signatures (`Stripe-Signature`, `X-Hub-Signature-256`, HMAC-SHA256) is tricky to simulate locally.
- When a webhook handler fails, reproducing and replaying that exact signed payload requires cumbersome re-triggering from provider dashboards.
- Cloud inspection tools (RequestBin, Hookdeck) leak private test payloads to remote servers or gate features behind paywalls.

**HookRelay** runs 100% locally with **zero external dependencies**: it acts as an instant local webhook gateway, validates/signs HMAC cryptographic headers in constant time, allows one-click replays to your local API (`localhost:3000/api/webhooks`), and provides an interactive dark-mode Web Studio.

---

## ✨ Key Features

- ⚡ **Instant Local Ingestion:** Receives webhooks on any endpoint (`POST /webhooks/:provider` or custom routes) with sub-millisecond response times.
- 🔐 **Native Cryptographic HMAC Verifier:**
  - **Stripe:** Verifies `Stripe-Signature` (`t=timestamp,v1=hash`) with constant-time buffer comparison.
  - **GitHub:** Verifies `X-Hub-Signature-256` (`sha256=hash`).
  - **Supabase / Custom:** Verifies generic HMAC-SHA256 headers.
- 🔁 **One-Click Replay Engine:** Replay any captured event directly to your local backend (`http://localhost:3000/api/webhooks`) with preserved or fresh signatures.
- 🌐 **Interactive Dark-Mode Web Studio (`http://localhost:4040`):** Real-time feed of captured webhooks, JSON syntax tree viewer, headers table, and one-click mock event generator.
- 🧪 **Built-in Mock Webhook Generator:** Instantly simulate authentic Stripe `checkout.session.completed`, GitHub `push`, or Supabase `INSERT` events locally without needing test cards or remote accounts.
- 📄 **Fixture Export:** Export any webhook event directly into JSON test fixtures for Vitest, Jest, or CI/CD test suites.
- 🚀 **Zero External Dependencies:** Built with pure TypeScript and Node standard libraries (`http`, `crypto`, `url`) for instant startup and zero supply-chain risk.

---

## 🚀 Quick Start

### 1. Start the Local Webhook Gateway & Studio
\`\`\`bash
# Starts receiver on port 4000 & Web Studio on port 4040
npx hookrelay listen
\`\`\`

### 2. Auto-Forward to Your Local App
\`\`\`bash
# Automatically forward all received webhooks to your Next.js / Express API
npx hookrelay listen --forward http://localhost:3000/api/webhooks/stripe --secret whsec_test_secret_123
\`\`\`

### 3. Generate a Signed Mock Webhook Fixture
\`\`\`bash
npx hookrelay mock stripe --export ./tests/fixtures/stripe-checkout.json
\`\`\`

---

## 🔐 Supported Webhook Protocols

| Provider | Signature Header | Hash Algorithm | Format Verified |
|---|---|---|---|
| **Stripe** | `Stripe-Signature` | HMAC-SHA256 | `t=timestamp,v1=signature` |
| **GitHub** | `X-Hub-Signature-256` | HMAC-SHA256 | `sha256=signature` |
| **Supabase** | `X-Signature-256` | HMAC-SHA256 | Standard hex digest |
| **Custom HMAC** | Configurable | HMAC-SHA256 | Raw hex digest |

All cryptographic comparisons use `node:crypto`'s `timingSafeEqual` to prevent timing attack vulnerabilities.

---

## 🌐 Interactive Webhook Studio

Access `http://localhost:4040` while HookRelay is running to interactively inspect and replay incoming traffic:

- **Live Activity Feed:** Real-time list of captured requests with provider badges (`stripe`, `github`, `supabase`).
- **Cryptographic Status:** Instant visual validation indicator showing whether HMAC signature verification passed or failed.
- **Interactive Replay:** Test your local application handler with custom target URLs at the click of a button.
- **One-Click Mock Dispatcher:** Trigger sample webhooks directly from the UI header to test downstream workflows without internet access.

---

## 🛠 CLI Options & Flags

\`\`\`bash
hookrelay <command> [options]

Commands:
  listen, start          Start local webhook ingestion gateway & web studio (default)
  mock <provider>        Generate signed mock event ('stripe' | 'github' | 'supabase')
  help                   Show help documentation

Flags:
  --port <port>          Port for webhook receiver (default: 4000)
  --web-port <port>      Port for interactive Web Studio (default: 4040)
  --forward <url>        Auto-forward incoming hooks to local URL (e.g. localhost:3000/api/webhooks)
  --secret <key>         Webhook secret key for HMAC validation & signing
  --provider <type>      Default provider ('stripe', 'github', 'supabase', 'custom')
  --export <file.json>   Save mock event as a JSON test fixture
  --no-web               Run headless CLI gateway without browser Studio
\`\`\`

---

## 👨‍💻 Author & Open Source

Created with ❤️ by **[Jatin Sharma](https://jatinsh.netlify.app/)**  
*Full-Stack Engineer & Product Designer*

- 🌐 **Portfolio & Case Studies:** [https://jatinsh.netlify.app/](https://jatinsh.netlify.app/)
- 🐙 **GitHub:** [@raghav1924](https://github.com/raghav1924)
- 📦 **Repository:** [https://github.com/raghav1924/hookrelay](https://github.com/raghav1924/hookrelay)

Distributed under the [MIT License](LICENSE).
