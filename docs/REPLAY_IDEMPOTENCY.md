# Webhook Idempotency & Replay Testing

Test that recipient services gracefully handle duplicate events:
- Verifies that replayed `evt_...` payloads return `200 OK` without creating duplicate database records.
- Flags non-idempotent side effects like duplicate credit card charges or double-sent emails.
