"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var fileUploader = require('../extensions/file-uploader');

module.exports = {

  mixinName: "Uploadable",

  uploadsCount: 0,
  requireInputs: true,

  initializeUploadable: function () {
    utils.log("Adding uploadable to block " + this.blockID);
    this.withMixin(require('./ajaxable'));

    this.upload_options = Object.assign({}, config.defaults.Block.upload_options, this.upload_options);

    var target = this.el.querySelector('#' + _.result(this, 'inputs_container'));
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
