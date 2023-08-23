"use strict";

import Dom from "./dom";

const fixEvent = function (e, target) {
  const obj = {};

  // Events don't work as normal objects, so need to copy properties directly.
  // List and matchers taken from jQuery.Event.fix.
  // For other properties refer to the originalEvent object.

  const props = {
    shared: ("altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
      "metaKey relatedTarget shiftKey target timeStamp view which").split(" "),
    mouseEvent: ("button buttons clientX clientY offsetX offsetY pageX pageY " +
      "screenX screenY toElement").split(" "),
    keyEvent: "char charCode key keyCode".split(" ")
  };

  const rkeyEvent = /^key/,
    rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;

  const propsToCopy =
    rmouseEvent.test(e.type) ? props.shared.concat(props.mouseEvent) :
      rkeyEvent.test(e.type) ? props.shared.concat(props.keyEvent) :
        props.shared;

  let prop;
  for (let i = 0; i < propsToCopy.length; i++) {
    prop = propsToCopy[i];
    obj[prop] = e[prop];
  }

  obj.currentTarget = target;
  obj.originalEvent = e;

  obj.preventDefault = function () {
    if (this.originalEvent) {
      this.originalEvent.preventDefault();
    }
  };

  obj.stopPropagation = function () {
    if (this.originalEvent) {
      this.originalEvent.stopPropagation();
    }
  };

  return obj;
};

function delegate(el, selector, event, fn, useCapture = false) {
  el.addEventListener(event, (e) => {
    let target = e.target;
    for (target; target && target !== el; target = target.parentNode) {
      if (Dom.matches(target, selector)) {
        fn.call(target, fixEvent(e, target));
        break;
      }
    }
    target = null;
  }, useCapture);
}

export default {
  delegate
}
