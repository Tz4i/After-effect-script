# After Effects Script — KIWILmao Panel (AE 26 / Beta Fix)

A small After Effects ScriptUI panel for time remapping and quick layer creation.
This fork fixes the layer trimming bug that broke the panel on After Effects 26 / Beta.

## Features

The panel adds four buttons:

- **Adjustment layer** — creates an adjustment layer spanning the selected layer(s).
- **Null layer** — creates a null spanning the selected layer and parents the layer to it.
- **Time remap** — enables time remapping on the selected layer with eased keyframes.
- **1 Framer** — creates a one-frame adjustment layer at the current playhead position.

## What was fixed

On After Effects 26 / Beta, the layer-creating buttons trimmed new layers at the
**start** but not the **end** — the layer would run long past where it should stop.

The cause: the original script positioned layers by setting the `inPoint` property.
On this build, setting `inPoint` **slides the entire layer** (it drags `outPoint`
along by the same amount) rather than trimming the start. So any attempt to trim
the end was immediately undone.

The fix: layers are now anchored using `startTime` and trimmed using `outPoint`
only — the `inPoint` property is never assigned. This trims new layers correctly
at both ends. A few smaller bugs were also fixed along the way (the `alert()`
checks now actually stop execution, and each function references its own layer
variable instead of assuming the new layer is index 1).

## Installation

1. Download `KIWILmao script.jsx` from this repository.
2. Place it in the After Effects `ScriptUI Panels` folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels`
   - **macOS:** `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels`
3. Restart After Effects.
4. Open the panel from the **Window** menu (it appears near the bottom of the list).
5. Dock it wherever you like, or leave it floating.



## Credits

- **Original author:** [KIWILmao](https://github.com/KIWILmao) — created the original script. Discord: `KIWILmao#5223`
- **Fork maintainer:** [Tz4i](https://github.com/Tz4i) — AE 26 / Beta fix and maintenance. Discord: `tz4i`
- Debugging of the trimming fix was done with assistance from Anthropic's Claude.
