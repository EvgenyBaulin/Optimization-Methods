# Optimization Atlas

An interactive atlas of optimization methods for a graduate course in data science.
Fifteen minutes of clicking should leave a student with three things about every method:
what it does geometrically, why it exists and what it improves on, and how it breaks.

It is a teaching instrument, not a lecture and not a solver library. There are no proofs
and no filler text. Everything you see is the real algorithm running: the trajectories are
computed live from analytic gradients and Hessians, a method that diverges really diverges,
and the branch and bound tree is built by actually solving each node's relaxation.

## How to open it

Double-click `index.html`. That is the whole procedure.

There is no build step, no package manager, no server and no network access of any kind.
The page works from the `file://` protocol in Chrome, Safari and Firefox, and from any static
web server; the public copy lives at <https://optimization-methods.tarakan-tuc.ru>. No
cookies are set. The browser keeps two small things: the chosen language (`localStorage`, key
`atlas.lang`, and the same value under `om.lang`, the course-wide key of the seminar pages)
and, for the current tab only, the open section (`sessionStorage`, key `atlas.section`).
Everything else, runs, sliders and selections, is discarded when the tab is closed. On the site
the atlas and the seminar pages share one origin and therefore one `localStorage`. Both sides
write the language under both keys, so each opens in the language chosen last, on either side.
The seminar pages read `om.lang` first and fall back to `atlas.lang`.

The **Seminars** button in the top bar leads to the seminar pages of the course. It is an
ordinary link that the reader follows; the atlas itself still loads nothing. On the site it
points to `/seminars/`. Opened from the repository (a double-clicked `index.html`, or a local
server whose root is the repository) it points to `../Seminars/Evgeny Baulin/web/index.html`,
so it needs the whole checkout, not the `Atlas` folder alone. There the link also carries the
current language and theme as `?lang=…&theme=…`, because browsers may keep the storage of local
files apart. `js/ui.js` sets the link's target when the page starts and again after every
switch of the language or the theme; the `href` written in `index.html` is the site's.

The whole atlas is available in English and in Russian: the **EN / RU** switch sits in the top
bar, between the **Seminars** link and the theme button. It changes every text on the page,
including canvas labels, method cards and the messages of runs already in progress, and it
never restarts anything.
Атлас целиком доступен на русском языке: переключатель **EN / RU** находится в верхней панели,
рядом с кнопкой **Семинары**, которая ведёт к страницам семинаров курса.

The layout is designed for 1024 px and wider and degrades acceptably to 768 px. The top bar
stays one row down to 901 px. The subtitle gives way below 1500 px (1720 px in Russian), and
below about 1140 px (about 1275 px in Russian) the six section tabs scroll sideways inside the
bar, while the Seminars link, the language switch and the theme button stay in view. At the
design width of 1024 px this is a known visual cost: the last tab in English, and the last two
or three in Russian, are out of view until the bar is scrolled. That is accepted as it is: the
tabs are not squeezed, although narrower tab padding would bring them back. At 900 px and below
the bar wraps onto more rows.

## What is in it

| Section            | Contents                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. Landscape**   | Contours and a hill-shaded view of seven test functions, with the gradient, the Hessian eigenvalues and the local condition number under the cursor.                                                               |
| **B. Continuous**  | The main playground. Twelve methods from gradient descent to L-BFGS, run together on one landscape, with a convergence chart, theoretical rate overlays, method cards and five presets that break them on purpose. |
| **C. Stochastic**  | A sum of 200 quadratic terms. Eight optimizers from full-batch gradient descent to AdamW, four step-size schedules, the noise ball with its radius predicted exactly, and a saddle that only noise escapes.        |
| **D. Constraints** | Projections onto five feasible sets, Frank–Wolfe, ISTA, FISTA and the subgradient method, a KKT panel with real multipliers, and the L1 sparsity widget.                                                           |
| **E. Discrete**    | Seven independent widgets: linear programming, integrality, branch and bound, dynamic programming, network flow, TSP local search, and constraint propagation.                                                     |
| **F. Cheat sheet** | Every method in one filterable table. Clicking a row opens its widget with a matching setup applied.                                                                                                               |

The address of the atlas always stays clean: `https://optimization-methods.tarakan-tuc.ru`,
never `…/#/C`, `…/index.html` or `…?utm_source=…`, whatever the reader clicks. This concerns the
atlas page alone; the seminar pages under `/seminars/` are separate pages with addresses of
their own. Sections are switched in place; each switch is recorded in the browser history under
the same address, so Back and Forward still step through the sections, and a reload reopens the
section that was open. A first visit opens section A in English.

A link into the atlas may still name a section and a language. Both are read as the page
starts, the language is remembered, and the address is cleaned at once:

