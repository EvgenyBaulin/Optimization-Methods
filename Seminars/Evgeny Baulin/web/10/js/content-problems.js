// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 10 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Parcels for a drone",
    "ru": "Посылки для дрона"
   },
   "statement": {
    "en": "Five parcels pay ${{A1.params.p}}$ for delivery and weigh ${{A1.params.w}}$ kg; the drone lifts at most $W={{A1.params.W}}$ kg. Solve the relaxation by densities, round the fractional parcel down, and find the best load. Give the bound $U$, the value of the rounded load and the optimum.",
    "ru": "Пять посылок приносят за доставку ${{A1.params.p}}$ и весят ${{A1.params.w}}$ кг; дрон поднимает не больше $W={{A1.params.W}}$ кг. Решите релаксацию по плотностям, округлите дробную посылку вниз и найдите лучшую загрузку. Укажите оценку $U$, ценность округлённой загрузки и оптимум."
   },
   "answers": [
    {
     "id": "lp",
     "ref": "answers.A1.lp",
     "label": {
      "en": "Bound $U$",
      "ru": "Оценка $U$"
     }
    },
    {
     "id": "round",
     "ref": "answers.A1.round",
     "label": {
      "en": "Rounded load",
      "ru": "Округлённая загрузка"
     }
    },
    {
     "id": "ip",
     "ref": "answers.A1.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    }
   ],
   "hints": [
    {
     "en": "Compute the densities $p_i/w_i$ first and sort them; only the order matters for the relaxation.",
     "ru": "Сначала вычислите плотности $p_i/w_i$ и упорядочьте их; для релаксации важен только порядок."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "The densities are ${{A1.ratios}}$, so the order is ${{A1.order}}$. Parcels are taken whole in this order until one no longer fits.",
      "ru": "Плотности равны ${{A1.ratios}}$, поэтому порядок такой: ${{A1.order}}$. Берём посылки целиком в этом порядке, пока очередная не перестанет помещаться."
     }
    },
    {
     "text": {
      "en": "Parcels {{A1.order.1}} and {{A1.order.2}} fit; parcel {{A1.frac}} does not, and the remaining capacity takes the fraction ${{A1.fracValue}}$ of it. The relaxed solution is $x={{A1.x}}$ with $U={{A1.lpTex}}\\approx{{A1.lp}}$.",
      "ru": "Посылки {{A1.order.1}} и {{A1.order.2}} помещаются, посылка {{A1.frac}} — нет, и оставшаяся вместимость берёт её долю ${{A1.fracValue}}$. Решение релаксации: $x={{A1.x}}$, $U={{A1.lpTex}}\\approx{{A1.lp}}$."
     }
    },
    {
     "text": {
      "en": "Rounding $x_{ {{A1.frac}} }$ down leaves a load worth ${{A1.round}}$ and a lot of free capacity. Skipping the parcel that does not fit and going on down the list gives ${{A1.skip}}$ with parcels ${{A1.skipSet}}$: better, still not optimal.",
      "ru": "Если округлить $x_{ {{A1.frac}} }$ вниз, останется загрузка ценностью ${{A1.round}}$ и много свободного места. Если пропустить непоместившуюся посылку и идти по списку дальше, получим ${{A1.skip}}$ с посылками ${{A1.skipSet}}$: лучше, но всё ещё не оптимум."
     }
    },
    {
     "text": {
      "en": "Parcels ${{A1.set}}$ weigh exactly $W$ and pay ${{A1.ip}}$. The profits are integers, so no load pays more than $\\lfloor U\\rfloor$, which is ${{A1.ip}}$ as well. The bound proves that this load is optimal.",
      "ru": "Посылки ${{A1.set}}$ весят ровно $W$ и приносят ${{A1.ip}}$. Ценности целые, поэтому никакая загрузка не приносит больше $\\lfloor U\\rfloor$, а это тоже ${{A1.ip}}$. Оценка доказывает, что эта загрузка оптимальна."
     }
    }
   ],
   "answerText": {
    "en": "$U={{A1.lpTex}}\\approx{{A1.lp}}$, the rounded load ${{A1.round}}$, the optimum ${{A1.ip}}$ with parcels ${{A1.set}}$.",
    "ru": "$U={{A1.lpTex}}\\approx{{A1.lp}}$, округлённая загрузка ${{A1.round}}$, оптимум ${{A1.ip}}$ с посылками ${{A1.set}}$."
   },
   "review": {
    "en": "The relaxation gives a bound and an order to try things in. Here the bound alone certifies the packing found by hand, with no search at all.",
    "ru": "Релаксация даёт оценку и порядок, в котором стоит пробовать. Здесь одна оценка подтверждает найденную вручную укладку, без всякого перебора."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_a1",
    "alt": {
     "en": "The capacity of the drone filled in the order of densities: whole parcels, then the fractional one; below, the optimal load.",
     "ru": "Вместимость дрона, заполненная в порядке плотностей: целые посылки, затем дробная; ниже — оптимальная загрузка."
    },
    "caption": {
     "en": "The capacity of the drone filled in the order of densities: whole parcels, then the fractional one; below, the optimal load.",
     "ru": "Вместимость дрона, заполненная в порядке плотностей: целые посылки, затем дробная; ниже — оптимальная загрузка."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "Weight and volume",
    "ru": "Вес и объём"
   },
   "statement": {
    "en": "Five boxes pay ${{A2.params.p}}$, weigh ${{A2.params.w}}$ and take volumes ${{A2.params.v}}$; the van carries weight $W={{A2.params.W}}$ and volume $V={{A2.params.V}}$. Take boxes in the order of profit per unit of weight while both limits allow, then find the best load and the value of the relaxation with both rows. Give the greedy value, the optimum and the LP bound.",
    "ru": "Пять коробок приносят ${{A2.params.p}}$, весят ${{A2.params.w}}$ и занимают объёмы ${{A2.params.v}}$; фургон везёт вес $W={{A2.params.W}}$ и объём $V={{A2.params.V}}$. Берите коробки в порядке ценности на единицу веса, пока позволяют оба предела, затем найдите лучшую загрузку и значение релаксации с обеими строками. Укажите значение жадного правила, оптимум и оценку ЛП."
   },
   "erratum": {
    "en": "Erratum: the volume limit should read $V={{A2.err.V}}$.",
    "ru": "Опечатка: предел объёма следует читать как $V={{A2.err.V}}$."
   },
   "answers": [
    {
     "id": "greedy",
     "ref": "answers.A2.greedy",
     "label": {
      "en": "Greedy",
      "ru": "Жадное правило"
     }
    },
    {
     "id": "ip",
     "ref": "answers.A2.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    },
    {
     "id": "lp",
     "ref": "answers.A2.lp",
     "label": {
      "en": "LP bound",
      "ru": "Оценка ЛП"
     }
    }
   ]
  },
  "A3": {
   "who": "students",
   "title": {
    "en": "Copies of the same item",
    "ru": "Копии одного предмета"
   },
   "statement": {
    "en": "Three kinds of item pay ${{A3.params.p}}$ and weigh ${{A3.params.w}}$, with at most $u={{A3.params.u}}$ copies of each kind; the capacity is $W={{A3.params.W}}$. Solve the relaxation $0\\le x_i\\le u$, then find the integer optimum. Give the LP bound, the optimum and the number of copies of the second kind in it.",
    "ru": "Предметы трёх видов приносят ${{A3.params.p}}$ и весят ${{A3.params.w}}$, каждого вида не больше $u={{A3.params.u}}$ копий; вместимость $W={{A3.params.W}}$. Решите релаксацию $0\\le x_i\\le u$, затем найдите целый оптимум. Укажите оценку ЛП, оптимум и число копий второго вида в нём."
   },
   "erratum": {
    "en": "Erratum: the capacity should read $W={{A3.err.W}}$.",
    "ru": "Опечатка: вместимость следует читать как $W={{A3.err.W}}$."
   },
   "answers": [
    {
     "id": "lp",
     "ref": "answers.A3.lp",
     "label": {
      "en": "LP bound",
      "ru": "Оценка ЛП"
     }
    },
    {
     "id": "ip",
     "ref": "answers.A3.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    },
    {
     "id": "x2",
     "ref": "answers.A3.x2",
     "label": {
      "en": "Copies of the second kind",
      "ru": "Копий второго вида"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "A search tree by hand",
    "ru": "Дерево перебора вручную"
   },
   "statement": {
    "en": "Profits ${{B1.params.p}}$, weights ${{B1.params.w}}$, capacity $W={{B1.params.W}}$. Run branch and bound depth first. At every node compute the density bound, branch on the fractional item with the branch $x_j=1$ first, and close a node that is infeasible, integral, or has $U(N)\\le z_{\\text{inc}}$. Count every node whose bound you compute, the root and the infeasible ones included. Give the number of nodes and the optimum.",
    "ru": "Ценности ${{B1.params.p}}$, веса ${{B1.params.w}}$, вместимость $W={{B1.params.W}}$. Проведите метод ветвей и границ в глубину. В каждом узле вычисляйте оценку по плотности, ветвитесь по дробному предмету, сначала по ветке $x_j=1$, и закрывайте узел, если он недопустим, целый или $U(N)\\le z_{\\text{inc}}$. Считайте каждый узел, для которого вычислена оценка, включая корень и недопустимые. Укажите число узлов и оптимум."
   },
   "answers": [
    {
     "id": "nodes",
     "ref": "answers.B1.nodes",
     "label": {
      "en": "Nodes",
      "ru": "Узлов"
     }
    },
    {
     "id": "ip",
     "ref": "answers.B1.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    }
   ],
   "hints": [
    {
     "en": "The density order is ${{B1.order}}$; keep it at every node and skip the fixed items.",
     "ru": "Порядок по плотности: ${{B1.order}}$; держите его в каждом узле, пропуская зафиксированные предметы."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Root: items {{B1.order.1}} and {{B1.order.2}} fit, item {{B1.order.3}} only in part, so $U={{B1.root}}\\approx{{B1.bounds.1}}$ and we branch on $x_{ {{B1.order.3}} }$.",
      "ru": "Корень: предметы {{B1.order.1}} и {{B1.order.2}} помещаются, предмет {{B1.order.3}} — лишь частично, поэтому $U={{B1.root}}\\approx{{B1.bounds.1}}$, и мы ветвимся по $x_{ {{B1.order.3}} }$."
     }
    },
    {
     "text": {
      "en": "With $x_{ {{B1.order.3}} }=1$ the bound is ${{B1.bounds.2}}$ and item {{B1.order.2}} is fractional. The branch $x_{ {{B1.order.2}} }=1$ fills the knapsack exactly with an integral relaxation: the first incumbent, $z_{\\text{inc}}={{B1.first}}$.",
      "ru": "При $x_{ {{B1.order.3}} }=1$ оценка равна ${{B1.bounds.2}}$, а дробным становится предмет {{B1.order.2}}. Ветка $x_{ {{B1.order.2}} }=1$ заполняет рюкзак ровно и даёт целую релаксацию: первый рекорд $z_{\\text{inc}}={{B1.first}}$."
     }
    },
    {
     "text": {
      "en": "The branch $x_{ {{B1.order.2}} }=0$ has $U={{B1.bounds.4}}$, above the incumbent, so we branch on item {{B1.order.4}}. Taking it overloads the knapsack (infeasible); leaving it gives $U={{B1.bounds.5}}\\le z_{\\text{inc}}$, closed by the bound.",
      "ru": "Ветка $x_{ {{B1.order.2}} }=0$ имеет $U={{B1.bounds.4}}$, выше рекорда, поэтому ветвимся по предмету {{B1.order.4}}. Если взять его, рюкзак переполнен (недопустимо); если нет, $U={{B1.bounds.5}}\\le z_{\\text{inc}}$, и узел закрыт по оценке."
     }
    },
    {
     "text": {
      "en": "Back at the root, $x_{ {{B1.order.3}} }=0$: the other three items fill the knapsack exactly, the relaxation is integral with value ${{B1.ip}}$, a new incumbent. Nothing is open, so it is optimal. The whole log: $${{B1.table}}$$",
      "ru": "Возвращаемся к корню, $x_{ {{B1.order.3}} }=0$: три остальных предмета заполняют рюкзак ровно, релаксация целая со значением ${{B1.ip}}$ — новый рекорд. Открытых узлов нет, значит, он оптимален. Весь журнал: $${{B1.table}}$$"
     }
    }
   ],
   "answerText": {
    "en": "{{B1.nodes}} nodes, the optimum ${{B1.ip}}$ with items ${{B1.set}}$.",
    "ru": "Узлов {{B1.nodes}}, оптимум ${{B1.ip}}$ с предметами ${{B1.set}}$."
   },
   "review": {
    "en": "Best bound would open $x_{ {{B1.order.3}} }=0$ right after the root, because its bound is higher, and stop after {{B1.best}} nodes. The order of the search matters as much as the bound.",
    "ru": "Поиск по лучшей оценке раскрыл бы $x_{ {{B1.order.3}} }=0$ сразу после корня, потому что там оценка выше, и остановился бы через {{B1.best}} узла. Порядок перебора важен не меньше оценки."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_b1",
    "alt": {
     "en": "The search tree: the bound in every node, the infeasible node crossed, the node closed by its bound and the two incumbents marked.",
     "ru": "Дерево перебора: оценка в каждом узле, недопустимый узел перечёркнут, узел, закрытый по оценке, и два рекорда отмечены."
    },
    "caption": {
     "en": "The search tree: the bound in every node, the infeasible node crossed, the node closed by its bound and the two incumbents marked.",
     "ru": "Дерево перебора: оценка в каждом узле, недопустимый узел перечёркнут, узел, закрытый по оценке, и два рекорда отмечены."
    }
   }
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Depth first or best bound",
    "ru": "В глубину или по лучшей оценке"
   },
   "statement": {
    "en": "Profits ${{B2.params.p}}$, weights ${{B2.params.w}}$, capacity $W={{B2.params.W}}$. Run branch and bound with the rules of B1 twice: depth first, and best bound, which always expands the open node with the largest $U$; there a child is closed as soon as its bound is computed if it is infeasible, integral or not above the incumbent. Count the nodes whose bound you compute, the root included. Give both counts and the optimum.",
    "ru": "Ценности ${{B2.params.p}}$, веса ${{B2.params.w}}$, вместимость $W={{B2.params.W}}$. Проведите метод ветвей и границ по правилам B1 дважды: в глубину и по лучшей оценке, когда всегда раскрывается открытый узел с наибольшим $U$; там потомок закрывается сразу после вычисления оценки, если он недопустим, целый или не выше рекорда. Считайте узлы, для которых вычислена оценка, включая корень. Укажите оба числа и оптимум."
   },
   "erratum": {
    "en": "Erratum: the capacity should read $W={{B2.err.W}}$.",
    "ru": "Опечатка: вместимость следует читать как $W={{B2.err.W}}$."
   },
   "answers": [
    {
     "id": "dfs",
     "ref": "answers.B2.dfs",
     "label": {
      "en": "Nodes, depth first",
      "ru": "Узлов в глубину"
     }
    },
    {
     "id": "best",
     "ref": "answers.B2.best",
     "label": {
      "en": "Nodes, best bound",
      "ru": "Узлов по лучшей оценке"
     }
    },
    {
     "id": "ip",
     "ref": "answers.B2.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    }
   ]
  },
  "B3": {
   "who": "students",
   "title": {
    "en": "One cut of Gomory",
    "ru": "Одно отсечение Гомори"
   },
   "statement": {
    "en": "Maximize $4x_1+2x_2$ subject to $6x_1+2x_2\\le{{B3.params.b.1}}$, $x_1+2x_2\\le{{B3.params.b.2}}$, $x\\ge0$ integer. Solve the relaxation, take the row of $x_1$ in the optimal tableau and derive Gomory's cut; written in $x$, it reads $x_1+x_2\\le d$. Give the LP value, $d$ and the LP value after adding the cut.",
    "ru": "Максимизируйте $4x_1+2x_2$ при $6x_1+2x_2\\le{{B3.params.b.1}}$, $x_1+2x_2\\le{{B3.params.b.2}}$, $x\\ge0$ целых. Решите релаксацию, возьмите строку $x_1$ оптимальной таблицы и выведите отсечение Гомори; в переменных $x$ оно имеет вид $x_1+x_2\\le d$. Укажите значение ЛП, $d$ и значение ЛП после добавления отсечения."
   },
   "erratum": {
    "en": "Erratum: the first constraint should read $6x_1+2x_2\\le{{B3.err.b}}$.",
    "ru": "Опечатка: первое ограничение следует читать как $6x_1+2x_2\\le{{B3.err.b}}$."
   },
   "answers": [
    {
     "id": "z",
     "ref": "answers.B3.z",
     "label": {
      "en": "LP value",
      "ru": "Значение ЛП"
     }
    },
    {
     "id": "rhs",
     "ref": "answers.B3.rhs",
     "label": {
      "en": "$d$",
      "ru": "$d$"
     }
    },
    {
     "id": "zAfter",
     "ref": "answers.B3.zAfter",
     "label": {
      "en": "LP value after the cut",
      "ru": "Значение ЛП после отсечения"
     }
    }
   ]
  },
  "C1": {
   "who": "board",
   "title": {
    "en": "The table of a small knapsack",
    "ru": "Таблица маленького рюкзака"
   },
   "statement": {
    "en": "Profits ${{C1.params.p}}$, weights ${{C1.params.w}}$, capacity $W={{C1.params.W}}$. Fill the table $D(i,c)$ for $i=0,\\dots,4$ and $c=0,\\dots,W$, read the optimum and walk back to the packing. Give $D(2,W)$ and $D(4,W)$.",
    "ru": "Ценности ${{C1.params.p}}$, веса ${{C1.params.w}}$, вместимость $W={{C1.params.W}}$. Заполните таблицу $D(i,c)$ для $i=0,\\dots,4$ и $c=0,\\dots,W$, прочитайте оптимум и пройдите назад к укладке. Укажите $D(2,W)$ и $D(4,W)$."
   },
   "answers": [
    {
     "id": "d28",
     "ref": "answers.C1.d28",
     "label": {
      "en": "$D(2,W)$",
      "ru": "$D(2,W)$"
     }
    },
    {
     "id": "opt",
     "ref": "answers.C1.opt",
     "label": {
      "en": "$D(4,W)$",
      "ru": "$D(4,W)$"
     }
    }
   ],
   "hints": [
    {
     "en": "Row $i$ copies row $i-1$ while $w_i>c$; from $c=w_i$ on compare the copy with $p_i+D(i-1,c-w_i)$.",
     "ru": "Строка $i$ повторяет строку $i-1$, пока $w_i>c$; начиная с $c=w_i$ сравнивайте копию с $p_i+D(i-1,c-w_i)$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Row $0$ is all zeros. Row $1$ jumps to $p_1$ at $c=w_1$; row $2$ adds item $2$, but items $1$ and $2$ together are too heavy, so $D(2,W)={{C1.d28}}$.",
      "ru": "Строка $0$ — одни нули. Строка $1$ подскакивает до $p_1$ при $c=w_1$; строка $2$ добавляет предмет $2$, но предметы $1$ и $2$ вместе слишком тяжелы, поэтому $D(2,W)={{C1.d28}}$."
     }
    },
    {
     "text": {
      "en": "Rows $3$ and $4$ by the same rule give the whole table: $${{C1.table}}$$ The corner is $D(4,W)={{C1.opt}}$.",
      "ru": "Строки $3$ и $4$ по тому же правилу дают всю таблицу: $${{C1.table}}$$ В углу $D(4,W)={{C1.opt}}$."
     }
    },
    {
     "text": {
      "en": "Way back from $(4,W)$: $D(4,W)=D(3,W)$, so item $4$ is out; $D(3,W)\\ne D(2,W)$, so item $3$ is in and $c$ drops by $w_3$; item $2$ is out and item $1$ is in. The packing is ${{C1.set}}$.",
      "ru": "Обратный ход от $(4,W)$: $D(4,W)=D(3,W)$, значит, предмет $4$ не взят; $D(3,W)\\ne D(2,W)$, значит, предмет $3$ взят, и $c$ уменьшается на $w_3$; предмет $2$ не взят, а предмет $1$ взят. Укладка: ${{C1.set}}$."
     }
    },
    {
     "text": {
      "en": "The density order would take item $1$, skip item $2$ and add item $4$: ${{C1.greedy}}$, one less than the optimum. The table has $(n+1)(W+1)={{C1.cells}}$ cells, each filled in constant time.",
      "ru": "Порядок по плотности взял бы предмет $1$, пропустил предмет $2$ и добавил предмет $4$: ${{C1.greedy}}$, на единицу меньше оптимума. В таблице $(n+1)(W+1)={{C1.cells}}$ клеток, каждая заполняется за постоянное время."
     }
    }
   ],
   "answerText": {
    "en": "$D(2,W)={{C1.d28}}$, $D(4,W)={{C1.opt}}$ with items ${{C1.set}}$.",
    "ru": "$D(2,W)={{C1.d28}}$, $D(4,W)={{C1.opt}}$ с предметами ${{C1.set}}$."
   },
   "review": {
    "en": "The last row answers every capacity at once, which branch and bound does not. The price is a table whose width is the value of $W$.",
    "ru": "Последняя строка отвечает сразу на все вместимости, чего ветви и границы не дают. Цена — таблица, ширина которой равна величине $W$."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_c1",
    "alt": {
     "en": "The table D(i, c) as a grid of values, with the cells of the way back highlighted.",
     "ru": "Таблица D(i, c) как сетка значений с выделенными клетками обратного хода."
    },
    "caption": {
     "en": "The table D(i, c) as a grid of values, with the cells of the way back highlighted.",
     "ru": "Таблица D(i, c) как сетка значений с выделенными клетками обратного хода."
    }
   }
  },
  "C2": {
   "who": "students",
   "title": {
    "en": "Unlimited copies",
    "ru": "Неограниченные копии"
   },
   "statement": {
    "en": "Three kinds of item, as many copies as you like, pay ${{C2.params.p}}$ and weigh ${{C2.params.w}}$; the capacity is $W={{C2.params.W}}$. Fill one row $D(c)$ for $c=0,\\dots,W$ with $D(c)=\\max\\bigl(D(c-1),\\ \\max_{i:\\,w_i\\le c}\\{p_i+D(c-w_i)\\}\\bigr)$, then compare with taking the densest kind as often as it fits and filling the rest greedily. Give $D(W)$, the number of copies of the third kind in the optimum and the greedy value.",
    "ru": "Предметы трёх видов, в любом количестве копий, приносят ${{C2.params.p}}$ и весят ${{C2.params.w}}$; вместимость $W={{C2.params.W}}$. Заполните одну строку $D(c)$ для $c=0,\\dots,W$ по правилу $D(c)=\\max\\bigl(D(c-1),\\ \\max_{i:\\,w_i\\le c}\\{p_i+D(c-w_i)\\}\\bigr)$, затем сравните с тем, чтобы брать самый плотный вид сколько влезет и дозаполнять жадно. Укажите $D(W)$, число копий третьего вида в оптимуме и значение жадного правила."
   },
   "erratum": {
    "en": "Erratum: the capacity should read $W={{C2.err.W}}$.",
    "ru": "Опечатка: вместимость следует читать как $W={{C2.err.W}}$."
   },
   "answers": [
    {
     "id": "opt",
     "ref": "answers.C2.opt",
     "label": {
      "en": "$D(W)$",
      "ru": "$D(W)$"
     }
    },
    {
     "id": "x3",
     "ref": "answers.C2.x3",
     "label": {
      "en": "Copies of the third kind",
      "ru": "Копий третьего вида"
     }
    },
    {
     "id": "greedy",
     "ref": "answers.C2.greedy",
     "label": {
      "en": "Greedy",
      "ru": "Жадное правило"
     }
    }
   ]
  },
  "C3": {
   "who": "students",
   "title": {
    "en": "Exact totals",
    "ru": "Точные суммы"
   },
   "statement": {
    "en": "Weights ${{C3.params.w}}$, each used at most once. Mark which totals $c=0,\\dots,W$ with $W={{C3.params.W}}$ can be made exactly, with one row of booleans updated for each weight from $c=W$ down to $c=w_i$. Give the number of reachable totals, $0$ included, and the largest one. Is the optimum of the knapsack with $p_i=w_i$ equal to $W$?",
    "ru": "Веса ${{C3.params.w}}$, каждый используется не больше одного раза. Отметьте, какие суммы $c=0,\\dots,W$ при $W={{C3.params.W}}$ набираются точно, с помощью одной строки логических значений, которую для каждого веса обновляем от $c=W$ вниз до $c=w_i$. Укажите число достижимых сумм, включая $0$, и наибольшую из них. Равен ли оптимум рюкзака с $p_i=w_i$ числу $W$?"
   },
   "erratum": {
    "en": "Erratum: the target should read $W={{C3.err.W}}$.",
    "ru": "Опечатка: целевую сумму следует читать как $W={{C3.err.W}}$."
   },
   "answers": [
    {
     "id": "count",
     "ref": "answers.C3.count",
     "label": {
      "en": "Reachable totals",
      "ru": "Достижимых сумм"
     }
    },
    {
     "id": "best",
     "ref": "answers.C3.best",
     "label": {
      "en": "Largest reachable",
      "ru": "Наибольшая достижимая"
     }
    }
   ]
  },
  "D1": {
   "who": "board",
   "title": {
    "en": "Three lines and two rules",
    "ru": "Три линии и два правила"
   },
   "statement": {
    "en": "Three lines make products with profit per unit ${{D1.params.p}}$; opening a line costs ${{D1.params.f}}$. A unit takes ${{D1.params.a}}$ hours of a shared crew that has ${{D1.params.H}}$ hours, and demand caps the output at ${{D1.params.u}}$. Line 1 may open only if line 2 is open, and at most two lines may open. Write the model with $y_j\\in\\{0,1\\}$ and $x_j\\ge0$, and solve it by trying the allowed $y$. Give the best profit without the two rules and with them.",
    "ru": "Три линии выпускают продукты с прибылью на единицу ${{D1.params.p}}$; открытие линии стоит ${{D1.params.f}}$. Единица продукта требует ${{D1.params.a}}$ часов общей бригады, у которой ${{D1.params.H}}$ часов, а спрос ограничивает выпуск значениями ${{D1.params.u}}$. Линия 1 может открыться, только если открыта линия 2, и открыть можно не больше двух линий. Запишите модель с $y_j\\in\\{0,1\\}$ и $x_j\\ge0$ и решите её перебором допустимых $y$. Укажите лучшую прибыль без двух правил и с ними."
   },
   "answers": [
    {
     "id": "free",
     "ref": "answers.D1.free",
     "label": {
      "en": "Without the rules",
      "ru": "Без правил"
     }
    },
    {
     "id": "logic",
     "ref": "answers.D1.logic",
     "label": {
      "en": "With the rules",
      "ru": "С правилами"
     }
    }
   ],
   "hints": [
    {
     "en": "For a fixed $y$ the rest is a continuous knapsack in crew hours: sort the open lines by profit per hour.",
     "ru": "При фиксированном $y$ остаётся непрерывный рюкзак по часам бригады: упорядочьте открытые линии по прибыли на час."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "The model: $\\max\\sum_jp_jx_j-\\sum_jf_jy_j$ subject to $\\sum_ja_jx_j\\le H$, $x_j\\le u_jy_j$, $y_1\\le y_2$, $y_1+y_2+y_3\\le2$, $x\\ge0$, $y\\in\\{0,1\\}^3$. The row $x_j\\le u_jy_j$ links the output to the line and the demand at once.",
      "ru": "Модель: $\\max\\sum_jp_jx_j-\\sum_jf_jy_j$ при $\\sum_ja_jx_j\\le H$, $x_j\\le u_jy_j$, $y_1\\le y_2$, $y_1+y_2+y_3\\le2$, $x\\ge0$, $y\\in\\{0,1\\}^3$. Строка $x_j\\le u_jy_j$ сразу связывает выпуск с линией и со спросом."
     }
    },
    {
     "text": {
      "en": "Without the rules, lines $1$ and $3$ are best: output ${{D1.freeX}}$ and profit ${{D1.free}}$. This plan breaks the first rule.",
      "ru": "Без правил лучше всего линии $1$ и $3$: выпуск ${{D1.freeX}}$ и прибыль ${{D1.free}}$. Этот план нарушает первое правило."
     }
    },
    {
     "text": {
      "en": "The patterns that obey both rules, each with its best output: $${{D1.table}}$$ The best is lines $2$ and $3$, $x={{D1.x}}$, profit ${{D1.logic}}$.",
      "ru": "Шаблоны, подчиняющиеся обоим правилам, с лучшим выпуском для каждого: $${{D1.table}}$$ Лучший — линии $2$ и $3$, $x={{D1.x}}$, прибыль ${{D1.logic}}$."
     }
    }
   ],
   "answerText": {
    "en": "Without the rules ${{D1.free}}$, with them ${{D1.logic}}$ (lines $2$ and $3$).",
    "ru": "Без правил ${{D1.free}}$, с ними ${{D1.logic}}$ (линии $2$ и $3$)."
   },
   "review": {
    "en": "Each rule is one linear row in the binaries. Enumeration over $y$ works for three lines; a solver does the same thing with branch and bound when there are thirty.",
    "ru": "Каждое правило — одна линейная строка по двоичным переменным. Перебор по $y$ годится для трёх линий; при тридцати то же самое делает солвер методом ветвей и границ."
   },
   "mistakes": []
  },
  "D2": {
   "who": "students",
   "title": {
    "en": "Neighbouring stands",
    "ru": "Соседние стенды"
   },
   "statement": {
    "en": "Four stands have values ${{D2.params.a}}$ and costs ${{D2.params.cost}}$, with budget $B={{D2.params.B}}$. Neighbours interact: the pairs $(1,2)$, $(2,3)$ and $(3,4)$ add ${{D2.params.bonus}}$ to the value when both stands of the pair are chosen. Replace each product $x_ix_{i+1}$ by a new variable with only the rows it needs, and solve. Give the optimum, the value the model reports if the pair $(2,3)$ gets only $z\\le x_2$ and $z\\le x_3$, and the number of linearizing rows you used.",
    "ru": "У четырёх стендов ценности ${{D2.params.a}}$ и стоимости ${{D2.params.cost}}$, бюджет $B={{D2.params.B}}$. Соседи влияют друг на друга: пары $(1,2)$, $(2,3)$ и $(3,4)$ добавляют к ценности ${{D2.params.bonus}}$, если выбраны оба стенда пары. Замените каждое произведение $x_ix_{i+1}$ новой переменной только с нужными ей строками и решите задачу. Укажите оптимум, значение, которое выдаст модель, если для пары $(2,3)$ оставить только $z\\le x_2$ и $z\\le x_3$, и число использованных строк линеаризации."
   },
   "erratum": {
    "en": "Erratum: the pair $(2,3)$ should add ${{D2.err.bonus}}$.",
    "ru": "Опечатка: пара $(2,3)$ должна добавлять ${{D2.err.bonus}}$."
   },
   "answers": [
    {
     "id": "ip",
     "ref": "answers.D2.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    },
    {
     "id": "wrong",
     "ref": "answers.D2.wrong",
     "label": {
      "en": "With the wrong rows",
      "ru": "С неверными строками"
     }
    },
    {
     "id": "ncons",
     "ref": "answers.D2.ncons",
     "label": {
      "en": "Linearizing rows",
      "ru": "Строк линеаризации"
     }
    }
   ]
  },
  "D3": {
   "who": "students",
   "title": {
    "en": "Two models of one warehouse problem",
    "ru": "Две модели одной задачи о складах"
   },
   "statement": {
    "en": "Two warehouses with opening costs ${{D3.params.f}}$ serve four shops; serving shop $i$ from warehouse $j$ costs $c_{ij}$, with $C={{D3.params.c}}$. Each shop is served by one open warehouse. Write the model with the aggregated rows $\\sum_ix_{ij}\\le4y_j$ and with the rows $x_{ij}\\le y_j$, solve both relaxations and the integer problem. Give the two LP values and the optimum.",
    "ru": "Два склада с затратами на открытие ${{D3.params.f}}$ обслуживают четыре магазина; обслуживание магазина $i$ со склада $j$ стоит $c_{ij}$, $C={{D3.params.c}}$. Каждый магазин обслуживает один открытый склад. Запишите модель с суммарными строками $\\sum_ix_{ij}\\le4y_j$ и со строками $x_{ij}\\le y_j$, решите обе релаксации и целочисленную задачу. Укажите оба значения ЛП и оптимум."
   },
   "erratum": {
    "en": "Erratum: the first warehouse should cost ${{D3.err.f}}$ to open.",
    "ru": "Опечатка: открытие первого склада должно стоить ${{D3.err.f}}$."
   },
   "answers": [
    {
     "id": "weak",
     "ref": "answers.D3.weak",
     "label": {
      "en": "LP, aggregated",
      "ru": "ЛП, суммарные строки"
     }
    },
    {
     "id": "strong",
     "ref": "answers.D3.strong",
     "label": {
      "en": "LP, disaggregated",
      "ru": "ЛП, раздельные строки"
     }
    },
    {
     "id": "ip",
     "ref": "answers.D3.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    }
   ]
  },
  "E1": {
   "who": "board",
   "title": {
    "en": "Four workers, four jobs",
    "ru": "Четыре работника, четыре работы"
   },
   "statement": {
    "en": "Assign four workers to four jobs, one each, with costs $C={{E1.params.C}}$ (row: worker, column: job). First let each worker in turn take the cheapest free job, then find the cheapest assignment and prove it optimal. Give both costs.",
    "ru": "Распределите четырёх работников по четырём работам, по одной на каждого, со стоимостями $C={{E1.params.C}}$ (строка — работник, столбец — работа). Сначала пусть каждый работник по очереди берёт самую дешёвую свободную работу, затем найдите самое дешёвое распределение и докажите его оптимальность. Укажите обе стоимости."
   },
   "answers": [
    {
     "id": "opt",
     "ref": "answers.E1.opt",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    },
    {
     "id": "greedy",
     "ref": "answers.E1.greedy",
     "label": {
      "en": "Greedy",
      "ru": "Жадное правило"
     }
    }
   ],
   "hints": [
    {
     "en": "For the proof look for numbers $u_i$, $v_j$ with $u_i+v_j\\le c_{ij}$ everywhere and equality on the chosen cells.",
     "ru": "Для доказательства ищите числа $u_i$, $v_j$ с $u_i+v_j\\le c_{ij}$ везде и равенством в выбранных клетках."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "Greedy by rows: the workers take jobs ${{E1.greedyPerm}}$ and the cost is ${{E1.greedy}}$. The last worker gets what is left.",
      "ru": "Жадно по строкам: работники берут работы ${{E1.greedyPerm}}$, стоимость ${{E1.greedy}}$. Последнему достаётся то, что осталось."
     }
    },
    {
     "text": {
      "en": "Trying the cheap cells of each column, the assignment ${{E1.perm}}$ costs ${{E1.opt}}$.",
      "ru": "Перебирая дешёвые клетки каждого столбца, находим распределение ${{E1.perm}}$ стоимостью ${{E1.opt}}$."
     }
    },
    {
     "text": {
      "en": "Take $u={{E1.u}}$ and $v={{E1.v}}$. Then $u_i+v_j\\le c_{ij}$ in every cell, with equality on the chosen ones. Any assignment costs at least $\\sum_iu_i+\\sum_jv_j={{E1.opt}}$, by LP duality, so this one is optimal.",
      "ru": "Возьмём $u={{E1.u}}$ и $v={{E1.v}}$. Тогда $u_i+v_j\\le c_{ij}$ во всех клетках с равенством в выбранных. Любое распределение стоит не меньше $\\sum_iu_i+\\sum_jv_j={{E1.opt}}$ по двойственности ЛП, значит, это оптимально."
     }
    },
    {
     "text": {
      "en": "The relaxation has {{E1.nVars}} variables in $[0,1]$ and eight equations; its vertices are the {{E1.nPerm}} permutation matrices. An LP solver therefore returns this assignment without any branching.",
      "ru": "У релаксации {{E1.nVars}} переменных в $[0,1]$ и восемь уравнений; её вершины — это {{E1.nPerm}} матрицы перестановок. Поэтому решатель ЛП вернёт это распределение без всякого ветвления."
     }
    }
   ],
   "answerText": {
    "en": "Greedy ${{E1.greedy}}$, optimum ${{E1.opt}}$ with jobs ${{E1.perm}}$.",
    "ru": "Жадное правило ${{E1.greedy}}$, оптимум ${{E1.opt}}$ с работами ${{E1.perm}}$."
   },
   "review": {
    "en": "The potentials $u,v$ are a dual solution, and the equality cells are complementary slackness. This is the idea of the Hungarian method.",
    "ru": "Потенциалы $u,v$ — двойственное решение, а клетки с равенством — дополняющая нежёсткость. На этой идее построен венгерский метод."
   },
   "mistakes": []
  },
  "E2": {
   "who": "students",
   "title": {
    "en": "Cameras in a ring corridor",
    "ru": "Камеры в кольцевом коридоре"
   },
   "statement": {
    "en": "A ring corridor has five corners; a camera at corner $i$ costs ${{E2.params.w}}$. The stretch between neighbouring corners, the fifth and the first included, is watched if a camera stands at either end. Write the covering model, solve its relaxation and the integer problem. Give both values.",
    "ru": "В кольцевом коридоре пять углов; камера в углу $i$ стоит ${{E2.params.w}}$. Участок между соседними углами, включая пятый и первый, просматривается, если камера стоит хотя бы на одном его конце. Запишите модель покрытия, решите её релаксацию и целочисленную задачу. Укажите оба значения."
   },
   "erratum": {
    "en": "Erratum: the camera at the fifth corner should cost ${{E2.err.w}}$.",
    "ru": "Опечатка: камера в пятом углу должна стоить ${{E2.err.w}}$."
   },
   "answers": [
    {
     "id": "lp",
     "ref": "answers.E2.lp",
     "label": {
      "en": "LP value",
      "ru": "Значение ЛП"
     }
    },
    {
     "id": "ip",
     "ref": "answers.E2.ip",
     "label": {
      "en": "Optimum",
      "ru": "Оптимум"
     }
    }
   ]
  },
  "E3": {
   "who": "students",
   "title": {
    "en": "Counting the cat model",
    "ru": "Считаем модель котов"
   },
   "statement": {
    "en": "Write the cat sudoku of block G for an $n\\times n$ board with $n={{E3.params.n}}$ as an integer program: $x_{rc}\\in\\{0,1\\}$, one equation per row, per column and per region (there are $n$ regions), and the rule that cats do not touch. Equations already keep cats in different rows and columns, so only diagonal neighbours need inequalities. Give the number of variables, of equations, of pairwise inequalities $x_{rc}+x_{r'c'}\\le1$, and of the inequalities over $2\\times2$ squares that replace them.",
    "ru": "Запишите котосудоку блока G для поля $n\\times n$ при $n={{E3.params.n}}$ как целочисленную задачу: $x_{rc}\\in\\{0,1\\}$, по уравнению на каждую строку, каждый столбец и каждую область (областей $n$) и правило, что коты не касаются. Уравнения уже разводят котов по разным строкам и столбцам, поэтому неравенства нужны только для соседей по диагонали. Укажите число переменных, уравнений, парных неравенств $x_{rc}+x_{r'c'}\\le1$ и неравенств по квадратам $2\\times2$, которые их заменяют."
   },
   "erratum": {
    "en": "Erratum: the board should be $n={{E3.err.n}}$.",
    "ru": "Опечатка: размер поля следует читать как $n={{E3.err.n}}$."
   },
   "answers": [
    {
     "id": "vars",
     "ref": "answers.E3.vars",
     "label": {
      "en": "Variables",
      "ru": "Переменных"
     }
    },
    {
     "id": "eq",
     "ref": "answers.E3.eq",
     "label": {
      "en": "Equations",
      "ru": "Уравнений"
     }
    },
    {
     "id": "pairs",
     "ref": "answers.E3.pairs",
     "label": {
      "en": "Pairwise inequalities",
      "ru": "Парных неравенств"
     }
    },
    {
     "id": "blocks",
     "ref": "answers.E3.blocks",
     "label": {
      "en": "Square inequalities",
      "ru": "Неравенств по квадратам"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
