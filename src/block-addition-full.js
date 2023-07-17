"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

import Blocks from "./blocks";

import Events from "./packages/events";

import config from "./config";

import BLOCKS_MENU_BUTTON_TEMPLATE from "./templates/blocks-menu-button";
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
      //console.log('type: ' + type);
      return memo += BLOCKS_MENU_BUTTON_TEMPLATE(Blocks[type].prototype);
    }
    return memo;
  }, "");
}

function render(Blocks, availableTypes) {
  let el = document.createElement('div');
  el.className = "st-blocks-menu__buttons";
  el.innerHTML = generateBlocksHTML.apply(null, arguments);

  let elButtons = document.createElement('div');
  elButtons.className = "st-blocks-menu";
  elButtons.appendChild(el);
  return elButtons;
}


module.exports.create = function (SirTrevor) {

  // REFACTOR - should probably not know about blockManager
  //console.log(SirTrevor.blockManager.blockTypes);
  const el = render(Blocks, SirTrevor.blockManager.blockTypes);

  function showBlockMenu(e) {
    //console.log('block-addition-full::showBlockMenu()');
    e.stopPropagation(); // we don't want el to be removed by the window click
    /*jshint validthis:true */
    let block = this.parentNode.parentNode;
    if (!block || hide() === block) {
      return;
    }
    //parent.appendChild(el);
    block.parentNode.insertBefore(el, block.nextSibling);
    //parent.classList.toggle("st-block--controls-active");
  }

  function addNewBlock(e) {
    //console.log('block-addition-full::addNewBlock()');
    //console.log('ST ID: ' + SirTrevor.ID);
    // trigger only for closest editor
    if (e.currentTarget.parentNode.parentNode.parentNode.parentNode.id === SirTrevor.ID) {
      //console.log('closest editor: ' + SirTrevor.ID);
      // REFACTOR: mediator so that we can trigger events directly on instance?
      // REFACTOR: block create event expects data as second argument.
      /*jshint validthis:true */
      SirTrevor.mediator.trigger(
        //"block:create", 'Text', null, this.parentNode.parentNode.nextSibling, { autoFocus: true }
        "block:create", this.getAttribute('data-type'), null, this.parentNode.parentNode, {autoFocus: true}
      );
    } else {
      //console.log('ignore for: ' + SirTrevor.ID);
    }
  }


  function createBlock(e) {
    //console.log('block-addition-full::createBlock()');
    //e.stopPropagation(); // only once
    if (e.currentTarget.parentNode.parentNode.parentNode.parentNode.id === SirTrevor.ID) {
      // REFACTOR: mediator so that we can trigger events directly on instance?
      // REFACTOR: block create event expects data as second argument.
      /*jshint validthis:true */
      SirTrevor.mediator.trigger(
        //"block:create", 'Text', null, this.parentNode.parentNode.nextSibling, { autoFocus: true }
        "block:create", 'Text', null, this.parentNode.parentNode, {autoFocus: true}
      );
    }
  }

  function hide() {
    //console.log('block-addition-full::hide()');
    el.remove();
  }

  // Public
  function destroy() {
    SirTrevor = null;
  }

  // SirTrevor.wrapper
  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-full__button", "click",
    (SirTrevor.options.editorMode === 'document') ? createBlock : showBlockMenu
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-full__icon", "click",
    (SirTrevor.options.editorMode === 'document') ? createBlock : showBlockMenu
  );

  //console.log('Event delegation');
  //console.log(el);
  //console.log(this);
  // this will trigger for each editor
  Events.delegate(
    SirTrevor.wrapper, ".st-blocks-menu__button", "click", addNewBlock
  );

  return {destroy, hide};
};