- `#/C` opens the stochastic section, `#/C/ru` the same in Russian. Old links of this form keep
  working, and it is the supported format for a deep link from any other page: `/#/D/ru` on
  the site, `…/Atlas/index.html#/D` from the repository. Such a link opens its section even when
  the reader last had another one open. The seminar pages do not use it; their links name no
  section.
- `?lang=en` or `?lang=ru` sets the language alone. The seminar pages add it when they are
  opened from the repository, where the two sides may not share `localStorage`; on the site
  they link to the atlas without any parameters. A language in the hash wins over the query.

## Where it is served

The site is published from the Mac by `Deploy/publish.py` (see `Deploy/README.md`): the atlas at
the root `/`, the seminar pages at `/seminars/`. nginx serves `/var/www/optimization-methods`, a
link to the live release on the server; the PDF handouts are not on the site. Three things there
matter for the atlas:

- `/` is served with `root`, never rewritten to `/Atlas/index.html`: the atlas loads
  `styles.css` and `js/…` relative to itself. `index index.html` must stay, because the atlas
  cleans its own address from `/index.html` to `/`.
- Nothing falls back to `index.html`. Sections live in the page and never reach the server, and
  a fallback would answer a mistyped `/seminars/…` address with the atlas.
- The atlas has no cache-busting, so `*.js` and `*.css` must not get long `expires` times; the
  site sends `Cache-Control: no-cache`.

## Adding a new method

**Adding a method means adding one object to a registry. Nothing else changes.**
The method list, the checkboxes, the colour in every panel, the hyperparameter sliders, the
method card and the cheat-sheet row are all generated from that object.

Continuous methods live in `js/methods.js`:

```js
var L = Atlas.L; // bilingual text: L(english, russian)

Atlas.registerMethod({
  id: "my_method", // unique
  name: L("My method", "Мой метод"),
  color: Atlas.palette.violet, // its colour in every panel of the atlas
  order: 1, // 1 first-order, 2 second-order, 'quasi' quasi-Newton
  tag: L("1st", "1-й"), // short chip in the method list
  uses: ["alpha"], // hyperparameters it reads, keys of Atlas.hyper
  needsHessian: false, // true when create() calls P.hess

  create: function (P, o, x0) {
    // P: {f, grad, hess, n, fstar, optima, L, mu, ...}   o: live hyperparameters
    return {
      x: x0,
      step: function () {
        var g = P.grad(this.x);
        this.x = Atlas.num.axpy(-o.alpha, g, this.x);
        this.info = "alpha = " + o.alpha; // shown in the run table
        return this.x; // the next iterate
      },
    };
  },

  card: {
    requires: L("...", "..."),
    formula: L("...", "..."),
    intuition: L("...", "..."),
    cost: L("...", "..."),
    memory: L("...", "..."),
    rateConvex: L("...", "..."),
    rateStrong: L("...", "..."),
    hyper: L("...", "..."),
    useWhen: L("...", "..."),
    avoidWhen: L("...", "..."),
  },
});
```

A few rules that the framework relies on:

- `step()` returns the next iterate and nothing else. `Atlas.Run` handles NaN, divergence,
  the iteration budget and the convergence test, so a method never has to.
- Set `this.status = 'failed'` with a `this.message` to stop a run deliberately, for example
  when a line search cannot find an acceptable step. Build the message with both languages,
  `this.message = Atlas.L('line search failed', 'линейный поиск не удался')`, so it follows a
  later switch of the language.
- Set `this.rejected = true` when staying at the same point is intentional, as
  Levenberg–Marquardt does when it rejects a trial step and raises the damping. Without it
  the driver would report a stall.
- In `card.formula`, write `&nbsp;` for spaces inside a clause and a plain space only where
  a line break is acceptable. The card wraps between clauses and never inside one.
- If your method needs a hyperparameter that does not exist yet, add it to `Atlas.hyper` in
  `js/core.js`. A slider appears automatically, and only when some registered method
  declares it, so there are never controls without an effect.

**Stochastic methods** (section C) use the same registry with `category: 'stochastic'`, plus
`batchSize(o, n)` returning how many individual gradients one update consumes. The driver
writes `this.lr` before each call, already multiplied by the schedule, and reads `this.used`.

**Constrained and proximal methods** (section D) use `category: 'constrained'` with
`needsSet: true` or `needsProx: true`. The problem object carries the extra operators:
`P.project(x)`, `P.lmo(g)`, `P.prox(x, t)` and `P.gradSmooth(x)`.

## Adding a test function, a feasible set or a widget

**Test functions** go in `js/functions.js` via `Atlas.registerFunction({...})`. Provide the
value, the **analytic** gradient and the **analytic** Hessian, the domain, the known optima
and, where they exist, the global constants `L` and `mu`. Everything else in the atlas reads
those fields: the contour renderer, the "theoretical step 1/L" button, the convergence chart
and the rate overlays.

