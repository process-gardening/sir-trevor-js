"use strict";

import config from "../config";

import BLOCK_ADDITION_TOP_TEMPLATE from "./block-addition-top";
import BLOCK_ADDITION_FULL_TEMPLATE from "./block-addition-full";

import BLOCK_REPLACER_TEMPLATE from "./block-replacer";

export default (editor_html) => {
  return `
    <div class="st-block__card">
      <div class='st-block__card-upper'>
        <div class='st-block__content' tabindex='0'>
          <div class='st-block__inner'>
            ${ editor_html }
          </div>
        </div>
      </div>
    </div>

    ${ (config.defaults.editorMode === 'document') ? BLOCK_REPLACER_TEMPLATE() : '' }

    ${ (config.defaults.editorMode === 'document') ? BLOCK_ADDITION_TOP_TEMPLATE() : BLOCK_ADDITION_FULL_TEMPLATE() }
  `;
}
