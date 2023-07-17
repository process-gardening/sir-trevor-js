"use strict";

import "./icons/sir-trevor-icons.svg";
import "./sass/main.scss";

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

import config0 from "./config";

import locales from "./locales";

import events from "./events";

import event_bus from "./event-bus";

import editorStore from "./extensions/editor-store";

import submittable from "./extensions/submittable";
import fileUploader from "./extensions/file-uploader";

import block_mixins from "./block_mixins";

import block_positioner from "./block-positioner";

import block_positioner_select from "./block-positioner-select";

import block_reorder from "./block-reorder";

import block_deletion from "./block-deletion";

import block_validations from "./block-validations";

import block_store from "./block-store";

import block_manager from "./block-manager";

import simple_block from "./simple-block";

import block from "./block";

import blocks from "./blocks";

import format_bar from "./format-bar";

import editor from "./editor";

import to_markdown from "./to-markdown";

import to_html from "./to-html";

import form_events from "./form-events";

const SirTrevor = {

  config: config0,

  log: utils.log,

  Locales: locales,

  Events: events,
  EventBus: event_bus,

  EditorStore: editorStore,
  Submittable: submittable,
  FileUploader: fileUploader,

  BlockMixins: block_mixins,
  BlockPositioner: block_positioner,
  BlockPositionerSelect: block_positioner_select,
  BlockReorder: block_reorder,
  BlockDeletion: block_deletion,
  BlockValidations: block_validations,
  BlockStore: block_store,
  BlockManager: block_manager,

  SimpleBlock: simple_block,
  Block: block,

  Blocks: blocks,

  FormatBar: format_bar,
  Editor: editor,

  toMarkdown: to_markdown,
  toHTML: to_html,

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

Object.assign(SirTrevor, form_events);


export default SirTrevor;
