"use strict";

const selectionRange = require('selection-range');
const Modal = require('../../packages/modal');

const MODAL_FORM_TEMPLATE = ({enableExternalLinks, modal, new_tab, url}) => {
  const checkbox = enableExternalLinks ? `
    <p>
      <label>
        <input id="${modal.id}-target" type="checkbox" ${new_tab ? 'checked="checked"' : ""} />
        ${i18n.t("formatters:link:new_tab")}
      </label>
    </p>` : '';

  return `
    <p>
      <input id="${modal.id}-url" type="text" value="${url}" />
    </p>
    ${checkbox}
  `;
};

const scribeLinkPromptPlugin = function(block) {
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

  // ===== PROMPTS ===== //
  const userPrompts = [
    {
      // For emails we just look for a `@` symbol as it is easier.
      regexp: /@/,
      message: i18n.t("formatters:link:message", {type: i18n.t("formatters:link:types:email"), prefix: 'mailto:'}),
      action: function (link) {
        return 'mailto:' + link;
      }
    },
    {
      // For tel numbers check for + and numerical values
      regexp: /\+?\d+/,
      message: i18n.t("formatters:link:message", {type: i18n.t("formatters:link:types:telephone"), prefix: 'tel:'}),
      action: function (link) {
        return 'tel:' + link;
      }
    },
    {
      regexp: /.+/,
      message: i18n.t("formatters:link:message", {type: i18n.t("formatters:link:types:url"), prefix: 'http://'}),
      action: function (link) {
        return 'http://' + link;
      }
    }
  ];

  function processPrompt(window, link) {
    for (let i = 0; i < userPrompts.length; i++) {
      const prompt = userPrompts[i];

      if (prompt.regexp.test(link)) {
        const userResponse = window.confirm(prompt.message);

        if (userResponse) {
          // Only process the first prompt
          return prompt.action(link);
        }
      }

    };

    return link;
  }

  // ===== CHECKS ===== //
  const urlProtocolRegExp = /^https?\:\/\//;
  const mailtoProtocolRegExp = /^mailto\:/;
  const telProtocolRegExp = /^tel\:/;
  const knownProtocols = [urlProtocolRegExp, mailtoProtocolRegExp, telProtocolRegExp];

  function emptyLink(string) {
    return /\w/.test(string);
  }

  function hasKnownProtocol(urlValue) {
    // If a http/s or mailto link is provided, then we will trust that an link is valid
    return knownProtocols.some(function(protocol) { return protocol.test(urlValue)});
  }

  // ===== TRANSFORMS ===== //
  function runTransforms(transforms, initialLink) {
    return transforms.reduce(function(currentLinkValue, transform) {
      return transform(currentLinkValue);
    }, initialLink);
  }

  return function(scribe) {
    const linkPromptCommand = new scribe.api.Command('linkPrompt');
    linkPromptCommand.nodeName = 'A';

    linkPromptCommand.queryEnabled = () => {
      return block.inline_editable;
    };

    linkPromptCommand.queryState = () => {
      /**
       * We override the native `document.queryCommandState` for links because
       * the `createLink` and `unlink` commands are not supported.
       * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
       */
      const selection = new scribe.api.Selection();
      return !! selection.getContaining(function(node) {
        return node.nodeName === linkPromptCommand.nodeName;
      });
    };

    linkPromptCommand.execute = function linkPromptCommandExecute(passedLink) {
      const selection = new scribe.api.Selection();
      const range = selection.range;
      const anchorNode = selection.getContaining(function (node) {
        return node.nodeName === linkPromptCommand.nodeName;
      });

      if (anchorNode) {
        range.selectNode(anchorNode);
        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      const initialLink = anchorNode ? anchorNode.href : '';
      const initialTabState = anchorNode && anchorNode.target == '_blank';

      const form = MODAL_FORM_TEMPLATE({
        modal: modal,
        url: passedLink || initialLink,
        new_tab: initialTabState,
        enableExternalLinks: block.editorOptions.enableExternalLinks
      });

      modal.show({
        title: i18n.t("formatters:link:prompt"),
        content: form
      }, function(modal) {
        let link = modal.el.querySelector(`#${modal.id}-url`).value;
        const targetEl = modal.el.querySelector(`#${modal.id}-target`);

        const target = targetEl && targetEl.checked ? ' target="_blank"' : "";
        link = runTransforms(block.transforms.pre, link);

        if (!emptyLink(link)) {
          window.alert( i18n.t("errors:link_empty"));
          return false;
        }

        if (block && block.validation) {
          const validationResult = block.validation(link);

          if (!validationResult.valid) {
            window.alert(validationResult.message ||  i18n.t("errors:link_invalid"));
            return false;
          }
        }

        if (link) {
          if (!hasKnownProtocol(link) ) {
            link = processPrompt(window, link);
          }

          link = runTransforms(block.transforms.post, link);

          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          const html = `<a href="${link}"${target}>${selection}</a>`;
          document.execCommand('insertHTML', false, html);
        }

        return true;
      })
    };

    scribe.commands.linkPrompt = linkPromptCommand;
  };
};

module.exports = scribeLinkPromptPlugin;
