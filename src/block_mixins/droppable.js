"use strict";

/* Adds drop functionality to this block */

const _ = require('../lodash');
const config = require('../config');
const utils = require('../utils');
const Dom = require('../packages/dom');

const dropEvents = require('../helpers/drop-events');

const EventBus = require('../event-bus');

export default {

  mixinName: "Droppable",
  valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],
  requireInputs: true,

  initializeDroppable: function () {
    //console.log('droppable::initializeDroppable()');
    utils.log("Adding droppable to block " + this.blockID);

    this.drop_options = Object.assign({}, config.defaults.Block.drop_options, this.drop_options);

    if (this.drop_options.hide_editor) {
      Dom.hide(this.editor);
    }

    let target = this.el.querySelector('#' + _.result(this, 'inputs_container'));
    //var target = document.getElementById(_.result(this, 'insert_dropzone_into'));
    //var target = document.getElementById(this.drop_options.insert_dropzone_into);
    //console.log('target func: ' + _.result(this, 'inputs_container'));
    //console.log(target);
    if (target) {
      //console.log('given target');
      target.insertAdjacentHTML("beforeend",
        _.template(this.drop_options.html)({block: this, _: _, config: config}));
    } else {
      //console.log('standard target');
      this.inputs.insertAdjacentHTML("beforeend",
        _.template(this.drop_options.html)({block: this, _: _, config: config}));
      target = this.inputs.lastElementChild;
    }

    // Bind our drop event
    dropEvents
      .dropArea(target)
      .addEventListener('drop', this._handleDrop.bind(this));

    this.el.classList.add('st-block--droppable');
    this.inner.classList.add('st-block__inner--droppable');

    this._setupKeyEvents();
  },

  _handleDrop: function (e) {
    e.preventDefault();
    e.stopPropagation();

    const el = e.target,
      types = [].slice.call(e.dataTransfer.types);

    el.classList.remove('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (types &&
      types.some(function (type) {
        return this.valid_drop_file_types.includes(type);
      }, this)) {
      this.onDrop(e.dataTransfer);
    }

    EventBus.trigger('block:content:dropped', this.blockID);
  },

  focus: function () {
    this.inner.focus();
  },

  /**
   Allow this block to be managed with the keyboard
   **/

  _setupKeyEvents: function () {
    this.inner.setAttribute('tabindex', 0);
    this.inner.addEventListener('keyup', (e) => {
      if (e.target !== this.inner) {
        return;
      }

      switch (e.keyCode) {
        case 13:
          this.mediator.trigger("block:create", 'Text', null, this.el, {autoFocus: true});
          break;
        case 8:
          this.onDeleteClick.call(this, new CustomEvent('click'));
          return;
      }
    });
  }
};
