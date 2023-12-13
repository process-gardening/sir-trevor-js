"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

import Events from "./packages/events";

function create(SirTrevor) {

  function createBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:create", SirTrevor.options.defaultType || "Text", null, this.parentNode.parentNode.previousSibling, { autoFocus: true }
    );
  }

  function hide() {
    //console.log('block-addition-top::hide()');
  }

  // Public
  function destroy() {
    SirTrevor = null;
  }

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-top__button", "click", createBlock
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-top__icon", "click", createBlock
  );

  return {destroy, hide};
}

export default {
  create
}