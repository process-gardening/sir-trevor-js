"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const dropEvents = require('./helpers/drop-events');

const EventBus = require('./event-bus');

const Dom = require('./packages/dom');
const Events = require("./packages/events");

const TOP_CONTROLS_TEMPLATE = require("./templates/top-controls");

module.exports.create = function(editor) {

  function createBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    editor.mediator.trigger(
      "block:create", SirTrevor.options.defaultType || "Text", null, this.parentNode.parentNode.id ? this.parentNode.parentNode : this.parentNode
    );
  }

  function hide() {}

  // Public
  function destroy() {
    editor = null;
  }

  editor.wrapper.insertAdjacentHTML("beforeend", TOP_CONTROLS_TEMPLATE());

  const topControls = editor.wrapper.querySelector('.st-top-controls');


  function onDrop(ev) {
    console.log('block-addition::onDrop()');
    ev.preventDefault();
    ev.stopPropagation(); // only once

    var dropped_on = topControls,
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
      var block = editor_from.blockManager.findBlockById(block_div.getAttribute("id"));
      console.log(block);
      editor.mediator.trigger("block:create", block.type, block._serializeData(),
        dropped_on, { autoFocus: true });

      // delete old block
      editor_from.blockManager.removeBlock(block.blockID);
    }
    editor.mediator.trigger("block:rerender", item_id);
    EventBus.trigger("block:reorder:dropped", item_id);
  }

  dropEvents.dropArea(topControls);
  topControls.addEventListener('drop', onDrop);


  Events.delegate(
    editor.wrapper, ".st-block-addition", "click", createBlock
  );

  return {destroy, hide};
};
