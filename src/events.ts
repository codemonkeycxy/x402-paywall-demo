export type PaymentEventKind =
  | 'request'
  | '402'
  | 'verify'
  | 'settle'
  | 'access-granted'
  | 'error';
export type PaymentEventStatus = 'started' | 'success' | 'failed';

export type PaymentEvent = {
  id: string;
  runId: string;
  kind: PaymentEventKind;
  status: PaymentEventStatus;
  message: string;
  payer?: string;
  txHash?: string;
  network?: string;
  createdAt: string;
};

type EventEnvironment = {
  DB?: D1Database;
};

const memoryEvents: PaymentEvent[] = [];

export async function recordEvent(
  env: EventEnvironment,
  event: Omit<PaymentEvent, 'id' | 'createdAt'>,
): Promise<PaymentEvent> {
  const storedEvent: PaymentEvent = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  memoryEvents.push(storedEvent);
  while (memoryEvents.length > 200) {
    memoryEvents.shift();
  }

  if (env.DB) {
    await env.DB.prepare(
      `INSERT INTO payment_events
        (id, run_id, kind, status, message, payer, tx_hash, network, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        storedEvent.id,
        storedEvent.runId,
        storedEvent.kind,
        storedEvent.status,
        storedEvent.message,
        storedEvent.payer ?? null,
        storedEvent.txHash ?? null,
        storedEvent.network ?? null,
        storedEvent.createdAt,
      )
      .run();
  }

  return storedEvent;
}

export async function listEvents(env: EventEnvironment, runId?: string): Promise<PaymentEvent[]> {
  if (env.DB) {
    const query = runId
      ? env.DB
          .prepare(
            `SELECT id, run_id AS runId, kind, status, message, payer,
                    tx_hash AS txHash, network, created_at AS createdAt
             FROM payment_events
             WHERE run_id = ?
             ORDER BY created_at ASC`,
          )
          .bind(runId)
      : env.DB.prepare(
          `SELECT id, run_id AS runId, kind, status, message, payer,
                  tx_hash AS txHash, network, created_at AS createdAt
           FROM payment_events
           ORDER BY created_at DESC
           LIMIT 200`,
        );

    const result = await query.all<PaymentEvent>();
    return runId ? result.results : result.results.reverse();
  }

  const result = runId
    ? memoryEvents.filter((event) => event.runId === runId)
    : memoryEvents.slice().reverse();
  return result.slice(0, 200);
}
