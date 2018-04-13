"use strict";

var config = require('../config');
const BLOCK_ADDITION_TOP_TEMPLATE = require("./block-addition-top");
//const BLOCK_ADDITION_TEMPLATE = require("./block-addition");
const BLOCK_ADDITION_FULL_TEMPLATE = require("./block-addition-full");
const BLOCK_REPLACER_TEMPLATE = require("./block-replacer");

module.exports = (editor_html) => {
  return `
    <div class='st-block__card-inner' tabindex='0'>
      <div class='st-block__content'>
        <div class='st-block__inner'>
          ${ editor_html }
        </div>
      </div>
    </div>
        
    ${ (config.defaults.editorMode === 'document') ? BLOCK_REPLACER_TEMPLATE() : '' }
    
    ${ (config.defaults.editorMode === 'document') ? BLOCK_ADDITION_TOP_TEMPLATE() : BLOCK_ADDITION_FULL_TEMPLATE() }
  `;
};
