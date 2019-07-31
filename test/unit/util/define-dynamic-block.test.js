import defineDynamicBlock from '../../../src/lib/define-dynamic-block';

import BlockType from 'scratch-vm/src/extension-support/block-type';

let contextMenuName = '';
let contextMenuDesc = null;

const MockScratchBlocks = {
    OUTPUT_SHAPE_HEXAGONAL: 1,
    OUTPUT_SHAPE_ROUND: 2,
    OUTPUT_SHAPE_SQUARE: 3,
    Extensions: {
        registerMixin: function (name, desc) {
            contextMenuName = name;
            contextMenuDesc = desc;
        }
    }
};

const categoryInfo = {
    name: 'test category',
    color1: '#111',
    color2: '#222',
    color3: '#333'
};

const penIconURI = 'data:image/svg+xml;base64,fake_pen_icon_svg_base64_data';

const testBlockInfo = {
    commandWithIcon: {
        blockIconURI: penIconURI,
        info: {
            blockType: BlockType.COMMAND,
            text: 'command with icon'
        }
    },
    commandWithoutIcon: {
        info: {
            blockType: BlockType.COMMAND,
            text: 'command without icon'
        }
    },
    terminalCommand: {
        info: {
            blockType: BlockType.COMMAND,
            isTerminal: true,
            text: 'terminal command'
        }
    },
    reporter: {
        info: {
            blockType: BlockType.REPORTER,
            text: 'reporter'
        }
    },
    boolean: {
        info: {
            blockType: BlockType.BOOLEAN,
            text: 'Boolean'
        }
    },
    hat: {
        info: {
            blockType: BlockType.HAT,
            text: 'hat'
        }
    },
    blockWithCustomContextMenu: {
        info: {
            blockType: BlockType.COMMAND,
            text: 'block with custom context menu',
            customContextMenu: [{
                text: 'Context Menu Item',
                callback: () => {}
            }]
        }
    }
};

// similar to goog.mixin from the Closure library
const mixin = (target, source) => {
    for (const x in source) {
        target[x] = source[x];
    }
};

class MockBlock {
    constructor (staticBlockInfo, extendedOpcode) {
        // mimic Closure-style inheritance by mixing in `defineDynamicBlock` output as this instance's prototype
        // see also the `Blockly.Block` constructor
        const prototype = defineDynamicBlock(MockScratchBlocks, categoryInfo, staticBlockInfo, extendedOpcode);
        mixin(this, prototype);
        this.init();

        // bootstrap the mutation<->DOM cycle
        this.blockInfoText = JSON.stringify(staticBlockInfo.info);
        const xmlElement = this.mutationToDom();

        // parse blockInfo from XML to fill dynamic properties
        this.domToMutation(xmlElement);
    }

    jsonInit (json) {
        this.result = Object.assign({}, json);
    }
    interpolate_ () {
        // TODO: add tests for this?
    }
    setCheckboxInFlyout (isEnabled) {
        this.result.checkboxInFlyout_ = isEnabled;
    }
    setOutput (isEnabled) {
        this.result.outputConnection = isEnabled; // Blockly calls `makeConnection_` here
    }
    setOutputShape (outputShape) {
        this.result.outputShape_ = outputShape;
    }
    setNextStatement (isEnabled) {
        this.result.nextConnection = isEnabled; // Blockly calls `makeConnection_` here
    }
    setPreviousStatement (isEnabled) {
        this.result.previousConnection = isEnabled; // Blockly calls `makeConnection_` here
    }
}

describe('defineDynamicBlock', () => {
    test('is a function', () => {
        expect(typeof defineDynamicBlock).toBe('function');
    });
    test('can define a command block with an icon', () => {
        const extendedOpcode = 'test.commandWithIcon';
        const block = new MockBlock(testBlockInfo.commandWithIcon, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            extensions: ['scratch_extension'],
            inputsInline: true,
            nextConnection: true,
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_SQUARE,
            previousConnection: true,
            type: extendedOpcode
        });
    });
    test('can define a command block without an icon', () => {
        const extendedOpcode = 'test.commandWithoutIcon';
        const block = new MockBlock(testBlockInfo.commandWithoutIcon, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            // extensions: undefined, // no icon means no extension
            inputsInline: true,
            nextConnection: true,
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_SQUARE,
            previousConnection: true,
            type: extendedOpcode
        });
    });
    test('can define a terminal command', () => {
        const extendedOpcode = 'test.terminal';
        const block = new MockBlock(testBlockInfo.terminalCommand, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            // extensions: undefined, // no icon means no extension
            inputsInline: true,
            nextConnection: false, // terminal
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_SQUARE,
            previousConnection: true,
            type: extendedOpcode
        });
    });
    test('can define a reporter', () => {
        const extendedOpcode = 'test.reporter';
        const block = new MockBlock(testBlockInfo.reporter, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            checkboxInFlyout_: true,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            // extensions: undefined, // no icon means no extension
            inputsInline: true,
            // nextConnection: undefined, // reporter
            outputConnection: true, // reporter
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_ROUND, // reporter
            // previousConnection: undefined, // reporter
            type: extendedOpcode
        });
    });
    test('can define a Boolean', () => {
        const extendedOpcode = 'test.boolean';
        const block = new MockBlock(testBlockInfo.boolean, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            // checkboxInFlyout_: undefined,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            // extensions: undefined, // no icon means no extension
            inputsInline: true,
            // nextConnection: undefined, // reporter
            outputConnection: true, // reporter
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_HEXAGONAL, // Boolean
            // previousConnection: undefined, // reporter
            type: extendedOpcode
        });
    });
    test('can define a hat', () => {
        const extendedOpcode = 'test.hat';
        const block = new MockBlock(testBlockInfo.hat, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            // extensions: undefined, // no icon means no extension
            inputsInline: true,
            nextConnection: true,
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_SQUARE,
            // previousConnection: undefined, // hat
            type: extendedOpcode
        });
    });
    test('can define a block with a custom context menu', () => {
        const extendedOpcode = 'test.blockWithCustomContextMenu';
        const block = new MockBlock(testBlockInfo.blockWithCustomContextMenu, extendedOpcode);
        expect(block.result).toEqual({
            category: categoryInfo.name,
            colour: categoryInfo.color1,
            colourSecondary: categoryInfo.color2,
            colourTertiary: categoryInfo.color3,
            extensions: [`${extendedOpcode}_context_menu`], // custom context menus get extensions
            inputsInline: true,
            nextConnection: true,
            outputShape_: MockScratchBlocks.OUTPUT_SHAPE_SQUARE,
            previousConnection: true,
            type: extendedOpcode
        });
        expect(contextMenuName).toEqual(`${extendedOpcode}_context_menu`);
        const options = [];
        contextMenuDesc.customContextMenu(options);
        expect(options.length).toEqual(1);
        expect(options[0].text).toEqual('Context Menu Item');
        expect(typeof options[0].callback).toEqual('function');
    });

    test('setBlockInfo updates block info', () => {
        const extendedOpcode = 'test.reporter';
        const block = new MockBlock(testBlockInfo.reporter, extendedOpcode);
        const blockInfo = JSON.parse(block.blockInfoText);
        expect(blockInfo.text).toEqual('reporter');

        const newBlockInfo = JSON.parse(JSON.stringify(blockInfo));
        newBlockInfo.text = 'renamedReporter';

        block.setBlockInfo(newBlockInfo);

        const updatedBlockInfo = JSON.parse(block.blockInfoText);
        expect(updatedBlockInfo.text).toEqual('renamedReporter');

    });
});
