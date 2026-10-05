# Vendored libraries

The seminar pages load these files locally from `web/shared/vendor/` (as `../shared/vendor/…` from `web/NN/`, `../../shared/vendor/…` from its `theory/` and `cheatsheet/`) and make no network requests. Each library was downloaded once, from its official npm tarball. The SHA-256 is that of the tarball; the tarball also matched the `sha512` integrity value published by the npm registry.

| Library  | Version | Source                                                               | SHA-256 of the tarball                                             | License    |
| -------- | ------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| KaTeX    | 0.18.7  | https://registry.npmjs.org/katex/-/katex-0.18.7.tgz                  | `9a80a3fba2367e99bf67b52bfff52e9534c8c7f198e4eaa12699e4f1df9a0bda` | MIT        |
| CodeMirror | 5.65.21 | https://registry.npmjs.org/codemirror/-/codemirror-5.65.21.tgz      | `b26d9d7ae0f42e34b44a8f7667d29a3ab0d3df88d0e79c0dad39dc03ba43f6dc` | MIT        |
| math.js  | 15.2.0  | https://registry.npmjs.org/mathjs/-/mathjs-15.2.0.tgz                | `cb99d6e259c42193863aea504d694ac3fc6df4753ff126ccf8dcb9c441ce5451` | Apache-2.0 |
| PT Serif | 5.3.0   | https://registry.npmjs.org/@fontsource/pt-serif/-/pt-serif-5.3.0.tgz | `656a3f5ab62846715a6e933a1a850514c6b7aed018de6b0443f1a44ee77d7fd5` | OFL-1.1    |
| Pyodide  | 0.27.7  | https://cdn.jsdelivr.net/pyodide/v0.27.7/full/                       | per file, in `pyodide/pyodide-lock.json` (wheels) and below (core) | MPL-2.0    |

## What was copied

- `codemirror/`: `lib/codemirror.js`, `lib/codemirror.css`, `mode/python/python.js`, `addon/runmode/runmode.js` and `LICENSE`. The editor of the live code cells (seminar 4) and the Python highlighting of the read-only code blocks (seminars 1 and 2); the colours are in `shared/css/components.css`.
- `katex/`: `dist/katex.min.js`, `dist/katex.min.css`, every file of `dist/fonts/`, and `LICENSE`. The auto-render extension is not used and not copied.
- `mathjs/`: the UMD browser build `lib/browser/math.js`, its `math.js.LICENSE.txt`, and the package `LICENSE` and `NOTICE`. It is loaded only by the seminar pages `NN/index.html`, which check answers.
- `pt-serif/`: the Fontsource build of PT Serif by ParaType, WOFF2 files of the `latin` and `cyrillic` subsets in regular, italic, bold and bold italic, and `LICENSE` (SIL Open Font License 1.1). The `@font-face` rules are in `shared/css/base.css`, with the unicode ranges of Fontsource's `unicode.json`.

- `pyodide/`: Python 3.12 compiled to WebAssembly, loaded by `shared/js/livecode.js` only when a live code cell is run, and only over http(s). The core files of the full distribution, with their SHA-256:
  - `pyodide.js`: `b4cb23a53aba19c221659b9fb40a2f18281d685691dc06647fb0afd0681baf98`
  - `pyodide.asm.js`: `6b4c90de5b7172873f04f21884d0e9d2274e305fe32116558fe3e4fbe3618d51`
  - `pyodide.asm.wasm`: `a50dd1843f805a0b7c45b61037ee0d7b26dfe85efe0e18ef95a34ad24e401f5f`
  - `python_stdlib.bin`: `16611534726e5d8ac2bd8f926410b2dcb8d6f49aa24913463533b457a2115c16`
  - `pyodide-lock.json`: `9c45b916001a750f4102fc287494f3eab215909c7535c626a20db80fd6333e2c`

  and the wheels of NumPy, Matplotlib and their dependencies (contourpy, cycler, fonttools, kiwisolver, matplotlib-pyodide, packaging, pillow, pyparsing, python-dateutil, pytz, six), each matching the `sha256` that `pyodide-lock.json` lists for it, which Pyodide checks again when it loads a wheel. `python_stdlib.zip` is renamed `python_stdlib.bin` (same bytes), because the site's server refuses `.zip`; `livecode.js` passes it as `stdLibURL`. `LICENSE` is the Pyodide licence from its repository at tag 0.27.7.

No library file in this folder was modified.
