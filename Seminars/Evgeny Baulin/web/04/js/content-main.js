// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 04 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "main": {
  "blocks": {
   "0": {
    "title": {
     "en": "0. From a gradient to a method",
     "ru": "0. От градиента к методу"
    },
    "short": {
     "en": "0. Start",
     "ru": "0. Начало"
    },
    "recap": [
     {
      "en": "For $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q\\succ0$, the Hessian is $Q$, $\\mu=\\lambda_{\\min}(Q)$ and $L=\\lambda_{\\max}(Q)$. An orthogonal rotation changes the picture, but leaves these eigenvalues alone.",
      "ru": "Для $f(x)=\\tfrac{1}{2}x^\\top Qx$, $Q\\succ0$, гессиан равен $Q$, $\\mu=\\lambda_{\\min}(Q)$ и $L=\\lambda_{\\max}(Q)$. Ортогональный поворот меняет рисунок, но сохраняет собственные значения."
     },
     {
      "en": "For $Q=\\operatorname{diag}{{zero.lam}}$, the safe GD step is $\\alpha=1/L={{zero.alpha}}$. The flat coordinate is multiplied by ${{zero.factor}}$: the same gradient is correct, yet progress is slow.",
      "ru": "Для $Q=\\operatorname{diag}{{zero.lam}}$ безопасный шаг GD равен $\\alpha=1/L={{zero.alpha}}$. Пологая координата умножается на ${{zero.factor}}$: градиент верен, но продвижение медленное."
     },
     {
      "en": "Predict what can help: remember the previous displacement, change one coordinate, build conjugate directions, or estimate the gradient from a batch. Compare work as well as iteration counts.",
      "ru": "Предположите, что поможет: помнить прошлое перемещение, менять одну координату, строить сопряжённые направления или оценивать градиент по батчу. Сравнивайте объём вычислений вместе с числом итераций."
     }
    ]
   },
   "A": {
    "title": {
     "en": "A. Momentum and stability",
     "ru": "A. Инерция и устойчивость"
    },
    "short": {
     "en": "A. Momentum",
     "ru": "A. Инерция"
    },
    "recap": [
     {
      "en": "Heavy ball: $x^+=x-\\alpha\\nabla f(x)+\\beta(x-x^-)$. Its stability on an SPD quadratic is checked through the roots of a second-order recurrence.",
      "ru": "Тяжёлый шар: $x^+=x-\\alpha\\nabla f(x)+\\beta(x-x^-)$. Устойчивость на положительно определённой квадратичной функции проверяют по корням рекуррентного соотношения второго порядка."
     },
     {
      "en": "With look-ahead, evaluate the gradient at $y=x+\\beta(x-x^-)$ and set $x^+=y-\\alpha\\nabla f(y)$. This changes the characteristic polynomial.",
      "ru": "В методе с опережением вычисляйте градиент в $y=x+\\beta(x-x^-)$ и задавайте $x^+=y-\\alpha\\nabla f(y)$. Это меняет характеристический многочлен."
     }
    ]
   },
   "B": {
    "title": {
     "en": "B. Coordinates and conjugacy",
     "ru": "B. Координаты и сопряжённость"
    },
    "short": {
     "en": "B. Directions",
     "ru": "B. Направления"
    },
    "recap": [
     {
      "en": "A coordinate update costs one partial derivative when it can be computed cheaply. On a quadratic, the exact update is $x_i^+=x_i-g_i/Q_{ii}$.",
      "ru": "Координатное обновление стоит одной частной производной, если её можно дёшево вычислить. На квадратичной функции точное обновление равно $x_i^+=x_i-g_i/Q_{ii}$."
     },
     {
      "en": "CG uses $A$-conjugate directions to solve an SPD system. Reuse $Ap_k$ and compare matrix-vector products; report a relative residual.",
      "ru": "CG решает положительно определённую систему с помощью $A$-сопряжённых направлений. Переиспользуйте $Ap_k$ и сравнивайте число произведений матрицы на вектор; указывайте относительную невязку."
     }
    ]
   },
   "C": {
    "title": {
     "en": "C. Batches, noise and scaling",
     "ru": "C. Батчи, шум и масштаб"
    },
    "short": {
     "en": "C. SGD",
     "ru": "C. SGD"
    },
    "recap": [
     {
      "en": "For $F=N^{-1}\\sum_i\\ell_i$, a fresh uniform sample has $\\mathbb E g=\\nabla F$. Averaging independent samples reduces gradient variance.",
      "ru": "Для $F=N^{-1}\\sum_i\\ell_i$ новая равномерная выборка даёт $\\mathbb E g=\\nabla F$. Усреднение независимых выборок уменьшает дисперсию градиента."
     },
     {
      "en": "Shuffle every epoch, include the final short batch, and log full loss at epoch boundaries. Use the same seeds and sample-gradient budget when comparing schedules.",
      "ru": "Перемешивайте каждую эпоху, включайте последний короткий батч и записывайте полную потерю в конце эпохи. Для сравнения расписаний используйте одинаковые seed и бюджеты градиентов объектов."
     }
    ]
   },
   "D": {
    "title": {
     "en": "D. How it breaks",
     "ru": "D. Как ломается"
    },
    "short": {
     "en": "D. Breaks",
     "ru": "D. Сбои"
    },
    "intro": {
     "en": "Four checks to run before trusting a convergence plot.",
     "ru": "Четыре проверки перед тем, как доверять графику сходимости."
    },
    "demos": [
     {
      "title": {
       "en": "A stable method can overshoot",
       "ru": "Устойчивый метод может перелететь"
      },
      "text": {
       "en": "The board example already has $f(x_1)>f(x_0)$. Momentum may store enough displacement to climb temporarily. Restarting when the objective rises is a safeguard that changes the iteration; it is not part of the original recurrence.",
       "ru": "В примере у доски уже получилось $f(x_1)>f(x_0)$. Инерция может накопить перемещение, достаточное для временного подъёма. Рестарт при росте функции — защитное правило, которое меняет итерацию; оно не входит в исходное соотношение."
      },
      "takeaway": {
       "en": "Keep finite-value and maximum-iteration guards even for a theoretically stable parameter pair.",
       "ru": "Даже для теоретически устойчивых параметров проверяйте конечность значений и ограничивайте число итераций."
      }
     },
     {
      "title": {
       "en": "Stable and fast are different tests",
       "ru": "Устойчивость и скорость проверяют по-разному"
      },
      "text": {
       "en": "The root condition $\\rho<1$ is asymptotic. A run of ${{demo.iterations}}$ iterations labelled fast when $f_k/f_0\\le{{demo.threshold}}$ can miss stable slow pairs. With $\\beta=0$, $\\lambda=1$, $\\alpha={{demo.smallStep}}$, the ratio is still ${{demo.ratio}}$.",
       "ru": "Условие на корни $\\rho<1$ описывает асимптотику. Запуск на ${{demo.iterations}}$ итераций, где быстрыми считаются пары с $f_k/f_0\\le{{demo.threshold}}$, может не распознать устойчивые медленные пары. При $\\beta=0$, $\\lambda=1$, $\\alpha={{demo.smallStep}}$ отношение всё ещё равно ${{demo.ratio}}$."
      },
      "figure": {
       "src": "fig_stability",
       "alt": {
        "en": "Root-stable region and finite-run classifications for heavy ball.",
        "ru": "Область устойчивости по корням и классификация тяжёлого шара за конечное число шагов."
       },
       "caption": {
        "en": "Root-stable region and finite-run classifications for heavy ball.",
        "ru": "Область устойчивости по корням и классификация тяжёлого шара за конечное число шагов."
       }
      },
      "takeaway": {
       "en": "Separate the analytic root test from the observed reduction threshold.",
       "ru": "Разделяйте аналитическую проверку корней и наблюдаемый порог уменьшения."
      }
     },
     {
      "title": {
       "en": "CG loses exact conjugacy in floating point",
       "ru": "CG теряет точную сопряжённость при округлении"
      },
      "text": {
       "en": "An SPD quadratic is essential: if $p^\\top Ap\\le0$, the CG step is invalid. Even for SPD matrices, recursively updated residuals drift from $b-Ax$. Check the true final residual and compare a small dense case with a direct solve.",
       "ru": "Положительная определённость обязательна: если $p^\\top Ap\\le0$, шаг CG недопустим. Даже для положительно определённых матриц рекуррентная невязка отклоняется от $b-Ax$. Проверьте истинную конечную невязку и сравните небольшой плотный пример с прямым решением."
      },
      "takeaway": {
       "en": "Exclude nearly zero vectors from normalized orthogonality diagnostics.",
       "ru": "Исключайте почти нулевые векторы из нормированных проверок ортогональности."
      }
     },
     {
      "title": {
       "en": "One seed can hide the noise",
       "ru": "Один seed может скрыть шум"
      },
      "text": {
       "en": "Compare constant, inverse-square-root and inverse learning rates across ${{demo.seeds}}$ seeds. Plot the median and interquartile band against sample gradients. A constant step can fluctuate near the minimum while the mean trend improves.",
       "ru": "Сравните постоянный шаг, обратный квадратный корень и обратное расписание на ${{demo.seeds}}$ seed. Стройте медиану и межквартильную полосу по числу градиентов объектов. При постоянном шаге итерации могут колебаться возле минимума, хотя средний тренд улучшается."
      },
      "figure": {
       "src": "fig_sgd",
       "alt": {
        "en": "Median and interquartile bands of least-squares loss for three SGD schedules.",
        "ru": "Медиана и межквартильные полосы потери в задаче наименьших квадратов для трёх расписаний SGD."
       },
       "caption": {
        "en": "Median and interquartile bands of least-squares loss for three SGD schedules.",
        "ru": "Медиана и межквартильные полосы потери в задаче наименьших квадратов для трёх расписаний SGD."
       }
      },
      "takeaway": {
       "en": "Include the cost of full-loss logging when reporting total work.",
       "ru": "Учитывайте стоимость вычисления полной потери при отчёте о работе."
      }
     }
    ]
   },
   "E": {
    "title": {
     "en": "E. Takeaways and practice",
     "ru": "E. Итоги и практика"
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
        "en": "For heavy ball with $\\lambda={{exit.lam}}$, $\\beta={{exit.beta}}$, what is the strict upper step endpoint?",
        "ru": "Какова строгая верхняя граница шага тяжёлого шара при $\\lambda={{exit.lam}}$, $\\beta={{exit.beta}}$?"
       }
      },
      {
       "question": {
        "en": "What changes in $g_i^2/(2L_i)$ when $L_i$ doubles and $g_i$ stays fixed?",
        "ru": "Как меняется $g_i^2/(2L_i)$, если $L_i$ удваивается, а $g_i$ не меняется?"
       }
      },
      {
       "question": {
        "en": "Does convergence of the mean SGD iterate imply that each run reaches the minimum?",
        "ru": "Следует ли из сходимости среднего итерата SGD достижение минимума в каждом запуске?"
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
      "en": "Implement every method with NumPy; use direct solvers as references. Return the iterate and a history with objective, residual or gradient norm, and work.",
      "ru": "Реализуйте все методы в NumPy; используйте прямые решатели как эталон. Возвращайте точку и историю функции, нормы невязки или градиента и объёма работы."
     },
     "items": [
      {
       "id": "H1",
       "kind": "code",
       "title": {
        "en": "Rotated quadratic and stability map",
        "ru": "Повёрнутая квадратичная функция и карта устойчивости"
       },
       "statement": {
        "en": "Use $Q=R^\\top\\operatorname{diag}{{zero.lam}}R$ with a nontrivial rotation. Implement GD, heavy ball and look-ahead momentum, then plot trajectories and objective against gradients. Sweep $(\\alpha,\\beta)$; compare characteristic roots with ${{demo.iterations}}$-step runs.",
        "ru": "Возьмите $Q=R^\\top\\operatorname{diag}{{zero.lam}}R$ с нетривиальным поворотом. Реализуйте GD, тяжёлый шар и инерцию с опережением; постройте траектории и функцию по числу градиентов. Переберите $(\\alpha,\\beta)$ и сравните корни с запусками на ${{demo.iterations}}$ шагов."
       }
      },
      {
       "id": "H2",
       "kind": "code",
       "title": {
        "en": "Coordinates and an SPD system",
        "ru": "Координаты и положительно определённая система"
       },
       "statement": {
        "en": "Implement cyclic, random and normalized greedy coordinate selection. Implement CG with one matrix-vector product per iteration. Compare coordinate updates, full passes and matrix-vector products; check residual orthogonality, conjugacy, and a direct solution.",
        "ru": "Реализуйте циклический, случайный и нормированный жадный выбор координаты. Реализуйте CG с одним произведением матрицы на вектор за итерацию. Сравните координатные обновления, полные проходы и произведения матрицы на вектор; проверьте ортогональность невязок, сопряжённость и прямое решение."
       }
      },
      {
       "id": "H3",
       "kind": "code",
       "title": {
        "en": "Schedules and feature standardization",
        "ru": "Расписания и стандартизация признаков"
       },
       "statement": {
        "en": "Implement shuffled mini-batch SGD with the final short batch. Compare $\\alpha_0$, $\\alpha_0/\\sqrt{1+k}$ and $\\alpha_0/(1+k)$ on identical data and ${{demo.seeds}}$ seeds. Rescale features, standardize using training statistics and convert fitted coefficients back. Report median loss, the interquartile band, and sample-gradient counts.",
        "ru": "Реализуйте SGD с перемешиванием и последним коротким батчем. Сравните $\\alpha_0$, $\\alpha_0/\\sqrt{1+k}$ и $\\alpha_0/(1+k)$ на одинаковых данных и ${{demo.seeds}}$ seed. Измените масштаб признаков, стандартизуйте по обучающей выборке и верните коэффициенты в исходные единицы. Укажите медиану потери, межквартильную полосу и число градиентов объектов."
       }
      }
     ]
    }
   }
  }
 }
}/*JSON-END*/);
