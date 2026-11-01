// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 08 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Four guesses for the active set",
    "ru": "Четыре варианта активного множества"
   },
   "statement": {
    "en": "Minimize $f(x,y)=(x-3)^2+2(y-2)^2$ subject to $g_1=x+y-2\\le0$ and $g_2=-y\\le0$. Go through all four active sets, find the KKT point and its multipliers, and give the first coordinate of $x^*$, $\\lambda_1^*$ and $f(x^*)$.",
    "ru": "Минимизируйте $f(x,y)=(x-3)^2+2(y-2)^2$ при $g_1=x+y-2\\le0$ и $g_2=-y\\le0$. Переберите все четыре активных множества, найдите точку ККТ и её множители и укажите первую координату $x^*$, $\\lambda_1^*$ и $f(x^*)$."
   },
   "answers": [
    {
     "id": "x1",
     "ref": "answers.A1.x1",
     "label": {
      "en": "First coordinate of $x^*$",
      "ru": "Первая координата $x^*$"
     }
    },
    {
     "id": "lam1",
     "ref": "answers.A1.lam1",
     "label": {
      "en": "$\\lambda_1^*$",
      "ru": "$\\lambda_1^*$"
     }
    },
    {
     "id": "f",
     "ref": "answers.A1.f",
     "label": {
      "en": "$f(x^*)$",
      "ru": "$f(x^*)$"
     }
    }
   ],
   "hints": [
    {
     "en": "Stationarity reads $2(x-3)+\\lambda_1=0$ and $4(y-2)+\\lambda_1-\\lambda_2=0$.",
     "ru": "Стационарность: $2(x-3)+\\lambda_1=0$ и $4(y-2)+\\lambda_1-\\lambda_2=0$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "No active constraint: the unconstrained minimizer ${{A1.unc}}$ has $g_1={{A1.uncG1}}>0$, so it is infeasible and at least one constraint binds.",
      "ru": "Ни одно ограничение не активно: безусловный минимум ${{A1.unc}}$ даёт $g_1={{A1.uncG1}}>0$ — точка недопустима, и хотя бы одно ограничение выполняется как равенство."
     }
    },
    {
     "text": {
      "en": "Only $g_2$ active: $y=0$, $\\lambda_1=0$, and the first equation gives $x=3$; the point ${{A1.only2}}$ has $g_1={{A1.only2G1}}>0$ and is rejected. Both active: $x+y=2$ and $y=0$ give ${{A1.both}}$, and stationarity gives $\\lambda={{A1.bothLam}}$. A negative multiplier means that the floor $y\\ge0$ pushes the point the wrong way: rejected.",
      "ru": "Активно только $g_2$: $y=0$, $\\lambda_1=0$, и первое уравнение даёт $x=3$; в точке ${{A1.only2}}$ имеем $g_1={{A1.only2G1}}>0$ — отбрасываем. Активны оба: из $x+y=2$ и $y=0$ получаем ${{A1.both}}$, а стационарность даёт $\\lambda={{A1.bothLam}}$. Отрицательный множитель означает, что ограничение $y\\ge0$ толкает точку не в ту сторону, — отбрасываем."
     }
    },
    {
     "text": {
      "en": "Only $g_1$ active, $\\lambda_2=0$: $x=3-\\lambda_1/2$, $y=2-\\lambda_1/4$, and $x+y=2$ gives $5-3\\lambda_1/4=2$, so $\\lambda_1={{A1.lam.1}}$. The candidate is $x^*={{A1.only1}}$ with $\\lambda^*={{A1.lam}}$; $y^*>0$, so $g_2$ is indeed inactive.",
      "ru": "Активно только $g_1$, $\\lambda_2=0$: $x=3-\\lambda_1/2$, $y=2-\\lambda_1/4$, и из $x+y=2$ получаем $5-3\\lambda_1/4=2$, то есть $\\lambda_1={{A1.lam.1}}$. Кандидат — $x^*={{A1.only1}}$ с $\\lambda^*={{A1.lam}}$; $y^*>0$, значит, $g_2$ действительно неактивно."
     }
    },
    {
     "text": {
      "en": "At $x^*$ the gradient is $\\nabla f={{A1.grad}}=-\\lambda_1^*\\nabla g_1$: minus the gradient points straight out through the line $x+y=2$. The problem is convex, so the KKT point is the global minimizer, and $f(x^*)={{A1.f}}$.",
      "ru": "В точке $x^*$ градиент $\\nabla f={{A1.grad}}=-\\lambda_1^*\\nabla g_1$: антиградиент смотрит прямо наружу через прямую $x+y=2$. Задача выпуклая, поэтому точка ККТ — глобальный минимум, и $f(x^*)={{A1.f}}$."
     }
    }
   ],
   "answerText": {
    "en": "$x^*={{A1.only1}}$, $\\lambda^*={{A1.lam}}$, $f(x^*)={{A1.f}}$.",
    "ru": "$x^*={{A1.only1}}$, $\\lambda^*={{A1.lam}}$, $f(x^*)={{A1.f}}$."
   },
   "review": {
    "en": "The case table is the whole method: guess, solve, reject on feasibility or on the sign of a multiplier. Convexity turns the survivor into the global answer.",
    "ru": "Таблица случаев — это и есть весь метод: угадать, решить, отбросить по допустимости или по знаку множителя. Выпуклость превращает выжившего кандидата в глобальный ответ."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_a1",
    "alt": {
     "en": "The feasible set, level curves of f, the KKT point and minus the gradient along the normal of the active constraint.",
     "ru": "Допустимое множество, линии уровня f, точка ККТ и антиградиент вдоль нормали активного ограничения."
    },
    "caption": {
     "en": "The feasible set, level curves of f, the KKT point and minus the gradient along the normal of the active constraint.",
     "ru": "Допустимое множество, линии уровня f, точка ККТ и антиградиент вдоль нормали активного ограничения."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "Three constraints",
    "ru": "Три ограничения"
   },
   "statement": {
    "en": "Minimize $f(x,y)=3(x-5)^2+(y-2)^2$ subject to $g_1=x-{{A2.params.u}}\\le0$, $g_2=x+y-{{A2.params.s}}\\le0$ and $g_3=-y\\le0$. Find the KKT point, the active set and all three multipliers. Give $\\lambda_1^*$, $\\lambda_2^*$ and $f(x^*)$.",
    "ru": "Минимизируйте $f(x,y)=3(x-5)^2+(y-2)^2$ при $g_1=x-{{A2.params.u}}\\le0$, $g_2=x+y-{{A2.params.s}}\\le0$ и $g_3=-y\\le0$. Найдите точку ККТ, активное множество и все три множителя. Укажите $\\lambda_1^*$, $\\lambda_2^*$ и $f(x^*)$."
   },
   "answers": [
    {
     "id": "lam1",
     "ref": "answers.A2.lam1",
     "label": {
      "en": "$\\lambda_1^*$",
      "ru": "$\\lambda_1^*$"
     }
    },
    {
     "id": "lam2",
     "ref": "answers.A2.lam2",
     "label": {
      "en": "$\\lambda_2^*$",
      "ru": "$\\lambda_2^*$"
     }
    },
    {
     "id": "f",
     "ref": "answers.A2.f",
     "label": {
      "en": "$f(x^*)$",
      "ru": "$f(x^*)$"
     }
    }
   ]
  },
  "A3": {
   "who": "students",
   "title": {
    "en": "A linear objective on a disk",
    "ru": "Линейная цель на круге"
   },
   "statement": {
    "en": "Minimize $x+2y$ subject to $x^2+y^2\\le{{A3.params.r2}}$. Explain why the minimizer lies on the boundary, find it from the KKT conditions and check that it is global. Give $y^*$, $\\lambda^*$ and $f(x^*)$.",
    "ru": "Минимизируйте $x+2y$ при $x^2+y^2\\le{{A3.params.r2}}$. Объясните, почему минимум лежит на границе, найдите его из условий ККТ и проверьте, что он глобальный. Укажите $y^*$, $\\lambda^*$ и $f(x^*)$."
   },
   "answers": [
    {
     "id": "y",
     "ref": "answers.A3.y",
     "label": {
      "en": "$y^*$",
      "ru": "$y^*$"
     }
    },
    {
     "id": "lam",
     "ref": "answers.A3.lam",
     "label": {
      "en": "$\\lambda^*$",
      "ru": "$\\lambda^*$"
     }
    },
    {
     "id": "f",
     "ref": "answers.A3.f",
     "label": {
      "en": "$f(x^*)$",
      "ru": "$f(x^*)$"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "A dual function by hand",
    "ru": "Двойственная функция вручную"
   },
   "statement": {
    "en": "Minimize $x^2+3y^2$ subject to $x+y\\ge{{B1.params.b}}$. Write the constraint as $g\\le0$, find the dual function $q(\\lambda)$, maximize it and compare $d^*$ with $p^*$. Then treat the right-hand side $b$ as a parameter and find $dp^*/db$ at $b={{B1.params.b}}$. Give $\\lambda^*$, $d^*$ and $dp^*/db$.",
    "ru": "Минимизируйте $x^2+3y^2$ при $x+y\\ge{{B1.params.b}}$. Запишите ограничение в виде $g\\le0$, найдите двойственную функцию $q(\\lambda)$, максимизируйте её и сравните $d^*$ с $p^*$. Затем считайте правую часть $b$ параметром и найдите $dp^*/db$ при $b={{B1.params.b}}$. Укажите $\\lambda^*$, $d^*$ и $dp^*/db$."
   },
   "answers": [
    {
     "id": "lam",
     "ref": "answers.B1.lam",
     "label": {
      "en": "$\\lambda^*$",
      "ru": "$\\lambda^*$"
     }
    },
    {
     "id": "d",
     "ref": "answers.B1.d",
     "label": {
      "en": "$d^*$",
      "ru": "$d^*$"
     }
    },
    {
     "id": "slope",
     "ref": "answers.B1.slope",
     "label": {
      "en": "$dp^*/db$",
      "ru": "$dp^*/db$"
     }
    }
   ],
   "hints": [
    {
     "en": "For a fixed $\\lambda$ the Lagrangian is a convex quadratic in $(x,y)$; set both partial derivatives to zero.",
     "ru": "При фиксированном $\\lambda$ лагранжиан — выпуклая квадратичная функция от $(x,y)$; приравняйте обе частные производные к нулю."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "$g=b-x-y\\le0$ and $L=x^2+3y^2+\\lambda(b-x-y)$. From $2x-\\lambda=0$ and $6y-\\lambda=0$ the minimizer over $(x,y)$ is $x=\\lambda/2$, $y=\\lambda/6$.",
      "ru": "$g=b-x-y\\le0$ и $L=x^2+3y^2+\\lambda(b-x-y)$. Из $2x-\\lambda=0$ и $6y-\\lambda=0$ минимум по $(x,y)$ достигается при $x=\\lambda/2$, $y=\\lambda/6$."
     }
    },
    {
     "text": {
      "en": "Substituting, $q(\\lambda)=\\lambda^2/4+3(\\lambda/6)^2+\\lambda(4-2\\lambda/3)=4\\lambda-\\lambda^2/3$, a concave parabola. Its maximum over $\\lambda\\ge0$ is where $q'(\\lambda)=4-2\\lambda/3=0$: $\\lambda^*={{B1.lam}}$ and $d^*={{B1.d}}$.",
      "ru": "Подставляем: $q(\\lambda)=\\lambda^2/4+3(\\lambda/6)^2+\\lambda(4-2\\lambda/3)=4\\lambda-\\lambda^2/3$ — вогнутая парабола. Её максимум при $\\lambda\\ge0$ там, где $q'(\\lambda)=4-2\\lambda/3=0$: $\\lambda^*={{B1.lam}}$, $d^*={{B1.d}}$."
     }
    },
    {
     "text": {
      "en": "The primal point comes from the same formulas, $(x^*,y^*)={{B1.x}}$; it satisfies $x+y=4$ and gives $p^*={{B1.p}}=d^*$. There is no gap, as Slater promises: the point $(4,4)$ is strictly feasible.",
      "ru": "Прямая точка получается из тех же формул: $(x^*,y^*)={{B1.x}}$; она удовлетворяет $x+y=4$ и даёт $p^*={{B1.p}}=d^*$. Зазора нет, как и обещает условие Слейтера: точка $(4,4)$ строго допустима."
     }
    },
    {
     "text": {
      "en": "For a general $b$ the same steps give $\\lambda^*=3b/2$ and $p^*(b)={{B1.pb}}\\,b^2$, so $dp^*/db={{B1.slope}}$ at $b=4$, which is $\\lambda^*$. The sign is plus because $x+y\\ge b$ reads $-x-y\\le-b$: raising $b$ tightens the constraint, and each unit costs $\\lambda^*$.",
      "ru": "Для произвольного $b$ те же шаги дают $\\lambda^*=3b/2$ и $p^*(b)={{B1.pb}}\\,b^2$, так что при $b=4$ имеем $dp^*/db={{B1.slope}}$ — ровно $\\lambda^*$. Знак плюс, потому что $x+y\\ge b$ — это $-x-y\\le-b$: рост $b$ ужесточает ограничение, и каждая единица стоит $\\lambda^*$."
     }
    }
   ],
   "answerText": {
    "en": "$\\lambda^*={{B1.lam}}$, $d^*=p^*={{B1.d}}$, $dp^*/db={{B1.slope}}$.",
    "ru": "$\\lambda^*={{B1.lam}}$, $d^*=p^*={{B1.d}}$, $dp^*/db={{B1.slope}}$."
   },
   "review": {
    "en": "The dual is found by minimizing over $x$ first. The multiplier that maximizes it is the KKT multiplier, and it is also the slope of the optimal value.",
    "ru": "Двойственную функцию находят, минимизируя сначала по $x$. Множитель, на котором она максимальна, — это множитель ККТ, и он же — наклон оптимального значения."
   },
   "mistakes": []
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "What one more unit of the resource is worth",
    "ru": "Сколько стоит ещё единица ресурса"
   },
   "statement": {
    "en": "Minimize $(x-4)^2+(y-3)^2$ subject to $x+2y\\le b$ with $b={{B2.params.b}}$. Find $q(\\lambda)$ and its maximizer, then the primal solution. Predict $p^*$ for $b+{{B2.params.db}}$ from the multiplier, then compute it exactly. Give $\\lambda^*$, $p^*$ and the exact $p^*$ at the new $b$.",
    "ru": "Минимизируйте $(x-4)^2+(y-3)^2$ при $x+2y\\le b$, $b={{B2.params.b}}$. Найдите $q(\\lambda)$ и точку её максимума, затем решение прямой задачи. Предскажите $p^*$ при $b+{{B2.params.db}}$ по множителю, а потом вычислите его точно. Укажите $\\lambda^*$, $p^*$ и точное $p^*$ при новом $b$."
   },
   "answers": [
    {
     "id": "lam",
     "ref": "answers.B2.lam",
     "label": {
      "en": "$\\lambda^*$",
      "ru": "$\\lambda^*$"
     }
    },
    {
     "id": "p",
     "ref": "answers.B2.p",
     "label": {
      "en": "$p^*$",
      "ru": "$p^*$"
     }
    },
    {
     "id": "pNew",
     "ref": "answers.B2.pNew",
     "label": {
      "en": "$p^*$ at the new $b$",
      "ru": "$p^*$ при новом $b$"
     }
    }
   ]
  },
  "B3": {
   "who": "students",
   "title": {
    "en": "An equality and a free multiplier",
    "ru": "Равенство и свободный множитель"
   },
   "statement": {
    "en": "Minimize $x^2+2y^2$ subject to $h=x+y-{{B3.params.s}}=0$. Find the dual function $q(\\nu)$, maximize it over all $\\nu\\in\\mathbb R$ and recover the primal point. Give $\\nu^*$, $d^*$ and $x^*$.",
    "ru": "Минимизируйте $x^2+2y^2$ при $h=x+y-{{B3.params.s}}=0$. Найдите двойственную функцию $q(\\nu)$, максимизируйте её по всем $\\nu\\in\\mathbb R$ и восстановите прямую точку. Укажите $\\nu^*$, $d^*$ и $x^*$."
   },
   "answers": [
    {
     "id": "nu",
     "ref": "answers.B3.nu",
     "label": {
      "en": "$\\nu^*$",
      "ru": "$\\nu^*$"
     }
    },
    {
     "id": "d",
     "ref": "answers.B3.d",
     "label": {
      "en": "$d^*$",
      "ru": "$d^*$"
     }
    },
    {
     "id": "x",
     "ref": "answers.B3.x",
     "label": {
      "en": "$x^*$",
      "ru": "$x^*$"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "Chairs and tables",
    "ru": "Стулья и столы"
   },
   "statement": {
    "en": "A workshop makes chairs and tables. A chair brings a profit of ${{C1.params.profit.1}}$, a table ${{C1.params.profit.2}}$. A chair takes ${{C1.params.A.1.1}}$ hour of labour and ${{C1.params.A.2.1}}$ units of wood, a table ${{C1.params.A.1.2}}$ hours and ${{C1.params.A.2.2}}$ unit. There are ${{C1.params.b.1}}$ hours and ${{C1.params.b.2}}$ units of wood. Write the integer model, solve its LP relaxation, round the LP solution and find the integer optimum. Give $z_{LP}$, $z_{IP}$ and the number of chairs in the integer optimum.",
    "ru": "Мастерская делает стулья и столы. Стул приносит прибыль ${{C1.params.profit.1}}$, стол — ${{C1.params.profit.2}}$. На стул уходит ${{C1.params.A.1.1}}$ час работы и ${{C1.params.A.2.1}}$ единицы древесины, на стол — ${{C1.params.A.1.2}}$ часа и ${{C1.params.A.2.2}}$ единица. Есть ${{C1.params.b.1}}$ часов и ${{C1.params.b.2}}$ единиц древесины. Запишите целочисленную модель, решите её LP-релаксацию, округлите решение LP и найдите целочисленный оптимум. Укажите $z_{LP}$, $z_{IP}$ и число стульев в целочисленном оптимуме."
   },
   "answers": [
    {
     "id": "zlp",
     "ref": "answers.C1.zlp",
     "label": {
      "en": "$z_{LP}$",
      "ru": "$z_{LP}$"
     }
    },
    {
     "id": "zip",
     "ref": "answers.C1.zip",
     "label": {
      "en": "$z_{IP}$",
      "ru": "$z_{IP}$"
     }
    },
    {
     "id": "xip",
     "ref": "answers.C1.xip",
     "label": {
      "en": "Chairs in the integer optimum",
      "ru": "Стульев в целочисленном оптимуме"
     }
    }
   ],
   "hints": [
    {
     "en": "With two variables the LP optimum is at a vertex of the polygon, and there are only a few lattice points to check.",
     "ru": "С двумя переменными оптимум LP лежит в вершине многоугольника, а точек решётки, которые нужно проверить, немного."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Let $x$ be the number of chairs and $y$ the number of tables. Maximize $5x+4y$ subject to $x+3y\\le{{C1.params.b.1}}$ (labour), $4x+y\\le{{C1.params.b.2}}$ (wood), $x,y\\ge0$ and $x,y\\in\\mathbb Z$.",
      "ru": "Пусть $x$ — число стульев, $y$ — число столов. Максимизируем $5x+4y$ при $x+3y\\le{{C1.params.b.1}}$ (работа), $4x+y\\le{{C1.params.b.2}}$ (древесина), $x,y\\ge0$ и $x,y\\in\\mathbb Z$."
     }
    },
    {
     "text": {
      "en": "Drop integrality. At the vertices $(0,0)$, $({{C1.vertices.2.1}},0)$, $\\bar x$ and $(0,{{C1.vertices.4.2}})$ the objective is ${{C1.zv}}$; the best is the corner where both resources run out, $\\bar x={{C1.lp}}$, with $z_{LP}={{C1.zlp}}$.",
      "ru": "Отбросим целочисленность. В вершинах $(0,0)$, $({{C1.vertices.2.1}},0)$, $\\bar x$ и $(0,{{C1.vertices.4.2}})$ цель равна ${{C1.zv}}$; лучшая — вершина, где кончаются оба ресурса: $\\bar x={{C1.lp}}$, $z_{LP}={{C1.zlp}}$."
     }
    },
    {
     "text": {
      "en": "Rounding down gives ${{C1.round}}$ with profit ${{C1.zround}}$. The nearest lattice point ${{C1.near}}$ needs ${{C1.nearRow}}$ units of wood, more than there is.",
      "ru": "Округление вниз даёт ${{C1.round}}$ с прибылью ${{C1.zround}}$. Ближайшая точка решётки ${{C1.near}}$ требует ${{C1.nearRow}}$ единиц древесины — больше, чем есть."
     }
    },
    {
     "text": {
      "en": "Checking the ${{C1.count}}$ feasible lattice points gives the integer optimum ${{C1.ip}}$ with $z_{IP}={{C1.zip}}$: three chairs and one table, not the rounded plan. The relaxation promised ${{C1.zlp}}$, so the gap is ${{C1.gap}}$, and no integer plan can beat the bound.",
      "ru": "Перебор ${{C1.count}}$ допустимых точек решётки даёт целочисленный оптимум ${{C1.ip}}$ с $z_{IP}={{C1.zip}}$: три стула и один стол, а вовсе не округлённый план. Релаксация обещала ${{C1.zlp}}$, так что зазор равен ${{C1.gap}}$, и ни один целочисленный план эту оценку не превзойдёт."
     }
    }
   ],
   "answerText": {
    "en": "$z_{LP}={{C1.zlp}}$ at $\\bar x={{C1.lp}}$; $z_{IP}={{C1.zip}}$ at ${{C1.ip}}$.",
    "ru": "$z_{LP}={{C1.zlp}}$ в точке $\\bar x={{C1.lp}}$; $z_{IP}={{C1.zip}}$ в точке ${{C1.ip}}$."
   },
   "review": {
    "en": "For a maximization the relaxation bounds the integer optimum from above. The integer optimum need not lie next to the LP optimum, so rounding is a guess to be checked, not an answer.",
    "ru": "Для задачи максимизации релаксация оценивает целочисленный оптимум сверху. Целочисленный оптимум не обязан лежать рядом с оптимумом LP, поэтому округление — догадка, которую надо проверить, а не ответ."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_c1",
    "alt": {
     "en": "Lattice points inside the LP polygon, the LP optimum at a corner and the integer optimum, with a level line of the profit.",
     "ru": "Точки решётки внутри многоугольника LP, оптимум LP в вершине и целочисленный оптимум с линией уровня прибыли."
    },
    "caption": {
     "en": "Lattice points inside the LP polygon, the LP optimum at a corner and the integer optimum, with a level line of the profit.",
     "ru": "Точки решётки внутри многоугольника LP, оптимум LP в вершине и целочисленный оптимум с линией уровня прибыли."
    }
   }
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "Switch a machine on or not",
    "ru": "Включать машину или нет"
   },
   "statement": {
    "en": "An order of $D={{C2.params.D}}$ units can be made on two machines. Machine $i$ costs $F_i$ to switch on and $c_i$ per unit, and makes at most $u_i$ units: $F={{C2.params.F}}$, $c={{C2.params.c}}$, $u={{C2.params.u}}$. Write the model with binary $z_i$ and $x_i\\le M_iz_i$, and find the cheapest plan. Then relax $z_i\\in\\{0,1\\}$ to $0\\le z_i\\le1$ and solve the relaxation for $M_i=u_i$ and for $M_i={{C2.params.scale}}\\,u_i$. Give the three values.",
    "ru": "Заказ из $D={{C2.params.D}}$ единиц можно сделать на двух машинах. Включение машины $i$ стоит $F_i$, единица продукции — $c_i$, и машина делает не больше $u_i$ единиц: $F={{C2.params.F}}$, $c={{C2.params.c}}$, $u={{C2.params.u}}$. Запишите модель с двоичными $z_i$ и $x_i\\le M_iz_i$ и найдите самый дешёвый план. Затем замените $z_i\\in\\{0,1\\}$ на $0\\le z_i\\le1$ и решите релаксацию при $M_i=u_i$ и при $M_i={{C2.params.scale}}\\,u_i$. Укажите три значения."
   },
   "answers": [
    {
     "id": "ip",
     "ref": "answers.C2.ip",
     "label": {
      "en": "Cheapest plan",
      "ru": "Самый дешёвый план"
     }
    },
    {
     "id": "lpU",
     "ref": "answers.C2.lpU",
     "label": {
      "en": "Relaxation, $M_i=u_i$",
      "ru": "Релаксация, $M_i=u_i$"
     }
    },
    {
     "id": "lpBig",
     "ref": "answers.C2.lpBig",
     "label": {
      "en": "Relaxation, $M_i={{C2.params.scale}}\\,u_i$",
      "ru": "Релаксация, $M_i={{C2.params.scale}}\\,u_i$"
     }
    }
   ]
  },
  "C3": {
   "who": "students",
   "title": {
    "en": "A knapsack and its relaxation",
    "ru": "Рюкзак и его релаксация"
   },
   "statement": {
    "en": "Four items have values ${{C3.params.values}}$ and weights ${{C3.params.weights}}$; the knapsack holds ${{C3.params.cap}}$. Write the model with binary $x_i$. Solve the LP relaxation by sorting the items by value per unit of weight, then find the best packing. Give the LP bound, the integer optimum and the number of items packed.",
    "ru": "У четырёх предметов ценности ${{C3.params.values}}$ и веса ${{C3.params.weights}}$; вместимость рюкзака ${{C3.params.cap}}$. Запишите модель с двоичными $x_i$. Решите LP-релаксацию, упорядочив предметы по ценности на единицу веса, затем найдите лучшую укладку. Укажите оценку LP, целочисленный оптимум и число уложенных предметов."
   },
   "answers": [
    {
     "id": "lp",
     "ref": "answers.C3.lp",
     "label": {
      "en": "LP bound",
      "ru": "Оценка LP"
     }
    },
    {
     "id": "ip",
     "ref": "answers.C3.ip",
     "label": {
      "en": "Integer optimum",
      "ru": "Целочисленный оптимум"
     }
    },
    {
     "id": "k",
     "ref": "answers.C3.k",
     "label": {
      "en": "Items packed",
      "ru": "Уложено предметов"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
