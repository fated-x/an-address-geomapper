#!/usr/bin/env node --max_old_space_size=4096 --optimize_for_size --max_executable_size=4096 --stack_size=4096
'use strict';

// 3rd party modules.
let _ = require('lodash');
let debug = require('debug')('geomap');
let googleMaps = require('@google/maps');
let Promise = require('bluebird');

// Project modules.
let Database = require('./lib/anow-db');
let Logger = require('./lib/logger');
let logger = new Logger();
var args = require('./lib/cli');
let apiKey = require('./config/keys').googleMapsApiKey;

// Global variables.
let appraisalCount = 0;
let totalProcessed = 0;
let totalUpdated = 0;
let googleMapsClient;

let incrementTotal = function() {
  totalProcessed++;
  if (totalProcessed % 1000 === 0) {
    logger.success('Processed ▻ ' + totalProcessed + '/' + appraisalCount);
  }

  if (totalProcessed === appraisalCount) {
    logger.success('❤ All appraisal addresses have been successfully geocoded into latitude/longitude values!');
    logger.success('  Total processed: ' + totalProcessed);
    logger.success('  Total updated: ' + totalUpdated);
  }
};

let geocodeAppraisal = function(appraisal) {
  let appraisalAddress = appraisal.Address + ' ' + appraisal.AddressTwo + ' ' +
    appraisal.City + ', ' + appraisal.Province + ' ' + appraisal.Country +
    ' ' + appraisal.PostalCode;

  if (appraisal.Latitude && appraisal.Longitude) {
    return incrementTotal();
  }

  let results;
  let latLng;
  let db;

  return googleMapsClient.geocode({
    address: appraisalAddress
  })
  .asPromise()
  .then(function(response) {
    results = _.isArray(response.json.results) ? response.json.results[0] : response.json.results;
    if (results) {
      debug('Geocode results: ' + JSON.stringify(results));
      latLng = results.geometry.location;
      db = new Database(args.env);
      return db.connect();
    }

    debug('Geocode is null.');
    throw new Error('Geocode is null. Skip further down into the promise chain without trying to update anything.');
  })
  .then(() => {
    totalUpdated++;
    return db.updateAppraisalLatLng.bind(db, appraisal.AppraisalId, latLng.lat, latLng.lng);
  })
  .then(() => {
    return db.close();
  })
  .catch((err) => {
    if (err === 'timeout') {
      logger.error(err);
    }
    // Do  nothing. This is here just to allow the first 'then' to skip over the chain.
  })
  .then(incrementTotal)
  .catch((err) => {
    logger.error(err.message);
    throw err;
  });
};

let geocodeAllAppraisals = function(appraisals) {
  appraisalCount = appraisals.length;
  googleMapsClient = googleMaps.createClient({
    Promise: Promise,
    key: apiKey
  });

  return Promise.each(appraisals, geocodeAppraisal);
};

/** Main Line Script *****************************************************/

// Open the connection to the database.
let db = new Database(args.env);
db.connect()
  .then(db.getAppraisals.bind(db))
  .then(geocodeAllAppraisals)
  .catch((error) => {
    logger.error('Final catch: ' + error);
  })
  .then(() => {
    debug('Closing database...');
    return db.close();
  });
