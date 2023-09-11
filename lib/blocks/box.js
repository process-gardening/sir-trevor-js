"use strict";

import config from "../config";

import _ from "../lodash";

import Block from "../block";

import stToHTML from "../to-html";
import SirTrevor from "../index";
//module.exports = Block.extend({
export default (function () {
  let set_info, set_notice, set_caution, set_warning, set_danger, set_type;
  set_info = function () {
    set_type(this, 'info');
  };
  set_notice = function () {
    set_type(this, 'notice');
  };
  set_caution = function () {
    set_type(this, 'caution');
  };
  set_warning = function () {
    set_type(this, 'warning');
  };
  set_danger = function () {
    set_type(this, 'danger');
  };
  set_type = function (block, box_type) {
    //console.log('box::set_type: ' + box_type);

    // set new type first
    block.box_type = box_type;

    // set class for styling
    const card_inner = block.el.getElementsByClassName('st-block__card-upper')[0];
    card_inner.classList.remove('info');
    card_inner.classList.remove('notice');
    card_inner.classList.remove('caution');
    card_inner.classList.remove('warning');
    card_inner.classList.remove('danger');
    card_inner.classList.add(block.box_type);

    const block_box = block.el.getElementsByClassName('st-block__box')[0];
    block_box.classList.remove('info');
    block_box.classList.remove('notice');
    block_box.classList.remove('caution');
    block_box.classList.remove('warning');
    block_box.classList.remove('danger');
    block_box.classList.add(block.box_type);
    // set icon
    block.el.querySelector('svg.st-block__box-icon > use')
      .setAttribute('xlink:href', `${config.defaults.iconUrl}#box_${block.box_type}`);

    // set text
    block.el.querySelector('div.st-block__box-header span.box-type').innerHTML = i18n.t('blocks:box:' + block.box_type);

    block.highlightControls();
  };

  return Block.extend({
    type: 'box',
    icon_name: 'box',

    controllable: true,
    controls: {
      box_info: set_info,
      box_notice: set_notice,
      box_caution: set_caution,
      box_warning: set_warning,
      box_danger: set_danger
    },

    editorHTML: function () {
      //console.log('box::editorHTML()');
      this.content_id = _.uniqueId("js-div-description-");

      return `
      <div class="st-block__box info">
        <div class="st-block__box-header">
          <p class="st-block__box-header">
            <svg role="img" class="st-block__box-icon">
              <use xlink:href="${config.defaults.iconUrl}#box_info"/>
            </svg>
              <span class="box-type">Default</span>
          </p>
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
      //console.log('box::initialize()');
      this.box_type = 'info';
      this._nested_editor = null;
      this._nested_data = null;
      if (!config.defaults.BoxBlockTypes) {
        config.defaults.BoxBlockTypes = this.options.blockTypes;
      }
    },

    beforeBlockRender: function () {
      //console.log('box::beforeBlockRender()');
    },

    onBlockRender: function () {
      //console.log('box::onBlockRender()');

      // add nested editor
      let editor_area = document.getElementById(this.content_id);

      if (editor_area && !this._nested_editor) {

        if (this._nested_data) {
          //console.log('create and load nested editor');
          //console.log(this._nested_data);
          editor_area.value = `{"data": ${JSON.stringify(this._nested_data, undefined, 0)} }`;
          this._nested_data = null; // not needed any more
          //console.log(editor_area.value);
        } else {
          //console.log('create empty nested editor');
        }
        this._nested_editor = new SirTrevor.Editor({
          el: editor_area,
          defaultType: false,
          blockTypes: config.defaults.BoxBlockTypes  // ["Text", "List_Extended"] // <%#= block_types_content %>
        });
        //console.log('this._nested_editor: ');
        //console.log(this._nested_editor);
      }
      set_type(this, this.box_type);
    },


    highlightControls: function () {
      const cs = this.control_ui.children;
      for (let i = 0; i < cs.length; ++i) {
        if (cs[i].getAttribute("data-icon") === `box_${this.box_type}`) {
          cs[i].classList.add("st-block-control-ui-btn--selected");
        } else {
          cs[i].classList.remove("st-block-control-ui-btn--selected");
        }
      }
    },

    loadData: function (data) {
      //console.log('box::loadData()');
      //console.log(data);

      if (data.box_type) {
        this.box_type = data.box_type;
      }

      // Cannot load editor content here, because block ist not rendered, so no textarea available.
      // save it in variable
      this._nested_data = data.nested_data;
    },

    _serializeData: function () {
      //console.log('box::_serializeData()');
      const data = {format: 'html', box_type: this.box_type, nested_data: []};

      if (this._nested_editor !== null) {
        this._nested_editor.onFormSubmit(true);
        data['nested_data'] = this._nested_editor.store.retrieve().data;
      }
      return data;
    },

    isEmpty: function () {
      //console.log('box::isEmpty()');
      return this._nested_editor.blockManager.blocks.length === 0;
    }

  });
})();
