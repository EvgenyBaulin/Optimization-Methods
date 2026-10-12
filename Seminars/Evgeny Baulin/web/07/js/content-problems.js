// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 07 content. Strict JSON between the markers.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "problems": {
  "A1": {
   "who": "board",
   "title": {
    "en": "Stationary point and type of a quadratic form",
    "ru": "Стационарная точка квадратичной формы и её тип"
   },
   "statement": {
    "en": "For $f(x,y)={{A1.params.a}}x^2+{{A1.params.b}}xy+{{A1.params.c}}y^2{{A1.params.dSign}}{{A1.params.dAbs}}x{{A1.params.eSign}}{{A1.params.eAbs}}y$, find the stationary point and its type. Then find $\\mu$ and $L$ as the smallest and the largest eigenvalue of the Hessian.",
    "ru": "Для $f(x,y)={{A1.params.a}}x^2+{{A1.params.b}}xy+{{A1.params.c}}y^2{{A1.params.dSign}}{{A1.params.dAbs}}x{{A1.params.eSign}}{{A1.params.eAbs}}y$ найдите стационарную точку и её тип. Затем найдите $\\mu$ и $L$ как наименьшее и наибольшее собственные значения гессиана."
   },
   "answers": [
    {
     "id": "xstar",
     "ref": "answers.A1.xstar",
     "label": {
      "en": "First entry of the stationary point",
      "ru": "Первая компонента стационарной точки"
     }
    },
    {
     "id": "ystar",
     "ref": "answers.A1.ystar",
     "label": {
      "en": "Second entry of the stationary point",
      "ru": "Вторая компонента стационарной точки"
     }
    },
    {
     "id": "mu",
     "ref": "answers.A1.mu",
     "label": {
      "en": "$\\mu$",
      "ru": "$\\mu$"
     }
    },
    {
     "id": "L",
     "ref": "answers.A1.L",
     "label": {
      "en": "$L$",
      "ru": "$L$"
     }
    }
   ],
   "hints": [
    {
     "en": "For $f(x,y)=ax^2+bxy+cy^2+dx+ey$ the gradient is $(2ax+by+d,\\ bx+2cy+e)$ and the Hessian is $\\begin{pmatrix}2a&b\\\\b&2c\\end{pmatrix}$.",
     "ru": "Для $f(x,y)=ax^2+bxy+cy^2+dx+ey$ градиент $(2ax+by+d,\\ bx+2cy+e)$, гессиан $\\begin{pmatrix}2a&b\\\\b&2c\\end{pmatrix}$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "$\\nabla f={{A1.grad}}$, $H={{A1.H}}$. The system $\\nabla f=0$ reads ${{A1.system}}$. The determinant of $H$ is ${{A1.det}}$, so the system has a unique solution.",
      "ru": "$\\nabla f={{A1.grad}}$, $H={{A1.H}}$. Система $\\nabla f=0$: ${{A1.system}}$. Определитель $H$ равен ${{A1.det}}$, поэтому система имеет единственное решение."
     }
    },
    {
     "text": {
      "en": "Solve: $x^*={{A1.xstar}}$, $y^*={{A1.ystar}}$. Check: $\\nabla f(x^*)={{A1.gradCheck}}$ and $f(x^*)={{A1.fstar}}$.",
      "ru": "Решение: $x^*={{A1.xstar}}$, $y^*={{A1.ystar}}$. Проверка: $\\nabla f(x^*)={{A1.gradCheck}}$ и $f(x^*)={{A1.fstar}}$."
     }
    },
    {
     "text": {
      "en": "Eigenvalues of $H$ solve $\\det(H-\\lambda I)=0$, that is $\\lambda^2-{{A1.trace}}\\lambda+{{A1.det}}=0$. The roots are $\\lambda_{\\min}={{A1.mu}}$ and $\\lambda_{\\max}={{A1.L}}$. Both are positive, so the stationary point is a strict minimum.",
      "ru": "Собственные значения $H$ находятся из $\\det(H-\\lambda I)=0$, то есть $\\lambda^2-{{A1.trace}}\\lambda+{{A1.det}}=0$. Корни $\\lambda_{\\min}={{A1.mu}}$ и $\\lambda_{\\max}={{A1.L}}$. Оба положительные, значит, стационарная точка — строгий минимум."
     }
    },
    {
     "text": {
      "en": "So $\\mu={{A1.mu}}$ and $L={{A1.L}}$. The condition number is $\\kappa=L/\\mu={{A1.kappa}}$; gradient descent with the best fixed step would contract the error on the slow axis by $(\\kappa-1)/(\\kappa+1)={{A1.rate}}$ per step.",
      "ru": "Значит, $\\mu={{A1.mu}}$ и $L={{A1.L}}$. Число обусловленности $\\kappa=L/\\mu={{A1.kappa}}$; градиентный спуск с лучшим постоянным шагом сжимал бы ошибку на медленной оси в $(\\kappa-1)/(\\kappa+1)={{A1.rate}}$ раза за шаг."
     }
    }
   ],
   "answerText": {
    "en": "Minimum at $(x^*,y^*)=({{A1.xstar}},{{A1.ystar}})$; $\\mu={{A1.mu}}$, $L={{A1.L}}$.",
    "ru": "Минимум в точке $(x^*,y^*)=({{A1.xstar}},{{A1.ystar}})$; $\\mu={{A1.mu}}$, $L={{A1.L}}$."
   },
   "review": {
    "en": "Compute the determinant and the trace of $H$ first: they give the two eigenvalues through the quadratic $\\lambda^2-\\operatorname{tr}\\lambda+\\det=0$.",
    "ru": "Сначала считайте определитель и след $H$: они дают собственные значения через квадратное уравнение $\\lambda^2-\\operatorname{tr}\\lambda+\\det=0$."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_a1",
    "alt": {
     "en": "Level sets of $f$ for problem A1 with the stationary point marked.",
     "ru": "Линии уровня $f$ для задачи A1 с отмеченной стационарной точкой."
    },
    "caption": {
     "en": "Level sets of $f$ for problem A1 with the stationary point marked.",
     "ru": "Линии уровня $f$ для задачи A1 с отмеченной стационарной точкой."
    }
   }
  },
  "A2": {
   "who": "students",
   "title": {
    "en": "Stationary point of another quadratic",
    "ru": "Стационарная точка другой квадратичной функции"
   },
   "statement": {
    "en": "For $f(x,y)={{A2.params.a}}x^2{{A2.params.bSign}}{{A2.params.bAbs}}xy+{{A2.params.c}}y^2{{A2.params.dSign}}{{A2.params.dAbs}}x+{{A2.params.e}}y$, find the stationary point, its type, and $\\mu$ and $L$.",
    "ru": "Для $f(x,y)={{A2.params.a}}x^2{{A2.params.bSign}}{{A2.params.bAbs}}xy+{{A2.params.c}}y^2{{A2.params.dSign}}{{A2.params.dAbs}}x+{{A2.params.e}}y$ найдите стационарную точку, её тип, а также $\\mu$ и $L$."
   },
   "answers": [
    {
     "id": "xstar",
     "ref": "answers.A2.xstar",
     "label": {
      "en": "First entry of the stationary point",
      "ru": "Первая компонента стационарной точки"
     }
    },
    {
     "id": "ystar",
     "ref": "answers.A2.ystar",
     "label": {
      "en": "Second entry of the stationary point",
      "ru": "Вторая компонента стационарной точки"
     }
    },
    {
     "id": "mu",
     "ref": "answers.A2.mu",
     "label": {
      "en": "$\\mu$",
      "ru": "$\\mu$"
     }
    },
    {
     "id": "L",
     "ref": "answers.A2.L",
     "label": {
      "en": "$L$",
      "ru": "$L$"
     }
    }
   ]
  },
  "B1": {
   "who": "board",
   "title": {
    "en": "Three steps of gradient descent on a quadratic",
    "ru": "Три шага градиентного спуска на квадратичной функции"
   },
   "statement": {
    "en": "Let $f(x,y)={{B1.params.a}}x^2{{B1.params.bSign}}{{B1.params.bAbs}}xy+{{B1.params.c}}y^2$. From $x_0={{B1.params.x0}}$ take three steps of gradient descent with $\\alpha={{B1.params.alpha}}$. Report the gradients, the iterates $x_1,x_2,x_3$ and the values of $f$. Find $L$ and check that $\\alpha<2/L$.",
    "ru": "Пусть $f(x,y)={{B1.params.a}}x^2{{B1.params.bSign}}{{B1.params.bAbs}}xy+{{B1.params.c}}y^2$. Из $x_0={{B1.params.x0}}$ сделайте три шага градиентного спуска с $\\alpha={{B1.params.alpha}}$. Укажите градиенты, итерации $x_1,x_2,x_3$, значения $f$. Найдите $L$ и проверьте, что $\\alpha<2/L$."
   },
   "answers": [
    {
     "id": "f1",
     "ref": "answers.B1.f1",
     "label": {
      "en": "$f(x_1)$",
      "ru": "$f(x_1)$"
     }
    },
    {
     "id": "f3",
     "ref": "answers.B1.f3",
     "label": {
      "en": "$f(x_3)$",
      "ru": "$f(x_3)$"
     }
    },
    {
     "id": "L",
     "ref": "answers.B1.L",
     "label": {
      "en": "$L$",
      "ru": "$L$"
     }
    },
    {
     "id": "safe",
     "ref": "answers.B1.safe",
     "label": {
      "en": "Is $\\alpha<2/L$?",
      "ru": "Выполнено ли $\\alpha<2/L$?"
     }
    }
   ],
   "hints": [
    {
     "en": "$\\nabla f=Qx$ with $Q=\\begin{pmatrix}2a&b\\\\b&2c\\end{pmatrix}$. The step is $x^+=(I-\\alpha Q)x$.",
     "ru": "$\\nabla f=Qx$, где $Q=\\begin{pmatrix}2a&b\\\\b&2c\\end{pmatrix}$. Шаг $x^+=(I-\\alpha Q)x$."
    }
   ],
   "steps": [
    {
     "text": {
      "en": "$Q={{B1.Q}}$, so $\\nabla f(x)=Qx$. At $x_0={{B1.params.x0}}$: $\\nabla f(x_0)={{B1.g0}}$. The step is $x_1=x_0-\\alpha\\nabla f(x_0)={{B1.x1}}$ and $f(x_1)={{B1.f1}}$.",
      "ru": "$Q={{B1.Q}}$, значит, $\\nabla f(x)=Qx$. В $x_0={{B1.params.x0}}$: $\\nabla f(x_0)={{B1.g0}}$. Шаг $x_1=x_0-\\alpha\\nabla f(x_0)={{B1.x1}}$, $f(x_1)={{B1.f1}}$."
     }
    },
    {
     "text": {
      "en": "At $x_1$: $\\nabla f(x_1)={{B1.g1}}$, $x_2={{B1.x2}}$, $f(x_2)={{B1.f2}}$. At $x_2$: $\\nabla f(x_2)={{B1.g2}}$, $x_3={{B1.x3}}$, $f(x_3)={{B1.f3}}$. The values fall from ${{B1.f0}}$ to ${{B1.f3}}$.",
      "ru": "В $x_1$: $\\nabla f(x_1)={{B1.g1}}$, $x_2={{B1.x2}}$, $f(x_2)={{B1.f2}}$. В $x_2$: $\\nabla f(x_2)={{B1.g2}}$, $x_3={{B1.x3}}$, $f(x_3)={{B1.f3}}$. Значения уменьшаются с ${{B1.f0}}$ до ${{B1.f3}}$."
     }
    },
    {
     "text": {
      "en": "Eigenvalues of $Q$: $\\lambda_{\\min}={{B1.mu}}$ and $\\lambda_{\\max}={{B1.L}}$, so $L={{B1.L}}$ and $2/L={{B1.twoOverL}}$. Here $\\alpha={{B1.params.alpha}}<{{B1.twoOverL}}$: the step is safe.",
      "ru": "Собственные значения $Q$: $\\lambda_{\\min}={{B1.mu}}$ и $\\lambda_{\\max}={{B1.L}}$, значит, $L={{B1.L}}$ и $2/L={{B1.twoOverL}}$. Здесь $\\alpha={{B1.params.alpha}}<{{B1.twoOverL}}$: шаг безопасен."
     }
    },
    {
     "text": {
      "en": "The contraction factor along the slowest axis is $1-\\alpha\\mu={{B1.slow}}$; the ratio $\\|x_3\\|/\\|x_0\\|={{B1.ratio}}$ matches it to within the two-axis mixing. The iterates head to $(0,0)$.",
      "ru": "Коэффициент сжатия на самой медленной оси равен $1-\\alpha\\mu={{B1.slow}}$; отношение $\\|x_3\\|/\\|x_0\\|={{B1.ratio}}$ совпадает с ним с точностью до смешивания двух осей. Итерации идут в $(0,0)$."
     }
    }
   ],
   "answerText": {
    "en": "$f(x_1)={{B1.f1}}$, $f(x_3)={{B1.f3}}$; $L={{B1.L}}$, $\\alpha<2/L$ holds.",
    "ru": "$f(x_1)={{B1.f1}}$, $f(x_3)={{B1.f3}}$; $L={{B1.L}}$, условие $\\alpha<2/L$ выполнено."
   },
   "review": {
    "en": "Write $Q$ and the step formula on the first line, then let the iteration fall out of three substitutions.",
    "ru": "В первой строке выпишите $Q$ и формулу шага, дальше три подстановки сами дадут итерацию."
   },
   "mistakes": [],
   "figure": {
    "src": "fig_b1",
    "alt": {
     "en": "Three gradient-descent steps on problem B1 on the contour plot.",
     "ru": "Три шага градиентного спуска из задачи B1 на линиях уровня."
    },
    "caption": {
     "en": "Three gradient-descent steps on problem B1 on the contour plot.",
     "ru": "Три шага градиентного спуска из задачи B1 на линиях уровня."
    }
   }
  },
  "B2": {
   "who": "students",
   "title": {
    "en": "Three steps on a diagonal quadratic",
    "ru": "Три шага на диагональной квадратичной функции"
   },
   "statement": {
    "en": "Let $f(x,y)={{B2.params.a}}x^2+{{B2.params.c}}y^2$. From $x_0={{B2.params.x0}}$ take three steps of gradient descent with $\\alpha={{B2.params.alpha}}$. Report $f(x_1)$, $f(x_3)$, $L$ and whether the step is safe.",
    "ru": "Пусть $f(x,y)={{B2.params.a}}x^2+{{B2.params.c}}y^2$. Из $x_0={{B2.params.x0}}$ сделайте три шага градиентного спуска с $\\alpha={{B2.params.alpha}}$. Укажите $f(x_1)$, $f(x_3)$, $L$ и безопасен ли шаг."
   },
   "answers": [
    {
     "id": "f1",
     "ref": "answers.B2.f1",
     "label": {
      "en": "$f(x_1)$",
      "ru": "$f(x_1)$"
     }
    },
    {
     "id": "f3",
     "ref": "answers.B2.f3",
     "label": {
      "en": "$f(x_3)$",
      "ru": "$f(x_3)$"
     }
    },
    {
     "id": "L",
     "ref": "answers.B2.L",
     "label": {
      "en": "$L$",
      "ru": "$L$"
     }
    },
    {
     "id": "safe",
     "ref": "answers.B2.safe",
     "label": {
      "en": "Is $\\alpha<2/L$?",
      "ru": "Выполнено ли $\\alpha<2/L$?"
     }
    }
   ]
  }
 }
}/*JSON-END*/);
