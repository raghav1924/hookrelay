import http from 'node:http';
import { ServerConfig, WebhookEvent, WebhookProvider } from './types.js';
import { MockGenerator } from './mock.js';
import { ReplayEngine } from './replay.js';
import { log } from '../utils/logger.js';

export class WebhookGateway {
  private events: WebhookEvent[] = [];
  private server: http.Server | null = null;
  private listeners: ((event: WebhookEvent) => void)[] = [];

  constructor(private config: ServerConfig) {}

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        const urlPath = req.url || '/';
        const method = req.method || 'GET';

        // CORS headers for studio
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        // Webhook ingestion endpoint (POST)
        if (method === 'POST') {
          const startTime = Date.now();
          let rawBody = '';

          req.on('data', (chunk) => {
            rawBody += chunk;
          });

          req.on('end', async () => {
            const provider = this.detectProvider(urlPath, req.headers);
            const headersMap: Record<string, string> = {};
            for (const [k, v] of Object.entries(req.headers)) {
              if (v) headersMap[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
            }

            let parsedBody: any = null;
            try {
              parsedBody = JSON.parse(rawBody);
            } catch {
              parsedBody = rawBody;
            }

            const signatureStatus = MockGenerator.evaluateSignature(
              provider,
              rawBody,
              headersMap,
              this.config.secret
            );

            const event: WebhookEvent = {
              id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              timestamp: new Date().toISOString(),
              method,
              url: urlPath,
              path: urlPath,
              headers: headersMap,
              rawBody,
              parsedBody,
              provider,
              signatureStatus,
              sizeBytes: Buffer.byteLength(rawBody, 'utf-8'),
            };

            this.events.unshift(event);
            if (this.events.length > 100) this.events.pop(); // Keep last 100

            this.notifyListeners(event);
            const durationMs = Date.now() - startTime;
            log.request(event.id, method, urlPath, 200, durationMs);

            // Forward to local URL if configured
            if (this.config.forwardUrl) {
              ReplayEngine.replay(event, {
                targetUrl: this.config.forwardUrl,
                reSign: false,
              }).then((rep) => {
                log.dim(`  ↳ Forwarded to ${this.config.forwardUrl} → status ${rep.statusCode} (${rep.durationMs}ms)`);
              });
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'received', eventId: event.id }));
          });
          return;
        }

        // Health endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          service: 'HookRelay Gateway',
          totalEvents: this.events.length,
          forwardUrl: this.config.forwardUrl || null,
        }));
      });

      this.server.listen(this.config.port, () => {
        resolve(this.config.port);
      });

      this.server.on('error', (err) => reject(err));
    });
  }

  public getEvents(): WebhookEvent[] {
    return this.events;
  }

  public addEvent(event: WebhookEvent): void {
    this.events.unshift(event);
    if (this.events.length > 100) this.events.pop();
    this.notifyListeners(event);
  }

  public onEvent(callback: (event: WebhookEvent) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(event: WebhookEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {}
    }
  }

  private detectProvider(urlPath: string, headers: Record<string, any>): WebhookProvider {
    const lowerPath = urlPath.toLowerCase();
    if (lowerPath.includes('stripe') || headers['stripe-signature']) return 'stripe';
    if (lowerPath.includes('github') || headers['x-github-event'] || headers['x-hub-signature-256']) return 'github';
    if (lowerPath.includes('supabase')) return 'supabase';
    if (lowerPath.includes('resend')) return 'resend';
    return this.config.provider || 'custom';
  }
}

