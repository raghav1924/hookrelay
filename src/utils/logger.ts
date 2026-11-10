export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  bgRed: '\x1b[41m\x1b[37m\x1b[1m',
  bgYellow: '\x1b[43m\x1b[30m\x1b[1m',
  bgCyan: '\x1b[46m\x1b[30m\x1b[1m',
  bgGreen: '\x1b[42m\x1b[30m\x1b[1m',
  bgMagenta: '\x1b[45m\x1b[37m\x1b[1m',
};

export function banner(): void {
  console.log(`
${colors.cyan}${colors.bold}  ⚡ HOOKRELAY ${colors.reset}${colors.gray}v1.0.0${colors.reset}
${colors.dim}  Local Webhook Interceptor, Cryptographic Verifier & Replay Studio${colors.reset}
${colors.dim}  By Jatin Sharma — https://jatinsh.netlify.app/${colors.reset}
${colors.gray}  ───────────────────────────────────────────────────────────────────${colors.reset}
`);
}

export const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✖${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.gray}${msg}${colors.reset}`),
  request: (id: string, method: string, path: string, status: number, durationMs: number) => {
    const statusColor = status >= 200 && status < 300 ? colors.green : status >= 400 ? colors.red : colors.yellow;
    console.log(
      `${colors.gray}[${new Date().toLocaleTimeString()}]${colors.reset} ` +
      `${colors.bold}${colors.cyan}${method.padEnd(6)}${colors.reset} ` +
      `${colors.white}${path.padEnd(28)}${colors.reset} ` +
      `${statusColor}${status}${colors.reset} ` +
      `${colors.dim}(${durationMs}ms)${colors.reset} ` +
      `${colors.gray}id:${id.slice(0, 8)}${colors.reset}`
    );
  },
};

