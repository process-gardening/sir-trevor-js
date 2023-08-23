"use strict";

/*
  Text Block
*/

import Block from "../block";

import stToHTML from "../to-html";

import ScribeTextBlockPlugin from "./scribe-plugins/scribe-text-block-plugin";

import ScribePastePlugin from "./scribe-plugins/scribe-paste-plugin";

import ScribeHeadingPlugin from "./scribe-plugins/scribe-heading-plugin";

import ScribeLinkPromptPlugin from "./scribe-plugins/scribe-link-prompt-plugin";

import ScribeQuotePlugin from "./scribe-plugins/scribe-quote-plugin";

import ScribeSuperscriptPromptPlugin from "./scribe-plugins/scribe-superscript-prompt-plugin";

export default Block.extend({

  type: "text",

  editorHTML: '<div class="st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  mergeable: true,
  textable: true,
  toolbarEnabled: false,

  configureScribe: function (scribe) {
    scribe.use(new ScribeTextBlockPlugin(this));
    scribe.use(new ScribePastePlugin(this));
    scribe.use(new ScribeHeadingPlugin(this));
    scribe.use(new ScribeLinkPromptPlugin(this));
    scribe.use(new ScribeQuotePlugin(this));
    scribe.use(new ScribeSuperscriptPromptPlugin(this));

    scribe.on('content-changed', this.toggleEmptyClass.bind(this));
  },

  scribeOptions: {
    allowBlockElements: true,
    tags: {
      p: true
    }
  },

  loadData: function(data){
    if (this.options.convertFromMarkdown && data.format !== "html") {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }
  },

  onBlockRender: function() {
    this.toggleEmptyClass();
  },

  toggleEmptyClass: function() {
    this.el.classList.toggle('st-block--empty', this.isEmpty());
  },

  isEmpty: function() {
    return this._scribe.getTextContent() === '';
  },

  asClipboardHTML: function() {
    const data = this.getBlockData();
    return `${data.text}`;
  }
});
