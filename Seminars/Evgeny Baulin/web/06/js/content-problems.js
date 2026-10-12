// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 06 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Gauss–Newton on an exponential fit",
    "ru": "Гаусс–Ньютон на подгонке экспоненты"
   },
   "statement": {
    "en": "Fit $f_\\theta(t)=a\\,e^{bt}$ to the four points $(t_i,y_i)={{A1.params.pts}}$ with $\\theta=(a,b)$. From $\\theta_0={{A1.params.theta0}}$ take two Gauss–Newton steps. Report $\\theta_1$, $\\theta_2$ and $\\tfrac{1}{2}\\|r(\\theta_2)\\|^2$.",
    "ru": "Подгоните $f_\\theta(t)=a\\,e^{bt}$ к четырём точкам $(t_i,y_i)={{A1.params.pts}}$ с $\\theta=(a,b)$. Из $\\theta_0={{A1.params.theta0}}$ сделайте два шага Гаусса–Ньютона. Укажите $\\theta_1$, $\\theta_2$ и $\\tfrac{1}{2}\\|r(\\theta_2)\\|^2$."
   },
   "answers": [
    {
     "id": "a1",
     "ref": "answers.A1.a1",
     "label": {
      "en": "$a_1$",
      "ru": "$a_1$"
     }
    },
    {
     "id": "b1",
     "ref": "answers.A1.b1",
     "label": {
      "en": "$b_1$",
      "ru": "$b_1$"
     }
    },
    {
     "id": "f2",
     "ref": "answers.A1.f2",
     "label": {
      "en": "$\\tfrac{1}{2}\\|r(\\theta_2)\\|^2$",
      "ru": "$\\tfrac{1}{2}\\|r(\\theta_2)\\|^2$"
     }
    }
   ],
   "hints": [
    {
     "en": "$r_i(\\theta)=a\\,e^{bt_i}-y_i$ and $\\partial r_i/\\partial a=e^{bt_i}$, $\\partial r_i/\\partial b=at_ie^{bt_i}$.",
     "ru": "$r_i(\\theta)=a\\,e^{bt_i}-y_i$ и $\\partial r_i/\\partial a=e^{bt_i}$, $\\partial r_i/\\partial b=at_ie^{bt_i}$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "At $\\theta_0$ the fitted values are $a_0e^{b_0t_i}={{A1.pred0}}$, so $r_0={{A1.r0}}$. The Jacobian has rows $(e^{b_0t_i},a_0t_ie^{b_0t_i})$: $J_0={{A1.J0}}$.",
      "ru": "В точке $\\theta_0$ модельные значения $a_0e^{b_0t_i}={{A1.pred0}}$, значит, $r_0={{A1.r0}}$. У якобиана строки $(e^{b_0t_i},a_0t_ie^{b_0t_i})$: $J_0={{A1.J0}}$."
     }
    },
    {
     "text": {
      "en": "The normal equations $J_0^\\top J_0\\,p=-J_0^\\top r_0$ have $J_0^\\top J_0={{A1.JtJ0}}$ and $J_0^\\top r_0={{A1.Jtr0}}$. Solving by Cramer's rule gives $p_0={{A1.p0}}$, so $\\theta_1=\\theta_0+p_0={{A1.theta1}}$.",
      "ru": "Нормальные уравнения $J_0^\\top J_0\\,p=-J_0^\\top r_0$ дают $J_0^\\top J_0={{A1.JtJ0}}$ и $J_0^\\top r_0={{A1.Jtr0}}$. Решая по правилу Крамера, получаем $p_0={{A1.p0}}$, значит, $\\theta_1=\\theta_0+p_0={{A1.theta1}}$."
     }
    },
    {
     "text": {
      "en": "Repeat at $\\theta_1$: predictions ${{A1.pred1}}$, residuals ${{A1.r1}}$, $J_1={{A1.J1}}$. The normal equations give $p_1={{A1.p1}}$ and $\\theta_2={{A1.theta2}}$. The sum of squares falls from ${{A1.f0}}$ to ${{A1.f1}}$ to ${{A1.f2}}$: by the second step we are already near the minimum.",
      "ru": "Повторяем в $\\theta_1$: модель ${{A1.pred1}}$, невязки ${{A1.r1}}$, $J_1={{A1.J1}}$. Нормальные уравнения дают $p_1={{A1.p1}}$ и $\\theta_2={{A1.theta2}}$. Сумма квадратов падает с ${{A1.f0}}$ до ${{A1.f1}}$ и далее до ${{A1.f2}}$: уже после второго шага мы возле минимума."
     }
    },
    {
     "text": {
      "en": "The exact second term of the Hessian is $\\sum_i r_i\\nabla^2 r_i$: for small residuals it is small, and Gauss–Newton behaves like Newton. The points sit on an exponential curve, so the residuals shrink fast and the convergence is almost quadratic.",
      "ru": "Точное второе слагаемое гессиана равно $\\sum_i r_i\\nabla^2 r_i$: при малых невязках оно мало, и Гаусс–Ньютон ведёт себя как Ньютон. Точки лежат на экспоненциальной кривой, невязки быстро уменьшаются, а сходимость почти квадратичная."
     }
    }
   ],
   "answerText": {
    "en": "$\\theta_1={{A1.theta1}}$, $\\theta_2={{A1.theta2}}$, $\\tfrac{1}{2}\\|r(\\theta_2)\\|^2={{A1.f2}}$.",
    "ru": "$\\theta_1={{A1.theta1}}$, $\\theta_2={{A1.theta2}}$, $\\tfrac{1}{2}\\|r(\\theta_2)\\|^2={{A1.f2}}$."
   },
   "review": {
    "en": "Gauss–Newton is a Newton step for the linearized residual. The dropped Hessian term is small whenever the fit is good enough.",
    "ru": "Гаусс–Ньютон делает ньютоновский шаг на линейной модели невязки. Отброшенное слагаемое гессиана мало, когда подгонка уже достаточно хороша."
   },
   "mistakes": []
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "Levenberg–Marquardt rescues a wild start",
    "ru": "Левенберг–Марквардт спасает дикое начало"
   },
   "statement": {
    "en": "On the fit of A1, start at the far point $\\theta_0={{A2.params.theta0}}$ and run three Levenberg–Marquardt steps with $\\lambda_0={{A2.params.lam0}}$. The rule: compute $\\rho=(f(\\theta)-f(\\theta+p))/(m(0)-m(p))$; if $\\rho\\ge{{A2.params.rhoGood}}$ accept the step and set $\\lambda\\leftarrow\\lambda/{{A2.params.shrink}}$; otherwise reject and set $\\lambda\\leftarrow\\lambda\\cdot{{A2.params.grow}}$. Report $\\theta$ after the first accepted step, after the third accepted step, and the number of rejections along the way.",
    "ru": "В задаче подгонки из A1 начните из далёкой точки $\\theta_0={{A2.params.theta0}}$ и сделайте три шага Левенберга–Марквардта с $\\lambda_0={{A2.params.lam0}}$. Правило: $\\rho=(f(\\theta)-f(\\theta+p))/(m(0)-m(p))$; если $\\rho\\ge{{A2.params.rhoGood}}$, шаг принимается и $\\lambda\\leftarrow\\lambda/{{A2.params.shrink}}$; иначе шаг отвергается и $\\lambda\\leftarrow\\lambda\\cdot{{A2.params.grow}}$. Укажите $\\theta$ после первого и после третьего принятого шага, а также число отказов."
   },
   "answers": [
    {
     "id": "a1",
     "ref": "answers.A2.a1",
     "label": {
      "en": "$a$ after the first accepted step",
      "ru": "$a$ после первого принятого шага"
     }
    },
    {
     "id": "b3",
     "ref": "answers.A2.b3",
     "label": {
      "en": "$b$ after the third accepted step",
      "ru": "$b$ после третьего принятого шага"
     }
    },
    {
     "id": "rejects",
     "ref": "answers.A2.rejects",
     "label": {
      "en": "Rejections",
      "ru": "Число отказов"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "Dogleg on a stretched quadratic",
    "ru": "Dogleg на вытянутой квадратичной функции"
   },
   "statement": {
    "en": "On $f(x,y)=\\tfrac{1}{2}(x^2+{{B1.params.c}}\\,y^2)$ at $x_0={{B1.params.x0}}$ with $B_0=\\nabla^2 f$ and $\\Delta={{B1.params.delta}}$, compute the Cauchy point $p_C$ and the Newton point $p_N$. The Newton point sits outside the ball, so the dogleg follows the broken line from $0$ through $p_C$ to $p_N$ until it crosses the sphere. Give the second entry of $p_C$, the first entry of the dogleg step, and $f$ after the step.",
    "ru": "Для $f(x,y)=\\tfrac{1}{2}(x^2+{{B1.params.c}}\\,y^2)$ в $x_0={{B1.params.x0}}$ при $B_0=\\nabla^2 f$ и $\\Delta={{B1.params.delta}}$ найдите точку Коши $p_C$ и точку Ньютона $p_N$. Точка Ньютона лежит за шаром, поэтому dogleg идёт по ломаной из $0$ через $p_C$ в $p_N$ до пересечения со сферой. Дайте вторую компоненту $p_C$, первую компоненту шага dogleg и значение $f$ после шага."
   },
   "answers": [
    {
     "id": "pc2",
     "ref": "answers.B1.pc2",
     "label": {
      "en": "Second entry of $p_C$",
      "ru": "Вторая компонента $p_C$"
     }
    },
    {
     "id": "p1",
     "ref": "answers.B1.p1",
     "label": {
      "en": "First entry of the dogleg step",
      "ru": "Первая компонента шага dogleg"
     }
    },
    {
     "id": "fnew",
     "ref": "answers.B1.fnew",
     "label": {
      "en": "$f$ after the step",
      "ru": "$f$ после шага"
     }
    }
   ],
   "hints": [
    {
     "en": "The Cauchy step is $p_C=-\\alpha g$ with $\\alpha=\\min(\\Delta/\\|g\\|,\\ g^\\top g/(g^\\top Bg))$.",
     "ru": "Шаг Коши равен $p_C=-\\alpha g$ при $\\alpha=\\min(\\Delta/\\|g\\|,\\ g^\\top g/(g^\\top Bg))$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "$g=Bx_0={{B1.g}}$, $B=\\operatorname{diag}{{B1.diagB}}$. The Newton step is $p_N=-B^{-1}g={{B1.pN}}$ with norm $\\|p_N\\|={{B1.pNnorm}}>\\Delta$. The unconstrained minimizer is already outside the ball, so the dogleg will stop at the boundary.",
      "ru": "$g=Bx_0={{B1.g}}$, $B=\\operatorname{diag}{{B1.diagB}}$. Шаг Ньютона $p_N=-B^{-1}g={{B1.pN}}$ имеет длину $\\|p_N\\|={{B1.pNnorm}}>\\Delta$. Безусловный минимум уже лежит за шаром, значит, dogleg остановится на границе."
     }
    },
    {
     "text": {
      "en": "The quadratic $m(-\\alpha g)=f-\\alpha g^\\top g+\\tfrac{1}{2}\\alpha^2 g^\\top Bg$ is minimized at $\\alpha^*=g^\\top g/(g^\\top Bg)={{B1.alphaStar}}$; the resulting step has length $\\alpha^*\\|g\\|={{B1.pCnorm}}<\\Delta$, so $p_C=-\\alpha^*g={{B1.pC}}$. Both coordinates were cut: the steep one more than the flat one.",
      "ru": "Квадратичная $m(-\\alpha g)=f-\\alpha g^\\top g+\\tfrac{1}{2}\\alpha^2 g^\\top Bg$ минимизируется при $\\alpha^*=g^\\top g/(g^\\top Bg)={{B1.alphaStar}}$; её длина $\\alpha^*\\|g\\|={{B1.pCnorm}}<\\Delta$, поэтому $p_C=-\\alpha^*g={{B1.pC}}$. Обе координаты сжаты: крутая сильнее, чем пологая."
     }
    },
    {
     "text": {
      "en": "On the segment from $p_C$ to $p_N$, $p(\\tau)=p_C+\\tau(p_N-p_C)$, solve $\\|p(\\tau)\\|^2=\\Delta^2$ for the positive root: $\\tau={{B1.tau}}$. The dogleg step is $p={{B1.p}}$ with $\\|p\\|={{B1.pnorm}}=\\Delta$, on the boundary.",
      "ru": "На отрезке от $p_C$ до $p_N$ решим $\\|p(\\tau)\\|^2=\\Delta^2$ для положительного корня: $\\tau={{B1.tau}}$. Шаг dogleg равен $p={{B1.p}}$, его длина $\\|p\\|={{B1.pnorm}}=\\Delta$, на границе."
     }
    },
    {
     "text": {
      "en": "$f(x_0)={{B1.f0}}$, $f(x_0+p)={{B1.fnew}}$, model drop $m(0)-m(p)={{B1.modelDrop}}$, so $\\rho={{B1.rho}}>3/4$. The step hit the boundary, so $\\Delta$ grows; the next trial region has radius ${{B1.deltaNext}}$.",
      "ru": "$f(x_0)={{B1.f0}}$, $f(x_0+p)={{B1.fnew}}$, модельная убыль $m(0)-m(p)={{B1.modelDrop}}$, значит, $\\rho={{B1.rho}}>3/4$. Шаг достиг границы, поэтому $\\Delta$ увеличивается; радиус следующей пробы — ${{B1.deltaNext}}$."
     }
    }
   ],
   "answerText": {
    "en": "$p_C={{B1.pC}}$, dogleg step $p={{B1.p}}$, $f={{B1.fnew}}$.",
    "ru": "$p_C={{B1.pC}}$, шаг dogleg $p={{B1.p}}$, $f={{B1.fnew}}$."
   },
   "review": {
    "en": "The dogleg is a cheap compromise: one Newton solve, one Cauchy direction, one scalar for the broken line. It is exact when the model has a well-conditioned Hessian and the ball is of the right size.",
    "ru": "Dogleg — дешёвый компромисс: одно решение Ньютона, одно направление Коши и один скаляр для ломаной. Точен, когда у модели хорошо обусловленный гессиан и шар нужного размера."
   },
   "mistakes": []
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Trust region shrinks when the model lies",
    "ru": "Доверительная область сжимается, когда модель лжёт"
   },
   "statement": {
    "en": "On $f(x)=-x+\\tfrac{1}{4}x^4$ at $x_0={{B2.params.x0}}$ with $B_0=f''(x_0)$, start with $\\Delta_0={{B2.params.delta0}}$ and run the trust-region method until a step is accepted. The rule: reject when $\\rho<{{B2.params.rhoBad}}$ and set $\\Delta\\leftarrow\\Delta/{{B2.params.shrink}}$; accept otherwise. Give the accepted $\\Delta$, the next iterate, and the number of rejections.",
    "ru": "Для $f(x)=-x+\\tfrac{1}{4}x^4$ в $x_0={{B2.params.x0}}$ при $B_0=f''(x_0)$ начните с $\\Delta_0={{B2.params.delta0}}$ и запустите метод доверительной области до первого принятого шага. Правило: при $\\rho<{{B2.params.rhoBad}}$ шаг отвергается и $\\Delta\\leftarrow\\Delta/{{B2.params.shrink}}$; иначе принимается. Укажите $\\Delta$ принятого шага, следующую точку и число отказов."
   },
   "answers": [
    {
     "id": "delta",
     "ref": "answers.B2.delta",
     "label": {
      "en": "Accepted $\\Delta$",
      "ru": "Принятое $\\Delta$"
     }
    },
    {
     "id": "x1",
     "ref": "answers.B2.x1",
     "label": {
      "en": "$x_1$",
      "ru": "$x_1$"
     }
    },
    {
     "id": "rejects",
     "ref": "answers.B2.rejects",
     "label": {
      "en": "Rejections",
      "ru": "Число отказов"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "BFGS by hand",
    "ru": "BFGS вручную"
   },
   "statement": {
    "en": "Let $f(x)=\\tfrac{1}{2}x^\\top Qx$ with $Q=\\operatorname{diag}{{C1.params.Q}}$, $x_0={{C1.params.x0}}$, $G_0=I$, and use exact line searches. Take two steps: form $s$, $y$ and the inverse BFGS update $G_1$ after the first step, check the secant condition, then take the second step. Report $G_1$ along the diagonal, $\\alpha_1$ and $x_2$.",
    "ru": "Пусть $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q=\\operatorname{diag}{{C1.params.Q}}$, $x_0={{C1.params.x0}}$, $G_0=I$, линейный поиск точный. Сделайте два шага: после первого составьте $s$, $y$ и обновите $G$ по BFGS в обратной форме, проверьте секущее условие, затем сделайте второй шаг. Укажите диагональ $G_1$, $\\alpha_1$ и $x_2$."
   },
   "answers": [
    {
     "id": "g11",
     "ref": "answers.C1.g11",
     "label": {
      "en": "Top-left entry of $G_1$",
      "ru": "Левый верхний элемент $G_1$"
     }
    },
    {
     "id": "alpha1",
     "ref": "answers.C1.alpha1",
     "label": {
      "en": "$\\alpha_1$",
      "ru": "$\\alpha_1$"
     }
    },
    {
     "id": "x2",
     "ref": "answers.C1.x2",
     "label": {
      "en": "First entry of $x_2$",
      "ru": "Первая компонента $x_2$"
     }
    }
   ],
   "hints": [
    {
     "en": "On a quadratic the exact step along $p$ is $\\alpha=-g^\\top p/(p^\\top Qp)$.",
     "ru": "На квадратичной функции точный шаг вдоль $p$ равен $\\alpha=-g^\\top p/(p^\\top Qp)$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "$g_0=Qx_0={{C1.g0}}$, $p_0=-g_0$, $\\alpha_0=g_0^\\top g_0/(g_0^\\top Qg_0)={{C1.alpha0}}$. So $s=\\alpha_0p_0={{C1.s}}$, $x_1={{C1.x1}}$, $g_1=Qx_1={{C1.g1}}$ and $y=g_1-g_0={{C1.y}}$. On a quadratic $y=Qs$ exactly.",
      "ru": "$g_0=Qx_0={{C1.g0}}$, $p_0=-g_0$, $\\alpha_0=g_0^\\top g_0/(g_0^\\top Qg_0)={{C1.alpha0}}$. Отсюда $s=\\alpha_0p_0={{C1.s}}$, $x_1={{C1.x1}}$, $g_1=Qx_1={{C1.g1}}$ и $y=g_1-g_0={{C1.y}}$. На квадратичной функции $y=Qs$ точно."
     }
    },
    {
     "text": {
      "en": "$y^\\top s={{C1.ys}}>0$, $\\rho=1/(y^\\top s)={{C1.rho}}$. With $V=I-\\rho sy^\\top$, $$G_1=VG_0V^\\top+\\rho ss^\\top={{C1.G1}}.$$",
      "ru": "$y^\\top s={{C1.ys}}>0$, $\\rho=1/(y^\\top s)={{C1.rho}}$. При $V=I-\\rho sy^\\top$ $$G_1=VG_0V^\\top+\\rho ss^\\top={{C1.G1}}.$$"
     }
    },
    {
     "text": {
      "en": "Checks: $G_1y={{C1.G1y}}=s$, $G_1^\\top=G_1$, eigenvalues ${{C1.eig}}$, both positive. The inverse $B_1={{C1.B1}}$ differs from $Q$ in the direction orthogonal to $s$: one secant pair cannot pin down the whole matrix.",
      "ru": "Проверки: $G_1y={{C1.G1y}}=s$, $G_1^\\top=G_1$, собственные значения ${{C1.eig}}$, оба положительны. Обратная $B_1={{C1.B1}}$ отличается от $Q$ в направлении, ортогональном $s$: одна секущая пара не фиксирует всю матрицу."
     }
    },
    {
     "text": {
      "en": "$p_1=-G_1g_1={{C1.p1}}$, $g_1^\\top p_1={{C1.slope1}}<0$, exact step $\\alpha_1={{C1.alpha1}}$: $x_2={{C1.x2}}=x^*=0$. With exact line searches BFGS minimizes an $n$-dimensional positive definite quadratic in at most $n$ steps.",
      "ru": "$p_1=-G_1g_1={{C1.p1}}$, $g_1^\\top p_1={{C1.slope1}}<0$, точный шаг $\\alpha_1={{C1.alpha1}}$: $x_2={{C1.x2}}=x^*=0$. При точном линейном поиске BFGS минимизирует $n$-мерную положительно определённую квадратичную функцию не более чем за $n$ шагов."
     }
    }
   ],
   "answerText": {
    "en": "$G_1={{C1.G1}}$, $\\alpha_1={{C1.alpha1}}$, $x_2={{C1.x2}}$.",
    "ru": "$G_1={{C1.G1}}$, $\\alpha_1={{C1.alpha1}}$, $x_2={{C1.x2}}$."
   },
   "review": {
    "en": "The pair $(s,y)$ carries the action of an average Hessian on $s$ and nothing else. BFGS finishes a quadratic because after $n$ steps the pairs span $\\mathbb R^n$.",
    "ru": "Пара $(s,y)$ несёт действие среднего гессиана на $s$ и больше ничего. BFGS заканчивает квадратичную функцию потому, что после $n$ шагов пары порождают $\\mathbb R^n$."
   },
   "mistakes": []
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "L-BFGS: two-loop recursion by hand",
    "ru": "L-BFGS: двухпроходная рекурсия вручную"
   },
   "statement": {
    "en": "On the quadratic of C1 keep the last $m={{C2.params.m}}$ pairs. Take two steps of L-BFGS from $x_0={{C2.params.x0}}$ with exact line searches, apply the two-loop recursion with scaling $\\gamma_k=s_{k-1}^\\top y_{k-1}/y_{k-1}^\\top y_{k-1}$. Report $\\gamma_1$, the first entry of the direction $p_1=-H_1g_1$ computed by the recursion, and $x_2$.",
    "ru": "В задаче из C1 храните последние $m={{C2.params.m}}$ пар. Сделайте два шага L-BFGS из $x_0={{C2.params.x0}}$ с точным линейным поиском, применяя двухпроходную рекурсию с масштабированием $\\gamma_k=s_{k-1}^\\top y_{k-1}/y_{k-1}^\\top y_{k-1}$. Укажите $\\gamma_1$, первую компоненту направления $p_1=-H_1g_1$, вычисленного рекурсией, и $x_2$."
   },
   "answers": [
    {
     "id": "gamma",
     "ref": "answers.C2.gamma",
     "label": {
      "en": "$\\gamma_1$",
      "ru": "$\\gamma_1$"
     }
    },
    {
     "id": "p1",
     "ref": "answers.C2.p1",
     "label": {
      "en": "First entry of $p_1$",
      "ru": "Первая компонента $p_1$"
     }
    },
    {
     "id": "x2",
     "ref": "answers.C2.x2",
     "label": {
      "en": "First entry of $x_2$",
      "ru": "Первая компонента $x_2$"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
