// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 05 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Newton on Rosenbrock's function: a step too far",
    "ru": "Ньютон на функции Розенброка: слишком длинный шаг"
   },
   "statement": {
    "en": "For $f(x,y)=a(y-x^2)^2+(1-x)^2$ with $a={{A1.params.a}}$, start at $x_0={{A1.params.x0}}$. Take two full Newton steps and compute $f$ after each. Then run damped Newton from $x_0$: halve $\\alpha$ from $1$ until the Armijo condition with $c={{A1.params.c}}$ holds. Which $\\alpha$ is accepted, and what is $f$ there?",
    "ru": "Для $f(x,y)=a(y-x^2)^2+(1-x)^2$ при $a={{A1.params.a}}$ начните из $x_0={{A1.params.x0}}$. Сделайте два полных шага Ньютона и найдите $f$ после каждого. Затем из $x_0$ запустите демпфированный метод: делите $\\alpha$ пополам, начиная с $1$, пока не выполнится условие Армихо с $c={{A1.params.c}}$. Какое $\\alpha$ будет принято и чему там равна $f$?"
   },
   "answers": [
    {
     "id": "f1",
     "ref": "answers.A1.f1",
     "label": {
      "en": "$f(x_1)$ after the first full step",
      "ru": "$f(x_1)$ после первого полного шага"
     }
    },
    {
     "id": "alpha",
     "ref": "answers.A1.alpha",
     "label": {
      "en": "Accepted $\\alpha$",
      "ru": "Принятое $\\alpha$"
     }
    },
    {
     "id": "fdamped",
     "ref": "answers.A1.fdamped",
     "label": {
      "en": "$f$ after the damped step",
      "ru": "$f$ после демпфированного шага"
     }
    }
   ],
   "hints": [
    {
     "en": "$\\nabla f=\\bigl(-4ax(y-x^2)-2(1-x),\\ 2a(y-x^2)\\bigr)$. At $x=0$ the Hessian is diagonal.",
     "ru": "$\\nabla f=\\bigl(-4ax(y-x^2)-2(1-x),\\ 2a(y-x^2)\\bigr)$. При $x=0$ гессиан диагонален."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "At $x_0$: $\\nabla f={{A1.g0}}$ and $\\nabla^2 f={{A1.H0}}$. Solving $\\nabla^2 f\\,p=-\\nabla f$ gives $p_0={{A1.p0}}$, so $x_1={{A1.x1}}$.",
      "ru": "В $x_0$: $\\nabla f={{A1.g0}}$ и $\\nabla^2 f={{A1.H0}}$. Решение $\\nabla^2 f\\,p=-\\nabla f$ даёт $p_0={{A1.p0}}$, поэтому $x_1={{A1.x1}}$."
     }
    },
    {
     "text": {
      "en": "But $f(x_1)={{A1.f1}}$, while $f(x_0)={{A1.f0}}$. The quadratic model at $x_0$ is exact up to second order, and its minimizer lies far outside the region where it describes $f$: at $x=1$ the valley $y=x^2$ is at height one, and the step stays at $y=0$.",
      "ru": "Но $f(x_1)={{A1.f1}}$, тогда как $f(x_0)={{A1.f0}}$. Квадратичная модель в $x_0$ верна до второго порядка, однако её минимум лежит далеко за пределами области, где она описывает $f$: при $x=1$ дно долины $y=x^2$ находится на высоте один, а шаг остался на $y=0$."
     }
    },
    {
     "text": {
      "en": "From $x_1$: $\\nabla f={{A1.g1}}$, $\\nabla^2 f={{A1.H1}}$, and the Newton step is $p_1={{A1.p1}}$. So $x_2={{A1.x2}}$ is the minimizer, $f(x_2)={{A1.f2}}$. The full method gets there, but through a point a hundred times worse than the start.",
      "ru": "Из $x_1$: $\\nabla f={{A1.g1}}$, $\\nabla^2 f={{A1.H1}}$, шаг Ньютона $p_1={{A1.p1}}$. Значит, $x_2={{A1.x2}}$ — минимум, $f(x_2)={{A1.f2}}$. Полный метод туда приходит, но через точку, которая в сто раз хуже начальной."
     }
    },
    {
     "text": {
      "en": "Damped Newton keeps the direction $p_0$ and tests $f(x_0+\\alpha p_0)\\le f(x_0)+c\\alpha\\nabla f^\\top p_0$, where $\\nabla f^\\top p_0={{A1.slope}}$. For $\\alpha={{A1.trial.alpha}}$ the values are $f={{A1.trial.f}}$: the first two fail, and $\\alpha={{A1.alpha}}$ is accepted at $x={{A1.xdamped}}$.",
      "ru": "Демпфированный метод сохраняет направление $p_0$ и проверяет $f(x_0+\\alpha p_0)\\le f(x_0)+c\\alpha\\nabla f^\\top p_0$, где $\\nabla f^\\top p_0={{A1.slope}}$. Для $\\alpha={{A1.trial.alpha}}$ значения равны $f={{A1.trial.f}}$: первые два не проходят, принимается $\\alpha={{A1.alpha}}$ в точке $x={{A1.xdamped}}$."
     }
    }
   ],
   "answerText": {
    "en": "$f(x_1)={{A1.f1}}$, $x_2={{A1.x2}}$; damped: $\\alpha={{A1.alpha}}$, $f={{A1.trial.f}}$ for the trials, the last accepted.",
    "ru": "$f(x_1)={{A1.f1}}$, $x_2={{A1.x2}}$; с демпфированием $\\alpha={{A1.alpha}}$, пробные значения $f={{A1.trial.f}}$, последнее принято."
   },
   "review": {
    "en": "A positive definite Hessian makes the direction a descent direction, not the unit step a good step. Backtracking is what makes Newton safe away from the solution.",
    "ru": "Положительно определённый гессиан делает направление направлением спуска, но не делает единичный шаг хорошим. Вдали от решения метод Ньютона делает безопасным именно дробление шага."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_newton",
    "alt": {
     "en": "Full and damped Newton paths on Rosenbrock's function from the origin.",
     "ru": "Траектории полного и демпфированного метода Ньютона на функции Розенброка из начала координат."
    },
    "caption": {
     "en": "Full and damped Newton paths on Rosenbrock's function from the origin.",
     "ru": "Траектории полного и демпфированного метода Ньютона на функции Розенброка из начала координат."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "One step on a quadratic",
    "ru": "Один шаг на квадратичной функции"
   },
   "statement": {
    "en": "Let $f(x)=\\tfrac{1}{2}x^\\top Qx-b^\\top x$ with $Q={{A2.params.Q}}$, $b={{A2.params.b}}$. From $x_0={{A2.params.x0}}$ compute the Newton step and $x_1$, and show that $x_1$ does not depend on $x_0$. Find the condition number $\\kappa$ of $Q$.",
    "ru": "Пусть $f(x)=\\tfrac{1}{2}x^\\top Qx-b^\\top x$, $Q={{A2.params.Q}}$, $b={{A2.params.b}}$. Из $x_0={{A2.params.x0}}$ найдите шаг Ньютона и $x_1$ и покажите, что $x_1$ не зависит от $x_0$. Найдите число обусловленности $\\kappa$ матрицы $Q$."
   },
   "answers": [
    {
     "id": "first",
     "ref": "answers.A2.first",
     "label": {
      "en": "First entry of $x_1$",
      "ru": "Первая компонента $x_1$"
     }
    },
    {
     "id": "second",
     "ref": "answers.A2.second",
     "label": {
      "en": "Second entry of $x_1$",
      "ru": "Вторая компонента $x_1$"
     }
    },
    {
     "id": "kappa",
     "ref": "answers.A2.kappa",
     "label": {
      "en": "$\\kappa$",
      "ru": "$\\kappa$"
     }
    }
   ]
  },
  "A3": {
   "who": "students",
   "title": {
    "en": "Digits double",
    "ru": "Знаки удваиваются"
   },
   "statement": {
    "en": "Apply Newton's method to $f(x)=x-\\ln x$, $x>0$, from $x_0={{A3.params.x0}}$. Derive the recurrence for $e_k=1-x_k$ and compute $x_3$. How many steps make $e_k\\le{{A3.params.target}}$? For which $x_0>0$ does the method converge?",
    "ru": "Примените метод Ньютона к $f(x)=x-\\ln x$, $x>0$, из $x_0={{A3.params.x0}}$. Выведите рекуррентное соотношение для $e_k=1-x_k$ и найдите $x_3$. Сколько шагов нужно, чтобы $e_k\\le{{A3.params.target}}$? При каких $x_0>0$ метод сходится?"
   },
   "answers": [
    {
     "id": "x3",
     "ref": "answers.A3.x3",
     "label": {
      "en": "$x_3$",
      "ru": "$x_3$"
     }
    },
    {
     "id": "steps",
     "ref": "answers.A3.steps",
     "label": {
      "en": "Number of steps",
      "ru": "Число шагов"
     }
    },
    {
     "id": "bound",
     "ref": "answers.A3.bound",
     "label": {
      "en": "Upper end of the convergent starts",
      "ru": "Верхняя граница сходящихся начальных точек"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "An uphill Newton direction",
    "ru": "Направление Ньютона ведёт вверх"
   },
   "statement": {
    "en": "Let $f(x,y)=\\tfrac{1}{2}x^2-y^2+\\tfrac{1}{4}y^4$ at the point ${{B1.params.x}}$. Compute $g$, $H$, the Newton direction $p_N$ and $g^\\top p_N$. Is $p_N$ a descent direction? Find the smallest shift that makes $H+\\lambda I$ positive definite, solve $(H+\\lambda I)p=-g$ for $\\lambda={{B1.params.lam}}$ and test the full step with Armijo, $c={{B1.params.c}}$.",
    "ru": "Пусть $f(x,y)=\\tfrac{1}{2}x^2-y^2+\\tfrac{1}{4}y^4$ в точке ${{B1.params.x}}$. Найдите $g$, $H$, направление Ньютона $p_N$ и $g^\\top p_N$. Является ли $p_N$ направлением спуска? Найдите наименьший сдвиг, при котором $H+\\lambda I$ положительно определена, решите $(H+\\lambda I)p=-g$ при $\\lambda={{B1.params.lam}}$ и проверьте полный шаг по Армихо с $c={{B1.params.c}}$."
   },
   "answers": [
    {
     "id": "slope",
     "ref": "answers.B1.slope",
     "label": {
      "en": "$g^\\top p_N$",
      "ru": "$g^\\top p_N$"
     }
    },
    {
     "id": "step",
     "ref": "answers.B1.step",
     "label": {
      "en": "Second entry of the regularized step",
      "ru": "Вторая компонента регуляризованного шага"
     }
    },
    {
     "id": "freg",
     "ref": "answers.B1.freg",
     "label": {
      "en": "$f$ after the regularized step",
      "ru": "$f$ после регуляризованного шага"
     }
    }
   ],
   "hints": [
    {
     "en": "Along $y$ the curvature is $-2+3y^2$; it is negative near zero.",
     "ru": "Вдоль $y$ кривизна равна $-2+3y^2$; возле нуля она отрицательна."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "$g={{B1.g}}$, $H={{B1.H}}$: one eigenvalue is negative, so $H$ is indefinite. Newton gives $p_N=-H^{-1}g={{B1.pN}}$ and $g^\\top p_N={{B1.slopeN}}>0$.",
      "ru": "$g={{B1.g}}$, $H={{B1.H}}$: одно собственное значение отрицательно, так что $H$ знаконеопределён. Метод Ньютона даёт $p_N=-H^{-1}g={{B1.pN}}$ и $g^\\top p_N={{B1.slopeN}}>0$."
     }
    },
    {
     "text": {
      "en": "$\\phi(\\alpha)=f(x+\\alpha p_N)$ has $\\phi'(0)=g^\\top p_N>0$: every small step raises $f$, and the full step takes it from ${{B1.f0}}$ to ${{B1.fN}}$. Backtracking would shrink $\\alpha$ forever. The direction itself must change.",
      "ru": "У $\\phi(\\alpha)=f(x+\\alpha p_N)$ производная $\\phi'(0)=g^\\top p_N>0$: любой малый шаг увеличивает $f$, а полный шаг переводит её из ${{B1.f0}}$ в ${{B1.fN}}$. Дробление уменьшало бы $\\alpha$ бесконечно. Менять нужно само направление."
     }
    },
    {
     "text": {
      "en": "$H+\\lambda I\\succ0$ exactly when $\\lambda>{{B1.lamMin}}$. For $\\lambda={{B1.params.lam}}$: $p={{B1.preg}}$ and $g^\\top p={{B1.slopeReg}}<0$. The step now goes along the negative curvature, away from the saddle.",
      "ru": "$H+\\lambda I\\succ0$ ровно при $\\lambda>{{B1.lamMin}}$. При $\\lambda={{B1.params.lam}}$: $p={{B1.preg}}$ и $g^\\top p={{B1.slopeReg}}<0$. Теперь шаг идёт вдоль отрицательной кривизны, прочь от седла."
     }
    },
    {
     "text": {
      "en": "Armijo at $\\alpha=1$: $f(x+p)={{B1.freg}}\\le f(x)+c\\,g^\\top p={{B1.armijoRhs}}$, so the full regularized step is accepted. The minimizers are at $y=\\pm{{B1.ymin}}$, where $H\\succ0$ and the shift can be dropped.",
      "ru": "Армихо при $\\alpha=1$: $f(x+p)={{B1.freg}}\\le f(x)+c\\,g^\\top p={{B1.armijoRhs}}$, значит, полный регуляризованный шаг принимается. Минимумы находятся в $y=\\pm{{B1.ymin}}$, где $H\\succ0$ и сдвиг можно убрать."
     }
    }
   ],
   "answerText": {
    "en": "$g^\\top p_N={{B1.slopeN}}$: not a descent direction. $\\lambda>{{B1.lamMin}}$; for $\\lambda={{B1.params.lam}}$ the step is ${{B1.preg}}$ and $f$ falls to ${{B1.freg}}$.",
    "ru": "$g^\\top p_N={{B1.slopeN}}$: это не направление спуска. $\\lambda>{{B1.lamMin}}$; при $\\lambda={{B1.params.lam}}$ шаг равен ${{B1.preg}}$, и $f$ уменьшается до ${{B1.freg}}$."
   },
   "review": {
    "en": "Test $g^\\top p<0$ before the line search. A Cholesky factorization that fails is the cheapest test of positive definiteness.",
    "ru": "Проверяйте $g^\\top p<0$ до линейного поиска. Неудавшееся разложение Холецкого — самая дешёвая проверка положительной определённости."
   },
   "mistakes": []
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Attracted to a maximum",
    "ru": "Притяжение к максимуму"
   },
   "statement": {
    "en": "Apply full Newton to $f(x)=\\tfrac{1}{4}x^4-\\tfrac{1}{2}x^2$ from $x_0={{B2.params.x0}}$. Write the iteration as $x^+=\\varphi(x)$ and compute $x_1$, $x_2$. Where does it go, and what kind of point is that? Find the largest $a$ such that every start with $0<|x_0|< a$ is drawn to that point.",
    "ru": "Примените полный метод Ньютона к $f(x)=\\tfrac{1}{4}x^4-\\tfrac{1}{2}x^2$ из $x_0={{B2.params.x0}}$. Запишите итерацию как $x^+=\\varphi(x)$ и найдите $x_1$, $x_2$. Куда сходится метод и что это за точка? Найдите наибольшее $a$, при котором любая начальная точка с $0<|x_0|< a$ притягивается к ней."
   },
   "answers": [
    {
     "id": "x1",
     "ref": "answers.B2.x1",
     "label": {
      "en": "$x_1$",
      "ru": "$x_1$"
     }
    },
    {
     "id": "x2",
     "ref": "answers.B2.x2",
     "label": {
      "en": "$x_2$",
      "ru": "$x_2$"
     }
    },
    {
     "id": "threshold",
     "ref": "answers.B2.threshold",
     "label": {
      "en": "$a$",
      "ru": "$a$"
     }
    }
   ]
  },
  "B3": {
   "who": "students",
   "title": {
    "en": "Gauss–Newton, Newton and Levenberg–Marquardt",
    "ru": "Гаусс–Ньютон, Ньютон и Левенберг–Марквардт"
   },
   "statement": {
    "en": "Let $f(\\theta)=\\tfrac{1}{2}\\|r(\\theta)\\|^2$ with $r(\\theta)=(\\theta^2-2,\\ \\theta-1)$. From $\\theta_0={{B3.params.theta0}}$ take one Gauss–Newton step, one Newton step with the exact second derivative and one Levenberg–Marquardt step with $\\lambda={{B3.params.lam}}$. Report $\\theta_1$ for each and compare with the minimizer.",
    "ru": "Пусть $f(\\theta)=\\tfrac{1}{2}\\|r(\\theta)\\|^2$, $r(\\theta)=(\\theta^2-2,\\ \\theta-1)$. Из $\\theta_0={{B3.params.theta0}}$ сделайте один шаг Гаусса–Ньютона, один шаг Ньютона с точной второй производной и один шаг Левенберга–Марквардта с $\\lambda={{B3.params.lam}}$. Укажите $\\theta_1$ для каждого и сравните с точкой минимума."
   },
   "answers": [
    {
     "id": "gn",
     "ref": "answers.B3.gn",
     "label": {
      "en": "Gauss–Newton $\\theta_1$",
      "ru": "$\\theta_1$ Гаусса–Ньютона"
     }
    },
    {
     "id": "newton",
     "ref": "answers.B3.newton",
     "label": {
      "en": "Newton $\\theta_1$",
      "ru": "$\\theta_1$ Ньютона"
     }
    },
    {
     "id": "lm",
     "ref": "answers.B3.lm",
     "label": {
      "en": "Levenberg–Marquardt $\\theta_1$",
      "ru": "$\\theta_1$ Левенберга–Марквардта"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "BFGS on a quadratic, by hand",
    "ru": "BFGS на квадратичной функции вручную"
   },
   "statement": {
    "en": "Let $f(x)=\\tfrac{1}{2}x^\\top Qx$ with $Q={{C1.params.Q}}$, $x_0={{C1.params.x0}}$, $G_0=I$, and use exact line searches. Take the first step, form $s$, $y$ and the inverse BFGS update $G_1$. Check the secant condition and positive definiteness. Take the second step: what are $\\alpha_1$ and $x_2$?",
    "ru": "Пусть $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q={{C1.params.Q}}$, $x_0={{C1.params.x0}}$, $G_0=I$, линейный поиск точный. Сделайте первый шаг, составьте $s$, $y$ и обратное обновление BFGS $G_1$. Проверьте секущее условие и положительную определённость. Сделайте второй шаг: чему равны $\\alpha_1$ и $x_2$?"
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
     "id": "g12",
     "ref": "answers.C1.g12",
     "label": {
      "en": "Off-diagonal entry of $G_1$",
      "ru": "Внедиагональный элемент $G_1$"
     }
    },
    {
     "id": "alpha1",
     "ref": "answers.C1.alpha1",
     "label": {
      "en": "$\\alpha_1$",
      "ru": "$\\alpha_1$"
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
      "en": "$g_0=Qx_0={{C1.g0}}$, $p_0=-G_0g_0={{C1.p0}}$, $\\alpha_0={{C1.alpha0}}$. So $s={{C1.s}}$, $x_1={{C1.x1}}$, $g_1={{C1.g1}}$ and $y=g_1-g_0={{C1.y}}$; on a quadratic $y=Qs$ exactly.",
      "ru": "$g_0=Qx_0={{C1.g0}}$, $p_0=-G_0g_0={{C1.p0}}$, $\\alpha_0={{C1.alpha0}}$. Отсюда $s={{C1.s}}$, $x_1={{C1.x1}}$, $g_1={{C1.g1}}$ и $y=g_1-g_0={{C1.y}}$; на квадратичной функции $y=Qs$ точно."
     }
    },
    {
     "text": {
      "en": "$y^\\top s={{C1.ys}}>0$, $\\rho={{C1.rho}}$. With $V=I-\\rho sy^\\top$, $$G_1=VG_0V^\\top+\\rho ss^\\top={{C1.G1}}.$$",
      "ru": "$y^\\top s={{C1.ys}}>0$, $\\rho={{C1.rho}}$. При $V=I-\\rho sy^\\top$ $$G_1=VG_0V^\\top+\\rho ss^\\top={{C1.G1}}.$$"
     }
    },
    {
     "text": {
      "en": "$G_1y={{C1.G1y}}=s$. $G_1$ is symmetric with eigenvalues ${{C1.eig}}$, both positive. Its inverse $B_1={{C1.B1}}$ agrees with $Q$ along $s$ and nowhere else yet.",
      "ru": "$G_1y={{C1.G1y}}=s$. Матрица $G_1$ симметрична, её собственные значения ${{C1.eig}}$ положительны. Обратная к ней $B_1={{C1.B1}}$ совпадает с $Q$ вдоль $s$, но пока не в других направлениях."
     }
    },
    {
     "text": {
      "en": "$p_1=-G_1g_1={{C1.p1}}$, $g_1^\\top p_1<0$, and the exact step is $\\alpha_1={{C1.alpha1}}$: $x_2={{C1.x2}}=x^*$. With exact line searches BFGS minimizes an $n$-dimensional positive definite quadratic in at most $n$ steps.",
      "ru": "$p_1=-G_1g_1={{C1.p1}}$, $g_1^\\top p_1<0$, точный шаг $\\alpha_1={{C1.alpha1}}$: $x_2={{C1.x2}}=x^*$. При точном линейном поиске BFGS минимизирует $n$-мерную положительно определённую квадратичную функцию не более чем за $n$ шагов."
     }
    }
   ],
   "answerText": {
    "en": "$G_1={{C1.G1}}$, $G_1y=s$; $\\alpha_1={{C1.alpha1}}$, $x_2={{C1.x2}}$.",
    "ru": "$G_1={{C1.G1}}$, $G_1y=s$; $\\alpha_1={{C1.alpha1}}$, $x_2={{C1.x2}}$."
   },
   "review": {
    "en": "Test $y^\\top s>0$ before the update, and check $G^+y=s$ and symmetry in your implementation after it.",
    "ru": "Проверяйте $y^\\top s>0$ до обновления, а после него проверяйте в своей реализации $G^+y=s$ и симметричность."
   },
   "mistakes": []
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "The curvature condition",
    "ru": "Условие кривизны"
   },
   "statement": {
    "en": "For $f(x)=\\tfrac{1}{4}x^4-\\tfrac{1}{2}x^2$ take the points ${{C2.params.points}}$. Compute $y^\\top s$ for the step from the first point to the second; may BFGS use this pair? For the step from the second to the third compute the secant curvature $B=y/s$ and the quasi-Newton step $x^+=x-f'(x)/B$ from the third point.",
    "ru": "Для $f(x)=\\tfrac{1}{4}x^4-\\tfrac{1}{2}x^2$ возьмите точки ${{C2.params.points}}$. Найдите $y^\\top s$ для шага из первой точки во вторую; можно ли BFGS использовать эту пару? Для шага из второй точки в третью найдите секущую кривизну $B=y/s$ и квазиньютоновский шаг $x^+=x-f'(x)/B$ из третьей точки."
   },
   "answers": [
    {
     "id": "ys1",
     "ref": "answers.C2.ys1",
     "label": {
      "en": "$y^\\top s$ for the first pair",
      "ru": "$y^\\top s$ для первой пары"
     }
    },
    {
     "id": "curvature",
     "ref": "answers.C2.curvature",
     "label": {
      "en": "Secant curvature $B$",
      "ru": "Секущая кривизна $B$"
     }
    },
    {
     "id": "next",
     "ref": "answers.C2.next",
     "label": {
      "en": "$x^+$",
      "ru": "$x^+$"
     }
    }
   ]
  },
  "C3": {
   "who": "students",
   "title": {
    "en": "What a Hessian costs",
    "ru": "Сколько стоит гессиан"
   },
   "statement": {
    "en": "Logistic regression with $N={{C3.params.N}}$ samples and $n={{C3.params.n}}$ features. Forming $H=N^{-1}X^\\top DX$ costs about $Nn^2$ multiply-adds; one product $Hv=N^{-1}X^\\top(d\\odot Xv)$ costs about $2Nn$. How many times cheaper is a Newton-CG solve with $k={{C3.params.k}}$ products than forming $H$? How many gigabytes does a dense $H$ take with ${{C3.params.bytes}}$ bytes per entry, and how many megabytes do $m={{C3.params.m}}$ L-BFGS pairs take?",
    "ru": "Логистическая регрессия с $N={{C3.params.N}}$ объектами и $n={{C3.params.n}}$ признаками. Построение $H=N^{-1}X^\\top DX$ стоит около $Nn^2$ умножений со сложением, одно произведение $Hv=N^{-1}X^\\top(d\\odot Xv)$ — около $2Nn$. Во сколько раз решение системы методом Newton-CG с $k={{C3.params.k}}$ произведениями дешевле построения $H$? Сколько гигабайт занимает плотная $H$ при ${{C3.params.bytes}}$ байтах на элемент и сколько мегабайт занимают $m={{C3.params.m}}$ пар L-BFGS?"
   },
   "answers": [
    {
     "id": "ratio",
     "ref": "answers.C3.ratio",
     "label": {
      "en": "Cost ratio",
      "ru": "Отношение стоимостей"
     }
    },
    {
     "id": "dense",
     "ref": "answers.C3.dense",
     "label": {
      "en": "Dense $H$, GB",
      "ru": "Плотная $H$, ГБ"
     }
    },
    {
     "id": "lbfgs",
     "ref": "answers.C3.lbfgs",
     "label": {
      "en": "L-BFGS pairs, MB",
      "ru": "Пары L-BFGS, МБ"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
