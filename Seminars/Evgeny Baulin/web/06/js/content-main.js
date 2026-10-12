// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 06 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. From Newton to its practical cousins",
     "ru": "0. От Ньютона к его практичным родственникам"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "The Newton step solves $Hp=-g$ and minimizes the quadratic model $m(p)=f+g^\\top p+\\tfrac{1}{2}p^\\top Hp$. On a positive definite quadratic one full step is exact; near a regular minimizer the error squares at every step.",
      "ru": "Шаг Ньютона решает $Hp=-g$ и минимизирует квадратичную модель $m(p)=f+g^\\top p+\\tfrac{1}{2}p^\\top Hp$. На положительно определённой квадратичной функции один полный шаг точен; возле невырожденного минимума ошибка возводится в квадрат на каждом шаге."
     },
     {
      "en": "Away from the solution the full step is unsafe. Last time the safeguard was a regularized step $(H+\\lambda I)p=-g$ followed by Armijo backtracking. Today the shift $\\lambda$ is picked by two older recipes: a least-squares one that drops the term $\\sum_i r_i\\nabla^2 r_i$ of the Hessian, and a trust region that fixes $\\|p\\|$ first and then $\\lambda$.",
      "ru": "Вдали от решения полный шаг небезопасен. В прошлый раз защитой был регуляризованный шаг $(H+\\lambda I)p=-g$ с дроблением по Армихо. Сегодня $\\lambda$ выбирают двумя более старыми способами: один — из задачи наименьших квадратов, где у гессиана отбрасывают слагаемое $\\sum_i r_i\\nabla^2 r_i$; другой — методом доверительной области, где сначала фиксируют $\\|p\\|$, а потом подбирают $\\lambda$."
     },
     {
      "en": "A dense Hessian takes $n^2$ numbers and a factorization $n^3/3$ operations. For $n$ in the thousands this is already a lot; L-BFGS keeps a handful of secant pairs and applies the same curvature knowledge in $O(mn)$ work.",
      "ru": "Плотный гессиан занимает $n^2$ чисел, а его разложение — $n^3/3$ операций. При $n$ порядка тысяч это уже много; L-BFGS хранит горстку секущих пар и применяет ту же информацию о кривизне за $O(mn)$ действий."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. Gauss–Newton and Levenberg–Marquardt",
     "ru": "A. Методы Гаусса–Ньютона и Левенберга–Марквардта"
    },
    "short": {
     "en": "A. GN and LM",
     "ru": "A. GN и LM"
    },
    "recap": [
     {
      "en": "For $f(x)=\\tfrac{1}{2}\\|r(x)\\|^2$ with residuals $r:\\mathbb R^n\\to\\mathbb R^m$ and Jacobian $J$, $\\nabla f=J^\\top r$ and $\\nabla^2 f=J^\\top J+\\sum_i r_i\\nabla^2 r_i$. Gauss–Newton solves $J^\\top Jp=-J^\\top r$; it is the Newton step for the linearized residual $r+Jp$.",
      "ru": "Для $f(x)=\\tfrac{1}{2}\\|r(x)\\|^2$ с невязками $r:\\mathbb R^n\\to\\mathbb R^m$ и якобианом $J$ имеем $\\nabla f=J^\\top r$ и $\\nabla^2 f=J^\\top J+\\sum_i r_i\\nabla^2 r_i$. Метод Гаусса–Ньютона решает $J^\\top Jp=-J^\\top r$ — то есть делает шаг Ньютона по линейной модели $r+Jp$."
     },
     {
      "en": "Levenberg–Marquardt solves $(J^\\top J+\\lambda I)p=-J^\\top r$. Small $\\lambda$ is Gauss–Newton; large $\\lambda$ turns the step into $-J^\\top r/\\lambda$, a short gradient step. The ratio $\\rho=(f(x)-f(x+p))/(m(0)-m(p))$ measures how well the model predicts the drop; shrink $\\lambda$ when $\\rho$ is good, grow it when $\\rho$ is bad.",
      "ru": "Левенберг–Марквардт решает $(J^\\top J+\\lambda I)p=-J^\\top r$. Малое $\\lambda$ — это Гаусс–Ньютон; большое превращает шаг в $-J^\\top r/\\lambda$, укороченный градиентный ход. Отношение $\\rho=(f(x)-f(x+p))/(m(0)-m(p))$ показывает, насколько хорошо модель предсказала убыль; при хорошем $\\rho$ уменьшают $\\lambda$, при плохом — увеличивают."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: Gauss–Newton on an exponential fit",
      "ru": "Живой код: Гаусс–Ньютон на подгонке экспоненты"
     },
     "text": {
      "en": "Fit $y=ae^{bt}$ to four points by Gauss–Newton from several starts. Watch where the Jacobian becomes rank-deficient and the full step diverges.",
      "ru": "Подгоняем $y=ae^{bt}$ к четырём точкам методом Гаусса–Ньютона из нескольких начальных точек. Посмотрите, где якобиан теряет ранг, а полный шаг расходится."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Trust region",
     "ru": "B. Доверительная область"
    },
    "short": {
     "en": "B. Trust region",
     "ru": "B. Доверительная область"
    },
    "recap": [
     {
      "en": "A trust-region step minimizes the quadratic model $m(p)=f+g^\\top p+\\tfrac{1}{2}p^\\top Bp$ over $\\|p\\|\\le\\Delta$. By KKT, $p$ satisfies $(B+\\lambda I)p=-g$ for some $\\lambda\\ge0$, with $\\lambda=0$ when the full Newton step lies inside the ball.",
      "ru": "В доверительной области ищут $p$, минимизирующий квадратичную модель $m(p)=f+g^\\top p+\\tfrac{1}{2}p^\\top Bp$ при $\\|p\\|\\le\\Delta$. По ККТ $p$ удовлетворяет $(B+\\lambda I)p=-g$ при некотором $\\lambda\\ge0$, причём $\\lambda=0$, если полный шаг Ньютона уже лежит в шаре."
     },
     {
      "en": "The dogleg combines the Cauchy point $p_C=-\\alpha g$ (the steepest descent step inside the ball) with the Newton point $p_N=-B^{-1}g$: on the broken line from $0$ to $p_C$ to $p_N$, pick the farthest point still inside the ball. Accept the step by $\\rho$ as above; grow $\\Delta$ when $\\rho>3/4$ and the step hit the boundary, shrink it when $\\rho<1/4$.",
      "ru": "Полилинейный шаг (dogleg) соединяет точку Коши $p_C=-\\alpha g$ (шаг наискорейшего спуска в шаре) и точку Ньютона $p_N=-B^{-1}g$: на ломаной $0\\to p_C\\to p_N$ берут самую дальнюю точку внутри шара. Шаг принимают по тому же $\\rho$; $\\Delta$ увеличивают при $\\rho>3/4$ и шаге на границу, уменьшают при $\\rho<1/4$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: dogleg on an ill-conditioned quadratic",
      "ru": "Живой код: dogleg на плохо обусловленной квадратичной функции"
     },
     "text": {
      "en": "Trace the dogleg steps on $f(x,y)=\\tfrac{1}{2}(x^2+10y^2)$ from a start outside the Newton trust region. Change $\\Delta_0$ and watch how the step passes from Cauchy to Newton as the ball grows.",
      "ru": "Отслеживаем шаги dogleg на $f(x,y)=\\tfrac{1}{2}(x^2+10y^2)$ из точки, где полный Ньютон не укладывается в шар. Меняйте $\\Delta_0$ и смотрите, как шаг переходит от Коши к Ньютону по мере роста шара."
     }
    }
   },
   "C": {
    "title": {
     "en": "C. BFGS and limited memory",
     "ru": "C. BFGS и ограниченная память"
    },
    "short": {
     "en": "C. L-BFGS",
     "ru": "C. L-BFGS"
    },
    "recap": [
     {
      "en": "The BFGS inverse update is $G_{k+1}=(I-\\rho sy^\\top)G_k(I-\\rho ys^\\top)+\\rho ss^\\top$ with $\\rho=1/(y^\\top s)$. The secant condition $G_{k+1}y=s$ holds by construction, and $y^\\top s>0$ keeps $G\\succ0$.",
      "ru": "Обратное обновление BFGS: $G_{k+1}=(I-\\rho sy^\\top)G_k(I-\\rho ys^\\top)+\\rho ss^\\top$, где $\\rho=1/(y^\\top s)$. Секущее условие $G_{k+1}y=s$ выполнено по построению, а $y^\\top s>0$ сохраняет $G\\succ0$."
     },
     {
      "en": "L-BFGS keeps only the last $m$ pairs $(s_i,y_i)$ and applies $G_k$ by the two-loop recursion: a backward loop subtracts $a_iy_i$ from $q=g_k$, the kernel $H_0=\\gamma_kI$ with $\\gamma_k=s_{k-1}^\\top y_{k-1}/y_{k-1}^\\top y_{k-1}$ scales it, a forward loop adds $s_i(a_i-b_i)$. The result equals $-Gg$ for the dense BFGS matrix started from $\\gamma_kI$ and updated with those $m$ pairs.",
      "ru": "L-BFGS хранит только последние $m$ пар $(s_i,y_i)$ и применяет $G_k$ двухпроходной рекурсией: обратный цикл вычитает $a_iy_i$ из $q=g_k$, ядро $H_0=\\gamma_kI$ с $\\gamma_k=s_{k-1}^\\top y_{k-1}/y_{k-1}^\\top y_{k-1}$ его масштабирует, прямой цикл добавляет $s_i(a_i-b_i)$. Результат совпадает с $-Gg$ для плотного BFGS, начатого из $\\gamma_kI$ и обновлённого теми же $m$ парами."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: BFGS and L-BFGS on logistic regression",
      "ru": "Живой код: BFGS и L-BFGS на логистической регрессии"
     },
     "text": {
      "en": "Regularized logistic regression with twenty features on different scales. Change the memory $m$ of L-BFGS and watch iterations and stored numbers.",
      "ru": "Регуляризованная логистическая регрессия с двадцатью признаками разного масштаба. Меняйте память $m$ у L-BFGS и смотрите на число итераций и хранимых чисел."
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
     "en": "Four ways these methods fail without an error message.",
     "ru": "Четыре способа, которыми эти методы ломаются без сообщения об ошибке."
    },
    "demos": [
     {
      "title": {
       "en": "Gauss–Newton on large residuals",
       "ru": "Гаусс–Ньютон на больших невязках"
      },
      "text": {
       "en": "Fit $f_\\theta(t)=\\theta^2$ to the single point $(t,y)=(0,-1)$: $r(\\theta)=\\theta^2+1$, $J=2\\theta$, so $J^\\top J=4\\theta^2$ and the Gauss–Newton step is $-r/(2\\theta)=-(\\theta^2+1)/(2\\theta)$. From $\\theta_0={{demo.gnStart}}$ it jumps to ${{demo.gnStep1}}$ and oscillates; the true Hessian is $4\\theta^2+2(\\theta^2+1)$, always positive, and full Newton converges. Big residuals break the Gauss approximation.",
       "ru": "Подгоняем $f_\\theta(t)=\\theta^2$ к единственной точке $(t,y)=(0,-1)$: $r(\\theta)=\\theta^2+1$, $J=2\\theta$, значит, $J^\\top J=4\\theta^2$, а шаг Гаусса–Ньютона равен $-r/(2\\theta)=-(\\theta^2+1)/(2\\theta)$. Из $\\theta_0={{demo.gnStart}}$ он прыгает в ${{demo.gnStep1}}$ и колеблется; настоящий гессиан $4\\theta^2+2(\\theta^2+1)$ всегда положителен, и полный Ньютон сходится. Большие невязки ломают приближение Гаусса."
      },
      "figure": {
       "src": "fig_gn_blow",
       "alt": {
        "en": "Gauss-Newton iterates on $(theta^2+1)^2/2$ oscillate while Newton converges.",
        "ru": "Итерации Гаусса-Ньютона на $(theta^2+1)^2/2$ колеблются, тогда как Ньютон сходится."
       },
       "caption": {
        "en": "Gauss-Newton iterates on $(theta^2+1)^2/2$ oscillate while Newton converges.",
        "ru": "Итерации Гаусса-Ньютона на $(theta^2+1)^2/2$ колеблются, тогда как Ньютон сходится."
       }
      },
      "takeaway": {
       "en": "Gauss–Newton is a small-residual method. Use Levenberg–Marquardt when the residuals at the solution are not small, and compare iterations with full Newton.",
       "ru": "Метод Гаусса–Ньютона работает при малых невязках. При больших невязках в решении используйте Левенберга–Марквардта и сверяйте число итераций с полным Ньютоном."
      }
     },
     {
      "title": {
       "en": "A trust region shrinks to nothing",
       "ru": "Доверительная область стягивается в точку"
      },
      "text": {
       "en": "Set $\\Delta_0={{demo.tr.start}}$ and let every unsuccessful step divide $\\Delta$ by four. On a model that overestimates the drop near the start, the first few $\\rho$ are negative and $\\Delta$ halves five times, reaching ${{demo.tr.after}}$ before a step is accepted. Nothing is wrong with the method; the model was wrong, and the ball found the length where it is right.",
       "ru": "Положите $\\Delta_0={{demo.tr.start}}$ и пусть каждая неудача делит $\\Delta$ на четыре. Если модель возле начала переоценивает убыль, первые $\\rho$ отрицательны, и $\\Delta$ уменьшается пять раз, пока не станет ${{demo.tr.after}}$, прежде чем шаг будет принят. С методом всё в порядке; ошиблась модель, а шар нашёл длину, при которой она верна."
      },
      "takeaway": {
       "en": "A tiny $\\Delta$ is a message about the model, not a bug. Log how many rejections an accepted step took, and increase $\\Delta$ only when the full step was accepted on the boundary.",
       "ru": "Крошечная $\\Delta$ — это сообщение о модели, а не ошибка. Записывайте, сколько отказов было у принятого шага, и увеличивайте $\\Delta$ только тогда, когда полный шаг принят на границе."
      }
     },
     {
      "title": {
       "en": "L-BFGS forgets curvature it still needs",
       "ru": "L-BFGS забывает кривизну, которая ещё нужна"
      },
      "text": {
       "en": "On a quadratic with condition number ${{demo.lbfgs.kappa}}$, dense BFGS from the identity hits the tolerance in ${{demo.lbfgs.steps.bfgs}}$ steps; L-BFGS with $m=2$ needs ${{demo.lbfgs.steps.m2}}$ steps, and with $m={{demo.lbfgs.memory}}$ the two agree to the digit. The oldest pair carries information the newest pairs cannot replace.",
       "ru": "На квадратичной функции с числом обусловленности ${{demo.lbfgs.kappa}}$ плотный BFGS из единицы доходит до допуска за ${{demo.lbfgs.steps.bfgs}}$ шагов; L-BFGS с $m=2$ требует ${{demo.lbfgs.steps.m2}}$ шагов, а при $m={{demo.lbfgs.memory}}$ оба метода согласуются до знака. Самая старая пара несёт информацию, которую новые не могут заменить."
      },
      "takeaway": {
       "en": "Pick $m$ by the problem, not by habit: too small a memory restarts the method every $m$ steps, too large a memory wastes $O(mn)$ work for no gain.",
       "ru": "Выбирайте $m$ по задаче, а не по привычке: слишком малая память каждые $m$ шагов перезапускает метод, слишком большая тратит $O(mn)$ действий без выигрыша."
      }
     },
     {
      "title": {
       "en": "Dogleg does not cross the Cauchy point back",
       "ru": "Dogleg не возвращается через точку Коши"
      },
      "text": {
       "en": "The dogleg path goes from $0$ to $p_C$ to $p_N$; it never looks for a shorter path between $p_C$ and the origin along a direction other than $p_N$. For a Hessian with one tiny eigenvalue, $p_N$ is almost orthogonal to $p_C$ and the model keeps dropping along $p_C$ beyond the dogleg's crossing with the ball. The accepted dogleg step is correct but not model-optimal.",
       "ru": "Путь dogleg идёт из $0$ в $p_C$ и далее в $p_N$; он не ищет более короткий путь между $p_C$ и началом вдоль какого-либо другого направления, кроме $p_N$. Если у гессиана одно собственное значение очень мало, $p_N$ почти ортогонален $p_C$, а модель продолжает убывать вдоль $p_C$ дальше точки пересечения ломаной с границей шара. Шаг dogleg корректен, но не оптимален для модели."
      },
      "takeaway": {
       "en": "Dogleg trades the exact subproblem for one Newton solve and one Cauchy direction. Use Steihaug-CG when the model has to be minimized more carefully, or the full Moré–Sorensen solve when a tiny eigenvalue matters.",
       "ru": "Dogleg меняет точную подзадачу на одно решение Ньютона и одно направление Коши. Если модель нужно минимизировать точнее, используйте Steihaug-CG; если важно малое собственное значение — полный метод Море–Соренсена."
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
        "en": "A least-squares fit has residuals $r(x^*)={{exit.residual}}$ at the solution. Will Gauss–Newton converge quadratically there?",
        "ru": "В задаче наименьших квадратов невязки в решении равны $r(x^*)={{exit.residual}}$. Будет ли Гаусс–Ньютон сходиться квадратично?"
       }
      },
      {
       "question": {
        "en": "A trust-region step with $\\Delta={{exit.delta}}$ produced $\\rho={{exit.rho}}$ on the boundary. What happens to $\\Delta$ next?",
        "ru": "Trust-region шаг при $\\Delta={{exit.delta}}$ дал $\\rho={{exit.rho}}$ на границе шара. Что произойдёт с $\\Delta$ дальше?"
       }
      },
      {
       "question": {
        "en": "L-BFGS with $m={{exit.memory}}$ on a problem of dimension $n={{exit.n}}$: how many numbers does it store, and how much does one direction cost in multiply-adds?",
        "ru": "L-BFGS с $m={{exit.memory}}$ на задаче размерности $n={{exit.n}}$: сколько чисел он хранит и сколько умножений со сложением стоит одно направление?"
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
      "en": "Implement every method with NumPy and use SciPy only for the final comparison. Every run returns the iterate and a history of the objective, the gradient norm, the accepted step and the numbers of function, gradient, Jacobian and Hessian calls.",
      "ru": "Реализуйте все методы в NumPy, а SciPy используйте только для итогового сравнения. Каждый запуск возвращает точку и историю: значение функции, норму градиента, принятый шаг и число вызовов функции, градиента, якобиана и гессиана."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "Levenberg–Marquardt with an adaptive shift",
        "ru": "Левенберг–Марквардт с адаптивным сдвигом"
       },
       "statement": {
        "en": "Implement Levenberg–Marquardt that solves $(J^\\top J+\\lambda I)p=-J^\\top r$ by Cholesky, computes $\\rho$ and updates $\\lambda$: shrink by ten when $\\rho>3/4$, grow by ten when $\\rho<1/4$. Fit $y=ae^{bt}+c$ to a noisy set of points. Compare iterations, Jacobian calls and the final residual with Gauss–Newton and with full Newton.",
        "ru": "Реализуйте метод Левенберга–Марквардта, решающий $(J^\\top J+\\lambda I)p=-J^\\top r$ через Холецкого, вычисляющий $\\rho$ и обновляющий $\\lambda$: уменьшать в десять раз при $\\rho>3/4$, увеличивать в десять раз при $\\rho<1/4$. Подгоните $y=ae^{bt}+c$ к зашумлённому набору точек. Сравните итерации, вызовы якобиана и итоговую невязку с Гаусс–Ньютоном и с полным Ньютоном."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "Trust region with dogleg and Steihaug-CG",
        "ru": "Доверительная область с dogleg и Steihaug-CG"
       },
       "statement": {
        "en": "Implement a trust-region method with two subproblem solvers: dogleg when the Hessian is positive definite, and Steihaug-CG that stops at the boundary or at negative curvature. Run on Rosenbrock's function from several starts and on the saddle quartic of seminar 5. Check that Steihaug-CG escapes a negative-curvature direction when dogleg cannot.",
        "ru": "Реализуйте метод доверительной области с двумя решателями подзадачи: dogleg при положительно определённом гессиане и Steihaug-CG, останавливающийся на границе или при отрицательной кривизне. Запустите на функции Розенброка из нескольких точек и на функции с седлом из семинара 5. Убедитесь, что Steihaug-CG уходит в направлении отрицательной кривизны там, где dogleg этого не умеет."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "L-BFGS by hand and against scipy",
        "ru": "L-BFGS своими руками и против scipy"
       },
       "statement": {
        "en": "Implement the two-loop recursion with scaling $\\gamma_k=s_{k-1}^\\top y_{k-1}/y_{k-1}^\\top y_{k-1}$ and a strong Wolfe line search. Minimize a regularized logistic regression with hundreds of features and compare iterations, gradient calls and total time with `scipy.optimize.minimize(method='L-BFGS-B')`. Verify that at memory $m\\ge n$ the direction coincides with the full BFGS one to the last digit.",
        "ru": "Реализуйте двухпроходную рекурсию со масштабированием $\\gamma_k=s_{k-1}^\\top y_{k-1}/y_{k-1}^\\top y_{k-1}$ и сильным поиском Вульфа. Минимизируйте регуляризованную логистическую регрессию с сотнями признаков и сравните итерации, вызовы градиента и общее время с `scipy.optimize.minimize(method='L-BFGS-B')`. Проверьте, что при памяти $m\\ge n$ направление совпадает с полным BFGS с точностью до последнего знака."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
