// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 04 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Heavy ball: parameters and the first steps",
    "ru": "Тяжёлый шар: параметры и первые шаги"
   },
   "statement": {
    "en": "For $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q=\\operatorname{diag}{{A1.params.lam}}$, use $x_{-1}=x_0={{A1.params.x0}}$ and $x_{k+1}=x_k-\\alpha Qx_k+\\beta(x_k-x_{k-1})$. Find Polyak's optimal quadratic parameters and the spectral radius. Calculate $x_1,x_2$ and their objective values. Must the objective fall at every step?",
    "ru": "Для $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q=\\operatorname{diag}{{A1.params.lam}}$, положите $x_{-1}=x_0={{A1.params.x0}}$ и $x_{k+1}=x_k-\\alpha Qx_k+\\beta(x_k-x_{k-1})$. Найдите оптимальные параметры Поляка для квадратичной функции и спектральный радиус. Вычислите $x_1,x_2$ и значения функции. Обязана ли функция убывать на каждом шаге?"
   },
   "answers": [
    {
     "id": "alpha",
     "ref": "answers.A1.alpha",
     "label": {
      "en": "$\\alpha$",
      "ru": "$\\alpha$"
     }
    },
    {
     "id": "beta",
     "ref": "answers.A1.beta",
     "label": {
      "en": "$\\beta$",
      "ru": "$\\beta$"
     }
    },
    {
     "id": "rho",
     "ref": "answers.A1.rho",
     "label": {
      "en": "Root radius $\\rho$",
      "ru": "Радиус корней $\\rho$"
     }
    }
   ],
   "hints": [
    {
     "en": "Diagonalize the recurrence, including the previous iterate.",
     "ru": "Разложите рекуррентное соотношение по собственным координатам, сохранив предыдущую точку."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Here $\\mu={{A1.mu}}$, $L={{A1.L}}$, $\\kappa={{A1.kappa}}$. For an SPD quadratic, $$\\alpha_*={4\\over(\\sqrt L+\\sqrt\\mu)^2}={{A1.params.alpha}},\\qquad \\beta_*=\\left({\\sqrt L-\\sqrt\\mu\\over\\sqrt L+\\sqrt\\mu}\\right)^2={{A1.params.beta}}.$$ The maximum root modulus is $\\rho=\\sqrt{\\beta_*}={{A1.rho}}$.",
      "ru": "Здесь $\\mu={{A1.mu}}$, $L={{A1.L}}$, $\\kappa={{A1.kappa}}$. Для положительно определённой квадратичной функции $$\\alpha_*={4\\over(\\sqrt L+\\sqrt\\mu)^2}={{A1.params.alpha}},\\qquad \\beta_*=\\left({\\sqrt L-\\sqrt\\mu\\over\\sqrt L+\\sqrt\\mu}\\right)^2={{A1.params.beta}}.$$ Максимальный модуль корня равен $\\rho=\\sqrt{\\beta_*}={{A1.rho}}$."
     }
    },
    {
     "text": {
      "en": "Along an eigenvector with eigenvalue $\\lambda$, $$z_{k+1}=(1+\\beta-\\alpha\\lambda)z_k-\\beta z_{k-1}.$$ The characteristic polynomial is $r^2-(1+\\beta-\\alpha\\lambda)r+\\beta$. At the two endpoints its roots are repeated: $+\\rho$ and $-\\rho$.",
      "ru": "Вдоль собственного вектора с собственным значением $\\lambda$ получаем $$z_{k+1}=(1+\\beta-\\alpha\\lambda)z_k-\\beta z_{k-1}.$$ Характеристический многочлен равен $r^2-(1+\\beta-\\alpha\\lambda)r+\\beta$. На концах спектра корни кратные: $+\\rho$ и $-\\rho$."
     }
    },
    {
     "text": {
      "en": "The first displacement has no momentum because $x_0-x_{-1}=0$. Thus $x_1={{A1.x1}}$; the next step includes $\\beta(x_1-x_0)$ and gives $x_2={{A1.x2}}$.",
      "ru": "На первом шаге инерции нет, поскольку $x_0-x_{-1}=0$. Поэтому $x_1={{A1.x1}}$; следующий шаг включает $\\beta(x_1-x_0)$ и даёт $x_2={{A1.x2}}$."
     }
    },
    {
     "text": {
      "en": "$f(x_0)={{A1.f0}}$, $f(x_1)={{A1.f1}}$, $f(x_2)={{A1.f2}}$. The objective rises at the first step, although every characteristic root is inside the unit circle. Root radius describes eventual decay; repeated roots can add a factor proportional to $k$.",
      "ru": "$f(x_0)={{A1.f0}}$, $f(x_1)={{A1.f1}}$, $f(x_2)={{A1.f2}}$. На первом шаге функция растёт, хотя все характеристические корни лежат внутри единичного круга. Радиус корней описывает асимптотическое затухание; кратные корни могут добавлять множитель порядка $k$."
     }
    }
   ],
   "answerText": {
    "en": "$\\alpha_*={{A1.params.alpha}}$, $\\beta_*={{A1.params.beta}}$, $\\rho={{A1.rho}}$. Stable does not mean monotone.",
    "ru": "$\\alpha_*={{A1.params.alpha}}$, $\\beta_*={{A1.params.beta}}$, $\\rho={{A1.rho}}$. Устойчивость не означает монотонности."
   },
   "review": {
    "en": "Momentum remembers a displacement. Keep the old iterate until the new one is computed.",
    "ru": "Инерция хранит перемещение. Не перезаписывайте предыдущую точку до вычисления новой."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_momentum",
    "alt": {
     "en": "GD and heavy-ball paths on a rotated quadratic; objective values against full gradients.",
     "ru": "Траектории GD и тяжёлого шара на повёрнутой квадратичной функции; значения функции по числу полных градиентов."
    },
    "caption": {
     "en": "GD and heavy-ball paths on a rotated quadratic; objective values against full gradients.",
     "ru": "Траектории GD и тяжёлого шара на повёрнутой квадратичной функции; значения функции по числу полных градиентов."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "The momentum stability boundary",
    "ru": "Граница устойчивости метода с инерцией"
   },
   "statement": {
    "en": "On $f(z)=\\tfrac{1}{2}\\lambda z^2$, take $\\lambda={{A2.params.lam}}$ and $\\beta={{A2.params.beta}}$. Derive the strict interval of stable positive steps. Report its upper endpoint and the largest root modulus for $\\alpha={{A2.params.trial}}$. Is that trial stable? Treat equality at the endpoint separately.",
    "ru": "Для $f(z)=\\tfrac{1}{2}\\lambda z^2$ возьмите $\\lambda={{A2.params.lam}}$ и $\\beta={{A2.params.beta}}$. Выведите строгий интервал устойчивых положительных шагов. Укажите его верхнюю границу и максимальный модуль корня при $\\alpha={{A2.params.trial}}$. Устойчив ли этот шаг? Отдельно разберите равенство на границе."
   },
   "answers": [
    {
     "id": "bound",
     "ref": "answers.A2.bound",
     "label": {
      "en": "Upper endpoint",
      "ru": "Верхняя граница"
     }
    },
    {
     "id": "radius",
     "ref": "answers.A2.radius",
     "label": {
      "en": "Largest root modulus",
      "ru": "Максимальный модуль корня"
     }
    }
   ]
  },
  "A3": {
   "who": "students",
   "title": {
    "en": "Where is the gradient evaluated?",
    "ru": "Где вычисляется градиент?"
   },
   "statement": {
    "en": "For $f(x)=\\tfrac{1}{2}\\lambda x^2$, use $\\lambda={{A3.params.lam}}$, $x_k={{A3.params.x}}$, $x_{k-1}={{A3.params.previous}}$, $\\alpha={{A3.params.alpha}}$, $\\beta={{A3.params.beta}}$. Compute the next heavy-ball iterate and the next look-ahead iterate: $y_k=x_k+\\beta(x_k-x_{k-1})$, $x_{k+1}=y_k-\\alpha\\nabla f(y_k)$. Explain why they differ.",
    "ru": "Для $f(x)=\\tfrac{1}{2}\\lambda x^2$ положите $\\lambda={{A3.params.lam}}$, $x_k={{A3.params.x}}$, $x_{k-1}={{A3.params.previous}}$, $\\alpha={{A3.params.alpha}}$, $\\beta={{A3.params.beta}}$. Найдите следующую точку тяжёлого шара и следующую точку метода с опережением: $y_k=x_k+\\beta(x_k-x_{k-1})$, $x_{k+1}=y_k-\\alpha\\nabla f(y_k)$. Объясните различие."
   },
   "answers": [
    {
     "id": "hb",
     "ref": "answers.A3.hb",
     "label": {
      "en": "Heavy-ball iterate",
      "ru": "Точка тяжёлого шара"
     }
    },
    {
     "id": "nag",
     "ref": "answers.A3.nag",
     "label": {
      "en": "Look-ahead iterate",
      "ru": "Точка с опережением"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "One coordinate at a time",
    "ru": "По одной координате"
   },
   "statement": {
    "en": "For $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q={{B1.params.Q}}$, start at $x_0={{B1.params.x0}}$. Minimize first over coordinate $1$, then over coordinate $2$, keeping the other fixed. Derive the exact coordinate step and calculate the objective decrease after each update.",
    "ru": "Для $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q={{B1.params.Q}}$, начните из $x_0={{B1.params.x0}}$. Минимизируйте сначала по координате $1$, затем по координате $2$, фиксируя другую. Выведите точный координатный шаг и найдите уменьшение функции после каждого обновления."
   },
   "answers": [
    {
     "id": "first",
     "ref": "answers.B1.first",
     "label": {
      "en": "First coordinate after its update",
      "ru": "Первая координата после обновления"
     }
    },
    {
     "id": "second",
     "ref": "answers.B1.second",
     "label": {
      "en": "Second coordinate after its update",
      "ru": "Вторая координата после обновления"
     }
    }
   ],
   "hints": [
    {
     "en": "Expand $f(x+te_i)$ as a quadratic in $t$.",
     "ru": "Раскройте $f(x+te_i)$ как квадратичную функцию от $t$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Along coordinate $i$, $f(x+te_i)=f(x)+tg_i+\\tfrac{1}{2}Q_{ii}t^2$. Its minimizer is $t=-g_i/Q_{ii}$, and the decrease is $g_i^2/(2Q_{ii})$. Here $L_i=Q_{ii}$, even though the eigenvalues are ${{B1.eigenvalues}}$.",
      "ru": "Вдоль координаты $i$ имеем $f(x+te_i)=f(x)+tg_i+\\tfrac{1}{2}Q_{ii}t^2$. Минимум достигается при $t=-g_i/Q_{ii}$, а уменьшение равно $g_i^2/(2Q_{ii})$. Здесь $L_i=Q_{ii}$, хотя собственные значения равны ${{B1.eigenvalues}}$."
     }
    },
    {
     "text": {
      "en": "$g(x_0)={{B1.g0}}$. After coordinate $1$: $x={{B1.x1}}$, $f={{B1.f1}}$, decrease ${{B1.decrease1}}$. Recompute the gradient at this point before choosing the next step.",
      "ru": "$g(x_0)={{B1.g0}}$. После координаты $1$: $x={{B1.x1}}$, $f={{B1.f1}}$, уменьшение ${{B1.decrease1}}$. Перед следующим шагом пересчитайте градиент в этой точке."
     }
    },
    {
     "text": {
      "en": "After coordinate $2$: $x={{B1.x2}}$, $f={{B1.f2}}$, decrease ${{B1.decrease2}}$. These are two coordinate updates, or one full pass in this two-dimensional problem.",
      "ru": "После координаты $2$: $x={{B1.x2}}$, $f={{B1.f2}}$, уменьшение ${{B1.decrease2}}$. Это два координатных обновления, то есть один полный проход в двумерной задаче."
     }
    }
   ],
   "answerText": {
    "en": "$x_1={{B1.x1}}$, $x_2={{B1.x2}}$. Each update minimizes the current one-dimensional slice.",
    "ru": "$x_1={{B1.x1}}$, $x_2={{B1.x2}}$. Каждое обновление минимизирует текущий одномерный срез."
   },
   "review": {
    "en": "Cyclic updates use the newly updated vector, rather than an old gradient for the entire pass.",
    "ru": "При циклических обновлениях используют уже изменённый вектор, а не старый градиент на весь проход."
   },
   "mistakes": []
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Choose the coordinate by its decrease",
    "ru": "Выбор координаты по уменьшению функции"
   },
   "statement": {
    "en": "For $Q=\\operatorname{diag}{{B2.params.lam}}$ and $x={{B2.params.x}}$, compute both gradient entries. Which coordinate maximizes the exact decrease $g_i^2/(2Q_{ii})$? Report the coordinate number, the decrease, and the new objective value. Explain the score $|g_i|/\\sqrt{Q_{ii}}$.",
    "ru": "Для $Q=\\operatorname{diag}{{B2.params.lam}}$ и $x={{B2.params.x}}$ вычислите обе компоненты градиента. Какая координата даёт наибольшее точное уменьшение $g_i^2/(2Q_{ii})$? Укажите номер координаты, уменьшение и новое значение функции. Объясните показатель $|g_i|/\\sqrt{Q_{ii}}$."
   },
   "answers": [
    {
     "id": "coordinate",
     "ref": "answers.B2.coordinate",
     "label": {
      "en": "Coordinate number",
      "ru": "Номер координаты"
     }
    },
    {
     "id": "decrease",
     "ref": "answers.B2.decrease",
     "label": {
      "en": "Objective decrease",
      "ru": "Уменьшение функции"
     }
    }
   ]
  },
  "B3": {
   "who": "students",
   "title": {
    "en": "Two conjugate-gradient steps",
    "ru": "Два шага сопряжённых градиентов"
   },
   "statement": {
    "en": "Solve $Ax=b$ by CG with $A={{B3.params.A}}$, $b={{B3.params.b}}$, $x_0={{B3.params.x0}}$. Start with $r_0=b-Ax_0$, $p_0=r_0$. Compute $\\alpha_0$, $\\beta_0$, and $x_2$. Check $r_0^\\top r_1=0$ and $p_0^\\top Ap_1=0$. Compare with the direct solution.",
    "ru": "Решите $Ax=b$ методом CG при $A={{B3.params.A}}$, $b={{B3.params.b}}$, $x_0={{B3.params.x0}}$. Начните с $r_0=b-Ax_0$, $p_0=r_0$. Вычислите $\\alpha_0$, $\\beta_0$ и $x_2$. Проверьте $r_0^\\top r_1=0$ и $p_0^\\top Ap_1=0$. Сравните с прямым решением."
   },
   "answers": [
    {
     "id": "alpha0",
     "ref": "answers.B3.alpha0",
     "label": {
      "en": "$\\alpha_0$",
      "ru": "$\\alpha_0$"
     }
    },
    {
     "id": "beta0",
     "ref": "answers.B3.beta0",
     "label": {
      "en": "$\\beta_0$",
      "ru": "$\\beta_0$"
     }
    },
    {
     "id": "first",
     "ref": "answers.B3.first",
     "label": {
      "en": "First entry of $x_2$",
      "ru": "Первая компонента $x_2$"
     }
    },
    {
     "id": "second",
     "ref": "answers.B3.second",
     "label": {
      "en": "Second entry of $x_2$",
      "ru": "Вторая компонента $x_2$"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "A batch estimates a gradient",
    "ru": "Батч оценивает градиент"
   },
   "statement": {
    "en": "Let $\\ell_i(w)=\\tfrac{1}{2}(w-a_i)^2$, $a={{C1.params.a}}$, and $F(w)$ be the mean loss. At $w_0={{C1.params.w0}}$, compare a full GD step with a batch containing targets ${{C1.params.batch}}$, using $\\alpha={{C1.params.alpha}}$. Compute the variance of one uniformly sampled gradient. How does averaging two samples change it with and without replacement?",
    "ru": "Пусть $\\ell_i(w)=\\tfrac{1}{2}(w-a_i)^2$, $a={{C1.params.a}}$, а $F(w)$ — средняя функция потерь. В точке $w_0={{C1.params.w0}}$ сравните полный шаг GD с шагом по батчу с целями ${{C1.params.batch}}$, используя $\\alpha={{C1.params.alpha}}$. Найдите дисперсию одного равномерно выбранного градиента. Как она изменяется при усреднении двух выборок с возвращением и без?"
   },
   "answers": [
    {
     "id": "batchGradient",
     "ref": "answers.C1.batchGradient",
     "label": {
      "en": "Batch gradient",
      "ru": "Градиент батча"
     }
    },
    {
     "id": "wbatch",
     "ref": "answers.C1.wbatch",
     "label": {
      "en": "Point after the batch step",
      "ru": "Точка после шага по батчу"
     }
    },
    {
     "id": "variance",
     "ref": "answers.C1.variance",
     "label": {
      "en": "Single-sample variance",
      "ru": "Дисперсия одного градиента"
     }
    }
   ],
   "hints": [
    {
     "en": "$\\nabla\\ell_i(w)=w-a_i$. Differentiate the mean, then compare it with the mean over the batch.",
     "ru": "$\\nabla\\ell_i(w)=w-a_i$. Продифференцируйте среднее, затем сравните с усреднением по батчу."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "At the start, the full gradient is ${{C1.fullGradient}}$ and the selected batch gradient is ${{C1.batchGradient}}$. Hence $w_{\\mathrm{full}}={{C1.wfull}}$ and $w_B={{C1.wbatch}}$. The batch is an estimate, rather than the exact full gradient.",
      "ru": "В начальной точке полный градиент равен ${{C1.fullGradient}}$, а градиент выбранного батча — ${{C1.batchGradient}}$. Поэтому $w_{\\mathrm{full}}={{C1.wfull}}$ и $w_B={{C1.wbatch}}$. Батч даёт оценку, а не точный полный градиент."
     }
    },
    {
     "text": {
      "en": "The minimizer is the mean target, $w^*={{C1.optimum}}$. Subtract the full gradient from each sample gradient and square; their mean is $\\sigma^2={{C1.variance}}$. Averaging two independent draws gives ${{C1.iidVariance}}$.",
      "ru": "Минимум достигается на среднем целевом значении $w^*={{C1.optimum}}$. Вычтите полный градиент из каждого градиента объекта и возведите в квадрат; среднее равно $\\sigma^2={{C1.variance}}$. Усреднение двух независимых выборок даёт ${{C1.iidVariance}}$."
     }
    },
    {
     "text": {
      "en": "For a uniformly chosen subset of size $B$ without replacement, $\\operatorname{Var}(g_B)=\\sigma^2(N-B)/(B(N-1))$, so this batch has variance ${{C1.withoutVariance}}$. Inside a shuffled epoch, later batches are conditioned on earlier draws; do not silently reuse conditional independence.",
      "ru": "Для равномерного подмножества размера $B$ без возвращения $\\operatorname{Var}(g_B)=\\sigma^2(N-B)/(B(N-1))$, поэтому здесь дисперсия равна ${{C1.withoutVariance}}$. Внутри перемешанной эпохи последующие батчи зависят от предыдущих выборок; условную независимость нельзя предполагать автоматически."
     }
    }
   ],
   "answerText": {
    "en": "$g_B={{C1.batchGradient}}$, $w_B={{C1.wbatch}}$, $\\sigma^2={{C1.variance}}$.",
    "ru": "$g_B={{C1.batchGradient}}$, $w_B={{C1.wbatch}}$, $\\sigma^2={{C1.variance}}$."
   },
   "review": {
    "en": "Divide by the actual batch length, including the final short batch.",
    "ru": "Делите на фактическую длину батча, включая последний короткий батч."
   },
   "mistakes": []
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "The constant-step noise floor",
    "ru": "Шумовой порог при постоянном шаге"
   },
   "statement": {
    "en": "For $F(w)=\\tfrac{1}{2}\\mu w^2$, the batch gradient is $\\mu w+\\xi_k$, where noises are independent, centred and have variance $\\sigma^2/B$. Take $\\mu={{C2.params.mu}}$, $\\sigma^2={{C2.params.sigma2}}$, $B={{C2.params.batch}}$, $\\alpha={{C2.params.alpha}}$. Derive the recurrence for $\\mathbb E w_k^2$ and its stationary value. Report stationary variance and expected objective gap.",
    "ru": "Для $F(w)=\\tfrac{1}{2}\\mu w^2$ градиент батча равен $\\mu w+\\xi_k$, где шумы независимы, имеют нулевое среднее и дисперсию $\\sigma^2/B$. Пусть $\\mu={{C2.params.mu}}$, $\\sigma^2={{C2.params.sigma2}}$, $B={{C2.params.batch}}$, $\\alpha={{C2.params.alpha}}$. Выведите рекуррентное соотношение для $\\mathbb E w_k^2$ и его стационарное значение. Укажите стационарную дисперсию и средний зазор функции."
   },
   "answers": [
    {
     "id": "variance",
     "ref": "answers.C2.variance",
     "label": {
      "en": "Stationary variance",
      "ru": "Стационарная дисперсия"
     }
    },
    {
     "id": "gap",
     "ref": "answers.C2.gap",
     "label": {
      "en": "Expected objective gap",
      "ru": "Средний зазор функции"
     }
    }
   ]
  },
  "C3": {
   "who": "students",
   "title": {
    "en": "Scale features, then restore units",
    "ru": "Масштаб признаков и возврат единиц"
   },
   "statement": {
    "en": "For centred least squares $F(w)=\\|Xw-y\\|^2/(2N)$, let $H=X^\\top X/N={{C3.params.H}}$. Standardize with $Z=XS^{-1}$, $S=\\operatorname{diag}{{C3.params.scale}}$. Find the condition numbers before and after scaling and the full-GD stability boundaries. If the standardized fit returns $u={{C3.params.u}}$, what are the coefficients in the original units?",
    "ru": "Для центрированной задачи наименьших квадратов $F(w)=\\|Xw-y\\|^2/(2N)$ пусть $H=X^\\top X/N={{C3.params.H}}$. Стандартизуйте с помощью $Z=XS^{-1}$, $S=\\operatorname{diag}{{C3.params.scale}}$. Найдите числа обусловленности до и после масштабирования и границы устойчивости полного GD. Если в стандартизированных единицах получено $u={{C3.params.u}}$, чему равны коэффициенты в исходных единицах?"
   },
   "answers": [
    {
     "id": "kappaBefore",
     "ref": "answers.C3.kappaBefore",
     "label": {
      "en": "Original condition number",
      "ru": "Исходное число обусловленности"
     }
    },
    {
     "id": "kappaAfter",
     "ref": "answers.C3.kappaAfter",
     "label": {
      "en": "Standardized condition number",
      "ru": "Число обусловленности после стандартизации"
     }
    },
    {
     "id": "first",
     "ref": "answers.C3.first",
     "label": {
      "en": "First original coefficient",
      "ru": "Первый исходный коэффициент"
     }
    },
    {
     "id": "second",
     "ref": "answers.C3.second",
     "label": {
      "en": "Second original coefficient",
      "ru": "Второй исходный коэффициент"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
