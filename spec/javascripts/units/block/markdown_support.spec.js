"use strict";

const utils = require('../../../../src/utils');

describe('Blocks: Markdown support', function() {
  let data, block;

  const createBlock = function (type, data) {
    const element = global.createBaseElement();
    const editor = new SirTrevor.Editor({el: element});
    const options = editor.blockManager.blockOptions;
    const Klass = SirTrevor.Blocks[utils.classify(type)];
    const block = new Klass(data, editor.id, editor.mediator, options, editor.options);

    block.render();
    return block;
  };

  describe('TextBlock', function() {
    beforeEach(function() {
      data = {text: 'test'};
    });

    describe('convertFromMarkdown', function() {
      beforeEach(function() {
        spyOn(SirTrevor.Blocks.Text.prototype, 'toHTML').and.callThrough();
      });

      describe('turned on', function() {
        beforeEach(function() {
          SirTrevor.setDefaults({
            convertFromMarkdown: true,
            convertToMarkdown: false
          });
        });

        it('calls toHtml on objects without format = "html"', function() {
          block = createBlock('Text', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).toHaveBeenCalled();
          expect(serializedData.text).toEqual('<p>test</p>');
        });

        it('doesn\'t call toHtml on objects with format = "html"', function() {
          data.format = 'html';
          block = createBlock('Text', data);
          const serializedData = block.getBlockData();

          expect(serializedData.text).toEqual(data.text);
          expect(block.toHTML).not.toHaveBeenCalled();
        });
      });

      describe('turned off', function() {
        beforeEach(function() {
          SirTrevor.setDefaults({
            convertFromMarkdown: false,
            convertToMarkdown: false
          });
        });

        it('doesn\'t call toHtml', function() {
          block = createBlock('Text', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).not.toHaveBeenCalled();
          expect(serializedData.text).toEqual(data.text);
        });

        it('ignores format value', function() {
          data.format = 'html';

          block = createBlock('Text', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).not.toHaveBeenCalled();
          expect(serializedData.text).toEqual(data.text);
        });
      });
    });
  });

  describe('QuoteBlock', function() {
    let quote;

    beforeEach(function() {
      quote = "Well, what if there is no tomorrow? There wasn't one today";
      data = {text: '> '+quote, cite: 'Phil'};
    });

    describe('convertFromMarkdown', function() {
      beforeEach(function() {
        spyOn(SirTrevor.Blocks.Quote.prototype, 'toHTML').and.callThrough();
      });

      describe('turned on', function() {
        beforeEach(function() {
          SirTrevor.setDefaults({
            convertFromMarkdown: true,
            convertToMarkdown: false
          });
        });

        it('calls toHtml on objects without format = "html"', function() {
          block = createBlock('Quote', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).toHaveBeenCalled();
          expect(serializedData.text).
            toEqual(quote);
        });

        it('doesn\'t call toHtml on objects with format = "html"', function() {
          data.format = 'html';

          block = createBlock('Quote', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).not.toHaveBeenCalled();
          expect(serializedData.text).toEqual(data.text);
        });
      });

      describe('turned off', function() {
        beforeEach(function() {
          SirTrevor.setDefaults({
            convertFromMarkdown: false,
            convertToMarkdown: false
          });
        });

        it('doesn\'t call toHtml', function() {
          block = createBlock('Quote', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).not.toHaveBeenCalled();
          expect(serializedData.text).toEqual(data.text);
        });

        it('ignores format value', function() {
          data.format = 'html';
          block = createBlock('Quote', data);
          const serializedData = block.getBlockData();

          expect(block.toHTML).not.toHaveBeenCalled();
          expect(serializedData.text).toEqual(data.text);
        });
      });
    });
  });
});
