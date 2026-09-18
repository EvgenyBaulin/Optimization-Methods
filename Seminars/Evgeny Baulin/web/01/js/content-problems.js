// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 01 content: the eleven problems, in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar01_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "check": "A1",
   "title": {
    "en": "Gradient and Hessian of a quadratic",
    "ru": "Градиент и гессиан квадратичной функции"
   },
   "skill": {
    "en": "Partial derivatives term by term; a cross term in both off-diagonal entries",
    "ru": "Частные производные по слагаемым; смешанное слагаемое в обоих внедиагональных элементах"
   },
   "statement": {
    "en": "Let $f(x) = {{A1.tex.f}}$. **(a)** Before computing: will the Hessian $H$ depend on the point? **(b)** Find $\\nabla f$ and $H$ at an arbitrary point and at ${{A1.params.x}}$. **(c)** Is ${{A1.params.x}}$ a candidate for a minimum?",
    "ru": "Пусть $f(x) = {{A1.tex.f}}$. **а)** До вычислений: будет ли гессиан $H$ зависеть от точки? **б)** Найдите $\\nabla f$ и $H$ в произвольной точке и в точке ${{A1.params.x}}$. **в)** Является ли ${{A1.params.x}}$ кандидатом в точку минимума?"
   },
   "steps": [
    {
     "text": {
      "en": "Differentiate term by term. For $x_1$: $x_1^2$ gives $2x_1$, $x_2^2$ gives nothing, $-x_1x_2$ gives $-x_2$. So $\\partial f/\\partial x_1 = {{A1.tex.g1}}$ and, in the same way, $\\partial f/\\partial x_2 = {{A1.tex.g2}}$.",
      "ru": "Дифференцируйте по слагаемым. По $x_1$: $x_1^2$ даёт $2x_1$, $x_2^2$ не даёт ничего, $-x_1x_2$ даёт $-x_2$. Итак, $\\partial f/\\partial x_1 = {{A1.tex.g1}}$ и точно так же $\\partial f/\\partial x_2 = {{A1.tex.g2}}$."
     }
    },
    {
     "text": {
      "en": "Second derivatives: $$H = {{A1.steps.H}}.$$ No variable is left: the Hessian of a quadratic is constant. The cross term $-x_1x_2$ puts $-1$ into **both** off-diagonal entries.",
      "ru": "Вторые производные: $$H = {{A1.steps.H}}.$$ Переменных не осталось: гессиан квадратичной функции постоянен. Смешанное слагаемое $-x_1x_2$ даёт $-1$ в **оба** внедиагональных элемента."
     },
     "predict": {
      "en": "Will the Hessian depend on the point?",
      "ru": "Будет ли гессиан зависеть от точки?"
     }
    },
    {
     "text": {
      "en": "At ${{A1.params.x}}$: $\\nabla f = {{A1.steps.grad}} \\ne 0$. The point is not stationary, so it is not a candidate for an unconstrained minimum, whatever $H$ says.",
      "ru": "В точке ${{A1.params.x}}$: $\\nabla f = {{A1.steps.grad}} \\ne 0$. Точка не стационарна, поэтому она не кандидат в точку безусловного минимума, что бы ни говорил $H$."
     }
    },
    {
     "text": {
      "en": "The eigenvalues solve ${{A1.tex.charPoly}} = 0$: $\\lambda = {{A1.steps.eig.1}}$ and $\\lambda = {{A1.steps.eig.2}}$. Both are positive at every point, so $f$ is strictly convex and its unique minimizer solves $\\nabla f = 0$: $x^* = {{A1.steps.xStar}}$.",
      "ru": "Собственные значения — корни уравнения ${{A1.tex.charPoly}} = 0$: $\\lambda = {{A1.steps.eig.1}}$ и $\\lambda = {{A1.steps.eig.2}}$. Оба положительны в каждой точке, поэтому $f$ строго выпукла, а её единственная точка минимума — решение уравнения $\\nabla f = 0$: $x^* = {{A1.steps.xStar}}$."
     },
     "predict": {
      "en": "Is $f$ strictly convex?",
      "ru": "Строго ли выпукла $f$?"
     }
    },
    {
     "text": {
      "en": "Two conventions, one function: $f = \\tfrac12 x^\\top H x$ with $H$ itself, or $f = x^\\top A x$ with $A = {{A1.tex.A}}$, whose off-diagonal entry is ${{A1.tex.offA}}$; $H = A + A^\\top$. Mixing the two is what produces wrong Hessians.",
      "ru": "Две записи одной функции: $f = \\tfrac12 x^\\top H x$ с самим $H$ или $f = x^\\top A x$ с $A = {{A1.tex.A}}$, у которой внедиагональный элемент равен ${{A1.tex.offA}}$; $H = A + A^\\top$. Неверные гессианы получаются именно от смешения этих записей."
     }
    }
   ],
   "answerText": {
    "en": "$\\nabla f = ({{A1.tex.g1}},\\ {{A1.tex.g2}})^\\top$, $H = {{A1.steps.H}}$ at every point; $\\nabla f{{A1.params.x}} = {{A1.steps.grad}} \\ne 0$, so ${{A1.params.x}}$ is not a candidate.",
    "ru": "$\\nabla f = ({{A1.tex.g1}};\\ {{A1.tex.g2}})^\\top$, $H = {{A1.steps.H}}$ во всех точках; $\\nabla f{{A1.params.x}} = {{A1.steps.grad}} \\ne 0$, поэтому ${{A1.params.x}}$ не кандидат."
   },
   "answers": [
    {
     "id": "g1",
     "ref": "A1.answer.g1",
     "label": {
      "en": "$\\partial f/\\partial x_1$ as a formula in $x_1$, $x_2$",
      "ru": "$\\partial f/\\partial x_1$ как формула от $x_1$, $x_2$"
     }
    },
    {
     "id": "H",
     "ref": "A1.answer.H",
     "label": {
      "en": "The Hessian $H$",
      "ru": "Гессиан $H$"
     }
    },
    {
     "id": "stationary",
     "ref": "A1.answer.stationary",
     "label": {
      "en": "Is ${{A1.params.x}}$ a stationary point?",
      "ru": "Стационарна ли точка ${{A1.params.x}}$?"
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
     "en": "Differentiate one term at a time; a term without $x_1$ contributes nothing to $\\partial f/\\partial x_1$.",
     "ru": "Дифференцируйте по одному слагаемому; слагаемое без $x_1$ ничего не вносит в $\\partial f/\\partial x_1$."
    },
    {
     "en": "The mixed derivative of $c\\,x_1x_2$ is $c$, and it goes into both $H_{12}$ and $H_{21}$.",
     "ru": "Смешанная производная $c\\,x_1x_2$ равна $c$, и она попадает и в $H_{12}$, и в $H_{21}$."
    }
   ],
   "mistakes": [
    {
     "en": "Writing $-2$ off the diagonal (doubling the cross coefficient as on the diagonal) or $-\\tfrac12$ (the entry of $A$ in $f = x^\\top A x$), or putting $-1$ into only one of the two entries.",
     "ru": "Писать вне диагонали $-2$ (удваивая коэффициент смешанного слагаемого, как на диагонали) или $-\\tfrac12$ (элемент $A$ в записи $f = x^\\top A x$) либо ставить $-1$ только в один из двух элементов."
    },
    {
     "en": "Discussing optimality at ${{A1.params.x}}$ from the Hessian: the gradient is not zero there.",
     "ru": "Обсуждать оптимальность в точке ${{A1.params.x}}$ по гессиану: градиент там не равен нулю."
    }
   ]
  },
  "A2": {
   "who": "students",
   "check": "A2",
   "title": {
    "en": "The Hessian moves with the point",
    "ru": "Гессиан меняется от точки к точке"
   },
   "skill": {
    "en": "Substitution with signs; curvature of a non-quadratic function is local",
    "ru": "Подстановка со знаками; кривизна неквадратичной функции локальна"
   },
   "statement": {
    "en": "For the lecture function $f(x) = {{A2.tex.f}}$ compute $\\nabla f$, $H$ and $\\det H$ at ${{A2.params.x}}$. Compare with $\\det H = {{A.lecture.det}}$ at ${{A.lecture.x}}$. Is ${{A2.params.x}}$ a stationary point?",
    "ru": "Для функции из лекции $f(x) = {{A2.tex.f}}$ найдите $\\nabla f$, $H$ и $\\det H$ в точке ${{A2.params.x}}$. Сравните с $\\det H = {{A.lecture.det}}$ в точке ${{A.lecture.x}}$. Стационарна ли точка ${{A2.params.x}}$?"
   },
   "steps": [
    {
     "text": {
      "en": "Differentiate: $\\partial f/\\partial x_1 = {{A2.tex.g1}}$, $\\partial f/\\partial x_2 = {{A2.tex.g2}}$ and $$H(x) = {{A2.tex.H}}.$$",
      "ru": "Продифференцируйте: $\\partial f/\\partial x_1 = {{A2.tex.g1}}$, $\\partial f/\\partial x_2 = {{A2.tex.g2}}$ и $$H(x) = {{A2.tex.H}}.$$"
     }
    },
    {
     "text": {
      "en": "Keep the numbers visible: $\\partial f/\\partial x_1 = {{A2.tex.sub1}} = {{A2.steps.grad.1}}$ and $\\partial f/\\partial x_2 = {{A2.tex.sub2}} = {{A2.steps.grad.2}}$, a sum of two negative terms. $H{{A2.params.x}} = {{A2.steps.H}}$: both off-diagonal entries are negative.",
      "ru": "Не прячьте числа: $\\partial f/\\partial x_1 = {{A2.tex.sub1}} = {{A2.steps.grad.1}}$ и $\\partial f/\\partial x_2 = {{A2.tex.sub2}} = {{A2.steps.grad.2}}$ — сумма двух отрицательных слагаемых. $H{{A2.params.x}} = {{A2.steps.H}}$: оба внедиагональных элемента отрицательны."
     },
     "predict": {
      "en": "Which entries change sign when $x_2$ becomes negative?",
      "ru": "Какие элементы меняют знак, когда $x_2$ становится отрицательным?"
     }
    },
    {
     "text": {
      "en": "$\\det H = {{A2.tex.detSub}} = {{A2.steps.det}}$, against ${{A.lecture.det}}$ at ${{A.lecture.x}}$. For a non-quadratic function the curvature is a local object.",
      "ru": "$\\det H = {{A2.tex.detSub}} = {{A2.steps.det}}$ против ${{A.lecture.det}}$ в точке ${{A.lecture.x}}$. У неквадратичной функции кривизна — локальный объект."
     }
    },
    {
     "text": {
      "en": "No: $\\nabla f{{A2.params.x}} = {{A2.steps.grad}} \\ne 0$, so the point is not stationary. $H \\succ 0$ ($\\Delta_1 = {{A2.steps.H.1.1}} > 0$, $\\Delta_2 = {{A2.steps.det}} > 0$) says nothing about optimality at a non-stationary point.",
      "ru": "Нет: $\\nabla f{{A2.params.x}} = {{A2.steps.grad}} \\ne 0$, так что точка не стационарна. $H \\succ 0$ ($\\Delta_1 = {{A2.steps.H.1.1}} > 0$, $\\Delta_2 = {{A2.steps.det}} > 0$) ничего не говорит об оптимальности в нестационарной точке."
     },
     "predict": {
      "en": "$H$ is positive definite here. Does that make ${{A2.params.x}}$ a minimum?",
      "ru": "Здесь гессиан $H$ положительно определён. Значит ли это, что ${{A2.params.x}}$ — минимум?"
     }
    }
   ],
   "answerText": {
    "en": "$\\nabla f = {{A2.steps.grad}}$, $H = {{A2.steps.H}}$, $\\det H = {{A2.steps.det}}$; the point is not stationary.",
    "ru": "$\\nabla f = {{A2.steps.grad}}$, $H = {{A2.steps.H}}$, $\\det H = {{A2.steps.det}}$; точка не стационарна."
   },
   "answers": [
    {
     "id": "grad",
     "ref": "A2.answer.grad",
     "label": {
      "en": "$\\nabla f{{A2.params.x}}$",
      "ru": "$\\nabla f{{A2.params.x}}$"
     },
     "components": [
      {
       "en": "$\\partial f/\\partial x_1$",
       "ru": "$\\partial f/\\partial x_1$"
      },
      {
       "en": "$\\partial f/\\partial x_2$",
       "ru": "$\\partial f/\\partial x_2$"
      }
     ]
    },
    {
     "id": "H",
     "ref": "A2.answer.H",
     "label": {
      "en": "$H{{A2.params.x}}$",
      "ru": "$H{{A2.params.x}}$"
     }
    },
    {
     "id": "det",
     "ref": "A2.answer.det",
     "label": {
      "en": "$\\det H{{A2.params.x}}$",
      "ru": "$\\det H{{A2.params.x}}$"
     }
    },
    {
     "id": "stationary",
     "ref": "A2.answer.stationary",
     "label": {
      "en": "Is ${{A2.params.x}}$ a stationary point?",
      "ru": "Стационарна ли точка ${{A2.params.x}}$?"
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
     "en": "Substitute $x_1 = {{A2.params.x.1}}$ and $x_2 = {{A2.params.x.2}}$ term by term and write every product out; $x_2$ is negative.",
     "ru": "Подставьте $x_1 = {{A2.params.x.1}}$ и $x_2 = {{A2.params.x.2}}$ в каждое слагаемое и распишите все произведения; $x_2$ отрицательно."
    },
    {
     "en": "Before reading anything into $H$, check whether $\\nabla f$ vanishes.",
     "ru": "Прежде чем делать выводы по $H$, проверьте, обращается ли $\\nabla f$ в нуль."
    }
   ],
   "mistakes": [
    {
     "en": "Losing a sign: at $x_2 < 0$ both off-diagonal entries are negative, and $\\partial f/\\partial x_2$ is a sum of two negative terms.",
     "ru": "Терять знак: при $x_2 < 0$ оба внедиагональных элемента отрицательны, а $\\partial f/\\partial x_2$ — сумма двух отрицательных слагаемых."
    },
    {
     "en": "Announcing a minimum because $H \\succ 0$ at a point where $\\nabla f \\ne 0$.",
     "ru": "Объявлять минимум из-за $H \\succ 0$ в точке, где $\\nabla f \\ne 0$."
    }
   ],
   "review": {
    "en": "Switch the probe from the lecture point to the A2 point: $\\det H$ changes from ${{A.lecture.det}}$ to ${{A2.steps.det}}$, and the verdict “not stationary” stays.",
    "ru": "Переключите зонд с точки из лекции на точку из A2: $\\det H$ меняется с ${{A.lecture.det}}$ на ${{A2.steps.det}}$, а вердикт «точка не стационарна» остаётся."
   }
  },
  "A3": {
   "who": "students",
   "check": "A3",
   "title": {
    "en": "Three variables and Sylvester's criterion",
    "ru": "Три переменные и критерий Сильвестра"
   },
   "skill": {
    "en": "A three-by-three Hessian, leading minors, the minimizer of a convex quadratic",
    "ru": "Гессиан три на три, угловые миноры, минимум выпуклой квадратичной функции"
   },
   "statement": {
    "en": "Let $f(x) = {{A3.tex.f}}$ on $\\mathbb R^3$. **(a)** Find $\\nabla f$ and $H$. **(b)** Decide by Sylvester's criterion whether $H \\succ 0$. **(c)** What does this say about convexity? Where is the minimum, and is it unique?",
    "ru": "Пусть $f(x) = {{A3.tex.f}}$ на $\\mathbb R^3$. **а)** Найдите $\\nabla f$ и $H$. **б)** По критерию Сильвестра выясните, верно ли $H \\succ 0$. **в)** Что это говорит о выпуклости? Где минимум и единствен ли он?"
   },
   "steps": [
    {
     "text": {
      "en": "The diagonal holds twice the coefficients of the squares, ${{A3.steps.diag}}$. The term $2x_1x_2$ gives $H_{12} = H_{21} = {{A3.steps.H.1.2}}$, the term $-x_2x_3$ gives $H_{23} = H_{32} = {{A3.steps.H.2.3}}$, and $x_1$, $x_3$ never meet, so $H_{13} = 0$: $$\\nabla f = {{A3.tex.grad}},\\qquad H = {{A3.steps.H}}.$$",
      "ru": "На диагонали стоят удвоенные коэффициенты при квадратах, ${{A3.steps.diag}}$. Слагаемое $2x_1x_2$ даёт $H_{12} = H_{21} = {{A3.steps.H.1.2}}$, слагаемое $-x_2x_3$ даёт $H_{23} = H_{32} = {{A3.steps.H.2.3}}$, а $x_1$ и $x_3$ вместе нигде не встречаются, поэтому $H_{13} = 0$: $$\\nabla f = {{A3.tex.grad}},\\qquad H = {{A3.steps.H}}.$$"
     }
    },
    {
     "text": {
      "en": "$\\Delta_1 = {{A3.steps.minors.1}}$, $\\Delta_2 = {{A3.tex.delta2}} = {{A3.steps.minors.2}}$ and, expanding along the first row, $\\Delta_3 = {{A3.tex.delta3}} = {{A3.steps.minors.3}}$.",
      "ru": "$\\Delta_1 = {{A3.steps.minors.1}}$, $\\Delta_2 = {{A3.tex.delta2}} = {{A3.steps.minors.2}}$ и, разложением по первой строке, $\\Delta_3 = {{A3.tex.delta3}} = {{A3.steps.minors.3}}$."
     },
     "predict": {
      "en": "Will all three leading minors be positive?",
      "ru": "Будут ли все три угловых минора положительны?"
     }
    },
    {
     "text": {
      "en": "All leading minors are positive, so $H \\succ 0$. The Hessian is the same at every point, so $f$ is strictly convex on $\\mathbb R^3$.",
      "ru": "Все угловые миноры положительны, значит, $H \\succ 0$. Гессиан одинаков во всех точках, поэтому $f$ строго выпукла на $\\mathbb R^3$."
     }
    },
    {
     "text": {
      "en": "Solve $\\nabla f = 0$: ${{A3.tex.system}}$, hence ${{A3.tex.loop}}$, so $x_2 = 0$ and then $x_3 = x_1 = 0$. The unique stationary point $x^* = {{A3.steps.xStar}}$ is the global minimizer by convexity.",
      "ru": "Решите $\\nabla f = 0$: ${{A3.tex.system}}$, откуда ${{A3.tex.loop}}$, значит, $x_2 = 0$, а затем $x_3 = x_1 = 0$. Единственная стационарная точка $x^* = {{A3.steps.xStar}}$ — точка глобального минимума в силу выпуклости."
     }
    }
   ],
   "answerText": {
    "en": "$H = {{A3.steps.H}}$, $\\Delta = {{A3.steps.minors}}$, so $H \\succ 0$ and $f$ is strictly convex; the unique global minimizer is $x^* = {{A3.steps.xStar}}$.",
    "ru": "$H = {{A3.steps.H}}$, $\\Delta = {{A3.steps.minors}}$, поэтому $H \\succ 0$ и $f$ строго выпукла; единственная точка глобального минимума — $x^* = {{A3.steps.xStar}}$."
   },
   "answers": [
    {
     "id": "H",
     "ref": "A3.answer.H",
     "label": {
      "en": "The Hessian $H$",
      "ru": "Гессиан $H$"
     }
    },
    {
     "id": "minors",
     "ref": "A3.answer.minors",
     "label": {
      "en": "Leading minors",
      "ru": "Угловые миноры"
     },
     "components": [
      {
       "en": "$\\Delta_1$",
       "ru": "$\\Delta_1$"
      },
      {
       "en": "$\\Delta_2$",
       "ru": "$\\Delta_2$"
      },
      {
       "en": "$\\Delta_3$",
       "ru": "$\\Delta_3$"
      }
     ]
    },
    {
     "id": "x",
     "ref": "A3.answer.x",
     "label": {
      "en": "The minimizer $x^*$",
      "ru": "Точка минимума $x^*$"
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
    }
   ],
   "hints": [
    {
     "en": "The diagonal gets twice the coefficient of the square; a cross term $c\\,x_ix_j$ puts $c$ into $H_{ij}$ and $H_{ji}$.",
     "ru": "На диагональ идёт удвоенный коэффициент при квадрате; смешанное слагаемое $c\\,x_ix_j$ даёт $c$ в $H_{ij}$ и в $H_{ji}$."
    },
    {
     "en": "$\\Delta_k$ is the determinant of the top-left $k \\times k$ block; expand $\\Delta_3$ along a row that contains a zero.",
     "ru": "$\\Delta_k$ — определитель левого верхнего блока $k \\times k$; раскладывайте $\\Delta_3$ по строке, в которой есть нуль."
    }
   ],
   "mistakes": [
    {
     "en": "Halving the cross coefficients, or writing each of them into only one of the two symmetric entries.",
     "ru": "Делить коэффициенты смешанных слагаемых пополам или записывать каждый из них только в один из двух симметричных элементов."
    },
    {
     "en": "Calling the stationary point a global minimum without an argument: here it is convexity, from $H \\succ 0$ at every point.",
     "ru": "Называть стационарную точку глобальным минимумом без обоснования: здесь обоснование — выпуклость, из $H \\succ 0$ во всех точках."
    }
   ],
   "review": {
    "en": "Three determinants certify $H \\succ 0$; the eigenvalues ${{A3.steps.eig.1}}$, ${{A3.steps.eig.2}}$, ${{A3.steps.eig.3}}$ would need the roots of the cubic ${{A3.tex.cubic}}$.",
    "ru": "Три определителя гарантируют $H \\succ 0$; для собственных значений ${{A3.steps.eig.1}}$, ${{A3.steps.eig.2}}$, ${{A3.steps.eig.3}}$ пришлось бы искать корни многочлена ${{A3.tex.cubic}}$."
   }
  },
  "B1": {
   "who": "board",
   "check": "B1",
   "title": {
    "en": "A bowl: local first, global separately",
    "ru": "Чаша: сначала локально, затем отдельно глобально"
   },
   "skill": {
    "en": "The full routine: stationary point, Hessian, sufficient condition, a separate global argument",
    "ru": "Полный порядок действий: стационарная точка, гессиан, достаточное условие, отдельное обоснование глобальности"
   },
   "statement": {
    "en": "Let $f(x) = {{B1.tex.f}}$. **(a)** Find all stationary points. **(b)** Compute $H$ and decide its definiteness. **(c)** Which condition did you use: necessary or sufficient? **(d)** Is the point a global minimum, and what exactly justifies that?",
    "ru": "Пусть $f(x) = {{B1.tex.f}}$. **а)** Найдите все стационарные точки. **б)** Найдите $H$ и определите его знакоопределённость. **в)** Каким условием вы воспользовались: необходимым или достаточным? **г)** Глобальный ли это минимум и чем именно это обосновано?"
   },
   "steps": [
    {
     "text": {
      "en": "$\\nabla f = {{B1.tex.grad}} = 0$ only at $x^* = {{B1.steps.xStar}}$.",
      "ru": "$\\nabla f = {{B1.tex.grad}} = 0$ только в точке $x^* = {{B1.steps.xStar}}$."
     }
    },
    {
     "text": {
      "en": "$H = {{B1.steps.H}}$ with $\\Delta_1 = {{B1.steps.minors.1}} > 0$ and $\\Delta_2 = {{B1.steps.minors.2}} > 0$, so $H \\succ 0$.",
      "ru": "$H = {{B1.steps.H}}$, $\\Delta_1 = {{B1.steps.minors.1}} > 0$ и $\\Delta_2 = {{B1.steps.minors.2}} > 0$, поэтому $H \\succ 0$."
     }
    },
    {
     "text": {
      "en": "$\\nabla f(x^*) = 0$ and $H(x^*) \\succ 0$: the **sufficient** condition applies, and it gives a **strict local** minimum, nothing more.",
      "ru": "$\\nabla f(x^*) = 0$ и $H(x^*) \\succ 0$: применимо **достаточное** условие, и оно даёт **строгий локальный** минимум, не больше."
     },
     "predict": {
      "en": "Does $H \\succ 0$ give a local or a global minimum?",
      "ru": "Что даёт $H \\succ 0$: локальный или глобальный минимум?"
     }
    },
    {
     "text": {
      "en": "Global needs one more sentence: either convexity ($H \\succeq 0$ at every point) or directly $f(x) = {{B1.tex.f}} \\ge 0 = f(x^*)$, with equality only at $x^*$.",
      "ru": "Для глобальности нужна ещё одна фраза: либо выпуклость ($H \\succeq 0$ во всех точках), либо прямо $f(x) = {{B1.tex.f}} \\ge 0 = f(x^*)$, причём равенство достигается только в $x^*$."
     }
    },
    {
     "text": {
      "en": "The eigenvalues ${{B1.steps.eig.1}}$ and ${{B1.steps.eig.2}}$ are equal: the curvature is the same in every direction and the level sets are circles. Gradient descent with the step size ${{B1.tex.step}}$ reaches $x^*$ in one step from any $x$: $x - {{B1.tex.step}}\\nabla f(x) = 0$.",
      "ru": "Собственные значения ${{B1.steps.eig.1}}$ и ${{B1.steps.eig.2}}$ равны: кривизна одинакова по всем направлениям, и линии уровня — окружности. Градиентный спуск с шагом ${{B1.tex.step}}$ приходит в $x^*$ за один шаг из любой точки $x$: $x - {{B1.tex.step}}\\nabla f(x) = 0$."
     }
    }
   ],
   "answerText": {
    "en": "The only stationary point is $x^* = {{B1.steps.xStar}}$; $H \\succ 0$ gives a strict local minimum by the sufficient condition; it is global because $f \\ge 0 = f(x^*)$ (or by convexity).",
    "ru": "Единственная стационарная точка — $x^* = {{B1.steps.xStar}}$; $H \\succ 0$ даёт строгий локальный минимум по достаточному условию; он глобальный, потому что $f \\ge 0 = f(x^*)$ (или в силу выпуклости)."
   },
   "answers": [
    {
     "id": "x",
     "ref": "B1.answer.x",
     "label": {
      "en": "The stationary point",
      "ru": "Стационарная точка"
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
     "id": "condition",
     "ref": "B1.answer.condition",
     "label": {
      "en": "Which condition certifies the local minimum?",
      "ru": "Какое условие гарантирует локальный минимум?"
     },
     "options": [
      {
       "id": "necessary",
       "label": {
        "en": "The necessary one",
        "ru": "Необходимое"
       }
      },
      {
       "id": "sufficient",
       "label": {
        "en": "The sufficient one",
        "ru": "Достаточное"
       }
      }
     ]
    },
    {
     "id": "global",
     "ref": "B1.answer.global",
     "label": {
      "en": "Which arguments prove that the minimum is global?",
      "ru": "Какие аргументы доказывают глобальность минимума?"
     },
     "options": [
      {
       "id": "hessian",
       "label": {
        "en": "$H(x^*) \\succ 0$ alone",
        "ru": "Одно лишь $H(x^*) \\succ 0$"
       }
      },
      {
       "id": "convexity",
       "label": {
        "en": "$H(x) \\succeq 0$ at every $x$ (convexity)",
        "ru": "$H(x) \\succeq 0$ во всех точках (выпуклость)"
       }
      },
      {
       "id": "bound",
       "label": {
        "en": "$f(x) \\ge 0 = f(x^*)$ for all $x$",
        "ru": "$f(x) \\ge 0 = f(x^*)$ для всех $x$"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "Stationary means $\\nabla f = 0$: solve both equations.",
     "ru": "Стационарность означает $\\nabla f = 0$: решите оба уравнения."
    },
    {
     "en": "The sufficient condition certifies a local minimum only; “global” needs a statement about all $x$.",
     "ru": "Достаточное условие гарантирует только локальный минимум; для «глобального» нужно утверждение обо всех $x$."
    }
   ],
   "mistakes": [
    {
     "en": "Claiming a global minimum from $H(x^*) \\succ 0$ alone.",
     "ru": "Заявлять глобальный минимум только на основании $H(x^*) \\succ 0$."
    }
   ]
  },
  "B2": {
   "who": "students",
   "check": "B2",
   "title": {
    "en": "A saddle, proved without a picture",
    "ru": "Седло: доказательство без картинки"
   },
   "skill": {
    "en": "Indefinite Hessian; restriction to two lines as the proof",
    "ru": "Знаконеопределённый гессиан; сужение на две прямые как доказательство"
   },
   "statement": {
    "en": "Let $f(x) = {{B2.tex.f}}$. Show that $(0, 0)$ is a stationary point that is neither a minimum nor a maximum, without using a picture.",
    "ru": "Пусть $f(x) = {{B2.tex.f}}$. Покажите, не опираясь на картинку, что $(0;\\ 0)$ — стационарная точка, не являющаяся ни минимумом, ни максимумом."
   },
   "steps": [
    {
     "text": {
      "en": "$\\nabla f = {{B2.tex.grad}}$ vanishes only at the origin, and $H = {{B2.steps.H}}$.",
      "ru": "$\\nabla f = {{B2.tex.grad}}$ обращается в нуль только в начале координат, и $H = {{B2.steps.H}}$."
     }
    },
    {
     "text": {
      "en": "$\\Delta_1 = {{B2.steps.minors.1}} > 0$ and $\\Delta_2 = {{B2.steps.minors.2}} < 0$: neither. Since $\\det H < 0$, the eigenvalues ${{B2.steps.eig.1}}$ and ${{B2.steps.eig.2}}$ have opposite signs, and $H$ is indefinite.",
      "ru": "$\\Delta_1 = {{B2.steps.minors.1}} > 0$ и $\\Delta_2 = {{B2.steps.minors.2}} < 0$: ни один. Раз $\\det H < 0$, собственные значения ${{B2.steps.eig.1}}$ и ${{B2.steps.eig.2}}$ разных знаков, и гессиан знаконеопределён."
     },
     "predict": {
      "en": "Which Sylvester pattern holds?",
      "ru": "Какой шаблон Сильвестра выполнен?"
     }
    },
    {
     "text": {
      "en": "The proof restricts $f$ to the two axes: $f(t, 0) = t^2 > 0$ and $f(0, t) = -t^2 < 0$ for $t \\ne 0$. Every neighbourhood of the origin contains larger and smaller values than $f(0, 0) = 0$: a saddle.",
      "ru": "Доказательство — сужение $f$ на две оси: $f(t, 0) = t^2 > 0$ и $f(0, t) = -t^2 < 0$ при $t \\ne 0$. В любой окрестности начала координат есть значения и больше, и меньше $f(0, 0) = 0$: это седло."
     }
    },
    {
     "text": {
      "en": "Along the line at angle $\\theta$: $f(t\\cos\\theta, t\\sin\\theta) = {{B2.tex.line}}$, which vanishes identically at $\\theta = {{B2.tex.zeroAngles}}$ and has opposite signs on the two sides of these lines. The picture is a guide; the two restrictions are the proof.",
      "ru": "Вдоль прямой под углом $\\theta$: $f(t\\cos\\theta, t\\sin\\theta) = {{B2.tex.line}}$; это выражение тождественно равно нулю при $\\theta = {{B2.tex.zeroAngles}}$ и имеет разные знаки по разные стороны от этих прямых. Картинка — подсказка, а доказательство — два сужения."
     }
    }
   ],
   "answerText": {
    "en": "$\\Delta_1 = {{B2.steps.minors.1}}$, $\\Delta_2 = {{B2.steps.minors.2}}$, $H$ indefinite; $f(t, 0) = t^2$ and $f(0, t) = -t^2$, so the origin is a saddle.",
    "ru": "$\\Delta_1 = {{B2.steps.minors.1}}$, $\\Delta_2 = {{B2.steps.minors.2}}$, гессиан знаконеопределён; $f(t, 0) = t^2$ и $f(0, t) = -t^2$, поэтому начало координат — седло."
   },
   "answers": [
    {
     "id": "minors",
     "ref": "B2.answer.minors",
     "label": {
      "en": "Leading minors of $H$",
      "ru": "Угловые миноры $H$"
     },
     "components": [
      {
       "en": "$\\Delta_1$",
       "ru": "$\\Delta_1$"
      },
      {
       "en": "$\\Delta_2$",
       "ru": "$\\Delta_2$"
      }
     ]
    },
    {
     "id": "restrict",
     "ref": "B2.answer.restrict",
     "label": {
      "en": "$f(0, t)$ as a formula in $t$",
      "ru": "$f(0, t)$ как формула от $t$"
     }
    },
    {
     "id": "class",
     "ref": "B2.answer.class",
     "label": {
      "en": "The origin is",
      "ru": "Начало координат —"
     },
     "options": [
      {
       "id": "min",
       "label": {
        "en": "A local minimum",
        "ru": "Локальный минимум"
       }
      },
      {
       "id": "max",
       "label": {
        "en": "A local maximum",
        "ru": "Локальный максимум"
       }
      },
      {
       "id": "saddle",
       "label": {
        "en": "A saddle",
        "ru": "Седло"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "Restrict $f$ to a line through the origin: a two-dimensional question becomes a one-dimensional one.",
     "ru": "Сузьте $f$ на прямую через начало координат: двумерный вопрос станет одномерным."
    },
    {
     "en": "Two well-chosen lines settle it: try the two axes.",
     "ru": "Две удачно выбранные прямые решают вопрос: попробуйте оси координат."
    }
   ],
   "mistakes": [
    {
     "en": "Offering the contour picture as the proof; it is only a guide.",
     "ru": "Предъявлять картинку линий уровня как доказательство: это лишь подсказка."
    }
   ],
   "review": {
    "en": "At a stationary point, eigenvalues of both signs always mean a saddle; the two restrictions to the axes are the certificate.",
    "ru": "В стационарной точке собственные значения обоих знаков всегда означают седло; доказательством служат два сужения на оси."
   }
  },
  "B3": {
   "who": "students",
   "check": "B3",
   "title": {
    "en": "The monkey saddle",
    "ru": "Обезьянье седло"
   },
   "skill": {
    "en": "A zero Hessian: every optimality condition is silent, the definition decides",
    "ru": "Нулевой гессиан: все условия оптимальности молчат, решает определение"
   },
   "statement": {
    "en": "Let $f(x) = {{B3.tex.f}}$. **(a)** Find all stationary points. **(b)** Evaluate the Hessian at the origin. **(c)** Try the optimality conditions: what do they say? **(d)** Find a direction that settles the question.",
    "ru": "Пусть $f(x) = {{B3.tex.f}}$. **а)** Найдите все стационарные точки. **б)** Вычислите гессиан в начале координат. **в)** Примените условия оптимальности: что они говорят? **г)** Найдите направление, которое решает вопрос."
   },
   "steps": [
    {
     "text": {
      "en": "$\\partial f/\\partial x_1 = {{B3.tex.g1}}$, $\\partial f/\\partial x_2 = {{B3.tex.g2}}$. Case split: ${{B3.tex.g2}} = 0$ gives $x_1 = 0$ **or** $x_2 = 0$, and in either case the first equation forces the other coordinate to vanish. The only stationary point is the origin.",
      "ru": "$\\partial f/\\partial x_1 = {{B3.tex.g1}}$, $\\partial f/\\partial x_2 = {{B3.tex.g2}}$. Разбор случаев: ${{B3.tex.g2}} = 0$ даёт $x_1 = 0$ **или** $x_2 = 0$, и в каждом случае первое уравнение обнуляет другую координату. Единственная стационарная точка — начало координат."
     }
    },
    {
     "text": {
      "en": "$H(x) = {{B3.tex.H}}$, so $H(0, 0) = {{B3.steps.H0}}$, the zero matrix.",
      "ru": "$H(x) = {{B3.tex.H}}$, поэтому $H(0, 0) = {{B3.steps.H0}}$ — нулевая матрица."
     }
    },
    {
     "text": {
      "en": "The zero matrix is $\\succeq 0$, so the necessary condition for a minimum holds; it is also $\\preceq 0$, so the one for a maximum holds too. The sufficient condition needs $H \\succ 0$ and does not apply, and all $\\Delta_k = 0$, so Sylvester is silent. Every tool is silent.",
      "ru": "Нулевая матрица $\\succeq 0$, поэтому необходимое условие минимума выполнено; она же $\\preceq 0$, так что выполнено и необходимое условие максимума. Достаточное условие требует $H \\succ 0$ и неприменимо, а все $\\Delta_k = 0$, так что критерий Сильвестра молчит. Молчат все инструменты."
     },
     "predict": {
      "en": "What does each optimality condition say about the origin?",
      "ru": "Что говорит о начале координат каждое условие оптимальности?"
     }
    },
    {
     "text": {
      "en": "Use the definition along a line: $f(t, 0) = t^3$ is positive for $t > 0$ and negative for $t < 0$. Every neighbourhood of the origin has larger and smaller values: neither a minimum nor a maximum.",
      "ru": "Воспользуйтесь определением вдоль прямой: $f(t, 0) = t^3$ положительна при $t > 0$ и отрицательна при $t < 0$. В любой окрестности начала координат есть значения и больше, и меньше: ни минимум, ни максимум."
     }
    },
    {
     "text": {
      "en": "Why “monkey”: in polar coordinates $f = {{B3.tex.polar}}$, so the sign alternates in six sectors of ${{B3.tex.sector}}$, three up and three down: two valleys for the legs and one for the tail. Along $\\theta = {{B3.tex.zeroAngles}}$ the function is identically zero, and those lines settle nothing.",
      "ru": "Почему «обезьянье»: в полярных координатах $f = {{B3.tex.polar}}$, поэтому знак чередуется в шести секторах по ${{B3.tex.sector}}$, три вверх и три вниз: две ложбины для ног и одна для хвоста. Вдоль $\\theta = {{B3.tex.zeroAngles}}$ функция тождественно равна нулю, и эти прямые ничего не решают."
     }
    }
   ],
   "answerText": {
    "en": "The only stationary point is the origin; $H(0) = 0$, so the second-order test gives no verdict; $f(t, 0) = t^3$ changes sign, so the origin is neither a minimum nor a maximum.",
    "ru": "Единственная стационарная точка — начало координат; $H(0) = 0$, и тест второго порядка не даёт вердикта; $f(t, 0) = t^3$ меняет знак, поэтому начало координат — ни минимум, ни максимум."
   },
   "answers": [
    {
     "id": "stationary",
     "ref": "B3.answer.stationary",
     "label": {
      "en": "All stationary points, as $(x_1, x_2)$ separated by semicolons",
      "ru": "Все стационарные точки в виде $(x_1;\\ x_2)$ через точку с запятой"
     }
    },
    {
     "id": "class",
     "ref": "B3.answer.class",
     "label": {
      "en": "The origin is",
      "ru": "Начало координат —"
     },
     "options": [
      {
       "id": "min",
       "label": {
        "en": "A local minimum",
        "ru": "Локальный минимум"
       }
      },
      {
       "id": "max",
       "label": {
        "en": "A local maximum",
        "ru": "Локальный максимум"
       }
      },
      {
       "id": "neither",
       "label": {
        "en": "Neither a minimum nor a maximum",
        "ru": "Ни минимум, ни максимум"
       }
      }
     ]
    },
    {
     "id": "dirs",
     "ref": "B3.answer.dirs",
     "label": {
      "en": "Along which directions does $f(t\\,s)$ change sign at $t = 0$?",
      "ru": "Вдоль каких направлений $f(t\\,s)$ меняет знак при $t = 0$?"
     },
     "options": [
      {
       "id": "d1",
       "label": {
        "en": "$s = {{B3.tex.dir1}}$",
        "ru": "$s = {{B3.tex.dir1}}$"
       }
      },
      {
       "id": "d2",
       "label": {
        "en": "$s = {{B3.tex.dir2}}$",
        "ru": "$s = {{B3.tex.dir2}}$"
       }
      },
      {
       "id": "d3",
       "label": {
        "en": "$s = {{B3.tex.dir3}}$",
        "ru": "$s = {{B3.tex.dir3}}$"
       }
      },
      {
       "id": "d4",
       "label": {
        "en": "$s = {{B3.tex.dir4}}$",
        "ru": "$s = {{B3.tex.dir4}}$"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "The equation ${{B3.tex.g2}} = 0$ splits into two cases; do not skip either of them.",
     "ru": "Уравнение ${{B3.tex.g2}} = 0$ распадается на два случая; не пропускайте ни один."
    },
    {
     "en": "When $H = 0$, stop using theorems: compare $f$ with $f(0, 0) = 0$ along a well-chosen line.",
     "ru": "Когда $H = 0$, теоремы не помогут: сравните $f$ с $f(0, 0) = 0$ вдоль удачно выбранной прямой."
    }
   ],
   "mistakes": [
    {
     "en": "Concluding a minimum from $H(0) = 0 \\succeq 0$: that treats the necessary condition as if it were sufficient. This is the mistake the problem exists for.",
     "ru": "Делать вывод о минимуме из $H(0) = 0 \\succeq 0$: так необходимое условие принимают за достаточное. Ради этой ошибки задача и существует."
    },
    {
     "en": "Testing only the $x_2$-axis, where $f \\equiv 0$, and concluding that nothing happens.",
     "ru": "Проверять только ось $x_2$, где $f \\equiv 0$, и решать, что ничего не происходит."
    }
   ],
   "review": {
    "en": "Write the case split ${{B3.tex.g2}} = 0$: $x_1 = 0$ or $x_2 = 0$, and close both cases. Then draw the table of the optimality conditions on the board and put a question mark in every cell: the line $x_2 = 0$, where $f = t^3$, settles the question.",
    "ru": "Запишите разбор случаев ${{B3.tex.g2}} = 0$ ($x_1 = 0$ или $x_2 = 0$) и доведите оба случая до конца. Затем нарисуйте на доске таблицу условий оптимальности и поставьте знак вопроса в каждой клетке: прямая $x_2 = 0$, где $f = t^3$, решает вопрос."
   }
  },
  "B4": {
   "who": "students",
   "check": "B4",
   "title": {
    "en": "Same data, opposite answer",
    "ru": "Те же данные, противоположный ответ"
   },
   "skill": {
    "en": "A direct bound decides where the second-order test cannot",
    "ru": "Прямая оценка решает там, где тест второго порядка бессилен"
   },
   "statement": {
    "en": "Let $f(x) = {{B4.tex.f}}$. **(a)** Find the stationary points and $H(0, 0)$. **(b)** What does the second-order test say? **(c)** Decide the question in one line. **(d)** Compare with B3: what is identical and what is different?",
    "ru": "Пусть $f(x) = {{B4.tex.f}}$. **а)** Найдите стационарные точки и $H(0, 0)$. **б)** Что говорит тест второго порядка? **в)** Решите вопрос одной строкой. **г)** Сравните с B3: что совпадает и что различается?"
   },
   "steps": [
    {
     "text": {
      "en": "$\\nabla f = {{B4.tex.grad}} = 0$ only at the origin, and $H(x) = {{B4.tex.H}}$, so $H(0, 0) = {{B4.steps.H0}}$ again.",
      "ru": "$\\nabla f = {{B4.tex.grad}} = 0$ только в начале координат, $H(x) = {{B4.tex.H}}$, поэтому снова $H(0, 0) = {{B4.steps.H0}}$."
     }
    },
    {
     "text": {
      "en": "The second-order test is silent again: the necessary conditions hold and the sufficient one does not apply.",
      "ru": "Тест второго порядка снова молчит: необходимые условия выполнены, а достаточное неприменимо."
     },
     "predict": {
      "en": "The data at the origin are those of B3. Is the answer the same?",
      "ru": "Данные в начале координат те же, что в B3. Ответ тоже тот же?"
     }
    },
    {
     "text": {
      "en": "One line: $f(x) = {{B4.tex.f}} \\ge 0 = f(0, 0)$, with equality only at the origin. A **strict global** minimum, no theorem needed.",
      "ru": "Одна строка: $f(x) = {{B4.tex.f}} \\ge 0 = f(0, 0)$, причём равенство достигается только в начале координат. **Строгий глобальный** минимум, и никакие теоремы не нужны."
     }
    },
    {
     "text": {
      "en": "B3 and B4 have identical $\\nabla f(0)$ and $H(0)$ and opposite answers. When $H(0)$ is singular and semidefinite, the second-order test provably cannot decide: two functions with the same first- and second-order data behave differently.",
      "ru": "У B3 и B4 одинаковые $\\nabla f(0)$ и $H(0)$, а ответы противоположные. Когда $H(0)$ вырожден и полуопределён, тест второго порядка заведомо не может решить вопрос: две функции с одинаковыми данными первого и второго порядка ведут себя по-разному."
     }
    }
   ],
   "answerText": {
    "en": "$H(0, 0) = 0$ and the test is silent; $f \\ge 0 = f(0, 0)$ with equality only at the origin, so it is a strict global minimum. B3 has the same $\\nabla f(0)$ and $H(0)$ and no extremum.",
    "ru": "$H(0, 0) = 0$, и тест молчит; $f \\ge 0 = f(0, 0)$, причём равенство только в начале координат, поэтому это строгий глобальный минимум. У B3 те же $\\nabla f(0)$ и $H(0)$, но экстремума нет."
   },
   "answers": [
    {
     "id": "test",
     "ref": "B4.answer.test",
     "label": {
      "en": "The verdict of the second-order test at the origin",
      "ru": "Вердикт теста второго порядка в начале координат"
     },
     "options": [
      {
       "id": "min",
       "label": {
        "en": "A strict local minimum",
        "ru": "Строгий локальный минимум"
       }
      },
      {
       "id": "saddle",
       "label": {
        "en": "A saddle",
        "ru": "Седло"
       }
      },
      {
       "id": "inconclusive",
       "label": {
        "en": "No verdict",
        "ru": "Нет вердикта"
       }
      }
     ]
    },
    {
     "id": "class",
     "ref": "B4.answer.class",
     "label": {
      "en": "The origin is",
      "ru": "Начало координат —"
     },
     "options": [
      {
       "id": "strictGlobal",
       "label": {
        "en": "A strict global minimum",
        "ru": "Строгий глобальный минимум"
       }
      },
      {
       "id": "localOnly",
       "label": {
        "en": "A local minimum that is not global",
        "ru": "Локальный, но не глобальный минимум"
       }
      },
      {
       "id": "neither",
       "label": {
        "en": "Neither a minimum nor a maximum",
        "ru": "Ни минимум, ни максимум"
       }
      }
     ]
    },
    {
     "id": "same",
     "ref": "B4.answer.same",
     "label": {
      "en": "What do B3 and B4 share at the origin?",
      "ru": "Что совпадает у B3 и B4 в начале координат?"
     },
     "options": [
      {
       "id": "grad",
       "label": {
        "en": "$\\nabla f(0)$",
        "ru": "$\\nabla f(0)$"
       }
      },
      {
       "id": "hess",
       "label": {
        "en": "$H(0)$",
        "ru": "$H(0)$"
       }
      },
      {
       "id": "verdict",
       "label": {
        "en": "The answer to “is it a minimum?”",
        "ru": "Ответ на вопрос «минимум ли это?»"
       }
      }
     ]
    }
   ],
   "hints": [
    {
     "en": "No theorem is needed: look at the sign of $f$ itself.",
     "ru": "Теорема не нужна: посмотрите на знак самой $f$."
    },
    {
     "en": "Compare $f(x)$ with $f(0, 0)$ for every $x$, not only along a few lines.",
     "ru": "Сравните $f(x)$ с $f(0, 0)$ для всех $x$, а не только вдоль нескольких прямых."
    }
   ],
   "mistakes": [
    {
     "en": "Calling the silent test “bad luck”: with $H$ singular and semidefinite, the first- and second-order data cannot separate B3 from B4.",
     "ru": "Списывать молчание теста на «невезение»: при вырожденном полуопределённом $H$ данные первого и второго порядка не могут отличить B3 от B4."
    }
   ],
   "review": {
    "en": "B3 and B4 share $\\nabla f(0) = 0$ and $H(0) = 0$; a bound from below decides B4, a sign change along a line decides B3.",
    "ru": "У B3 и B4 общие $\\nabla f(0) = 0$ и $H(0) = 0$; B4 решает оценка снизу, B3 — смена знака вдоль прямой."
   }
  },
  "C1": {
   "who": "board",
   "check": "C1",
   "title": {
    "en": "A disk is convex: a proof from the definition",
    "ru": "Круг выпукл: доказательство по определению"
   },
   "skill": {
    "en": "A convexity proof with a named reason on every line",
    "ru": "Доказательство выпуклости с обоснованием каждой строки"
   },
   "statement": {
    "en": "Let $\\Omega = \\{x \\in \\mathbb R^2:\\ {{C1.tex.set}}\\}$. **(a)** Prove from the definition that $\\Omega$ is convex. **(b)** Which properties of the norm did the proof use? **(c)** Does the argument work for a square? For a ring?",
    "ru": "Пусть $\\Omega = \\{x \\in \\mathbb R^2:\\ {{C1.tex.set}}\\}$. **а)** Докажите по определению, что $\\Omega$ выпукло. **б)** Какие свойства нормы использованы? **в)** Годится ли рассуждение для квадрата? Для кольца?"
   },
   "steps": [
    {
     "text": {
      "en": "Rewrite the set as a ball: $\\Omega = \\{x:\\ \\|x\\| \\le {{C1.params.r}}\\}$. Take $x, y \\in \\Omega$, $\\lambda \\in [0, 1]$ and $z = \\lambda x + (1 - \\lambda) y$.",
      "ru": "Перепишите множество как шар: $\\Omega = \\{x:\\ \\|x\\| \\le {{C1.params.r}}\\}$. Возьмите $x, y \\in \\Omega$, $\\lambda \\in [0, 1]$ и $z = \\lambda x + (1 - \\lambda) y$."
     }
    },
    {
     "text": {
      "en": "$$\\|z\\| \\overset{(1)}{\\le} \\|\\lambda x\\| + \\|(1 - \\lambda) y\\| \\overset{(2)}{=} \\lambda\\|x\\| + (1 - \\lambda)\\|y\\| \\le {{C1.params.r}}\\lambda + {{C1.params.r}}(1 - \\lambda) = {{C1.params.r}},$$ where (1) is the triangle inequality and (2) is homogeneity; $\\lambda$ and $1 - \\lambda$ are nonnegative, so no absolute values appear. Hence $z \\in \\Omega$. $\\blacksquare$",
      "ru": "$$\\|z\\| \\overset{(1)}{\\le} \\|\\lambda x\\| + \\|(1 - \\lambda) y\\| \\overset{(2)}{=} \\lambda\\|x\\| + (1 - \\lambda)\\|y\\| \\le {{C1.params.r}}\\lambda + {{C1.params.r}}(1 - \\lambda) = {{C1.params.r}},$$ где (1) — неравенство треугольника, а (2) — однородность; $\\lambda$ и $1 - \\lambda$ неотрицательны, поэтому модули не появляются. Значит, $z \\in \\Omega$. $\\blacksquare$"
     },
     "predict": {
      "en": "Which two properties of the norm will the chain need?",
      "ru": "Какие два свойства нормы понадобятся в цепочке?"
     }
    },
    {
     "text": {
      "en": "The proof used only the triangle inequality and homogeneity: nothing about circles, the dimension or smoothness. So every ball in every norm is convex, including the $\\ell_1$ diamond and the $\\ell_\\infty$ square, which have corners.",
      "ru": "Доказательство использовало только неравенство треугольника и однородность — ничего об окружностях, размерности или гладкости. Поэтому выпукл любой шар в любой норме, включая ромб $\\ell_1$ и квадрат $\\ell_\\infty$, у которых есть углы."
     }
    },
    {
     "text": {
      "en": "The ring $\\{{{C1.tex.ring}}\\}$ is not convex: the points ${{C1.params.ringP}}$ and ${{C1.params.ringQ}}$ lie in it, but their midpoint ${{C1.steps.ringMid}}$ lies in the hole.",
      "ru": "Кольцо $\\{{{C1.tex.ring}}\\}$ не выпукло: точки ${{C1.params.ringP}}$ и ${{C1.params.ringQ}}$ лежат в нём, а их середина ${{C1.steps.ringMid}}$ — в дыре."
     }
    }
   ],
   "answerText": {
    "en": "Convex, by the triangle inequality and homogeneity; the same proof covers the $\\ell_\\infty$ square, while the ring is not convex.",
    "ru": "Выпукло — по неравенству треугольника и однородности; то же доказательство годится для квадрата $\\ell_\\infty$, а кольцо не выпукло."
   },
   "answers": [
    {
     "id": "props",
     "ref": "C1.answer.props",
     "label": {
      "en": "Which properties did the proof use?",
      "ru": "Какие свойства использовало доказательство?"
     },
     "options": [
      {
       "id": "triangle",
       "label": {
        "en": "The triangle inequality",
        "ru": "Неравенство треугольника"
       }
      },
      {
       "id": "homog",
       "label": {
        "en": "Homogeneity: $\\|\\lambda x\\| = |\\lambda|\\,\\|x\\|$",
        "ru": "Однородность: $\\|\\lambda x\\| = |\\lambda|\\,\\|x\\|$"
       }
      },
      {
       "id": "smooth",
       "label": {
        "en": "Smoothness of the boundary",
        "ru": "Гладкость границы"
       }
      },
      {
       "id": "symmetry",
       "label": {
        "en": "Rotational symmetry of the disk",
        "ru": "Вращательная симметрия круга"
       }
      }
     ]
    },
    {
     "id": "square",
     "ref": "C1.answer.square",
     "label": {
      "en": "Is the square $\\{\\max(|x_1|, |x_2|) \\le {{C1.params.r}}\\}$ convex?",
      "ru": "Выпукл ли квадрат $\\{\\max(|x_1|, |x_2|) \\le {{C1.params.r}}\\}$?"
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
    },
    {
     "id": "ring",
     "ref": "C1.answer.ring",
     "label": {
      "en": "Is the ring $\\{{{C1.tex.ring}}\\}$ convex?",
      "ru": "Выпукло ли кольцо $\\{{{C1.tex.ring}}\\}$?"
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
     "en": "Rewrite the set as $\\{x:\\ \\|x\\| \\le {{C1.params.r}}\\}$ and estimate $\\|z\\|$.",
     "ru": "Перепишите множество как $\\{x:\\ \\|x\\| \\le {{C1.params.r}}\\}$ и оцените $\\|z\\|$."
    },
    {
     "en": "Two standard norm properties are enough; write the name of each next to its step.",
     "ru": "Хватит двух стандартных свойств нормы; подпишите название каждого рядом с его шагом."
    }
   ],
   "mistakes": [
    {
     "en": "Giving a drawing instead of a proof, or a chain of inequalities without the reason for each step.",
     "ru": "Приводить рисунок вместо доказательства или цепочку неравенств без обоснования каждого шага."
    }
   ]
  },
  "C2": {
   "who": "students",
   "check": "C2",
   "title": {
    "en": "It is the size of the cross term that matters",
    "ru": "Важна величина смешанного слагаемого"
   },
   "skill": {
    "en": "Convexity of a quadratic from one constant matrix; a one-parameter family",
    "ru": "Выпуклость квадратичной функции по одной постоянной матрице; однопараметрическое семейство"
   },
   "statement": {
    "en": "**(a)** Is $f(x) = {{C2.tex.f}}$ convex on $\\mathbb R^2$? **(b)** Compare with A1, where the cross coefficient was ${{C2.params.aA1}}$. **(c)** For which $a$ is $f_a(x) = x_1^2 + x_2^2 + a\\,x_1x_2$ convex, and for which is it strictly convex?",
    "ru": "**а)** Выпукла ли $f(x) = {{C2.tex.f}}$ на $\\mathbb R^2$? **б)** Сравните с A1, где коэффициент смешанного слагаемого был ${{C2.params.aA1}}$. **в)** При каких $a$ функция $f_a(x) = x_1^2 + x_2^2 + a\\,x_1x_2$ выпукла, а при каких строго выпукла?"
   },
   "steps": [
    {
     "text": {
      "en": "$H = {{C2.steps.H}}$ at every point; $\\Delta_1 = {{C2.steps.minors.1}} > 0$ and $\\Delta_2 = {{C2.tex.delta2}} = {{C2.steps.minors.2}} < 0$.",
      "ru": "$H = {{C2.steps.H}}$ во всех точках; $\\Delta_1 = {{C2.steps.minors.1}} > 0$ и $\\Delta_2 = {{C2.tex.delta2}} = {{C2.steps.minors.2}} < 0$."
     }
    },
    {
     "text": {
      "en": "$\\Delta_2 = \\det H < 0$, so the eigenvalues ${{C2.steps.eig.1}}$ and ${{C2.steps.eig.2}}$ have opposite signs and $H$ is indefinite (that neither Sylvester pattern holds would not be enough). $H$ is nowhere $\\succeq 0$, so $f$ is **not** convex.",
      "ru": "$\\Delta_2 = \\det H < 0$, поэтому собственные значения ${{C2.steps.eig.1}}$ и ${{C2.steps.eig.2}}$ разных знаков и гессиан знаконеопределён (одного того, что ни один шаблон Сильвестра не выполнен, было бы мало). Условие $H \\succeq 0$ не выполнено ни в одной точке, поэтому $f$ **не** выпукла."
     },
     "predict": {
      "en": "Indefinite or semidefinite?",
      "ru": "Гессиан знаконеопределён или полуопределён?"
     }
    },
    {
     "text": {
      "en": "The family: $H_a = {{C2.tex.Ha}}$ with eigenvalues ${{C2.tex.eigA}}$. Convex $\\iff$ both are $\\ge 0$ $\\iff |a| \\le {{C2.params.aEdge}}$; strictly convex $\\iff |a| < {{C2.params.aEdge}}$ — for a quadratic the converse of the second-order criterion does hold, and the next step shows what happens at $|a| = {{C2.params.aEdge}}$.",
      "ru": "Семейство: $H_a = {{C2.tex.Ha}}$ с собственными значениями ${{C2.tex.eigA}}$. Выпукла $\\iff$ оба $\\ge 0$ $\\iff |a| \\le {{C2.params.aEdge}}$; строго выпукла $\\iff |a| < {{C2.params.aEdge}}$ — у квадратичной функции обратное к критерию второго порядка тоже верно, а что происходит при $|a| = {{C2.params.aEdge}}$, показывает следующий шаг."
     }
    },
    {
     "text": {
      "en": "$f = {{C2.tex.fEdge}}$: convex but not strictly, the eigenvalues are ${{C2.steps.eigEdge.1}}$ and ${{C2.steps.eigEdge.2}}$, and the whole line $x_1 + x_2 = 0$ consists of minimizers. A1 has $a = {{C2.params.aA1}}$ (eigenvalues ${{C2.steps.eigA1.1}}$, ${{C2.steps.eigA1.2}}$, convex); here $a = {{C2.params.a}}$: the size of the cross term decides, not its sign.",
      "ru": "$f = {{C2.tex.fEdge}}$: выпукла, но не строго, собственные значения равны ${{C2.steps.eigEdge.1}}$ и ${{C2.steps.eigEdge.2}}$, и вся прямая $x_1 + x_2 = 0$ состоит из точек минимума. В A1 было $a = {{C2.params.aA1}}$ (собственные значения ${{C2.steps.eigA1.1}}$ и ${{C2.steps.eigA1.2}}$, выпукла); здесь $a = {{C2.params.a}}$: решает величина смешанного слагаемого, а не его знак."
     },
     "predict": {
      "en": "What happens exactly at $a = {{C2.params.aEdge}}$?",
      "ru": "Что происходит ровно при $a = {{C2.params.aEdge}}$?"
     }
    }
   ],
   "answerText": {
    "en": "$\\Delta_2 = {{C2.steps.minors.2}}$, eigenvalues ${{C2.steps.eig.1}}$ and ${{C2.steps.eig.2}}$: not convex. $f_a$ is convex for $|a| \\le {{C2.params.aEdge}}$ and strictly convex for $|a| < {{C2.params.aEdge}}$.",
    "ru": "$\\Delta_2 = {{C2.steps.minors.2}}$, собственные значения ${{C2.steps.eig.1}}$ и ${{C2.steps.eig.2}}$: не выпукла. $f_a$ выпукла при $|a| \\le {{C2.params.aEdge}}$ и строго выпукла при $|a| < {{C2.params.aEdge}}$."
   },
   "answers": [
    {
     "id": "delta2",
     "ref": "C2.answer.delta2",
     "label": {
      "en": "$\\Delta_2$ for $a = {{C2.params.a}}$",
      "ru": "$\\Delta_2$ при $a = {{C2.params.a}}$"
     }
    },
    {
     "id": "convex",
     "ref": "C2.answer.convex",
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
    },
    {
     "id": "interval",
     "ref": "C2.answer.interval",
     "label": {
      "en": "Values of $a$ for which $f_a$ is convex",
      "ru": "Значения $a$, при которых $f_a$ выпукла"
     }
    }
   ],
   "hints": [
    {
     "en": "For a quadratic the Hessian is constant, so convexity is one question about one matrix.",
     "ru": "У квадратичной функции гессиан постоянен, так что выпуклость — это один вопрос об одной матрице."
    },
    {
     "en": "The eigenvalues of ${{C2.tex.Ha}}$ are ${{C2.tex.eigA}}$.",
     "ru": "Собственные значения ${{C2.tex.Ha}}$ равны ${{C2.tex.eigA}}$."
    }
   ],
   "mistakes": [
    {
     "en": "Judging by the sign of the cross term: A1 and C2 both have a negative one.",
     "ru": "Судить по знаку смешанного слагаемого: и в A1, и в C2 он отрицательный."
    },
    {
     "en": "Concluding “indefinite” only because neither Sylvester pattern holds: the negative determinant is what proves it here.",
     "ru": "Делать вывод «знаконеопределён» только потому, что ни один шаблон Сильвестра не выполнен: здесь это доказывает отрицательный определитель."
    }
   ],
   "review": {
    "en": "In the family widget, move $a$ through $\\pm{{C2.params.aEdge}}$: ellipses become parallel lines and then hyperbolas.",
    "ru": "В виджете семейства проведите $a$ через $\\pm{{C2.params.aEdge}}$: эллипсы превращаются в параллельные прямые, а затем в гиперболы."
   }
  },
  "D1": {
   "who": "board",
   "check": "D1",
   "title": {
    "en": "Optimality on the boundary",
    "ru": "Оптимальность на границе"
   },
   "skill": {
    "en": "Active constraints, the set of feasible directions and one violating direction",
    "ru": "Активные ограничения, множество допустимых направлений и одно нарушающее направление"
   },
   "statement": {
    "en": "Let $\\Omega = \\{x:\\ x_1 \\ge 0,\\ x_2 \\ge 0\\}$, $f(x) = {{D1.tex.f}}$ and $x = {{D1.params.x}}$. **(a)** Which constraints are active at $x$? **(b)** Describe all feasible directions at $x$. **(c)** Check the first-order necessary condition $s^\\top \\nabla f(x) \\ge 0$. **(d)** If it fails, give a direction that breaks it.",
    "ru": "Пусть $\\Omega = \\{x:\\ x_1 \\ge 0,\\ x_2 \\ge 0\\}$, $f(x) = {{D1.tex.f}}$ и $x = {{D1.params.x}}$. **а)** Какие ограничения активны в $x$? **б)** Опишите все допустимые направления в $x$. **в)** Проверьте необходимое условие первого порядка $s^\\top \\nabla f(x) \\ge 0$. **г)** Если оно нарушено, предъявите нарушающее направление."
   },
   "steps": [
    {
     "text": {
      "en": "$x_1 = 0$: the constraint $x_1 \\ge 0$ is **active**. $x_2 = {{D1.params.x.2}} > 0$: the constraint $x_2 \\ge 0$ is inactive, with room on both sides.",
      "ru": "$x_1 = 0$: ограничение $x_1 \\ge 0$ **активно**. $x_2 = {{D1.params.x.2}} > 0$: ограничение $x_2 \\ge 0$ неактивно, запас есть в обе стороны."
     }
    },
    {
     "text": {
      "en": "The feasible directions are ${{D1.tex.cone}}$, with $s_2$ free. If $s_1 < 0$, then $x_1 + \\alpha s_1 < 0$ for every $\\alpha > 0$. If $s_1 \\ge 0$, the first coordinate stays nonnegative, and $x_2 + \\alpha s_2 > 0$ for all $\\alpha \\in [0, \\alpha_0]$, for example with $\\alpha_0 = 1/|s_2|$ when $s_2 < 0$ (any $\\alpha_0 > 0$ works when $s_2 \\ge 0$).",
      "ru": "Допустимые направления — ${{D1.tex.cone}}$, $s_2$ любое. Если $s_1 < 0$, то $x_1 + \\alpha s_1 < 0$ при любом $\\alpha > 0$. Если $s_1 \\ge 0$, первая координата остаётся неотрицательной, а $x_2 + \\alpha s_2 > 0$ при всех $\\alpha \\in [0, \\alpha_0]$, например при $\\alpha_0 = 1/|s_2|$, если $s_2 < 0$ (при $s_2 \\ge 0$ подходит любое $\\alpha_0 > 0$)."
     },
     "predict": {
      "en": "Which directions are feasible: all, none or some?",
      "ru": "Какие направления допустимы: все, никакие или некоторые?"
     }
    },
    {
     "text": {
      "en": "$\\nabla f \\equiv {{D1.steps.grad}}$, so the condition to test is $s^\\top \\nabla f = s_1 + s_2 \\ge 0$ for **every** feasible $s$.",
      "ru": "$\\nabla f \\equiv {{D1.steps.grad}}$, поэтому проверять нужно условие $s^\\top \\nabla f = s_1 + s_2 \\ge 0$ для **каждого** допустимого $s$."
     }
    },
    {
     "text": {
      "en": "Take $s = {{D1.steps.s}}$: it is feasible, and $s^\\top \\nabla f = {{D1.steps.slope}} < 0$. The condition fails, so ${{D1.params.x}}$ is not a candidate. Moving down the edge decreases $f$ until the corner ${{D1.steps.xStar}}$ with $f = {{D1.steps.fStar}}$, the true minimizer.",
      "ru": "Возьмите $s = {{D1.steps.s}}$: оно допустимо, и $s^\\top \\nabla f = {{D1.steps.slope}} < 0$. Условие нарушено, поэтому ${{D1.params.x}}$ не кандидат. Движение вниз вдоль границы уменьшает $f$ вплоть до угла ${{D1.steps.xStar}}$, где $f = {{D1.steps.fStar}}$: это и есть точка минимума."
     }
    },
    {
     "text": {
      "en": "To reject a point, one violating direction is enough; to accept it, every feasible direction must pass. Replacing this infinite check by finitely many multipliers is the idea of the KKT conditions in the next seminar.",
      "ru": "Чтобы отвергнуть точку, достаточно одного нарушающего направления; чтобы принять её, проверку должно пройти каждое допустимое направление. Заменить эту бесконечную проверку конечным числом множителей — идея условий ККТ на следующем семинаре."
     }
    }
   ],
   "answerText": {
    "en": "Only $x_1 \\ge 0$ is active; the feasible directions are ${{D1.tex.cone}}$; $s = {{D1.steps.s}}$ gives $s^\\top \\nabla f = {{D1.steps.slope}} < 0$, so ${{D1.params.x}}$ is not a candidate.",
    "ru": "Активно только $x_1 \\ge 0$; допустимые направления — ${{D1.tex.cone}}$; $s = {{D1.steps.s}}$ даёт $s^\\top \\nabla f = {{D1.steps.slope}} < 0$, поэтому ${{D1.params.x}}$ не кандидат."
   },
   "answers": [
    {
     "id": "active",
     "ref": "D1.answer.active",
     "label": {
      "en": "Active constraints at $x$",
      "ru": "Активные ограничения в $x$"
     },
     "options": [
      {
       "id": "c1",
       "label": {
        "en": "$x_1 \\ge 0$",
        "ru": "$x_1 \\ge 0$"
       }
      },
      {
       "id": "c2",
       "label": {
        "en": "$x_2 \\ge 0$",
        "ru": "$x_2 \\ge 0$"
       }
      }
     ]
    },
    {
     "id": "cone",
     "ref": "D1.answer.cone",
     "label": {
      "en": "Feasible directions at $x$",
      "ru": "Допустимые направления в $x$"
     },
     "options": [
      {
       "id": "all",
       "label": {
        "en": "Every $s \\ne 0$",
        "ru": "Любое $s \\ne 0$"
       }
      },
      {
       "id": "half",
       "label": {
        "en": "$s \\ne 0$ with $s_1 \\ge 0$",
        "ru": "$s \\ne 0$ с $s_1 \\ge 0$"
       }
      },
      {
       "id": "quadrant",
       "label": {
        "en": "$s \\ne 0$ with $s_1 \\ge 0$ and $s_2 \\ge 0$",
        "ru": "$s \\ne 0$ с $s_1 \\ge 0$ и $s_2 \\ge 0$"
       }
      },
      {
       "id": "open",
       "label": {
        "en": "$s$ with $s_1 > 0$",
        "ru": "$s$ с $s_1 > 0$"
       }
      }
     ]
    },
    {
     "id": "candidate",
     "ref": "D1.answer.candidate",
     "label": {
      "en": "Does $x$ pass the first-order necessary condition?",
      "ru": "Выполнено ли в $x$ необходимое условие первого порядка?"
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
     "en": "One coordinate is pinned at its bound, the other has room on both sides.",
     "ru": "Одна координата прижата к границе, у другой есть запас в обе стороны."
    },
    {
     "en": "To reject the point, one feasible direction with $s^\\top \\nabla f < 0$ is enough.",
     "ru": "Чтобы отвергнуть точку, достаточно одного допустимого направления с $s^\\top \\nabla f < 0$."
    }
   ],
   "mistakes": [
    {
     "en": "Declaring all directions feasible, or none.",
     "ru": "Объявлять допустимыми все направления или ни одного."
    },
    {
     "en": "Testing only directions that point into the interior and concluding that the condition holds.",
     "ru": "Проверять только направления внутрь множества и заключать, что условие выполнено."
    }
   ]
  },
  "D2": {
   "who": "students",
   "check": "D2",
   "title": {
    "en": "A directional derivative, two ways",
    "ru": "Производная по направлению двумя способами"
   },
   "skill": {
    "en": "The limit definition against $s^\\top \\nabla f$; rate per unit of $\\alpha$ versus per unit of length",
    "ru": "Определение через предел и формула $s^\\top \\nabla f$; скорость на единицу $\\alpha$ и на единицу длины"
   },
   "statement": {
    "en": "Let $f(x) = {{D2.tex.f}}$, $x = {{D2.params.x}}$ and $s = {{D2.params.s}}$. **(a)** Compute $\\partial f/\\partial s\\,(x)$ from the definition, as a limit. **(b)** Compute it again as $s^\\top \\nabla f(x)$. **(c)** Is $s$ a descent direction? **(d)** Is your number a rate per unit of $\\alpha$ or per unit of length?",
    "ru": "Пусть $f(x) = {{D2.tex.f}}$, $x = {{D2.params.x}}$ и $s = {{D2.params.s}}$. **а)** Найдите $\\partial f/\\partial s\\,(x)$ по определению, через предел. **б)** Найдите её ещё раз как $s^\\top \\nabla f(x)$. **в)** Является ли $s$ направлением спуска? **г)** Ваше число — скорость на единицу $\\alpha$ или на единицу длины?"
   },
   "steps": [
    {
     "text": {
      "en": "$x + \\alpha s = {{D2.tex.xas}}$, so $f(x + \\alpha s) = {{D2.tex.expand}} = {{D2.tex.phi}}$, and $f(x) = {{D2.steps.fx}}$ is its value at $\\alpha = 0$.",
      "ru": "$x + \\alpha s = {{D2.tex.xas}}$, поэтому $f(x + \\alpha s) = {{D2.tex.expand}} = {{D2.tex.phi}}$, а $f(x) = {{D2.steps.fx}}$ — значение этого выражения при $\\alpha = 0$."
     }
    },
    {
     "text": {
      "en": "$$\\frac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\frac{f(x + \\alpha s) - f(x)}{\\alpha} = \\lim_{\\alpha \\to 0^+} \\bigl({{D2.tex.secant}}\\bigr) = {{D2.steps.dirDeriv}}.$$ The limit is one-sided because at a boundary point only $\\alpha \\ge 0$ may be allowed; at this interior point both one-sided limits agree.",
      "ru": "$$\\frac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\frac{f(x + \\alpha s) - f(x)}{\\alpha} = \\lim_{\\alpha \\to 0^+} \\bigl({{D2.tex.secant}}\\bigr) = {{D2.steps.dirDeriv}}.$$ Предел односторонний, потому что в граничной точке может быть разрешено только $\\alpha \\ge 0$; в этой внутренней точке оба односторонних предела совпадают."
     },
     "predict": {
      "en": "What will the limit be?",
      "ru": "Чему будет равен предел?"
     }
    },
    {
     "text": {
      "en": "$\\nabla f = {{D2.tex.grad}}$, so $\\nabla f(x) = {{D2.steps.grad}}$ and $s^\\top \\nabla f(x) = {{D2.tex.dot}} = {{D2.steps.dirDeriv}}$: both routes agree.",
      "ru": "$\\nabla f = {{D2.tex.grad}}$, поэтому $\\nabla f(x) = {{D2.steps.grad}}$ и $s^\\top \\nabla f(x) = {{D2.tex.dot}} = {{D2.steps.dirDeriv}}$: оба способа дают одно и то же."
     }
    },
    {
     "text": {
      "en": "The value is negative, so $s$ is a descent direction. But $\\|s\\| = {{D2.tex.normS}}$, so ${{D2.steps.dirDeriv}}$ is a rate per unit of $\\alpha$; per unit of length it is ${{D2.tex.perLength}} \\approx {{D2.steps.perLength}}$.",
      "ru": "Значение отрицательно, так что $s$ — направление спуска. Но $\\|s\\| = {{D2.tex.normS}}$, поэтому ${{D2.steps.dirDeriv}}$ — скорость на единицу $\\alpha$; на единицу длины она равна ${{D2.tex.perLength}} \\approx {{D2.steps.perLength}}$."
     }
    },
    {
     "text": {
      "en": "The steepest descent direction is $-\\nabla f(x)/\\|\\nabla f(x)\\|$, with the rate $-\\|\\nabla f(x)\\| = {{D2.tex.steepest}} \\approx {{D2.steps.steepest}}$ per unit of length, ${{D2.tex.ratio}} \\approx {{D2.steps.ratio}}$ times the rate along $s/\\|s\\|$. This is why descent methods step against the gradient.",
      "ru": "Направление наискорейшего убывания — $-\\nabla f(x)/\\|\\nabla f(x)\\|$, скорость вдоль него равна $-\\|\\nabla f(x)\\| = {{D2.tex.steepest}} \\approx {{D2.steps.steepest}}$ на единицу длины, в ${{D2.tex.ratio}} \\approx {{D2.steps.ratio}}$ раза больше по модулю, чем вдоль $s/\\|s\\|$. Поэтому методы спуска шагают против градиента."
     },
     "predict": {
      "en": "Which unit direction descends fastest, and how fast?",
      "ru": "Вдоль какого единичного направления функция убывает быстрее всего и с какой скоростью?"
     }
    }
   ],
   "answerText": {
    "en": "$f(x + \\alpha s) = {{D2.tex.phi}}$, both routes give ${{D2.steps.dirDeriv}}$ per unit of $\\alpha$; per unit of length ${{D2.tex.perLength}}$; $s$ is a descent direction.",
    "ru": "$f(x + \\alpha s) = {{D2.tex.phi}}$, оба способа дают ${{D2.steps.dirDeriv}}$ на единицу $\\alpha$; на единицу длины ${{D2.tex.perLength}}$; $s$ — направление спуска."
   },
   "answers": [
    {
     "id": "phi",
     "ref": "D2.answer.phi",
     "label": {
      "en": "$f(x + \\alpha s)$ as a formula in $\\alpha$ (type `alpha`)",
      "ru": "$f(x + \\alpha s)$ как формула от $\\alpha$ (пишите `alpha`)"
     }
    },
    {
     "id": "dirDeriv",
     "ref": "D2.answer.dirDeriv",
     "label": {
      "en": "$\\partial f/\\partial s\\,(x)$",
      "ru": "$\\partial f/\\partial s\\,(x)$"
     }
    },
    {
     "id": "perLength",
     "ref": "D2.answer.perLength",
     "label": {
      "en": "The rate per unit of length (three decimals)",
      "ru": "Скорость на единицу длины (три знака после запятой)"
     }
    },
    {
     "id": "descent",
     "ref": "D2.answer.descent",
     "label": {
      "en": "Is $s$ a descent direction?",
      "ru": "Является ли $s$ направлением спуска?"
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
     "en": "Substitute $x + \\alpha s$ into $f$ and expand: you get a quadratic in $\\alpha$ whose constant term is $f(x)$.",
     "ru": "Подставьте $x + \\alpha s$ в $f$ и раскройте скобки: получится квадратный трёхчлен от $\\alpha$ со свободным членом $f(x)$."
    },
    {
     "en": "Divide by $\\|s\\|$ to turn a rate per unit of $\\alpha$ into a rate per unit of length.",
     "ru": "Разделите на $\\|s\\|$, чтобы перейти от скорости на единицу $\\alpha$ к скорости на единицу длины."
    }
   ],
   "mistakes": [
    {
     "en": "Reporting ${{D2.steps.dirDeriv}}$ as the rate per unit of length: $s$ is not a unit vector.",
     "ru": "Выдавать ${{D2.steps.dirDeriv}}$ за скорость на единицу длины: $s$ не единичный вектор."
    },
    {
     "en": "Forgetting to subtract $f(x)$ before dividing by $\\alpha$: the quotient $f(x + \\alpha s)/\\alpha$ has no finite limit.",
     "ru": "Забывать вычитать $f(x)$ перед делением на $\\alpha$: у отношения $f(x + \\alpha s)/\\alpha$ нет конечного предела."
    }
   ],
   "review": {
    "en": "In the secant widget, switch $d$ between $s$, $s/\\|s\\|$ and $-\\nabla f/\\|\\nabla f\\|$: the limits are ${{D2.steps.dirDeriv}}$, ${{D2.tex.perLength}}$ and ${{D2.tex.steepest}}$.",
    "ru": "В виджете с секущей переключайте $d$ между $s$, $s/\\|s\\|$ и $-\\nabla f/\\|\\nabla f\\|$: пределы равны ${{D2.steps.dirDeriv}}$, ${{D2.tex.perLength}}$ и ${{D2.tex.steepest}}$."
   }
  }
 }
}/*JSON-END*/);
