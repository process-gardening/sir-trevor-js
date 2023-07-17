"use strict";

import _ from "./lodash";

import config from "./config";

import Dom from "./packages/dom";

const urlRegex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

const utils = {

  getInstance: function (identifier) {
    if (_.isUndefined(identifier)) {
      return config.instances[0];
    }

    if (_.isString(identifier)) {
      return config.instances.find(function (editor) {
        return editor.ID === identifier;
      });
    }

    return config.instances[identifier];
  },

  getInstanceBySelection: function () {
    return utils.getInstance(
      Dom.getClosest(window.getSelection().anchorNode.parentNode, '.st-block').getAttribute('data-instance')
    );
  },

  getBlockBySelection: function () {
    const instance = utils.getInstanceBySelection();
    if (!instance) return;

    return instance.findBlockById(
      Dom.getClosest(window.getSelection().anchorNode.parentNode, '.st-block').id
    );
  },

  log: function () {
    if (!_.isUndefined(console) && config.debug) {
      console.log.apply(console, arguments);
    }
  },

  isURI: function (string) {
    return (urlRegex.test(string));
  },

  titleize: function (str) {
    if (str === null) {
      return '';
    }
    str = String(str).toLowerCase();
    return str.replace(/(?:^|\s|-)\S/g, function (c) {
      return c.toUpperCase();
    });
  },

  classify: function (str) {
    return utils.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
  },

  capitalize: function (string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },

  flatten: function (obj) {
    const x = {};
    (Array.isArray(obj) ? obj : Object.keys(obj)).forEach(function (i) {
      x[i] = true;
    });
    return x;
  },

  underscored: function (str) {
    return str.trim().replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
      .replace(/[-\s]+/g, '_').toLowerCase();
  },

  reverse: function (str) {
    return str.split("").reverse().join("");
  },

  toSlug: function (str) {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  },

  leftTrim: function (str) {
    return str.replace(/^\s+/, '');
  }

};

export default utils;
