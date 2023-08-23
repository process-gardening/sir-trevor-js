"use strict";

import _ from "../lodash";

import config from "../config";

import utils from "../utils";

export default {

  mixinName: "Pastable",
  requireInputs: true,

  initializePastable: function() {
    utils.log("Adding pastable to block " + this.blockID);

    this.paste_options = Object.assign(
      {}, config.defaults.Block.paste_options, this.paste_options);

    let target = this.el.querySelector('#' + _.result(this, 'inputs_container'));
    if (target) {
      target.insertAdjacentHTML("beforeend", _.template(this.paste_options.html)(this));
    } else {
      this.inputs.insertAdjacentHTML("beforeend", _.template(this.paste_options.html)(this));
    }

    Array.prototype.forEach.call(this.$('.st-paste-block'), (el) => {
      el.addEventListener('click', function() {
        const event = document.createEvent('HTMLEvents');
        event.initEvent('select', true, false);
        this.dispatchEvent(event);
      });
      el.addEventListener('paste', this._handleContentPaste);
      el.addEventListener('submit', this._handleContentPaste);
    });
  }

};
