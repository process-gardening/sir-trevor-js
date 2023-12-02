import Scribe from "..";


  

  export default function (scribe: Scribe) {
    let rootDoc = scribe.el.ownerDocument;
    const nodeHelpers = scribe.node;

    // find the parent document or document fragment
    if( rootDoc.compareDocumentPosition(scribe.el) && Node.DOCUMENT_POSITION_DISCONNECTED ) {
      let currentElement = scribe.el.parentNode;
      while(currentElement && nodeHelpers.isFragment(currentElement)) {
        currentElement = currentElement.parentNode;
      }

      // if we found a document fragment and it has a getSelection method, set it to the root doc
      if (currentElement && currentElement.getSelection) {
        rootDoc = currentElement;
      }
    }

    function createMarker() {
      const node = document.createElement('em');
      node.style.display = 'none';
      node.classList.add('scribe-marker');
      return node;
    }

    function insertMarker(range, marker) {
      range.insertNode(marker);

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
       * the inserted element. We just remove it. This in turn creates several
       * bugs when perfoming commands on selections that contain an empty text
       * node (`removeFormat`, `unlink`).
       * As per: http://jsbin.com/hajim/5/edit?js,console,output
       */
      if (marker.nextSibling && nodeHelpers.isEmptyTextNode(marker.nextSibling)) {
        nodeHelpers.removeNode(marker.nextSibling);
      }

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
       * the inserted element when the child element is at the start of a block
       * element. We just remove it.
       * FIXME: Document why we need to remove this
       * As per: http://jsbin.com/sifez/1/edit?js,console,output
       */
      if (marker.previousSibling && nodeHelpers.isEmptyTextNode(marker.previousSibling)) {
        nodeHelpers.removeNode(marker.previousSibling);
      }
    }

    // With MS Edge, ranges that will be converted to selection require
    // to start or end on a text node otherwise when normalizing the text nodes
    // in the selection it won't be correct.

    function setRangeStart(range, marker) {
      const prevSibling = marker.previousSibling;
      const nextSibling = marker.nextSibling;

      if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
        range.setStart(prevSibling, prevSibling.data.length);
      } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        range.setStart(nextSibling, 0);
      } else {
        range.setStartBefore(marker);
      }
    }

    function setRangeEnd(range, marker) {
      const prevSibling = marker.previousSibling;
      const nextSibling = marker.nextSibling;

      if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
        range.setEnd(prevSibling, prevSibling.data.length);
      } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        range.setEnd(nextSibling, 0);
      } else {
        range.setEndAfter(marker);
      }
    }

    /**
     * Wrapper for object holding currently selected text.
     */
    function Selection() {
      this.selection = rootDoc.getSelection();
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
        else if (nodeHelpers.isBefore(endNode, startNode)) {
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

    /**
     * @returns Closest ancestor Node satisfying nodeFilter. Undefined if none exist before reaching Scribe container.
     */
    Selection.prototype.getContaining = function (nodeFilter) {
      const range = this.range;
      if (!range) { return; }

      const node = this.range.commonAncestorContainer;
      return ! (node && scribe.el === node) && nodeFilter(node) ?
        node :
        nodeHelpers.getAncestor(node, scribe.el, nodeFilter);
    };

    Selection.prototype.isInScribe = function () {
      const range = this.range;
      return range
        //we need to ensure that the scribe's element lives within the current document to avoid errors with the range comparison (see below)
        //one way to do this is to check if it's visible (is this the best way?).
        && document.contains(scribe.el)
        //we want to ensure that the current selection is within the current scribe node
        //if this isn't true scribe will place markers within the selections parent
        //we want to ensure that scribe ONLY places markers within it's own element
        && scribe.el.contains(range.startContainer)
        && scribe.el.contains(range.endContainer);
    }

    Selection.prototype.placeMarkers = function () {
      const range = this.range;

      if (!this.isInScribe()) {
        return;
      }

      // insert start marker
      insertMarker(range.cloneRange(), createMarker());

      if (! range.collapsed ) {
        // End marker
        const rangeEnd = range.cloneRange();
        rangeEnd.collapse(false);
        insertMarker(rangeEnd, createMarker());
      }

      this.selection.removeAllRanges();
      this.selection.addRange(range);
    };

    Selection.prototype.getMarkers = function () {
      return scribe.el.querySelectorAll('em.scribe-marker');
    };

    Selection.prototype.removeMarkers = function () {
      Array.prototype.forEach.call(this.getMarkers(), function (marker) {
        const markerParent = marker.parentNode;
        nodeHelpers.removeNode(marker);

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
    Selection.prototype.selectMarkers = function (keepMarkers) {
      const markers = this.getMarkers();
      if (!markers.length) {
        return;
      }

      const newRange = document.createRange();

      setRangeStart(newRange, markers[0]);
      // We always reset the end marker because otherwise it will just
      // use the current range’s end marker.
      setRangeEnd(newRange, markers.length >= 2 ? markers[1] : markers[0]);

      if (! keepMarkers) {
        this.removeMarkers();
      }

      this.selection.removeAllRanges();
      this.selection.addRange(newRange);
    };

    Selection.prototype.isCaretOnNewLine = function () {
      const containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      return !! containerPElement && nodeHelpers.isEmptyInlineElement(containerPElement);
    };

    return Selection;
  };


