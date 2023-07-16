"use strict";

const selectionRange = require('selection-range');

const utils = require('../../utils');

const selectToEnd = function (scribe) {
  const selection = new scribe.api.Selection();
  const range = selection.range.cloneRange();
  range.setEndAfter(scribe.el.lastChild, 0);

  return range;
};

const isAtStart = function (scribe) {
  const currentRange = selectionRange(scribe.el);

  return (
    currentRange.start === 0 &&
    currentRange.end === 0 &&
    currentRange.atStart
  );
};

const getTotalLength = function (scribe) {
  const selection = new scribe.api.Selection();
  const range = selection.range.cloneRange();
  range.selectNodeContents(scribe.el);

  return range.toString().length;
};

const isAtEnd = function (scribe) {
  const currentRange = selectionRange(scribe.el);

  return (getTotalLength(scribe) === currentRange.end) && (currentRange.start === currentRange.end);
};

const isSelectedToEnd = function (scribe) {
  const currentRange = selectionRange(scribe.el);

  return (getTotalLength(scribe) === currentRange.end);
};

const isSelectedFromStart = function (scribe) {
  const currentRange = selectionRange(scribe.el);

  return currentRange.atStart && currentRange.start === 0;
};

// Remove any empty elements at the start of the range.
const stripFirstEmptyElement = function (div) {
  if (div.firstChild === null) {
    return;
  }

  const firstChild = div.firstChild.childNodes[0];
  if (firstChild && firstChild.nodeName !== '#text') {
    if (firstChild.innerText === '') {
      div.firstChild.removeChild(firstChild);
    }
  }
};

const createBlocksFromParagraphs = function (block, scribe) {
  let fakeContent = document.createElement('div');
  fakeContent.appendChild(selectToEnd(scribe).extractContents());

  stripFirstEmptyElement(fakeContent);

  // Add wrapper div which is missing in non blockElement scribe.
  if (!scribe.allowsBlockElements()) {
    const tempContent = document.createElement('div');
    tempContent.appendChild(fakeContent);
    fakeContent = tempContent;
  }

  if (fakeContent.childNodes.length >= 1) {
    let data;
    const nodes = [].slice.call(fakeContent.childNodes);
    nodes.reverse().forEach(function (node) {
      if (node.innerText !== '') {
        data = {
          format: 'html',
          text: node.innerHTML.trim()
        };
        block.mediator.trigger("block:create", block.type, data, block.el, {autoFocus: true});
      }
    });
  }
};

const rangeToHTML = function (range) {
  const div = document.createElement('div');
  div.appendChild(range.extractContents());

  return div.innerHTML;
};

const trimScribeContent = function (scribe) {
  // Remove any whitespace in the first node, otherwise selections won't work.
  const firstNode = scribe.node.firstDeepestChild(scribe.el);
  if (firstNode.nodeName === '#text') {
    firstNode.textContent = utils.leftTrim(firstNode.textContent);
  }

  // Remove all empty nodes at the front to get blocks working.
  // Don't remove nodes that can't contain text content (e.g. <input>)
  while (scribe.el.firstChild && scribe.el.firstChild.textContent === '' && document.createElement(scribe.el.firstChild.tagName).outerHTML.indexOf("/") != -1) {
    scribe.el.removeChild(scribe.el.firstChild);
  }

  // Remove all empty nodes at the end to get blocks working.
  // Don't remove nodes that can't contain text content (e.g. <input>)
  while (scribe.el.lastChild && scribe.el.lastChild.textContent === '' && document.createElement(scribe.el.lastChild.tagName).outerHTML.indexOf("/") != -1) {
    scribe.el.removeChild(scribe.el.lastChild);
  }

  // Firefox adds empty br tags at the end of content.
  while (scribe.el.lastChild && scribe.el.lastChild.nodeName === 'BR') {
    scribe.el.removeChild(scribe.el.lastChild);
  }
};

export {
  createBlocksFromParagraphs,
  getTotalLength,
  isAtStart,
  isAtEnd,
  selectToEnd,
  isSelectedFromStart,
  isSelectedToEnd,
  rangeToHTML,
  trimScribeContent
};
