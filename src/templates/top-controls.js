"use strict";

const BLOCK_ADDITION_TEMPLATE = require("./block-addition-full");

export default () => {
  return `
    <div id="st_top" class="st-top-controls">
      ${BLOCK_ADDITION_TEMPLATE()}
    </div>
  `;
}
