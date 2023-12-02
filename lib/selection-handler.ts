"use strict";

import _ from "./lodash";

import Dom from "./packages/dom";

import type { MediatedEventableInterface } from "./hofs/mediated-eventable";

import { MediatedEventable } from "./hofs/mediated-eventable";

import { boundMethod } from "autobind-decorator";
import { MediatorInstanceType } from "./hofs/eventable";

const TYPE = 'application/vnd.sirtrevor+json';

interface StartOptions {
  expand?: boolean;
  mouseEnabled?: boolean;
}

interface DeleteOptions {
  createNextBlock?: boolean;

}

@MediatedEventable
class BaseSelectionHandler implements MediatedEventableInterface {

  wrapper: any;
  mediator: MediatorInstanceType;
  editor: any;
  options: any;

  eventNamespace: string;
  mediatedEvents: {};

  bound: string[];

  startIndex; number;
  endIndex: number;
  selecting: boolean;


  constructor(wrapper, mediator, editor) {
    this.wrapper = wrapper;
    this.mediator = mediator;

    this.editor = editor;
    this.options = editor.options;

    this.eventNamespace = 'selection';

    this.mediatedEvents = {
      'start': 'start',
      'render': 'render',
      'complete': 'complete',
      'all': 'all',
      'copy': 'copy',
      'update': 'update',
      'delete': 'delete',
      'cancel': 'cancel',
      'block': 'block'
    },

    this.bound = ['onCopy', 'onCut', 'onKeyDown', 'onMouseUp', 'onMouseDown', 'onPaste']

    this.startIndex = this.endIndex = 0;
    this.selecting = false;

    this.initialize();
  }
  
  /**
   * Initializes the selection handler by adding event listeners for keydown, mouseup, copy, cut, and paste events.
   * If the selection handler is not enabled, no event listeners will be added.
   */
  initialize() {
    if (!this.enabled()) return;

    window.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener('mouseup', this.onMouseUp, false);
    document.addEventListener('copy', this.onCopy, false);

    if (this.options.selectionCut) {
      document.addEventListener('cut', this.onCut, false);
    }

    if (this.options.selectionPaste) {
      document.addEventListener('paste', this.onPaste, true);
    }
  }

  /**
   * Determines whether the user can select text within the editor.
   * @returns {boolean} True if the user can select text, false otherwise.
   */
  canSelect(): boolean {
    // Don't select if within an input field
    const editorEl1 = Dom.getClosest(document.activeElement, 'input');

    if (editorEl1 !== document.body) return false;

    const editorEl2 = Dom.getClosest(document.activeElement, '.st-outer');

    // Don't select all if focused on element outside of the editor.
    if (this.options.selectionLimitToEditor) {
      if (editorEl2 !== this.wrapper) return false;
    }

    return true;
  }

  /**
   * Returns a boolean indicating whether the selectionCopy option is enabled.
   * @returns {boolean} Whether the selectionCopy option is enabled.
   */
  enabled(): boolean {
    return !!this.options.selectionCopy;
  }

  /**
   * Starts the selection process.
   * @param index - The index to start the selection from.
   * @param options - Optional settings for the selection process.
   * @returns Returns false if selection is not enabled, otherwise returns true.
   */
  start(index: number, options: StartOptions = {}) {
    if (!this.enabled()) return false;

    options = Object.assign({
      mouseEnabled: false,
      expand: false
    }, options);

    this.endIndex = index;

    if (!options.expand) this.startIndex = this.endIndex;

    this.selecting = true;

    if (options.mouseEnabled) {
      this.editor.mouseDown = true;
      this.selecting = this.startIndex !== this.endIndex;
      if (this.selecting) this.removeNativeSelection();
      window.addEventListener("mousemove", this.onMouseMove);
    }

    this.mediator.trigger("selection:render");
  }

  startAtEnd() {
    this.start(this.editor.getBlocks().length - 1);
  }

  move(offset) {
    this.start(this.endIndex + offset);
  }

  onMouseMove() {}

  update(index) {
    if (index < 0 || index >= this.editor.getBlocks().length) return;
    this.endIndex = index;
    if (this.startIndex !== this.endIndex) this.selecting = true;
    this.removeNativeSelection();
    this.mediator.trigger("selection:render");
  }

  expand(offset: number) {
    this.update(this.endIndex + offset);
  }

  expandToStart() {
    this.update(0);
  }

  expandToEnd() {
    this.update(this.editor.getBlocks().length - 1);
  }

  focusAtEnd() {
    const block = this.editor.getBlocks()[this.endIndex];
    block.el.scrollIntoView({ behavior: "smooth" });
  }

  complete() {
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  all() {
    if (!this.enabled()) return false;

    this.removeNativeSelection();

    const blocks = this.editor.getBlocks();
    this.selecting = true;
    this.startIndex = 0;
    this.endIndex = blocks.length - 1;
    this.mediator.trigger("selection:render");
  }

  cancel() {
    this.editor.mouseDown = false;
    this.selecting = false;
    this.render();
  }

  removeNativeSelection() {
    const sel = window.getSelection ? window.getSelection() : document.getSelection();
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
    document.activeElement && (document.activeElement as HTMLElement).blur();
  }

  render() {
    const visible = this.selecting;

    this.editor.getBlocks().forEach((block, idx) => {
      block.select(visible && this.indexSelected(idx));
    });
  }

  getClipboardData() {
    this.editor.getData();

    const htmlOutput = [];
    const textOutput = [];
    const dataOutput = [];

    this.editor.getBlocks().forEach((block, idx) => {
      if (this.indexSelected(idx)) {
        const html = block.asClipboardHTML();
        const text = html;
        htmlOutput.push(html);
        textOutput.push(text);
        dataOutput.push(block.getData());
      }
    });

    return {
      html: htmlOutput.join(""),
      text: textOutput.join("\n\n"),
      data: dataOutput
    };
  }

  copy() {
    const copyArea = this.createFakeCopyArea();
    copyArea.innerHTML = this.getClipboardData().html;

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(copyArea);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand('copy');
      copyArea.blur();
    }
    catch (err) {
      console.log("Copy could not be performed");
    }
  }

