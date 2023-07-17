"use strict";

import config from "../config";

export default function ({name, text, cmd, iconName}) {
  return `
    <button type="button" class="st-format-btn st-format-btn--${name}" data-cmd="${cmd}">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#${iconName}"/>
      </svg>
    </button>
  `;
}
