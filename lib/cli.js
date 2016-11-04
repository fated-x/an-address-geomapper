'use strict';

var _ = require('lodash');
var yargs = require('yargs');
var databases = require('./anow-db').validDatabaseNames;

var opts = {
  b: {
    alias: 'batchSize',
    describe: 'The number of rows to commit to the database at once.',
    type: 'number',
    default: 1000,
    nargs: 1
  },
  e: {
    alias: 'env',
    default: 'dev',
    describe: 'The name of the environment to connect to (from databases.json).',
    choices: databases,
    type: 'string'
  }
};

function ensurePositiveInteger(name, val, minVal) {
  var min = minVal || 0;

  if (min < 0) throw Error('minVal cannot be negative');

  if (!_.isNumber(val) || _.isNaN(val) || !_.isInteger(val) || val < min) {
    throw new Error('\'' + name + '\' must be a positive integer greater than or equal to ' + min + '.');
  }
}

function resolveOptions(args) {
  ensurePositiveInteger(opts.b.alias, args[opts.b.alias], 1);
  if (args.debug) process.env.DEBUG = true;

  return true;
}

var cli = yargs.usage('Usage: $0 [args]')
  .help()
  .version()
  .strict()
  .check(resolveOptions)
  .options(opts)
  .argv;

module.exports = cli;