  createFakeCopyArea(): HTMLDivElement {
    let copyArea = document.body.querySelector(".st-copy-area");
    if (!copyArea) {
      copyArea = Dom.createElement("div", {
        contenteditable: true,
        class: 'st-copy-area st-utils__hidden',
      });
      document.body.appendChild(copyArea);
    }
    return copyArea as HTMLDivElement;
  }

  delete(options: DeleteOptions = {}) {
    options = Object.assign({ createNextBlock: true }, options);

    this.editor.getBlocks().forEach((block, idx) => {
      if (!this.indexSelected(idx)) return;
      this.mediator.trigger(
        "block:remove",
        block.blockID, {
          focusOnNext: true,
          createNextBlock: options.createNextBlock
        }
      );
    });
    this.cancel();
  }

  indexSelected(index) {
    return index >= this.getStartIndex() && index <= this.getEndIndex();
  }

  block(block) {
    const blockPosition = this.editor.blockManager.getBlockPosition(block.el);

    this.mediator.trigger("formatter:hide");
    this.removeNativeSelection();
    this.start(blockPosition);
  }

  getStartIndex() {
    return Math.min(this.startIndex, this.endIndex);
  }


  getEndIndex() {
    return Math.max(this.startIndex, this.endIndex);
  }

  getStartBlock() {
    return this.editor.getBlocks()[this.getStartIndex()];
  }

  getEndBlock() {
    return this.editor.getBlocks()[this.getEndIndex()];
  }


  @boundMethod
  onKeyDown(ev: KeyboardEvent) {
    
    const ctrlKey = ev.ctrlKey || ev.metaKey;
    const key = ev.key;

    if (this.selecting && key === "Backspace") {
      ev.preventDefault();
      this.delete();
    } else if (ctrlKey && key === "a") {
      if (!this.selecting && !this.canSelect()) return;
      ev.preventDefault();
      this.mediator.trigger("selection:all");
    } else if (this.selecting) {
      if (["Down", "ArrowDown"].indexOf(key) > -1) {
        ev.preventDefault();
        if (ev.shiftKey && ctrlKey) this.expandToEnd();
        else if (ev.shiftKey) this.expand(1);
        else if (ctrlKey) this.startAtEnd();
        else {
          this.cancel();
          this.mediator.trigger("block:focusNext", this.getEndBlock().blockID, { force: true });
          return;
        }
        this.focusAtEnd();
      } else if (["Up", "ArrowUp"].indexOf(key) > -1) {
        ev.preventDefault();
        if (ev.shiftKey && ctrlKey) this.expandToStart();
        else if (ev.shiftKey) this.expand(-1);
        else if (ctrlKey) this.start(0);
        else {
          this.cancel();
          this.mediator.trigger("block:focusPrevious", this.getStartBlock().blockID, { force: true });
          return;
        }
        this.focusAtEnd();
      }
    }
  }

  @boundMethod
  onMouseUp(ev: MouseEvent) {
    if (!this.editor.mouseDown) {
      window.addEventListener('mousedown', this.onMouseDown);
      this.mediator.trigger("selection:complete");
      this.mediator.trigger("selection:cancel");
      return;
    }

    this.editor.mouseDown = false;
    this.mediator.trigger("selection:complete");
    this.mediator.trigger("selection:render");
  }

  @boundMethod
  onMouseDown(ev: MouseEvent) {
    if (!this.editor.mouseDown) {
      window.removeEventListener('mousedown', this.onMouseDown);
      this.mediator.trigger("selection:complete");
      this.mediator.trigger("selection:cancel");

    }
  }

  copySelection(ev: ClipboardEvent) {
    const content = this.getClipboardData();

    ev.clipboardData.setData(TYPE, JSON.stringify(content.data));
    ev.clipboardData.setData('text/html', content.html);
    ev.clipboardData.setData('text/plain', content.text);
    ev.preventDefault();
  }

  @boundMethod
  onCopy(ev: ClipboardEvent) {
    if (!this.selecting) return;

    this.copySelection(ev);
  }

  @boundMethod
  onCut(ev: ClipboardEvent) {
    if (!this.selecting) return;

    this.copySelection(ev);
    this.delete();
  }

  @boundMethod
  onPaste(ev: ClipboardEvent) {
    // Fix Edge types DomStringList.
    
    const types = [].slice.call(ev.clipboardData.types);
    if (types.includes(TYPE) && ev.clipboardData.getData(TYPE) !== null) {
      if (!this.selecting && !this.canSelect()) return;

      ev.preventDefault();
      ev.stopPropagation();
      let data = JSON.parse(ev.clipboardData.getData(TYPE));
      if (this.selecting) {
        const nextBlock = this.editor.getBlocks()[this.getEndIndex() + 1];
        this.delete({ createNextBlock: false });
        if (nextBlock && !nextBlock.isEmpty()) {
          this.mediator.trigger("block:createBefore", "text", "", nextBlock, { autoFocus: true });
        } else {
          this.mediator.trigger("block:create", "text", "", null, { autoFocus: true });
        }
      }
      this.mediator.trigger("block:paste", data);
    }
  }
}

export default BaseSelectionHandler;