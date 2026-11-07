// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 09 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. From relaxations to linear programs",
     "ru": "0. От релаксаций к линейным задачам"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "Last time a relaxation was solved by looking at the corners of a polygon, and every integer model began by dropping integrality. That step has to be fast, because a solver repeats it thousands of times. Today we open it up.",
      "ru": "В прошлый раз релаксацию мы решали, глядя на вершины многоугольника, и каждая целочисленная модель начиналась с отказа от целочисленности. Этот шаг должен быть быстрым: солвер повторяет его тысячи раз. Сегодня заглянем внутрь."
     },
     {
      "en": "A linear program is the tamest constrained problem: linear objective, linear constraints, convex feasible set. The KKT conditions are necessary and sufficient without any qualification, and strong duality holds whenever an optimum exists.",
      "ru": "Линейная задача — самая послушная из задач с ограничениями: линейная цель, линейные ограничения, выпуклое допустимое множество. Условия ККТ необходимы и достаточны без всяких условий регулярности, а сильная двойственность верна всякий раз, когда оптимум существует."
     },
     {
      "en": "The plan: the geometry of the feasible set and its algebra (basic solutions), the simplex method that walks along corners, and the dual, where the multipliers of seminar 8 return as shadow prices.",
      "ru": "План: геометрия допустимого множества и её алгебра (базисные решения), симплекс-метод, идущий по вершинам, и двойственная задача, где множители семинара 8 возвращаются как теневые цены."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. Geometry and standard form",
     "ru": "A. Геометрия и стандартная форма"
    },
    "short": {
     "en": "A. Geometry",
     "ru": "A. Геометрия"
    },
    "recap": [
     {
      "en": "The feasible set of $\\max c^{\\top}x$ subject to $Ax\\le b$, $x\\ge0$ is a polyhedron. The level sets $c^{\\top}x=z$ are parallel hyperplanes; slide one in the direction $c$ and the last contact contains a corner, if the problem has an optimum at all.",
      "ru": "Допустимое множество задачи $\\max c^{\\top}x$ при $Ax\\le b$, $x\\ge0$ — многогранник. Линии уровня $c^{\\top}x=z$ — параллельные гиперплоскости; если сдвигать такую плоскость в направлении $c$, последнее касание содержит вершину, если у задачи вообще есть оптимум."
     },
     {
      "en": "Standard form is $\\min c^{\\top}x$, $Ax=b$, $x\\ge0$. A row $\\le$ gets a slack, $a^{\\top}x+s=b$; a row $\\ge$ gets a surplus, $a^{\\top}x-s=b$; a free variable becomes $x^+-x^-$; a row with $b_i<0$ is multiplied by $-1$; a maximization is a minimization of $-c^{\\top}x$.",
      "ru": "Стандартная форма — это $\\min c^{\\top}x$, $Ax=b$, $x\\ge0$. Строка $\\le$ получает дополнительную переменную, $a^{\\top}x+s=b$; строка $\\ge$ — избыточную, $a^{\\top}x-s=b$; свободная переменная заменяется на $x^+-x^-$; строка с $b_i<0$ умножается на $-1$; максимизация — это минимизация $-c^{\\top}x$."
     },
     {
      "en": "With $m$ independent rows and $n$ columns, take $m$ independent columns as a basis $B$, set the other variables to zero and solve $Bx_B=b$. That is a basic solution; it is feasible when $x_B\\ge0$. Basic feasible solutions (BFS) are exactly the corners, and there are at most $\\binom{n}{m}$ of them.",
      "ru": "Если строк $m$ и они независимы, а столбцов $n$, возьмём $m$ независимых столбцов как базис $B$, остальные переменные обнулим и решим $Bx_B=b$. Это базисное решение; оно допустимо, если $x_B\\ge0$. Допустимые базисные решения — это в точности вершины, и их не больше $\\binom{n}{m}$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: every basic solution of a small LP",
      "ru": "Живой код: все базисные решения маленькой задачи"
     },
     "text": {
      "en": "The code goes through all choices of columns, marks the singular and the infeasible ones and draws the rest as corners. Change $b$ and watch a corner disappear.",
      "ru": "Код перебирает все наборы столбцов, отмечает вырожденные и недопустимые, а остальные рисует как вершины. Меняйте $b$ и смотрите, как исчезает вершина."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. The simplex method",
     "ru": "B. Симплекс-метод"
    },
    "short": {
     "en": "B. Simplex",
     "ru": "B. Симплекс"
    },
    "recap": [
     {
      "en": "A tableau is the system solved for the basic variables, with the objective as the last row: $z-c^{\\top}x=0$. Its entry $r_j$ under a nonbasic variable is the reduced cost: one more unit of $x_j$ changes $z$ by $-r_j$. So a negative entry means that raising this variable raises $z$.",
      "ru": "Таблица — это система, разрешённая относительно базисных переменных, с целью в последней строке: $z-c^{\\top}x=0$. Элемент $r_j$ под небазисной переменной — приведённая стоимость: лишняя единица $x_j$ меняет $z$ на $-r_j$. Поэтому отрицательный элемент значит, что рост этой переменной увеличивает $z$."
     },
     {
      "en": "One step: choose an entering column with a negative entry (Dantzig's rule takes the most negative one, Bland's rule the smallest index); among the rows with a positive entry in it take the smallest ratio of right-hand side to entry, which is how far the variable can rise; pivot on that entry. Geometrically, walk along an edge to the next corner.",
      "ru": "Один шаг: выбираем вводимый столбец с отрицательным элементом (правило Данцига берёт наиболее отрицательный, правило Бленда — с наименьшим индексом); среди строк с положительным элементом в этом столбце берём наименьшее отношение правой части к элементу — настолько можно увеличить переменную; делаем шаг с этим разрешающим элементом. Геометрически это проход по ребру к следующей вершине."
     },
     {
      "en": "Stop when the $z$-row has no negative entry: the point is optimal. If an entering column has no positive entry, nothing stops the variable and the LP is unbounded. If the origin is infeasible, Phase I minimizes a sum of artificial variables and either finds a first corner or shows that there is none.",
      "ru": "Останавливаемся, когда в $z$-строке нет отрицательных элементов: точка оптимальна. Если во вводимом столбце нет положительных элементов, переменную ничто не держит, и задача неограниченна. Если начало координат недопустимо, первая фаза минимизирует сумму искусственных переменных и либо находит первую вершину, либо показывает, что вершин нет."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: the tableau, pivot by pivot",
      "ru": "Живой код: таблица шаг за шагом"
     },
     "text": {
      "en": "A whole simplex method in NumPy: it prints each tableau and draws the path. Switch the entering rule to `bland` and compare the routes.",
      "ru": "Весь симплекс-метод на NumPy: печатает каждую таблицу и рисует путь. Переключите правило ввода на `bland` и сравните маршруты."
     }
    }
   },
   "C": {
    "title": {
     "en": "C. Duality and sensitivity",
     "ru": "C. Двойственность и чувствительность"
    },
    "short": {
     "en": "C. Duality",
     "ru": "C. Двойственность"
    },
    "recap": [
     {
      "en": "The dual of $\\max c^{\\top}x$, $Ax\\le b$, $x\\ge0$ is $\\min b^{\\top}y$, $A^{\\top}y\\ge c$, $y\\ge0$. Weak duality: $c^{\\top}x\\le y^{\\top}Ax\\le b^{\\top}y$ for any feasible pair, so any dual feasible $y$ bounds the optimum from above.",
      "ru": "Двойственная к $\\max c^{\\top}x$, $Ax\\le b$, $x\\ge0$ — это $\\min b^{\\top}y$, $A^{\\top}y\\ge c$, $y\\ge0$. Слабая двойственность: $c^{\\top}x\\le y^{\\top}Ax\\le b^{\\top}y$ для любой допустимой пары, поэтому любое допустимое $y$ оценивает оптимум сверху."
     },
     {
      "en": "Strong duality: if either problem has an optimum, both do, with equal values. Complementary slackness: at optimal $x,y$ we have $y_i(b-Ax)_i=0$ and $x_j(A^{\\top}y-c)_j=0$. A resource left over has price zero, and a product that is made earns exactly its cost in prices.",
      "ru": "Сильная двойственность: если у одной задачи есть оптимум, он есть у обеих, и значения равны. Дополняющая нежёсткость: в оптимальных $x,y$ выполнено $y_i(b-Ax)_i=0$ и $x_j(A^{\\top}y-c)_j=0$. У ресурса с остатком цена нулевая, а выпускаемый продукт приносит ровно свою стоимость в этих ценах."
     },
     {
      "en": "The optimal $y_i$ is the shadow price: $\\partial p^*/\\partial b_i=y_i$ while the basis stays the same. As a function of $b$ the optimal value of a maximization is concave and piecewise linear, and the prices are its slopes. The final tableau shows them under the slacks.",
      "ru": "Оптимальное $y_i$ — теневая цена: $\\partial p^*/\\partial b_i=y_i$, пока базис не меняется. Как функция $b$ оптимум задачи максимизации вогнут и кусочно-линеен, а цены — его наклоны. В последней таблице они стоят под дополнительными переменными."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: the optimal value as a function of a resource",
      "ru": "Живой код: оптимум как функция ресурса"
     },
     "text": {
      "en": "Sweep one right-hand side, solve the LP at every value and plot $p^*(b)$ with its slope. The kinks are the points where the basis changes.",
      "ru": "Меняем одну правую часть, решаем задачу при каждом значении и строим $p^*(b)$ с наклоном. Изломы — точки, где меняется базис."
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
     "en": "Four ways in which an LP or the simplex method stops behaving.",
     "ru": "Четыре случая, когда задача или симплекс-метод перестают вести себя хорошо."
    },
    "demos": [
     {
      "title": {
       "en": "No upper limit",
       "ru": "Нет верхнего предела"
      },
      "text": {
       "en": "Maximize $x+y$ subject to $x-y\\le1$, $-x+y\\le1$, $x,y\\ge0$. One pivot gives $${{demo.unb.t1}}$$ The column of $y$ has a negative $z$-entry and no positive entry: no row stops $y$. Indeed $x=1+t$, $y=t$ stays feasible for every $t\\ge0$ while $z=1+2t$ grows. `linprog` answers with `status` {{demo.unb.status}}.",
       "ru": "Максимизируем $x+y$ при $x-y\\le1$, $-x+y\\le1$, $x,y\\ge0$. Один шаг даёт $${{demo.unb.t1}}$$ В столбце $y$ отрицательный элемент $z$-строки и ни одного положительного: строки $y$ не держат. Действительно, $x=1+t$, $y=t$ допустимы при всех $t\\ge0$, а $z=1+2t$ растёт. `linprog` отвечает `status` {{demo.unb.status}}."
      },
      "takeaway": {
       "en": "In a real model an unbounded LP almost always means a forgotten constraint, not infinite profit. Build the ray by hand: it shows which resource the model thinks is free.",
       "ru": "В настоящей модели неограниченная задача почти всегда означает забытое ограничение, а не бесконечную прибыль. Постройте луч сами: он покажет, какой ресурс модель считает бесплатным."
      }
     },
     {
      "title": {
       "en": "No feasible point",
       "ru": "Нет допустимых точек"
      },
      "text": {
       "en": "Ask for $x+y\\le{{demo.inf.b.1}}$ and $x+y\\ge{{demo.inf.b.2}}$ with $x,y\\ge0$. Phase I stops at an optimum with the artificial variable still equal to ${{demo.inf.a}}$, so no feasible point exists. The dual gives a proof: write the second row as $-x-y\\le-{{demo.inf.b.2}}$ and add the rows with weights $y=(1,1)$. The left side vanishes and we are left with $0\\le{{demo.inf.sum}}$. `linprog` answers with `status` {{demo.inf.status}}.",
       "ru": "Потребуем $x+y\\le{{demo.inf.b.1}}$ и $x+y\\ge{{demo.inf.b.2}}$ при $x,y\\ge0$. Первая фаза останавливается в оптимуме, где искусственная переменная всё ещё равна ${{demo.inf.a}}$, значит, допустимых точек нет. Двойственная задача даёт доказательство: запишем вторую строку как $-x-y\\le-{{demo.inf.b.2}}$ и сложим строки с весами $y=(1,1)$. Левая часть исчезает, и остаётся $0\\le{{demo.inf.sum}}$. `linprog` отвечает `status` {{demo.inf.status}}."
      },
      "takeaway": {
       "en": "Infeasibility has a certificate: weights that turn the rows into a contradiction (Farkas' lemma). They also point at the rows that fight each other, which is where to look in a large model.",
       "ru": "У несовместности есть сертификат: веса, превращающие строки в противоречие (лемма Фаркаша). Они же указывают на строки, которые спорят друг с другом, и именно туда стоит смотреть в большой модели."
      }
     },
     {
      "title": {
       "en": "Pivots that go nowhere",
       "ru": "Шаги, которые никуда не ведут"
      },
      "text": {
       "en": "If a basic variable equals zero, the ratio test can return zero: the basis changes, the point does not. This is degeneracy, and it can loop. Beale's example minimizes ${{demo.cycle.c}}^{\\top}x$ subject to ${{demo.cycle.A}}x+s={{demo.cycle.b}}$, $x,s\\ge0$. With Dantzig's rule and the smallest index among ties, the tableau returns to the start after {{demo.cycle.period}} pivots, all at $z=0$, and never stops. Bland's rule (smallest index for entering and for leaving) reaches the optimum ${{demo.cycle.opt}}$ in {{demo.cycle.bland}} pivots.",
       "ru": "Если базисная переменная равна нулю, тест отношений может дать ноль: базис меняется, а точка нет. Это вырожденность, и она может зациклить метод. В примере Била минимизируется ${{demo.cycle.c}}^{\\top}x$ при ${{demo.cycle.A}}x+s={{demo.cycle.b}}$, $x,s\\ge0$. С правилом Данцига и наименьшим индексом при ничьей таблица через {{demo.cycle.period}} шагов возвращается к началу, всё время при $z=0$, и метод не останавливается. Правило Бленда (наименьший индекс и для входа, и для выхода) приходит к оптимуму ${{demo.cycle.opt}}$ за {{demo.cycle.bland}} шагов."
      },
      "takeaway": {
       "en": "Degenerate corners are common in practice, true cycling is rare, and it is one reason why solvers perturb the right-hand side a little. A pivot that does not improve $z$ is not an error.",
       "ru": "Вырожденные вершины на практике обычны, настоящее зацикливание редко, и это одна из причин, по которым солверы слегка возмущают правые части. Шаг, не улучшающий $z$, — не ошибка."
      }
     },
     {
      "title": {
       "en": "A long way round",
       "ru": "Долгая дорога"
      },
      "text": {
       "en": "The Klee–Minty problem is a slightly squashed cube in $n$ dimensions: maximize $\\sum_j2^{n-j}x_j$ subject to $2\\sum_{j< i}2^{i-j}x_j+x_i\\le5^i$, $x\\ge0$. Dantzig's rule visits every one of its $2^n$ corners: for $n={{demo.km.shownN}}$ the numbers of pivots are ${{demo.km.shownP}}$. On random problems of the same sizes the averages are ${{demo.km.shownR}}$.",
       "ru": "Задача Кли — Минти — слегка сплющенный куб размерности $n$: максимизировать $\\sum_j2^{n-j}x_j$ при $2\\sum_{j< i}2^{i-j}x_j+x_i\\le5^i$, $x\\ge0$. Правило Данцига проходит все $2^n$ вершин: при $n={{demo.km.shownN}}$ число шагов равно ${{demo.km.shownP}}$. На случайных задачах тех же размеров средние равны ${{demo.km.shownR}}$."
      },
      "figure": {
       "src": "fig_km",
       "alt": {
        "en": "Pivots against the dimension on a log scale: the Klee–Minty line roughly doubles with each dimension, random problems stay low.",
        "ru": "Число шагов в зависимости от размерности в логарифмической шкале: линия Кли — Минти примерно удваивается с каждой размерностью, случайные задачи остаются внизу."
       },
       "caption": {
        "en": "Pivots against the dimension on a log scale: the Klee–Minty line roughly doubles with each dimension, random problems stay low.",
        "ru": "Число шагов в зависимости от размерности в логарифмической шкале: линия Кли — Минти примерно удваивается с каждой размерностью, случайные задачи остаются внизу."
       }
      },
      "takeaway": {
       "en": "The worst case is exponential and the typical case is a small multiple of the number of rows. LP itself is polynomial, by ellipsoid and interior-point methods; solvers keep both simplex and interior point for good reason.",
       "ru": "Худший случай экспоненциален, а типичный — небольшое кратное числа строк. Сама задача ЛП полиномиальна: это показывают метод эллипсоидов и методы внутренней точки; солверы не зря держат и симплекс-метод, и методы внутренней точки."
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
        "en": "A standard form has $m={{exit.m}}$ rows and $n={{exit.n}}$ columns. At most how many basic solutions can it have, and why may there be fewer?",
        "ru": "В стандартной форме $m={{exit.m}}$ строк и $n={{exit.n}}$ столбцов. Сколько базисных решений может быть самое большее и почему их бывает меньше?"
       }
      },
      {
       "question": {
        "en": "In an optimal tableau a nonbasic variable has a zero in the $z$-row. What does that tell you about the optimum?",
        "ru": "В оптимальной таблице у небазисной переменной в $z$-строке стоит ноль. Что это говорит об оптимуме?"
       }
      },
      {
       "question": {
        "en": "A feasible plan earns ${{exit.low}}$, and a feasible dual $y$ has value ${{exit.high}}$. A resource has shadow price ${{exit.price}}$ and its limit grows by ${{exit.db}}$ inside its range. Where is the optimum, and how does it change?",
        "ru": "Допустимый план приносит ${{exit.low}}$, а допустимое двойственное $y$ имеет значение ${{exit.high}}$. У ресурса теневая цена ${{exit.price}}$, и его предел вырос на ${{exit.db}}$, не выйдя из диапазона. Где лежит оптимум и как он изменится?"
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
      "en": "Use NumPy for your own code and `scipy.optimize.linprog` as the independent solver, so that the numbers can be compared with the hand solutions.",
      "ru": "Свой код пишите на NumPy, а `scipy.optimize.linprog` используйте как независимый решатель, чтобы числа можно было сравнить с ручными решениями."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "A tableau simplex",
        "ru": "Табличный симплекс-метод"
       },
       "statement": {
        "en": "Take the `simplex` of the live cell in block B and extend it. Add Phase I, so that a right-hand side may be negative; keep the list of bases it went through; stop with a message when a basis repeats. Check it on B3 against the hand tableaux and against `linprog`, then run Beale's example from block D with both entering rules.",
        "ru": "Возьмите `simplex` из живой ячейки блока B и расширьте её. Добавьте первую фазу, чтобы правая часть могла быть отрицательной; сохраняйте список пройденных базисов; останавливайтесь с сообщением, когда базис повторился. Проверьте её на B3 по ручным таблицам и по `linprog`, затем запустите пример Била из блока D с обоими правилами ввода."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "Prices from a solver",
        "ru": "Цены из солвера"
       },
       "statement": {
        "en": "Solve C3 with `linprog(method='highs')` and read `res.ineqlin.marginals`. `linprog` minimizes, so work out the sign that turns them into the prices of the maximization. Sweep $b_1$ on a grid, plot $p^*(b_1)$ and the marginal, and find the kinks. Then solve the dual as its own LP and check that the values agree.",
        "ru": "Решите C3 через `linprog(method='highs')` и прочитайте `res.ineqlin.marginals`. `linprog` минимизирует, поэтому выясните, какой знак превращает их в цены задачи максимизации. Пройдите по сетке значений $b_1$, постройте $p^*(b_1)$ и маргинальные значения и найдите изломы. Затем решите двойственную задачу как отдельную и проверьте, что значения совпадают."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "What the solver says",
        "ru": "Что говорит солвер"
       },
       "statement": {
        "en": "Build three small LPs: one optimal, one infeasible, one unbounded. Print `status` and `message` of `linprog` for each. For the infeasible one, find a Farkas certificate by solving an auxiliary LP and check it. Then take the Klee–Minty problem for growing $n$ and compare the number of pivots of your `simplex` with `res.nit`.",
        "ru": "Постройте три маленькие задачи: с оптимумом, несовместную и неограниченную. Выведите `status` и `message` функции `linprog` для каждой. Для несовместной найдите сертификат Фаркаша, решив вспомогательную задачу, и проверьте его. Затем возьмите задачу Кли — Минти при растущем $n$ и сравните число шагов вашей `simplex` с `res.nit`."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
