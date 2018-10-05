#!/usr/bin/env node

const fs = require('fs');
const childProcess = require('child_process');
const { version: selfVersion } = require('./package.json');

/* eslint-disable no-console */

const argv = process.argv.slice(2);
const localModulesPath = `${process.cwd()}/node_modules`;
const isGlobal = argv[0] === 'global' && argv.length > 1;
const styles = {
  red: '\x1b[35m',
  green: '\x1b[32m',
  underscore: '\x1b[4m',
  reset: '\x1b[0m',
};

function getNodeModulesPath() {
  return isGlobal ? childProcess.execSync('npm root -g').toString().trim() : localModulesPath;
}

function printVersion() {
  console.log(`v${selfVersion}`);
  process.exit(0);
}

function getHelp() {
  console.log('');
  console.log('NPM package version checker');
  console.log('');
  console.log('Usage: ');
  console.log(' $ npmver <package_name> -- print locally installed package version');
  console.log(' $ npmver global <package_name> -- print globally installed package version');
  console.log('');
  console.log(`npmver@${selfVersion}`);
  console.log('');
  process.exit(0);
}

function error(msg) {
  console.log(styles.red, msg);
}

function getVersion(packageName) {
  if (!packageName) {
    getHelp();
  }

  if (!isGlobal && !fs.existsSync(localModulesPath)) {
    console.log('It looks like you are outside of nodejs project directory (can\'t find node_modules folder)');
    console.log('Looking for GLOBAL package version? add "global" flag before <package_name>');
    process.exit(1);
  }

  try {
    const pkg = require(`${getNodeModulesPath()}/packageName/package.json`); // eslint-disable-line global-require, import/no-dynamic-require
    console.log(' -> Package Name:', styles.green, packageName, styles.reset, isGlobal ? '(global)' : '');
    console.log(styles.underscore, '-> Package version:', styles.green, pkg.version);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      error(`Module "${packageName}" was not found in your node_modules folder.`);
      if (!isGlobal) {
        console.log(' Looking for a global package version? add "global" flag before <package_name>');
      }
      process.exit(0);
    }
    throw e;
  }
}

if (argv.includes('--help') || argv.includes('-h')) {
  getHelp();
}
if (argv.includes('--version') || argv.includes('-v')) {
  printVersion();
}

getVersion(argv[isGlobal ? 1 : 0]);