**Feasible sets** go in `js/functions.js` via `Atlas.registerSet({...})`. A set provides an
exact Euclidean `project`, a linear oracle `lmo` for Frank–Wolfe, a `boundary` polyline to
draw, and its `constraints` with gradients so the KKT panel can build the multipliers.

**Discrete widgets** go in `js/discrete.js` via `Atlas.registerWidget({...})`. Declare the
panes, the controls and the modes; implement `reset`, `step`, `draw` and `status`. The
framework owns the Step, Auto and Reset buttons, the sliders and the redraw loop.

## Languages

English and Russian are written side by side, at the place where each text is defined, so a
translation cannot drift away from the sentence it translates. English is the reference; a
missing Russian text falls back to it. The machinery is `js/i18n.js`, about a hundred and
seventy lines; it also remembers the reader's choice in `localStorage` under `atlas.lang`, and
under `om.lang` for the seminar pages, since the address carries nothing. On the site the
seminar pages share both entries; from the repository they hand the language over as `?lang=`,
which `js/i18n.js` reads before the page is painted.

- **Static markup** in `index.html` holds both languages, and the stylesheet hides the one
  that is not current:
  `<button id="b-run"><span lang="en">Run</span><span lang="ru">Запуск</span></button>`.
  The `lang` attribute is reserved for these pairs. An attribute gets a Russian twin, which
  `i18n.js` swaps in: `<nav aria-label="Sections" data-ru-aria-label="Разделы">`. Only
  `aria-label`, `title` and `placeholder` are swapped. The Seminars link is an example:
  `<a id="seminars-link" title="Seminar pages for every topic of the course"
  data-ru-title="Страницы семинаров по всем темам курса">`; its `href` is not translated but set
  by `js/ui.js`.
- **Text written by code right now** uses `Atlas.t('iteration k', 'итерация k')`, which returns
  a plain string in the current language.
- **Text that is stored and shown later** uses `Atlas.L(english, russian)`: every field of a
  registry entry (names, notes, cards, slider labels and hints) and every message kept in the
  state of a run or a widget. Such a text turns into the current language whenever it is used
  as a string, so it follows a switch without being rebuilt. Call `Atlas.tr(x)` before any
  string method such as `indexOf` or `replace`.
- **Russian plurals** take three forms after a number; `Atlas.ruPlural(n, 'итерация',
  'итерации', 'итераций')` picks one, and the caller chooses the grammatical case.
- **Re-rendering.** A module that writes text subscribes with `Atlas.i18n.onChange(fn)` and
  re-renders it in place. A switch changes words only: runs keep running, sliders, selections
  and widget states stay as they are, and the canvases simply redraw.

Numbers keep the decimal point in both languages, because vectors are printed as `(1.2, 0.8)`.

## Files

```text
index.html          entry point; markup for every section, in both languages
styles.css          all styling; light and dark themes through CSS variables
js/i18n.js          the language switch: Atlas.t, Atlas.L, Atlas.tr, Atlas.ruPlural
js/core.js          numeric helpers, line searches, canvas engine, contour renderer,
                    convergence chart, animation loop, run drivers, slider widget
js/functions.js     test functions, the stochastic dataset, feasible sets
js/methods.js       all 25 continuous, stochastic and constrained methods
js/discrete.js      the widget framework and the seven discrete widgets
js/cheatsheet.js    section F, generated from the registries above
js/ui.js            tabs, theme, language switch, the link to the seminar pages, controls,
                    sections A to D, wiring
```

Scripts are plain classic `<script>` tags, deliberately not ES modules, because
`type="module"` is blocked by the same-origin policy under `file://`. Everything public
hangs off the single global `window.Atlas`. `js/i18n.js` alone is loaded in `<head>`, so the
language is set before the page is first painted.

## How the numbers are kept honest

- Every gradient and Hessian is hand-derived and checked against central differences.
- The condition-number, `L` and `mu` values shown in the interface are the exact constants
  where they exist, and are labelled as local estimates where they do not.
- The noise ball in section C is not only measured. Because every term of the sum shares the
  same curvature, the stationary covariance solves a discrete Lyapunov equation, which the
  atlas solves exactly; the drawn prediction and the measured cloud agree to about one part
  in a hundred.
- `f*` in section D comes from a high-accuracy reference solve, and the chart says so.
- Rate overlays are anchored at the initial gap and are labelled as shapes, not as certified
  bounds, because only one of them is a genuine bound.
- All randomness is seeded, so a demonstration looks the same every time and two optimizers
  race on identical data. There are no calls to `Math.random`.

## Colour

Method colours come from a colour-blind-safe qualitative palette and never pair red against
green. A method keeps its colour in every panel. Landscapes use viridis, equalised by rank
so that a function with a huge range does not collapse into one flat block of colour. Light
and dark themes are driven by CSS variables that the canvas code reads too, so the plots
follow the page.
