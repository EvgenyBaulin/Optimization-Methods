// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 05 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. From a model to a step",
     "ru": "0. От модели к шагу"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "Around a point $x$ take $g=\\nabla f(x)$, $H=\\nabla^2 f(x)$ and the model $m(p)=f(x)+g^\\top p+\\tfrac{1}{2}p^\\top Hp$. Gradient descent replaces $H$ by $\\alpha^{-1}I$; Newton's method keeps the true curvature and minimizes the model.",
      "ru": "Возле точки $x$ положим $g=\\nabla f(x)$, $H=\\nabla^2 f(x)$ и возьмём модель $m(p)=f(x)+g^\\top p+\\tfrac{1}{2}p^\\top Hp$. Градиентный спуск заменяет $H$ на $\\alpha^{-1}I$, а метод Ньютона сохраняет настоящую кривизну и минимизирует модель."
     },
     {
      "en": "For $Q=\\operatorname{diag}{{zero.lam}}$, GD with $\\alpha=1/L={{zero.alpha}}$ multiplies the flat coordinate by ${{zero.factor}}$ per step and needs ${{zero.steps}}$ steps to reduce its error by a factor of ${{zero.reduction}}$. One Newton step lands on the minimizer.",
      "ru": "Для $Q=\\operatorname{diag}{{zero.lam}}$ GD с шагом $\\alpha=1/L={{zero.alpha}}$ умножает пологую координату на ${{zero.factor}}$ за шаг, и чтобы уменьшить её ошибку в ${{zero.reduction}}$ раз, нужно ${{zero.steps}}$ шагов. Один шаг Ньютона сразу попадает в минимум."
     },
     {
      "en": "Today we pay for this: a Hessian to form and a linear system to solve at every step. We also ask what to do when the Hessian is indefinite, and when it is too large to store.",
      "ru": "Сегодня разберём цену: на каждом шаге нужно построить гессиан и решить линейную систему. И что делать, если гессиан не положительно определён или слишком велик, чтобы его хранить."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. The Newton step",
     "ru": "A. Шаг Ньютона"
    },
    "short": {
     "en": "A. Newton",
     "ru": "A. Ньютон"
    },
    "recap": [
     {
      "en": "The Newton direction solves $Hp=-g$. Use a factorization; never form $H^{-1}$. On a positive definite quadratic one full step is exact, from any start.",
      "ru": "Направление Ньютона решает $Hp=-g$. Используйте разложение матрицы и никогда не вычисляйте $H^{-1}$. На положительно определённой квадратичной функции один полный шаг точен из любой начальной точки."
     },
     {
      "en": "Near a minimizer with $\\nabla^2 f(x^*)\\succ0$ and a Lipschitz Hessian, $\\|e_{k+1}\\|\\le C\\|e_k\\|^2$: once the iterates are close, the number of correct digits roughly doubles at every step.",
      "ru": "Возле минимума с $\\nabla^2 f(x^*)\\succ0$ и липшицевым гессианом $\\|e_{k+1}\\|\\le C\\|e_k\\|^2$: когда итерации уже близко, число верных знаков примерно удваивается на каждом шаге."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: Newton against gradient descent on Rosenbrock's function",
      "ru": "Живой код: Ньютон против градиентного спуска на функции Розенброка"
     },
     "text": {
      "en": "Full Newton, damped Newton with Armijo backtracking, and gradient descent with the same backtracking, from one start. Move the start and watch where the full step goes.",
      "ru": "Полный шаг Ньютона, демпфированный Ньютон с дроблением шага по Армихо и градиентный спуск с тем же дроблением из одной точки. Двигайте начальную точку и смотрите, куда уходит полный шаг."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Unsafe steps and their repair",
     "ru": "B. Опасные шаги и их исправление"
    },
    "short": {
     "en": "B. Safeguards",
     "ru": "B. Защита"
    },
    "recap": [
     {
      "en": "If $H$ is indefinite, $g^\\top p=-g^\\top H^{-1}g$ can be positive: the Newton direction points uphill, and no line search along it can help.",
      "ru": "Если $H$ знаконеопределён, величина $g^\\top p=-g^\\top H^{-1}g$ может быть положительной: направление Ньютона ведёт вверх, и никакой линейный поиск вдоль него не поможет."
     },
     {
      "en": "Regularize: solve $(H+\\lambda I)p=-g$ with $\\lambda$ large enough for $H+\\lambda I\\succ0$, then backtrack. For least squares, Gauss–Newton keeps only $J^\\top J$, and Levenberg–Marquardt adds $\\lambda I$ to it.",
      "ru": "Регуляризуйте: решайте $(H+\\lambda I)p=-g$ с таким $\\lambda$, чтобы $H+\\lambda I\\succ0$, затем дробите шаг. В задаче наименьших квадратов метод Гаусса–Ньютона оставляет только $J^\\top J$, а метод Левенберга–Марквардта добавляет к нему $\\lambda I$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: a regularized Newton step near a saddle",
      "ru": "Живой код: регуляризованный шаг Ньютона возле седла"
     },
     "text": {
      "en": "The function has a saddle at the origin and two minimizers. Compare full Newton with the regularized and damped method from several starts, and change the shift $\\lambda$.",
      "ru": "У функции седло в начале координат и два минимума. Сравните полный шаг Ньютона с регуляризованным и демпфированным методом из разных начальных точек и меняйте сдвиг $\\lambda$."
     }
    }
   },
   "C": {
    "title": {
     "en": "C. Quasi-Newton methods",
     "ru": "C. Квазиньютоновские методы"
    },
    "short": {
     "en": "C. BFGS",
     "ru": "C. BFGS"
    },
    "recap": [
     {
      "en": "With $s_k=x_{k+1}-x_k$ and $y_k=\\nabla f(x_{k+1})-\\nabla f(x_k)$, the secant condition $G_{k+1}y_k=s_k$ asks the new inverse-Hessian estimate to explain the last step.",
      "ru": "При $s_k=x_{k+1}-x_k$ и $y_k=\\nabla f(x_{k+1})-\\nabla f(x_k)$ секущее условие $G_{k+1}y_k=s_k$ требует, чтобы новая оценка обратного гессиана объясняла последний шаг."
     },
     {
      "en": "BFGS keeps $G\\succ0$ as long as $y_k^\\top s_k>0$. L-BFGS stores only the last $m$ pairs and applies $G$ to a vector by the two-loop recursion in $O(mn)$ operations.",
      "ru": "BFGS сохраняет $G\\succ0$, пока $y_k^\\top s_k>0$. L-BFGS хранит только последние $m$ пар и умножает $G$ на вектор двухпроходной рекурсией за $O(mn)$ операций."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: BFGS and L-BFGS against gradient descent",
      "ru": "Живой код: BFGS и L-BFGS против градиентного спуска"
     },
     "text": {
      "en": "Regularized logistic regression with features on different scales. All three methods use the same Armijo backtracking. Change the memory $m$ of L-BFGS and the spread of the feature scales.",
      "ru": "Регуляризованная логистическая регрессия с признаками разного масштаба. Все три метода используют одинаковое дробление шага по Армихо. Меняйте память $m$ у L-BFGS и разброс масштабов признаков."
     }
    }
   },
   "D": {
    "title": {
     "en": "D. How it breaks",
     "ru": "D. Как ломается"
    },
    "short": {
     "en": "D. Breaks",
     "ru": "D. Сбои"
    },
    "intro": {
     "en": "Four ways a second-order method fails without an error message.",
     "ru": "Четыре способа, которыми метод второго порядка ломается без сообщения об ошибке."
    },
    "demos": [
     {
      "title": {
       "en": "Newton walks into the saddle",
       "ru": "Ньютон приходит в седло"
      },
      "text": {
       "en": "On $f(x,y)=\\tfrac{1}{2}x^2-y^2+\\tfrac{1}{4}y^4$ full Newton solves $\\nabla f=0$, and the saddle is a solution too. From any start with $|y_0|<{{demo.saddleBound}}$ it converges to the origin, quadratically. Regularization with backtracking leaves along the negative curvature and stops at $y=\\pm{{B1.ymin}}$.",
       "ru": "На $f(x,y)=\\tfrac{1}{2}x^2-y^2+\\tfrac{1}{4}y^4$ полный метод Ньютона решает $\\nabla f=0$, а седло — тоже решение. Из любой начальной точки с $|y_0|<{{demo.saddleBound}}$ он сходится в начало координат, причём квадратично. Регуляризация с дроблением шага уходит вдоль отрицательной кривизны и останавливается в $y=\\pm{{B1.ymin}}$."
      },
      "figure": {
       "src": "fig_saddle",
       "alt": {
        "en": "Full Newton and regularized Newton paths on the saddle quartic.",
        "ru": "Траектории полного и регуляризованного метода Ньютона на функции с седлом."
       },
       "caption": {
        "en": "Full Newton and regularized Newton paths on the saddle quartic.",
        "ru": "Траектории полного и регуляризованного метода Ньютона на функции с седлом."
       }
      },
      "takeaway": {
       "en": "A small gradient at the end says that a stationary point was found, not that it is a minimizer. Check the Hessian there.",
       "ru": "Малый градиент в конце означает, что найдена стационарная точка, а не минимум. Проверьте гессиан в ней."
      }
     },
     {
      "title": {
       "en": "Quadratic convergence needs a regular minimizer",
       "ru": "Квадратичной сходимости нужен невырожденный минимум"
      },
      "text": {
       "en": "For $f(x)=x^4$ the Hessian vanishes at the minimizer, and Newton gives $x^+=x-f'(x)/f''(x)={{demo.rate}}\\,x$. The convergence is linear: reducing the error by a factor of ${{zero.reduction}}$ takes ${{demo.singularSteps}}$ steps instead of a handful.",
       "ru": "Для $f(x)=x^4$ гессиан в минимуме равен нулю, и метод Ньютона даёт $x^+=x-f'(x)/f''(x)={{demo.rate}}\\,x$. Сходимость линейная: чтобы уменьшить ошибку в ${{zero.reduction}}$ раз, нужно ${{demo.singularSteps}}$ шагов, а не несколько."
      },
      "takeaway": {
       "en": "If the digits stop doubling, look at the conditioning of the Hessian near the solution before suspecting the code.",
       "ru": "Если число верных знаков перестало удваиваться, проверьте обусловленность гессиана возле решения, прежде чем искать ошибку в коде."
      }
     },
     {
      "title": {
       "en": "BFGS without the curvature test",
       "ru": "BFGS без проверки кривизны"
      },
      "text": {
       "en": "Take $G=I$, $s=(1,0)$, $y=(-1,1)$, so $y^\\top s={{demo.badYs}}$. The update still satisfies $G^+y=s$, but $G^+$ has the eigenvalue ${{demo.badEig}}$, and for $g=(1,-1)$ the new direction $p=-G^+g$ has $g^\\top p={{demo.badSlope}}>0$.",
       "ru": "Возьмём $G=I$, $s=(1,0)$, $y=(-1,1)$, так что $y^\\top s={{demo.badYs}}$. Обновление по-прежнему даёт $G^+y=s$, но у $G^+$ есть собственное значение ${{demo.badEig}}$, и для $g=(1,-1)$ новое направление $p=-G^+g$ даёт $g^\\top p={{demo.badSlope}}>0$."
      },
      "takeaway": {
       "en": "Skip or damp the update when $y^\\top s$ is not clearly positive; a Wolfe line search makes it positive by construction.",
       "ru": "Пропускайте или демпфируйте обновление, если $y^\\top s$ не положительно с запасом; линейный поиск по условиям Вульфа делает его положительным по построению."
      }
     },
     {
      "title": {
       "en": "Count work, not iterations",
       "ru": "Считайте работу, а не итерации"
      },
      "text": {
       "en": "On a logistic regression with $n={{demo.cost.n}}$ features, damped Newton stops after ${{demo.cost.iterations.newton}}$ iterations, BFGS after ${{demo.cost.iterations.bfgs}}$, L-BFGS with $m={{demo.cost.memory}}$ after ${{demo.cost.iterations.lbfgs}}$ and gradient descent after ${{demo.cost.iterations.gd}}$. In passes over the data, with a Hessian counted as $n$ passes, BFGS takes ${{demo.cost.work.bfgs}}$, Newton ${{demo.cost.work.newton}}$, L-BFGS ${{demo.cost.work.lbfgs}}$ and gradient descent ${{demo.cost.work.gd}}$.",
       "ru": "На логистической регрессии с $n={{demo.cost.n}}$ признаками демпфированный Ньютон останавливается через ${{demo.cost.iterations.newton}}$ итераций, BFGS — через ${{demo.cost.iterations.bfgs}}$, L-BFGS с $m={{demo.cost.memory}}$ — через ${{demo.cost.iterations.lbfgs}}$, градиентный спуск — через ${{demo.cost.iterations.gd}}$. В проходах по данным, если гессиан считать за $n$ проходов, BFGS тратит ${{demo.cost.work.bfgs}}$, Ньютон — ${{demo.cost.work.newton}}$, L-BFGS — ${{demo.cost.work.lbfgs}}$, градиентный спуск — ${{demo.cost.work.gd}}$."
      },
      "figure": {
       "src": "fig_cost",
       "alt": {
        "en": "Gradient norm against iterations and against passes over the data for four methods.",
        "ru": "Норма градиента в зависимости от числа итераций и от числа проходов по данным для четырёх методов."
       },
       "caption": {
        "en": "Gradient norm against iterations and against passes over the data for four methods.",
        "ru": "Норма градиента в зависимости от числа итераций и от числа проходов по данным для четырёх методов."
       }
      },
      "takeaway": {
       "en": "The Hessian costs $n$ passes here; with $n$ in the thousands the order changes. Report function, gradient and Hessian calls next to the iteration count.",
       "ru": "Здесь гессиан стоит $n$ проходов; при $n$ порядка тысяч порядок методов меняется. Указывайте число вызовов функции, градиента и гессиана рядом с числом итераций."
      }
     }
    ]
   },
   "E": {
    "title": {
     "en": "E. Takeaways and practice",
     "ru": "E. Итоги и практика"
    },
    "short": {
     "en": "E. Wrap-up",
     "ru": "E. Итоги"
    },
    "exit": {
     "title": {
      "en": "Exit ticket",
      "ru": "Короткая проверка"
     },
     "text": {
      "en": "Answer without running code.",
      "ru": "Ответьте без запуска кода."
     },
     "items": [
      {
       "question": {
        "en": "Newton's method for $f(x)=x-\\ln x$ has error $e_k=1-x_k$. If $e_k={{exit.error}}$, what is $e_{k+1}$?",
        "ru": "У метода Ньютона для $f(x)=x-\\ln x$ ошибка $e_k=1-x_k$. Чему равна $e_{k+1}$, если $e_k={{exit.error}}$?"
       }
      },
      {
       "question": {
        "en": "A Hessian has eigenvalues ${{exit.eig}}$. For which $\\lambda$ is $H+\\lambda I$ positive definite?",
        "ru": "Собственные значения гессиана равны ${{exit.eig}}$. При каких $\\lambda$ матрица $H+\\lambda I$ положительно определена?"
       }
      },
      {
       "question": {
        "en": "May BFGS apply its update when $y^\\top s\\le0$?",
        "ru": "Можно ли применять обновление BFGS, если $y^\\top s\\le0$?"
       }
      }
     ]
    },
    "home": {
     "title": {
      "en": "Computer practice",
      "ru": "Практика за компьютером"
     },
     "text": {
      "en": "Implement every method with NumPy and use SciPy only for the final comparison. Every run returns the iterate and a history of the objective, the gradient norm, the accepted step and the numbers of function, gradient and Hessian calls.",
      "ru": "Реализуйте все методы в NumPy, а SciPy используйте только для итогового сравнения. Каждый запуск возвращает точку и историю: значение функции, норму градиента, принятый шаг и число вызовов функции, градиента и гессиана."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "Newton and its safeguards",
        "ru": "Метод Ньютона и его защита"
       },
       "statement": {
        "en": "Implement full Newton, damped Newton with Armijo backtracking and regularized Newton that raises $\\lambda$ until a Cholesky factorization of $H+\\lambda I$ succeeds. Run them on a positive definite quadratic, on Rosenbrock's function from several starts and on the saddle quartic of block B. Plot the paths on the contours and $\\|\\nabla f(x_k)\\|$ on a logarithmic scale.",
        "ru": "Реализуйте полный метод Ньютона, демпфированный метод с дроблением по Армихо и регуляризованный метод, который увеличивает $\\lambda$, пока не удастся разложение Холецкого для $H+\\lambda I$. Запустите их на положительно определённой квадратичной функции, на функции Розенброка из нескольких точек и на функции с седлом из блока B. Нарисуйте траектории на линиях уровня и $\\|\\nabla f(x_k)\\|$ в логарифмической шкале."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "BFGS and the two-loop recursion",
        "ru": "BFGS и двухпроходная рекурсия"
       },
       "statement": {
        "en": "Implement the inverse BFGS update with the curvature test and the L-BFGS two-loop recursion. Check symmetry, the secant residual $\\|G^+y-s\\|$ and the eigenvalues after every update; check that with all pairs kept the two-loop direction equals $-Gg$ of dense BFGS started from the same scaled identity.",
        "ru": "Реализуйте обратное обновление BFGS с проверкой кривизны и двухпроходную рекурсию L-BFGS. После каждого обновления проверяйте симметричность, секущую невязку $\\|G^+y-s\\|$ и собственные значения; проверьте, что при хранении всех пар направление двухпроходной рекурсии совпадает с $-Gg$ плотного BFGS, начатого с той же масштабированной единичной матрицы."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "Logistic regression: Hessian-vector products and total cost",
        "ru": "Логистическая регрессия: произведения гессиана на вектор и полная стоимость"
       },
       "statement": {
        "en": "For regularized logistic regression implement the loss, the gradient, the Hessian and $Hv=N^{-1}X^\\top(d\\odot Xv)+\\gamma v$. Check $Hv$ against the explicit Hessian and against a finite difference of gradients. Solve the Newton system by conjugate gradients with $Hv$ only. Compare GD, Newton, BFGS and L-BFGS as $n$ grows: iterations, calls, median time and stored matrices.",
        "ru": "Для регуляризованной логистической регрессии реализуйте функцию потерь, градиент, гессиан и $Hv=N^{-1}X^\\top(d\\odot Xv)+\\gamma v$. Сверьте $Hv$ с явным гессианом и с конечной разностью градиентов. Решите систему Ньютона методом сопряжённых градиентов, используя только $Hv$. Сравните GD, Ньютона, BFGS и L-BFGS при росте $n$: итерации, вызовы, медианное время и хранимые матрицы."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
