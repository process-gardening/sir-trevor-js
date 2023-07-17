"use strict";

/*
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

import _ from "../lodash";

import config from "../config";

import utils from "../utils";

import Ajax from "../packages/ajax";

import EventBus from "../event-bus";

export default function (block, file, success, error) {
  const uid = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
  const data = new FormData();
  const attachmentName = block.attachmentName || config.defaults.attachmentName;
  const attachmentFile = block.attachmentFile || config.defaults.attachmentFile;
  const attachmentUid = block.attachmentUid || config.defaults.attachmentUid;

  data.append(attachmentName, file.name);
  data.append(attachmentFile, file);
  data.append(attachmentUid, uid);

  EventBus.trigger('onUploadStart', data);

  block.resetMessages();

  const callbackSuccess = function (data) {
    utils.log('Upload callback called');
    EventBus.trigger('onUploadStop', data);

    if (!_.isUndefined(success) && _.isFunction(success)) {
      success.apply(block, arguments, data);
    }

    block.removeQueuedItem(uid);
  };

  const callbackError = function (jqXHR, status, errorThrown) {
    utils.log('Upload callback error called');
    EventBus.trigger('onUploadStop', undefined, errorThrown, status, jqXHR);

    if (!_.isUndefined(error) && _.isFunction(error)) {
      error.call(block, status);
    }

    block.removeQueuedItem(uid);
  };

  const url = block.uploadUrl || config.defaults.uploadUrl;

  const xhr = Ajax.fetch(url, {
    body: data,
    method: 'POST',
    dataType: 'json'
  });

  block.addQueuedItem(uid, xhr);

  xhr.then(callbackSuccess)
     .catch(callbackError);

  return xhr;
}
