"use strict";

import dropEvents from "./helpers/drop-events";

import EventBus from "./event-bus";

import Dom from "./packages/dom";

import config from "./config";

const BlockReorder = function (block_element, mediator) {
  this.block = block_element;
  this.blockID = this.block.getAttribute('id');
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockReorder.prototype, require('./function-bind'), require('./renderable'), {

  bound: ['onMouseDown', 'onDragStart', 'onDragEnd', 'onDrop'],

  className: 'st-block-ui-btn__reorder',
  tagName: 'a',

  attributes: function () {
    return {
      'html': `

          <svg role="img" class="st-icon">
            <use xlink:href="${config.defaults.iconUrl}#drag-handle"/>
          </svg>
        `,
      'draggable': 'true',
      'data-icon': 'move'
    };
  },

  initialize: function () {
    this.el.addEventListener('mousedown', this.onMouseDown);
    this.el.addEventListener('dragstart', this.onDragStart);
    this.el.addEventListener('dragend', this.onDragEnd);

    dropEvents.dropArea(this.block);
    this.block.addEventListener('drop', this.onDrop);
  },

  blockId: function () {
    return this.block.getAttribute('id');
  },

  onMouseDown: function () {
    //console.log('block-reorder::onMouseDown()');
    EventBus.trigger("block:reorder:down");
  },

  onDrop: function (ev) {
    console.log('block-reorder::onDrop()');
    ev.preventDefault();
    ev.stopPropagation(); // only once

    const dropped_on = this.block,
      item_id = ev.dataTransfer.getData("text/plain"),
      block_div = document.querySelector('#' + item_id);

    console.log('target: ');
    console.log(dropped_on);
    console.log('item_id: ' + item_id);
    console.log('dragged block: ');
    console.log(block_div);
    console.log('editor: ' + block_div.getAttribute("data-instance") + ' -> ' +
      dropped_on.getAttribute("data-instance"));
    let editor_from_id = block_div.getAttribute("data-instance");
    let editor_to_id = dropped_on.getAttribute("data-instance");

    if (editor_from_id === editor_to_id) {
      // same editor -> just change position
      console.log('just change position');
      if (!!item_id, !!block_div, dropped_on.id !== item_id) {
        Dom.insertAfter(block_div, dropped_on);
      }
    } else {
      // different editor -> insert to and remove from
      console.log('insert to and remove from');

      let editor_from = SirTrevor.getInstance(editor_from_id);

      // create new one
      const block = editor_from.blockManager.findBlockById(block_div.getAttribute("id"));
      console.log(block);
      this.mediator.trigger("block:create", block.type, block._serializeData(),
        dropped_on, { autoFocus: true });

      // delete old block
      editor_from.blockManager.removeBlock(block.blockID);
      editor_from.updateBlockNumbering();
    }
    this.mediator.trigger("block:rerender", item_id);
    EventBus.trigger("block:reorder:dropped", item_id);
  },

  onDragStart: function (ev) {
    console.log('block-reorder::onDragStart()');
    ev.stopPropagation();
    // set drop zone i18n text


    const block = this.block;  // st-block__card-inner to skip margin
    const card = this.block.querySelector('.st-block__card-upper');
    console.log(`width: ${card.clientWidth} height: ${card.clientHeight}`);

    //this.dragEl = block.cloneNode(true);
    this.dragEl = card.cloneNode(true);
    this.dragEl.classList.add("st-drag-element");

    // drag element still shrinks
    this.dragEl.width = card.width;
    this.dragEl.height = card.clientHeight;
    //this.dragEl.style.top = `${block.offsetTop}px`;
    //this.dragEl.style.left = `${block.offsetLeft}px`;
    //this.dragEl.style.right = `${block.offsetLeft}px`;

    console.log(this.dragEl);

    block.parentNode.appendChild(this.dragEl);

    ev.dataTransfer.setDragImage(this.dragEl,
      Math.round(this.dragEl.offsetWidth-15), this.dragEl.offsetHeight / 2);
    ev.dataTransfer.setData("text/plain", this.blockId());
    this.mediator.trigger("block-controls:hide");

    EventBus.trigger("block:reorder:dragstart");
    block.classList.add('st-block--dragging');
  },

  onDragEnd: function (ev) {
    console.log('block-reorder::onDragEnd()');
    //ev.stopPropagation();
    EventBus.trigger("block:reorder:dragend");
    this.block.classList.remove('st-block--dragging');
    this.dragEl.parentNode.removeChild(this.dragEl);
  },

  render: function () {
    return this;
  }

});

export default BlockReorder;
