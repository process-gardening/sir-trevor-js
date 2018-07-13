"use strict";

var _ = require('./lodash');

var ScribeInterface = require('./scribe-interface');

var config = require('./config');
var utils = require('./utils');
var Dom = require('./packages/dom');
var Events = require('./packages/events');
var BlockMixins = require('./block_mixins');

var SimpleBlock = require('./simple-block');
var BlockReorder = require('./block-reorder');
var BlockDeletion = require('./block-deletion');
var BlockPositioner = require('./block-positioner');
var EventBus = require('./event-bus');

var { Spinner } = require('spin.js');

var { trimScribeContent } = require('./blocks/scribe-plugins/shared');;

const DELETE_TEMPLATE = require("./templates/delete");

var Block = function(data, instance_id, mediator, options, editorOptions) {
  SimpleBlock.apply(this, arguments);
};

Block.prototype = Object.create(SimpleBlock.prototype);
Block.prototype.constructor = Block;

Object.assign(Block.prototype, SimpleBlock.fn, require('./block-validations'), {

  bound: [
    "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick",
    "clearInsertedStyles", "getSelectionForFormatter", "onBlockRender",
    "onDeleteConfirm", "onPositionerClick"
  ],

  className: 'st-block',

  attributes: function() {
    return Object.assign(SimpleBlock.fn.attributes.call(this));
  },

  icon_name: 'default',

  validationFailMsg: function() {
    return i18n.t('errors:validation_fail', { type: _.isFunction(this.title) ? this.title() : this.title });
  },

  editorHTML: "<div class=\"st-block__editor\"></div>",

  toolbarEnabled: true,

  availableMixins: ['droppable', 'pastable', 'uploadable', 'fetchable',
    'ajaxable', 'controllable', 'multi_editable', 'textable'],

  droppable: false,
  pastable: false,
  uploadable: false,
  fetchable: false,
  ajaxable: false,
  mergeable: false,
  multi_editable: false,
  textable: false,

  drop_options: {},
  paste_options: {},
  upload_options: {},

  formattable: true,
  supressKeyListeners: false,

  _previousSelection: '',
  _currentPosition: -1,

  initialize: function() {},

  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },

  withMixin: function(mixin) {
    if (!_.isObject(mixin)) { return; }

    var initializeMethod = "initialize" + mixin.mixinName;

    if (_.isUndefined(this[initializeMethod])) {
      Object.assign(this, mixin);
      this[initializeMethod]();
    }
  },

  render: function() {
    //console.log('block::render()');
    this.beforeBlockRender();
    this._setBlockInner();
    this._initUI();

    this.editor = this.inner.children[0];

    //console.log('block adding mixins');

    this.mixinsRequireInputs = false;
    this.availableMixins.forEach(function(mixin) {
      if (this[mixin]) {
        var blockMixin = BlockMixins[utils.classify(mixin)];
        if (!_.isUndefined(blockMixin.requireInputs) && blockMixin.requireInputs) {
          this.mixinsRequireInputs = true;
        }
      }
    }, this);

    if(this.mixinsRequireInputs) {
      var input_html = document.createElement("div");
      input_html.classList.add('st-block__inputs');


      this.inner.appendChild(input_html);


      this.inputs = input_html;
    }

    if (this.hasTextBlock()) { this._initTextBlocks(); }

    this.availableMixins.forEach(function(mixin) {
      if (this[mixin]) {
        this.withMixin(BlockMixins[utils.classify(mixin)]);
      }
    }, this);

    if (this.formattable) { this._initFormatting(); }

    this._blockPrepare();

    return this;
  },

  remove: function() {
    if (this.ajaxable) {
      this.resolveAllInQueue();
    }

    Dom.remove(this.el);
  },

  loading: function() {
    if(!_.isUndefined(this.spinner)) { this.ready(); }

    this.spinner = new Spinner(config.defaults.spinner);
    this.spinner.spin(this.el);

    this.el.classList.add('st--is-loading');
  },

  ready: function() {
    this.el.classList.remove('st--is-loading');
    if (!_.isUndefined(this.spinner)) {
      this.spinner.stop();
      delete this.spinner;
    }
  },

   //Generic _serializeData implementation to serialize the block into a plain object.
   //Can be overwritten, although hopefully this will cover most situations.
   //If you want to get the data of your block use block.getBlockData()

   // jshint maxdepth:4
  _serializeData: function() {
    utils.log("toData for " + this.blockID);

    var data = {};

    //[> Simple to start. Add conditions later <]
    if (this.hasTextBlock()) {
      data.text = this.getTextBlockHTML();
      data.format = 'html';
    }

    // Add any inputs to the data attr
    var matcher = [
      'input:not([class="st-paste-block"])',
      'textarea:not([class="st-paste-block"])',
      'select:not([class="st-paste-block"])',
      'button:not([class="st-paste-block"])'
    ].join(",");

    if (this.$(matcher).length > 0) {
      Array.prototype.forEach.call(this.$('input, textarea, select, button'), function(input) {

        // Reference elements by their `name` attribute. For elements such as radio buttons
        // which require a unique reference per group of elements a `data-name` attribute can
        // be used to provide the same `name` per block.

        var name = input.getAttribute('data-name') || input.getAttribute('name');

        if (name) {
          if (input.getAttribute('type') === 'number') {
            data[name] = parseInt(input.value);
          }
          else if (input.getAttribute('type') === 'checkbox') {
            var value = "";
            if (input.getAttribute('data-toggle')) {
              value = "off";
              if (input.checked === true) {
                value = "on";
              }
            } else if (input.checked === true) {
              value = input.value;
            }
            data[name] = value;
          }
          else if (input.getAttribute('type') === 'radio') {
            if (input.checked === true) {
              data[name] = input.value;
            }
          }
          else {
            data[name] = input.value;
          }
        }
      });
    }

    return data;
  },

  //[> Generic implementation to tell us when the block is active <]
  focus: function() {
    Array.prototype.forEach.call(this.getTextBlock(), function(el) {
      el.focus();
    });
  },

  focusAtStart: function() {
    this.focus();
  },

  focusAtEnd: function () {
    this.focus();
  },

  blur: function () {
    Array.prototype.forEach.call(this.getTextBlock(), function (el) {
      el.blur();
    });
  },

  onFocus: function () {
    Array.prototype.forEach.call(this.getTextBlock(), (el) => {
      el.addEventListener('focus', this._onFocus);
    });
  },

  onBlur: function () {
    Array.prototype.forEach.call(this.getTextBlock(), (el) => {
      el.addEventListener('blur', this._onBlur);
    });
  },

  //Event handlers
  _onFocus: function () {
    //console.log('focus');
    this.ui_drawer.classList.add('visible');
    this.trigger('block:focus', this.el);
  },

  _onBlur: function () {
    //console.log('blur');
    this.ui_drawer.classList.remove('visible');
    this.trigger('block:blur', this.el);
  },



  onDrop: function (dataTransferObj) {
  },

  onDeleteConfirm: function (e) {
    //console.log('onDeleteConfirm()');
    e.preventDefault();
    e.stopPropagation();
    this.mediator.trigger('block:remove', this.blockID, {focusOnPrevious: true});

    // hide popup, should be deleted already
    let popup = document.getElementById('ui-delete-modal');
    if (popup) {
      popup.remove();
    }
  },

  onDeleteDeny: function (e) {
    //console.log('onDeleteDeny()', this);
    e.preventDefault();
    e.stopPropagation();

    // remove blur lock, drawer can close
    for (let elem of document.getElementsByClassName('visible_delete')) {
      elem.classList.remove('visible_delete');
    }
    // unmark all blocks
    for (let elem of document.getElementsByClassName('to-delete')) {
      elem.classList.remove('to-delete');
    }

    // remove popup
    let popup = document.getElementById('ui-delete-modal');
    if (popup) {
      popup.remove();
    }
  },

  onDeleteClick: function (e) {
    //console.log('onDeleteClick()');
    e.preventDefault();
    e.stopPropagation();

    // remove blur lock, keeps drawer open
    for (let elem of document.getElementsByClassName('visible_delete')) {
      elem.classList.remove('visible_delete');
    }
    // add blur lock
    this.ui_drawer.classList.add('visible_delete');
    // is current block already marked? -> cancel delete
    if (this.el.classList.contains('to-delete')) {
      this.onDeleteDeny(e);
      return;
    }

    // unmark all blocks
    for (let elem of document.getElementsByClassName('to-delete')) {
      elem.classList.remove('to-delete');
    }

    // delete old popup. Can happen, if user clicks consecutively on two delete buttons
    let popup = document.getElementById('ui-delete-modal');
    if (popup) {
      popup.classList.remove("active");
      popup.remove();
      popup = null;
    }

    // if empty, delete without asking
    if (this.isEmpty()) {
      this.onDeleteConfirm.call(this, new CustomEvent('click'));
      return;
    }

    // mark card to delete
    this.el.classList.add('to-delete');

    // create and show modal delete popup card
    if (popup === null) {
      document.getElementById(this.blockID).insertAdjacentHTML("beforeend", DELETE_TEMPLATE());
      popup = document.getElementById('ui-delete-modal');
    }

    // connect button events
    //Events.delegate(popup, ".js-st-block-confirm-delete", "click", this.onDeleteConfirm);
    //Events.delegate(popup, ".js-st-block-deny-delete", "click", this.onDeleteDeny);
    popup.getElementsByClassName("js-st-block-confirm-delete")[0].addEventListener("click", this.onDeleteConfirm );
    popup.getElementsByClassName("js-st-block-deny-delete")[0].addEventListener("click", this.onDeleteDeny );



    // catch other click events to prevent propagation to hideAllTheThings
    document.getElementById("ui-delete-modal").addEventListener("click", function (e) {
      console.log('Click on modal');
      e.preventDefault();
      e.stopPropagation();
    });

    popup.classList.add("active");
  },

  onPositionerClick: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.positioner.toggle();
  },

  beforeLoadingData: function () {
    this.loading();

    if (this.mixinsRequireInputs) {
      Dom.show(this.editor);
      Dom.hide(this.inputs);
    }

    SimpleBlock.fn.beforeLoadingData.call(this);

    this.ready();
  },

  execTextBlockCommand: function (cmdName) {
    if (_.isUndefined(this._scribe)) {
      throw "No Scribe instance found to send a command to";
    }

    return ScribeInterface.execTextBlockCommand(this._scribe, cmdName);
  },

  queryTextBlockCommandState: function (cmdName) {
    if (_.isUndefined(this._scribe)) {
      throw "No Scribe instance found to query command";
    }

    return ScribeInterface.queryTextBlockCommandState(this._scribe, cmdName);
  },

  _handleContentPaste: function (ev) {
    setTimeout(this.onContentPasted.bind(this, ev, ev.currentTarget), 0);
  },

  _getBlockClass: function () {
    return 'st-block--' + this.className;
  },

  //Init functions for adding functionality
  _initUIComponents: function () {

    this.positioner = new BlockPositioner(this.el, this.mediator);

    this._withUIComponent(this.positioner, '.st-block-ui-btn__reorder',
      this.onPositionerClick);

    this._withUIComponent(new BlockReorder(this.el, this.mediator));

    this._withUIDrawerComponent(new BlockDeletion(), '.st-block-ui-btn__delete',
      this.onDeleteClick);

    // add container for controllable mixin in drawer
    this.ui_drawer.insertAdjacentHTML("beforeend", `
      <div class="st-block__ui-controllables">
      </div>
    `);


    this.onFocus();
    this.onBlur();

    // callbacks for opening and closing drawer
    Events.delegate(this.el, '.st-block__content', 'focusin', this._onFocus);
    Events.delegate(this.el, '.st-block__content', 'focusout', this._onBlur);
    Events.delegate(this.el, '.st-block__controls_drawer', 'focusin', this._onFocus);
    Events.delegate(this.el, '.st-block__controls_drawer', 'focusout', this._onBlur);


    // add id/position to ui_drawer
    var pos_info = `
    <div class="st-block__ui-position-info">
      <p class="st-block__ui-position-info">id: ${this.blockID} ed: ${this.instanceID}
      #<span class="st-block__ui-position-info">set me</span></p>
    </div>
    `
    this.ui_drawer.insertAdjacentHTML("beforeend", pos_info);
  },

  _currentPositionUpdated: function (pos) {
    //console.log('block::_currentPositionUpdated( ' + pos + ' )');
    this._currentPosition = pos;
    let p = this.ui_drawer.querySelector('p.st-block__ui-position-info');
    //p.innerHTML = `id: ${this.blockID} ed: ${this.instanceID}  #${this._currentPosition}`;
    p.innerHTML = `#${this._currentPosition}`;
  },

  _initFormatting: function () {

    // Enable formatting keyboard input
    var block = this;

    if (!this.options.formatBar) {
      return;
    }

    this.options.formatBar.commands.forEach(function (cmd) {
      if (_.isUndefined(cmd.keyCode)) {
        return;
      }

      Events.delegate(block.el, '.st-text-block', 'keydown', function (ev) {
        if ((ev.metaKey || ev.ctrlKey) && ev.keyCode === cmd.keyCode) {
          ev.preventDefault();
          block.execTextBlockCommand(cmd.cmd);
        }
      });
    });
  },

  _initTextBlocks: function () {
    Array.prototype.forEach.call(this.getTextBlock(), (el) => {
      el.addEventListener('keyup', this.getSelectionForFormatter);
      el.addEventListener('mousedown', this.addMouseupListener.bind(this));
      el.addEventListener('DOMNodeInserted', this.clearInsertedStyles);
    });

    var textBlock = this.getTextBlock()[0];
    if (!_.isUndefined(textBlock) && _.isUndefined(this._scribe)) {

      var configureScribe =
        _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
      this._scribe = ScribeInterface.initScribeInstance(
        textBlock, this.scribeOptions, configureScribe, this.editorOptions
      );
    }
  },

  addMouseupListener: function addMouseupListener() {
    var listener = () => {
      this.getSelectionForFormatter();
      window.removeEventListener('mouseup', listener);
    };
    window.addEventListener('mouseup', listener);
  },

  getSelectionForFormatter: function () {
    setTimeout(() => {
      var selection = window.getSelection(),
        selectionStr = selection.toString().trim(),
        en = 'formatter:' + ((selectionStr === '') ? 'hide' : 'position');

      this.mediator.trigger(en, this);
      EventBus.trigger(en, this);
    }, 1);
  },

  clearInsertedStyles: function (e) {
    var target = e.target;
    if (_.isUndefined(target.tagName)) {
      target = target.parentNode;
    }
    target.removeAttribute('style'); // Hacky fix for Chrome.
  },

  hasTextBlock: function () {
    return this.getTextBlock().length > 0;
  },

  getTextBlock: function () {
    if (_.isUndefined(this.text_block)) {
      this.text_block = this.$('.st-text-block');
    }

    return this.text_block;
  },

  getTextBlockHTML: function () {
    return this._scribe.getContent();
  },

  setTextBlockHTML: function (html) {
    var returnVal = this._scribe.setContent(html);

    trimScribeContent(this._scribe);

    return returnVal;
  },

  isEmpty: function () {
    return _.isEmpty(this.getBlockData());
  },

  select: function(selected) {
    this.el.classList.toggle("st-block--is-selected", selected);
  },

  split: function() {},

  asClipboardHTML: function() {}

});

Block.extend = require('./helpers/extend'); // Allow our Block to be extended.

module.exports = Block;
