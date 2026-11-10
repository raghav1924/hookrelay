import crypto from 'node:crypto';
import { SignatureValidationResult, WebhookProvider } from '../core/types.js';

export class SignatureVerifier {
  /**
   * Stripe Webhook Signature Verification
   * Header: Stripe-Signature (e.g. t=1731139200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd)
   */
  public static verifyStripe(
    payload: string,
    signatureHeader: string | undefined,
    secret: string
  ): SignatureValidationResult {
    if (!signatureHeader) {
      return {
        valid: false,
        provider: 'stripe',
        headerName: 'stripe-signature',
        error: 'Missing Stripe-Signature header',
      };
    }

    try {
      const parts = signatureHeader.split(',');
      let timestamp = '';
      let receivedSignature = '';

      for (const part of parts) {
        const [k, v] = part.split('=');
        if (k.trim() === 't') timestamp = v.trim();
        if (k.trim() === 'v1') receivedSignature = v.trim();
      }

      if (!timestamp || !receivedSignature) {
        return {
          valid: false,
          provider: 'stripe',
          headerName: 'stripe-signature',
          receivedSignature,
          error: 'Malformed Stripe-Signature header format',
        };
      }

      const signedPayload = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf-8')
        .digest('hex');

      const valid = this.constantTimeCompare(receivedSignature, expectedSignature);

      return {
        valid,
        provider: 'stripe',
        headerName: 'stripe-signature',
        expectedSignature,
        receivedSignature,
      };
    } catch (err: any) {
      return {
        valid: false,
        provider: 'stripe',
        headerName: 'stripe-signature',
        error: err.message,
      };
    }
  }

  /**
   * GitHub Webhook Signature Verification
   * Header: X-Hub-Signature-256 (e.g. sha256=d57c292a6999212be4c467e802fc7c93868d5b5496ac80f730e1a1ec16b0a7ac)
   */
  public static verifyGitHub(
    payload: string,
    signatureHeader: string | undefined,
    secret: string
  ): SignatureValidationResult {
    if (!signatureHeader) {
      return {
        valid: false,
        provider: 'github',
        headerName: 'x-hub-signature-256',
        error: 'Missing X-Hub-Signature-256 header',
      };
    }

    try {
      const received = signatureHeader.startsWith('sha256=')
        ? signatureHeader.slice(7)
        : signatureHeader;

      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf-8')
        .digest('hex');

      const valid = this.constantTimeCompare(received, expected);

      return {
        valid,
        provider: 'github',
        headerName: 'x-hub-signature-256',
        expectedSignature: `sha256=${expected}`,
        receivedSignature: signatureHeader,
      };
    } catch (err: any) {
      return {
        valid: false,
        provider: 'github',
        headerName: 'x-hub-signature-256',
        error: err.message,
      };
    }
  }

  /**
   * Generic HMAC-SHA256 signature verifier
   */
  public static verifyCustom(
    payload: string,
    signature: string | undefined,
    secret: string
  ): SignatureValidationResult {
    if (!signature) {
      return {
        valid: false,
        provider: 'custom',
        error: 'Missing signature',
      };
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf-8')
      .digest('hex');

    const valid = this.constantTimeCompare(signature, expected);

    return {
      valid,
      provider: 'custom',
      expectedSignature: expected,
      receivedSignature: signature,
    };
  }

  /**
   * Generate signature for outgoing mock or replayed webhooks
   */
  public static sign(
    provider: WebhookProvider,
    payload: string,
    secret: string,
    timestamp = Math.floor(Date.now() / 1000)
  ): Record<string, string> {
    if (provider === 'stripe') {
      const signedPayload = `${timestamp}.${payload}`;
      const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
      return {
        'stripe-signature': `t=${timestamp},v1=${sig}`,
      };
    }

    if (provider === 'github') {
      const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      return {
        'x-hub-signature-256': `sha256=${sig}`,
      };
    }

    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return {
      'x-signature-256': sig,
    };
  }

  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    try {
      const bufA = Buffer.from(a);
      const bufB = Buffer.from(b);
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }
}

