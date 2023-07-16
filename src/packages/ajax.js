"use strict";

require('whatwg-fetch');
const fetchJsonP = require('jsonp-promise');
const cancellablePromise = require('./cancellable-promise');
const config = require('../config');

let Ajax = Object.create(null);

Ajax.fetch = (url, options = {}) => {

  options = Object.assign({}, config.defaults.ajaxOptions, options);

  let promise;
  if (options.jsonp) {
    promise = fetchJsonP(url).promise;
  } else {
    promise = fetch(url, options).then( function(response) {
      if (options.dataType === 'json') {
        return response.json();
      }
      return response.text();
    });
  }
  return cancellablePromise(promise);
};

module.exports = Ajax;
