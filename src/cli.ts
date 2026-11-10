import fs from 'node:fs';
import path from 'node:path';
import { banner, log, colors } from './utils/logger.js';
import { WebhookGateway } from './core/gateway.js';
import { WebStudio } from './ui/web.js';
import { MockGenerator } from './core/mock.js';
import { ServerConfig, WebhookProvider } from './core/types.js';

export function runCli(argv: string[]): void {
  const args = argv.slice(2);
  const command = args[0] || 'listen';

  if (command === '--help' || command === '-h' || command === 'help') {
    banner();
    printHelp();
    return;
  }

  banner();

  if (command === 'listen' || command === 'start' || command === 'proxy') {
    const port = parseInt(getFlagValue(args, '--port') || '4000', 10);
    const webPort = parseInt(getFlagValue(args, '--web-port') || '4040', 10);
    const forwardUrl = getFlagValue(args, '--forward') || getFlagValue(args, '-f');
    const secret = getFlagValue(args, '--secret') || getFlagValue(args, '-s');
    const provider = getFlagValue(args, '--provider') as WebhookProvider | undefined;
    const noWeb = args.includes('--no-web');

    const config: ServerConfig = {
      port,
      webPort,
      forwardUrl,
      secret,
      provider,
    };

    const gateway = new WebhookGateway(config);

    gateway.start()
      .then((activePort) => {
        log.success(`Webhook Ingestion Gateway listening on: ${colors.bold}${colors.cyan}http://localhost:${activePort}${colors.reset}`);
        if (forwardUrl) {
          log.info(`Auto-forwarding incoming webhooks to: ${colors.bold}${forwardUrl}${colors.reset}`);
        }
        if (secret) {
          log.info(`Cryptographic HMAC verification: ${colors.bold}${colors.green}ACTIVE${colors.reset}`);
        } else {
          log.dim(`Tip: Pass --secret <whsec_...> to verify HMAC signatures.`);
        }

        if (!noWeb) {
          WebStudio.serve(gateway, webPort);
        }

        console.log(`${colors.dim}Send test requests with 'hookrelay mock <provider>' or curl directly.${colors.reset}\n`);
      })
      .catch((err) => {
        log.error(`Failed to bind gateway port: ${err.message}`);
        process.exit(1);
      });

    return;
  }

  if (command === 'mock') {
    const provider = (args[1] || 'stripe') as WebhookProvider;
    const secret = getFlagValue(args, '--secret') || 'whsec_test_secret_123';
    const mock = MockGenerator.createMockEvent(provider, secret);

    console.log(`${colors.bold}Generated Mock Webhook Event (${provider}):${colors.reset}\n`);
    console.log(`${colors.cyan}Headers:${colors.reset}`);
    console.log(JSON.stringify(mock.headers, null, 2));
    console.log(`\n${colors.cyan}Payload:${colors.reset}`);
    console.log(JSON.stringify(mock.parsedBody, null, 2));

    const exportPath = getFlagValue(args, '--export');
    if (exportPath) {
      fs.writeFileSync(path.resolve(process.cwd(), exportPath), JSON.stringify(mock, null, 2), 'utf-8');
      log.success(`Saved mock webhook fixture to: ${colors.bold}${exportPath}${colors.reset}`);
    }
    return;
  }

  log.warn(`Unknown command '${command}'`);
  printHelp();
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return undefined;
}

function printHelp(): void {
  console.log(`
${colors.bold}USAGE:${colors.reset}
  $ hookrelay <command> [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.cyan}listen, start${colors.reset}     Start local webhook ingestion gateway & web studio (default)
  ${colors.cyan}mock <provider>${colors.reset}   Generate signed mock event ('stripe' | 'github' | 'supabase')
  ${colors.cyan}help, --help${colors.reset}      Show help documentation

${colors.bold}OPTIONS:${colors.reset}
  ${colors.yellow}--port <port>${colors.reset}         Port for webhook receiver (default: 4000)
  ${colors.yellow}--web-port <port>${colors.reset}     Port for interactive Web Studio (default: 4040)
  ${colors.yellow}--forward <url>${colors.reset}       Auto-forward incoming hooks to local URL (e.g. localhost:3000/api/webhooks)
  ${colors.yellow}--secret <key>${colors.reset}        Webhook secret key for HMAC validation & signing
  ${colors.yellow}--provider <type>${colors.reset}     Default provider ('stripe', 'github', 'supabase', 'custom')
  ${colors.yellow}--export <file.json>${colors.reset}  Save mock event as a JSON test fixture
  ${colors.yellow}--no-web${colors.reset}              Run headless CLI gateway without browser Studio

${colors.bold}EXAMPLES:${colors.reset}
  $ hookrelay listen
  $ hookrelay listen --forward http://localhost:3000/api/webhooks/stripe --secret whsec_test_123
  $ hookrelay mock stripe --export ./tests/fixtures/stripe-checkout.json
`);
}

