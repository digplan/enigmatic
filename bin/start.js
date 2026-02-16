#!/usr/bin/env bun
import { createServer, warnMissingTlsFiles } from "../src/server.js";

function printBanner() {
  console.log(`
========================
      vanilla-light
========================
`);
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--port" || arg === "-p") {
    options.port = parseInt(args[++i], 10) || 3000;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`Usage: vanilla-light [options]

Options:
  -p, --port <number>    Port to listen on (default: 3000)
  -h, --help            Show this help message`);
    process.exit(0);
  }
}

const config = createServer(options);
printBanner();
console.log(`server starting on port ${config.port}...`);
warnMissingTlsFiles();
Bun.serve(config);
