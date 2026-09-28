// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 03 content: the block titles, block 0 (Jensen's inequality, mu and L), the questions of the exit ticket
// and the home practice, in English and Russian. The rest of the page (recaps, block D, takeaways, answers) is
// in locked.enc.js until the end of the class.
// Strict JSON between the markers. Placeholders in {braces} are filled by the page.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. Catch-up: Jensen's inequality, μ and L",
     "ru": "0. Догоняем: неравенство Йенсена, μ и L"
    },
    "short": {
     "en": "0. Catch-up",
     "ru": "0. Догоняем"
    },
    "jensen": {
     "title": {
      "en": "Jensen's inequality as the definition",
      "ru": "Неравенство Йенсена как определение"
     },
     "intro": {
      "en": "Seminar 2 used Jensen's inequality as a test. Today it is the definition. A function $f$ on a convex set is **convex** if for all $x$, $y$ and every $t \\in [0, 1]$ $$f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y).$$",
      "ru": "На семинаре 2 неравенство Йенсена служило проверкой. Сегодня это определение. Функция $f$, заданная на выпуклом множестве, **выпукла**, если для всех $x$, $y$ и любого $t \\in [0, 1]$ $$f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y).$$"
     },
     "points": [
      {
       "title": {
        "en": "The chord above the graph",
        "ru": "Хорда над графиком"
       },
       "text": {
        "en": "The left side is the value of $f$ at the point $(1-t)x + ty$ of the segment from $x$ to $y$. The right side is the height of the chord from $(x, f(x))$ to $(y, f(y))$ above the same point. Convexity says exactly this: the chord never dips below the graph. No derivatives are involved. $f(x) = |x|$ is convex, since $|(1-t)x + ty| \\le (1-t)|x| + t|y|$ by the triangle inequality, and it has no derivative at $0$.",
        "ru": "Слева стоит значение $f$ в точке $(1-t)x + ty$ отрезка от $x$ до $y$. Справа — высота хорды, соединяющей $(x, f(x))$ и $(y, f(y))$, над той же точкой. Выпуклость означает ровно это: хорда нигде не опускается ниже графика. Производные здесь не нужны. Функция $f(x) = |x|$ выпукла, так как $|(1-t)x + ty| \\le (1-t)|x| + t|y|$ по неравенству треугольника, а производной в точке $0$ у неё нет."
       }
      },
      {
       "title": {
        "en": "The weight stays in [0, 1]",
        "ru": "Вес не выходит из [0, 1]"
       },
       "text": {
        "en": "For $t \\in [0, 1]$ the point $(1-t)x + ty$ lies between $x$ and $y$. Outside that range it leaves the segment, and the extended chord is no longer above the graph. For $f(x) = x^2$ with $x = {{zero.x2out.x}}$, $y = {{zero.x2out.y}}$ and $t = {{zero.x2out.t}}$ the point is $(1-t)x + ty = {{zero.x2out.point}}$, the left side is $f({{zero.x2out.point}}) = {{zero.x2out.lhs}}$ and the right side is $(1-t)f(x) + t f(y) = {{zero.x2out.rhs}}$. Since ${{zero.x2out.lhs}} > {{zero.x2out.rhs}}$, the inequality fails even for $x^2$.",
        "ru": "При $t \\in [0, 1]$ точка $(1-t)x + ty$ лежит между $x$ и $y$. Вне этого диапазона она выходит за пределы отрезка, и продолженная хорда уже не лежит над графиком. Для $f(x) = x^2$ при $x = {{zero.x2out.x}}$, $y = {{zero.x2out.y}}$ и $t = {{zero.x2out.t}}$ получаем точку $(1-t)x + ty = {{zero.x2out.point}}$, левая часть равна $f({{zero.x2out.point}}) = {{zero.x2out.lhs}}$, а правая — $(1-t)f(x) + t f(y) = {{zero.x2out.rhs}}$. Так как ${{zero.x2out.lhs}} > {{zero.x2out.rhs}}$, неравенство нарушается даже для $x^2$."
       }
      },
      {
       "title": {
        "en": "The square in one line",
        "ru": "Квадрат в одну строку"
       },
       "text": {
        "en": "For $f(x) = x^2$: $$(1-t)x^2 + ty^2 - \\big((1-t)x + ty\\big)^2 = t(1-t)x^2 - 2t(1-t)xy + t(1-t)y^2 = t(1-t)(x - y)^2 \\ge 0.$$ The gap between chord and graph is $t(1-t)(x - y)^2$. It vanishes only when $t \\in \\{0, 1\\}$ or $x = y$, so for $x \\ne y$ and $0 < t < 1$ the inequality is strict: $x^2$ is strictly convex.",
        "ru": "Для $f(x) = x^2$: $$(1-t)x^2 + ty^2 - \\big((1-t)x + ty\\big)^2 = t(1-t)x^2 - 2t(1-t)xy + t(1-t)y^2 = t(1-t)(x - y)^2 \\ge 0.$$ Зазор между хордой и графиком равен $t(1-t)(x - y)^2$. Он обращается в нуль, только когда $t \\in \\{0, 1\\}$ или $x = y$, поэтому при $x \\ne y$ и $0 < t < 1$ неравенство строгое: функция $x^2$ строго выпукла."
       }
      },
      {
       "title": {
        "en": "Three equivalent tests",
        "ru": "Три равносильных критерия"
       },
       "text": {
        "en": "For $f$ on an open convex set, each test below must hold for all $x$, $y$ and $t \\in [0, 1]$: $$\\text{chord:}\\quad f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y),$$ $$\\text{tangent below:}\\quad f(y) \\ge f(x) + \\nabla f(x)^\\top (y - x),$$ $$\\text{curvature:}\\quad \\nabla^2 f(x) \\succeq 0.$$ The chord form is the definition and needs nothing. The tangent form needs $f$ differentiable (first order), the curvature form twice differentiable (second order). Under that smoothness the three are equivalent. For $|x|$ only the chord form can be checked at $0$.",
        "ru": "Пусть $f$ задана на открытом выпуклом множестве. Каждое из условий ниже должно выполняться для всех $x$, $y$ и $t \\in [0, 1]$: $$\\text{хорда:}\\quad f\\big((1-t)x + ty\\big) \\le (1-t)f(x) + t f(y),$$ $$\\text{касательная снизу:}\\quad f(y) \\ge f(x) + \\nabla f(x)^\\top (y - x),$$ $$\\text{кривизна:}\\quad \\nabla^2 f(x) \\succeq 0.$$ Условие с хордой — это определение, оно ничего не требует от функции. Для условия с касательной $f$ должна быть дифференцируема (первый порядок), для условия с кривизной — дважды дифференцируема (второй порядок). При такой гладкости все три условия равносильны. Для $|x|$ в точке $0$ можно проверить только условие с хордой."
       }
      },
      {
       "title": {
        "en": "Many points and expectations",
        "ru": "Много точек и математическое ожидание"
       },
       "text": {
        "en": "With weights $t_i \\ge 0$ and $\\sum_i t_i = 1$, $$f\\Big(\\sum_i t_i x_i\\Big) \\le \\sum_i t_i f(x_i),$$ by induction from two points. Reading the weights as probabilities gives $f(\\mathbb E X) \\le \\mathbb E f(X)$. For a concave $f$ both inequalities flip, and this is the usual trap: $\\log$ is concave, so $\\log \\mathbb E X \\ge \\mathbb E \\log X$. The payoff is AM–GM: $-\\log$ is convex on $(0, \\infty)$ because $(-\\log x)'' = 1/x^2 > 0$, and Jensen with $t = \\tfrac{1}{2}$ gives $$-\\log\\frac{a + b}{2} \\le -\\frac{\\log a + \\log b}{2} = -\\log\\sqrt{ab},$$ that is, $\\sqrt{ab} \\le \\frac{a + b}{2}$ for $a, b > 0$, since $\\log$ is increasing. For $a = {{zero.amgm.a}}$ and $b = {{zero.amgm.b}}$: $\\sqrt{ab} = {{zero.amgm.gm}} \\le {{zero.amgm.am}} = \\frac{a + b}{2}$.",
        "ru": "Для весов $t_i \\ge 0$ с $\\sum_i t_i = 1$ выполнено $$f\\Big(\\sum_i t_i x_i\\Big) \\le \\sum_i t_i f(x_i),$$ что выводится по индукции из случая двух точек. Если считать веса вероятностями, получаем $f(\\mathbb E X) \\le \\mathbb E f(X)$. Для вогнутой $f$ оба неравенства меняются на противоположные, и на этом обычно и ошибаются: функция $\\log$ вогнута, поэтому $\\log \\mathbb E X \\ge \\mathbb E \\log X$. Полезное следствие — неравенство между средним арифметическим и средним геометрическим: функция $-\\log$ выпукла на $(0, \\infty)$, поскольку $(-\\log x)'' = 1/x^2 > 0$, и неравенство Йенсена при $t = \\tfrac{1}{2}$ даёт $$-\\log\\frac{a + b}{2} \\le -\\frac{\\log a + \\log b}{2} = -\\log\\sqrt{ab},$$ то есть $\\sqrt{ab} \\le \\frac{a + b}{2}$ при $a, b > 0$, так как $\\log$ возрастает. При $a = {{zero.amgm.a}}$ и $b = {{zero.amgm.b}}$: $\\sqrt{ab} = {{zero.amgm.gm}} \\le {{zero.amgm.am}} = \\frac{a + b}{2}$."
       }
      },
      {
       "title": {
        "en": "A counterexample",
        "ru": "Контрпример"
       },
       "text": {
        "en": "Take $f(x) = x^3$ on $\\mathbb R$, $x = {{zero.x3.x}}$, $y = {{zero.x3.y}}$ and $t = {{zero.x3.t}}$. The point is $(1-t)x + ty = {{zero.x3.mid}}$. Left side: $f({{zero.x3.mid}}) = {{zero.x3.lhs}}$. Right side: $(1-t)f(x) + t f(y) = {{zero.x3.rhs}}$. Since ${{zero.x3.lhs}} > {{zero.x3.rhs}}$, the graph is above the chord and $x^3$ is not convex on $\\mathbb R$. One pair settles it. On $[0, \\infty)$ the same function is convex: the domain is part of the claim.",
        "ru": "Возьмём $f(x) = x^3$ на $\\mathbb R$, $x = {{zero.x3.x}}$, $y = {{zero.x3.y}}$ и $t = {{zero.x3.t}}$. Получаем точку $(1-t)x + ty = {{zero.x3.mid}}$. Левая часть: $f({{zero.x3.mid}}) = {{zero.x3.lhs}}$. Правая часть: $(1-t)f(x) + t f(y) = {{zero.x3.rhs}}$. Так как ${{zero.x3.lhs}} > {{zero.x3.rhs}}$, график проходит выше хорды, и $x^3$ не выпукла на $\\mathbb R$. Одной пары достаточно. На $[0, \\infty)$ та же функция выпукла: область определения — часть утверждения."
       }
      },
      {
       "title": {
        "en": "The bridge to today",
        "ru": "Переход к сегодняшней теме"
       },
       "text": {
        "en": "Strong convexity and smoothness are Jensen's inequality with an explicit quadratic margin on each side. $f$ is $\\mu$-strongly convex when the chord is above the graph by at least $\\frac{\\mu}{2}t(1-t)\\|x - y\\|^2$, and a convex $f$ is $L$-smooth when the chord is above the graph by at most $\\frac{L}{2}t(1-t)\\|x - y\\|^2$: $$\\frac{\\mu}{2}t(1-t)\\|x - y\\|^2 \\le (1-t)f(x) + t f(y) - f\\big((1-t)x + ty\\big) \\le \\frac{L}{2}t(1-t)\\|x - y\\|^2.$$ For $f(x) = \\tfrac{1}{2} x^\\top Q x$ the middle term is $\\tfrac{1}{2} t(1-t)(x - y)^\\top Q (x - y)$, the matrix version of the identity for $x^2$. The ratio $\\kappa = L/\\mu$ will predict how many iterations gradient descent needs.",
        "ru": "Сильная выпуклость и гладкость — это неравенство Йенсена с явным квадратичным запасом с каждой стороны. Функция $f$ называется $\\mu$-сильно выпуклой, если хорда лежит над графиком не меньше чем на $\\frac{\\mu}{2}t(1-t)\\|x - y\\|^2$, а выпуклая $f$ называется $L$-гладкой, если хорда лежит над графиком не больше чем на $\\frac{L}{2}t(1-t)\\|x - y\\|^2$: $$\\frac{\\mu}{2}t(1-t)\\|x - y\\|^2 \\le (1-t)f(x) + t f(y) - f\\big((1-t)x + ty\\big) \\le \\frac{L}{2}t(1-t)\\|x - y\\|^2.$$ Для $f(x) = \\tfrac{1}{2} x^\\top Q x$ средняя часть равна $\\tfrac{1}{2} t(1-t)(x - y)^\\top Q (x - y)$ — это матричный вариант тождества для $x^2$. Отношение $\\kappa = L/\\mu$ предскажет, сколько итераций нужно градиентному спуску."
       }
      }
     ]
    },
    "constants": {
     "title": {
      "en": "The two parabolas",
      "ru": "Две параболы"
     },
     "text": {
      "en": "For a differentiable $f$ the two margins take a first-order form. The gap between $f$ and its tangent at $x$ is bounded on both sides, so the graph lies between two parabolas that touch it at $x$:",
      "ru": "Для дифференцируемой $f$ оба запаса можно записать в форме первого порядка. Зазор между $f$ и её касательной в точке $x$ ограничена с двух сторон, поэтому график лежит между двумя параболами, которые касаются его в точке $x$:"
     },
     "sandwich": {
      "en": "$$\\frac{\\mu}{2}\\|y - x\\|^2 \\le f(y) - f(x) - \\nabla f(x)^\\top (y - x) \\le \\frac{L}{2}\\|y - x\\|^2 \\quad \\text{for all } x, y.$$",
      "ru": "$$\\frac{\\mu}{2}\\|y - x\\|^2 \\le f(y) - f(x) - \\nabla f(x)^\\top (y - x) \\le \\frac{L}{2}\\|y - x\\|^2 \\quad \\text{для всех } x, y.$$"
     },
     "items": [
      {
       "en": "The left inequality is $\\mu$-strong convexity: away from any tangent, $f$ grows at least like $\\frac{\\mu}{2}\\|y - x\\|^2$. The right one is $L$-smoothness, the descent lemma of the lecture: $f$ grows at most like $\\frac{L}{2}\\|y - x\\|^2$. It holds when $\\nabla f$ is $L$-Lipschitz.",
       "ru": "Левое неравенство — это $\\mu$-сильная выпуклость: над любой своей касательной $f$ растёт не медленнее, чем $\\frac{\\mu}{2}\\|y - x\\|^2$. Правое — $L$-гладкость, лемма о спуске из лекции: $f$ растёт не быстрее, чем $\\frac{L}{2}\\|y - x\\|^2$. Оно выполнено, если градиент $\\nabla f$ липшицев с константой $L$."
      },
      {
       "en": "For $f(x) = \\tfrac{1}{2} x^\\top Q x$ with a symmetric $Q \\succ 0$ the middle term equals $\\tfrac{1}{2} (y - x)^\\top Q (y - x)$ exactly, so the best constants are $\\mu = \\lambda_{\\min}(Q)$ and $L = \\lambda_{\\max}(Q)$. For a diagonal $Q$ they are its smallest and largest diagonal entries.",
       "ru": "Для $f(x) = \\tfrac{1}{2} x^\\top Q x$ с симметричной $Q \\succ 0$ средняя часть в точности равна $\\tfrac{1}{2} (y - x)^\\top Q (y - x)$, поэтому наилучшие константы — $\\mu = \\lambda_{\\min}(Q)$ и $L = \\lambda_{\\max}(Q)$. Для диагональной $Q$ это её наименьший и наибольший диагональные элементы."
      },
      {
       "en": "The condition number $\\kappa = L/\\mu \\ge 1$ measures how stretched the level sets are. With $\\alpha = 1/L$ the lecture's bound is $f(x_k) - f^* \\le (1 - 1/\\kappa)^k \\big(f(x_0) - f^*\\big)$, so $\\kappa$ predicts the iteration count.",
       "ru": "Число обусловленности $\\kappa = L/\\mu \\ge 1$ показывает, насколько вытянуты линии уровня. При $\\alpha = 1/L$ оценка из лекции имеет вид $f(x_k) - f^* \\le (1 - 1/\\kappa)^k \\big(f(x_0) - f^*\\big)$, так что $\\kappa$ предсказывает число итераций."
      },
      {
       "en": "$1/L$ is the safe step: for $0 < \\alpha \\le 1/L$ the descent lemma gives $f(x_{k+1}) \\le f(x_k) - \\frac{\\alpha}{2}\\|\\nabla f(x_k)\\|^2$.",
       "ru": "$1/L$ — безопасный шаг: при $0 < \\alpha \\le 1/L$ лемма о спуске даёт $f(x_{k+1}) \\le f(x_k) - \\frac{\\alpha}{2}\\|\\nabla f(x_k)\\|^2$."
      },
      {
       "en": "$2/L$ is the boundary: every $0 < \\alpha < 2/L$ still decreases $f$ away from stationary points, and on a quadratic, gradient descent converges from every start exactly when $0 < \\alpha < 2/L$.",
       "ru": "$2/L$ — граница: любой шаг $0 < \\alpha < 2/L$ ещё уменьшает $f$ вне стационарных точек, а на квадратичной функции градиентный спуск сходится из любой начальной точки ровно тогда, когда $0 < \\alpha < 2/L$."
      }
     ]
    }
   },
   "A": {
    "title": {
     "en": "A. Step size and conditioning",
     "ru": "A. Шаг и обусловленность"
    },
    "short": {
     "en": "A. Step size",
     "ru": "A. Шаг"
    }
   },
   "B": {
    "title": {
     "en": "B. Backtracking and stopping",
     "ru": "B. Бэктрекинг и критерии остановки"
    },
    "short": {
     "en": "B. Backtracking",
     "ru": "B. Бэктрекинг"
    }
   },
   "C": {
    "title": {
     "en": "C. Computational graph and the reverse pass",
     "ru": "C. Вычислительный граф и обратный проход"
    },
    "short": {
     "en": "C. Reverse pass",
     "ru": "C. Обратный проход"
    }
   },
   "D": {
    "title": {
     "en": "D. How it breaks",
     "ru": "D. Где всё ломается"
    },
    "short": {
     "en": "D. Failures",
     "ru": "D. Сбои"
    },
    "intro": {
     "en": "Four demonstrations of two minutes each, no student work. Each one breaks a rule from today and shows what the failure looks like.",
     "ru": "Четыре демонстрации по две минуты, студенты только смотрят. Каждая нарушает одно из сегодняшних правил и показывает, как выглядит сбой."
    },
    "demos": [
     {
      "id": "D1",
      "title": {
       "en": "A step exactly at the boundary",
       "ru": "Шаг ровно на границе"
      },
      "text": {
       "en": "A1's problem, $f(x) = \\tfrac{1}{2} x^\\top \\operatorname{diag}{{A1.params.lam}}\\, x$ from $x_0 = {{A1.params.x0}}$, with $\\alpha = 2/L = {{D1.alpha}}$. The factors are $1 - \\alpha\\lambda_1 = {{A1.factors.3.1}}$ and $1 - \\alpha\\lambda_2 = {{A1.factors.3.2}}$. The flat coordinate shrinks; the stiff one flips between ${{D1.coord}}$ and $-{{D1.coord}}$ without end, and on its own it adds $\\tfrac{1}{2} \\lambda_2 \\cdot {{D1.coord}}^2 = {{D1.limit}}$ to $f$. Hence $$f(x_k) = {{D1.limit}} + 2 \\cdot {{D1.ratio}}^k,$$ so $f$ decreases towards {{D1.limit}} and never goes below it. After ten steps $f = {{D1.f10}}$, after fifty the excess over {{D1.limit}} is ${{D1.f50}}$, and in double precision $f$ soon equals {{D1.limit}} exactly.",
       "ru": "Функция из задачи A1, $f(x) = \\tfrac{1}{2} x^\\top \\operatorname{diag}{{A1.params.lam}}\\, x$, начальная точка $x_0 = {{A1.params.x0}}$, шаг $\\alpha = 2/L = {{D1.alpha}}$. Множители равны $1 - \\alpha\\lambda_1 = {{A1.factors.3.1}}$ и $1 - \\alpha\\lambda_2 = {{A1.factors.3.2}}$. Пологая координата затухает, а жёсткая бесконечно перескакивает между ${{D1.coord}}$ и $-{{D1.coord}}$ и сама по себе вносит в $f$ вклад $\\tfrac{1}{2} \\lambda_2 \\cdot {{D1.coord}}^2 = {{D1.limit}}$. Поэтому $$f(x_k) = {{D1.limit}} + 2 \\cdot {{D1.ratio}}^k,$$ то есть $f$ убывает к {{D1.limit}} но ниже этого уровня не опускается. После десяти шагов $f = {{D1.f10}}$, после пятидесяти превышение над {{D1.limit}} равно ${{D1.f50}}$, а в арифметике двойной точности $f$ вскоре становится ровно равной {{D1.limit}}."
      },
      "figure": {
       "src": "fig_stability",
       "alt": {
        "en": "Four curves of the function value against the iteration number on a logarithmic vertical axis: two fall, one levels off at a positive value and one rises.",
        "ru": "Четыре кривые значения функции в зависимости от номера итерации, вертикальная ось логарифмическая: две убывают, одна выходит на постоянное положительное значение, а одна растёт."
       },
       "caption": {
        "en": "$f(x_k)$ on a logarithmic axis for the four steps of A1 on $\\operatorname{diag}{{A1.params.lam}}$. The curve for $\\alpha = 2/L = {{D1.alpha}}$ flattens at {{D1.limit}}; below the boundary the curves fall, above it the curve rises.",
        "ru": "$f(x_k)$ в логарифмическом масштабе для четырёх значений шага из A1 и матрицы $\\operatorname{diag}{{A1.params.lam}}$. Кривая для $\\alpha = 2/L = {{D1.alpha}}$ выходит на уровень {{D1.limit}}; ниже границы кривые убывают, выше неё кривая растёт."
       }
      },
      "takeaway": {
       "en": "$2/L$ is where convergence stops, not a step to use. On a quadratic every $0 < \\alpha < 2/L$ converges; at $2/L$ the stiff coordinate keeps its size, and beyond it that coordinate grows.",
       "ru": "$2/L$ — это граница, на которой сходимость пропадает, а не рабочий шаг. На квадратичной функции любой шаг $0 < \\alpha < 2/L$ даёт сходимость; при $2/L$ жёсткая координата не меняется по модулю, а за границей она растёт."
      }
     },
     {
      "id": "D2",
      "title": {
       "en": "Assignment instead of accumulation",
       "ru": "Присваивание вместо накопления"
      },
      "text": {
       "en": "Take $z = x^2 + x^3$ at $x = {{D2.x}}$ with the nodes $a = x^2$, $b = x^3$, $z = a + b$. The node $x$ feeds both $a$ and $b$. The reverse pass starts from $\\bar z = 1$, gives $\\bar a = \\bar b = 1$, and sends two contributions to $\\bar x$: $\\bar a \\cdot 2x = {{D2.viaSquare}}$ through $a$ and $\\bar b \\cdot 3x^2 = {{D2.viaCube}}$ through $b$. What ends up in $\\bar x$ depends on how each contribution is written: $$\\begin{array}{lll} \\text{update} & \\text{visit order} & \\bar x \\\\ \\hline \\bar x \\mathrel{+}= \\dots & \\text{either} & {{D2.correct}} \\\\ \\bar x = \\dots & b \\text{ then } a & {{D2.viaSquare}} \\\\ \\bar x = \\dots & a \\text{ then } b & {{D2.viaCube}} \\end{array}$$ Only accumulation gives $2x + 3x^2 = {{D2.correct}}$. With assignment the second write erases the first, so the result is wrong in either order and even changes with the order of the sweep.",
       "ru": "Возьмём $z = x^2 + x^3$ в точке $x = {{D2.x}}$ с вершинами $a = x^2$, $b = x^3$, $z = a + b$. От вершины $x$ зависят и $a$, и $b$. Обратный проход стартует с $\\bar z = 1$, даёт $\\bar a = \\bar b = 1$ и отправляет в $\\bar x$ два вклада: $\\bar a \\cdot 2x = {{D2.viaSquare}}$ через $a$ и $\\bar b \\cdot 3x^2 = {{D2.viaCube}}$ через $b$. Что окажется в $\\bar x$, зависит от того, как записан каждый вклад: $$\\begin{array}{lll} \\text{обновление} & \\text{порядок обхода} & \\bar x \\\\ \\hline \\bar x \\mathrel{+}= \\dots & \\text{любой} & {{D2.correct}} \\\\ \\bar x = \\dots & b \\text{, затем } a & {{D2.viaSquare}} \\\\ \\bar x = \\dots & a \\text{, затем } b & {{D2.viaCube}} \\end{array}$$ Только накопление даёт $2x + 3x^2 = {{D2.correct}}$. При присваивании вторая запись стирает первую, поэтому результат неверен при любом порядке и к тому же меняется вместе с порядком обхода."
      },
      "takeaway": {
       "en": "An adjoint is a sum over all paths from the node to the output. Every adjoint starts at $0$ and collects its contributions with $\\bar u \\mathrel{+}= \\bar v\\, \\partial v/\\partial u$, as in the lecture.",
       "ru": "Сопряжённая переменная — это сумма по всем путям от вершины к выходу. Каждая сопряжённая переменная сначала равна $0$ и накапливает вклады по правилу $\\bar u \\mathrel{+}= \\bar v\\, \\partial v/\\partial u$, как в лекции."
      }
     },
     {
      "id": "D3",
      "title": {
       "en": "The finite-difference floor",
       "ru": "Предел точности конечных разностей"
      },
      "text": {
       "en": "Central differences for $\\partial z/\\partial x$ of C1, $z = \\sin(xy) + x^2$ at ${{C1.params.point}}$: $$g_h = \\frac{z(x + h, y) - z(x - h, y)}{2h},$$ compared with the exact value from the reverse pass for $h = {{D3.hFirst}}, \\dots, {{D3.hLast}}$. The relative error falls from ${{D3.first}}$ to its minimum ${{D3.best}}$ at $h = {{D3.hBest}}$ and then rises again, to ${{D3.last}}$ at $h = {{D3.hLast}}$. Two errors compete. Truncation: by Taylor's formula $g_h$ differs from the derivative by $O(h^2)$, which dominates for large $h$. Round-off: each value of $z$ carries a relative error of order $\\varepsilon$, the machine precision, and the difference of two nearly equal numbers divided by $2h$ turns it into an error of order $\\varepsilon/h$, which dominates for small $h$. The two balance at $h \\sim \\varepsilon^{1/3} \\approx {{D3.epsCubeRoot}}$, and the measured minimum sits at the nearest power of ten, ${{D3.hBest}}$.",
       "ru": "Центральную разность для $\\partial z/\\partial x$ из задачи C1, $z = \\sin(xy) + x^2$, в точке ${{C1.params.point}}$ $$g_h = \\frac{z(x + h, y) - z(x - h, y)}{2h}$$ сравниваем с точным значением из обратного прохода при $h = {{D3.hFirst}}, \\dots, {{D3.hLast}}$. Относительная ошибка падает с ${{D3.first}}$ до минимума ${{D3.best}}$ при $h = {{D3.hBest}}$, а затем снова растёт, до ${{D3.last}}$ при $h = {{D3.hLast}}$. Здесь конкурируют две ошибки. Ошибка отбрасывания: по формуле Тейлора $g_h$ отличается от производной на $O(h^2)$, и при больших $h$ преобладает она. Ошибка округления: каждое значение $z$ вычислено с относительной ошибкой порядка $\\varepsilon$ (машинная точность), а разность двух почти равных чисел, делённая на $2h$, превращает её в ошибку порядка $\\varepsilon/h$, которая преобладает при малых $h$. Две ошибки уравновешиваются при $h \\sim \\varepsilon^{1/3} \\approx {{D3.epsCubeRoot}}$, и измеренный минимум приходится на ближайшую степень десяти, ${{D3.hBest}}$."
      },
      "figure": {
       "src": "fig_fd_error",
       "alt": {
        "en": "The relative error of the central difference against the step h on log–log axes: a V-shaped curve with its lowest point in the middle of the range.",
        "ru": "Относительная ошибка центральной разности в зависимости от шага h, обе оси логарифмические: V-образная кривая с минимумом в середине диапазона."
       },
       "caption": {
        "en": "Accuracy of the central difference for $\\partial z/\\partial x$ of C1: its relative error against $h$, both axes logarithmic. The minimum ${{D3.best}}$ is at $h = {{D3.hBest}}$; larger $h$ is limited by truncation, smaller $h$ by round-off.",
        "ru": "Точность центральной разности для $\\partial z/\\partial x$ из C1: её относительная ошибка в зависимости от $h$, обе оси логарифмические. Минимум ${{D3.best}}$ достигается при $h = {{D3.hBest}}$; при больших $h$ точность ограничена ошибкой отбрасывания, при малых $h$ — ошибкой округления."
       }
      },
      "takeaway": {
       "en": "A finite difference is a check, not a way to compute gradients: even at the best $h$ it loses digits, and a smaller $h$ makes it worse. Reverse mode gives the derivative to machine precision with no $h$ to choose.",
       "ru": "Конечная разность — это проверка, а не способ вычислять градиенты: даже при лучшем $h$ она теряет значащие цифры, а при меньшем $h$ становится только хуже. Обратный режим даёт производную с машинной точностью, и никакое $h$ выбирать не нужно."
      }
     },
     {
      "id": "D4",
      "title": {
       "en": "Sampling does not prove convexity",
       "ru": "Проверка на выборке не доказывает выпуклость"
      },
      "text": {
       "en": "Run the random-pair Jensen test of Seminar 2 on $f(x) = x^3$ with {{D4.pairs}} pairs $x, y \\in [0, 2]$ and random $t \\in [0, 1]$: {{D4.violations}} violations. Every pair passes because $x^3$ is convex on $[0, \\infty)$. On $\\mathbb R$ it is not: the single pair $x = {{D4.x}}$, $y = {{D4.y}}$ with $t = {{D4.t}}$ from block 0 gives ${{D4.lhs}} > {{D4.rhs}}$. On the symmetric range $[-2, 2]$, like the boxes Seminar 2 sampled from, the same test fails on about half of the pairs. A sample says nothing about the region it did not visit.",
       "ru": "Запустим проверку неравенства Йенсена из семинара 2 для $f(x) = x^3$ на {{D4.pairs}} случайных парах $x, y \\in [0, 2]$ со случайным $t \\in [0, 1]$: {{D4.violations}} нарушений. Все пары проходят проверку, потому что $x^3$ выпукла на $[0, \\infty)$. На $\\mathbb R$ это не так: одна-единственная пара $x = {{D4.x}}$, $y = {{D4.y}}$ с $t = {{D4.t}}$ из блока 0 даёт ${{D4.lhs}} > {{D4.rhs}}$. На симметричном отрезке $[-2, 2]$, как у брусов, из которых на семинаре 2 брались точки, та же проверка не проходит примерно на половине пар. Выборка ничего не говорит об области, в которую она не попала."
      },
      "takeaway": {
       "en": "One counterexample is a proof; {{D4.pairs}} successes are not. Convexity is proved by an argument that covers the whole domain and disproved by one pair.",
       "ru": "Один контрпример — это доказательство, а {{D4.pairs}} успешных проверок — нет. Выпуклость доказывают рассуждением, которое охватывает всю область определения, а опровергают одной парой."
      }
     }
    ]
   },
   "E": {
    "title": {
     "en": "E. Wrap-up",
     "ru": "E. Итоги"
    },
    "short": {
     "en": "E. Wrap-up",
     "ru": "E. Итоги"
    },
    "exit": {
     "title": {
      "en": "Exit ticket",
      "ru": "Вопросы на выход"
     },
     "text": {
      "en": "Two one-line questions. Write the answers on paper before opening them.",
      "ru": "Два вопроса, на каждый хватит одной строки. Запишите ответы на бумаге и только потом открывайте их."
     },
     "items": [
      {
       "id": "E1",
       "question": {
        "en": "Up to which constant step $\\alpha$ does gradient descent on $f(x) = \\tfrac{1}{2} x^\\top \\operatorname{diag}{{exit.E1.lam}}\\, x$ converge from every starting point, and is the end point included?",
        "ru": "До какого постоянного шага $\\alpha$ градиентный спуск для $f(x) = \\tfrac{1}{2} x^\\top \\operatorname{diag}{{exit.E1.lam}}\\, x$ сходится из любой начальной точки и входит ли сюда само граничное значение?"
       }
      },
      {
       "id": "E2",
       "question": {
        "en": "Compute $\\partial z/\\partial x$ for $z = xy + x$ at $(x, y) = {{exit.E2.point}}$ by the reverse pass.",
        "ru": "Найдите $\\partial z/\\partial x$ для $z = xy + x$ в точке $(x, y) = {{exit.E2.point}}$ обратным проходом."
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
      "en": "Five exercises on tasks 1–5 and 8 of the lecturer's week 3 notebook, in Python with NumPy and Matplotlib. Task 6 was C1 at the board; tasks 7 and 9 are not repeated here. After the class each task shows what a correct result looks like.",
      "ru": "Пять упражнений по задачам 1–5 и 8 из ноутбука лектора к третьей неделе, на Python с NumPy и Matplotlib. Задача 6 — это C1, разобранная у доски; задачи 7 и 9 здесь не повторяются. После занятия в каждом упражнении будет видно, как выглядит правильный результат."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "Fixed-step gradient descent",
        "ru": "Градиентный спуск с постоянным шагом"
       },
       "statement": {
        "en": "Task 1 of the notebook. Implement `gradient_descent(f, grad, x0, step, tol, max_iter)` returning `(x, history)`, where the history keeps $x_k$, $f(x_k)$ and $\\|\\nabla f(x_k)\\|$. Stop when $\\|\\nabla f(x_k)\\| \\le$ `tol`, stop after `max_iter` iterations, and raise an error as soon as $f$ or $\\nabla f$ is not finite. Test it on $f(x) = \\tfrac{1}{2} x^\\top \\operatorname{diag}{{A1.params.lam}}\\, x$ from $x_0 = {{A1.params.x0}}$ with the four steps of A1, $\\alpha = {{A1.params.alphas.1}}$, ${{A1.params.alphas.2}}$, ${{A1.params.alphas.3}}$ and ${{A1.params.alphas.4}}$.",
        "ru": "Задача 1 ноутбука. Напишите функцию `gradient_descent(f, grad, x0, step, tol, max_iter)`, которая возвращает `(x, history)`; в истории хранятся $x_k$, $f(x_k)$ и $\\|\\nabla f(x_k)\\|$. Функция останавливается, когда $\\|\\nabla f(x_k)\\| \\le$ `tol`, или после `max_iter` итераций, а как только $f$ или $\\nabla f$ перестаёт быть конечным, сразу выбрасывает исключение. Проверьте её на $f(x) = \\tfrac{1}{2} x^\\top \\operatorname{diag}{{A1.params.lam}}\\, x$ из $x_0 = {{A1.params.x0}}$ с четырьмя шагами из A1: $\\alpha = {{A1.params.alphas.1}}$, ${{A1.params.alphas.2}}$, ${{A1.params.alphas.3}}$ и ${{A1.params.alphas.4}}$."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "Stability and conditioning in code",
        "ru": "Устойчивость и обусловленность в коде"
       },
       "statement": {
        "en": "Tasks 2 and 3 of the notebook, with your `gradient_descent`. **(a)** On $\\operatorname{diag}{{A1.params.lam}}$ from ${{A1.params.x0}}$, plot $f(x_k)$ on a log scale for the four steps of A1 in one figure; stop any run once $\\|x_k\\|$ exceeds a threshold you state. **(b)** On $\\operatorname{diag}{{A2.params.lam}}$ and $\\operatorname{diag}{{A3.params.lam}}$ from $x_0 = {{A2.params.x0}}$ with $\\alpha = 1/L$, draw the level sets and the iterates in two panels. For each problem report $\\kappa$, the guaranteed factor $q$ of A2 and the first $k$ with $f(x_k) \\le {{A2.params.gap}}\\, f(x_0)$.",
        "ru": "Задачи 2 и 3 ноутбука; используйте свою `gradient_descent`. **а)** Для $\\operatorname{diag}{{A1.params.lam}}$ из ${{A1.params.x0}}$ постройте на одном рисунке $f(x_k)$ в логарифмической шкале для четырёх шагов из A1; прерывайте запуск, как только $\\|x_k\\|$ превысит порог, и укажите этот порог. **б)** Для $\\operatorname{diag}{{A2.params.lam}}$ и $\\operatorname{diag}{{A3.params.lam}}$ из $x_0 = {{A2.params.x0}}$ с $\\alpha = 1/L$ нарисуйте на двух панелях линии уровня и точки итераций. Для каждой задачи укажите $\\kappa$, гарантированный множитель $q$ из A2 и первое $k$, при котором $f(x_k) \\le {{A2.params.gap}}\\, f(x_0)$."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "Armijo backtracking in code",
        "ru": "Бэктрекинг по Армихо в коде"
       },
       "statement": {
        "en": "Task 4 of the notebook. Implement `backtracking(f, x, g, d, alpha0, beta, c, max_shrinks)`: it rejects a direction with $\\nabla f(x)^\\top d \\ge 0$, does not recompute the gradient inside the loop, and gives up after `max_shrinks` reductions. Then write `gd_armijo(f, grad, x0, tol, max_iter)`, which starts every line search from $\\alpha_0 = {{B2.params.alpha0}}$ with $\\beta = {{B2.params.beta}}$ and $c = {{B2.params.c}}$; no warm start is needed. On $\\operatorname{diag}{{B2.params.lam}}$ from $x_0 = {{A3.params.x0}}$, record the accepted steps and compare the number of iterations with the constant step $\\alpha = 1/L$ under the same gradient test.",
        "ru": "Задача 4 ноутбука. Напишите функцию `backtracking(f, x, g, d, alpha0, beta, c, max_shrinks)`: она отвергает направление с $\\nabla f(x)^\\top d \\ge 0$, не пересчитывает градиент внутри цикла и прекращает поиск после `max_shrinks` уменьшений шага. Затем напишите функцию `gd_armijo(f, grad, x0, tol, max_iter)`, в которой каждый линейный поиск начинается с $\\alpha_0 = {{B2.params.alpha0}}$ при $\\beta = {{B2.params.beta}}$ и $c = {{B2.params.c}}$; начинать с последнего принятого шага не нужно. Для $\\operatorname{diag}{{B2.params.lam}}$ из $x_0 = {{A3.params.x0}}$ сохраните принятые шаги и сравните число итераций с постоянным шагом $\\alpha = 1/L$ при том же критерии остановки по градиенту."
       }
      },
      {
       "id": "H4",
       "kind": "code",
       "title": {
        "en": "Stopping rules in code",
        "ru": "Критерии остановки в коде"
       },
       "statement": {
        "en": "Task 5 of the notebook. Use `stopping_report` from the notebook, the three tests of B3 with $\\mathrm{atol} = {{B3.params.atol}}$ and $\\mathrm{rtol} = {{B3.params.rtol}}$. Run gradient descent on $\\operatorname{diag}{{B3.params.lam}}$ from $x_0 = {{B3.params.x0}}$ with $\\alpha = 1/L$ and print the first iteration at which each test fires; repeat with the tiny step $\\alpha = {{B3.params.alpha}}$. Then write one combined, scale-aware stopping rule, say what it is scaled by, and apply it to both runs.",
        "ru": "Задача 5 ноутбука. Используйте `stopping_report` из ноутбука: это три критерия из B3 с $\\mathrm{atol} = {{B3.params.atol}}$ и $\\mathrm{rtol} = {{B3.params.rtol}}$. Запустите градиентный спуск для $\\operatorname{diag}{{B3.params.lam}}$ из $x_0 = {{B3.params.x0}}$ с $\\alpha = 1/L$ и выведите для каждого критерия первую итерацию, на которой он срабатывает; повторите с крошечным шагом $\\alpha = {{B3.params.alpha}}$. Затем напишите один комбинированный критерий остановки, учитывающий масштаб, укажите, на какую величину он нормирован, и примените его к обоим запускам."
       }
      },
      {
       "id": "H5",
       "kind": "code",
       "title": {
        "en": "Gradient checking by central differences",
        "ru": "Проверка градиента центральными разностями"
       },
       "statement": {
        "en": "Task 8 of the notebook, without the `Value` class of task 7: evaluate the formula for $\\partial z/\\partial x$ of $z = \\sin(xy) + x^2$ from C1 in double precision at ${{C1.params.point}}$, not its rounded value. Compare it with the central difference $g_h = \\big(z(x + h, y) - z(x - h, y)\\big)/(2h)$ for ten values of $h$, starting at one tenth and dividing by ten each time, using the relative error $|g - g_h| / \\max(1, |g|, |g_h|)$, and plot the error against $h$ on log–log axes.",
        "ru": "Задача 8 ноутбука, без класса `Value` из задачи 7. Вычислите в двойной точности по формуле из C1 производную $\\partial z/\\partial x$ функции $z = \\sin(xy) + x^2$ в точке ${{C1.params.point}}$; округлённое значение не годится. Сравните её с центральной разностью $g_h = \\big(z(x + h, y) - z(x - h, y)\\big)/(2h)$ для десяти значений $h$: начните с одной десятой и каждый раз делите на десять. Ошибку считайте относительной, $|g - g_h| / \\max(1, |g|, |g_h|)$, и постройте её график в зависимости от $h$ в логарифмическом масштабе по обеим осям."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
