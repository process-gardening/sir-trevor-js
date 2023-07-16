"use strict";

const config = require('./config');

const BlockDeletion = function () {
  this._ensureElement();
  this._bindFunctions();
};

Object.assign(BlockDeletion.prototype, require('./function-bind'), require('./renderable'), {

  tagName: 'a',
  className: 'st-block-ui-btn__delete',

  attributes: {
    html: () => `<svg role="img" class="st-icon">
                   <use xlink:href="${config.defaults.iconUrl}#delete"/>
                 </svg>`,
    'data-icon': 'delete' // close
  }

});

module.exports = BlockDeletion;
