"use strict";

const cancellablePromise = function (promise) {
  let resolve, reject;

  const proxyPromise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  promise.then(
    function (value) {
      if (!proxyPromise.cancelled) {
        resolve(value);
      }
    },
    function (value) {
      if (!proxyPromise.cancelled) {
        reject(value);
      }
    }
  );

  proxyPromise.cancel = function () {
    this.cancelled = true;
  };

  return proxyPromise;
};

module.exports = cancellablePromise;
