#!/usr/bin/env node
/* eslint-disable no-console */

const yargs = require('yargs');
const config = require('../lib/config');
const Surang = require('../surang');
const log = require('../lib/logger');

function startSurang(argv) {
  if (typeof argv.port !== 'number') {
    yargs.showHelp();
    console.error('\nInvalid argument: "port" must be a number.');
    process.exit(1);
  }

  try {
    const surang = new Surang(argv.port, {
      server: argv.host,
      authKey: argv['auth-key'],
      secure: argv.secure,
    });

    surang.once('connect', log.onSuccessfulConnection);
    surang.once('disconnect', log.onDisconnection);
    surang.once('reject', log.onReject);
    surang.on('error', log.onError);
    if (argv.verbose) {
      surang.on('incoming', log.onNewRequest);
    }

    surang.connect();
  } catch (error) {
    console.error(error);
  }
}

yargs
  .scriptName('surang')
  .usage('Usage: $0 <command> [options]')
  .command(
    'start',
    'start surang tunnel',
    (startYargs) => {
      const globalConfig = config.get();

      startYargs
        .usage('usage: $0 start --port <num> [options]')
        .option('port', {
          alias: 'p',
          describe: 'port on which local HTTP server is running',
          demandOption: true,
        })
        .option('host', {
          alias: 'h',
          describe: 'upstream surang-server address (without protocol prefix)',
          type: 'string',
          demandOption: globalConfig.host === '',
          default: globalConfig.host === '' ? undefined : globalConfig.host,
        })
        .option('auth-key', {
          alias: 'a',
          describe: 'auth key to be used for authenticating to surang-server',
          type: 'string',
          demandOption: globalConfig['auth-key'] === '',
          default: globalConfig['auth-key'] === '' ? undefined : globalConfig['auth-key'],
        })
        .option('verbose', {
          alias: 'v',
          describe: 'set this to "false" to disable logging of incoming requests',
          type: 'boolean',
          default: globalConfig.verbose,
        })
        .option('secure', {
          alias: 's',
          describe: 'set this to "false" if your surang-server doesn\'t support https & wss traffic',
          type: 'boolean',
          default: globalConfig.secure,
        })
        .option('open', {
          alias: 'o',
          describe: 'opens the tunnel url in browser',
          type: 'boolean',
          default: false,
        })
        .help('help')
        .epilogue('Host, Auth key & other options can be set in global config through "surang config" command.')
        .wrap(null)
        .strict();
    },
    startSurang,
  )
  .command(
    'config',
    'sets up global surang config file with defaults',
    (configYargs) => {
      configYargs
        .usage('usage: $0 config')
        .help('help')
        .wrap(null)
        .strict();
    },
    config.generate,
  )
  .demandCommand(1)
  .help('help')
  .wrap(null)
  .strict()
  .parse();
