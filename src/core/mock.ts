import { WebhookEvent, WebhookProvider } from './types.js';
import { SignatureVerifier } from '../crypto/verifier.js';

export class MockGenerator {
  public static createMockEvent(provider: WebhookProvider, secret = 'whsec_test_secret_123'): WebhookEvent {
    const timestamp = new Date().toISOString();
    const id = `evt_mock_${Math.random().toString(36).substring(2, 9)}`;

    let rawBody = '';
    let headers: Record<string, string> = {
      'content-type': 'application/json',
      'user-agent': `HookRelay-Mock/${provider}`,
    };

    if (provider === 'stripe') {
      const stripePayload = {
        id,
        object: 'event',
        api_version: '2024-06-20',
        created: Math.floor(Date.now() / 1000),
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_mock_session_4920',
            amount_total: 4900,
            currency: 'usd',
            customer_email: 'jatin.customer@example.com',
            payment_status: 'paid',
          },
        },
      };
      rawBody = JSON.stringify(stripePayload, null, 2);
      const sigHeaders = SignatureVerifier.sign('stripe', rawBody, secret);
      Object.assign(headers, sigHeaders);
    } else if (provider === 'github') {
      const githubPayload = {
        ref: 'refs/heads/main',
        before: '6113728f27ae82c7b1a12f6d5777f244101e99d3',
        after: '2c161f626453830d94113749ac8ef407152c9dd8',
        repository: {
          name: 'hookrelay',
          full_name: 'raghav1924/hookrelay',
          owner: { login: 'raghav1924' },
        },
        pusher: { name: 'Jatin Sharma', email: 'raghavjatin245@gmail.com' },
      };
      rawBody = JSON.stringify(githubPayload, null, 2);
      const sigHeaders = SignatureVerifier.sign('github', rawBody, secret);
      Object.assign(headers, {
        ...sigHeaders,
        'x-github-event': 'push',
        'x-github-delivery': id,
      });
    } else {
      // Supabase / Custom
      const supabasePayload = {
        type: 'INSERT',
        table: 'users',
        schema: 'public',
        record: {
          id: 'usr_84920491',
          name: 'Jatin Sharma',
          plan: 'pro_tier',
          created_at: timestamp,
        },
        old_record: null,
      };
      rawBody = JSON.stringify(supabasePayload, null, 2);
      const sigHeaders = SignatureVerifier.sign('custom', rawBody, secret);
      Object.assign(headers, sigHeaders);
    }

    const signatureStatus = this.evaluateSignature(provider, rawBody, headers, secret);

    return {
      id,
      timestamp,
      method: 'POST',
      url: `/webhooks/${provider}`,
      path: `/webhooks/${provider}`,
      headers,
      rawBody,
      parsedBody: JSON.parse(rawBody),
      provider,
      signatureStatus,
      sizeBytes: Buffer.byteLength(rawBody, 'utf-8'),
    };
  }

  public static evaluateSignature(
    provider: WebhookProvider,
    rawBody: string,
    headers: Record<string, string>,
    secret?: string
  ) {
    if (!secret) {
      return {
        valid: false,
        provider,
        error: 'No webhook verification secret configured (use --secret <token>)',
      };
    }

    if (provider === 'stripe') {
      const sig = headers['stripe-signature'];
      return SignatureVerifier.verifyStripe(rawBody, sig, secret);
    }

    if (provider === 'github') {
      const sig = headers['x-hub-signature-256'] || headers['x-hub-signature'];
      return SignatureVerifier.verifyGitHub(rawBody, sig, secret);
    }

    const sig = headers['x-signature-256'] || headers['x-signature'];
    return SignatureVerifier.verifyCustom(rawBody, sig, secret);
  }
}

