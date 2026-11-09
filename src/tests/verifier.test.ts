import test from 'node:test';
import assert from 'node:assert';
import { SignatureVerifier } from '../crypto/verifier.js';
import { MockGenerator } from '../core/mock.js';

test('SignatureVerifier verifies Stripe HMAC signatures correctly', () => {
  const secret = 'whsec_test_secret_123456';
  const payload = JSON.stringify({ id: 'evt_123', type: 'payment_intent.succeeded' });
  const timestamp = Math.floor(Date.now() / 1000);

  const signedHeaders = SignatureVerifier.sign('stripe', payload, secret, timestamp);
  assert.ok(signedHeaders['stripe-signature'], 'Stripe signature header generated');

  const result = SignatureVerifier.verifyStripe(payload, signedHeaders['stripe-signature'], secret);
  assert.strictEqual(result.valid, true, 'Valid Stripe signature accepted');

  // Test tampered payload
  const tamperedResult = SignatureVerifier.verifyStripe(payload + 'evil', signedHeaders['stripe-signature'], secret);
  assert.strictEqual(tamperedResult.valid, false, 'Tampered payload rejected');
});

test('SignatureVerifier verifies GitHub sha256 signatures correctly', () => {
  const secret = 'gh_webhook_secret_789';
  const payload = JSON.stringify({ ref: 'refs/heads/main', pusher: 'jatin' });

  const signedHeaders = SignatureVerifier.sign('github', payload, secret);
  assert.ok(signedHeaders['x-hub-signature-256'], 'GitHub signature header generated');

  const result = SignatureVerifier.verifyGitHub(payload, signedHeaders['x-hub-signature-256'], secret);
  assert.strictEqual(result.valid, true, 'Valid GitHub signature accepted');

  const badResult = SignatureVerifier.verifyGitHub(payload, 'sha256=invalid_hash', secret);
  assert.strictEqual(badResult.valid, false, 'Invalid signature rejected');
});

test('MockGenerator creates valid mock payloads for multiple providers', () => {
  const stripeMock = MockGenerator.createMockEvent('stripe');
  assert.strictEqual(stripeMock.provider, 'stripe');
  assert.strictEqual(stripeMock.signatureStatus.valid, true);
  assert.ok(stripeMock.rawBody.includes('checkout.session.completed'));

  const githubMock = MockGenerator.createMockEvent('github');
  assert.strictEqual(githubMock.provider, 'github');
  assert.strictEqual(githubMock.signatureStatus.valid, true);
  assert.ok(githubMock.headers['x-github-event'] === 'push');
});
