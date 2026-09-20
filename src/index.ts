import { Hono } from 'hono';
import { paymentMiddleware, x402ResourceServer } from '@x402/hono';
import { HTTPFacilitatorClient } from '@x402/core/server';
import type { Network } from '@x402/core/types';
import { x402Client } from '@x402/core/client';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { decodePaymentResponseHeader, wrapFetchWithPayment } from '@x402/fetch';
import { privateKeyToAccount } from 'viem/accounts';
import { renderDashboard } from './dashboard';
import { listEvents, recordEvent, type PaymentEvent } from './events';

type Env = {
  DB?: D1Database;
  NETWORK?: string;
  PRICE_USDC?: string;
  SELLER_ADDRESS?: string;
  FACILITATOR_URL?: string;
  DEMO_MODE?: string;
  DEMO_TOKEN?: string;
  DEMO_BUYER_PRIVATE_KEY?: string;
};

type Variables = {
  runId: string;
};

const DEFAULT_NETWORK: Network = 'eip155:84532';
const DEFAULT_PRICE = '$0.0001';
const DEFAULT_SELLER_ADDRESS = '0x0000000000000000000000000000000000000001';
const DEFAULT_FACILITATOR_URL = 'https://x402.org/facilitator';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function getPaymentConfig(env: Env) {
  return {
    network: (env.NETWORK ?? DEFAULT_NETWORK) as Network,
    price: env.PRICE_USDC ?? DEFAULT_PRICE,
    sellerAddress: env.SELLER_ADDRESS ?? DEFAULT_SELLER_ADDRESS,
    facilitatorUrl: env.FACILITATOR_URL ?? DEFAULT_FACILITATOR_URL,
    demoMode: env.DEMO_MODE === 'true',
    demoReady: env.DEMO_MODE === 'true' && Boolean(env.DEMO_BUYER_PRIVATE_KEY),
    requiresDemoToken: Boolean(env.DEMO_TOKEN),
  };
}

function makeResourceServer(env: Env, runId: string) {
  const config = getPaymentConfig(env);
  const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
  const server = new x402ResourceServer(facilitator).register(
    config.network,
    new ExactEvmScheme(),
  );

  server.onAfterVerify(async ({ result, requirements }) => {
    await recordEvent(env, {
      runId,
      kind: 'verify',
      status: result.isValid ? 'success' : 'failed',
      message: result.isValid
        ? 'Facilitator verified the payment'
        : 'Facilitator rejected the payment',
      payer: result.payer,
      network: requirements.network,
    });
  });

  server.onVerifyFailure(async ({ error }) => {
    await recordEvent(env, {
      runId,
      kind: 'error',
      status: 'failed',
      message: `Payment verification failed: ${error.message}`,
    });
  });

  server.onAfterSettle(async ({ result, requirements }) => {
    await recordEvent(env, {
      runId,
      kind: 'settle',
      status: result.success ? 'success' : 'failed',
      message: result.success
        ? 'Facilitator settled the payment'
        : 'Facilitator reported a settlement failure',
      payer: result.payer,
      txHash: result.transaction,
      network: requirements.network,
    });
  });

  server.onSettleFailure(async ({ error }) => {
    await recordEvent(env, {
      runId,
      kind: 'error',
      status: 'failed',
      message: `Payment settlement failed: ${error.message}`,
    });
  });

  return server;
}

app.get('/', (c) => c.html(renderDashboard()));

app.get('/health', (c) => c.json({ ok: true, service: 'x402-paywall-demo' }));

app.get('/api/config', (c) => {
  const config = getPaymentConfig(c.env);
  return c.json({
    network: config.network,
    price: config.price,
    sellerAddress: config.sellerAddress,
    facilitatorUrl: config.facilitatorUrl,
    eventStore: c.env.DB ? 'd1' : 'memory-fallback',
    demoMode: config.demoMode,
    demoReady: config.demoReady,
    requiresDemoToken: config.requiresDemoToken,
  });
});

app.get('/api/events', async (c) => {
  const events = await listEvents(c.env, c.req.query('runId'));
  return c.json({ events });
});

