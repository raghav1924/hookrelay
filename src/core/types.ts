export type WebhookProvider = 'stripe' | 'github' | 'supabase' | 'resend' | 'custom';

export interface SignatureValidationResult {
  valid: boolean;
  provider: WebhookProvider;
  headerName?: string;
  expectedSignature?: string;
  receivedSignature?: string;
  error?: string;
}

export interface WebhookEvent {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  path: string;
  headers: Record<string, string>;
  rawBody: string;
  parsedBody: any;
  provider: WebhookProvider;
  signatureStatus: SignatureValidationResult;
  sizeBytes: number;
}

export interface ReplayOptions {
  targetUrl: string;
  headers?: Record<string, string>;
  reSign?: boolean;
  secret?: string;
}

export interface ReplayResult {
  success: boolean;
  statusCode: number;
  durationMs: number;
  responseBody: string;
  error?: string;
}

export interface ServerConfig {
  port: number;
  webPort: number;
  forwardUrl?: string;
  secret?: string;
  provider?: WebhookProvider;
}
