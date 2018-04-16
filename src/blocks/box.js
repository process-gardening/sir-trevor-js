"use strict";

var config = require('../config');
var _ = require('../lodash');
var Block = require('../block');
var stToHTML = require('../to-html');

//module.exports = Block.extend({
module.exports = (function () {
  var set_info, set_attention, set_warn, set_type;
  set_info = function () {
    set_type(this, 'info');
  };
  set_attention = function () {
    set_type(this, 'attention');
  };
  set_warn = function () {
    set_type(this, 'warn');
  };
  set_type = function (block, box_type) {
    console.log('set_type: ' + box_type);

    //if (block.box_type === box_type) {
    //console.log('nothing to set!');
    // return;
    //}

    // set new type first
    block.box_type = box_type;

    // set background
    var card_inner = block.el.getElementsByClassName('st-block__card-inner')[0];
    card_inner.classList.remove('info');
    card_inner.classList.remove('attention');
    card_inner.classList.remove('warn');
    card_inner.classList.add(block.box_type);

    // set icon
    block.el.querySelector('svg.st-icon > use')
      .setAttribute('xlink:href', `${config.defaults.iconUrl}#box_${block.box_type}`);

    // set text
    block.el.querySelector('p.st-block__box-icon > span').innerHTML = i18n.t('blocks:box:' + block.box_type);

    block.highlightControls();
  };

  return Block.extend({
    type: 'Box',
    icon_name: 'box',

    controllable: true,
    controls: {
      box_info: set_info,
      box_attention: set_attention,
      box_warn: set_warn
    },

    editorHTML: function () {
      this.content_id = _.uniqueId("js-div-description-");

      return `
      <div class="st-block__box info">
        <div class="st-block__box-icon">
          <p class="st-block__box-icon">
            <svg role="img" class="st-icon">
              <use xlink:href="${config.defaults.iconUrl}#box_info"/>
            </svg>
          
          <span class="box-type">Default</span></p>
        </div>
        <div class="st-block__box-content">
          <div class="rc-panel">
            <div class="st-block__box-editor rc-panel-body">
              <textarea id="${this.content_id}" ></textarea>
            </div>
          </div>
        </div>
      </div>`
    },

    initialize: function () {
      this.box_type = 'info';
      this.nested_editor = null;
    },

    onBlockRender: function () {
      console.log('onBlockRender');
      // add nested SirTrevor
      if (this.nested_editor === null) {
        this.nested_editor = new SirTrevor.Editor({
          el: document.getElementById(this.content_id),
          defaultType: false,
          blockTypes: ["Text", "ListExtended"] // <%#= block_types_content %>
        });
        //this.nested_editor.on('content-changed', this.toggleEmptyClass.bind(this));
      }

      set_type(this, this.box_type);
      //this.toggleEmptyClass();

    },


    highlightControls: function () {
      var cs = this.control_ui.children;
      for (var i = 0; i < cs.length; ++i) {
        if (cs[i].getAttribute("data-icon") === `box_${this.box_type}`) {
          cs[i].classList.add("st-block-control-ui-btn--selected");
        } else {
          cs[i].classList.remove("st-block-control-ui-btn--selected");
        }
      }
    },

    _serializeData: function () {
      var data = {format: 'html', box_type: this.box_type, data: []};

      if (this.nested_editor !== null) {
        this.nested_editor.onFormSubmit(true);
        data['data'] = this.nested_editor.store.retrieve();
      }
      return data;
    },

    isEmpty: function () {
      console.log('box:isEmpty()');
      return this.nested_editor.blockManager.blocks.length === 0;
    },

    /*
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
          //set_type(this, this.list_type);
          this.highlightControls();
        },

        setupListVariables: function () {
          //this.ul = this.inner.querySelector('ul');
          this.ul = this.inner.querySelector(this.list_type);
          //console.log('this.ul: ' + this.ul);
        },

        highlightControls: function () {
          var cs = this.control_ui.children;
          for (var i = 0; i < cs.length; ++i) {
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
          var block = this;
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
              set_ol();
            } else {
              set_ul();
            }
          }
        },

        parseFromMarkdown: function (markdown) {
          var listItems = markdown.replace(/^ - (.+)$/mg, "$1").split("\n");
          listItems = listItems.filter(function (item) {
            return item.length;
          }).map(function (item) {
            return {content: stToHTML(item, this.type)};
          }.bind(this));

          return {listItems: listItems, format: 'html'};
        },

        _serializeData: function () {
          var data = {format: 'html', list_type: this.list_type, listItems: []};

          this.editorIds.forEach(function (editorId) {
            var listItem = {content: this.getTextEditor(editorId).scribe.getContent()};
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

          var editor = this.newTextEditor(this.listItemEditorHTML, content);

          if (after && this.ul.lastchild !== after.node) {
            var before = after.node.nextSibling;
            this.ul.insertBefore(editor.node, before);

            var idx = this.editorIds.indexOf(after.id) + 1;
            this.editorIds.splice(idx, 0, editor.id);
          } else {
            this.ul.appendChild(editor.node);
            this.editorIds.push(editor.id);
          }

          !content && this.focusOn(editor); // jshint ignore:line
        },

        focusOnNeighbor: function (item) {
          var neighbor = this.previousListItem() || this.nextListItem();

          if (neighbor) {
            this.focusOn(neighbor);
          }
        },

        focusOn: function (editor) {
          var scribe = editor.scribe;
          var selection = new scribe.api.Selection();
          var lastChild = scribe.el.lastChild;
          var range;
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
          var lastEditorId = this.editorIds[this.editorIds.length - 1];
          this.appendToTextEditor(lastEditorId);
        },

        removeCurrentListItem: function () {
          if (this.editorIds.length === 1) {
            return;
          }

          var item = this.getCurrentTextEditor();
          var idx = this.editorIds.indexOf(item.id);

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
          var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
          var editorId = this.editorIds[idx + 1];

          if (editorId !== undefined) {
            return this.getTextEditor(editorId);
          } else {
            return null;
          }
        },

        previousListItem: function () {
          var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
          var editorId = this.editorIds[idx - 1];

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
    */

  });
})();
