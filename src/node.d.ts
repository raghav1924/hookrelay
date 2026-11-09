declare namespace NodeJS {
  interface Process {
    argv: string[];
    version: string;
    cwd(): string;
    exit(code?: number): never;
    env: Record<string, string | undefined>;
    platform: string;
  }
}

declare const process: NodeJS.Process;

interface Buffer {
  toString(encoding?: string): string;
}

declare const Buffer: {
  from(str: string, encoding?: string): any;
  byteLength(str: string, encoding?: string): number;
};

declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function dirname(p: string): string;
  export function resolve(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
}

declare module 'node:fs' {
  export function existsSync(p: string): boolean;
  export function readFileSync(p: string, encoding: string): string;
  export function writeFileSync(p: string, data: string, encoding: string): void;
  export function mkdirSync(p: string, options?: { recursive?: boolean }): string | undefined;
  export function readdirSync(p: string, options?: { withFileTypes?: boolean }): any[];
}

declare module 'node:http' {
  export interface IncomingMessage {
    url?: string;
    method?: string;
    statusCode?: number;
    headers: Record<string, string | string[] | undefined>;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: any) => void): this;
  }
  export interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    setHeader(name: string, value: string): void;
    end(data?: string): void;
  }
  export interface Server {
    listen(port: number, host?: string, callback?: () => void): this;
    listen(port: number, callback?: () => void): this;
    close(callback?: () => void): this;
    on(event: string, listener: (err: any) => void): this;
  }
  export function createServer(handler: (req: IncomingMessage, res: ServerResponse) => void): Server;
  export function request(options: any, callback?: (res: IncomingMessage) => void): any;
}

declare module 'node:crypto' {
  export function createHmac(algorithm: string, key: string | Buffer): any;
  export function timingSafeEqual(a: Buffer, b: Buffer): boolean;
  export function randomUUID(): string;
}

declare module 'node:url' {
  export class URL {
    constructor(url: string, base?: string);
    pathname: string;
    searchParams: any;
    hostname: string;
    port: string;
    protocol: string;
  }
}

declare module 'node:test' {
  export default function test(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert' {
  export function ok(value: unknown, message?: string): void;
  export function strictEqual(actual: unknown, expected: unknown, message?: string): void;
  export function deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
}
