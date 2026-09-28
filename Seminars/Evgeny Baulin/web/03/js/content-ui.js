// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Seminar 03 content: the interface strings of this seminar (titles, the lock, the instructor's session), in
// English and Russian. They take precedence over the course-wide strings in shared/js/content-common.js.
// Strict JSON between the markers. Placeholders in {braces} are filled by the page.
window.SEM = window.SEM || {};
window.SEM.content = window.SEM.content || {};
Object.assign(window.SEM.content, /*JSON-BEGIN*/{
 "seminar": {
  "meta": {
   "seminarLabel": {
    "en": "Seminar 03",
    "ru": "Семинар 3"
   },
   "seminarTitle": {
    "en": "Gradient Descent and Automatic Differentiation",
    "ru": "Градиентный спуск и автоматическое дифференцирование"
   },
   "pageTitle": {
    "main": {
     "en": "Seminar 03: Gradient Descent and Automatic Differentiation",
     "ru": "Семинар 3: градиентный спуск и автоматическое дифференцирование"
    },
    "theory": {
     "en": "Seminar 03 theory handout",
     "ru": "Семинар 3: конспект теории"
    },
    "cheatsheet": {
     "en": "Seminar 03 cheat sheet",
     "ru": "Семинар 3: шпаргалка"
    }
   }
  },
  "blocks": {
   "ownNote": {
    "en": "Solve both problems on paper, then type the numbers you got.",
    "ru": "Решите обе задачи на бумаге, затем введите полученные числа."
   },
   "overviewNote": {
    "en": "All the statements of the seminar on one screen, for a photograph.",
    "ru": "Все условия семинара на одном экране, чтобы их можно было сфотографировать."
   },
   "summary": {
    "en": "Three takeaways",
    "ru": "Три главных вывода"
   }
  },
  "access": {
   "opensAt": {
    "en": "Checking opens on {{release.day}} at {{timeline.clock.end}}, Moscow time.",
    "ru": "Проверка откроется {{release.dayRu}} в {{timeline.clock.end}} по московскому времени."
   },
   "lockedProblem": {
    "en": "Hints, checking and the solution open on {{release.day}} at {{timeline.clock.end}}, Moscow time. The page opens them by itself.",
    "ru": "Подсказки, проверка и решение откроются {{release.dayRu}} в {{timeline.clock.end}} по московскому времени. Страница откроет их сама."
   },
   "hiddenProblem": {
    "en": "The solution is hidden while the answers are hidden.",
    "ru": "Пока ответы скрыты, решение тоже скрыто."
   },
   "lockedBlock": {
    "en": "This part opens with the theory handout on {{release.day}} at {{timeline.clock.end}}, Moscow time.",
    "ru": "Эта часть откроется вместе с конспектом теории {{release.dayRu}} в {{timeline.clock.end}} по московскому времени."
   },
   "lockedReview": {
    "en": "The answers appear here after the class.",
    "ru": "Ответы появятся здесь после занятия."
   },
   "lockedHandout": {
    "en": "The theory handout opens on {{release.day}} at {{timeline.clock.end}}, Moscow time. This page opens it by itself; there is no need to reload.",
    "ru": "Конспект теории откроется {{release.dayRu}} в {{timeline.clock.end}} по московскому времени. Страница откроет его сама, перезагружать её не нужно."
   },
   "hiddenHandout": {
    "en": "The handout is hidden while the answers are hidden.",
    "ru": "Пока ответы скрыты, конспект тоже скрыт."
   },
   "banner": {
    "en": "Checking, the solutions and the theory handout are open.",
    "ru": "Проверка ответов, решения и конспект теории открыты."
   },
   "bannerClose": {
    "en": "Close",
    "ru": "Закрыть"
   },
   "reload": {
    "en": "Checking has not opened yet. Reload the page later.",
    "ru": "Проверка ещё не открылась. Перезагрузите страницу позже."
   },
   "badge": {
    "en": "Instructor",
    "ru": "Преподаватель"
   },
   "badgeHidden": {
    "en": "Instructor, answers hidden",
    "ru": "Преподаватель, ответы скрыты"
   },
   "sessionTitle": {
    "en": "Instructor session",
    "ru": "Сеанс преподавателя"
   },
   "loginTitle": {
    "en": "Instructor sign-in",
    "ru": "Вход для преподавателя"
   },
   "login": {
    "en": "Login",
    "ru": "Логин"
   },
   "password": {
    "en": "Password",
    "ru": "Пароль"
   },
   "submit": {
    "en": "Sign in",
    "ru": "Войти"
   },
   "working": {
    "en": "Opening the locked part…",
    "ru": "Открываем закрытую часть…"
   },
   "wrong": {
    "en": "Wrong login or password.",
    "ru": "Неверный логин или пароль."
   },
   "paused": {
    "en": "Too many attempts. Try again in {s} s.",
    "ru": "Слишком много попыток. Попробуйте снова через {s} с."
   },
   "unavailable": {
    "en": "This browser cannot open the locked part here: it needs a secure page (https, localhost or a local file).",
    "ru": "Этот браузер не может открыть здесь закрытую часть: нужна защищённая страница (https, localhost или локальный файл)."
   },
   "loginNote": {
    "en": "The session lasts through reloads and the handout link in this tab; sign out before leaving a shared computer. Do not type the password on the projector.",
    "ru": "Сеанс сохраняется в этой вкладке при перезагрузке и при переходе по ссылке на конспект; прежде чем уйти от общего компьютера, выйдите. Не вводите пароль, когда экран выведен на проектор."
   },
   "signedIn": {
    "en": "Both locked parts are open in this tab. Sign out before leaving a shared computer; a closed tab that the browser reopens later asks for the password again.",
    "ru": "Обе закрытые части открыты в этой вкладке. Прежде чем уйти от общего компьютера, выйдите; если вкладку закрыть, а браузер потом её восстановит, она снова спросит пароль."
   },
   "hide": {
    "en": "Hide the answers, for projecting",
    "ru": "Скрыть ответы для показа на проекторе"
   },
   "signOut": {
    "en": "Sign out",
    "ru": "Выйти"
   },
   "statusFile": {
    "en": "Opened from a file: this page does not ask the server for the release.",
    "ru": "Страница открыта из файла и не спрашивает сервер, открыты ли материалы."
   },
   "statusWaiting": {
    "en": "From {time} the page asks the server for the release every {sec} s, for {min} min.",
    "ru": "С {time} страница будет спрашивать сервер, открыты ли материалы, каждые {sec} с в течение {min} мин."
   },
   "statusPolling": {
    "en": "The page asks the server for the release every {sec} s until {time}.",
    "ru": "Страница спрашивает сервер, открыты ли материалы, каждые {sec} с до {time}."
   },
   "statusStopped": {
    "en": "The page stopped asking the server at {time}; a reload asks once more.",
    "ru": "Страница перестала спрашивать сервер в {time}; после перезагрузки она спросит ещё раз."
   },
   "statusReleased": {
    "en": "The release is published: the students' part is open for everyone.",
    "ru": "Материалы открыты: часть для студентов доступна всем."
   },
   "statusIdle": {
    "en": "This page does not ask the server for the release.",
    "ru": "Эта страница не спрашивает сервер, открыты ли материалы."
   },
   "missing": {
    "en": "The locked part of this page did not load: js/locked.enc.js is missing. Build it with build_lock.py and reload.",
    "ru": "Закрытая часть страницы не загрузилась: нет файла js/locked.enc.js. Соберите его скриптом build_lock.py и перезагрузите страницу."
   },
   "lockedCheatsheet": {
    "en": "The cheat sheet opens on {{release.day}} at {{timeline.clock.end}}, Moscow time. This page opens it by itself; there is no need to reload.",
    "ru": "Шпаргалка откроется {{release.dayRu}} в {{timeline.clock.end}} по московскому времени. Страница откроет её сама, перезагружать её не нужно."
   },
   "hiddenCheatsheet": {
    "en": "The cheat sheet is hidden while the answers are hidden.",
    "ru": "Пока ответы скрыты, шпаргалка тоже скрыта."
   }
  },
  "teacher": {
   "notes": {
    "en": "Instructor notes",
    "ru": "Заметки преподавателя"
   },
   "script": {
    "en": "Say",
    "ru": "Что сказать"
   },
   "board": {
    "en": "Board",
    "ru": "На доске"
   },
   "cues": {
    "en": "Cues",
    "ru": "Ориентиры"
   },
   "say": {
    "en": "Key sentences",
    "ru": "Ключевые фразы"
   },
   "watch": {
    "en": "While they work",
    "ru": "Пока решают"
   }
  },
  "timing": {
   "title": {
    "en": "Timing",
    "ru": "План по времени"
   },
   "block": {
    "en": "Block",
    "ru": "Блок"
   },
   "from": {
    "en": "From",
    "ru": "Начало"
   },
   "length": {
    "en": "Length",
    "ru": "Длительность"
   },
   "parts": {
    "en": "Parts",
    "ru": "Части"
   },
   "buffer": {
    "en": "Buffer",
    "ru": "Запас"
   },
   "total": {
    "en": "Total",
    "ru": "Всего"
   },
   "part": {
    "jensen": {
     "en": "Jensen",
     "ru": "Йенсен"
    },
    "constants": {
     "en": "μ and L",
     "ru": "μ и L"
    },
    "recap": {
     "en": "recap",
     "ru": "повторение"
    },
    "P1": {
     "en": "board",
     "ru": "у доски"
    },
    "P23": {
     "en": "timer",
     "ru": "таймер"
    },
    "review": {
     "en": "review",
     "ru": "разбор"
    },
    "D1": {
     "en": "D1",
     "ru": "D1"
    },
    "D2": {
     "en": "D2",
     "ru": "D2"
    },
    "D3": {
     "en": "D3",
     "ru": "D3"
    },
    "D4": {
     "en": "D4",
     "ru": "D4"
    },
    "summary": {
     "en": "takeaways",
     "ru": "выводы"
    },
    "exit": {
     "en": "exit ticket",
     "ru": "вопросы на выход"
    },
    "home": {
     "en": "home practice",
     "ru": "домашняя практика"
    }
   }
  },
  "feedback": {
   "wrongNumber": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "wrongSign": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "negativeMultiplier": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "component1": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "component2": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "component3": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "component4": {
    "en": "Not correct.",
    "ru": "Неверно."
   },
   "componentN": {
    "en": "Not correct.",
    "ru": "Неверно."
   }
  },
  "pages": {
   "convention": {
    "en": "Notation",
    "ru": "Обозначения"
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
     "ru": "Запустить таймер или поставить на паузу, сбросить"
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
     "cheatsheet"
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
     "cheatsheet"
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
     "cheatsheet"
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
     "en": "Instructor sign-in and session",
     "ru": "Вход и сеанс преподавателя"
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
     "cheatsheet"
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
     "cheatsheet"
    ]
   }
  ]
 }
}/*JSON-END*/);
