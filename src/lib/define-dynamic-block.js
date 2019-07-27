// TODO: access `BlockType` and `ArgumentType` without reaching into VM
// Should we move these into a new extension support module or something?
import ArgumentType from 'scratch-vm/src/extension-support/argument-type';
import BlockType from 'scratch-vm/src/extension-support/block-type';
import ContextMenuContext from 'scratch-vm/src/extension-support/context-menu-context';
import log from './log.js';

const setupCustomContextMenu = (guiContext, ScratchBlocks, contextMenuInfo, extendedOpcode) => {
    // Handle custom context menu options
    const customContextMenuForBlock = {
        /**
         * Add any custom context menu options to the dynamic block being defined.
         * See Blockly.Extensions.apply in scratch-blocks/core/extensions.js
         * for how the block becomes `this` behind the scenes.
         * @param {!Array} options List of menu options to add to.
         * @this Blockly.Block
         */
        customContextMenu: function (options) {
            contextMenuInfo.forEach(contextOption => {
                const option = {
                    enabled: true,
                    text: contextOption.text,
                    callback: () => {
                        const blockInfo = JSON.parse(this.blockInfoText);
                        const contextOptionCallbackData = {
                            blockInfo: blockInfo,
                            blockId: this.id
                        };
                        if (contextOption.builtInCallback) {
                            switch (contextOption.builtInCallback) {
                            case 'EDIT_A_PROCEDURE':
                                // TODO FILL THIS IN
                                // E.g. make use of guiContext here to bring up
                                // the edit custom proc modal
                                break;
                            case 'RENAME_A_VARIABLE': {
                                // Extract variable info from this block
                                const varName = blockInfo.text;
                                // TODO it's not great that the following is hard coded...
                                // We could use ScratchBlocks.SCALAR_VARIABLE_TYPE and
                                // ScratchBlocks.LIST_VARIABLE_TYPE here instead, but
                                // given that we eventually want to decouple this code from
                                // using ScratchBlocks variables, we ultimately want these
                                // strings to come from scratch-vm instead
                                const varType = blockInfo.opcode === 'variable' ? '' : 'list';

                                const renameCallback = newName => {
                                    // Pass in additional information about the variable renaming to the
                                    // extension callback
                                    contextOptionCallbackData.newName = newName;
                                    contextOptionCallbackData.varType = varType;
                                    contextOption.callback(contextOptionCallbackData);
                                };

                                // Use scratch-blocks to open the variable rename modal
                                // TODO change this to open the variable prompt directly
                                // from GUI instead of going through scratch-blocks.
                                // Will then need to handle name validation and throw up an alert, etc.
                                const workspace = guiContext.workspace;
                                const variable = workspace.getVariable(varName, varType);
                                ScratchBlocks.Variables.renameVariable(workspace, variable, renameCallback);
                                break;
                            }
                            }
                        } else if (contextOption.callback) {
                            contextOption.callback(contextOptionCallbackData);
                        }
                    }
                };

                // Decide whether to add this item to the context menu
                // based on the context that the block is in and the
                // provided `context` property of the item.
                switch (contextOption.context) {
                case ContextMenuContext.TOOLBOX_ONLY:
                    if (this.isInFlyout) options.push(option);
                    break;
                case ContextMenuContext.WORKSPACE_ONLY:
                    if (!this.isInFlyout) options.push(option);
                    break;
                case ContextMenuContext.ALL:
                default:
                    options.push(option);
                }
            });
        }
    };
    const contextMenuName = `${extendedOpcode}_context_menu`;
    // TODO we need some way of registering a context menu option only once for
    // each block (see try catch below)
    // This is similar to the issue we have with re-registering block definitions.
    // See todo in containers/blocks.jsx, in `handleBlocksInfoUpdate`
    try {
        ScratchBlocks.Extensions.registerMixin(contextMenuName, customContextMenuForBlock);
    } catch (e) {
        log.warn("Context menu callback was already registered, but we're going to ignore this for now");
    }
    return contextMenuName;
};

