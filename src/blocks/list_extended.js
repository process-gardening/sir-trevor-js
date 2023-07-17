"use strict";

import Block from "../block";

import stToHTML from "../to-html";

import ScribeListBlockPlugin from "./scribe-plugins/scribe-list-block-plugin";
//module.exports = Block.extend({
export default (function () {
  let set_ul, set_ol, set_type;
  set_ul = function () {
    set_type(this, 'ul');
  };
  set_ol = function () {
    set_type(this, 'ol');
  };
  set_type = function (block, list_type) {
    //console.log('list_extended::set_type: ' + list_type);

    const list_old = block.el.getElementsByClassName('st-list-block__list')[0];

    if (block.list_type === list_old.tagName.toLowerCase() &&
      block.list_type === list_type) {
      //console.log('nothing to set!');
      return;
    }

    // set new type first
    block.list_type = list_type;

    const existing_data = block._serializeData();

    // remove all existing items with their editors
    block.removeAllItems();

    if (list_old !== null) {
      const list = document.createElement(list_type);
      //list.innerHTML = list_old.innerHTML; set by load data
      list.id = list_old.id;
      list.classList = list_old.classList;
      list_old.parentNode.replaceChild(list, list_old);
    }

    block.highlightControls();
    block.setupListVariables(); // to connect replaced html

    // reload data
    block.loadData(existing_data);
  };

  return Block.extend({
    type: 'list_extended',
    icon_name: 'list_extended',
    //icon_name: 'tweet',
    multi_editable: true,

    controllable: true,
    controls: {
      ul: set_ul,
      ol: set_ol
    },

    scribeOptions: {
      allowBlockElements: false,
      tags: {
        p: false
      }
    },

    configureScribe: function (scribe) {
      scribe.use(new ScribeListBlockPlugin(this));
    },

    editorHTML: '<ul class="st-list-block__list"></ul>',
    listItemEditorHTML: '<li class="st-list-block__item"><div class="st-list-block__editor st-block__editor"></div></li>',

    initialize: function () {
      this.editorIds = [];
      this.list_type = 'ul';
    },

    // Data functions (loading, converting, saving)
    beforeLoadingData: function () {
      this.setupListVariables();

      this.loadData(this._getData());
    },

    onBlockRender: function () {
      if (!this.ul) {
        this.setupListVariables();
      }
      if (this.editorIds.length < 1) {
        this.addListItem();
      }
      set_type(this, this.list_type);
      this.highlightControls();
    },

    setupListVariables: function () {
      //this.ul = this.inner.querySelector('ul');
      this.ul = this.inner.querySelector(this.list_type);
      //console.log('this.ul: ' + this.ul);
    },

    highlightControls: function () {
      const cs = this.control_ui.children;
      for (let i = 0; i < cs.length; ++i) {
        if (cs[i].getAttribute("data-icon") === this.list_type) {
          cs[i].classList.add("st-block-control-ui-btn--selected");
        } else {
          cs[i].classList.remove("st-block-control-ui-btn--selected");
        }
      }
    },

    loadData: function (data) {
      //console.log('loadData()');
      //console.log(data);
      const block = this;
      if (this.options.convertFromMarkdown && data.format !== "html") {
        data = this.parseFromMarkdown(data.text);
      }

      if (data.listItems.length) {
        data.listItems.forEach(function (li) {
          block.addListItem(li.content);
        });
      } else {
        block.addListItem();
      }

      if (this.list_type !== data.list_type) {
        if (data.list_type === 'ol') {
          this.list_type = 'ol';
        } else {
          this.list_type = 'ul';
        }
      }
    },

    parseFromMarkdown: function (markdown) {
      let listItems = markdown.replace(/^ - (.+)$/mg, "$1").split("\n");
      listItems = listItems.filter(function (item) {
        return item.length;
      }).map(function (item) {
        return {content: stToHTML(item, this.type)};
      }.bind(this));

      return {listItems: listItems, format: 'html'};
    },

    _serializeData: function () {
      const data = {format: 'html', list_type: this.list_type, listItems: []};

      this.editorIds.forEach(function (editorId) {
        const listItem = {content: this.getTextEditor(editorId).scribe.getContent()};
        data.listItems.push(listItem);
      }.bind(this));

      return data;
    },

    // List Items manipulation functions (add, remove, etc)
    addListItemAfterCurrent: function (content) {
      this.addListItem(content, this.getCurrentTextEditor());
    },

    addListItem: function (content, after) {
      content = content || '';
      if (content.trim() === "<br>") {
        content = '';
      }

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

      !content && this.focusOn(editor); // jshint ignore:line
    },

    focusOnNeighbor: function (item) {
      const neighbor = this.previousListItem() || this.nextListItem();

      if (neighbor) {
        this.focusOn(neighbor);
      }
    },

    focusOn: function (editor) {
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
    },

    focusAtEnd: function () {
      const lastEditorId = this.editorIds[this.editorIds.length - 1];
      this.appendToTextEditor(lastEditorId);
    },

    removeCurrentListItem: function () {
      if (this.editorIds.length === 1) {
        return;
      }

      const item = this.getCurrentTextEditor();
      const idx = this.editorIds.indexOf(item.id);

      this.focusOnNeighbor(item);
      this.editorIds.splice(idx, 1);
      this.ul.removeChild(item.node);
      this.removeTextEditor(item.id);
    },

    appendToCurrentItem: function (content) {
      this.appendToTextEditor(this.getCurrentTextEditor().id, content);
    },

    isLastListItem: function () {
      return this.editorIds.length === 1;
    },

    nextListItem: function () {
      const idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
      const editorId = this.editorIds[idx + 1];

      if (editorId !== undefined) {
        return this.getTextEditor(editorId);
      } else {
        return null;
      }
    },

    previousListItem: function () {
      const idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
      const editorId = this.editorIds[idx - 1];

      if (editorId !== undefined) {
        return this.getTextEditor(editorId);
      } else {
        return null;
      }
    },

    removeAllItems: function () {
      while (this.editorIds.length > 0) {
        this.removeTextEditor(this.editorIds.pop());
      }
    }


  });
})();
