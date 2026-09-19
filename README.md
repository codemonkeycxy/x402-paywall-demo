# x402 Paywall Demo

This is a disposable Cloudflare Worker demo for testing very small agent payments over HTTP. It is intentionally separate from the existing Cloud UI application.

The demo uses Base Sepolia testnet USDC and the x402 protocol. It is not intended for mainnet funds, production credentials, or customer billing.

## Hosted demo

The current public deployment is available at:

<https://x402-paywall-demo.xinyichencxy.workers.dev>

The Worker is connected to Cloudflare Workers Builds. Pushes to the production branch can deploy automatically after the GitHub repository is connected in Cloudflare under **Settings > Builds**.

## Local development

Use the Node and pnpm versions in `.tool-versions`:

```bash
mise exec -- pnpm install
mise exec -- pnpm run check
mise exec -- pnpm exec wrangler dev --local
```

The local Worker exposes `/`, `/health`, `/api/config`, `/api/events`, `/paid-resource`, and the guarded `POST /api/demo/run` buyer flow.

Open `/` for the visual dashboard. After a successful settlement, it displays the real payment timeline, a deterministic Agent Access Pass, and a BaseScan transaction link.

Requesting `/paid-resource` without a payment returns HTTP `402` and includes the x402 payment requirements.

Without a D1 binding, events are kept in a small in-memory fallback so the 402 flow can still be inspected locally. To apply the local D1 migration after adding a D1 binding, use:

```bash
mise exec -- pnpm exec wrangler d1 migrations apply x402-paywall-events --local
```

## Buyer demo setup

The buyer flow stays disabled unless both `DEMO_MODE=true` and `DEMO_BUYER_PRIVATE_KEY` are configured. `DEMO_TOKEN` is optional and can be added when the Worker is exposed beyond local testing.

Create a local-only `.dev.vars` from `.dev.vars.example` and use fresh disposable Base Sepolia wallets. Never commit `.dev.vars` or share its private key.

The buyer wallet needs Base Sepolia ETH for gas and testnet USDC for the payment. The seller wallet only needs to receive the payment.

## Safety

- Use only disposable test wallets.
- Use Base Sepolia testnet USDC only.
- Never commit private keys, `.dev.vars`, `.env` files, or Wrangler credentials.
- Do not use this project for production payments without a separate security review.
