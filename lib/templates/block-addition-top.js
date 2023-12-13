"use strict";

import config from "../config";

export default () => {
  return `
    <div class="st-block-addition-top">
      <div class="st-block-addition-top__button" type="button"></div>
      <div class="st-block-addition-top__icon">
        <svg role="img" class="st-icon">
          <use xlink:href="${config.defaults.iconUrl}#add-block"/>
        </svg>
      </div>
    </div>
  `;
}