/**
 * Define a block using extension info which has the ability to dynamically determine (and update) its layout.
 * This functionality is used for extension blocks which can change its properties based on different state
 * information. For example, the `control_stop` block changes its shape based on which menu item is selected
 * and a variable block changes its text to reflect the variable name without using an editable field.
 * @param {object} ScratchBlocks - The ScratchBlocks name space.
 * @param {object} categoryInfo - Information about this block's extension category, including any menus and icons.
 * @param {object} staticBlockInfo - The base block information before any dynamic changes.
 * @param {string} extendedOpcode - The opcode for the block (including the extension ID).
 */
// TODO: grow this until it can fully replace `_convertForScratchBlocks` in the VM runtime
const defineDynamicBlock = (guiContext, ScratchBlocks, categoryInfo, staticBlockInfo, extendedOpcode) => {
    // Set up context menus if any
    const contextMenuInfo = staticBlockInfo.info.customContextMenu;
    const contextMenuName = contextMenuInfo ?
        setupCustomContextMenu(guiContext, ScratchBlocks, staticBlockInfo.info.customContextMenu, extendedOpcode) : '';

    return ({
        init: function () {
            const blockJson = {
                type: extendedOpcode,
                inputsInline: true,
                category: categoryInfo.name,
                colour: categoryInfo.color1,
                colourSecondary: categoryInfo.color2,
                colourTertiary: categoryInfo.color3
            };
            // There is a scratch-blocks / Blockly extension called "scratch_extension" which adjusts the styling of
            // blocks to allow for an icon, a feature of Scratch extension blocks. However, Scratch "core" extension
            // blocks don't have icons and so they should not use 'scratch_extension'. Adding a scratch-blocks / Blockly
            // extension after `jsonInit` isn't fully supported (?), so we decide now whether there will be an icon.
            if (staticBlockInfo.blockIconURI || categoryInfo.blockIconURI) {
                blockJson.extensions = ['scratch_extension'];
            }

            if (contextMenuInfo) {
                blockJson.extensions = blockJson.extensions || [];
                blockJson.extensions.push(contextMenuName);
            }

            // initialize the basics of the block, to be overridden & extended later by `domToMutation`
            this.jsonInit(blockJson);
            // initialize the cached block info used to carry block info from `domToMutation` to `mutationToDom`
            this.blockInfoText = '{}';
            // we need a block info update (through `domToMutation`) before we have a completely initialized block
            this.needsBlockInfoUpdate = true;
            // Keep track of menu info for use in laying out the block and its menus
            this.menus = categoryInfo.convertedMenuInfo;
        },
        mutationToDom: function () {
            const container = document.createElement('mutation');
            container.setAttribute('blockInfo', this.blockInfoText);
            return container;
        },
        domToMutation: function (xmlElement) {
            const blockInfoText = xmlElement.getAttribute('blockInfo');
            if (!blockInfoText) return;
            if (!this.needsBlockInfoUpdate) {
                throw new Error('Attempted to update block info twice');
            }
            delete this.needsBlockInfoUpdate;
            this.blockInfoText = blockInfoText;
            const blockInfo = JSON.parse(blockInfoText);

            // Use the parsed blockInfo to layout the block
            switch (blockInfo.blockType) {
            case BlockType.COMMAND:
            case BlockType.CONDITIONAL:
            case BlockType.LOOP:
                this.setOutputShape(ScratchBlocks.OUTPUT_SHAPE_SQUARE);
                this.setPreviousStatement(true);
                this.setNextStatement(!blockInfo.isTerminal);
                break;
            case BlockType.REPORTER:
                this.setOutput(true);
                this.setOutputShape(ScratchBlocks.OUTPUT_SHAPE_ROUND);
                if (!blockInfo.disableMonitor) {
                    this.setCheckboxInFlyout(true);
                }
                break;
            case BlockType.BOOLEAN:
                this.setOutput(true);
                this.setOutputShape(ScratchBlocks.OUTPUT_SHAPE_HEXAGONAL);
                break;
            case BlockType.HAT:
            case BlockType.EVENT:
                this.setOutputShape(ScratchBlocks.OUTPUT_SHAPE_SQUARE);
                this.setNextStatement(true);
                break;
            }

            if (blockInfo.color1 || blockInfo.color2 || blockInfo.color3) {
                // `setColour` handles undefined parameters by adjusting defined colors
                this.setColour(blockInfo.color1, blockInfo.color2, blockInfo.color3);
            }

            // Layout block arguments
            // TODO handle E/C Blocks
            const blockText = blockInfo.text;
            const args = [];
            let argCount = 0;
            const scratchBlocksStyleText = blockText.replace(/\[(.+?)]/g, (match, argName) => {
                const arg = blockInfo.arguments[argName];
                switch (arg.type) {
                case ArgumentType.STRING:
                    if (arg.menu && !this.menus[arg.menu].acceptReporters) {
                        const options = this.menus[arg.menu].items;
                        args.push({type: 'field_dropdown', name: argName, options: options});
                    } else {
                        args.push({type: 'input_value', name: argName});
                    }
                    break;
                case ArgumentType.NUMBER:
                    args.push({type: 'input_value', name: argName});
                    break;
                case ArgumentType.BOOLEAN:
                    args.push({type: 'input_value', name: argName, check: 'Boolean'});
                    break;
                }
                return `%${++argCount}`;
            });
            const wasRendered = this.rendered;
            this.rendered = false;
            const connectionMap = this.disconnectOldBlocks_();
            this.removeAllInputs_();

            this.interpolate_(scratchBlocksStyleText, args);

            // Interpolate takes care of laying out the base block,
            // now we need to reconnect blocks into the inputs
            // with the same name.
            let inputIndex = -1;
            args.forEach(arg => {
                let type;
                if (arg.type === 'input_value') {
                    inputIndex++;
                    if (arg.check && arg.check === 'boolean') {
                        type = 'b';
                    } else {
                        type = 's';
                    }
                    if (inputIndex < this.inputList.length) {
                        const input = this.inputList[inputIndex];
                        this.populateArgument_(type, inputIndex, connectionMap, input.name, input);
                    }
                }
            });

            // Set values on any args that have selectedValue specified
            args.forEach(arg => {
                if (arg.type === 'field_dropdown' && blockInfo.arguments[arg.name].selectedValue) {
                    const field = this.getField(arg.name);
                    if (field) {
                        field.setValue(blockInfo.arguments[arg.name].selectedValue);
                    }

                }
            });

            this.rendered = wasRendered;
            if (wasRendered && !this.isInsertionMarker()) {
                this.initSvg();
                this.render();
            }
        },
        setBlockInfo: function (blockInfo) {
            this.needsBlockInfoUpdate = true;
            this.blockInfoText = JSON.stringify(blockInfo);
            const mutation = this.mutationToDom();
            this.domToMutation(mutation);
        },
        // Extra functions for dynamically updating the layout of a block and reconnecting
        // inputs and shadow blocks.
        removeAllInputs_: ScratchBlocks.ScratchBlocks.ProcedureUtils.removeAllInputs_,
        disconnectOldBlocks_: ScratchBlocks.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
        deleteShadows_: ScratchBlocks.ScratchBlocks.ProcedureUtils.deleteShadows_,
        populateArgument_: ScratchBlocks.ScratchBlocks.ProcedureUtils.populateArgumentOnCaller_,
        attachShadow_: ScratchBlocks.ScratchBlocks.ProcedureUtils.attachShadow_,
        buildShadowDom_: ScratchBlocks.ScratchBlocks.ProcedureUtils.buildShadowDom_
    });
};

export default defineDynamicBlock;
