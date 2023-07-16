"use strict";

const selectionRange = require('selection-range');
const Modal = require('../../packages/modal');
const Dom = require('../../packages/dom');

const MODAL_FORM_TEMPLATE = ({modal, title}) => {
  return `
    <p>
      <input id="${modal.id}-sup-title" type="text" value="${title}" />
    </p>
  `;
};

const scribeSuperscriptPromptPlugin = function(block) {
  // ===== INIT ===== //
  block = block || {};
  const modal = new Modal();

  if (!block.transforms) {
    block.transforms = {};
  }

  ['pre', 'post'].forEach(function(key) {
    if (!block.transforms[key]) {
      block.transforms[key] = [];
    }
  });

  // ===== TRANSFORMS ===== //
  function runTransforms(transforms, initialLink) {
    return transforms.reduce(function(currentLinkValue, transform) {
      return transform(currentLinkValue);
    }, initialLink);
  }

  return function(scribe) {
    const superscriptPromptCommand = new scribe.api.Command('superscriptPrompt');
    superscriptPromptCommand.nodeName = 'SUP';

    superscriptPromptCommand.queryEnabled = () => {
      return block.inline_editable;
    };

    superscriptPromptCommand.queryState = () => {
      /**
       * We override the native `document.queryCommandState` for links because
       * the `createLink` and `unlink` commands are not supported.
       * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
       */
      const selection = new scribe.api.Selection();
      return !! selection.getContaining(function(node) {
        return node.nodeName === superscriptPromptCommand.nodeName;
      });
    };

    superscriptPromptCommand.execute = function superscriptPromptCommandExecute(passedTitle) {
      const selection = new scribe.api.Selection();
      const range = selection.range;
      const anchorNode = selection.getContaining(function (node) {
        return node.nodeName === superscriptPromptCommand.nodeName;
      });

      if (anchorNode) {
        range.selectNode(anchorNode);
        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      const initialTitle = anchorNode ? anchorNode.title : '';

      const form = MODAL_FORM_TEMPLATE({
        modal: modal,
        title: passedTitle || initialTitle
      });

      let removeButton = "";

      if (anchorNode) {
        removeButton = Dom.createElementFromString('<button type="button" style="background: grey;">Remove</button>');

        removeButton.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();

          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          document.execCommand('insertHTML', false, `<span>${anchorNode.innerHTML}</span>`);

          modal.hide();

          return true;
        });
      }

      modal.show({
        title: i18n.t("formatters:superscript:prompt"),
        content: form,
        buttons: removeButton
      }, function(modal) {
        let title = modal.el.querySelector(`#${modal.id}-sup-title`).value;

        title = runTransforms(block.transforms.pre, title);

        let attr = '';

        if (title) {
          title = runTransforms(block.transforms.post, title);
          attr = ` title="${title}"`;
        }

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const html = `<sup${attr}>${selection}</sup>`;
        document.execCommand('insertHTML', false, html);

        return true;
      });
    };

    scribe.commands.superscriptPrompt = superscriptPromptCommand;
  };
};

module.exports = scribeSuperscriptPromptPlugin;
