import observeDomChanges from '../../dom-observer';
import Immutable from 'immutable';

  

  export default function () {
    return function (scribe) {
      const nodeHelpers = scribe.node;

      /**
       * Firefox: Giving focus to a `contenteditable` will place the caret
       * outside of any block elements. Chrome behaves correctly by placing the
       * caret at the  earliest point possible inside the first block element.
       * As per: http://jsbin.com/eLoFOku/1/edit?js,console,output
       *
       * We detect when this occurs and fix it by placing the caret ourselves.
       */
      scribe.el.addEventListener('focus', function placeCaretOnFocus() {
        const selection = new scribe.api.Selection();
        // In Chrome, the range is not created on or before this event loop.
        // It doesn’t matter because this is a fix for Firefox.
        if (selection.range) {

          const isFirefoxBug = scribe.allowsBlockElements() &&
            selection.range.startContainer === scribe.el;

          if (isFirefoxBug) {
            const focusElement = nodeHelpers.firstDeepestChild(scribe.el);

            const range = selection.range;

            range.setStart(focusElement, 0);
            range.setEnd(focusElement, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(range);
          }
        }
      }.bind(scribe));

      /**
       * Apply the formatters when there is a DOM mutation.
       */
      const applyFormatters = function () {
        if (!scribe._skipFormatters) {
          const selection = new scribe.api.Selection();
          const isEditorActive = selection.range;

          const runFormatters = function () {
            if (isEditorActive) {
              selection.placeMarkers();
            }
            scribe.setHTML(scribe._htmlFormatterFactory.format(scribe.getHTML()));
            selection.selectMarkers();
          }.bind(scribe);

          // We only want to wrap the formatting in a transaction if the editor is
          // active. If the DOM is mutated when the editor isn't active (e.g.
          // `scribe.setContent`), we do not want to push to the history. (This
          // happens on the first `focus` event).

          // The previous check is no longer needed, and the above comments are no longer valid.
          // Now `scribe.setContent` updates the content manually, and `scribe.pushHistory`
          // will not detect any changes, and nothing will be push into the history.
          // Any mutations made without `scribe.getContent` will be pushed into the history normally.

          // Pass content through formatters, place caret back
          scribe.transactionManager.run(runFormatters);
        }

        delete scribe._skipFormatters;
      }.bind(scribe);

      observeDomChanges(scribe.el, applyFormatters);

      // TODO: disconnect on tear down:
      // observer.disconnect();

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside a heading to ensure a P element is created.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            const selection = new scribe.api.Selection();
            const range = selection.range;

            const headingNode = selection.getContaining(function (node) {
              return (/^(H[1-6])$/).test(node.nodeName);
            });

            /**
             * If we are at the end of the heading, insert a P. Otherwise handle
             * natively.
             */
            if (headingNode && range.collapsed) {
              const contentToEndRange = range.cloneRange();
              contentToEndRange.setEndAfter(headingNode);

              // Get the content from the range to the end of the heading
              const contentToEndFragment = contentToEndRange.cloneContents();

              if (contentToEndFragment.firstChild.textContent === '') {
                event.preventDefault();

                scribe.transactionManager.run(function () {
                  // Default P
                  // TODO: Abstract somewhere
                  const pNode = document.createElement('p');
                  const brNode = document.createElement('br');
                  pNode.appendChild(brNode);

                  headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);

                  // Re-apply range
                  range.setStart(pNode, 0);
                  range.setEnd(pNode, 0);

                  selection.selection.removeAllRanges();
                  selection.selection.addRange(range);
                });
              }
            }
          }
        });
      }

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside list item nodes.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13 || event.keyCode === 8) { // enter || backspace

            const selection = new scribe.api.Selection();
            const range = selection.range;

            if (range.collapsed) {
              const containerLIElement = selection.getContaining(function (node) {
                return node.nodeName === 'LI';
              });
              if (containerLIElement && containerLIElement.textContent.trim() === '') {
                /**
                 * LIs
                 */

                event.preventDefault();

                const listNode = selection.getContaining(function (node) {
                  return node.nodeName === 'UL' || node.nodeName === 'OL';
                });

                const command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');

                command.event = event;

                command.execute();
              }
            }
          }
        });
      }

      /**
       * We have to hijack the paste event to ensure it uses
       * `scribe.insertHTML`, which executes the Scribe version of the command
       * and also runs the formatters.
       */

      /**
       * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
       * I also don't like how it has the authority to perform `event.preventDefault`.
       */

      scribe.el.addEventListener('paste', function handlePaste(event) {
        /**
         * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
         * will execute the second branch here.
         *
         * Chrome on android provides `ClipboardEvent.clipboardData` but the types array is not filled
         */
        if (event.clipboardData && event.clipboardData.types.length > 0) {
          event.preventDefault();

          if (Immutable.List(event.clipboardData.types).includes('text/html')) {
            scribe.insertHTML(event.clipboardData.getData('text/html'));
          } else {
            scribe.insertPlainText(event.clipboardData.getData('text/plain'));
          }
        } else {
          /**
           * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
           * sequence of events:
           *
           *   - Save the text selection
           *   - Focus another, hidden textarea so we paste there
           *   - Copy the pasted content of said textarea
           *   - Give focus back to the scribe
           *   - Restore the text selection
           *
           * This is required because, without access to the Clipboard API, there is literally
           * no other way to manipulate content on paste.
           * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
           *
           * Firefox <= 21
           * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent.clipboardData
           */
          const selection = new scribe.api.Selection();

          // Store the caret position
          selection.placeMarkers();

          const bin = document.createElement('div');
          bin.style.height = 0;
          bin.style.opacity = 0;
          bin.style.overflow = 'hidden';
          document.body.appendChild(bin);
          bin.setAttribute('contenteditable', true);
          bin.focus();

          // Wait for the paste to happen (next loop?)
          setTimeout(function () {
            const data = bin.innerHTML;
            bin.parentNode.removeChild(bin);

            // Restore the caret position
            selection.selectMarkers();
            /**
             * Firefox 19 (and maybe others): even though the applied range
             * exists within the Scribe instance, we need to focus it.
             */
            scribe.el.focus();

            scribe.insertHTML(data);
          }, 1);
        }
      });

    };
  };
