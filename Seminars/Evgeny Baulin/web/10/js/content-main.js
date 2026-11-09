// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 10 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. From a bound to a search",
     "ru": "0. От оценки к перебору"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "Last week a linear program was solved exactly and its dual gave prices. Today the LP turns into a tool for integer problems: it bounds them, and a search uses the bound to skip almost all of the $2^n$ candidates.",
      "ru": "На прошлой неделе мы решали линейную задачу точно и читали цены из двойственной. Сегодня ЛП становится инструментом для целочисленных задач: она их оценивает, а перебор использует оценку, чтобы пропустить почти все $2^n$ кандидатов."
     },
     {
      "en": "For a maximization, any relaxation (more feasible points) gives an upper bound, and any feasible integer point gives a lower bound. Branch and bound, cutting planes and the choice between two models are all about bringing these two numbers together.",
      "ru": "Для задачи максимизации любая релаксация (допустимых точек больше) даёт верхнюю оценку, а любая допустимая целая точка — нижнюю. Ветви и границы, отсечения и выбор между двумя моделями — всё это способы свести эти два числа вместе."
     },
     {
      "en": "The plan: the knapsack and its relaxation (A), branch and bound and one cut (B), dynamic programming (C), modelling with binary variables (D), problems whose relaxation is already integral and one whose is not (E). After the demonstrations there is a puzzle with cats.",
      "ru": "План: рюкзак и его релаксация (A), ветви и границы и одно отсечение (B), динамическое программирование (C), моделирование двоичными переменными (D), задачи, у которых релаксация сразу целая, и одна, у которой нет (E). После демонстраций — головоломка с котами."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. The knapsack and its relaxation",
     "ru": "A. Рюкзак и его релаксация"
    },
    "short": {
     "en": "A. Knapsack",
     "ru": "A. Рюкзак"
    },
    "recap": [
     {
      "en": "The 0–1 knapsack: $\\max\\sum_ip_ix_i$ subject to $\\sum_iw_ix_i\\le W$, $x\\in\\{0,1\\}^n$, with profits $p_i>0$ and weights $w_i>0$. The relaxation replaces $x_i\\in\\{0,1\\}$ by $0\\le x_i\\le1$.",
      "ru": "Рюкзак 0–1: $\\max\\sum_ip_ix_i$ при $\\sum_iw_ix_i\\le W$, $x\\in\\{0,1\\}^n$, с ценностями $p_i>0$ и весами $w_i>0$. Релаксация заменяет $x_i\\in\\{0,1\\}$ на $0\\le x_i\\le1$."
     },
     {
      "en": "The relaxation is solved by sorting: order the items by density $p_i/w_i$, take whole items while they fit, then the fraction of the next one that fills the knapsack. At most one variable is fractional, and the value is an upper bound $U$ on every packing.",
      "ru": "Релаксация решается сортировкой: упорядочим предметы по плотности $p_i/w_i$, берём целые предметы, пока они помещаются, а затем ту долю следующего, что заполняет рюкзак. Дробной будет не более одной переменной, а значение — верхняя оценка $U$ для любой укладки."
     },
     {
      "en": "Rounding the fractional item down gives a feasible packing, often a poor one. With integer profits the optimum lies between the best packing found and $\\lfloor U\\rfloor$.",
      "ru": "Если округлить дробный предмет вниз, получится допустимая укладка, часто плохая. При целых ценностях оптимум лежит между лучшей найденной укладкой и $\\lfloor U\\rfloor$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: the density bound against all packings",
      "ru": "Живой код: оценка по плотности против всех укладок"
     },
     "text": {
      "en": "The code sorts random items by density, builds the fractional solution and compares its bound with the best of all $2^n$ packings. Change the seed and the number of items and watch the gap.",
      "ru": "Код сортирует случайные предметы по плотности, строит дробное решение и сравнивает оценку с лучшей из всех $2^n$ укладок. Меняйте зерно и число предметов и смотрите на разрыв."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Branch and bound, and one cut",
     "ru": "B. Ветви и границы и одно отсечение"
    },
    "short": {
     "en": "B. Branch",
     "ru": "B. Ветви"
    },
    "recap": [
     {
      "en": "A node $N$ of the search fixes some of the $x_i$. Its bound $U(N)$ is the fixed profit plus the relaxation over the free items in the remaining capacity. The best packing found so far is the incumbent $z_{\\text{inc}}$.",
      "ru": "Узел $N$ перебора фиксирует часть переменных $x_i$. Его оценка $U(N)$ — зафиксированная ценность плюс релаксация по свободным предметам в оставшейся вместимости. Лучшая найденная укладка — рекорд $z_{\\text{inc}}$."
     },
     {
      "en": "A node is closed when the fixed items do not fit, when $U(N)\\le z_{\\text{inc}}$ (it cannot contain anything better), or when its relaxation is integral (a packing, and a new incumbent if better). Otherwise branch on the fractional item: $x_j=1$ and $x_j=0$.",
      "ru": "Узел закрывается, если зафиксированные предметы не помещаются, если $U(N)\\le z_{\\text{inc}}$ (лучшего в нём нет) или если его релаксация целая (это укладка, и она становится рекордом, если лучше). Иначе ветвимся по дробному предмету: $x_j=1$ и $x_j=0$."
     },
     {
      "en": "Depth first reaches a packing quickly and needs little memory; best bound expands the open node with the largest $U$ and usually proves optimality with fewer nodes. At any moment the optimum lies between $z_{\\text{inc}}$ and the largest open bound.",
      "ru": "Поиск в глубину быстро доходит до укладки и требует мало памяти; поиск по лучшей оценке раскрывает открытый узел с наибольшим $U$ и обычно доказывает оптимальность за меньшее число узлов. В любой момент оптимум лежит между $z_{\\text{inc}}$ и наибольшей открытой оценкой."
     },
     {
      "en": "A cutting plane is an inequality that every integer point satisfies and the current LP optimum violates. Gomory's cut comes from one row of the optimal tableau with a fractional right-hand side: keep only the fractional parts.",
      "ru": "Отсекающая плоскость — неравенство, которому удовлетворяют все целые точки, но не текущий оптимум ЛП. Отсечение Гомори берётся из строки оптимальной таблицы с дробной правой частью: оставляем только дробные части."
     }
    ]
   },
   "C": {
    "title": {
     "en": "C. Dynamic programming",
     "ru": "C. Динамическое программирование"
    },
    "short": {
     "en": "C. DP",
     "ru": "C. ДП"
    },
    "recap": [
     {
      "en": "With integer weights, let $D(i,c)$ be the best profit from the first $i$ items in capacity $c$. Then $D(0,c)=0$ and $D(i,c)=\\max\\{D(i-1,c),\\ p_i+D(i-1,c-w_i)\\}$, the second option only when $w_i\\le c$. The answer is $D(n,W)$.",
      "ru": "При целых весах обозначим через $D(i,c)$ лучшую ценность из первых $i$ предметов при вместимости $c$. Тогда $D(0,c)=0$ и $D(i,c)=\\max\\{D(i-1,c),\\ p_i+D(i-1,c-w_i)\\}$, причём второй вариант — только при $w_i\\le c$. Ответ — $D(n,W)$."
     },
     {
      "en": "To recover the packing, walk back from $(n,W)$: if $D(i,c)=D(i-1,c)$ item $i$ is out, otherwise it is in and $c$ drops by $w_i$. With unlimited copies the second option reads $p_i+D(i,c-w_i)$: the same row, so item $i$ may be used again.",
      "ru": "Чтобы восстановить укладку, идём назад от $(n,W)$: если $D(i,c)=D(i-1,c)$, предмет $i$ не взят, иначе взят, и $c$ уменьшается на $w_i$. При неограниченном числе копий второй вариант равен $p_i+D(i,c-w_i)$: та же строка, поэтому предмет $i$ можно взять ещё раз."
     },
     {
      "en": "The table has $(n+1)(W+1)$ cells, so the time is $O(nW)$: polynomial in the value of $W$, exponential in its number of bits. This is pseudo-polynomial, and it does not contradict the knapsack being NP-hard.",
      "ru": "В таблице $(n+1)(W+1)$ клеток, поэтому время $O(nW)$: полиномиально по величине $W$, но экспоненциально по числу его битов. Это псевдополиномиальность, и она не противоречит NP-трудности рюкзака."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: the table and the way back",
      "ru": "Живой код: таблица и обратный ход"
     },
     "text": {
      "en": "The code fills $D$ row by row with NumPy, walks back to the packing and draws the table. Switch to one row of memory and check that the value is the same.",
      "ru": "Код заполняет $D$ строка за строкой на NumPy, проходит назад к укладке и рисует таблицу. Переключитесь на одну строку памяти и проверьте, что значение то же."
     }
    }
   },
   "D": {
    "title": {
     "en": "D. Modelling with binary variables",
     "ru": "D. Моделирование двоичными переменными"
    },
    "short": {
     "en": "D. Models",
     "ru": "D. Модели"
    },
    "recap": [
     {
      "en": "Logic: «if $A$ then $B$» is $y_A\\le y_B$; «at most $k$ of these» is $\\sum_iy_i\\le k$; «produce only on an open line» is $x\\le u\\,y$ with a valid upper bound $u$ on $x$, and a fixed cost $f$ enters the objective as $-f\\,y$.",
      "ru": "Логика: «если $A$, то $B$» — это $y_A\\le y_B$; «не больше $k$ из них» — $\\sum_iy_i\\le k$; «выпуск только на открытой линии» — $x\\le u\\,y$ с верной верхней границей $u$ для $x$, а фиксированные затраты $f$ входят в цель как $-f\\,y$."
     },
     {
      "en": "A product of binaries $z=x_ix_j$ becomes $z\\le x_i$, $z\\le x_j$, $z\\ge x_i+x_j-1$, $z\\ge0$. When the objective already pushes $z$ one way, only the rows that stop it in that direction are needed.",
      "ru": "Произведение двоичных $z=x_ix_j$ заменяется на $z\\le x_i$, $z\\le x_j$, $z\\ge x_i+x_j-1$, $z\\ge0$. Если цель и так толкает $z$ в одну сторону, нужны только строки, которые держат его с этой стороны."
     },
     {
      "en": "Two models of the same integer set can have different relaxations. Disaggregated rows $x_{ij}\\le y_j$ cut off more fractional points than one aggregated row $\\sum_ix_{ij}\\le m\\,y_j$, so they give a better bound and a smaller tree.",
      "ru": "Две модели одного и того же целочисленного множества могут иметь разные релаксации. Раздельные строки $x_{ij}\\le y_j$ отрезают больше дробных точек, чем одна суммарная $\\sum_ix_{ij}\\le m\\,y_j$, поэтому дают лучшую оценку и меньшее дерево."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: one fixed charge, two formulations",
      "ru": "Живой код: одни фиксированные затраты, две модели"
     },
     "text": {
      "en": "A NumPy simplex solves the relaxation of a small fixed-charge model twice, once with one aggregated row and once with a row per product. Compare the bounds and the value of $y$.",
      "ru": "Симплекс-метод на NumPy дважды решает релаксацию маленькой модели с фиксированными затратами: с одной суммарной строкой и со строкой на каждый продукт. Сравните оценки и значение $y$."
     }
    }
   },
   "E": {
    "title": {
     "en": "E. Assignment, covering and a puzzle",
     "ru": "E. Назначения, покрытия и головоломка"
    },
    "short": {
     "en": "E. Structure",
     "ru": "E. Структура"
    },
    "recap": [
     {
      "en": "Assignment: $\\min\\sum_{ij}c_{ij}x_{ij}$, every row and every column of $x$ sums to $1$. The constraint matrix is totally unimodular, so every vertex of the relaxation is a permutation matrix and a simplex-type solver returns an integer answer.",
      "ru": "Назначения: $\\min\\sum_{ij}c_{ij}x_{ij}$, сумма каждой строки и каждого столбца $x$ равна $1$. Матрица ограничений вполне унимодулярна, поэтому каждая вершина релаксации — матрица перестановки, и солвер симплексного типа возвращает целый ответ."
     },
     {
      "en": "Covering: every element must be covered by a chosen set, $\\sum_{S\\ni e}x_S\\ge1$. Here the relaxation may stop at halves, as on an odd cycle, and the bound stays strictly below the integer optimum.",
      "ru": "Покрытие: каждый элемент должен быть покрыт выбранным множеством, $\\sum_{S\\ni e}x_S\\ge1$. Здесь релаксация может остановиться на половинах, как на нечётном цикле, и оценка остаётся строго ниже целого оптимума."
     },
     {
      "en": "A puzzle is an integer program with a constant objective: binaries $x_{rc}$, an equation per row, column and region, and inequalities that keep neighbours apart. The solver only has to find a feasible point, or prove there is none.",
      "ru": "Головоломка — целочисленная задача с постоянной целью: двоичные $x_{rc}$, уравнение на каждую строку, столбец и область и неравенства, разводящие соседей. Солверу нужно лишь найти допустимую точку или доказать, что её нет."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: integral by structure",
      "ru": "Живой код: целое по устройству"
     },
     "text": {
      "en": "The simplex solves the relaxation of a matching in a bipartite graph and returns zeros and ones. On a triangle, which is not bipartite, the same relaxation stops at halves.",
      "ru": "Симплекс-метод решает релаксацию паросочетания в двудольном графе и возвращает нули и единицы. На треугольнике, который не двудольный, та же релаксация останавливается на половинах."
     }
    }
   },
   "F": {
    "title": {
     "en": "F. How it breaks",
     "ru": "F. Как ломается"
    },
    "short": {
     "en": "F. Breaks",
     "ru": "F. Сбои"
    },
    "intro": {
     "en": "Four places where an integer method behaves worse than one would hope.",
     "ru": "Четыре места, где целочисленный метод ведёт себя хуже, чем хотелось бы."
    },
    "demos": [
     {
      "title": {
       "en": "Rounding is not solving",
       "ru": "Округление — не решение"
      },
      "text": {
       "en": "Maximize $x_2$ subject to $Ax\\le b$ with $A={{demo.round.A}}$, $b={{demo.round.b}}$, $x\\ge0$ integer. The relaxation peaks at ${{demo.round.lp}}$ with value ${{demo.round.z}}$. Of the four integer points around it, {{demo.round.nearOk}} are feasible, and the integer optimum ${{demo.round.ip}}$ has value ${{demo.round.zIp}}$.",
       "ru": "Максимизируем $x_2$ при $Ax\\le b$, где $A={{demo.round.A}}$, $b={{demo.round.b}}$, $x\\ge0$ целые. Релаксация достигает максимума в ${{demo.round.lp}}$ со значением ${{demo.round.z}}$. Из четырёх целых точек вокруг допустимы {{demo.round.nearOk}}, а целый оптимум ${{demo.round.ip}}$ имеет значение ${{demo.round.zIp}}$."
      },
      "takeaway": {
       "en": "The LP optimum is a bound, not a draft of the answer. Round only when the structure guarantees integral vertices, as in block E.",
       "ru": "Оптимум ЛП — оценка, а не черновик ответа. Округлять можно, только когда устройство задачи гарантирует целые вершины, как в блоке E."
      }
     },
     {
      "title": {
       "en": "What the bound saves",
       "ru": "Что экономит оценка"
      },
      "text": {
       "en": "Random knapsacks with $n={{demo.bound.ns}}$ items, depth first with the density bound: on average ${{demo.bound.nodes}}$ nodes, against ${{demo.bound.full}}$ nodes in the full tree.",
       "ru": "Случайные рюкзаки с $n={{demo.bound.ns}}$ предметами, поиск в глубину с оценкой по плотности: в среднем ${{demo.bound.nodes}}$ узлов против ${{demo.bound.full}}$ узлов полного дерева."
      },
      "figure": {
       "src": "fig_f2",
       "alt": {
        "en": "Nodes against the number of items on a log scale: the full tree doubles with each item, branch and bound grows slowly.",
        "ru": "Число узлов в зависимости от числа предметов в логарифмической шкале: полное дерево удваивается с каждым предметом, ветви и границы растут медленно."
       },
       "caption": {
        "en": "Nodes against the number of items on a log scale: the full tree doubles with each item, branch and bound grows slowly.",
        "ru": "Число узлов в зависимости от числа предметов в логарифмической шкале: полное дерево удваивается с каждым предметом, ветви и границы растут медленно."
       }
      },
      "takeaway": {
       "en": "Branch and bound is still exponential in the worst case. On typical data a good bound and an early incumbent cut away almost the whole tree.",
       "ru": "В худшем случае ветви и границы по-прежнему экспоненциальны. На типичных данных хорошая оценка и ранний рекорд отрезают почти всё дерево."
      }
     },
     {
      "title": {
       "en": "The table does not care about the answer",
       "ru": "Таблице всё равно, каков ответ"
      },
      "text": {
       "en": "Take the instance of C1 and multiply every weight and the capacity by ${{demo.pseudo.scales}}$. The packings and the optimum stay the same, branch and bound visits ${{demo.pseudo.nodes}}$ nodes, and the DP table grows to ${{demo.pseudo.cells}}$ cells.",
       "ru": "Возьмём задачу C1 и умножим все веса и вместимость на ${{demo.pseudo.scales}}$. Укладки и оптимум не меняются, ветви и границы проходят ${{demo.pseudo.nodes}}$ узлов, а таблица ДП вырастает до ${{demo.pseudo.cells}}$ клеток."
      },
      "takeaway": {
       "en": "The DP pays for the size of $W$, not for the difficulty of the instance. With large or real weights choose branch and bound, with small integer capacities the table.",
       "ru": "ДП платит за величину $W$, а не за сложность задачи. При больших или вещественных весах выбирайте ветви и границы, при небольших целых вместимостях — таблицу."
      }
     },
     {
      "title": {
       "en": "A weak model grows the tree",
       "ru": "Слабая модель растит дерево"
      },
      "text": {
       "en": "Facility location with $m={{demo.forms.m}}$ sites and $n={{demo.forms.n}}$ customers, five random instances each, branch and bound on LP relaxations. With one row $\\sum_ix_{ij}\\le n\\,y_j$ per site it needs on average ${{demo.forms.weak}}$ nodes, with $x_{ij}\\le y_j$ only ${{demo.forms.strong}}$. The optimal values are the same.",
       "ru": "Размещение складов: $m={{demo.forms.m}}$ мест и $n={{demo.forms.n}}$ клиентов, по пять случайных задач, ветви и границы на релаксациях ЛП. С одной строкой $\\sum_ix_{ij}\\le n\\,y_j$ на место нужно в среднем ${{demo.forms.weak}}$ узлов, с $x_{ij}\\le y_j$ — только ${{demo.forms.strong}}$. Оптимальные значения совпадают."
      },
      "takeaway": {
       "en": "Before buying a faster solver, tighten the model. More rows can mean much less work.",
       "ru": "Прежде чем покупать солвер быстрее, усильте модель. Больше строк может означать гораздо меньше работы."
      }
     }
    ]
   },
   "G": {
    "title": {
     "en": "G. Cat sudoku",
     "ru": "G. Котосудоку"
    },
    "short": {
     "en": "G. Cats",
     "ru": "G. Коты"
    },
    "intro": {
     "en": "Put one cat in every row, every column and every coloured region. Two cats must not touch, not even at a corner. Click a cell once for a cat, twice for a cross, a third time to clear it.",
     "ru": "Посадите по одному коту в каждую строку, каждый столбец и каждую цветную область. Два кота не должны касаться, даже углами. Первый щелчок по клетке сажает кота, второй ставит крестик, третий очищает клетку."
    },
    "solver": {
     "en": "The solver goes row by row. A cat rules out its column, its region and the cells around it; when a row or a region has no cell left, it steps back. This is branch and bound with a constant objective: a node is closed when it is infeasible.",
     "ru": "Решатель идёт строка за строкой. Кот исключает свой столбец, свою область и клетки вокруг; когда в строке или области не осталось клеток, решатель возвращается назад. Это ветви и границы с постоянной целью: узел закрывается, когда он недопустим."
    },
    "model": {
     "en": "As an integer program: $x_{rc}\\in\\{0,1\\}$, $\\sum_cx_{rc}=1$ for each row, $\\sum_rx_{rc}=1$ for each column, $\\sum_{(r,c)\\in R}x_{rc}=1$ for each region $R$, and $x_{rc}+x_{r+1,c}+x_{r,c+1}+x_{r+1,c+1}\\le1$ for each $2\\times2$ square.",
     "ru": "Как целочисленная задача: $x_{rc}\\in\\{0,1\\}$, $\\sum_cx_{rc}=1$ для каждой строки, $\\sum_rx_{rc}=1$ для каждого столбца, $\\sum_{(r,c)\\in R}x_{rc}=1$ для каждой области $R$ и $x_{rc}+x_{r+1,c}+x_{r,c+1}+x_{r+1,c+1}\\le1$ для каждого квадрата $2\\times2$."
    }
   },
   "H": {
    "title": {
     "en": "H. Takeaways and practice",
     "ru": "H. Итоги и практика"
    },
    "short": {
     "en": "H. Wrap-up",
     "ru": "H. Итоги"
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
        "en": "Branch and bound for a maximization with integer profits has the incumbent ${{exit.inc}}$, and the largest open bound is ${{exit.lp}}$. How much better can the optimum be, and when may the search stop?",
        "ru": "В методе ветвей и границ для максимизации с целыми ценностями рекорд равен ${{exit.inc}}$, а наибольшая открытая оценка — ${{exit.lp}}$. Насколько лучше может быть оптимум и когда можно остановить поиск?"
       }
      },
      {
       "question": {
        "en": "A knapsack has $n={{exit.n}}$ items. How many leaves has the full enumeration tree, and what lets branch and bound skip most of them?",
        "ru": "В рюкзаке $n={{exit.n}}$ предметов. Сколько листьев у полного дерева перебора и что позволяет методу ветвей и границ пропустить большую их часть?"
       }
      },
      {
       "question": {
        "en": "An LP solver returns a fractional point for the relaxation of an assignment problem. Is the model wrong?",
        "ru": "Солвер ЛП вернул дробную точку для релаксации задачи о назначениях. Модель неверна?"
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
      "en": "Use NumPy for your own code and `scipy.optimize.milp` or `linprog` as the independent solver, so that the numbers can be compared with the hand solutions.",
      "ru": "Свой код пишите на NumPy, а `scipy.optimize.milp` или `linprog` используйте как независимый решатель, чтобы числа можно было сравнить с ручными решениями."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "Two exact methods for the knapsack",
        "ru": "Два точных метода для рюкзака"
       },
       "statement": {
        "en": "Write a depth-first branch and bound with the density bound and a log of nodes as in B1, and the table of C1 with the way back. Check both on A1, B1, B2 and C1. Then on random instances of growing $n$ and growing $W$ compare the number of nodes with the number of cells.",
        "ru": "Напишите метод ветвей и границ в глубину с оценкой по плотности и журналом узлов, как в B1, и таблицу C1 с обратным ходом. Проверьте оба на A1, B1, B2 и C1. Затем на случайных задачах с растущими $n$ и $W$ сравните число узлов с числом клеток."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "Models with a solver",
        "ru": "Модели с солвером"
       },
       "statement": {
        "en": "Write D1, D2 and D3 for `milp` and solve them. Solve the relaxations with `linprog` and compare the two models of D3 on random instances of growing size; print `status`, `mip_gap` and `mip_node_count`.",
        "ru": "Запишите D1, D2 и D3 для `milp` и решите их. Решите релаксации через `linprog` и сравните две модели D3 на случайных задачах растущего размера; выведите `status`, `mip_gap` и `mip_node_count`."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "Your own cat sudoku",
        "ru": "Своё котосудоку"
       },
       "statement": {
        "en": "Model a puzzle of block G as an integer program for `milp`, with the square inequalities of E3. Check that your model finds the cats of the page, then add the inequality that excludes this solution and confirm that the puzzle has no other.",
        "ru": "Запишите головоломку блока G как целочисленную задачу для `milp` с неравенствами по квадратам из E3. Проверьте, что модель находит тех же котов, что и страница, затем добавьте неравенство, исключающее это решение, и убедитесь, что других решений нет."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
