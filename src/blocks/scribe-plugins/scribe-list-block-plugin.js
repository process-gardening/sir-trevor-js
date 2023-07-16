"use strict";

const selectionRange = require('selection-range');

let {
  getTotalLength,
  isAtStart,
  isAtEnd,
  isSelectedFromStart,
  isSelectedToEnd,
  rangeToHTML,
  selectToEnd
} = require('./shared.js');

const ScribeListBlockPlugin = function (block) {
  return function (scribe) {
    scribe.el.addEventListener('keydown', function (ev) {

      if (block.supressKeyListeners) {
        return;
      }

      let content;

      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();

        block.splitListItem(scribe, {createTextBlock: true});
      } else if (["Left", "ArrowLeft", "Up", "ArrowUp"].indexOf(ev.key) > -1) {
        if (ev.shiftKey && isSelectedFromStart(scribe)) {
          ev.preventDefault();
          ev.stopPropagation();

          document.activeElement && document.activeElement.blur();
          block.mediator.trigger("selection:block", block);
        } else if (isAtStart(scribe)) {
          ev.preventDefault();

          const previousListItem = block.previousListItem();
          if (previousListItem) {
            block.focusOn(previousListItem, {focusAtEnd: true});
          } else {
            block.mediator.trigger("block:focusPrevious", block.blockID);
          }
        }
      } else if (["Right", "ArrowRight", "Down", "ArrowDown"].indexOf(ev.key) > -1) {
        if (ev.shiftKey && isSelectedToEnd(scribe)) {
          ev.preventDefault();
          ev.stopPropagation();

          document.activeElement && document.activeElement.blur();
          block.mediator.trigger("selection:block", block);
        } else if (isAtEnd(scribe)) {
          ev.preventDefault();

          const nextListItem = block.nextListItem();
          if (nextListItem) {
            block.focusOn(nextListItem);
          } else {
            block.mediator.trigger("block:focusNext", block.blockID);
          }
        }
      } else if (ev.key === "Backspace" && isAtStart(scribe)) {
        ev.preventDefault();

        if (block.previousListItem()) {
          content = scribe.getContent();
          block.removeCurrentListItem();
          block.appendToCurrentItem(content);
        } else {
          const data = {
            format: 'html',
            text: scribe.getContent()
          };
          block.removeCurrentListItem();
          block.mediator.trigger("block:createBefore", 'Text', data, block, {autoFocus: true});
          if (block.isLastListItem()) {
            block.mediator.trigger('block:remove', block.blockID);
          }
        }
      }
    });
  };
};

module.exports = ScribeListBlockPlugin;
