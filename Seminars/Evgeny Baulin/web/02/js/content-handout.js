// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 02 content: the theory handout (theory/index.html), in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar02_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "handout": {
  "title": {
   "en": "Convexity, Constraints and Optimality Conditions",
   "ru": "Выпуклость, ограничения и условия оптимальности"
  },
  "intro": {
   "en": "This handout collects the theory behind Seminar 2: convex sets and functions, projections, the KKT conditions and the basics of duality. It can be read from the first line: derivatives, vectors and matrices are all you need. Every formula is followed by a small example with numbers, and the examples come from the seminar problems, so the same points and functions keep coming back. The section on seminar problems contains all nine problems with complete solutions.",
   "ru": "Этот конспект собирает теорию второго семинара: выпуклые множества и функции, проекции, условия ККТ и основы двойственности. Читать его можно с первой строки: достаточно знать производные, векторы и матрицы. После каждой формулы идёт небольшой пример с числами; примеры взяты из задач семинара, поэтому одни и те же точки и функции встречаются снова и снова. В разделе «Задачи семинара» разобраны все девять задач с полными решениями."
  },
  "convention": {
   "en": "Throughout, as in the course lectures, a constrained problem is written as $$\\min_x f(x) \\quad \\text{subject to} \\quad g_i(x) \\le 0,\\ \\ i = 1, \\dots, m, \\qquad h_j(x) = 0,\\ \\ j = 1, \\dots, p.$$ The Lagrangian is $\\mathcal L(x, \\lambda, \\nu) = f(x) + \\sum_i \\lambda_i g_i(x) + \\sum_j \\nu_j h_j(x)$ with $\\lambda \\ge 0$ and $\\nu$ of any sign, and the dual function is $q(\\lambda, \\nu) = \\inf_x \\mathcal L(x, \\lambda, \\nu)$. A constraint of the form $x_1 \\ge 0$ is first rewritten as $-x_1 \\le 0$: in C3 this gives $g_2(x) = -x_1$ with $\\nabla g_2 = {{C3.params.A.2}}$. The probability simplex is $\\Delta_d = \\{x \\in \\mathbb R^d:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$, and a convex combination of two points is $(1-t)x + ty$ with $t \\in [0, 1]$.",
   "ru": "Везде, как и в лекциях курса, задача с ограничениями записывается в виде $$\\min_x f(x) \\quad \\text{при} \\quad g_i(x) \\le 0,\\ \\ i = 1, \\dots, m, \\qquad h_j(x) = 0,\\ \\ j = 1, \\dots, p.$$ Функция Лагранжа: $\\mathcal L(x, \\lambda, \\nu) = f(x) + \\sum_i \\lambda_i g_i(x) + \\sum_j \\nu_j h_j(x)$, где $\\lambda \\ge 0$, а знак $\\nu$ любой; двойственная функция: $q(\\lambda, \\nu) = \\inf_x \\mathcal L(x, \\lambda, \\nu)$. Ограничение вида $x_1 \\ge 0$ сначала переписывается как $-x_1 \\le 0$: в задаче C3 это даёт $g_2(x) = -x_1$ и $\\nabla g_2 = {{C3.params.A.2}}$. Вероятностный симплекс: $\\Delta_d = \\{x \\in \\mathbb R^d:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$; выпуклая комбинация двух точек: $(1-t)x + ty$, где $t \\in [0, 1]$."
  },
  "sections": [
   {
    "id": "sets",
    "title": {
     "en": "Convex sets",
     "ru": "Выпуклые множества"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Convexity is the property that makes optimization problems tractable. It is defined first for sets, through segments, and then for functions.",
       "ru": "Выпуклость — то свойство, которое делает задачи оптимизации решаемыми. Сначала она определяется для множеств, через отрезки, а затем для функций."
      }
     }
    ],
    "subsections": [
     {
      "id": "sets-definition",
      "title": {
       "en": "Segments and convex sets",
       "ru": "Отрезки и выпуклые множества"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Take two points $x, y \\in \\mathbb R^d$ and a number $t \\in [0, 1]$. The point $$z = (1-t)x + ty$$ is a **convex combination** of $x$ and $y$. At $t = 0$ it is $x$, at $t = 1$ it is $y$, and as $t$ runs over $[0, 1]$ the point $z$ runs over the segment from $x$ to $y$. The weights $1-t$ and $t$ are nonnegative and sum to $1$, so $z$ is a weighted average of the two points.",
         "ru": "Возьмём две точки $x, y \\in \\mathbb R^d$ и число $t \\in [0, 1]$. Точка $$z = (1-t)x + ty$$ называется **выпуклой комбинацией** точек $x$ и $y$. При $t = 0$ это $x$, при $t = 1$ — $y$, а когда $t$ пробегает отрезок $[0, 1]$, точка $z$ пробегает отрезок от $x$ до $y$. Веса $1-t$ и $t$ неотрицательны и в сумме дают $1$, так что $z$ — взвешенное среднее двух точек."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$x = {{ex.combo.x}}$, $y = {{ex.combo.y}}$, $t = {{ex.combo.tex.t}}$: $z = (1-t)x + ty = {{ex.combo.tex.z}}$, the midpoint of the segment.",
         "ru": "$x = {{ex.combo.x}}$, $y = {{ex.combo.y}}$, $t = {{ex.combo.tex.t}}$: $z = (1-t)x + ty = {{ex.combo.tex.z}}$ — середина отрезка."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "A set $C \\subseteq \\mathbb R^d$ is **convex** if together with any two of its points it contains the whole segment between them: $$(1-t)x + ty \\in C \\quad \\text{for all } x, y \\in C \\text{ and } t \\in [0, 1].$$ To prove convexity one has to check all pairs of points; to disprove it, one pair and one $t$ are enough.",
         "ru": "Множество $C \\subseteq \\mathbb R^d$ **выпукло**, если вместе с любыми двумя своими точками оно содержит весь отрезок между ними: $$(1-t)x + ty \\in C \\quad \\text{для всех } x, y \\in C \\text{ и } t \\in [0, 1].$$ Чтобы доказать выпуклость, нужно проверить все пары точек; чтобы опровергнуть, достаточно одной пары и одного $t$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The unit disk $\\{\\|x\\| \\le 1\\}$ contains $x = {{ex.combo.x}}$ and $y = {{ex.combo.y}}$ (both have norm $1$), and their midpoint $z = {{ex.combo.tex.z}}$ has $\\|z\\|^2 = {{ex.combo.tex.norm2}} \\le 1$: it lies in the disk too, as convexity requires. The ring $\\{ {{A.widgets.sets.annulus.1}} \\le \\|x\\| \\le {{A.widgets.sets.annulus.2}} \\}$ also contains $x$ and $y$ but not $z$, because $\\|z\\|^2 = {{ex.combo.tex.norm2}} < 1$: the ring is not convex.",
         "ru": "Единичный круг $\\{\\|x\\| \\le 1\\}$ содержит точки $x = {{ex.combo.x}}$ и $y = {{ex.combo.y}}$ (норма каждой равна $1$), а их середина $z = {{ex.combo.tex.z}}$ имеет $\\|z\\|^2 = {{ex.combo.tex.norm2}} \\le 1$ и тоже лежит в круге, как и требует выпуклость. Кольцо $\\{ {{A.widgets.sets.annulus.1}} \\le \\|x\\| \\le {{A.widgets.sets.annulus.2}} \\}$ тоже содержит $x$ и $y$, но не содержит $z$, ведь $\\|z\\|^2 = {{ex.combo.tex.norm2}} < 1$: кольцо не выпукло."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_sets.svg",
        "alt": {
         "en": "Four sets, each with a segment between two of its points: a disk, the set T, a ring and the cross-shaped set S. The part of a segment outside its set is red.",
         "ru": "Четыре множества, в каждом отрезок между двумя его точками: круг, множество T, кольцо и крестообразное множество S. Часть отрезка вне множества выделена красным."
        },
        "caption": {
         "en": "Left to right: the disk $\\|x\\| \\le r$ and the set $T$ of problem A3 are convex, and the segment stays inside. The ring ${{A.widgets.sets.annulus.1}} \\le \\|x\\| \\le {{A.widgets.sets.annulus.2}}$ and the set $S$ of problem A3 are not convex: the part of the segment that leaves the set is red.",
         "ru": "Слева направо: круг $\\|x\\| \\le r$ и множество $T$ из задачи A3 выпуклы, и отрезок остаётся внутри. Кольцо ${{A.widgets.sets.annulus.1}} \\le \\|x\\| \\le {{A.widgets.sets.annulus.2}}$ и множество $S$ из задачи A3 не выпуклы: часть отрезка, вышедшая из множества, выделена красным."
        }
       }
      ]
     },
     {
      "id": "sets-examples",
      "title": {
       "en": "Basic convex sets",
       "ru": "Основные выпуклые множества"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The following sets are convex. Each comes with a point from the seminar that belongs to it.",
         "ru": "Следующие множества выпуклы. Для каждого указана точка из семинара, которая ему принадлежит."
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**Half-space** $\\{x:\\ a^\\top x \\le b\\}$. The feasible set of C1 is the half-plane $\\{x_1 + x_2 \\le {{C1.params.b.1}} \\}$, and it contains ${{ex.slater.point}}$: $x_1 + x_2 - {{C1.params.b.1}} = {{ex.slater.g}} \\le 0$.",
          "ru": "**Полупространство** $\\{x:\\ a^\\top x \\le b\\}$. Допустимое множество задачи C1 — полуплоскость $\\{x_1 + x_2 \\le {{C1.params.b.1}} \\}$; она содержит точку ${{ex.slater.point}}$: $x_1 + x_2 - {{C1.params.b.1}} = {{ex.slater.g}} \\le 0$."
         },
         {
          "en": "**Hyperplane** $\\{x:\\ a^\\top x = b\\}$ and, more generally, an **affine set** $\\{x:\\ Ax = b\\}$. The line $x_1 + 2x_2 = {{home.H3.rhs}}$ contains ${{home.H3.xFree}}$: ${{home.H3.xFree.1}} + 2 \\cdot {{home.H3.xFree.2}} = {{home.H3.rhs}}$.",
          "ru": "**Гиперплоскость** $\\{x:\\ a^\\top x = b\\}$ и, в более общем случае, **аффинное множество** $\\{x:\\ Ax = b\\}$. Прямая $x_1 + 2x_2 = {{home.H3.rhs}}$ содержит точку ${{home.H3.xFree}}$: ${{home.H3.xFree.1}} + 2 \\cdot {{home.H3.xFree.2}} = {{home.H3.rhs}}$."
         },
         {
          "en": "**Ball** $\\{x:\\ \\|x - c\\| \\le r\\}$ in the Euclidean norm. The point ${{B2.steps.ball}}$ lies on the boundary of the unit ball: ${{B2.steps.ball.1}}^2 + {{B2.steps.ball.2}}^2 = 1$.",
          "ru": "**Шар** $\\{x:\\ \\|x - c\\| \\le r\\}$ в евклидовой норме. Точка ${{B2.steps.ball}}$ лежит на границе единичного шара: ${{B2.steps.ball.1}}^2 + {{B2.steps.ball.2}}^2 = 1$."
         },
         {
          "en": "**Box** $\\{x:\\ l_i \\le x_i \\le u_i \\text{ for all } i\\}$. The square $Q = [{{B2.params.lo}}, {{B2.params.hi}}]^2$ of B2 contains ${{B2.steps.box}}$.",
          "ru": "**Брус** $\\{x:\\ l_i \\le x_i \\le u_i \\text{ для всех } i\\}$. Квадрат $Q = [{{B2.params.lo}};\\ {{B2.params.hi}}]^2$ из задачи B2 содержит точку ${{B2.steps.box}}$."
         },
         {
          "en": "**Probability simplex** $\\Delta_d = \\{x \\in \\mathbb R^d:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$, the set of probability distributions on $d$ outcomes. The answer of B1, ${{B1.steps.x}}$, lies in $\\Delta_4$: its coordinates are nonnegative and sum to ${{B1.steps.sumX}}$.",
          "ru": "**Вероятностный симплекс** $\\Delta_d = \\{x \\in \\mathbb R^d:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$ — множество распределений вероятностей на $d$ исходах. Ответ задачи B1, точка ${{B1.steps.x}}$, лежит в $\\Delta_4$: её координаты неотрицательны и в сумме дают ${{B1.steps.sumX}}$."
         }
        ]
       },
       {
        "type": "intuition",
        "text": {
         "en": "Linear functions commute with averaging, and a norm grows along a segment no faster than a linear function (the triangle inequality), so all these sets survive the segment test.",
         "ru": "Линейные функции перестановочны с усреднением, а норма вдоль отрезка растёт не быстрее линейной функции (неравенство треугольника), поэтому все эти множества выдерживают проверку отрезками."
        }
       }
      ]
     },
     {
      "id": "sets-operations",
      "title": {
       "en": "Operations that preserve convexity",
       "ru": "Операции, сохраняющие выпуклость"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Checking the definition directly is tedious. In practice a set is shown to be convex by assembling it from simple convex pieces with operations that preserve convexity:",
         "ru": "Проверять определение напрямую утомительно. На практике выпуклость множества доказывают, собирая его из простых выпуклых частей с помощью операций, сохраняющих выпуклость:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**intersection** of any family of convex sets: if $x$ and $y$ lie in every set of the family, so does the segment between them;",
          "ru": "**пересечение** любого семейства выпуклых множеств: если $x$ и $y$ лежат в каждом множестве семейства, то и отрезок между ними тоже;"
         },
         {
          "en": "**affine image and preimage**: for a convex $C$ the sets $\\{Ax + b:\\ x \\in C\\}$ and $\\{x:\\ Ax + b \\in C\\}$ are convex; for example, a half-space is the preimage of a ray;",
          "ru": "**аффинный образ и прообраз**: для выпуклого $C$ множества $\\{Ax + b:\\ x \\in C\\}$ и $\\{x:\\ Ax + b \\in C\\}$ выпуклы; например, полупространство — прообраз луча;"
         },
         {
          "en": "**Cartesian product**: a box is a product of intervals.",
          "ru": "**декартово произведение**: брус — произведение отрезков."
         }
        ]
       },
       {
        "type": "example",
        "text": {
         "en": "The set $T = {{A3.tex.T}}$ of A3 is the intersection of a disk and the region above a parabola, and both are convex. The point ${{ex.T.point}}$ lies in both: $x^2 + y^2 = {{ex.T.norm2}} \\le {{A3.params.radius2}}$ and $x^2 - {{A3.params.shift}} = {{ex.T.parab}} \\le y = 1$. Hence it lies in $T$.",
         "ru": "Множество $T = {{A3.tex.T}}$ из задачи A3 — пересечение круга и области над параболой, и оба множества выпуклы. Точка ${{ex.T.point}}$ лежит в обоих: $x^2 + y^2 = {{ex.T.norm2}} \\le {{A3.params.radius2}}$ и $x^2 - {{A3.params.shift}} = {{ex.T.parab}} \\le y = 1$. Значит, она лежит в $T$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "A **union** of convex sets, in contrast, is usually not convex.",
         "ru": "**Объединение** выпуклых множеств, напротив, как правило, не выпукло."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The feasible set of demo D1 is the union of two disks of radius ${{D1.params.radius}}$ centred at ${{D1.params.centers.1}}$ and ${{D1.params.centers.2}}$. The midpoint of the centres is the origin, at distance ${{D1.params.centers.2.1}} > {{D1.params.radius}}$ from both centres: it lies in neither disk, so the union is not convex.",
         "ru": "Допустимое множество демонстрации D1 — объединение двух кругов радиуса ${{D1.params.radius}}$ с центрами ${{D1.params.centers.1}}$ и ${{D1.params.centers.2}}$. Середина отрезка между центрами — начало координат; оно удалено от обоих центров на ${{D1.params.centers.2.1}} > {{D1.params.radius}}$ и не лежит ни в одном круге, так что объединение не выпукло."
        }
       }
      ]
     },
     {
      "id": "sets-sublevel",
      "title": {
       "en": "Sublevel sets and the epigraph",
       "ru": "Множества подуровня и надграфик"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "For a function $f$ and a number $\\alpha$, the **sublevel set** is $$\\{x:\\ f(x) \\le \\alpha\\}.$$ If $f$ is convex (see the next section), every sublevel set is convex: when $f(x) \\le \\alpha$ and $f(y) \\le \\alpha$, convexity gives $f\\big((1-t)x + ty\\big) \\le (1-t)\\alpha + t\\alpha = \\alpha$. This is why constraints $g_i(x) \\le 0$ with convex $g_i$ produce convex feasible sets.",
         "ru": "Для функции $f$ и числа $\\alpha$ **множество подуровня** — это $$\\{x:\\ f(x) \\le \\alpha\\}.$$ Если $f$ выпукла (см. следующий раздел), то любое её множество подуровня выпукло: при $f(x) \\le \\alpha$ и $f(y) \\le \\alpha$ выпуклость даёт $f\\big((1-t)x + ty\\big) \\le (1-t)\\alpha + t\\alpha = \\alpha$. Именно поэтому ограничения $g_i(x) \\le 0$ с выпуклыми $g_i$ задают выпуклые допустимые множества."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Take $f(x, y) = x^2 + {{A.widgets.sublevel.convexA}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$, the A1 family at $a = {{A.widgets.sublevel.convexA}}$, which is convex, and $\\alpha = {{A.widgets.sublevel.levelConvex}}$. The origin lies in $\\{f \\le \\alpha\\}$ because $f(0, 0) = {{A1.steps.fp}}$, and the whole sublevel set is a filled ellipse, a convex set (left panel of the figure below).",
         "ru": "Возьмём $f(x, y) = x^2 + {{A.widgets.sublevel.convexA}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$ — выпуклую функцию из семейства A1 при $a = {{A.widgets.sublevel.convexA}}$ — и $\\alpha = {{A.widgets.sublevel.levelConvex}}$. Начало координат лежит в $\\{f \\le \\alpha\\}$, так как $f(0, 0) = {{A1.steps.fp}}$, а всё множество подуровня — заполненный эллипс, выпуклое множество (левая часть рисунка ниже)."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The rule works in one direction only. A nonconvex function may have convex or nonconvex sublevel sets, so in that case the set has to be checked directly.",
         "ru": "Правило работает только в одну сторону. У невыпуклой функции множества подуровня могут оказаться как выпуклыми, так и невыпуклыми, поэтому в этом случае множество нужно проверять напрямую."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$S = {{A3.tex.S}}$ is the sublevel set of the nonconvex function $x^2y^2$ at level ${{A.widgets.sublevel.levelNonconvex}}$. The points $p = {{A3.tex.pHalf}}$ and $q = {{A3.tex.qHalf}}$ lie in $S$, but at their midpoint ${{A3.tex.mid}}$ we get $x^2y^2 = {{A3.tex.val}} > 1$. So $S$ is not convex (problem A3).",
         "ru": "$S = {{A3.tex.S}}$ — множество подуровня невыпуклой функции $x^2y^2$ на уровне ${{A.widgets.sublevel.levelNonconvex}}$. Точки $p = {{A3.tex.pHalf}}$ и $q = {{A3.tex.qHalf}}$ лежат в $S$, а в их середине ${{A3.tex.mid}}$ получаем $x^2y^2 = {{A3.tex.val}} > 1$. Значит, $S$ не выпукло (задача A3)."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_sublevel.svg",
        "alt": {
         "en": "Left: nested elliptical sublevel sets of a convex quadratic function, one of them shaded. Right: the cross-shaped sublevel set of the product of the squares of x and y.",
         "ru": "Слева: вложенные эллиптические множества подуровня выпуклой квадратичной функции, одно из них закрашено. Справа: крестообразное множество подуровня произведения квадратов x и y."
        },
        "caption": {
         "en": "Left: the sublevel sets of the convex function $f = x^2 + {{A.widgets.sublevel.convexA}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$ are nested ellipses; the set $\\{f \\le {{A.widgets.sublevel.levelConvex}} \\}$ is shaded. Right: the sublevel set $\\{x^2y^2 \\le {{A.widgets.sublevel.levelNonconvex}} \\}$ of a nonconvex function is a cross, which is not convex.",
         "ru": "Слева: множества подуровня выпуклой функции $f = x^2 + {{A.widgets.sublevel.convexA}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$ — вложенные эллипсы; множество $\\{f \\le {{A.widgets.sublevel.levelConvex}} \\}$ закрашено. Справа: множество подуровня $\\{x^2y^2 \\le {{A.widgets.sublevel.levelNonconvex}} \\}$ невыпуклой функции — крест, и оно не выпукло."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The **epigraph** of $f$ is the set of points on or above its graph: $$\\operatorname{epi} f = \\{(x, s):\\ s \\ge f(x)\\}.$$ A function is convex exactly when its epigraph is a convex set, so convexity of functions reduces to convexity of sets.",
         "ru": "**Надграфик** функции $f$ — множество точек на её графике и над ним: $$\\operatorname{epi} f = \\{(x, s):\\ s \\ge f(x)\\}.$$ Функция выпукла ровно тогда, когда её надграфик — выпуклое множество, так что выпуклость функций сводится к выпуклости множеств."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "For $f(x) = x^2 - {{A3.params.shift}}$ the point ${{ex.epi.point}}$ lies in $\\operatorname{epi} f$, since $f({{ex.epi.point.1}}) = {{ex.epi.value}} \\le {{ex.epi.point.2}}$. The piece $\\{y \\ge x^2 - {{A3.params.shift}} \\}$ of the set $T$ in A3 is exactly this epigraph, which is why it is convex.",
         "ru": "Для $f(x) = x^2 - {{A3.params.shift}}$ точка ${{ex.epi.point}}$ лежит в $\\operatorname{epi} f$, так как $f({{ex.epi.point.1}}) = {{ex.epi.value}} \\le {{ex.epi.point.2}}$. Часть $\\{y \\ge x^2 - {{A3.params.shift}} \\}$ множества $T$ из задачи A3 — в точности этот надграфик, поэтому она выпукла."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "functions",
    "title": {
     "en": "Convex functions",
     "ru": "Выпуклые функции"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Convex functions are the functions for which local information, such as a zero gradient or a tangent plane, leads to global conclusions.",
       "ru": "Выпуклые функции — это функции, для которых локальная информация, например нулевой градиент или касательная плоскость, позволяет делать глобальные выводы."
      }
     }
    ],
    "subsections": [
     {
      "id": "functions-definition",
      "title": {
       "en": "Definition and the Jensen inequality",
       "ru": "Определение и неравенство Йенсена"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "A function $f$ defined on a convex set is **convex** if its graph lies on or below every chord: $$f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y) \\quad \\text{for all } x, y \\text{ and } t \\in [0, 1].$$ The left-hand side is the value of $f$ at a point of the segment; the right-hand side is the height of the chord above that point. If the inequality is strict whenever $x \\ne y$ and $t \\in (0, 1)$, the function is **strictly convex**. A function $f$ is **concave** if $-f$ is convex.",
         "ru": "Функция $f$, заданная на выпуклом множестве, **выпукла**, если её график лежит не выше любой хорды: $$f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y) \\quad \\text{для всех } x, y \\text{ и } t \\in [0, 1].$$ Слева стоит значение $f$ в точке отрезка, справа — высота хорды над этой точкой. Если при $x \\ne y$ и $t \\in (0, 1)$ неравенство строгое, функция **строго выпукла**. Функция $f$ **вогнута**, если функция $-f$ выпукла."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$f(x) = \\|x\\|^2$ with $x = {{ex.combo.x}}$, $y = {{ex.combo.y}}$ and $t = {{ex.combo.tex.t}}$: the left-hand side is $f(z) = {{ex.combo.tex.norm2}}$, the right-hand side is $(1-t) \\cdot 1 + t \\cdot 1 = 1$, and indeed ${{ex.combo.tex.norm2}} \\le 1$.",
         "ru": "$f(x) = \\|x\\|^2$, $x = {{ex.combo.x}}$, $y = {{ex.combo.y}}$, $t = {{ex.combo.tex.t}}$: левая часть равна $f(z) = {{ex.combo.tex.norm2}}$, правая — $(1-t) \\cdot 1 + t \\cdot 1 = 1$, и действительно ${{ex.combo.tex.norm2}} \\le 1$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The same inequality for several points is the **Jensen inequality**: for weights $\\theta_i \\ge 0$ with $\\sum_i \\theta_i = 1$, $$f\\Big(\\sum_i \\theta_i x_i\\Big) \\le \\sum_i \\theta_i f(x_i).$$ For two points it is the definition, and the general case follows by induction. With two points and $\\theta_1 = \\theta_2 = \\tfrac12$ it becomes the midpoint test used in the seminar: one pair that violates it proves that $f$ is not convex.",
         "ru": "То же неравенство для нескольких точек называется **неравенством Йенсена**: для весов $\\theta_i \\ge 0$ с $\\sum_i \\theta_i = 1$ $$f\\Big(\\sum_i \\theta_i x_i\\Big) \\le \\sum_i \\theta_i f(x_i).$$ Для двух точек это определение, а общий случай получается по индукции. При двух точках и $\\theta_1 = \\theta_2 = \\tfrac12$ получается проверка в середине отрезка, которой мы пользуемся на семинаре: одна нарушающая пара доказывает, что $f$ не выпукла."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "A1 at $a = {{A1.params.aTest}}$: $f(x, y) = x^2 + {{A1.params.aTest}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$, $p = {{A1.params.p}}$, $q = {{A1.params.q}}$. The midpoint is $m = {{A1.steps.m}}$ with $f(m) = {{A1.tex.fm}}$, while the chord gives $\\tfrac12\\big(f(p) + f(q)\\big) = \\tfrac12\\big({{A1.steps.fp}} + {{A1.steps.fq}}\\big) = {{A1.steps.avg}}$. Since ${{A1.tex.fm}} > {{A1.steps.avg}}$, the function is not convex.",
         "ru": "A1 при $a = {{A1.params.aTest}}$: $f(x, y) = x^2 + {{A1.params.aTest}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$, $p = {{A1.params.p}}$, $q = {{A1.params.q}}$. Середина отрезка $m = {{A1.steps.m}}$, в ней $f(m) = {{A1.tex.fm}}$, а хорда даёт $\\tfrac12\\big(f(p) + f(q)\\big) = \\tfrac12\\big({{A1.steps.fp}} + {{A1.steps.fq}}\\big) = {{A1.steps.avg}}$. Так как ${{A1.tex.fm}} > {{A1.steps.avg}}$, функция не выпукла."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_jensen.svg",
        "alt": {
         "en": "Two panels, each showing a function of t along a segment together with its dashed chord. On the left the curve stays below the chord, on the right it rises above it.",
         "ru": "Две панели, на каждой функция от t вдоль отрезка и пунктирная хорда. Слева кривая остаётся ниже хорды, справа поднимается выше неё."
        },
        "caption": {
         "en": "The A1 family on the segment from $p = {{A1.params.p}}$ to $q = {{A1.params.q}}$ as a function of $t$, with the chord dashed. At $a = {{A1.params.aConvex}}$ the curve stays below the chord; at $a = {{A1.params.aTest}}$ the value at $t = \\tfrac12$ lies above the chord, and the Jensen inequality fails.",
         "ru": "Семейство из A1 на отрезке от $p = {{A1.params.p}}$ до $q = {{A1.params.q}}$ как функция от $t$; хорда показана пунктиром. При $a = {{A1.params.aConvex}}$ кривая не поднимается выше хорды, при $a = {{A1.params.aTest}}$ значение в точке $t = \\tfrac12$ лежит выше хорды, и неравенство Йенсена нарушено."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "For a quadratic function with Hessian $H$ the vertical distance between the chord and the graph has a closed form: $$(1-t)f(p) + t f(q) - f\\big((1-t)p + tq\\big) = \\frac{t(1-t)}{2}\\, d^\\top H d, \\qquad d = q - p.$$ Hence a quadratic function is convex exactly when $d^\\top H d \\ge 0$ for every $d$, that is, when $H \\succeq 0$.",
         "ru": "Для квадратичной функции с гессианом $H$ расстояние по вертикали между хордой и графиком выписывается явно: $$(1-t)f(p) + t f(q) - f\\big((1-t)p + tq\\big) = \\frac{t(1-t)}{2}\\, d^\\top H d, \\qquad d = q - p.$$ Поэтому квадратичная функция выпукла ровно тогда, когда $d^\\top H d \\ge 0$ для всех $d$, то есть когда $H \\succeq 0$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "A1 at $a = {{A1.params.aTest}}$ with $d = {{A1.steps.d}}$: $d^\\top H d = {{A1.steps.curv}}$, and at $t = \\tfrac12$ the formula gives $\\tfrac18 \\cdot ({{A1.steps.curv}}) = {{A1.steps.gap}}$, which is exactly ${{A1.steps.avg}} - {{A1.tex.fm}}$.",
         "ru": "A1 при $a = {{A1.params.aTest}}$ и $d = {{A1.steps.d}}$: $d^\\top H d = {{A1.steps.curv}}$, и при $t = \\tfrac12$ формула даёт $\\tfrac18 \\cdot ({{A1.steps.curv}}) = {{A1.steps.gap}}$ — ровно ${{A1.steps.avg}} - {{A1.tex.fm}}$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "Restricted to any line, a convex function is a convex function of one variable, and a single bad segment is enough to break convexity.",
         "ru": "На любой прямой выпуклая функция — выпуклая функция одной переменной, и одного «плохого» отрезка достаточно, чтобы выпуклость пропала."
        }
       }
      ]
     },
     {
      "id": "functions-first-order",
      "title": {
       "en": "The first-order test",
       "ru": "Критерий первого порядка"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Let $f$ be differentiable on an open convex set. Then $f$ is convex if and only if it lies on or above all its tangent planes: $$f(y) \\ge f(x) + \\nabla f(x)^\\top (y - x) \\quad \\text{for all } x, y.$$ The right-hand side is the linear approximation of $f$ at $x$. For a convex function it is a global lower bound, not only a local approximation.",
         "ru": "Пусть $f$ дифференцируема на открытом выпуклом множестве. Тогда $f$ выпукла в том и только в том случае, когда она лежит не ниже всех своих касательных плоскостей: $$f(y) \\ge f(x) + \\nabla f(x)^\\top (y - x) \\quad \\text{для всех } x, y.$$ Правая часть — линейное приближение $f$ в точке $x$. Для выпуклой функции это глобальная оценка снизу, а не только локальное приближение."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$f(x) = x^2$, $x = {{ex.first.x}}$, $y = {{ex.first.y}}$: $f(y) = {{ex.first.fy}}$ and $f(x) + f'(x)(y - x) = {{ex.first.fx}} + {{ex.first.slope}} \\cdot 2 = {{ex.first.tangent}}$. Indeed ${{ex.first.fy}} \\ge {{ex.first.tangent}}$.",
         "ru": "$f(x) = x^2$, $x = {{ex.first.x}}$, $y = {{ex.first.y}}$: $f(y) = {{ex.first.fy}}$, а $f(x) + f'(x)(y - x) = {{ex.first.fx}} + {{ex.first.slope}} \\cdot 2 = {{ex.first.tangent}}$. Действительно, ${{ex.first.fy}} \\ge {{ex.first.tangent}}$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The key consequence: if $\\nabla f(x^*) = 0$, the inequality gives $f(y) \\ge f(x^*)$ for every $y$. **For a convex function every stationary point is a global minimizer**, and the condition $\\nabla f = 0$ from Seminar 1 becomes sufficient.",
         "ru": "Главное следствие: если $\\nabla f(x^*) = 0$, неравенство даёт $f(y) \\ge f(x^*)$ для всех $y$. **У выпуклой функции любая стационарная точка — точка глобального минимума**, и условие $\\nabla f = 0$ из семинара 1 становится достаточным."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$f(x) = {{C1.tex.f}}$ from C1 is convex, and its gradient $\\nabla f(x) = 2(x - c)$ vanishes at $c = {{C1.params.c}}$. The tangent-plane bound at $c$ reads $f(y) \\ge f(c) = 0$ for every $y$, so without constraints $c$ is the global minimizer.",
         "ru": "$f(x) = {{C1.tex.f}}$ из задачи C1 выпукла, и её градиент $\\nabla f(x) = 2(x - c)$ обращается в нуль в точке $c = {{C1.params.c}}$. Оценка через касательную плоскость в $c$ даёт $f(y) \\ge f(c) = 0$ для всех $y$, так что без ограничений $c$ — точка глобального минимума."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "A convex function bends upward, so a tangent can touch its graph only from below.",
         "ru": "Выпуклая функция изгибается вверх, поэтому касательная может касаться её графика только снизу."
        }
       }
      ]
     },
     {
      "id": "functions-second-order",
      "title": {
       "en": "The second-order test",
       "ru": "Критерий второго порядка"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Let $f$ be twice continuously differentiable on an open convex set. Then $$f \\text{ is convex} \\iff \\nabla^2 f(x) \\succeq 0 \\text{ at every point } x.$$ Here $H \\succeq 0$ (positive semidefinite) means $d^\\top H d \\ge 0$ for every $d$, or equivalently, all eigenvalues of $H$ are nonnegative. If $\\nabla^2 f(x) \\succ 0$ everywhere, then $f$ is strictly convex; the converse fails, as $x^4$ shows at $x = 0$.",
         "ru": "Пусть $f$ дважды непрерывно дифференцируема на открытом выпуклом множестве. Тогда $$f \\text{ выпукла} \\iff \\nabla^2 f(x) \\succeq 0 \\text{ во всех точках } x.$$ Здесь $H \\succeq 0$ (положительная полуопределённость) означает, что $d^\\top H d \\ge 0$ для любого $d$, или, что то же самое, все собственные значения $H$ неотрицательны. Если $\\nabla^2 f(x) \\succ 0$ всюду, то $f$ строго выпукла; обратное неверно, как показывает $x^4$ в точке $x = 0$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "For a symmetric $2 \\times 2$ matrix the test reduces to minors: $$H \\succeq 0 \\iff H_{11} \\ge 0,\\ H_{22} \\ge 0,\\ \\det H \\ge 0; \\qquad H \\succ 0 \\iff H_{11} > 0,\\ \\det H > 0.$$ For semidefiniteness all principal minors are needed, including $H_{22}$, not only the leading ones.",
         "ru": "Для симметричной матрицы $2 \\times 2$ проверка сводится к минорам: $$H \\succeq 0 \\iff H_{11} \\ge 0,\\ H_{22} \\ge 0,\\ \\det H \\ge 0; \\qquad H \\succ 0 \\iff H_{11} > 0,\\ \\det H > 0.$$ Для полуопределённости нужны все главные миноры, в том числе $H_{22}$, а не только угловые."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "A1 at $a = {{ex.hess.a}}$: $H = {{ex.hess.tex.H}}$, $H_{11} = {{A1.steps.minor11}} > 0$ and $\\det H = {{A1.steps.detConst}} - {{ex.hess.a}}^2 = {{ex.hess.det}} > 0$. The Hessian is the same at every point and positive definite, so $f$ is strictly convex.",
         "ru": "A1 при $a = {{ex.hess.a}}$: $H = {{ex.hess.tex.H}}$, $H_{11} = {{A1.steps.minor11}} > 0$ и $\\det H = {{A1.steps.detConst}} - {{ex.hess.a}}^2 = {{ex.hess.det}} > 0$. Гессиан одинаков во всех точках и положительно определён, поэтому $f$ строго выпукла."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "A2, $f(x, y) = {{A2.tex.f}}$: at the point ${{A2.params.point}}$ the Hessian is ${{A2.tex.HPoint}}$ with $\\det H = {{A2.steps.detPoint}} < 0$. Its eigenvalues ${{A2.steps.eig.1}}$ and ${{A2.steps.eig.2}}$ have opposite signs, so $f$ is not convex.",
         "ru": "A2, $f(x, y) = {{A2.tex.f}}$: в точке ${{A2.params.point}}$ гессиан равен ${{A2.tex.HPoint}}$, $\\det H = {{A2.steps.detPoint}} < 0$. Его собственные значения ${{A2.steps.eig.1}}$ и ${{A2.steps.eig.2}}$ разных знаков, поэтому $f$ не выпукла."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The Hessian of a quadratic function $f(x) = \\tfrac12 x^\\top Q x + b^\\top x$ is the constant matrix $Q$. A cross term $c\\,x_ix_j$ contributes $c$ to both entries $H_{ij}$ and $H_{ji}$, not $c/2$.",
         "ru": "Гессиан квадратичной функции $f(x) = \\tfrac12 x^\\top Q x + b^\\top x$ — постоянная матрица $Q$. Смешанное слагаемое $c\\,x_ix_j$ даёт $c$ в оба элемента $H_{ij}$ и $H_{ji}$, а не $c/2$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "For $x^2 + {{ex.hess.a}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$: $\\partial^2 f/\\partial x^2 = 2$, $\\partial^2 f/\\partial y^2 = {{A1.steps.minor22}}$ and $\\partial^2 f/\\partial x\\,\\partial y = {{ex.hess.a}}$, which is the matrix $H$ above.",
         "ru": "Для $x^2 + {{ex.hess.a}}\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$: $\\partial^2 f/\\partial x^2 = 2$, $\\partial^2 f/\\partial y^2 = {{A1.steps.minor22}}$ и $\\partial^2 f/\\partial x\\,\\partial y = {{ex.hess.a}}$ — это и есть матрица $H$ выше."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Convexity of functions is preserved by **nonnegative weighted sums**, by **composition with an affine map** $x \\mapsto Ax + b$ and by the **pointwise maximum**.",
         "ru": "Выпуклость функций сохраняется при **неотрицательных взвешенных суммах**, при **композиции с аффинным отображением** $x \\mapsto Ax + b$ и при **поточечном максимуме**."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$f(x) = {{C1.tex.f}}$ is a sum of squares of affine functions, hence convex; its Hessian is $2I \\succeq 0$. The constraint function $g(x) = {{C1.tex.g}}$ is affine with zero Hessian: it is both convex and concave.",
         "ru": "$f(x) = {{C1.tex.f}}$ — сумма квадратов аффинных функций, поэтому выпукла; её гессиан равен $2I \\succeq 0$. Функция ограничения $g(x) = {{C1.tex.g}}$ аффинна, её гессиан нулевой: она одновременно выпукла и вогнута."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "The Hessian measures curvature: a convex function curves upward, or at least not downward, in every direction at every point.",
         "ru": "Гессиан измеряет кривизну: выпуклая функция в каждой точке и в каждом направлении изгибается вверх или хотя бы не вниз."
        }
       }
      ]
     },
     {
      "id": "functions-local-global",
      "title": {
       "en": "Why a local minimum is global",
       "ru": "Почему локальный минимум глобален"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "A **convex problem** minimizes a convex function $f$ over a convex set $X$. Let $x^*$ be a local minimizer and suppose that some $y \\in X$ had $f(y) < f(x^*)$. The segment from $x^*$ to $y$ stays in $X$, and by convexity $$f\\big((1-t)x^* + ty\\big) \\le (1-t)f(x^*) + t f(y) < f(x^*) \\quad \\text{for every } t \\in (0, 1].$$ Points with small $t$ are arbitrarily close to $x^*$ and strictly better, which contradicts local optimality. Hence **in a convex problem every local minimizer is global**, and the set of all minimizers is convex.",
         "ru": "**Выпуклая задача** — это минимизация выпуклой функции $f$ на выпуклом множестве $X$. Пусть $x^*$ — точка локального минимума, и предположим, что нашлась точка $y \\in X$ с $f(y) < f(x^*)$. Отрезок от $x^*$ до $y$ лежит в $X$, и по выпуклости $$f\\big((1-t)x^* + ty\\big) \\le (1-t)f(x^*) + t f(y) < f(x^*) \\quad \\text{для всех } t \\in (0, 1].$$ Точки с малым $t$ сколь угодно близки к $x^*$ и строго лучше неё, а это противоречит локальной оптимальности. Значит, **в выпуклой задаче любой локальный минимум глобален**, а множество всех точек минимума выпукло."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Both convexities are needed. In demo D1 the function $f(x) = \\|x - c\\|^2$ with $c = {{D1.params.c}}$ is convex, but the feasible set is the union of two disks. Projected gradient (a gradient step followed by a projection, see the section on projections) from {{D1.result.nStarts}} starting points ends in two different places: {{D1.result.nGlobal}} runs reach the global minimizer with $f = {{ex.local.fGlobal}}$, and {{D1.result.nLocal}} runs stop at a local minimizer with $f = {{ex.local.fLocal}}$. On the convex hull of the two disks all runs end at the same point ${{D1.result.capsule}}$.",
         "ru": "Нужны обе выпуклости. В демонстрации D1 функция $f(x) = \\|x - c\\|^2$ с $c = {{D1.params.c}}$ выпукла, но допустимое множество — объединение двух кругов. Проекционный градиентный спуск (шаг по антиградиенту и проекция, см. раздел о проекциях) из {{D1.result.nStarts}} начальных точек приходит в два разных места: {{D1.result.nGlobal}} запусков находят глобальный минимум с $f = {{ex.local.fGlobal}}$, а {{D1.result.nLocal}} останавливаются в локальном минимуме с $f = {{ex.local.fLocal}}$. На выпуклой оболочке двух кругов все запуски приходят в одну и ту же точку ${{D1.result.capsule}}$."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_pgd.svg",
        "alt": {
         "en": "Two panels with projected gradient paths from the same starting points. On the union of two disks the paths end at two different points; on the convex hull of the disks they all end at one point.",
         "ru": "Две панели с траекториями проекционного градиентного спуска из одних и тех же начальных точек. На объединении двух кругов траектории заканчиваются в двух разных точках, на выпуклой оболочке кругов — в одной."
        },
        "caption": {
         "en": "Projected gradient for $f(x) = \\|x - c\\|^2$, $c = {{D1.params.c}}$, with step ${{D1.params.step}}$ from the same {{D1.result.nStarts}} starting points. Left: the union of two disks, where the runs end at the global minimizer or at a local one. Right: the convex hull of the disks, where every run ends at ${{D1.result.capsule}}$.",
         "ru": "Проекционный градиентный спуск для $f(x) = \\|x - c\\|^2$, $c = {{D1.params.c}}$, с шагом ${{D1.params.step}}$ из одних и тех же {{D1.result.nStarts}} начальных точек. Слева — объединение двух кругов: запуски заканчиваются в глобальном или в локальном минимуме. Справа — выпуклая оболочка кругов: все запуски приходят в ${{D1.result.capsule}}$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "A convex problem has no side valleys: from any point, the straight path to a better point goes downhill right from the start.",
         "ru": "У выпуклой задачи нет боковых впадин: из любой точки прямой путь к лучшей точке сразу идёт вниз."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "constrained",
    "title": {
     "en": "Constrained problems",
     "ru": "Задачи с ограничениями"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "From now on the minimum is sought over a set described by constraints.",
       "ru": "Дальше минимум ищется на множестве, заданном ограничениями."
      }
     }
    ],
    "subsections": [
     {
      "id": "constrained-feasible",
      "title": {
       "en": "The feasible set",
       "ru": "Допустимое множество"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "In the convention of this handout a constrained problem reads $$\\min_x f(x) \\quad \\text{subject to} \\quad g_i(x) \\le 0,\\ \\ h_j(x) = 0.$$ A point that satisfies all constraints is **feasible**, the set $X$ of feasible points is the **feasible set**, and $p^* = \\inf_{x \\in X} f(x)$ is the **optimal value**.",
         "ru": "В принятом соглашении задача с ограничениями имеет вид $$\\min_x f(x) \\quad \\text{при} \\quad g_i(x) \\le 0,\\ \\ h_j(x) = 0.$$ Точка, удовлетворяющая всем ограничениям, называется **допустимой**, множество $X$ допустимых точек — **допустимым множеством**, а $p^* = \\inf_{x \\in X} f(x)$ — **оптимальным значением**."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1: $f(x) = {{C1.tex.f}}$, $g(x) = {{C1.tex.g}}$. The point ${{ex.slater.point}}$ is feasible: there $g = {{ex.slater.g}} \\le 0$. The unconstrained minimizer ${{C1.steps.xUnc}}$ is infeasible: there $g = {{C1.steps.gUnc}} > 0$. The constraint pushes the solution away from it, and $p^* = {{C1.answer.f.value}}$.",
         "ru": "C1: $f(x) = {{C1.tex.f}}$, $g(x) = {{C1.tex.g}}$. Точка ${{ex.slater.point}}$ допустима: в ней $g = {{ex.slater.g}} \\le 0$. Безусловный минимум ${{C1.steps.xUnc}}$ недопустим: в нём $g = {{C1.steps.gUnc}} > 0$. Ограничение уводит решение от этой точки, и $p^* = {{C1.answer.f.value}}$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The problem is **convex** if $f$ and all $g_i$ are convex and all $h_j$ are affine. Then $X$ is convex: each $\\{g_i \\le 0\\}$ is a sublevel set of a convex function, each $\\{h_j = 0\\}$ is an affine set, and $X$ is their intersection. A nonlinear equality usually destroys convexity.",
         "ru": "Задача **выпукла**, если $f$ и все $g_i$ выпуклы, а все $h_j$ аффинны. Тогда $X$ выпукло: каждое $\\{g_i \\le 0\\}$ — множество подуровня выпуклой функции, каждое $\\{h_j = 0\\}$ — аффинное множество, а $X$ — их пересечение. Нелинейное равенство, как правило, выпуклость разрушает."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The constraint $x_1^2 = 1$ allows only $x_1 = -1$ and $x_1 = 1$, but not their midpoint $0$. Constraints of this kind make the Boolean problem of the duality section nonconvex.",
         "ru": "Ограничение $x_1^2 = 1$ допускает только $x_1 = -1$ и $x_1 = 1$, но не их середину $0$. Именно такие ограничения делают невыпуклой булеву задачу из раздела о двойственности."
        }
       }
      ]
     },
     {
      "id": "constrained-active",
      "title": {
       "en": "Active constraints",
       "ru": "Активные ограничения"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "An inequality constraint is **active** at a feasible point $x$ if $g_i(x) = 0$, and **inactive** if $g_i(x) < 0$. An inactive constraint does not restrict small moves: near $x$ it still holds. Equality constraints are active at every feasible point.",
         "ru": "Ограничение-неравенство **активно** в допустимой точке $x$, если $g_i(x) = 0$, и **неактивно**, если $g_i(x) < 0$. Неактивное ограничение не мешает малым сдвигам: вблизи $x$ оно по-прежнему выполнено. Ограничения-равенства активны в любой допустимой точке."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "At the solution of C1, $x^* = {{C1.answer.x.value}}$, we have $g(x^*) = {{C1.cand.S1.g.1}}$: the constraint is active. At the solution of C2, $x^* = {{C2.answer.x.value}}$, we have $g(x^*) = {{C2.steps.gStar}} < 0$: the constraint is inactive. At the solution of C3, $x^* = {{C3.answer.x.value}}$, both constraints are active: $g_1(x^*) = {{C3.cand.S12.g.1}}$ and $g_2(x^*) = {{C3.cand.S12.g.2}}$.",
         "ru": "В решении задачи C1, $x^* = {{C1.answer.x.value}}$, имеем $g(x^*) = {{C1.cand.S1.g.1}}$: ограничение активно. В решении задачи C2, $x^* = {{C2.answer.x.value}}$, имеем $g(x^*) = {{C2.steps.gStar}} < 0$: ограничение неактивно. В решении задачи C3, $x^* = {{C3.answer.x.value}}$, активны оба ограничения: $g_1(x^*) = {{C3.cand.S12.g.1}}$ и $g_2(x^*) = {{C3.cand.S12.g.2}}$."
        }
       }
      ]
     },
     {
      "id": "constrained-directions",
      "title": {
       "en": "From Seminar 1: feasible directions",
       "ru": "Из семинара 1: допустимые направления"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Seminar 1 ended with the first-order condition on the boundary: if $x^*$ is a local minimizer, then $$s^\\top \\nabla f(x^*) \\ge 0 \\quad \\text{for every feasible direction } s,$$ so no direction that keeps us feasible decreases $f$ to first order. For smooth constraints, $s$ is a (first-order) feasible direction at $x$ if $\\nabla g_i(x)^\\top s \\le 0$ for every active $i$ and $\\nabla h_j(x)^\\top s = 0$ for every $j$. Inactive constraints impose nothing.",
         "ru": "Семинар 1 закончился условием первого порядка на границе: если $x^*$ — точка локального минимума, то $$s^\\top \\nabla f(x^*) \\ge 0 \\quad \\text{для любого допустимого направления } s,$$ то есть ни одно направление, не выводящее из допустимого множества, не уменьшает $f$ в первом порядке. Для гладких ограничений $s$ — допустимое (в первом порядке) направление в точке $x$, если $\\nabla g_i(x)^\\top s \\le 0$ для всех активных $i$ и $\\nabla h_j(x)^\\top s = 0$ для всех $j$. Неактивные ограничения ничего не требуют."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1 at $x^* = {{C1.answer.x.value}}$: $\\nabla g = {{ex.dir.gradG}}$ and $\\nabla f(x^*) = {{ex.dir.gradF}}$. The direction $s = {{ex.dir.d}}$ is feasible, since $\\nabla g^\\top s = {{ex.dir.gd}} \\le 0$, and it does not decrease $f$: $\\nabla f(x^*)^\\top s = {{ex.dir.fd}} \\ge 0$.",
         "ru": "C1 в точке $x^* = {{C1.answer.x.value}}$: $\\nabla g = {{ex.dir.gradG}}$, $\\nabla f(x^*) = {{ex.dir.gradF}}$. Направление $s = {{ex.dir.d}}$ допустимо, так как $\\nabla g^\\top s = {{ex.dir.gd}} \\le 0$, и не уменьшает $f$: $\\nabla f(x^*)^\\top s = {{ex.dir.fd}} \\ge 0$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Checking all feasible directions one by one is impossible. The KKT conditions below replace this infinite family of inequalities by finitely many equations: under a constraint qualification, the condition holds exactly when $-\\nabla f(x^*)$ is a nonnegative combination of the gradients of the active inequalities plus a combination of the gradients of the equalities.",
         "ru": "Перебрать все допустимые направления невозможно. Условия ККТ, о которых речь пойдёт ниже, заменяют это бесконечное семейство неравенств конечным числом уравнений: при условии регулярности неравенство выполнено ровно тогда, когда $-\\nabla f(x^*)$ — сумма неотрицательной комбинации градиентов активных неравенств и какой-то комбинации градиентов равенств."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "In C1, $-\\nabla f(x^*) = {{C1.steps.minusGrad}} = {{C1.answer.lam.value}} \\cdot {{ex.dir.gradG}}$. Then for every $s$ with $\\nabla g^\\top s \\le 0$ we get $\\nabla f(x^*)^\\top s = -{{C1.answer.lam.value}}\\, \\nabla g^\\top s \\ge 0$: all feasible directions pass the test at once.",
         "ru": "В C1 $-\\nabla f(x^*) = {{C1.steps.minusGrad}} = {{C1.answer.lam.value}} \\cdot {{ex.dir.gradG}}$. Тогда для любого $s$ с $\\nabla g^\\top s \\le 0$ получаем $\\nabla f(x^*)^\\top s = -{{C1.answer.lam.value}}\\, \\nabla g^\\top s \\ge 0$: все допустимые направления проходят проверку сразу."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "A minimizer on the boundary is a point from which every downhill direction leads out of the feasible set.",
         "ru": "Минимум на границе — это точка, из которой любое направление спуска ведёт за пределы допустимого множества."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "projections",
    "title": {
     "en": "Projections",
     "ru": "Проекции"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "The projection onto a set is the simplest constrained problem and a building block of methods for constrained optimization.",
       "ru": "Проекция на множество — простейшая задача с ограничениями и строительный блок методов условной оптимизации."
      }
     }
    ],
    "subsections": [
     {
      "id": "projections-definition",
      "title": {
       "en": "Definition",
       "ru": "Определение"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The **Euclidean projection** of a point $x$ onto a set $C$ is the point of $C$ nearest to $x$: $$P_C(x) = \\arg\\min_{y \\in C} \\|y - x\\|.$$ For a nonempty closed convex set it exists and is unique, and $P_C(x) = x$ whenever $x \\in C$. Minimizing $\\|y - c\\|^2$ over $C$ is the same as projecting $c$ onto $C$.",
         "ru": "**Евклидова проекция** точки $x$ на множество $C$ — ближайшая к $x$ точка множества $C$: $$P_C(x) = \\arg\\min_{y \\in C} \\|y - x\\|.$$ Для непустого замкнутого выпуклого множества она существует и единственна, и $P_C(x) = x$, если $x \\in C$. Минимизировать $\\|y - c\\|^2$ на $C$ — то же самое, что проецировать $c$ на $C$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The opening problem of the seminar: minimize $\\|x - c\\|^2$ over the unit ball with $c = {{hook.ball.c}}$. Since $\\|c\\| = {{hook.ball.norm}} > {{hook.ball.r}}$, the point $c$ is outside, and the minimizer is its projection $x^* = {{hook.ball.x}}$ on the boundary, at squared distance ${{hook.ball.dist2}}$ from $c$.",
         "ru": "Задача из начала семинара: минимизировать $\\|x - c\\|^2$ на единичном шаре при $c = {{hook.ball.c}}$. Так как $\\|c\\| = {{hook.ball.norm}} > {{hook.ball.r}}$, точка $c$ лежит вне шара, и минимум — её проекция $x^* = {{hook.ball.x}}$ на границе; квадрат расстояния до $c$ равен ${{hook.ball.dist2}}$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "For a nonconvex set the nearest point need not be unique: the origin is equally close to both disks of demo D1 and has one nearest point in each of them.",
         "ru": "Для невыпуклого множества ближайшая точка может быть не единственной: начало координат одинаково близко к обоим кругам демонстрации D1 и имеет по ближайшей точке в каждом из них."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "A convex set cannot have two different nearest points: their midpoint would lie in the set and be strictly closer.",
         "ru": "Двух разных ближайших точек у выпуклого множества быть не может: их середина лежала бы в множестве и была бы строго ближе."
        }
       }
      ]
     },
     {
      "id": "projections-ball-box",
      "title": {
       "en": "Ball and box",
       "ru": "Шар и брус"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "**Ball** $B = \\{y:\\ \\|y - c\\| \\le r\\}$: a point outside moves to the boundary along the ray from the centre, $$P_B(x) = c + r\\,\\frac{x - c}{\\max(r,\\ \\|x - c\\|)}.$$ The maximum in the denominator leaves points inside the ball unchanged.",
         "ru": "**Шар** $B = \\{y:\\ \\|y - c\\| \\le r\\}$: внешняя точка сдвигается на границу вдоль луча из центра, $$P_B(x) = c + r\\,\\frac{x - c}{\\max(r,\\ \\|x - c\\|)}.$$ Максимум в знаменателе оставляет точки внутри шара на месте."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "B2: $c = 0$, $r = {{B2.params.r}}$, $x = {{B2.params.x}}$. Here $\\|x\\|^2 = {{B2.steps.norm2}}$ and $\\|x\\| = {{B2.steps.norm}} > {{B2.params.r}}$, so $P_B(x) = x/{{B2.steps.norm}} = {{B2.steps.ball}}$, at distance ${{B2.steps.distBall}}$ from $x$.",
         "ru": "B2: $c = 0$, $r = {{B2.params.r}}$, $x = {{B2.params.x}}$. Здесь $\\|x\\|^2 = {{B2.steps.norm2}}$ и $\\|x\\| = {{B2.steps.norm}} > {{B2.params.r}}$, поэтому $P_B(x) = x/{{B2.steps.norm}} = {{B2.steps.ball}}$; расстояние до $x$ равно ${{B2.steps.distBall}}$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "**Box** $Q = \\{y:\\ l_i \\le y_i \\le u_i\\}$: the constraints on different coordinates are independent, so every coordinate is clipped separately: $$\\big(P_Q(x)\\big)_i = \\min\\big(\\max(x_i,\\ l_i),\\ u_i\\big).$$",
         "ru": "**Брус** $Q = \\{y:\\ l_i \\le y_i \\le u_i\\}$: ограничения на разные координаты независимы, поэтому каждая координата обрезается отдельно: $$\\big(P_Q(x)\\big)_i = \\min\\big(\\max(x_i,\\ l_i),\\ u_i\\big).$$"
        }
       },
       {
        "type": "example",
        "text": {
         "en": "B2: $Q = [{{B2.params.lo}}, {{B2.params.hi}}]^2$ and $x = {{B2.params.x}}$. The first coordinate is in range and stays, the second is clipped: $P_Q(x) = {{B2.steps.box}}$, at distance ${{B2.steps.distBox}}$ from $x$. The box is closer than the ball, as it must be, because $B \\subset Q$.",
         "ru": "B2: $Q = [{{B2.params.lo}};\\ {{B2.params.hi}}]^2$, $x = {{B2.params.x}}$. Первая координата в допустимых пределах и не меняется, вторая обрезается: $P_Q(x) = {{B2.steps.box}}$, расстояние до $x$ равно ${{B2.steps.distBox}}$. Брус ближе шара, как и должно быть: $B \\subset Q$."
        }
       }
      ]
     },
     {
      "id": "projections-simplex",
      "title": {
       "en": "The probability simplex",
       "ru": "Вероятностный симплекс"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The projection onto $\\Delta_d$ has the form $$P_\\Delta(v) = \\max(v - \\theta\\mathbf 1,\\ 0) \\quad \\text{coordinatewise},$$ where the shift $\\theta$ is the unique number for which the coordinates of the result sum to $1$. The sort-based algorithm finds $\\theta$ exactly:",
         "ru": "Проекция на $\\Delta_d$ имеет вид $$P_\\Delta(v) = \\max(v - \\theta\\mathbf 1,\\ 0) \\quad \\text{покоординатно},$$ где сдвиг $\\theta$ — единственное число, при котором координаты результата в сумме дают $1$. Сортировочный алгоритм находит $\\theta$ точно:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**sort** $v$ in decreasing order: $u_1 \\ge u_2 \\ge \\dots \\ge u_d$;",
          "ru": "**сортируем** $v$ по убыванию: $u_1 \\ge u_2 \\ge \\dots \\ge u_d$;"
         },
         {
          "en": "**accumulate**: $s_j = u_1 + \\dots + u_j$;",
          "ru": "**накапливаем** суммы: $s_j = u_1 + \\dots + u_j$;"
         },
         {
          "en": "**test**: $t_j = u_j - (s_j - 1)/j$, and $\\rho$ is the last $j$ with $t_j > 0$ (the first test value always equals $1$);",
          "ru": "**проверяем**: $t_j = u_j - (s_j - 1)/j$, и $\\rho$ — последний номер $j$ с $t_j > 0$ (первое пробное значение всегда равно $1$);"
         },
         {
          "en": "**shift and clip**: $\\theta = (s_\\rho - 1)/\\rho$ and $x = \\max(v - \\theta,\\ 0)$, in the original order of the coordinates.",
          "ru": "**сдвигаем и обрезаем**: $\\theta = (s_\\rho - 1)/\\rho$ и $x = \\max(v - \\theta,\\ 0)$ в исходном порядке координат."
         }
        ]
       },
       {
        "type": "example",
        "text": {
         "en": "The simplex from the opening problem: $c = {{hook.simplex.c}}$ is already sorted, the algorithm gives $\\theta = {{hook.simplex.theta}}$, and $P_\\Delta(c) = {{hook.simplex.x}}$. The coordinates sum to $1$, and the negative coordinate became zero. Problems B1 and B3 go through every step with a table.",
         "ru": "Симплекс из начала семинара: вектор $c = {{hook.simplex.c}}$ уже отсортирован, алгоритм даёт $\\theta = {{hook.simplex.theta}}$ и $P_\\Delta(c) = {{hook.simplex.x}}$. Координаты в сумме дают $1$, отрицательная координата обнулилась. В задачах B1 и B3 все шаги проделаны с таблицей."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "A coordinate becomes zero whenever it does not exceed $\\theta$, whatever its sign.",
         "ru": "Координата обнуляется всякий раз, когда она не больше $\\theta$, независимо от её знака."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "B3: $v = {{B3.params.v}}$ gives $\\theta = {{B3.steps.theta}}$ and $P_\\Delta(v) = {{B3.steps.x}}$. The first coordinate ${{B3.params.v.1}}$ is positive but smaller than $\\theta$, so it vanishes.",
         "ru": "B3: для $v = {{B3.params.v}}$ получаем $\\theta = {{B3.steps.theta}}$ и $P_\\Delta(v) = {{B3.steps.x}}$. Первая координата ${{B3.params.v.1}}$ положительна, но меньше $\\theta$, поэтому обнуляется."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "The KKT conditions for the simplex say that all surviving coordinates are shifted by the same $\\theta$ and the others are cut at zero; sorting tells how many coordinates survive.",
         "ru": "Условия ККТ для симплекса говорят, что все «выжившие» координаты сдвигаются на одно и то же $\\theta$, а остальные обрезаются до нуля; сортировка показывает, сколько координат выживет."
        }
       }
      ]
     },
     {
      "id": "projections-obtuse",
      "title": {
       "en": "The obtuse-angle property",
       "ru": "Свойство тупого угла"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "For a closed convex set $C$, a point $p \\in C$ is the projection of $x$ if and only if $$(x - p)^\\top (y - p) \\le 0 \\quad \\text{for every } y \\in C.$$ The vector from $p$ back to $x$ makes an obtuse or right angle with every direction from $p$ into the set. The property is a certificate: a claimed projection can be verified without redoing the computation.",
         "ru": "Для замкнутого выпуклого множества $C$ точка $p \\in C$ является проекцией $x$ тогда и только тогда, когда $$(x - p)^\\top (y - p) \\le 0 \\quad \\text{для всех } y \\in C.$$ Вектор из $p$ обратно в $x$ образует тупой или прямой угол с любым направлением из $p$ внутрь множества. Это свойство — сертификат: предъявленную проекцию можно проверить, не повторяя вычислений."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "B2, the ball: $p = P_B(x) = {{B2.steps.ball}}$ and $y = {{B2.steps.yBall}} \\in B$ give $(x - p)^\\top (y - p) = {{B2.steps.obtuseBall}} \\le 0$. The box: $p = P_Q(x) = {{B2.steps.box}}$ and $y = {{B2.steps.yBox}} \\in Q$ give ${{B2.steps.obtuseBox}} \\le 0$.",
         "ru": "B2, шар: $p = P_B(x) = {{B2.steps.ball}}$ и $y = {{B2.steps.yBall}} \\in B$ дают $(x - p)^\\top (y - p) = {{B2.steps.obtuseBall}} \\le 0$. Брус: $p = P_Q(x) = {{B2.steps.box}}$ и $y = {{B2.steps.yBox}} \\in Q$ дают ${{B2.steps.obtuseBox}} \\le 0$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "For a polytope such as the simplex, $(x - p)^\\top (y - p)$ is linear in $y$, so it is enough to check the vertices.",
         "ru": "Для многогранника, например симплекса, выражение $(x - p)^\\top (y - p)$ линейно по $y$, поэтому достаточно проверить вершины."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "B1: $r = v - x = {{B1.steps.r}}$ and $r^\\top x = {{B1.steps.rx}}$. At the vertices $e_k$ the values $r^\\top (e_k - x) = r_k - r^\\top x$ are ${{B1.steps.vertex}}$, all $\\le 0$.",
         "ru": "B1: $r = v - x = {{B1.steps.r}}$ и $r^\\top x = {{B1.steps.rx}}$. В вершинах $e_k$ значения $r^\\top (e_k - x) = r_k - r^\\top x$ равны ${{B1.steps.vertex}}$, все $\\le 0$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "If some $y \\in C$ formed an acute angle, a small step from $p$ towards $y$ would stay in $C$ and come closer to $x$.",
         "ru": "Если бы какая-то точка $y \\in C$ давала острый угол, малый шаг из $p$ в сторону $y$ остался бы в $C$ и приблизил бы нас к $x$."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_projections.svg",
        "alt": {
         "en": "Left: a point outside the unit disk and the square, its projections onto both sets and the segment of the simplex. Right: the triangle of the simplex in three-dimensional space with a point outside it, its projection onto an edge and a point inside that forms an obtuse angle.",
         "ru": "Слева: точка вне единичного круга и квадрата, её проекции на оба множества и отрезок симплекса. Справа: треугольник симплекса в трёхмерном пространстве, точка вне его, её проекция на сторону и точка внутри, образующая тупой угол."
        },
        "caption": {
         "en": "Left: the point $x = {{B2.params.x}}$, its projections $P_B(x) = {{B2.steps.ball}}$ onto the unit disk and $P_Q(x) = {{B2.steps.box}}$ onto the square $[{{B2.params.lo}}, {{B2.params.hi}}]^2$; the red segment is the simplex $\\Delta_2$. Right: the triangle $\\Delta_3$ in the plane $\\mathbf 1^\\top x = 1$, the point $v$ of B3 shifted into this plane, its projection $P(v) = {{B3.steps.x}}$ on an edge, and a point $y \\in \\Delta_3$: the angle between $v - P(v)$ and $y - P(v)$ is obtuse.",
         "ru": "Слева: точка $x = {{B2.params.x}}$, её проекции $P_B(x) = {{B2.steps.ball}}$ на единичный круг и $P_Q(x) = {{B2.steps.box}}$ на квадрат $[{{B2.params.lo}};\\ {{B2.params.hi}}]^2$; красный отрезок — симплекс $\\Delta_2$. Справа: треугольник $\\Delta_3$ в плоскости $\\mathbf 1^\\top x = 1$, точка $v$ из задачи B3, сдвинутая в эту плоскость, её проекция $P(v) = {{B3.steps.x}}$ на сторону и точка $y \\in \\Delta_3$: угол между $v - P(v)$ и $y - P(v)$ тупой."
        }
       }
      ]
     },
     {
      "id": "projections-pgd",
      "title": {
       "en": "Projected gradient",
       "ru": "Проекционный градиентный спуск"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Projections turn gradient descent into a method for constrained problems: take a gradient step, then project back onto the feasible set, $$x_{k+1} = P_X\\big(x_k - \\alpha \\nabla f(x_k)\\big).$$ The method stops when $x = P_X\\big(x - \\alpha \\nabla f(x)\\big)$. For a convex $X$, the obtuse-angle property turns this into $\\nabla f(x)^\\top (y - x) \\ge 0$ for every $y \\in X$: the first-order condition along every feasible direction $y - x$.",
         "ru": "Проекции превращают градиентный спуск в метод для задач с ограничениями: делаем шаг по антиградиенту и проецируем обратно на допустимое множество, $$x_{k+1} = P_X\\big(x_k - \\alpha \\nabla f(x_k)\\big).$$ Метод останавливается, когда $x = P_X\\big(x - \\alpha \\nabla f(x)\\big)$. Для выпуклого $X$ свойство тупого угла превращает это равенство в $\\nabla f(x)^\\top (y - x) \\ge 0$ для всех $y \\in X$ — условие первого порядка вдоль любого допустимого направления $y - x$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Demo D1 runs the method with $\\alpha = {{D1.params.step}}$ for $f(x) = \\|x - c\\|^2$, $c = {{D1.params.c}}$. On the convex hull of the two disks every run stops at ${{D1.result.capsule}}$, where $f = {{D1.result.fCapsule}}$. On the union of the disks the stopping condition holds only locally, and the runs stop at two different points, with $f = {{ex.local.fGlobal}}$ and $f = {{ex.local.fLocal}}$.",
         "ru": "В демонстрации D1 метод запускается с $\\alpha = {{D1.params.step}}$ для $f(x) = \\|x - c\\|^2$, $c = {{D1.params.c}}$. На выпуклой оболочке двух кругов все запуски останавливаются в ${{D1.result.capsule}}$, где $f = {{D1.result.fCapsule}}$. На объединении кругов условие остановки выполняется лишь локально, и запуски останавливаются в двух разных точках: с $f = {{ex.local.fGlobal}}$ и с $f = {{ex.local.fLocal}}$."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "optimality",
    "title": {
     "en": "Optimality conditions",
     "ru": "Условия оптимальности"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Optimality conditions turn “find the minimum” into “solve a system of equations and inequalities”.",
       "ru": "Условия оптимальности превращают задачу «найти минимум» в задачу «решить систему уравнений и неравенств»."
      }
     }
    ],
    "subsections": [
     {
      "id": "optimality-lagrange",
      "title": {
       "en": "Equality constraints: Lagrange multipliers",
       "ru": "Ограничения-равенства: множители Лагранжа"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Start with equality constraints only: $\\min f(x)$ subject to $h_j(x) = 0$. If $x^*$ is a local minimizer and the gradients $\\nabla h_j(x^*)$ are linearly independent, there are numbers $\\nu_j$, the **Lagrange multipliers**, such that $$\\nabla f(x^*) + \\sum_j \\nu_j \\nabla h_j(x^*) = 0.$$ In other words, $x^*$ is a stationary point in $x$ of the Lagrangian $\\mathcal L(x, \\nu) = f(x) + \\sum_j \\nu_j h_j(x)$. Multipliers of equalities may have any sign.",
         "ru": "Начнём с ограничений-равенств: $\\min f(x)$ при $h_j(x) = 0$. Если $x^*$ — точка локального минимума и градиенты $\\nabla h_j(x^*)$ линейно независимы, то найдутся числа $\\nu_j$ — **множители Лагранжа**, для которых $$\\nabla f(x^*) + \\sum_j \\nu_j \\nabla h_j(x^*) = 0.$$ Иначе говоря, $x^*$ — стационарная по $x$ точка функции Лагранжа $\\mathcal L(x, \\nu) = f(x) + \\sum_j \\nu_j h_j(x)$. Знак множителей равенств может быть любым."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$\\min\\ x_1^2 + x_2^2$ subject to $h(x) = x_1 + 2x_2 - {{home.H3.rhs}} = 0$. Stationarity gives $2x_1 + \\nu = 0$ and $2x_2 + 2\\nu = 0$, so $x_2 = 2x_1$. The constraint then gives $x^* = {{home.H3.xFree}}$ and $\\nu = {{home.H3.nuFree}}$. Check: $\\nabla f(x^*) + \\nu \\nabla h = 2 \\cdot {{home.H3.xFree}} + ({{home.H3.nuFree}}) \\cdot (1, 2) = 0$.",
         "ru": "$\\min\\ x_1^2 + x_2^2$ при $h(x) = x_1 + 2x_2 - {{home.H3.rhs}} = 0$. Из стационарности $2x_1 + \\nu = 0$ и $2x_2 + 2\\nu = 0$, откуда $x_2 = 2x_1$. Ограничение даёт $x^* = {{home.H3.xFree}}$ и $\\nu = {{home.H3.nuFree}}$. Проверка: $\\nabla f(x^*) + \\nu \\nabla h = 2 \\cdot {{home.H3.xFree}} + ({{home.H3.nuFree}}) \\cdot (1;\\ 2) = 0$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Geometrically, $f$ cannot decrease to first order along the constraint surface, so $\\nabla f(x^*)$ is orthogonal to the surface, that is, it is a combination of the normals $\\nabla h_j(x^*)$.",
         "ru": "Геометрически: вдоль поверхности ограничений $f$ не убывает в первом порядке, поэтому $\\nabla f(x^*)$ ортогонален поверхности, то есть является комбинацией нормалей $\\nabla h_j(x^*)$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "At $x^* = {{home.H3.xFree}}$ the gradient $\\nabla f = 2 \\cdot {{home.H3.xFree}}$ is parallel to $\\nabla h = (1, 2)$. The line $x_1 + 2x_2 = {{home.H3.rhs}}$ has direction $(2, -1)$, and $\\nabla f(x^*)^\\top (2, -1) = 0$.",
         "ru": "В точке $x^* = {{home.H3.xFree}}$ градиент $\\nabla f = 2 \\cdot {{home.H3.xFree}}$ параллелен $\\nabla h = (1;\\ 2)$. Направляющий вектор прямой $x_1 + 2x_2 = {{home.H3.rhs}}$ равен $(2;\\ -1)$, и $\\nabla f(x^*)^\\top (2;\\ -1) = 0$."
        }
       }
      ]
     },
     {
      "id": "optimality-kkt",
      "title": {
       "en": "Inequality constraints: the KKT conditions",
       "ru": "Ограничения-неравенства: условия ККТ"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "For the general problem, the **Karush–Kuhn–Tucker (KKT) conditions** at a point $x^*$ with multipliers $\\lambda^*$ and $\\nu^*$ are:",
         "ru": "Для общей задачи **условия Каруша — Куна — Таккера (ККТ)** в точке $x^*$ с множителями $\\lambda^*$ и $\\nu^*$ таковы:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**stationarity**: $\\nabla f(x^*) + \\sum_i \\lambda_i^* \\nabla g_i(x^*) + \\sum_j \\nu_j^* \\nabla h_j(x^*) = 0$;",
          "ru": "**стационарность**: $\\nabla f(x^*) + \\sum_i \\lambda_i^* \\nabla g_i(x^*) + \\sum_j \\nu_j^* \\nabla h_j(x^*) = 0$;"
         },
         {
          "en": "**primal feasibility**: $g_i(x^*) \\le 0$ and $h_j(x^*) = 0$;",
          "ru": "**допустимость**: $g_i(x^*) \\le 0$ и $h_j(x^*) = 0$;"
         },
         {
          "en": "**dual feasibility**: $\\lambda_i^* \\ge 0$;",
          "ru": "**неотрицательность множителей** (двойственная допустимость): $\\lambda_i^* \\ge 0$;"
         },
         {
          "en": "**complementary slackness**: $\\lambda_i^* g_i(x^*) = 0$ for every $i$.",
          "ru": "**условие дополняющей нежёсткости**: $\\lambda_i^* g_i(x^*) = 0$ для всех $i$."
         }
        ]
       },
       {
        "type": "example",
        "text": {
         "en": "C1 with $x^* = {{C1.answer.x.value}}$ and $\\lambda^* = {{C1.answer.lam.value}}$. Stationarity: $2(x_1 - {{C1.params.c.1}}) + \\lambda = 2({{C1.answer.x.value.1}} - {{C1.params.c.1}}) + {{C1.answer.lam.value}} = 0$ and $2(x_2 - {{C1.params.c.2}}) + \\lambda = 2({{C1.answer.x.value.2}} - {{C1.params.c.2}}) + {{C1.answer.lam.value}} = 0$. Primal feasibility: $g(x^*) = {{C1.cand.S1.g.1}} \\le 0$. Dual feasibility: $\\lambda^* = {{C1.answer.lam.value}} \\ge 0$. Complementary slackness: $\\lambda^* g(x^*) = {{C1.answer.lam.value}} \\cdot {{C1.cand.S1.g.1}} = 0$.",
         "ru": "C1: $x^* = {{C1.answer.x.value}}$, $\\lambda^* = {{C1.answer.lam.value}}$. Стационарность: $2(x_1 - {{C1.params.c.1}}) + \\lambda = 2({{C1.answer.x.value.1}} - {{C1.params.c.1}}) + {{C1.answer.lam.value}} = 0$ и $2(x_2 - {{C1.params.c.2}}) + \\lambda = 2({{C1.answer.x.value.2}} - {{C1.params.c.2}}) + {{C1.answer.lam.value}} = 0$. Допустимость: $g(x^*) = {{C1.cand.S1.g.1}} \\le 0$. Неотрицательность множителя: $\\lambda^* = {{C1.answer.lam.value}} \\ge 0$. Дополняющая нежёсткость: $\\lambda^* g(x^*) = {{C1.answer.lam.value}} \\cdot {{C1.cand.S1.g.1}} = 0$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Complementary slackness has two cases: an inactive constraint ($g_i < 0$) must have $\\lambda_i = 0$, and a positive multiplier forces its constraint to be active. An active constraint may still have $\\lambda_i = 0$. By hand, a KKT system is solved by going through the possible active sets and rejecting the candidates that are infeasible or have a negative multiplier.",
         "ru": "У дополняющей нежёсткости два случая: у неактивного ограничения ($g_i < 0$) обязательно $\\lambda_i = 0$, а положительный множитель делает своё ограничение активным. У активного ограничения тоже может быть $\\lambda_i = 0$. Вручную систему ККТ решают перебором активных множеств, отбрасывая недопустимых кандидатов и кандидатов с отрицательным множителем."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C2: the case $\\lambda = 0$ gives $x = {{C2.answer.x.value}}$ with $g = {{C2.steps.gStar}} < 0$, a KKT point with $\\lambda^* = {{C2.answer.lam.value}}$. The case $g = 0$ gives $x = {{C2.cand.S1.x}}$ with $\\lambda = {{C2.cand.S1.lam.1}} < 0$ and is rejected.",
         "ru": "C2: случай $\\lambda = 0$ даёт $x = {{C2.answer.x.value}}$ с $g = {{C2.steps.gStar}} < 0$ — точку ККТ с $\\lambda^* = {{C2.answer.lam.value}}$. Случай $g = 0$ даёт $x = {{C2.cand.S1.x}}$ с $\\lambda = {{C2.cand.S1.lam.1}} < 0$ и отбрасывается."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "**Sufficiency.** If the problem is convex, every KKT point is a global minimizer, with no further assumptions. **Necessity** is the delicate direction: a local minimizer satisfies the KKT conditions only under a constraint qualification (see below).",
         "ru": "**Достаточность.** Если задача выпукла, любая точка ККТ — глобальный минимум, без дополнительных предположений. **Необходимость** — более тонкое направление: точка локального минимума удовлетворяет условиям ККТ лишь при условии регулярности (см. ниже)."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1 and C3 are convex: a convex quadratic objective and affine constraints. So their KKT points are global minimizers: $x^* = {{C1.answer.x.value}}$ with $f^* = {{C1.answer.f.value}}$ in C1, and $x^* = {{C3.answer.x.value}}$ with $f^* = {{C3.answer.f.value}}$ in C3.",
         "ru": "Задачи C1 и C3 выпуклы: выпуклая квадратичная целевая функция и аффинные ограничения. Поэтому их точки ККТ — глобальные минимумы: $x^* = {{C1.answer.x.value}}$ с $f^* = {{C1.answer.f.value}}$ в C1 и $x^* = {{C3.answer.x.value}}$ с $f^* = {{C3.answer.f.value}}$ в C3."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "In a convex problem a KKT point minimizes the Lagrangian over all $x$; on the feasible set the Lagrangian is at most $f$, and at $x^*$ it equals $f(x^*)$.",
         "ru": "В выпуклой задаче точка ККТ минимизирует функцию Лагранжа по всем $x$; на допустимом множестве функция Лагранжа не больше $f$, а в $x^*$ она равна $f(x^*)$."
        }
       }
      ]
     },
     {
      "id": "optimality-geometry",
      "title": {
       "en": "Geometric meaning and the normal cone",
       "ru": "Геометрический смысл и нормальный конус"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "With inequalities only, move the multiplier terms of stationarity to the right-hand side; the terms of inactive constraints vanish: $$-\\nabla f(x^*) = \\sum_{i\\ \\text{active}} \\lambda_i^* \\nabla g_i(x^*), \\qquad \\lambda_i^* \\ge 0.$$ The antigradient, the direction of fastest decrease, must be a nonnegative combination of the outward normals of the active constraints. Then every direction that decreases $f$ leads out of the feasible set.",
         "ru": "Если есть только неравенства, перенесём слагаемые с множителями в правую часть; слагаемые неактивных ограничений пропадают: $$-\\nabla f(x^*) = \\sum_{i\\ \\text{акт.}} \\lambda_i^* \\nabla g_i(x^*), \\qquad \\lambda_i^* \\ge 0.$$ Антиградиент — направление наискорейшего убывания — должен быть неотрицательной комбинацией внешних нормалей активных ограничений. Тогда любое направление, уменьшающее $f$, выводит из допустимого множества."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C3 at $x^* = {{C3.answer.x.value}}$: $-\\nabla f(x^*) = {{C3.steps.minusGrad}}$, $\\nabla g_1 = {{C3.params.A.1}}$, $\\nabla g_2 = {{C3.params.A.2}}$, and $$ {{C3.steps.minusGrad}} = {{C3.cand.S12.lam.1}} \\cdot {{C3.params.A.1}} + {{C3.cand.S12.lam.2}} \\cdot {{C3.params.A.2}} $$ with both coefficients nonnegative.",
         "ru": "C3 в точке $x^* = {{C3.answer.x.value}}$: $-\\nabla f(x^*) = {{C3.steps.minusGrad}}$, $\\nabla g_1 = {{C3.params.A.1}}$, $\\nabla g_2 = {{C3.params.A.2}}$, и $$ {{C3.steps.minusGrad}} = {{C3.cand.S12.lam.1}} \\cdot {{C3.params.A.1}} + {{C3.cand.S12.lam.2}} \\cdot {{C3.params.A.2}} $$ с неотрицательными коэффициентами."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The set of such combinations is the **normal cone**. For a convex set $X$ and a point $x \\in X$ it is defined directly: $$N_X(x) = \\{s:\\ s^\\top (y - x) \\le 0 \\text{ for all } y \\in X\\},$$ the directions that make an obtuse or right angle with every move into $X$. At an interior point $N_X(x) = \\{0\\}$; at a boundary point it is a ray or a wider cone. When $X$ is given by constraints and a constraint qualification holds, $N_X(x)$ is the cone spanned by the active gradients. For a convex problem the optimality condition fits in one line: $$-\\nabla f(x^*) \\in N_X(x^*).$$",
         "ru": "Множество таких комбинаций — **нормальный конус**. Для выпуклого множества $X$ и точки $x \\in X$ его можно определить напрямую: $$N_X(x) = \\{s:\\ s^\\top (y - x) \\le 0 \\text{ для всех } y \\in X\\}$$ — это направления, образующие тупой или прямой угол с любым сдвигом внутрь $X$. Во внутренней точке $N_X(x) = \\{0\\}$, в граничной — луч или более широкий конус. Если $X$ задано ограничениями и выполнено условие регулярности, $N_X(x)$ — конус, натянутый на градиенты активных ограничений. Для выпуклой задачи условие оптимальности умещается в одну строку: $$-\\nabla f(x^*) \\in N_X(x^*).$$"
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The ball from the opening problem: $f(x) = \\|x - c\\|^2$ with $c = {{hook.ball.c}}$ and $g(x) = \\|x\\|^2 - 1$. At $x^* = {{hook.ball.x}}$ we have $c - x^* = {{hook.ball.x}}$, so $-\\nabla f(x^*) = 2(c - x^*) = 2 \\cdot {{hook.ball.x}}$, while $\\nabla g(x^*) = 2x^* = 2 \\cdot {{hook.ball.x}}$. Hence $-\\nabla f(x^*) = \\lambda \\nabla g(x^*)$ with $\\lambda = {{hook.ball.lam}} \\ge 0$: the antigradient lies in the normal cone, which here is the ray along $x^*$.",
         "ru": "Шар из начала семинара: $f(x) = \\|x - c\\|^2$ с $c = {{hook.ball.c}}$ и $g(x) = \\|x\\|^2 - 1$. В точке $x^* = {{hook.ball.x}}$ имеем $c - x^* = {{hook.ball.x}}$, поэтому $-\\nabla f(x^*) = 2(c - x^*) = 2 \\cdot {{hook.ball.x}}$, а $\\nabla g(x^*) = 2x^* = 2 \\cdot {{hook.ball.x}}$. Значит, $-\\nabla f(x^*) = \\lambda \\nabla g(x^*)$ с $\\lambda = {{hook.ball.lam}} \\ge 0$: антиградиент лежит в нормальном конусе, который здесь является лучом вдоль $x^*$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The obtuse-angle property says the same about projections: $x - P_C(x) \\in N_C\\big(P_C(x)\\big)$.",
         "ru": "Свойство тупого угла говорит то же самое о проекциях: $x - P_C(x) \\in N_C\\big(P_C(x)\\big)$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "B2: $P_B(x) = {{B2.steps.ball}}$, and $x - P_B(x)$ points along the outward normal of the unit circle at $P_B(x)$. For $y = {{B2.steps.yBall}}$ the inner product $(x - P_B(x))^\\top (y - P_B(x)) = {{B2.steps.obtuseBall}} \\le 0$, as the definition of $N_B$ requires.",
         "ru": "B2: $P_B(x) = {{B2.steps.ball}}$, и вектор $x - P_B(x)$ направлен по внешней нормали единичной окружности в точке $P_B(x)$. Для $y = {{B2.steps.yBall}}$ скалярное произведение $(x - P_B(x))^\\top (y - P_B(x)) = {{B2.steps.obtuseBall}} \\le 0$, как и требует определение $N_B$."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_kkt.svg",
        "alt": {
         "en": "Three panels for problems C1, C2 and C3 with the feasible region, level circles of the objective, the optimal point and gradient arrows. In C3 a shaded cone between the two constraint gradients contains the antigradient.",
         "ru": "Три панели для задач C1, C2 и C3: допустимая область, окружности уровня целевой функции, точка оптимума и стрелки градиентов. В C3 закрашенный конус между градиентами двух ограничений содержит антиградиент."
        },
        "caption": {
         "en": "KKT geometry of C1, C2 and C3. The shaded region is the feasible set, and the circles are level lines of $f$ around the unconstrained minimizer $c$. In C1 the antigradient $-\\nabla f(x^*)$ points along the normal $\\nabla g$ of the active constraint. In C2 the minimizer $x^* = c$ is interior and $\\lambda^* = {{C2.answer.lam.value}}$. In C3 both constraints are active, and $-\\nabla f(x^*)$ lies in the shaded normal cone spanned by $\\nabla g_1$ and $\\nabla g_2$.",
         "ru": "Геометрия ККТ в задачах C1, C2 и C3. Закрашена допустимая область, окружности — линии уровня $f$ вокруг безусловного минимума $c$. В C1 антиградиент $-\\nabla f(x^*)$ направлен вдоль нормали $\\nabla g$ активного ограничения. В C2 минимум $x^* = c$ лежит внутри области и $\\lambda^* = {{C2.answer.lam.value}}$. В C3 активны оба ограничения, и $-\\nabla f(x^*)$ лежит в закрашенном нормальном конусе, натянутом на $\\nabla g_1$ и $\\nabla g_2$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "At the optimum the pull of $-\\nabla f$ towards lower values is balanced by the walls it presses against, and a wall can only push, never pull: hence $\\lambda \\ge 0$.",
         "ru": "В оптимуме «сила» $-\\nabla f$, тянущая к меньшим значениям, уравновешена стенками, в которые она упирается, а стенка может только толкать, но не тянуть: отсюда $\\lambda \\ge 0$."
        }
       }
      ]
     },
     {
      "id": "optimality-cq",
      "title": {
       "en": "Constraint qualifications and Slater's condition",
       "ru": "Условия регулярности и условие Слейтера"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The KKT conditions are necessary only if the constraints describe the feasible set faithfully near $x^*$. An assumption that guarantees this is called a **constraint qualification**. Without one, a minimizer may have no multipliers at all.",
         "ru": "Условия ККТ необходимы, только если ограничения правильно описывают допустимое множество вблизи $x^*$. Предположение, которое это гарантирует, называется **условием регулярности**. Без него у точки минимума может не оказаться никаких множителей."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Demo D2: $\\min x$ subject to $x^2 \\le 0$. The only feasible point is $x^* = {{D2.xStar}}$, so $p^* = {{D2.pStar}}$. Stationarity requires $1 + 2\\lambda x^* = 0$, but at $x^* = {{D2.xStar}}$ the left-hand side equals $1$ for every $\\lambda$. No multiplier exists, although $x^*$ is the minimizer.",
         "ru": "Демонстрация D2: $\\min x$ при $x^2 \\le 0$. Единственная допустимая точка $x^* = {{D2.xStar}}$, поэтому $p^* = {{D2.pStar}}$. Стационарность требует $1 + 2\\lambda x^* = 0$, но при $x^* = {{D2.xStar}}$ левая часть равна $1$ при любом $\\lambda$. Множителя не существует, хотя $x^*$ — точка минимума."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Two common constraint qualifications:",
         "ru": "Два распространённых условия регулярности:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**LICQ**: the gradients of the active constraints at $x^*$ are linearly independent;",
          "ru": "**LICQ**: градиенты активных ограничений в точке $x^*$ линейно независимы;"
         },
         {
          "en": "**Slater's condition**, for convex problems: there is a strictly feasible point $\\bar x$, that is, $g_i(\\bar x) < 0$ for every $i$ and $h_j(\\bar x) = 0$ for every $j$.",
          "ru": "**условие Слейтера** для выпуклых задач: существует строго допустимая точка $\\bar x$, то есть $g_i(\\bar x) < 0$ для всех $i$ и $h_j(\\bar x) = 0$ для всех $j$."
         }
        ]
       },
       {
        "type": "example",
        "text": {
         "en": "C3: the active gradients ${{C3.params.A.1}}$ and ${{C3.params.A.2}}$ are linearly independent, so LICQ holds. C1: at $\\bar x = {{ex.slater.point}}$ we have $g(\\bar x) = {{ex.slater.g}} < 0$, so Slater's condition holds. D2: $\\nabla g(x^*) = 2x^* = 0$ violates LICQ, and no $x$ satisfies $x^2 < 0$, so Slater's condition fails as well.",
         "ru": "C3: градиенты активных ограничений ${{C3.params.A.1}}$ и ${{C3.params.A.2}}$ линейно независимы, так что LICQ выполнено. C1: в точке $\\bar x = {{ex.slater.point}}$ имеем $g(\\bar x) = {{ex.slater.g}} < 0$, так что выполнено условие Слейтера. D2: $\\nabla g(x^*) = 2x^* = 0$ нарушает LICQ, а неравенству $x^2 < 0$ не удовлетворяет ни одна точка, так что нарушено и условие Слейтера."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "For a convex problem with Slater's condition the KKT conditions are **necessary and sufficient**: a feasible point is a global minimizer exactly when suitable multipliers exist.",
         "ru": "Для выпуклой задачи, в которой выполнено условие Слейтера, условия ККТ **необходимы и достаточны**: допустимая точка является глобальным минимумом ровно тогда, когда для неё существуют подходящие множители."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1 is convex and has the Slater point ${{ex.slater.point}}$. So the minimizer is guaranteed to be among the KKT points, and the case analysis of C1, which finds the single KKT point ${{C1.answer.x.value}}$ with $\\lambda^* = {{C1.answer.lam.value}}$, solves the problem completely.",
         "ru": "Задача C1 выпукла, и в ней есть точка Слейтера ${{ex.slater.point}}$. Поэтому минимум гарантированно находится среди точек ККТ, и разбор случаев в C1, дающий единственную точку ККТ ${{C1.answer.x.value}}$ с $\\lambda^* = {{C1.answer.lam.value}}$, решает задачу полностью."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "duality",
    "title": {
     "en": "Duality basics",
     "ru": "Основы двойственности"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Duality turns the multipliers into the variables of a new problem, whose value bounds the value of the original problem from below.",
       "ru": "Двойственность превращает множители в переменные новой задачи, значение которой оценивает значение исходной задачи снизу."
      }
     }
    ],
    "subsections": [
     {
      "id": "duality-dual-function",
      "title": {
       "en": "The Lagrangian and the dual function",
       "ru": "Функция Лагранжа и двойственная функция"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The Lagrangian $\\mathcal L(x, \\lambda, \\nu) = f(x) + \\sum_i \\lambda_i g_i(x) + \\sum_j \\nu_j h_j(x)$ replaces hard constraints by prices: with $\\lambda_i \\ge 0$, violating $g_i \\le 0$ is penalized and keeping a margin is rewarded. The **dual function** is the smallest value of the Lagrangian over all $x$, with no constraints on $x$: $$q(\\lambda, \\nu) = \\inf_x \\mathcal L(x, \\lambda, \\nu).$$ It may equal $-\\infty$. As an infimum of functions that are affine in $(\\lambda, \\nu)$, it is always concave, even when the original problem is not convex.",
         "ru": "Функция Лагранжа $\\mathcal L(x, \\lambda, \\nu) = f(x) + \\sum_i \\lambda_i g_i(x) + \\sum_j \\nu_j h_j(x)$ заменяет жёсткие ограничения ценами: при $\\lambda_i \\ge 0$ нарушение $g_i \\le 0$ штрафуется, а запас поощряется. **Двойственная функция** — наименьшее значение функции Лагранжа по всем $x$, без ограничений на $x$: $$q(\\lambda, \\nu) = \\inf_x \\mathcal L(x, \\lambda, \\nu).$$ Она может равняться $-\\infty$. Как инфимум функций, аффинных по $(\\lambda, \\nu)$, она всегда вогнута, даже если исходная задача невыпукла."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1: $\\mathcal L(x, \\lambda) = {{C1.tex.f}} + \\lambda\\,({{C1.tex.g}})$. The condition $\\nabla_x \\mathcal L = 0$ gives $x(\\lambda) = {{D3.convex.tex.xLam}}$, and substituting it back, $$q(\\lambda) = {{D3.convex.tex.q}}.$$ For example, $q({{D3.convex.samples.lam.2}}) = {{D3.convex.samples.q.2}}$ and $q({{D3.convex.samples.lam.5}}) = {{D3.convex.samples.q.5}}$.",
         "ru": "C1: $\\mathcal L(x, \\lambda) = {{C1.tex.f}} + \\lambda\\,({{C1.tex.g}})$. Условие $\\nabla_x \\mathcal L = 0$ даёт $x(\\lambda) = {{D3.convex.tex.xLam}}$, и после подстановки $$q(\\lambda) = {{D3.convex.tex.q}}.$$ Например, $q({{D3.convex.samples.lam.2}}) = {{D3.convex.samples.q.2}}$ и $q({{D3.convex.samples.lam.5}}) = {{D3.convex.samples.q.5}}$."
        }
       }
      ]
     },
     {
      "id": "duality-weak",
      "title": {
       "en": "Weak duality",
       "ru": "Слабая двойственность"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "For every feasible $x$, every $\\lambda \\ge 0$ and every $\\nu$, $$q(\\lambda, \\nu) \\le f(x).$$ Indeed, on the feasible set $\\lambda_i g_i(x) \\le 0$ and $h_j(x) = 0$, so $\\mathcal L(x, \\lambda, \\nu) \\le f(x)$, and the infimum over all $x$ is smaller still. Taking the best bound gives **weak duality** $d^* \\le p^*$, where $$d^* = \\sup_{\\lambda \\ge 0,\\ \\nu} q(\\lambda, \\nu)$$ is the value of the **dual problem**. Weak duality holds for every problem, convex or not, and the difference $p^* - d^* \\ge 0$ is called the **duality gap**.",
         "ru": "Для любой допустимой точки $x$, любого $\\lambda \\ge 0$ и любого $\\nu$ $$q(\\lambda, \\nu) \\le f(x).$$ Действительно, на допустимом множестве $\\lambda_i g_i(x) \\le 0$ и $h_j(x) = 0$, поэтому $\\mathcal L(x, \\lambda, \\nu) \\le f(x)$, а инфимум по всем $x$ ещё меньше. Взяв наилучшую оценку, получаем **слабую двойственность** $d^* \\le p^*$, где $$d^* = \\sup_{\\lambda \\ge 0,\\ \\nu} q(\\lambda, \\nu)$$ — значение **двойственной задачи**. Слабая двойственность верна для любой задачи, выпуклой или нет, а разность $p^* - d^* \\ge 0$ называется **зазором двойственности**."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1: $q({{ex.weak.lam}}) = {{ex.weak.q}} \\le p^* = {{C1.answer.f.value}}$. Every $\\lambda \\ge 0$ gives a lower bound on the optimal value without solving the problem.",
         "ru": "C1: $q({{ex.weak.lam}}) = {{ex.weak.q}} \\le p^* = {{C1.answer.f.value}}$. Любое $\\lambda \\ge 0$ даёт оценку оптимального значения снизу, не требуя решать задачу."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "Prices can only help a feasible point: its constraint terms are nonpositive, so the priced objective never exceeds the true one.",
         "ru": "Цены допустимой точке могут только помочь: её слагаемые с ограничениями неположительны, поэтому «оценённая» целевая функция не превосходит настоящую."
        }
       }
      ]
     },
     {
      "id": "duality-strong",
      "title": {
       "en": "Strong duality under Slater's condition",
       "ru": "Сильная двойственность при условии Слейтера"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "If the problem is convex and satisfies Slater's condition, **strong duality** holds: $d^* = p^*$, and the maximum of the dual function is attained. If the primal minimum is attained too, a maximizer $\\lambda^*$ of $q$ is a KKT multiplier, and it measures sensitivity: when the constraint $g_i(x) \\le 0$ is relaxed to $g_i(x) \\le u$ and the optimal value depends smoothly on $u$, it changes at the rate $$\\frac{\\partial p^*}{\\partial u}\\Big|_{u = 0} = -\\lambda_i^*.$$",
         "ru": "Если задача выпукла и выполнено условие Слейтера, имеет место **сильная двойственность**: $d^* = p^*$, и максимум двойственной функции достигается. Если достигается и минимум исходной задачи, то точка максимума $\\lambda^*$ функции $q$ — множитель ККТ, и он измеряет чувствительность: если ослабить ограничение $g_i(x) \\le 0$ до $g_i(x) \\le u$ и оптимальное значение гладко зависит от $u$, то оно меняется со скоростью $$\\frac{\\partial p^*}{\\partial u}\\Big|_{u = 0} = -\\lambda_i^*.$$"
        }
       },
       {
        "type": "example",
        "text": {
         "en": "C1 is convex with the Slater point ${{ex.slater.point}}$. The maximum of $q(\\lambda) = {{D3.convex.tex.q}}$ is attained at $\\lambda = {{D3.convex.lamStar}}$, the multiplier found in C1, and equals $d^* = {{D3.convex.dStar}} = p^*$: the gap is zero. Relaxing the constraint to $x_1 + x_2 \\le {{C1.params.b.1}} + u$ changes $f^*$ at the rate $-\\lambda^* = {{C1.steps.sensitivity}}$.",
         "ru": "Задача C1 выпукла, и у неё есть точка Слейтера ${{ex.slater.point}}$. Максимум $q(\\lambda) = {{D3.convex.tex.q}}$ достигается при $\\lambda = {{D3.convex.lamStar}}$ — это множитель из C1 — и равен $d^* = {{D3.convex.dStar}} = p^*$: зазор нулевой. Если ослабить ограничение до $x_1 + x_2 \\le {{C1.params.b.1}} + u$, то $f^*$ меняется со скоростью $-\\lambda^* = {{C1.steps.sensitivity}}$."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_duality.svg",
        "alt": {
         "en": "Three panels: a concave parabola that touches the level p star; a curve that rises towards p star without reaching it; a number line where the dual value d star lies to the left of p star and a bracket marks the gap.",
         "ru": "Три панели: вогнутая парабола, касающаяся уровня p*; кривая, которая растёт к p* и не достигает его; числовая прямая, на которой двойственное значение d* лежит левее p*, а скобка отмечает зазор."
        },
        "caption": {
         "en": "Left: the dual function $q(\\lambda) = {{D3.convex.tex.q}}$ of C1 reaches $p^* = {{D3.convex.pStar}}$ at $\\lambda = {{D3.convex.lamStar}}$, a zero gap. Middle: the dual function $q(\\lambda) = {{D2.tex.q}}$ of D2 approaches $p^* = {{D2.pStar}}$ but never attains it. Right: on feasible points the Boolean objective takes only the values ${{D3.bool.values.1}}$ and ${{D3.bool.values.2}}$; $d^* = {{D3.bool.tex.dStar}}$ lies strictly below $p^* = {{D3.bool.pStar}}$, and the bracket marks the gap.",
         "ru": "Слева: двойственная функция $q(\\lambda) = {{D3.convex.tex.q}}$ задачи C1 достигает $p^* = {{D3.convex.pStar}}$ при $\\lambda = {{D3.convex.lamStar}}$, зазор нулевой. В центре: двойственная функция $q(\\lambda) = {{D2.tex.q}}$ задачи D2 приближается к $p^* = {{D2.pStar}}$, но не достигает его. Справа: на допустимых точках булева целевая функция принимает только значения ${{D3.bool.values.1}}$ и ${{D3.bool.values.2}}$; $d^* = {{D3.bool.tex.dStar}}$ лежит строго ниже $p^* = {{D3.bool.pStar}}$, скобка отмечает зазор."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "Under Slater's condition the prices can be tuned so that the unconstrained minimum of the Lagrangian lands exactly on the constrained optimum.",
         "ru": "При условии Слейтера цены можно подобрать так, что безусловный минимум функции Лагранжа попадает ровно в условный оптимум."
        }
       }
      ]
     },
     {
      "id": "duality-gap",
      "title": {
       "en": "When duality breaks",
       "ru": "Когда двойственность ломается"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Without Slater's condition even a convex problem can misbehave. In D2, $\\min x$ subject to $x^2 \\le 0$, the Lagrangian $x + \\lambda x^2$ with $\\lambda > 0$ is minimized at $x = {{D2.tex.xMin}}$, which gives $$q(\\lambda) = {{D2.tex.q}}.$$ As $\\lambda \\to \\infty$ we get $q(\\lambda) \\to p^*$, so the gap is zero, but no $\\lambda$ attains $d^*$. This is the dual view of the missing KKT multiplier.",
         "ru": "Без условия Слейтера даже выпуклая задача может вести себя плохо. В D2, $\\min x$ при $x^2 \\le 0$, функция Лагранжа $x + \\lambda x^2$ при $\\lambda > 0$ минимизируется в точке $x = {{D2.tex.xMin}}$, откуда $$q(\\lambda) = {{D2.tex.q}}.$$ При $\\lambda \\to \\infty$ получаем $q(\\lambda) \\to p^*$, так что зазор нулевой, но ни при каком $\\lambda$ значение $d^*$ не достигается. Так в двойственной задаче проявляется отсутствие множителя ККТ."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$q({{D2.samples.lam.1}}) = {{D2.samples.q.1}}$, $q({{D2.samples.lam.3}}) = {{D2.samples.q.3}}$, $q({{D2.samples.lam.5}}) = {{D2.samples.q.5}}$: the values approach $p^* = {{D2.pStar}}$ from below and never reach it.",
         "ru": "$q({{D2.samples.lam.1}}) = {{D2.samples.q.1}}$, $q({{D2.samples.lam.3}}) = {{D2.samples.q.3}}$, $q({{D2.samples.lam.5}}) = {{D2.samples.q.5}}$: значения приближаются к $p^* = {{D2.pStar}}$ снизу и никогда его не достигают."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Without convexity the gap can be positive. Consider the Boolean problem $$\\min\\ x_1x_2 + x_2x_3 + x_1x_3 \\quad \\text{subject to} \\quad x_i^2 = 1 \\text{ for every } i.$$ Its eight feasible points are the sign vectors $x \\in \\{-1, 1\\}^3$. The objective equals ${{D3.bool.values.2}}$ when all signs agree and ${{D3.bool.values.1}}$ otherwise, so $p^* = {{D3.bool.pStar}}$, attained at {{D3.bool.nOptimal}} points. Write the objective as $x^\\top A x$ with $A = \\tfrac12(\\mathbf 1\\mathbf 1^\\top - I)$. Then $$\\mathcal L(x, \\nu) = x^\\top\\big(A + \\operatorname{diag}(\\nu)\\big)x - \\mathbf 1^\\top \\nu, \\qquad q(\\nu) = \\begin{cases} -\\mathbf 1^\\top \\nu, & A + \\operatorname{diag}(\\nu) \\succeq 0, \\\\ -\\infty & \\text{otherwise}. \\end{cases}$$",
         "ru": "Без выпуклости зазор может быть положительным. Рассмотрим булеву задачу $$\\min\\ x_1x_2 + x_2x_3 + x_1x_3 \\quad \\text{при} \\quad x_i^2 = 1 \\text{ для всех } i.$$ Её восемь допустимых точек — векторы знаков $x \\in \\{-1, 1\\}^3$. Целевая функция равна ${{D3.bool.values.2}}$, когда все знаки совпадают, и ${{D3.bool.values.1}}$ в остальных случаях, поэтому $p^* = {{D3.bool.pStar}}$, и этот минимум достигается в {{D3.bool.nOptimal}} точках. Запишем целевую функцию как $x^\\top A x$, где $A = \\tfrac12(\\mathbf 1\\mathbf 1^\\top - I)$. Тогда $$\\mathcal L(x, \\nu) = x^\\top\\big(A + \\operatorname{diag}(\\nu)\\big)x - \\mathbf 1^\\top \\nu, \\qquad q(\\nu) = \\begin{cases} -\\mathbf 1^\\top \\nu, & A + \\operatorname{diag}(\\nu) \\succeq 0, \\\\ -\\infty & \\text{иначе}. \\end{cases}$$"
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The best dual point is $\\nu^* = {{D3.bool.tex.nuStar}}$: the matrix $A + \\operatorname{diag}(\\nu^*) = \\tfrac12\\mathbf 1\\mathbf 1^\\top$ is positive semidefinite, and $d^* = q(\\nu^*) = {{D3.bool.tex.dStar}}$. The gap is $p^* - d^* = {{D3.bool.pStar}} - \\big({{D3.bool.tex.dStar}}\\big) = {{D3.bool.tex.gap}} > 0$.",
         "ru": "Лучшая двойственная точка — $\\nu^* = {{D3.bool.tex.nuStar}}$: матрица $A + \\operatorname{diag}(\\nu^*) = \\tfrac12\\mathbf 1\\mathbf 1^\\top$ положительно полуопределена, и $d^* = q(\\nu^*) = {{D3.bool.tex.dStar}}$. Зазор равен $p^* - d^* = {{D3.bool.pStar}} - \\big({{D3.bool.tex.dStar}}\\big) = {{D3.bool.tex.gap}} > 0$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "No dual point does better: testing $A + \\operatorname{diag}(\\nu) \\succeq 0$ on $x = e_i - e_j$ gives $\\nu_i + \\nu_j \\ge 1$, and adding the three such inequalities gives $\\mathbf 1^\\top \\nu \\ge \\tfrac32$.",
         "ru": "Лучшей двойственной точки нет: проверка $A + \\operatorname{diag}(\\nu) \\succeq 0$ на векторе $x = e_i - e_j$ даёт $\\nu_i + \\nu_j \\ge 1$, а сумма трёх таких неравенств даёт $\\mathbf 1^\\top \\nu \\ge \\tfrac32$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Why the example needs three constraints: with a **single** quadratic constraint and a strictly feasible point, the gap is zero even for a nonconvex quadratic objective. This is the S-lemma.",
         "ru": "Почему в примере три ограничения: при **одном** квадратичном ограничении и строго допустимой точке зазор нулевой даже для невыпуклой квадратичной целевой функции. Это S-лемма."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$\\min\\ -x^2$ subject to $x^2 \\le 1$: the objective is concave, and $p^* = {{D3.slemma.pStar}}$. The Lagrangian $(\\lambda - 1)x^2 - \\lambda$ is bounded below only for $\\lambda \\ge 1$, where $q(\\lambda) = -\\lambda$. Hence $d^* = q(1) = {{D3.slemma.pStar}} = p^*$.",
         "ru": "$\\min\\ -x^2$ при $x^2 \\le 1$: целевая функция вогнута, и $p^* = {{D3.slemma.pStar}}$. Функция Лагранжа $(\\lambda - 1)x^2 - \\lambda$ ограничена снизу только при $\\lambda \\ge 1$, и там $q(\\lambda) = -\\lambda$. Значит, $d^* = q(1) = {{D3.slemma.pStar}} = p^*$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The four examples side by side:",
         "ru": "Четыре примера рядом:"
        }
       },
       {
        "type": "table",
        "head": [
         {
          "en": "Problem",
          "ru": "Задача"
         },
         {
          "en": "Convex",
          "ru": "Выпуклая"
         },
         {
          "en": "Strictly feasible point",
          "ru": "Строго допустимая точка"
         },
         {
          "en": "$p^*$",
          "ru": "$p^*$"
         },
         {
          "en": "$d^*$",
          "ru": "$d^*$"
         },
         {
          "en": "Gap",
          "ru": "Зазор"
         }
        ],
        "rows": [
         [
          {
           "en": "C1",
           "ru": "C1"
          },
          {
           "en": "yes",
           "ru": "да"
          },
          {
           "en": "yes, ${{ex.slater.point}}$",
           "ru": "да, ${{ex.slater.point}}$"
          },
          {
           "en": "${{D3.convex.pStar}}$",
           "ru": "${{D3.convex.pStar}}$"
          },
          {
           "en": "${{D3.convex.dStar}}$",
           "ru": "${{D3.convex.dStar}}$"
          },
          {
           "en": "$0$",
           "ru": "$0$"
          }
         ],
         [
          {
           "en": "D2",
           "ru": "D2"
          },
          {
           "en": "yes",
           "ru": "да"
          },
          {
           "en": "no",
           "ru": "нет"
          },
          {
           "en": "${{D2.pStar}}$",
           "ru": "${{D2.pStar}}$"
          },
          {
           "en": "${{D2.pStar}}$, not attained",
           "ru": "${{D2.pStar}}$, не достигается"
          },
          {
           "en": "$0$",
           "ru": "$0$"
          }
         ],
         [
          {
           "en": "Boolean",
           "ru": "Булева"
          },
          {
           "en": "no",
           "ru": "нет"
          },
          {
           "en": "equalities only",
           "ru": "только равенства"
          },
          {
           "en": "${{D3.bool.pStar}}$",
           "ru": "${{D3.bool.pStar}}$"
          },
          {
           "en": "${{D3.bool.tex.dStar}}$",
           "ru": "${{D3.bool.tex.dStar}}$"
          },
          {
           "en": "${{D3.bool.tex.gap}}$",
           "ru": "${{D3.bool.tex.gap}}$"
          }
         ],
         [
          {
           "en": "S-lemma",
           "ru": "S-лемма"
          },
          {
           "en": "no",
           "ru": "нет"
          },
          {
           "en": "yes, $x = 0$",
           "ru": "да, $x = 0$"
          },
          {
           "en": "${{D3.slemma.pStar}}$",
           "ru": "${{D3.slemma.pStar}}$"
          },
          {
           "en": "${{D3.slemma.pStar}}$",
           "ru": "${{D3.slemma.pStar}}$"
          },
          {
           "en": "$0$",
           "ru": "$0$"
          }
         ]
        ]
       },
       {
        "type": "intuition",
        "text": {
         "en": "The dual problem is always the maximization of a concave function. When the original problem is not convex, the dual sees only a convexified version of it, and the difference shows up as the gap.",
         "ru": "Двойственная задача — всегда максимизация вогнутой функции. Если исходная задача невыпукла, двойственная «видит» лишь её выпуклое упрощение, и разница проявляется в виде зазора."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "problems",
    "title": {
     "en": "Seminar problems",
     "ru": "Задачи семинара"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "All nine problems of the seminar with complete solutions. In each block the first problem is solved on the board, and the other two are solved by the students on a timer.",
       "ru": "Все девять задач семинара с полными решениями. В каждом блоке первая задача решается у доски, а две другие студенты решают самостоятельно, на время."
      }
     }
    ],
    "subsections": [
     {
      "id": "problems-a",
      "title": {
       "en": "A. Convexity of sets and functions",
       "ru": "A. Выпуклость множеств и функций"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "A1"
       },
       {
        "type": "problem",
        "id": "A2"
       },
       {
        "type": "problem",
        "id": "A3"
       }
      ]
     },
     {
      "id": "problems-b",
      "title": {
       "en": "B. Projections onto a ball, a box and the simplex",
       "ru": "B. Проекции на шар, брус и симплекс"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "B1"
       },
       {
        "type": "problem",
        "id": "B2"
       },
       {
        "type": "problem",
        "id": "B3"
       }
      ]
     },
     {
      "id": "problems-c",
      "title": {
       "en": "C. KKT conditions for 2D problems",
       "ru": "C. Условия ККТ для двумерных задач"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "C1"
       },
       {
        "type": "problem",
        "id": "C2"
       },
       {
        "type": "problem",
        "id": "C3"
       }
      ]
     }
    ]
   },
   {
    "id": "mistakes",
    "title": {
     "en": "Common mistakes",
     "ru": "Типичные ошибки"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Mistakes that come up again and again: first by topic, then from the seminar problems.",
       "ru": "Ошибки, которые повторяются из раза в раз: сначала по темам, затем из задач семинара."
      }
     }
    ],
    "subsections": [
     {
      "id": "mistakes-a",
      "title": {
       "en": "Convexity",
       "ru": "Выпуклость"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "A"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**A1.** Putting $a/2$ into the Hessian. The entry $a/2$ belongs to the matrix $A$ in $f = z^\\top A z$; the Hessian entry is $\\partial^2 f/\\partial x\\,\\partial y = a$.",
          "ru": "**A1.** Записать в гессиан $a/2$. Число $a/2$ стоит в матрице $A$ из записи $f = z^\\top A z$, а элемент гессиана равен $\\partial^2 f/\\partial x\\,\\partial y = a$."
         },
         {
          "en": "**A1.** Deciding semidefiniteness by the leading minors only. They decide $H \\succ 0$; for $H \\succeq 0$ every principal minor must be nonnegative.",
          "ru": "**A1.** Судить о полуопределённости только по угловым минорам. Они решают вопрос о $H \\succ 0$, а для $H \\succeq 0$ неотрицательными должны быть все главные миноры."
         },
         {
          "en": "**A2.** Evaluating the Hessian only at the origin, where it is the zero matrix, and concluding convexity.",
          "ru": "**A2.** Посчитать гессиан только в начале координат, где он нулевой, и объявить функцию выпуклой."
         },
         {
          "en": "**A2.** Treating one pair that satisfies Jensen as a proof of convexity: only a violation proves something.",
          "ru": "**A2.** Считать одну пару, для которой Йенсен выполнен, доказательством выпуклости: доказывает только нарушение."
         },
         {
          "en": "**A3.** Calling $S$ convex because it is a sublevel set: the rule needs a convex function.",
          "ru": "**A3.** Объявить $S$ выпуклым, потому что это множество подуровня: правило работает только для выпуклой функции."
         },
         {
          "en": "**A3.** Testing the pair ${{A3.params.pairs.p2.p}}$, ${{A3.params.pairs.p2.q}}$: its midpoint is the origin, which lies in $S$, so it proves nothing.",
          "ru": "**A3.** Проверять пару ${{A3.params.pairs.p2.p}}$, ${{A3.params.pairs.p2.q}}$: её середина — начало координат, оно лежит в $S$, и пара ничего не доказывает."
         }
        ]
       }
      ]
     },
     {
      "id": "mistakes-b",
      "title": {
       "en": "Projections",
       "ru": "Проекции"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "B"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**B1.** Returning the sorted vector instead of restoring the original order of the coordinates.",
          "ru": "**B1.** Выдать отсортированный вектор вместо того, чтобы вернуть координаты в исходный порядок."
         },
         {
          "en": "**B1.** Subtracting $\\theta$ without clipping at zero, which leaves negative coordinates.",
          "ru": "**B1.** Вычесть $\\theta$ и забыть обрезать по нулю: остаются отрицательные координаты."
         },
         {
          "en": "**B2.** Mixing the formulas: clipping coordinates for the ball, or dividing by $\\|x\\|$ for the box.",
          "ru": "**B2.** Перепутать формулы: обрезать координаты для шара или делить на $\\|x\\|$ для бруса."
         },
         {
          "en": "**B2.** Normalizing a point that is already inside the ball.",
          "ru": "**B2.** Нормировать точку, которая уже лежит внутри шара."
         },
         {
          "en": "**B3.** Believing that only negative coordinates are set to zero: here $v_1 > 0$ but $x_1 = 0$.",
          "ru": "**B3.** Считать, что обнуляются только отрицательные координаты: здесь $v_1 > 0$, а $x_1 = 0$."
         },
         {
          "en": "**B3.** Using the total sum $s_n$ instead of $s_\\rho$ in $\\theta$.",
          "ru": "**B3.** Подставить в $\\theta$ полную сумму $s_n$ вместо $s_\\rho$."
         }
        ]
       }
      ]
     },
     {
      "id": "mistakes-c",
      "title": {
       "en": "KKT conditions",
       "ru": "Условия ККТ"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "C"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**C1.** Writing the constraint as $\\ge 0$, as SciPy does, but keeping $+\\lambda g$ and $\\lambda \\ge 0$: the sign of the multiplier flips.",
          "ru": "**C1.** Записать ограничение в виде $\\ge 0$, как в SciPy, но оставить $+\\lambda g$ и $\\lambda \\ge 0$: знак множителя меняется на противоположный."
         },
         {
          "en": "**C1.** Stopping after stationarity without checking that the candidate is feasible.",
          "ru": "**C1.** Решить уравнения стационарности и не проверить допустимость кандидата."
         },
         {
          "en": "**C2.** Assuming the constraint is active and reporting $\\lambda = {{C2.cand.S1.lam.1}}$.",
          "ru": "**C2.** Считать ограничение активным и выдать $\\lambda = {{C2.cand.S1.lam.1}}$."
         },
         {
          "en": "**C2.** Thinking that $\\lambda = 0$ means the constraint was forgotten: it is exactly what complementary slackness requires.",
          "ru": "**C2.** Думать, что $\\lambda = 0$ означает забытое ограничение: этого и требует дополняющая нежёсткость."
         },
         {
          "en": "**C3.** Forgetting the sign in $\\nabla g_2 = {{C3.params.A.2}}$ for the constraint $x_1 \\ge 0$ written as $-x_1 \\le 0$.",
          "ru": "**C3.** Потерять знак в $\\nabla g_2 = {{C3.params.A.2}}$ для ограничения $x_1 \\ge 0$, записанного как $-x_1 \\le 0$."
         },
         {
          "en": "**C3.** Accepting the active set $\\{1\\}$ because its $\\lambda_1$ is positive, without checking $g_2$.",
          "ru": "**C3.** Принять активное множество $\\{1\\}$, потому что $\\lambda_1$ положителен, и не проверить $g_2$."
         }
        ]
       }
      ]
     },
     {
      "id": "mistakes-d",
      "title": {
       "en": "Duality",
       "ru": "Двойственность"
      },
      "blocks": [
       {
        "type": "list",
        "items": [
         {
          "en": "Expecting $d^* = p^*$ for every problem. Weak duality $d^* \\le p^*$ always holds, but equality needs extra structure such as convexity together with Slater's condition; the Boolean problem has a gap of ${{D3.bool.tex.gap}}$.",
          "ru": "Ожидать $d^* = p^*$ для любой задачи. Слабая двойственность $d^* \\le p^*$ верна всегда, а для равенства нужна дополнительная структура, например выпуклость вместе с условием Слейтера; у булевой задачи зазор равен ${{D3.bool.tex.gap}}$."
         },
         {
          "en": "Maximizing $q(\\lambda)$ over all $\\lambda$ instead of $\\lambda \\ge 0$: for a negative multiplier the bound $q(\\lambda) \\le p^*$ is no longer guaranteed.",
          "ru": "Максимизировать $q(\\lambda)$ по всем $\\lambda$, а не по $\\lambda \\ge 0$: при отрицательном множителе оценка $q(\\lambda) \\le p^*$ уже не гарантирована."
         },
         {
          "en": "Forgetting that $q$ can equal $-\\infty$: in the Boolean problem $q(\\nu) = -\\infty$ whenever $A + \\operatorname{diag}(\\nu)$ is not positive semidefinite, and such $\\nu$ must be excluded before maximizing.",
          "ru": "Забыть, что $q$ может равняться $-\\infty$: в булевой задаче $q(\\nu) = -\\infty$, если матрица $A + \\operatorname{diag}(\\nu)$ не является положительно полуопределённой, и такие $\\nu$ нужно исключить до максимизации."
         },
         {
          "en": "Reading a zero gap as a proof of convexity: $\\min\\ -x^2$ subject to $x^2 \\le 1$ has a zero gap and a concave objective.",
          "ru": "Считать нулевой зазор доказательством выпуклости: у задачи $\\min\\ -x^2$ при $x^2 \\le 1$ зазор нулевой, а целевая функция вогнута."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "glossary",
    "title": {
     "en": "Glossary",
     "ru": "Глоссарий"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "English terms of the seminar and their Russian equivalents.",
       "ru": "Английские термины семинара и их русские эквиваленты."
      }
     },
     {
      "type": "glossary",
      "items": [
       {
        "en": "convex combination",
        "ru": "выпуклая комбинация"
       },
       {
        "en": "convex set",
        "ru": "выпуклое множество"
       },
       {
        "en": "convex function",
        "ru": "выпуклая функция"
       },
       {
        "en": "strictly convex function",
        "ru": "строго выпуклая функция"
       },
       {
        "en": "concave function",
        "ru": "вогнутая функция"
       },
       {
        "en": "Jensen inequality",
        "ru": "неравенство Йенсена"
       },
       {
        "en": "sublevel set",
        "ru": "множество подуровня"
       },
       {
        "en": "epigraph",
        "ru": "надграфик"
       },
       {
        "en": "convex hull",
        "ru": "выпуклая оболочка"
       },
       {
        "en": "Hessian",
        "ru": "гессиан"
       },
       {
        "en": "positive semidefinite matrix",
        "ru": "положительно полуопределённая матрица"
       },
       {
        "en": "principal minor",
        "ru": "главный минор"
       },
       {
        "en": "leading principal minor",
        "ru": "угловой минор"
       },
       {
        "en": "local minimum, global minimum",
        "ru": "локальный минимум, глобальный минимум"
       },
       {
        "en": "convex problem",
        "ru": "выпуклая задача"
       },
       {
        "en": "feasible set",
        "ru": "допустимое множество"
       },
       {
        "en": "feasible direction",
        "ru": "допустимое направление"
       },
       {
        "en": "active constraint",
        "ru": "активное ограничение"
       },
       {
        "en": "projection",
        "ru": "проекция"
       },
       {
        "en": "box",
        "ru": "брус"
       },
       {
        "en": "probability simplex",
        "ru": "вероятностный симплекс"
       },
       {
        "en": "obtuse-angle property",
        "ru": "свойство тупого угла"
       },
       {
        "en": "projected gradient method",
        "ru": "проекционный градиентный спуск"
       },
       {
        "en": "Lagrangian",
        "ru": "функция Лагранжа"
       },
       {
        "en": "Lagrange multipliers",
        "ru": "множители Лагранжа"
       },
       {
        "en": "Karush–Kuhn–Tucker (KKT) conditions",
        "ru": "условия Каруша — Куна — Таккера (ККТ)"
       },
       {
        "en": "stationarity",
        "ru": "стационарность"
       },
       {
        "en": "primal feasibility",
        "ru": "допустимость"
       },
       {
        "en": "dual feasibility",
        "ru": "неотрицательность множителей (двойственная допустимость)"
       },
       {
        "en": "complementary slackness",
        "ru": "условие дополняющей нежёсткости"
       },
       {
        "en": "constraint qualification",
        "ru": "условие регулярности"
       },
       {
        "en": "linear independence constraint qualification (LICQ)",
        "ru": "условие линейной независимости градиентов активных ограничений (LICQ)"
       },
       {
        "en": "Slater's condition",
        "ru": "условие Слейтера"
       },
       {
        "en": "normal cone",
        "ru": "нормальный конус"
       },
       {
        "en": "dual function",
        "ru": "двойственная функция"
       },
       {
        "en": "dual problem",
        "ru": "двойственная задача"
       },
       {
        "en": "weak duality",
        "ru": "слабая двойственность"
       },
       {
        "en": "strong duality",
        "ru": "сильная двойственность"
       },
       {
        "en": "duality gap",
        "ru": "зазор двойственности"
       }
      ]
     }
    ]
   },
   {
    "id": "references",
    "title": {
     "en": "References",
     "ru": "Литература"
    },
    "blocks": [
     {
      "type": "references",
      "items": [
       {
        "en": "S. Boyd, L. Vandenberghe. *Convex Optimization*. Cambridge University Press. The chapters on convex sets, convex functions, convex optimization problems and duality.",
        "ru": "S. Boyd, L. Vandenberghe. *Convex Optimization*. Cambridge University Press. Главы о выпуклых множествах, выпуклых функциях, выпуклых задачах оптимизации и двойственности."
       },
       {
        "en": "Andrey Ignatov. Lectures of the course *Optimization Methods*, HSE University, Faculty of Computer Science: the lecture “Convexity, Constraints, and Optimality Conditions”.",
        "ru": "Андрей Игнатов. Лекции курса «Методы оптимизации», НИУ ВШЭ, факультет компьютерных наук: лекция «Выпуклость, ограничения и условия оптимальности»."
       }
      ]
     }
    ]
   }
  ]
 }
}/*JSON-END*/);
