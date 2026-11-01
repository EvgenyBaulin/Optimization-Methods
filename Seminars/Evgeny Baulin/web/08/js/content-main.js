// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 08 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. From constraints to integers",
     "ru": "0. От ограничений к целым числам"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "Without constraints a minimizer has $\\nabla f=0$. With constraints it may sit on the boundary, where the gradient does not vanish: there $-\\nabla f$ points out of the feasible set, along the normals of the constraints that bind. Seminar 2 drew this picture for projections.",
      "ru": "Без ограничений в точке минимума $\\nabla f=0$. С ограничениями минимум может лежать на границе, где градиент не обращается в ноль: там $-\\nabla f$ смотрит наружу допустимого множества, вдоль нормалей тех ограничений, что выполняются как равенства. На семинаре 2 мы рисовали эту картинку для проекций."
     },
     {
      "en": "Today the multipliers get a second meaning. The dual function turns them into lower bounds on the optimal value, and at the optimum they are prices: how much the optimal value changes when a constraint is relaxed by one unit.",
      "ru": "Сегодня у множителей появится второй смысл. Двойственная функция превращает их в нижние оценки оптимального значения, а в оптимуме они становятся ценами: на сколько изменится оптимум, если ослабить ограничение на единицу."
     },
     {
      "en": "The second half of the course works with integer variables. The first thing to do with an integer model is to drop integrality: the LP relaxation is easy to solve and, like the dual, gives a bound on the true optimum.",
      "ru": "Вторая половина курса — про целочисленные переменные. Первое, что делают с целочисленной моделью, — отбрасывают целочисленность: LP-релаксация решается легко и, как и двойственная задача, даёт оценку настоящего оптимума."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. KKT conditions",
     "ru": "A. Условия ККТ"
    },
    "short": {
     "en": "A. KKT",
     "ru": "A. ККТ"
    },
    "recap": [
     {
      "en": "For $\\min f(x)$ subject to $g_i(x)\\le0$ and $h_j(x)=0$ the Lagrangian is $L=f+\\sum_i\\lambda_ig_i+\\sum_j\\nu_jh_j$. KKT asks for four things: stationarity $\\nabla_xL=0$, primal feasibility, dual feasibility $\\lambda\\ge0$ and complementary slackness $\\lambda_ig_i(x)=0$.",
      "ru": "Для задачи $\\min f(x)$ при $g_i(x)\\le0$ и $h_j(x)=0$ лагранжиан равен $L=f+\\sum_i\\lambda_ig_i+\\sum_j\\nu_jh_j$. Условия ККТ требуют четырёх вещей: стационарности $\\nabla_xL=0$, допустимости точки, неотрицательности $\\lambda\\ge0$ и дополняющей нежёсткости $\\lambda_ig_i(x)=0$."
     },
     {
      "en": "Necessity needs a constraint qualification (LICQ, or Slater for convex problems). Sufficiency needs convexity: if $f$ and $g_i$ are convex and $h_j$ affine, every KKT point is a global minimizer. An inactive constraint has $\\lambda_i=0$; an active one may have $\\lambda_i=0$ as well.",
      "ru": "Для необходимости нужно условие регулярности (LICQ или условие Слейтера в выпуклом случае). Для достаточности нужна выпуклость: если $f$ и $g_i$ выпуклы, а $h_j$ аффинны, любая точка ККТ — глобальный минимум. У неактивного ограничения $\\lambda_i=0$; у активного множитель тоже может оказаться нулевым."
     },
     {
      "en": "In practice: guess the active set, solve the equations, reject the candidate if it is infeasible or has a negative multiplier. With $m$ inequalities there are at most $2^m$ guesses.",
      "ru": "На практике: угадываем активное множество, решаем уравнения и отбрасываем кандидата, если он недопустим или у него отрицательный множитель. При $m$ неравенствах вариантов не больше $2^m$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: every active set of a small quadratic program",
      "ru": "Живой код: все активные множества маленькой квадратичной задачи"
     },
     "text": {
      "en": "The code tries each subset of three linear constraints as the active set, solves the KKT equations and marks the candidates that survive. Move the centre of $f$ and watch the active set change.",
      "ru": "Код перебирает подмножества трёх линейных ограничений как активные, решает уравнения ККТ и отмечает выживших кандидатов. Сдвигайте центр $f$ и смотрите, как меняется активное множество."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Duality and sensitivity",
     "ru": "B. Двойственность и чувствительность"
    },
    "short": {
     "en": "B. Duality",
     "ru": "B. Двойственность"
    },
    "recap": [
     {
      "en": "The dual function $q(\\lambda,\\nu)=\\inf_xL(x,\\lambda,\\nu)$ is concave even for a nonconvex problem: it is an infimum of functions affine in the multipliers. Weak duality: $q(\\lambda,\\nu)\\le f(x)$ for every feasible $x$ and every $\\lambda\\ge0$, so $d^*\\le p^*$.",
      "ru": "Двойственная функция $q(\\lambda,\\nu)=\\inf_xL(x,\\lambda,\\nu)$ вогнута даже для невыпуклой задачи: это инфимум функций, аффинных по множителям. Слабая двойственность: $q(\\lambda,\\nu)\\le f(x)$ для любой допустимой $x$ и любых $\\lambda\\ge0$, поэтому $d^*\\le p^*$."
     },
     {
      "en": "For a convex problem with a strictly feasible point (Slater) the gap closes: $d^*=p^*$ and the dual optimum is attained. A feasible $x$ and a dual feasible $\\lambda$ with a small $f(x)-q(\\lambda)$ certify that $x$ is nearly optimal.",
      "ru": "Для выпуклой задачи со строго допустимой точкой (условие Слейтера) зазор исчезает: $d^*=p^*$, и двойственный оптимум достигается. Допустимая $x$ и допустимое $\\lambda$ с малой разностью $f(x)-q(\\lambda)$ доказывают, что $x$ почти оптимальна."
     },
     {
      "en": "For constraints $g_i(x)\\le b_i$ the optimal value satisfies $\\partial p^*/\\partial b_i=-\\lambda_i^*$ where it is differentiable. Relaxing a binding constraint by a small $\\delta$ lowers the minimum by about $\\lambda_i^*\\delta$: the multiplier is the price of the resource.",
      "ru": "Для ограничений $g_i(x)\\le b_i$ оптимальное значение удовлетворяет $\\partial p^*/\\partial b_i=-\\lambda_i^*$ там, где оно дифференцируемо. Если ослабить активное ограничение на малое $\\delta$, минимум уменьшится примерно на $\\lambda_i^*\\delta$: множитель — это цена ресурса."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: the dual function and the price of a constraint",
      "ru": "Живой код: двойственная функция и цена ограничения"
     },
     "text": {
      "en": "Plot $q(\\lambda)$ under the primal value and check that $dp^*/db$ from finite differences equals the multiplier. Change $b$ until the constraint stops binding.",
      "ru": "Строим $q(\\lambda)$ под прямым оптимумом и проверяем, что $dp^*/db$ по конечным разностям совпадает с множителем. Меняйте $b$, пока ограничение не перестанет быть активным."
     }
    }
   },
   "C": {
    "title": {
     "en": "C. From words to integer models",
     "ru": "C. От текста к целочисленной модели"
    },
    "short": {
     "en": "C. Integer models",
     "ru": "C. Целые модели"
    },
    "recap": [
     {
      "en": "A model has three parts: decision variables with their units, constraints, and one objective. Write down what each variable counts before writing any inequality; most modelling errors are variables with an unclear meaning.",
      "ru": "У модели три части: переменные решения со своими единицами измерения, ограничения и одна целевая функция. Прежде чем писать неравенства, запишите, что считает каждая переменная; большинство ошибок моделирования — это переменные с неясным смыслом."
     },
     {
      "en": "Dropping $x\\in\\mathbb Z^n$ gives the LP relaxation. Its feasible set is larger, so for a maximization its value is an upper bound on the integer optimum, for a minimization a lower bound. Rounding its solution can be infeasible or far from optimal.",
      "ru": "Если отбросить $x\\in\\mathbb Z^n$, получится LP-релаксация. Её допустимое множество шире, поэтому для максимизации её значение — верхняя оценка целочисленного оптимума, для минимизации — нижняя. Округление её решения может дать недопустимую или далеко не оптимальную точку."
     },
     {
      "en": "Binary variables encode logic. A fixed cost: $x\\le Mz$ with $z\\in\\{0,1\\}$ and the cost $Fz$. If $A$ then $B$: $z_A\\le z_B$. At most $k$ of a set: $\\sum_iz_i\\le k$. The constant $M$ must be a true upper bound on $x$ and no larger than needed.",
      "ru": "Двоичные переменные кодируют логику. Постоянные затраты: $x\\le Mz$ при $z\\in\\{0,1\\}$ и стоимости $Fz$. «Если $A$, то $B$»: $z_A\\le z_B$. «Не больше $k$ из набора»: $\\sum_iz_i\\le k$. Константа $M$ должна быть настоящей верхней границей для $x$ и не больше, чем нужно."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: a small integer program by enumeration",
      "ru": "Живой код: маленькая целочисленная задача перебором"
     },
     "text": {
      "en": "Solve the LP relaxation by checking the vertices and the integer problem by checking the lattice points, then compare both with the rounded LP solution. Change the right-hand sides and look for a case where rounding is infeasible.",
      "ru": "Решаем LP-релаксацию перебором вершин, целочисленную задачу — перебором точек решётки и сравниваем обе с округлённым решением LP. Меняйте правые части и найдите случай, когда округление недопустимо."
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
     "en": "Four places where today's statements stop being true.",
     "ru": "Четыре места, где сегодняшние утверждения перестают быть верными."
    },
    "demos": [
     {
      "title": {
       "en": "No multiplier without a constraint qualification",
       "ru": "Без условия регулярности множителя нет"
      },
      "text": {
       "en": "Minimize $x$ subject to $x^2\\le0$. The feasible set is the single point $0$, so $x^*=0$. Stationarity would need $1+2\\lambda x^*=0$, and no $\\lambda$ gives that: the gradient of the constraint vanishes at the solution, and Slater fails because no $x$ has $x^2<0$. The dual is $q(\\lambda)=\\inf_x(x+\\lambda x^2)=-1/(4\\lambda)$ for $\\lambda>0$; its supremum $0$ equals $p^*$ but is never attained.",
       "ru": "Минимизируем $x$ при $x^2\\le0$. Допустимое множество — одна точка $0$, значит, $x^*=0$. Стационарность требовала бы $1+2\\lambda x^*=0$, а такого $\\lambda$ нет: градиент ограничения в решении равен нулю, и условие Слейтера нарушено — ни у одного $x$ нет $x^2<0$. Двойственная функция $q(\\lambda)=\\inf_x(x+\\lambda x^2)=-1/(4\\lambda)$ при $\\lambda>0$; её супремум $0$ равен $p^*$, но не достигается."
      },
      "takeaway": {
       "en": "A minimizer need not be a KKT point. Before solving the KKT system, check LICQ at the candidates or find a strictly feasible point.",
       "ru": "Точка минимума не обязана быть точкой ККТ. Прежде чем решать систему ККТ, проверьте LICQ в кандидатах или найдите строго допустимую точку."
      }
     },
     {
      "title": {
       "en": "A duality gap in a knapsack",
       "ru": "Зазор двойственности в задаче о рюкзаке"
      },
      "text": {
       "en": "Take the knapsack with values ${{demo.gap.values}}$, weights ${{demo.gap.weights}}$ and capacity $C={{demo.gap.cap}}$; each item is taken or not. Move the capacity into the objective with a price $\\lambda\\ge0$: an item is now taken when $v_i-\\lambda w_i>0$, and $q(\\lambda)=\\lambda C+\\sum_i\\max(0,v_i-\\lambda w_i)$ bounds the best value from above. The smallest bound is ${{demo.gap.dual}}$ at $\\lambda={{demo.gap.lam}}$, while the best packing is worth ${{demo.gap.ip}}$.",
       "ru": "Возьмём рюкзак с ценностями ${{demo.gap.values}}$, весами ${{demo.gap.weights}}$ и вместимостью $C={{demo.gap.cap}}$; предмет либо берём, либо нет. Перенесём вместимость в целевую функцию с ценой $\\lambda\\ge0$: теперь предмет берут, когда $v_i-\\lambda w_i>0$, а $q(\\lambda)=\\lambda C+\\sum_i\\max(0,v_i-\\lambda w_i)$ оценивает лучшую ценность сверху. Наименьшая оценка равна ${{demo.gap.dual}}$ при $\\lambda={{demo.gap.lam}}$, а лучшая укладка стоит ${{demo.gap.ip}}$."
      },
      "figure": {
       "src": "fig_gap",
       "alt": {
        "en": "The dual bound of the knapsack as a piecewise linear function of the price, above the level of the best packing.",
        "ru": "Двойственная оценка рюкзака как кусочно-линейная функция цены над уровнем лучшей укладки."
       },
       "caption": {
        "en": "The dual bound of the knapsack as a piecewise linear function of the price, above the level of the best packing.",
        "ru": "Двойственная оценка рюкзака как кусочно-линейная функция цены над уровнем лучшей укладки."
       }
      },
      "takeaway": {
       "en": "Strong duality is a property of convex problems. For an integer problem the Lagrangian dual is still a valid bound, and the gap is exactly what branch and bound has to close.",
       "ru": "Сильная двойственность — свойство выпуклых задач. Для целочисленной задачи лагранжева двойственная всё равно даёт верную оценку, а зазор — ровно то, что предстоит закрыть методу ветвей и границ."
      }
     },
     {
      "title": {
       "en": "Rounding the relaxation",
       "ru": "Округление релаксации"
      },
      "text": {
       "en": "Maximize $y$ over integer points with $2y-2x\\le1$, $2y+2x\\le7$ and $y\\ge0$. The LP optimum is ${{demo.round.lp}}$ with $y={{demo.round.ylp}}$. Both ways of rounding $x$ keep $y={{demo.round.ylp}}$ and break one of the constraints, and the integer optimum is only $y={{demo.round.yip}}$.",
       "ru": "Максимизируем $y$ по целым точкам при $2y-2x\\le1$, $2y+2x\\le7$ и $y\\ge0$. Оптимум LP — ${{demo.round.lp}}$, где $y={{demo.round.ylp}}$. Оба способа округлить $x$ оставляют $y={{demo.round.ylp}}$ и нарушают одно из ограничений, а целочисленный оптимум — всего лишь $y={{demo.round.yip}}$."
      },
      "takeaway": {
       "en": "The relaxation is a bound, not a solution. Rounding is a heuristic: check that the rounded point is feasible and compare its value with the bound before trusting it.",
       "ru": "Релаксация — это оценка, а не решение. Округление — эвристика: проверьте допустимость округлённой точки и сравните её значение с оценкой, прежде чем ей доверять."
      }
     },
     {
      "title": {
       "en": "Too big an M",
       "ru": "Слишком большое M"
      },
      "text": {
       "en": "One plant with fixed cost $F={{demo.bigm.F}}$, unit cost $c={{demo.bigm.c}}$ and capacity $u={{demo.bigm.u}}$ has to deliver $D={{demo.bigm.D}}$ units; the true cost is ${{demo.bigm.ip}}$. In the relaxation the constraint $x\\le Mz$ only asks for $z\\ge D/M$, so the fixed cost enters as $FD/M$. For $M={{demo.bigm.Ms}}$ the bounds are ${{demo.bigm.bounds}}$: the larger $M$, the more the relaxation forgets the fixed cost.",
       "ru": "Один завод с постоянными затратами $F={{demo.bigm.F}}$, ценой единицы $c={{demo.bigm.c}}$ и мощностью $u={{demo.bigm.u}}$ должен поставить $D={{demo.bigm.D}}$ единиц; настоящая стоимость равна ${{demo.bigm.ip}}$. В релаксации ограничение $x\\le Mz$ требует лишь $z\\ge D/M$, и постоянные затраты входят как $FD/M$. При $M={{demo.bigm.Ms}}$ оценки равны ${{demo.bigm.bounds}}$: чем больше $M$, тем сильнее релаксация забывает о постоянных затратах."
      },
      "figure": {
       "src": "fig_bigm",
       "alt": {
        "en": "The LP bound of the fixed-charge model against M on a log scale, falling away from the integer optimum.",
        "ru": "Оценка LP для модели с постоянными затратами в зависимости от M в логарифмической шкале: она уходит вниз от целочисленного оптимума."
       },
       "caption": {
        "en": "The LP bound of the fixed-charge model against M on a log scale, falling away from the integer optimum.",
        "ru": "Оценка LP для модели с постоянными затратами в зависимости от M в логарифмической шкале: она уходит вниз от целочисленного оптимума."
       }
      },
      "takeaway": {
       "en": "Take the smallest $M$ that is still valid, here the capacity. A huge $M$ also mixes very different magnitudes in one row, and the solver's tolerances start to bite.",
       "ru": "Берите наименьшее $M$, которое ещё верно, здесь — мощность. Огромное $M$ к тому же смешивает в одной строке числа очень разного порядка, и допуски солвера начинают мешать."
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
        "en": "An inequality constraint is inactive at the solution. What is its multiplier, and which KKT condition says so?",
        "ru": "Ограничение-неравенство неактивно в решении. Чему равен его множитель и какое из условий ККТ это утверждает?"
       }
      },
      {
       "question": {
        "en": "A constraint $g(x)\\le b$ has $\\lambda^*={{exit.lam}}$, and $b$ grows by ${{exit.db}}$. How does the optimal value change, approximately?",
        "ru": "У ограничения $g(x)\\le b$ множитель $\\lambda^*={{exit.lam}}$, а $b$ увеличили на ${{exit.db}}$. Как примерно изменится оптимальное значение?"
       }
      },
      {
       "question": {
        "en": "A minimization with integer variables: the LP relaxation gives ${{exit.lp}}$, and the best integer point found so far costs ${{exit.inc}}$. Where is the optimum, and how large is the gap?",
        "ru": "Задача минимизации с целыми переменными: LP-релаксация даёт ${{exit.lp}}$, а лучшая найденная целая точка стоит ${{exit.inc}}$. Где лежит оптимум и каков зазор?"
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
      "en": "Write the checks with NumPy and use SciPy as the independent solver. Every function returns the point, the objective and the multipliers or the bound, so that the numbers can be compared with the hand solutions.",
      "ru": "Пишите проверки в NumPy, а SciPy используйте как независимый решатель. Каждая функция возвращает точку, значение цели и множители или оценку, чтобы числа можно было сравнить с ручными решениями."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "A KKT audit",
        "ru": "Проверка условий ККТ"
       },
       "statement": {
        "en": "Write `kkt_audit(x, lam, nu)` that returns the residuals of stationarity, primal feasibility, dual feasibility and complementary slackness, and the active set for a stated tolerance. Run it on the hand solutions of A1 and A2 and on the output of `scipy.optimize.minimize(method='SLSQP')`, recovering the multipliers from stationarity. Explain why `success=True` and small residuals answer different questions.",
        "ru": "Напишите `kkt_audit(x, lam, nu)`, которая возвращает невязки стационарности, допустимости, неотрицательности множителей и дополняющей нежёсткости, а также активное множество при заданном допуске. Запустите её на ручных решениях A1 и A2 и на результате `scipy.optimize.minimize(method='SLSQP')`, восстановив множители из стационарности. Объясните, почему `success=True` и малые невязки отвечают на разные вопросы."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "The dual function and the price of a constraint",
        "ru": "Двойственная функция и цена ограничения"
       },
       "statement": {
        "en": "For B2 derive $q(\\lambda)$ with SymPy, plot it together with the primal value and mark the dual maximizer. Then solve the primal on a grid of $b$, compare central differences of $p^*(b)$ with $-\\lambda^*(b)$, and find the $b$ at which the constraint stops binding.",
        "ru": "Для B2 выведите $q(\\lambda)$ в SymPy, постройте её вместе с прямым оптимумом и отметьте точку максимума. Затем решите прямую задачу на сетке значений $b$, сравните центральные разности $p^*(b)$ с $-\\lambda^*(b)$ и найдите $b$, при котором ограничение перестаёт быть активным."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "Integer models with SciPy",
        "ru": "Целочисленные модели в SciPy"
       },
       "statement": {
        "en": "Model C1 and C2 with `scipy.optimize.milp` and their relaxations with `scipy.optimize.linprog`. Check the hand answers, then vary $M$ in C2 from the capacity upwards and plot the relaxation bound. Add a third machine with the rule *the third machine only together with the first*, written as $z_3\\le z_1$.",
        "ru": "Запишите C1 и C2 через `scipy.optimize.milp`, а их релаксации — через `scipy.optimize.linprog`. Сверьте ответы с ручными, затем меняйте $M$ в C2 от мощности и выше и постройте график оценки релаксации. Добавьте третью машину с правилом *третья машина — только вместе с первой*, записанным как $z_3\\le z_1$."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
