"use strict";

import _ from "./lodash";

import Dom from "./packages/dom";

export default {
  tagName: 'div',
  className: 'sir-trevor__view',
  attributes: {},

  $: function(selector) {
    return this.el.querySelectorAll(selector);
  },

  render: function() {
    return this;
  },

  destroy: function() {
    if (!_.isUndefined(this.stopListening)) { this.stopListening(); }
    Dom.remove(this.el);
  },

  _ensureElement: function() {
    if (!this.el) {
      const attrs = Object.assign({}, _.result(this, 'attributes'));
      if (this.id) { attrs.id = this.id; }
      if (this.className) { attrs['class'] = this.className; }

      const el = Dom.createElement(this.tagName, attrs);
      this._setElement(el);
    } else {
      this._setElement(this.el);
    }
  },

  _setElement: function(element) {
    this.el = element;
    return this;
  }
};

