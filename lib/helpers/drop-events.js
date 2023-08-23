"use strict";

function dragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
}

function dragOver(e) {
  console.log('dragOver()');
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "copy";
  if (!e.currentTarget.classList.contains('st-drag-over')) {
    e.currentTarget.classList.add('st-drag-over');
  }
}

function dragLeave(e) {
  e.currentTarget.classList.remove('st-drag-over');
  e.preventDefault();
  e.stopPropagation();
}

export default {

  dropArea: function (el) {
    el.addEventListener("dragenter", dragEnter);
    el.addEventListener("dragover", dragOver);
    el.addEventListener("dragleave", dragLeave);
    return el;
  },

  noDropArea: function (el) {
    el.removeEventListener("dragenter");
    el.removeEventListener("dragover");
    el.removeEventListener("dragleave");
    return el;
  }

};
