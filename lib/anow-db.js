'use strict';

let _ = require('lodash');
let sql = require('mssql');
let SqlRequest = sql.Request;
let Promise = require('bluebird');
let Logger = require('./logger');
let logger = new Logger();
let databases = require('../config/databases');
let debug = require('debug')('anowDB');

function AnowDB(environment) {
  if (!databases[environment]) {
    throw new Error('Unrecognized environment: ' + environment);
  }

  this.connected = false;
  let config = databases[environment];
  this.connection = new sql.Connection(config);

  return this;
}

AnowDB.prototype.connect = function() {
  if (this.connected) {
    throw new Error('Already connected. Call `close` first.');
  }

  var self = this;
  return this.connection.connect()
    .then(() => {
      self.connected = true;
      debug('Connected.');
    });
};

AnowDB.prototype.close = function() {
  var self = this;
  if (!this.connected) throw new Error('No connection. Call `open` first.');

  return (self.transaction ? self.rollback() : Promise.resolve())
    .then(self.connection.close())
    .then(function() {
      debug('Connection closed.');
      self.connected = false;
    });
};

AnowDB.prototype.getAppraisals = function() {
  let request = new SqlRequest(this.connection);
  let sqlQry = 'SELECT TOP 24000 AppraisalId, Address, AddressTwo, City, ' +
                      'Province, Country, PostalCode, Latitude, Longitude ' +
               'FROM Appraisal ' +
               'WHERE Latitude IS NULL OR Longitude IS NULL ' +
               'ORDER BY AppraisalId DESC';

  return request.query(sqlQry)
    .then((recordset) => {
      logger.success('★ Found ' + recordset.length + ' matches.');
      return recordset;
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};

AnowDB.prototype.updateAppraisalLatLng = function(appraisalID, lat, lng) {
  let request = new SqlRequest(this.connection);
  let sqlUpdate = 'UPDATE Appraisal ' +
                  'SET Latitude = ' + lat + ', Longitude = ' + lng + ' ' +
                  'WHERE AppraisalId = ' + appraisalID;

  return request.query(sqlUpdate)
    .then(() => {
      debug('AppraisalID [' + appraisalID + '] successfully updated.');
    })
    .catch((err) => {
      logger.error(err.message);
      throw err;
    });
};

module.exports = AnowDB;
module.exports.validDatabaseNames = _.keys(databases);
