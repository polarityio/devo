'use strict';

const request = require('request');
const config = require('./config/config');
const async = require('async');
const fs = require('fs');
const NodeCache = require('node-cache');

let Logger;
let requestWithDefaults;

const MAX_PARALLEL_LOOKUPS = 10;

/**
 *
 * @param entities
 * @param options
 * @param cb
 */
function startup(logger) {
  let defaults = {};
  Logger = logger;

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    defaults.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    defaults.key = fs.readFileSync(config.request.key);
  }

  if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
    defaults.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    defaults.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    defaults.proxy = config.request.proxy;
  }

  if (typeof config.request.rejectUnauthorized === 'boolean') {
    defaults.rejectUnauthorized = config.request.rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(defaults);
}

function doLookup(entities, options, cb) {
  let lookupResults = [];
  let tasks = [];
  const summaryFields = options.summaryFields.split(',');
  Logger.debug({ entities }, 'Entities');

  entities.forEach((entity) => {
    //do the lookup
    let requestOptions = {
      method: 'POST',
      uri: `${options.url}/query`,
      body: {
        from: options.searchDays + 'd',
        limit: options.searchLimit,
        ipAsString: true,
        query: options.searchString.replace(/{{ENTITY}}/gi, entity.value)
      },
      headers: {
        Authorization: 'Bearer ' + options.apiToken
      },
      json: true
    };

    tasks.push(function (done) {
      requestWithDefaults(requestOptions, function (error, res, body) {
        if (error) {
          return done({
            error,
            detail: 'Error Executing HTTP Request to Devo REST API'
          });
        }

        let result = {};

        if (res.statusCode === 200) {
          result = {
            entity: entity,
            body: body
          };
        } else if (res.statusCode === 404) {
          // no result found
          result = {
            entity: entity,
            body: null
          };
        } else {
          // unexpected status code
          return done({
            err: body,
            detail: `${body.error}: ${body.message}`
          });
        }

        done(null, result);
      });
    });
  });

  async.parallelLimit(tasks, MAX_PARALLEL_LOOKUPS, (err, results) => {
    if (err) {
      Logger.error({ err: err }, 'Error');
      cb(err);
      return;
    }

    results.forEach((result) => {
      if (!result.body || result.body === null || result.body.length === 0 || !result.body.object || result.body.object.length === 0) {
        lookupResults.push({
          entity: result.entity,
          data: null
        });
      } else {
        lookupResults.push({
          entity: result.entity,
          data: {
            summary: [],
            details: {
              results: result.body,
              tags: _getSummaryTags(result.body.object, summaryFields)
            }
          }
        });
      }
    });

    Logger.debug({ lookupResults }, 'Results');
    cb(null, lookupResults);
  });
}

function _getSummaryTags(results, summaryFields) {
  const tags = new Map();

  results.forEach((item) => {
    summaryFields.forEach((field) => {
      const summaryField = item[field];
      if (summaryField) {
        tags.set(`${field}${summaryField}`, {
          field: field,
          value: summaryField
        });
      }
    });
  });

  return Array.from(tags.values());
}

function validateOptions(userOptions, cb) {
  let errors = [];
  if (
    typeof userOptions.url.value !== 'string' ||
    (typeof userOptions.url.value === 'string' && userOptions.url.value.length === 0)
  ) {
    errors.push({
      key: 'url',
      message: 'You must provide a valid Devo URL'
    });
  }

  if (
    typeof userOptions.apiToken.value !== 'string' ||
    (typeof userOptions.apiToken.value === 'string' && userOptions.apiToken.value.length === 0)
  ) {
    errors.push({
      key: 'apiToken',
      message: 'You must provide a valid Devo Authentication Token'
    });
  }

  if (typeof userOptions.url.value === 'string' && userOptions.url.value.endsWith('/')) {
    errors.push({
      key: 'url',
      message: 'The Devo URL should not end with a forward slash ("/")'
    });
  }

  if (typeof userOptions.summaryFields.value === 'string' && /\s/.test(userOptions.summaryFields.value)) {
    errors.push({
      key: 'summaryFields',
      message: 'Summary Fields should not include spaces.'
    });
  }

  cb(null, errors);
}

module.exports = {
  doLookup: doLookup,
  startup: startup,
  validateOptions: validateOptions
};
