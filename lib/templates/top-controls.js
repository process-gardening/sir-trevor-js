"use strict";

import BLOCK_ADDITION_TEMPLATE from "./block-addition-full";

export default () => {
  return `
    <div id="st_top" class="st-top-controls">
      ${BLOCK_ADDITION_TEMPLATE()}
    </div>
  `;
}
