import Immutable from 'immutable';

  /**
   * If the paragraphs option is set to true, then when the list is
   * unapplied, ensure that we enter a P element.
   */

  

  export default function () {
    return function (scribe) {
        const nodeHelpers = scribe.node;

        const InsertListCommand = function (commandName) {
            scribe.api.Command.call(this, commandName);
        };

        InsertListCommand.prototype = Object.create(scribe.api.Command.prototype);
      InsertListCommand.prototype.constructor = InsertListCommand;

      InsertListCommand.prototype.execute = function (value) {
        function splitList(listItemElements) {
          if (!!listItemElements.size) {
              const newListNode = document.createElement(listNode.nodeName);

              while (!!listItemElements.size) {
              newListNode.appendChild(listItemElements.first());
              listItemElements = listItemElements.shift();
            }

            listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
          }
        }

        if (this.queryState()) {
            const selection = new scribe.api.Selection();
            const range = selection.range;

            let listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

            const listItemElement = selection.getContaining(function (node) {
                return node.nodeName === 'LI';
            });

            scribe.transactionManager.run(function () {
            if (listItemElement) {
                const nextListItemElements = nodeHelpers.nextSiblings(listItemElement);

                /**
               * If we are not at the start or end of a UL/OL, we have to
               * split the node and insert the P(s) in the middle.
               */
              splitList(nextListItemElements);

              /**
               * Insert a paragraph in place of the list item.
               */

              selection.placeMarkers();

                const pNode = document.createElement('p');
                pNode.innerHTML = listItemElement.innerHTML;

              listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
              listItemElement.parentNode.removeChild(listItemElement);
            } else {
                /**
                 * When multiple list items are selected, we replace each list
                 * item with a paragraph.
                 */
                const selectedListItemElements = Immutable.List(listNode.querySelectorAll('li'))
                    .filter(function (listItemElement) {
                        return range.intersectsNode(listItemElement);
                    });
                const lastSelectedListItemElement = selectedListItemElements.last();
                const listItemElementsAfterSelection = nodeHelpers.nextSiblings(lastSelectedListItemElement);

                /**
               * If we are not at the start or end of a UL/OL, we have to
               * split the node and insert the P(s) in the middle.
               */
              splitList(listItemElementsAfterSelection);

              // Store the caret/range positioning inside of the list items so
              // we can restore it from the newly created P elements soon
              // afterwards.
              selection.placeMarkers();

                const documentFragment = document.createDocumentFragment();
                selectedListItemElements.forEach(function (listItemElement) {
                  const pElement = document.createElement('p');
                  pElement.innerHTML = listItemElement.innerHTML;
                documentFragment.appendChild(pElement);
              });

              // Insert the Ps
              listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling);

              // Remove the LIs
              selectedListItemElements.forEach(function (listItemElement) {
                listItemElement.parentNode.removeChild(listItemElement);
              });
            }

            // If the list is now empty, clean it up.
            if (listNode.childNodes.length === 0) {
              listNode.parentNode.removeChild(listNode);
            }

            selection.selectMarkers();
          }.bind(this));
        } else {
          scribe.api.Command.prototype.execute.call(this, value);
        }
      };

      InsertListCommand.prototype.queryEnabled = function () {
        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements();
      };

      scribe.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
      scribe.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');
    };
  };


