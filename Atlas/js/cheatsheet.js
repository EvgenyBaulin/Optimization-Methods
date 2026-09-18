// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
/* ==========================================================================
   Optimization Atlas - cheatsheet.js
   Section F: one table covering every method in the course.

   The continuous, stochastic and constrained rows are GENERATED from
   Atlas.methods, so the table can never drift away from the code that runs
   in the playgrounds: registering a method adds its row automatically.
   The discrete rows are declared here, because section E is built from
   widgets rather than from method objects, and because their honest summary
   is a complexity class and a practical size limit rather than a rate.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas;
  var el = Atlas.dom.el;
  var clear = Atlas.dom.clear;
  var t = Atlas.t, L = Atlas.L;

  /* =======================================================================
     Discrete rows
     ===================================================================== */

  var DISCRETE_ROWS = [
    {
      name: L('Simplex method', 'Симплекс-метод'), family: 'discrete', order: 'na', support: ['constraints'],
      color: Atlas.palette.blue, widget: 'lp',
      requires: L('a linear objective and linear constraints',
                  'линейная целевая функция и линейные ограничения'),
      cost: L('one pivot, O(m·n) on a dense tableau',
              'одна смена базиса, O(m·n) для плотной симплекс-таблицы'),
      memory: L('O(m·n), or a factorised basis when sparse',
                'O(m·n) или факторизованный базис для разреженных задач'),
      rate: L('exponential in the worst case, but a small multiple of m pivots in practice · millions of variables routinely',
              'экспоненциально в худшем случае, но на практике число смен базиса обычно лишь в несколько раз больше m · миллионы переменных — обычное дело'),
      hyper: L('pivot rule: Dantzig, steepest edge, devex',
               'правило выбора ведущего элемента: по Данцигу, наискорейшее ребро, devex'),
      use: L('any linear program, and as the engine inside branch and bound',
             'любая задача ЛП; кроме того, это ядро метода ветвей и границ'),
      weak: L('the worst case really is exponential (Klee-Minty), and it returns a vertex, not an interior point',
              'худший случай действительно экспоненциален (пример Кли–Минти), и метод возвращает вершину, а не внутреннюю точку')
    },
    {
      name: L('Interior point (barrier)', 'Метод внутренней точки (барьерный)'), family: 'discrete', order: 'na', support: ['constraints'],
      color: Atlas.palette.cyan, widget: 'lp',
      requires: L('a linear or convex quadratic problem, and a strictly feasible start',
                  'линейная или выпуклая квадратичная задача и строго допустимая начальная точка'),
      cost: L('one Newton system per iteration',
              'одна система Ньютона на итерацию'),
      memory: L('O(n²) dense, far less on sparse structure',
                'O(n²) для плотных задач, гораздо меньше при разреженной структуре'),
      rate: L('O(√n·log(1/ε)) iterations, genuinely polynomial · millions of sparse variables',
              'O(√n·log(1/ε)) итераций, по-настоящему полиномиально · миллионы переменных в разреженных задачах'),
      hyper: L('barrier parameter schedule and centring',
               'расписание барьерного параметра и центрирование'),
      use: L('very large sparse linear programs where simplex stalls',
             'очень большие разреженные задачи ЛП, на которых симплекс-метод буксует'),
      weak: L('no useful warm start, and the answer is interior rather than a vertex',
              'полезного тёплого старта нет, и ответ — внутренняя точка, а не вершина')
    },
    {
      name: L('LP relaxation + rounding', 'ЛП-релаксация + округление'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.rose, widget: 'integrality',
      requires: L('an integer program whose relaxation is easy',
                  'целочисленная задача с легко решаемой релаксацией'),
      cost: L('one LP solve',
              'одно решение ЛП'),
      memory: L('as the LP',
                'как у ЛП'),
      rate: L('polynomial · as large as the LP, but the answer may be infeasible or far from optimal',
              'полиномиально · те же размеры задач, что и для ЛП, но ответ может оказаться недопустимым или далёким от оптимума'),
      hyper: L('the rounding rule itself',
               'само правило округления'),
      use: L('a fast bound, and a starting incumbent for a real solver',
             'быстрая граница и начальный рекорд для настоящего решателя'),
      weak: L('rounding can leave the feasible region entirely, and the gap is unbounded in general',
              'после округления точка может оказаться вовсе вне допустимого множества, а зазор в общем случае не ограничен')
    },
    {
      name: L('Branch and bound', 'Метод ветвей и границ'), family: 'discrete', order: 'na', support: ['integer', 'constraints'],
      color: Atlas.palette.orange, widget: 'bnb',
      requires: L('a relaxation that gives a valid bound, and a branching rule',
                  'релаксация, дающая корректную границу, и правило ветвления'),
      cost: L('one relaxation solve per node',
              'одно решение релаксации на узел'),
      memory: L('O(open nodes), which is the real limit',
                'O(число открытых узлов) — это и есть реальный предел'),
      rate: L('exponential worst case · 10³ to 10⁶ integer variables with a modern solver',
              'экспоненциально в худшем случае · от 10³ до 10⁶ целочисленных переменных с современным решателем'),
      hyper: L('node selection, branching variable, when to stop',
               'выбор узла, переменная ветвления, критерий остановки'),
      use: L('the exact method for mixed integer programming',
             'точный метод смешанного целочисленного программирования'),
      weak: L('a weak relaxation means an enormous tree, and memory runs out before time does',
              'слабая релаксация даёт огромное дерево, и память кончается раньше, чем время')
    },
    {
      name: L('Cutting planes (Gomory)', 'Отсекающие плоскости (Гомори)'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.purple, widget: 'integrality',
      requires: L('a fractional LP solution to cut off',
                  'дробное решение ЛП, которое нужно отсечь'),
      cost: L('one LP re-solve per round of cuts',
              'одно повторное решение ЛП на раунд отсечений'),
      memory: L('grows with every cut added',
                'растёт с каждым добавленным отсечением'),
      rate: L('finite termination in theory, slow alone · used in rounds of tens, not thousands',
              'в теории конечное число шагов, в одиночку медленно · на практике — десятки раундов, а не тысячи'),
      hyper: L('which cut families, how many rounds, when to purge',
               'какие семейства отсечений, сколько раундов, когда чистить пул'),
      use: L('tightening the relaxation toward the integer hull',
             'подтягивание релаксации к выпуклой оболочке целых точек'),
      weak: L('numerically fragile and slow on its own; it earns its keep only inside branch and cut',
              'численно неустойчивый и в одиночку медленный подход; оправдывает себя только внутри метода ветвей и отсечений')
    },
    {
      name: L('Branch and cut', 'Метод ветвей и отсечений'), family: 'discrete', order: 'na', support: ['integer', 'constraints'],
      color: Atlas.palette.wine, widget: 'bnb',
      requires: L('both of the above, plus presolve and heuristics',
                  'оба предыдущих метода, а также предобработка и эвристики'),
      cost: L('an LP solve plus cut separation per node',
              'решение ЛП и поиск отсечений в каждом узле'),
      memory: L('O(open nodes) plus the cut pool',
                'O(число открытых узлов) плюс пул отсечений'),
      rate: L('exponential worst case · this is what CPLEX, Gurobi and CBC actually do',
              'экспоненциально в худшем случае · именно так на деле работают CPLEX, Gurobi и CBC'),
      hyper: L('dozens; the defaults are the product of decades of tuning',
               'десятки; значения по умолчанию — плод десятилетий настройки'),
      use: L('production mixed integer programming',
             'промышленное смешанное целочисленное программирование'),
      weak: L('performance is hard to predict, and a small model change can swing the runtime by orders of magnitude',
              'производительность трудно предсказать, а небольшая правка модели может изменить время работы на порядки')
    },
    {
      name: L('Dynamic programming', 'Динамическое программирование'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.teal, widget: 'dp',
      requires: L('optimal substructure and overlapping subproblems',
                  'оптимальная подструктура и перекрывающиеся подзадачи'),
      cost: L('O(1) per cell, n·W cells for the 0/1 knapsack',
              'O(1) на клетку, n·W клеток для рюкзака 0/1'),
      memory: L('O(n·W), or O(W) if the path is not needed',
                'O(n·W) или O(W), если восстанавливать решение не нужно'),
      rate: L('pseudo-polynomial O(n·W) · fine while W is small; W = 10⁹ is hopeless',
              'псевдополиномиально, O(n·W) · хорошо, пока W невелико; при W = 10⁹ — безнадёжно'),
      hyper: L('none: the recursion is the algorithm',
               'нет: рекуррентное соотношение и есть алгоритм'),
      use: L('knapsack, shortest paths, sequence alignment, scheduling on a small horizon',
             'рюкзак, кратчайшие пути, выравнивание последовательностей, планирование на коротком горизонте'),
      weak: L('the table is exponential in the number of bits of W, which is why it is only pseudo-polynomial',
              'таблица экспоненциальна по числу битов W — поэтому алгоритм лишь псевдополиномиальный')
    },
    {
      name: L('Edmonds-Karp (max flow)', 'Эдмондс–Карп (максимальный поток)'), family: 'discrete', order: 'na', support: ['integer', 'constraints'],
      color: Atlas.palette.mint, widget: 'flow',
      requires: L('a directed graph with capacities',
                  'ориентированный граф с пропускными способностями'),
      cost: L('one breadth-first search per augmentation, O(E)',
              'один поиск в ширину на каждый увеличивающий путь, O(E)'),
      memory: 'O(V + E)',
      rate: L('O(V·E²) overall, polynomial and independent of the capacities · 10⁴ to 10⁵ edges',
              'O(V·E²) в целом — полиномиально и не зависит от пропускных способностей · от 10⁴ до 10⁵ рёбер'),
      hyper: L('none',
               'нет'),
      use: L('max flow, min cut, bipartite matching, and any problem that reduces to them',
             'максимальный поток, минимальный разрез, паросочетания в двудольных графах и всё, что к ним сводится'),
      weak: L('superseded by Dinic and push-relabel on large graphs',
              'на больших графах вытеснен алгоритмом Диница и проталкиванием предпотока')
    },
    {
      name: L('Dinic / push-relabel', 'Диниц / проталкивание предпотока'), family: 'discrete', order: 'na', support: ['integer', 'constraints'],
      color: Atlas.palette.olive, widget: 'flow',
      requires: L('as above',
                  'то же, что выше'),
      cost: L('one blocking flow per phase',
              'один блокирующий поток на фазу'),
      memory: 'O(V + E)',
      rate: L('O(V²·E) and O(V³) respectively, much better on unit capacities · 10⁶ edges',
              'O(V²·E) и O(V³) соответственно, гораздо лучше при единичных пропускных способностях · 10⁶ рёбер'),
      hyper: L('gap and global relabel heuristics',
               'эвристики разрыва и глобального пересчёта высот'),
      use: L('large flow problems, image segmentation, and vision',
             'большие потоковые задачи, сегментация изображений, компьютерное зрение'),
      weak: L('more intricate to implement correctly than Edmonds-Karp',
              'корректно реализовать сложнее, чем алгоритм Эдмондса–Карпа')
    },
    {
      name: L('Network simplex (min-cost flow)', 'Сетевой симплекс-метод (поток мин. стоимости)'), family: 'discrete', order: 'na', support: ['integer', 'constraints'],
      color: Atlas.palette.amber, widget: 'flow',
      requires: L('a flow network with costs, and integral supplies',
                  'сеть со стоимостями дуг и целочисленными запасами в узлах'),
      cost: L('one spanning-tree pivot',
              'одна смена базисного остовного дерева'),
      memory: 'O(V + E)',
      rate: L('exponential worst case, very fast in practice · 10⁵ to 10⁶ arcs',
              'экспоненциально в худшем случае, очень быстро на практике · от 10⁵ до 10⁶ дуг'),
      hyper: L('pricing rule',
               'правило выбора входящей дуги'),
      use: L('transportation, assignment and transshipment problems',
             'транспортные задачи (в том числе с перевалкой) и задачи о назначениях'),
      weak: L('degeneracy causes long runs of zero-progress pivots',
              'вырожденность порождает длинные серии смен базиса без продвижения')
    },
    {
      name: L('Constraint propagation (AC-3)', 'Распространение ограничений (AC-3)'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.indigo, widget: 'sudoku',
      requires: L('finite domains and constraints that can prune them',
                  'конечные домены и ограничения, способные их сужать'),
      cost: L('O(e·d³) for arc consistency',
              'O(e·d³) для дуговой совместности'),
      memory: L('O(e·d) for the domains',
                'O(e·d) на домены'),
      rate: L('polynomial per propagation, but it is not a solver on its own · millions of variables in CP models',
              'полиномиально на одно распространение, но само по себе это не решатель · миллионы переменных в моделях программирования в ограничениях'),
      hyper: L('consistency level: forward checking, arc, path',
               'уровень совместности: опережающая проверка, по дугам, по путям'),
      use: L('scheduling, rostering, puzzles, and anything with all-different constraints',
             'расписания, графики смен, головоломки и всё, где есть ограничения all-different («все различны»)'),
      weak: L('propagation alone rarely finishes; it must be wrapped in a search',
              'одно лишь распространение редко доводит дело до конца; его приходится встраивать в поиск')
    },
    {
      name: L('CP-SAT / CDCL search', 'CP-SAT / CDCL-поиск'), family: 'discrete', order: 'na', support: ['integer', 'constraints'],
      color: Atlas.palette.violet, widget: 'sudoku',
      requires: L('the model expressed in clauses or finite-domain constraints',
                  'модель в виде дизъюнктов или ограничений на конечных доменах'),
      cost: L('one propagation plus one decision per node',
              'одно распространение и один выбор значения на узел'),
      memory: L('grows with the learned clause database',
                'растёт вместе с базой выученных дизъюнктов'),
      rate: L('exponential worst case, spectacular in practice · 10⁵ to 10⁶ variables',
              'экспоненциально в худшем случае, впечатляюще быстро на практике · от 10⁵ до 10⁶ переменных'),
      hyper: L('restarts, activity-based branching, clause deletion',
               'рестарты, ветвление по активности, удаление дизъюнктов'),
      use: L('scheduling and configuration where the structure is logical rather than numeric',
             'расписания и конфигурирование, где структура логическая, а не числовая'),
      weak: L('no useful bound while it runs, and performance is famously hard to predict',
              'пока идёт поиск, полезной границы нет, а производительность, как известно, трудно предсказать')
    },
    {
      name: L('Nearest neighbour (construction)', 'Ближайший сосед (построение)'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.blue, widget: 'tsp',
      requires: L('a distance between every pair',
                  'расстояния между всеми парами городов'),
      cost: L('O(n) per city added, O(n²) in total',
              'O(n) на каждый добавленный город, O(n²) в сумме'),
      memory: 'O(n)',
      rate: L('greedy, no ratio guarantee in general · typically 25 % above optimal, instant at n = 10⁴',
              'жадный, в общем случае без гарантий аппроксимации · обычно на 25 % выше оптимума, мгновенно при n = 10⁴'),
      hyper: L('the starting city',
               'начальный город'),
      use: L('a first tour to hand to a local search',
             'первый маршрут для последующего локального поиска'),
      weak: L('the last few edges are always terrible, because everything convenient is already used',
              'последние несколько рёбер всегда ужасны: всё удобное уже использовано')
    },
    {
      name: L('2-opt local search', 'Локальный поиск 2-opt'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.orange, widget: 'tsp',
      requires: L('a tour and a move that can be evaluated cheaply',
                  'маршрут и ход, который дёшево оценить'),
      cost: L('O(n²) per full sweep, O(1) to evaluate one move',
              'O(n²) на полный проход, O(1) на оценку одного хода'),
      memory: 'O(n)',
      rate: L('converges to a local optimum, not a global one · typically 5 % above optimal, n = 10⁴ with neighbour lists',
              'сходится к локальному оптимуму, а не к глобальному · обычно на 5 % выше оптимума, n = 10⁴ со списками соседей'),
      hyper: L('first versus best improvement, neighbourhood size',
               'первое или лучшее улучшение, размер окрестности'),
      use: L('cleaning up any constructed tour; the basis of Lin-Kernighan',
             'доводка любого построенного маршрута; основа алгоритма Лина–Кернигана'),
      weak: L('it stops at the first local optimum it meets and cannot leave',
              'застревает в первом же встреченном локальном оптимуме и не может из него выйти')
    },
    {
      name: L('Simulated annealing', 'Имитация отжига'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.rose, widget: 'tsp',
      requires: L('a neighbourhood and a way to evaluate a move',
                  'окрестность и способ оценить ход'),
      cost: L('O(1) per proposal with an incremental cost',
              'O(1) на предложенный ход при инкрементном пересчёте стоимости'),
      memory: 'O(n)',
      rate: L('converges in probability under an impractically slow schedule · anytime, any size',
              'сходится по вероятности лишь при слишком медленном для практики охлаждении · можно прервать в любой момент, задачи любого размера'),
      hyper: L('starting temperature, cooling rate, neighbourhood',
               'начальная температура, скорость охлаждения, окрестность'),
      use: L('messy objectives with no structure to exploit',
             'неудобные целевые функции без полезной структуры'),
      weak: L('no bound, no certificate, and the schedule matters more than the algorithm',
              'ни границы, ни сертификата, а расписание охлаждения важнее самого алгоритма')
    },
    {
      name: L('Tabu search / genetic algorithms', 'Поиск с запретами / генетические алгоритмы'), family: 'discrete', order: 'na', support: ['integer'],
      color: Atlas.palette.purple, widget: 'tsp',
      requires: L('a neighbourhood, or a crossover and mutation',
                  'окрестность либо скрещивание и мутация'),
      cost: L('one neighbourhood scan or one generation',
              'один просмотр окрестности или одно поколение'),
      memory: L('O(tabu tenure) or O(population)',
                'O(длина списка запретов) или O(размер популяции)'),
      rate: L('no guarantee at all · anytime, any size',
              'никаких гарантий · можно прервать в любой момент, задачи любого размера'),
      hyper: L('tenure, aspiration, population, crossover and mutation rates',
               'срок запрета, критерий аспирации, размер популяции, вероятности скрещивания и мутации'),
      use: L('routing and scheduling in industry, where feasibility beats optimality',
             'маршрутизация и расписания в промышленности, где допустимость важнее оптимальности'),
      weak: L('many knobs, no theory, and results that are hard to reproduce',
              'много настроек, никакой теории и плохо воспроизводимые результаты')
    }
  ];

  /* =======================================================================
     Rows generated from the method registries
     ===================================================================== */

  var FAMILY_OF = { continuous: 'smooth', stochastic: 'stochastic', constrained: 'constrained' };

  /* The section a row opens: the letter on the badge, the word in the tooltip. */
  var SECTION_OF = { continuous: 'B', stochastic: 'C', constrained: 'D' };

  function supportOf(m) {
    if (m.category === 'stochastic') return ['noise'];
    if (m.category === 'constrained') return m.needsSet ? ['constraints'] : ['nonsmooth'];
    return ['unconstrained'];
  }

  function orderOf(m) {
    if (m.category !== 'continuous') return '1';
    return m.order === 2 ? '2' : (m.order === 'quasi' ? 'quasi' : '1');
  }

  /* Where clicking the row should take you, and how the widget is set up. */
  function jumpFor(m) {
    if (m.category === 'continuous') {
      var second = (m.order === 2 || m.order === 'quasi');
      return function () {
        Atlas.ui.showSection('sec-B');
        Atlas.ui.applyPreset(second
          ? { fn: 'rosenbrock', params: {}, methods: [m.id], opts: { alpha: 1e-3 },
              start: [-1.2, 1.0], budget: 400, speed: 60, run: true }
          : { fn: 'quadratic', params: { kappa: 50 }, methods: [m.id], opts: { alpha: 1 / 50, beta: 0.9 },
              start: [2.4, 1.6], budget: 500, speed: 150, run: true });
      };
    }
    if (m.category === 'stochastic') {
      return function () {
        Atlas.ui.showSection('sec-C');
        Atlas.ui.C.applyPreset({ methods: [m.id], opts: { lr: 0.08, batch: 16 },
                                 schedule: 'constant', epochs: 30, run: true });
      };
    }
    return function () {
      Atlas.ui.showSection('sec-D');
      Atlas.ui.D.applyPreset(m.needsSet
        ? { mode: 'constrained', setId: 'ball', methods: [m.id], run: true }
        : { mode: 'composite', lam: 0.2, methods: [m.id],
            overlays: ['1/sqrt(k)', '1/k', '1/k2'], run: true });
    };
  }

  function jumpToWidget(widgetId) {
    return function () {
      Atlas.ui.showSection('sec-E');
      var card = document.getElementById('w-' + widgetId);
      if (!card) return;
      card.scrollIntoView({ block: 'start' });
      card.classList.remove('flash');
      /* restart the highlight even when the same row is clicked twice */
      void card.offsetWidth;
      card.classList.add('flash');
    };
  }

  /* The rate cell glues the registry texts to labels, which freezes the
     current language into it: the rows are rebuilt after a language switch. */
  function buildRows() {
    var rows = [];
    Atlas.methods.forEach(function (m) {
      var c = m.card || {};
      var strongLabel = m.category === 'stochastic' ? t('with noise', 'с шумом')
                                                    : t('strongly convex', 'сильно выпуклая');
      var sec = SECTION_OF[m.category] || 'D';
      rows.push({
        name: m.name,
        color: m.color,
        family: FAMILY_OF[m.category] || 'smooth',
        order: orderOf(m),
        support: supportOf(m),
        requires: c.requires || '—',
        cost: c.cost || '—',
        memory: c.memory || '—',
        rate: t('<span class="rate">convex:</span> ', '<span class="rate">выпуклая:</span> ') + (c.rateConvex || '—') +
              '<br><span class="rate">' + strongLabel + ':</span> ' + (c.rateStrong || '—'),
        hyper: c.hyper || '—',
        use: c.useWhen || '—',
        weak: c.avoidWhen || '—',
        jump: jumpFor(m),
        where: L('section ' + sec, 'раздел ' + sec),
        sec: sec
      });
    });
    DISCRETE_ROWS.forEach(function (d) {
      rows.push({
        name: d.name, color: d.color, family: d.family, order: d.order, support: d.support,
        requires: d.requires, cost: d.cost, memory: d.memory, rate: d.rate,
        hyper: d.hyper, use: d.use, weak: d.weak,
        jump: jumpToWidget(d.widget), where: L('section E', 'раздел E'), sec: 'E'
      });
    });
    return rows;
  }

  /* =======================================================================
     Filters and rendering
     ===================================================================== */

  var FAMILIES = [
    { id: 'all', name: L('All problem types', 'Все типы задач') },
    { id: 'smooth', name: L('Smooth unconstrained', 'Гладкие без ограничений') },
    { id: 'stochastic', name: L('Stochastic, finite sum', 'Стохастические, конечная сумма') },
    { id: 'constrained', name: L('Constrained or nonsmooth', 'С ограничениями или негладкие') },
    { id: 'discrete', name: L('Discrete, combinatorial', 'Дискретные, комбинаторные') }
  ];
  var ORDERS = [
    { id: 'all', name: L('Any order', 'Любой порядок') },
    { id: '1', name: L('First order', 'Первого порядка') },
    { id: '2', name: L('Second order', 'Второго порядка') },
    { id: 'quasi', name: L('Quasi-Newton', 'Квазиньютоновские') },
    { id: 'na', name: L('Not applicable (discrete)', 'Неприменимо (дискретные)') }
  ];
  var SUPPORTS = [
    { id: 'all', name: L('Any', 'Любая') },
    { id: 'unconstrained', name: L('Unconstrained smooth only', 'Только гладкие без ограничений') },
    { id: 'constraints', name: L('Handles constraints', 'Учитывает ограничения') },
    { id: 'nonsmooth', name: L('Handles nonsmoothness', 'Допускает негладкость') },
    { id: 'noise', name: L('Handles gradient noise', 'Допускает шум градиента') },
    { id: 'integer', name: L('Handles integrality', 'Учитывает целочисленность') }
  ];

  var COLUMNS = [
    L('method', 'метод'),
    L('requirements on the problem', 'требования к задаче'),
    L('cost per iteration', 'стоимость итерации'),
    L('memory', 'память'),
    L('convergence rate / complexity', 'скорость сходимости / сложность'),
    L('hyperparameters', 'гиперпараметры'),
    L('typical use', 'типичное применение'),
    L('main weakness', 'главная слабость')
  ];

  var state = { family: 'all', order: 'all', support: 'all', q: '' };
  var allRows = [];
  var searchInput = null;      /* kept across language switches, with its text */

  /* Russian text is written with ё, which people rarely type: fold it to е
     on both sides so «тяжелый» still finds «Тяжёлый шарик». */
  function fold(s) { return s.replace(/ё/g, 'е'); }

  function matches(r) {
    if (state.family !== 'all' && r.family !== state.family) return false;
    if (state.order !== 'all' && r.order !== state.order) return false;
    if (state.support !== 'all' && r.support.indexOf(state.support) < 0) return false;
    if (state.q) {
      var hay = (Atlas.tr(r.name) + ' ' + Atlas.tr(r.requires) + ' ' + Atlas.tr(r.use) + ' ' +
                 Atlas.tr(r.weak) + ' ' + Atlas.tr(r.hyper)).toLowerCase();
      if (fold(hay).indexOf(fold(state.q)) < 0) return false;
    }
    return true;
  }

  function select(label, options, current, onChange) {
    var g = el('div', 'fgroup');
    g.appendChild(el('span', null, label));
    var s = document.createElement('select');
    options.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.name;
      if (o.id === current) opt.selected = true;
      s.appendChild(opt);
    });
    s.addEventListener('change', function () { onChange(s.value); });
    g.appendChild(s);
    return g;
  }

  function render() {
    var tbody = document.querySelector('#f-table tbody');
    clear(tbody);
    var shown = 0, lastFamily = null;
    allRows.forEach(function (r) {
      if (!matches(r)) return;
      shown++;
      var tr = el('tr');
      if (lastFamily !== null && r.family !== lastFamily) tr.className = 'groupsep';
      lastFamily = r.family;
      tr.title = t('Open ' + r.name + ' in ' + r.where,
                   'Открыть «' + r.name + '» в разделе ' + r.sec);
      tr.addEventListener('click', function () { r.jump(); });

      var m = el('td', 'm');
      var sw = el('span', 'swatch');
      sw.style.background = r.color;
      m.appendChild(sw);
      m.appendChild(document.createTextNode(r.name));
      m.appendChild(el('span', 'fam', r.sec));
      tr.appendChild(m);

      [r.requires, r.cost, r.memory, r.rate, r.hyper].forEach(function (html, i) {
        var td = el('td', i === 3 ? 'rate' : null);
        td.innerHTML = html;
        tr.appendChild(td);
      });
      var u = el('td', 'use'); u.innerHTML = r.use; tr.appendChild(u);
      var wk = el('td', 'weak'); wk.innerHTML = r.weak; tr.appendChild(wk);
      tbody.appendChild(tr);
    });
    if (!shown) {
      var tr2 = el('tr');
      var td2 = el('td', 'sheet-empty', t('No method matches these filters.',
                                          'Ни один метод не подходит под эти фильтры.'));
      td2.colSpan = COLUMNS.length;
      tr2.appendChild(td2);
      tbody.appendChild(tr2);
    }
    var count = document.querySelector('#f-filters .fcount');
    var total = allRows.length;
    if (count) count.textContent = t(shown + ' of ' + total + ' methods',
                                     shown + ' из ' + total + ' ' + Atlas.ruPlural(total, 'метода', 'методов', 'методов'));
  }

  function buildHead(table) {
    var thead = table.querySelector('thead');
    clear(thead);
    var htr = el('tr');
    COLUMNS.forEach(function (c) { htr.appendChild(el('th', null, c)); });
    thead.appendChild(htr);
  }

  /* The selects are rebuilt from `state`, so they come back with the same
     choices; the search box is the same element, so its text survives. */
  function buildFilters(host) {
    clear(host);
    host.appendChild(select(t('Problem type', 'Тип задачи'), FAMILIES, state.family, function (v) { state.family = v; render(); }));
    host.appendChild(select(t('Method order', 'Порядок метода'), ORDERS, state.order, function (v) { state.order = v; render(); }));
    host.appendChild(select(t('Constraint support', 'Поддержка ограничений'), SUPPORTS, state.support, function (v) { state.support = v; render(); }));

    var g = el('div', 'fgroup');
    g.appendChild(el('span', null, t('Search', 'Поиск')));
    var inp = searchInput;
    if (!inp) {
      inp = searchInput = document.createElement('input');
      inp.type = 'search';
      inp.addEventListener('input', function () { state.q = inp.value.trim().toLowerCase(); render(); });
    }
    inp.placeholder = t('name, use, weakness…', 'название, применение, слабость…');
    g.appendChild(inp);
    host.appendChild(g);

    host.appendChild(el('div', 'fcount', ''));
  }

  var listening = false;

  Atlas.cheatsheet = {
    init: function () {
      var host = document.getElementById('f-filters');
      var table = document.getElementById('f-table');
      if (!host || !table) return;
      allRows = buildRows();
      buildHead(table);
      buildFilters(host);
      render();

      /* A language switch re-renders the words only: the filter choices and
         the search text are kept. */
      if (!listening) {
        listening = true;
        Atlas.i18n.onChange(function () {
          allRows = buildRows();
          buildHead(table);
          buildFilters(host);
          render();
        });
      }
    },
    onShow: function () { render(); },
    rows: function () { return allRows; }
  };

})();
