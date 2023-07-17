"use strict";
import _ from "./lodash";

import function_bind from "./function-bind";

import renderable from "./renderable";

let template = [
  "<div class='st-block-positioner__inner'>",
  "<span class='st-block-positioner__selected-value'></span>",
  "<select class='st-block-positioner__select'></select>",
  "</div>"
].join("\n");

let BlockPositioner = function (block, mediator) {
  this.mediator = mediator;
  this.block = block;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

let renderPositionList_debounced = _.debounce(renderPositionList_global, 250);

function renderPositionList_global(positioner) {
  let inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
  for (let i = 1; i <= positioner.total_blocks; i++) {
    inner += "<option value=" + i + ">" + i + "</option>";
  }
  positioner.select.innerHTML = inner;
}


Object.assign(BlockPositioner.prototype, function_bind, renderable, {

  total_blocks: 0,

  bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],

  className: 'st-block-positioner',
  visibleClass: 'active',

  initialize: function () {
    this.el.insertAdjacentHTML("beforeend", template);
    this.select = this.$('.st-block-positioner__select')[0];

    this.select.addEventListener('change', this.onSelectChange);

    //console.log('st-block-positioner__inner:');
    //console.log(this.el.getElementsByClassName('st-block-positioner__inner'));
    this.el.getElementsByClassName('st-block-positioner__inner')[0]
      .addEventListener('click', this.onClick);

    this.mediator.on("block:countUpdate", this.onBlockCountChange);
  },

  onBlockCountChange: function (new_count) {
    if (new_count !== this.total_blocks) {
      this.total_blocks = new_count;
      //this.renderPositionList();
      renderPositionList_debounced(this);
    }
  },

  onSelectChange: function () {
    const val = this.select.value;
    if (val !== 0) {
      this.mediator.trigger(
        "block:changePosition", this.block, val,
        (val === 1 ? 'before' : 'after'));
      this.toggle();
    }
  },

  onClick: function (e) {
    //console.log('onClick');
    e.stopPropagation();
  },

  renderPositionList: function () {
    //console.log('renderPositionList()');
    let inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
    for (let i = 1; i <= this.total_blocks; i++) {
      inner += "<option value=" + i + ">" + i + "</option>";
    }
    this.select.innerHTML = inner;
  },

  toggle: function () {
    //console.log('block-positioner:toggle()');
    //console.log(`contains: ${this.el.classList.contains(this.visibleClass)}`);
    if (this.el.classList.contains(this.visibleClass)) {
      this.el.classList.remove(this.visibleClass);
    } else {
      // hide all other positioners
      for (let elem of document.getElementsByClassName(`${this.className} ${this.visibleClass}`)) {
        elem.classList.remove(this.visibleClass);
      }
      this.mediator.trigger('block-positioner-select:render', this);
      this.el.classList.add(this.visibleClass);
    }
  },

  show: function () {
    //console.log('block-positioner:show()');
    this.el.classList.add(this.visibleClass);
  },

  hide: function () {
    //console.log('block-positioner:hide()');
    this.el.classList.remove(this.visibleClass);
  }

});

export default BlockPositioner;
