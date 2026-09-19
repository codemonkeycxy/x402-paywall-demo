export function renderDashboard(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>x402 Agent Payment Demo</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; background: #0d1117; color: #e6edf3; }
      main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0 72px; }
      .eyebrow { color: #8b949e; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: 8px 0; font-size: clamp(32px, 6vw, 56px); line-height: 1; }
      h2 { margin: 0; }
      .lede { max-width: 680px; color: #8b949e; font-size: 18px; line-height: 1.5; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin: 28px 0; }
      .card { border: 1px solid #30363d; border-radius: 14px; background: #161b22; padding: 16px; }
      .label { color: #8b949e; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
      .value { display: block; margin-top: 8px; overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      .detail { display: block; margin-top: 8px; color: #8b949e; font-size: 12px; }
      .seller-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 12px; }
      .seller-actions a { font-size: 12px; }
      .copy-button { border: 1px solid #484f58; border-radius: 7px; background: transparent; color: #c9d1d9; font-size: 12px; padding: 6px 9px; }
      .copy-button:hover { border-color: #79c0ff; color: #79c0ff; }
      .badge { display: inline-block; margin-left: 6px; border: 1px solid #238636; border-radius: 999px; color: #56d364; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 10px; font-weight: 800; letter-spacing: .08em; padding: 3px 6px; vertical-align: middle; }
      .panel { border: 1px solid #30363d; border-radius: 18px; background: #161b22; padding: 22px; margin-top: 18px; }
      button { border: 0; border-radius: 10px; background: #2f81f7; color: white; cursor: pointer; font: inherit; font-weight: 700; padding: 13px 18px; }
      button:disabled { cursor: wait; opacity: .55; }
      input { width: min(360px, 100%); box-sizing: border-box; border: 1px solid #484f58; border-radius: 8px; background: #0d1117; color: #e6edf3; font: inherit; padding: 11px 12px; }
      .token { display: none; margin: 16px 0; }
      .token.visible { display: block; }
      .status { min-height: 24px; margin: 18px 0 0; color: #8b949e; }
      .status.error { color: #ff7b72; }
      .status.success { color: #56d364; }
      .timeline { display: grid; gap: 10px; margin-top: 18px; }
      .event { display: grid; grid-template-columns: 12px 1fr; gap: 12px; align-items: start; }
      .dot { width: 10px; height: 10px; margin-top: 5px; border-radius: 50%; background: #8b949e; }
      .event.success .dot { background: #56d364; }
      .event.failed .dot { background: #ff7b72; }
      .event strong { display: block; }
      .event small { color: #8b949e; }
      .flow { margin-top: 22px; border: 1px solid #30363d; border-radius: 14px; background: #0d1117; padding: 18px; }
      .flow h2 { font-size: 20px; }
      .flow-intro { margin: 8px 0 0; color: #8b949e; line-height: 1.45; }
      .flow-status { min-height: 20px; margin-top: 14px; color: #79c0ff; font-size: 13px; }
      .flow-actors, .flow-track { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .flow-actors { margin-top: 18px; }
      .flow-actor { border: 1px solid #30363d; border-radius: 10px; background: #161b22; color: #c9d1d9; min-height: 58px; padding: 11px 8px; text-align: center; }
      .flow-actor strong { display: block; font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
      .flow-actor small { display: block; margin-top: 5px; color: #8b949e; font-size: 11px; line-height: 1.25; }
      .flow-steps { display: grid; }
      .flow-step { border-bottom: 1px solid #21262d; padding: 12px 0; transition: opacity 160ms ease, background 160ms ease; }
      .flow-step:last-child { border-bottom: 0; }
      .flow-step.pending { opacity: .42; }
      .flow-step.active { border-radius: 10px; background: rgba(47, 129, 247, .1); opacity: 1; }
      .flow-step.complete { opacity: 1; }
      .flow-step.failed { border-radius: 10px; background: rgba(248, 81, 73, .1); opacity: 1; }
      .flow-track { min-height: 84px; align-items: center; }
      .flow-message { grid-column: var(--from) / span 2; border: 1px solid #3b82f6; border-radius: 10px; background: #172554; padding: 10px 12px; font-size: 13px; line-height: 1.35; }
      .flow-message.reverse { justify-self: end; text-align: right; }
      .flow-route { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .flow-party { color: #f0f6fc; font-size: 10px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; }
      .flow-arrow { color: #79c0ff; font-size: 21px; font-weight: 900; line-height: .85; }
      .flow-message-title { display: block; margin-top: 7px; font-size: 14px; font-weight: 750; }
      .flow-message.pending { border-color: #484f58; background: #161b22; }
      .flow-message.complete { border-color: #238636; background: #12241a; }
      .flow-message.active { border-color: #58a6ff; background: #172554; box-shadow: 0 0 0 2px rgba(88, 166, 255, .18); }
      .flow-message.failed { border-color: #f85149; background: #3d1717; }
      .flow-message-detail { display: block; margin-top: 3px; color: #c9d1d9; font-size: 11px; }
      .flow-note { margin: 14px 0 0; color: #8b949e; font-size: 12px; line-height: 1.45; }
      .pass { position: relative; overflow: hidden; border: 1px solid #2f81f7; border-radius: 18px; background: linear-gradient(135deg, #172554, #161b22 58%); padding: 24px; margin-top: 20px; box-shadow: 0 14px 45px rgba(47, 129, 247, .16); }
      .pass::after { position: absolute; right: -48px; top: -64px; width: 180px; height: 180px; border: 28px solid rgba(88, 166, 255, .18); border-radius: 50%; content: ''; }
      .pass-kicker { color: #79c0ff; font-size: 12px; font-weight: 800; letter-spacing: .16em; }
      .pass-title { margin-top: 8px; font-size: clamp(26px, 5vw, 42px); }
      .pass-message { max-width: 560px; color: #c9d1d9; font-size: 17px; }
      .pass-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 20px; }
      .pass-meta .card { background: rgba(13, 17, 23, .42); }
      .confetti { position: fixed; z-index: 20; top: -16px; left: 50%; width: 9px; height: 14px; background: var(--color); pointer-events: none; animation: fall 950ms ease-out forwards; }
      @keyframes fall { to { transform: translate(var(--x), 100vh) rotate(620deg); opacity: 0; } }
      a { color: #58a6ff; }
      .warning { border-color: #9e6a03; color: #d29922; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      @media (max-width: 680px) {
        main { width: min(100% - 20px, 960px); padding-top: 28px; }
        .panel, .flow { padding: 16px; }
        .flow-actors { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .flow-track { grid-template-columns: 1fr; }
        .flow-message { grid-column: auto; width: auto; }
        .flow-message.reverse { justify-self: stretch; text-align: left; }
        .flow-route { justify-content: flex-start; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Agent payments / x402</div>
      <h1>Pay before you run</h1>
      <p class="lede">A disposable Base Sepolia demo. The agent receives HTTP 402, signs a tiny testnet USDC payment, retries the resource, and earns a small access pass after settlement.</p>

      <section class="grid" aria-label="Demo configuration">
        <div class="card"><span class="label">Network</span><span id="network" class="value">Loading...</span><span id="network-detail" class="detail"></span></div>
        <div class="card"><span class="label">Price</span><span id="price" class="value">Loading...</span></div>
        <div class="card">
          <span class="label">Demo seller wallet</span>
          <span id="seller" class="value">Loading...</span>
          <span id="seller-detail" class="detail"></span>
          <div class="seller-actions">
            <a id="seller-link" target="_blank" rel="noreferrer">View wallet activity ↗</a>
            <button id="seller-copy" class="copy-button" type="button">Copy address</button>
          </div>
        </div>
        <div class="card"><span class="label">Event store</span><span id="store" class="value">Loading...</span></div>
      </section>

      <section class="panel">
        <div id="warning" class="card warning" hidden></div>
        <div id="token" class="token">
          <label for="demo-token">Demo token</label><br />
          <input id="demo-token" type="password" autocomplete="off" placeholder="Required when DEMO_TOKEN is configured" />
        </div>
        <button id="run" type="button">Run agent payment</button>
        <div id="status" class="status" role="status">Ready for a testnet-only run.</div>
        <section id="access-pass" class="pass" hidden aria-live="polite">
          <div class="pass-kicker">ACCESS GRANTED</div>
          <h2 id="pass-title" class="pass-title">Agent Access Pass</h2>
          <p id="pass-message" class="pass-message"></p>
          <div class="pass-meta">
            <div class="card"><span class="label">Amount</span><span id="pass-amount" class="value"></span></div>
            <div class="card"><span class="label">Payer</span><span id="pass-payer" class="value"></span></div>
            <div class="card"><span class="label">Run ID</span><span id="pass-run" class="value"></span></div>
          </div>
          <p><a id="pass-transaction" target="_blank" rel="noreferrer">View settlement on BaseScan</a></p>
        </section>
        <section class="flow" aria-labelledby="flow-title">
          <h2 id="flow-title">How the payment works</h2>
          <p class="flow-intro">The four boxes are the participants. Each arrow is one message between them, and the highlighted arrow explains what is happening at that moment.</p>
          <div id="flow-status" class="flow-status" role="status">Ready to replay the payment lifecycle.</div>
          <div class="flow-actors" aria-hidden="true">
            <div class="flow-actor"><strong>Agent / buyer</strong><small>Starts request and signs</small></div>
            <div class="flow-actor"><strong>Worker</strong><small>Protects the resource</small></div>
            <div class="flow-actor"><strong>Facilitator</strong><small>Verifies and settles</small></div>
            <div class="flow-actor"><strong>Base Sepolia</strong><small>Records settlement</small></div>
          </div>
          <div id="payment-flow" class="flow-steps" aria-live="polite"></div>
          <p class="flow-note">In this demo, the button starts the worker-side buyer orchestrator. The browser never receives the buyer private key. The animation reconstructs the protocol sequence from the events recorded for this run.</p>
        </section>
        <div id="timeline" class="timeline" aria-live="polite"></div>
      </section>
    </main>
    <script>
      const $ = (id) => document.getElementById(id);
      let config = null;
      const eventLabels = {
        request: 'Request received',
        '402': 'Payment required',
        verify: 'Payment verified',
        settle: 'Payment settled',
        'access-granted': 'Access granted',
        error: 'Payment error',
      };
      const flowSteps = [
        { key: 'request', title: 'Request the resource', detail: 'Asks the worker for protected data.', from: 1, fromLabel: 'Agent / buyer', toLabel: 'Worker' },
        { key: 'challenge', title: '402 Payment Required', detail: 'The worker says payment is needed first.', from: 1, fromLabel: 'Worker', toLabel: 'Agent / buyer', reverse: true },
        { key: 'authorize', title: 'Retry with signed payment', detail: 'The buyer signs $0.0001 USDC and sends the authorization.', from: 1, fromLabel: 'Agent / buyer', toLabel: 'Worker' },
        { key: 'verify', title: 'Verify the payment', detail: 'The worker asks the facilitator to check the signature, amount, network, balance, and recipient.', from: 2, fromLabel: 'Worker', toLabel: 'Facilitator' },
        { key: 'verified', title: 'Payment valid', detail: 'The facilitator confirms the authorization can be settled.', from: 2, fromLabel: 'Facilitator', toLabel: 'Worker', reverse: true },
        { key: 'settle', title: 'Request settlement', detail: 'The worker asks the facilitator to settle the verified payment.', from: 2, fromLabel: 'Worker', toLabel: 'Facilitator' },
        { key: 'submit', title: 'Submit transaction', detail: 'The facilitator sends the payment transaction to Base Sepolia.', from: 3, fromLabel: 'Facilitator', toLabel: 'Base Sepolia' },
        { key: 'confirmed', title: 'Transaction confirmed', detail: 'Base Sepolia records the settlement.', from: 3, fromLabel: 'Base Sepolia', toLabel: 'Facilitator', reverse: true },
        { key: 'hash', title: 'Return transaction hash', detail: 'The facilitator sends proof of settlement back to the worker.', from: 2, fromLabel: 'Facilitator', toLabel: 'Worker', reverse: true },
        { key: 'access', title: 'Access granted', detail: 'The worker returns the protected resource.', from: 1, fromLabel: 'Worker', toLabel: 'Agent / buyer', reverse: true },
      ];
      const FLOW_ACTIVE_MS = 700;
      const FLOW_GAP_MS = 350;

      function renderPaymentFlow(states, message) {
        $('flow-status').textContent = message;
        $('payment-flow').replaceChildren();
        for (const [index, step] of flowSteps.entries()) {
          const state = states[step.key] || 'pending';
          const row = document.createElement('div');
          row.className = 'flow-step ' + state;
          const grid = document.createElement('div');
          grid.className = 'flow-track';
          const messageBox = document.createElement('div');
          messageBox.className = 'flow-message ' + (step.reverse ? 'reverse ' : '') + state;
          messageBox.style.setProperty('--from', String(step.from));
          const route = document.createElement('div');
          route.className = 'flow-route';
          const from = document.createElement('span');
          from.className = 'flow-party';
          from.textContent = step.fromLabel;
          const arrow = document.createElement('span');
          arrow.className = 'flow-arrow';
          arrow.textContent = step.reverse ? '←' : '→';
          arrow.setAttribute('aria-label', step.reverse ? 'response direction' : 'request direction');
          route.append(from, arrow);
          const to = document.createElement('span');
          to.className = 'flow-party';
          to.textContent = step.toLabel;
          route.append(to);
          const number = document.createElement('span');
          number.className = 'flow-step-number';
          number.textContent = String(index + 1).padStart(2, '0');
          const title = document.createElement('strong');
          title.className = 'flow-message-title';
          title.textContent = number.textContent + '  ' + step.title;
          const detail = document.createElement('span');
          detail.className = 'flow-message-detail';
          detail.textContent = step.detail;
          messageBox.append(route, title, detail);
          grid.append(messageBox);
          row.append(grid);
          $('payment-flow').append(row);
        }
      }

      function hasEvent(events, kind, status) {
        return (events || []).some((event) => event.kind === kind && (!status || event.status === status));
      }

      function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
      }

      async function replayPaymentFlow(result, responseOk) {
        const events = result.events || [];
        const evidence = {
          request: hasEvent(events, 'request'),
          challenge: hasEvent(events, '402'),
          authorize: hasEvent(events, '402') && responseOk,
          verify: hasEvent(events, 'verify', 'success'),
          verified: hasEvent(events, 'verify', 'success'),
          settle: hasEvent(events, 'settle'),
          submit: Boolean(result.settlement?.transaction),
          confirmed: Boolean(result.settlement?.transaction),
          hash: Boolean(result.settlement?.transaction),
          access: hasEvent(events, 'access-granted', 'success'),
        };
        const states = Object.fromEntries(flowSteps.map((step) => [step.key, 'pending']));
        renderPaymentFlow(states, 'Payment lifecycle recorded. Replaying this run...');
        for (const step of flowSteps) {
          if (!evidence[step.key]) continue;
          states[step.key] = 'active';
          renderPaymentFlow(states, 'Payment lifecycle recorded. Replaying this run...');
          await wait(FLOW_ACTIVE_MS);
          states[step.key] = 'complete';
          renderPaymentFlow(states, 'Payment lifecycle recorded. Replaying this run...');
          await wait(FLOW_GAP_MS);
        }
        if (!responseOk) {
          const failedStep = events.find((event) => event.status === 'failed');
          const failedKey = failedStep?.kind === 'verify' ? 'verify' : failedStep?.kind === 'settle' ? 'settle' : 'access';
          states[failedKey] = 'failed';
          renderPaymentFlow(states, 'This run stopped before access was granted.');
        } else {
          renderPaymentFlow(states, 'Payment settled. The recorded lifecycle is complete.');
        }
      }

      function renderEvents(events) {
        $('timeline').replaceChildren();
        for (const event of events || []) {
          const row = document.createElement('div');
          row.className = 'event ' + event.status;
          const dot = document.createElement('span');
          dot.className = 'dot';
          const body = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = eventLabels[event.kind] || event.kind;
          const message = document.createElement('small');
          message.textContent = event.message;
          body.append(title, message);
          if (event.txHash) {
            const link = document.createElement('a');
            link.href = 'https://sepolia.basescan.org/tx/' + encodeURIComponent(event.txHash);
            link.target = '_blank';
            link.rel = 'noreferrer';
            link.textContent = ' Open settlement transaction';
            body.append(document.createTextNode(' '), link);
          }
          row.append(dot, body);
          $('timeline').append(row);
        }
      }

      function describeNetwork(value) {
        if (value === 'eip155:84532') {
          return { name: 'Base Sepolia', detail: 'Testnet · Chain ID 84532' };
        }
        return { name: value, detail: 'Network identifier: ' + value };
      }

      function shortAddress(value) {
        return value.length > 12 ? value.slice(0, 6) + '...' + value.slice(-4) : value;
      }

      async function copySellerAddress() {
        if (!config?.sellerAddress) return;
        const button = $('seller-copy');
        try {
          await navigator.clipboard.writeText(config.sellerAddress);
          button.textContent = 'Copied';
          window.setTimeout(() => { button.textContent = 'Copy address'; }, 1400);
        } catch {
          button.textContent = 'Copy failed';
          window.setTimeout(() => { button.textContent = 'Copy address'; }, 1400);
        }
      }

      function showAccessPass(pass, baseScanUrl) {
        if (!pass || !pass.transaction) return;
        $('pass-title').textContent = pass.title;
        $('pass-message').textContent = pass.message;
        $('pass-amount').textContent = pass.amount + ' USDC';
        $('pass-payer').textContent = pass.payer.slice(0, 6) + '...' + pass.payer.slice(-4);
        $('pass-run').textContent = pass.runId;
        $('pass-transaction').href = baseScanUrl || ('https://sepolia.basescan.org/tx/' + encodeURIComponent(pass.transaction));
        $('access-pass').hidden = false;
        celebrate();
      }

      function clearAccessPass() {
        $('access-pass').hidden = true;
      }

      function celebrate() {
        const colors = ['#58a6ff', '#56d364', '#d29922', '#f778ba', '#a371f7'];
        for (let i = 0; i < 28; i += 1) {
          const piece = document.createElement('span');
          piece.className = 'confetti';
          piece.style.setProperty('--x', (Math.random() * 120 - 60) + 'vw');
          piece.style.setProperty('--color', colors[i % colors.length]);
          piece.style.left = (50 + Math.random() * 20 - 10) + '%';
          piece.style.animationDelay = (Math.random() * 180) + 'ms';
          document.body.append(piece);
          window.setTimeout(() => piece.remove(), 1300);
        }
      }

      async function loadConfig() {
        const response = await fetch('/api/config');
        config = await response.json();
        const network = describeNetwork(config.network);
        $('network').textContent = network.name;
        $('network-detail').textContent = network.detail;
        if (config.network === 'eip155:84532') {
          $('network').insertAdjacentHTML('beforeend', '<span class="badge">TESTNET</span>');
        }
        $('price').textContent = config.price + ' USDC';
        $('seller').textContent = shortAddress(config.sellerAddress);
        $('seller').title = config.sellerAddress;
        $('seller-detail').textContent = 'Receives ' + config.price + ' USDC per successful run';
        $('seller-link').href = 'https://sepolia.basescan.org/address/' + encodeURIComponent(config.sellerAddress);
        $('store').textContent = config.eventStore;
        if (config.requiresDemoToken) $('token').classList.add('visible');
        if (!config.demoReady) {
          $('warning').hidden = false;
          $('warning').textContent = 'The buyer wallet is not configured yet. Add DEMO_MODE=true and DEMO_BUYER_PRIVATE_KEY before running a payment.';
          $('run').disabled = true;
        }
      }

      async function runDemo() {
        $('run').disabled = true;
        $('status').className = 'status';
        $('status').textContent = 'Requesting, signing, verifying, and settling...';
        $('timeline').replaceChildren();
        clearAccessPass();
        const runningStates = Object.fromEntries(flowSteps.map((step) => [step.key, 'pending']));
        runningStates.request = 'active';
        renderPaymentFlow(runningStates, 'Running the real testnet payment...');
        try {
          const headers = { 'x-demo-confirm': 'testnet-only' };
          const token = $('demo-token').value;
          if (token) headers['x-demo-token'] = token;
          const response = await fetch('/api/demo/run', { method: 'POST', headers });
          const result = await response.json();
          renderEvents(result.events);
          await replayPaymentFlow(result, response.ok);
          if (!response.ok) throw new Error(result.error || 'The demo run failed');
          showAccessPass(result.accessPass, result.baseScanUrl);
          $('status').className = 'status success';
          $('status').textContent = result.settlement?.transaction
            ? 'Payment settled. Your access pass is ready.'
            : 'The protected resource was returned.';
        } catch (error) {
          $('status').className = 'status error';
          $('status').textContent = error.message;
        } finally {
          $('run').disabled = !config?.demoReady;
        }
      }

      $('run').addEventListener('click', runDemo);
      $('seller-copy').addEventListener('click', copySellerAddress);
      renderPaymentFlow(Object.fromEntries(flowSteps.map((step) => [step.key, 'pending'])), 'Ready to replay the payment lifecycle.');
      loadConfig().catch((error) => {
        $('status').className = 'status error';
        $('status').textContent = error.message;
      });
    </script>
  </body>
</html>`;
}
