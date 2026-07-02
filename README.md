# @blacklight/platform

[![CI](https://github.com/blacklight-kit/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/blacklight-kit/platform/actions/workflows/ci.yml)

Xbox API layer for [Blacklight](https://github.com/isamarin/blacklight) — tRPC router with MSAL auth, profile, Game Pass catalog, SmartGlass, and GSSV streaming (via `@blacklight/player`).

## Install

```bash
pnpm add github:blacklight-kit/platform#v1.0.0
```

Local development next to the monorepo:

```json
"@blacklight/platform": "file:../../platform"
```

**Dependency:** `@blacklight/player` (GSSV streaming procedures).

## Usage

```ts
import { appRouter, createCallerFactory } from '@blacklight/platform';

const caller = createCallerFactory(appRouter)({});
await caller.ping(); // 'pong'
```

Cloudflare Worker entry: `src/worker.ts`.

## Development

Node.js 24+, pnpm 10.4+.

```bash
pnpm install
pnpm build
pnpm test
pnpm run ci
```

## License

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)
