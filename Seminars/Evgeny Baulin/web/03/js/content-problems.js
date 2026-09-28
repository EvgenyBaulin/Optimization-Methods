// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 03 content: the statements of the nine problems and their answer fields, and the full solutions of the
// board problems A1, B1 and C1, in English and Russian. Hints, solutions and answers of the other six are in
// locked.enc.js until the end of the class.
// Strict JSON between the markers. Placeholders in {braces} are filled by the page.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Four steps on one quadratic",
    "ru": "Четыре шага на одной квадратичной функции"
   },
   "statement": {
    "en": "Minimize $f(x) = \\tfrac{1}{2} x^\\top Q x$ with $Q = \\operatorname{diag}{{A1.params.lam}}$ by gradient descent with a constant step $\\alpha$ from $x_0 = {{A1.params.x0}}$. **(a)** Find the stability boundary: the value $\\alpha_{\\max}$ such that the method converges from every start if and only if $0 < \\alpha < \\alpha_{\\max}$. **(b)** Classify the steps $\\alpha = {{A1.params.alphas.1}}$, ${{A1.params.alphas.2}}$, ${{A1.params.alphas.3}}$ and ${{A1.params.alphas.4}}$ through the per-coordinate recurrence $z_{k+1,i} = (1 - \\alpha\\lambda_i)\\,z_{k,i}$: does the method converge, and how?",
    "ru": "Минимизируйте $f(x) = \\tfrac{1}{2} x^\\top Q x$, где $Q = \\operatorname{diag}{{A1.params.lam}}$, градиентным спуском с постоянным шагом $\\alpha$ из $x_0 = {{A1.params.x0}}$. **а)** Найдите границу устойчивости: такое значение $\\alpha_{\\max}$, что метод сходится из любой начальной точки тогда и только тогда, когда $0 < \\alpha < \\alpha_{\\max}$. **б)** Классифицируйте шаги $\\alpha = {{A1.params.alphas.1}}$, ${{A1.params.alphas.2}}$, ${{A1.params.alphas.3}}$ и ${{A1.params.alphas.4}}$ с помощью покоординатного рекуррентного соотношения $z_{k+1,i} = (1 - \\alpha\\lambda_i)\\,z_{k,i}$: сходится ли метод и как именно?"
   },
   "answers": [
    {
     "id": "boundary",
     "ref": "answers.A1.boundary",
     "label": {
      "en": "Stability boundary $\\alpha_{\\max}$",
      "ru": "Граница устойчивости $\\alpha_{\\max}$"
     }
    }
   ],
   "hints": [
    {
     "en": "$Q$ is diagonal: write the gradient step for each coordinate separately.",
     "ru": "$Q$ диагональна: запишите шаг градиентного спуска для каждой координаты отдельно."
    },
    {
     "en": "Convergence needs $|1 - \\alpha\\lambda_i| < 1$ for both eigenvalues; the larger one gives the tighter limit.",
     "ru": "Для сходимости нужно $|1 - \\alpha\\lambda_i| < 1$ для обоих собственных значений; большее из них даёт более сильное ограничение."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Here $x^* = 0$, $f^* = 0$, and $Q$ is already diagonal, so the eigen-coordinates are the coordinates: $z_k = x_k$, $\\mu = \\lambda_1 = {{A1.mu}}$, $L = \\lambda_2 = {{A1.L}}$, $\\kappa = {{A1.kappa}}$. The step $x_{k+1} = x_k - \\alpha Q x_k$ splits into $z_{k+1,i} = (1 - \\alpha\\lambda_i)\\,z_{k,i}$, and $f(x_k) = \\tfrac{1}{2}\\big(\\lambda_1 z_{k,1}^2 + \\lambda_2 z_{k,2}^2\\big)$, so $f(x_0) = {{A1.f0}}$.",
      "ru": "Здесь $x^* = 0$, $f^* = 0$, а $Q$ уже диагональна, так что собственные координаты совпадают с обычными: $z_k = x_k$, $\\mu = \\lambda_1 = {{A1.mu}}$, $L = \\lambda_2 = {{A1.L}}$, $\\kappa = {{A1.kappa}}$. Шаг $x_{k+1} = x_k - \\alpha Q x_k$ распадается на $z_{k+1,i} = (1 - \\alpha\\lambda_i)\\,z_{k,i}$, и $f(x_k) = \\tfrac{1}{2}\\big(\\lambda_1 z_{k,1}^2 + \\lambda_2 z_{k,2}^2\\big)$, поэтому $f(x_0) = {{A1.f0}}$."
     }
    },
    {
     "predict": {
      "en": "Which of the two coordinates limits the step?",
      "ru": "Какая из двух координат ограничивает шаг?"
     },
     "text": {
      "en": "Convergence from every start needs $|1 - \\alpha\\lambda_i| < 1$ for both $i$, that is $0 < \\alpha < 2/\\lambda_i$. The flat coordinate allows $\\alpha < 2/\\mu = 2$, the stiff one only $\\alpha < 2/L = {{A1.twoL}}$. The stiff direction sets the boundary: $0 < \\alpha < {{A1.twoL}}$.",
      "ru": "Для сходимости из любой начальной точки нужно $|1 - \\alpha\\lambda_i| < 1$ при обоих $i$, то есть $0 < \\alpha < 2/\\lambda_i$. Пологая координата допускает $\\alpha < 2/\\mu = 2$, жёсткая — только $\\alpha < 2/L = {{A1.twoL}}$. Границу задаёт жёсткое направление: $0 < \\alpha < {{A1.twoL}}$."
     }
    },
    {
     "text": {
      "en": "The factors of the four steps: $$\\begin{array}{c|cc} \\alpha & 1 - \\alpha\\lambda_1 & 1 - \\alpha\\lambda_2 \\\\ \\hline {{A1.params.alphas.1}} & {{A1.factors.1.1}} & {{A1.factors.1.2}} \\\\ {{A1.params.alphas.2}} & {{A1.factors.2.1}} & {{A1.factors.2.2}} \\\\ {{A1.params.alphas.3}} & {{A1.factors.3.1}} & {{A1.factors.3.2}} \\\\ {{A1.params.alphas.4}} & {{A1.factors.4.1}} & {{A1.factors.4.2}} \\end{array}$$",
      "ru": "Множители для четырёх шагов: $$\\begin{array}{c|cc} \\alpha & 1 - \\alpha\\lambda_1 & 1 - \\alpha\\lambda_2 \\\\ \\hline {{A1.params.alphas.1}} & {{A1.factors.1.1}} & {{A1.factors.1.2}} \\\\ {{A1.params.alphas.2}} & {{A1.factors.2.1}} & {{A1.factors.2.2}} \\\\ {{A1.params.alphas.3}} & {{A1.factors.3.1}} & {{A1.factors.3.2}} \\\\ {{A1.params.alphas.4}} & {{A1.factors.4.1}} & {{A1.factors.4.2}} \\end{array}$$"
     }
    },
    {
     "text": {
      "en": "$\\alpha = {{A1.params.alphas.1}}$: both factors lie in $(0, 1)$, so both coordinates shrink without changing sign. The stiff one halves at every step, the flat one loses only a twentieth. After ten steps $f = {{A1.f10.1}}$, and almost all of it sits in the flat coordinate. Converges, slowly.",
      "ru": "$\\alpha = {{A1.params.alphas.1}}$: оба множителя лежат в $(0, 1)$, поэтому обе координаты убывают, не меняя знака. Жёсткая уменьшается вдвое на каждом шаге, пологая теряет лишь двадцатую часть. После десяти шагов $f = {{A1.f10.1}}$, и почти всё это значение приходится на пологую координату. Сходится, но медленно."
     }
    },
    {
     "text": {
      "en": "$\\alpha = {{A1.params.alphas.2}}$: the stiff factor ${{A1.factors.2.2}}$ is negative, so $z_{k,2}$ changes sign at every step, but its magnitude still shrinks. Converges with sign flips. Early on the stiff coordinate dominates: it holds ${{A1.stall}}$ of $f(x_0) = {{A1.f0}}$ and shrinks by $|{{A1.factors.2.2}}|$ here against ${{A1.factors.1.2}}$ at $\\alpha = {{A1.params.alphas.1}}$, so this step is behind after ten iterations, $f = {{A1.f10.2}}$ against ${{A1.f10.1}}$. In the long run the pace is set by the larger factor in magnitude, $|{{A1.factors.2.2}}|$ here against ${{A1.factors.1.1}}$, so it is far ahead after fifty, $f = {{A1.f50.2}}$ against ${{A1.f50.1}}$.",
      "ru": "$\\alpha = {{A1.params.alphas.2}}$: множитель жёсткой координаты ${{A1.factors.2.2}}$ отрицателен, поэтому $z_{k,2}$ меняет знак на каждом шаге, но по модулю всё равно убывает. Сходится со сменой знака. Вначале преобладает жёсткая координата: на неё приходится ${{A1.stall}}$ из $f(x_0) = {{A1.f0}}$, и здесь она по модулю умножается на $|{{A1.factors.2.2}}|$, а при $\\alpha = {{A1.params.alphas.1}}$ — на ${{A1.factors.1.2}}$, поэтому после десяти итераций этот шаг отстаёт: $f = {{A1.f10.2}}$ против ${{A1.f10.1}}$. Но на длинной дистанции темп задаёт больший по модулю множитель, здесь $|{{A1.factors.2.2}}|$ против ${{A1.factors.1.1}}$, и после пятидесяти итераций этот шаг далеко впереди: $f = {{A1.f50.2}}$ против ${{A1.f50.1}}$."
     }
    },
    {
     "predict": {
      "en": "At $\\alpha = {{A1.params.alphas.3}}$, does $f(x_k)$ tend to zero, stay at $f(x_0)$, or neither?",
      "ru": "При $\\alpha = {{A1.params.alphas.3}}$ значение $f(x_k)$ стремится к нулю, остаётся равным $f(x_0)$ или ни то ни другое?"
     },
     "text": {
      "en": "$\\alpha = {{A1.params.alphas.3}} = 2/L$: the stiff factor is exactly ${{A1.factors.3.2}}$. The stiff coordinate flips between $+{{A1.stallCoord}}$ and $-{{A1.stallCoord}}$ forever and alone contributes $\\tfrac{1}{2} \\cdot {{A1.L}} \\cdot {{A1.stallCoord}}^2 = {{A1.stall}}$ to $f$ at every step. The flat coordinate still shrinks by ${{A1.factors.3.1}}$, so $f(x_k) = {{A1.stall}} + 2 \\cdot {{A1.stallRatio}}^k$: it decreases towards ${{A1.stall}}$ and never goes below it (${{A1.f10.3}}$ after ten steps). Neither convergence to $x^*$ nor divergence.",
      "ru": "$\\alpha = {{A1.params.alphas.3}} = 2/L$: множитель жёсткой координаты равен ровно ${{A1.factors.3.2}}$. Жёсткая координата без конца перескакивает между $+{{A1.stallCoord}}$ и $-{{A1.stallCoord}}$ и сама по себе на каждом шаге даёт в $f$ вклад $\\tfrac{1}{2} \\cdot {{A1.L}} \\cdot {{A1.stallCoord}}^2 = {{A1.stall}}$. Пологая координата по-прежнему умножается на ${{A1.factors.3.1}}$, поэтому $f(x_k) = {{A1.stall}} + 2 \\cdot {{A1.stallRatio}}^k$: значение убывает к ${{A1.stall}}$ и никогда не опускается ниже (${{A1.f10.3}}$ после десяти шагов). Ни сходимости к $x^*$, ни расходимости."
     }
    },
    {
     "text": {
      "en": "$\\alpha = {{A1.params.alphas.4}}$: $|{{A1.factors.4.2}}| > 1$, so $|z_{k,2}|$ grows at every step while its sign alternates, and $f(x_k) \\to \\infty$: ${{A1.f10.4}}$ after ten steps, ${{A1.f50.4}}$ after fifty. The flat coordinate converges, which does not help. Diverges.",
      "ru": "$\\alpha = {{A1.params.alphas.4}}$: $|{{A1.factors.4.2}}| > 1$, поэтому $|z_{k,2}|$ растёт на каждом шаге, а знак чередуется, и $f(x_k) \\to \\infty$: ${{A1.f10.4}}$ после десяти шагов, ${{A1.f50.4}}$ после пятидесяти. Пологая координата сходится, но это не помогает. Расходится."
     }
    },
    {
     "text": {
      "en": "The boundary comes from the largest eigenvalue, the speed from the smallest: for every $\\alpha < 2/L$ the flat factor is $1 - \\alpha\\mu > 1 - 2/\\kappa$. A large $\\kappa$ forces a step that barely moves the flat coordinate.",
      "ru": "Границу задаёт наибольшее собственное значение, а скорость — наименьшее: при любом $\\alpha < 2/L$ множитель пологой координаты $1 - \\alpha\\mu > 1 - 2/\\kappa$. При большом $\\kappa$ приходится брать шаг, который почти не сдвигает пологую координату."
     }
    }
   ],
   "answerText": {
    "en": "Stable for $0 < \\alpha < 2/L = {{A1.twoL}}$. $\\alpha = {{A1.params.alphas.1}}$: converges, slowly in the flat coordinate; ${{A1.params.alphas.2}}$: converges with sign flips in the stiff coordinate; ${{A1.params.alphas.3}}$: the stiff coordinate flips between $\\pm{{A1.stallCoord}}$ forever and $f(x_k)$ decreases towards ${{A1.stall}}$, never below; ${{A1.params.alphas.4}}$: diverges.",
    "ru": "Метод устойчив при $0 < \\alpha < 2/L = {{A1.twoL}}$. $\\alpha = {{A1.params.alphas.1}}$: сходится, медленно по пологой координате; ${{A1.params.alphas.2}}$: сходится со сменой знака жёсткой координаты; ${{A1.params.alphas.3}}$: жёсткая координата без конца перескакивает между $\\pm{{A1.stallCoord}}$, а $f(x_k)$ убывает к ${{A1.stall}}$, не опускаясь ниже; ${{A1.params.alphas.4}}$: расходится."
   },
   "review": {
    "en": "The step is capped by the stiffest direction, $2/L$, not $2/\\mu$. Below the cap a negative factor means oscillation, not divergence.",
    "ru": "Шаг ограничен самым жёстким направлением: $2/L$, а не $2/\\mu$. Ниже этой границы отрицательный множитель означает колебания, а не расходимость."
   },
   "mistakes": [
    {
     "en": "Taking the boundary from the flat direction, $2/\\mu = 2$: the stiff direction with $\\lambda = L$ breaks first.",
     "ru": "Брать границу по пологому направлению, $2/\\mu = 2$: первым теряет сходимость жёсткое направление с $\\lambda = L$."
    },
    {
     "en": "Calling $\\alpha = {{A1.params.alphas.2}}$ divergent because a factor is negative: only $|1 - \\alpha\\lambda_i| \\ge 1$ breaks convergence.",
     "ru": "Считать, что при $\\alpha = {{A1.params.alphas.2}}$ метод расходится, раз один из множителей отрицателен: сходимость нарушается только при $|1 - \\alpha\\lambda_i| \\ge 1$."
    },
    {
     "en": "Saying that at $\\alpha = 2/L$ the value is stuck at ${{A1.stall}}$ from the start: $f(x_k) = {{A1.stall}} + 2 \\cdot {{A1.stallRatio}}^k$ keeps decreasing towards ${{A1.stall}}$.",
     "ru": "Утверждать, что при $\\alpha = 2/L$ значение с самого начала застревает на ${{A1.stall}}$: $f(x_k) = {{A1.stall}} + 2 \\cdot {{A1.stallRatio}}^k$ продолжает убывать к ${{A1.stall}}$."
    }
   ],
   "figure": {
    "src": "fig_stability",
    "alt": {
     "en": "Four curves of f(x_k) against k on a log scale: two fall, one levels off at {{A1.stall}}, one rises.",
     "ru": "Четыре кривые f(x_k) в зависимости от k в логарифмическом масштабе: две убывают, одна выходит на уровень {{A1.stall}}, одна растёт."
    },
    "caption": {
     "en": "Gradient descent on $Q = \\operatorname{diag}{{A1.params.lam}}$ from $x_0 = {{A1.params.x0}}$: $f(x_k)$ on a logarithmic scale for the four steps. At $\\alpha = 2/L$ the curve levels off at ${{A1.stall}}$.",
     "ru": "Градиентный спуск для $Q = \\operatorname{diag}{{A1.params.lam}}$ из $x_0 = {{A1.params.x0}}$: $f(x_k)$ в логарифмическом масштабе для четырёх шагов. При $\\alpha = 2/L$ кривая выходит на уровень ${{A1.stall}}$."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "Guaranteed and observed iterations",
    "ru": "Гарантированное и фактическое число итераций"
   },
   "statement": {
    "en": "Run gradient descent on $f(x) = \\tfrac{1}{2} x^\\top Q x$ with $Q = \\operatorname{diag}{{A2.params.lam}}$, step $\\alpha = 1/L$, from $x_0 = {{A2.params.x0}}$. Report **(a)** $\\kappa$; **(b)** the factor $q$ in the lecture's guarantee $f(x_k) - f^* \\le q^k\\,\\big(f(x_0) - f^*\\big)$; **(c)** the smallest $k$ for which this bound gives $f(x_k) - f^* \\le {{A2.params.gap}}\\,\\big(f(x_0) - f^*\\big)$; **(d)** the smallest $k$ for which the iterates actually satisfy it.",
    "ru": "Запустите градиентный спуск для $f(x) = \\tfrac{1}{2} x^\\top Q x$, где $Q = \\operatorname{diag}{{A2.params.lam}}$, с шагом $\\alpha = 1/L$ из $x_0 = {{A2.params.x0}}$. Найдите **а)** $\\kappa$; **б)** множитель $q$ в оценке из лекции $f(x_k) - f^* \\le q^k\\,\\big(f(x_0) - f^*\\big)$; **в)** наименьшее $k$, при котором эта оценка даёт $f(x_k) - f^* \\le {{A2.params.gap}}\\,\\big(f(x_0) - f^*\\big)$; **г)** наименьшее $k$, при котором итерации на самом деле удовлетворяют этому неравенству."
   },
   "answers": [
    {
     "id": "kappa",
     "ref": "answers.A2.kappa",
     "label": {
      "en": "$\\kappa$",
      "ru": "$\\kappa$"
     }
    },
    {
     "id": "factor",
     "ref": "answers.A2.factor",
     "label": {
      "en": "Guaranteed factor $q$",
      "ru": "Гарантированный множитель $q$"
     }
    },
    {
     "id": "bound",
     "ref": "answers.A2.bound",
     "label": {
      "en": "Iterations the bound allows",
      "ru": "Число итераций по оценке"
     }
    },
    {
     "id": "observed",
     "ref": "answers.A2.observed",
     "label": {
      "en": "Iterations actually needed",
      "ru": "Фактическое число итераций"
     }
    }
   ]
  },
  "A3": {
   "who": "students",
   "title": {
    "en": "An ill-conditioned bowl and the optimal step",
    "ru": "Плохо обусловленная чаша и оптимальный шаг"
   },
   "statement": {
    "en": "Same setup as A2 with $Q = \\operatorname{diag}{{A3.params.lam}}$ and $x_0 = {{A3.params.x0}}$. **(a)–(d)** Report the same four quantities at $\\alpha = 1/L$. **(e)** Give the optimal constant step $\\alpha^* = 2/(L + \\mu)$ as a number. **(f)** With $\\alpha^*$ every coordinate of the error $x_k - x^*$ is multiplied at each step by a factor of magnitude at most $\\rho = (\\kappa - 1)/(\\kappa + 1)$. How many iterations does the resulting bound on the gap $f(x_k) - f^*$ need for the same reduction by ${{A3.params.gap}}$?",
    "ru": "Та же постановка, что в A2, но $Q = \\operatorname{diag}{{A3.params.lam}}$ и $x_0 = {{A3.params.x0}}$. **а)–г)** Найдите те же четыре величины при $\\alpha = 1/L$. **д)** Найдите значение оптимального постоянного шага $\\alpha^* = 2/(L + \\mu)$. **е)** При шаге $\\alpha^*$ каждая координата ошибки $x_k - x^*$ на каждом шаге умножается на множитель, модуль которого не больше $\\rho = (\\kappa - 1)/(\\kappa + 1)$. Сколько итераций нужно по получающейся отсюда оценке разности $f(x_k) - f^*$ для того же уменьшения — до доли ${{A3.params.gap}}$ от начального значения?"
   },
   "answers": [
    {
     "id": "kappa",
     "ref": "answers.A3.kappa",
     "label": {
      "en": "$\\kappa$",
      "ru": "$\\kappa$"
     }
    },
    {
     "id": "factor",
     "ref": "answers.A3.factor",
     "label": {
      "en": "Guaranteed factor $q$",
      "ru": "Гарантированный множитель $q$"
     }
    },
    {
     "id": "bound",
     "ref": "answers.A3.bound",
     "label": {
      "en": "Iterations the bound allows",
      "ru": "Число итераций по оценке"
     }
    },
    {
     "id": "observed",
     "ref": "answers.A3.observed",
     "label": {
      "en": "Iterations actually needed",
      "ru": "Фактическое число итераций"
     }
    },
    {
     "id": "optStep",
     "ref": "answers.A3.optStep",
     "label": {
      "en": "Optimal step $\\alpha^*$",
      "ru": "Оптимальный шаг $\\alpha^*$"
     }
    },
    {
     "id": "optBound",
     "ref": "answers.A3.optBound",
     "label": {
      "en": "Iterations the bound allows at $\\alpha^*$",
      "ru": "Число итераций по оценке при $\\alpha^*$"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "Armijo backtracking by hand",
    "ru": "Бэктрекинг по Армихо вручную"
   },
   "statement": {
    "en": "Let $f(x) = \\tfrac{1}{2} x^\\top Qx$ with $Q = \\operatorname{diag}({{B1.params.lam.1}}, {{B1.params.lam.2}})$ and $x_0 = {{B1.params.x0}}$. Run Armijo backtracking along $d = -\\nabla f(x_0)$ with $\\alpha_0 = {{B1.params.alpha0}}$, $\\beta = {{B1.params.beta}}$ and $c = {{B1.params.c}}$: try $\\alpha = \\alpha_0$ first and set $\\alpha \\leftarrow \\beta\\alpha$ while $f(x_0 + \\alpha d) > f(x_0) + c\\alpha\\nabla f(x_0)^\\top d$. How many halvings happen before the test passes, which step is accepted, and how does it compare with $1/L$ and $2/L$?",
    "ru": "Пусть $f(x) = \\tfrac{1}{2} x^\\top Qx$, где $Q = \\operatorname{diag}({{B1.params.lam.1}}, {{B1.params.lam.2}})$, и $x_0 = {{B1.params.x0}}$. Выполните бэктрекинг по Армихо вдоль $d = -\\nabla f(x_0)$ с $\\alpha_0 = {{B1.params.alpha0}}$, $\\beta = {{B1.params.beta}}$ и $c = {{B1.params.c}}$: сначала попробуйте $\\alpha = \\alpha_0$ и заменяйте $\\alpha \\leftarrow \\beta\\alpha$, пока $f(x_0 + \\alpha d) > f(x_0) + c\\alpha\\nabla f(x_0)^\\top d$. Сколько раз шаг делится пополам, прежде чем условие выполнится, какой шаг принимается и как он соотносится с $1/L$ и $2/L$?"
   },
   "answers": [
    {
     "id": "halvings",
     "ref": "answers.B1.halvings",
     "label": {
      "en": "Number of halvings",
      "ru": "Число делений шага пополам"
     }
    },
    {
     "id": "alpha",
     "ref": "answers.B1.alpha",
     "label": {
      "en": "Accepted step $\\alpha$",
      "ru": "Принятый шаг $\\alpha$"
     }
    }
   ],
   "hints": [
    {
     "en": "Compute $f(x_0)$ and $\\nabla f(x_0) = Qx_0$ first; the right side of the test is linear in $\\alpha$.",
     "ru": "Сначала найдите $f(x_0)$ и $\\nabla f(x_0) = Qx_0$; правая часть условия линейна по $\\alpha$."
    },
    {
     "en": "Each coordinate of $x_0 + \\alpha d$ is $x_{0,i}(1 - \\alpha\\lambda_i)$, so $f(x_0 + \\alpha d) = \\tfrac{1}{2}\\sum_i \\lambda_i x_{0,i}^2(1 - \\alpha\\lambda_i)^2$; test $\\alpha = \\alpha_0, \\beta\\alpha_0, \\beta^2\\alpha_0, \\dots$ in turn.",
     "ru": "Каждая координата точки $x_0 + \\alpha d$ равна $x_{0,i}(1 - \\alpha\\lambda_i)$, поэтому $f(x_0 + \\alpha d) = \\tfrac{1}{2}\\sum_i \\lambda_i x_{0,i}^2(1 - \\alpha\\lambda_i)^2$. Проверяйте по очереди $\\alpha = \\alpha_0, \\beta\\alpha_0, \\beta^2\\alpha_0, \\dots$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Data at $x_0$: $f(x_0) = {{B1.f0}}$, $\\nabla f(x_0) = Qx_0 = {{B1.g}}$ and $\\nabla f(x_0)^\\top d = -\\|\\nabla f(x_0)\\|^2 = {{B1.gd}}$. Here $L = {{B1.L}}$, $1/L = {{B1.invL}}$ and $2/L = {{B1.twoL}}$.",
      "ru": "Данные в точке $x_0$: $f(x_0) = {{B1.f0}}$, $\\nabla f(x_0) = Qx_0 = {{B1.g}}$ и $\\nabla f(x_0)^\\top d = -\\|\\nabla f(x_0)\\|^2 = {{B1.gd}}$. Здесь $L = {{B1.L}}$, $1/L = {{B1.invL}}$ и $2/L = {{B1.twoL}}$."
     }
    },
    {
     "text": {
      "en": "Along the ray each coordinate gets its own factor: $x_0 + \\alpha d = \\big({{B1.params.x0.1}}(1 - \\alpha),\\ {{B1.params.x0.2}}(1 - {{B1.L}}\\alpha)\\big)$. The test reads $f(x_0 + \\alpha d) \\le {{B1.f0}} - {{B1.params.c}}\\cdot{{B1.gnorm2}}\\,\\alpha$.",
      "ru": "Вдоль луча у каждой координаты свой множитель: $x_0 + \\alpha d = \\big({{B1.params.x0.1}}(1 - \\alpha),\\ {{B1.params.x0.2}}(1 - {{B1.L}}\\alpha)\\big)$. Условие принимает вид $f(x_0 + \\alpha d) \\le {{B1.f0}} - {{B1.params.c}}\\cdot{{B1.gnorm2}}\\,\\alpha$."
     }
    },
    {
     "text": {
      "en": "Trials, halving from $\\alpha_0$: $$\\begin{array}{r|r|r|c} \\alpha & f(x_0 + \\alpha d) & f(x_0) + c\\alpha\\nabla f(x_0)^\\top d & \\text{passes} \\\\ \\hline {{B1.trials.1.alpha}} & {{B1.trials.1.f}} & {{B1.trials.1.rhs}} & \\text{no} \\\\ {{B1.trials.2.alpha}} & {{B1.trials.2.f}} & {{B1.trials.2.rhs}} & \\text{no} \\\\ {{B1.trials.3.alpha}} & {{B1.trials.3.f}} & {{B1.trials.3.rhs}} & \\text{no} \\\\ {{B1.trials.4.alpha}} & {{B1.trials.4.f}} & {{B1.trials.4.rhs}} & \\text{yes} \\end{array}$$",
      "ru": "Попытки с делением шага пополам, начиная с $\\alpha_0$: $$\\begin{array}{r|r|r|c} \\alpha & f(x_0 + \\alpha d) & f(x_0) + c\\alpha\\nabla f(x_0)^\\top d & \\text{выполнено} \\\\ \\hline {{B1.trials.1.alpha}} & {{B1.trials.1.f}} & {{B1.trials.1.rhs}} & \\text{нет} \\\\ {{B1.trials.2.alpha}} & {{B1.trials.2.f}} & {{B1.trials.2.rhs}} & \\text{нет} \\\\ {{B1.trials.3.alpha}} & {{B1.trials.3.f}} & {{B1.trials.3.rhs}} & \\text{нет} \\\\ {{B1.trials.4.alpha}} & {{B1.trials.4.f}} & {{B1.trials.4.rhs}} & \\text{да} \\end{array}$$"
     },
     "predict": {
      "en": "The first trial $\\alpha_0 = {{B1.params.alpha0}}$ is far above $2/L = {{B1.twoL}}$. How many halvings do you expect?",
      "ru": "Первая попытка $\\alpha_0 = {{B1.params.alpha0}}$ намного больше $2/L = {{B1.twoL}}$. Сколько делений пополам понадобится?"
     }
    },
    {
     "text": {
      "en": "The first trial that passes is $\\alpha = {{B1.alpha}}$, after ${{B1.halvings}}$ halvings, and the loop stops there. It lies between $1/L = {{B1.invL}}$ and $2/L = {{B1.twoL}}$, inside the stable range of block A.",
      "ru": "Первая попытка, прошедшая проверку, — $\\alpha = {{B1.alpha}}$ после ${{B1.halvings}}$ делений пополам, и на ней цикл останавливается. Этот шаг лежит между $1/L = {{B1.invL}}$ и $2/L = {{B1.twoL}}$, то есть внутри области устойчивости из блока A."
     }
    },
    {
     "text": {
      "en": "Why the loop must stop: the descent lemma gives $f(x_0 + \\alpha d) \\le f(x_0) - \\alpha(1 - L\\alpha/2)\\|\\nabla f(x_0)\\|^2$, so the test holds for every $\\alpha \\le 2(1-c)/L = {{B1.guarantee}}$. Every rejected trial is above this value, so the accepted one is at least $\\beta$ times it.",
      "ru": "Почему цикл обязательно остановится: лемма о спуске даёт $f(x_0 + \\alpha d) \\le f(x_0) - \\alpha(1 - L\\alpha/2)\\|\\nabla f(x_0)\\|^2$, поэтому условие выполнено при всех $\\alpha \\le 2(1-c)/L = {{B1.guarantee}}$. Каждая отвергнутая попытка больше этой границы, так что принятый шаг не меньше этой границы, умноженной на $\\beta$."
     },
     "predict": {
      "en": "Could the loop run forever for some other $x_0$?",
      "ru": "Может ли при каком-нибудь другом $x_0$ цикл никогда не остановиться?"
     }
    },
    {
     "text": {
      "en": "On a quadratic the test can be solved exactly. With $g = \\nabla f(x_0)$, $f(x_0 - \\alpha g) = f(x_0) - \\alpha\\|g\\|^2 + \\tfrac{1}{2}\\alpha^2 g^\\top Qg$, so the test holds for $\\alpha \\le 2(1-c)\\|g\\|^2/(g^\\top Qg) = {{B1.armijoMax}}$, a little above ${{B1.guarantee}}$ because the curvature along $g$ is below $L$. The minimizer along the ray is $\\|g\\|^2/(g^\\top Qg) = {{B1.exact}}$; Armijo does not look for it.",
      "ru": "Для квадратичной функции неравенство Армихо решается точно. Обозначим $g = \\nabla f(x_0)$; тогда $f(x_0 - \\alpha g) = f(x_0) - \\alpha\\|g\\|^2 + \\tfrac{1}{2}\\alpha^2 g^\\top Qg$, и условие выполнено при $\\alpha \\le 2(1-c)\\|g\\|^2/(g^\\top Qg) = {{B1.armijoMax}}$. Это чуть больше ${{B1.guarantee}}$, потому что кривизна вдоль $g$ меньше $L$. Минимум вдоль луча достигается при шаге $\\|g\\|^2/(g^\\top Qg) = {{B1.exact}}$, но бэктрекинг по Армихо его не ищет."
     }
    }
   ],
   "answerText": {
    "en": "${{B1.halvings}}$ halvings, accepted $\\alpha = {{B1.alpha}}$, between $1/L = {{B1.invL}}$ and $2/L = {{B1.twoL}}$; every $\\alpha \\le 2(1-c)/L = {{B1.guarantee}}$ passes.",
    "ru": "Число делений пополам: ${{B1.halvings}}$; принятый шаг $\\alpha = {{B1.alpha}}$ лежит между $1/L = {{B1.invL}}$ и $2/L = {{B1.twoL}}$; условие выполнено при всех $\\alpha \\le 2(1-c)/L = {{B1.guarantee}}$."
   },
   "review": {
    "en": "Backtracking never used $L$, yet it stopped between $1/L$ and $2/L$. The termination proof explains the lower end: with $\\alpha_0 > 2(1-c)/L$ the accepted step is at least $\\beta\\cdot 2(1-c)/L$, which for $\\beta = \\tfrac{1}{2}$ is $(1-c)/L$, just below $1/L$.",
    "ru": "Бэктрекинг ни разу не использовал $L$, и всё же остановился между $1/L$ и $2/L$. Нижнюю границу объясняет доказательство конечности: при $\\alpha_0 > 2(1-c)/L$ принятый шаг не меньше $\\beta\\cdot 2(1-c)/L$, а при $\\beta = \\tfrac{1}{2}$ это $(1-c)/L$, чуть меньше $1/L$."
   },
   "mistakes": [
    {
     "en": "Counting the trials instead of the halvings: $\\alpha_0$ is the first trial and not a halving, so the answer is ${{B1.halvings}}$, one less than the number of rows in the table.",
     "ru": "Считать попытки вместо делений пополам: $\\alpha_0$ — первая попытка, а не деление, поэтому ответ равен ${{B1.halvings}}$, на единицу меньше числа строк в таблице."
    },
    {
     "en": "Expecting the accepted step to minimize $f$ along $d$: the minimizer is ${{B1.exact}}$, while Armijo stops at the first trial with enough decrease, ${{B1.alpha}}$.",
     "ru": "Ожидать, что принятый шаг минимизирует $f$ вдоль $d$: минимум достигается при шаге ${{B1.exact}}$, а бэктрекинг по Армихо останавливается на первой попытке с достаточным убыванием, то есть на ${{B1.alpha}}$."
    }
   ]
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Backtracking on a stiffer quadratic",
    "ru": "Бэктрекинг на более жёсткой квадратичной функции"
   },
   "statement": {
    "en": "Let $f(x) = \\tfrac{1}{2} x^\\top Qx$ with $Q = \\operatorname{diag}({{B2.params.lam.1}}, {{B2.params.lam.2}})$ and $x_0 = {{B2.params.x0}}$. Run the same backtracking as in B1 along $d = -\\nabla f(x_0)$ with $\\alpha_0 = {{B2.params.alpha0}}$, $\\beta = {{B2.params.beta}}$ and $c = {{B2.params.c}}$: try $\\alpha = \\alpha_0$ first and set $\\alpha \\leftarrow \\beta\\alpha$ while $f(x_0 + \\alpha d) > f(x_0) + c\\alpha\\nabla f(x_0)^\\top d$. How many halvings happen, which step is accepted, and where does it sit relative to $1/L$ and $2/L$?",
    "ru": "Пусть $f(x) = \\tfrac{1}{2} x^\\top Qx$, где $Q = \\operatorname{diag}({{B2.params.lam.1}}, {{B2.params.lam.2}})$, и $x_0 = {{B2.params.x0}}$. Выполните тот же бэктрекинг, что в B1, вдоль $d = -\\nabla f(x_0)$ с $\\alpha_0 = {{B2.params.alpha0}}$, $\\beta = {{B2.params.beta}}$ и $c = {{B2.params.c}}$: сначала попробуйте $\\alpha = \\alpha_0$ и заменяйте $\\alpha \\leftarrow \\beta\\alpha$, пока $f(x_0 + \\alpha d) > f(x_0) + c\\alpha\\nabla f(x_0)^\\top d$. Сколько раз шаг делится пополам, какой шаг принимается и где он лежит относительно $1/L$ и $2/L$?"
   },
   "answers": [
    {
     "id": "halvings",
     "ref": "answers.B2.halvings",
     "label": {
      "en": "Number of halvings",
      "ru": "Число делений шага пополам"
     }
    },
    {
     "id": "alpha",
     "ref": "answers.B2.alpha",
     "label": {
      "en": "Accepted step $\\alpha$",
      "ru": "Принятый шаг $\\alpha$"
     }
    }
   ]
  },
  "B3": {
   "who": "students",
   "title": {
    "en": "Three stopping tests after a tiny step",
    "ru": "Три критерия остановки после крошечного шага"
   },
   "statement": {
    "en": "Let $f(x) = \\tfrac{1}{2} x^\\top Qx$ with $Q = \\operatorname{diag}({{B3.params.lam.1}}, {{B3.params.lam.2}})$ and $x_0 = {{B3.params.x0}}$. Make one gradient step $x_1 = x_0 - \\alpha\\nabla f(x_0)$ with the prescribed step $\\alpha = {{B3.params.alpha}}$. With $\\mathrm{atol} = {{B3.params.atol}}$, $\\mathrm{rtol} = {{B3.params.rtol}}$ and Euclidean norms, evaluate the three scaled tests $$\\begin{aligned} \\text{gradient:}\\quad & \\|\\nabla f(x_1)\\| \\le \\mathrm{atol} + \\mathrm{rtol}\\cdot\\max(1, |f(x_1)|), \\\\ \\text{step:}\\quad & \\|x_1 - x_0\\| \\le \\mathrm{atol} + \\mathrm{rtol}\\cdot\\max(1, \\|x_0\\|), \\\\ \\text{function:}\\quad & |f(x_1) - f(x_0)| \\le \\mathrm{atol} + \\mathrm{rtol}\\cdot\\max(1, |f(x_0)|). \\end{aligned}$$ A test fires when its inequality holds. Report $|f(x_1) - f(x_0)|$, $\\|\\nabla f(x_1)\\|$ and the number of tests that fire. Is $x_1$ close to the minimizer? Then state a combined stopping rule and say which quantity it is scaled by.",
    "ru": "Пусть $f(x) = \\tfrac{1}{2} x^\\top Qx$, где $Q = \\operatorname{diag}({{B3.params.lam.1}}, {{B3.params.lam.2}})$, и $x_0 = {{B3.params.x0}}$. Сделайте один градиентный шаг $x_1 = x_0 - \\alpha\\nabla f(x_0)$ с заданным шагом $\\alpha = {{B3.params.alpha}}$. При $\\mathrm{atol} = {{B3.params.atol}}$, $\\mathrm{rtol} = {{B3.params.rtol}}$ и евклидовых нормах проверьте три критерия с учётом масштаба $$\\begin{aligned} \\text{градиент:}\\quad & \\|\\nabla f(x_1)\\| \\le \\mathrm{atol} + \\mathrm{rtol}\\cdot\\max(1, |f(x_1)|), \\\\ \\text{шаг:}\\quad & \\|x_1 - x_0\\| \\le \\mathrm{atol} + \\mathrm{rtol}\\cdot\\max(1, \\|x_0\\|), \\\\ \\text{функция:}\\quad & |f(x_1) - f(x_0)| \\le \\mathrm{atol} + \\mathrm{rtol}\\cdot\\max(1, |f(x_0)|). \\end{aligned}$$ Критерий срабатывает, когда его неравенство выполнено. Найдите $|f(x_1) - f(x_0)|$, $\\|\\nabla f(x_1)\\|$ и число сработавших критериев. Близка ли точка $x_1$ к точке минимума? Затем сформулируйте комбинированный критерий остановки и укажите, на какую величину он нормирован."
   },
   "answers": [
    {
     "id": "df",
     "ref": "answers.B3.df",
     "label": {
      "en": "$|f(x_1) - f(x_0)|$",
      "ru": "$|f(x_1) - f(x_0)|$"
     }
    },
    {
     "id": "grad",
     "ref": "answers.B3.grad",
     "label": {
      "en": "$\\|\\nabla f(x_1)\\|$",
      "ru": "$\\|\\nabla f(x_1)\\|$"
     }
    },
    {
     "id": "fired",
     "ref": "answers.B3.fired",
     "label": {
      "en": "Number of tests that fire",
      "ru": "Число сработавших критериев"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "The lecture's graph at a point",
    "ru": "Граф из лекции в конкретной точке"
   },
   "statement": {
    "en": "Take $z = \\sin(xy) + x^2$ at $(x, y) = {{C1.params.point}}$ with the intermediate nodes $u = xy$, $w = x^2$, $v = \\sin u$. List the nodes in topological order, run the forward pass, then the reverse pass from $\\bar z = 1$. Report $z$, $\\partial z/\\partial x$ and $\\partial z/\\partial y$, and check both derivatives analytically.",
    "ru": "Возьмите $z = \\sin(xy) + x^2$ в точке $(x, y) = {{C1.params.point}}$ с промежуточными вершинами $u = xy$, $w = x^2$, $v = \\sin u$. Выпишите вершины в топологическом порядке, выполните прямой проход, затем обратный проход, начиная с $\\bar z = 1$. Найдите $z$, $\\partial z/\\partial x$ и $\\partial z/\\partial y$ и проверьте обе производные аналитически."
   },
   "answers": [
    {
     "id": "z",
     "ref": "answers.C1.z",
     "label": {
      "en": "$z$",
      "ru": "$z$"
     }
    },
    {
     "id": "dzdx",
     "ref": "answers.C1.dzdx",
     "label": {
      "en": "$\\partial z/\\partial x$",
      "ru": "$\\partial z/\\partial x$"
     }
    },
    {
     "id": "dzdy",
     "ref": "answers.C1.dzdy",
     "label": {
      "en": "$\\partial z/\\partial y$",
      "ru": "$\\partial z/\\partial y$"
     }
    }
   ],
   "hints": [
    {
     "en": "Give every operation its own node and count the nodes that use $x$.",
     "ru": "Отведите каждой операции свою вершину и посчитайте, сколько вершин используют $x$."
    },
    {
     "en": "Seed $\\bar z = 1$, visit the nodes in reverse order, and add one term to $\\bar x$ for each edge that leaves $x$.",
     "ru": "Положите $\\bar z = 1$, обходите вершины в обратном порядке и добавляйте к $\\bar x$ по слагаемому на каждое ребро, выходящее из $x$."
    }
   ],
   "steps": [
    {
     "predict": {
      "en": "Which node has more than one outgoing edge?",
      "ru": "У какой вершины больше одного исходящего ребра?"
     },
     "text": {
      "en": "Topological order, every node after its inputs: $x$, $y$, $u = xy$, $w = x^2$, $v = \\sin u$, $z = v + w$. The input $x$ has two outgoing edges, into $u$ and into $w$.",
      "ru": "Топологический порядок (каждая вершина идёт после своих входов): $x$, $y$, $u = xy$, $w = x^2$, $v = \\sin u$, $z = v + w$. Из входа $x$ выходят два ребра: в $u$ и в $w$."
     }
    },
    {
     "text": {
      "en": "Forward pass at $(x, y) = {{C1.params.point}}$, keeping every value: $$u = {{C1.u}},\\quad w = {{C1.w}},\\quad v = \\sin({{C1.u}}) = {{C1.v}},\\quad z = v + w = {{C1.z}}.$$ The reverse pass needs $u$, $x$ and $y$ again.",
      "ru": "Прямой проход в точке $(x, y) = {{C1.params.point}}$, все значения сохраняем: $$u = {{C1.u}},\\quad w = {{C1.w}},\\quad v = \\sin({{C1.u}}) = {{C1.v}},\\quad z = v + w = {{C1.z}}.$$ На обратном проходе снова понадобятся $u$, $x$ и $y$."
     }
    },
    {
     "text": {
      "en": "Reverse pass, node $z = v + w$: seed $\\bar z = 1$. Both local derivatives are $1$, so $\\bar v = 1$ and $\\bar w = 1$.",
      "ru": "Обратный проход, вершина $z = v + w$: начинаем с $\\bar z = 1$. Обе локальные производные равны $1$, поэтому $\\bar v = 1$ и $\\bar w = 1$."
     }
    },
    {
     "text": {
      "en": "Node $v = \\sin u$: with $u$ in radians, $\\bar u \\mathrel{+}= \\bar v \\cos u = \\cos({{C1.u}}) = {{C1.cosu}}$.",
      "ru": "Вершина $v = \\sin u$, угол $u$ в радианах: $\\bar u \\mathrel{+}= \\bar v \\cos u = \\cos({{C1.u}}) = {{C1.cosu}}$."
     }
    },
    {
     "text": {
      "en": "Node $w = x^2$: the local derivative is $2x$, so $\\bar x \\mathrel{+}= \\bar w \\cdot 2x = 2 \\cdot {{C1.params.point.1}}$. This is the first of the two contributions to $\\bar x$.",
      "ru": "Вершина $w = x^2$: локальная производная равна $2x$, поэтому $\\bar x \\mathrel{+}= \\bar w \\cdot 2x = 2 \\cdot {{C1.params.point.1}}$. Это первый из двух вкладов в $\\bar x$."
     }
    },
    {
     "predict": {
      "en": "What is $\\bar x$ if this step overwrites it instead of adding?",
      "ru": "Чему будет равно $\\bar x$, если этот шаг его перезапишет, а не прибавит к нему слагаемое?"
     },
     "text": {
      "en": "Node $u = xy$: the local derivatives are $y$ and $x$, so $$\\bar x \\mathrel{+}= \\bar u\\,y = ({{C1.cosu}})({{C1.params.point.2}}) = {{C1.ubarY}}, \\qquad \\bar y \\mathrel{+}= \\bar u\\,x = ({{C1.cosu}}) \\cdot {{C1.params.point.1}} = {{C1.dzdy}}.$$ With both contributions $\\bar x = {{C1.ubarY}} + 2 \\cdot {{C1.params.point.1}} = {{C1.dzdx}}$; overwriting would leave only ${{C1.ubarY}}$.",
      "ru": "Вершина $u = xy$: локальные производные равны $y$ и $x$, поэтому $$\\bar x \\mathrel{+}= \\bar u\\,y = ({{C1.cosu}})({{C1.params.point.2}}) = {{C1.ubarY}}, \\qquad \\bar y \\mathrel{+}= \\bar u\\,x = ({{C1.cosu}}) \\cdot {{C1.params.point.1}} = {{C1.dzdy}}.$$ С учётом обоих вкладов $\\bar x = {{C1.ubarY}} + 2 \\cdot {{C1.params.point.1}} = {{C1.dzdx}}$; при перезаписи осталось бы только ${{C1.ubarY}}$."
     }
    },
    {
     "text": {
      "en": "Analytic check: $\\partial z/\\partial x = y\\cos(xy) + 2x$ and $\\partial z/\\partial y = x\\cos(xy)$ give the same numbers. The reverse pass evaluated these formulas term by term: $\\bar u\\,y$ is $y\\cos(xy)$ and $\\bar w \\cdot 2x$ is $2x$. One sweep produced both partial derivatives.",
      "ru": "Аналитическая проверка: $\\partial z/\\partial x = y\\cos(xy) + 2x$ и $\\partial z/\\partial y = x\\cos(xy)$ дают те же числа. Обратный проход вычислил эти формулы слагаемое за слагаемым: $\\bar u\\,y$ — это $y\\cos(xy)$, а $\\bar w \\cdot 2x$ — это $2x$. Один проход дал обе частные производные."
     }
    }
   ],
   "answerText": {
    "en": "$z = {{C1.z}}$, $\\partial z/\\partial x = {{C1.dzdx}}$, $\\partial z/\\partial y = {{C1.dzdy}}$.",
    "ru": "$z = {{C1.z}}$, $\\partial z/\\partial x = {{C1.dzdx}}$, $\\partial z/\\partial y = {{C1.dzdy}}$."
   },
   "review": {
    "en": "Two edges leave $x$ on the graph, and the reverse pass adds one term per edge; a single sweep from $\\bar z = 1$ gave the whole gradient.",
    "ru": "Из $x$ на графе выходят два ребра, и обратный проход добавляет по слагаемому на каждое ребро; один проход, начатый с $\\bar z = 1$, дал весь градиент."
   },
   "mistakes": [
    {
     "en": "Forgetting the path through $w = x^2$ and reporting $\\partial z/\\partial x = {{C1.ubarY}}$ instead of ${{C1.dzdx}}$.",
     "ru": "Забыть путь через $w = x^2$ и получить $\\partial z/\\partial x = {{C1.ubarY}}$ вместо ${{C1.dzdx}}$."
    },
    {
     "en": "Differentiating $\\sin(xy)$ to $\\cos(xy)$ without the inner factor $y$ or $x$.",
     "ru": "Записать производную $\\sin(xy)$ как $\\cos(xy)$, потеряв внутренний множитель $y$ или $x$."
    },
    {
     "en": "Evaluating $\\sin$ and $\\cos$ in degrees: $u = {{C1.u}}$ is in radians.",
     "ru": "Считать $\\sin$ и $\\cos$ в градусах: $u = {{C1.u}}$ задано в радианах."
    }
   ],
   "figure": {
    "src": "fig_graph_c1",
    "alt": {
     "en": "The computational graph of z = sin(xy) + x squared: inputs x and y, intermediate nodes u = xy, w = x squared and v = sin u, and the output z = v + w, with the forward value and the adjoint at every node.",
     "ru": "Вычислительный граф функции z = sin(xy) + x в квадрате: входы x и y, промежуточные вершины u = xy, w = x в квадрате и v = sin u, выход z = v + w; у каждой вершины подписаны значение прямого прохода и сопряжённая переменная."
    },
    "caption": {
     "en": "The graph of C1 at $(x, y) = {{C1.params.point}}$ with forward values and adjoints. Two edges leave $x$, so $\\bar x$ is a sum of two terms.",
     "ru": "Граф задачи C1 в точке $(x, y) = {{C1.params.point}}$ со значениями прямого прохода и сопряжёнными переменными. Из $x$ выходят два ребра, поэтому $\\bar x$ — сумма двух слагаемых."
    }
   }
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "An input used twice",
    "ru": "Входная переменная, использованная дважды"
   },
   "statement": {
    "en": "Take $q = (xy + x)^2$ at $(x, y) = {{C2.params.point}}$ with the nodes $a = xy$, $b = a + x$, $q = b^2$. Compute $q$ by a forward pass and $\\partial q/\\partial x$, $\\partial q/\\partial y$ by one reverse pass, with pen and paper.",
    "ru": "Возьмите $q = (xy + x)^2$ в точке $(x, y) = {{C2.params.point}}$ с вершинами $a = xy$, $b = a + x$, $q = b^2$. Вычислите $q$ прямым проходом, а $\\partial q/\\partial x$ и $\\partial q/\\partial y$ — одним обратным проходом, вручную, на бумаге."
   },
   "answers": [
    {
     "id": "q",
     "ref": "answers.C2.q",
     "label": {
      "en": "$q$",
      "ru": "$q$"
     }
    },
    {
     "id": "dqdx",
     "ref": "answers.C2.dqdx",
     "label": {
      "en": "$\\partial q/\\partial x$",
      "ru": "$\\partial q/\\partial x$"
     }
    },
    {
     "id": "dqdy",
     "ref": "answers.C2.dqdy",
     "label": {
      "en": "$\\partial q/\\partial y$",
      "ru": "$\\partial q/\\partial y$"
     }
    }
   ]
  },
  "C3": {
   "who": "students",
   "title": {
    "en": "The logistic loss node",
    "ru": "Вершина логистической функции потерь"
   },
   "statement": {
    "en": "For one example with score $s$ and label $y \\in \\{0, 1\\}$ the logistic loss is $\\ell(s) = \\log(1 + e^s) - ys$, and $\\sigma(s) = 1/(1 + e^{-s})$. At $s = {{C3.params.s}}$ and $y = {{C3.params.y}}$, split $\\ell$ into elementary nodes, run the forward and the reverse pass, and report $\\ell$, $\\sigma(s)$ and $d\\ell/ds$. Then rewrite the loss for labels $\\tilde y = 2y - 1 \\in \\{-1, 1\\}$ as a function of $\\tilde y s$ alone, and check it for both labels.",
    "ru": "Для одного примера с логитом $s$ и меткой $y \\in \\{0, 1\\}$ логистическая функция потерь равна $\\ell(s) = \\log(1 + e^s) - ys$, а $\\sigma(s) = 1/(1 + e^{-s})$. При $s = {{C3.params.s}}$ и $y = {{C3.params.y}}$ разбейте $\\ell$ на элементарные вершины, выполните прямой и обратный проходы и найдите $\\ell$, $\\sigma(s)$ и $d\\ell/ds$. Затем перепишите функцию потерь для меток $\\tilde y = 2y - 1 \\in \\{-1, 1\\}$ как функцию одного только $\\tilde y s$ и проверьте её для обеих меток."
   },
   "answers": [
    {
     "id": "l",
     "ref": "answers.C3.l",
     "label": {
      "en": "$\\ell(s)$",
      "ru": "$\\ell(s)$"
     }
    },
    {
     "id": "sigma",
     "ref": "answers.C3.sigma",
     "label": {
      "en": "$\\sigma(s)$",
      "ru": "$\\sigma(s)$"
     }
    },
    {
     "id": "dlds",
     "ref": "answers.C3.dlds",
     "label": {
      "en": "$d\\ell/ds$",
      "ru": "$d\\ell/ds$"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
