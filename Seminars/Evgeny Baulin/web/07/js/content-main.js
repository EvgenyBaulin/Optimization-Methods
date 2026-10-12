// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 07 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. The colloquium at a glance",
     "ru": "0. Коллоквиум одним взглядом"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "A ticket has three parts. Part one asks for six definitions from a list of about twenty. Part two asks for two short theorems and their proofs. Part three asks for two problems: stationary points of a quadratic form in two variables, and two or three gradient-descent steps on a positive definite quadratic.",
      "ru": "В билете три части. Часть один — шесть определений из списка примерно из двадцати. Часть два — две короткие теоремы и их доказательства. Часть три — две задачи: стационарные точки квадратичной формы от двух переменных и два-три шага градиентного спуска на положительно определённой квадратичной функции."
     },
     {
      "en": "Both problems come down to the gradient and the Hessian of a quadratic. The gradient is linear; the Hessian is a constant symmetric matrix. The stationary point solves $Hx=-b$, its type follows from the eigenvalues of $H$, and $\\mu$ and $L$ are $\\lambda_{\\min}(H)$ and $\\lambda_{\\max}(H)$.",
      "ru": "Обе задачи сводятся к градиенту и гессиану квадратичной функции. Градиент линеен, гессиан — постоянная симметричная матрица. Стационарная точка решает $Hx=-b$, её тип определяют собственные значения $H$, а $\\mu$ и $L$ — это $\\lambda_{\\min}(H)$ и $\\lambda_{\\max}(H)$."
     },
     {
      "en": "Today we rehearse both problems on the board (A1 and B1) and ask you to work two more by yourself (A2 and B2). Block D collects the four questions that come up every year, and the handout is a card to carry into the colloquium.",
      "ru": "Сегодня разберём обе задачи у доски (A1 и B1) и попросим решить ещё две самостоятельно (A2 и B2). В блоке D собраны четыре вопроса, которые повторяются из года в год, а конспект — карточка, которую можно взять с собой на коллоквиум."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. Stationary points of a quadratic form",
     "ru": "A. Стационарные точки квадратичной функции"
    },
    "short": {
     "en": "A. Form",
     "ru": "A. Форма"
    },
    "recap": [
     {
      "en": "For $f(x,y)=ax^2+bxy+cy^2+dx+ey$ the gradient is linear in $(x,y)$ and the Hessian is $H=\\begin{pmatrix}2a&b\\\\b&2c\\end{pmatrix}$. A stationary point solves $Hx^*=-\\nabla f(0)$; eigenvalues of $H$ tell its type.",
      "ru": "Для $f(x,y)=ax^2+bxy+cy^2+dx+ey$ градиент линеен по $(x,y)$, а гессиан равен $H=\\begin{pmatrix}2a&b\\\\b&2c\\end{pmatrix}$. Стационарная точка решает $Hx^*=-\\nabla f(0)$; тип задают собственные значения $H$."
     },
     {
      "en": "Both eigenvalues positive: a minimum. Both negative: a maximum. Different signs: a saddle. Zero eigenvalue: degenerate — the second-order test fails. For a positive definite $H$ the strong-convexity constant is $\\mu=\\lambda_{\\min}(H)$ and the smoothness constant is $L=\\lambda_{\\max}(H)$.",
      "ru": "Оба собственных значения положительные — минимум. Оба отрицательные — максимум. Разные знаки — седло. Нулевое — вырожденный случай, тест второго порядка не работает. Для положительно определённой $H$ константа сильной выпуклости $\\mu=\\lambda_{\\min}(H)$, а константа гладкости $L=\\lambda_{\\max}(H)$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: classify a stationary point from the coefficients",
      "ru": "Живой код: определить тип стационарной точки по коэффициентам"
     },
     "text": {
      "en": "Form $H$ and $b$ from the coefficients, solve $Hx^*=-b$, read the type off the eigenvalues of $H$. Change the coefficients and watch the type switch.",
      "ru": "Соберите $H$ и $b$ по коэффициентам, решите $Hx^*=-b$, определите тип по знакам собственных чисел $H$. Меняйте коэффициенты и смотрите, как меняется тип точки."
     }
    }
   },
   "B": {
    "title": {
     "en": "B. Three steps of GD on a quadratic",
     "ru": "B. Три шага GD на квадратичной функции"
    },
    "short": {
     "en": "B. GD",
     "ru": "B. GD"
    },
    "recap": [
     {
      "en": "For $f(x)=\\tfrac{1}{2}x^\\top Qx$ with $Q\\succ0$ the gradient is $Qx$ and the Hessian is $Q$. The step is $x_{k+1}=x_k-\\alpha Qx_k=(I-\\alpha Q)x_k$. In the eigenbasis of $Q$, every coordinate contracts by $1-\\alpha\\lambda_i$ per step.",
      "ru": "Для $f(x)=\\tfrac{1}{2}x^\\top Qx$ при $Q\\succ0$ градиент равен $Qx$, гессиан — $Q$. Шаг $x_{k+1}=x_k-\\alpha Qx_k=(I-\\alpha Q)x_k$. В собственном базисе $Q$ каждая координата умножается на $1-\\alpha\\lambda_i$ за шаг."
     },
     {
      "en": "The step $\\alpha$ is safe iff $|1-\\alpha\\lambda_i|<1$ for every $i$, that is $0<\\alpha<2/L$. At $\\alpha=1/L$ the error on the steepest axis vanishes after one step; the flat axis contracts by $1-\\mu/L$ per step, so the rate is set by the condition number $\\kappa=L/\\mu$.",
      "ru": "Шаг $\\alpha$ безопасен ровно при $|1-\\alpha\\lambda_i|<1$ для всех $i$, то есть $0<\\alpha<2/L$. При $\\alpha=1/L$ ошибка на самой крутой оси обнуляется за шаг, а пологая ось сжимается в $1-\\mu/L$ за шаг; скорость задаёт число обусловленности $\\kappa=L/\\mu$."
     }
    ],
    "live": {
     "title": {
      "en": "Live code: three gradient-descent steps on a quadratic",
      "ru": "Живой код: три шага градиентного спуска на квадратичной функции"
     },
     "text": {
      "en": "Set $Q$, the start and $\\alpha$. The cell prints $x_1,x_2,x_3$ and $f$ at each, and compares $\\alpha$ with $2/L$. Try $\\alpha<2/L$, $\\alpha=2/L$ and $\\alpha>2/L$.",
      "ru": "Задайте $Q$, начальную точку и $\\alpha$. Ячейка выведет $x_1,x_2,x_3$ и значения $f$, а также сравнит $\\alpha$ с $2/L$. Попробуйте $\\alpha<2/L$, $\\alpha=2/L$ и $\\alpha>2/L$."
     }
    }
   },
   "D": {
    "title": {
     "en": "D. Four questions the colloquium asks",
     "ru": "D. Четыре вопроса коллоквиума"
    },
    "short": {
     "en": "D. Review",
     "ru": "D. Разбор"
    },
    "intro": {
     "en": "A short review of the material that comes up again and again, with pointers into the cheat sheet.",
     "ru": "Короткий разбор материала, который возвращается из года в год, со ссылками на карточку шпаргалки."
    },
    "demos": [
     {
      "title": {
       "en": "Eigenvalues drive the behaviour",
       "ru": "Поведением управляют собственные значения"
      },
      "text": {
       "en": "For $f(x)=\\tfrac{1}{2}x^\\top Qx$ with $\\mu\\le\\lambda_i\\le L$, every component $e_i$ of the error contracts by $|1-\\alpha\\lambda_i|$ per step. The condition number $\\kappa=L/\\mu$ decides how slow the slowest component is; for $\\kappa=1,{{demo.spread.1}},{{demo.spread.2}}$ it takes about ${{demo.steps.1}},{{demo.steps.2}}$ and ${{demo.steps.3}}$ steps to shrink the error by ten.",
       "ru": "Для $f(x)=\\tfrac{1}{2}x^\\top Qx$, где $\\mu\\le\\lambda_i\\le L$, каждая компонента ошибки $e_i$ умножается на $|1-\\alpha\\lambda_i|$ за шаг. Число обусловленности $\\kappa=L/\\mu$ определяет, насколько медленная самая медленная компонента; при $\\kappa=1,{{demo.spread.1}},{{demo.spread.2}}$ на сжатие ошибки в десять раз уходит около ${{demo.steps.1}},{{demo.steps.2}}$ и ${{demo.steps.3}}$ шагов."
      },
      "figure": {
       "src": "fig_kappa",
       "alt": {
        "en": "Error against iteration for three condition numbers of a two-dimensional quadratic.",
        "ru": "Ошибка по итерациям для трёх чисел обусловленности двумерной квадратичной функции."
       },
       "caption": {
        "en": "Error against iteration for three condition numbers of a two-dimensional quadratic.",
        "ru": "Ошибка по итерациям для трёх чисел обусловленности двумерной квадратичной функции."
       }
      },
      "takeaway": {
       "en": "A colloquium problem that asks for $\\mu$ and $L$ is really asking for the eigenvalues of the Hessian.",
       "ru": "Если задача на коллоквиуме просит $\\mu$ и $L$, она на самом деле просит собственные значения гессиана."
      }
     },
     {
      "title": {
       "en": "The safe step and the border",
       "ru": "Безопасный шаг и граница"
      },
      "text": {
       "en": "A fixed step $\\alpha$ converges iff $0<\\alpha<2/L$. At $\\alpha=1/L$ the fastest contraction is on the steepest axis. At $\\alpha=2/L$ the steepest axis oscillates with amplitude kept, so the method stalls. For $\\alpha>2/L$ it diverges, the growth factor is $|1-\\alpha L|$.",
       "ru": "Фиксированный шаг $\\alpha$ сходится ровно при $0<\\alpha<2/L$. При $\\alpha=1/L$ самое быстрое сжатие — на самой крутой оси. При $\\alpha=2/L$ самая крутая ось колеблется, не затухая, и метод стоит. При $\\alpha>2/L$ метод расходится с ростом $|1-\\alpha L|$ за шаг."
      },
      "figure": {
       "src": "fig_border",
       "alt": {
        "en": "Three gradient-descent paths at step sizes below, on and above the border.",
        "ru": "Три траектории градиентного спуска при шаге меньше, на границе и больше границы."
       },
       "caption": {
        "en": "Three gradient-descent paths at step sizes below, on and above the border.",
        "ru": "Три траектории градиентного спуска при шаге меньше, на границе и больше границы."
       }
      },
      "takeaway": {
       "en": "The sign of $\\alpha-2/L$ decides divergence; the number $\\alpha-1/L$ decides which axis sets the rate.",
       "ru": "Знак $\\alpha-2/L$ определяет расхождение, а $\\alpha-1/L$ — какая ось задаёт скорость."
      }
     },
     {
      "title": {
       "en": "A list of definitions worth memorizing",
       "ru": "Определения, которые надо помнить дословно"
      },
      "text": {
       "en": "Part one of the ticket asks for six items from a short list: convex set and function, affine set, strongly convex function, $L$-smooth function, gradient, Hessian, stationary point, strict and strong convexity, directional derivative, subgradient, Lipschitz constant. Each is one or two formulas; the colloquium wants them in the standard form.",
       "ru": "Часть один билета просит шесть пунктов из короткого списка: выпуклое множество и выпуклая функция, аффинное множество, сильно выпуклая функция, $L$-гладкая функция, градиент, гессиан, стационарная точка, строгая и сильная выпуклость, производная по направлению, субградиент, константа Липшица. Каждое — одна-две формулы; на коллоквиуме нужна стандартная форма."
      },
      "takeaway": {
       "en": "Write every definition on one line; the colloquium scores how closely you match the standard wording.",
       "ru": "Запишите каждое определение одной строкой; на коллоквиуме смотрят, насколько близко к стандартной формулировке."
      }
     },
     {
      "title": {
       "en": "Two proofs that come up every time",
       "ru": "Два доказательства, которые нужны всегда"
      },
      "text": {
       "en": "The first is the convex combination of two convex functions is convex, straight from the definition. The second is the sufficient condition for a strict minimum: $\\nabla f(x^*)=0$ and $\\nabla^2 f(x^*)\\succ0$ give $x^*$ as the local strict minimizer, by the second-order Taylor expansion. Both are two to three lines.",
       "ru": "Первое — выпуклая комбинация двух выпуклых функций выпукла, прямо по определению. Второе — достаточное условие строгого минимума: $\\nabla f(x^*)=0$ и $\\nabla^2 f(x^*)\\succ0$ дают $x^*$ как локальный строгий минимизатор, по разложению Тейлора второго порядка. Каждое — две-три строки."
      },
      "takeaway": {
       "en": "Both proofs reuse the second-order Taylor expansion; practise writing it on one line.",
       "ru": "Оба доказательства опираются на разложение Тейлора второго порядка; тренируйтесь писать его одной строкой."
      }
     }
    ]
   },
   "E": {
    "title": {
     "en": "E. Takeaways and plan for the colloquium",
     "ru": "E. Итоги и план на коллоквиум"
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
        "en": "For $f(x,y)=x^2+xy+y^2$, what is $\\mu$ and what is $L$?",
        "ru": "Для $f(x,y)=x^2+xy+y^2$ чему равны $\\mu$ и $L$?"
       }
      },
      {
       "question": {
        "en": "For a Hessian with eigenvalues $\\{{{exit.eig}}\\}$, is the stationary point a minimum, a maximum or a saddle?",
        "ru": "Для гессиана с собственными значениями $\\{{{exit.eig}}\\}$ стационарная точка — минимум, максимум или седло?"
       }
      },
      {
       "question": {
        "en": "For $L={{exit.L}}$, which of $\\alpha={{exit.alphas}}$ are safe?",
        "ru": "При $L={{exit.L}}$ какие из $\\alpha={{exit.alphas}}$ безопасны?"
       }
      }
     ]
    },
    "home": {
     "title": {
      "en": "Preparation for the colloquium",
      "ru": "Подготовка к коллоквиуму"
     },
     "text": {
      "en": "Work through two or three tickets on paper from end to end. Set a timer at the length of the colloquium, write the definitions by hand on a blank sheet, then compare them with the handout.",
      "ru": "Прорешайте два-три билета на бумаге от начала до конца. Поставьте таймер на длину коллоквиума, запишите определения от руки на чистом листе, затем сверьте их с конспектом."
     },
     "items": [
      {
       "id": "H1",
       "kind": "paper",
       "title": {
        "en": "Four tickets on paper",
        "ru": "Четыре билета на бумаге"
       },
       "statement": {
        "en": "Pick four tickets at random. For each one write out the six definitions, both proofs and both problems. Time yourself. Mark every item that took longer than planned and revisit it before the colloquium.",
        "ru": "Выберите четыре билета случайно. Для каждого напишите шесть определений, оба доказательства и обе задачи. Засеките время. Отметьте всё, что ушло дольше запланированного, и вернитесь к этому до коллоквиума."
       }
      },
      {
       "id": "H2",
       "kind": "paper",
       "title": {
        "en": "The definition sheet",
        "ru": "Лист определений"
       },
       "statement": {
        "en": "On one blank page write every definition from the list, from memory, in one line each. Compare with the handout. Repeat the next day; a definition that is still wrong on day two needs a flashcard.",
        "ru": "На одном чистом листе запишите все определения из списка по памяти, по одной строке на каждое. Сверьтесь с конспектом. Повторите на следующий день; определение, в котором на второй день по-прежнему есть ошибка, попадает в карточку для заучивания."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "Problem 3.1 and 3.2 by NumPy",
        "ru": "Задачи 3.1 и 3.2 в NumPy"
       },
       "statement": {
        "en": "Reimplement both problems with NumPy from the coefficients: a function that returns the stationary point and $\\mu,L$, and a function that returns the first $k$ gradient-descent iterates. Check your paper work against them for the four tickets of H1.",
        "ru": "Реализуйте обе задачи в NumPy по коэффициентам: функция, возвращающая стационарную точку и $\\mu,L$, и функция, возвращающая первые $k$ итераций градиентного спуска. Сверьте ваше решение на бумаге с этими функциями для четырёх билетов из H1."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
