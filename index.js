#!/usr/bin/env node
'use strict';
var childProcess = require('child_process');
var fs = require('fs');
var argv = process.argv.slice(2);
var styles = {
  // red: "\x1b[31m",
  red: "\x1b[35m",
  green: "\x1b[32m",
  underscore: "\x1b[4m",
  reset: "\x1b[0m",
};
var localModulesPath = process.cwd() + '/node_modules';
var isGlobal = argv[0] === 'global' && argv.length > 1;

if (argv.includes('--help')) {
  getHelp();
}
if (argv.includes('--version') || argv.includes('-v')) {
  printVersion();
}

function getNodeModulesPath() {
  return isGlobal ? childProcess.execSync('npm root -g').toString().trim("\n") : localModulesPath;
}

function printVersion() {
  console.log('v' + require('./package.json').version);
  process.exit(0);
}

function getHelp() {
  console.log('');
  console.log('Usage: ');
  console.log('$ npmver <package_name> -- print locally installed package version');
  console.log('$ npmver global <package_name> -- print globally installed package version');
  console.log('');
  console.log('npmver@' + require('./package.json').version);
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
    var pkg = require(getNodeModulesPath() + '/' + packageName + '/package.json');
    console.log(' -> Package Name:', styles.green, packageName, styles.reset, isGlobal ? '(global)' : '');
    console.log(styles.underscore, "-> Package version:", styles.green, pkg.version);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      error('Module "' + packageName + '" was not found in your node_modules folder.');
      if (!isGlobal) {
        console.log(' Looking for a global package version? add "global" flag before <package_name>');
      }
      process.exit(0);
    }
    throw e;
  }
}

getVersion(argv[isGlobal ? 1 : 0]);