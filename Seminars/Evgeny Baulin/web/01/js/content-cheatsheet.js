// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 01 content: the one-page cheat sheet (cheatsheet.html), in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar01_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "cheatsheet": {
  "title": {
   "en": "Optimization as the Foundation of Machine Learning",
   "ru": "Оптимизация как основа машинного обучения"
  },
  "subtitle": {
   "en": "Cheat sheet: derivatives, definiteness, optimality conditions and convexity on one page",
   "ru": "Шпаргалка: производные, знакоопределённость, условия оптимальности и выпуклость на одной странице"
  },
  "sections": [
   {
    "id": "derivatives",
    "title": {
     "en": "Gradient and Hessian",
     "ru": "Градиент и гессиан"
    },
    "items": [
     {
      "en": "**Gradient** $\\nabla f = \\big(\\tfrac{\\partial f}{\\partial x_1}, \\dots, \\tfrac{\\partial f}{\\partial x_n}\\big)^\\top$ points in the direction of steepest ascent and is perpendicular to level sets. Lecture example $f = {{ex.lecture.tex.f}}$: $\\nabla f{{ex.lecture.point}} = {{ex.lecture.grad}}$.",
      "ru": "**Градиент** $\\nabla f = \\big(\\tfrac{\\partial f}{\\partial x_1};\\ \\dots;\\ \\tfrac{\\partial f}{\\partial x_n}\\big)^\\top$ указывает направление наискорейшего роста и перпендикулярен множествам уровня. Пример из лекции $f = {{ex.lecture.tex.f}}$: $\\nabla f{{ex.lecture.point}} = {{ex.lecture.grad}}$."
     },
     {
      "en": "**Hessian** $H = \\big[\\tfrac{\\partial^2 f}{\\partial x_i\\,\\partial x_j}\\big]$ is symmetric when the second partials are continuous (Schwarz). Lecture: $H_{11} = {{ex.lecture.tex.h11}}$, $H_{12} = {{ex.lecture.tex.h12}}$, $H_{22} = {{ex.lecture.tex.h22}}$, $\\det H{{ex.lecture.point}} = {{ex.lecture.det}}$. A quadratic has a constant $H$.",
      "ru": "**Гессиан** $H = \\big[\\tfrac{\\partial^2 f}{\\partial x_i\\,\\partial x_j}\\big]$ симметричен, если вторые частные производные непрерывны (теорема Шварца). В примере из лекции $H_{11} = {{ex.lecture.tex.h11}}$, $H_{12} = {{ex.lecture.tex.h12}}$, $H_{22} = {{ex.lecture.tex.h22}}$, $\\det H{{ex.lecture.point}} = {{ex.lecture.det}}$. У квадратичной функции $H$ постоянен."
     },
     {
      "en": "**Hessian of a polynomial**: a square $c\\,x_i^2$ gives $H_{ii} = 2c$; a cross term $c\\,x_ix_j$ gives $H_{ij} = H_{ji} = c$; variables that never meet give $0$.",
      "ru": "**Гессиан многочлена**: квадрат $c\\,x_i^2$ даёт $H_{ii} = 2c$; смешанное слагаемое $c\\,x_ix_j$ даёт $H_{ij} = H_{ji} = c$; переменные, которые нигде не встречаются вместе, дают $0$."
     },
     {
      "en": "**Directional derivative** $\\tfrac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\tfrac{f(x + \\alpha s) - f(x)}{\\alpha} = s^\\top \\nabla f(x)$, a rate per unit of $\\alpha$. D2: $s = {{ex.dir.s}}$, $\\nabla f = {{ex.dir.grad}}$, $s^\\top \\nabla f = {{ex.dir.value}}$; per unit length ${{ex.dir.tex.perLength}}$; steepest descent $-\\|\\nabla f\\| = {{ex.dir.tex.steepest}}$.",
      "ru": "**Производная по направлению** $\\tfrac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\tfrac{f(x + \\alpha s) - f(x)}{\\alpha} = s^\\top \\nabla f(x)$ — скорость на единицу $\\alpha$. D2: $s = {{ex.dir.s}}$, $\\nabla f = {{ex.dir.grad}}$, $s^\\top \\nabla f = {{ex.dir.value}}$; на единицу длины ${{ex.dir.tex.perLength}}$; наискорейшее убывание $-\\|\\nabla f\\| = {{ex.dir.tex.steepest}}$."
     }
    ]
   },
   {
    "id": "taylor",
    "title": {
     "en": "Taylor's formula",
     "ru": "Формула Тейлора"
    },
    "items": [
     {
      "en": "**Taylor**: $f(x + h) = f(x) + \\nabla f(x)^\\top h + \\tfrac12\\, h^\\top H(x)\\, h + o(\\|h\\|^2)$. The linear term changes sign with $h$, the quadratic term does not.",
      "ru": "**Тейлор**: $f(x + h) = f(x) + \\nabla f(x)^\\top h + \\tfrac12\\, h^\\top H(x)\\, h + o(\\|h\\|^2)$. Линейное слагаемое меняет знак вместе с $h$, квадратичное — нет."
     },
     {
      "en": "$h^\\top H h = H_{11}h_1^2 + 2H_{12}h_1h_2 + H_{22}h_2^2$: for the lecture $H{{ex.lecture.point}}$ and $h = {{ex.lecture.h}}$ it is ${{ex.lecture.hHh}}$.",
      "ru": "$h^\\top H h = H_{11}h_1^2 + 2H_{12}h_1h_2 + H_{22}h_2^2$: для $H{{ex.lecture.point}}$ из лекции и $h = {{ex.lecture.h}}$ это ${{ex.lecture.hHh}}$."
     },
     {
      "en": "**Accuracy**: from ${{ex.lecture.point}}$ along $t\\,{{ex.lecture.h}}$ with $t = {{ex.taylor.tenth.t}}$ the linear model ${{ex.taylor.tex.lin}}$ is off by ${{ex.taylor.tenth.tex.errLin}}$, the quadratic ${{ex.taylor.tex.quad}}$ by ${{ex.taylor.tenth.tex.errQuad}}$.",
      "ru": "**Точность**: из точки ${{ex.lecture.point}}$ вдоль $t\\,{{ex.lecture.h}}$ при $t = {{ex.taylor.tenth.t}}$ линейная модель ${{ex.taylor.tex.lin}}$ ошибается на ${{ex.taylor.tenth.tex.errLin}}$, квадратичная ${{ex.taylor.tex.quad}}$ — на ${{ex.taylor.tenth.tex.errQuad}}$."
     },
     {
      "en": "**Quadratic** $f$: the formula is exact. $q = {{ex.quad.tex.f}}$, $x = {{ex.quad.point}}$, $h = {{ex.quad.h}}$ give ${{ex.quad.value}}$ both ways.",
      "ru": "**Квадратичная** $f$: формула точна. $q = {{ex.quad.tex.f}}$, $x = {{ex.quad.point}}$, $h = {{ex.quad.h}}$ дают ${{ex.quad.value}}$ обоими способами."
     }
    ]
   },
   {
    "id": "definiteness",
    "title": {
     "en": "Definiteness",
     "ru": "Знакоопределённость"
    },
    "items": [
     {
      "en": "Symmetric $A$: $A \\succ 0$ if $h^\\top A h > 0$ for all $h \\ne 0$ (a bowl); $A \\succeq 0$ if $h^\\top A h \\ge 0$ (a bowl or a trough); $A \\prec 0$, $A \\preceq 0$ likewise (a dome); **indefinite** if $h^\\top A h$ takes both signs (a saddle).",
      "ru": "Симметричная $A$: $A \\succ 0$, если $h^\\top A h > 0$ для всех $h \\ne 0$ (чаша); $A \\succeq 0$, если $h^\\top A h \\ge 0$ (чаша или жёлоб); $A \\prec 0$, $A \\preceq 0$ аналогично (купол); **знаконеопределённая**, если $h^\\top A h$ принимает значения обоих знаков (седло)."
     },
     {
      "en": "**Eigenvalues decide**: all $> 0$, all $\\ge 0$ or mixed signs. For $2 \\times 2$: $\\lambda^2 - (A_{11} + A_{22})\\lambda + \\det A = 0$. A1: ${{ex.eig.pd.tex.poly}} = 0$, $\\lambda = {{ex.eig.pd.values}}$; C2: ${{ex.eig.indef.tex.poly}} = 0$, $\\lambda = {{ex.eig.indef.values}}$.",
      "ru": "**Всё решают собственные значения**: все $> 0$, все $\\ge 0$ или разных знаков. Для $2 \\times 2$: $\\lambda^2 - (A_{11} + A_{22})\\lambda + \\det A = 0$. A1: ${{ex.eig.pd.tex.poly}} = 0$, $\\lambda = {{ex.eig.pd.values}}$; C2: ${{ex.eig.indef.tex.poly}} = 0$, $\\lambda = {{ex.eig.indef.values}}$."
     },
     {
      "en": "**Sylvester**: $A \\succ 0 \\iff \\Delta_k > 0$ for all $k$; $A \\prec 0 \\iff (-1)^k \\Delta_k > 0$ for all $k$. A3: $\\Delta = {{ex.syl.minors}}$, so $H \\succ 0$.",
      "ru": "**Сильвестр**: $A \\succ 0 \\iff \\Delta_k > 0$ для всех $k$; $A \\prec 0 \\iff (-1)^k \\Delta_k > 0$ для всех $k$. A3: $\\Delta = {{ex.syl.minors}}$, значит, $H \\succ 0$."
     },
     {
      "en": "**Semidefinite**: leading minors cannot tell. Use **all** principal minors (${{ex.syl.nPrincipal}}$ of them for ${{ex.syl.nLeading}} \\times {{ex.syl.nLeading}}$) or eigenvalues with a tolerance.",
      "ru": "**Полуопределённость**: угловые миноры её не распознают. Нужны **все** главные миноры (их ${{ex.syl.nPrincipal}}$ для матрицы ${{ex.syl.nLeading}} \\times {{ex.syl.nLeading}}$) или собственные значения с допуском."
     }
    ]
   },
   {
    "id": "minima",
    "title": {
     "en": "Minima and feasible directions",
     "ru": "Минимумы и допустимые направления"
    },
    "items": [
     {
      "en": "**Local minimum** $x^* \\in \\Omega$: for some $\\varepsilon > 0$, $f(x) \\ge f(x^*)$ for all $x \\in \\Omega$ with $\\|x - x^*\\| < \\varepsilon$. **Global**: for all $x \\in \\Omega$. **Strict**: $f(x) > f(x^*)$ for $x \\ne x^*$.",
      "ru": "**Локальный минимум** $x^* \\in \\Omega$: существует $\\varepsilon > 0$, при котором $f(x) \\ge f(x^*)$ для всех $x \\in \\Omega$ с $\\|x - x^*\\| < \\varepsilon$. **Глобальный**: для всех $x \\in \\Omega$. **Строгий**: $f(x) > f(x^*)$ при $x \\ne x^*$."
     },
     {
      "en": "**Interior point**: a small ball around it lies in $\\Omega$; otherwise a **boundary** point. Quadrant $x \\ge 0$: ${{ex.quadrant.interior}}$ is interior, ${{ex.quadrant.boundary}}$ is on the boundary.",
      "ru": "**Внутренняя точка**: небольшой шар вокруг неё лежит в $\\Omega$; иначе точка **граничная**. Квадрант $x \\ge 0$: ${{ex.quadrant.interior}}$ — внутренняя точка, ${{ex.quadrant.boundary}}$ — граничная."
     },
     {
      "en": "**Feasible direction** $s \\ne 0$ at $x$: $x + \\alpha s \\in \\Omega$ for all $\\alpha \\in [0, \\alpha_0]$ with some $\\alpha_0 > 0$. D1 at ${{ex.quadrant.boundary}}$: $s_1 \\ge 0$; at the corner ${{ex.quadrant.corner}}$: $s \\ge 0$; at an interior point: every $s$.",
      "ru": "**Допустимое направление** $s \\ne 0$ в точке $x$: $x + \\alpha s \\in \\Omega$ для всех $\\alpha \\in [0, \\alpha_0]$ при некотором $\\alpha_0 > 0$. D1 в точке ${{ex.quadrant.boundary}}$: $s_1 \\ge 0$; в угловой точке ${{ex.quadrant.corner}}$: $s \\ge 0$; во внутренней точке — любое $s$."
     }
    ]
   },
   {
    "id": "conditions",
    "title": {
     "en": "Optimality conditions",
     "ru": "Условия оптимальности"
    },
    "items": [
     {
      "en": "**First order, necessary**: $s^\\top \\nabla f(x^*) \\ge 0$ for every feasible $s$; at an interior point this is $\\nabla f(x^*) = 0$, a **stationary point**. One violating direction rejects a point (D1); accepting needs all of them.",
      "ru": "**Необходимое условие первого порядка**: $s^\\top \\nabla f(x^*) \\ge 0$ для любого допустимого $s$; во внутренней точке это $\\nabla f(x^*) = 0$, то есть **стационарная точка**. Чтобы отвергнуть точку, хватит одного нарушающего направления (D1); чтобы принять, нужны все."
     },
     {
      "en": "**Second order, necessary** (interior point): $\\nabla f(x^*) = 0$ and $H(x^*) \\succeq 0$.",
      "ru": "**Необходимое условие второго порядка** (внутренняя точка): $\\nabla f(x^*) = 0$ и $H(x^*) \\succeq 0$."
     },
     {
      "en": "**Sufficient** (interior point): $\\nabla f(x^*) = 0$ and $H(x^*) \\succ 0$ give a strict local minimum. There is **no** sufficient condition of first order.",
      "ru": "**Достаточное условие** (внутренняя точка): $\\nabla f(x^*) = 0$ и $H(x^*) \\succ 0$ дают строгий локальный минимум. Достаточного условия первого порядка **нет**."
     },
     {
      "en": "**Procedure**: solve $\\nabla f = 0$; at each candidate $H \\succ 0$ means a minimum, $H \\prec 0$ a maximum, indefinite $H$ a saddle, singular semidefinite $H$: analyse $f$ directly. Call a minimum **global** only by convexity or a bound.",
      "ru": "**Порядок действий**: решите $\\nabla f = 0$ и в каждой найденной точке посмотрите на $H$: $H \\succ 0$ — минимум, $H \\prec 0$ — максимум, знаконеопределённый $H$ — седло; если $H$ вырожден и полуопределён, исследуйте $f$ напрямую. Называйте минимум **глобальным**, только опираясь на выпуклость или оценку снизу."
     }
    ]
   },
   {
    "id": "gap",
    "title": {
     "en": "When the second-order test is silent",
     "ru": "Когда тест второго порядка молчит"
    },
    "items": [
     {
      "en": "Same data, opposite answers: $f_1 = {{ex.gap.tex.f1}}$ and $f_2 = {{ex.gap.tex.f2}}$ both have $\\nabla f(0) = 0$ and $H(0) = 0$; $f_1$ has a strict global minimum at $0$ (B4), $f_2$ no extremum (B3).",
      "ru": "Одинаковые данные, противоположные ответы: у обеих функций $f_1 = {{ex.gap.tex.f1}}$ и $f_2 = {{ex.gap.tex.f2}}$ выполнено $\\nabla f(0) = 0$ и $H(0) = 0$; у $f_1$ в нуле строгий глобальный минимум (B4), у $f_2$ экстремума нет (B3)."
     },
     {
      "en": "**Bound from below**: $f_1 \\ge 0 = f_1(0)$. **Restrict to a line**: $f_2(x_1, 0) = x_1^3$ changes sign. **Polar form**: $f_2 = {{ex.monkey.tex.polar}}$, {{ex.monkey.nSectors}} sectors of ${{ex.monkey.sectorDeg}}^\\circ$. A picture is a guide, not a proof.",
      "ru": "**Оценка снизу**: $f_1 \\ge 0 = f_1(0)$. **Сужение на прямую**: $f_2(x_1, 0) = x_1^3$ меняет знак. **Полярная форма**: $f_2 = {{ex.monkey.tex.polar}}$, {{ex.monkey.nSectors}} секторов по ${{ex.monkey.sectorDeg}}^\\circ$. Картинка — подсказка, а не доказательство."
     },
     {
      "en": "**Flat directions**: $x_1^2$ has a whole line of non-strict minima with $H = \\operatorname{diag}(2, 0)$; $x_1^3 + x_2^2$ has $H(0) \\succeq 0$ and no extremum (H1).",
      "ru": "**Плоские направления**: у $x_1^2$ целая прямая нестрогих минимумов и $H = \\operatorname{diag}(2, 0)$; у $x_1^3 + x_2^2$ гессиан $H(0) \\succeq 0$, а экстремума нет (H1)."
     }
    ]
   },
   {
    "id": "convexity",
    "title": {
     "en": "Convexity",
     "ru": "Выпуклость"
    },
    "items": [
     {
      "en": "**Convex set**: $\\lambda x + (1 - \\lambda) y \\in \\Omega$ for all $x, y \\in \\Omega$, $\\lambda \\in [0, 1]$. **Convex function**: $f\\big(\\lambda x + (1 - \\lambda) y\\big) \\le \\lambda f(x) + (1 - \\lambda) f(y)$ for all such $x$, $y$, $\\lambda$. Every norm ball is convex (C1); a ring is not.",
      "ru": "**Выпуклое множество**: $\\lambda x + (1 - \\lambda) y \\in \\Omega$ для всех $x, y \\in \\Omega$, $\\lambda \\in [0, 1]$. **Выпуклая функция**: $f\\big(\\lambda x + (1 - \\lambda) y\\big) \\le \\lambda f(x) + (1 - \\lambda) f(y)$ для всех таких $x$, $y$, $\\lambda$. Любой шар в любой норме выпукл (C1), кольцо — нет."
     },
     {
      "en": "**Test** ($f \\in C^2$, open convex $\\Omega$): convex $\\iff H(x) \\succeq 0$ everywhere; $H \\succ 0$ everywhere gives strict convexity. C2: $x_1^2 + x_2^2 + a\\,x_1x_2$ has $\\lambda = 2 \\pm a$ and is convex $\\iff |a| \\le {{ex.family.bound}}$.",
      "ru": "**Критерий** ($f \\in C^2$, открытое выпуклое $\\Omega$): $f$ выпукла $\\iff H(x) \\succeq 0$ всюду; $H \\succ 0$ всюду даёт строгую выпуклость. C2: у гессиана функции $x_1^2 + x_2^2 + a\\,x_1x_2$ собственные значения $\\lambda = 2 \\pm a$, поэтому она выпукла $\\iff |a| \\le {{ex.family.bound}}$."
     },
     {
      "en": "**Local is global**: for a convex $f$ on a convex $\\Omega$ every local minimum is global, and on $\\mathbb R^n$ the condition $\\nabla f(x^*) = 0$ becomes sufficient.",
      "ru": "**Локальный — значит глобальный**: у выпуклой $f$ на выпуклом $\\Omega$ любой локальный минимум глобален, а на $\\mathbb R^n$ условие $\\nabla f(x^*) = 0$ становится достаточным."
     },
     {
      "en": "**Least squares** $L(w) = \\tfrac1m \\|Xw - y\\|^2$: $H_L = \\tfrac2m X^\\top X \\succeq 0$, so every solution of $X^\\top X w = X^\\top y$ is a global minimizer. Line fit: $w^* = {{ex.fit.tex.w}}$.",
      "ru": "**Наименьшие квадраты** $L(w) = \\tfrac1m \\|Xw - y\\|^2$: $H_L = \\tfrac2m X^\\top X \\succeq 0$, поэтому любое решение $X^\\top X w = X^\\top y$ — точка глобального минимума. Прямая по точкам: $w^* = {{ex.fit.tex.w}}$."
     }
    ]
   },
   {
    "id": "traps",
    "title": {
     "en": "Top traps",
     "ru": "Главные ловушки"
    },
    "items": [
     {
      "en": "A cross term $c\\,x_ix_j$ gives $H_{ij} = H_{ji} = c$: not $c/2$ (the entry of $A$ in $x^\\top A x$) and not $2c$ (only squares double).",
      "ru": "Смешанное слагаемое $c\\,x_ix_j$ даёт $H_{ij} = H_{ji} = c$: не $c/2$ (это элемент $A$ в $x^\\top A x$) и не $2c$ (удваиваются только квадраты)."
     },
     {
      "en": "Leading minors decide only strict definiteness: $\\operatorname{diag}(0, -1)$ and $\\operatorname{diag}(0, 1)$ both have $\\Delta_1 = \\Delta_2 = 0$, yet one is $\\preceq 0$ and the other $\\succeq 0$.",
      "ru": "Угловые миноры распознают только строгую знакоопределённость: у $\\operatorname{diag}(0, -1)$ и $\\operatorname{diag}(0, 1)$ они одинаковы, $\\Delta_1 = \\Delta_2 = 0$, но первая $\\preceq 0$, а вторая $\\succeq 0$."
     },
     {
      "en": "Gradient first: $H \\succ 0$ at a non-stationary point proves nothing. A2: $H{{ex.classify.notStationary.point}} \\succ 0$, but $\\nabla f = {{ex.classify.notStationary.grad}}$.",
      "ru": "Сначала градиент: $H \\succ 0$ в нестационарной точке ничего не доказывает. A2: $H{{ex.classify.notStationary.point}} \\succ 0$, но $\\nabla f = {{ex.classify.notStationary.grad}}$."
     },
     {
      "en": "$s^\\top \\nabla f$ is a rate per unit of $\\alpha$: compare directions only after dividing by $\\|s\\|$.",
      "ru": "$s^\\top \\nabla f$ — скорость на единицу $\\alpha$: сравнивайте направления только после деления на $\\|s\\|$."
     },
     {
      "en": "In code a saddle needs `w.min() < -tol and w.max() > tol`; the chained `w.min() < -tol < w.max()` calls $\\operatorname{diag}(0, -1)$ a saddle.",
      "ru": "В коде условие седла — `w.min() < -tol and w.max() > tol`; цепочка `w.min() < -tol < w.max()` называет седлом $\\operatorname{diag}(0, -1)$."
     }
    ]
   }
  ]
 }
}/*JSON-END*/);
