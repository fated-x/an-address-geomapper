'use strict';

let _ = require('lodash');
let chalk = require('chalk');

let defaultOptions = {
  colors: {
    success: chalk.green,
    info: chalk.bold.white,
    warn: chalk.yellow,
    error: chalk.red,
    status: chalk.white
  }
};

function Logger(options) {
  let opts = options || {};

  if (_.isString(opts)) {
    opts = {
      category: opts
    };
  }

  opts = _.defaultsDeep(opts, defaultOptions);

  this.category = opts.category;
  this.colors = opts.colors;
}

Logger.prototype.getCategory = function() {
  return (this.category ? '(' + this.category + ') ' : '');
};

Logger.prototype.status = function(msg) {
  console.info(this.colors.status((msg || '')));
};

Logger.prototype.success = function(msg) {
  console.info(this.colors.success((msg || '')));
};

Logger.prototype.info = function(msg) {
  console.info(this.colors.info((msg || '')));
};

Logger.prototype.warn = function(msg) {
  console.warn(this.colors.warn('[WARN ] ' + this.getCategory() + ' ' + (msg || '')));
};

Logger.prototype.error = function(msg) {
  console.error(this.colors.error('[ERROR] ' + this.getCategory() + ' ' + (msg || '')));
};

module.exports = Logger;
