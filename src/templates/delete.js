"use strict";

module.exports = () => {
  return `
    <div id="ui-delete-modal" class="st-block__ui-delete-card">
      <div class="st-block__ui-delete-label-div">
        <label class="st-block__ui-delete-label">
          ${i18n.t('general:delete?')}
        </label>
      </div>
      <div class="st-block__ui-buttons">
        <button class='st-block__ui-delete-cancel js-st-block-deny-delete' type="button">
          ${i18n.t('general:cancel')}
        </button>
        <button class='st-block__ui-delete-confirm js-st-block-confirm-delete' type="button">
          ${i18n.t('general:delete')}
        </button>
      </div>
    </div>
  `;
};
