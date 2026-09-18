// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 01 content: the theory handout (theory/index.html), in English and Russian.
// Strict JSON between the markers. Numbers come from data/seminar01_data.js through {{tokens}}.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "handout": {
  "title": {
   "en": "Optimization as the Foundation of Machine Learning",
   "ru": "Оптимизация как основа машинного обучения"
  },
  "intro": {
   "en": "This handout collects the theory behind Seminar 1: what an optimization problem is, derivatives of functions of one and several variables, Taylor's formula, definiteness of matrices, optimality conditions and convexity. It is written for reading from zero: a derivative from a first calculus course is all you need, and vectors, determinants, gradients, Hessians and eigenvalues are introduced on the way. Every statement comes with an example with numbers; the main proofs start with their idea in one sentence; two kinds of boxes mark the traps where almost everyone slips and short questions to check yourself. The section on seminar problems contains all eleven problems with complete solutions; the home practice, common mistakes and a glossary follow.",
   "ru": "Этот конспект собирает теорию к семинару 1: что такое задача оптимизации, производные функций одной и нескольких переменных, формула Тейлора, знакоопределённость матриц, условия оптимальности и выпуклость. Он написан для чтения с нуля: достаточно производной из первого курса математического анализа, а векторы, определители, градиенты, гессианы и собственные значения вводятся по ходу дела. К каждому утверждению есть пример с числами; главные доказательства начинаются с идеи в одной фразе; врезки двух видов отмечают ловушки, в которые попадают почти все, и короткие вопросы для самопроверки. В разделе «Задачи семинара» разобраны все одиннадцать задач с полными решениями; за ним следуют домашняя практика, типичные ошибки и глоссарий."
  },
  "convention": {
   "en": "Vectors are columns: $x = (x_1, \\dots, x_n)^\\top \\in \\mathbb R^n$, and $x^\\top y = x_1y_1 + \\dots + x_ny_n$ is a number. $\\|x\\| = \\sqrt{x^\\top x}$ is the Euclidean length. Every problem is a minimization, $\\min_{x \\in \\Omega} f(x)$: a maximum of $f$ is a minimum of $-f$. The gradient $\\nabla f(x)$ is a column vector and $H(x)$ is the Hessian; for every function in this handout $H$ is symmetric. $x^*$ denotes a candidate point or a minimizer. $A \\succ 0$ and $A \\succeq 0$ mean that a symmetric matrix $A$ is positive definite and positive semidefinite. A step along a direction $s$ is $x + \\alpha s$ with a step parameter $\\alpha \\ge 0$; it is a length only when $\\|s\\| = 1$. The letter $\\lambda$ is a weight in $[0, 1]$ or an eigenvalue, and the context always tells which.",
   "ru": "Векторы — это столбцы: $x = (x_1;\\ \\dots;\\ x_n)^\\top \\in \\mathbb R^n$, а $x^\\top y = x_1y_1 + \\dots + x_ny_n$ — число. Евклидова длина вектора — $\\|x\\| = \\sqrt{x^\\top x}$. Каждая задача — задача минимизации $\\min_{x \\in \\Omega} f(x)$: максимум $f$ — это минимум $-f$. Градиент $\\nabla f(x)$ — вектор-столбец, $H(x)$ — гессиан; у всех функций этого конспекта $H$ симметричен. Через $x^*$ обозначается точка-кандидат или точка минимума. Записи $A \\succ 0$ и $A \\succeq 0$ означают, что симметричная матрица $A$ положительно определена и положительно полуопределена. Шаг вдоль направления $s$ — это $x + \\alpha s$ с параметром шага $\\alpha \\ge 0$; $\\alpha$ равно длине шага только при $\\|s\\| = 1$. Буква $\\lambda$ обозначает вес из $[0, 1]$ или собственное значение, и из контекста всегда ясно, что именно."
  },
  "sections": [
   {
    "id": "notation",
    "title": {
     "en": "Notation",
     "ru": "Обозначения"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Formulas are easier to read when you can say them aloud. The table lists the symbols, how to read them and what they mean.",
       "ru": "Формулы легче читать, когда их можно произнести вслух. В таблице собраны символы: как они читаются и что означают."
      }
     },
     {
      "type": "table",
      "head": [
       {
        "en": "Symbol",
        "ru": "Символ"
       },
       {
        "en": "How to read it",
        "ru": "Как читается"
       },
       {
        "en": "Meaning",
        "ru": "Что означает"
       }
      ],
      "rows": [
       [
        {
         "en": "$\\mathbb R^n$",
         "ru": "$\\mathbb R^n$"
        },
        {
         "en": "“R n”",
         "ru": "«эр в степени эн»"
        },
        {
         "en": "ordered lists of $n$ real numbers, for example $x = {{ex.notation.point}} \\in \\mathbb R^3$",
         "ru": "упорядоченные наборы из $n$ вещественных чисел, например $x = {{ex.notation.point}} \\in \\mathbb R^3$"
        }
       ],
       [
        {
         "en": "$\\|x\\|$",
         "ru": "$\\|x\\|$"
        },
        {
         "en": "“the norm of x”",
         "ru": "«норма икс»"
        },
        {
         "en": "the length $\\sqrt{x_1^2 + \\dots + x_n^2}$",
         "ru": "длина вектора $\\sqrt{x_1^2 + \\dots + x_n^2}$"
        }
       ],
       [
        {
         "en": "$x^\\top y$",
         "ru": "$x^\\top y$"
        },
        {
         "en": "“x transpose y”, “the inner product”",
         "ru": "«икс транспонированное игрек», «скалярное произведение»"
        },
        {
         "en": "$x^\\top$ is the column $x$ written as a row; $x^\\top y = x_1y_1 + \\dots + x_ny_n$ is a single number",
         "ru": "$x^\\top$ — столбец $x$, записанный строкой; $x^\\top y = x_1y_1 + \\dots + x_ny_n$ — одно число"
        }
       ],
       [
        {
         "en": "$\\nabla f$",
         "ru": "$\\nabla f$"
        },
        {
         "en": "“nabla f”, “grad f”",
         "ru": "«набла эф», «градиент эф»"
        },
        {
         "en": "the column of first partial derivatives",
         "ru": "столбец первых частных производных"
        }
       ],
       [
        {
         "en": "$\\partial f/\\partial x_1$",
         "ru": "$\\partial f/\\partial x_1$"
        },
        {
         "en": "“partial f partial x one”",
         "ru": "«дэ эф по дэ икс один»"
        },
        {
         "en": "the partial derivative with respect to $x_1$",
         "ru": "частная производная по $x_1$"
        }
       ],
       [
        {
         "en": "$H$",
         "ru": "$H$"
        },
        {
         "en": "“the Hessian”, “H of x”",
         "ru": "«гессиан», «аш от икс»"
        },
        {
         "en": "the matrix of second partial derivatives",
         "ru": "матрица вторых частных производных"
        }
       ],
       [
        {
         "en": "$\\Omega$",
         "ru": "$\\Omega$"
        },
        {
         "en": "“omega”",
         "ru": "«омега»"
        },
        {
         "en": "the feasible set, where the minimum is sought",
         "ru": "допустимое множество, в котором ищется минимум"
        }
       ],
       [
        {
         "en": "$x^*$",
         "ru": "$x^*$"
        },
        {
         "en": "“x star”",
         "ru": "«икс со звёздочкой»"
        },
        {
         "en": "a candidate point or a minimizer",
         "ru": "точка-кандидат или точка минимума"
        }
       ],
       [
        {
         "en": "$A \\succ 0$, $A \\succeq 0$",
         "ru": "$A \\succ 0$, $A \\succeq 0$"
        },
        {
         "en": "“A is positive definite”, “positive semidefinite”",
         "ru": "«A положительно определена», «положительно полуопределена»"
        },
        {
         "en": "$h^\\top A h > 0$ for all $h \\ne 0$ (all eigenvalues positive); $h^\\top A h \\ge 0$ for all $h$ (all eigenvalues nonnegative)",
         "ru": "$h^\\top A h > 0$ для всех $h \\ne 0$ (все собственные значения положительны); $h^\\top A h \\ge 0$ для всех $h$ (все собственные значения неотрицательны)"
        }
       ],
       [
        {
         "en": "$o(\\alpha)$",
         "ru": "$o(\\alpha)$"
        },
        {
         "en": "“little o of alpha”",
         "ru": "«о малое от альфа»"
        },
        {
         "en": "a quantity with $o(\\alpha)/\\alpha \\to 0$ as $\\alpha \\to 0$",
         "ru": "величина, для которой $o(\\alpha)/\\alpha \\to 0$ при $\\alpha \\to 0$"
        }
       ]
      ]
     },
     {
      "type": "note",
      "title": {
       "en": "The inner product is a number",
       "ru": "Скалярное произведение — это число"
      },
      "text": {
       "en": "$x = {{ex.dot.x}}$ and $y = {{ex.dot.y}}$ give $x^\\top y = {{ex.dot.x.1}} \\cdot {{ex.dot.y.1}} + ({{ex.dot.x.2}}) \\cdot {{ex.dot.y.2}} = {{ex.dot.value}}$: a number, not a vector. In the section on optimality conditions this number becomes the rate of change of a function along a direction.",
       "ru": "Для $x = {{ex.dot.x}}$ и $y = {{ex.dot.y}}$ произведение $x^\\top y = {{ex.dot.x.1}} \\cdot {{ex.dot.y.1}} + ({{ex.dot.x.2}}) \\cdot {{ex.dot.y.2}} = {{ex.dot.value}}$ — число, а не вектор. В разделе об условиях оптимальности это число станет скоростью изменения функции вдоль направления."
      }
     }
    ]
   },
   {
    "id": "optimization",
    "title": {
     "en": "Optimization problems",
     "ru": "Задачи оптимизации"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "The whole seminar tells one story. We want the points where a function takes its smallest value. Checking every point is impossible, so we learn to recognize a minimum by local signs, by the derivatives at the point itself: the first derivative produces candidates, the second one sorts them and in rare cases only a direct argument helps.",
       "ru": "Весь семинар рассказывает одну историю. Нужно найти точки, в которых функция принимает наименьшее значение. Проверить все точки невозможно, поэтому минимум приходится распознавать по локальным признакам, то есть по производным в самой точке: первая производная даёт кандидатов, вторая их сортирует, а в редких случаях помогает только прямое рассуждение."
      }
     }
    ],
    "subsections": [
     {
      "id": "optimization-problem",
      "title": {
       "en": "What we minimize and why",
       "ru": "Что мы минимизируем и зачем"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "An optimization problem is written as $$\\min_{x \\in \\Omega} f(x).$$ Here $f$ is the **objective function**, $x \\in \\mathbb R^n$ are the **variables** and $\\Omega$ is the **feasible set**, the points among which the minimum is sought. With two variables a candidate is a point of the plane, with three a point of space. With many variables there is no picture, but the formulas are the same.",
         "ru": "Задача оптимизации записывается так: $$\\min_{x \\in \\Omega} f(x).$$ Здесь $f$ — **целевая функция**, $x \\in \\mathbb R^n$ — **переменные**, а $\\Omega$ — **допустимое множество**, то есть точки, среди которых ищется минимум. При двух переменных кандидат — точка плоскости, при трёх — точка пространства. При многих переменных картинки нет, но формулы те же."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "In machine learning the variables are the parameters of a model, and the function is its error on the data. A linear model with {{ex.ml.nWeights}} weights is a point of $\\mathbb R^{ {{ex.ml.nWeights}} }$, a neural network has about ${{ex.ml.tex.nNet}}$ parameters. With training data $(a_i, y_i)$, $i = 1, \\dots, m$, a feature vector $a_i$ and a target $y_i$, **training** means minimizing the **empirical risk** $$L(w) = \\frac1m \\sum_{i=1}^m \\ell\\big(y_i,\\ w^\\top a_i\\big),$$ where the loss $\\ell$ measures the error on one object, for example $\\ell(y, \\hat y) = (y - \\hat y)^2$.",
         "ru": "В машинном обучении переменные — это параметры модели, а функция — её ошибка на данных. Линейная модель с {{ex.ml.nWeights}} весами — точка $\\mathbb R^{ {{ex.ml.nWeights}} }$, у нейронной сети около ${{ex.ml.tex.nNet}}$ параметров. Для обучающих данных $(a_i;\\ y_i)$, $i = 1, \\dots, m$, где $a_i$ — вектор признаков, а $y_i$ — целевое значение, **обучение** означает минимизацию **эмпирического риска** $$L(w) = \\frac1m \\sum_{i=1}^m \\ell\\big(y_i,\\ w^\\top a_i\\big),$$ где функция потерь $\\ell$ измеряет ошибку на одном объекте, например $\\ell(y, \\hat y) = (y - \\hat y)^2$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Fit a line $y = w_1 + w_2 t$ to the points $(t_i, y_i)$ with $t = {{ex.fit.t}}$ and $y = {{ex.fit.y}}$. With the squared loss, training is the problem $$\\min_{w \\in \\mathbb R^2} L(w), \\qquad L(w) = {{ex.fit.tex.L}}.$$ The answer $w^* = {{ex.fit.tex.w}}$ with $L(w^*) = {{ex.fit.tex.Lmin}}$ is derived in the section on convexity, once gradients and convexity are available.",
         "ru": "Подберите прямую $y = w_1 + w_2 t$ по точкам $(t_i;\\ y_i)$, где $t = {{ex.fit.t}}$ и $y = {{ex.fit.y}}$. С квадратичной функцией потерь обучение — это задача $$\\min_{w \\in \\mathbb R^2} L(w), \\qquad L(w) = {{ex.fit.tex.L}}.$$ Ответ $w^* = {{ex.fit.tex.w}}$ со значением $L(w^*) = {{ex.fit.tex.Lmin}}$ выводится в разделе о выпуклости, когда в распоряжении будут градиенты и выпуклость."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "Brute force is hopeless: a grid with only {{ex.ml.gridPerAxis}} values per coordinate has ${{ex.ml.tex.gridSize}}$ points in $\\mathbb R^{ {{ex.ml.nWeights}} }$. Instead of searching everywhere we look at one point and ask what its derivatives say.",
         "ru": "Перебор безнадёжен: сетка всего с {{ex.ml.gridPerAxis}} значениями по каждой координате содержит ${{ex.ml.tex.gridSize}}$ точек в $\\mathbb R^{ {{ex.ml.nWeights}} }$. Поэтому вместо поиска по всему пространству смотрят на одну точку и спрашивают, что говорят производные в ней."
        }
       }
      ]
     },
     {
      "id": "optimization-feasible",
      "title": {
       "en": "The feasible set",
       "ru": "Допустимое множество"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The feasible set $\\Omega \\subseteq \\mathbb R^n$ collects the points that are allowed. When $\\Omega = \\mathbb R^n$, the problem is **unconstrained**. Typical feasible sets are the quadrant $\\{x_1 \\ge 0,\\ x_2 \\ge 0\\}$, the disk $\\|x\\| \\le {{ex.disk.r}}$ and, in general, a set described by a system of inequalities.",
         "ru": "Допустимое множество $\\Omega \\subseteq \\mathbb R^n$ состоит из разрешённых точек. Если $\\Omega = \\mathbb R^n$, то это задача **без ограничений**. Типичные допустимые множества — квадрант $\\{x_1 \\ge 0,\\ x_2 \\ge 0\\}$, круг $\\|x\\| \\le {{ex.disk.r}}$ и вообще множество, заданное системой неравенств."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Interior and boundary points",
         "ru": "внутренние и граничные точки"
        },
        "text": {
         "en": "A point $x \\in \\Omega$ is **interior** if some ball $\\{y:\\ \\|y - x\\| < \\varepsilon\\}$ with $\\varepsilon > 0$ lies in $\\Omega$; otherwise it is a **boundary** point.",
         "ru": "Точка $x \\in \\Omega$ называется **внутренней**, если некоторый шар $\\{y:\\ \\|y - x\\| < \\varepsilon\\}$ с $\\varepsilon > 0$ целиком лежит в $\\Omega$; иначе это **граничная** точка."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "In the quadrant $\\Omega = \\{x_1 \\ge 0,\\ x_2 \\ge 0\\}$ the point ${{ex.quadrant.interior}}$ is interior. The point ${{ex.quadrant.boundary}}$ is a boundary point: a step to the left, however small, leaves $\\Omega$. The corner ${{ex.quadrant.corner}}$ is a boundary point too. This distinction becomes decisive in the section on optimality conditions.",
         "ru": "В квадранте $\\Omega = \\{x_1 \\ge 0,\\ x_2 \\ge 0\\}$ точка ${{ex.quadrant.interior}}$ внутренняя. Точка ${{ex.quadrant.boundary}}$ граничная: шаг влево, сколь угодно малый, выводит из $\\Omega$. Угловая точка ${{ex.quadrant.corner}}$ тоже граничная. Это различие станет решающим в разделе об условиях оптимальности."
        }
       }
      ]
     },
     {
      "id": "optimization-minima",
      "title": {
       "en": "Local and global minima",
       "ru": "Локальные и глобальные минимумы"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Local minimum",
         "ru": "локальный минимум"
        },
        "text": {
         "en": "A point $x^* \\in \\Omega$ is a **local minimum** of $f$ on $\\Omega$ if there is $\\varepsilon > 0$ such that $$f(x) \\ge f(x^*) \\quad \\text{for all } x \\in \\Omega \\text{ with } \\|x - x^*\\| < \\varepsilon.$$",
         "ru": "Точка $x^* \\in \\Omega$ называется точкой **локального минимума** функции $f$ на $\\Omega$, если существует $\\varepsilon > 0$ такое, что $$f(x) \\ge f(x^*) \\quad \\text{для всех } x \\in \\Omega \\text{ таких, что } \\|x - x^*\\| < \\varepsilon.$$"
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Read the definition clause by clause. “There is $\\varepsilon > 0$”: some radius exists, possibly a very small one. “For all $x \\in \\Omega$ with $\\|x - x^*\\| < \\varepsilon$”: $x^*$ is compared only with feasible points closer than this radius. “$f(x) \\ge f(x^*)$”: none of them is lower, and equal values are allowed. In short, $x^*$ is a lowest feasible point in some neighbourhood of itself.",
         "ru": "Прочитайте определение по частям. «Существует $\\varepsilon > 0$»: найдётся некоторый радиус, возможно, очень маленький. «Для всех $x \\in \\Omega$ таких, что $\\|x - x^*\\| < \\varepsilon$»: $x^*$ сравнивается только с допустимыми точками, которые ближе этого радиуса. «$f(x) \\ge f(x^*)$»: ни одна из них не ниже, а равные значения допускаются. Короче говоря, $x^*$ — самая низкая допустимая точка в некоторой своей окрестности."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Global minimum",
         "ru": "глобальный минимум"
        },
        "text": {
         "en": "A point $x^* \\in \\Omega$ is a **global minimum** of $f$ on $\\Omega$ if $f(x) \\ge f(x^*)$ for all $x \\in \\Omega$, with no restriction on the distance.",
         "ru": "Точка $x^* \\in \\Omega$ называется точкой **глобального минимума** функции $f$ на $\\Omega$, если $f(x) \\ge f(x^*)$ для всех $x \\in \\Omega$, без ограничения на расстояние."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Strict minimum",
         "ru": "строгий минимум"
        },
        "text": {
         "en": "A minimum is **strict** if $f(x) > f(x^*)$ for every admissible $x \\ne x^*$: for all $x \\in \\Omega$ with $0 < \\|x - x^*\\| < \\varepsilon$ in a **strict local minimum** and for all $x \\in \\Omega$ with $x \\ne x^*$ in a **strict global minimum**.",
         "ru": "Минимум называется **строгим**, если $f(x) > f(x^*)$ для всех допустимых $x \\ne x^*$: в случае **строгого локального минимума** — для всех $x \\in \\Omega$, удовлетворяющих $0 < \\|x - x^*\\| < \\varepsilon$, а в случае **строгого глобального минимума** — для всех $x \\in \\Omega$, отличных от $x^*$."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$f(x) = x_1^2$ on $\\mathbb R^2$ satisfies $f \\ge 0$ everywhere and $f = 0$ on the whole line $x_1 = 0$. Every point of this line is a global minimum, and none of them is strict, because each has neighbours on the line with the same value. Such a line is a flat bottom.",
         "ru": "Функция $f(x) = x_1^2$ на $\\mathbb R^2$ всюду удовлетворяет неравенству $f \\ge 0$, а на всей прямой $x_1 = 0$ выполнено $f = 0$. Каждая точка этой прямой — точка глобального минимума, но ни один из этих минимумов не строгий: у соседних точек прямой то же значение. Такая прямая — плоское дно."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "Local and global",
         "ru": "Локальный и глобальный"
        },
        "text": {
         "en": "A global minimum is a local one whose neighbourhood is all of $\\Omega$. Derivatives are local tools; a global claim needs convexity, a direct bound or, when a global minimum is known to exist (for example when $f(x) \\to +\\infty$ as $\\|x\\| \\to \\infty$, or when $\\Omega$ is closed and bounded), a comparison of all local minima.",
         "ru": "Глобальный минимум — это локальный минимум, у которого окрестностью служит всё $\\Omega$. Производные — локальный инструмент; для глобального утверждения нужна выпуклость, прямая оценка или, если известно, что глобальный минимум существует (например, когда $f(x) \\to +\\infty$ при $\\|x\\| \\to \\infty$ или когда $\\Omega$ замкнуто и ограничено), сравнение всех локальных минимумов."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "A function on the line tends to $+\\infty$ as $|x| \\to \\infty$ and has two wells of different depth. How many local and how many global minima does it have?",
         "ru": "Функция на прямой стремится к $+\\infty$ при $|x| \\to \\infty$ и имеет две ямы разной глубины. Сколько у неё локальных и сколько глобальных минимумов?"
        },
        "answer": {
         "en": "Two local minima and one global, at the bottom of the deeper well; a global minimum exists because $f$ grows at infinity. If the two wells have equal depth, both bottoms are global minima; each is still a strict local minimum, but neither is a strict global minimum.",
         "ru": "Два локальных минимума и один глобальный — на дне более глубокой ямы; глобальный минимум существует, потому что $f$ растёт на бесконечности. Если ямы одинаковой глубины, обе точки дна — точки глобального минимума; каждая из них по-прежнему точка строгого локального минимума, но ни одна не является точкой строгого глобального минимума."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "one-variable",
    "title": {
     "en": "Warm-up: one variable",
     "ru": "Разминка: одна переменная"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "We start with the derivative from a first calculus course and look at it with the eyes of optimization.",
       "ru": "Раздел начинается с производной из первого курса математического анализа: на неё полезно взглянуть глазами оптимизации."
      }
     }
    ],
    "subsections": [
     {
      "id": "one-variable-derivative",
      "title": {
       "en": "The derivative is a rate",
       "ru": "Производная — это скорость"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The **derivative** of $f:\\ \\mathbb R \\to \\mathbb R$ at a point $x$ is the limit $$f'(x) = \\lim_{\\alpha \\to 0} \\frac{f(x + \\alpha) - f(x)}{\\alpha}.$$ Take a small step $\\alpha$ and divide the change of $f$ by the step: the result is a rate, the change of $f$ per unit of step. Geometrically, $f'(x)$ is the slope of the tangent to the graph at $x$. A one-sided version, with $\\alpha \\to 0^+$, appears with directional derivatives.",
         "ru": "**Производная** функции $f:\\ \\mathbb R \\to \\mathbb R$ в точке $x$ — это предел $$f'(x) = \\lim_{\\alpha \\to 0} \\frac{f(x + \\alpha) - f(x)}{\\alpha}.$$ Сделайте маленький шаг $\\alpha$ и разделите изменение $f$ на шаг: получится скорость — изменение $f$ на единицу шага. Геометрически $f'(x)$ — угловой коэффициент касательной к графику в точке $x$. Односторонний вариант, с $\\alpha \\to 0^+$, появится вместе с производной по направлению."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "If $f'(x) \\ne 0$ at a point inside the domain, then $f$ decreases on one side of $x$, so $x$ is not a minimum.",
         "ru": "Если $f'(x) \\ne 0$ во внутренней точке области определения, то по одну сторону от $x$ функция $f$ убывает, поэтому $x$ не является точкой минимума."
        }
       }
      ]
     },
     {
      "id": "one-variable-stationary",
      "title": {
       "en": "A zero derivative is necessary, not sufficient",
       "ru": "Ноль производной необходим, но не достаточен"
      },
      "blocks": [
       {
        "type": "example",
        "text": {
         "en": "$f(x) = x^3$ has $f'(x) = {{ex.cubic.tex.fprime}}$ and $f'(0) = 0$, yet $f < 0$ to the left of $0$ and $f > 0$ to the right: $0$ is no extremum.",
         "ru": "У $f(x) = x^3$ производная $f'(x) = {{ex.cubic.tex.fprime}}$ и $f'(0) = 0$, но $f < 0$ слева от $0$ и $f > 0$ справа: экстремума в $0$ нет."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_stationary.svg",
        "alt": {
         "en": "Three graphs: x cubed with a flat inflection point, x squared with a minimum and a quartic with two wells of different depth and a local maximum between them.",
         "ru": "Три графика: x в кубе с горизонтальной касательной в точке перегиба, x в квадрате с минимумом и многочлен четвёртой степени с двумя ямами разной глубины и локальным максимумом между ними."
        },
        "caption": {
         "en": "Left: $x^3$ has $f'(0) = 0$ but no extremum. Middle: $x^2$ has a strict minimum at $0$. Right: $f(x) = {{ex.wells.tex.f}}$ with $f'(x) = {{ex.wells.tex.fprime}}$ has local minima at $x = {{ex.wells.stationary.1}}$ and $x = {{ex.wells.stationary.3}}$ and a local maximum at $x = {{ex.wells.stationary.2}}$; only the deeper well, $f({{ex.wells.stationary.3}}) = {{ex.wells.values.3}}$, is the global minimum.",
         "ru": "Слева: у $x^3$ производная $f'(0) = 0$, но экстремума нет. В центре: у $x^2$ строгий минимум в $0$. Справа: у $f(x) = {{ex.wells.tex.f}}$ с $f'(x) = {{ex.wells.tex.fprime}}$ локальные минимумы в $x = {{ex.wells.stationary.1}}$ и $x = {{ex.wells.stationary.3}}$ и локальный максимум в $x = {{ex.wells.stationary.2}}$; глобальный минимум только на дне более глубокой ямы, $f({{ex.wells.stationary.3}}) = {{ex.wells.values.3}}$."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "Necessary and sufficient",
         "ru": "Необходимое и достаточное"
        },
        "text": {
         "en": "A condition is **necessary** if it holds at every minimum, and **sufficient** if it guarantees a minimum. At interior points $f'(x) = 0$ is necessary but not sufficient: solving $f' = 0$ gives candidates, not answers.",
         "ru": "Условие называется **необходимым**, если оно выполняется в каждом минимуме, и **достаточным**, если оно гарантирует минимум. Во внутренних точках равенство $f'(x) = 0$ необходимо, но не достаточно: решение уравнения $f' = 0$ даёт кандидатов, а не ответы."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The second derivative tells $x^2$ from $x^3$: for $x^2$ it gives $f''(0) = {{ex.square.second}} > 0$, while for $x^3$ it gives $f''(0) = 0$, which carries no information.",
         "ru": "Вторая производная различает $x^2$ и $x^3$: у $x^2$ значение $f''(0) = {{ex.square.second}} > 0$, а у $x^3$ значение $f''(0) = 0$ не даёт никакой информации."
        }
       }
      ]
     },
     {
      "id": "one-variable-taylor",
      "title": {
       "en": "Taylor's formula",
       "ru": "Формула Тейлора"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "**Taylor's formula** replaces a function near a point by a polynomial. For a twice differentiable $f$, $$f(x + \\alpha) = \\underbrace{f(x)}_{\\text{value}} + \\underbrace{f'(x)\\,\\alpha}_{\\text{linear part}} + \\underbrace{\\tfrac12 f''(x)\\,\\alpha^2}_{\\text{curvature}} + o(\\alpha^2).$$ The remainder $o(\\alpha^2)$ satisfies $o(\\alpha^2)/\\alpha^2 \\to 0$ as $\\alpha \\to 0$: for small steps it is negligible next to the other terms.",
         "ru": "**Формула Тейлора** заменяет функцию вблизи точки многочленом. Для дважды дифференцируемой функции $f$ выполнено $$f(x + \\alpha) = \\underbrace{f(x)}_{\\text{значение}} + \\underbrace{f'(x)\\,\\alpha}_{\\text{линейная часть}} + \\underbrace{\\tfrac12 f''(x)\\,\\alpha^2}_{\\text{кривизна}} + o(\\alpha^2).$$ Остаток $o(\\alpha^2)$ («о малое») удовлетворяет условию $o(\\alpha^2)/\\alpha^2 \\to 0$ при $\\alpha \\to 0$: при малых шагах им можно пренебречь по сравнению с остальными слагаемыми."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "How to use it",
         "ru": "Как этим пользоваться"
        },
        "text": {
         "en": "If $f'(x) \\ne 0$, the linear term decides: a small step with $f'(x)\\alpha < 0$ decreases $f$, so $x$ is not a minimum. If $f'(x) = 0$, the sign of $f''(x)$ decides: $f''(x) > 0$ gives a strict local minimum and $f''(x) < 0$ a strict local maximum. If also $f''(x) = 0$, the formula is silent. The section on Taylor's formula in several variables repeats this logic for many variables.",
         "ru": "Если $f'(x) \\ne 0$, всё решает линейное слагаемое: малый шаг с $f'(x)\\alpha < 0$ уменьшает $f$, поэтому $x$ не точка минимума. Если $f'(x) = 0$, решает знак $f''(x)$: при $f''(x) > 0$ это строгий локальный минимум, при $f''(x) < 0$ — строгий локальный максимум. Если же и $f''(x) = 0$, формула молчит. В разделе о формуле Тейлора для многих переменных та же логика повторяется для функций многих переменных."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "For $f(x) = {{ex.wells.tex.f}}$ we have $f'(x) = {{ex.wells.tex.fprime}}$ and $f''(x) = {{ex.wells.tex.fsecond}}$. At the stationary points: $f''({{ex.wells.stationary.1}}) = {{ex.wells.second.1}} > 0$, a local minimum; $f''({{ex.wells.stationary.2}}) = {{ex.wells.second.2}} < 0$, a local maximum; $f''({{ex.wells.stationary.3}}) = {{ex.wells.second.3}} > 0$, a local minimum. Which of the two minima is global the derivatives do not say. Since $f(x) \\to +\\infty$ as $|x| \\to \\infty$, a global minimum exists and is one of the local minima, so compare the values $f({{ex.wells.stationary.1}}) = {{ex.wells.values.1}}$ and $f({{ex.wells.stationary.3}}) = {{ex.wells.values.3}}$.",
         "ru": "У $f(x) = {{ex.wells.tex.f}}$ производные равны $f'(x) = {{ex.wells.tex.fprime}}$ и $f''(x) = {{ex.wells.tex.fsecond}}$. В стационарных точках: $f''({{ex.wells.stationary.1}}) = {{ex.wells.second.1}} > 0$ — локальный минимум; $f''({{ex.wells.stationary.2}}) = {{ex.wells.second.2}} < 0$ — локальный максимум; $f''({{ex.wells.stationary.3}}) = {{ex.wells.second.3}} > 0$ — локальный минимум. Какой из двух минимумов глобальный, производные не говорят. Так как $f(x) \\to +\\infty$ при $|x| \\to \\infty$, глобальный минимум существует и совпадает с одним из локальных, поэтому сравните значения $f({{ex.wells.stationary.1}}) = {{ex.wells.values.1}}$ и $f({{ex.wells.stationary.3}}) = {{ex.wells.values.3}}$."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "Let $f(x) = x^4$. Find $f'(0)$ and $f''(0)$. Is $0$ a minimum?",
         "ru": "Пусть $f(x) = x^4$. Найдите $f'(0)$ и $f''(0)$. Является ли $0$ точкой минимума?"
        },
        "answer": {
         "en": "Both are zero, so the test is silent. But $x^4 \\ge 0$ for every $x$ with equality only at $0$, so $0$ is a strict global minimum. The same situation returns in two variables in problem B4.",
         "ru": "Обе производные равны нулю, и тест молчит. Но $x^4 \\ge 0$ при всех $x$, причём равенство достигается только в $0$, поэтому $0$ — точка строгого глобального минимума. Та же ситуация вернётся в двух переменных в задаче B4."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "multivariate",
    "title": {
     "en": "Functions of several variables",
     "ru": "Функции нескольких переменных"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "A function of $n$ variables assigns a number to every point of $\\mathbb R^n$. The examples of this section use the function from the lecture, $f = {{ex.lecture.tex.f}}$, at the point ${{ex.lecture.point}}$; problem A2 evaluates the same function at another point.",
       "ru": "Функция $n$ переменных сопоставляет число каждой точке $\\mathbb R^n$. В примерах этого раздела используется функция из лекции $f = {{ex.lecture.tex.f}}$ в точке ${{ex.lecture.point}}$; в задаче A2 та же функция исследуется в другой точке."
      }
     }
    ],
    "subsections": [
     {
      "id": "multivariate-level-sets",
      "title": {
       "en": "Level sets: a height map",
       "ru": "Множества уровня: карта высот"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "A function of two variables is easy to picture as a relief: $f(x_1, x_2)$ is the height above the point $(x_1, x_2)$. The **level set** $\\{x:\\ f(x) = c\\}$ collects the points of equal height $c$, exactly like a contour line on a topographic map. Several level sets drawn with their values give a height map of $f$. Two different level sets never cross, because a point has only one height.",
         "ru": "Функцию двух переменных удобно представлять как рельеф: $f(x_1, x_2)$ — высота над точкой $(x_1;\\ x_2)$. **Множество уровня** $\\{x:\\ f(x) = c\\}$ состоит из точек одинаковой высоты $c$, в точности как горизонталь на топографической карте; на картинках в плоскости это **линия уровня**. Несколько линий уровня с подписанными значениями дают карту высот функции $f$. Две разные линии уровня никогда не пересекаются: у точки только одна высота."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_level_sets.svg",
        "alt": {
         "en": "Contour plots: concentric circles, tilted ellipses and hyperbolas with labelled levels.",
         "ru": "Линии уровня: концентрические окружности, наклонные эллипсы и гиперболы с подписанными уровнями."
        },
        "caption": {
         "en": "Level sets with their values. Left: $x_1^2 + x_2^2$ (problem B1), circles around a minimum. Middle: $x_1^2 + x_2^2 - x_1x_2$ (problem A1), tilted ellipses around a minimum. Right: $x_1^2 - x_2^2$ (problem B2), hyperbolas around a saddle; the dashed lines are the level $0$.",
         "ru": "Линии уровня с подписанными значениями. Слева: $x_1^2 + x_2^2$ (задача B1), окружности вокруг минимума. В центре: $x_1^2 + x_2^2 - x_1x_2$ (задача A1), наклонные эллипсы вокруг минимума. Справа: $x_1^2 - x_2^2$ (задача B2), гиперболы вокруг седла; штриховые прямые — уровень $0$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "Closed nested level sets surround a pit or a hill, and only the level values tell which: without them a pit and a hill look the same. Open level sets that turn away from each other mark a saddle: the function goes up in one direction and down in another. Where level sets with evenly spaced values crowd together, the function changes fast.",
         "ru": "Замкнутые вложенные линии уровня окружают яму или холм, и только значения уровней говорят, что именно: без них яма и холм выглядят одинаково. Незамкнутые линии уровня, расходящиеся друг от друга, — признак седла: в одном направлении функция растёт, в другом убывает. Там, где линии уровня с равномерно расставленными значениями сгущаются, функция меняется быстро."
        }
       }
      ]
     },
     {
      "id": "multivariate-partial",
      "title": {
       "en": "Partial derivatives",
       "ru": "Частные производные"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Partial derivative",
         "ru": "частная производная"
        },
        "text": {
         "en": "The **partial derivative** of $f$ with respect to $x_i$ is the ordinary derivative in $x_i$ with all other variables held fixed; it is the rate of change of $f$ when only $x_i$ moves: $$\\frac{\\partial f}{\\partial x_i}(x) = \\lim_{\\alpha \\to 0} \\frac{f(x_1, \\dots, x_i + \\alpha, \\dots, x_n) - f(x)}{\\alpha}.$$",
         "ru": "**Частная производная** функции $f$ по переменной $x_i$ — это обычная производная по $x_i$ при зафиксированных остальных переменных, то есть скорость изменения $f$, когда меняется только $x_i$: $$\\frac{\\partial f}{\\partial x_i}(x) = \\lim_{\\alpha \\to 0} \\frac{f(x_1, \\dots, x_i + \\alpha, \\dots, x_n) - f(x)}{\\alpha}.$$"
        }
       },
       {
        "type": "p",
        "text": {
         "en": "In practice: treat every letter except $x_i$ as a number and differentiate by the usual rules. The result is again a function of all $n$ variables.",
         "ru": "На практике это значит: считайте все буквы, кроме $x_i$, числами и дифференцируйте по обычным правилам. Результат снова зависит от всех $n$ переменных."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Differentiate $f = {{ex.lecture.tex.f}}$ term by term. With respect to $x_1$: ${{ex.lecture.tex.term1}}$ gives ${{ex.lecture.tex.d1term1}}$; in ${{ex.lecture.tex.term2}}$ the factor $x_2^2$ is a “number”, so the term gives ${{ex.lecture.tex.d1term2}}$; ${{ex.lecture.tex.term3}}$ does not contain $x_1$ and gives $0$. So $\\partial f/\\partial x_1 = {{ex.lecture.tex.g1}}$. Likewise, with respect to $x_2$ the first term gives $0$ and the other two give ${{ex.lecture.tex.d2term2}}$ and ${{ex.lecture.tex.d2term3}}$, so $\\partial f/\\partial x_2 = {{ex.lecture.tex.g2}}$.",
         "ru": "Продифференцируйте $f = {{ex.lecture.tex.f}}$ по слагаемым. По $x_1$: ${{ex.lecture.tex.term1}}$ даёт ${{ex.lecture.tex.d1term1}}$; в слагаемом ${{ex.lecture.tex.term2}}$ множитель $x_2^2$ — «число», поэтому оно даёт ${{ex.lecture.tex.d1term2}}$; слагаемое ${{ex.lecture.tex.term3}}$ не содержит $x_1$ и даёт $0$. Итого $\\partial f/\\partial x_1 = {{ex.lecture.tex.g1}}$. Точно так же по $x_2$ первое слагаемое даёт $0$, а два других дают ${{ex.lecture.tex.d2term2}}$ и ${{ex.lecture.tex.d2term3}}$, так что $\\partial f/\\partial x_2 = {{ex.lecture.tex.g2}}$."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "Find both partial derivatives of $f = {{ex.partial.tex.f}}$.",
         "ru": "Найдите обе частные производные функции $f = {{ex.partial.tex.f}}$."
        },
        "answer": {
         "en": "$\\partial f/\\partial x_1 = {{ex.partial.tex.g1}}$ and $\\partial f/\\partial x_2 = {{ex.partial.tex.g2}}$.",
         "ru": "$\\partial f/\\partial x_1 = {{ex.partial.tex.g1}}$ и $\\partial f/\\partial x_2 = {{ex.partial.tex.g2}}$."
        }
       }
      ]
     },
     {
      "id": "multivariate-gradient",
      "title": {
       "en": "The gradient",
       "ru": "Градиент"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Gradient",
         "ru": "градиент"
        },
        "text": {
         "en": "The **gradient** of $f$ at $x$ collects all partial derivatives into one column vector: $$\\nabla f(x) = \\big(\\partial f/\\partial x_1, \\dots, \\partial f/\\partial x_n\\big)^\\top \\in \\mathbb R^n.$$",
         "ru": "**Градиент** функции $f$ в точке $x$ собирает все частные производные в один вектор-столбец: $$\\nabla f(x) = \\big(\\partial f/\\partial x_1;\\ \\dots;\\ \\partial f/\\partial x_n\\big)^\\top \\in \\mathbb R^n.$$"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**The gradient points in the direction of steepest ascent**, and $-\\nabla f$ in the direction of steepest descent. Its length $\\|\\nabla f\\|$ is the rate of change in that direction per unit of length (when $\\nabla f(x) \\ne 0$). This is why gradient descent steps against the gradient; the section on optimality conditions proves it with the directional derivative.",
          "ru": "**Градиент указывает направление наискорейшего роста**, а $-\\nabla f$ — направление наискорейшего убывания. Его длина $\\|\\nabla f\\|$ — скорость изменения в этом направлении на единицу длины (если $\\nabla f(x) \\ne 0$). Поэтому градиентный спуск шагает против градиента; в разделе об условиях оптимальности это доказывается с помощью производной по направлению."
         },
         {
          "en": "**The gradient is perpendicular to level sets.** Along a level set $f$ does not change, so its rate of change in that direction is zero, and the gradient has no component along the level set.",
          "ru": "**Градиент перпендикулярен множествам уровня.** Вдоль множества уровня $f$ не меняется, поэтому скорость изменения $f$ в этом направлении равна нулю и у градиента нет составляющей вдоль этого множества."
         }
        ]
       },
       {
        "type": "figure",
        "src": "figures/fig_gradient.svg",
        "alt": {
         "en": "Ellipses of a quadratic function, a point on one of them, the gradient arrow perpendicular to that ellipse, its opposite, a tangent arrow and a descent direction.",
         "ru": "Эллипсы квадратичной функции, точка на одном из них, стрелка градиента, перпендикулярная этому эллипсу, противоположная стрелка, стрелка вдоль касательной и направление спуска."
        },
        "caption": {
         "en": "Level sets of $f = {{ex.dir.tex.f}}$ and the point $P = {{ex.dir.point}}$ on the level $f = {{ex.dir.f}}$. The gradient $\\nabla f(P) = {{ex.dir.grad}}$ is perpendicular to this level set and points uphill; $-\\nabla f(P)$ points downhill; along the tangent direction $\\tau$ the rate of change is zero. The direction $s = {{ex.dir.s}}$ of problem D2 makes an obtuse angle with $\\nabla f(P)$, so $f$ decreases along it.",
         "ru": "Линии уровня $f = {{ex.dir.tex.f}}$ и точка $P = {{ex.dir.point}}$ на уровне $f = {{ex.dir.f}}$. Градиент $\\nabla f(P) = {{ex.dir.grad}}$ перпендикулярен этой линии уровня и указывает в сторону подъёма; $-\\nabla f(P)$ указывает в сторону спуска; вдоль касательного направления $\\tau$ скорость изменения равна нулю. Направление $s = {{ex.dir.s}}$ из задачи D2 образует с $\\nabla f(P)$ тупой угол, поэтому вдоль него $f$ убывает."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Evaluating the partial derivatives of the lecture function at the point gives $\\nabla f{{ex.lecture.point}} = ({{ex.lecture.g1parts.1}} + {{ex.lecture.g1parts.2}},\\ {{ex.lecture.g2parts.1}} + {{ex.lecture.g2parts.2}})^\\top = {{ex.lecture.grad}}$. A small step $\\alpha$ along ${{ex.lecture.grad}}$ changes $f$ by about $\\alpha\\,({{ex.lecture.gradSq.1}} + {{ex.lecture.gradSq.2}}) = {{ex.lecture.rate}}\\alpha$; the opposite step decreases $f$ by the same amount to first order. The factor in front of $\\alpha$ is $\\|\\nabla f\\|^2$, the inner product of the gradient with itself.",
         "ru": "Частные производные функции из лекции в этой точке дают $\\nabla f{{ex.lecture.point}} = ({{ex.lecture.g1parts.1}} + {{ex.lecture.g1parts.2}};\\ {{ex.lecture.g2parts.1}} + {{ex.lecture.g2parts.2}})^\\top = {{ex.lecture.grad}}$. Малый шаг $\\alpha$ вдоль ${{ex.lecture.grad}}$ меняет $f$ примерно на $\\alpha\\,({{ex.lecture.gradSq.1}} + {{ex.lecture.gradSq.2}}) = {{ex.lecture.rate}}\\alpha$; противоположный шаг в первом порядке уменьшает $f$ на столько же. Множитель при $\\alpha$ равен $\\|\\nabla f\\|^2$ — скалярному произведению градиента на себя."
        }
       }
      ]
     },
     {
      "id": "multivariate-hessian",
      "title": {
       "en": "The Hessian",
       "ru": "Гессиан"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Differentiating a partial derivative again, in the same or in another variable, gives a second partial derivative. For $n$ variables there are $n^2$ of them, and they are arranged in a square table.",
         "ru": "Если частную производную продифференцировать ещё раз, по той же или по другой переменной, получится вторая частная производная. Для $n$ переменных таких производных $n^2$, и их записывают в квадратную таблицу."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Hessian",
         "ru": "гессиан"
        },
        "text": {
         "en": "The **Hessian** of $f$ at $x$ is the $n \\times n$ matrix of second partial derivatives; its entry in row $i$ and column $j$ is $\\partial^2 f/\\partial x_i\\,\\partial x_j$: $$H(x) = \\big[\\partial^2 f/\\partial x_i\\,\\partial x_j\\big]_{i,j=1}^n.$$",
         "ru": "**Гессиан** функции $f$ в точке $x$ — матрица $n \\times n$ из вторых частных производных; в строке $i$ и столбце $j$ стоит $\\partial^2 f/\\partial x_i\\,\\partial x_j$: $$H(x) = \\big[\\partial^2 f/\\partial x_i\\,\\partial x_j\\big]_{i,j=1}^n.$$"
        }
       },
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "Schwarz",
         "ru": "Шварца"
        },
        "text": {
         "en": "If the second partial derivatives of $f$ are continuous, they do not depend on the order of differentiation: $\\partial^2 f/\\partial x_i\\,\\partial x_j = \\partial^2 f/\\partial x_j\\,\\partial x_i$. Hence the Hessian is symmetric.",
         "ru": "Если вторые частные производные функции $f$ непрерывны, они не зависят от порядка дифференцирования: $\\partial^2 f/\\partial x_i\\,\\partial x_j = \\partial^2 f/\\partial x_j\\,\\partial x_i$. Следовательно, гессиан симметричен."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "All functions of the seminar are polynomials, whose second derivatives are continuous everywhere, so their Hessians are symmetric. This matters: everything later, eigenvalues and Sylvester's criterion included, is about symmetric matrices.",
         "ru": "Все функции семинара — многочлены, их вторые производные всюду непрерывны, поэтому их гессианы симметричны. Это важно: всё дальнейшее, в том числе собственные значения и критерий Сильвестра, относится к симметричным матрицам."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The Hessian of the lecture function step by step. Differentiating $\\partial f/\\partial x_1 = {{ex.lecture.tex.g1}}$ in $x_1$ gives ${{ex.lecture.tex.h11}}$ and in $x_2$ gives ${{ex.lecture.tex.h12}}$; differentiating $\\partial f/\\partial x_2 = {{ex.lecture.tex.g2}}$ in $x_2$ gives ${{ex.lecture.tex.h22}}$. So $$H(x) = {{ex.lecture.tex.H}}, \\qquad H{{ex.lecture.point}} = {{ex.lecture.H}},$$ and $\\det H{{ex.lecture.point}} = {{ex.lecture.detProd}} - {{ex.lecture.offSq}} = {{ex.lecture.det}}$. Check the symmetry: differentiating $\\partial f/\\partial x_2$ in $x_1$ gives the same ${{ex.lecture.tex.h12}}$. Unlike the Hessian of a quadratic function, this one depends on the point, so problem A2 gets a different matrix at its point.",
         "ru": "Гессиан функции из лекции по шагам. Производная от $\\partial f/\\partial x_1 = {{ex.lecture.tex.g1}}$ по $x_1$ равна ${{ex.lecture.tex.h11}}$, а по $x_2$ равна ${{ex.lecture.tex.h12}}$; производная от $\\partial f/\\partial x_2 = {{ex.lecture.tex.g2}}$ по $x_2$ равна ${{ex.lecture.tex.h22}}$. Поэтому $$H(x) = {{ex.lecture.tex.H}}, \\qquad H{{ex.lecture.point}} = {{ex.lecture.H}},$$ и $\\det H{{ex.lecture.point}} = {{ex.lecture.detProd}} - {{ex.lecture.offSq}} = {{ex.lecture.det}}$. Проверьте симметрию: производная от $\\partial f/\\partial x_2$ по $x_1$ даёт то же самое ${{ex.lecture.tex.h12}}$. В отличие от гессиана квадратичной функции, этот гессиан зависит от точки, поэтому в задаче A2 в её точке получается другая матрица."
        }
       }
      ]
     },
     {
      "id": "multivariate-cross-term",
      "title": {
       "en": "The cross-term trap",
       "ru": "Ловушка смешанного слагаемого"
      },
      "blocks": [
       {
        "type": "trap",
        "text": {
         "en": "A term $c\\,x_1x_2$ gives $H_{12} = H_{21} = c$: differentiate directly, $\\partial(c\\,x_1x_2)/\\partial x_1 = c\\,x_2$ and then $\\partial(c\\,x_2)/\\partial x_2 = c$, with no halving. The value $c/2$ is the entry of $A$ in $f = x^\\top A x$: the product $x^\\top A x$ produces $x_1x_2$ twice, as $A_{12}x_1x_2 + A_{21}x_2x_1$, and $H = A + A^\\top$ for a symmetric $A$. The form $f = \\tfrac12 x^\\top H x$ needs no halving. The two wrong values seen in practice are $c/2$ (the $x^\\top A x$ convention) and $2c$ (doubling as if the term were a square).",
         "ru": "Слагаемое $c\\,x_1x_2$ даёт $H_{12} = H_{21} = c$: продифференцируйте напрямую, $\\partial(c\\,x_1x_2)/\\partial x_1 = c\\,x_2$, затем $\\partial(c\\,x_2)/\\partial x_2 = c$ — никакого деления пополам. Значение $c/2$ — это элемент матрицы $A$ в записи $f = x^\\top A x$: произведение $x^\\top A x$ содержит $x_1x_2$ дважды, как $A_{12}x_1x_2 + A_{21}x_2x_1$, и для симметричной $A$ выполнено $H = A + A^\\top$. В записи $f = \\tfrac12 x^\\top H x$ делить пополам не нужно. На практике встречаются два неверных значения: $c/2$ (соглашение $x^\\top A x$) и $2c$ (удвоение, как будто слагаемое — квадрат)."
        }
       },
       {
        "type": "table",
        "head": [
         {
          "en": "Convention",
          "ru": "Соглашение"
         },
         {
          "en": "Off-diagonal entry",
          "ru": "Внедиагональный элемент"
         },
         {
          "en": "For $f = {{ex.cross.tex.f}}$",
          "ru": "Для $f = {{ex.cross.tex.f}}$"
         }
        ],
        "rows": [
         [
          {
           "en": "Hessian $H$",
           "ru": "Гессиан $H$"
          },
          {
           "en": "$c$",
           "ru": "$c$"
          },
          {
           "en": "$H_{12} = {{ex.cross.H12}}$",
           "ru": "$H_{12} = {{ex.cross.H12}}$"
          }
         ],
         [
          {
           "en": "$f = x^\\top A x$",
           "ru": "$f = x^\\top A x$"
          },
          {
           "en": "$c/2$",
           "ru": "$c/2$"
          },
          {
           "en": "$A_{12} = {{ex.cross.A12}}$",
           "ru": "$A_{12} = {{ex.cross.A12}}$"
          }
         ],
         [
          {
           "en": "$f = \\tfrac12 x^\\top H x$",
           "ru": "$f = \\tfrac12 x^\\top H x$"
          },
          {
           "en": "$c$",
           "ru": "$c$"
          },
          {
           "en": "the Hessian itself",
           "ru": "сам гессиан"
          }
         ]
        ]
       },
       {
        "type": "p",
        "text": {
         "en": "The rule for reading $H$ off a polynomial of degree two without differentiating: the diagonal holds twice the coefficient of each square; each cross term puts its coefficient into both symmetric positions; variables that never appear together give $0$.",
         "ru": "Отсюда правило, позволяющее выписать $H$ многочлена второй степени без дифференцирования: на диагонали стоят удвоенные коэффициенты при квадратах; каждое смешанное слагаемое ставит свой коэффициент в обе симметричные позиции; переменным, которые нигде не встречаются вместе, соответствует $0$."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "Write down the Hessian of $f = {{ex.hess3.tex.f}}$ without differentiating term by term.",
         "ru": "Выпишите гессиан функции $f = {{ex.hess3.tex.f}}$, не дифференцируя по слагаемым."
        },
        "answer": {
         "en": "The diagonal holds twice the coefficients of the squares, the off-diagonal entries hold the coefficients of the cross terms in both symmetric positions; $x_1$ and $x_3$ never meet: $$H = {{ex.hess3.H}}.$$",
         "ru": "На диагонали стоят удвоенные коэффициенты при квадратах, вне диагонали — коэффициенты смешанных слагаемых в обеих симметричных позициях; $x_1$ и $x_3$ вместе не встречаются: $$H = {{ex.hess3.H}}.$$"
        }
       }
      ]
     }
    ]
   },
   {
    "id": "taylor",
    "title": {
     "en": "Taylor's formula in several variables",
     "ru": "Формула Тейлора для многих переменных"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Taylor's formula is the main tool of the course: near a point a smooth function is replaced by a polynomial with a small error, and every optimality condition is read off this formula.",
       "ru": "Формула Тейлора — главный инструмент курса: вблизи точки гладкая функция заменяется многочленом с малой ошибкой, и все условия оптимальности выводятся из этой формулы."
      }
     }
    ],
    "subsections": [
     {
      "id": "taylor-formula",
      "title": {
       "en": "The formula",
       "ru": "Формула"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "For a twice continuously differentiable $f$ and a small vector $h$, the value near $x$ is the value at $x$ plus a linear and a quadratic term, up to a small remainder: $$f(x + h) = f(x) + \\nabla f(x)^\\top h + \\tfrac12\\, h^\\top H(x)\\, h + o(\\|h\\|^2).$$ The remainder satisfies $o(\\|h\\|^2)/\\|h\\|^2 \\to 0$ as $h \\to 0$.",
         "ru": "Для дважды непрерывно дифференцируемой функции $f$ и малого вектора $h$ значение вблизи $x$ равно значению в $x$ плюс линейное и квадратичное слагаемые с точностью до малого остатка: $$f(x + h) = f(x) + \\nabla f(x)^\\top h + \\tfrac12\\, h^\\top H(x)\\, h + o(\\|h\\|^2).$$ Остаток удовлетворяет условию $o(\\|h\\|^2)/\\|h\\|^2 \\to 0$ при $h \\to 0$."
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "$f(x)$: the value where we stand, the starting height.",
          "ru": "$f(x)$ — значение там, где вы стоите, то есть исходная высота."
         },
         {
          "en": "$\\nabla f(x)^\\top h$: the **linear part**, a single number, the inner product of the gradient with the shift. It changes sign with $h$: the steps $h$ and $-h$ have linear parts of equal size and opposite signs.",
          "ru": "$\\nabla f(x)^\\top h$ — **линейная часть**, одно число: скалярное произведение градиента на смещение. Она меняет знак вместе с $h$: у шагов $h$ и $-h$ линейные части равны по величине и противоположны по знаку."
         },
         {
          "en": "$\\tfrac12 h^\\top H h$: the **quadratic part**, the curvature. It is unchanged under $h \\to -h$, because $h$ enters twice.",
          "ru": "$\\tfrac12 h^\\top H h$ — **квадратичная часть**, кривизна. При замене $h$ на $-h$ она не меняется, потому что $h$ входит в неё дважды."
         }
        ]
       },
       {
        "type": "intuition",
        "text": {
         "en": "If $\\nabla f(x) \\ne 0$, the linear part dominates for small steps, and one of $h$ and $-h$ decreases $f$, so $x$ is not a minimum. If $\\nabla f(x) = 0$, the linear part vanishes and the sign of $h^\\top H h$ over all directions $h$ decides; the section on quadratic forms and definiteness studies these signs.",
         "ru": "Если $\\nabla f(x) \\ne 0$, при малых шагах главной оказывается линейная часть, и один из шагов $h$ и $-h$ уменьшает $f$, поэтому $x$ не точка минимума. Если $\\nabla f(x) = 0$, линейная часть исчезает и всё решает знак $h^\\top H h$ по всем направлениям $h$; какими бывают эти знаки, разобрано в разделе о квадратичных формах и знакоопределённости."
        }
       }
      ]
     },
     {
      "id": "taylor-quadratic-form",
      "title": {
       "en": "Computing the quadratic term",
       "ru": "Как считать квадратичное слагаемое"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The number $h^\\top H h$ is built from the entries of $H$ and the components of $h$. For $n = 2$, multiplying out gives $$h^\\top H h = H_{11}h_1^2 + 2H_{12}h_1h_2 + H_{22}h_2^2.$$ Such a sum of squares and products of the components with constant coefficients is called a **quadratic form**. The cross term appears twice, as $H_{12}h_1h_2$ and $H_{21}h_2h_1$, hence the factor $2$: the same doubling as in the cross-term trap.",
         "ru": "Число $h^\\top H h$ составлено из элементов $H$ и компонент $h$. При $n = 2$ раскрытие произведения даёт $$h^\\top H h = H_{11}h_1^2 + 2H_{12}h_1h_2 + H_{22}h_2^2.$$ Такая сумма квадратов и попарных произведений компонент с постоянными коэффициентами называется **квадратичной формой**. Смешанное слагаемое входит дважды, как $H_{12}h_1h_2$ и $H_{21}h_2h_1$, отсюда множитель $2$ — то же удвоение, что и в ловушке смешанного слагаемого."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "For the lecture Hessian $H = {{ex.lecture.H}}$ and the step $h = {{ex.lecture.h}}$: $h^\\top H h = {{ex.lecture.hHh}}$ and $\\tfrac12 h^\\top H h = {{ex.lecture.halfhHh}}$.",
         "ru": "Для гессиана из лекции $H = {{ex.lecture.H}}$ и шага $h = {{ex.lecture.h}}$: $h^\\top H h = {{ex.lecture.hHh}}$ и $\\tfrac12 h^\\top H h = {{ex.lecture.halfhHh}}$."
        }
       }
      ]
     },
     {
      "id": "taylor-numerical",
      "title": {
       "en": "A numerical check",
       "ru": "Численная проверка"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Numbers show that the formula really works. Take the lecture function at ${{ex.lecture.point}}$, where $f = {{ex.lecture.f}}$, $\\nabla f = {{ex.lecture.grad}}$ and $H = {{ex.lecture.H}}$. Along $h = t\\,{{ex.lecture.h}}$ compare three numbers: the exact value, the linear model ${{ex.taylor.tex.lin}}$ and the quadratic model ${{ex.taylor.tex.quad}}$.",
         "ru": "Числа показывают, что формула действительно работает. Возьмите функцию из лекции в точке ${{ex.lecture.point}}$, где $f = {{ex.lecture.f}}$, $\\nabla f = {{ex.lecture.grad}}$ и $H = {{ex.lecture.H}}$. Вдоль $h = t\\,{{ex.lecture.h}}$ сравните три числа: точное значение, линейную модель ${{ex.taylor.tex.lin}}$ и квадратичную модель ${{ex.taylor.tex.quad}}$."
        }
       },
       {
        "type": "table",
        "head": [
         {
          "en": "$t$",
          "ru": "$t$"
         },
         {
          "en": "exact $f$",
          "ru": "точное $f$"
         },
         {
          "en": "linear",
          "ru": "линейная"
         },
         {
          "en": "quadratic",
          "ru": "квадратичная"
         },
         {
          "en": "linear error",
          "ru": "ошибка линейной"
         },
         {
          "en": "quadratic error",
          "ru": "ошибка квадратичной"
         }
        ],
        "rows": [
         [
          {
           "en": "${{ex.taylor.half.t}}$",
           "ru": "${{ex.taylor.half.t}}$"
          },
          {
           "en": "${{ex.taylor.half.tex.exact}}$",
           "ru": "${{ex.taylor.half.tex.exact}}$"
          },
          {
           "en": "${{ex.taylor.half.tex.lin}}$",
           "ru": "${{ex.taylor.half.tex.lin}}$"
          },
          {
           "en": "${{ex.taylor.half.tex.quad}}$",
           "ru": "${{ex.taylor.half.tex.quad}}$"
          },
          {
           "en": "${{ex.taylor.half.tex.errLin}}$",
           "ru": "${{ex.taylor.half.tex.errLin}}$"
          },
          {
           "en": "${{ex.taylor.half.tex.errQuad}}$",
           "ru": "${{ex.taylor.half.tex.errQuad}}$"
          }
         ],
         [
          {
           "en": "${{ex.taylor.tenth.t}}$",
           "ru": "${{ex.taylor.tenth.t}}$"
          },
          {
           "en": "${{ex.taylor.tenth.tex.exact}}$",
           "ru": "${{ex.taylor.tenth.tex.exact}}$"
          },
          {
           "en": "${{ex.taylor.tenth.tex.lin}}$",
           "ru": "${{ex.taylor.tenth.tex.lin}}$"
          },
          {
           "en": "${{ex.taylor.tenth.tex.quad}}$",
           "ru": "${{ex.taylor.tenth.tex.quad}}$"
          },
          {
           "en": "${{ex.taylor.tenth.tex.errLin}}$",
           "ru": "${{ex.taylor.tenth.tex.errLin}}$"
          },
          {
           "en": "${{ex.taylor.tenth.tex.errQuad}}$",
           "ru": "${{ex.taylor.tenth.tex.errQuad}}$"
          }
         ],
         [
          {
           "en": "${{ex.taylor.hundredth.t}}$",
           "ru": "${{ex.taylor.hundredth.t}}$"
          },
          {
           "en": "${{ex.taylor.hundredth.tex.exact}}$",
           "ru": "${{ex.taylor.hundredth.tex.exact}}$"
          },
          {
           "en": "${{ex.taylor.hundredth.tex.lin}}$",
           "ru": "${{ex.taylor.hundredth.tex.lin}}$"
          },
          {
           "en": "${{ex.taylor.hundredth.tex.quad}}$",
           "ru": "${{ex.taylor.hundredth.tex.quad}}$"
          },
          {
           "en": "${{ex.taylor.hundredth.tex.errLin}}$",
           "ru": "${{ex.taylor.hundredth.tex.errLin}}$"
          },
          {
           "en": "${{ex.taylor.hundredth.tex.errQuad}}$",
           "ru": "${{ex.taylor.hundredth.tex.errQuad}}$"
          }
         ]
        ]
       },
       {
        "type": "p",
        "text": {
         "en": "Dividing $t$ by ${{ex.taylor.stepRatio}}$, as from the second row to the third, divides the linear error by about ${{ex.taylor.linFactor}}$ (like $t^2$) and the quadratic error by ${{ex.taylor.quadFactor}}$ (like $t^3$). Along this line $f$ equals ${{ex.taylor.tex.along}}$, so the quadratic error is exactly ${{ex.taylor.tex.remainder}}$. This is what $o(\\|h\\|^2)$ means: the remainder vanishes faster than the terms that are written out.",
         "ru": "Деление $t$ на ${{ex.taylor.stepRatio}}$, как при переходе от второй строки к третьей, делит ошибку линейной модели примерно на ${{ex.taylor.linFactor}}$ (как $t^2$), а ошибку квадратичной — на ${{ex.taylor.quadFactor}}$ (как $t^3$). Вдоль этой прямой $f$ равна ${{ex.taylor.tex.along}}$, поэтому ошибка квадратичной модели в точности равна ${{ex.taylor.tex.remainder}}$. Именно это и означает запись $o(\\|h\\|^2)$: остаток исчезает быстрее выписанных слагаемых."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "Quadratic functions: the formula is exact",
         "ru": "Квадратичные функции: формула точна"
        },
        "text": {
         "en": "A polynomial of degree two has no nonzero third derivatives, so the remainder is zero and Taylor's formula is exact. Check it on $q = {{ex.quad.tex.f}}$ at ${{ex.quad.point}}$: $q = {{ex.quad.f}}$, $\\nabla q = {{ex.quad.grad}}$, $H = {{ex.quad.H}}$. For $h = {{ex.quad.h}}$ the linear part is ${{ex.quad.linear}}$; the products $h_1^2$, $h_1h_2$ and $h_2^2$, equal to ${{ex.quad.hSq}}$, give $h^\\top H h = {{ex.quad.hHh}}$ and the quadratic part ${{ex.quad.quadratic}}$. The total is ${{ex.quad.value}}$, equal to $q{{ex.quad.shifted}}$. Linear regression with the squared loss is quadratic in the weights, so it is solved by a formula, without iterations.",
         "ru": "У многочлена второй степени все третьи производные равны нулю, поэтому остатка нет и формула Тейлора точна. Проверьте это на $q = {{ex.quad.tex.f}}$ в точке ${{ex.quad.point}}$: $q = {{ex.quad.f}}$, $\\nabla q = {{ex.quad.grad}}$, $H = {{ex.quad.H}}$. Для $h = {{ex.quad.h}}$ линейная часть равна ${{ex.quad.linear}}$; произведения $h_1^2$, $h_1h_2$ и $h_2^2$, равные ${{ex.quad.hSq}}$, дают $h^\\top H h = {{ex.quad.hHh}}$ и квадратичную часть ${{ex.quad.quadratic}}$. Сумма равна ${{ex.quad.value}}$ и совпадает с $q{{ex.quad.shifted}}$. Линейная регрессия с квадратичной функцией потерь квадратична по весам, поэтому решается формулой, без итераций."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "definiteness",
    "title": {
     "en": "Quadratic forms and definiteness",
     "ru": "Квадратичные формы и знакоопределённость"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Taylor's formula shows that at a point with $\\nabla f(x) = 0$ the linear term vanishes and the quadratic term $\\tfrac12\\,h^\\top H(x)\\,h$ takes over. Whether $f$ goes up or down near $x$ therefore depends on the signs that $h^\\top H h$ takes as $h$ ranges over all directions. This section studies which signs a quadratic form can take and how to find them.",
       "ru": "Формула Тейлора показывает: в точке, где $\\nabla f(x) = 0$, линейное слагаемое исчезает и главным становится квадратичное, $\\tfrac12\\,h^\\top H(x)\\,h$. Поэтому поведение $f$ вблизи $x$ — поднимается она или опускается — зависит от знаков, которые принимает $h^\\top H h$ при всевозможных направлениях $h$. В этом разделе разбирается, какие знаки может принимать квадратичная форма и как их определить."
      }
     }
    ],
    "subsections": [
     {
      "id": "definiteness-cases",
      "title": {
       "en": "Five cases",
       "ru": "Пять случаев"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Definiteness",
         "ru": "знакоопределённость"
        },
        "text": {
         "en": "Let $A$ be a symmetric $n \\times n$ matrix. $A$ is **positive definite**, $A \\succ 0$, if $h^\\top A h > 0$ for all $h \\ne 0$, and **positive semidefinite**, $A \\succeq 0$, if $h^\\top A h \\ge 0$ for all $h$. $A$ is **negative definite**, $A \\prec 0$, if $h^\\top A h < 0$ for all $h \\ne 0$, and **negative semidefinite**, $A \\preceq 0$, if $h^\\top A h \\le 0$ for all $h$. Finally, $A$ is **indefinite** if $h^\\top A h$ takes both signs: $h^\\top A h > 0$ for some $h$ and $g^\\top A g < 0$ for some $g$.",
         "ru": "Симметричная матрица $A$ размера $n \\times n$ называется **положительно определённой**, $A \\succ 0$, если $h^\\top A h > 0$ для всех $h \\ne 0$, и **положительно полуопределённой**, $A \\succeq 0$, если $h^\\top A h \\ge 0$ для всех $h$. Она называется **отрицательно определённой**, $A \\prec 0$, если $h^\\top A h < 0$ для всех $h \\ne 0$, и **отрицательно полуопределённой**, $A \\preceq 0$, если $h^\\top A h \\le 0$ для всех $h$. Наконец, $A$ называется **знаконеопределённой**, если $h^\\top A h$ принимает значения обоих знаков: $h^\\top A h > 0$ для некоторого $h$ и $g^\\top A g < 0$ для некоторого $g$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "In terms of a landscape, the graph of $h^\\top A h$ is a bowl when $A \\succ 0$, a dome when $A \\prec 0$, a saddle when $A$ is indefinite and a trough with a flat bottom when $A \\succeq 0$ is singular: along the directions with $h^\\top A h = 0$ the graph stays at height $0$.",
         "ru": "На языке рельефа график $h^\\top A h$ — это чаша при $A \\succ 0$, купол при $A \\prec 0$, седло при знаконеопределённой $A$ и жёлоб с плоским дном при вырожденной $A \\succeq 0$: вдоль направлений, где $h^\\top A h = 0$, график остаётся на высоте $0$."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_definiteness.svg",
        "alt": {
         "en": "Four contour plots: ellipses with increasing levels, ellipses with decreasing levels, hyperbolas and parallel lines around a red line.",
         "ru": "Четыре графика линий уровня: эллипсы с возрастающими уровнями, эллипсы с убывающими уровнями, гиперболы и параллельные прямые вокруг красной прямой."
        },
        "caption": {
         "en": "Level sets of $h^\\top A h$: a bowl for $A = {{ex.eig.pd.A}}$, a dome for $A = {{ex.defFig.nd}}$, a saddle for $A = {{ex.eig.indef.A}}$ and a trough for $A = {{ex.defFig.psd}}$, whose zero eigenvalue gives the flat bottom drawn in red.",
         "ru": "Линии уровня $h^\\top A h$: чаша при $A = {{ex.eig.pd.A}}$, купол при $A = {{ex.defFig.nd}}$, седло при $A = {{ex.eig.indef.A}}$ и жёлоб при $A = {{ex.defFig.psd}}$; нулевое собственное значение этой матрицы даёт плоское дно, показанное красным."
        }
       }
      ]
     },
     {
      "id": "definiteness-eigenvalues",
      "title": {
       "en": "Eigenvalues give the answer",
       "ru": "Ответ дают собственные значения"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "A symmetric $n \\times n$ matrix $A$ has $n$ mutually perpendicular unit **eigenvectors** $v_1, \\dots, v_n$: along each of them $A$ acts as a stretch, $Av_i = \\lambda_i v_i$, and the stretch factors $\\lambda_1, \\dots, \\lambda_n$ are the **eigenvalues**, all of them real. Write $h$ in the axes of the eigenvectors, $h = u_1v_1 + \\dots + u_nv_n$. Then the cross terms disappear and the quadratic form becomes a weighted sum of squares: $$h^\\top A h = \\lambda_1u_1^2 + \\dots + \\lambda_nu_n^2.$$ Every question about the signs of $h^\\top A h$ is now answered by the signs of the $\\lambda_i$.",
         "ru": "У симметричной матрицы $A$ размера $n \\times n$ есть $n$ взаимно перпендикулярных единичных **собственных векторов** $v_1, \\dots, v_n$: вдоль каждого из них $A$ действует как растяжение, $Av_i = \\lambda_i v_i$, а коэффициенты растяжения $\\lambda_1, \\dots, \\lambda_n$ — это **собственные значения**, все они вещественны. Разложите $h$ по осям собственных векторов: $h = u_1v_1 + \\dots + u_nv_n$. Тогда смешанные слагаемые исчезают и квадратичная форма становится взвешенной суммой квадратов: $$h^\\top A h = \\lambda_1u_1^2 + \\dots + \\lambda_nu_n^2.$$ Теперь любой вопрос о знаках $h^\\top A h$ решают знаки чисел $\\lambda_i$."
        }
       },
       {
        "type": "table",
        "head": [
         {
          "en": "Eigenvalues",
          "ru": "Собственные значения"
         },
         {
          "en": "Type",
          "ru": "Тип"
         },
         {
          "en": "Level sets",
          "ru": "Линии уровня"
         }
        ],
        "rows": [
         [
          {
           "en": "all $> 0$",
           "ru": "все $> 0$"
          },
          {
           "en": "positive definite",
           "ru": "положительно определённая"
          },
          {
           "en": "ellipses around a minimum",
           "ru": "эллипсы вокруг минимума"
          }
         ],
         [
          {
           "en": "all $< 0$",
           "ru": "все $< 0$"
          },
          {
           "en": "negative definite",
           "ru": "отрицательно определённая"
          },
          {
           "en": "ellipses around a maximum",
           "ru": "эллипсы вокруг максимума"
          }
         ],
         [
          {
           "en": "both signs",
           "ru": "обоих знаков"
          },
          {
           "en": "indefinite",
           "ru": "знаконеопределённая"
          },
          {
           "en": "hyperbolas, a saddle",
           "ru": "гиперболы, седло"
          }
         ],
         [
          {
           "en": "all $\\ge 0$, some zero",
           "ru": "все $\\ge 0$, есть нулевые"
          },
          {
           "en": "positive semidefinite",
           "ru": "положительно полуопределённая"
          },
          {
           "en": "parallel lines, a trough",
           "ru": "параллельные прямые, жёлоб"
          }
         ],
         [
          {
           "en": "all $\\le 0$, some zero",
           "ru": "все $\\le 0$, есть нулевые"
          },
          {
           "en": "negative semidefinite",
           "ru": "отрицательно полуопределённая"
          },
          {
           "en": "the same, upside down",
           "ru": "то же, но перевёрнутое"
          }
         ]
        ]
       },
       {
        "type": "p",
        "text": {
         "en": "For a $2 \\times 2$ matrix the eigenvalues are the roots of the quadratic equation $\\det(A - \\lambda I) = 0$, that is $$\\lambda^2 - (A_{11} + A_{22})\\lambda + \\det A = 0.$$",
         "ru": "Для матрицы $2 \\times 2$ собственные значения — корни квадратного уравнения $\\det(A - \\lambda I) = 0$, то есть $$\\lambda^2 - (A_{11} + A_{22})\\lambda + \\det A = 0.$$"
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$A = {{ex.eig.pd.A}}$: the equation is ${{ex.eig.pd.tex.poly}} = 0$ with the roots ${{ex.eig.pd.values}}$, both positive, so $A$ is positive definite. $A = {{ex.eig.indef.A}}$: the equation is ${{ex.eig.indef.tex.poly}} = 0$ with the roots ${{ex.eig.indef.values}}$ of opposite signs, so $A$ is indefinite. These are the Hessians of problems A1 and C2.",
         "ru": "$A = {{ex.eig.pd.A}}$: уравнение ${{ex.eig.pd.tex.poly}} = 0$ имеет корни ${{ex.eig.pd.values}}$, оба положительны, значит, $A$ положительно определённая. $A = {{ex.eig.indef.A}}$: уравнение ${{ex.eig.indef.tex.poly}} = 0$ имеет корни ${{ex.eig.indef.values}}$ разных знаков, значит, $A$ знаконеопределённая. Это гессианы из задач A1 и C2."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The two matrices differ only in the size of the off-diagonal entry. So a cross term can destroy definiteness, and what decides is its size, not its sign: changing the sign of the off-diagonal entries of a $2 \\times 2$ matrix does not change its eigenvalues. Problem C2 studies the whole family.",
         "ru": "Эти две матрицы отличаются только величиной внедиагонального элемента. Значит, смешанное слагаемое может разрушить знакоопределённость, и решает здесь его величина, а не знак: если сменить знак внедиагональных элементов матрицы $2 \\times 2$, её собственные значения не изменятся. Всё семейство таких матриц исследуется в задаче C2."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "Looking ahead: the condition number",
         "ru": "Забегая вперёд: число обусловленности"
        },
        "text": {
         "en": "For $A \\succ 0$ the ratio $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ is the **condition number**; it measures how stretched the level sets are. For $x_1^2 + x_2^2$ the eigenvalues are ${{ex.kappa.bowl.eig}}$, so $\\kappa = {{ex.kappa.bowl.value}}$ and the level sets are circles: a gradient step with step size ${{ex.kappa.bowl.tex.step}}$ lands exactly at the minimum, $x - {{ex.kappa.bowl.tex.step}} \\cdot 2x = 0$. For the matrix of problem A1, $\\kappa = {{ex.kappa.pd.value}}$ and the level sets are ellipses. The larger $\\kappa$, the narrower the ravine and the slower gradient methods: the later topics of the course return to this.",
         "ru": "Для $A \\succ 0$ отношение $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ называется **числом обусловленности**; оно показывает, насколько вытянуты линии уровня. У $x_1^2 + x_2^2$ собственные значения гессиана равны ${{ex.kappa.bowl.eig}}$, поэтому $\\kappa = {{ex.kappa.bowl.value}}$ и линии уровня — окружности: один шаг градиентного спуска с величиной шага ${{ex.kappa.bowl.tex.step}}$ попадает точно в минимум, $x - {{ex.kappa.bowl.tex.step}} \\cdot 2x = 0$. Для матрицы из задачи A1 число $\\kappa = {{ex.kappa.pd.value}}$, и линии уровня — эллипсы. Чем больше $\\kappa$, тем уже овраг и тем медленнее работают градиентные методы: к этому курс ещё вернётся в следующих темах."
        }
       }
      ]
     },
     {
      "id": "definiteness-sylvester",
      "title": {
       "en": "Sylvester's criterion",
       "ru": "Критерий Сильвестра"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "For a ${{ex.syl.nLeading}} \\times {{ex.syl.nLeading}}$ matrix the eigenvalues are the roots of a cubic equation, which is unpleasant to solve by hand. Strict definiteness can be checked with determinants instead. For a $2 \\times 2$ matrix $\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$, and a larger one is expanded along a row, as in the example below; the determinant equals the product of the eigenvalues, so $\\det A < 0$ already makes $A$ indefinite.",
         "ru": "Для матрицы ${{ex.syl.nLeading}} \\times {{ex.syl.nLeading}}$ собственные значения — корни кубического уравнения, и решать его вручную неудобно. Строгую знакоопределённость можно проверить без него, с помощью определителей. Для матрицы $2 \\times 2$ $\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$, определитель большего размера раскладывается по строке, как в примере ниже; определитель равен произведению собственных значений, поэтому из $\\det A < 0$ уже следует знаконеопределённость $A$."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Leading principal minor",
         "ru": "угловой минор"
        },
        "text": {
         "en": "The **leading principal minor** $\\Delta_k$ of an $n \\times n$ matrix $A$ is the determinant of the submatrix formed by the first $k$ rows and the first $k$ columns of $A$, $k = 1, \\dots, n$. They are usually called just the **leading minors**.",
         "ru": "**Угловой (ведущий главный) минор** $\\Delta_k$ матрицы $A$ размера $n \\times n$ — это определитель подматрицы из первых $k$ строк и первых $k$ столбцов $A$, $k = 1, \\dots, n$. Обычно их называют просто **угловыми минорами**."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$A = {{ex.syl.A}}$: $\\Delta_1 = {{ex.syl.minors.1}}$, $\\Delta_2 = {{ex.syl.d2prod.1}} - {{ex.syl.d2prod.2}} = {{ex.syl.minors.2}}$ and $\\Delta_3 = \\det A = {{ex.syl.A.1.1}} \\cdot {{ex.syl.cof.1}} - {{ex.syl.A.1.2}} \\cdot {{ex.syl.cof.2}} + 0 = {{ex.syl.terms.1}} - {{ex.syl.terms.2}} = {{ex.syl.minors.3}}$ (expansion along the first row). All three minors are positive, so the criterion below gives $A \\succ 0$.",
         "ru": "$A = {{ex.syl.A}}$: $\\Delta_1 = {{ex.syl.minors.1}}$, $\\Delta_2 = {{ex.syl.d2prod.1}} - {{ex.syl.d2prod.2}} = {{ex.syl.minors.2}}$ и $\\Delta_3 = \\det A = {{ex.syl.A.1.1}} \\cdot {{ex.syl.cof.1}} - {{ex.syl.A.1.2}} \\cdot {{ex.syl.cof.2}} + 0 = {{ex.syl.terms.1}} - {{ex.syl.terms.2}} = {{ex.syl.minors.3}}$ (разложение по первой строке). Все три минора положительны, поэтому по критерию ниже $A \\succ 0$."
        }
       },
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "Sylvester's criterion",
         "ru": "критерий Сильвестра"
        },
        "text": {
         "en": "Let $A$ be a symmetric $n \\times n$ matrix. Then $$A \\succ 0 \\iff \\Delta_k > 0 \\text{ for all } k, \\qquad A \\prec 0 \\iff (-1)^k\\Delta_k > 0 \\text{ for all } k.$$ The second pattern means alternating signs starting with minus: $\\Delta_1 < 0$, $\\Delta_2 > 0$, $\\Delta_3 < 0$ and so on.",
         "ru": "Пусть $A$ — симметричная матрица размера $n \\times n$. Тогда $$A \\succ 0 \\iff \\Delta_k > 0 \\text{ для всех } k, \\qquad A \\prec 0 \\iff (-1)^k\\Delta_k > 0 \\text{ для всех } k.$$ Второй шаблон означает чередование знаков, начиная с минуса: $\\Delta_1 < 0$, $\\Delta_2 > 0$, $\\Delta_3 < 0$ и так далее."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "*Why it works*, for $2 \\times 2$ and $A_{11} \\ne 0$: complete the square, $$A_{11}h_1^2 + 2A_{12}h_1h_2 + A_{22}h_2^2 = A_{11}\\big(h_1 + \\tfrac{A_{12}}{A_{11}}h_2\\big)^2 + \\tfrac{\\Delta_2}{\\Delta_1}h_2^2.$$ If $\\Delta_1 = A_{11} > 0$ and $\\Delta_2 > 0$, both coefficients are positive, and the sum vanishes only when $h_2 = 0$ and then $h_1 = 0$. If $\\Delta_1 < 0$ and $\\Delta_2 > 0$, both coefficients are negative. In general Gaussian elimination does the same: it completes the squares one variable at a time, and the leading minors control the signs of the coefficients that appear.",
         "ru": "*Почему это работает*, для $2 \\times 2$ и $A_{11} \\ne 0$: выделите полный квадрат, $$A_{11}h_1^2 + 2A_{12}h_1h_2 + A_{22}h_2^2 = A_{11}\\big(h_1 + \\tfrac{A_{12}}{A_{11}}h_2\\big)^2 + \\tfrac{\\Delta_2}{\\Delta_1}h_2^2.$$ При $\\Delta_1 = A_{11} > 0$ и $\\Delta_2 > 0$ оба коэффициента положительны, и сумма обращается в нуль, только когда $h_2 = 0$, а тогда и $h_1 = 0$. При $\\Delta_1 < 0$ и $\\Delta_2 > 0$ оба коэффициента отрицательны. В общем случае то же делает метод Гаусса: он выделяет квадраты по одной переменной, а угловые миноры управляют знаками получающихся коэффициентов."
        }
       }
      ]
     },
     {
      "id": "definiteness-limits",
      "title": {
       "en": "What Sylvester's criterion cannot do",
       "ru": "Чего не умеет критерий Сильвестра"
      },
      "blocks": [
       {
        "type": "trap",
        "text": {
         "en": "Sylvester's criterion speaks only about strict definiteness. If neither pattern holds, do not conclude that the matrix is indefinite: it may be semidefinite. $A = {{ex.sylTrap.A}}$ and $B = {{ex.sylTrap.B}}$ have the same leading minors, $(\\Delta_1, \\Delta_2) = {{ex.sylTrap.minors}}$, but $A \\preceq 0$ and $B \\succeq 0$. The same minors give opposite answers, so the leading minors cannot decide semidefiniteness at all.",
         "ru": "Критерий Сильвестра говорит только о строгой знакоопределённости. Если ни один шаблон не выполнен, нельзя заключать, что матрица знаконеопределённая: она может оказаться полуопределённой. У $A = {{ex.sylTrap.A}}$ и $B = {{ex.sylTrap.B}}$ одинаковые угловые миноры, $(\\Delta_1;\\ \\Delta_2) = {{ex.sylTrap.minors}}$, но $A \\preceq 0$, а $B \\succeq 0$. Одни и те же миноры дают противоположные ответы, поэтому по угловым минорам полуопределённость не распознать в принципе."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "A correct test of semidefiniteness uses **all** principal minors: $A \\succeq 0$ exactly when the determinants of all submatrices on a set of rows and the same set of columns are nonnegative. A ${{ex.syl.nLeading}} \\times {{ex.syl.nLeading}}$ matrix has ${{ex.syl.nLeading}}$ leading but ${{ex.syl.nPrincipal}}$ principal minors; for the matrix $A$ above they are ${{ex.syl.principal}}$. For $\\operatorname{diag}(0, -1)$ the principal minors are ${{ex.sylTrap.principalA}}$, and the negative one shows that it is not $\\succeq 0$.",
         "ru": "Правильная проверка полуопределённости использует **все** главные миноры: $A \\succeq 0$ ровно тогда, когда неотрицательны определители всех подматриц, стоящих на пересечении какого-либо набора строк и того же набора столбцов. У матрицы ${{ex.syl.nLeading}} \\times {{ex.syl.nLeading}}$ угловых миноров ${{ex.syl.nLeading}}$, а главных ${{ex.syl.nPrincipal}}$; для матрицы $A$ из примера выше это ${{ex.syl.principal}}$. У $\\operatorname{diag}(0, -1)$ главные миноры равны ${{ex.sylTrap.principalA}}$, и отрицательный минор показывает, что эта матрица не $\\succeq 0$."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "A practical rule",
         "ru": "Практическое правило"
        },
        "text": {
         "en": "On paper, use Sylvester's criterion only to decide strict definiteness. If some $\\Delta_k = 0$, compute the eigenvalues instead; for a $2 \\times 2$ matrix this is one quadratic equation. In code, always compute the eigenvalues and compare them with zero using a tolerance, because floating-point arithmetic rarely produces an exact zero (see the section “From the board to the keyboard”).",
         "ru": "На бумаге применяйте критерий Сильвестра только для вопроса о строгой знакоопределённости. Если какой-то $\\Delta_k = 0$, переходите к собственным значениям; для матрицы $2 \\times 2$ это одно квадратное уравнение. В коде всегда вычисляйте собственные значения и сравнивайте их с нулём с допуском, потому что в арифметике с плавающей точкой точный нуль получается редко (об этом — в разделе «От доски к клавиатуре»)."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "Check $A = {{ex.sylCheck.A}}$ with Sylvester's criterion. What can you conclude?",
         "ru": "Проверьте $A = {{ex.sylCheck.A}}$ по критерию Сильвестра. Что можно заключить?"
        },
        "answer": {
         "en": "$(\\Delta_1, \\Delta_2) = {{ex.sylCheck.minors}}$. The pattern of $A \\succ 0$ needs every $\\Delta_k > 0$ and fails at $\\Delta_2$; the pattern of $A \\prec 0$ needs $\\Delta_1 < 0$ and fails at once. Neither pattern holds, so the criterion only says that $A$ is not definite. The eigenvalues ${{ex.sylCheck.eig}}$ have opposite signs and show that the matrix is indefinite.",
         "ru": "$(\\Delta_1;\\ \\Delta_2) = {{ex.sylCheck.minors}}$. Шаблон для $A \\succ 0$ требует, чтобы все $\\Delta_k > 0$, и нарушается на $\\Delta_2$; шаблон для $A \\prec 0$ требует $\\Delta_1 < 0$ и нарушается сразу. Ни один шаблон не выполнен, поэтому критерий говорит лишь, что $A$ не является строго знакоопределённой. Собственные значения ${{ex.sylCheck.eig}}$ разных знаков и показывают, что матрица знаконеопределённая."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "optimality",
    "title": {
     "en": "Optimality conditions",
     "ru": "Условия оптимальности"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Taylor's formula, definiteness and the difference between interior and boundary points now combine into four statements: a lemma on the directional derivative and three optimality conditions. Together they are the core of the first lecture of the course.",
       "ru": "Формула Тейлора, знакоопределённость и различие между внутренними и граничными точками теперь складываются в четыре утверждения: лемму о производной по направлению и три условия оптимальности. Вместе они составляют ядро первой лекции курса."
      }
     }
    ],
    "subsections": [
     {
      "id": "optimality-directions",
      "title": {
       "en": "Feasible directions",
       "ru": "Допустимые направления"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "From an interior point of $\\Omega$ you can move a little in any direction and stay in $\\Omega$. From a boundary point you cannot: some directions leave $\\Omega$ at once.",
         "ru": "Из внутренней точки $\\Omega$ можно немного сдвинуться в любом направлении и остаться в $\\Omega$. Из граничной точки так нельзя: некоторые направления сразу выводят из $\\Omega$."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Feasible direction",
         "ru": "допустимое направление"
        },
        "text": {
         "en": "A vector $s \\in \\mathbb R^n$, $s \\ne 0$, is a **feasible direction** at a point $x \\in \\Omega$ if there is $\\alpha_0 > 0$ such that $x + \\alpha s \\in \\Omega$ for all $\\alpha \\in [0, \\alpha_0]$.",
         "ru": "Вектор $s \\in \\mathbb R^n$, $s \\ne 0$, называется **допустимым направлением** в точке $x \\in \\Omega$, если существует $\\alpha_0 > 0$, при котором $x + \\alpha s \\in \\Omega$ для всех $\\alpha \\in [0, \\alpha_0]$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "In words: a small enough step along $s$ keeps the point feasible. The number $\\alpha_0$ may be tiny, but it must be positive.",
         "ru": "Словами: достаточно малый шаг по направлению $s$ оставляет точку в $\\Omega$. Число $\\alpha_0$ может быть крошечным, но обязано быть положительным."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_feasible.svg",
        "alt": {
         "en": "Three copies of the first quadrant with a point P on the edge, a point Q at the corner and a point R inside, blue arrows for feasible directions and red dashed arrows for infeasible ones.",
         "ru": "Три копии первого квадранта с точкой P на стороне, точкой Q в углу и точкой R внутри; синие стрелки показывают допустимые направления, красные пунктирные — недопустимые."
        },
        "caption": {
         "en": "Feasible directions in the quadrant $\\Omega = \\{x_1 \\ge 0,\\ x_2 \\ge 0\\}$. At the boundary point $P = {{ex.quadrant.boundary}}$ they form the half-plane $s_1 \\ge 0$ (problem D1), at the corner $Q = {{ex.quadrant.corner}}$ the quarter $s_1 \\ge 0,\\ s_2 \\ge 0$ (home practice H3) and at the interior point $R = {{ex.quadrant.interior}}$ every direction is feasible. The dashed red directions leave $\\Omega$ at once.",
         "ru": "Допустимые направления в квадранте $\\Omega = \\{x_1 \\ge 0,\\ x_2 \\ge 0\\}$. В граничной точке $P = {{ex.quadrant.boundary}}$ они образуют полуплоскость $s_1 \\ge 0$ (задача D1), в угловой точке $Q = {{ex.quadrant.corner}}$ — четверть плоскости $s_1 \\ge 0,\\ s_2 \\ge 0$ (домашняя практика H3), а во внутренней точке $R = {{ex.quadrant.interior}}$ допустимо любое направление. Красные пунктирные направления сразу выводят из $\\Omega$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "If $s$ is feasible, so is $ts$ for every $t > 0$: the feasible directions form a **cone**. For a convex $\\Omega$ they form, together with $0$, a convex cone; for a nonconvex $\\Omega$ they need not. At the origin of $\\{x_1 \\le 0\\} \\cup \\{x_2 \\le 0\\}$ the feasible directions are $\\{s \\ne 0:\\ s_1 \\le 0 \\text{ or } s_2 \\le 0\\}$, and this set is not convex even with $0$ added.",
         "ru": "Если направление $s$ допустимо, то допустимо и $ts$ при любом $t > 0$: допустимые направления образуют **конус**. Для выпуклого $\\Omega$ они вместе с $0$ образуют выпуклый конус, а для невыпуклого $\\Omega$ это не обязательно так. В начале координат для множества $\\{x_1 \\le 0\\} \\cup \\{x_2 \\le 0\\}$ допустимые направления — это $\\{s \\ne 0:\\ s_1 \\le 0 \\text{ или } s_2 \\le 0\\}$, и это множество не выпукло, даже если добавить к нему $0$."
        }
       }
      ]
     },
     {
      "id": "optimality-directional",
      "title": {
       "en": "The directional derivative",
       "ru": "Производная по направлению"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Directional derivative",
         "ru": "производная по направлению"
        },
        "text": {
         "en": "Let $x \\in \\Omega$ and let $s$ be a direction. The **directional derivative** of $f$ at $x$ along $s$ is the one-sided limit $$\\frac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\frac{f(x + \\alpha s) - f(x)}{\\alpha}.$$",
         "ru": "Пусть $x \\in \\Omega$ и $s$ — направление. **Производная по направлению** $s$ функции $f$ в точке $x$ — это односторонний предел $$\\frac{\\partial f}{\\partial s}(x) = \\lim_{\\alpha \\to 0^+} \\frac{f(x + \\alpha s) - f(x)}{\\alpha}.$$"
        }
       },
       {
        "type": "p",
        "text": {
         "en": "This is the ordinary derivative from a first calculus course, with the step taken along the vector $s$ instead of along an axis. The limit is one-sided because at a boundary point only steps with $\\alpha \\ge 0$ may be allowed. At an interior point of a differentiable $f$ both one-sided limits exist and agree, so the two-sided limit is not a mistake there.",
         "ru": "Это обычная производная из первого курса математического анализа, только шаг делается не вдоль оси, а вдоль вектора $s$. Предел односторонний, потому что в граничной точке могут быть разрешены только шаги с $\\alpha \\ge 0$. Во внутренней точке для дифференцируемой $f$ оба односторонних предела существуют и совпадают, так что двусторонний предел там не ошибка."
        }
       },
       {
        "type": "theorem",
        "kind": "lemma",
        "title": {
         "en": "The directional derivative through the gradient",
         "ru": "производная по направлению через градиент"
        },
        "text": {
         "en": "If $f$ is differentiable at $x$, then $\\dfrac{\\partial f}{\\partial s}(x) = s^\\top\\nabla f(x)$ for every direction $s$.",
         "ru": "Если $f$ дифференцируема в точке $x$, то $\\dfrac{\\partial f}{\\partial s}(x) = s^\\top\\nabla f(x)$ для любого направления $s$."
        }
       },
       {
        "type": "proof",
        "text": {
         "en": "Put $h = \\alpha s$ into Taylor's formula: $$f(x + \\alpha s) = f(x) + \\alpha\\,s^\\top\\nabla f(x) + o(\\alpha).$$ Subtract $f(x)$, divide by $\\alpha > 0$ and let $\\alpha \\to 0^+$: the term $o(\\alpha)/\\alpha$ tends to $0$, and $s^\\top\\nabla f(x)$ remains.",
         "ru": "Подстановка $h = \\alpha s$ в формулу Тейлора даёт $$f(x + \\alpha s) = f(x) + \\alpha\\,s^\\top\\nabla f(x) + o(\\alpha).$$ После вычитания $f(x)$, деления на $\\alpha > 0$ и перехода к пределу при $\\alpha \\to 0^+$ слагаемое $o(\\alpha)/\\alpha$ стремится к $0$, и остаётся $s^\\top\\nabla f(x)$."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "Why this lemma matters",
         "ru": "Зачем нужна эта лемма"
        },
        "text": {
         "en": "A limit, which takes work to compute, becomes an inner product, which takes one line. The lemma also explains why the gradient points in the direction of steepest ascent: among directions of length $1$, the rate $s^\\top\\nabla f$ is largest for $s = \\nabla f/\\|\\nabla f\\|$ (when $\\nabla f \\ne 0$), where it equals $\\|\\nabla f\\|$, because $s^\\top\\nabla f \\le \\|s\\|\\,\\|\\nabla f\\|$ by the Cauchy–Schwarz inequality.",
         "ru": "Предел, который приходится вычислять, превращается в скалярное произведение, которое считается в одну строку. Кроме того, лемма объясняет, почему градиент указывает направление наискорейшего роста: среди направлений длины $1$ скорость $s^\\top\\nabla f$ максимальна при $s = \\nabla f/\\|\\nabla f\\|$ (если $\\nabla f \\ne 0$) и равна тогда $\\|\\nabla f\\|$, потому что $s^\\top\\nabla f \\le \\|s\\|\\,\\|\\nabla f\\|$ по неравенству Коши — Буняковского — Шварца."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "$f = {{ex.dir.tex.f}}$, $x = {{ex.dir.point}}$, $s = {{ex.dir.s}}$. The gradient is $\\nabla f = {{ex.dir.tex.grad}}$, at $x$ it equals ${{ex.dir.grad}}$, so $s^\\top \\nabla f(x) = {{ex.dir.value}}$: $f$ decreases along $s$. The fastest decrease per unit length is along $-\\nabla f(x)/\\|\\nabla f(x)\\|$, with rate $-\\|\\nabla f(x)\\| = {{ex.dir.tex.steepest}} \\approx {{ex.dir.steepest}}$, about ${{ex.dir.ratio}}$ times the rate along $s/\\|s\\|$ (see the trap below). This is why gradient descent steps against the gradient.",
         "ru": "$f = {{ex.dir.tex.f}}$, $x = {{ex.dir.point}}$, $s = {{ex.dir.s}}$. Градиент равен $\\nabla f = {{ex.dir.tex.grad}}$, в точке $x$ это ${{ex.dir.grad}}$, поэтому $s^\\top \\nabla f(x) = {{ex.dir.value}}$: вдоль $s$ функция $f$ убывает. Быстрее всего в расчёте на единицу длины она убывает вдоль $-\\nabla f(x)/\\|\\nabla f(x)\\|$, со скоростью $-\\|\\nabla f(x)\\| = {{ex.dir.tex.steepest}} \\approx {{ex.dir.steepest}}$, примерно в ${{ex.dir.ratio}}$ раза больше по модулю, чем вдоль $s/\\|s\\|$ (см. ловушку ниже). Поэтому градиентный спуск и делает шаг против градиента."
        }
       },
       {
        "type": "trap",
        "text": {
         "en": "The number ${{ex.dir.value}}$ is a rate per unit of $\\alpha$, not per unit of length. Here $\\|s\\| = {{ex.dir.tex.norm}} \\approx {{ex.dir.norm}}$, so per unit length the rate is ${{ex.dir.value}}/\\|s\\| = {{ex.dir.tex.perLength}} \\approx {{ex.dir.perLength}}$. Compare directions only after normalizing them; otherwise the longest vector looks the steepest.",
         "ru": "Число ${{ex.dir.value}}$ — это скорость на единицу параметра $\\alpha$, а не на единицу длины. Здесь $\\|s\\| = {{ex.dir.tex.norm}} \\approx {{ex.dir.norm}}$, поэтому на единицу длины приходится ${{ex.dir.value}}/\\|s\\| = {{ex.dir.tex.perLength}} \\approx {{ex.dir.perLength}}$. Сравнивайте направления только после нормировки, иначе самым крутым окажется просто самый длинный вектор."
        }
       }
      ]
     },
     {
      "id": "optimality-first-order",
      "title": {
       "en": "The first-order necessary condition",
       "ru": "Необходимое условие первого порядка"
      },
      "blocks": [
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "First-order necessary condition",
         "ru": "необходимое условие первого порядка"
        },
        "text": {
         "en": "Let $f \\in C^1$ on $\\Omega$ and let $x^*$ be a local minimum of $f$ on $\\Omega$. Then $$s^\\top\\nabla f(x^*) \\ge 0$$ for every feasible direction $s$ at $x^*$. If, in addition, $x^*$ is an interior point of $\\Omega$, then $\\nabla f(x^*) = 0$.",
         "ru": "Пусть $f \\in C^1$ на $\\Omega$ и $x^*$ — локальный минимум $f$ на $\\Omega$. Тогда $$s^\\top\\nabla f(x^*) \\ge 0$$ для любого допустимого направления $s$ в точке $x^*$. Если вдобавок $x^*$ — внутренняя точка $\\Omega$, то $\\nabla f(x^*) = 0$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "If $f$ decreased along a direction in which you are allowed to move, a small step in that direction would give a feasible point with a smaller value, and $x^*$ would not be a minimum.",
         "ru": "Если бы $f$ убывала вдоль направления, по которому разрешено двигаться, маленький шаг по нему дал бы допустимую точку с меньшим значением, и $x^*$ не был бы минимумом."
        }
       },
       {
        "type": "proof",
        "text": {
         "en": "Suppose that $s$ is feasible and $s^\\top\\nabla f(x^*) = -\\delta < 0$. By Taylor's formula $$f(x^* + \\alpha s) = f(x^*) - \\alpha\\delta + o(\\alpha),$$ and $|o(\\alpha)| < \\tfrac12\\alpha\\delta$ for all small $\\alpha > 0$. For these $\\alpha$ $$f(x^* + \\alpha s) < f(x^*) - \\alpha\\delta + \\tfrac12\\alpha\\delta = f(x^*) - \\tfrac12\\alpha\\delta < f(x^*).$$ For small $\\alpha$ the point $x^* + \\alpha s$ lies in $\\Omega$, because $s$ is feasible, and is as close to $x^*$ as needed: a contradiction with the local minimality of $x^*$. Hence $s^\\top\\nabla f(x^*) \\ge 0$. At an interior point both $s$ and $-s$ are feasible for every $s \\ne 0$, so $s^\\top\\nabla f(x^*) \\ge 0$ and $-s^\\top\\nabla f(x^*) \\ge 0$, that is $s^\\top\\nabla f(x^*) = 0$ for all $s$. The only vector orthogonal to every vector is zero, so $\\nabla f(x^*) = 0$.",
         "ru": "Пусть $s$ допустимо и $s^\\top\\nabla f(x^*) = -\\delta < 0$. По формуле Тейлора $$f(x^* + \\alpha s) = f(x^*) - \\alpha\\delta + o(\\alpha),$$ причём $|o(\\alpha)| < \\tfrac12\\alpha\\delta$ при всех малых $\\alpha > 0$. Для таких $\\alpha$ $$f(x^* + \\alpha s) < f(x^*) - \\alpha\\delta + \\tfrac12\\alpha\\delta = f(x^*) - \\tfrac12\\alpha\\delta < f(x^*).$$ При малых $\\alpha$ точка $x^* + \\alpha s$ лежит в $\\Omega$, так как $s$ допустимо, и сколь угодно близка к $x^*$: это противоречит тому, что $x^*$ — локальный минимум. Значит, $s^\\top\\nabla f(x^*) \\ge 0$. Во внутренней точке для любого $s \\ne 0$ допустимы и $s$, и $-s$, поэтому $s^\\top\\nabla f(x^*) \\ge 0$ и $-s^\\top\\nabla f(x^*) \\ge 0$, то есть $s^\\top\\nabla f(x^*) = 0$ для всех $s$. Единственный вектор, ортогональный всем векторам, — нулевой, значит, $\\nabla f(x^*) = 0$."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "In plain words",
         "ru": "Если сказать проще"
        },
        "text": {
         "en": "From a minimum you cannot go downhill in any direction in which you are allowed to move. The familiar condition $\\nabla f = 0$ is not a separate theorem but the special case of an interior point: there you may move both ways along every line, and “not downhill both ways” means “flat”. In Seminar 2 this inequality becomes the KKT conditions.",
         "ru": "Из минимума нельзя пойти вниз ни по одному направлению, по которому вообще разрешено двигаться. Привычное условие $\\nabla f = 0$ — не отдельная теорема, а частный случай внутренней точки: там вдоль любой прямой можно идти в обе стороны, а «не вниз в обе стороны» означает «ровно». На семинаре 2 это неравенство превратится в условия ККТ."
        }
       },
       {
        "type": "definition",
        "title": {
         "en": "Stationary point",
         "ru": "стационарная точка"
        },
        "text": {
         "en": "A point $x$ with $\\nabla f(x) = 0$ is a **stationary point** of $f$. Stationary points are the candidates for an unconstrained minimum: by the theorem above, a local minimum at an interior point is always stationary.",
         "ru": "Точка $x$, в которой $\\nabla f(x) = 0$, называется **стационарной точкой** функции $f$. Стационарные точки — кандидаты в точки безусловного минимума: по теореме выше локальный минимум во внутренней точке всегда стационарен."
        }
       }
      ]
     },
     {
      "id": "optimality-second-necessary",
      "title": {
       "en": "The second-order necessary condition",
       "ru": "Необходимое условие второго порядка"
      },
      "blocks": [
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "Second-order necessary condition",
         "ru": "необходимое условие второго порядка"
        },
        "text": {
         "en": "Let $f \\in C^2$ on $\\Omega$, let $x^*$ be a local minimum of $f$ on $\\Omega$ and let $s$ be a feasible direction at $x^*$ with $s^\\top\\nabla f(x^*) = 0$. Then $s^\\top H(x^*)\\,s \\ge 0$. In particular, at an interior point $\\nabla f(x^*) = 0$ and $H(x^*) \\succeq 0$.",
         "ru": "Пусть $f \\in C^2$ на $\\Omega$, $x^*$ — локальный минимум $f$ на $\\Omega$ и $s$ — допустимое направление в точке $x^*$, для которого $s^\\top\\nabla f(x^*) = 0$. Тогда $s^\\top H(x^*)\\,s \\ge 0$. В частности, во внутренней точке $\\nabla f(x^*) = 0$ и $H(x^*) \\succeq 0$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "When the linear term of Taylor's formula vanishes along $s$, the quadratic term takes over, so the curvature along $s$ decides. Negative curvature along $s$ would mean that $f$ goes down along $s$.",
         "ru": "Когда линейное слагаемое формулы Тейлора вдоль $s$ обнуляется, главным становится квадратичное, и всё решает кривизна вдоль $s$. Отрицательная кривизна вдоль $s$ означала бы, что $f$ убывает вдоль $s$."
        }
       },
       {
        "type": "proof",
        "text": {
         "en": "Put $h = \\alpha s$ into Taylor's formula; the linear term vanishes because $s^\\top\\nabla f(x^*) = 0$: $$f(x^* + \\alpha s) = f(x^*) + \\tfrac12\\alpha^2\\,s^\\top H s + o(\\alpha^2), \\qquad H = H(x^*).$$ If $s^\\top H s = -\\delta < 0$, then $|o(\\alpha^2)| < \\tfrac14\\alpha^2\\delta$ for all small $\\alpha > 0$, and for these $\\alpha$ $$f(x^* + \\alpha s) < f(x^*) - \\tfrac12\\alpha^2\\delta + \\tfrac14\\alpha^2\\delta = f(x^*) - \\tfrac14\\alpha^2\\delta < f(x^*).$$ As in the previous proof, the point $x^* + \\alpha s \\in \\Omega$ lies arbitrarily close to $x^*$, which contradicts the local minimality of $x^*$.",
         "ru": "Подстановка $h = \\alpha s$ в формулу Тейлора с учётом $s^\\top\\nabla f(x^*) = 0$ даёт $$f(x^* + \\alpha s) = f(x^*) + \\tfrac12\\alpha^2\\,s^\\top H s + o(\\alpha^2), \\qquad H = H(x^*).$$ Если $s^\\top H s = -\\delta < 0$, то $|o(\\alpha^2)| < \\tfrac14\\alpha^2\\delta$ при всех малых $\\alpha > 0$, и для таких $\\alpha$ $$f(x^* + \\alpha s) < f(x^*) - \\tfrac12\\alpha^2\\delta + \\tfrac14\\alpha^2\\delta = f(x^*) - \\tfrac14\\alpha^2\\delta < f(x^*).$$ Как и в предыдущем доказательстве, точка $x^* + \\alpha s \\in \\Omega$ сколь угодно близка к $x^*$, а это противоречит тому, что $x^*$ — локальный минимум."
        }
       }
      ]
     },
     {
      "id": "optimality-second-sufficient",
      "title": {
       "en": "The second-order sufficient condition",
       "ru": "Достаточное условие второго порядка"
      },
      "blocks": [
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "Second-order sufficient condition",
         "ru": "достаточное условие второго порядка"
        },
        "text": {
         "en": "Let $f \\in C^2$ and let $x^*$ be an **interior** point of $\\Omega$ with $\\nabla f(x^*) = 0$ and $H(x^*) \\succ 0$. Then $x^*$ is a strict local minimum.",
         "ru": "Пусть $f \\in C^2$, $x^*$ — **внутренняя** точка $\\Omega$, $\\nabla f(x^*) = 0$ и $H(x^*) \\succ 0$. Тогда $x^*$ — строгий локальный минимум."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "A positive definite Hessian means positive curvature in all directions at once, with a margin $\\mu = \\lambda_{\\min} > 0$, and this margin beats the remainder of Taylor's formula.",
         "ru": "Положительно определённый гессиан означает положительную кривизну во всех направлениях сразу, причём с запасом $\\mu = \\lambda_{\\min} > 0$, и этого запаса хватает, чтобы перебить остаток формулы Тейлора."
        }
       },
       {
        "type": "proof",
        "text": {
         "en": "Let $H = H(x^*)$ and $\\mu = \\lambda_{\\min}(H) > 0$. In the axes of the eigenvectors $h^\\top H h = \\lambda_1u_1^2 + \\dots + \\lambda_nu_n^2 \\ge \\mu\\|h\\|^2$. Since $\\nabla f(x^*) = 0$, Taylor's formula gives $$f(x^* + h) - f(x^*) = \\tfrac12\\,h^\\top H h + o(\\|h\\|^2) \\ge \\tfrac12\\mu\\|h\\|^2 + o(\\|h\\|^2).$$ There is $\\varepsilon > 0$ such that the ball $\\|h\\| < \\varepsilon$ around $x^*$ lies in $\\Omega$ and $|o(\\|h\\|^2)| < \\tfrac14\\mu\\|h\\|^2$ for $0 < \\|h\\| < \\varepsilon$. For these $h$ $$f(x^* + h) - f(x^*) > \\tfrac14\\mu\\|h\\|^2 > 0.$$ So every other point of this neighbourhood has a larger value: $x^*$ is a strict local minimum.",
         "ru": "Пусть $H = H(x^*)$ и $\\mu = \\lambda_{\\min}(H) > 0$. В осях собственных векторов $h^\\top H h = \\lambda_1u_1^2 + \\dots + \\lambda_nu_n^2 \\ge \\mu\\|h\\|^2$. Так как $\\nabla f(x^*) = 0$, формула Тейлора даёт $$f(x^* + h) - f(x^*) = \\tfrac12\\,h^\\top H h + o(\\|h\\|^2) \\ge \\tfrac12\\mu\\|h\\|^2 + o(\\|h\\|^2).$$ Найдётся $\\varepsilon > 0$, при котором шар $\\|h\\| < \\varepsilon$ вокруг $x^*$ лежит в $\\Omega$ и $|o(\\|h\\|^2)| < \\tfrac14\\mu\\|h\\|^2$ для $0 < \\|h\\| < \\varepsilon$. Для таких $h$ $$f(x^* + h) - f(x^*) > \\tfrac14\\mu\\|h\\|^2 > 0.$$ Значит, во всех остальных точках этой окрестности значение строго больше: $x^*$ — строгий локальный минимум."
        }
       }
      ]
     },
     {
      "id": "optimality-summary",
      "title": {
       "en": "Summary and procedure",
       "ru": "Сводная таблица и порядок действий"
      },
      "blocks": [
       {
        "type": "table",
        "head": [
         {
          "en": "Order",
          "ru": "Порядок"
         },
         {
          "en": "Necessary",
          "ru": "Необходимое"
         },
         {
          "en": "Sufficient",
          "ru": "Достаточное"
         }
        ],
        "rows": [
         [
          {
           "en": "first order",
           "ru": "первого порядка"
          },
          {
           "en": "$\\nabla f(x^*) = 0$ at an interior point; $s^\\top \\nabla f(x^*) \\ge 0$ for every feasible $s$ at a boundary point",
           "ru": "$\\nabla f(x^*) = 0$ во внутренней точке; $s^\\top \\nabla f(x^*) \\ge 0$ для любого допустимого $s$ в граничной точке"
          },
          {
           "en": "none",
           "ru": "нет"
          }
         ],
         [
          {
           "en": "second order",
           "ru": "второго порядка"
          },
          {
           "en": "$\\nabla f(x^*) = 0$ and $H(x^*) \\succeq 0$ at an interior point",
           "ru": "$\\nabla f(x^*) = 0$ и $H(x^*) \\succeq 0$ во внутренней точке"
          },
          {
           "en": "$\\nabla f(x^*) = 0$ and $H(x^*) \\succ 0$ at an interior point",
           "ru": "$\\nabla f(x^*) = 0$ и $H(x^*) \\succ 0$ во внутренней точке"
          }
         ]
        ]
       },
       {
        "type": "p",
        "text": {
         "en": "There is no sufficient condition of first order. The gradient only measures the slope, and the slope is zero at a minimum, at a maximum and at a saddle alike: $x_1^2 + x_2^2$, $-x_1^2 - x_2^2$ and $x_1^2 - x_2^2$ all have $\\nabla f(0) = 0$. Telling them apart needs information about the curvature.",
         "ru": "Достаточного условия первого порядка нет. Градиент измеряет только наклон, а наклон равен нулю и в минимуме, и в максимуме, и в седле: у $x_1^2 + x_2^2$, $-x_1^2 - x_2^2$ и $x_1^2 - x_2^2$ одинаково $\\nabla f(0) = 0$. Чтобы различить эти случаи, нужна информация о кривизне."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "The procedure",
         "ru": "Порядок действий"
        },
        "text": {
         "en": "First find the candidates, the points where $\\nabla f = 0$, and compute $H$ at each of them. If $H \\succ 0$, the candidate is a strict local minimum; if $H \\prec 0$, a strict local maximum; if $H$ is indefinite, a saddle. If $H$ is singular and semidefinite, the second-order test cannot decide, and $f$ itself has to be analysed near the point. Finally, call a minimum global only with an extra argument: convexity or a bound from below.",
         "ru": "Сначала найдите кандидатов — точки, где $\\nabla f = 0$, — и вычислите гессиан $H$ в каждом из них. Если $H \\succ 0$, кандидат — строгий локальный минимум; если $H \\prec 0$ — строгий локальный максимум; если $H$ знаконеопределённый — седло. Если $H$ вырожденный и полуопределённый, тест второго порядка ничего не решает, и нужно исследовать саму функцию $f$ вблизи точки. Наконец, называйте минимум глобальным только при наличии дополнительного аргумента: выпуклости или оценки снизу."
        }
       }
      ]
     },
     {
      "id": "optimality-gap",
      "title": {
       "en": "The gap between semidefinite and definite",
       "ru": "Зазор между полуопределённостью и определённостью"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "Between the necessary and the sufficient condition of second order there is a gap: $H \\succeq 0$ but not $H \\succ 0$, a semidefinite Hessian with a zero eigenvalue. It may seem that the theory is just weak here and that a sharper test could close the gap. It cannot: no criterion that uses only $\\nabla f$ and $H$ at the point can close it, and the next example proves this.",
         "ru": "Между необходимым и достаточным условиями второго порядка остаётся зазор: $H \\succeq 0$, но не $H \\succ 0$, то есть полуопределённый гессиан с нулевым собственным значением. Может показаться, что теория здесь просто слабовата и более тонкий тест закроет зазор. Это не так: никакой критерий, использующий только $\\nabla f$ и $H$ в точке, его не закроет, и следующий пример это доказывает."
        }
       },
       {
        "type": "note",
        "title": {
         "en": "Same data, different answers",
         "ru": "Одинаковые данные, разные ответы"
        },
        "text": {
         "en": "$f_1 = {{ex.gap.tex.f1}}$ and $f_2 = {{ex.gap.tex.f2}}$ both have $\\nabla f(0) = 0$ and $H(0) = 0$. Yet $f_1$ has a strict global minimum at the origin, while $f_2$ has no extremum there (problems B4 and B3). The data of first and second order are the same and the correct answers differ, so no test that sees only $\\nabla f(0)$ and $H(0)$ can tell the two functions apart.",
         "ru": "У $f_1 = {{ex.gap.tex.f1}}$ и $f_2 = {{ex.gap.tex.f2}}$ одинаково $\\nabla f(0) = 0$ и $H(0) = 0$. Но у $f_1$ в начале координат строгий глобальный минимум, а у $f_2$ экстремума там нет (задачи B4 и B3). Данные первого и второго порядка совпадают, а правильные ответы разные, поэтому никакой тест, который видит только $\\nabla f(0)$ и $H(0)$, не отличит эти функции друг от друга."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "In such a case, return to the definition of a minimum and work with $f$ itself. One of two techniques usually helps:",
         "ru": "В такой ситуации вернитесь к определению минимума и работайте с самой функцией $f$. Обычно помогает один из двух приёмов:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**Bound from below.** $f_1 = {{ex.gap.tex.f1}} \\ge 0 = f_1(0)$, with equality only at the origin, so the origin is a strict global minimum. One line, no derivatives.",
          "ru": "**Оцените функцию снизу.** $f_1 = {{ex.gap.tex.f1}} \\ge 0 = f_1(0)$, и равенство достигается только в начале координат, поэтому там строгий глобальный минимум. Одна строка, никаких производных."
         },
         {
          "en": "**Find a direction of decrease.** Restrict $f_2$ to the line $x_2 = 0$: $f_2(x_1, 0) = x_1^3$ changes sign at $0$. So arbitrarily close to the origin $f_2$ takes both positive and negative values, and the origin is not an extremum.",
          "ru": "**Найдите направление спуска.** Сузьте $f_2$ на прямую $x_2 = 0$: $f_2(x_1, 0) = x_1^3$ меняет знак в нуле. Значит, сколь угодно близко к началу координат $f_2$ принимает и положительные, и отрицательные значения, и экстремума там нет."
         }
        ]
       },
       {
        "type": "figure",
        "src": "figures/fig_monkey.svg",
        "alt": {
         "en": "Left, a square divided into six alternating blue and red sectors by three lines through the origin; right, rounded-square contours around a minimum.",
         "ru": "Слева квадрат, разделённый тремя прямыми через начало координат на шесть чередующихся синих и красных секторов; справа линии уровня в форме скруглённых квадратов вокруг минимума."
        },
        "caption": {
         "en": "Left: the sign of $f_2 = {{ex.gap.tex.f2}}$ around the origin, {{ex.monkey.nSectors}} sectors of ${{ex.monkey.sectorDeg}}^\\circ$ where $f_2 > 0$ (blue) and $f_2 < 0$ (red) alternate. Right: $f_1 = {{ex.gap.tex.f1}}$ is positive everywhere except the origin. Both functions have $\\nabla f(0) = 0$ and $H(0) = 0$.",
         "ru": "Слева: знак $f_2 = {{ex.gap.tex.f2}}$ вокруг начала координат; чередуются {{ex.monkey.nSectors}} секторов по ${{ex.monkey.sectorDeg}}^\\circ$, где $f_2 > 0$ (синие) и $f_2 < 0$ (красные). Справа: $f_1 = {{ex.gap.tex.f1}}$ положительна всюду, кроме начала координат. У обеих функций $\\nabla f(0) = 0$ и $H(0) = 0$."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "Let $g(x_1, x_2) = x_1^2$ on $\\mathbb R^2$. Find its stationary points and its Hessian. What does the theory say about these points?",
         "ru": "Пусть $g(x_1, x_2) = x_1^2$ на $\\mathbb R^2$. Найдите стационарные точки и гессиан. Что говорит об этих точках теория?"
        },
        "answer": {
         "en": "$\\nabla g = {{ex.flat.tex.grad}}$ vanishes on the whole line $x_1 = 0$, and $H = {{ex.flat.H}} \\succeq 0$ but not $\\succ 0$, so the sufficient condition does not apply. Still, $g \\ge 0$ and $g = 0$ on the line, so every point of the line is a non-strict global minimum: the flat bottom of a trough.",
         "ru": "$\\nabla g = {{ex.flat.tex.grad}}$ обращается в нуль на всей прямой $x_1 = 0$, а $H = {{ex.flat.H}} \\succeq 0$, но не $\\succ 0$, поэтому достаточное условие неприменимо. Однако $g \\ge 0$ и $g = 0$ на этой прямой, так что каждая её точка — нестрогий глобальный минимум: плоское дно жёлоба."
        }
       }
      ]
     },
     {
      "id": "optimality-monkey-saddle",
      "title": {
       "en": "Why the monkey saddle has six sectors",
       "ru": "Почему у обезьяньего седла шесть секторов"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The graph of $f_2 = {{ex.gap.tex.f2}}$ is the monkey saddle, and its picture can be explained completely. In polar coordinates $x_1 = r\\cos\\varphi$, $x_2 = r\\sin\\varphi$ the function becomes $f_2 = {{ex.monkey.tex.step1}}$. Replacing $\\sin^2\\varphi$ by $1 - \\cos^2\\varphi$ and using the triple-angle identity ${{ex.monkey.tex.identity}}$ gives $$f_2 = {{ex.monkey.tex.step2}} = {{ex.monkey.tex.step3}} = {{ex.monkey.tex.polar}}.$$ The factor $r^3$ is positive for $r > 0$, so the sign of $f_2$ depends only on the angle $\\varphi$: going once around the circle, the cosine factor changes sign {{ex.monkey.nSectors}} times. This gives {{ex.monkey.nSectors}} sectors of ${{ex.monkey.sectorDeg}}^\\circ$, {{ex.monkey.nUp}} going up and {{ex.monkey.nDown}} going down.",
         "ru": "График $f_2 = {{ex.gap.tex.f2}}$ — это «обезьянье седло», и его картинку можно объяснить до конца. В полярных координатах $x_1 = r\\cos\\varphi$, $x_2 = r\\sin\\varphi$ функция принимает вид $f_2 = {{ex.monkey.tex.step1}}$. Замена $\\sin^2\\varphi$ на $1 - \\cos^2\\varphi$ и формула косинуса тройного угла ${{ex.monkey.tex.identity}}$ дают $$f_2 = {{ex.monkey.tex.step2}} = {{ex.monkey.tex.step3}} = {{ex.monkey.tex.polar}}.$$ Множитель $r^3$ положителен при $r > 0$, поэтому знак $f_2$ зависит только от угла $\\varphi$: при обходе окружности косинус в этой записи меняет знак {{ex.monkey.nSectors}} раз. Получается {{ex.monkey.nSectors}} секторов по ${{ex.monkey.sectorDeg}}^\\circ$: в {{ex.monkey.nUp}} из них функция поднимается, в {{ex.monkey.nDown}} опускается."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "An ordinary saddle has two descending sectors, one for each leg of a rider. This one has three: room for the two legs and the tail of a sitting monkey, hence the name.",
         "ru": "У обычного седла два сектора спуска, по одному для каждой ноги всадника. У этого их три: место для двух ног и хвоста сидящей обезьяны, отсюда и название."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "How many sign sectors does $f = {{ex.octo.tex.f}}$ have around the origin, and what does the second-order test say there?",
         "ru": "Сколько секторов знака у $f = {{ex.octo.tex.f}}$ вокруг начала координат и что говорит там тест второго порядка?"
        },
        "answer": {
         "en": "In polar coordinates $f = {{ex.octo.tex.polar}}$, so the sign changes {{ex.octo.nSectors}} times around the circle: {{ex.octo.nSectors}} sectors. The origin is the only stationary point and $H(0) = 0$, so the test gives no verdict; the sign changes show that the origin is not an extremum.",
         "ru": "В полярных координатах $f = {{ex.octo.tex.polar}}$, поэтому при обходе окружности знак меняется {{ex.octo.nSectors}} раз: получается {{ex.octo.nSectors}} секторов. Начало координат — единственная стационарная точка, и $H(0) = 0$, поэтому тест ничего не решает; смены знака показывают, что экстремума в начале координат нет."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "convexity",
    "title": {
     "en": "Convexity",
     "ru": "Выпуклость"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Convexity is the one widely available property that turns local statements into global ones, which is why both theory and machine learning hold on to it.",
       "ru": "Выпуклость — единственное широко распространённое свойство, которое превращает локальные утверждения в глобальные, поэтому за неё так держатся и теория, и машинное обучение."
      }
     }
    ],
    "subsections": [
     {
      "id": "convexity-sets",
      "title": {
       "en": "Convex sets",
       "ru": "Выпуклые множества"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Convex set",
         "ru": "выпуклое множество"
        },
        "text": {
         "en": "A set $\\Omega$ is **convex** if together with any two of its points it contains the whole segment between them: $\\lambda x + (1 - \\lambda) y \\in \\Omega$ for all $x, y \\in \\Omega$ and $\\lambda \\in [0, 1]$.",
         "ru": "Множество $\\Omega$ **выпукло**, если вместе с любыми двумя своими точками оно содержит весь отрезок между ними: $\\lambda x + (1 - \\lambda) y \\in \\Omega$ для всех $x, y \\in \\Omega$ и $\\lambda \\in [0, 1]$."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The point $\\lambda x + (1 - \\lambda) y$ runs over the segment from $y$ ($\\lambda = 0$) to $x$ ($\\lambda = 1$); $\\lambda = \\tfrac12$ gives the midpoint. A proof of convexity must show that the segment stays inside for every pair of points; to disprove convexity, one pair whose segment leaves the set is enough, as for the ring in the figure.",
         "ru": "Точка $\\lambda x + (1 - \\lambda) y$ пробегает отрезок от $y$ (при $\\lambda = 0$) до $x$ (при $\\lambda = 1$); при $\\lambda = \\tfrac12$ получается его середина. Чтобы доказать выпуклость множества, нужно убедиться, что отрезок остаётся внутри для любой пары точек; чтобы её опровергнуть, достаточно одной пары точек, отрезок между которыми выходит из множества, как у кольца на рисунке."
        }
       },
       {
        "type": "figure",
        "src": "figures/fig_convexity.svg",
        "alt": {
         "en": "A disk with a segment inside, a ring with a segment crossing the hole, a parabola with a chord above it and a double well with a chord below it.",
         "ru": "Круг с отрезком внутри, кольцо с отрезком, который пересекает дыру, парабола с хордой над ней и двойная яма с хордой под ней."
        },
        "caption": {
         "en": "From left to right: the disk $\\|x\\| \\le {{ex.disk.r}}$ is convex (problem C1); the ring ${{ex.ring.r.1}} \\le \\|x\\| \\le {{ex.ring.r.2}}$ is not, because the red part of the segment crosses the hole; $x^2$ is a convex function, its chord lies above the graph; $(x^2 - 1)^2$ is not convex, the chord between its two minima lies below the graph.",
         "ru": "Слева направо: круг $\\|x\\| \\le {{ex.disk.r}}$ выпукл (задача C1); кольцо ${{ex.ring.r.1}} \\le \\|x\\| \\le {{ex.ring.r.2}}$ не выпукло: красная часть отрезка проходит через дыру; $x^2$ — выпуклая функция, её хорда лежит выше графика; $(x^2 - 1)^2$ не выпукла: хорда между двумя её минимумами лежит ниже графика."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "Every ball $\\{x:\\ \\|x - c\\| \\le r\\}$ in every norm is convex, including the $\\ell_1$ diamond and the $\\ell_\\infty$ square, which have corners. The proof in problem C1 uses only the triangle inequality and homogeneity of the norm: convexity is not smoothness.",
         "ru": "Любой шар $\\{x:\\ \\|x - c\\| \\le r\\}$ в любой норме выпукл, в том числе «ромб» $\\ell_1$ и «квадрат» $\\ell_\\infty$, у которых есть углы. Доказательство в задаче C1 использует только неравенство треугольника и однородность нормы: выпуклость — это не гладкость."
        }
       }
      ]
     },
     {
      "id": "convexity-functions",
      "title": {
       "en": "Convex functions",
       "ru": "Выпуклые функции"
      },
      "blocks": [
       {
        "type": "definition",
        "title": {
         "en": "Convex function",
         "ru": "выпуклая функция"
        },
        "text": {
         "en": "A function $f$ on a convex set $\\Omega$ is **convex** if $$f\\big(\\lambda x + (1 - \\lambda) y\\big) \\le \\lambda f(x) + (1 - \\lambda) f(y)$$ for all $x, y \\in \\Omega$ and $\\lambda \\in [0, 1]$. It is **strictly convex** if the inequality is strict whenever $x \\ne y$ and $0 < \\lambda < 1$.",
         "ru": "Функция $f$ на выпуклом множестве $\\Omega$ **выпукла**, если $$f\\big(\\lambda x + (1 - \\lambda) y\\big) \\le \\lambda f(x) + (1 - \\lambda) f(y)$$ для всех $x, y \\in \\Omega$ и $\\lambda \\in [0, 1]$. Она **строго выпукла**, если при $x \\ne y$ и $0 < \\lambda < 1$ неравенство строгое."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The left side is the value of the function at a point of the segment, the right side is the value on the chord that joins the endpoints of the graph: the graph never rises above a chord. In particular, $f$ is convex along every line: for fixed $x$ and $s$ the function of one variable $t \\mapsto f(x + ts)$ is convex where it is defined, so a single line along which this function is not convex shows that $f$ is not convex.",
         "ru": "Слева стоит значение функции в точке отрезка, справа — значение на хорде, которая соединяет концы графика: график нигде не поднимается выше хорды. В частности, выпуклая функция выпукла вдоль любой прямой: при фиксированных $x$ и $s$ функция одной переменной $t \\mapsto f(x + ts)$ выпукла там, где она определена, поэтому одной прямой, вдоль которой это не так, достаточно, чтобы доказать, что $f$ не выпукла."
        }
       },
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "Second-order criterion",
         "ru": "критерий второго порядка"
        },
        "text": {
         "en": "Let $f \\in C^2$ on an open convex set $\\Omega$. Then $f$ is convex $\\iff H(x) \\succeq 0$ for all $x \\in \\Omega$. If $H(x) \\succ 0$ for all $x \\in \\Omega$, then $f$ is strictly convex.",
         "ru": "Пусть $f \\in C^2$ на открытом выпуклом множестве $\\Omega$. Тогда $f$ выпукла $\\iff H(x) \\succeq 0$ для всех $x \\in \\Omega$. Если $H(x) \\succ 0$ для всех $x \\in \\Omega$, то $f$ строго выпукла."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The converse of the last part fails: $f(x) = x^4$ is strictly convex, yet $f''(0) = 0$. It is the same gap between $\\succeq$ and $\\succ$ as in the optimality conditions.",
         "ru": "Обратное к последнему утверждению неверно: $f(x) = x^4$ строго выпукла, хотя $f''(0) = 0$. Это тот же зазор между $\\succeq$ и $\\succ$, что и в условиях оптимальности."
        }
       },
       {
        "type": "selfcheck",
        "question": {
         "en": "Is $f = x_1^2 + x_2^2 + a\\,x_1x_2$ convex for $a = {{ex.family.a}}$?",
         "ru": "Выпукла ли функция $f = x_1^2 + x_2^2 + a\\,x_1x_2$ при $a = {{ex.family.a}}$?"
        },
        "answer": {
         "en": "No. The Hessian $H = {{ex.family.H}}$ has the eigenvalues $2 \\pm a$, that is ${{ex.family.eig}}$; one of them is negative, so $f$ is not convex. It is convex exactly for $|a| \\le {{ex.family.bound}}$ (problem C2).",
         "ru": "Нет. Гессиан $H = {{ex.family.H}}$ имеет собственные значения $2 \\pm a$, то есть ${{ex.family.eig}}$; одно из них отрицательно, поэтому $f$ не выпукла. Выпукла она ровно при $|a| \\le {{ex.family.bound}}$ (задача C2)."
        }
       }
      ]
     },
     {
      "id": "convexity-local-global",
      "title": {
       "en": "Every local minimum is global",
       "ru": "Всякий локальный минимум глобален"
      },
      "blocks": [
       {
        "type": "theorem",
        "kind": "theorem",
        "title": {
         "en": "Local minimum of a convex function",
         "ru": "локальный минимум выпуклой функции"
        },
        "text": {
         "en": "If $f$ is convex on a convex set $\\Omega$ and $x^*$ is a local minimum, then $x^*$ is a global minimum.",
         "ru": "Пусть $f$ выпукла на выпуклом множестве $\\Omega$ и $x^*$ — локальный минимум. Тогда $x^*$ — глобальный минимум."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "A better point far away would pull the whole chord, and with it the graph, below $f(x^*)$, so points arbitrarily close to $x^*$ would be better too.",
         "ru": "Если где-то далеко есть точка лучше, то хорда до неё, а вместе с хордой и график, уходит ниже $f(x^*)$, и лучше оказываются точки сколь угодно близко к $x^*$."
        }
       },
       {
        "type": "proof",
        "text": {
         "en": "Suppose $f(y) < f(x^*)$ for some $y \\in \\Omega$ and put $z_\\lambda = \\lambda y + (1 - \\lambda)x^*$, which lies in $\\Omega$ because $\\Omega$ is convex. Convexity of $f$ gives $f(z_\\lambda) \\le \\lambda f(y) + (1 - \\lambda) f(x^*)$, that is $f(z_\\lambda) \\le f(x^*) - \\lambda\\big(f(x^*) - f(y)\\big) < f(x^*)$ for $\\lambda \\in (0, 1]$, while $\\|z_\\lambda - x^*\\| = \\lambda\\|y - x^*\\| \\to 0$ as $\\lambda \\to 0$. So arbitrarily close to $x^*$ there are points with a smaller value: a contradiction with local minimality.",
         "ru": "Пусть $f(y) < f(x^*)$ для некоторого $y \\in \\Omega$, и пусть $z_\\lambda = \\lambda y + (1 - \\lambda)x^*$; эта точка лежит в $\\Omega$, потому что $\\Omega$ выпукло. Выпуклость $f$ даёт $f(z_\\lambda) \\le \\lambda f(y) + (1 - \\lambda) f(x^*)$, то есть $f(z_\\lambda) \\le f(x^*) - \\lambda\\big(f(x^*) - f(y)\\big) < f(x^*)$ при $\\lambda \\in (0, 1]$, а $\\|z_\\lambda - x^*\\| = \\lambda\\|y - x^*\\| \\to 0$ при $\\lambda \\to 0$. Значит, сколь угодно близко к $x^*$ есть точки с меньшим значением — противоречие с локальной минимальностью."
        }
       },
       {
        "type": "theorem",
        "kind": "corollary",
        "text": {
         "en": "For a convex $f \\in C^1$ on $\\mathbb R^n$, the equality $\\nabla f(x^*) = 0$ is not only necessary but also sufficient for a global minimum.",
         "ru": "Для выпуклой $f \\in C^1$ на $\\mathbb R^n$ равенство $\\nabla f(x^*) = 0$ не только необходимо, но и достаточно для глобального минимума."
        }
       },
       {
        "type": "proof",
        "text": {
         "en": "Let $\\nabla f(x^*) = 0$ and suppose $f(y) < f(x^*)$ for some $y$. Put $s = y - x^*$ and $\\varphi(\\lambda) = f(x^* + \\lambda s)$. By convexity $\\varphi(\\lambda) \\le (1 - \\lambda)\\varphi(0) + \\lambda\\varphi(1)$, so $\\frac{\\varphi(\\lambda) - \\varphi(0)}{\\lambda} \\le \\varphi(1) - \\varphi(0) < 0$ for all $\\lambda \\in (0, 1]$. Letting $\\lambda \\to 0^+$ gives $s^\\top \\nabla f(x^*) \\le f(y) - f(x^*) < 0$, which contradicts $\\nabla f(x^*) = 0$.",
         "ru": "Пусть $\\nabla f(x^*) = 0$, но $f(y) < f(x^*)$ для некоторого $y$. Возьмите $s = y - x^*$ и $\\varphi(\\lambda) = f(x^* + \\lambda s)$. По выпуклости $\\varphi(\\lambda) \\le (1 - \\lambda)\\varphi(0) + \\lambda\\varphi(1)$, поэтому $\\frac{\\varphi(\\lambda) - \\varphi(0)}{\\lambda} \\le \\varphi(1) - \\varphi(0) < 0$ для всех $\\lambda \\in (0, 1]$. Переход к пределу при $\\lambda \\to 0^+$ даёт $s^\\top \\nabla f(x^*) \\le f(y) - f(x^*) < 0$, что противоречит равенству $\\nabla f(x^*) = 0$."
        }
       }
      ]
     },
     {
      "id": "convexity-ml",
      "title": {
       "en": "Why this matters in machine learning",
       "ru": "Почему это важно в машинном обучении"
      },
      "blocks": [
       {
        "type": "p",
        "text": {
         "en": "The empirical risk with a regularization term, $L(w) = \\frac1m \\sum_i \\ell(y_i,\\ w^\\top a_i) + \\rho\\|w\\|^2$ with $\\rho \\ge 0$, is convex whenever the loss $\\ell$ is convex in its second argument: a composition with the affine map $w \\mapsto w^\\top a_i$ and a nonnegative sum keep convexity. The squared loss, the logistic loss and the Huber loss are convex, so for linear models every point with zero gradient is a global minimizer. A neural network loses this property already with one hidden layer, which is why people speak about its loss landscape.",
         "ru": "Эмпирический риск с регуляризационным слагаемым $L(w) = \\frac1m \\sum_i \\ell(y_i,\\ w^\\top a_i) + \\rho\\|w\\|^2$, где $\\rho \\ge 0$, выпуклый всякий раз, когда функция потерь $\\ell$ выпукла по второму аргументу: композиция с аффинным отображением $w \\mapsto w^\\top a_i$ и неотрицательная сумма сохраняют выпуклость. Квадратичная и логистическая функции потерь и функция потерь Хьюбера выпуклы, поэтому у линейных моделей любая точка с нулевым градиентом — точка глобального минимума. Нейронная сеть теряет это свойство уже с одним скрытым слоем, поэтому для неё и говорят о ландшафте функции потерь."
        }
       },
       {
        "type": "example",
        "text": {
         "en": "The line fit from the section on optimization problems: $L(w) = \\frac1m\\|Xw - y\\|^2$ with $m = {{ex.fit.n}}$ and $X = {{ex.fit.X}}$. Then $\\nabla L(w) = \\frac2m X^\\top(Xw - y)$ and $H_L = \\frac2m X^\\top X = {{ex.fit.tex.H}}$, the same at every $w$. Its entry $H_{11}$ is positive and $\\det H_L = {{ex.fit.tex.detH}} > 0$, so $H_L \\succ 0$ and $L$ is strictly convex. The condition $\\nabla L = 0$ is the **normal equation** $X^\\top X w = X^\\top y$, here ${{ex.fit.XtX}}\\, w = {{ex.fit.Xty}}$, and its solution $w^* = {{ex.fit.tex.w}}$ is the unique global minimizer, $L(w^*) = {{ex.fit.tex.Lmin}}$. With collinear features $X^\\top X$ is singular, $H_L$ is only semidefinite and the minimizer is no longer unique; the regularization term $\\rho\\|w\\|^2$ adds $2\\rho I$ to $H_L$.",
         "ru": "Прямая по точкам из раздела о задачах оптимизации: $L(w) = \\frac1m\\|Xw - y\\|^2$, где $m = {{ex.fit.n}}$ и $X = {{ex.fit.X}}$. Тогда $\\nabla L(w) = \\frac2m X^\\top(Xw - y)$ и $H_L = \\frac2m X^\\top X = {{ex.fit.tex.H}}$ — одна и та же матрица при любом $w$. Её элемент $H_{11}$ положителен и $\\det H_L = {{ex.fit.tex.detH}} > 0$, поэтому $H_L \\succ 0$ и $L$ строго выпукла. Условие $\\nabla L = 0$ — это **нормальное уравнение** $X^\\top X w = X^\\top y$, здесь ${{ex.fit.XtX}}\\, w = {{ex.fit.Xty}}$, и его решение $w^* = {{ex.fit.tex.w}}$ — единственная точка глобального минимума, $L(w^*) = {{ex.fit.tex.Lmin}}$. При коллинеарных признаках матрица $X^\\top X$ вырождена, $H_L$ лишь полуопределён и точка минимума перестаёт быть единственной; регуляризационное слагаемое $\\rho\\|w\\|^2$ добавляет к $H_L$ матрицу $2\\rho I$."
        }
       },
       {
        "type": "intuition",
        "text": {
         "en": "For a convex loss, a method that drives the gradient to zero has found the answer; for a nonconvex loss it has found a candidate.",
         "ru": "Для выпуклой функции потерь метод, который довёл градиент до нуля, нашёл ответ; для невыпуклой — лишь кандидата."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "numerics",
    "title": {
     "en": "From the board to the keyboard",
     "ru": "От доски к клавиатуре"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Every statement of the seminar has a short numerical counterpart. Two functions are enough: an independent check of a gradient formula and a second-order test with a tolerance; they are the starting point of home practice H4. The notebook of this seminar checks every number of this handout by two independent computations.",
       "ru": "У каждого утверждения семинара есть короткий численный двойник. Хватает двух функций: независимой проверки формулы градиента и теста второго порядка с допуском; с них начинается домашняя практика H4. Ноутбук этого семинара проверяет каждое число конспекта двумя независимыми вычислениями."
      }
     }
    ],
    "subsections": [
     {
      "id": "numerics-gradient",
      "title": {
       "en": "Checking a gradient: central differences",
       "ru": "Проверка градиента: центральные разности"
      },
      "blocks": [
       {
        "type": "code",
        "key": "centralDiff"
       },
       {
        "type": "p",
        "text": {
         "en": "`central_diff` approximates each partial derivative by a central difference, $$\\frac{\\partial f}{\\partial x_j}(x) \\approx \\frac{f(x + he_j) - f(x - he_j)}{2h},$$ with an error of order $h^2$; here $e_j$ is the $j$-th coordinate vector.",
         "ru": "Функция `central_diff` приближает каждую частную производную центральной разностью $$\\frac{\\partial f}{\\partial x_j}(x) \\approx \\frac{f(x + he_j) - f(x - he_j)}{2h},$$ ошибка которой имеет порядок $h^2$; здесь $e_j$ — $j$-й координатный вектор."
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**The check must be independent**: if the difference reuses parts of the analytic gradient, it checks itself.",
          "ru": "**Проверка должна быть независимой**: если разность повторно использует части аналитического градиента, она проверяет саму себя."
         },
         {
          "en": "**The step has an optimum**: the truncation error $\\sim h^2$ competes with the rounding error $\\sim \\varepsilon_{\\text{mach}}/h$, so the best step is $h \\sim \\varepsilon_{\\text{mach}}^{1/3} \\approx {{ex.fd.tex.hOpt}}$ with $\\varepsilon_{\\text{mach}} \\approx {{ex.fd.tex.eps}}$, hence the default $h = {{ex.fd.tex.h}}$.",
          "ru": "**У шага есть оптимум**: ошибка аппроксимации $\\sim h^2$ конкурирует с ошибкой округления $\\sim \\varepsilon_{\\text{маш}}/h$, поэтому лучший шаг $h \\sim \\varepsilon_{\\text{маш}}^{1/3} \\approx {{ex.fd.tex.hOpt}}$ при $\\varepsilon_{\\text{маш}} \\approx {{ex.fd.tex.eps}}$; отсюда значение по умолчанию $h = {{ex.fd.tex.h}}$."
         },
         {
          "en": "**Symmetrize** a numerical Hessian before `eigvalsh`, which reads only one triangle of the matrix.",
          "ru": "**Симметризуйте** численный гессиан перед вызовом `eigvalsh`: эта функция читает только один треугольник матрицы."
         }
        ]
       },
       {
        "type": "example",
        "text": {
         "en": "For the lecture function at ${{ex.lecture.point}}$, `central_diff` returns ${{ex.fd.gradLecture}}$ up to an error below ${{ex.fd.tex.tol}}$, in agreement with the formula for $\\nabla f$.",
         "ru": "Для функции из лекции в точке ${{ex.lecture.point}}$ функция `central_diff` возвращает ${{ex.fd.gradLecture}}$ с ошибкой меньше ${{ex.fd.tex.tol}}$, что согласуется с формулой для $\\nabla f$."
        }
       }
      ]
     },
     {
      "id": "numerics-classify",
      "title": {
       "en": "Classifying a Hessian with a tolerance",
       "ru": "Классификация гессиана с допуском"
      },
      "blocks": [
       {
        "type": "code",
        "key": "classify"
       },
       {
        "type": "p",
        "text": {
         "en": "`classify` reads the signs of the eigenvalues of the symmetrized matrix with a tolerance relative to the largest absolute eigenvalue, so rescaling the matrix does not change the answer. A matrix that is zero up to rounding has no scale: build Hessians exactly, by hand or with sympy, before calling it; a finite-difference Hessian of $f_1 = {{ex.gap.tex.f1}}$ at the origin is classified as `\"min\"`.",
         "ru": "`classify` определяет знаки собственных значений симметризованной матрицы с допуском относительно наибольшего по модулю собственного значения, поэтому умножение матрицы на положительное число не меняет ответ. У матрицы, которая равна нулю с точностью до округления, масштаба нет: стройте гессианы точно, вручную или с помощью sympy, и только потом вызывайте функцию; гессиан функции $f_1 = {{ex.gap.tex.f1}}$ в начале координат, найденный конечными разностями, классифицируется как `\"min\"`."
        }
       },
       {
        "type": "table",
        "head": [
         {
          "en": "Matrix",
          "ru": "Матрица"
         },
         {
          "en": "Where it comes from",
          "ru": "Откуда она"
         },
         {
          "en": "Output",
          "ru": "Ответ"
         }
        ],
        "rows": [
         [
          {
           "en": "${{ex.classify.bowl.H}}$",
           "ru": "${{ex.classify.bowl.H}}$"
          },
          {
           "en": "problem B1 at the origin",
           "ru": "задача B1, начало координат"
          },
          {
           "en": "`\"min\"`",
           "ru": "`\"min\"` (минимум)"
          }
         ],
         [
          {
           "en": "${{ex.classify.saddle.H}}$",
           "ru": "${{ex.classify.saddle.H}}$"
          },
          {
           "en": "problem B2 at the origin",
           "ru": "задача B2, начало координат"
          },
          {
           "en": "`\"saddle\"`",
           "ru": "`\"saddle\"` (седло)"
          }
         ],
         [
          {
           "en": "${{ex.classify.zero.H}}$",
           "ru": "${{ex.classify.zero.H}}$"
          },
          {
           "en": "problems B3 and B4 at the origin",
           "ru": "задачи B3 и B4, начало координат"
          },
          {
           "en": "`\"inconclusive\"`",
           "ru": "`\"inconclusive\"` (тест молчит)"
          }
         ],
         [
          {
           "en": "${{ex.classify.halfSaddle.H}}$",
           "ru": "${{ex.classify.halfSaddle.H}}$"
          },
          {
           "en": "home practice H1 at the origin",
           "ru": "домашняя практика H1, начало координат"
          },
          {
           "en": "`\"inconclusive\"`",
           "ru": "`\"inconclusive\"` (тест молчит)"
          }
         ],
         [
          {
           "en": "${{ex.classify.nsd.H}}$",
           "ru": "${{ex.classify.nsd.H}}$"
          },
          {
           "en": "the Sylvester trap",
           "ru": "ловушка Сильвестра"
          },
          {
           "en": "`\"inconclusive\"`",
           "ru": "`\"inconclusive\"` (тест молчит)"
          }
         ],
         [
          {
           "en": "${{ex.classify.notStationary.H}}$",
           "ru": "${{ex.classify.notStationary.H}}$"
          },
          {
           "en": "problem A2 at ${{ex.classify.notStationary.point}}$",
           "ru": "задача A2, точка ${{ex.classify.notStationary.point}}$"
          },
          {
           "en": "`\"min\"`",
           "ru": "`\"min\"` (минимум)"
          }
         ]
        ]
       },
       {
        "type": "trap",
        "text": {
         "en": "`classify` looks at a matrix, not at a point. For the function of problem A2 at ${{ex.classify.notStationary.point}}$ it returns `\"min\"`, because $H = {{ex.classify.notStationary.H}} \\succ 0$, yet $\\nabla f = {{ex.classify.notStationary.grad}} \\ne 0$: the point is not even stationary. Check the gradient first.",
         "ru": "`classify` смотрит на матрицу, а не на точку. Для функции из задачи A2 в точке ${{ex.classify.notStationary.point}}$ она возвращает `\"min\"`, потому что $H = {{ex.classify.notStationary.H}} \\succ 0$, хотя $\\nabla f = {{ex.classify.notStationary.grad}} \\ne 0$: точка даже не стационарна. Сначала проверяйте градиент."
        }
       },
       {
        "type": "trap",
        "text": {
         "en": "Do not write the saddle test as the chained comparison `w.min() < -tol < w.max()`. It means `w.min() < -tol and -tol < w.max()`, which is also true when the largest eigenvalue is $0$: the matrix $\\operatorname{diag}(0, -1)$, which is negative semidefinite, would be called a saddle. A saddle needs `w.min() < -tol and w.max() > tol`.",
         "ru": "Не записывайте проверку седла цепочкой сравнений `w.min() < -tol < w.max()`. Она означает `w.min() < -tol and -tol < w.max()`, а это верно и тогда, когда наибольшее собственное значение равно $0$: отрицательно полуопределённую матрицу $\\operatorname{diag}(0, -1)$ такая проверка назвала бы седлом. Для седла нужно `w.min() < -tol and w.max() > tol`."
        }
       },
       {
        "type": "p",
        "text": {
         "en": "The two `\"inconclusive\"` answers for B3 and B4 are not a weakness of the code: from $\\nabla f$ and $H$ alone the mathematics cannot decide (see the subsection on the gap between semidefinite and definite).",
         "ru": "Два ответа `\"inconclusive\"` для B3 и B4 — не слабость кода: по одним лишь $\\nabla f$ и $H$ математика решить не может (подробнее — в подразделе о зазоре между полуопределённостью и определённостью)."
        }
       }
      ]
     }
    ]
   },
   {
    "id": "faq",
    "title": {
     "en": "Questions students ask",
     "ru": "Вопросы, которые задают студенты"
    },
    "blocks": [
     {
      "type": "faq",
      "question": {
       "en": "Why do we need necessary conditions if they prove nothing?",
       "ru": "Зачем нужны необходимые условия, если они ничего не доказывают?"
      },
      "answer": {
       "en": "They turn an infinite search into a finite one: instead of checking every feasible point, solve $\\nabla f = 0$ and check the candidates. A point that violates a necessary condition is ruled out at once. Numerical methods follow the same idea: every gradient-based method of the first part of the course drives $\\nabla f$ towards zero.",
       "ru": "Они превращают бесконечный поиск в конечный: вместо того чтобы перебирать все допустимые точки, решите систему $\\nabla f = 0$ и проверьте найденных кандидатов. Точка, которая нарушает необходимое условие, отбрасывается сразу. Численные методы следуют той же идее: любой градиентный метод первой части курса ведёт $\\nabla f$ к нулю."
      }
     },
     {
      "type": "faq",
      "question": {
       "en": "Why not just look at the graph?",
       "ru": "Почему бы просто не посмотреть на график?"
      },
      "answer": {
       "en": "For $n \\le 2$ you can, and the pictures of this handout do. For a linear model with {{ex.ml.nWeights}} weights or a network with about ${{ex.ml.tex.nNet}}$ parameters there is no graph to look at, while the formulas work in any dimension. Even in the plane a picture can mislead: without level values a pit and a hill look the same. A picture gives intuition; a proof is a bound or a restriction to a line.",
       "ru": "При $n \\le 2$ можно, и рисунки этого конспекта так и делают. У линейной модели с {{ex.ml.nWeights}} весами или у нейронной сети, где параметров около ${{ex.ml.tex.nNet}}$, графика уже не увидеть, а формулы работают в любой размерности. Даже на плоскости картинка может обмануть: без подписанных уровней яма и холм выглядят одинаково. Картинка даёт интуицию, а доказательство — это оценка или сужение на прямую."
      }
     },
     {
      "type": "faq",
      "question": {
       "en": "Is the Hessian always symmetric?",
       "ru": "Гессиан всегда симметричен?"
      },
      "answer": {
       "en": "For the functions of this course, yes: by Schwarz's theorem the mixed second derivatives are equal when they are continuous, and counterexamples need discontinuous second derivatives. In code, symmetrize anyway: in a numerical Hessian the entries $H_{ij}$ and $H_{ji}$ differ in the last digits, and `eigvalsh` reads only one triangle.",
       "ru": "Для функций этого курса да: по теореме Шварца смешанные вторые производные равны, если они непрерывны, а контрпримеры требуют разрывных вторых производных. В коде всё равно симметризуйте матрицу: у численного гессиана элементы $H_{ij}$ и $H_{ji}$ расходятся в последних знаках, а `eigvalsh` читает только один треугольник."
      }
     },
     {
      "type": "faq",
      "question": {
       "en": "What does $o(\\alpha)$ mean, and can we do without it?",
       "ru": "Что значит $o(\\alpha)$ и можно ли обойтись без него?"
      },
      "answer": {
       "en": "It is the precise way to say “an error negligible for small $\\alpha$”, precise enough to prove theorems with: $g(\\alpha) = o(\\alpha)$ means $g(\\alpha)/\\alpha \\to 0$ as $\\alpha \\to 0$. For example, $f(x + h) = f(x) + \\nabla f(x)^\\top h + o(\\|h\\|)$ states that the error of the linear approximation vanishes faster than $\\|h\\|$. Without it every statement would be approximate.",
       "ru": "«О малое» — точный способ сказать «ошибка, которой можно пренебречь при малых $\\alpha$», и достаточно точный, чтобы выводить из него теоремы: $g(\\alpha) = o(\\alpha)$ означает, что $g(\\alpha)/\\alpha \\to 0$ при $\\alpha \\to 0$. Например, запись $f(x + h) = f(x) + \\nabla f(x)^\\top h + o(\\|h\\|)$ говорит, что ошибка линейного приближения стремится к нулю быстрее, чем $\\|h\\|$. Без него все утверждения были бы приближёнными."
      }
     }
    ]
   },
   {
    "id": "problems",
    "title": {
     "en": "Seminar problems",
     "ru": "Задачи семинара"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "All eleven problems with complete solutions, grouped by the four blocks of the seminar. In each block the first problem is worked through in class and the others are for solving on your own.",
       "ru": "Все одиннадцать задач с полными решениями, по четырём блокам семинара. В каждом блоке первая задача разбирается на занятии, остальные — для самостоятельного решения."
      }
     }
    ],
    "subsections": [
     {
      "id": "problems-a",
      "title": {
       "en": "A. Gradients and Hessians",
       "ru": "A. Градиенты и гессианы"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "A1"
       },
       {
        "type": "problem",
        "id": "A2"
       },
       {
        "type": "problem",
        "id": "A3"
       }
      ]
     },
     {
      "id": "problems-b",
      "title": {
       "en": "B. Classifying stationary points",
       "ru": "B. Классификация стационарных точек"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "B1"
       },
       {
        "type": "problem",
        "id": "B2"
       },
       {
        "type": "problem",
        "id": "B3"
       },
       {
        "type": "problem",
        "id": "B4"
       }
      ]
     },
     {
      "id": "problems-c",
      "title": {
       "en": "C. Convexity",
       "ru": "C. Выпуклость"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "C1"
       },
       {
        "type": "problem",
        "id": "C2"
       }
      ]
     },
     {
      "id": "problems-d",
      "title": {
       "en": "D. Feasible directions",
       "ru": "D. Допустимые направления"
      },
      "blocks": [
       {
        "type": "problem",
        "id": "D1"
       },
       {
        "type": "problem",
        "id": "D2"
       }
      ]
     }
    ]
   },
   {
    "id": "home",
    "title": {
     "en": "Home practice",
     "ru": "Домашняя практика"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Four problems for home: three by hand and one in code. Each is followed by its complete solution, so try it on your own first.",
       "ru": "Четыре задачи для дома: три на бумаге и одна в коде. После каждой идёт полное решение, поэтому сначала попробуйте решить её сами."
      }
     },
     {
      "type": "problem",
      "id": "H1"
     },
     {
      "type": "problem",
      "id": "H2"
     },
     {
      "type": "problem",
      "id": "H3"
     },
     {
      "type": "problem",
      "id": "H4"
     }
    ]
   },
   {
    "id": "mistakes",
    "title": {
     "en": "Common mistakes",
     "ru": "Типичные ошибки"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "Mistakes that come up again and again: first by topic, then from the seminar problems.",
       "ru": "Ошибки, которые повторяются из раза в раз: сначала по темам, затем из задач семинара."
      }
     }
    ],
    "subsections": [
     {
      "id": "mistakes-a",
      "title": {
       "en": "Gradients and Hessians",
       "ru": "Градиенты и гессианы"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "A"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**A1.** Writing $-2$ off the diagonal (doubling the cross coefficient as on the diagonal) or $-\\tfrac12$ (the entry of $A$ in $f = x^\\top A x$), or putting $-1$ into only one of the two entries.",
          "ru": "**A1.** Писать вне диагонали $-2$ (удваивая коэффициент смешанного слагаемого, как на диагонали) или $-\\tfrac12$ (элемент $A$ в записи $f = x^\\top A x$) либо ставить $-1$ только в один из двух элементов."
         },
         {
          "en": "**A1.** Discussing optimality at ${{A1.params.x}}$ from the Hessian: the gradient is not zero there.",
          "ru": "**A1.** Обсуждать оптимальность в точке ${{A1.params.x}}$ по гессиану: градиент там не равен нулю."
         },
         {
          "en": "**A2.** Losing a sign: at $x_2 < 0$ both off-diagonal entries are negative, and $\\partial f/\\partial x_2$ is a sum of two negative terms.",
          "ru": "**A2.** Терять знак: при $x_2 < 0$ оба внедиагональных элемента отрицательны, а $\\partial f/\\partial x_2$ — сумма двух отрицательных слагаемых."
         },
         {
          "en": "**A2.** Announcing a minimum because $H \\succ 0$ at a point where $\\nabla f \\ne 0$.",
          "ru": "**A2.** Объявлять минимум из-за $H \\succ 0$ в точке, где $\\nabla f \\ne 0$."
         },
         {
          "en": "**A3.** Halving the cross coefficients, or writing each of them into only one of the two symmetric entries.",
          "ru": "**A3.** Делить коэффициенты смешанных слагаемых пополам или записывать каждый из них только в один из двух симметричных элементов."
         },
         {
          "en": "**A3.** Calling the stationary point a global minimum without an argument: here it is convexity, from $H \\succ 0$ at every point.",
          "ru": "**A3.** Называть стационарную точку глобальным минимумом без обоснования: здесь обоснование — выпуклость, из $H \\succ 0$ во всех точках."
         }
        ]
       }
      ]
     },
     {
      "id": "mistakes-b",
      "title": {
       "en": "Classifying stationary points",
       "ru": "Классификация стационарных точек"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "B"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**B1.** Claiming a global minimum from $H(x^*) \\succ 0$ alone.",
          "ru": "**B1.** Заявлять глобальный минимум только на основании $H(x^*) \\succ 0$."
         },
         {
          "en": "**B2.** Offering the contour picture as the proof; it is only a guide.",
          "ru": "**B2.** Предъявлять картинку линий уровня как доказательство: это лишь подсказка."
         },
         {
          "en": "**B3.** Concluding a minimum from $H(0) = 0 \\succeq 0$: that treats the necessary condition as if it were sufficient. This is the mistake the problem exists for.",
          "ru": "**B3.** Делать вывод о минимуме из $H(0) = 0 \\succeq 0$: так необходимое условие принимают за достаточное. Ради этой ошибки задача и существует."
         },
         {
          "en": "**B3.** Testing only the $x_2$-axis, where $f \\equiv 0$, and concluding that nothing happens.",
          "ru": "**B3.** Проверять только ось $x_2$, где $f \\equiv 0$, и решать, что ничего не происходит."
         },
         {
          "en": "**B4.** Calling the silent test “bad luck”: with $H$ singular and semidefinite, the first- and second-order data cannot separate B3 from B4.",
          "ru": "**B4.** Списывать молчание теста на «невезение»: при вырожденном полуопределённом $H$ данные первого и второго порядка не могут отличить B3 от B4."
         }
        ]
       }
      ]
     },
     {
      "id": "mistakes-c",
      "title": {
       "en": "Convexity",
       "ru": "Выпуклость"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "C"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**C1.** Giving a drawing instead of a proof, or a chain of inequalities without the reason for each step.",
          "ru": "**C1.** Приводить рисунок вместо доказательства или цепочку неравенств без обоснования каждого шага."
         },
         {
          "en": "**C2.** Judging by the sign of the cross term: A1 and C2 both have a negative one.",
          "ru": "**C2.** Судить по знаку смешанного слагаемого: и в A1, и в C2 он отрицательный."
         },
         {
          "en": "**C2.** Concluding “indefinite” only because neither Sylvester pattern holds: the negative determinant is what proves it here.",
          "ru": "**C2.** Делать вывод «знаконеопределён» только потому, что ни один шаблон Сильвестра не выполнен: здесь это доказывает отрицательный определитель."
         }
        ]
       }
      ]
     },
     {
      "id": "mistakes-d",
      "title": {
       "en": "Feasible directions",
       "ru": "Допустимые направления"
      },
      "blocks": [
       {
        "type": "mistakes",
        "block": "D"
       },
       {
        "type": "p",
        "text": {
         "en": "From the problems:",
         "ru": "Из задач:"
        }
       },
       {
        "type": "list",
        "items": [
         {
          "en": "**D1.** Declaring all directions feasible, or none.",
          "ru": "**D1.** Объявлять допустимыми все направления или ни одного."
         },
         {
          "en": "**D1.** Testing only directions that point into the interior and concluding that the condition holds.",
          "ru": "**D1.** Проверять только направления внутрь множества и заключать, что условие выполнено."
         },
         {
          "en": "**D2.** Reporting ${{D2.steps.dirDeriv}}$ as the rate per unit of length: $s$ is not a unit vector.",
          "ru": "**D2.** Выдавать ${{D2.steps.dirDeriv}}$ за скорость на единицу длины: $s$ не единичный вектор."
         },
         {
          "en": "**D2.** Forgetting to subtract $f(x)$ before dividing by $\\alpha$: the quotient $f(x + \\alpha s)/\\alpha$ has no finite limit.",
          "ru": "**D2.** Забывать вычитать $f(x)$ перед делением на $\\alpha$: у отношения $f(x + \\alpha s)/\\alpha$ нет конечного предела."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "glossary",
    "title": {
     "en": "Glossary",
     "ru": "Глоссарий"
    },
    "blocks": [
     {
      "type": "p",
      "text": {
       "en": "The English terms of the seminar with short meanings and their Russian equivalents.",
       "ru": "Английские термины семинара с кратким значением и их русские эквиваленты."
      }
     },
     {
      "type": "glossary",
      "items": [
       {
        "en": "optimization problem",
        "ru": "задача оптимизации",
        "note": {
         "en": "finding the smallest value of a function over a set",
         "ru": "поиск наименьшего значения функции на множестве"
        }
       },
       {
        "en": "objective function",
        "ru": "целевая функция",
        "note": {
         "en": "the function being minimized; in machine learning, the loss",
         "ru": "минимизируемая функция; в машинном обучении — функция потерь"
        }
       },
       {
        "en": "empirical risk",
        "ru": "эмпирический риск",
        "note": {
         "en": "the average loss of a model over the training data",
         "ru": "среднее значение функции потерь модели на обучающих данных"
        }
       },
       {
        "en": "feasible set",
        "ru": "допустимое множество",
        "note": {
         "en": "the set of points among which the minimum is sought",
         "ru": "множество точек, среди которых ищется минимум"
        }
       },
       {
        "en": "interior point",
        "ru": "внутренняя точка",
        "note": {
         "en": "a point that lies in the set together with a small ball around it",
         "ru": "точка, которая лежит в множестве вместе с небольшим шаром вокруг неё"
        }
       },
       {
        "en": "boundary point",
        "ru": "граничная точка",
        "note": {
         "en": "a point of the set with points outside the set arbitrarily close to it",
         "ru": "точка множества, сколь угодно близко к которой есть точки вне множества"
        }
       },
       {
        "en": "local minimum",
        "ru": "локальный минимум",
        "note": {
         "en": "a point with the smallest value among all nearby feasible points",
         "ru": "точка с наименьшим значением среди всех близких допустимых точек"
        }
       },
       {
        "en": "global minimum",
        "ru": "глобальный минимум",
        "note": {
         "en": "a point with the smallest value on the whole feasible set",
         "ru": "точка с наименьшим значением на всём допустимом множестве"
        }
       },
       {
        "en": "strict minimum",
        "ru": "строгий минимум",
        "note": {
         "en": "a minimum where every other admissible point gives a strictly larger value",
         "ru": "минимум, при котором любая другая допустимая точка даёт строго большее значение"
        }
       },
       {
        "en": "minimizer",
        "ru": "точка минимума",
        "note": {
         "en": "the point at which a minimum is attained",
         "ru": "точка, в которой достигается минимум"
        }
       },
       {
        "en": "stationary point",
        "ru": "стационарная точка",
        "note": {
         "en": "a point where the gradient is zero",
         "ru": "точка, в которой градиент равен нулю"
        }
       },
       {
        "en": "saddle point",
        "ru": "седловая точка",
        "note": {
         "en": "a stationary point that is neither a minimum nor a maximum",
         "ru": "стационарная точка, которая не является ни минимумом, ни максимумом"
        }
       },
       {
        "en": "monkey saddle",
        "ru": "обезьянье седло",
        "note": {
         "en": "a saddle with three descending sectors instead of two",
         "ru": "седло с тремя секторами убывания вместо двух"
        }
       },
       {
        "en": "level set",
        "ru": "множество уровня (линия уровня)",
        "note": {
         "en": "the set of points where a function takes a given value",
         "ru": "множество точек, в которых функция принимает заданное значение"
        }
       },
       {
        "en": "partial derivative",
        "ru": "частная производная",
        "note": {
         "en": "the derivative with respect to one variable while the others are fixed",
         "ru": "производная по одной переменной при фиксированных остальных"
        }
       },
       {
        "en": "gradient",
        "ru": "градиент",
        "note": {
         "en": "the column vector of all first partial derivatives",
         "ru": "вектор-столбец всех первых частных производных"
        }
       },
       {
        "en": "Hessian",
        "ru": "гессиан",
        "note": {
         "en": "the matrix of all second partial derivatives",
         "ru": "матрица всех вторых частных производных"
        }
       },
       {
        "en": "directional derivative",
        "ru": "производная по направлению",
        "note": {
         "en": "the rate of change of a function when moving from a point along a direction",
         "ru": "скорость изменения функции при движении из точки вдоль направления"
        }
       },
       {
        "en": "descent direction",
        "ru": "направление спуска",
        "note": {
         "en": "a direction along which the function decreases to first order",
         "ru": "направление, вдоль которого функция убывает уже в первом порядке"
        }
       },
       {
        "en": "steepest descent direction",
        "ru": "направление наискорейшего убывания",
        "note": {
         "en": "the direction opposite to the gradient",
         "ru": "направление, противоположное градиенту"
        }
       },
       {
        "en": "Taylor's formula",
        "ru": "формула Тейлора",
        "note": {
         "en": "the approximation of a smooth function near a point by a polynomial",
         "ru": "приближение гладкой функции многочленом вблизи точки"
        }
       },
       {
        "en": "quadratic form",
        "ru": "квадратичная форма",
        "note": {
         "en": "the number h transpose A h for a symmetric matrix A and a vector h",
         "ru": "скалярное произведение векторов h и A h для симметричной матрицы A"
        }
       },
       {
        "en": "cross term",
        "ru": "смешанное слагаемое",
        "note": {
         "en": "a product of two different variables with a coefficient",
         "ru": "произведение двух разных переменных с коэффициентом"
        }
       },
       {
        "en": "eigenvalue",
        "ru": "собственное значение",
        "note": {
         "en": "the stretching factor of a matrix along one of its eigenvectors",
         "ru": "коэффициент растяжения матрицы вдоль одного из её собственных векторов"
        }
       },
       {
        "en": "positive definite matrix",
        "ru": "положительно определённая матрица",
        "note": {
         "en": "a symmetric matrix whose quadratic form is positive for every nonzero vector",
         "ru": "симметричная матрица, квадратичная форма которой положительна на любом ненулевом векторе"
        }
       },
       {
        "en": "positive semidefinite matrix",
        "ru": "положительно полуопределённая матрица",
        "note": {
         "en": "a symmetric matrix whose quadratic form is nonnegative for every vector",
         "ru": "симметричная матрица, квадратичная форма которой неотрицательна на любом векторе"
        }
       },
       {
        "en": "indefinite matrix",
        "ru": "знаконеопределённая матрица",
        "note": {
         "en": "a symmetric matrix whose quadratic form takes both signs",
         "ru": "симметричная матрица, квадратичная форма которой принимает значения обоих знаков"
        }
       },
       {
        "en": "determinant",
        "ru": "определитель",
        "note": {
         "en": "the number ad - bc of a two by two matrix, and the product of the eigenvalues in general",
         "ru": "число ad - bc для матрицы два на два, а в общем случае — произведение собственных значений"
        }
       },
       {
        "en": "leading principal minor",
        "ru": "угловой минор",
        "note": {
         "en": "the determinant of the upper-left square block of a matrix",
         "ru": "определитель левого верхнего квадратного блока матрицы"
        }
       },
       {
        "en": "principal minor",
        "ru": "главный минор",
        "note": {
         "en": "the determinant on a set of rows and the same set of columns",
         "ru": "определитель на наборе строк и том же наборе столбцов"
        }
       },
       {
        "en": "Sylvester's criterion",
        "ru": "критерий Сильвестра",
        "note": {
         "en": "a symmetric matrix is positive definite exactly when all its leading principal minors are positive",
         "ru": "симметричная матрица положительно определена тогда и только тогда, когда все её угловые миноры положительны"
        }
       },
       {
        "en": "necessary condition",
        "ru": "необходимое условие",
        "note": {
         "en": "a condition that every minimum satisfies; its failure rules a point out",
         "ru": "условие, которому удовлетворяет любой минимум; если оно нарушено, точка отбрасывается"
        }
       },
       {
        "en": "sufficient condition",
        "ru": "достаточное условие",
        "note": {
         "en": "a condition that guarantees a minimum",
         "ru": "условие, которое гарантирует минимум"
        }
       },
       {
        "en": "feasible direction",
        "ru": "допустимое направление",
        "note": {
         "en": "a direction in which a small step keeps the point in the feasible set",
         "ru": "направление, в котором малый шаг оставляет точку в допустимом множестве"
        }
       },
       {
        "en": "active constraint",
        "ru": "активное ограничение",
        "note": {
         "en": "an inequality that holds with equality at the point",
         "ru": "неравенство, которое в данной точке выполняется как равенство"
        }
       },
       {
        "en": "convex set",
        "ru": "выпуклое множество",
        "note": {
         "en": "a set that contains the segment between any two of its points",
         "ru": "множество, которое содержит отрезок между любыми двумя своими точками"
        }
       },
       {
        "en": "convex function",
        "ru": "выпуклая функция",
        "note": {
         "en": "a function whose graph lies on or below each of its chords",
         "ru": "функция, график которой лежит не выше любой своей хорды"
        }
       },
       {
        "en": "strictly convex function",
        "ru": "строго выпуклая функция",
        "note": {
         "en": "a convex function for which the chord inequality is strict between distinct points",
         "ru": "выпуклая функция, для которой неравенство с хордой строгое при любых различных точках"
        }
       },
       {
        "en": "condition number",
        "ru": "число обусловленности",
        "note": {
         "en": "the ratio of the largest to the smallest eigenvalue of a positive definite matrix",
         "ru": "отношение наибольшего собственного значения положительно определённой матрицы к наименьшему"
        }
       },
       {
        "en": "central difference",
        "ru": "центральная разность",
        "note": {
         "en": "an estimate of a derivative from the values of a function at two points symmetric around the given one",
         "ru": "оценка производной по значениям функции в двух точках, симметричных относительно данной"
        }
       },
       {
        "en": "tolerance",
        "ru": "допуск",
        "note": {
         "en": "the threshold below which a computed number is treated as zero",
         "ru": "порог, ниже которого вычисленное число считается нулём"
        }
       }
      ]
     }
    ]
   },
   {
    "id": "references",
    "title": {
     "en": "References",
     "ru": "Литература"
    },
    "blocks": [
     {
      "type": "references",
      "items": [
       {
        "en": "S. Boyd, L. Vandenberghe. *Convex Optimization*. Cambridge University Press. The chapters on convex sets and convex functions, and the appendix on mathematical background: norms, derivatives, second-order approximation and symmetric matrices.",
        "ru": "S. Boyd, L. Vandenberghe. *Convex Optimization*. Cambridge University Press. Главы о выпуклых множествах и выпуклых функциях и приложение с математическими сведениями: нормы, производные, приближение второго порядка и симметричные матрицы."
       },
       {
        "en": "Andrey Ignatov. Lectures of the course *Optimization Methods*, HSE University, Faculty of Computer Science: the lecture “Optimization as the Foundation of Machine Learning”.",
        "ru": "Андрей Игнатов. Лекции курса «Методы оптимизации», НИУ ВШЭ, факультет компьютерных наук: лекция «Оптимизация как основа машинного обучения»."
       }
      ]
     }
    ]
   }
  ]
 }
}/*JSON-END*/);
