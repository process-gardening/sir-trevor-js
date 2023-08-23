"use strict";

/*
  Block Quote
*/

import _ from "../lodash";

import Block from "../block";

import stToHTML from "../to-html";

import ScribeHeadingPlugin from "./scribe-plugins/scribe-heading-plugin";

import ScribeQuotePlugin from "./scribe-plugins/scribe-quote-plugin";

const template = _.template([
  '<blockquote class="st-required st-text-block st-text-block--quote" contenteditable="true"></blockquote>',
  '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
  '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
  ' class="st-input-string js-cite-input" type="text" />'
].join("\n"));

export default Block.extend({

  type: "quote",

  icon_name: 'quote',

  mergeable: true,
  textable: true,
  toolbarEnabled: false,

  editorHTML: function () {
    return template(this);
  },

  configureScribe: function(scribe) {
    scribe.use(new ScribeHeadingPlugin(this));
    scribe.use(new ScribeQuotePlugin(this));
  },

  loadData: function(data){
    if (this.options.convertFromMarkdown && data.format !== "html") {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }

    if (data.cite) {
      this.$('.js-cite-input')[0].value = data.cite;
    }
  },

  asClipboardHTML: function() {
    const data = this.getBlockData();

    return `<blockquote>${data.text}<cite>- ${data.cite}</cite></blockquote>`;
  }
});
