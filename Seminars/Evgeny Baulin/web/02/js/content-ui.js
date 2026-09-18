// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 02 content: the interface strings of this seminar (titles, widgets), in English and Russian.
// Strict JSON between the markers. Placeholders in {braces} are filled by the page. They take precedence over
// the course-wide strings in shared/js/content-common.js.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "seminar": {
  "meta": {
   "seminarLabel": {
    "en": "Seminar 02",
    "ru": "Семинар 2"
   },
   "seminarTitle": {
    "en": "Convexity, Constraints and Optimality Conditions",
    "ru": "Выпуклость, ограничения и условия оптимальности"
   },
   "pageTitle": {
    "main": {
     "en": "Seminar 02: Convexity, Constraints and Optimality Conditions",
     "ru": "Семинар 2: выпуклость, ограничения и условия оптимальности"
    },
    "theory": {
     "en": "Seminar 02 theory handout",
     "ru": "Семинар 2: конспект теории"
    },
    "cheatsheet": {
     "en": "Seminar 02 cheat sheet",
     "ru": "Семинар 2: шпаргалка"
    }
   }
  },
  "blocks": {
   "ownNote": {
    "en": "Solve both problems on paper. Hints open one level at a time; a solution opens after your first answer.",
    "ru": "Решите обе задачи на бумаге. Подсказки открываются по одной; решение откроется после первого ответа."
   },
   "cutDemos": {
    "en": "Running late: skip the second demo ({d2}) first, then run the first demo without discussion ({d1}).",
    "ru": "Если не успеваем: сначала пропустите второе демо ({d2}), затем покажите первое без обсуждения ({d1})."
   }
  },
  "problem": {
   "checkRef": {
    "en": "Verified in “checks/02. Convexity, Constraints and Optimality Conditions.ipynb”: the checks named “{id}: …”",
    "ru": "Проверено в «checks/02. Convexity, Constraints and Optimality Conditions.ipynb»: проверки с названиями «{id}: …»"
   }
  },
  "widgets": {
   "lambda": {
    "en": "Multiplier $\\lambda$",
    "ru": "Множитель $\\lambda$"
   },
   "gap": {
    "en": "Distance to the optimum: $p^* - q(\\lambda) = {gap}$",
    "ru": "Расстояние до оптимума: $p^* - q(\\lambda) = {gap}$"
   },
   "hook": {
    "ball": {
     "en": "Unit ball",
     "ru": "Единичный шар"
    },
    "simplex": {
     "en": "Probability simplex $\\Delta_3$",
     "ru": "Вероятностный симплекс $\\Delta_3$"
    },
    "ballAria": {
     "en": "The unit disk with the point c and its projection",
     "ru": "Единичный круг, точка c и её проекция"
    },
    "simplexAria": {
     "en": "The simplex as a triangle with the point c and its projection",
     "ru": "Симплекс в виде треугольника, точка c и её проекция"
    },
    "cLine": {
     "en": "$c = {vec}$",
     "ru": "$c = {vec}$"
    },
    "xLine": {
     "en": "$x^* = {vec}$",
     "ru": "$x^* = {vec}$"
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or drag the point.",
     "ru": "Сделайте прогноз, затем покажите ответ или потяните точку."
    },
    "interior": {
     "en": "Interior: $c$ is feasible, so $x^* = c$ and the constraint is inactive.",
     "ru": "Внутри: $c$ допустима, поэтому $x^* = c$, и ограничение неактивно."
    },
    "boundary": {
     "en": "Boundary: $\\|c\\| = {num} > {{hook.ball.r}}$.",
     "ru": "На границе: $\\|c\\| = {num} > {{hook.ball.r}}$."
    },
    "zeros": {
     "en": "Zero coordinates: {list}.",
     "ru": "Нулевые координаты: {list}."
    },
    "noZeros": {
     "en": "No zero coordinates: $x^*$ is inside the triangle.",
     "ru": "Нулевых координат нет: $x^*$ внутри треугольника."
    }
   },
   "sets": {
    "aria": {
     "en": "The chosen set and the segment between p and q",
     "ru": "Выбранное множество и отрезок между p и q"
    },
    "disk": {
     "en": "Disk",
     "ru": "Круг"
    },
    "annulus": {
     "en": "Annulus",
     "ru": "Кольцо"
    },
    "T": {
     "en": "Disk $\\cap$ epigraph",
     "ru": "Круг $\\cap$ надграфик"
    },
    "S": {
     "en": "$\\{|xy| \\le 1\\}$",
     "ru": "$\\{|xy| \\le 1\\}$"
    },
    "points": {
     "en": "$p = {p}$, $q = {q}$",
     "ru": "$p = {p}$, $q = {q}$"
    },
    "outside": {
     "en": "Put both points inside the set.",
     "ru": "Поставьте обе точки внутрь множества."
    },
    "leaves": {
     "en": "Part of the segment leaves the set: the set is not convex.",
     "ru": "Часть отрезка выходит из множества: множество не выпукло."
    },
    "stays": {
     "en": "The whole segment stays in the set.",
     "ru": "Весь отрезок лежит в множестве."
    }
   },
   "functions": {
    "mapAria": {
     "en": "Where the Hessian is positive semidefinite, with the points p and q",
     "ru": "Область, где гессиан положительно полуопределён, и точки p и q"
    },
    "sliceAria": {
     "en": "The function along the segment from p to q and its chord",
     "ru": "Функция вдоль отрезка от p до q и её хорда"
    },
    "a1": {
     "en": "$x^2 + a\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$",
     "ru": "$x^2 + a\\,xy + {{A1.params.cyy}}y^2 + {{A1.params.bx}}x$"
    },
    "a2": {
     "en": "$x^2y^2$",
     "ru": "$x^2y^2$"
    },
    "w3": {
     "en": "${{A.widgets.w3.tex}}$",
     "ru": "${{A.widgets.w3.tex}}$"
    },
    "aLabel": {
     "en": "Parameter $a$",
     "ru": "Параметр $a$"
    },
    "random": {
     "en": "Test random pairs",
     "ru": "Проверить случайные пары"
    },
    "mid": {
     "en": "$f(m) = {fm}$, chord at the midpoint $= {avg}$",
     "ru": "$f(m) = {fm}$, хорда в середине $= {avg}$"
    },
    "violated": {
     "en": "Jensen fails for this pair: the function is not convex.",
     "ru": "Для этой пары неравенство Йенсена нарушено: функция не выпукла."
    },
    "holds": {
     "en": "Jensen holds for this pair. That alone proves nothing.",
     "ru": "Для этой пары неравенство Йенсена выполнено. Само по себе это ничего не доказывает."
    },
    "randomResult": {
     "en": "Violations on random pairs: {k} of {n}.",
     "ru": "Нарушений на случайных парах: {k} из {n}."
    },
    "legend": {
     "en": "Shaded on the left: the Hessian is positive semidefinite there. Right: the function in blue, the chord dashed.",
     "ru": "Закрашено слева: там гессиан положительно полуопределён. Справа: функция сплошной линией, хорда пунктиром."
    }
   },
   "sublevel": {
    "aria": {
     "en": "The sublevel set of the chosen function at the chosen level",
     "ru": "Множество подуровня выбранной функции на выбранном уровне"
    },
    "convex": {
     "en": "Convex function",
     "ru": "Выпуклая функция"
    },
    "nonconvex": {
     "en": "Nonconvex function",
     "ru": "Невыпуклая функция"
    },
    "level": {
     "en": "Level $\\alpha$",
     "ru": "Уровень $\\alpha$"
    },
    "fConvex": {
     "en": "$f = {tex}$ with $a = {a}$",
     "ru": "$f = {tex}$ при $a = {a}$"
    },
    "fNonconvex": {
     "en": "$f = x^2y^2$",
     "ru": "$f = x^2y^2$"
    },
    "alwaysConvex": {
     "en": "Every sublevel set of a convex function is convex.",
     "ru": "Любое множество подуровня выпуклой функции выпукло."
    },
    "neverConvex": {
     "en": "For every level $\\alpha \\ge 0$ this sublevel set is not convex.",
     "ru": "При любом уровне $\\alpha \\ge 0$ это множество подуровня не выпукло."
    }
   },
   "projections": {
    "planeAria": {
     "en": "The ball, the box and the segment of the simplex in the plane, with the projections of v",
     "ru": "Шар, брус и отрезок-симплекс на плоскости с проекциями точки v"
    },
    "triangleAria": {
     "en": "The simplex in the plane of unit sum, with the projection of v",
     "ru": "Симплекс в плоскости единичной суммы и проекция точки v"
    },
    "sum": {
     "en": "Sum $\\mathbf 1^\\top v$",
     "ru": "Сумма $\\mathbf 1^\\top v$"
    },
    "preset": {
     "en": "Load the preset of problem {id}",
     "ru": "Загрузить пресет задачи {id}"
    },
    "v2": {
     "en": "$v = {vec}$",
     "ru": "$v = {vec}$"
    },
    "ball": {
     "en": "Ball: $P_B(v) = {vec}$, distance ${d}$",
     "ru": "Шар: $P_B(v) = {vec}$, расстояние ${d}$"
    },
    "box": {
     "en": "Box: $P_Q(v) = {vec}$, distance ${d}$",
     "ru": "Брус: $P_Q(v) = {vec}$, расстояние ${d}$"
    },
    "simplex": {
     "en": "Simplex: $P_\\Delta(v) = {vec}$, distance ${d}$",
     "ru": "Симплекс: $P_\\Delta(v) = {vec}$, расстояние ${d}$"
    },
    "table": {
     "r2": {
      "en": "Sort table for the point in the plane",
      "ru": "Таблица сортировки для точки на плоскости"
     },
     "r3": {
      "en": "Sort table for the point of the triangle",
      "ru": "Таблица сортировки для точки треугольника"
     },
     "b1": {
      "en": "Sort table for problem B1",
      "ru": "Таблица сортировки для задачи B1"
     }
    },
    "vN": {
     "en": "$v = {vec}$",
     "ru": "$v = {vec}$"
    },
    "result": {
     "en": "$\\rho = {rho}$, $\\theta = {theta}$, $P_\\Delta(v) = {vec}$",
     "ru": "$\\rho = {rho}$, $\\theta = {theta}$, $P_\\Delta(v) = {vec}$"
    }
   },
   "kkt": {
    "aria": {
     "en": "The feasible region, the contours, the optimum, the gradients and the normal cone",
     "ru": "Допустимая область, линии уровня, оптимум, градиенты и нормальный конус"
    },
    "none": {
     "en": "No KKT point for this position.",
     "ru": "Для этого положения точки ККТ нет."
    },
    "c": {
     "en": "Unconstrained minimizer $c = {vec}$",
     "ru": "Безусловный минимум $c = {vec}$"
    },
    "x": {
     "en": "$x^* = {vec}$, $f^* = {f}$",
     "ru": "$x^* = {vec}$, $f^* = {f}$"
    },
    "active": {
     "en": "Active set: ${set}$",
     "ru": "Активное множество: ${set}$"
    },
    "hidden": {
     "en": "Make a prediction, then show the answer or drag the point.",
     "ru": "Сделайте прогноз, затем покажите ответ или потяните точку."
    },
    "lambda": {
     "en": "$\\lambda{i} = {val}$",
     "ru": "$\\lambda{i} = {val}$"
    },
    "colSet": {
     "en": "Active set",
     "ru": "Активные"
    },
    "colX": {
     "en": "$x$",
     "ru": "$x$"
    },
    "colLam": {
     "en": "$\\lambda$",
     "ru": "$\\lambda$"
    },
    "colFeasible": {
     "en": "Feasible",
     "ru": "Допустимо"
    },
    "colSign": {
     "en": "$\\lambda \\ge 0$",
     "ru": "$\\lambda \\ge 0$"
    }
   },
   "pgd": {
    "union": {
     "en": "Union of two disks",
     "ru": "Объединение двух кругов"
    },
    "hull": {
     "en": "Convex hull",
     "ru": "Выпуклая оболочка"
    },
    "aria": {
     "union": {
      "en": "Projected gradient runs on the union of two disks",
      "ru": "Запуски проекционного градиента на объединении двух кругов"
     },
     "hull": {
      "en": "Projected gradient runs on the convex hull of the disks",
      "ru": "Запуски проекционного градиента на выпуклой оболочке кругов"
     }
    },
    "before": {
     "en": "Press Run or click a canvas to add a starting point.",
     "ru": "Нажмите «Запустить» или щёлкните по полотну, чтобы добавить начальную точку."
    },
    "ends": {
     "union": {
      "en": "Union: {n} runs, distinct end points: {k}.",
      "ru": "Объединение: запусков {n}, различных конечных точек: {k}."
     },
     "hull": {
      "en": "Convex hull: {n} runs, distinct end points: {k}.",
      "ru": "Выпуклая оболочка: запусков {n}, различных конечных точек: {k}."
     }
    }
   },
   "d2": {
    "aria": {
     "en": "The dual function of the problem without a Slater point",
     "ru": "Двойственная функция задачи без точки Слейтера"
    },
    "q": {
     "en": "$q(\\lambda) = {q}$",
     "ru": "$q(\\lambda) = {q}$"
    }
   },
   "d3": {
    "aria": {
     "en": "The dual function of problem C1 and the primal optimum",
     "ru": "Двойственная функция задачи C1 и оптимум прямой задачи"
    },
    "q": {
     "en": "$q(\\lambda) = {q}$",
     "ru": "$q(\\lambda) = {q}$"
    },
    "lineAria": {
     "en": "The Boolean problem on a number line: feasible values, the primal and the dual optimum",
     "ru": "Булева задача на числовой прямой: значения в допустимых точках, оптимумы прямой и двойственной задач"
    },
    "predictBool": {
     "en": "Will $d^*$ reach $p^*$ here?",
     "ru": "Достигнет ли здесь $d^*$ значения $p^*$?"
    }
   }
  }
 }
}/*JSON-END*/);