app.post('/api/demo/run', async (c) => {
  const config = getPaymentConfig(c.env);
  const runId = crypto.randomUUID();
  c.header('x-demo-run-id', runId);
  c.header('cache-control', 'no-store');

  if (c.req.header('x-demo-confirm') !== 'testnet-only') {
    return c.json({ error: 'This endpoint requires the testnet-only confirmation header.' }, 400);
  }

  if (c.env.DEMO_TOKEN && c.req.header('x-demo-token') !== c.env.DEMO_TOKEN) {
    return c.json({ error: 'A valid demo token is required.' }, 403);
  }

  if (!config.demoMode) {
    return c.json({ error: 'The server-side buyer demo is disabled.' }, 503);
  }

  if (!c.env.DEMO_BUYER_PRIVATE_KEY) {
    return c.json({ error: 'The disposable buyer wallet is not configured.' }, 503);
  }

  try {
    const account = privateKeyToAccount(c.env.DEMO_BUYER_PRIVATE_KEY as `0x${string}`);
    const client = new x402Client();
    registerExactEvmScheme(client, {
      signer: account,
      networks: [config.network],
    });

    const workerFetch: typeof fetch = async (input, init) =>
      app.fetch(new Request(input, init), c.env, c.executionCtx);
    const fetchWithPayment = wrapFetchWithPayment(workerFetch, client);
    const resourceUrl = new URL('/paid-resource', c.req.url);
    const response = await fetchWithPayment(resourceUrl, {
      headers: {
        accept: 'application/json',
        'x-demo-run-id': runId,
      },
    });
    const bodyText = await response.text();
    const body = parseJson(bodyText);
    const paymentResponseHeader = response.headers.get('PAYMENT-RESPONSE');
    const settlement = paymentResponseHeader
      ? decodePaymentResponseHeader(paymentResponseHeader)
      : undefined;

    const accessPass = settlement?.success && settlement.transaction
      ? {
          title: getAccessTitle(settlement.transaction),
          message: 'One tiny payment unlocked one protected resource.',
          amount: config.price,
          network: settlement.network,
          payer: settlement.payer,
          runId,
          transaction: settlement.transaction,
        }
      : undefined;

    if (accessPass) {
      await recordEvent(c.env, {
        runId,
        kind: 'access-granted',
        status: 'success',
        message: 'Access pass issued after successful settlement',
        payer: accessPass.payer,
        txHash: accessPass.transaction,
        network: accessPass.network,
      });
    }

    return c.json(
      {
        runId,
        ok: response.ok,
        status: response.status,
        resource: body,
        settlement,
        accessPass,
        baseScanUrl: settlement?.transaction
          ? `https://sepolia.basescan.org/tx/${settlement.transaction}`
          : undefined,
        events: await listEvents(c.env, runId),
      },
      response.ok ? 200 : 502,
    );
  } catch (error) {
    await recordEvent(c.env, {
      runId,
      kind: 'error',
      status: 'failed',
      message: error instanceof Error ? error.message : 'The buyer demo failed.',
    });
    return c.json(
      {
        runId,
        error: error instanceof Error ? error.message : 'The buyer demo failed.',
        events: await listEvents(c.env, runId),
      },
      500,
    );
  }
});

app.use('/paid-resource', async (c, next) => {
  const runId = c.req.header('x-demo-run-id') ?? crypto.randomUUID();
  c.set('runId', runId);
  c.header('x-demo-run-id', runId);

  await recordEvent(c.env, {
    runId,
    kind: 'request',
    status: 'started',
    message: 'Agent requested the protected resource',
  });

  const config = getPaymentConfig(c.env);
  const middleware = paymentMiddleware(
    {
      'GET /paid-resource': {
        accepts: {
          scheme: 'exact',
          price: config.price,
          network: config.network,
          payTo: config.sellerAddress,
        },
        description: 'Access to the x402 paywall demo resource',
      },
    },
    makeResourceServer(c.env, runId),
  );

  const response = await middleware(c, next);

  if (response?.status === 402 || c.res.status === 402) {
    await recordEvent(c.env, {
      runId,
      kind: '402',
      status: 'success',
      message: 'Payment is required before the resource is returned',
      network: config.network,
    });
  }

  return response;
});

app.get('/paid-resource', (c) => {
  const config = getPaymentConfig(c.env);
  const runId = c.get('runId');

  return c.json({
    message: 'Payment accepted. This is the protected demo resource.',
    runId,
    network: config.network,
    price: config.price,
  });
});

export default app;

export type { PaymentEvent };

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getAccessTitle(transaction: string): string {
  const titles = [
    'Micro-Payment Pioneer',
    '402 Negotiator',
    'Testnet Trailblazer',
    'Paywall Whisperer',
    'Tiny Payment Champion',
  ];
  const seed = Number.parseInt(transaction.slice(2, 10), 16);
  return titles[seed % titles.length] ?? titles[0];
}
