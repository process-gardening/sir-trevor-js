"use strict";

/*
 * Sir Trevor Editor
 * --
 * Represents one Sir Trevor editor instance (with multiple blocks)
 * Each block references this instance.
 * BlockTypes are global however.
 */

import _ from "./lodash";

import config from "./config";

import utils from "./utils";

import Dom from "./packages/dom";

import Events from "./events";

import EventBus from "./event-bus";

import FormEvents from "./form-events";

import BlockControls from "./block-controls";

import BlockAddition from "./block-addition";

import BlockAdditionTop from "./block-addition-top";

import BlockAdditionFull from "./block-addition-full";

import BlockManager from "./block-manager";

import FormatBar from "./format-bar";

import EditorStore from "./extensions/editor-store";

import ErrorHandler from "./error-handler";

import BlockPositionerSelect from "./block-positioner-select";

import SelectionHandler from "./selection-handler";

import function_bind from "./function-bind";

const Editor = function (options) {
  this.initialize(options);
};

Object.assign(Editor.prototype, function_bind, Events, {

  bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition',
    'removeBlockDragOver',
    'blockLimitReached', 'blockOrderUpdated', 'onBlockCountChange',
    'renderBlockPositionerSelect'],

  events: {
    'block:reorder:dragend': 'removeBlockDragOver',
    'block:reorder:dropped': 'removeBlockDragOver',
    'block:content:dropped': 'removeBlockDragOver'
  },

  initialize: function (options) {
    utils.log("Init SirTrevor.Editor");

    this.options = Object.assign({}, config.defaults, options || {});
    //console.log(this.options);
    this.ID = _.uniqueId('st-editor-');

    if (!this._ensureAndSetElements()) {
      return false;
    }

    if (!_.isUndefined(this.options.onEditorRender) &&
      _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }

    // Mediated events for *this* Editor instance
    this.mediator = Object.assign({}, Events);

    this._bindFunctions();

    config.instances.push(this);

    this.build();

    FormEvents.bindFormSubmit(this.form);
  },

  /*
   * Build the Editor instance.
   * Check to see if we've been passed JSON already, and if not try and
   * create a default block.
   * If we have JSON then we need to build all of our blocks from this.
   */
  build: function () {
    Dom.hide(this.el);

    // this.mediator.on('all', this.onAll); // only for debugging

    this.errorHandler = new ErrorHandler(this.outer, this.mediator, this.options.errorsContainer);
    this.store = new EditorStore(this.el.value, this.mediator);

    this.blockManager = new BlockManager(this);
    this.blockAddition = BlockAddition.create(this);
    this.blockAdditionTop = BlockAdditionTop.create(this);
    this.blockAdditionFull = BlockAdditionFull.create(this);
    this.blockControls = BlockControls.create(this);
    this.blockPositionerSelect = new BlockPositionerSelect(this.mediator);
    this.selectionHandler = new SelectionHandler(this.outer, this.mediator, this);
    this.formatBar = new FormatBar(this.options.formatBar, this.mediator, this);

    this.mediator.on('block:changePosition', this.changeBlockPosition);
    this.mediator.on('block:limitReached', this.blockLimitReached);

    // Apply specific classes when block order is updated
    this.mediator.on('block:rerender', this.blockOrderUpdated);
    this.mediator.on('block:create', this.blockOrderUpdated);
    this.mediator.on('block:remove', this.blockOrderUpdated);
    this.mediator.on('block:replace', this.blockOrderUpdated);
    this.mediator.on("block:countUpdate", this.onBlockCountChange);
    this.mediator.on("block-positioner-select:render", this.renderBlockPositionerSelect);

    this.dataStore = "Please use store.retrieve();";

    this._setEvents();

    // External event listeners
    window.addEventListener('click', this.hideAllTheThings);
    document.body.addEventListener('keydown', this.disableBackButton);

    this.createBlocks();
    this.wrapper.classList.add('st-ready');

    if (!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },

  onAll: function(e, d, d2) {
    console.log('event: ', e, d, d2);
  },

  createBlocks: function () {
    const store = this.store.retrieve();

    //console.log('createBlocks()');

    if (store.data.length > 0) {
      store.data.forEach(function (block) {
        this.mediator.trigger('block:create', block.type, block.data);
      }, this);
      // Need to update positioner. Its debounced. Only last one will be correct
      this.mediator.trigger('block:updateAll');

    } else if (this.options.defaultType !== false || this.options.editorMode === 'document') {
      if (this.options.defaultType !== false) {
        this.mediator.trigger('block:create', this.options.defaultType, {});
      } else {
        this.mediator.trigger('block:create', 'text', {});
      }

    if (this.options.focusOnInit) {
      const blockElement = this.wrapper.querySelectorAll(`.st-block[data-instance="${this.ID}"]`)[0];

      if (blockElement) {
          const block = this.blockManager.findBlockById(blockElement.getAttribute('id'));
          block.focus();
        }
      }
    }
  },

  destroy: function () {
    // Destroy the rendered sub views
    this.formatBar.destroy();
    this.blockAddition.destroy();
    this.blockControls.destroy();

    // Destroy all blocks
    this.blockManager.blocks.forEach(function (block) {
      this.mediator.trigger('block:remove', block.blockID);
    }, this);

    // Stop listening to events
    this.mediator.stopListening();
    this.stopListening();

    // Remove instance
    config.instances = config.instances.filter(function (instance) {
      return instance.ID !== this.ID;
    }, this);

    // Remove external event listeners
    window.removeEventListener('click', this.hideAllTheThings);
    document.body.removeEventListener('keydown', this.disableBackButton);

    // Clear the store
    this.store.reset();
    Dom.replaceWith(this.outer, this.el);
  },

  getData: function() {
    this.onFormSubmit();
    return this.store.retrieve();
  },

  reinitialize: function (options) {
    this.destroy();
    this.initialize(options || this.options);
  },

  restore: function(data) {
    this.el.value = data;
    this.reinitialize();
  },

  blockLimitReached: function (toggle) {
    this.wrapper.classList.toggle('st--block-limit-reached', toggle);
  },

  blockOrderUpdated: function () {
    //console.log('editor::blockOrderUpdated()');
    // Detect first block and decide whether to hide top controls
    const blockElement = this.wrapper.querySelectorAll(`.st-block[data-instance="${this.ID}"]`)[0];
    let hideTopControls = false;

    if (blockElement) {
      const block = this.blockManager.findBlockById(
        blockElement.getAttribute('id')
      );
      hideTopControls = block && block.textable;
    }

    this._toggleHideTopControls(hideTopControls);

    // update block position info
    this.updateBlockNumbering();
  },

  _toggleHideTopControls: function (toggle) {
    if (this.options.editorMode === 'document') {
      this.wrapper.classList.toggle('st--hide-top-controls', toggle);
    }
  },

  onBlockCountChange: function(new_count) {
    this.blockPositionerSelect.onBlockCountChange(new_count);
  },

  renderBlockPositionerSelect: function(positioner) {
    this.blockPositionerSelect.renderInBlock(positioner);
  },

  _setEvents: function () {
    Object.keys(this.events).forEach(function (type) {
      EventBus.on(type, this[this.events[type]], this);
    }, this);
  },

  hideAllTheThings: function(e) {
    //console.log('editor:hideAllTheThings()');
    //console.log(e);
    if (e) {
      //e.stopPropagation();
    }
    //console.log(this);
    this.blockControls.hide();
    this.blockAddition.hide();
    this.blockAdditionTop.hide();
    this.blockAdditionFull.hide();

    if (document.activeElement.getAttribute('contenteditable') === null) {
      this.formatBar.hide();
    }

    _.debounce(function () {
      let delete_popup = document.getElementById('ui-delete-modal');
      if (delete_popup) {
        delete_popup.remove();
      }
      for (let elem of document.getElementsByClassName('to-delete')) {
        elem.classList.remove('to-delete');
      }
      // remove blur lock, drawer can close
      for (let elem of document.getElementsByClassName('visible_delete')) {
        elem.classList.remove('visible_delete');
      }

      for (let elem of document.getElementsByClassName('st-block-positioner active')) {
        elem.classList.remove('active');
      }
    }, 5)();
  },

  store: function (method, options) {
    utils.log("The store method has been removed, please call store[methodName]");
    return this.store[method].call(this, options || {});
  },

  removeBlockDragOver: function() {
    const dragOver = this.outer.querySelector('.st-drag-over');
    if (!dragOver) { return; }
    dragOver.classList.remove('st-drag-over');
  },

  changeBlockPosition: function(block, selectedPosition) {
    //console.log('editor::changeBlockPosition()');
    //console.log('block:');
    //console.log(block);
    //console.log('selectedPosition:');
    //console.log(selectedPosition);
    selectedPosition = selectedPosition - 1;

    let blockPosition = this.blockManager.getBlockPosition(block);
    let blockBy = this.wrapper.querySelectorAll(`.st-block[data-instance="${this.ID}"]`)[selectedPosition];

    if(blockBy && blockBy.getAttribute('id') !== block.getAttribute('id')) {
      this.hideAllTheThings();
      if (blockPosition > selectedPosition) {
        blockBy.parentNode.insertBefore(block, blockBy);
      } else {
        Dom.insertAfter(block, blockBy);
      }

      // update block position info
      this.updateBlockNumbering();
    }
  },

  updateBlockNumbering: function () {
    //console.log('editor::updateBlockNumbering()');

    // update block position info
    let i = 0;
    for (i = 0; i < this.blockManager.blocks.length; i++) {
      //console.log(this.blockManager.blocks[i]);
      this.blockManager.blocks[i]
        ._currentPositionUpdated(this.blockManager.getBlockPosition(this.blockManager.blocks[i].el) + 1);
    }
  },

  /*
   * Handle a form submission of this Editor instance.
   * Validate all of our blocks, and serialise all data onto the JSON objects
   */
  onFormSubmit: function(shouldValidate) {
    // if undefined or null or anything other than false - treat as true
    shouldValidate = (shouldValidate === false) ? false : true;

    utils.log("Handling form submission for Editor " + this.ID);

    this.mediator.trigger('errors:reset');
    this.store.reset();

    this.validateBlocks(shouldValidate);
    this.blockManager.validateBlockTypesExist(shouldValidate);

    this.mediator.trigger('errors:render');
    this.el.value = this.store.toString();

    return this.errorHandler.errors.length;
  },

  /*
   * Call `validateAndSaveBlock` on each block found in the dom.
   */

  validateBlocks: function(shouldValidate) {
    Array.prototype.forEach.call(this.wrapper.querySelectorAll(`.st-block[data-instance="${this.ID}"]`), (block, idx) => {
      const _block = this.blockManager.findBlockById(block.getAttribute('id'));
      if (!_.isUndefined(_block)) {
        this.validateAndSaveBlock(_block, shouldValidate);
      }
    });
  },

  /*
   * If block should be validated and is not valid then register an error.
   * Empty text blocks should be ignored.
   * Save any other valid blocks to the editor data store.
   */

  validateAndSaveBlock: function(block, shouldValidate) {
    if (!config.skipValidation && shouldValidate && !block.valid()) {
      this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
      utils.log("Block " + block.blockID + " failed validation");
      return;
    }

    if (block.type === 'text' && block.isEmpty()) {
      return;
    }

    const blockData = block.getData();
    utils.log("Adding data for block " + block.blockID + " to block store:",
              blockData);
    this.store.addData(blockData);
  },

  /*
   * Disable back button so when a block loses focus the user
   * pressing backspace multiple times doesn't close the page.
   */
  disableBackButton: function(e) {
    const target = e.target || e.srcElement;
    if (e.keyCode === 8) {
      if (target.getAttribute('contenteditable') ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault();
    }
  },

  findBlockById: function(block_id) {
    return this.blockManager.findBlockById(block_id);
  },

  getBlocksByType: function(block_type) {
    return this.blockManager.getBlocksByType(block_type);
  },

  getBlocksByIDs: function(block_ids) {
    return this.blockManager.getBlocksByIDs(block_ids);
  },

  getBlockPosition: function(block) {
    utils.log("This method has been moved to blockManager.getBlockPosition()");
    return this.blockManager.getBlockPosition(block);
  },

  getBlocks: function() {
    return [].map.call(this.wrapper.querySelectorAll('.st-block'), (blockEl) => {
      return this.findBlockById(blockEl.getAttribute('id'));
    });
  },

  /*
   * Set all dom elements required for the editor.
   */

  _ensureAndSetElements: function() {
    if(_.isUndefined(this.options.el)) {
      utils.log("You must provide an el");
      return false;
    }

    this.el = this.options.el;
    this.form = Dom.getClosest(this.el, 'form');

    const outer = Dom.createElement("div", {
      'id': this.ID,
      'class': 'st-outer notranslate',
      'dropzone': 'copy link move'
    });

    const wrapper = Dom.createElement("div", {'class': 'st-blocks'});

    // Wrap our element in lots of containers *eww*

    Dom.wrap(Dom.wrap(this.el, outer), wrapper);

    this.outer = this.form.querySelector('#' + this.ID);
    this.wrapper = this.outer.querySelector('.st-blocks');

    return true;
  }

});

export default Editor;
