# Optimization Methods

Course materials for the optimization methods seminars at HSE University, Faculty of Computer Science: lecture slides, the seminar materials of every teacher, and the interactive atlas

## Repository layout

- `Lecture` — the course lectures by Andrey Ignatov, one file per topic
- `Seminars/<teacher>` — the seminar materials of that teacher, named by topic
- `Seminars/Evgeny Baulin` — my seminars, split into three folders:
  - `web` — one site for all my seminars: the topics are chosen in the sidebar on the left, and each seminar has an interactive page, a theory handout and a cheat sheet, in English and Russian. Open `web/index.html` in a browser; nothing has to be installed
  - `theory` — the LaTeX sources and the PDF of the handout and the cheat sheet of each topic
  - `checks` — one notebook per seminar. It recomputes every number of the materials and writes the data, the figures, the LaTeX values and, for seminar 01, the LaTeX sources of the handout and the cheat sheet
- `Atlas` — the interactive atlas of optimization methods, a separate site. Open `Atlas/index.html`

## Published site

<https://optimization-methods.tarakan-tuc.ru> serves the atlas, and <https://optimization-methods.tarakan-tuc.ru/seminars/> the seminar pages: the landing page with the topics, and each seminar from the end of its class. The handout and cheat-sheet PDFs are not on the site; they are in the `theory` folders of this repository, and the seminar pages show their PDF buttons only when opened from here

The site is published from my Mac by `Deploy/publish.py`, which sends the server only the finished pages listed in `Deploy/publish.conf`; nothing is deployed from GitHub. `Deploy/README.md` describes how it works, the setup of the server and what to do when something goes wrong

## Schedule

- Module 1: 7 weeks
- Module 2: 7 weeks, exams 21–30 December

## Topics by week

1. Optimization as the Foundation of Machine Learning
2. Convexity, Constraints and Optimality Conditions
3. Gradient Descent and Automatic Differentiation
4. Accelerated Gradient Methods
5. Stochastic Optimization and Modern ML Optimizers
6. Second-Order and Quasi-Newton Methods
7. Nonsmooth, Composite and Constrained Optimization
8. Introduction to Discrete Optimization and Mathematical Modelling
9. Linear Programming as the Foundation of Integer Optimization
10. MILP and the Anatomy of Modern Solvers
11. Dynamic Programming and Packing Problems
12. Network Problems and Transportation Optimization
13. Constraint Programming, SAT and CP-SAT
14. Routing, Local Search and Metaheuristics

## Assessment

1. Four homework assignments
2. A colloquium at the end of module 1

## Environment setup

Only the notebooks need Python. The project uses [uv](https://docs.astral.sh/uv/) for Python 3.14, the virtual environment and the dependencies. If `uv --version` fails, install uv and open a new terminal:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

On Windows:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Then run in the repository root:

```bash
uv sync
```

This creates `.venv` with Python 3.14, the packages the notebooks import and `ipykernel`, which the IDE needs as the kernel. `uv.lock` is committed, so the versions are the ones the committed figures and data files were built with, and `requirements.txt` is its export. After `uv lock --upgrade` the versions are newer, and other versions of matplotlib change the bytes of the figures

## Notebooks

Open a notebook in VS Code or Cursor with the Python and Jupyter extensions, or in PyCharm, and select the `.venv` interpreter as the kernel. The notebooks are saved with their outputs, so the tables and the figures are visible without running anything

The notebooks in `Seminars/Evgeny Baulin/checks/` recompute every number of their seminar. When one is run top to bottom, it writes `web/NN/data/seminarNN_data.js` and `web/NN/figures/*.svg` for the page, and `values.tex` and `figures/*.pdf` in `theory/NN. <topic>/`. The seminar 01 notebook also writes the four `.tex` sources of that folder from the content files; they carry a “Do not edit by hand” header. The seminar 02 sources are written by hand. A failed check before the figures stops the notebook before any file is written; the checks that read the web files back run after the export and only report

Without an IDE, open the notebooks in the browser:

```bash
uv run --no-sync --with jupyterlab jupyter lab
```

Rebuilding the outputs from the command line rewrites the notebook and every file it exports under `web/` and `theory/`:

```bash
uv run --no-sync --with nbconvert jupyter nbconvert --to notebook --execute --inplace \
  --ExecutePreprocessor.record_timing=False "Seminars/Evgeny Baulin/checks/<notebook>.ipynb"
```

`--no-sync` keeps the installed versions; without it `uv run` resolves the dependencies again, and other versions of matplotlib change the bytes of the figures. `record_timing=False` keeps wall-clock timestamps out of the cell metadata

## Handouts and cheat sheets

The PDFs are committed, so they only need rebuilding after the notebook has changed the values, a figure or the `.tex` sources it generates. In the topic folder under `theory/`, with TeX Live installed:

```bash
SOURCE_DATE_EPOCH=1767225600 FORCE_SOURCE_DATE=1 \
  latexmk -xelatex -interaction=nonstopmode -halt-on-error Theory_en.tex
```

The same for `Theory_ru`, `Cheatsheet_en` and `Cheatsheet_ru`. The two variables freeze the timestamps inside the PDF, so a rebuild that changes nothing produces the same bytes. Run the notebook once more afterwards: its last checks compare the PDFs with the sources and read `Theory_en.log` for overfull boxes, so leave the auxiliary files in place — `latexmk -c` would take the logs with them, and they are gitignored anyway

## Adding a dependency

```bash
uv add <package>                                                     # updates pyproject.toml and the local uv.lock
uv export --format requirements-txt --no-hashes -o requirements.txt  # refreshes the tracked requirements.txt
```

A package that a notebook imports goes into `pyproject.toml` even if another dependency already installs it

## Licence

MIT, see `LICENSE`, for `Atlas/` and `Seminars/Evgeny Baulin/`. `Lecture/` and the other `Seminars/<teacher>/` folders are the work of their named authors and are not MIT-licensed. The vendored libraries under `web/shared/vendor/` keep their own licences, listed in `VERSIONS.md` next to them
