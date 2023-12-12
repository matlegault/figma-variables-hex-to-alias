"use strict";
console.clear();
// Fetch all local variable collections
const allCollections = figma.variables.getLocalVariableCollections();
// Find the Mode and Colors collections
const modeCollection = allCollections.find(collection => collection.name === 'Mode');
const colorsCollection = allCollections.find(collection => collection.name === 'Colors');
if (!modeCollection || !colorsCollection) {
    figma.notify('Mode or Colors collection not found');
    figma.closePlugin();
}
else {
    // Create a map of hex values to variables in the Colors collection
    const colorsMap = new Map();
    for (let variable of figma.variables.getLocalVariables('COLOR')) {
        if (variable.variableCollectionId === colorsCollection.id) {
            const valuesByMode = variable.valuesByMode;
            for (const key in valuesByMode) {
                const rgba = valuesByMode[key];
                const hex = rgbToHex(rgba);
                colorsMap.set(hex, variable);
            }
        }
    }
    // Iterate over the variables in the Mode collection and replace hex values
    for (let variable of figma.variables.getLocalVariables()) {
        if (variable.variableCollectionId === modeCollection.id) {
            const valuesByMode = variable.valuesByMode;
            for (const key in valuesByMode) {
                const rgba = valuesByMode[key];
                const hex = rgbToHex(rgba);
                const colorVariable = colorsMap.get(hex);
                if (colorVariable) {
                    const alias = figma.variables.createVariableAlias(colorVariable);
                    variable.setValueForMode(key, alias);
                }
            }
        }
    }
}
figma.closePlugin();
function rgbToHex({ r, g, b, a }) {
    const toHex = (value) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    const hex = [toHex(r), toHex(g), toHex(b)].join("");
    return `#${hex}`;
}
