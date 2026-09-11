# Optimization Methods

Seminar materials for the optimization methods course: notebooks, slides and the interactive atlas

## Repository layout

- Each numbered folder is one seminar; the number is the week it was taught in
- `Atlas` holds the source of the visualization site for optimization methods. Live version:

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

The project uses [uv](https://docs.astral.sh/uv/) to manage the Python version, the virtual environment and the dependencies

### 1. Install uv

If `uv --version` fails, install it first:

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Alternatives: `brew install uv`, `pipx install uv`, `pip install uv`. Restart the shell afterwards so `uv` lands on `PATH`

### 2. Create the virtual environment

Python 3.14 is required; uv downloads it automatically if it is not on the machine:

```bash
uv venv --python 3.14
```

This creates `.venv` in the repository root

### 3. Install the dependencies

```bash
uv pip sync requirements.txt
```

`uv pip sync` makes the environment match the file exactly, removing anything extra. Use `uv pip install -r requirements.txt` instead if you only want to add the packages without pruning

If you have `pyproject.toml` and `uv.lock` locally (they are not tracked in git), the two steps above collapse into one:

```bash
uv sync
```

### 4. Use the environment

```bash
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

Or skip activation entirely and prefix commands with `uv run`:

```bash
uv run python script.py
```

### 5. Run the notebooks

The seminar notebooks need a Jupyter kernel, which is not part of `requirements.txt`:

```bash
uv run --with jupyterlab jupyter lab
```

In VS Code or Cursor, install the kernel into the environment and pick `.venv` as the interpreter:

```bash
uv pip install ipykernel
```

### 6. Update the dependencies

```bash
uv add <package>                                                  # edits pyproject.toml and uv.lock
uv export --format requirements-txt --no-hashes -o requirements.txt   # refresh the tracked file
```
