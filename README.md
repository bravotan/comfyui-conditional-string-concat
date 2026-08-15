# ComfyUI Conditional String Concat

A custom node for [ComfyUI](https://github.com/comfyanonymous/ComfyUI) that concatenates multiple text fields, but only includes the ones whose paired checkbox is enabled.

Useful for building prompts (or any text) out of optional fragments — tags, style modifiers, negative terms, etc. — without having to manually delete/re-type text every time you want to toggle a piece on or off.

## Features

- Multiple `text` + `enable` (boolean) pairs
- Only text from **enabled** slots is included in the output
- Empty text fields are skipped automatically, even if enabled
- Custom separator (default: `, `)
- **Variable number of slots** — use the `+ Add slot` / `- Remove slot` buttons on the node to grow or shrink how many fields are shown
- Slot count is preserved when you save and reload a workflow

## Example

With the following setup:

| Slot | Text | Enabled |
|------|------|---------|
| 1    | `a`  | false   |
| 2    | `2`  | true    |
| 3    | `x`  | false   |
| 4    | `y`  | true    |
| 5    | `z`  | true    |

Output: `2, y, z`

## Installation

### Manual

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/bravotan/comfyui-conditional-string-concat.git
```

Restart ComfyUI afterward.

### ComfyUI Manager

Search for **"Conditional String Concat"** in ComfyUI Manager and install from there.

## Usage

1. Add the **Conditional String Concat** node (found under `utils/string`)
2. Type text into any of the visible slots
3. Toggle each slot's `enable` checkbox to control whether it's included
4. Use the `+ Add slot` / `- Remove slot` buttons to change how many slots are shown (up to 20)
5. Connect the `concatenated` output wherever you'd use a string — e.g. a prompt input

> **Note:** `- Remove slot` only hides the field — it doesn't clear its content. Re-adding the slot will restore whatever text was there. Clear the text manually if you want it gone for good.

## How it works

- The Python side (`__init__.py`) declares a fixed pool of optional inputs (`text1`/`enable1` ... `text20`/`enable20`) and simply joins whichever ones are enabled and non-empty.
- The JavaScript side (`web/`) is a small ComfyUI/LiteGraph.js extension that shows or hides slot widgets based on how many slots you've chosen to display, and persists that count via `onSerialize` / `onConfigure` so it survives saving and reloading a workflow.

## Requirements

No external Python dependencies beyond ComfyUI itself.

## License

MIT
