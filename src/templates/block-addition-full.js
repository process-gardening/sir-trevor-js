"use strict";

import config from "../config";

export default () => {
  return `
  <div class="st-block-addition-full">
      <div class="st-block-addition-full__button" type="button"></div>
      <div class="st-block-addition-full__icon">
        <svg role="img" class="st-icon">
          <use xlink:href="${config.defaults.iconUrl}#add-block"/>
        </svg>
      </div>
    </div>
  `;
}
