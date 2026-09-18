// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 01 content: block texts, recaps, demos, mistakes, exit ticket and home practice, in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar01_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "O": {
    "title": {
     "en": "Opening",
     "ru": "Начало"
    },
    "short": {
     "en": "Opening",
     "ru": "Начало"
    },
    "goals": {
     "title": {
      "en": "Training is minimization",
      "ru": "Обучение — это минимизация"
     },
     "text": {
      "en": "Training a model means minimizing a loss over its parameters, and a model with $n$ weights is a point in $\\mathbb R^n$, with $n$ far too large for a picture. So a minimum has to be recognized by local signs: the gradient finds candidates, the Hessian sorts them, and convexity turns a local answer into a global one. Today we build this vocabulary on small functions, where every claim can be checked by hand and in code.",
      "ru": "Обучить модель — значит минимизировать функцию потерь по её параметрам, а модель с $n$ весами — это точка в $\\mathbb R^n$, где $n$ слишком велико для картинки. Поэтому минимум приходится распознавать по локальным признакам: градиент находит кандидатов, гессиан их сортирует, а выпуклость превращает локальный ответ в глобальный. Сегодня этот словарь строится на маленьких функциях, где каждое утверждение можно проверить и вручную, и в коде."
     },
     "items": [
      {
       "en": "**Define** local and global minima and stationary points.",
       "ru": "**Определять** локальные и глобальные минимумы и стационарные точки."
      },
      {
       "en": "**Compute** gradients and Hessians without sign mistakes.",
       "ru": "**Вычислять** градиенты и гессианы без ошибок в знаках."
      },
      {
       "en": "**Classify** stationary points: minimum, maximum, saddle or a case the second-order test cannot decide.",
       "ru": "**Классифицировать** стационарные точки: минимум, максимум, седло или случай, который тест второго порядка не решает."
      },
      {
       "en": "**Recognize** convex sets and convex functions.",
       "ru": "**Распознавать** выпуклые множества и выпуклые функции."
      },
      {
       "en": "**Handle the boundary**: feasible directions and the inequality $s^\\top \\nabla f(x^*) \\ge 0$.",
       "ru": "**Работать с границей**: допустимые направления и неравенство $s^\\top \\nabla f(x^*) \\ge 0$."
      }
     ]
    },
    "hook": {
     "title": {
      "en": "Read the picture before you differentiate",
      "ru": "Прочитайте картинку, прежде чем дифференцировать"
     },
     "text": {
      "en": "Three landscapes with five marked points. Before any calculus, decide what each point is.",
      "ru": "Три ландшафта и пять отмеченных точек. Прежде чем что-либо считать, решите, что это за точки."
     },
     "caption": {
      "en": "Level values are printed on the contours of the two maps; the right panel is the slice $g(t) = {{hook.slice.tex.g}}$. Pick a point to read its gradient and curvature.",
      "ru": "На линиях уровня двух карт подписаны значения; справа — срез $g(t) = {{hook.slice.tex.g}}$. Выберите точку, чтобы увидеть её градиент и кривизну."
     },
     "predict": {
      "en": "Which marked points are local minima, and which of the two minima of $g$ is global? What decides: the gradient, the curvature or the values?",
      "ru": "Какие отмеченные точки — локальные минимумы и какой из двух минимумов $g$ глобальный? Что здесь решает: градиент, кривизна или значения?"
     },
     "answer": {
      "en": "The gradient is zero at all five points, so it cannot tell them apart; the curvature sorts them. $p_1$ is a minimum (the level values grow outwards), and since the bowl is nonnegative it is also the global minimum of the bowl; $p_2$ is a saddle; $p_4$ is a local maximum; $p_3$ and $p_5$ are local minima of $g$. Between them only the values decide: $g = {{hook.slice.tex.gMin}}$ at $p_3$ and $g = {{hook.slice.tex.gLocal}}$ at $p_5$. Since $g$ grows without bound as $|t| \\to \\infty$, its global minimum exists and is one of its local minima, so it is $p_3$. No local information could tell you that.",
      "ru": "Градиент равен нулю во всех пяти точках, поэтому различить их он не может; их сортирует кривизна. $p_1$ — минимум (значения на линиях уровня растут наружу), а поскольку чаша неотрицательна, это и глобальный минимум чаши; $p_2$ — седло; $p_4$ — локальный максимум; $p_3$ и $p_5$ — локальные минимумы $g$. Между ними решают только значения: $g = {{hook.slice.tex.gMin}}$ в $p_3$ и $g = {{hook.slice.tex.gLocal}}$ в $p_5$. Поскольку $g$ неограниченно растёт при $|t| \\to \\infty$, глобальный минимум существует и совпадает с одним из локальных, то есть это $p_3$. Никакая локальная информация этого не скажет."
     }
    },
    "overview": {
     "title": {
      "en": "Today's problems",
      "ru": "Задачи на сегодня"
     },
     "text": {
      "en": "Photograph this screen. The first problem of each block is solved on the board; the others are yours, on a timer.",
      "ru": "Сфотографируйте этот экран. Первая задача каждого блока решается у доски, остальные — ваши, на время."
     }
    }
   },
   "A": {
    "title": {
     "en": "A. Gradients and Hessians",
     "ru": "A. Градиенты и гессианы"
    },
    "short": {
     "en": "Gradients",
     "ru": "Градиенты"
    },
    "recap": [
     {
      "en": "Local minimizer: $x^* \\in \\Omega$ such that for some $\\varepsilon > 0$ we have $f(x) \\ge f(x^*)$ for all $x \\in \\Omega$ with $\\|x - x^*\\| < \\varepsilon$. Global: the same for all $x \\in \\Omega$. Strict: $f(x) > f(x^*)$ for $x \\ne x^*$.",
      "ru": "Точка локального минимума: такая $x^* \\in \\Omega$, что для некоторого $\\varepsilon > 0$ выполнено $f(x) \\ge f(x^*)$ при всех $x \\in \\Omega$, $\\|x - x^*\\| < \\varepsilon$. Глобального: то же для всех $x \\in \\Omega$. Строгого: $f(x) > f(x^*)$ при $x \\ne x^*$."
     },
     {
      "en": "$\\nabla f(x) \\in \\mathbb R^n$ is the column of partial derivatives; the Hessian $H(x) = \\big[\\partial^2 f/\\partial x_i\\,\\partial x_j\\big] \\in \\mathbb R^{n \\times n}$ is symmetric when the second partials are continuous (Schwarz). A quadratic has a constant $H$; in general $H$ depends on $x$.",
      "ru": "$\\nabla f(x) \\in \\mathbb R^n$ — столбец частных производных; гессиан $H(x) = \\big[\\partial^2 f/\\partial x_i\\,\\partial x_j\\big] \\in \\mathbb R^{n \\times n}$ симметричен, если вторые частные производные непрерывны (теорема Шварца). У квадратичной функции $H$ постоянен, а в общем случае зависит от $x$."
     },
     {
      "en": "Reading $H$ off a polynomial: the diagonal gets twice the coefficient of $x_i^2$, and a cross term $c\\,x_ix_j$ puts $c$ into both $H_{ij}$ and $H_{ji}$. In $f = x^\\top A x$ the entry $A_{ij}$ is $c/2$, and $H = A + A^\\top$.",
      "ru": "Гессиан многочлена: на диагонали удвоенные коэффициенты при $x_i^2$, а смешанное слагаемое $c\\,x_ix_j$ даёт $c$ в оба элемента $H_{ij}$ и $H_{ji}$. В записи $f = x^\\top A x$ элемент $A_{ij}$ равен $c/2$, и $H = A + A^\\top$."
     },
     {
      "en": "The lecture example: $f(x) = {{A.lecture.tex.f}}$ has $H(x) = {{A.lecture.tex.H}}$. At ${{A.lecture.x}}$: $\\nabla f = {{A.lecture.grad}}$, $H = {{A.lecture.H}}$, $\\det H = {{A.lecture.det}}$.",
      "ru": "Пример из лекции: у $f(x) = {{A.lecture.tex.f}}$ гессиан $H(x) = {{A.lecture.tex.H}}$. В точке ${{A.lecture.x}}$: $\\nabla f = {{A.lecture.grad}}$, $H = {{A.lecture.H}}$, $\\det H = {{A.lecture.det}}$."
     },
     {
      "en": "Sylvester's criterion with the leading minors $\\Delta_k$ (determinants of the top-left $k \\times k$ blocks): $H \\succ 0 \\iff \\Delta_k > 0$ for all $k$; $H \\prec 0 \\iff (-1)^k\\Delta_k > 0$ for all $k$.",
      "ru": "Критерий Сильвестра с угловыми минорами $\\Delta_k$ (определителями левых верхних блоков $k \\times k$): $H \\succ 0 \\iff \\Delta_k > 0$ для всех $k$; $H \\prec 0 \\iff (-1)^k\\Delta_k > 0$ для всех $k$."
     }
    ],
    "widgets": {
     "probe": {
      "title": {
       "en": "Gradient and Hessian probe",
       "ru": "Зонд: градиент и гессиан"
      },
      "caption": {
       "en": "Contours of the lecture function $f(x) = {{A.lecture.tex.f}}$; the shading marks where $H(x) \\succeq 0$. Drag the probe or pick a preset point: the arrow is $\\nabla f(x)$, the panel prints $H(x)$, its determinant and its eigenvalues.",
       "ru": "Линии уровня функции из лекции $f(x) = {{A.lecture.tex.f}}$; закрашено там, где $H(x) \\succeq 0$. Тяните зонд или выберите готовую точку: стрелка — это $\\nabla f(x)$, а на панели — $H(x)$, его определитель и собственные значения."
      },
      "predict": {
       "en": "At ${{A.lecture.x}}$ the Hessian is positive definite. Is ${{A.lecture.x}}$ a minimum?",
       "ru": "В точке ${{A.lecture.x}}$ гессиан положительно определён. Минимум ли это?"
      },
      "answer": {
       "en": "No: $\\nabla f = {{A.lecture.grad}} \\ne 0$ there. The only stationary point is the origin, where $H = {{A.lecture.H0}}$ is singular, and along $x_2 = 0$ the function $f = {{A.lecture.tex.restr}}$ changes sign: no extremum at all.",
       "ru": "Нет: там $\\nabla f = {{A.lecture.grad}} \\ne 0$. Единственная стационарная точка — начало координат, где $H = {{A.lecture.H0}}$ вырожден, а на прямой $x_2 = 0$ функция $f = {{A.lecture.tex.restr}}$ меняет знак: экстремумов нет вовсе."
      }
     }
    },
    "code": {
     "title": {
      "en": "In code: the gradient by central differences",
      "ru": "В коде: градиент центральными разностями"
     },
     "text": {
      "en": "Each partial derivative comes from two values of $f$, independently of your formula: $\\partial f/\\partial x_j \\approx \\big(f(x + he_j) - f(x - he_j)\\big)/(2h)$. A mismatch points at a differentiation error.",
      "ru": "Каждая частная производная получается из двух значений $f$, независимо от вашей формулы: $\\partial f/\\partial x_j \\approx \\big(f(x + he_j) - f(x - he_j)\\big)/(2h)$. Расхождение указывает на ошибку дифференцирования."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Classifying stationary points",
     "ru": "B. Классификация стационарных точек"
    },
    "short": {
     "en": "Classification",
     "ru": "Классификация"
    },
    "recap": [
     {
      "en": "If neither Sylvester pattern holds, the leading minors are silent: $\\operatorname{diag}(0, -1)$ and $\\operatorname{diag}(0, 1)$ both have $\\Delta_1 = \\Delta_2 = 0$, yet the first is $\\preceq 0$ and the second $\\succeq 0$. Semidefiniteness needs all principal minors or the eigenvalues.",
      "ru": "Если ни один шаблон Сильвестра не выполнен, угловые миноры молчат: у $\\operatorname{diag}(0, -1)$ и $\\operatorname{diag}(0, 1)$ одинаково $\\Delta_1 = \\Delta_2 = 0$, но первая матрица $\\preceq 0$, а вторая $\\succeq 0$. Для полуопределённости нужны все главные миноры или собственные значения."
     },
     {
      "en": "Where the conditions come from: $f(x^* + h) = f(x^*) + \\nabla f(x^*)^\\top h + \\tfrac12 h^\\top H(x^*) h + o(\\|h\\|^2)$. While $\\nabla f(x^*) \\ne 0$ the linear term decides; once it vanishes, the sign of $h^\\top H(x^*) h$ over all directions $h$ decides.",
      "ru": "Откуда берутся условия: $f(x^* + h) = f(x^*) + \\nabla f(x^*)^\\top h + \\tfrac12 h^\\top H(x^*) h + o(\\|h\\|^2)$. Пока $\\nabla f(x^*) \\ne 0$, решает линейное слагаемое; как только оно обращается в нуль, решает знак $h^\\top H(x^*) h$ по всем направлениям $h$."
     },
     {
      "en": "At an interior point: first-order necessary $\\nabla f(x^*) = 0$; second-order necessary $H(x^*) \\succeq 0$; sufficient $\\nabla f(x^*) = 0$ and $H(x^*) \\succ 0$, which gives a strict local minimum. No sufficient condition of first order exists.",
      "ru": "Во внутренней точке: необходимое условие первого порядка $\\nabla f(x^*) = 0$; необходимое второго порядка $H(x^*) \\succeq 0$; достаточное $\\nabla f(x^*) = 0$ и $H(x^*) \\succ 0$, оно даёт строгий локальный минимум. Достаточного условия первого порядка не существует."
     },
     {
      "en": "Eigenvalues of $H(x^*)$ at a stationary point: all positive, a strict local minimum; all negative, a strict local maximum; both signs, a saddle; zero eigenvalues without both signs, the second-order test cannot decide.",
      "ru": "Собственные значения $H(x^*)$ в стационарной точке: все положительны — строгий локальный минимум; все отрицательны — строгий локальный максимум; есть значения обоих знаков — седло; есть нулевые, но нет значений разных знаков — тест второго порядка ничего не решает."
     },
     {
      "en": "When the test is silent, use the definition: restrict $f$ to lines $t \\mapsto x^* + t\\,s$ or bound $f(x) - f(x^*)$ from below. A picture is a guide, not a proof.",
      "ru": "Когда тест молчит, используйте определение: сузьте $f$ на прямые $t \\mapsto x^* + t\\,s$ или оцените $f(x) - f(x^*)$ снизу. Картинка — подсказка, а не доказательство."
     }
    ],
    "widgets": {
     "definiteness": {
      "title": {
       "en": "Sylvester lab",
       "ru": "Лаборатория Сильвестра"
      },
      "caption": {
       "en": "Pick a preset or move the entries of a symmetric matrix $H$. Show the answer, and the plane of $h$ is coloured by the sign of $h^\\top H h$; the panel compares the leading minors, all principal minors and the eigenvalues.",
       "ru": "Выберите готовую симметричную матрицу $H$ или меняйте её элементы. Покажите ответ — и плоскость векторов $h$ раскрасится по знаку $h^\\top H h$; панель сравнивает угловые миноры, все главные миноры и собственные значения."
      },
      "predict": {
       "en": "The presets $\\operatorname{diag}(0, -1)$ and $\\operatorname{diag}(0, 1)$ have the same leading minors. Is either of them semidefinite?",
       "ru": "У готовых матриц $\\operatorname{diag}(0, -1)$ и $\\operatorname{diag}(0, 1)$ одинаковые угловые миноры. Полуопределена ли какая-нибудь из них?"
      },
      "answer": {
       "en": "Both are: $\\operatorname{diag}(0, -1) \\preceq 0$ and $\\operatorname{diag}(0, 1) \\succeq 0$. Identical leading minors, opposite answers: the principal minor $H_{22}$ or the eigenvalues decide.",
       "ru": "Обе: $\\operatorname{diag}(0, -1) \\preceq 0$ и $\\operatorname{diag}(0, 1) \\succeq 0$. Угловые миноры одинаковы, ответы противоположны: решают главный минор $H_{22}$ или собственные значения."
      }
     },
     "lines": {
      "title": {
       "en": "Restriction to a line",
       "ru": "Сужение на прямую"
      },
      "caption": {
       "en": "Pick a function and turn the line through the origin. Left: the contours and the sign of $f$. Right: $\\varphi(t) = f(t\\cos\\theta, t\\sin\\theta)$. One line along which $\\varphi$ changes sign rules out an extremum.",
       "ru": "Выберите функцию и поворачивайте прямую через начало координат. Слева — линии уровня и знак $f$, справа — $\\varphi(t) = f(t\\cos\\theta, t\\sin\\theta)$. Одна прямая, на которой $\\varphi$ меняет знак, исключает экстремум."
      },
      "predict": {
       "en": "Monkey saddle B3: along which lines through the origin is $f$ identically zero?",
       "ru": "Обезьянье седло B3: на каких прямых через начало координат $f$ тождественно равна нулю?"
      },
      "answer": {
       "en": "At $\\theta = {{B3.tex.zeroAngles}}$, where ${{B.lines.tex.monkey}} = 0$: those lines settle nothing. Every other line gives $\\varphi(t) = c\\,t^3$ with $c \\ne 0$, which changes sign at $t = 0$.",
       "ru": "При $\\theta = {{B3.tex.zeroAngles}}$, где ${{B.lines.tex.monkey}} = 0$: эти прямые ничего не решают. Любая другая прямая даёт $\\varphi(t) = c\\,t^3$ с $c \\ne 0$, и эта функция меняет знак при $t = 0$."
      }
     }
    },
    "code": {
     "title": {
      "en": "In code: the second-order test and the minors",
      "ru": "В коде: тест второго порядка и миноры"
     },
     "text": {
      "en": "`classify` reads the signs of the eigenvalues with a tolerance relative to the largest absolute eigenvalue and answers `\"inconclusive\"` when the eigenvalues give no verdict; call it at a stationary point, on an exactly computed Hessian. The minors show why leading minors cannot decide semidefiniteness. The code needs `numpy` and `itertools`.",
      "ru": "`classify` читает знаки собственных значений с допуском относительно наибольшего по модулю собственного значения и отвечает `\"inconclusive\"`, когда собственные значения не дают вердикта; вызывайте его в стационарной точке и на точно вычисленном гессиане. Миноры показывают, почему угловых миноров не хватает для полуопределённости. Коду нужны `numpy` и `itertools`."
     }
    }
   },
   "C": {
    "title": {
     "en": "C. Convexity",
     "ru": "C. Выпуклость"
    },
    "short": {
     "en": "Convexity",
     "ru": "Выпуклость"
    },
    "recap": [
     {
      "en": "Convex set: $\\lambda x + (1 - \\lambda) y \\in \\Omega$ for all $x, y \\in \\Omega$ and $\\lambda \\in [0, 1]$: the whole segment stays in the set.",
      "ru": "Выпуклое множество: $\\lambda x + (1 - \\lambda) y \\in \\Omega$ для всех $x, y \\in \\Omega$ и $\\lambda \\in [0, 1]$: отрезок целиком лежит в множестве."
     },
     {
      "en": "Convex function on a convex $\\Omega$: $f\\big(\\lambda x + (1 - \\lambda) y\\big) \\le \\lambda f(x) + (1 - \\lambda) f(y)$ for all $x, y \\in \\Omega$ and $\\lambda \\in [0, 1]$. The graph never rises above a chord.",
      "ru": "Выпуклая функция на выпуклом $\\Omega$: $f\\big(\\lambda x + (1 - \\lambda) y\\big) \\le \\lambda f(x) + (1 - \\lambda) f(y)$ для всех $x, y \\in \\Omega$ и $\\lambda \\in [0, 1]$. График не поднимается выше хорды."
     },
     {
      "en": "For $f \\in C^2$ on $\\mathbb R^n$: convex $\\iff H(x) \\succeq 0$ at every $x$. $H \\succ 0$ everywhere gives strict convexity, but not conversely: $x^4$ is strictly convex with $f''(0) = 0$.",
      "ru": "Для $f \\in C^2$ на $\\mathbb R^n$: выпукла $\\iff H(x) \\succeq 0$ во всех точках. Из $H \\succ 0$ всюду следует строгая выпуклость, но не наоборот: $x^4$ строго выпукла, хотя $f''(0) = 0$."
     },
     {
      "en": "For a convex $f$ on a convex $\\Omega$ every local minimum is global, and at an interior point $\\nabla f(x^*) = 0$ becomes sufficient. Mean squared error, logistic loss and Huber loss of a linear model are convex in its weights, also with $\\rho\\|w\\|^2$ added; for neural networks this fails in general.",
      "ru": "У выпуклой $f$ на выпуклом $\\Omega$ любой локальный минимум глобален, а во внутренней точке условие $\\nabla f(x^*) = 0$ становится достаточным. Среднеквадратичная, логистическая функции потерь и функция Хьюбера для линейной модели выпуклы по весам, в том числе с добавкой $\\rho\\|w\\|^2$; для нейросетей это, вообще говоря, неверно."
     }
    ],
    "widgets": {
     "convexSets": {
      "title": {
       "en": "Convex set tester",
       "ru": "Проверка выпуклости множества"
      },
      "caption": {
       "en": "Drag $p$ and $q$ and move $\\lambda$. The segment turns red where it leaves the set; the panel checks the chain for $z = \\lambda p + (1 - \\lambda) q$ in the norm of the set.",
       "ru": "Тяните $p$ и $q$ и меняйте $\\lambda$. Отрезок краснеет там, где выходит из множества; панель проверяет цепочку для $z = \\lambda p + (1 - \\lambda) q$ в норме этого множества."
      },
      "predict": {
       "en": "Which of the four sets are convex?",
       "ru": "Какие из четырёх множеств выпуклы?"
      },
      "answer": {
       "en": "The disk, the $\\ell_1$ diamond and the $\\ell_\\infty$ square are balls of radius ${{C.sets.r}}$ in three norms, so the proof of C1 applies to each of them. The ring is not convex: the segment from ${{C1.params.ringP}}$ to ${{C1.params.ringQ}}$ crosses the hole.",
       "ru": "Круг, ромб $\\ell_1$ и квадрат $\\ell_\\infty$ — шары радиуса ${{C.sets.r}}$ в трёх нормах, поэтому доказательство из C1 годится для каждого. Кольцо не выпукло: отрезок от ${{C1.params.ringP}}$ до ${{C1.params.ringQ}}$ проходит через дыру."
      }
     },
     "family": {
      "title": {
       "en": "A quadratic family",
       "ru": "Семейство квадратичных функций"
      },
      "caption": {
       "en": "Contours of $f_a(x) = x_1^2 + x_2^2 + a\\,x_1x_2$ with the eigen-directions of $H_a$, scaled by the eigenvalues $2 + a$ and $2 - a$. The buttons under the slider set $a = {{C2.params.aA1}}$ from A1 and $a = {{C2.params.a}}$ from C2.",
       "ru": "Линии уровня $f_a(x) = x_1^2 + x_2^2 + a\\,x_1x_2$ и собственные направления $H_a$; длины стрелок зависят от собственных значений $2 + a$ и $2 - a$. Кнопки под ползунком задают $a = {{C2.params.aA1}}$ из A1 и $a = {{C2.params.a}}$ из C2."
      },
      "predict": {
       "en": "What do the level sets look like at $a = {{C2.params.aEdge}}$?",
       "ru": "Как выглядят линии уровня при $a = {{C2.params.aEdge}}$?"
      },
      "answer": {
       "en": "Parallel lines: $f = {{C2.tex.fEdge}}$ is convex but not strictly, and the whole line $x_1 + x_2 = 0$ consists of minimizers. For $|a| > {{C2.params.aEdge}}$ the level sets become hyperbolas.",
       "ru": "Параллельные прямые: $f = {{C2.tex.fEdge}}$ выпукла, но не строго, и вся прямая $x_1 + x_2 = 0$ состоит из точек минимума. При $|a| > {{C2.params.aEdge}}$ линии уровня становятся гиперболами."
      }
     }
    },
    "code": {
     "title": {
      "en": "In code: testing convexity numerically",
      "ru": "В коде: численная проверка выпуклости"
     },
     "text": {
      "en": "A sampled segment that leaves the set, or one random pair that violates Jensen, disproves convexity; passing the test is evidence, not a proof.",
      "ru": "Отрезок, вышедший из множества, или одна случайная пара, нарушающая неравенство Йенсена, опровергает выпуклость; успешная проверка — свидетельство, а не доказательство."
     }
    }
   },
   "D": {
    "title": {
     "en": "D. Feasible directions",
     "ru": "D. Допустимые направления"
    },
    "short": {
     "en": "Directions",
     "ru": "Направления"
    },
    "recap": [
     {
      "en": "A direction $s \\ne 0$ is feasible at $x \\in \\Omega$ if $x + \\alpha s \\in \\Omega$ for all $\\alpha \\in [0, \\alpha_0]$ with some $\\alpha_0 > 0$.",
      "ru": "Направление $s \\ne 0$ допустимо в точке $x \\in \\Omega$, если $x + \\alpha s \\in \\Omega$ при всех $\\alpha \\in [0, \\alpha_0]$ для некоторого $\\alpha_0 > 0$."
     },
     {
      "en": "Directional derivative: $\\dfrac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\dfrac{f(x + \\alpha s) - f(x)}{\\alpha} = s^\\top \\nabla f(x)$. It is a rate per unit of $\\alpha$; per unit of length, divide by $\\|s\\|$.",
      "ru": "Производная по направлению: $\\dfrac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\dfrac{f(x + \\alpha s) - f(x)}{\\alpha} = s^\\top \\nabla f(x)$. Это скорость на единицу $\\alpha$; на единицу длины нужно разделить на $\\|s\\|$."
     },
     {
      "en": "First-order necessary condition at a local minimizer $x^*$: $s^\\top \\nabla f(x^*) \\ge 0$ for every feasible direction $s$.",
      "ru": "Необходимое условие первого порядка в точке локального минимума $x^*$: $s^\\top \\nabla f(x^*) \\ge 0$ для любого допустимого направления $s$."
     },
     {
      "en": "At an interior point both $s$ and $-s$ are feasible, so the inequality collapses to $\\nabla f(x^*) = 0$. When $\\Omega$ is convex, the feasible directions at $x$ together with $0$ form a convex cone.",
      "ru": "Во внутренней точке допустимы и $s$, и $-s$, поэтому неравенство превращается в $\\nabla f(x^*) = 0$. Если $\\Omega$ выпукло, допустимые направления в точке $x$ вместе с нулём образуют выпуклый конус."
     }
    ],
    "widgets": {
     "feasible": {
      "title": {
       "en": "Feasible directions in the quadrant",
       "ru": "Допустимые направления в квадранте"
      },
      "caption": {
       "en": "Drag the point $x$ (it snaps to the edges) and the tip of the direction $s$, or pick both with the buttons. The shaded wedge is the set of feasible directions, the dashed lines are levels of $f = {{D1.tex.f}}$, and the arrow is coloured by the sign of $s^\\top \\nabla f$.",
       "ru": "Тяните точку $x$ (она прилипает к сторонам) и конец направления $s$ или выберите их кнопками. Закрашенный угол — множество допустимых направлений, пунктир — линии уровня $f = {{D1.tex.f}}$, а цвет стрелки показывает знак $s^\\top \\nabla f$."
      },
      "predict": {
       "en": "At $x = {{D1.params.x}}$, does the first-order necessary condition hold?",
       "ru": "Выполнено ли в точке $x = {{D1.params.x}}$ необходимое условие первого порядка?"
      },
      "answer": {
       "en": "No: $s = {{D1.steps.s}}$ is feasible and $s^\\top \\nabla f = {{D1.steps.slope}} < 0$. At the corner ${{D1.steps.xStar}}$ every feasible $s$ has $s^\\top \\nabla f > 0$, and the corner is the minimizer.",
       "ru": "Нет: $s = {{D1.steps.s}}$ допустимо и $s^\\top \\nabla f = {{D1.steps.slope}} < 0$. В углу ${{D1.steps.xStar}}$ у любого допустимого $s$ будет $s^\\top \\nabla f > 0$, и этот угол — точка минимума."
      }
     },
     "secant": {
      "title": {
       "en": "From secant slopes to the directional derivative",
       "ru": "От наклона секущей к производной по направлению"
      },
      "caption": {
       "en": "The curve is $\\varphi(\\alpha) = f(x + \\alpha d)$ for $f = {{D2.tex.f}}$ at $x = {{D2.params.x}}$. The red line is the secant through $\\alpha = 0$ and the slider value; the dashed line has slope $d^\\top \\nabla f(x)$. Switch the direction $d$ to compare rates.",
       "ru": "Кривая — это $\\varphi(\\alpha) = f(x + \\alpha d)$ для $f = {{D2.tex.f}}$ в точке $x = {{D2.params.x}}$. Красная прямая — секущая через $\\alpha = 0$ и значение ползунка, пунктир имеет наклон $d^\\top \\nabla f(x)$. Переключайте направление $d$, чтобы сравнить скорости."
      },
      "predict": {
       "en": "As $\\alpha \\to 0^+$, what does the secant slope approach for $d = {{D2.params.s}}$?",
       "ru": "К чему стремится наклон секущей при $\\alpha \\to 0^+$ для $d = {{D2.params.s}}$?"
      },
      "answer": {
       "en": "To $d^\\top \\nabla f(x) = {{D2.steps.dirDeriv}}$: the secant slope is ${{D2.tex.secant}}$. Per unit of length the rate is ${{D2.tex.perLength}}$, and the steepest descent rate is ${{D2.tex.steepest}}$.",
       "ru": "К $d^\\top \\nabla f(x) = {{D2.steps.dirDeriv}}$: наклон секущей равен ${{D2.tex.secant}}$. На единицу длины скорость равна ${{D2.tex.perLength}}$, а скорость наискорейшего убывания — ${{D2.tex.steepest}}$."
      }
     }
    },
    "code": {
     "title": {
      "en": "In code: feasible directions and secant slopes",
      "ru": "В коде: допустимые направления и наклоны секущих"
     },
     "text": {
      "en": "Only the active constraints restrict a direction. Secant slopes with decreasing $\\alpha > 0$ approach $s^\\top \\nabla f(x)$: a check of the formula that uses values of $f$ only.",
      "ru": "Направление ограничивают только активные ограничения. Наклоны секущих при убывающих $\\alpha > 0$ стремятся к $s^\\top \\nabla f(x)$: это проверка формулы по одним значениям $f$."
     }
    }
   },
   "E": {
    "title": {
     "en": "E. Wrap-up",
     "ru": "E. Итоги"
    },
    "short": {
     "en": "Wrap-up",
     "ru": "Итоги"
    },
    "summary": {
     "title": {
      "en": "Five sentences to keep",
      "ru": "Пять фраз, которые стоит запомнить"
     },
     "items": [
      {
       "en": "A global minimum is a local minimum whose neighbourhood is the whole feasible set; the gap between the two is what makes optimization hard.",
       "ru": "Глобальный минимум — это локальный минимум, окрестность которого — всё допустимое множество; разрыв между ними и делает оптимизацию трудной."
      },
      {
       "en": "At an interior point the gradient supplies candidates and the Hessian sorts them: $\\nabla f = 0$ and $H \\succeq 0$ are necessary, and among these tests only $\\nabla f = 0$ with $H \\succ 0$ certifies a strict local minimum.",
       "ru": "Во внутренней точке градиент поставляет кандидатов, а гессиан их сортирует: $\\nabla f = 0$ и $H \\succeq 0$ необходимы, и из этих проверок только $\\nabla f = 0$ вместе с $H \\succ 0$ гарантирует строгий локальный минимум."
      },
      {
       "en": "Leading minors decide $H \\succ 0$ and $H \\prec 0$ only; semidefiniteness needs all principal minors or the eigenvalues.",
       "ru": "Угловые миноры решают только вопросы $H \\succ 0$ и $H \\prec 0$; для полуопределённости нужны все главные миноры или собственные значения."
      },
      {
       "en": "With a singular semidefinite Hessian the second-order test cannot decide: ${{B4.tex.f}}$ and ${{B3.tex.f}}$ share $\\nabla f(0)$ and $H(0)$, yet only the first has a minimum at the origin.",
       "ru": "При вырожденном полуопределённом гессиане тест второго порядка ничего не решает: у ${{B4.tex.f}}$ и ${{B3.tex.f}}$ одинаковые $\\nabla f(0)$ и $H(0)$, но минимум в начале координат есть только у первой."
      },
      {
       "en": "Convexity makes every local minimum global; on the boundary $\\nabla f(x^*) = 0$ becomes $s^\\top \\nabla f(x^*) \\ge 0$ for every feasible direction $s$.",
       "ru": "Выпуклость делает любой локальный минимум глобальным; на границе условие $\\nabla f(x^*) = 0$ превращается в $s^\\top \\nabla f(x^*) \\ge 0$ для всех допустимых направлений $s$."
      }
     ]
    },
    "cheatsheet": {
     "title": {
      "en": "Cheat sheet and handout",
      "ru": "Шпаргалка и конспект"
     },
     "text": {
      "en": "One printed page with every rule of today, and the full theory with all eleven solutions.",
      "ru": "Одна печатная страница со всеми правилами занятия и полный конспект с решениями всех одиннадцати задач."
     },
     "links": [
      {
       "href": "cheatsheet.html",
       "label": {
        "en": "Cheat sheet",
        "ru": "Шпаргалка"
       }
      },
      {
       "href": "theory.html",
       "label": {
        "en": "Theory handout",
        "ru": "Конспект теории"
       }
      }
     ]
    },
    "exit": {
     "title": {
      "en": "Exit ticket",
      "ru": "Билет на выходе"
     },
     "text": {
      "en": "Three one-line questions. Write the answers on paper before opening them.",
      "ru": "Три вопроса, ответ на каждый в одну строку. Запишите ответы на бумаге, прежде чем открывать их."
     },
     "items": [
      {
       "id": "E1",
       "question": {
        "en": "Give a function and a point where the Hessian is positive semidefinite but the point is not a local minimum.",
        "ru": "Приведите функцию и точку, в которой гессиан положительно полуопределён, но точка не является локальным минимумом."
       },
       "answer": {
        "en": "B3 at the origin: $f = {{B3.tex.f}}$ has $H(0) = 0 \\succeq 0$, but $f(t, 0) = t^3$ changes sign. Even simpler: $f = {{exit.E1.tex.alt}}$ at ${{exit.E1.altPoint}}$ has $H \\succ 0$, but $\\nabla f = {{exit.E1.altGrad}} \\ne 0$.",
        "ru": "B3 в начале координат: у $f = {{B3.tex.f}}$ гессиан $H(0) = 0 \\succeq 0$, но $f(t, 0) = t^3$ меняет знак. Ещё проще: у $f = {{exit.E1.tex.alt}}$ в точке ${{exit.E1.altPoint}}$ гессиан $H \\succ 0$, но $\\nabla f = {{exit.E1.altGrad}} \\ne 0$."
       }
      },
      {
       "id": "E2",
       "question": {
        "en": "Why does the first-order condition become an inequality at a boundary point?",
        "ru": "Почему на границе условие первого порядка становится неравенством?"
       },
       "answer": {
        "en": "At an interior point both $s$ and $-s$ are feasible, and $s^\\top \\nabla f \\ge 0$ together with $-s^\\top \\nabla f \\ge 0$ gives equality. At the boundary some $-s$ is infeasible, so only $s^\\top \\nabla f(x^*) \\ge 0$ remains.",
        "ru": "Во внутренней точке допустимы и $s$, и $-s$, и из $s^\\top \\nabla f \\ge 0$ и $-s^\\top \\nabla f \\ge 0$ следует равенство. На границе некоторые $-s$ недопустимы, поэтому остаётся только $s^\\top \\nabla f(x^*) \\ge 0$."
       }
      },
      {
       "id": "E3",
       "question": {
        "en": "A colleague reports $\\Delta_1 > 0$ and $\\Delta_2 = 0$ for the Hessian at a stationary point. What can you conclude?",
        "ru": "Коллега сообщает, что у гессиана в стационарной точке $\\Delta_1 > 0$ и $\\Delta_2 = 0$. Что можно заключить?"
       },
       "answer": {
        "en": "$H$ is not positive definite, so the sufficient condition fails. If $H$ is $2 \\times 2$, it is positive semidefinite with eigenvalues $0$ and $\\operatorname{tr} H > 0$, and the second-order test cannot decide. For larger $H$ even that is unknown: $\\operatorname{diag}(1, 0, -1)$ and $\\operatorname{diag}(1, 0, 1)$ have the same leading minors $\\Delta_1$, $\\Delta_2$, $\\Delta_3$.",
        "ru": "$H$ не положительно определён, так что достаточное условие не выполнено. Если $H$ размера $2 \\times 2$, он положительно полуопределён с собственными значениями $0$ и $\\operatorname{tr} H > 0$, и тест второго порядка ничего не решает. Для больших $H$ неизвестно даже это: у $\\operatorname{diag}(1, 0, -1)$ и $\\operatorname{diag}(1, 0, 1)$ одинаковые угловые миноры $\\Delta_1$, $\\Delta_2$, $\\Delta_3$."
       }
      }
     ]
    },
    "home": {
     "title": {
      "en": "Home practice",
      "ru": "Домашняя практика"
     },
     "text": {
      "en": "Three problems by hand and one in code. Answers and solutions open after your first attempt.",
      "ru": "Три задачи на бумаге и одна в коде. Ответы и решения открываются после первой попытки."
     },
     "items": [
      {
       "id": "H1",
       "kind": "hand",
       "title": {
        "en": "A singular but nonzero Hessian",
        "ru": "Вырожденный, но ненулевой гессиан"
       },
       "statement": {
        "en": "Find the stationary points of $f(x) = {{home.H1.tex.f}}$ and classify them.",
        "ru": "Найдите стационарные точки $f(x) = {{home.H1.tex.f}}$ и классифицируйте их."
       },
       "steps": [
        {
         "text": {
          "en": "$\\nabla f = {{home.H1.tex.grad}} = 0$ only at the origin.",
          "ru": "$\\nabla f = {{home.H1.tex.grad}} = 0$ только в начале координат."
         }
        },
        {
         "text": {
          "en": "$H(x) = {{home.H1.tex.H}}$, so $H(0) = {{home.H1.steps.H0}}$ with eigenvalues ${{home.H1.steps.eig.1}}$ and ${{home.H1.steps.eig.2}}$: positive semidefinite, not definite. The necessary condition holds, the sufficient one does not apply.",
          "ru": "$H(x) = {{home.H1.tex.H}}$, поэтому $H(0) = {{home.H1.steps.H0}}$ с собственными значениями ${{home.H1.steps.eig.1}}$ и ${{home.H1.steps.eig.2}}$: положительно полуопределён, но не положительно определён. Необходимое условие выполнено, достаточное неприменимо."
         }
        },
        {
         "text": {
          "en": "Along $x_2 = 0$: $f(t, 0) = t^3$ changes sign, so the origin is neither a minimum nor a maximum. Compare with B3: there $H(0) = 0$; here $H(0)$ is not the zero matrix but singular, and the conclusion is the same.",
          "ru": "Вдоль $x_2 = 0$: $f(t, 0) = t^3$ меняет знак, поэтому начало координат — ни минимум, ни максимум. Сравните с B3: там $H(0) = 0$; здесь $H(0)$ не нулевая матрица, но вырожденная, а вывод тот же."
         }
        }
       ],
       "answerText": {
        "en": "The only stationary point is the origin; $H(0)$ has eigenvalues ${{home.H1.steps.eig.1}}$ and ${{home.H1.steps.eig.2}}$; neither a minimum nor a maximum.",
        "ru": "Единственная стационарная точка — начало координат; собственные значения $H(0)$ равны ${{home.H1.steps.eig.1}}$ и ${{home.H1.steps.eig.2}}$; ни минимум, ни максимум."
       },
       "answers": [
        {
         "id": "eig",
         "ref": "home.H1.answer.eig",
         "label": {
          "en": "Eigenvalues of $H(0)$ in increasing order",
          "ru": "Собственные значения $H(0)$ по возрастанию"
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
         "id": "class",
         "ref": "home.H1.answer.class",
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
        }
       ]
      },
      {
       "id": "H2",
       "kind": "hand",
       "title": {
        "en": "Minimizers of the quadratic family",
        "ru": "Минимумы семейства квадратичных функций"
       },
       "statement": {
        "en": "Let $f_a(x) = x_1^2 + x_2^2 + a\\,x_1x_2$. **(a)** For $a = {{home.H2.params.aSelf}}$ find the eigenvalues of $H_a$ and the value $f_a{{home.H2.params.p}}$. **(b)** For which $a$ does $f_a$ have a unique minimizer? **(c)** Describe all minimizers at $a = {{home.H2.params.aEdge}}$.",
        "ru": "Пусть $f_a(x) = x_1^2 + x_2^2 + a\\,x_1x_2$. **а)** При $a = {{home.H2.params.aSelf}}$ найдите собственные значения $H_a$ и значение $f_a{{home.H2.params.p}}$. **б)** При каких $a$ у $f_a$ единственная точка минимума? **в)** Опишите все точки минимума при $a = {{home.H2.params.aEdge}}$."
       },
       "steps": [
        {
         "text": {
          "en": "The characteristic polynomial is ${{home.H2.tex.charPoly}}$, so the eigenvalues are $2 \\pm a$. At $a = {{home.H2.params.aSelf}}$ they are ${{home.H2.steps.eigSelf.1}}$ and ${{home.H2.steps.eigSelf.2}}$, and $f_a{{home.H2.params.p}} = {{home.H2.steps.value}} < 0 = f_a(0)$. Since $f_a(t\\,x) = t^2 f_a(x)$, along that direction $f_a$ decreases without bound.",
          "ru": "Характеристический многочлен равен ${{home.H2.tex.charPoly}}$, поэтому собственные значения равны $2 \\pm a$. При $a = {{home.H2.params.aSelf}}$ это ${{home.H2.steps.eigSelf.1}}$ и ${{home.H2.steps.eigSelf.2}}$, а $f_a{{home.H2.params.p}} = {{home.H2.steps.value}} < 0 = f_a(0)$. Так как $f_a(t\\,x) = t^2 f_a(x)$, вдоль этого направления $f_a$ неограниченно убывает."
         }
        },
        {
         "text": {
          "en": "$|a| < {{home.H2.params.aEdge}}$: $H_a \\succ 0$, $f_a$ is strictly convex and the origin is the unique minimizer. $|a| > {{home.H2.params.aEdge}}$: $H_a$ is indefinite and $f_a$ is unbounded below, so there is no minimizer.",
          "ru": "$|a| < {{home.H2.params.aEdge}}$: $H_a \\succ 0$, $f_a$ строго выпукла, и начало координат — единственная точка минимума. $|a| > {{home.H2.params.aEdge}}$: $H_a$ знаконеопределён и $f_a$ не ограничена снизу, поэтому точек минимума нет."
         }
        },
        {
         "text": {
          "en": "$a = {{home.H2.params.aEdge}}$: $f = {{home.H2.tex.fEdge}} \\ge 0$, and the minimizers are the whole line $x_1 + x_2 = 0$ (for $a = -{{home.H2.params.aEdge}}$, the line $x_1 = x_2$).",
          "ru": "$a = {{home.H2.params.aEdge}}$: $f = {{home.H2.tex.fEdge}} \\ge 0$, и точки минимума заполняют всю прямую $x_1 + x_2 = 0$ (при $a = -{{home.H2.params.aEdge}}$ — прямую $x_1 = x_2$)."
         }
        }
       ],
       "answerText": {
        "en": "At $a = {{home.H2.params.aSelf}}$: eigenvalues ${{home.H2.steps.eigSelf.1}}$ and ${{home.H2.steps.eigSelf.2}}$, $f_a{{home.H2.params.p}} = {{home.H2.steps.value}}$. A unique minimizer exactly for $|a| < {{home.H2.params.aEdge}}$; at $a = {{home.H2.params.aEdge}}$ the minimizers form the line $x_1 + x_2 = 0$.",
        "ru": "При $a = {{home.H2.params.aSelf}}$: собственные значения ${{home.H2.steps.eigSelf.1}}$ и ${{home.H2.steps.eigSelf.2}}$, $f_a{{home.H2.params.p}} = {{home.H2.steps.value}}$. Единственная точка минимума есть ровно при $|a| < {{home.H2.params.aEdge}}$; при $a = {{home.H2.params.aEdge}}$ точки минимума образуют прямую $x_1 + x_2 = 0$."
       },
       "answers": [
        {
         "id": "eig",
         "ref": "home.H2.answer.eig",
         "label": {
          "en": "Eigenvalues of $H_a$ at $a = {{home.H2.params.aSelf}}$, in increasing order",
          "ru": "Собственные значения $H_a$ при $a = {{home.H2.params.aSelf}}$ по возрастанию"
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
         "id": "value",
         "ref": "home.H2.answer.value",
         "label": {
          "en": "$f_a{{home.H2.params.p}}$ at $a = {{home.H2.params.aSelf}}$",
          "ru": "$f_a{{home.H2.params.p}}$ при $a = {{home.H2.params.aSelf}}$"
         }
        },
        {
         "id": "minimizers",
         "ref": "home.H2.answer.minimizers",
         "label": {
          "en": "Minimizers at $a = {{home.H2.params.aEdge}}$",
          "ru": "Точки минимума при $a = {{home.H2.params.aEdge}}$"
         },
         "options": [
          {
           "id": "origin",
           "label": {
            "en": "Only the origin",
            "ru": "Только начало координат"
           }
          },
          {
           "id": "line",
           "label": {
            "en": "The line $x_1 + x_2 = 0$",
            "ru": "Прямая $x_1 + x_2 = 0$"
           }
          },
          {
           "id": "diagonal",
           "label": {
            "en": "The line $x_1 = x_2$",
            "ru": "Прямая $x_1 = x_2$"
           }
          },
          {
           "id": "none",
           "label": {
            "en": "There is no minimizer",
            "ru": "Точек минимума нет"
           }
          }
         ]
        }
       ]
      },
      {
       "id": "H3",
       "kind": "hand",
       "title": {
        "en": "Feasible directions at a corner",
        "ru": "Допустимые направления в угловой точке"
       },
       "statement": {
        "en": "For $\\Omega = \\{x:\\ x_1 \\ge 0,\\ x_2 \\ge 0\\}$ and $f(x) = {{D1.tex.f}}$, describe the feasible directions at $x = {{home.H3.params.x}}$ and check the first-order necessary condition there.",
        "ru": "Для $\\Omega = \\{x:\\ x_1 \\ge 0,\\ x_2 \\ge 0\\}$ и $f(x) = {{D1.tex.f}}$ опишите допустимые направления в точке $x = {{home.H3.params.x}}$ и проверьте там необходимое условие первого порядка."
       },
       "steps": [
        {
         "text": {
          "en": "Both constraints are active, so the feasible directions are $\\{s \\ne 0:\\ s_1 \\ge 0,\\ s_2 \\ge 0\\}$.",
          "ru": "Активны оба ограничения, поэтому допустимые направления — $\\{s \\ne 0:\\ s_1 \\ge 0,\\ s_2 \\ge 0\\}$."
         }
        },
        {
         "text": {
          "en": "$s^\\top \\nabla f = s_1 + s_2 > 0$ for every such $s$: the condition holds. Over unit feasible directions the smallest rate is ${{home.H3.steps.minSlope}}$, attained along the edges.",
          "ru": "$s^\\top \\nabla f = s_1 + s_2 > 0$ для каждого такого $s$: условие выполнено. По допустимым единичным направлениям наименьшая скорость равна ${{home.H3.steps.minSlope}}$ и достигается вдоль сторон."
         }
        },
        {
         "text": {
          "en": "Indeed $f \\ge 0$ on $\\Omega$ and $f = 0$ at the corner, so the corner is the minimizer. Compare with D1, where one inactive constraint left room for the violating direction.",
          "ru": "И действительно, $f \\ge 0$ на $\\Omega$, а в углу $f = 0$, так что угол — точка минимума. Сравните с D1, где неактивное ограничение оставляло место для нарушающего направления."
         }
        }
       ],
       "answerText": {
        "en": "Both constraints are active; the feasible directions are $s \\ne 0$ with $s_1 \\ge 0$ and $s_2 \\ge 0$; the condition holds, and the corner is the minimizer.",
        "ru": "Активны оба ограничения; допустимые направления — $s \\ne 0$ с $s_1 \\ge 0$ и $s_2 \\ge 0$; условие выполнено, и угол — точка минимума."
       },
       "answers": [
        {
         "id": "active",
         "ref": "home.H3.answer.active",
         "label": {
          "en": "Active constraints",
          "ru": "Активные ограничения"
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
         "ref": "home.H3.answer.cone",
         "label": {
          "en": "Feasible directions",
          "ru": "Допустимые направления"
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
          }
         ]
        },
        {
         "id": "holds",
         "ref": "home.H3.answer.holds",
         "label": {
          "en": "Does the first-order necessary condition hold?",
          "ru": "Выполнено ли необходимое условие первого порядка?"
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
       ]
      },
      {
       "id": "H4",
       "kind": "code",
       "title": {
        "en": "The second-order test in code",
        "ru": "Тест второго порядка в коде"
       },
       "statement": {
        "en": "Using `classify` from block B, test the Hessians of today at their points: A1, A2 at ${{A2.params.x}}$, A3, B1, B2, B3 and B4 at the origin, C2, H1 at the origin and the pair $\\operatorname{diag}(0, -1)$, $\\operatorname{diag}(0, 1)$. Where does it answer `\"inconclusive\"`, and why does A2 get `\"min\"`?",
        "ru": "С помощью `classify` из блока B проверьте гессианы сегодняшних задач в их точках: A1, A2 в точке ${{A2.params.x}}$, A3, B1, B2, B3 и B4 в начале координат, C2, H1 в начале координат и пару $\\operatorname{diag}(0, -1)$, $\\operatorname{diag}(0, 1)$. Где ответ `\"inconclusive\"` и почему A2 получает `\"min\"`?"
       },
       "steps": [
        {
         "text": {
          "en": "Build each Hessian exactly (by hand or with `sympy`) as a `numpy` array and call `classify(H)`.",
          "ru": "Постройте каждый гессиан точно (вручную или с помощью `sympy`) как массив `numpy` и вызовите `classify(H)`."
         }
        },
        {
         "text": {
          "en": "The labels: {{home.H4.counts.min}} times `\"min\"` (A1, A2, A3, B1), {{home.H4.counts.saddle}} times `\"saddle\"` (B2, C2) and {{home.H4.counts.inconclusive}} times `\"inconclusive\"` (B3, B4, H1 and both diagonal matrices).",
          "ru": "Метки: `\"min\"` — {{home.H4.counts.min}} раза (A1, A2, A3, B1), `\"saddle\"` — {{home.H4.counts.saddle}} раза (B2, C2), `\"inconclusive\"` — {{home.H4.counts.inconclusive}} раз (B3, B4, H1 и обе диагональные матрицы)."
         }
        },
        {
         "text": {
          "en": "None of the `\"inconclusive\"` answers is a bug: the second-order test genuinely cannot decide there. The version with the chained comparison `w.min() < -tol < w.max()` calls $\\operatorname{diag}(0, -1)$ a saddle; the test must require a negative **and** a positive eigenvalue. A Hessian computed by finite differences is another matter: for B4 at the origin it is a tiny positive diagonal matrix, and `classify` answers `\"min\"`; no tolerance rule can tell an exact zero from a tiny positive number without a scale taken from the problem.",
          "ru": "Ни один из ответов `\"inconclusive\"` не ошибка: тест второго порядка там действительно ничего не может решить. Версия с цепочкой сравнений `w.min() < -tol < w.max()` называет $\\operatorname{diag}(0, -1)$ седлом; тест должен требовать отрицательное **и** положительное собственное значение. С гессианом, вычисленным конечными разностями, дело обстоит иначе: для B4 в начале координат это крошечная положительная диагональная матрица, и `classify` отвечает `\"min\"`; никакое правило допуска не отличит точный нуль от крошечного положительного числа без масштаба, взятого из задачи."
         }
        },
        {
         "text": {
          "en": "A2 gets `\"min\"` because `classify` reads the matrix only: $H{{A2.params.x}} \\succ 0$, but the point is not stationary, so the label means nothing there.",
          "ru": "A2 получает `\"min\"`, потому что `classify` смотрит только на матрицу: $H{{A2.params.x}} \\succ 0$, но точка не стационарна, так что метка там ничего не значит."
         }
        }
       ],
       "answerText": {
        "en": "`\"inconclusive\"` for B3, B4, H1, $\\operatorname{diag}(0, -1)$ and $\\operatorname{diag}(0, 1)$; A2 gets `\"min\"` because the function reads $H$ only and the point is not stationary.",
        "ru": "`\"inconclusive\"` для B3, B4, H1, $\\operatorname{diag}(0, -1)$ и $\\operatorname{diag}(0, 1)$; A2 получает `\"min\"`, потому что функция смотрит только на $H$, а точка не стационарна."
       },
       "answers": [
        {
         "id": "inconclusive",
         "ref": "home.H4.answer.inconclusive",
         "label": {
          "en": "Where does `classify` answer `\"inconclusive\"`?",
          "ru": "Где `classify` отвечает `\"inconclusive\"`?"
         },
         "options": [
          {
           "id": "A1",
           "label": {
            "en": "A1",
            "ru": "A1"
           }
          },
          {
           "id": "A2",
           "label": {
            "en": "A2",
            "ru": "A2"
           }
          },
          {
           "id": "A3",
           "label": {
            "en": "A3",
            "ru": "A3"
           }
          },
          {
           "id": "B1",
           "label": {
            "en": "B1",
            "ru": "B1"
           }
          },
          {
           "id": "B2",
           "label": {
            "en": "B2",
            "ru": "B2"
           }
          },
          {
           "id": "B3",
           "label": {
            "en": "B3",
            "ru": "B3"
           }
          },
          {
           "id": "B4",
           "label": {
            "en": "B4",
            "ru": "B4"
           }
          },
          {
           "id": "C2",
           "label": {
            "en": "C2",
            "ru": "C2"
           }
          },
          {
           "id": "H1",
           "label": {
            "en": "H1",
            "ru": "H1"
           }
          },
          {
           "id": "sylNeg",
           "label": {
            "en": "$\\operatorname{diag}(0, -1)$",
            "ru": "$\\operatorname{diag}(0, -1)$"
           }
          },
          {
           "id": "sylPos",
           "label": {
            "en": "$\\operatorname{diag}(0, 1)$",
            "ru": "$\\operatorname{diag}(0, 1)$"
           }
          }
         ]
        },
        {
         "id": "a2",
         "ref": "home.H4.answer.a2",
         "label": {
          "en": "Why does A2 get `\"min\"`?",
          "ru": "Почему A2 получает `\"min\"`?"
         },
         "options": [
          {
           "id": "notStationary",
           "label": {
            "en": "`classify` reads the matrix only, and the point is not stationary",
            "ru": "`classify` смотрит только на матрицу, а точка не стационарна"
           }
          },
          {
           "id": "minimum",
           "label": {
            "en": "The point is a local minimum",
            "ru": "Точка является локальным минимумом"
           }
          },
          {
           "id": "tolerance",
           "label": {
            "en": "The tolerance is too large",
            "ru": "Слишком большой допуск"
           }
          }
         ]
        }
       ]
      }
     ]
    },
    "bridge": {
     "title": {
      "en": "What this is for",
      "ru": "Зачем это всё"
     },
     "items": [
      {
       "en": "HW-1 asks for convexity checks by hand and a numerical gradient check; `central_diff` from block A is exactly that check.",
       "ru": "ДЗ-1 требует проверок выпуклости вручную и численной проверки градиента; `central_diff` из блока A и есть такая проверка."
      },
      {
       "en": "Next seminar: convexity, constraints and optimality conditions. The inequality $s^\\top \\nabla f(x^*) \\ge 0$ becomes the KKT conditions.",
       "ru": "Следующий семинар: выпуклость, ограничения и условия оптимальности. Неравенство $s^\\top \\nabla f(x^*) \\ge 0$ превратится в условия ККТ."
      },
      {
       "en": "Descent methods later in the course step against the gradient: by D2, $-\\nabla f/\\|\\nabla f\\|$ is the unit direction of steepest descent.",
       "ru": "Методы спуска, которые появятся дальше в курсе, делают шаги против градиента: как показывает задача D2, $-\\nabla f/\\|\\nabla f\\|$ — единичное направление наискорейшего убывания."
      }
     ]
    }
   }
  },
  "mistakes": {
   "A": [
    {
     "en": "A cross term $c\\,x_ix_j$ puts $c$ into both $H_{ij}$ and $H_{ji}$. Writing $c/2$ (the entry of $A$ in $f = x^\\top A x$) or doubling $c$ as on the diagonal gives a wrong Hessian.",
     "ru": "Смешанное слагаемое $c\\,x_ix_j$ даёт $c$ в оба элемента $H_{ij}$ и $H_{ji}$. Если записать $c/2$ (элемент $A$ в $f = x^\\top A x$) или удвоить $c$, как на диагонали, гессиан получится неверным."
    },
    {
     "en": "Discussing the Hessian at a point before checking $\\nabla f = 0$ there: at a non-stationary point $H \\succ 0$ means nothing for optimality.",
     "ru": "Обсуждать гессиан в точке, не проверив там $\\nabla f = 0$: в нестационарной точке $H \\succ 0$ ничего не говорит об оптимальности."
    },
    {
     "en": "Treating the Hessian of a cubic as constant: only a quadratic has the same $H$ at every point.",
     "ru": "Считать гессиан кубической функции постоянным: одинаковый $H$ во всех точках бывает только у квадратичной функции."
    }
   ],
   "B": [
    {
     "en": "Concluding “indefinite” because neither Sylvester pattern holds: $\\operatorname{diag}(0, -1)$ and $\\operatorname{diag}(0, 1)$ have the same leading minors, yet the first is negative semidefinite and the second positive semidefinite.",
     "ru": "Делать вывод «знаконеопределена», раз ни один шаблон Сильвестра не выполнен: у $\\operatorname{diag}(0, -1)$ и $\\operatorname{diag}(0, 1)$ одинаковые угловые миноры, но первая матрица отрицательно полуопределена, а вторая положительно полуопределена."
    },
    {
     "en": "Reading the necessary condition $H(x^*) \\succeq 0$ as a certificate: $H = 0$ holds at the monkey saddle, which has no extremum.",
     "ru": "Принимать необходимое условие $H(x^*) \\succeq 0$ за сертификат: у обезьяньего седла $H = 0$, а экстремума нет."
    },
    {
     "en": "Claiming a global minimum from $\\nabla f = 0$ and $H \\succ 0$: the sufficient condition gives a strict local minimum only.",
     "ru": "Заявлять глобальный минимум по $\\nabla f = 0$ и $H \\succ 0$: достаточное условие даёт только строгий локальный минимум."
    },
    {
     "en": "Offering a contour picture as the proof of a saddle: restrictions to lines are the proof.",
     "ru": "Предъявлять картинку линий уровня как доказательство седла: доказательство — сужения на прямые."
    }
   ],
   "C": [
    {
     "en": "Judging convexity of a quadratic by the sign of the cross term: its size decides.",
     "ru": "Судить о выпуклости квадратичной функции по знаку смешанного слагаемого: решает его величина."
    },
    {
     "en": "Confusing convexity with smoothness: the $\\ell_1$ diamond has corners and is convex, the ring has a smooth boundary and is not.",
     "ru": "Путать выпуклость с гладкостью: у ромба $\\ell_1$ есть углы, но он выпукл, а у кольца гладкая граница, но оно не выпукло."
    },
    {
     "en": "Proving convexity with a drawing or with a few segments that stay inside: only a proof for all pairs counts.",
     "ru": "Доказывать выпуклость рисунком или несколькими отрезками, оставшимися внутри: годится только доказательство для всех пар."
    }
   ],
   "D": [
    {
     "en": "Declaring every direction feasible at a boundary point, or none.",
     "ru": "Объявлять в граничной точке допустимыми все направления или ни одного."
    },
    {
     "en": "Accepting a boundary point after checking a few directions: rejecting needs one violating direction, accepting needs all of them.",
     "ru": "Принимать граничную точку после проверки нескольких направлений: чтобы отвергнуть её, хватит одного нарушающего направления, а чтобы принять, нужно проверить все."
    },
    {
     "en": "Comparing directional derivatives of directions with different lengths: normalize first, or the longest direction looks the steepest.",
     "ru": "Сравнивать производные по направлениям разной длины: сначала нормируйте, иначе самым крутым окажется самое длинное."
    }
   ]
  }
 }
}/*JSON-END*/);
