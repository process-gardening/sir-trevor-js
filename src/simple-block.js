"use strict";

import _ from "./lodash";

import utils from "./utils";

import Dom from "./packages/dom";

import Events from "./packages/events";

import BlockReorder from "./block-reorder";

import BLOCK_TEMPLATE from "./templates/block";

import function_bind from "./function-bind";

import events from "./events";

import renderable from "./renderable";

import block_store from "./block-store";

const SimpleBlock = function (data, instance_id, mediator, options, editorOptions) {
  this.createStore(data);
  this.blockID = _.uniqueId('st-block-');
  this.instanceID = instance_id;
  this.mediator = mediator;
  this.options = options || {};
  this.editorOptions = editorOptions || {};

  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

Object.assign(SimpleBlock.prototype, function_bind, events, renderable, block_store, {

  focus: function () {
  },

  valid: function () {
    return true;
  },

  className: 'st-block',

  block_template: BLOCK_TEMPLATE,

  attributes: function () {
    return {
      'id': this.blockID,
      'data-type': this.type,
      'data-instance': this.instanceID
    };
  },

  title: function () {
    return i18n.t(`blocks:${this.type}:title`) ||
      utils.titleize(this.type.replace(/[\W_]/g, ' '));
  },

  blockCSSClass: function () {
    this.blockCSSClass = utils.toSlug(this.type);
    return this.blockCSSClass;
  },

  type: '',

  class: function () {
    return utils.classify(this.type);
  },

  editorHTML: '',

  initialize: function () {
  },

  onBlockRender: function () {
  },
  beforeBlockRender: function () {
  },

  _setBlockInner: function () {
    //console.log('simple-block::_setBlockInner()');
    const editor_html = _.result(this, 'editorHTML');

    this.el.insertAdjacentHTML("beforeend", this.block_template(editor_html));

    this.inner = this.el.querySelector('.st-block__inner');
  },

  render: function () {
    this.beforeBlockRender();

    this._setBlockInner();
    this._blockPrepare();

    return this;
  },

  _blockPrepare: function () {
    //this._initUI();
    this._initMessages();

    this.checkAndLoadData();

    // set type class on card
    this.el.querySelector('.st-block__card').classList.add('st-block--' + this.type);

    this.el.classList.add('st-item-ready');
    this.on("onRender", this.onBlockRender);
    this.save();
  },

  _withUIComponent: function (component, className, callback) {
    this.ui.appendChild(component.render().el);
    if (className && callback) {
      Events.delegate(this.ui, className, 'click', callback);
    }
  },

  _withUIDrawerComponent: function (component, className, callback) {
    this.ui_drawer.appendChild(component.render().el);
    if (className && callback) {
      Events.delegate(this.ui_drawer, className, 'click', callback);
    }
  },

  _initUI: function () {
    //console.log('simple-block::_initUI()');
    const card_upper = this.el.getElementsByClassName('st-block__card-upper')[0];
    const ui_element = Dom.createElement("div", {'class': 'st-block__ui'});
    card_upper.appendChild(ui_element);
    this.ui = ui_element;

    const card = this.el.getElementsByClassName('st-block__card')[0];
    const controls_drawer = Dom.createElement("div", {
      'class': 'st-block__controls_drawer',
      'tabindex': '0'
    });
    card.appendChild(controls_drawer);
    this.ui_drawer = controls_drawer;
    this._initUIComponents();
  },

  _initMessages: function () {
    const msgs_element = Dom.createElement("div", {'class': 'st-block__messages'});
    this.inner.insertBefore(msgs_element, this.inner.firstChild);
    this.messages = msgs_element;
  },

  addMessage: function (msg, additionalClass) {
    msg = Dom.createElement("span", {html: msg, class: "st-msg " + additionalClass});
    this.messages.appendChild(msg);
    this.messages.classList.add('st-block__messages--is-visible');
    return msg;
  },

  resetMessages: function () {
    this.messages.innerHTML = '';
    this.messages.classList.remove('st-block__messages--is-visible');
  },

  _initUIComponents: function () {
    this._withUIComponent(new BlockReorder(this.el));
  }

});

SimpleBlock.fn = SimpleBlock.prototype;

// Allow our Block to be extended.
SimpleBlock.extend = require('./helpers/extend');

export default SimpleBlock;
