# Contributing to HookRelay

Thank you for your interest in contributing to **HookRelay**! We welcome community contributions to help developers debug, verify, and replay webhooks locally with zero fuss.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raghav1924/hookrelay.git
   cd hookrelay
   ```

2. **Compile TypeScript:**
   ```bash
   npm run build
   # or watch mode
   npm run dev
   ```

3. **Run Unit Tests:**
   ```bash
   npm test
   ```

## Pull Request Guidelines

- Ensure all existing and new unit tests pass (`npm test`).
- Keep changes zero-dependency: utilize Node.js standard libraries (`node:crypto`, `node:http`, `node:fs`).
- Write meaningful, conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`).
- Document new provider HMAC signatures or replay options.

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all discussions and reviews.

---
Maintained by **[Jatin Sharma](https://jatinsh.netlify.app/)** • GitHub: **[@raghav1924](https://github.com/raghav1924)**
