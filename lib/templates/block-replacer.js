"use strict";

import config from "../config";

export default () => {
  return `
    <button class="st-block-replacer st-block-addition-element" type="button">
      <span class="st-block-replacer__button">
        <svg role="img" class="st-icon">
          <use xlink:href="${config.defaults.iconUrl}#add-block"/>
        </svg>
      </span>
    </button>
  `;
}
