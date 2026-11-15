# Supported Webhook Providers

Built-in signature validation and mock event synthesis:
- **Stripe**: `stripe-signature` header (`t=timestamp,v1=signature`).
- **GitHub**: `x-hub-signature-256` SHA-256 HMAC digest.
- **Shopify**: `x-shopify-hmac-sha256` base64 encoded digest.
- **Supabase**: Custom authorization header and JWT claim validation.
