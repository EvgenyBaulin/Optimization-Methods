// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Course content shared by every page: the generic interface strings and the registry of the topics, in English and Russian.
// Strict JSON between the markers. Placeholders in {braces} are filled by the page. The seminar's own strings are in NN/js/content-ui.js.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "ui": {
  "meta": {
   "course": {
    "en": "Optimization Methods",
    "ru": "Методы оптимизации"
   },
   "pageName": {
    "theory": {
     "en": "Theory handout",
     "ru": "Конспект теории"
    },
    "cheatsheet": {
     "en": "Cheat sheet",
     "ru": "Шпаргалка"
    },
    "home": {
     "en": "Seminars",
     "ru": "Семинары"
    }
   },
   "pageTitle": {
    "home": {
     "en": "Optimization Methods: seminars",
     "ru": "Методы оптимизации: семинары"
    }
   },
   "lecturerCredit": {
    "en": "Course lecturer: Andrey Ignatov",
    "ru": "Лектор курса: Андрей Игнатов"
   },
   "authorCredit": {
    "en": "Seminar materials: Evgeny Baulin",
    "ru": "Материалы семинара: Евгений Баулин"
   },
   "author": {
    "en": "Evgeny Baulin",
    "ru": "Евгений Баулин"
   },
   "telegram": {
    "en": "Telegram: @tarakan_tuc",
    "ru": "Телеграм: @tarakan_tuc"
   },
   "institution": {
    "en": "HSE University, Faculty of Computer Science",
    "ru": "НИУ ВШЭ, факультет компьютерных наук"
   },
   "year": {
    "en": "Academic year 2026–2027",
    "ru": "2026–2027 учебный год"
   },
   "license": {
    "en": "MIT License",
    "ru": "Лицензия MIT"
   },
   "copyright": {
    "en": "Copyright (c) 2026 Evgeny Baulin",
    "ru": "© 2026 Евгений Баулин"
   }
  },
  "controls": {
   "toolbar": {
    "en": "Seminar controls",
    "ru": "Управление семинаром"
   },
   "toolbarHome": {
    "en": "Page controls",
    "ru": "Управление страницей"
   },
   "navigation": {
    "en": "Blocks of the seminar",
    "ru": "Блоки семинара"
   },
   "skip": {
    "en": "Skip to the content",
    "ru": "Перейти к содержанию"
   },
   "toSeminar": {
    "en": "Seminar page",
    "ru": "Страница семинара"
   },
   "toTheory": {
    "en": "Theory",
    "ru": "Теория"
   },
   "toCheatsheet": {
    "en": "Cheat sheet",
    "ru": "Шпаргалка"
   },
   "overview": {
    "en": "Problems",
    "ru": "Задачи"
   },
   "language": {
    "en": "RU",
    "ru": "EN"
   },
   "theme": {
    "en": "Theme",
    "ru": "Тема"
   },
   "present": {
    "en": "Present",
    "ru": "Показ"
   },
   "instructor": {
    "en": "Instructor",
    "ru": "Для преподавателя"
   },
   "print": {
    "en": "Print",
    "ru": "Печать"
   },
   "shortcuts": {
    "en": "Keys",
    "ru": "Клавиши"
   },
   "topics": {
    "en": "Topics",
    "ru": "Темы курса"
   },
   "close": {
    "en": "Close",
    "ru": "Закрыть"
   },
   "instructorOn": {
    "en": "Instructor mode",
    "ru": "Режим преподавателя"
   },
   "timerStart": {
    "en": "Start the timer",
    "ru": "Запустить таймер"
   },
   "timerPause": {
    "en": "Pause the timer",
    "ru": "Поставить таймер на паузу"
   },
   "timerToggle": {
    "en": "Start or pause the timer",
    "ru": "Запустить таймер или поставить на паузу"
   },
   "timerReset": {
    "en": "Reset",
    "ru": "Сбросить"
   },
   "timerMinus": {
    "en": "One minute less",
    "ru": "На минуту меньше"
   },
   "timerPlus": {
    "en": "One minute more",
    "ru": "На минуту больше"
   }
  },
  "blocks": {
   "planned": {
    "en": "Planned: {time}",
    "ru": "План: {time}"
   },
   "plannedFrom": {
    "en": "Planned: {time}, from {start}",
    "ru": "План: {time}, с {start}"
   },
   "recap": {
    "en": "Recap",
    "ru": "Напоминание"
   },
   "explore": {
    "en": "Explore",
    "ru": "Исследование"
   },
   "exploreNote": {
    "en": "Shown during the recap and the review: the plan gives it no time of its own.",
    "ru": "Показывается по ходу напоминания и разбора: отдельного времени в плане у него нет."
   },
   "codeNote": {
    "en": "Reference to open after the seminar: it is not part of the planned time.",
    "ru": "Справочный материал: читается после семинара, в план занятия не входит."
   },
   "worked": {
    "en": "Worked example on the board",
    "ru": "Разбор у доски"
   },
   "own": {
    "en": "On your own",
    "ru": "Самостоятельно"
   },
   "startTimer": {
    "en": "Start the {time} timer",
    "ru": "Запустить таймер на {time}"
   },
   "review": {
    "en": "Review",
    "ru": "Разбор"
   },
   "showAnswers": {
    "en": "Show the answers",
    "ru": "Показать ответы"
   },
   "hideAnswers": {
    "en": "Hide the answers",
    "ru": "Скрыть ответы"
   },
   "cutReview": {
    "en": "Running late: answers only, {time}.",
    "ru": "Если не успеваем: только ответы, {time}."
   },
   "buffer": {
    "en": "Buffer: {time}. Total: {total}.",
    "ru": "Запас: {time}. Всего: {total}."
   },
   "mistakes": {
    "en": "Common mistakes",
    "ru": "Типичные ошибки"
   },
   "openOverview": {
    "en": "Open the overview",
    "ru": "Открыть обзор задач"
   },
   "overviewTitle": {
    "en": "Problems of the seminar",
    "ru": "Задачи семинара"
   }
  },
  "problem": {
   "board": {
    "en": "On the board",
    "ru": "У доски"
   },
   "students": {
    "en": "On your own",
    "ru": "Самостоятельно"
   },
   "byHand": {
    "en": "By hand",
    "ru": "На бумаге"
   },
   "inCode": {
    "en": "In code",
    "ru": "В коде"
   },
   "predict": {
    "en": "Predict:",
    "ru": "Прогноз:"
   },
   "prev": {
    "en": "Previous step",
    "ru": "Предыдущий шаг"
   },
   "next": {
    "en": "Next step",
    "ru": "Следующий шаг"
   },
   "showAll": {
    "en": "Show all steps",
    "ru": "Показать все шаги"
   },
   "stepCount": {
    "en": "Steps shown: {n} of {total}",
    "ru": "Показано шагов: {n} из {total}"
   },
   "solution": {
    "en": "Solution",
    "ru": "Решение"
   },
   "answer": {
    "en": "Answer:",
    "ru": "Ответ:"
   },
   "yourAnswers": {
    "en": "Check your answers",
    "ru": "Проверьте свои ответы"
   },
   "selfStudy": {
    "en": "For self-study: hints and answer check",
    "ru": "Для самостоятельной работы: подсказки и проверка ответа"
   },
   "locked": {
    "en": "The solution opens after your first answer.",
    "ru": "Решение откроется после первого ответа."
   },
   "mistakes": {
    "en": "Common mistakes",
    "ru": "Типичные ошибки"
   },
   "hintNext": {
    "en": "Show hint {n} of {total}",
    "ru": "Показать подсказку {n} из {total}"
   },
   "check": {
    "en": "Check",
    "ru": "Проверить"
   },
   "left": {
    "en": "left end",
    "ru": "левый конец"
   },
   "right": {
    "en": "right end",
    "ru": "правый конец"
   },
   "formulaPlaceholder": {
    "en": "a formula in {vars}",
    "ru": "формула от {vars}"
   },
   "matrixEntry": {
    "en": "Row {i}, column {j}",
    "ru": "Строка {i}, столбец {j}"
   },
   "pointsPlaceholder": {
    "en": "(a, b); (c, d)",
    "ru": "(a; b); (c; d)"
   },
   "pointsPlaceholder3": {
    "en": "(a, b, c); (d, e, f)",
    "ru": "(a; b; c); (d; e; f)"
   },
   "pointsHint": {
    "en": "Each point in parentheses, the points separated by semicolons, in any order.",
    "ru": "Каждая точка в скобках, точки через точку с запятой, в любом порядке."
   }
  },
  "feedback": {
   "correct": {
    "en": "Correct.",
    "ru": "Верно."
   },
   "empty": {
    "en": "Enter an answer first.",
    "ru": "Сначала введите ответ."
   },
   "emptyChoice": {
    "en": "Choose an option first.",
    "ru": "Сначала выберите вариант."
   },
   "emptyComponent": {
    "en": "Fill in every field.",
    "ru": "Заполните все поля."
   },
   "unreadable": {
    "en": "Could not read the number. Use decimals, fractions such as 1/2, or sqrt(2).",
    "ru": "Не удалось прочитать число. Используйте десятичные дроби, дроби вида 1/2 или sqrt(2)."
   },
   "unreadableComponent": {
    "en": "Could not read one of the coordinates.",
    "ru": "Не удалось прочитать одну из координат."
   },
   "unreadableFormula": {
    "en": "Could not read the formula.",
    "ru": "Не удалось прочитать формулу."
   },
   "wrongNumber": {
    "en": "Not quite: the value is off.",
    "ru": "Пока неверно: значение отличается."
   },
   "wrongSign": {
    "en": "The sign is off.",
    "ru": "Неверен знак."
   },
   "negativeMultiplier": {
    "en": "A multiplier of an inequality constraint must be nonnegative.",
    "ru": "Множитель ограничения-неравенства должен быть неотрицательным."
   },
   "component1": {
    "en": "The first coordinate is off.",
    "ru": "Первая координата неверна."
   },
   "component2": {
    "en": "The second coordinate is off.",
    "ru": "Вторая координата неверна."
   },
   "component3": {
    "en": "The third coordinate is off.",
    "ru": "Третья координата неверна."
   },
   "component4": {
    "en": "The fourth coordinate is off.",
    "ru": "Четвёртая координата неверна."
   },
   "componentN": {
    "en": "Coordinate {n} is off.",
    "ru": "Координата {n} неверна."
   },
   "wrongLeft": {
    "en": "The left endpoint is off.",
    "ru": "Левый конец неверен."
   },
   "wrongRight": {
    "en": "The right endpoint is off.",
    "ru": "Правый конец неверен."
   },
   "wrongFormula": {
    "en": "The formula differs from the reference at some values of the variable.",
    "ru": "Формула отличается от эталонной при некоторых значениях переменной."
   },
   "wrongChoice": {
    "en": "Not this one.",
    "ru": "Нет, не этот вариант."
   },
   "multipleExtra": {
    "en": "One of the selected options is wrong.",
    "ru": "Один из выбранных вариантов неверен."
   },
   "multipleMissing": {
    "en": "An option is missing.",
    "ru": "Выбраны не все верные варианты."
   },
   "entry": {
    "en": "The entry in row {i}, column {j} is off.",
    "ru": "Элемент в строке {i}, столбце {j} неверен."
   },
   "unreadableEntry": {
    "en": "Could not read one of the entries.",
    "ru": "Не удалось прочитать один из элементов."
   },
   "negativeEntry": {
    "en": "Every entry must be nonnegative.",
    "ru": "Все элементы должны быть неотрицательными."
   },
   "pointsMissing": {
    "en": "A point is missing.",
    "ru": "Указаны не все точки."
   },
   "pointsExtra": {
    "en": "One of the points does not belong to the answer.",
    "ru": "Одна из указанных точек не входит в ответ."
   },
   "unreadablePoints": {
    "en": "Could not read the points: put each point in parentheses and separate the points with semicolons.",
    "ru": "Не удалось прочитать точки: заключите каждую точку в скобки и разделите точки точкой с запятой."
   },
   "pointsDimension": {
    "en": "Every point needs {n} coordinates.",
    "ru": "Каждая точка задаётся {n} координатами."
   }
  },
  "widgets": {
   "showAnswer": {
    "en": "Show the answer",
    "ru": "Показать ответ"
   },
   "showResult": {
    "en": "Show the result",
    "ru": "Показать результат"
   },
   "reset": {
    "en": "Reset",
    "ru": "Сбросить"
   },
   "run": {
    "en": "Run",
    "ru": "Запустить"
   },
   "copy": {
    "en": "Copy",
    "ru": "Копировать"
   },
   "copied": {
    "en": "Copied",
    "ru": "Скопировано"
   }
  },
  "selftest": {
   "title": {
    "en": "Self-test",
    "ru": "Самопроверка"
   },
   "passed": {
    "en": "All checks passed: {passed} of {total}.",
    "ru": "Все проверки пройдены: {passed} из {total}."
   },
   "failed": {
    "en": "Checks passed: {passed} of {total}. The failures are listed below.",
    "ru": "Пройдено проверок: {passed} из {total}. Ошибки перечислены ниже."
   },
   "group": {
    "en": "{name}: {ok} of {n}",
    "ru": "{name}: {ok} из {n}"
   },
   "groups": {
    "data": {
     "en": "Widget numerics against the exported data",
     "ru": "Сверка чисел виджетов с экспортом"
    },
    "answers": {
     "en": "Answer checker on the reference answers",
     "ru": "Проверка ответов на эталонных значениях"
    },
    "content": {
     "en": "Tokens, strings and formulas of the content",
     "ru": "Токены, строки и формулы контента"
    },
    "languages": {
     "en": "Rendering in both languages",
     "ru": "Отрисовка на обоих языках"
    }
   }
  },
  "pages": {
   "pdf": {
    "en": "PDF version",
    "ru": "Версия в PDF"
   },
   "example": {
    "en": "Example",
    "ru": "Пример"
   },
   "intuition": {
    "en": "Why",
    "ru": "Почему"
   },
   "convention": {
    "en": "Sign convention",
    "ru": "Соглашение о знаках"
   },
   "toc": {
    "en": "Contents",
    "ru": "Содержание"
   },
   "glossaryEn": {
    "en": "English",
    "ru": "Английский"
   },
   "glossaryRu": {
    "en": "Russian",
    "ru": "Русский"
   },
   "glossaryNote": {
    "en": "Meaning",
    "ru": "Значение"
   },
   "definition": {
    "en": "Definition",
    "ru": "Определение"
   },
   "theorem": {
    "en": "Theorem",
    "ru": "Теорема"
   },
   "lemma": {
    "en": "Lemma",
    "ru": "Лемма"
   },
   "corollary": {
    "en": "Corollary",
    "ru": "Следствие"
   },
   "proposition": {
    "en": "Proposition",
    "ru": "Утверждение"
   },
   "proof": {
    "en": "Proof",
    "ru": "Доказательство"
   },
   "trap": {
    "en": "Trap",
    "ru": "Ловушка"
   },
   "selfcheck": {
    "en": "Check yourself",
    "ru": "Проверьте себя"
   },
   "answer": {
    "en": "Answer",
    "ru": "Ответ"
   },
   "code": {
    "en": "Code",
    "ru": "Код"
   }
  },
  "courseNav": {
   "label": {
    "en": "Topics of the course",
    "ru": "Темы курса"
   },
   "home": {
    "en": "All topics of the course",
    "ru": "Все темы курса"
   },
   "atlas": {
    "en": "Optimization Atlas",
    "ru": "Атлас оптимизации"
   },
   "atlasTitle": {
    "en": "Interactive reference for the whole course",
    "ru": "Интерактивный справочник по всему курсу"
   },
   "seminars": {
    "en": "Seminars",
    "ru": "Семинары"
   },
   "later": {
    "en": "Coming later",
    "ru": "Появится позже"
   },
   "pages": {
    "main": {
     "en": "Seminar",
     "ru": "Семинар"
    },
    "theory": {
     "en": "Theory",
     "ru": "Теория"
    },
    "cheatsheet": {
     "en": "Cheat sheet",
     "ru": "Шпаргалка"
    }
   }
  },
  "home": {
   "lead": {
    "en": "Every topic of the course gets an interactive seminar page, a theory handout with the problems solved, and a one-page cheat sheet, in English and Russian. The handout and the cheat sheet are also available as PDF.",
    "ru": "Для каждой темы курса есть интерактивная страница семинара, конспект теории с решёнными задачами и шпаргалка на одну страницу, на русском и английском языках. Конспект и шпаргалка есть также в PDF."
   },
   "topics": {
    "en": "Topics",
    "ru": "Темы"
   },
   "number": {
    "en": "Seminar {nn}",
    "ru": "Семинар {n}"
   },
   "theoryPdf": {
    "en": "Theory (PDF)",
    "ru": "Теория (PDF)"
   },
   "cheatsheetPdf": {
    "en": "Cheat sheet (PDF)",
    "ru": "Шпаргалка (PDF)"
   }
  },
  "shortcuts": [
   {
    "keys": [
     "→",
     "␣"
    ],
    "action": {
     "en": "Next step of the focused solution",
     "ru": "Следующий шаг выбранного решения"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "←"
    ],
    "action": {
     "en": "Previous step",
     "ru": "Предыдущий шаг"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "N",
     "B"
    ],
    "action": {
     "en": "Next or previous block",
     "ru": "Следующий или предыдущий блок"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "O"
    ],
    "action": {
     "en": "Problems overview",
     "ru": "Обзор задач"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "T",
     "R"
    ],
    "action": {
     "en": "Start or pause the timer, reset it",
     "ru": "Запустить или остановить таймер, сбросить его"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "M"
    ],
    "action": {
     "en": "Topics of the course",
     "ru": "Темы курса"
    },
    "pages": [
     "main",
     "theory",
     "cheatsheet",
     "home"
    ]
   },
   {
    "keys": [
     "L"
    ],
    "action": {
     "en": "Language",
     "ru": "Язык"
    },
    "pages": [
     "main",
     "theory",
     "cheatsheet",
     "home"
    ]
   },
   {
    "keys": [
     "D"
    ],
    "action": {
     "en": "Theme",
     "ru": "Тема оформления"
    },
    "pages": [
     "main",
     "theory",
     "cheatsheet",
     "home"
    ]
   },
   {
    "keys": [
     "F"
    ],
    "action": {
     "en": "Present mode",
     "ru": "Режим показа"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "I"
    ],
    "action": {
     "en": "Instructor mode",
     "ru": "Режим преподавателя"
    },
    "pages": [
     "main"
    ]
   },
   {
    "keys": [
     "P"
    ],
    "action": {
     "en": "Print",
     "ru": "Печать"
    },
    "pages": [
     "theory",
     "cheatsheet"
    ]
   },
   {
    "keys": [
     "?"
    ],
    "action": {
     "en": "This list",
     "ru": "Этот список"
    },
    "pages": [
     "main",
     "theory",
     "cheatsheet",
     "home"
    ]
   },
   {
    "keys": [
     "Esc"
    ],
    "action": {
     "en": "Close a dialog or the list of topics",
     "ru": "Закрыть окно или список тем"
    },
    "pages": [
     "main",
     "theory",
     "cheatsheet",
     "home"
    ]
   }
  ]
 },
 "course": {
  "atlas": {
   "site": "../",
   "repo": "../../../Atlas/index.html"
  },
  "topics": [
   {
    "n": 1,
    "dir": "01",
    "available": true,
    "title": {
     "en": "Optimization as the Foundation of Machine Learning",
     "ru": "Оптимизация как основа машинного обучения"
    }
   },
   {
    "n": 2,
    "dir": "02",
    "available": true,
    "title": {
     "en": "Convexity, Constraints and Optimality Conditions",
     "ru": "Выпуклость, ограничения и условия оптимальности"
    }
   },
   {
    "n": 3,
    "dir": "03",
    "available": false,
    "title": {
     "en": "Gradient Descent and Automatic Differentiation",
     "ru": "Градиентный спуск и автоматическое дифференцирование"
    }
   },
   {
    "n": 4,
    "dir": "04",
    "available": false,
    "title": {
     "en": "Accelerated Gradient Methods",
     "ru": "Ускоренные градиентные методы"
    }
   },
   {
    "n": 5,
    "dir": "05",
    "available": false,
    "title": {
     "en": "Stochastic Optimization and Modern ML Optimizers",
     "ru": "Стохастическая оптимизация и современные оптимизаторы в машинном обучении"
    }
   },
   {
    "n": 6,
    "dir": "06",
    "available": false,
    "title": {
     "en": "Second-Order and Quasi-Newton Methods",
     "ru": "Методы второго порядка и квазиньютоновские методы"
    }
   },
   {
    "n": 7,
    "dir": "07",
    "available": false,
    "title": {
     "en": "Nonsmooth, Composite and Constrained Optimization",
     "ru": "Негладкая, составная и условная оптимизация"
    }
   },
   {
    "n": 8,
    "dir": "08",
    "available": false,
    "title": {
     "en": "Introduction to Discrete Optimization and Mathematical Modelling",
     "ru": "Введение в дискретную оптимизацию и математическое моделирование"
    }
   },
   {
    "n": 9,
    "dir": "09",
    "available": false,
    "title": {
     "en": "Linear Programming as the Foundation of Integer Optimization",
     "ru": "Линейное программирование как основа целочисленной оптимизации"
    }
   },
   {
    "n": 10,
    "dir": "10",
    "available": false,
    "title": {
     "en": "MILP and the Anatomy of Modern Solvers",
     "ru": "MILP и устройство современных солверов"
    }
   },
   {
    "n": 11,
    "dir": "11",
    "available": false,
    "title": {
     "en": "Dynamic Programming and Packing Problems",
     "ru": "Динамическое программирование и задачи упаковки"
    }
   },
   {
    "n": 12,
    "dir": "12",
    "available": false,
    "title": {
     "en": "Network Problems and Transportation Optimization",
     "ru": "Сетевые задачи и транспортная оптимизация"
    }
   },
   {
    "n": 13,
    "dir": "13",
    "available": false,
    "title": {
     "en": "Constraint Programming, SAT and CP-SAT",
     "ru": "Программирование в ограничениях, SAT и CP-SAT"
    }
   },
   {
    "n": 14,
    "dir": "14",
    "available": false,
    "title": {
     "en": "Routing, Local Search and Metaheuristics",
     "ru": "Маршрутизация, локальный поиск и метаэвристики"
    }
   }
  ]
 }
}/*JSON-END*/);
