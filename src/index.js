"use strict";

import "./icons/sir-trevor-icons.svg";

// ES6 shims
import {shim as objectAssignShim} from "object.assign";
objectAssignShim();

import {shim as arrayFindShim} from "array.prototype.find";
arrayFindShim();

import "./vendor/array-includes";

import es6promisepolyfill from "es6-promise";
es6promisepolyfill();

import "./vendor/custom-event";
import "./vendor/ie-classlist-toggle";
import "./vendor/dom-shims";

import utils from "./utils";

const SirTrevor = {

  config: require('./config'),

  log: utils.log,

  Locales: require('./locales'),

  Events: require('./events'),
  EventBus: require('./event-bus'),

  EditorStore: require('./extensions/editor-store'),
  Submittable: require('./extensions/submittable'),
  FileUploader: require('./extensions/file-uploader'),

  BlockMixins: require('./block_mixins'),
  BlockPositioner: require('./block-positioner'),
  BlockPositionerSelect: require('./block-positioner-select'),
  BlockReorder: require('./block-reorder'),
  BlockDeletion: require('./block-deletion'),
  BlockValidations: require('./block-validations'),
  BlockStore: require('./block-store'),
  BlockManager: require('./block-manager'),

  SimpleBlock: require('./simple-block'),
  Block: require('./block'),

  Blocks: require('./blocks'),

  FormatBar: require('./format-bar'),
  Editor: require('./editor'),

  toMarkdown: require('./to-markdown'),
  toHTML: require('./to-html'),

  setDefaults: function (options) {
    Object.assign(SirTrevor.config.defaults, options || {});
  },

  getInstance: utils.getInstance,

  setBlockOptions: function (type, options) {
    const block = SirTrevor.Blocks[type];

    if (typeof block === "undefined") {
      return;
    }

    Object.assign(block.prototype, options || {});
  },

  runOnAllInstances: function (method) {
    if (SirTrevor.Editor.prototype.hasOwnProperty(method)) {
      const methodArgs = Array.prototype.slice.call(arguments, 1);
      Array.prototype.forEach.call(SirTrevor.config.instances, function (i) {
        i[method].apply(null, methodArgs);
      });
    } else {
      SirTrevor.log("method doesn't exist");
    }
  },

};

Object.assign(SirTrevor, require('./form-events'));


export default SirTrevor;
