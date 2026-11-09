import http from 'node:http';
import { URL } from 'node:url';
import { ReplayOptions, ReplayResult, WebhookEvent } from './types.js';
import { SignatureVerifier } from '../crypto/verifier.js';

export class ReplayEngine {
  public static async replay(event: WebhookEvent, options: ReplayOptions): Promise<ReplayResult> {
    const startTime = Date.now();
    const target = new URL(options.targetUrl);

    let headersToSend: Record<string, string> = {
      ...event.headers,
      ...(options.headers || {}),
      'host': target.hostname + (target.port ? `:${target.port}` : ''),
      'content-length': String(Buffer.byteLength(event.rawBody, 'utf-8')),
    };

    // Re-sign with fresh timestamp if requested
    if (options.reSign && options.secret) {
      const freshSignatures = SignatureVerifier.sign(event.provider, event.rawBody, options.secret);
      Object.assign(headersToSend, freshSignatures);
    }

    return new Promise((resolve) => {
      const isHttps = target.protocol === 'https:';
      // Fallback to native http for localhost testing
      const req = http.request(
        {
          hostname: target.hostname,
          port: target.port || 80,
          path: target.pathname,
          method: 'POST',
          headers: headersToSend,
          timeout: 5000,
        },
        (res) => {
          let chunks = '';
          res.on('data', (d) => (chunks += d));
          res.on('end', () => {
            const durationMs = Date.now() - startTime;
            resolve({
              success: (res.statusCode || 500) < 400,
              statusCode: res.statusCode || 500,
              durationMs,
              responseBody: chunks,
            });
          });
        }
      );

      req.on('error', (err: any) => {
        resolve({
          success: false,
          statusCode: 0,
          durationMs: Date.now() - startTime,
          responseBody: '',
          error: err.message,
        });
      });

      req.write(event.rawBody);
      req.end();
    });
  }
}
