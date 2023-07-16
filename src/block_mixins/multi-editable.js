"use strict";

const selectionRange = require('selection-range');

const _ = require('../lodash');
const ScribeInterface = require('../scribe-interface');

let {trimScribeContent} = require('../blocks/scribe-plugins/shared');

module.exports = {
  mixinName: 'MultiEditable',

  initializeMultiEditable: function() {
    this.editors = {};
  },

  newTextEditor: function(template_or_node, content) {
    let editor, isTextTemplate, wrapper;

    isTextTemplate = (template_or_node.tagName === undefined);

    if (isTextTemplate) {
      // render template outside of dom
      wrapper = document.createElement('div');
      wrapper.innerHTML = template_or_node;

      editor = wrapper.querySelector('.st-block__editor');
    } else {
      editor = template_or_node;
    }

    const id = _.uniqueId('editor-');
    editor.setAttribute('data-editorId', id);
    editor.addEventListener('keyup', this.getSelectionForFormatter);
    editor.addEventListener('mouseup', this.getSelectionForFormatter);

    const configureScribe =
      _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
    const scribe = ScribeInterface.initScribeInstance(
      editor, this.scribeOptions, configureScribe, this.editorOptions
    );

    scribe.setContent(content);

    const editorObject = {
      node: isTextTemplate ? wrapper.removeChild(wrapper.firstChild) : editor,
      el: editor,
      scribe: scribe,
      id: id
    };

    this.editors[id] = editorObject;

    return editorObject;
  },

  getCurrentTextEditor: function() {
    const id = document.activeElement.getAttribute('data-editorId');
    const editor = this.getTextEditor(id);

    if (editor) {
      this.currentEditor = editor;
    }

    return this.currentEditor;
  },

  appendToTextEditor: function(id, content) {
    const scribe = this.getTextEditor(id).scribe;

    trimScribeContent(scribe);

    const range = document.createRange();
    range.selectNodeContents(scribe.el);
    range.collapse(false);
    const selection = new scribe.api.Selection();
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);

    const caretPosition = selectionRange(scribe.el);

    if (content) {
      scribe.insertHTML(content);
    }

    selectionRange(scribe.el, {
      start: caretPosition.start,
      end: caretPosition.end
    });
  },

  getCurrentScribeInstance: function() {
    return this.getCurrentTextEditor().scribe;
  },

  getTextEditor: function(id) {
    return this.editors[id];
  },

  removeTextEditor: function(id) {
    delete this.editors[id];
  },

  // scribe commands for FormatBar
  execTextBlockCommand: function(cmdName) {
    return ScribeInterface.execTextBlockCommand(
      this.getCurrentScribeInstance(), cmdName
    );
  },

  queryTextBlockCommandState: function(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(
      this.getCurrentScribeInstance(), cmdName
    );
  },
};
