// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 09 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "A feed blend",
    "ru": "Кормовая смесь"
   },
   "statement": {
    "en": "A feed is mixed from $x$ kg of a first ingredient at ${{A1.params.cost.1}}$ per kg and $y$ kg of a second at ${{A1.params.cost.2}}$ per kg. A batch needs at least ${{A1.params.b.1}}$ units of protein and ${{A1.params.b.2}}$ units of fibre; a kg of the first ingredient gives ${{A1.params.A.1.1}}$ and ${{A1.params.A.2.1}}$ of them, a kg of the second ${{A1.params.A.1.2}}$ and ${{A1.params.A.2.2}}$. Minimize the cost graphically, then bring the problem to standard form and list all its basic solutions. Give $x^*$, the cost $z^*$ and the number of feasible basic solutions.",
    "ru": "Смесь готовят из $x$ кг первого компонента по цене ${{A1.params.cost.1}}$ за кг и $y$ кг второго по цене ${{A1.params.cost.2}}$ за кг. В партии должно быть не меньше ${{A1.params.b.1}}$ единиц белка и ${{A1.params.b.2}}$ единиц клетчатки; в килограмме первого компонента белка ${{A1.params.A.1.1}}$, а клетчатки ${{A1.params.A.2.1}}$, в килограмме второго — ${{A1.params.A.1.2}}$ и ${{A1.params.A.2.2}}$ в тех же единицах. Минимизируйте стоимость графически, затем приведите задачу к стандартной форме и выпишите все базисные решения. Укажите $x^*$, стоимость $z^*$ и число допустимых базисных решений."
   },
   "answers": [
    {
     "id": "x",
     "ref": "answers.A1.x",
     "label": {
      "en": "$x^*$",
      "ru": "$x^*$"
     }
    },
    {
     "id": "z",
     "ref": "answers.A1.z",
     "label": {
      "en": "$z^*$",
      "ru": "$z^*$"
     }
    },
    {
     "id": "count",
     "ref": "answers.A1.count",
     "label": {
      "en": "Feasible basic solutions",
      "ru": "Допустимых базисных решений"
     }
    }
   ],
   "hints": [
    {
     "en": "Draw both boundary lines through their axis intercepts. The feasible set is unbounded, but the cost grows in every direction it extends to.",
     "ru": "Проведите обе граничные прямые через точки пересечения с осями. Допустимое множество неограниченно, но стоимость растёт в каждом направлении, куда оно уходит."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "The model is $\\min 5x+4y$ subject to $2x+y\\ge{{A1.params.b.1}}$, $x+3y\\ge{{A1.params.b.2}}$, $x,y\\ge0$. The two lines meet at ${{A1.x}}$, and the feasible set is the unbounded region above both, with corners ${{A1.vertices.1}}$, ${{A1.vertices.2}}$ and ${{A1.vertices.3}}$.",
      "ru": "Модель: $\\min 5x+4y$ при $2x+y\\ge{{A1.params.b.1}}$, $x+3y\\ge{{A1.params.b.2}}$, $x,y\\ge0$. Прямые пересекаются в точке ${{A1.x}}$, а допустимое множество — неограниченная область над обеими прямыми с угловыми точками ${{A1.vertices.1}}$, ${{A1.vertices.2}}$ и ${{A1.vertices.3}}$."
     }
    },
    {
     "text": {
      "en": "The level lines $5x+4y=z$ all have the same slope. Push one down towards the origin until it is about to lose the feasible set: the last point it touches is a corner. The costs at the corners are ${{A1.zv}}$, so the best is ${{A1.x}}$ with $z^*={{A1.z}}$.",
      "ru": "Все линии уровня $5x+4y=z$ параллельны. Сдвигаем линию вниз к началу координат, пока она не готова потерять допустимое множество: последняя точка касания — угловая. Стоимости в угловых точках равны ${{A1.zv}}$, поэтому лучшая точка — ${{A1.x}}$ с $z^*={{A1.z}}$."
     }
    },
    {
     "text": {
      "en": "Standard form takes one surplus variable per row: $2x+y-s_1={{A1.params.b.1}}$, $x+3y-s_2={{A1.params.b.2}}$ with all four variables nonnegative. Two equations and four unknowns: pick two basic variables, set the other two to zero and solve. There are $\\binom{4}{2}={{A1.nBasic}}$ choices.",
      "ru": "В стандартной форме на каждую строку приходится одна избыточная переменная: $2x+y-s_1={{A1.params.b.1}}$, $x+3y-s_2={{A1.params.b.2}}$, все четыре переменные неотрицательны. Два уравнения и четыре неизвестных: выбираем две базисные переменные, остальные две обнуляем и решаем систему. Вариантов $\\binom{4}{2}={{A1.nBasic}}$."
     }
    },
    {
     "text": {
      "en": "All six at a glance: $${{A1.table}}$$ Three of the six have every variable nonnegative, and these are exactly the three corners. The other three are crossings of boundary lines outside the feasible set; a negative $s_i$ says which requirement they break.",
      "ru": "Все шесть разом: $${{A1.table}}$$ У трёх решений из шести все переменные неотрицательны, и это в точности три угловые точки. Остальные три — пересечения граничных прямых вне допустимого множества; отрицательная $s_i$ показывает, какое требование нарушено."
     }
    }
   ],
   "answerText": {
    "en": "$(x^*,y^*)={{A1.x}}$, $z^*={{A1.z}}$, {{A1.nFeasible}} feasible basic solutions out of {{A1.nBasic}}.",
    "ru": "$(x^*,y^*)={{A1.x}}$, $z^*={{A1.z}}$, допустимых базисных решений {{A1.nFeasible}} из {{A1.nBasic}}."
   },
   "review": {
    "en": "A corner of the picture and a basic feasible solution of the equations are the same object. The picture is for two variables; the equations work in any dimension.",
    "ru": "Угловая точка на рисунке и допустимое базисное решение системы — один и тот же объект. Рисунок годится для двух переменных, а уравнения работают в любой размерности."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_a1",
    "alt": {
     "en": "The unbounded feasible region of the blend, its three corners, the three infeasible basic solutions and the optimal level line.",
     "ru": "Неограниченное допустимое множество смеси, три угловые точки, три недопустимых базисных решения и оптимальная линия уровня."
    },
    "caption": {
     "en": "The unbounded feasible region of the blend, its three corners, the three infeasible basic solutions and the optimal level line.",
     "ru": "Неограниченное допустимое множество смеси, три угловые точки, три недопустимых базисных решения и оптимальная линия уровня."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "All the basic solutions",
    "ru": "Все базисные решения"
   },
   "statement": {
    "en": "Maximize $3x+2y$ subject to $x+y\\le7$, $x+2y\\le{{A2.params.b.2}}$, $x\\le5$ and $x,y\\ge0$. Add three slack variables and go through every choice of three columns. Give the number of choices that yield a basic solution, the number of feasible ones and the optimal value.",
    "ru": "Максимизируйте $3x+2y$ при $x+y\\le7$, $x+2y\\le{{A2.params.b.2}}$, $x\\le5$ и $x,y\\ge0$. Добавьте три дополнительные переменные и переберите все наборы из трёх столбцов. Укажите, сколько наборов дают базисное решение, сколько из этих решений допустимы и чему равен оптимум."
   },
   "erratum": {
    "en": "Erratum: the first constraint should read $x+y\\le{{A2.err.b}}$.",
    "ru": "Опечатка: первое ограничение следует читать как $x+y\\le{{A2.err.b}}$."
   },
   "answers": [
    {
     "id": "nBasic",
     "ref": "answers.A2.nBasic",
     "label": {
      "en": "Basic solutions",
      "ru": "Базисных решений"
     }
    },
    {
     "id": "nFeasible",
     "ref": "answers.A2.nFeasible",
     "label": {
      "en": "Feasible ones",
      "ru": "Из них допустимых"
     }
    },
    {
     "id": "z",
     "ref": "answers.A2.z",
     "label": {
      "en": "$z^*$",
      "ru": "$z^*$"
     }
    }
   ]
  },
  "A3": {
   "who": "students",
   "title": {
    "en": "A free variable",
    "ru": "Свободная переменная"
   },
   "statement": {
    "en": "Minimize $x+2y$ subject to $x+y\\ge1$, $x\\le6$ and $x\\ge0$, with $y$ free in sign. Write the problem in standard form, replacing $y$ by a difference of two nonnegative variables. Give the number of variables of the standard form, then $y^*$ and $z^*$.",
    "ru": "Минимизируйте $x+2y$ при $x+y\\ge1$, $x\\le6$ и $x\\ge0$, причём знак $y$ не ограничен. Запишите задачу в стандартной форме, заменив $y$ разностью двух неотрицательных переменных. Укажите число переменных в стандартной форме, затем $y^*$ и $z^*$."
   },
   "erratum": {
    "en": "Erratum: the bound on $x$ should read $x\\le{{A3.err.u}}$.",
    "ru": "Опечатка: ограничение на $x$ следует читать как $x\\le{{A3.err.u}}$."
   },
   "answers": [
    {
     "id": "n",
     "ref": "answers.A3.n",
     "label": {
      "en": "Variables in standard form",
      "ru": "Переменных в стандартной форме"
     }
    },
    {
     "id": "y",
     "ref": "answers.A3.y",
     "label": {
      "en": "$y^*$",
      "ru": "$y^*$"
     }
    },
    {
     "id": "z",
     "ref": "answers.A3.z",
     "label": {
      "en": "$z^*$",
      "ru": "$z^*$"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "A bakery by tableau",
    "ru": "Пекарня в таблице"
   },
   "statement": {
    "en": "A bakery makes $x$ trays of bread and $y$ trays of pies; a tray earns ${{B1.params.c.1}}$ and ${{B1.params.c.2}}$. Oven time gives $x+y\\le{{B1.params.b.1}}$, dough gives $2x+y\\le{{B1.params.b.2}}$, and filling, needed for pies only, gives $2y\\le{{B1.params.b.3}}$. Solve by the simplex method with Dantzig's rule: the variable with the most negative entry of the $z$-row enters. Give $x^*$, $y^*$ and $z^*$.",
    "ru": "Пекарня выпекает $x$ противней хлеба и $y$ противней пирогов; противень приносит ${{B1.params.c.1}}$ и ${{B1.params.c.2}}$. Время печи даёт $x+y\\le{{B1.params.b.1}}$, тесто — $2x+y\\le{{B1.params.b.2}}$, а начинка, нужная только пирогам, — $2y\\le{{B1.params.b.3}}$. Решите задачу симплекс-методом по правилу Данцига: в базис входит переменная с наиболее отрицательным элементом $z$-строки. Укажите $x^*$, $y^*$ и $z^*$."
   },
   "answers": [
    {
     "id": "x",
     "ref": "answers.B1.x",
     "label": {
      "en": "$x^*$",
      "ru": "$x^*$"
     }
    },
    {
     "id": "y",
     "ref": "answers.B1.y",
     "label": {
      "en": "$y^*$",
      "ru": "$y^*$"
     }
    },
    {
     "id": "z",
     "ref": "answers.B1.z",
     "label": {
      "en": "$z^*$",
      "ru": "$z^*$"
     }
    }
   ],
   "hints": [
    {
     "en": "With $x=y=0$ the slacks are the basis, so no search for a start is needed. In the ratio test only positive entries of the entering column count.",
     "ru": "При $x=y=0$ базис составляют дополнительные переменные, так что начальную точку искать не нужно. В тесте отношений участвуют только положительные элементы вводимого столбца."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Add slacks $s_1,s_2,s_3$ and write $z-2x-5y=0$ as the last row. The basis is the slacks, the point is the origin, $z=0$. The boxed entry is the first pivot. $${{B1.t0}}$$",
      "ru": "Добавляем $s_1,s_2,s_3$ и записываем $z-2x-5y=0$ последней строкой. Базис — дополнительные переменные, точка — начало координат, $z=0$. Рамкой отмечен первый разрешающий элемент. $${{B1.t0}}$$"
     }
    },
    {
     "text": {
      "en": "The most negative entry is under $y$, so $y$ enters: a tray of pies pays most. How far can it grow? The ratios of the right-hand side to the positive entries of the column are ${{B1.ratios1}}$, the smallest is in the third row, so $s_3$ leaves. Divide that row by the pivot and clear the column. $${{B1.t1}}$$",
      "ru": "Наиболее отрицательный элемент стоит под $y$, значит, $y$ входит в базис: противень пирогов выгоднее всего. Насколько можно его увеличить? Отношения правых частей к положительным элементам столбца равны ${{B1.ratios1}}$, наименьшее — в третьей строке, поэтому $s_3$ выходит из базиса. Делим эту строку на разрешающий элемент и обнуляем остальной столбец. $${{B1.t1}}$$"
     }
    },
    {
     "text": {
      "en": "We stand at ${{B1.path.2}}$ with $z={{B1.zPath.2}}$. Only $x$ still has a negative entry. The ratios are ${{B1.ratios2}}$, so $s_1$ leaves. $${{B1.t2}}$$",
      "ru": "Мы в точке ${{B1.path.2}}$, $z={{B1.zPath.2}}$. Отрицательный элемент остался только у $x$. Отношения равны ${{B1.ratios2}}$, поэтому выходит $s_1$. $${{B1.t2}}$$"
     }
    },
    {
     "text": {
      "en": "No entry of the $z$-row is negative: $z={{B1.z}}-2s_1-\\tfrac{3}{2}s_3$, and raising a nonbasic variable can only lower $z$. So ${{B1.x}}$ is optimal with $z^*={{B1.z}}$, and the basic $s_2={{B1.slack.2}}$ says that that much dough is left over. Two pivots were enough; entering $x$ first would have gone the long way round through ${{B1.other.1}}$ and ${{B1.other.2}}$.",
      "ru": "В $z$-строке нет отрицательных элементов: $z={{B1.z}}-2s_1-\\tfrac{3}{2}s_3$, и увеличение небазисной переменной может только уменьшить $z$. Значит, ${{B1.x}}$ — оптимум, $z^*={{B1.z}}$, а базисная $s_2={{B1.slack.2}}$ показывает, сколько теста останется. Хватило двух шагов; если бы первым вошёл $x$, путь шёл бы в обход через ${{B1.other.1}}$ и ${{B1.other.2}}$."
     }
    }
   ],
   "answerText": {
    "en": "$(x^*,y^*)={{B1.x}}$, $z^*={{B1.z}}$.",
    "ru": "$(x^*,y^*)={{B1.x}}$, $z^*={{B1.z}}$."
   },
   "review": {
    "en": "Each pivot walks along an edge to a neighbouring corner and never lowers $z$. The $z$-row reads the objective in terms of the nonbasic variables, and that is the whole optimality test.",
    "ru": "Каждый шаг идёт по ребру к соседней угловой точке и не уменьшает $z$. Строка $z$ выражает цель через небазисные переменные, и в этом весь критерий оптимальности."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_b1",
    "alt": {
     "en": "The polygon of the bakery with the path of the simplex method from the origin along two edges to the optimal corner.",
     "ru": "Многоугольник пекарни и путь симплекс-метода из начала координат по двум рёбрам в оптимальную вершину."
    },
    "caption": {
     "en": "The polygon of the bakery with the path of the simplex method from the origin along two edges to the optimal corner.",
     "ru": "Многоугольник пекарни и путь симплекс-метода из начала координат по двум рёбрам в оптимальную вершину."
    }
   }
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Three variables",
    "ru": "Три переменные"
   },
   "statement": {
    "en": "Maximize $5x_1+4x_2+3x_3$ subject to $x_1+x_3\\le{{B2.params.b.1}}$, $x_1+3x_2\\le6$, $2x_1+x_2+x_3\\le{{B2.params.b.3}}$ and $x\\ge0$. Solve by the simplex method with the same entering rule. Give $z^*$, $x_3^*$ and the final value of the third slack $s_3$.",
    "ru": "Максимизируйте $5x_1+4x_2+3x_3$ при $x_1+x_3\\le{{B2.params.b.1}}$, $x_1+3x_2\\le6$, $2x_1+x_2+x_3\\le{{B2.params.b.3}}$ и $x\\ge0$. Решите задачу симплекс-методом с тем же правилом ввода. Укажите $z^*$, $x_3^*$ и итоговое значение третьей дополнительной переменной $s_3$."
   },
   "erratum": {
    "en": "Erratum: the first right-hand side should read ${{B2.err.b}}$.",
    "ru": "Опечатка: первая правая часть должна быть равна ${{B2.err.b}}$."
   },
   "answers": [
    {
     "id": "z",
     "ref": "answers.B2.z",
     "label": {
      "en": "$z^*$",
      "ru": "$z^*$"
     }
    },
    {
     "id": "x3",
     "ref": "answers.B2.x3",
     "label": {
      "en": "$x_3^*$",
      "ru": "$x_3^*$"
     }
    },
    {
     "id": "s3",
     "ref": "answers.B2.s3",
     "label": {
      "en": "$s_3$",
      "ru": "$s_3$"
     }
    }
   ]
  },
  "B3": {
   "who": "students",
   "title": {
    "en": "A start that has to be found",
    "ru": "Начало, которое надо найти"
   },
   "statement": {
    "en": "Maximize $2x+y$ subject to $x+y\\le6$, $x-y\\ge2$ and $x,y\\ge0$. The origin is infeasible, so run Phase I with one artificial variable $a$ in the second row, then Phase II with the same entering rule. Give the value of $x$ at the end of Phase I, the optimal value $z^*$ and the final value of the surplus $s_2$.",
    "ru": "Максимизируйте $2x+y$ при $x+y\\le6$, $x-y\\ge2$ и $x,y\\ge0$. Начало координат недопустимо, поэтому проведите первую фазу с одной искусственной переменной $a$ во второй строке, а затем вторую фазу с тем же правилом ввода. Укажите значение $x$ в конце первой фазы, оптимум $z^*$ и итоговое значение избыточной переменной $s_2$."
   },
   "erratum": {
    "en": "Erratum: the first constraint should read $x+y\\le{{B3.err.b}}$.",
    "ru": "Опечатка: первое ограничение следует читать как $x+y\\le{{B3.err.b}}$."
   },
   "answers": [
    {
     "id": "xStart",
     "ref": "answers.B3.xStart",
     "label": {
      "en": "$x$ after Phase I",
      "ru": "$x$ после первой фазы"
     }
    },
    {
     "id": "z",
     "ref": "answers.B3.z",
     "label": {
      "en": "$z^*$",
      "ru": "$z^*$"
     }
    },
    {
     "id": "s2",
     "ref": "answers.B3.s2",
     "label": {
      "en": "$s_2$",
      "ru": "$s_2$"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "What an hour of oven time is worth",
    "ru": "Сколько стоит час работы печи"
   },
   "statement": {
    "en": "Take the bakery of B1 with its optimum ${{B1.x}}$. Write the dual, find $y^*$ from complementary slackness and compare it with the last tableau. For which values of the oven limit $b_1$ does the basis stay optimal? Give $y_1^*$, $y_3^*$ and the largest such $b_1$.",
    "ru": "Возьмите пекарню из B1 с оптимумом ${{B1.x}}$. Запишите двойственную задачу, найдите $y^*$ из дополняющей нежёсткости и сравните с последней таблицей. При каких значениях предела времени печи $b_1$ базис остаётся оптимальным? Укажите $y_1^*$, $y_3^*$ и наибольшее такое $b_1$."
   },
   "answers": [
    {
     "id": "y1",
     "ref": "answers.C1.y1",
     "label": {
      "en": "$y_1^*$",
      "ru": "$y_1^*$"
     }
    },
    {
     "id": "y3",
     "ref": "answers.C1.y3",
     "label": {
      "en": "$y_3^*$",
      "ru": "$y_3^*$"
     }
    },
    {
     "id": "ub",
     "ref": "answers.C1.ub",
     "label": {
      "en": "Largest $b_1$",
      "ru": "Наибольшее $b_1$"
     }
    }
   ],
   "hints": [
    {
     "en": "A row of the primal becomes a variable of the dual and a column becomes a row. Dough is not used up, so its price is zero.",
     "ru": "Строка прямой задачи становится переменной двойственной, а столбец — строкой. Тесто расходуется не всё, поэтому его цена равна нулю."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "One price per resource, one row per product: minimize ${{B1.params.b.1}}y_1+{{B1.params.b.2}}y_2+{{B1.params.b.3}}y_3$ subject to $y_1+2y_2\\ge{{B1.params.c.1}}$, $y_1+y_2+2y_3\\ge{{B1.params.c.2}}$, $y\\ge0$. Read it as a buyer who rents all resources: each product must be paid at least what it would earn.",
      "ru": "Одна цена на ресурс, одна строка на продукт: минимизируем ${{B1.params.b.1}}y_1+{{B1.params.b.2}}y_2+{{B1.params.b.3}}y_3$ при $y_1+2y_2\\ge{{B1.params.c.1}}$, $y_1+y_2+2y_3\\ge{{B1.params.c.2}}$, $y\\ge0$. Это покупатель, арендующий все ресурсы: за каждый продукт он платит не меньше, чем тот принёс бы."
     }
    },
    {
     "text": {
      "en": "Complementary slackness at ${{B1.x}}$. The dough row is slack, $s_2={{B1.slack.2}}$, so $y_2=0$. Both $x$ and $y$ are positive, so both dual rows are tight: $y_1={{B1.params.c.1}}$, then $y_1+2y_3={{B1.params.c.2}}$ gives $y_3={{C1.y.3}}$. So $y^*={{C1.y}}$, the entries under $s_1,s_2,s_3$ in the $z$-row of the last tableau.",
      "ru": "Дополняющая нежёсткость в точке ${{B1.x}}$. Строка теста нежёсткая, $s_2={{B1.slack.2}}$, поэтому $y_2=0$. И $x$, и $y$ положительны, значит, обе двойственные строки жёсткие: $y_1={{B1.params.c.1}}$, а из $y_1+2y_3={{B1.params.c.2}}$ следует $y_3={{C1.y.3}}$. Итак, $y^*={{C1.y}}$ — это элементы $z$-строки последней таблицы под $s_1,s_2,s_3$."
     }
    },
    {
     "text": {
      "en": "The dual value is $b^{\\top}y^*={{C1.w}}=z^*$, so both solutions are certified optimal at once. An extra hour of oven is worth ${{C1.y.1}}$, extra dough nothing, a unit of filling ${{C1.y.3}}$.",
      "ru": "Двойственное значение $b^{\\top}y^*={{C1.w}}=z^*$, так что оптимальность обоих решений доказана сразу. Лишний час печи стоит ${{C1.y.1}}$, лишнее тесто — ничего, единица начинки — ${{C1.y.3}}$."
     }
    },
    {
     "text": {
      "en": "Change $b_1$ to ${{B1.params.b.1}}+\\delta$. The column of $s_1$ in the last tableau gives how the basic variables move: $x={{B1.x.1}}+\\delta$, $s_2={{B1.slack.2}}-2\\delta$, $y={{B1.x.2}}$. They stay nonnegative for ${{C1.delta.1}}\\le\\delta\\le{{C1.delta.2}}$, that is for $b_1$ in $[{{C1.range.1}},{{C1.range.2}}]$. In this range $p^*$ has slope $y_1^*$; past its ends the basis changes and so does the price.",
      "ru": "Пусть $b_1={{B1.params.b.1}}+\\delta$. Столбец $s_1$ последней таблицы показывает, как меняются базисные переменные: $x={{B1.x.1}}+\\delta$, $s_2={{B1.slack.2}}-2\\delta$, $y={{B1.x.2}}$. Они неотрицательны при ${{C1.delta.1}}\\le\\delta\\le{{C1.delta.2}}$, то есть при $b_1$ из $[{{C1.range.1}},{{C1.range.2}}]$. На этом отрезке наклон $p^*$ равен $y_1^*$; за его концами меняется базис, а с ним и цена."
     }
    }
   ],
   "answerText": {
    "en": "$y^*={{C1.y}}$, the basis stays optimal for $b_1\\in[{{C1.range.1}},{{C1.range.2}}]$.",
    "ru": "$y^*={{C1.y}}$, базис оптимален при $b_1\\in[{{C1.range.1}},{{C1.range.2}}]$."
   },
   "review": {
    "en": "The last tableau answers three questions at once: the plan, the prices and how far the prices can be trusted.",
    "ru": "Последняя таблица отвечает сразу на три вопроса: каков план, каковы цены и насколько этим ценам можно верить."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_c1",
    "alt": {
     "en": "The optimal value of the bakery against the oven limit: a concave broken line whose slopes are the shadow prices.",
     "ru": "Оптимум пекарни как функция предела времени печи: вогнутая ломаная, наклоны которой — теневые цены."
    },
    "caption": {
     "en": "The optimal value of the bakery against the oven limit: a concave broken line whose slopes are the shadow prices.",
     "ru": "Оптимум пекарни как функция предела времени печи: вогнутая ломаная, наклоны которой — теневые цены."
    }
   }
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "Solve the dual instead",
    "ru": "Решить вместо этого двойственную"
   },
   "statement": {
    "en": "Maximize $9x_1+{{C2.params.c.2}}x_2+3x_3$ subject to $2x_1+2x_2+5x_3\\le{{C2.params.b.1}}$, $3x_1+4x_2+2x_3\\le{{C2.params.b.2}}$ and $x\\ge0$. The dual has two variables: solve it graphically, then recover the primal solution from complementary slackness. Give $y_1^*$, the common optimal value and $x_1^*$.",
    "ru": "Максимизируйте $9x_1+{{C2.params.c.2}}x_2+3x_3$ при $2x_1+2x_2+5x_3\\le{{C2.params.b.1}}$, $3x_1+4x_2+2x_3\\le{{C2.params.b.2}}$ и $x\\ge0$. У двойственной задачи две переменные: решите её графически, а затем восстановите решение прямой задачи из дополняющей нежёсткости. Укажите $y_1^*$, общее оптимальное значение и $x_1^*$."
   },
   "erratum": {
    "en": "Erratum: the second right-hand side should read ${{C2.err.b}}$.",
    "ru": "Опечатка: вторая правая часть должна быть равна ${{C2.err.b}}$."
   },
   "answers": [
    {
     "id": "y1",
     "ref": "answers.C2.y1",
     "label": {
      "en": "$y_1^*$",
      "ru": "$y_1^*$"
     }
    },
    {
     "id": "w",
     "ref": "answers.C2.w",
     "label": {
      "en": "Optimal value",
      "ru": "Оптимальное значение"
     }
    },
    {
     "id": "x1",
     "ref": "answers.C2.x1",
     "label": {
      "en": "$x_1^*$",
      "ru": "$x_1^*$"
     }
    }
   ]
  },
  "C3": {
   "who": "students",
   "title": {
    "en": "How far the plan survives",
    "ru": "Докуда план выдерживает"
   },
   "statement": {
    "en": "Maximize $4x+3y$ subject to $x+y\\le9$, $2x+y\\le{{C3.params.b.2}}$, $y\\le6$ and $x,y\\ge0$. Find the optimum and the prices. Then give $y_1^*$, the largest $b_1$ (the right-hand side of the first row) for which the same basis stays optimal, and the largest coefficient of $x$ in the objective for which the same point stays optimal.",
    "ru": "Максимизируйте $4x+3y$ при $x+y\\le9$, $2x+y\\le{{C3.params.b.2}}$, $y\\le6$ и $x,y\\ge0$. Найдите оптимум и цены. Затем укажите $y_1^*$, наибольшее $b_1$ (правая часть первой строки), при котором тот же базис остаётся оптимальным, и наибольший коэффициент при $x$ в цели, при котором та же точка остаётся оптимальной."
   },
   "erratum": {
    "en": "Erratum: the second constraint should read $2x+y\\le{{C3.err.b}}$.",
    "ru": "Опечатка: второе ограничение следует читать как $2x+y\\le{{C3.err.b}}$."
   },
   "answers": [
    {
     "id": "y1",
     "ref": "answers.C3.y1",
     "label": {
      "en": "$y_1^*$",
      "ru": "$y_1^*$"
     }
    },
    {
     "id": "ub",
     "ref": "answers.C3.ub",
     "label": {
      "en": "Largest $b_1$",
      "ru": "Наибольшее $b_1$"
     }
    },
    {
     "id": "cu",
     "ref": "answers.C3.cu",
     "label": {
      "en": "Largest coefficient of $x$",
      "ru": "Наибольший коэффициент при $x$"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
