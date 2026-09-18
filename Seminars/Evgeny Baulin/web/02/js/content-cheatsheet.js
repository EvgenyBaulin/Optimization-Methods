// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 02 content: the cheat sheet (cheatsheet.html), in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar02_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "cheatsheet": {
  "title": {
   "en": "Convexity, Constraints and Optimality Conditions",
   "ru": "Выпуклость, ограничения и условия оптимальности"
  },
  "subtitle": {
   "en": "Cheat sheet: definitions, tests, formulas and traps on one page",
   "ru": "Шпаргалка: определения, проверки, формулы и ловушки на одной странице"
  },
  "sections": [
   {
    "id": "convexity",
    "title": {
     "en": "Convexity tests",
     "ru": "Проверка выпуклости"
    },
    "items": [
     {
      "en": "**Convex set** $C$: $(1-t)x + ty \\in C$ for all $x, y \\in C$ and $t \\in [0, 1]$. **Convex function** (the Jensen inequality): $f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y)$.",
      "ru": "**Выпуклое множество** $C$: $(1-t)x + ty \\in C$ для всех $x, y \\in C$ и $t \\in [0, 1]$. **Выпуклая функция** (неравенство Йенсена): $f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y)$."
     },
     {
      "en": "**First order** ($f \\in C^1$): $f$ is convex $\\iff f(y) \\ge f(x) + \\nabla f(x)^\\top (y - x)$ for all $x, y$; the tangent lies below the graph. For $f(x) = x^2$: $f({{ex.first.y}}) = {{ex.first.fy}} \\ge f({{ex.first.x}}) + f'({{ex.first.x}})({{ex.first.y}} - {{ex.first.x}}) = {{ex.first.tangent}}$.",
      "ru": "**Первый порядок** ($f \\in C^1$): $f$ выпукла $\\iff f(y) \\ge f(x) + \\nabla f(x)^\\top (y - x)$ для всех $x, y$; касательная лежит не выше графика. Для $f(x) = x^2$: $f({{ex.first.y}}) = {{ex.first.fy}} \\ge f({{ex.first.x}}) + f'({{ex.first.x}})({{ex.first.y}} - {{ex.first.x}}) = {{ex.first.tangent}}$."
     },
     {
      "en": "**Second order** ($f \\in C^2$): $f$ is convex $\\iff \\nabla^2 f(x) \\succeq 0$ at every $x$; $\\nabla^2 f \\succ 0$ everywhere implies strict convexity (not conversely). $H \\succeq 0$: all eigenvalues $\\ge 0$, or **all** principal minors $\\ge 0$; $H \\succ 0$: leading minors $> 0$. A1: $f = {{A1.tex.f}}$ has $H_{11} = {{A1.steps.minor11}}$, $H_{22} = {{A1.steps.minor22}}$, $\\det H = {{A1.tex.det}}$, so $f$ is convex $\\iff |a| \\le {{A1.params.aEdge}}$.",
      "ru": "**Второй порядок** ($f \\in C^2$): $f$ выпукла $\\iff \\nabla^2 f(x) \\succeq 0$ во всех точках; из $\\nabla^2 f \\succ 0$ всюду следует строгая выпуклость (обратное неверно). $H \\succeq 0$: все собственные значения $\\ge 0$ или **все** главные миноры $\\ge 0$; $H \\succ 0$: угловые миноры $> 0$. A1: для $f = {{A1.tex.f}}$ имеем $H_{11} = {{A1.steps.minor11}}$, $H_{22} = {{A1.steps.minor22}}$, $\\det H = {{A1.tex.det}}$, поэтому $f$ выпукла $\\iff |a| \\le {{A1.params.aEdge}}$."
     },
     {
      "en": "**One violating pair disproves** convexity; passing random tests proves nothing. A2: $f = {{A2.tex.f}}$, $p = {{A2.params.p}}$, $q = {{A2.params.q}}$: $f(p) = f(q) = 0$, but $f\\big(\\tfrac{p+q}{2}\\big) = {{A2.tex.fm}} > 0$.",
      "ru": "**Одна нарушающая пара опровергает** выпуклость; успешные случайные проверки ничего не доказывают. A2: $f = {{A2.tex.f}}$, $p = {{A2.params.p}}$, $q = {{A2.params.q}}$: $f(p) = f(q) = 0$, но $f\\big(\\tfrac{p+q}{2}\\big) = {{A2.tex.fm}} > 0$."
     }
    ]
   },
   {
    "id": "sets",
    "title": {
     "en": "What preserves convexity",
     "ru": "Что сохраняет выпуклость"
    },
    "items": [
     {
      "en": "**Intersections** $\\bigcap_\\alpha C_\\alpha$ of convex sets are convex; **unions** in general are not (two disjoint disks).",
      "ru": "**Пересечение** $\\bigcap_\\alpha C_\\alpha$ выпуклых множеств выпукло; **объединение**, вообще говоря, нет (два непересекающихся круга)."
     },
     {
      "en": "**Sublevel set** $\\{x:\\ f(x) \\le \\alpha\\}$ of a convex $f$ is convex; for a nonconvex $f$ check the set itself: $S = {{A3.tex.S}}$ is not convex. **Epigraph** $\\operatorname{epi} f = \\{(x, s):\\ f(x) \\le s\\}$ is convex $\\iff f$ is convex.",
      "ru": "**Множество подуровня** $\\{x:\\ f(x) \\le \\alpha\\}$ выпуклой функции выпукло; для невыпуклой $f$ проверяйте само множество: $S = {{A3.tex.S}}$ не выпукло. **Надграфик** $\\operatorname{epi} f = \\{(x, s):\\ f(x) \\le s\\}$ выпукл $\\iff f$ выпукла."
     },
     {
      "en": "**Affine maps**: the image $\\{Ax + b:\\ x \\in C\\}$ and the preimage $\\{x:\\ Ax + b \\in C\\}$ of a convex set are convex. Convex: half-spaces, balls, boxes, $\\Delta_d = \\{x \\in \\mathbb R^d:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$.",
      "ru": "**Аффинные отображения**: образ $\\{Ax + b:\\ x \\in C\\}$ и прообраз $\\{x:\\ Ax + b \\in C\\}$ выпуклого множества выпуклы. Выпуклы полупространства, шары, брусы, $\\Delta_d = \\{x \\in \\mathbb R^d:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$."
     },
     {
      "en": "The feasible set $\\{g_i \\le 0,\\ h_j = 0\\}$ with convex $g_i$ and affine $h_j$ is convex. A3: $T = {{A3.tex.T}}$ is a disk intersected with an epigraph, hence convex.",
      "ru": "Допустимое множество $\\{g_i \\le 0,\\ h_j = 0\\}$ при выпуклых $g_i$ и аффинных $h_j$ выпукло. A3: $T = {{A3.tex.T}}$ — пересечение круга и надграфика, поэтому выпукло."
     }
    ]
   },
   {
    "id": "projections",
    "title": {
     "en": "Projections",
     "ru": "Проекции"
    },
    "items": [
     {
      "en": "**Projection** $P_C(x) = \\arg\\min_{y \\in C} \\|y - x\\|$; for a closed convex $C$ it exists and is unique.",
      "ru": "**Проекция** $P_C(x) = \\arg\\min_{y \\in C} \\|y - x\\|$; для замкнутого выпуклого $C$ существует и единственна."
     },
     {
      "en": "**Ball** $\\{\\|y - c\\| \\le r\\}$: $P(x) = c + r\\,(x - c)/\\max(r,\\ \\|x - c\\|)$. **Box** $[l, u]$: $P(x) = \\min(\\max(x, l), u)$ coordinatewise. B2: $x = {{B2.params.x}}$ goes to ${{B2.steps.ball}}$ on the unit ball and to ${{B2.steps.box}}$ on the box $[{{B2.params.lo}}, {{B2.params.hi}}]^2$.",
      "ru": "**Шар** $\\{\\|y - c\\| \\le r\\}$: $P(x) = c + r\\,(x - c)/\\max(r,\\ \\|x - c\\|)$. **Брус** $[l, u]$: $P(x) = \\min(\\max(x, l), u)$ покоординатно. B2: $x = {{B2.params.x}}$ переходит в ${{B2.steps.ball}}$ на единичном шаре и в ${{B2.steps.box}}$ на брусе $[{{B2.params.lo}};\\ {{B2.params.hi}}]^2$."
     },
     {
      "en": "**Probability simplex** $\\Delta_d$: sort $v$ in decreasing order into $u$; $s_j = u_1 + \\dots + u_j$; $\\rho = \\max\\{j:\\ u_j - (s_j - 1)/j > 0\\}$; $\\theta = (s_\\rho - 1)/\\rho$; $P(v) = \\max(v - \\theta,\\ 0)$ in the **original** order. B3: $v = {{B3.params.v}}$, $u = {{B3.steps.u}}$, $s = {{B3.steps.s}}$, $\\rho = {{B3.steps.rho}}$, $\\theta = {{B3.steps.theta}}$, $P(v) = {{B3.steps.x}}$.",
      "ru": "**Вероятностный симплекс** $\\Delta_d$: сортируем $v$ по убыванию, получаем $u$; $s_j = u_1 + \\dots + u_j$; $\\rho = \\max\\{j:\\ u_j - (s_j - 1)/j > 0\\}$; $\\theta = (s_\\rho - 1)/\\rho$; $P(v) = \\max(v - \\theta,\\ 0)$ в **исходном** порядке. B3: $v = {{B3.params.v}}$, $u = {{B3.steps.u}}$, $s = {{B3.steps.s}}$, $\\rho = {{B3.steps.rho}}$, $\\theta = {{B3.steps.theta}}$, $P(v) = {{B3.steps.x}}$."
     },
     {
      "en": "**Obtuse angle**: $p = P_C(x) \\iff p \\in C$ and $(x - p)^\\top (y - p) \\le 0$ for all $y \\in C$, i.e. $x - p$ lies in the normal cone $N_C(p)$. On $\\Delta_d$ it suffices to test the vertices $y = e_k$.",
      "ru": "**Тупой угол**: $p = P_C(x) \\iff p \\in C$ и $(x - p)^\\top (y - p) \\le 0$ для всех $y \\in C$, то есть $x - p$ лежит в нормальном конусе $N_C(p)$. На $\\Delta_d$ достаточно проверить вершины $y = e_k$."
     }
    ]
   },
   {
    "id": "kkt",
    "title": {
     "en": "KKT conditions",
     "ru": "Условия ККТ"
    },
    "items": [
     {
      "en": "Problem: $\\min f(x)$ subject to $g_i(x) \\le 0$, $h_j(x) = 0$. Lagrangian: $\\mathcal L(x, \\lambda, \\nu) = f(x) + \\sum_i \\lambda_i g_i(x) + \\sum_j \\nu_j h_j(x)$ with $\\lambda \\ge 0$ and $\\nu$ of any sign.",
      "ru": "Задача: $\\min f(x)$ при $g_i(x) \\le 0$, $h_j(x) = 0$. Функция Лагранжа: $\\mathcal L(x, \\lambda, \\nu) = f(x) + \\sum_i \\lambda_i g_i(x) + \\sum_j \\nu_j h_j(x)$; множители Лагранжа $\\lambda \\ge 0$, знак $\\nu$ любой."
     },
     {
      "en": "**Karush–Kuhn–Tucker (KKT) conditions** at $x^*$. *Stationarity*: $\\nabla_x \\mathcal L = \\nabla f + \\sum_i \\lambda_i \\nabla g_i + \\sum_j \\nu_j \\nabla h_j = 0$. *Primal feasibility*: $g_i(x^*) \\le 0$, $h_j(x^*) = 0$. *Dual feasibility*: $\\lambda_i \\ge 0$. *Complementary slackness*: $\\lambda_i g_i(x^*) = 0$.",
      "ru": "Условия Каруша — Куна — Таккера (**ККТ**) в точке $x^*$. *Стационарность*: $\\nabla_x \\mathcal L = \\nabla f + \\sum_i \\lambda_i \\nabla g_i + \\sum_j \\nu_j \\nabla h_j = 0$. *Допустимость*: $g_i(x^*) \\le 0$, $h_j(x^*) = 0$. *Неотрицательность множителей*: $\\lambda_i \\ge 0$. *Условие дополняющей нежёсткости*: $\\lambda_i g_i(x^*) = 0$."
     },
     {
      "en": "**Signs**: write every inequality as $g \\le 0$ and add $+\\lambda g$ to $\\mathcal L$ with $\\lambda \\ge 0$; $x_1 \\ge 0$ becomes $-x_1 \\le 0$. SciPy writes inequalities as $c(x) \\ge 0$: pass $c = -g$.",
      "ru": "**Знаки**: каждое неравенство записываем как $g \\le 0$ и добавляем $+\\lambda g$ в $\\mathcal L$ с $\\lambda \\ge 0$; $x_1 \\ge 0$ превращается в $-x_1 \\le 0$. SciPy записывает неравенства как $c(x) \\ge 0$: передавайте $c = -g$."
     },
     {
      "en": "**Geometry**: $$-\\nabla f(x^*) = \\sum_{i\\ \\text{active}} \\lambda_i \\nabla g_i + \\sum_j \\nu_j \\nabla h_j,$$ the antigradient lies in the cone of the active gradients, which under Slater's condition is the normal cone $N_C(x^*) = \\{s:\\ s^\\top (y - x^*) \\le 0\\ \\forall y \\in C\\}$. C1: $\\min {{C1.tex.f}}$ subject to ${{C1.tex.g}} \\le 0$ gives $x^* = {{C1.answer.x.value}}$, $\\lambda^* = {{C1.answer.lam.value}}$ and $-\\nabla f(x^*) = {{C1.steps.minusGrad}} = {{C1.answer.lam.value}} \\cdot {{C1.params.A.1}}$.",
      "ru": "**Геометрия**: $$-\\nabla f(x^*) = \\sum_{i\\ \\text{акт.}} \\lambda_i \\nabla g_i + \\sum_j \\nu_j \\nabla h_j,$$ антиградиент лежит в конусе градиентов активных ограничений, который при условии Слейтера совпадает с нормальным конусом $N_C(x^*) = \\{s:\\ s^\\top (y - x^*) \\le 0\\ \\forall y \\in C\\}$. C1: $\\min {{C1.tex.f}}$ при ${{C1.tex.g}} \\le 0$ даёт $x^* = {{C1.answer.x.value}}$, $\\lambda^* = {{C1.answer.lam.value}}$ и $-\\nabla f(x^*) = {{C1.steps.minusGrad}} = {{C1.answer.lam.value}} \\cdot {{C1.params.A.1}}$."
     }
    ]
   },
   {
    "id": "active",
    "title": {
     "en": "Active constraints",
     "ru": "Активные ограничения"
    },
    "items": [
     {
      "en": "A constraint is **active** at $x^*$ if $g_i(x^*) = 0$ and **inactive** if $g_i(x^*) < 0$; equalities are always active.",
      "ru": "Ограничение **активно** в $x^*$, если $g_i(x^*) = 0$, и **неактивно**, если $g_i(x^*) < 0$; равенства активны всегда."
     },
     {
      "en": "Complementary slackness: inactive $\\Rightarrow \\lambda_i = 0$; $\\lambda_i > 0 \\Rightarrow$ active. An active constraint **may** have $\\lambda_i = 0$.",
      "ru": "Из дополняющей нежёсткости: неактивно $\\Rightarrow \\lambda_i = 0$; $\\lambda_i > 0 \\Rightarrow$ активно. У активного ограничения **может** быть $\\lambda_i = 0$."
     },
     {
      "en": "**Active-set search**: guess the active set; solve stationarity with $g_i = 0$ for active $i$ and $\\lambda_i = 0$ for the rest; keep the candidate only if $g(x) \\le 0$ and $\\lambda \\ge 0$. A negative $\\lambda_i$ means a wrong active set.",
      "ru": "**Перебор активных множеств**: выбираем активное множество; решаем систему из стационарности, $g_i = 0$ для активных $i$ и $\\lambda_i = 0$ для остальных; оставляем кандидата, только если $g(x) \\le 0$ и $\\lambda \\ge 0$. Отрицательный $\\lambda_i$ означает неверное активное множество."
     },
     {
      "en": "C2: $\\min {{C2.tex.f}}$ subject to ${{C2.tex.g}} \\le 0$. The case $\\lambda = 0$ gives $x^* = {{C2.answer.x.value}}$ with $g = {{C2.steps.gStar}} < 0$, so $\\lambda^* = 0$. Assuming $g = 0$ gives $\\lambda = {{C2.cand.S1.lam.1}} < 0$: rejected.",
      "ru": "C2: $\\min {{C2.tex.f}}$ при ${{C2.tex.g}} \\le 0$. Случай $\\lambda = 0$ даёт $x^* = {{C2.answer.x.value}}$ и $g = {{C2.steps.gStar}} < 0$, значит, $\\lambda^* = 0$. Предположение $g = 0$ даёт $\\lambda = {{C2.cand.S1.lam.1}} < 0$: отбрасываем."
     },
     {
      "en": "A multiplier is a price: relaxing $g_i \\le 0$ to $g_i \\le u_i$ changes the optimal value at the rate $\\partial p^*/\\partial u_i = -\\lambda_i^*$.",
      "ru": "Множитель — цена ограничения: если ослабить $g_i \\le 0$ до $g_i \\le u_i$, оптимальное значение меняется со скоростью $\\partial p^*/\\partial u_i = -\\lambda_i^*$."
     }
    ]
   },
   {
    "id": "slater",
    "title": {
     "en": "Slater's condition",
     "ru": "Условие Слейтера"
    },
    "items": [
     {
      "en": "**Slater's condition**: the problem is convex ($f$, $g_i$ convex, $h_j$ affine) and has a strictly feasible point: $g_i(\\bar x) < 0$, $h_j(\\bar x) = 0$. C1: $\\bar x = {{ex.slater.point}}$, $g(\\bar x) = {{ex.slater.g}} < 0$.",
      "ru": "**Условие Слейтера**: задача выпукла ($f$, $g_i$ выпуклы, $h_j$ аффинны) и есть строго допустимая точка: $g_i(\\bar x) < 0$, $h_j(\\bar x) = 0$. C1: $\\bar x = {{ex.slater.point}}$, $g(\\bar x) = {{ex.slater.g}} < 0$."
     },
     {
      "en": "In a convex problem every KKT point is a global minimum; with a Slater point the converse holds too: every minimum has multipliers.",
      "ru": "В выпуклой задаче любая точка ККТ — глобальный минимум; при наличии точки Слейтера верно и обратное: в каждом минимуме есть множители."
     },
     {
      "en": "**Without a constraint qualification KKT may fail**: $\\min x$ subject to $x^2 \\le 0$. Only $x^* = {{D2.xStar}}$ is feasible, stationarity $1 + 2\\lambda x^* = 1 \\ne 0$ has no solution, and there is no Slater point. Here $q(\\lambda) = {{D2.tex.q}} \\to p^*$ as $\\lambda \\to \\infty$, but no $\\lambda$ attains it.",
      "ru": "**Без условия регулярности ККТ могут не выполняться**: $\\min x$ при $x^2 \\le 0$. Допустима только $x^* = {{D2.xStar}}$, стационарность $1 + 2\\lambda x^* = 1 \\ne 0$ не имеет решения, а точки Слейтера нет. Здесь $q(\\lambda) = {{D2.tex.q}} \\to p^*$ при $\\lambda \\to \\infty$, но ни при каком $\\lambda$ не достигает его."
     }
    ]
   },
   {
    "id": "duality",
    "title": {
     "en": "Duality",
     "ru": "Двойственность"
    },
    "items": [
     {
      "en": "**Dual function** $q(\\lambda, \\nu) = \\inf_x \\mathcal L(x, \\lambda, \\nu)$ is concave for every problem (an infimum of affine functions). Dual problem: $d^* = \\max_{\\lambda \\ge 0,\\ \\nu} q(\\lambda, \\nu)$.",
      "ru": "**Двойственная функция** $q(\\lambda, \\nu) = \\inf_x \\mathcal L(x, \\lambda, \\nu)$ вогнута для любой задачи (инфимум аффинных функций). Двойственная задача: $d^* = \\max_{\\lambda \\ge 0,\\ \\nu} q(\\lambda, \\nu)$."
     },
     {
      "en": "**Weak duality**: $q(\\lambda, \\nu) \\le f(x)$ for feasible $x$ and $\\lambda \\ge 0$, so $d^* \\le p^*$ and the duality gap $p^* - d^* \\ge 0$. C1: $q(\\lambda) = {{D3.convex.tex.q}}$ and $q({{ex.weak.lam}}) = {{ex.weak.q}} \\le p^* = {{D3.convex.pStar}}$.",
      "ru": "**Слабая двойственность**: $q(\\lambda, \\nu) \\le f(x)$ для допустимого $x$ и $\\lambda \\ge 0$, поэтому $d^* \\le p^*$ и зазор двойственности $p^* - d^* \\ge 0$. C1: $q(\\lambda) = {{D3.convex.tex.q}}$ и $q({{ex.weak.lam}}) = {{ex.weak.q}} \\le p^* = {{D3.convex.pStar}}$."
     },
     {
      "en": "**Strong duality**: convex + Slater $\\Rightarrow p^* = d^*$. C1: $\\max q = q({{D3.convex.lamStar}}) = {{D3.convex.dStar}} = p^*$, attained at the KKT multiplier $\\lambda^*$.",
      "ru": "**Сильная двойственность**: выпуклость + условие Слейтера $\\Rightarrow p^* = d^*$. C1: $\\max q = q({{D3.convex.lamStar}}) = {{D3.convex.dStar}} = p^*$, максимум достигается при множителе ККТ $\\lambda^*$."
     },
     {
      "en": "**Gap without convexity**: $\\min x_1x_2 + x_2x_3 + x_1x_3$ subject to $x_i^2 = 1$ has $p^* = {{D3.bool.pStar}}$ and $d^* = {{D3.bool.tex.dStar}}$, a gap of ${{D3.bool.tex.gap}} > 0$.",
      "ru": "**Зазор без выпуклости**: для $\\min x_1x_2 + x_2x_3 + x_1x_3$ при $x_i^2 = 1$ имеем $p^* = {{D3.bool.pStar}}$ и $d^* = {{D3.bool.tex.dStar}}$, зазор ${{D3.bool.tex.gap}} > 0$."
     },
     {
      "en": "**Caveat (S-lemma)**: a problem with a quadratic objective, one quadratic constraint and a strictly feasible point has a zero gap even when nonconvex.",
      "ru": "**Оговорка (S-лемма)**: у квадратичной задачи с одним квадратичным ограничением и строго допустимой точкой зазор нулевой даже без выпуклости."
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
      "en": "Classify eigenvalues $\\mu_k$ with a **relative** tolerance $\\varepsilon \\max_k |\\mu_k|$: an absolute one turns a tiny $H \\succ 0$ into zero.",
      "ru": "Собственные значения $\\mu_k$ классифицируйте с **относительным** допуском $\\varepsilon \\max_k |\\mu_k|$: абсолютный превращает крошечную $H \\succ 0$ в нулевую."
     },
     {
      "en": "A cross term $c\\,x_ix_j$ puts $c$ into **both** $H_{ij}$ and $H_{ji}$; $c/2$ is the entry of $A$ in $x^\\top A x$.",
      "ru": "Смешанное слагаемое $c\\,x_ix_j$ даёт $c$ в **оба** элемента $H_{ij}$ и $H_{ji}$; $c/2$ — элемент $A$ в записи $x^\\top A x$."
     },
     {
      "en": "Leading minors decide only $H \\succ 0$; $H \\succeq 0$ needs **all** principal minors: $\\operatorname{diag}(0, -1)$ has zero leading minors but is not $\\succeq 0$.",
      "ru": "Угловые миноры решают только вопрос о $H \\succ 0$; для $H \\succeq 0$ нужны **все** главные миноры: у $\\operatorname{diag}(0, -1)$ угловые миноры нулевые, но $H \\not\\succeq 0$."
     },
     {
      "en": "Simplex: the sort only finds $\\theta$; return $\\max(v - \\theta, 0)$ in the **original** order. Every coordinate $\\le \\theta$ vanishes, positive ones too: in B3 $v_1 = {{B3.params.v.1}} > 0$ but $x_1 = 0$.",
      "ru": "Симплекс: сортировка нужна только для $\\theta$, ответ $\\max(v - \\theta, 0)$ — в **исходном** порядке. Обнуляется любая координата $\\le \\theta$, в том числе положительная: в B3 $v_1 = {{B3.params.v.1}} > 0$, но $x_1 = 0$."
     },
     {
      "en": "Signs: $g \\le 0$, $+\\lambda g$, $\\lambda \\ge 0$ (SciPy: $c(x) \\ge 0$); $\\nu$ has no sign; a negative $\\lambda$ is not an answer but a wrong active set.",
      "ru": "Знаки: $g \\le 0$, $+\\lambda g$, $\\lambda \\ge 0$ (в SciPy $c(x) \\ge 0$); знак $\\nu$ не фиксирован; отрицательный $\\lambda$ — не ответ, а неверное активное множество."
     }
    ]
   }
  ]
 }
}/*JSON-END*/);
