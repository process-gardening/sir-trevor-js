"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

import Blocks from "./blocks";

import Events from "./packages/events";

import BLOCK_REPLACER_CONTROL_TEMPLATE from "./templates/block-control";

function generateBlocksHTML(Blocks, availableTypes) {
  return availableTypes.reduce((memo, type) => {
    if (Blocks.hasOwnProperty(type) && Blocks[type].prototype.toolbarEnabled) {
      return memo += BLOCK_REPLACER_CONTROL_TEMPLATE(Blocks[type].prototype);
    }
    return memo;
  }, "");
}

function render(Blocks, availableTypes) {
  const el = document.createElement('div');
  el.className = "st-block-controls__buttons";
  el.innerHTML = generateBlocksHTML.apply(null, arguments);

  const elButtons = document.createElement('div');
  elButtons.className = "st-block-controls";
  elButtons.appendChild(el);
  return elButtons;
}

export function create(SirTrevor) {

  // REFACTOR - should probably not know about blockManager
  let el = render(Blocks, SirTrevor.blockManager.blockTypes);

  function replaceBlock(e) {
    //console.log('block-controls::replace()');
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:replace", el.parentNode, this.getAttribute('data-type')
    );
  }

  function insert(e) {
    e.stopPropagation(); // we don't want el to be removed by the window click
    /*jshint validthis:true */
    const parent = this.parentNode;
    if (!parent || hide() === parent) {
      return;
    }
    parent.appendChild(el);
    parent.classList.toggle("st-block--controls-active");
  }

  // Public
  function hide() {
    const parent = el.parentNode;
    if (!parent) {
      return;
    }
    parent.removeChild(el);
    parent.classList.remove("st-block--controls-active");
    return parent;
  }

  // Public
  function destroy() {
    SirTrevor = null;
    el = null;
  }

  Events.delegate(
    SirTrevor.wrapper, ".st-block-replacer", "click", insert
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-controls__button", "click", replaceBlock
  );

  return {el, hide, destroy};
}
