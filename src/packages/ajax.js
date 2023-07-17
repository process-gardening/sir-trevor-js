"use strict";

import fetchJsonP from "jsonp-promise";

import cancellablePromise from "./cancellable-promise";

import config from "../config";

require('whatwg-fetch');
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

export default Ajax;
