"use strict";

import config from "../config";

export default (block) => {
  return `
    <button class="st-blocks-menu__button st-block-button" data-type="${block.type}" type="button">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#${block.icon_name}"/>
      </svg>
      ${block.title()}
    </button>
  `;
}
