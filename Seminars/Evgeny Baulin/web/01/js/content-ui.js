// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 01 content: the interface strings of this seminar (titles, widgets), in English and Russian.
// Strict JSON between the markers. Placeholders in {braces} are filled by the page. They take precedence over
// the course-wide strings in shared/js/content-common.js.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "seminar": {
  "meta": {
   "seminarLabel": {
    "en": "Seminar 01",
    "ru": "Семинар 1"
   },
   "seminarTitle": {
    "en": "Optimization as the Foundation of Machine Learning",
    "ru": "Оптимизация как основа машинного обучения"
   },
   "pageTitle": {
    "main": {
     "en": "Seminar 01: Optimization as the Foundation of Machine Learning",
     "ru": "Семинар 1: оптимизация как основа машинного обучения"
    },
    "theory": {
     "en": "Seminar 01 theory handout",
     "ru": "Семинар 1: конспект теории"
    },
    "cheatsheet": {
     "en": "Seminar 01 cheat sheet",
     "ru": "Семинар 1: шпаргалка"
    }
   }
  },
  "blocks": {
   "ownNote": {
    "en": "Solve both problems on paper. Hints open one level at a time; a solution opens after your first answer.",
    "ru": "Решите обе задачи на бумаге. Подсказки открываются по одной; решение откроется после первого ответа."
   },
   "ownNoteThree": {
    "en": "Solve the three problems on paper, in order: B4 is quick once B3 is done. Hints open one level at a time; a solution opens after your first answer.",
    "ru": "Решите три задачи на бумаге по порядку: после B3 задача B4 решается быстро. Подсказки открываются по одной; решение откроется после первого ответа."
   },
   "ownNoteOne": {
    "en": "Solve the problem on paper. Hints open one level at a time; the solution opens after your first answer.",
    "ru": "Решите задачу на бумаге. Подсказки открываются по одной; решение откроется после первого ответа."
   },
   "cutB": {
    "en": "Running late: on the board, write only the answer lines of B1 ({time}). Never skip B3: it is the point of the block.",
    "ru": "Если не успеваем: у доски запишите только строки ответа B1 ({time}). B3 не пропускайте никогда: в ней смысл блока."
   },
   "cutC": {
    "en": "Running late: write the proof of C1 as the norm chain with a reason on each step, without the generalizations ({time}).",
    "ru": "Если не успеваем: запишите доказательство C1 как цепочку для нормы с обоснованием каждого шага, без обобщений ({time})."
   },
   "cutD": {
    "en": "Running late: move D2 together with its review to the home practice. Never skip D1.",
    "ru": "Если не успеваем: перенесите D2 вместе с разбором в домашнюю практику. D1 не пропускайте никогда."
   },
   "reviewB": {
    "en": "Review B3 first and in full, with the case split; for B2 and B4 give the answers only.",
    "ru": "Сначала разберите B3 полностью, с перебором случаев; для B2 и B4 — только ответы."
   }
  },
  "problem": {
   "checkRef": {
    "en": "Verified in “checks/01. Optimization as the Foundation of Machine Learning.ipynb”: the checks named “{id}: …”",
    "ru": "Проверено в «checks/01. Optimization as the Foundation of Machine Learning.ipynb»: проверки с названиями «{id}: …»"
   }
  },
  "pages": {
   "convention": {
    "en": "Notation and conventions",
    "ru": "Обозначения и соглашения"
   }
  },
  "widgets": {
   "hook": {
    "bowl": {
     "en": "Bowl: $f = {{hook.bowl.tex.f}}$",
     "ru": "Чаша: $f = {{hook.bowl.tex.f}}$"
    },
    "saddle": {
     "en": "Saddle: $f = {{hook.saddle.tex.f}}$",
     "ru": "Седло: $f = {{hook.saddle.tex.f}}$"
    },
    "slice": {
     "en": "A one-dimensional slice $g(t)$",
     "ru": "Одномерный срез $g(t)$"
    },
    "ariaBowl": {
     "en": "Contours of the bowl with level values and the marked point p1",
     "ru": "Линии уровня чаши с подписанными значениями и отмеченная точка p1"
    },
    "ariaSaddle": {
     "en": "Contours of the saddle with level values and the marked point p2",
     "ru": "Линии уровня седла с подписанными значениями и отмеченная точка p2"
    },
    "ariaSlice": {
     "en": "The graph of g with the marked points p3, p4 and p5",
     "ru": "График g и отмеченные точки p3, p4 и p5"
    },
    "p1": {
     "en": "$p_1$",
     "ru": "$p_1$"
    },
    "p2": {
     "en": "$p_2$",
     "ru": "$p_2$"
    },
    "p3": {
     "en": "$p_3$",
     "ru": "$p_3$"
    },
    "p4": {
     "en": "$p_4$",
     "ru": "$p_4$"
    },
    "p5": {
     "en": "$p_5$",
     "ru": "$p_5$"
    },
    "grad": {
     "en": "$\\nabla f = {vec}$ at $x = {x}$",
     "ru": "$\\nabla f = {vec}$ в точке $x = {x}$"
    },
    "hess": {
     "en": "$H = {mat}$, eigenvalues ${l1}$ and ${l2}$",
     "ru": "$H = {mat}$, собственные значения ${l1}$ и ${l2}$"
    },
    "slope": {
     "en": "$g'(t) = {d1}$ at $t = {t}$, $g(t) = {g}$",
     "ru": "$g'(t) = {d1}$ при $t = {t}$, $g(t) = {g}$"
    },
    "curv": {
     "en": "$g''(t) = {d2}$",
     "ru": "$g''(t) = {d2}$"
    },
    "hidden": {
     "en": "Make a prediction, then show the answer.",
     "ru": "Сделайте прогноз, затем покажите ответ."
    },
    "kindMin": {
     "en": "A local minimum.",
     "ru": "Локальный минимум."
    },
    "kindMax": {
     "en": "A local maximum.",
     "ru": "Локальный максимум."
    },
    "kindSaddle": {
     "en": "A saddle: neither a minimum nor a maximum.",
     "ru": "Седло: ни минимум, ни максимум."
    },
    "kindGlobal": {
     "en": "The global minimum of the slice.",
     "ru": "Глобальный минимум среза."
    },
    "kindGlobalBowl": {
     "en": "It is also the global minimum of the bowl: $f \\ge 0 = f(p_1)$.",
     "ru": "Это и глобальный минимум чаши: $f \\ge 0 = f(p_1)$."
    },
    "all": {
     "en": "All five: {list}.",
     "ru": "Все пять точек: {list}."
    },
    "short": {
     "min": {
      "en": "minimum",
      "ru": "минимум"
     },
     "max": {
      "en": "maximum",
      "ru": "максимум"
     },
     "saddle": {
      "en": "saddle",
      "ru": "седло"
     }
    }
   },
   "probe": {
    "aria": {
     "en": "Contours of the lecture function, the region where the Hessian is positive semidefinite, the probe point and the gradient arrow",
     "ru": "Линии уровня функции из лекции, область, где гессиан положительно полуопределён, точка-зонд и стрелка градиента"
    },
    "lecture": {
     "en": "Lecture point",
     "ru": "Точка из лекции"
    },
    "origin": {
     "en": "Origin",
     "ru": "Начало координат"
    },
    "x": {
     "en": "$x = {vec}$, $f(x) = {f}$",
     "ru": "$x = {vec}$, $f(x) = {f}$"
    },
    "grad": {
     "en": "$\\nabla f(x) = {vec}$",
     "ru": "$\\nabla f(x) = {vec}$"
    },
    "hess": {
     "en": "$H(x) = {mat}$",
     "ru": "$H(x) = {mat}$"
    },
    "det": {
     "en": "$\\det H = {det}$, eigenvalues ${l1}$ and ${l2}$",
     "ru": "$\\det H = {det}$, собственные значения ${l1}$ и ${l2}$"
    },
    "notStationary": {
     "en": "$\\nabla f \\ne 0$: not a stationary point, so $H$ says nothing about optimality here.",
     "ru": "$\\nabla f \\ne 0$: точка не стационарна, поэтому $H$ ничего не говорит об оптимальности."
    },
    "stationary": {
     "en": "$\\nabla f = 0$: a stationary point with a singular semidefinite $H$, so the second-order test is silent.",
     "ru": "$\\nabla f = 0$: стационарная точка с вырожденным полуопределённым $H$, тест второго порядка молчит."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or drag the probe.",
     "ru": "Сделайте прогноз, затем покажите ответ или потяните зонд."
    },
    "legend": {
     "en": "Shaded: $H(x) \\succeq 0$. Arrow: $\\nabla f(x)$, shortened for display.",
     "ru": "Закрашено: $H(x) \\succeq 0$. Стрелка: $\\nabla f(x)$, укороченная для наглядности."
    },
    "a2": {
     "en": "A2 point",
     "ru": "Точка из A2"
    }
   },
   "definiteness": {
    "aria": {
     "en": "The plane coloured by the sign of the quadratic form, its zero lines and the eigenvectors",
     "ru": "Плоскость, раскрашенная по знаку квадратичной формы, её нулевые прямые и собственные векторы"
    },
    "trapNeg": {
     "en": "$\\operatorname{diag}(0, -1)$",
     "ru": "$\\operatorname{diag}(0, -1)$"
    },
    "trapPos": {
     "en": "$\\operatorname{diag}(0, 1)$",
     "ru": "$\\operatorname{diag}(0, 1)$"
    },
    "bowl": {
     "en": "B1",
     "ru": "B1"
    },
    "saddle": {
     "en": "B2",
     "ru": "B2"
    },
    "family": {
     "en": "C2",
     "ru": "C2"
    },
    "h11": {
     "en": "$H_{11}$",
     "ru": "$H_{11}$"
    },
    "h12": {
     "en": "$H_{12} = H_{21}$",
     "ru": "$H_{12} = H_{21}$"
    },
    "h22": {
     "en": "$H_{22}$",
     "ru": "$H_{22}$"
    },
    "matrix": {
     "en": "$H = {mat}$",
     "ru": "$H = {mat}$"
    },
    "leading": {
     "en": "Leading minors: $\\Delta_1 = {d1}$, $\\Delta_2 = {d2}$",
     "ru": "Угловые миноры: $\\Delta_1 = {d1}$, $\\Delta_2 = {d2}$"
    },
    "principal": {
     "en": "All principal minors: $H_{11} = {a}$, $H_{22} = {d}$, $\\det H = {det}$",
     "ru": "Все главные миноры: $H_{11} = {a}$, $H_{22} = {d}$, $\\det H = {det}$"
    },
    "eig": {
     "en": "Eigenvalues: ${l1}$ and ${l2}$",
     "ru": "Собственные значения: ${l1}$ и ${l2}$"
    },
    "sylPd": {
     "en": "Sylvester: $\\Delta_k > 0$ for all $k$, so $H \\succ 0$.",
     "ru": "Сильвестр: $\\Delta_k > 0$ для всех $k$, значит, $H \\succ 0$."
    },
    "sylNd": {
     "en": "Sylvester: the signs alternate starting with minus, so $H \\prec 0$.",
     "ru": "Сильвестр: знаки чередуются, начиная с минуса, значит, $H \\prec 0$."
    },
    "sylSilent": {
     "en": "Sylvester is silent: neither pattern holds.",
     "ru": "Сильвестр молчит: ни один из шаблонов не выполнен."
    },
    "clsPd": {
     "en": "Eigenvalues: positive definite.",
     "ru": "По собственным значениям: положительно определена."
    },
    "clsPsd": {
     "en": "Eigenvalues: positive semidefinite, not definite.",
     "ru": "По собственным значениям: положительно полуопределена, но не положительно определена."
    },
    "clsNd": {
     "en": "Eigenvalues: negative definite.",
     "ru": "По собственным значениям: отрицательно определена."
    },
    "clsNsd": {
     "en": "Eigenvalues: negative semidefinite, not definite.",
     "ru": "По собственным значениям: отрицательно полуопределена, но не отрицательно определена."
    },
    "clsIndefinite": {
     "en": "Eigenvalues: indefinite.",
     "ru": "По собственным значениям: знаконеопределена."
    },
    "clsZero": {
     "en": "Eigenvalues: the zero matrix, semidefinite both ways.",
     "ru": "По собственным значениям: нулевая матрица, одновременно положительно и отрицательно полуопределена."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or move a slider.",
     "ru": "Сделайте прогноз, затем покажите ответ или сдвиньте ползунок."
    },
    "legend": {
     "en": "Green: $h^\\top H h > 0$. Red: $h^\\top H h < 0$. Lines: $h^\\top H h = 0$. Arrows: eigenvectors scaled by $|\\lambda|$.",
     "ru": "Зелёным: $h^\\top H h > 0$. Красным: $h^\\top H h < 0$. Прямые: $h^\\top H h = 0$. Стрелки: собственные векторы, растянутые пропорционально $|\\lambda|$."
    }
   },
   "lines": {
    "ariaMap": {
     "en": "Contours of the function, its sign regions and the line through the origin",
     "ru": "Линии уровня функции, области её знака и прямая через начало координат"
    },
    "ariaSlice": {
     "en": "The function along the line",
     "ru": "Функция вдоль прямой"
    },
    "bowl": {
     "en": "B1: ${{B1.tex.f}}$",
     "ru": "B1: ${{B1.tex.f}}$"
    },
    "saddle": {
     "en": "B2: ${{B2.tex.f}}$",
     "ru": "B2: ${{B2.tex.f}}$"
    },
    "monkey": {
     "en": "B3: ${{B3.tex.f}}$",
     "ru": "B3: ${{B3.tex.f}}$"
    },
    "quartic": {
     "en": "B4: ${{B4.tex.f}}$",
     "ru": "B4: ${{B4.tex.f}}$"
    },
    "angle": {
     "en": "Angle $\\theta$",
     "ru": "Угол $\\theta$"
    },
    "phi": {
     "en": "$\\varphi(t) = {c}t^{k}$",
     "ru": "$\\varphi(t) = {c}t^{k}$"
    },
    "data": {
     "en": "At the origin: $\\nabla f = (0,\\ 0)$, $H = {mat}$",
     "ru": "В начале координат: $\\nabla f = (0;\\ 0)$, $H = {mat}$"
    },
    "testMin": {
     "en": "Second-order test: $H \\succ 0$, a strict local minimum.",
     "ru": "Тест второго порядка: $H \\succ 0$, строгий локальный минимум."
    },
    "testSaddle": {
     "en": "Second-order test: $H$ is indefinite, a saddle.",
     "ru": "Тест второго порядка: $H$ знаконеопределён, седло."
    },
    "testSilent": {
     "en": "Second-order test: $H = 0$, silent.",
     "ru": "Тест второго порядка: $H = 0$, молчит."
    },
    "changes": {
     "en": "$\\varphi$ changes sign at $t = 0$: the origin is not an extremum.",
     "ru": "$\\varphi$ меняет знак при $t = 0$: начало координат — не экстремум."
    },
    "pos": {
     "en": "$\\varphi(t) > 0$ for $t \\ne 0$ on this line; other lines still matter.",
     "ru": "$\\varphi(t) > 0$ при $t \\ne 0$ на этой прямой, но важны и остальные прямые."
    },
    "neg": {
     "en": "$\\varphi(t) < 0$ for $t \\ne 0$ on this line; other lines still matter.",
     "ru": "$\\varphi(t) < 0$ при $t \\ne 0$ на этой прямой, но важны и остальные прямые."
    },
    "zero": {
     "en": "$\\varphi \\equiv 0$ on this line: it settles nothing.",
     "ru": "$\\varphi \\equiv 0$ на этой прямой: она ничего не решает."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or turn the line.",
     "ru": "Сделайте прогноз, затем покажите ответ или поверните прямую."
    },
    "legend": {
     "en": "Green: $f > 0$. Red: $f < 0$. The line is $t \\mapsto t\\,(\\cos\\theta, \\sin\\theta)$.",
     "ru": "Зелёным: $f > 0$. Красным: $f < 0$. Прямая: $t \\mapsto t\\,(\\cos\\theta;\\ \\sin\\theta)$."
    }
   },
   "convexSets": {
    "aria": {
     "en": "The set, the points p and q, the segment between them and the point z",
     "ru": "Множество, точки p и q, отрезок между ними и точка z"
    },
    "disk": {
     "en": "Disk",
     "ru": "Круг"
    },
    "diamond": {
     "en": "$\\ell_1$ diamond",
     "ru": "Ромб $\\ell_1$"
    },
    "square": {
     "en": "$\\ell_\\infty$ square",
     "ru": "Квадрат $\\ell_\\infty$"
    },
    "ring": {
     "en": "Ring",
     "ru": "Кольцо"
    },
    "lambda": {
     "en": "$\\lambda$",
     "ru": "$\\lambda$"
    },
    "points": {
     "en": "$p = {p}$, $q = {q}$, $z = {z}$",
     "ru": "$p = {p}$, $q = {q}$, $z = {z}$"
    },
    "outside": {
     "en": "Put both points inside the set.",
     "ru": "Поставьте обе точки внутрь множества."
    },
    "leaves": {
     "en": "The segment leaves the set: the set is not convex.",
     "ru": "Отрезок выходит из множества: множество не выпукло."
    },
    "stays": {
     "en": "The segment stays in the set. One segment proves nothing.",
     "ru": "Отрезок остаётся в множестве. Один отрезок ничего не доказывает."
    },
    "chain": {
     "en": "$\\|z\\|_{n} = {nz} \\le \\lambda\\|p\\|_{n} + (1 - \\lambda)\\|q\\|_{n} = {rhs}$",
     "ru": "$\\|z\\|_{n} = {nz} \\le \\lambda\\|p\\|_{n} + (1 - \\lambda)\\|q\\|_{n} = {rhs}$"
    },
    "hole": {
     "en": "$\\|z\\|_2 = {nz} < {{C.sets.ring.1}}$: $z$ is in the hole.",
     "ru": "$\\|z\\|_2 = {nz} < {{C.sets.ring.1}}$: $z$ попала в дыру."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or drag a point.",
     "ru": "Сделайте прогноз, затем покажите ответ или потяните точку."
    }
   },
   "family": {
    "aria": {
     "en": "Contours of the quadratic family with the eigen-directions of its Hessian",
     "ru": "Линии уровня семейства квадратичных функций и собственные направления гессиана"
    },
    "a": {
     "en": "Parameter $a$",
     "ru": "Параметр $a$"
    },
    "markA1": {
     "en": "A1",
     "ru": "A1"
    },
    "markC2": {
     "en": "C2",
     "ru": "C2"
    },
    "H": {
     "en": "$H_a = {mat}$",
     "ru": "$H_a = {mat}$"
    },
    "eig": {
     "en": "$2 + a = {l1}$, $2 - a = {l2}$",
     "ru": "$2 + a = {l1}$, $2 - a = {l2}$"
    },
    "strict": {
     "en": "Both eigenvalues are positive: strictly convex, the origin is the unique minimizer.",
     "ru": "Оба собственных значения положительны: строго выпукла, начало координат — единственная точка минимума."
    },
    "edge": {
     "en": "One eigenvalue is zero: convex but not strictly, a whole line of minimizers.",
     "ru": "Одно собственное значение равно нулю: выпукла, но не строго, точки минимума заполняют целую прямую."
    },
    "nonconvex": {
     "en": "The eigenvalues have opposite signs: not convex, and $f_a$ is unbounded below.",
     "ru": "Собственные значения разных знаков: не выпукла, и $f_a$ не ограничена снизу."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or move the slider.",
     "ru": "Сделайте прогноз, затем покажите ответ или сдвиньте ползунок."
    }
   },
   "feasible": {
    "aria": {
     "en": "The first quadrant, the point x, the cone of feasible directions and the direction s",
     "ru": "Первый квадрант, точка x, конус допустимых направлений и направление s"
    },
    "edge": {
     "en": "D1",
     "ru": "D1"
    },
    "corner": {
     "en": "Corner",
     "ru": "Угол"
    },
    "interior": {
     "en": "Interior point",
     "ru": "Внутренняя точка"
    },
    "x": {
     "en": "$x = {vec}$",
     "ru": "$x = {vec}$"
    },
    "none": {
     "en": "No active constraints: every $s \\ne 0$ is feasible.",
     "ru": "Активных ограничений нет: допустимо любое $s \\ne 0$."
    },
    "first": {
     "en": "Active: $x_1 \\ge 0$. Feasible: $s_1 \\ge 0$, $s_2$ free.",
     "ru": "Активно $x_1 \\ge 0$. Допустимы $s$ с $s_1 \\ge 0$ и любым $s_2$."
    },
    "second": {
     "en": "Active: $x_2 \\ge 0$. Feasible: $s_2 \\ge 0$, $s_1$ free.",
     "ru": "Активно $x_2 \\ge 0$. Допустимы $s$ с $s_2 \\ge 0$ и любым $s_1$."
    },
    "both": {
     "en": "Both constraints are active. Feasible: $s_1 \\ge 0$ and $s_2 \\ge 0$.",
     "ru": "Активны оба ограничения. Допустимы $s$ с $s_1 \\ge 0$ и $s_2 \\ge 0$."
    },
    "s": {
     "en": "$s = {vec}$, $s^\\top \\nabla f = {slope}$",
     "ru": "$s = {vec}$, $s^\\top \\nabla f = {slope}$"
    },
    "infeasible": {
     "en": "$s$ is not feasible: $x + \\alpha s$ leaves the quadrant for every $\\alpha > 0$.",
     "ru": "$s$ недопустимо: $x + \\alpha s$ выходит из квадранта при любом $\\alpha > 0$."
    },
    "descent": {
     "en": "Feasible, and $s^\\top \\nabla f < 0$: this direction rejects $x$.",
     "ru": "Допустимо, и $s^\\top \\nabla f < 0$: это направление отвергает $x$."
    },
    "ascent": {
     "en": "Feasible, and $s^\\top \\nabla f \\ge 0$.",
     "ru": "Допустимо, и $s^\\top \\nabla f \\ge 0$."
    },
    "worst": {
     "en": "Smallest rate over feasible unit directions: ${w}$.",
     "ru": "Наименьшая скорость по допустимым единичным направлениям: ${w}$."
    },
    "fails": {
     "en": "The first-order necessary condition fails at $x$.",
     "ru": "Необходимое условие первого порядка в $x$ нарушено."
    },
    "holds": {
     "en": "The first-order necessary condition holds at $x$.",
     "ru": "Необходимое условие первого порядка в $x$ выполнено."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or drag a handle.",
     "ru": "Сделайте прогноз, затем покажите ответ или потяните маркер."
    },
    "dir1": {
     "en": "$s = {{D.feasible.probe.dirs.1}}$",
     "ru": "$s = {{D.feasible.probe.dirs.1}}$"
    },
    "dir2": {
     "en": "$s = {{D.feasible.probe.dirs.2}}$",
     "ru": "$s = {{D.feasible.probe.dirs.2}}$"
    },
    "dir3": {
     "en": "$s = {{D.feasible.probe.dirs.3}}$",
     "ru": "$s = {{D.feasible.probe.dirs.3}}$"
    },
    "dir4": {
     "en": "$s = {{D.feasible.probe.dirs.4}}$",
     "ru": "$s = {{D.feasible.probe.dirs.4}}$"
    },
    "dir5": {
     "en": "$s = {{D.feasible.probe.dirs.5}}$",
     "ru": "$s = {{D.feasible.probe.dirs.5}}$"
    }
   },
   "secant": {
    "aria": {
     "en": "The function along the direction, the secant and the line with slope equal to the directional derivative",
     "ru": "Функция вдоль направления, секущая и прямая с наклоном, равным производной по направлению"
    },
    "dirS": {
     "en": "$d = {{D2.params.s}}$",
     "ru": "$d = {{D2.params.s}}$"
    },
    "dirUnit": {
     "en": "$d = s/\\|s\\|$",
     "ru": "$d = s/\\|s\\|$"
    },
    "dirSteepest": {
     "en": "$d = -\\nabla f/\\|\\nabla f\\|$",
     "ru": "$d = -\\nabla f/\\|\\nabla f\\|$"
    },
    "alpha": {
     "en": "$\\alpha$",
     "ru": "$\\alpha$"
    },
    "slope": {
     "en": "Secant slope $\\dfrac{f(x + \\alpha d) - f(x)}{\\alpha} = {slope}$",
     "ru": "Наклон секущей $\\dfrac{f(x + \\alpha d) - f(x)}{\\alpha} = {slope}$"
    },
    "limit": {
     "en": "Limit $d^\\top \\nabla f(x) = {lim}$",
     "ru": "Предел $d^\\top \\nabla f(x) = {lim}$"
    },
    "gap": {
     "en": "The gap ${gap}$ shrinks in proportion to $\\alpha$.",
     "ru": "Разность ${gap}$ убывает пропорционально $\\alpha$."
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or move the slider.",
     "ru": "Сделайте прогноз, затем покажите ответ или сдвиньте ползунок."
    },
    "legend": {
     "en": "Solid: $\\varphi(\\alpha) = f(x + \\alpha d)$. Red: the secant. Dashed: the slope $d^\\top \\nabla f(x)$.",
     "ru": "Сплошная: $\\varphi(\\alpha) = f(x + \\alpha d)$. Красная: секущая. Пунктир: наклон $d^\\top \\nabla f(x)$."
    }
   }
  }
 }
}/*JSON-END*/);
