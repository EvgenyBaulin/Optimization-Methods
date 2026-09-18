// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 02 content: the nine problems, in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar02_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "check": "A1",
   "title": {
    "en": "Convexity of a quadratic family",
    "ru": "Выпуклость семейства квадратичных функций"
   },
   "skill": {
    "en": "The Hessian test, principal minors and a Jensen spot check",
    "ru": "Критерий через гессиан, главные миноры и проверка неравенства Йенсена"
   },
   "statement": {
    "en": "Let $f(x,y) = {{A1.tex.f}}$. **(a)** For which $a$ is $f$ convex on $\\mathbb R^2$, and for which is it strictly convex? **(b)** Take $a = {{A1.params.aTest}}$ and check the Jensen inequality at the midpoint of $p = {{A1.params.p}}$ and $q = {{A1.params.q}}$.",
    "ru": "Пусть $f(x,y) = {{A1.tex.f}}$. **а)** При каких $a$ функция $f$ выпукла на $\\mathbb R^2$, а при каких строго выпукла? **б)** Возьмите $a = {{A1.params.aTest}}$ и проверьте неравенство Йенсена в середине отрезка с концами $p = {{A1.params.p}}$ и $q = {{A1.params.q}}$."
   },
   "steps": [
    {
     "text": {
      "en": "The linear term ${{A1.params.bx}}x$ has zero second derivatives, and the cross term $a\\,xy$ puts $a$ into **both** off-diagonal entries: $$H = {{A1.tex.H}}.$$ The Hessian is the same at every point.",
      "ru": "Линейное слагаемое ${{A1.params.bx}}x$ не даёт вторых производных, а смешанное слагаемое $a\\,xy$ записывает $a$ в **оба** внедиагональных элемента: $$H = {{A1.tex.H}}.$$ Гессиан одинаков во всех точках."
     }
    },
    {
     "text": {
      "en": "Convex $\\iff H \\succeq 0$. For semidefiniteness check **all** principal minors: $H_{11} = {{A1.steps.minor11}} \\ge 0$, $H_{22} = {{A1.steps.minor22}} \\ge 0$, $\\det H = {{A1.tex.det}} \\ge 0$. So $f$ is convex exactly when $|a| \\le {{A1.params.aEdge}}$.",
      "ru": "Выпуклость $\\iff H \\succeq 0$. Для полуопределённости проверяем **все** главные миноры: $H_{11} = {{A1.steps.minor11}} \\ge 0$, $H_{22} = {{A1.steps.minor22}} \\ge 0$, $\\det H = {{A1.tex.det}} \\ge 0$. Значит, $f$ выпукла ровно при $|a| \\le {{A1.params.aEdge}}$."
     },
     "predict": {
      "en": "Guess the range of $a$ before the minors: is it symmetric in $a$?",
      "ru": "Угадайте ответ до вычисления миноров: симметричен ли он по $a$?"
     }
    },
    {
     "text": {
      "en": "Strict convexity: $H \\succ 0$, and for definiteness the leading minors are enough: $H_{11} > 0$ and ${{A1.tex.det}} > 0$, so $|a| < {{A1.params.aEdge}}$. For a quadratic function, strictly convex means exactly $H \\succ 0$.",
      "ru": "Строгая выпуклость: $H \\succ 0$, а для определённости достаточно угловых миноров: $H_{11} > 0$ и ${{A1.tex.det}} > 0$, то есть $|a| < {{A1.params.aEdge}}$. Для квадратичной функции строгая выпуклость равносильна $H \\succ 0$."
     }
    },
    {
     "text": {
      "en": "The boundary case $a = {{A1.params.aEdge}}$: $f = {{A1.tex.fEdge}}$, the eigenvalues of $H$ are ${{A1.steps.eigEdge.1}}$ and ${{A1.steps.eigEdge.2}}$, and along $d = {{A1.steps.nullDir}}$ the function is linear: $f(sd) = {{A1.steps.lineSlope}}s$. Convex, but not strictly.",
      "ru": "Граничный случай $a = {{A1.params.aEdge}}$: $f = {{A1.tex.fEdge}}$, собственные значения $H$ равны ${{A1.steps.eigEdge.1}}$ и ${{A1.steps.eigEdge.2}}$, а вдоль $d = {{A1.steps.nullDir}}$ функция линейна: $f(sd) = {{A1.steps.lineSlope}}s$. Выпукла, но не строго."
     }
    },
    {
     "text": {
      "en": "Jensen at $a = {{A1.params.aTest}}$: $f(p) = {{A1.steps.fp}}$, $f(q) = {{A1.steps.fq}}$, and at the midpoint $m = {{A1.steps.m}}$ we get $f(m) = {{A1.tex.fm}}$. The chord gives $\\tfrac12\\big(f(p) + f(q)\\big) = {{A1.steps.avg}} < f(m)$: the inequality fails, so $f$ is not convex, as step 2 predicts.",
      "ru": "Йенсен при $a = {{A1.params.aTest}}$: $f(p) = {{A1.steps.fp}}$, $f(q) = {{A1.steps.fq}}$, а в середине $m = {{A1.steps.m}}$ получаем $f(m) = {{A1.tex.fm}}$. Хорда даёт $\\tfrac12\\big(f(p) + f(q)\\big) = {{A1.steps.avg}} < f(m)$: неравенство нарушено, $f$ не выпукла, как и предсказывал второй шаг."
     },
     "predict": {
      "en": "At $a = {{A1.params.aTest}}$, will the midpoint lie above or below the chord?",
      "ru": "При $a = {{A1.params.aTest}}$ середина окажется выше хорды или ниже?"
     }
    },
    {
     "text": {
      "en": "Why it fails: for a quadratic, $(1-t)f(p) + t f(q) - f\\big((1-t)p + tq\\big) = \\frac{t(1-t)}{2}\\, d^\\top H d$ with $d = q - p$. Here $d^\\top H d = {{A1.steps.curv}} < 0$: along $d$ the function is concave.",
      "ru": "Почему так: для квадратичной функции $(1-t)f(p) + t f(q) - f\\big((1-t)p + tq\\big) = \\frac{t(1-t)}{2}\\, d^\\top H d$, где $d = q - p$. Здесь $d^\\top H d = {{A1.steps.curv}} < 0$: вдоль $d$ функция вогнута."
     }
    }
   ],
   "answerText": {
    "en": "Convex for $|a| \\le {{A1.params.aEdge}}$, strictly convex for $|a| < {{A1.params.aEdge}}$. At $a = {{A1.params.aTest}}$ Jensen fails: $f(m) = {{A1.tex.fm}} > {{A1.steps.avg}}$.",
    "ru": "Выпукла при $|a| \\le {{A1.params.aEdge}}$, строго выпукла при $|a| < {{A1.params.aEdge}}$. При $a = {{A1.params.aTest}}$ неравенство Йенсена нарушено: $f(m) = {{A1.tex.fm}} > {{A1.steps.avg}}$."
   },
   "answers": [
    {
     "id": "interval",
     "ref": "A1.answer.interval",
     "label": {
      "en": "Values of $a$ for which $f$ is convex",
      "ru": "Значения $a$, при которых $f$ выпукла"
     }
    },
    {
     "id": "det",
     "ref": "A1.answer.det",
     "label": {
      "en": "$\\det H$ as a formula in $a$",
      "ru": "$\\det H$ как формула от $a$"
     }
    },
    {
     "id": "fm",
     "ref": "A1.answer.fm",
     "label": {
      "en": "$f(m)$ at $a = {{A1.params.aTest}}$",
      "ru": "$f(m)$ при $a = {{A1.params.aTest}}$"
     }
    }
   ],
   "hints": [
    {
     "en": "Write the Hessian first. Does it depend on $(x, y)$?",
     "ru": "Сначала выпишите гессиан. Зависит ли он от $(x, y)$?"
    },
    {
     "en": "Convexity needs $H \\succeq 0$: check that $H_{11}$, $H_{22}$ and $\\det H$ are all nonnegative.",
     "ru": "Для выпуклости нужно $H \\succeq 0$: проверьте, что $H_{11}$, $H_{22}$ и $\\det H$ неотрицательны."
    }
   ],
   "mistakes": [
    {
     "en": "Putting $a/2$ into the Hessian. The entry $a/2$ belongs to the matrix $A$ in $f = z^\\top A z$; the Hessian entry is $\\partial^2 f/\\partial x\\,\\partial y = a$.",
     "ru": "Записать в гессиан $a/2$. Число $a/2$ стоит в матрице $A$ из записи $f = z^\\top A z$, а элемент гессиана равен $\\partial^2 f/\\partial x\\,\\partial y = a$."
    },
    {
     "en": "Deciding semidefiniteness by the leading minors only. They decide $H \\succ 0$; for $H \\succeq 0$ every principal minor must be nonnegative.",
     "ru": "Судить о полуопределённости только по угловым минорам. Они решают вопрос о $H \\succ 0$, а для $H \\succeq 0$ неотрицательными должны быть все главные миноры."
    }
   ]
  },
  "A2": {
   "who": "students",
   "check": "A2",
   "title": {
    "en": "A product of squares is not convex",
    "ru": "Произведение квадратов не выпукло"
   },
   "skill": {
    "en": "Hessian test at a point and a Jensen counterexample",
    "ru": "Гессиан в точке и контрпример к неравенству Йенсена"
   },
   "statement": {
    "en": "Show in two independent ways that $f(x,y) = {{A2.tex.f}}$ is not convex on $\\mathbb R^2$: **(a)** compute the Hessian and its determinant at the point ${{A2.params.point}}$; **(b)** check the Jensen inequality for $p = {{A2.params.p}}$ and $q = {{A2.params.q}}$ at their midpoint.",
    "ru": "Покажите двумя независимыми способами, что $f(x,y) = {{A2.tex.f}}$ не выпукла на $\\mathbb R^2$: **а)** найдите гессиан и его определитель в точке ${{A2.params.point}}$; **б)** проверьте неравенство Йенсена для $p = {{A2.params.p}}$ и $q = {{A2.params.q}}$ в их середине."
   },
   "steps": [
    {
     "text": {
      "en": "Differentiate twice: $$H(x,y) = {{A2.tex.H}}.$$ Unlike A1, the Hessian changes from point to point.",
      "ru": "Дифференцируем дважды: $$H(x,y) = {{A2.tex.H}}.$$ В отличие от A1, гессиан меняется от точки к точке."
     }
    },
    {
     "text": {
      "en": "$\\det H = {{A2.tex.detGeneral}} < 0$ whenever $xy \\ne 0$, so the eigenvalues have opposite signs and $H$ is indefinite. At ${{A2.params.point}}$: $H = {{A2.tex.HPoint}}$, $\\det H = {{A2.steps.detPoint}}$, eigenvalues ${{A2.steps.eig.1}}$ and ${{A2.steps.eig.2}}$.",
      "ru": "$\\det H = {{A2.tex.detGeneral}} < 0$ при $xy \\ne 0$, поэтому собственные значения разных знаков и $H$ знаконеопределён. В точке ${{A2.params.point}}$: $H = {{A2.tex.HPoint}}$, $\\det H = {{A2.steps.detPoint}}$, собственные значения ${{A2.steps.eig.1}}$ и ${{A2.steps.eig.2}}$."
     },
     "predict": {
      "en": "Will the determinant be positive or negative?",
      "ru": "Определитель окажется положительным или отрицательным?"
     }
    },
    {
     "text": {
      "en": "A convex $C^2$ function needs $H \\succeq 0$ **everywhere**, so $f$ is not convex.",
      "ru": "У выпуклой функции класса $C^2$ гессиан $H \\succeq 0$ **всюду**, значит, $f$ не выпукла."
     }
    },
    {
     "text": {
      "en": "Jensen: $f(p) = f(q) = 0$, the midpoint is $m = {{A2.steps.m}}$, and $f(m) = {{A2.tex.fm}} > 0 = \\tfrac12\\big(f(p) + f(q)\\big)$. The inequality fails: a second proof that needs no derivatives.",
      "ru": "Йенсен: $f(p) = f(q) = 0$, середина $m = {{A2.steps.m}}$, и $f(m) = {{A2.tex.fm}} > 0 = \\tfrac12\\big(f(p) + f(q)\\big)$. Неравенство нарушено: второе доказательство, уже без производных."
     },
     "predict": {
      "en": "Is $f(m)$ above or below the chord?",
      "ru": "Значение $f(m)$ выше хорды или ниже?"
     }
    },
    {
     "text": {
      "en": "On the axes $xy = 0$ the Hessian is $\\operatorname{diag}(2y^2,\\ 2x^2) \\succeq 0$: a test at a single point of an axis would miss the problem.",
      "ru": "На осях $xy = 0$ гессиан равен $\\operatorname{diag}(2y^2,\\ 2x^2) \\succeq 0$: проверка в одной точке на оси не заметила бы невыпуклости."
     }
    }
   ],
   "answerText": {
    "en": "$\\det H = {{A2.steps.detPoint}}$ at ${{A2.params.point}}$, so $H$ is indefinite there; $f(m) = {{A2.tex.fm}} > 0$ violates Jensen. Not convex.",
    "ru": "В точке ${{A2.params.point}}$ $\\det H = {{A2.steps.detPoint}}$, гессиан знаконеопределён; $f(m) = {{A2.tex.fm}} > 0$ нарушает неравенство Йенсена. Функция не выпукла."
   },
   "answers": [
    {
     "id": "det",
     "ref": "A2.answer.det",
     "label": {
      "en": "$\\det H$ at the point ${{A2.params.point}}$",
      "ru": "$\\det H$ в точке ${{A2.params.point}}$"
     }
    },
    {
     "id": "fm",
     "ref": "A2.answer.fm",
     "label": {
      "en": "$f(m)$ at the midpoint of $p$ and $q$",
      "ru": "$f(m)$ в середине отрезка между $p$ и $q$"
     }
    },
    {
     "id": "convex",
     "ref": "A2.answer.convex",
     "label": {
      "en": "Is $f$ convex on $\\mathbb R^2$?",
      "ru": "Выпукла ли $f$ на $\\mathbb R^2$?"
     },
     "options": [
      {
       "id": "yes",
       "label": {
        "en": "Yes",
        "ru": "Да"
       }
      },
      {
       "id": "no",
       "label": {
        "en": "No",
        "ru": "Нет"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "The mixed derivative $\\partial^2 f/\\partial x\\,\\partial y$ is not zero: differentiate $x^2y^2$ once in $x$ and once in $y$.",
     "ru": "Смешанная производная $\\partial^2 f/\\partial x\\,\\partial y$ не равна нулю: продифференцируйте $x^2y^2$ один раз по $x$ и один раз по $y$."
    },
    {
     "en": "For (b), compare $f$ at the midpoint with the average of $f(p)$ and $f(q)$; both of these are zero.",
     "ru": "В пункте б) сравните $f$ в середине с полусуммой $f(p)$ и $f(q)$; обе величины равны нулю."
    }
   ],
   "mistakes": [
    {
     "en": "Evaluating the Hessian only at the origin, where it is the zero matrix, and concluding convexity.",
     "ru": "Посчитать гессиан только в начале координат, где он нулевой, и объявить функцию выпуклой."
    },
    {
     "en": "Treating one pair that satisfies Jensen as a proof of convexity: only a violation proves something.",
     "ru": "Считать одну пару, для которой Йенсен выполнен, доказательством выпуклости: доказывает только нарушение."
    }
   ],
   "review": {
    "en": "Stress the two independent certificates: an indefinite Hessian at one point and one violating pair. Either is enough.",
    "ru": "Подчеркните два независимых сертификата: знаконеопределённый гессиан в одной точке и одна нарушающая пара. Хватает любого из них."
   }
  },
  "A3": {
   "who": "students",
   "check": "A3",
   "title": {
    "en": "Sublevel sets and intersections",
    "ru": "Множества подуровня и пересечения"
   },
   "skill": {
    "en": "Convexity of sets: a counterexample pair, sublevel sets, intersections",
    "ru": "Выпуклость множеств: контрпример из двух точек, множества подуровня, пересечения"
   },
   "statement": {
    "en": "Which of the sets are convex: $S = {{A3.tex.S}}$ and $T = {{A3.tex.T}}$? For a set that is not convex, give two of its points whose midpoint lies outside it; for a convex set, justify the answer in one line.",
    "ru": "Какие из множеств выпуклы: $S = {{A3.tex.S}}$ и $T = {{A3.tex.T}}$? Для невыпуклого множества укажите две его точки, середина между которыми лежит вне множества; для выпуклого обоснуйте ответ одной строкой."
   },
   "steps": [
    {
     "text": {
      "en": "$S = \\{|xy| \\le 1\\}$ is the region between the four branches of the hyperbolas $xy = \\pm 1$. It contains both axes and looks like a cross.",
      "ru": "$S = \\{|xy| \\le 1\\}$ — область между четырьмя ветвями гипербол $xy = \\pm 1$. Она содержит обе оси и похожа на крест."
     }
    },
    {
     "text": {
      "en": "Take two points on the branch $xy = 1$: $p = {{A3.tex.pHalf}}$ and $q = {{A3.tex.qHalf}}$. Both lie in $S$.",
      "ru": "Возьмём две точки на ветви $xy = 1$: $p = {{A3.tex.pHalf}}$ и $q = {{A3.tex.qHalf}}$. Обе лежат в $S$."
     }
    },
    {
     "text": {
      "en": "The midpoint is $m = {{A3.tex.mid}}$, where $xy = {{A3.tex.xyMid}}$ and $x^2y^2 = {{A3.tex.val}} > 1$. So $m \\notin S$, and $S$ is not convex.",
      "ru": "Середина $m = {{A3.tex.mid}}$, в ней $xy = {{A3.tex.xyMid}}$ и $x^2y^2 = {{A3.tex.val}} > 1$. Значит, $m \\notin S$ и $S$ не выпукло."
     },
     "predict": {
      "en": "Is the midpoint of $p$ and $q$ in $S$?",
      "ru": "Лежит ли середина между $p$ и $q$ в $S$?"
     }
    },
    {
     "text": {
      "en": "$S$ is a sublevel set of $x^2y^2$, which is not convex (A2). A sublevel set of a nonconvex function may or may not be convex, so the set itself has to be checked.",
      "ru": "$S$ — множество подуровня функции $x^2y^2$, которая не выпукла (A2). Множество подуровня невыпуклой функции может оказаться как выпуклым, так и невыпуклым, поэтому проверять нужно само множество."
     }
    },
    {
     "text": {
      "en": "$T$: the disk is a sublevel set of the convex function $x^2 + y^2$, and $\\{y \\ge x^2 - {{A3.params.shift}}\\}$ is the epigraph of the convex function $x^2 - {{A3.params.shift}}$. Both are convex, and an intersection of convex sets is convex.",
      "ru": "$T$: круг — множество подуровня выпуклой функции $x^2 + y^2$, а $\\{y \\ge x^2 - {{A3.params.shift}}\\}$ — надграфик выпуклой функции $x^2 - {{A3.params.shift}}$. Оба множества выпуклы, а пересечение выпуклых множеств выпукло."
     }
    }
   ],
   "answerText": {
    "en": "$T$ is convex, $S$ is not: $p = {{A3.tex.pHalf}}$ and $q = {{A3.tex.qHalf}}$ lie in $S$, their midpoint does not.",
    "ru": "$T$ выпукло, $S$ — нет: $p = {{A3.tex.pHalf}}$ и $q = {{A3.tex.qHalf}}$ лежат в $S$, а их середина нет."
   },
   "answers": [
    {
     "id": "convexSets",
     "ref": "A3.answer.convexSets",
     "label": {
      "en": "Which sets are convex?",
      "ru": "Какие множества выпуклы?"
     },
     "options": [
      {
       "id": "S",
       "label": {
        "en": "$S$",
        "ru": "$S$"
       }
      },
      {
       "id": "T",
       "label": {
        "en": "$T$",
        "ru": "$T$"
       }
      }
     ]
    },
    {
     "id": "pair",
     "ref": "A3.answer.pair",
     "label": {
      "en": "Which pair proves that $S$ is not convex?",
      "ru": "Какая пара доказывает, что $S$ не выпукло?"
     },
     "options": [
      {
       "id": "p1",
       "label": {
        "en": "${{A3.params.pairs.p1.p}}$ and ${{A3.params.pairs.p1.q}}$",
        "ru": "${{A3.params.pairs.p1.p}}$ и ${{A3.params.pairs.p1.q}}$"
       }
      },
      {
       "id": "p2",
       "label": {
        "en": "${{A3.params.pairs.p2.p}}$ and ${{A3.params.pairs.p2.q}}$",
        "ru": "${{A3.params.pairs.p2.p}}$ и ${{A3.params.pairs.p2.q}}$"
       }
      },
      {
       "id": "p3",
       "label": {
        "en": "${{A3.params.pairs.p3.p}}$ and ${{A3.params.pairs.p3.q}}$",
        "ru": "${{A3.params.pairs.p3.p}}$ и ${{A3.params.pairs.p3.q}}$"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "For $S$, look at the boundary curve $xy = 1$ in the first quadrant: it bends towards the origin.",
     "ru": "Для $S$ посмотрите на граничную кривую $xy = 1$ в первой четверти: она прогибается к началу координат."
    },
    {
     "en": "Try $p = {{A3.tex.pHalf}}$ and $q = {{A3.tex.qHalf}}$. For $T$, name the convex functions behind both pieces.",
     "ru": "Попробуйте $p = {{A3.tex.pHalf}}$ и $q = {{A3.tex.qHalf}}$. Для $T$ назовите выпуклые функции, которые задают обе части."
    }
   ],
   "mistakes": [
    {
     "en": "Calling $S$ convex because it is a sublevel set: the rule needs a convex function.",
     "ru": "Объявить $S$ выпуклым, потому что это множество подуровня: правило работает только для выпуклой функции."
    },
    {
     "en": "Testing the pair ${{A3.params.pairs.p2.p}}$, ${{A3.params.pairs.p2.q}}$: its midpoint is the origin, which lies in $S$, so it proves nothing.",
     "ru": "Проверять пару ${{A3.params.pairs.p2.p}}$, ${{A3.params.pairs.p2.q}}$: её середина — начало координат, оно лежит в $S$, и пара ничего не доказывает."
    }
   ],
   "review": {
    "en": "Draw $S$ on the board. Ask for a pair before showing one, and contrast the two rules: sublevel sets of convex functions, and intersections.",
    "ru": "Нарисуйте $S$ на доске. Сначала попросите пару у аудитории, потом покажите свою и сопоставьте два правила: множества подуровня выпуклых функций и пересечения."
   }
  },
  "B1": {
   "who": "board",
   "check": "B1",
   "title": {
    "en": "Projection onto the simplex, step by step",
    "ru": "Проекция на симплекс по шагам"
   },
   "skill": {
    "en": "The sort-based algorithm for the probability simplex and the obtuse-angle check",
    "ru": "Сортировочный алгоритм проекции на вероятностный симплекс и проверка тупого угла"
   },
   "statement": {
    "en": "Project $v = {{B1.params.v}}$ onto the probability simplex $\\Delta_4 = \\{x \\in \\mathbb R^4:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$ with the sort-based algorithm. Then check the sum of the result and the obtuse-angle property.",
    "ru": "Спроецируйте $v = {{B1.params.v}}$ на вероятностный симплекс $\\Delta_4 = \\{x \\in \\mathbb R^4:\\ x \\ge 0,\\ \\mathbf 1^\\top x = 1\\}$ сортировочным алгоритмом. Затем проверьте сумму координат результата и свойство тупого угла."
   },
   "steps": [
    {
     "text": {
      "en": "Sort in decreasing order: $u = {{B1.steps.u}}$.",
      "ru": "Сортируем по убыванию: $u = {{B1.steps.u}}$."
     }
    },
    {
     "text": {
      "en": "Cumulative sums $s_j = u_1 + \\dots + u_j$: $s = {{B1.steps.s}}$.",
      "ru": "Накопленные суммы $s_j = u_1 + \\dots + u_j$: $s = {{B1.steps.s}}$."
     }
    },
    {
     "text": {
      "en": "Test values $t_j = u_j - \\dfrac{s_j - 1}{j}$; the first one always equals $1$.",
      "ru": "Пробные значения $t_j = u_j - \\dfrac{s_j - 1}{j}$; первое всегда равно $1$."
     },
     "table": "B1"
    },
    {
     "text": {
      "en": "$\\rho$ is the last $j$ with $t_j > 0$: $\\rho = {{B1.steps.rho}}$. The shift is $\\theta = \\dfrac{s_\\rho - 1}{\\rho} = {{B1.steps.theta}}$.",
      "ru": "$\\rho$ — последний номер с $t_j > 0$: $\\rho = {{B1.steps.rho}}$. Сдвиг $\\theta = \\dfrac{s_\\rho - 1}{\\rho} = {{B1.steps.theta}}$."
     },
     "predict": {
      "en": "How many coordinates of the projection stay positive?",
      "ru": "Сколько координат проекции останутся положительными?"
     }
    },
    {
     "text": {
      "en": "Subtract and clip, in the **original** order: $x = \\max(v - \\theta,\\ 0) = {{B1.steps.x}}$.",
      "ru": "Вычитаем и обрезаем по нулю в **исходном** порядке: $x = \\max(v - \\theta,\\ 0) = {{B1.steps.x}}$."
     }
    },
    {
     "text": {
      "en": "Checks: $\\mathbf 1^\\top x = {{B1.steps.sumX}}$. With $r = v - x = {{B1.steps.r}}$, the expression $r^\\top(y - x)$ is linear in $y$, so it is enough to test the vertices $e_k$: $r^\\top(e_k - x) = r_k - r^\\top x$ with $r^\\top x = {{B1.steps.rx}}$ gives ${{B1.steps.vertex}}$, all $\\le 0$.",
      "ru": "Проверки: $\\mathbf 1^\\top x = {{B1.steps.sumX}}$. Пусть $r = v - x = {{B1.steps.r}}$. Выражение $r^\\top(y - x)$ линейно по $y$, поэтому достаточно проверить вершины $e_k$: $r^\\top(e_k - x) = r_k - r^\\top x$, где $r^\\top x = {{B1.steps.rx}}$, даёт ${{B1.steps.vertex}}$, все $\\le 0$."
     }
    }
   ],
   "answerText": {
    "en": "$\\theta = {{B1.steps.theta}}$ and $P_{\\Delta}(v) = {{B1.steps.x}}$.",
    "ru": "$\\theta = {{B1.steps.theta}}$ и $P_{\\Delta}(v) = {{B1.steps.x}}$."
   },
   "answers": [
    {
     "id": "x",
     "ref": "B1.answer.x",
     "label": {
      "en": "The projection $P_\\Delta(v)$",
      "ru": "Проекция $P_\\Delta(v)$"
     },
     "components": [
      {
       "en": "$x_1$",
       "ru": "$x_1$"
      },
      {
       "en": "$x_2$",
       "ru": "$x_2$"
      },
      {
       "en": "$x_3$",
       "ru": "$x_3$"
      },
      {
       "en": "$x_4$",
       "ru": "$x_4$"
      }
     ]
    },
    {
     "id": "theta",
     "ref": "B1.answer.theta",
     "label": {
      "en": "The shift $\\theta$",
      "ru": "Сдвиг $\\theta$"
     }
    }
   ],
   "hints": [
    {
     "en": "Sort first, then build the cumulative sums; remember the original positions for the last step.",
     "ru": "Сначала отсортируйте, потом постройте накопленные суммы; запомните исходные позиции для последнего шага."
    },
    {
     "en": "Stop at the last positive test value and use $s_\\rho$ from that row.",
     "ru": "Остановитесь на последнем положительном пробном значении и возьмите $s_\\rho$ из этой строки."
    }
   ],
   "mistakes": [
    {
     "en": "Returning the sorted vector instead of restoring the original order of the coordinates.",
     "ru": "Выдать отсортированный вектор вместо того, чтобы вернуть координаты в исходный порядок."
    },
    {
     "en": "Subtracting $\\theta$ without clipping at zero, which leaves negative coordinates.",
     "ru": "Вычесть $\\theta$ и забыть обрезать по нулю: остаются отрицательные координаты."
    }
   ]
  },
  "B2": {
   "who": "students",
   "check": "B2",
   "title": {
    "en": "One point, a ball and a box",
    "ru": "Одна точка, шар и брус"
   },
   "skill": {
    "en": "Closed-form projections onto a ball and a box",
    "ru": "Проекции на шар и на брус в явном виде"
   },
   "statement": {
    "en": "Project $x = {{B2.params.x}}$ onto the ball $B = \\{z:\\ \\|z\\| \\le {{B2.params.r}}\\}$ and onto the box $Q = [{{B2.params.lo}},\\ {{B2.params.hi}}]^2$. Which projection is closer to $x$, and could you predict that without computing?",
    "ru": "Спроецируйте $x = {{B2.params.x}}$ на шар $B = \\{z:\\ \\|z\\| \\le {{B2.params.r}}\\}$ и на брус $Q = [{{B2.params.lo}};\\ {{B2.params.hi}}]^2$. Какая проекция ближе к $x$ и можно ли было предсказать это без вычислений?"
   },
   "steps": [
    {
     "text": {
      "en": "Ball: $\\|x\\|^2 = {{B2.steps.norm2}}$, so $\\|x\\| = {{B2.steps.norm}} > {{B2.params.r}}$, the point is outside, and $P_B(x) = \\dfrac{x}{\\|x\\|} = {{B2.steps.ball}}$.",
      "ru": "Шар: $\\|x\\|^2 = {{B2.steps.norm2}}$, значит, $\\|x\\| = {{B2.steps.norm}} > {{B2.params.r}}$, точка снаружи и $P_B(x) = \\dfrac{x}{\\|x\\|} = {{B2.steps.ball}}$."
     }
    },
    {
     "text": {
      "en": "Box: clip every coordinate to $[{{B2.params.lo}},\\ {{B2.params.hi}}]$ independently: $P_Q(x) = {{B2.steps.box}}$. Only the coordinate that is out of range changes.",
      "ru": "Брус: обрезаем каждую координату до $[{{B2.params.lo}};\\ {{B2.params.hi}}]$ независимо: $P_Q(x) = {{B2.steps.box}}$. Меняется только координата, вышедшая за границы."
     }
    },
    {
     "text": {
      "en": "Distances: $\\|x - P_B(x)\\| = {{B2.steps.distBall}}$ and $\\|x - P_Q(x)\\| = {{B2.steps.distBox}}$.",
      "ru": "Расстояния: $\\|x - P_B(x)\\| = {{B2.steps.distBall}}$ и $\\|x - P_Q(x)\\| = {{B2.steps.distBox}}$."
     },
     "predict": {
      "en": "Which of the two sets is closer to $x$?",
      "ru": "Какое из двух множеств ближе к $x$?"
     }
    },
    {
     "text": {
      "en": "The prediction: $B \\subset Q$, so the distance to $Q$ cannot exceed the distance to $B$. The projections themselves differ: the ball moves both coordinates, the box only one.",
      "ru": "Предсказание: $B \\subset Q$, поэтому расстояние до $Q$ не больше расстояния до $B$. Сами проекции разные: шар сдвигает обе координаты, брус — одну."
     }
    },
    {
     "text": {
      "en": "Obtuse-angle check: for $y = {{B2.steps.yBall}} \\in B$, $(x - P_B(x))^\\top(y - P_B(x)) = {{B2.steps.obtuseBall}} \\le 0$; for $y = {{B2.steps.yBox}} \\in Q$, $(x - P_Q(x))^\\top(y - P_Q(x)) = {{B2.steps.obtuseBox}} \\le 0$.",
      "ru": "Проверка тупого угла: для $y = {{B2.steps.yBall}} \\in B$ имеем $(x - P_B(x))^\\top(y - P_B(x)) = {{B2.steps.obtuseBall}} \\le 0$; для $y = {{B2.steps.yBox}} \\in Q$ имеем $(x - P_Q(x))^\\top(y - P_Q(x)) = {{B2.steps.obtuseBox}} \\le 0$."
     }
    }
   ],
   "answerText": {
    "en": "$P_B(x) = {{B2.steps.ball}}$, $P_Q(x) = {{B2.steps.box}}$. The box is closer: ${{B2.steps.distBox}} < {{B2.steps.distBall}}$, because $B \\subset Q$.",
    "ru": "$P_B(x) = {{B2.steps.ball}}$, $P_Q(x) = {{B2.steps.box}}$. Брус ближе: ${{B2.steps.distBox}} < {{B2.steps.distBall}}$, потому что $B \\subset Q$."
   },
   "answers": [
    {
     "id": "ball",
     "ref": "B2.answer.ball",
     "label": {
      "en": "$P_B(x)$",
      "ru": "$P_B(x)$"
     },
     "components": [
      {
       "en": "$z_1$",
       "ru": "$z_1$"
      },
      {
       "en": "$z_2$",
       "ru": "$z_2$"
      }
     ]
    },
    {
     "id": "box",
     "ref": "B2.answer.box",
     "label": {
      "en": "$P_Q(x)$",
      "ru": "$P_Q(x)$"
     },
     "components": [
      {
       "en": "$z_1$",
       "ru": "$z_1$"
      },
      {
       "en": "$z_2$",
       "ru": "$z_2$"
      }
     ]
    },
    {
     "id": "closer",
     "ref": "B2.answer.closer",
     "label": {
      "en": "Which projection is closer to $x$?",
      "ru": "Какая проекция ближе к $x$?"
     },
     "options": [
      {
       "id": "ball",
       "label": {
        "en": "The ball",
        "ru": "На шар"
       }
      },
      {
       "id": "box",
       "label": {
        "en": "The box",
        "ru": "На брус"
       }
      },
      {
       "id": "equal",
       "label": {
        "en": "Equally close",
        "ru": "Одинаково"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "For the ball, compute $\\|x\\|$ first: a point inside is its own projection.",
     "ru": "Для шара сначала найдите $\\|x\\|$: точка внутри шара сама себе проекция."
    },
    {
     "en": "For the box, clip each coordinate on its own. For the comparison, which set contains the other?",
     "ru": "Для бруса обрежьте каждую координату отдельно. Для сравнения: какое множество содержит другое?"
    }
   ],
   "mistakes": [
    {
     "en": "Mixing the formulas: clipping coordinates for the ball, or dividing by $\\|x\\|$ for the box.",
     "ru": "Перепутать формулы: обрезать координаты для шара или делить на $\\|x\\|$ для бруса."
    },
    {
     "en": "Normalizing a point that is already inside the ball.",
     "ru": "Нормировать точку, которая уже лежит внутри шара."
    }
   ],
   "review": {
    "en": "Draw the unit disk inside the square and both dashed projection lines. The inclusion argument is the point to remember.",
    "ru": "Нарисуйте единичный круг внутри квадрата и обе пунктирные проекции. Запомнить стоит именно рассуждение про вложение."
   }
  },
  "B3": {
   "who": "students",
   "check": "B3",
   "title": {
    "en": "A positive coordinate can vanish",
    "ru": "Положительная координата может обнулиться"
   },
   "skill": {
    "en": "The sort-based simplex projection on your own",
    "ru": "Сортировочный алгоритм проекции на симплекс самостоятельно"
   },
   "statement": {
    "en": "Project $v = {{B3.params.v}}$ onto $\\Delta_3$. Which coordinate becomes zero, although it is positive in $v$?",
    "ru": "Спроецируйте $v = {{B3.params.v}}$ на $\\Delta_3$. Какая координата обнулится, хотя в $v$ она положительна?"
   },
   "steps": [
    {
     "text": {
      "en": "Sort: $u = {{B3.steps.u}}$; cumulative sums $s = {{B3.steps.s}}$.",
      "ru": "Сортируем: $u = {{B3.steps.u}}$; накопленные суммы $s = {{B3.steps.s}}$."
     }
    },
    {
     "text": {
      "en": "Test values $t_j = u_j - \\dfrac{s_j - 1}{j}$:",
      "ru": "Пробные значения $t_j = u_j - \\dfrac{s_j - 1}{j}$:"
     },
     "table": "B3"
    },
    {
     "text": {
      "en": "$\\rho = {{B3.steps.rho}}$ and $\\theta = \\dfrac{s_\\rho - 1}{\\rho} = {{B3.steps.theta}}$.",
      "ru": "$\\rho = {{B3.steps.rho}}$ и $\\theta = \\dfrac{s_\\rho - 1}{\\rho} = {{B3.steps.theta}}$."
     },
     "predict": {
      "en": "Which coordinate will be zeroed?",
      "ru": "Какая координата обнулится?"
     }
    },
    {
     "text": {
      "en": "In the original order: $x = \\max(v - \\theta,\\ 0) = {{B3.steps.x}}$, and $\\mathbf 1^\\top x = {{B3.steps.sumX}}$. The first coordinate is positive in $v$ but zero in $x$: it is smaller than $\\theta$.",
      "ru": "В исходном порядке: $x = \\max(v - \\theta,\\ 0) = {{B3.steps.x}}$, и $\\mathbf 1^\\top x = {{B3.steps.sumX}}$. Первая координата в $v$ положительна, а в $x$ равна нулю: она меньше $\\theta$."
     }
    },
    {
     "text": {
      "en": "Obtuse angle at the vertices: $r = v - x = {{B3.steps.r}}$, $r^\\top x = {{B3.steps.rx}}$, and $r_k - r^\\top x = {{B3.steps.vertex}}$, all $\\le 0$.",
      "ru": "Тупой угол в вершинах: $r = v - x = {{B3.steps.r}}$, $r^\\top x = {{B3.steps.rx}}$, и $r_k - r^\\top x = {{B3.steps.vertex}}$, все $\\le 0$."
     }
    },
    {
     "text": {
      "en": "The sum $\\mathbf 1^\\top v = {{B3.steps.sumV}}$ is not $1$, but that does not matter: shifting $v$ along $\\mathbf 1$ into the plane $\\mathbf 1^\\top x = 1$ gives ${{B3.steps.inPlane}}$ with the same projection.",
      "ru": "Сумма $\\mathbf 1^\\top v = {{B3.steps.sumV}}$ не равна $1$, но это не важно: сдвиг $v$ вдоль $\\mathbf 1$ в плоскость $\\mathbf 1^\\top x = 1$ даёт ${{B3.steps.inPlane}}$ с той же проекцией."
     }
    }
   ],
   "answerText": {
    "en": "$\\theta = {{B3.steps.theta}}$, $P_\\Delta(v) = {{B3.steps.x}}$; the first coordinate becomes zero.",
    "ru": "$\\theta = {{B3.steps.theta}}$, $P_\\Delta(v) = {{B3.steps.x}}$; обнуляется первая координата."
   },
   "answers": [
    {
     "id": "x",
     "ref": "B3.answer.x",
     "label": {
      "en": "The projection $P_\\Delta(v)$",
      "ru": "Проекция $P_\\Delta(v)$"
     },
     "components": [
      {
       "en": "$x_1$",
       "ru": "$x_1$"
      },
      {
       "en": "$x_2$",
       "ru": "$x_2$"
      },
      {
       "en": "$x_3$",
       "ru": "$x_3$"
      }
     ]
    },
    {
     "id": "theta",
     "ref": "B3.answer.theta",
     "label": {
      "en": "The shift $\\theta$",
      "ru": "Сдвиг $\\theta$"
     }
    }
   ],
   "hints": [
    {
     "en": "Follow the table of B1: sorted values, cumulative sums, test values.",
     "ru": "Повторите таблицу из B1: отсортированные значения, накопленные суммы, пробные значения."
    },
    {
     "en": "A coordinate becomes zero when it is not larger than $\\theta$, whatever its sign.",
     "ru": "Координата обнуляется, если она не больше $\\theta$, независимо от её знака."
    }
   ],
   "mistakes": [
    {
     "en": "Believing that only negative coordinates are set to zero: here $v_1 > 0$ but $x_1 = 0$.",
     "ru": "Считать, что обнуляются только отрицательные координаты: здесь $v_1 > 0$, а $x_1 = 0$."
    },
    {
     "en": "Using the total sum $s_n$ instead of $s_\\rho$ in $\\theta$.",
     "ru": "Подставить в $\\theta$ полную сумму $s_n$ вместо $s_\\rho$."
    }
   ],
   "review": {
    "en": "Put the B3 table next to the B1 table. Ask who expected only negative coordinates to vanish.",
    "ru": "Поставьте таблицу B3 рядом с таблицей B1. Спросите, кто ожидал, что обнуляются только отрицательные координаты."
   }
  },
  "C1": {
   "who": "board",
   "check": "C1",
   "title": {
    "en": "KKT with one active constraint",
    "ru": "ККТ с одним активным ограничением"
   },
   "skill": {
    "en": "Writing the KKT conditions, the case split, and the geometric check",
    "ru": "Запись условий ККТ, разбор случаев и геометрическая проверка"
   },
   "statement": {
    "en": "Solve $\\min\\ {{C1.tex.f}}$ subject to $g(x) = {{C1.tex.g}} \\le 0$ with the KKT conditions. Find $x^*$, $\\lambda^*$ and $f^*$, and draw $-\\nabla f(x^*)$ and $\\nabla g(x^*)$.",
    "ru": "Решите задачу $\\min\\ {{C1.tex.f}}$ при ограничении $g(x) = {{C1.tex.g}} \\le 0$ с помощью условий ККТ. Найдите $x^*$, $\\lambda^*$ и $f^*$, изобразите $-\\nabla f(x^*)$ и $\\nabla g(x^*)$."
   },
   "steps": [
    {
     "text": {
      "en": "The Lagrangian is $\\mathcal L(x, \\lambda) = {{C1.tex.f}} + \\lambda\\,({{C1.tex.g}})$.",
      "ru": "Функция Лагранжа: $\\mathcal L(x, \\lambda) = {{C1.tex.f}} + \\lambda\\,({{C1.tex.g}})$."
     }
    },
    {
     "text": {
      "en": "KKT: stationarity $2(x_1 - {{C1.params.c.1}}) + \\lambda = 0$ and $2(x_2 - {{C1.params.c.2}}) + \\lambda = 0$; primal feasibility $g(x) \\le 0$; dual feasibility $\\lambda \\ge 0$; complementary slackness $\\lambda\\, g(x) = 0$.",
      "ru": "ККТ: стационарность $2(x_1 - {{C1.params.c.1}}) + \\lambda = 0$ и $2(x_2 - {{C1.params.c.2}}) + \\lambda = 0$; допустимость $g(x) \\le 0$; неотрицательность множителя $\\lambda \\ge 0$; дополняющая нежёсткость $\\lambda\\, g(x) = 0$."
     }
    },
    {
     "text": {
      "en": "Case $\\lambda = 0$: stationarity gives $x = {{C1.steps.xUnc}}$, but $g = {{C1.steps.gUnc}} > 0$. Infeasible, rejected.",
      "ru": "Случай $\\lambda = 0$: из стационарности $x = {{C1.steps.xUnc}}$, но $g = {{C1.steps.gUnc}} > 0$. Точка недопустима, отбрасываем."
     },
     "predict": {
      "en": "Is the unconstrained minimizer feasible?",
      "ru": "Допустим ли безусловный минимум?"
     }
    },
    {
     "text": {
      "en": "Case $g = 0$: stationarity gives $x_1 - {{C1.params.c.1}} = x_2 - {{C1.params.c.2}}$; together with $x_1 + x_2 = {{C1.params.b.1}}$ this gives $x^* = {{C1.answer.x.value}}$ and $\\lambda^* = {{C1.answer.lam.value}} \\ge 0$.",
      "ru": "Случай $g = 0$: из стационарности $x_1 - {{C1.params.c.1}} = x_2 - {{C1.params.c.2}}$; вместе с $x_1 + x_2 = {{C1.params.b.1}}$ получаем $x^* = {{C1.answer.x.value}}$ и $\\lambda^* = {{C1.answer.lam.value}} \\ge 0$."
     },
     "predict": {
      "en": "Will $\\lambda^*$ come out positive?",
      "ru": "Будет ли $\\lambda^*$ положительным?"
     }
    },
    {
     "text": {
      "en": "The objective and the constraint are convex, so the KKT point is the global minimizer: $f^* = {{C1.answer.f.value}}$.",
      "ru": "Целевая функция и ограничение выпуклы, поэтому точка ККТ — глобальный минимум: $f^* = {{C1.answer.f.value}}$."
     }
    },
    {
     "text": {
      "en": "Geometry: $-\\nabla f(x^*) = {{C1.steps.minusGrad}} = \\lambda^* \\nabla g = {{C1.answer.lam.value}} \\cdot {{C1.params.A.1}}$. The antigradient points along the outward normal of the active constraint. Relaxing the constraint to $x_1 + x_2 \\le R$ changes $f^*$ at the rate $-\\lambda^* = {{C1.steps.sensitivity}}$.",
      "ru": "Геометрия: $-\\nabla f(x^*) = {{C1.steps.minusGrad}} = \\lambda^* \\nabla g = {{C1.answer.lam.value}} \\cdot {{C1.params.A.1}}$. Антиградиент направлен по внешней нормали активного ограничения. Если ослабить ограничение до $x_1 + x_2 \\le R$, то $f^*$ меняется со скоростью $-\\lambda^* = {{C1.steps.sensitivity}}$."
     }
    }
   ],
   "answerText": {
    "en": "$x^* = {{C1.answer.x.value}}$, $\\lambda^* = {{C1.answer.lam.value}}$, $f^* = {{C1.answer.f.value}}$; the constraint is active.",
    "ru": "$x^* = {{C1.answer.x.value}}$, $\\lambda^* = {{C1.answer.lam.value}}$, $f^* = {{C1.answer.f.value}}$; ограничение активно."
   },
   "answers": [
    {
     "id": "x",
     "ref": "C1.answer.x",
     "label": {
      "en": "$x^*$",
      "ru": "$x^*$"
     },
     "components": [
      {
       "en": "$x_1$",
       "ru": "$x_1$"
      },
      {
       "en": "$x_2$",
       "ru": "$x_2$"
      }
     ]
    },
    {
     "id": "lam",
     "ref": "C1.answer.lam",
     "label": {
      "en": "$\\lambda^*$",
      "ru": "$\\lambda^*$"
     }
    },
    {
     "id": "f",
     "ref": "C1.answer.f",
     "label": {
      "en": "$f^*$",
      "ru": "$f^*$"
     }
    }
   ],
   "hints": [
    {
     "en": "Start with the case $\\lambda = 0$: is the unconstrained minimizer feasible?",
     "ru": "Начните со случая $\\lambda = 0$: допустим ли безусловный минимум?"
    },
    {
     "en": "If it is not, the constraint is active: solve stationarity together with $g(x) = 0$.",
     "ru": "Если нет, ограничение активно: решите систему из условия стационарности и $g(x) = 0$."
    }
   ],
   "mistakes": [
    {
     "en": "Writing the constraint as $\\ge 0$, as SciPy does, but keeping $+\\lambda g$ and $\\lambda \\ge 0$: the sign of the multiplier flips.",
     "ru": "Записать ограничение в виде $\\ge 0$, как в SciPy, но оставить $+\\lambda g$ и $\\lambda \\ge 0$: знак множителя меняется на противоположный."
    },
    {
     "en": "Stopping after stationarity without checking that the candidate is feasible.",
     "ru": "Решить уравнения стационарности и не проверить допустимость кандидата."
    }
   ]
  },
  "C2": {
   "who": "students",
   "check": "C2",
   "title": {
    "en": "An inactive constraint",
    "ru": "Неактивное ограничение"
   },
   "skill": {
    "en": "Complementary slackness: an inactive constraint has a zero multiplier",
    "ru": "Дополняющая нежёсткость: у неактивного ограничения множитель равен нулю"
   },
   "statement": {
    "en": "Solve $\\min\\ {{C2.tex.f}}$ subject to $g(x) = {{C2.tex.g}} \\le 0$. Is the constraint active at the optimum, and what is $\\lambda^*$?",
    "ru": "Решите задачу $\\min\\ {{C2.tex.f}}$ при ограничении $g(x) = {{C2.tex.g}} \\le 0$. Активно ли ограничение в оптимуме и чему равен $\\lambda^*$?"
   },
   "steps": [
    {
     "text": {
      "en": "Stationarity is the same as in C1: $2(x_1 - {{C2.params.c.1}}) + \\lambda = 0$, $2(x_2 - {{C2.params.c.2}}) + \\lambda = 0$.",
      "ru": "Условие стационарности то же, что в C1: $2(x_1 - {{C2.params.c.1}}) + \\lambda = 0$, $2(x_2 - {{C2.params.c.2}}) + \\lambda = 0$."
     }
    },
    {
     "text": {
      "en": "Case $\\lambda = 0$: $x = {{C2.answer.x.value}}$ and $g = {{C2.steps.gStar}} < 0$. Feasible, so this is a KKT point.",
      "ru": "Случай $\\lambda = 0$: $x = {{C2.answer.x.value}}$ и $g = {{C2.steps.gStar}} < 0$. Точка допустима, это точка ККТ."
     },
     "predict": {
      "en": "Will $\\lambda^*$ be zero?",
      "ru": "Окажется ли $\\lambda^*$ равным нулю?"
     }
    },
    {
     "text": {
      "en": "Case $g = 0$ for completeness: $x = {{C2.cand.S1.x}}$ with $\\lambda = {{C2.cand.S1.lam.1}} < 0$. Rejected by the sign of the multiplier.",
      "ru": "Для полноты случай $g = 0$: $x = {{C2.cand.S1.x}}$ и $\\lambda = {{C2.cand.S1.lam.1}} < 0$. Отбрасываем по знаку множителя."
     }
    },
    {
     "text": {
      "en": "Answer: $x^* = {{C2.answer.x.value}}$, $\\lambda^* = {{C2.answer.lam.value}}$, $f^* = {{C2.answer.f.value}}$. The constraint is inactive, and complementary slackness $\\lambda^* g(x^*) = 0$ with $g(x^*) < 0$ forces $\\lambda^* = 0$.",
      "ru": "Ответ: $x^* = {{C2.answer.x.value}}$, $\\lambda^* = {{C2.answer.lam.value}}$, $f^* = {{C2.answer.f.value}}$. Ограничение неактивно, и дополняющая нежёсткость $\\lambda^* g(x^*) = 0$ при $g(x^*) < 0$ даёт $\\lambda^* = 0$."
     }
    }
   ],
   "answerText": {
    "en": "$x^* = {{C2.answer.x.value}}$, $\\lambda^* = {{C2.answer.lam.value}}$; the constraint is inactive.",
    "ru": "$x^* = {{C2.answer.x.value}}$, $\\lambda^* = {{C2.answer.lam.value}}$; ограничение неактивно."
   },
   "answers": [
    {
     "id": "x",
     "ref": "C2.answer.x",
     "label": {
      "en": "$x^*$",
      "ru": "$x^*$"
     },
     "components": [
      {
       "en": "$x_1$",
       "ru": "$x_1$"
      },
      {
       "en": "$x_2$",
       "ru": "$x_2$"
      }
     ]
    },
    {
     "id": "lam",
     "ref": "C2.answer.lam",
     "label": {
      "en": "$\\lambda^*$",
      "ru": "$\\lambda^*$"
     }
    }
   ],
   "hints": [
    {
     "en": "Check first whether the unconstrained minimizer satisfies the constraint.",
     "ru": "Сначала проверьте, удовлетворяет ли ограничению безусловный минимум."
    },
    {
     "en": "If the active case gives a negative $\\lambda$, that case is not a KKT point.",
     "ru": "Если в активном случае получился отрицательный $\\lambda$, этот случай не даёт точку ККТ."
    }
   ],
   "mistakes": [
    {
     "en": "Assuming the constraint is active and reporting $\\lambda = {{C2.cand.S1.lam.1}}$.",
     "ru": "Считать ограничение активным и выдать $\\lambda = {{C2.cand.S1.lam.1}}$."
    },
    {
     "en": "Thinking that $\\lambda = 0$ means the constraint was forgotten: it is exactly what complementary slackness requires.",
     "ru": "Думать, что $\\lambda = 0$ означает забытое ограничение: этого и требует дополняющая нежёсткость."
    }
   ],
   "review": {
    "en": "Drag the minimizer in the KKT widget from C1 to C2 and watch $\\lambda$ drop to zero at the moment the constraint stops binding.",
    "ru": "Перетащите безусловный минимум в виджете ККТ из положения C1 в положение C2: $\\lambda$ падает до нуля ровно тогда, когда ограничение перестаёт быть активным."
   }
  },
  "C3": {
   "who": "students",
   "check": "C3",
   "title": {
    "en": "Two constraints and the active-set table",
    "ru": "Два ограничения и таблица активных множеств"
   },
   "skill": {
    "en": "Enumerating active sets and rejecting candidates by feasibility or by the sign of the multipliers",
    "ru": "Перебор активных множеств и отбраковка кандидатов по допустимости и по знаку множителей"
   },
   "statement": {
    "en": "Solve $\\min\\ {{C3.tex.f}}$ subject to $g_1(x) = {{C3.tex.g1}} \\le 0$ and $g_2(x) = {{C3.tex.g2}} \\le 0$. Enumerate the active sets, reject the wrong candidates, and find $x^*$, $\\lambda_1^*$ and $\\lambda_2^*$.",
    "ru": "Решите задачу $\\min\\ {{C3.tex.f}}$ при ограничениях $g_1(x) = {{C3.tex.g1}} \\le 0$ и $g_2(x) = {{C3.tex.g2}} \\le 0$. Переберите активные множества, отбросьте лишних кандидатов и найдите $x^*$, $\\lambda_1^*$ и $\\lambda_2^*$."
   },
   "steps": [
    {
     "text": {
      "en": "Stationarity with $\\nabla g_1 = {{C3.params.A.1}}$ and $\\nabla g_2 = {{C3.params.A.2}}$: $2(x_1 - {{C3.params.c.1}}) + \\lambda_1 - \\lambda_2 = 0$, $2(x_2 - {{C3.params.c.2}}) + \\lambda_1 = 0$.",
      "ru": "Стационарность при $\\nabla g_1 = {{C3.params.A.1}}$ и $\\nabla g_2 = {{C3.params.A.2}}$: $2(x_1 - {{C3.params.c.1}}) + \\lambda_1 - \\lambda_2 = 0$, $2(x_2 - {{C3.params.c.2}}) + \\lambda_1 = 0$."
     }
    },
    {
     "text": {
      "en": "Active set $\\varnothing$: $x = {{C3.cand.S0.x}}$, $g_1 = {{C3.cand.S0.g.1}} > 0$. Infeasible.",
      "ru": "Активное множество $\\varnothing$: $x = {{C3.cand.S0.x}}$, $g_1 = {{C3.cand.S0.g.1}} > 0$. Недопустимо."
     }
    },
    {
     "text": {
      "en": "Active set $\\{1\\}$: $x = {{C3.cand.S1.x}}$, $\\lambda_1 = {{C3.cand.S1.lam.1}}$, but $g_2 = {{C3.cand.S1.g.2}} > 0$, since $x_1 < 0$. Infeasible.",
      "ru": "Активное множество $\\{1\\}$: $x = {{C3.cand.S1.x}}$, $\\lambda_1 = {{C3.cand.S1.lam.1}}$, но $g_2 = {{C3.cand.S1.g.2}} > 0$, так как $x_1 < 0$. Недопустимо."
     }
    },
    {
     "text": {
      "en": "Active set $\\{2\\}$: $x = {{C3.cand.S2.x}}$, $\\lambda_2 = {{C3.cand.S2.lam.2}} < 0$, and also $g_1 = {{C3.cand.S2.g.1}} > 0$. Rejected on both counts.",
      "ru": "Активное множество $\\{2\\}$: $x = {{C3.cand.S2.x}}$, $\\lambda_2 = {{C3.cand.S2.lam.2}} < 0$, и к тому же $g_1 = {{C3.cand.S2.g.1}} > 0$. Отбрасываем по обеим причинам."
     }
    },
    {
     "text": {
      "en": "Active set $\\{1, 2\\}$: $x = {{C3.cand.S12.x}}$; stationarity gives $\\lambda_1 = {{C3.cand.S12.lam.1}}$ and $\\lambda_2 = {{C3.cand.S12.lam.2}}$, both nonnegative. This is the KKT point, and $f^* = {{C3.answer.f.value}}$.",
      "ru": "Активное множество $\\{1, 2\\}$: $x = {{C3.cand.S12.x}}$; из стационарности $\\lambda_1 = {{C3.cand.S12.lam.1}}$ и $\\lambda_2 = {{C3.cand.S12.lam.2}}$, оба неотрицательны. Это точка ККТ, $f^* = {{C3.answer.f.value}}$."
     },
     "predict": {
      "en": "Will both multipliers be nonnegative?",
      "ru": "Будут ли оба множителя неотрицательными?"
     }
    },
    {
     "text": {
      "en": "Geometry: $-\\nabla f(x^*) = {{C3.steps.minusGrad}} = {{C3.cand.S12.lam.1}}\\,\\nabla g_1 + {{C3.cand.S12.lam.2}}\\,\\nabla g_2$. The antigradient lies inside the normal cone spanned by the two active gradients.",
      "ru": "Геометрия: $-\\nabla f(x^*) = {{C3.steps.minusGrad}} = {{C3.cand.S12.lam.1}}\\,\\nabla g_1 + {{C3.cand.S12.lam.2}}\\,\\nabla g_2$. Антиградиент лежит внутри нормального конуса, натянутого на градиенты двух активных ограничений."
     }
    }
   ],
   "answerText": {
    "en": "$x^* = {{C3.answer.x.value}}$, $\\lambda^* = {{C3.answer.lam.value}}$, $f^* = {{C3.answer.f.value}}$; both constraints are active.",
    "ru": "$x^* = {{C3.answer.x.value}}$, $\\lambda^* = {{C3.answer.lam.value}}$, $f^* = {{C3.answer.f.value}}$; активны оба ограничения."
   },
   "answers": [
    {
     "id": "x",
     "ref": "C3.answer.x",
     "label": {
      "en": "$x^*$",
      "ru": "$x^*$"
     },
     "components": [
      {
       "en": "$x_1$",
       "ru": "$x_1$"
      },
      {
       "en": "$x_2$",
       "ru": "$x_2$"
      }
     ]
    },
    {
     "id": "lam",
     "ref": "C3.answer.lam",
     "label": {
      "en": "$(\\lambda_1^*, \\lambda_2^*)$",
      "ru": "$(\\lambda_1^*;\\ \\lambda_2^*)$"
     },
     "components": [
      {
       "en": "$\\lambda_1$",
       "ru": "$\\lambda_1$"
      },
      {
       "en": "$\\lambda_2$",
       "ru": "$\\lambda_2$"
      }
     ]
    },
    {
     "id": "f",
     "ref": "C3.answer.f",
     "label": {
      "en": "$f^*$",
      "ru": "$f^*$"
     }
    }
   ],
   "hints": [
    {
     "en": "There are four active sets: $\\varnothing$, $\\{1\\}$, $\\{2\\}$ and $\\{1, 2\\}$. Write stationarity once and reuse it.",
     "ru": "Активных множеств четыре: $\\varnothing$, $\\{1\\}$, $\\{2\\}$ и $\\{1, 2\\}$. Выпишите стационарность один раз и используйте для всех."
    },
    {
     "en": "When both constraints are active, $x$ is fixed by $g_1 = g_2 = 0$, and stationarity only determines the multipliers.",
     "ru": "Когда активны оба ограничения, $x$ определяется из $g_1 = g_2 = 0$, а стационарность нужна только для множителей."
    }
   ],
   "mistakes": [
    {
     "en": "Forgetting the sign in $\\nabla g_2 = {{C3.params.A.2}}$ for the constraint $x_1 \\ge 0$ written as $-x_1 \\le 0$.",
     "ru": "Потерять знак в $\\nabla g_2 = {{C3.params.A.2}}$ для ограничения $x_1 \\ge 0$, записанного как $-x_1 \\le 0$."
    },
    {
     "en": "Accepting the active set $\\{1\\}$ because its $\\lambda_1$ is positive, without checking $g_2$.",
     "ru": "Принять активное множество $\\{1\\}$, потому что $\\lambda_1$ положителен, и не проверить $g_2$."
    }
   ],
   "review": {
    "en": "Fill the four-row table on the board: active set, $x$, multipliers, feasible, signs. Then show the normal cone in the widget.",
    "ru": "Заполните на доске таблицу из четырёх строк: активное множество, $x$, множители, допустимость, знаки. Затем покажите нормальный конус в виджете."
   }
  }
 }
}/*JSON-END*/);
