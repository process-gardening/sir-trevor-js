"use strict";

import config from "./config";

import function_bind from "./function-bind";

import renderable from "./renderable";

const BlockDeletion = function () {
  this._ensureElement();
  this._bindFunctions();
};

Object.assign(BlockDeletion.prototype, function_bind, renderable, {

  tagName: 'a',
  className: 'st-block-ui-btn__delete',

  attributes: {
    html: () => `<svg role="img" class="st-icon">
                   <use xlink:href="${config.defaults.iconUrl}#delete"/>
                 </svg>`,
    'data-icon': 'delete' // close
  }

});

export default BlockDeletion;
