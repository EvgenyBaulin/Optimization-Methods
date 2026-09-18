// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 02 content: block texts, recaps, demos, mistakes, exit ticket and home practice, in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar02_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "O": {
    "title": {
     "en": "Opening",
     "ru": "Начало"
    },
    "short": {
     "en": "Opening",
     "ru": "Начало"
    },
    "bridge": {
     "title": {
      "en": "From Seminar 1: the boundary",
      "ru": "Из семинара 1: граница"
     },
     "text": {
      "en": "Seminar 1 ended on the boundary: at a local minimum, $s^\\top \\nabla f(x^*) \\ge 0$ for every feasible direction $s$. Today this inequality becomes the KKT conditions, and convexity turns them from necessary into sufficient.",
      "ru": "Семинар 1 закончился на границе: в точке локального минимума $s^\\top \\nabla f(x^*) \\ge 0$ для любого допустимого направления $s$. Сегодня это неравенство превратится в условия ККТ, а выпуклость сделает их не только необходимыми, но и достаточными."
     }
    },
    "hook": {
     "title": {
      "en": "Where is the optimum?",
      "ru": "Где оптимум?"
     },
     "text": {
      "en": "Minimize $f(x) = \\|x - c\\|^2$ over the unit ball and over the probability simplex. Before touching the widget, make a prediction.",
      "ru": "Минимизируем $f(x) = \\|x - c\\|^2$ на единичном шаре и на вероятностном симплексе. Прежде чем трогать виджет, сделайте прогноз."
     },
     "predictBall": {
      "en": "Ball, $c = {{hook.ball.c}}$: interior or boundary?",
      "ru": "Шар, $c = {{hook.ball.c}}$: внутри или на границе?"
     },
     "answerBall": {
      "en": "Boundary: $\\|c\\| = {{hook.ball.norm}} > {{hook.ball.r}}$, so $x^* = {{hook.ball.x}}$ and the multiplier of $\\|x\\|^2 \\le 1$ is $\\lambda = {{hook.ball.lam}}$.",
      "ru": "На границе: $\\|c\\| = {{hook.ball.norm}} > {{hook.ball.r}}$, поэтому $x^* = {{hook.ball.x}}$, а множитель ограничения $\\|x\\|^2 \\le 1$ равен $\\lambda = {{hook.ball.lam}}$."
     },
     "predictSimplex": {
      "en": "Simplex, $c = {{hook.simplex.c}}$: will a coordinate of $x^*$ be zero?",
      "ru": "Симплекс, $c = {{hook.simplex.c}}$: обнулится ли какая-нибудь координата $x^*$?"
     },
     "answerSimplex": {
      "en": "Yes: $x^* = {{hook.simplex.x}}$, the third coordinate vanishes and $x^*$ lies on an edge of the triangle.",
      "ru": "Да: $x^* = {{hook.simplex.x}}$, третья координата обнуляется, и $x^*$ лежит на стороне треугольника."
     },
     "caption": {
      "en": "Drag $c$. The minimizer is the projection of $c$: it coincides with $c$ while $c$ is feasible and moves to the boundary as soon as $c$ leaves the set.",
      "ru": "Перетаскивайте $c$. Минимум — это проекция $c$: пока $c$ допустима, он совпадает с $c$, а как только $c$ выходит из множества, минимум уходит на границу."
     }
    },
    "overview": {
     "title": {
      "en": "Today's problems",
      "ru": "Задачи на сегодня"
     },
     "text": {
      "en": "Photograph this screen. The first problem of each block is solved on the board; the other two are yours, on a timer.",
      "ru": "Сфотографируйте этот экран. Первую задачу каждого блока решаем у доски, две другие — ваши, на время."
     }
    }
   },
   "A": {
    "title": {
     "en": "A. Convexity of sets and functions",
     "ru": "A. Выпуклость множеств и функций"
    },
    "short": {
     "en": "Convexity",
     "ru": "Выпуклость"
    },
    "recap": [
     {
      "en": "Convex set: $(1-t)x + ty \\in C$ for all $x, y \\in C$ and $t \\in [0, 1]$.",
      "ru": "Выпуклое множество: $(1-t)x + ty \\in C$ для всех $x, y \\in C$ и $t \\in [0, 1]$."
     },
     {
      "en": "Convex function (the Jensen inequality): $f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y)$.",
      "ru": "Выпуклая функция (неравенство Йенсена): $f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y)$."
     },
     {
      "en": "For $f \\in C^2$: convex $\\iff \\nabla^2 f(x) \\succeq 0$ at every $x$. One violating pair disproves convexity; passing tests prove nothing.",
      "ru": "Для $f \\in C^2$: выпукла $\\iff \\nabla^2 f(x) \\succeq 0$ во всех точках. Одна нарушающая пара опровергает выпуклость; успешные проверки ничего не доказывают."
     },
     {
      "en": "Intersections of convex sets, sublevel sets $\\{f \\le \\alpha\\}$ and epigraphs of convex functions are convex; unions in general are not.",
      "ru": "Пересечения выпуклых множеств, множества подуровня $\\{f \\le \\alpha\\}$ и надграфики выпуклых функций выпуклы; объединения, вообще говоря, нет."
     }
    ],
    "widgets": {
     "sets": {
      "title": {
       "en": "Set tester",
       "ru": "Проверка множества"
      },
      "caption": {
       "en": "Drag the two points. The part of the segment that leaves the set turns red.",
       "ru": "Перетаскивайте две точки. Часть отрезка, вышедшая из множества, становится красной."
      }
     },
     "functions": {
      "title": {
       "en": "Function tester",
       "ru": "Проверка функции"
      },
      "caption": {
       "en": "Left: the region where the Hessian is positive semidefinite is shaded; drag $p$ and $q$. Right: $f$ along the segment from $p$ to $q$ with its chord. The button tests random pairs.",
       "ru": "Слева закрашена область, где гессиан положительно полуопределён; перетаскивайте $p$ и $q$. Справа — $f$ вдоль отрезка от $p$ до $q$ и хорда. Кнопка проверяет случайные пары."
      }
     },
     "sublevel": {
      "title": {
       "en": "Sublevel sets",
       "ru": "Множества подуровня"
      },
      "caption": {
       "en": "Move the level $\\alpha$ and watch the set $\\{f \\le \\alpha\\}$.",
       "ru": "Меняйте уровень $\\alpha$ и следите за множеством $\\{f \\le \\alpha\\}$."
      }
     }
    },
    "code": {
     "title": {
      "en": "In code: the numerical convexity check",
      "ru": "В коде: численная проверка выпуклости"
     },
     "text": {
      "en": "Eigenvalues with a relative tolerance, then the Jensen inequality on random pairs. A violation is a proof; passing is only evidence.",
      "ru": "Собственные значения с относительным допуском, затем неравенство Йенсена на случайных парах. Нарушение — доказательство, отсутствие нарушений — лишь свидетельство."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Projections onto a ball, a box and the simplex",
     "ru": "B. Проекции на шар, брус и симплекс"
    },
    "short": {
     "en": "Projections",
     "ru": "Проекции"
    },
    "recap": [
     {
      "en": "Projection: $P_C(x) = \\arg\\min_{y \\in C} \\|y - x\\|$. For a closed convex $C$ it exists and is unique.",
      "ru": "Проекция: $P_C(x) = \\arg\\min_{y \\in C} \\|y - x\\|$. Для замкнутого выпуклого $C$ она существует и единственна."
     },
     {
      "en": "Ball $\\{\\|y - c\\| \\le r\\}$: $P(x) = c + r\\,\\dfrac{x - c}{\\max(r,\\ \\|x - c\\|)}$. Box $[l, u]$: $P(x) = \\min(\\max(x, l), u)$ coordinatewise.",
      "ru": "Шар $\\{\\|y - c\\| \\le r\\}$: $P(x) = c + r\\,\\dfrac{x - c}{\\max(r,\\ \\|x - c\\|)}$. Брус $[l, u]$: $P(x) = \\min(\\max(x, l), u)$ покоординатно."
     },
     {
      "en": "Simplex: sort $u$ in decreasing order, $s_j = u_1 + \\dots + u_j$, $\\rho = \\max\\{j:\\ u_j - (s_j - 1)/j > 0\\}$, $\\theta = (s_\\rho - 1)/\\rho$, $P(v) = \\max(v - \\theta,\\ 0)$.",
      "ru": "Симплекс: сортируем $u$ по убыванию, $s_j = u_1 + \\dots + u_j$, $\\rho = \\max\\{j:\\ u_j - (s_j - 1)/j > 0\\}$, $\\theta = (s_\\rho - 1)/\\rho$, $P(v) = \\max(v - \\theta,\\ 0)$."
     },
     {
      "en": "Obtuse angle: $(x - P(x))^\\top (y - P(x)) \\le 0$ for every $y \\in C$. It certifies that $P(x)$ is the projection.",
      "ru": "Тупой угол: $(x - P(x))^\\top (y - P(x)) \\le 0$ для всех $y \\in C$. Это свойство удостоверяет, что $P(x)$ — проекция."
     }
    ],
    "widget": {
     "title": {
      "en": "Projections",
      "ru": "Проекции"
     },
     "caption": {
      "en": "Click or drag: the point is projected onto the ball, the box and the segment $\\Delta_2$. The triangle is $\\Delta_3$ in the plane $\\mathbf 1^\\top x = 1$; the slider shifts the point along $\\mathbf 1$. The table follows the current point.",
      "ru": "Щёлкните или тяните: точка проецируется на шар, брус и отрезок $\\Delta_2$. Треугольник — это $\\Delta_3$ в плоскости $\\mathbf 1^\\top x = 1$; ползунок сдвигает точку вдоль $\\mathbf 1$. Таблица следует за текущей точкой."
     }
    },
    "code": {
     "title": {
      "en": "In code: three projections",
      "ru": "В коде: три проекции"
     },
     "text": {
      "en": "The ball and the box are one line each; the simplex needs a sort and a cumulative sum.",
      "ru": "Шар и брус занимают по одной строке, для симплекса нужны сортировка и накопленная сумма."
     }
    }
   },
   "C": {
    "title": {
     "en": "C. KKT conditions for 2D problems",
     "ru": "C. Условия ККТ для двумерных задач"
    },
    "short": {
     "en": "KKT",
     "ru": "ККТ"
    },
    "recap": [
     {
      "en": "Problem: $\\min f(x)$ subject to $g_i(x) \\le 0$, $h_j(x) = 0$. Lagrangian: $\\mathcal L = f + \\sum_i \\lambda_i g_i + \\sum_j \\nu_j h_j$ with $\\lambda \\ge 0$.",
      "ru": "Задача: $\\min f(x)$ при $g_i(x) \\le 0$, $h_j(x) = 0$. Функция Лагранжа: $\\mathcal L = f + \\sum_i \\lambda_i g_i + \\sum_j \\nu_j h_j$, где $\\lambda \\ge 0$."
     },
     {
      "en": "KKT: stationarity $\\nabla_x \\mathcal L = 0$; primal feasibility $g_i \\le 0$, $h_j = 0$; dual feasibility $\\lambda_i \\ge 0$; complementary slackness $\\lambda_i g_i = 0$.",
      "ru": "ККТ: стационарность $\\nabla_x \\mathcal L = 0$; допустимость $g_i \\le 0$, $h_j = 0$; неотрицательность множителей $\\lambda_i \\ge 0$; дополняющая нежёсткость $\\lambda_i g_i = 0$."
     },
     {
      "en": "Geometry: $-\\nabla f(x^*) = \\sum_{i\\ \\text{active}} \\lambda_i \\nabla g_i(x^*)$ lies in the normal cone of the active constraints. An inactive constraint has $\\lambda_i = 0$.",
      "ru": "Геометрия: $-\\nabla f(x^*) = \\sum_{i\\ \\text{акт.}} \\lambda_i \\nabla g_i(x^*)$ лежит в нормальном конусе активных ограничений. У неактивного ограничения $\\lambda_i = 0$."
     },
     {
      "en": "For a convex problem with a Slater point, KKT is necessary and sufficient for a global minimum.",
      "ru": "Для выпуклой задачи, где выполнено условие Слейтера, условия ККТ необходимы и достаточны для глобального минимума."
     }
    ],
    "widget": {
     "title": {
      "en": "KKT geometry",
      "ru": "Геометрия ККТ"
     },
     "caption": {
      "en": "Drag the unconstrained minimizer $c$. The widget marks $x^*$, the active constraints, $-\\nabla f(x^*)$ and the active gradients, shades the normal cone and prints the multipliers.",
      "ru": "Перетаскивайте безусловный минимум $c$. Виджет отмечает $x^*$, активные ограничения, $-\\nabla f(x^*)$ и градиенты активных ограничений, закрашивает нормальный конус и печатает множители."
     },
     "predict": {
      "en": "Preset C2: will $\\lambda$ be zero?",
      "ru": "Пресет C2: будет ли $\\lambda$ равен нулю?"
     }
    },
    "code": {
     "title": {
      "en": "In code: recovering the multipliers",
      "ru": "В коде: восстановление множителей"
     },
     "text": {
      "en": "Least squares on the active gradients gives the multipliers; the four residuals are the four KKT conditions.",
      "ru": "Метод наименьших квадратов по градиентам активных ограничений даёт множители; четыре невязки — это четыре условия ККТ."
     }
    }
   },
   "D": {
    "title": {
     "en": "D. How it breaks, and duality",
     "ru": "D. Как это ломается, и двойственность"
    },
    "short": {
     "en": "Breaks, duality",
     "ru": "Поломки, двойственность"
    },
    "D1": {
     "title": {
      "en": "A nonconvex feasible set: several answers",
      "ru": "Невыпуклое допустимое множество: несколько ответов"
     },
     "text": {
      "en": "Projected gradient for $f(x) = \\|x - c\\|^2$ with $c = {{D1.params.c}}$ and step ${{D1.params.step}}$, from {{D1.result.nStarts}} starting points. Left: the union of two disks. Right: their convex hull. Click a canvas to add a start.",
      "ru": "Проекционный градиентный спуск для $f(x) = \\|x - c\\|^2$ при $c = {{D1.params.c}}$ и шаге ${{D1.params.step}}$ из {{D1.result.nStarts}} начальных точек. Слева — объединение двух кругов, справа — их выпуклая оболочка. Щелчок по полотну добавляет начальную точку."
     },
     "predict": {
      "en": "Will all runs on the union end at the same point?",
      "ru": "Придут ли все запуски на объединении в одну точку?"
     },
     "result": {
      "en": "No. On the union, {{D1.result.nGlobal}} runs reach the global minimum with $f = {{ex.local.fGlobal}}$ and {{D1.result.nLocal}} stop at a local one with $f = {{ex.local.fLocal}}$. On the convex hull every run ends at ${{D1.result.capsule}}$.",
      "ru": "Нет. На объединении {{D1.result.nGlobal}} запусков приходят в глобальный минимум с $f = {{ex.local.fGlobal}}$, а {{D1.result.nLocal}} останавливаются в локальном с $f = {{ex.local.fLocal}}$. На выпуклой оболочке все запуски приходят в ${{D1.result.capsule}}$."
     }
    },
    "D2": {
     "title": {
      "en": "No constraint qualification: KKT fails",
      "ru": "Нет условия регулярности: ККТ не выполняются"
     },
     "text": {
      "en": "$\\min x$ subject to $x^2 \\le 0$. The only feasible point is $x^* = {{D2.xStar}}$, so $p^* = {{D2.pStar}}$. Stationarity $1 + 2\\lambda x^* = 1 \\ne 0$ has no solution, and no $x$ satisfies $x^2 < 0$: Slater's condition fails.",
      "ru": "$\\min x$ при $x^2 \\le 0$. Единственная допустимая точка $x^* = {{D2.xStar}}$, поэтому $p^* = {{D2.pStar}}$. Уравнение стационарности $1 + 2\\lambda x^* = 1 \\ne 0$ не имеет решения, и ни одна точка не удовлетворяет $x^2 < 0$: условие Слейтера нарушено."
     },
     "predict": {
      "en": "Is there a multiplier $\\lambda \\ge 0$ at $x^* = {{D2.xStar}}$?",
      "ru": "Существует ли множитель $\\lambda \\ge 0$ в точке $x^* = {{D2.xStar}}$?"
     },
     "result": {
      "en": "No. For $\\lambda > 0$ the dual function is $q(\\lambda) = {{D2.tex.q}}$, attained at $x = {{D2.tex.xMin}}$. Its supremum equals $p^*$, but no $\\lambda$ attains it.",
      "ru": "Нет. При $\\lambda > 0$ двойственная функция равна $q(\\lambda) = {{D2.tex.q}}$, минимум по $x$ достигается в $x = {{D2.tex.xMin}}$. Её супремум равен $p^*$, но ни при каком $\\lambda$ не достигается."
     }
    },
    "D3": {
     "title": {
      "en": "The duality gap: zero and positive",
      "ru": "Зазор двойственности: нулевой и положительный"
     },
     "text": {
      "en": "For C1 the Lagrangian is minimized at $x(\\lambda) = {{D3.convex.tex.xLam}}$, which gives $q(\\lambda) = {{D3.convex.tex.q}}$.",
      "ru": "Для C1 функция Лагранжа минимизируется в точке $x(\\lambda) = {{D3.convex.tex.xLam}}$, откуда $q(\\lambda) = {{D3.convex.tex.q}}$."
     },
     "predict": {
      "en": "Will $\\max_{\\lambda \\ge 0} q(\\lambda)$ reach $p^* = {{D3.convex.pStar}}$?",
      "ru": "Достигнет ли $\\max_{\\lambda \\ge 0} q(\\lambda)$ значения $p^* = {{D3.convex.pStar}}$?"
     },
     "result": {
      "en": "Yes: the maximum ${{D3.convex.dStar}}$ is attained at $\\lambda = {{D3.convex.lamStar}}$, the multiplier of C1. Zero gap.",
      "ru": "Да: максимум ${{D3.convex.dStar}}$ достигается при $\\lambda = {{D3.convex.lamStar}}$ — это множитель из C1. Зазор нулевой."
     },
     "boolText": {
      "en": "A nonconvex contrast: $\\min x_1x_2 + x_2x_3 + x_1x_3$ subject to $x_i^2 = 1$. Enumeration gives $p^* = {{D3.bool.pStar}}$. The dual function is $q(\\nu) = -\\mathbf 1^\\top \\nu$ where $\\tfrac12(\\mathbf 1\\mathbf 1^\\top - I) + \\operatorname{diag}(\\nu) \\succeq 0$, and $-\\infty$ elsewhere.",
      "ru": "Невыпуклый контраст: $\\min x_1x_2 + x_2x_3 + x_1x_3$ при $x_i^2 = 1$. Перебор даёт $p^* = {{D3.bool.pStar}}$. Двойственная функция равна $q(\\nu) = -\\mathbf 1^\\top \\nu$ там, где $\\tfrac12(\\mathbf 1\\mathbf 1^\\top - I) + \\operatorname{diag}(\\nu) \\succeq 0$, и $-\\infty$ в остальных точках."
     },
     "boolResult": {
      "en": "No. The maximum of $q$ is $d^* = {{D3.bool.tex.dStar}}$ at $\\nu^* = {{D3.bool.tex.nuStar}}$, so the duality gap is $p^* - d^* = {{D3.bool.tex.gap}}$.",
      "ru": "Нет. Максимум $q$ равен $d^* = {{D3.bool.tex.dStar}}$ и достигается при $\\nu^* = {{D3.bool.tex.nuStar}}$, поэтому зазор двойственности $p^* - d^* = {{D3.bool.tex.gap}}$."
     },
     "note": {
      "en": "Why three constraints: with a single quadratic constraint and a strictly feasible point the gap is zero even for a nonconvex objective (the S-lemma).",
      "ru": "Почему ограничений три: при одном квадратичном ограничении и строго допустимой точке зазор нулевой даже для невыпуклой целевой функции (S-лемма)."
     }
    },
    "code": {
     "title": {
      "en": "In code: projected gradient",
      "ru": "В коде: проекционный градиентный спуск"
     },
     "text": {
      "en": "The course interface method(f, grad, x0, **params) returns the point and a dictionary with the path.",
      "ru": "Интерфейс курса method(f, grad, x0, **params) возвращает точку и словарь с траекторией."
     }
    }
   },
   "E": {
    "title": {
     "en": "E. Wrap-up",
     "ru": "E. Итоги"
    },
    "short": {
     "en": "Wrap-up",
     "ru": "Итоги"
    },
    "summary": {
     "title": {
      "en": "Five sentences to keep",
      "ru": "Пять фраз, которые стоит унести"
     },
     "items": [
      {
       "en": "Convexity is proved by $\\nabla^2 f \\succeq 0$ everywhere and disproved by a single Jensen pair.",
       "ru": "Выпуклость доказывается условием $\\nabla^2 f \\succeq 0$ во всех точках, а опровергается одной парой точек, нарушающей неравенство Йенсена."
      },
      {
       "en": "Intersections, sublevel sets and epigraphs of convex functions are convex; unions are not.",
       "ru": "Пересечения, множества подуровня и надграфики выпуклых функций выпуклы, объединения — нет."
      },
      {
       "en": "Projections: normalize for a ball, clip for a box, sort and shift for the simplex; the obtuse-angle property certifies the result.",
       "ru": "Проекции: нормировать для шара, обрезать для бруса, сортировать и сдвигать для симплекса; свойство тупого угла удостоверяет результат."
      },
      {
       "en": "KKT: $-\\nabla f(x^*)$ lies in the cone of the active gradients, multipliers are nonnegative, and inactive constraints have $\\lambda = 0$.",
       "ru": "ККТ: $-\\nabla f(x^*)$ лежит в конусе градиентов активных ограничений, множители неотрицательны, а у неактивных ограничений $\\lambda = 0$."
      },
      {
       "en": "Without convexity local methods stop at local minima and the duality gap can be positive; without a constraint qualification KKT can fail at the optimum.",
       "ru": "Без выпуклости локальные методы останавливаются в локальных минимумах, а зазор двойственности может быть положительным; без условия регулярности условия ККТ могут не выполняться в оптимуме."
      }
     ]
    },
    "cheatsheet": {
     "title": {
      "en": "Cheat sheet and handout",
      "ru": "Шпаргалка и конспект"
     },
     "text": {
      "en": "One printed page with every formula of today, and the full theory with all nine solutions.",
      "ru": "Одна печатная страница со всеми формулами занятия и полный конспект с решениями всех девяти задач."
     },
     "links": [
      {
       "href": "cheatsheet.html",
       "label": {
        "en": "Cheat sheet",
        "ru": "Шпаргалка"
       }
      },
      {
       "href": "theory.html",
       "label": {
        "en": "Theory handout",
        "ru": "Конспект теории"
       }
      }
     ]
    },
    "exit": {
     "title": {
      "en": "Exit ticket",
      "ru": "Билет на выходе"
     },
     "text": {
      "en": "Three one-line questions. Write the answers on paper before opening them.",
      "ru": "Три вопроса, ответ на каждый в одну строку. Запишите ответы на бумаге, прежде чем открывать их."
     },
     "items": [
      {
       "id": "E1",
       "question": {
        "en": "Is $f(x) = {{exit.E1.tex.f}}$ convex on $\\mathbb R$?",
        "ru": "Выпукла ли $f(x) = {{exit.E1.tex.f}}$ на $\\mathbb R$?"
       },
       "answer": {
        "en": "No: $f''(x) = {{exit.E1.tex.d2}}$, so $f''(0) = {{exit.E1.d2}} < 0$.",
        "ru": "Нет: $f''(x) = {{exit.E1.tex.d2}}$, поэтому $f''(0) = {{exit.E1.d2}} < 0$."
       }
      },
      {
       "id": "E2",
       "question": {
        "en": "Project ${{exit.E2.v}}$ onto $\\Delta_3$.",
        "ru": "Спроецируйте ${{exit.E2.v}}$ на $\\Delta_3$."
       },
       "answer": {
        "en": "$\\theta = {{exit.E2.theta}}$ and the projection is ${{exit.E2.x}}$.",
        "ru": "$\\theta = {{exit.E2.theta}}$, проекция равна ${{exit.E2.x}}$."
       }
      },
      {
       "id": "E3",
       "question": {
        "en": "At the optimum $g_2(x^*) = {{exit.E3.g}}$. What is $\\lambda_2^*$?",
        "ru": "В оптимуме $g_2(x^*) = {{exit.E3.g}}$. Чему равен $\\lambda_2^*$?"
       },
       "answer": {
        "en": "$\\lambda_2^* = 0$: the constraint is inactive, and complementary slackness forces a zero multiplier.",
        "ru": "$\\lambda_2^* = 0$: ограничение неактивно, и дополняющая нежёсткость требует нулевого множителя."
       }
      }
     ]
    },
    "home": {
     "title": {
      "en": "Home practice",
      "ru": "Домашняя практика"
     },
     "text": {
      "en": "Three problems by hand and one in code. Answers and solutions open after your first attempt.",
      "ru": "Три задачи на бумаге и одна в коде. Ответы и решения открываются после первой попытки."
     },
     "items": [
      {
       "id": "H1",
       "kind": "hand",
       "title": {
        "en": "Quadratic over linear",
        "ru": "Квадрат, делённый на линейную функцию"
       },
       "statement": {
        "en": "Is $f(x, y) = {{home.H1.tex.f}}$ convex on the half-plane $y > 0$? Is it strictly convex? Compute $\\det H$ at ${{home.H1.point}}$.",
        "ru": "Выпукла ли $f(x, y) = {{home.H1.tex.f}}$ на полуплоскости $y > 0$? Строго ли выпукла? Найдите $\\det H$ в точке ${{home.H1.point}}$."
       },
       "steps": [
        {
         "text": {
          "en": "$H(x, y) = {{home.H1.tex.H}}$.",
          "ru": "$H(x, y) = {{home.H1.tex.H}}$."
         }
        },
        {
         "text": {
          "en": "$\\det H = \\dfrac{2}{y}\\cdot\\dfrac{2x^2}{y^3} - \\Big(\\dfrac{2x}{y^2}\\Big)^2 = 0$ and $\\operatorname{tr} H = \\dfrac{2}{y} + \\dfrac{2x^2}{y^3} > 0$: one eigenvalue is zero and the other is positive, so $H \\succeq 0$ on $y > 0$ and $f$ is convex. At ${{home.H1.point}}$: $H = {{home.H1.tex.HPoint}}$ and $\\det H = 0$.",
          "ru": "$\\det H = \\dfrac{2}{y}\\cdot\\dfrac{2x^2}{y^3} - \\Big(\\dfrac{2x}{y^2}\\Big)^2 = 0$ и $\\operatorname{tr} H = \\dfrac{2}{y} + \\dfrac{2x^2}{y^3} > 0$: одно собственное значение нулевое, другое положительное, значит, $H \\succeq 0$ при $y > 0$ и $f$ выпукла. В точке ${{home.H1.point}}$: $H = {{home.H1.tex.HPoint}}$ и $\\det H = 0$."
         }
        },
        {
         "text": {
          "en": "Not strictly convex: along the ray $t \\mapsto t\\,{{home.H1.ray}}$ we get $f = \\tfrac{t}{2}$, a linear function.",
          "ru": "Строгой выпуклости нет: вдоль луча $t \\mapsto t\\,{{home.H1.ray}}$ получаем $f = \\tfrac{t}{2}$ — линейную функцию."
         }
        }
       ],
       "answerText": {
        "en": "Convex, not strictly convex; $\\det H = 0$ at every point.",
        "ru": "Выпукла, но не строго; $\\det H = 0$ во всех точках."
       },
       "answers": [
        {
         "id": "det",
         "ref": "home.H1.answer.det",
         "label": {
          "en": "$\\det H$ at ${{home.H1.point}}$",
          "ru": "$\\det H$ в точке ${{home.H1.point}}$"
         }
        },
        {
         "id": "props",
         "ref": "home.H1.answer.props",
         "label": {
          "en": "Which properties hold on $y > 0$?",
          "ru": "Какие свойства выполнены при $y > 0$?"
         },
         "options": [
          {
           "id": "convex",
           "label": {
            "en": "Convex",
            "ru": "Выпукла"
           }
          },
          {
           "id": "strict",
           "label": {
            "en": "Strictly convex",
            "ru": "Строго выпукла"
           }
          }
         ]
        }
       ]
      },
      {
       "id": "H2",
       "kind": "hand",
       "title": {
        "en": "A shifted ball",
        "ru": "Сдвинутый шар"
       },
       "statement": {
        "en": "Project $x = {{home.H2.x}}$ onto the ball $\\{z:\\ \\|z - c\\| \\le {{home.H2.r}}\\}$ with $c = {{home.H2.c}}$, and check the obtuse-angle property with $y = {{home.H2.y}}$.",
        "ru": "Спроецируйте $x = {{home.H2.x}}$ на шар $\\{z:\\ \\|z - c\\| \\le {{home.H2.r}}\\}$ с центром $c = {{home.H2.c}}$ и проверьте свойство тупого угла для $y = {{home.H2.y}}$."
       },
       "steps": [
        {
         "text": {
          "en": "$x - c = {{home.H2.diff}}$ and $\\|x - c\\| = {{home.H2.dist}} > {{home.H2.r}}$, so $P(x) = c + {{home.H2.r}}\\,\\dfrac{x - c}{\\|x - c\\|} = {{home.H2.P}}$.",
          "ru": "$x - c = {{home.H2.diff}}$ и $\\|x - c\\| = {{home.H2.dist}} > {{home.H2.r}}$, поэтому $P(x) = c + {{home.H2.r}}\\,\\dfrac{x - c}{\\|x - c\\|} = {{home.H2.P}}$."
         }
        },
        {
         "text": {
          "en": "$y$ lies in the ball: $\\|y - c\\| = {{home.H2.distY}}$. Then $x - P(x) = {{home.H2.xP}}$, $y - P(x) = {{home.H2.yP}}$, and their inner product is ${{home.H2.prod}} \\le 0$.",
          "ru": "$y$ лежит в шаре: $\\|y - c\\| = {{home.H2.distY}}$. Далее $x - P(x) = {{home.H2.xP}}$, $y - P(x) = {{home.H2.yP}}$, и их скалярное произведение равно ${{home.H2.prod}} \\le 0$."
         }
        }
       ],
       "answerText": {
        "en": "$P(x) = {{home.H2.P}}$; the inner product is ${{home.H2.prod}}$.",
        "ru": "$P(x) = {{home.H2.P}}$; скалярное произведение равно ${{home.H2.prod}}$."
       },
       "answers": [
        {
         "id": "P",
         "ref": "home.H2.answer.P",
         "label": {
          "en": "$P(x)$",
          "ru": "$P(x)$"
         },
         "components": [
          {
           "en": "$z_1$",
           "ru": "$z_1$"
          },
          {
           "en": "$z_2$",
           "ru": "$z_2$"
          }
         ]
        },
        {
         "id": "prod",
         "ref": "home.H2.answer.prod",
         "label": {
          "en": "$(x - P(x))^\\top (y - P(x))$",
          "ru": "$(x - P(x))^\\top (y - P(x))$"
         }
        }
       ]
      },
      {
       "id": "H3",
       "kind": "hand",
       "title": {
        "en": "An equality and an inequality",
        "ru": "Равенство и неравенство"
       },
       "statement": {
        "en": "Solve $\\min\\ x_1^2 + x_2^2$ subject to $x_1 + 2x_2 = {{home.H3.rhs}}$ and $x_1 \\ge {{home.H3.bound}}$. Find $x^*$, the multiplier $\\lambda^*$ of the inequality and the multiplier $\\nu^*$ of the equality.",
        "ru": "Решите задачу $\\min\\ x_1^2 + x_2^2$ при $x_1 + 2x_2 = {{home.H3.rhs}}$ и $x_1 \\ge {{home.H3.bound}}$. Найдите $x^*$, множитель $\\lambda^*$ неравенства и множитель $\\nu^*$ равенства."
       },
       "steps": [
        {
         "text": {
          "en": "Write $g = {{home.H3.bound}} - x_1 \\le 0$ and $h = x_1 + 2x_2 - {{home.H3.rhs}} = 0$. Stationarity of $\\mathcal L = x_1^2 + x_2^2 + \\lambda g + \\nu h$: $2x_1 - \\lambda + \\nu = 0$ and $2x_2 + 2\\nu = 0$.",
          "ru": "Запишем $g = {{home.H3.bound}} - x_1 \\le 0$ и $h = x_1 + 2x_2 - {{home.H3.rhs}} = 0$. Стационарность $\\mathcal L = x_1^2 + x_2^2 + \\lambda g + \\nu h$: $2x_1 - \\lambda + \\nu = 0$ и $2x_2 + 2\\nu = 0$."
         }
        },
        {
         "text": {
          "en": "Case $\\lambda = 0$: $x = {{home.H3.xFree}}$ with $\\nu = {{home.H3.nuFree}}$, but $x_1 < {{home.H3.bound}}$. Infeasible.",
          "ru": "Случай $\\lambda = 0$: $x = {{home.H3.xFree}}$, $\\nu = {{home.H3.nuFree}}$, но $x_1 < {{home.H3.bound}}$. Недопустимо."
         }
        },
        {
         "text": {
          "en": "Case $x_1 = {{home.H3.bound}}$: the equality gives $x_2 = {{home.H3.x.2}}$, then $\\nu = -x_2 = {{home.H3.nu}}$ and $\\lambda = 2x_1 + \\nu = {{home.H3.lam}} \\ge 0$.",
          "ru": "Случай $x_1 = {{home.H3.bound}}$: из равенства $x_2 = {{home.H3.x.2}}$, затем $\\nu = -x_2 = {{home.H3.nu}}$ и $\\lambda = 2x_1 + \\nu = {{home.H3.lam}} \\ge 0$."
         }
        },
        {
         "text": {
          "en": "$x^* = {{home.H3.x}}$ and $f^* = {{home.H3.f}}$. The equality multiplier is negative, which is allowed: only inequality multipliers have a sign.",
          "ru": "$x^* = {{home.H3.x}}$ и $f^* = {{home.H3.f}}$. Множитель равенства отрицателен, и это допустимо: знак фиксирован только у множителей неравенств."
         }
        }
       ],
       "answerText": {
        "en": "$x^* = {{home.H3.x}}$, $\\lambda^* = {{home.H3.lam}}$, $\\nu^* = {{home.H3.nu}}$.",
        "ru": "$x^* = {{home.H3.x}}$, $\\lambda^* = {{home.H3.lam}}$, $\\nu^* = {{home.H3.nu}}$."
       },
       "answers": [
        {
         "id": "x",
         "ref": "home.H3.answer.x",
         "label": {
          "en": "$x^*$",
          "ru": "$x^*$"
         },
         "components": [
          {
           "en": "$x_1$",
           "ru": "$x_1$"
          },
          {
           "en": "$x_2$",
           "ru": "$x_2$"
          }
         ]
        },
        {
         "id": "lam",
         "ref": "home.H3.answer.lam",
         "label": {
          "en": "$\\lambda^*$",
          "ru": "$\\lambda^*$"
         }
        },
        {
         "id": "nu",
         "ref": "home.H3.answer.nu",
         "label": {
          "en": "$\\nu^*$",
          "ru": "$\\nu^*$"
         }
        }
       ]
      },
      {
       "id": "H4",
       "kind": "code",
       "title": {
        "en": "Projected gradient on the simplex",
        "ru": "Проекционный градиентный спуск на симплексе"
       },
       "statement": {
        "en": "Using `proj_simplex` and `projected_gradient` from the page, minimize $f(x) = {{home.H4.tex.f}}$ over $\\Delta_3$ with step $1/L = {{home.H4.step}}$ from the centre of the simplex. Report $x^*$ and $f^*$, and verify the KKT conditions.",
        "ru": "С помощью `proj_simplex` и `projected_gradient` со страницы минимизируйте $f(x) = {{home.H4.tex.f}}$ на $\\Delta_3$ с шагом $1/L = {{home.H4.step}}$ из центра симплекса. Выпишите $x^*$ и $f^*$ и проверьте условия ККТ."
       },
       "steps": [
        {
         "text": {
          "en": "$\\nabla f(x) = Qx - p$ with $Q = \\operatorname{diag}{{home.H4.q}}$ and $p = {{home.H4.p}}$; $L = \\lambda_{\\max}(Q) = {{home.H4.L}}$.",
          "ru": "$\\nabla f(x) = Qx - p$, где $Q = \\operatorname{diag}{{home.H4.q}}$ и $p = {{home.H4.p}}$; $L = \\lambda_{\\max}(Q) = {{home.H4.L}}$."
         }
        },
        {
         "text": {
          "en": "Run `projected_gradient(f, grad, x0, proj_simplex, step=1/L)`: it stops after {{home.H4.iterations}} iterations at $x^* = {{home.H4.tex.x}}$ with $f^* = {{home.H4.tex.fStar}}$.",
          "ru": "Запуск `projected_gradient(f, grad, x0, proj_simplex, step=1/L)` останавливается через {{home.H4.iterations}} итераций в точке $x^* = {{home.H4.tex.x}}$, $f^* = {{home.H4.tex.fStar}}$."
         }
        },
        {
         "text": {
          "en": "KKT on the simplex: the gradient components are equal on the support and not smaller off it. Here $\\nabla f(x^*) = {{home.H4.grad}}$: the first two equal $-{{home.H4.tex.mu}}$, the third is larger.",
          "ru": "ККТ на симплексе: компоненты градиента равны на носителе и не меньше вне его. Здесь $\\nabla f(x^*) = {{home.H4.grad}}$: первые две равны $-{{home.H4.tex.mu}}$, третья больше."
         }
        }
       ],
       "answerText": {
        "en": "$x^* = {{home.H4.tex.x}}$, $f^* = {{home.H4.tex.fStar}}$.",
        "ru": "$x^* = {{home.H4.tex.x}}$, $f^* = {{home.H4.tex.fStar}}$."
       },
       "answers": [
        {
         "id": "x",
         "ref": "home.H4.answer.x",
         "label": {
          "en": "$x^*$",
          "ru": "$x^*$"
         },
         "components": [
          {
           "en": "$x_1$",
           "ru": "$x_1$"
          },
          {
           "en": "$x_2$",
           "ru": "$x_2$"
          },
          {
           "en": "$x_3$",
           "ru": "$x_3$"
          }
         ]
        },
        {
         "id": "f",
         "ref": "home.H4.answer.f",
         "label": {
          "en": "$f^*$",
          "ru": "$f^*$"
         }
        }
       ]
      }
     ]
    },
    "bridge": {
     "title": {
      "en": "What this is for",
      "ru": "Зачем это всё"
     },
     "items": [
      {
       "en": "HW-1, theory part: convexity and KKT by hand, in the format of the problems you solved on your own today.",
       "ru": "ДЗ-1, теоретическая часть: выпуклость и ККТ вручную, в формате задач, которые вы сегодня решали самостоятельно."
      },
      {
       "en": "Colloquium: KKT, multipliers, duality and complementary slackness are classic questions of the optimality-conditions section.",
       "ru": "Коллоквиум: ККТ, множители, двойственность и дополняющая нежёсткость — классические вопросы раздела об условиях оптимальности."
      },
      {
       "en": "Next seminar: gradient descent and automatic differentiation.",
       "ru": "Следующий семинар: градиентный спуск и автоматическое дифференцирование."
      }
     ]
    }
   }
  },
  "mistakes": {
   "A": [
    {
     "en": "A cross term $c\\,x_ix_j$ puts $c$ into both entries $H_{ij}$ and $H_{ji}$; the value $c/2$ is the entry of $A$ in $f = x^\\top A x$.",
     "ru": "Смешанное слагаемое $c\\,x_ix_j$ даёт $c$ в оба элемента $H_{ij}$ и $H_{ji}$; значение $c/2$ — это элемент $A$ в записи $f = x^\\top A x$."
    },
    {
     "en": "Leading principal minors decide only $H \\succ 0$. For $H \\succeq 0$ all principal minors must be nonnegative: $\\operatorname{diag}(0, -1)$ has zero leading minors and is not semidefinite.",
     "ru": "Угловые миноры решают только вопрос о $H \\succ 0$. Для $H \\succeq 0$ неотрицательными должны быть все главные миноры: у $\\operatorname{diag}(0, -1)$ угловые миноры нулевые, а матрица не полуопределена."
    },
    {
     "en": "Classifying eigenvalues with an absolute tolerance: a tiny positive definite matrix becomes zero. Use a tolerance relative to the largest eigenvalue.",
     "ru": "Классифицировать собственные значения с абсолютным допуском: крошечная положительно определённая матрица превращается в нулевую. Допуск нужен относительный, от наибольшего собственного значения."
    },
    {
     "en": "Treating random pairs that satisfy Jensen as a proof of convexity: only a violation proves something.",
     "ru": "Считать случайные пары, для которых выполнено неравенство Йенсена, доказательством выпуклости: доказывает только нарушение."
    }
   ],
   "B": [
    {
     "en": "Mixing the formulas: clipping coordinates for a ball or normalizing for a box.",
     "ru": "Перепутать формулы: обрезать координаты для шара или нормировать для бруса."
    },
    {
     "en": "Returning the sorted vector: the sort is only used to find $\\theta$, the result keeps the original order.",
     "ru": "Выдать отсортированный вектор: сортировка нужна только для нахождения $\\theta$, результат сохраняет исходный порядок."
    },
    {
     "en": "Expecting only negative coordinates to vanish: any coordinate not larger than $\\theta$ becomes zero.",
     "ru": "Ожидать, что обнуляются только отрицательные координаты: обнуляется любая координата, не превосходящая $\\theta$."
    },
    {
     "en": "Projecting onto a nonconvex set as if the projection were unique: for a union of disks a point can have two nearest points.",
     "ru": "Проецировать на невыпуклое множество так, будто проекция единственна: у объединения кругов точка может иметь две ближайшие."
    }
   ],
   "C": [
    {
     "en": "Mixing sign conventions: the course uses $g(x) \\le 0$ with $+\\lambda g$ and $\\lambda \\ge 0$, while SciPy writes inequalities as $c(x) \\ge 0$.",
     "ru": "Смешать соглашения о знаках: в курсе $g(x) \\le 0$, $+\\lambda g$ и $\\lambda \\ge 0$, а SciPy записывает неравенства как $c(x) \\ge 0$."
    },
    {
     "en": "Accepting a candidate with a negative multiplier. A plausible $\\lambda < 0$ means the active set is wrong.",
     "ru": "Принять кандидата с отрицательным множителем. Правдоподобный $\\lambda < 0$ означает, что активное множество выбрано неверно."
    },
    {
     "en": "Assuming that an active constraint must have $\\lambda > 0$: an active constraint may have $\\lambda = 0$, an inactive one must.",
     "ru": "Считать, что у активного ограничения обязательно $\\lambda > 0$: у активного ограничения может быть $\\lambda = 0$, а у неактивного — обязательно."
    },
    {
     "en": "Applying KKT without a constraint qualification: at the optimum of D2 no multiplier exists.",
     "ru": "Применять ККТ без условия регулярности: в оптимуме задачи D2 множителя не существует."
    }
   ]
  }
 }
}/*JSON-END*/);
