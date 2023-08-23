"use strict";

import {vi} from "vitest";

const spyOn = vi.spyOn;
import SirTrevor from "../../../../lib";

describe("Block Mixin: MultiEditable", function() {
  let element, editor, block;
  const tpl = '<div class="st-block__editor"></div>';

  beforeEach(function() {
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({
      el: element,
      blockTypes: ["Text"]
    });

    const options = editor.blockManager.blockOptions;

    SirTrevor.Blocks.MultiBlock = SirTrevor.Block.extend({
      multi_editable: true
    });

    block = new SirTrevor.Blocks.MultiBlock({},
                                                editor.id,
                                                editor.mediator,
                                                options);

    spyOn(block, 'withMixin')
    editor.blockManager.renderBlock(block);
  });

  afterEach(function() {
    delete SirTrevor.Blocks.MultiBlock;
  });

  describe('setup', function() {

    it("gets the multieditable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.MultiEditable);
    });
  });

  describe('managing multiple editors', function() {
    describe('adding', function() {
      it('returns deattached rendered template', function() {
        const editorObj = block.newTextEditor(tpl, '');
        const node = editorObj.node;

        expect(node.nodeType).toEqual(Node.ELEMENT_NODE);
      });

      it('returns variable with editor div', function() {
        const editorObj = block.newTextEditor(tpl, '');
        const editor = editorObj.el;

        expect(editor.nodeType).toEqual(Node.ELEMENT_NODE);
      });

      it('instantiates scribe within template', function() {
        const editorObj = block.newTextEditor(tpl, '');
        const editor = editorObj.el;

        expect(editor.getAttribute("contenteditable")).toEqual('true');
      });

      it('returns scribe instance', function() {
        const editorObj = block.newTextEditor(tpl, '');
        const scribe = editorObj.scribe;

        expect(scribe).toBeDefined();
        expect(scribe.getContent).toBeDefined();
      });

      it('adds editor to the list', function() {
        const editorObj = block.newTextEditor(tpl, '');

        expect(Object.keys(block.editors).length).toEqual(1);
        expect(block.editors[editorObj.id]).toEqual(editorObj);
      });

      it('sets editor content if provided', function() {
        const editorObj = block.newTextEditor(tpl, 'Hello world!');

        expect(editorObj.scribe.getContent()).toEqual('Hello world!');
      });
    });

    describe('removing', function() {
      it('removes editor from the list using the id', function() {
        const editorObj = block.newTextEditor(tpl);
        block.removeTextEditor(editorObj.id);

        expect(Object.keys(block.editors).length).toEqual(0);
        expect(block.editors[editorObj.id]).toBeUndefined();
      });
    });

    describe('getting', function() {
      it('returns currently focused editor', function() {
        // umm :/
      });
      it('returns currently focused scribe instance');
      it('returns editor object using the id', function() {
        const editorObj1 = block.newTextEditor(tpl);
        const editorObj2 = block.newTextEditor(tpl);

        expect(block.getTextEditor(editorObj1.id)).toEqual(editorObj1);
        expect(block.getTextEditor(editorObj2.id)).toEqual(editorObj2);
      });
    });
  });
});

