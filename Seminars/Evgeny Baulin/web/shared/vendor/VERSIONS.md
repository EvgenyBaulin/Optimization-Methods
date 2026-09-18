# Vendored libraries

The seminar pages load these files locally from `web/shared/vendor/` (as `../shared/vendor/…` from `web/NN/`) and make no network requests. Each library was downloaded once, from its official npm tarball. The SHA-256 is that of the tarball; the tarball also matched the `sha512` integrity value published by the npm registry.

| Library  | Version | Source                                                               | SHA-256 of the tarball                                             | License    |
| -------- | ------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| KaTeX    | 0.18.7  | https://registry.npmjs.org/katex/-/katex-0.18.7.tgz                  | `9a80a3fba2367e99bf67b52bfff52e9534c8c7f198e4eaa12699e4f1df9a0bda` | MIT        |
| math.js  | 15.2.0  | https://registry.npmjs.org/mathjs/-/mathjs-15.2.0.tgz                | `cb99d6e259c42193863aea504d694ac3fc6df4753ff126ccf8dcb9c441ce5451` | Apache-2.0 |
| PT Serif | 5.3.0   | https://registry.npmjs.org/@fontsource/pt-serif/-/pt-serif-5.3.0.tgz | `656a3f5ab62846715a6e933a1a850514c6b7aed018de6b0443f1a44ee77d7fd5` | OFL-1.1    |

## What was copied

- `katex/`: `dist/katex.min.js`, `dist/katex.min.css`, every file of `dist/fonts/`, and `LICENSE`. The auto-render extension is not used and not copied.
- `mathjs/`: the UMD browser build `lib/browser/math.js`, its `math.js.LICENSE.txt`, and the package `LICENSE` and `NOTICE`. It is loaded only by the seminar pages `NN/main.html`, which check answers.
- `pt-serif/`: the Fontsource build of PT Serif by ParaType, WOFF2 files of the `latin` and `cyrillic` subsets in regular, italic, bold and bold italic, and `LICENSE` (SIL Open Font License 1.1). The `@font-face` rules are in `shared/css/base.css`, with the unicode ranges of Fontsource's `unicode.json`.

No library file in this folder was modified.
