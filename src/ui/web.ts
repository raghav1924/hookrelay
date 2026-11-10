import http from 'node:http';
import { WebhookGateway } from '../core/gateway.js';
import { MockGenerator } from '../core/mock.js';
import { ReplayEngine } from '../core/replay.js';
import { log, colors } from '../utils/logger.js';

export class WebStudio {
  public static serve(gateway: WebhookGateway, port = 4040): void {
    const server = http.createServer(async (req, res) => {
      const url = req.url || '/';
      const method = req.method || 'GET';

      // API: Get live events
      if (url === '/api/events' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(gateway.getEvents()));
        return;
      }

      // API: Trigger mock event
      if (url.startsWith('/api/mock') && method === 'POST') {
        const provider = url.split('/')[3] as any || 'stripe';
        const mock = MockGenerator.createMockEvent(provider);
        gateway.addEvent(mock);
        log.info(`Simulated mock webhook: ${colors.bold}${provider}${colors.reset} (id: ${mock.id})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, event: mock }));
        return;
      }

      // API: Replay event
      if (url.startsWith('/api/replay') && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { eventId, targetUrl, reSign, secret } = JSON.parse(body);
            const event = gateway.getEvents().find(e => e.id === eventId);
            if (!event) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Event not found' }));
              return;
            }

            const result = await ReplayEngine.replay(event, { targetUrl, reSign, secret });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // Render Dashboard HTML
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.renderHtml());
    });

    server.listen(port, () => {
      log.success(`Interactive Webhook Studio: ${colors.bold}${colors.cyan}http://localhost:${port}${colors.reset}`);
      console.log(`${colors.dim}Send webhooks or trigger mock events from the browser dashboard.${colors.reset}\n`);
    });
  }

  private static renderHtml(): string {
    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HookRelay — Local Webhook Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121215;
      --card-border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #06b6d4;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--card-border);
      background: #0d0d10;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon {
      font-size: 1.3rem;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      padding: 0.25rem 0.5rem;
    }
    .brand h1 { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
    .brand p { font-size: 0.75rem; color: var(--text-muted); }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .btn:hover { background: #3f3f46; }
    .btn-primary { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }
    .btn-primary:hover { opacity: 0.9; }

    .main-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      flex: 1;
      overflow: hidden;
    }
    .feed-panel {
      border-right: 1px solid var(--card-border);
      background: var(--card-bg);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .feed-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--card-border);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
      display: flex;
      justify-content: space-between;
    }
    .event-list { flex: 1; overflow-y: auto; }
    .event-item {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--card-border);
      cursor: pointer;
      transition: background 0.1s ease;
    }
    .event-item:hover, .event-item.active { background: #1c1c22; }
    .event-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
    .badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-family: 'Geist Mono', monospace;
    }
    .badge-stripe { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-github { background: rgba(244, 244, 245, 0.15); color: #f4f4f5; border: 1px solid rgba(244, 244, 245, 0.3); }
    .badge-supabase { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-custom { background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
    .event-path { font-size: 0.85rem; font-weight: 600; font-family: 'Geist Mono', monospace; }
    .event-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 0.25rem; }

    .detail-panel {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 1rem 1.25rem;
      border-radius: 10px;
    }
    .section-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 1.25rem;
    }
    .section-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem; letter-spacing: 0.05em; }
    pre {
      background: #09090b;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      font-family: 'Geist Mono', monospace;
      font-size: 0.8rem;
      overflow-x: auto;
      color: #e4e4e7;
    }
    .headers-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; font-family: 'Geist Mono', monospace; }
    .headers-table td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #27272a; }
    .headers-table tr:last-child td { border-bottom: none; }
    .key-col { color: var(--text-muted); width: 220px; }

