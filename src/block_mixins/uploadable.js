"use strict";

import _ from "../lodash";

import config from "../config";

import utils from "../utils";

import fileUploader from "../extensions/file-uploader";

import ajaxable from "./ajaxable";

export default {

  mixinName: "Uploadable",

  uploadsCount: 0,
  requireInputs: true,

  initializeUploadable: function () {
    utils.log("Adding uploadable to block " + this.blockID);
    this.withMixin(ajaxable);

    this.upload_options = Object.assign({}, config.defaults.Block.upload_options, this.upload_options);

    let target = this.el.querySelector('#' + _.result(this, 'inputs_container'));
    if (target) {
      target.insertAdjacentHTML("beforeend", _.template(this.upload_options.html)(this));
    } else {
      this.inputs.insertAdjacentHTML("beforeend", _.template(this.upload_options.html)(this));
      target = this.inputs;
    }

    Array.prototype.forEach.call(target.querySelectorAll('button'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.preventDefault();
      });
    });
    Array.prototype.forEach.call(target.querySelectorAll('input'), function (input) {
      input.addEventListener('change', (function (ev) {
        this.onDrop(ev.currentTarget);
      }).bind(this));
    }.bind(this));
  },

  uploader: function (file, success, failure) {
    return fileUploader(this, file, success, failure);
  }

};
