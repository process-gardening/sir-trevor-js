"use strict";

import _ from "../lodash";

import Ajax from "../packages/ajax";

export default {

  mixinName: "Fetchable",

  initializeFetchable: function(){
    this.withMixin(require('./ajaxable'));
  },

  fetch: function(url, options, success, failure){
    const uid = _.uniqueId(this.blockID + "_fetch"),
      xhr = Ajax.fetch(url, options);

    this.resetMessages();
    this.addQueuedItem(uid, xhr);

    function alwaysFunc(func, arg) {
      /*jshint validthis: true */
      func.call(this, arg);
      this.removeQueuedItem(uid);
    }

    if(!_.isUndefined(success)) {
      xhr.then(alwaysFunc.bind(this, success));
    }

    if(!_.isUndefined(failure)) {
      xhr.catch(alwaysFunc.bind(this, failure));
    }

    return xhr;
  }

};
