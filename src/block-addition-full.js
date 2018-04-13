"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const Blocks = require("./blocks");
const Events = require("./packages/events");
const config = require('./config');

const BLOCKS_MENU_BUTTON_TEMPLATE  = require("./templates/blocks-menu-button");

// function generateBlocksHTML(Blocks, availableTypes) {
//   return availableTypes.reduce((memo, type) => {
//     if (Blocks.hasOwnProperty(type) && Blocks[type].prototype.toolbarEnabled) {
//       return memo += BLOCKS_MENU_BUTTON_TEMPLATE(Blocks[type].prototype);
//     }
//     return memo;
//   }, "");
// }

function generateBlocksHTML(Blocks, availableTypes) {
  return availableTypes.reduce((memo, type) => {
    if (true) {
      console.log('type: ' + type);
      return memo += BLOCKS_MENU_BUTTON_TEMPLATE(Blocks[type].prototype);
    }
    return memo;
  }, "");
}

function render(Blocks, availableTypes) {
  var el = document.createElement('div');
  el.className = "st-blocks-menu__buttons";
  el.innerHTML = generateBlocksHTML.apply(null, arguments);

  var elButtons = document.createElement('div');
  elButtons.className = "st-blocks-menu";
  elButtons.appendChild(el);
  return elButtons;
}


module.exports.create = function (SirTrevor) {

  // REFACTOR - should probably not know about blockManager
  console.log(SirTrevor.blockManager.blockTypes);
  var el = render(Blocks, SirTrevor.blockManager.blockTypes);

  function showBlockMenu(e) {
    console.log('block-addition-full::showBlockMenu()');
    e.stopPropagation(); // we don't want el to be removed by the window click
    /*jshint validthis:true */
    var block = this.parentNode.parentNode;
    if (!block || hide() === block) {
      return;
    }
    //parent.appendChild(el);
    block.parentNode.insertBefore(el, block.nextSibling);
    //parent.classList.toggle("st-block--controls-active");
  }

  function addNewBlock(e) {
    console.log('block-addition-full::addNewBlock()');
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      //"block:create", 'Text', null, this.parentNode.parentNode.nextSibling, { autoFocus: true }
      "block:create", this.getAttribute('data-type'), null, this.parentNode.parentNode, {autoFocus: true}
    );
  }


  function createBlock(e) {
    console.log('block-addition-full::createBlock()');
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      //"block:create", 'Text', null, this.parentNode.parentNode.nextSibling, { autoFocus: true }
      "block:create", 'Text', null, this.parentNode.parentNode, {autoFocus: true}
    );
  }

  function hide() {
    el.remove();
  }

  // Public
  function destroy() {
    SirTrevor = null;
  }

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-full__button", "click",
    (SirTrevor.options.editorMode === 'document') ? createBlock : showBlockMenu
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-full__icon", "click",
    (SirTrevor.options.editorMode === 'document') ? createBlock : showBlockMenu
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-blocks-menu__button", "click", addNewBlock
  );

  return {destroy, hide};
};
