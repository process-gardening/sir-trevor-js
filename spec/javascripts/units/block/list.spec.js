"use strict";

import utils from "../../../../src/utils";

describe('Blocks: List block', function () {
  const createBlock = function (type, data) {
    const element = global.createBaseElement();
    const editor = new SirTrevor.Editor({el: element});
    const options = editor.blockManager.blockOptions;
    const Klass = SirTrevor.Blocks[utils.classify(type)];
    const block = new Klass(data, editor.id, editor.mediator, options);
    editor.blockManager.renderBlock(block);

    return block;
  };

  describe('loading markdown', function() {
    it('can parse data in old format', function() {
      const data = {text: ' - element one\n - element two\n - element three'};
      const block = createBlock('list', data);
      const serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(3);
      expect(serializedData.listItems[0].content).toEqual('element one');
      expect(serializedData.listItems[1].content).toEqual('element two');
      expect(serializedData.listItems[2].content).toEqual('element three');
    });

    it('doesn\'t create empty list element at the end', function() {
      const data = {text: ' - element one\n - element two\n - element three\n'};
      const block = createBlock('list', data);
      const serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(3);
    });

    it('parses markdown styles inside list items', function() {
      const data = {text: ' - hello **bold**\n - hello _italics_'};
      const block = createBlock('list', data);
      const serializedData = block.getBlockData();

      expect(serializedData.listItems[0].content).toEqual('hello <b>bold</b>');
      expect(serializedData.listItems[1].content).toEqual('hello <i>italics</i>');
    });

    it('inits list with single item when empty data', function() {
      const data = {text: ''};
      const block = createBlock('list', data);
      const serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(1);
    });
  });

  describe('loading data', function() {
    it('creates a single list item if data is empty', function() {
      const data = {listItems: [], format: 'html'};
      const block = createBlock('list', data);
      const serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(1);
    });

    it('creates an editor for each list item in data', function() {
      const data = {
        listItems: [
          {content: 'one'},
          {content: 'two'},
          {content: 'three'}
        ],
        format: 'html'
      };
      const block = createBlock('list', data);
      block.getBlockData();

      expect(block.editorIds.length).toEqual(3);
    });
  });

  describe('initialize', function() {
    it('creates a single list item', function() {
      const block = createBlock('list');
      const serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(1);
    });
  });
});
