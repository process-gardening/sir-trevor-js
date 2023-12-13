import Scribe from "..";


class CustomSelection {
  selection: Selection;
  range: Range;
  scribe: Scribe;
  nodeHelpers: any;

  constructor(scribe: Scribe) {

    let rootDoc = scribe.el.ownerDocument;
    this.nodeHelpers = scribe.node;

    // find the parent document or document fragment
    if (rootDoc.compareDocumentPosition(scribe.el) && Node.DOCUMENT_POSITION_DISCONNECTED) {
      let currentElement = scribe.el.parentNode;
      while (currentElement && this.nodeHelpers.isFragment(currentElement)) {
        currentElement = currentElement.parentNode;
      }

      // if we found a document fragment and it has a getSelection method, set it to the root doc
      if (currentElement && currentElement instanceof Document && currentElement.getSelection) {
        rootDoc = currentElement;
      }
    }

    this.scribe = scribe;
    this.selection = scribe.el.ownerDocument.getSelection();
    if (this.selection.rangeCount && this.selection.anchorNode) {
      let startNode = this.selection.anchorNode;
      let startOffset = this.selection.anchorOffset;
      let endNode = this.selection.focusNode;
      let endOffset = this.selection.focusOffset;

      // if the range starts and ends on the same node, then we must swap the
      // offsets if ever focusOffset is smaller than anchorOffset
      if (startNode === endNode && endOffset < startOffset) {
        const tmp = startOffset;
        startOffset = endOffset;
        endOffset = tmp;
      }
      // if the range ends *before* it starts, then we must reverse the range
      else if (scribe.node.isBefore(endNode, startNode)) {
        const tmpNode = startNode,
          tmpOffset = startOffset;
        startNode = endNode;
        startOffset = endOffset;
        endNode = tmpNode;
        endOffset = tmpOffset;
      }

      // create the range to avoid chrome bug from getRangeAt / window.getSelection()
      // https://code.google.com/p/chromium/issues/detail?id=380690
      this.range = document.createRange();
      this.range.setStart(startNode, startOffset);
      this.range.setEnd(endNode, endOffset);
    }

  }

  createMarker() {
    const node = document.createElement('em');
    node.style.display = 'none';
    node.classList.add('scribe-marker');
    return node;
  }

  insertMarker(range: Range, marker: HTMLElement) {
    range.insertNode(marker);

    /**
     * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
     * the inserted element. We just remove it. This in turn creates several
     * bugs when perfoming commands on selections that contain an empty text
     * node (`removeFormat`, `unlink`).
     * As per: http://jsbin.com/hajim/5/edit?js,console,output
     */
    if (marker.nextSibling && this.scribe.node.isEmptyTextNode(marker.nextSibling)) {
      this.scribe.node.removeNode(marker.nextSibling);
    }

    /**
     * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
     * the inserted element when the child element is at the start of a block
     * element. We just remove it.
     * FIXME: Document why we need to remove this
     * As per: http://jsbin.com/sifez/1/edit?js,console,output
     */
    if (marker.previousSibling && this.nodeHelpers.isEmptyTextNode(marker.previousSibling)) {
      this.nodeHelpers.removeNode(marker.previousSibling);
    }
  }

  setRangeStart(range: Range, marker: HTMLElement) {
    const prevSibling = marker.previousSibling;
    const nextSibling = marker.nextSibling;

    if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
      const textNode = prevSibling as Text;
      range.setStart(textNode, textNode.length);
    } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      const textNode = nextSibling as Text;
      range.setStart(textNode, 0);
    } else {
      range.setStartBefore(marker);
    }
  }

  setRangeEnd(range: Range, marker: HTMLElement) {
    const prevSibling = marker.previousSibling;
    const nextSibling = marker.nextSibling;

    if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
      const textNode = prevSibling as Text;
      range.setEnd(textNode, textNode.length);
    } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      const textNode = nextSibling as Text;
      range.setEnd(textNode, 0);
    } else {
      range.setEndAfter(marker);
    }
  }

  getContaining(nodeFilter: any) {
    const range = this.range;
    if (!range) { return; }

    const node = this.range.commonAncestorContainer;
    return !(node && this.scribe.el === node) && nodeFilter(node) ?
      node :
      this.scribe.node.getAncestor(node, this.scribe.el, nodeFilter);
  };

  isInScribe() {
    const range = this.range;
    return range
      //we need to ensure that the scribe's element lives within the current document to avoid errors with the range comparison (see below)
      //one way to do this is to check if it's visible (is this the best way?).
      && document.contains(this.scribe.el)
      //we want to ensure that the current selection is within the current scribe node
      //if this isn't true scribe will place markers within the selections parent
      //we want to ensure that scribe ONLY places markers within it's own element
      && this.scribe.el.contains(range.startContainer)
      && this.scribe.el.contains(range.endContainer);
  }

  placeMarkers(): void {
    const range = this.range;

    if (!this.isInScribe()) {
      return;
    }

    // insert start marker
    this.insertMarker(range.cloneRange(), this.createMarker());

    if (!range.collapsed) {
      // End marker
      const rangeEnd = range.cloneRange();
      rangeEnd.collapse(false);
      this.insertMarker(rangeEnd, this.createMarker());
    }

    this.selection.removeAllRanges();
    this.selection.addRange(range);
  };

  getMarkers(): NodeListOf<Element> {
    return this.scribe.el.querySelectorAll('em.scribe-marker');
  };

  removeMarkers(): void {
    Array.prototype.forEach.call(this.getMarkers(), function (marker) {
      const markerParent = marker.parentNode;
      this.scribe.node.removeNode(marker);

      // MSIE doesn't like normalize
      if (!window.navigator.userAgent.indexOf("MSIE ")) {
        // Placing the markers may have split a text node. Sew it up, otherwise
        // if the user presses space between the nodes the browser will insert
        // an `&nbsp;` and that will cause word wrapping issues.
        markerParent.normalize();
      }
    });
  };

  // This will select markers if there are any. You will need to focus the
  // Scribe instance’s element if it is not already for the selection to
  // become active.
  selectMarkers(keepMarkers: boolean): void {
    const markers = this.getMarkers();
    if (!markers.length) {
      return;
    }

    const newRange = document.createRange();

    this.setRangeStart(newRange, markers[0] as HTMLElement);
    // We always reset the end marker because otherwise it will just
    // use the current range’s end marker.
    this.setRangeEnd(newRange, markers.length >= 2 ? markers[1] as HTMLElement : markers[0] as HTMLElement);

    if (!keepMarkers) {
      this.removeMarkers();
    }

    this.selection.removeAllRanges();
    this.selection.addRange(newRange);
  };

  isCaretOnNewLine() {
    const containerPElement = this.getContaining(function (node: Node) {
      return node.nodeName === 'P';
    });
    return !!containerPElement && this.scribe.node.isEmptyInlineElement(containerPElement);
  };
}

export default (scribe: Scribe) => new CustomSelection(scribe);