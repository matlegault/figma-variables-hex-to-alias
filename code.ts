console.clear();

// Fetch all local variable collections
const allCollections = figma.variables.getLocalVariableCollections();

// Find the collections
const modeCollection = allCollections.find(collection => collection.name === 'Mode'); //Change this to the name of the collection you want to change color hexes to aliases
const colorsCollection = allCollections.find(collection => collection.name === 'Colors'); // Change this to the source of your color primitives, where the aliases will point to

if (!modeCollection || !colorsCollection) {
  figma.notify('One of the collection was not found');
  figma.closePlugin();
} else {
  // Create a map of hex values to variables in the Colors collection
  const colorsMap = new Map();
  for (let variable of figma.variables.getLocalVariables('COLOR')) {
    if (variable.variableCollectionId === colorsCollection.id) {
      const valuesByMode = variable.valuesByMode;
      for (const key in valuesByMode) {
        const rgba = valuesByMode[key] as { r: number; g: number; b: number; a: number };
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
        const rgba = valuesByMode[key] as { r: number; g: number; b: number; a: number };
        const hex = rgbToHex(rgba);
        const colorVariable = colorsMap.get(hex);
        if (colorVariable) {
          const alias = figma.variables.createVariableAlias(colorVariable);
          variable.setValueForMode(key, alias)
        }
      }
    }
  }
}

figma.closePlugin();

function rgbToHex({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}