    .replay-bar {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.75rem;
    }
    .input-target {
      flex: 1;
      background: #09090b;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      font-family: 'Geist Mono', monospace;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <div>
        <h1>HookRelay Studio</h1>
        <p>Local Webhook Interceptor & Replay Engine</p>
      </div>
    </div>
    <div class="actions">
      <button class="btn" onclick="triggerMock('stripe')">+ Mock Stripe</button>
      <button class="btn" onclick="triggerMock('github')">+ Mock GitHub</button>
      <button class="btn" onclick="triggerMock('supabase')">+ Mock Supabase</button>
      <a href="https://jatinsh.netlify.app/" target="_blank" class="btn" style="text-decoration:none;">Jatin Sharma ↗</a>
    </div>
  </header>

  <div class="main-grid">
    <aside class="feed-panel">
      <div class="feed-header">
        <span>Captured Webhooks</span>
        <span id="event-count">0 events</span>
      </div>
      <div class="event-list" id="event-list">
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          Listening for incoming webhooks...<br><br>
          <span style="font-size: 0.75rem;">POST to <code>http://localhost:4000/webhooks/:provider</code></span>
        </div>
      </div>
    </aside>

    <main class="detail-panel" id="detail-panel">
      <div style="padding: 4rem 1rem; text-align: center; color: var(--text-muted);">
        Select a captured webhook from the feed to inspect payload and replay.
      </div>
    </main>
  </div>

  <script>
    let events = [];
    let activeId = null;

    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        events = await res.json();
        renderFeed();
        if (!activeId && events.length > 0) selectEvent(events[0].id);
      } catch (err) {}
    }

    function renderFeed() {
      document.getElementById('event-count').textContent = events.length + ' events';
      const container = document.getElementById('event-list');
      if (events.length === 0) return;

      container.innerHTML = events.map(e => \`
        <div class="event-item \${e.id === activeId ? 'active' : ''}" onclick="selectEvent('\${e.id}')">
          <div class="event-top">
            <span class="badge badge-\${e.provider}">\${e.provider}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted);">\${new Date(e.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="event-path">\${e.method} \${e.path}</div>
          <div class="event-meta">
            <span>\${e.sizeBytes} B</span>
            <span style="color: \${e.signatureStatus.valid ? 'var(--success)' : 'var(--warning)'}; font-size: 0.7rem;">
              \${e.signatureStatus.valid ? '✔ Signed' : '⚠ Unsigned'}
            </span>
          </div>
        </div>
      \`).join('');
    }

    function selectEvent(id) {
      activeId = id;
      renderFeed();
      const e = events.find(x => x.id === id);
      if (!e) return;

      const detail = document.getElementById('detail-panel');
      detail.innerHTML = \`
        <div class="detail-header">
          <div>
            <div style="font-size: 1.1rem; font-weight: 700; font-family: 'Geist Mono', monospace;">\${e.method} \${e.path}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">ID: \${e.id} • \${e.timestamp}</div>
          </div>
          <span class="badge badge-\${e.provider}">\${e.provider}</span>
        </div>

        <div class="section-card">
          <div class="section-title">Replay Webhook</div>
          <div class="replay-bar">
            <input type="text" id="replay-url" class="input-target" value="http://localhost:3000/api/webhooks/\${e.provider}" placeholder="Target URL..." />
            <button class="btn btn-primary" onclick="replayEvent('\${e.id}')">⚡ Replay Event</button>
          </div>
          <div id="replay-status" style="font-size: 0.75rem; margin-top: 0.5rem; font-family: 'Geist Mono', monospace;"></div>
        </div>

        <div class="section-card">
          <div class="section-title">Cryptographic Signature Status</div>
          <div style="font-size: 0.85rem; color: \${e.signatureStatus.valid ? 'var(--success)' : 'var(--warning)'}; font-weight: 600;">
            \${e.signatureStatus.valid ? '✔ Cryptographically Validated HMAC' : '⚠ Validation Warning: ' + (e.signatureStatus.error || 'Signature mismatch')}
          </div>
          \${e.signatureStatus.headerName ? \`<div style="font-size: 0.75rem; color: var(--text-muted); font-family: 'Geist Mono'; margin-top: 0.25rem;">Header: \${e.signatureStatus.headerName}</div>\` : ''}
        </div>

        <div class="section-card">
          <div class="section-title">Parsed JSON Payload</div>
          <pre><code>\${JSON.stringify(e.parsedBody, null, 2)}</code></pre>
        </div>

        <div class="section-card">
          <div class="section-title">Headers (\${Object.keys(e.headers).length})</div>
          <table class="headers-table">
            \${Object.entries(e.headers).map(([k, v]) => \`
              <tr>
                <td class="key-col">\${k}</td>
                <td>\${v}</td>
              </tr>
            \`).join('')}
          </table>
        </div>
      \`;
    }

    async function triggerMock(provider) {
      await fetch('/api/mock/' + provider, { method: 'POST' });
      fetchEvents();
    }

    async function replayEvent(id) {
      const url = document.getElementById('replay-url').value;
      const statusDiv = document.getElementById('replay-status');
      statusDiv.textContent = 'Replaying to ' + url + '...';

      try {
        const res = await fetch('/api/replay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: id, targetUrl: url })
        });
        const result = await res.json();
        if (result.success) {
          statusDiv.innerHTML = '<span style="color: var(--success)">✔ Successfully replayed (HTTP ' + result.statusCode + ' in ' + result.durationMs + 'ms)</span>';
        } else {
          statusDiv.innerHTML = '<span style="color: var(--danger)">✖ Replay failed: ' + (result.error || 'HTTP ' + result.statusCode) + '</span>';
        }
      } catch (err) {
        statusDiv.innerHTML = '<span style="color: var(--danger)">✖ ' + err.message + '</span>';
      }
    }

    setInterval(fetchEvents, 2000);
    fetchEvents();
  </script>
</body>
</html>`;
  }
}

