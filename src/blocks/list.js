"use strict";

import selectionRange from "selection-range";

import Block from "../block";

import stToHTML from "../to-html";

import ScribeListBlockPlugin from "./scribe-plugins/scribe-list-block-plugin";

import {getTotalLength, rangeToHTML, selectToEnd} from "./scribe-plugins/shared";


module.exports = Block.extend({
  type: 'list',
  icon_name: 'list',

  multi_editable: true,
  mergeable: true,

  scribeOptions: {
    allowBlockElements: false,
    tags: {
      p: false
    }
  },

  configureScribe: function(scribe) {
    scribe.use(new ScribeListBlockPlugin(this));
    scribe.on('content-changed', () => {
      setTimeout(() => {
        if (scribe.getHTML() === "") {
          scribe.setHTML("<br>");
        }

      }, 0);
    });
  },

  editorHTML: '<ul class="st-list-block__list"></ul>',
  listItemEditorHTML: '<li class="st-list-block__item"><div class="st-list-block__editor st-block__editor"></div></li>',

  initialize: function() {
    this.editorIds = [];
  },

  // Data functions (loading, converting, saving)
  beforeLoadingData: function() {
    this.setupListVariables();

    this.loadData(this._getData());
  },

  onBlockRender: function() {
    if (!this.ul) { this.setupListVariables(); }
    if (this.editorIds.length < 1) { this.addListItem(); }
  },

  setupListVariables: function() {
    this.ul = this.inner.querySelector('ul');
  },

  loadData: function(data) {
    const block = this;
    if (this.options.convertFromMarkdown && data.format !== "html") {
      data = this.parseFromMarkdown(data.text);
    }

    if (data.listItems.length) {
      data.listItems.forEach(function(li) {
        block.addListItem(li.content);
      });
    } else {
      block.addListItem();
    }
  },

  parseFromMarkdown: function(markdown) {
    let listItems = markdown.replace(/^ - (.+)$/mg, "$1").split("\n");
    listItems = listItems.
      filter(function(item) {
        return item.length;
      }).
      map(function(item) {
        return {content: stToHTML(item, this.type)};
      }.bind(this));

    return { listItems: listItems, format: 'html' };
  },

  _serializeData: function() {
    const data = {format: 'html', listItems: []};

    this.editorIds.forEach(function(editorId) {
      const listItem = {content: this.getTextEditor(editorId).scribe.getContent()};
      data.listItems.push(listItem);
    }.bind(this));

    return data;
  },

  // List Items manipulation functions (add, remove, etc)
  addListItemAfterCurrent: function(content) {
    this.addListItem(content, this.getCurrentTextEditor());
  },

  addListItem: function(content, after) {
    content = content || '';
    content = content.trim();
    if (content === "<br>") { content = ''; }

    const editor = this.newTextEditor(this.listItemEditorHTML, content);

    if (after && this.ul.lastchild !== after.node) {
      const before = after.node.nextSibling;
      this.ul.insertBefore(editor.node, before);

      const idx = this.editorIds.indexOf(after.id) + 1;
      this.editorIds.splice(idx, 0, editor.id);
    } else {
      this.ul.appendChild(editor.node);
      this.editorIds.push(editor.id);
    }

    this.focusOn(editor);
  },

  focus: function() {
    let editor = this.getCurrentTextEditor();
    if (!editor) editor = this.getTextEditor(this.editorIds[0]);

    this.focusOn(editor);
  },

  focusOnNeighbor: function(item) {
    const neighbor = this.previousListItem() || this.nextListItem();

    if (neighbor) {
      this.focusOn(neighbor);
    }
  },

  focusOn: function(editor, options = {}) {
    const scribe = editor.scribe;
    const selection = new scribe.api.Selection();
    const lastChild = scribe.el.lastChild;
    let range;

    if (selection.range) {
      range = selection.range.cloneRange();
    }

    editor.el.focus();

    if (range) {
      range.setStartAfter(lastChild, 1);
      range.collapse(false);
    }

    if (options && options.focusAtEnd) {
      const start = getTotalLength(scribe);
      if (start > 0) {
        selectionRange(scribe.el, { start });
      }
    }

    if (options && options.caretPosition) {
      selectionRange(
        scribe.el,
        { start: options.caretPosition }
      );
    }
  },

  focusAtStart: function() {
    const editor = this.getTextEditor(this.editorIds[0]);
    this.focusOn(editor);
  },

  focusAtEnd: function() {
    const lastEditorId = this.editorIds[this.editorIds.length - 1];
    this.appendToTextEditor(lastEditorId);
  },

  removeCurrentListItem: function() {
    if (this.editorIds.length === 1) { return; }

    const item = this.getCurrentTextEditor();
    const idx = this.editorIds.indexOf(item.id);

    this.focusOnNeighbor(item);
    this.editorIds.splice(idx, 1);
    this.ul.removeChild(item.node);
    this.removeTextEditor(item.id);
  },

  appendToCurrentItem: function(content) {
    this.appendToTextEditor(this.getCurrentTextEditor().id, content);
  },

  isLastListItem: function() {
    return this.editorIds.length === 1;
  },

  nextListItem: function() {
    const idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
    const editorId = this.editorIds[idx + 1];

    if (editorId !== undefined) {
      return this.getTextEditor(editorId);
    } else {
      return null;
    }
  },

  previousListItem: function() {
    const idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
    const editorId = this.editorIds[idx - 1];

    if (editorId !== undefined) {
      return this.getTextEditor(editorId);
    } else {
      return null;
    }
  },

  asClipboardHTML: function() {
    const data = this.getBlockData();
    const listItems = data.listItems.map(item => {
      return `<li>${item.content}</li>`;
    }).join("\n");
    return `<ul>${listItems}</ul>`;
  },

  splitCurrentEditor: function(scribe) {
    if (scribe.getTextContent().length === 0) return false;

    const content = rangeToHTML(selectToEnd(scribe));
    this.addListItemAfterCurrent(content);
    return true;
  },

  split: function() {
    const currentEditor = this.getCurrentTextEditor();
    if (!currentEditor) return;

    const scribe = currentEditor.scribe;
    if (this.splitCurrentEditor(scribe)) {
      this.focusOnNeighbor();
      this.addListItemAfterCurrent("");
    }
    this.splitListItem(this.getCurrentTextEditor().scribe);
  },

  splitListItem: function(scribe, options = {}) {
    options = Object.assign({ createTextBlock: false }, options);

    if (this.splitCurrentEditor(scribe)) return;

    let nextListItem = this.nextListItem();
    if (nextListItem) {
      const data = { format: 'html', listItems: [] };
      this.removeCurrentListItem();
      this.focusOn(nextListItem);
      while (!!nextListItem) {
        data.listItems.push({content: nextListItem.scribe.getContent()});
        this.focusOn(nextListItem);
        this.removeCurrentListItem();
        nextListItem = this.nextListItem();
      }
      this.mediator.trigger("block:create", 'List', data, this.el, { autoFocus: true });
    } else {
      this.removeCurrentListItem();
    }

    if (options.createTextBlock) {
      this.mediator.trigger("block:create", 'Text', null, this.el, { autoFocus: true });
    }
  }
});
