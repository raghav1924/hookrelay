# Changelog

All notable changes to **HookRelay** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-09

### Added
- Local webhook proxy and gateway listening on configurable port (`:3030`).
- Cryptographic HMAC-SHA256 signature verification and generation for Stripe, GitHub, and custom providers.
- Timing-safe signature comparisons via `crypto.timingSafeEqual` preventing timing attacks.
- One-click payload replay engine forwarding captured events to local application endpoints (`http://localhost:3000`).
- Interactive dark-mode Web Studio on `http://localhost:3031` with event inspector, headers viewer, and instant replay button.
- Mock webhook event synthesizer (`hookrelay mock stripe.payment_intent.succeeded`).
- Zero external dependencies.
