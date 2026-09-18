// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
/* ==========================================================================
   Optimization Atlas - methods.js
   The registry of continuous optimization methods.  Part 1: first-order.

   To add a method, call Atlas.registerMethod({...}) with:

     id, name        unique string and label
     color           its colour in every panel of the atlas
     order           1 first-order, 2 second-order, 'quasi' quasi-Newton
     needsHessian    true when create() calls P.hess
     tag             short chip shown in the method list
     uses            ids of the hyperparameters it reads, from Atlas.hyper
     needsHessian    true if create() calls P.hess
     create(P, o, x0)  returns an iterator object:
                         { x, step() -> next iterate, info, status, message }
                       P is the problem  {f, grad, hess, n, fstar, L, mu, ...}
                       o is the live hyperparameter object {alpha, beta, ...}
                       Setting status = 'failed' stops the run with `message`.
                       Setting rejected = true tells the driver that staying
                       at the same point was deliberate (Levenberg-Marquardt
                       rejecting a trial step), not a stall.
     card            the text shown in the method card.  In `formula`, write
                     &nbsp; for spaces inside a clause and a plain space only
                     where a line break is acceptable: the card wraps between
                     clauses and never inside one.

   Every text a student reads is bilingual: name, tag and the card fields are
   Atlas.L(english, russian), and so are info and message whenever they hold
   words (both languages are built when the text is created).  Pure notation
   such as 'O(n)', a formula without words or 'α = 0.1' stays a plain string.

   Atlas.Run handles NaN, divergence, budget and convergence tests, so a
   method only has to produce the next iterate.
   ========================================================================== */
(function () {
  'use strict';

  var Atlas = window.Atlas;
  var num = Atlas.num;
  var C = Atlas.palette;
  var LS = Atlas.lineSearch;

  /* --------------------------------------------------- gradient descent -- */
  Atlas.registerMethod({
    id: 'gd',
    name: Atlas.L('Gradient descent', 'Градиентный спуск'),
    color: C.blue,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: ['alpha'],
    create: function (P, o, x0) {
      return {
        x: x0,
        step: function () {
          var g = P.grad(this.x);
          this.x = num.axpy(-o.alpha, g, this.x);
          this.info = 'α = ' + num.fmt(o.alpha, 4);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f differentiable; a known L to set α',
                        'f дифференцируема; известна L для выбора α'),
      formula: 'x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α∇f(x<sub>k</sub>)',
      intuition: Atlas.L('Walk against the gradient by a fixed amount. The gradient is the steepest direction only locally, so on stretched level sets the steps cross the valley again and again instead of running along it.',
                         'Движемся против градиента с фиксированным шагом. Антиградиент — направление наискорейшего спуска лишь локально, поэтому на вытянутых множествах уровня шаги раз за разом пересекают овраг, вместо того чтобы идти вдоль него.'),
      cost: Atlas.L('one gradient, O(n)', 'один градиент, O(n)'),
      memory: 'O(n)',
      rateConvex: Atlas.L('f(x<sub>k</sub>) − f* = O(1/k) with α = 1/L',
                          'f(x<sub>k</sub>) − f* = O(1/k) при α = 1/L'),
      rateStrong: Atlas.L('(1 − μ/L)<sup>k</sup>, so about κ·log(1/ε) iterations',
                          '(1 − μ/L)<sup>k</sup>, то есть около κ·log(1/ε) итераций'),
      hyper: Atlas.L('α alone. Any α ∈ (0, 2/L) converges; 2/(μ+L) is the best fixed step.',
                     'только α. Метод сходится при любом α ∈ (0, 2/L); лучший постоянный шаг — 2/(μ+L).'),
      useWhen: Atlas.L('the problem is well conditioned, or n is so large that nothing else fits in memory',
                       'задача хорошо обусловлена или n так велико, что ничего другого не помещается в память'),
      avoidWhen: Atlas.L('κ is large, or L is unknown — a step slightly above 2/L diverges',
                         'κ велико или L неизвестна — шаг чуть больше 2/L уже ведёт к расходимости')
    }
  });

  /* ---------------------------------- gradient descent with backtracking -- */
  Atlas.registerMethod({
    id: 'gd_ls',
    name: Atlas.L('GD + backtracking', 'Градиентный спуск + дробление шага'),
    color: C.cyan,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: ['alpha'],
    create: function (P, o, x0) {
      var t = o.alpha;
      return {
        x: x0,
        step: function () {
          var fx = P.f(this.x);
          var g = P.grad(this.x);
          var d = num.scale(g, -1);
          var res = LS.armijo(P, this.x, fx, g, d, Math.min(t * 2, 1e6));
          if (!res.ok) {
            this.status = 'failed';
            this.message = Atlas.L('line search failed: no step gives sufficient decrease',
                                   'линейный поиск не удался: ни один шаг не даёт достаточного убывания');
            return this.x;
          }
          t = res.t;
          this.x = res.x;
          this.info = Atlas.L('t = ' + num.fmt(res.t, 4) + ', ' + res.evals + ' f-evals',
                              't = ' + num.fmt(res.t, 4) + ', ' + res.evals + ' ' +
                              Atlas.ruPlural(res.evals, 'вычисление', 'вычисления', 'вычислений') + ' f');
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f differentiable; cheap function evaluations',
                        'f дифференцируема; вычислять f дёшево'),
      formula: Atlas.L('d&nbsp;=&nbsp;−∇f(x<sub>k</sub>); halve&nbsp;t&nbsp;while&nbsp;f(x<sub>k</sub>+td)&nbsp;>&nbsp;f(x<sub>k</sub>)&nbsp;+&nbsp;c₁t∇fᵀd; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;t·d',
                       'd&nbsp;=&nbsp;−∇f(x<sub>k</sub>); делим&nbsp;t&nbsp;пополам, пока&nbsp;f(x<sub>k</sub>+td)&nbsp;>&nbsp;f(x<sub>k</sub>)&nbsp;+&nbsp;c₁t∇fᵀd; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;t·d'),
      intuition: Atlas.L('Same direction as gradient descent, but the length is discovered by trial: halve the trial step until the actual decrease is at least a fixed fraction of the decrease the slope promised. It removes the need to know L.',
                         'Направление то же, что у градиентного спуска, но длина шага подбирается пробами: пробный шаг делится пополам, пока фактическое убывание не составит хотя бы фиксированную долю того, что обещал наклон. Знать L больше не нужно.'),
      cost: Atlas.L('one gradient plus one to five extra function evaluations',
                    'один градиент и ещё от одного до пяти вычислений f'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/k), the same order as the fixed step',
                          'O(1/k), тот же порядок, что и при постоянном шаге'),
      rateStrong: Atlas.L('linear, with a constant close to (1 − μ/L)',
                          'линейная, с константой около (1 − μ/L)'),
      hyper: Atlas.L('c₁ ≈ 10⁻⁴, halving factor ½, and the first trial step (reused from the previous iteration).',
                     'c₁ ≈ 10⁻⁴, коэффициент дробления ½ и первый пробный шаг (берётся с предыдущей итерации).'),
      useWhen: Atlas.L('L is unknown or changes a lot across the landscape',
                       'L неизвестна или сильно меняется от области к области'),
      avoidWhen: Atlas.L('evaluating f is much more expensive than evaluating ∇f',
                         'вычислить f намного дороже, чем ∇f')
    }
  });

  /* ------------------------------------------------------- heavy ball  --- */
  Atlas.registerMethod({
    id: 'heavy_ball',
    name: Atlas.L('Heavy Ball', 'Тяжёлый шарик'),
    color: C.orange,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: ['alpha', 'beta'],
    create: function (P, o, x0) {
      var v = num.zeros(x0.length);
      return {
        x: x0,
        step: function () {
          var g = P.grad(this.x);
          for (var i = 0; i < v.length; i++) v[i] = o.beta * v[i] - o.alpha * g[i];
          this.x = num.add(this.x, v);
          this.info = 'β = ' + num.fmt(o.beta, 3) + ', ‖v‖ = ' + num.fmt(num.norm(v), 3);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f differentiable; works best on quadratic-like f',
                        'f дифференцируема; лучше всего работает на f, близких к квадратичным'),
      formula: 'v<sub>k+1</sub>&nbsp;=&nbsp;β·v<sub>k</sub>&nbsp;−&nbsp;α∇f(x<sub>k</sub>)<br>x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;v<sub>k+1</sub>',
      intuition: Atlas.L('Give the iterate inertia: directions that keep repeating add up, while the oscillation across a narrow valley cancels itself out. Along the valley the effective step is multiplied by roughly 1/(1−β).',
                         'Придаём движению инерцию: повторяющиеся направления складываются, а колебания поперёк узкого оврага гасят друг друга. Вдоль оврага эффективный шаг возрастает примерно в 1/(1−β) раз.'),
      cost: Atlas.L('one gradient, O(n)', 'один градиент, O(n)'),
      memory: Atlas.L('O(n) for the velocity', 'O(n) на скорость'),
      rateConvex: Atlas.L('no guarantee better than gradient descent; it can cycle',
                          'гарантий лучше, чем у градиентного спуска, нет; возможно зацикливание'),
      rateStrong: Atlas.L('(1 − 1/√κ)<sup>k</sup> on quadratics with the optimal α and β',
                          '(1 − 1/√κ)<sup>k</sup> на квадратичных функциях при оптимальных α и β'),
      hyper: Atlas.L('β = ((√κ−1)/(√κ+1))² and α = (1+√β)²/L are optimal for a quadratic; β ≈ 0.9 is the usual guess.',
                     'для квадратичной функции оптимальны β = ((√κ−1)/(√κ+1))² и α = (1+√β)²/L; на практике обычно берут β ≈ 0.9.'),
      useWhen: Atlas.L('the landscape is quadratic-like and κ is roughly known',
                       'ландшафт близок к квадратичному и κ примерно известно'),
      avoidWhen: Atlas.L('far from quadratic — too much β turns the descent into an orbit around the minimum',
                         'функция далека от квадратичной — при слишком большом β спуск превращается в кружение вокруг минимума')
    }
  });

  /* ------------------------------------------- Nesterov, fixed momentum -- */
  Atlas.registerMethod({
    id: 'nesterov',
    name: Atlas.L('Nesterov accelerated', 'Ускоренный метод Нестерова'),
    color: C.purple,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: ['alpha', 'beta'],
    create: function (P, o, x0) {
      var xPrev = x0.slice();
      return {
        x: x0,
        step: function () {
          var y = num.axpy(o.beta, num.sub(this.x, xPrev), this.x);
          var g = P.grad(y);
          var xNew = num.axpy(-o.alpha, g, y);
          xPrev = this.x;
          this.x = xNew;
          this.info = 'β = ' + num.fmt(o.beta, 3);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f convex with L-Lipschitz gradient',
                        'f выпукла, градиент L-липшицев'),
      formula: 'y<sub>k</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;β(x<sub>k</sub>&nbsp;−&nbsp;x<sub>k−1</sub>)<br>x<sub>k+1</sub>&nbsp;=&nbsp;y<sub>k</sub>&nbsp;−&nbsp;α∇f(y<sub>k</sub>)',
      intuition: Atlas.L('Extrapolate first, then take the gradient at the point you are heading to. Because the gradient is measured after the momentum step, it can brake before the iterate overshoots, which is exactly what Heavy Ball cannot do.',
                         'Сначала экстраполируем, затем берём градиент в той точке, куда движемся. Поскольку градиент измеряется уже после шага по инерции, метод успевает затормозить, прежде чем проскочит минимум, — именно этого не умеет метод тяжёлого шарика.'),
      cost: Atlas.L('one gradient, O(n)', 'один градиент, O(n)'),
      memory: Atlas.L('O(n) for the previous iterate', 'O(n) на предыдущую точку'),
      rateConvex: Atlas.L('O(1/k²) with β<sub>k</sub> = (k−1)/(k+2) — optimal for smooth convex f',
                          'O(1/k²) при β<sub>k</sub> = (k−1)/(k+2) — оптимально для гладких выпуклых f'),
      rateStrong: Atlas.L('(1 − 1/√κ)<sup>k</sup> with β = (√κ−1)/(√κ+1)',
                          '(1 − 1/√κ)<sup>k</sup> при β = (√κ−1)/(√κ+1)'),
      hyper: Atlas.L('β only. Too small loses the acceleration, too large produces long ripples.',
                     'только β. При слишком малом β ускорение теряется, при слишком большом появляются затяжные колебания.'),
      useWhen: Atlas.L('smooth convex problems at any scale — this is the default accelerated method',
                       'гладкие выпуклые задачи любого масштаба — это ускоренный метод по умолчанию'),
      avoidWhen: Atlas.L('gradients are noisy, or β is far from (√κ−1)/(√κ+1)',
                         'градиенты зашумлены или β далеко от (√κ−1)/(√κ+1)')
    }
  });

  /* -------------------------------------------- Nesterov + adaptive restart */
  Atlas.registerMethod({
    id: 'nesterov_restart',
    name: Atlas.L('Nesterov + restart', 'Нестеров + рестарты'),
    color: C.rose,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: ['alpha'],
    create: function (P, o, x0) {
      var xPrev = x0.slice(), t = 1, restarts = 0;
      return {
        x: x0,
        step: function () {
          var tNew = 0.5 * (1 + Math.sqrt(1 + 4 * t * t));
          var beta = (t - 1) / tNew;
          var y = num.axpy(beta, num.sub(this.x, xPrev), this.x);
          var g = P.grad(y);
          var xNew = num.axpy(-o.alpha, g, y);
          /* gradient restart test of O'Donoghue and Candes */
          var restart = num.dot(g, num.sub(xNew, this.x)) > 0;
          xPrev = this.x;
          this.x = xNew;
          t = restart ? 1 : tNew;
          if (restart) restarts++;
          this.info = restart ? Atlas.L('restart #' + restarts, 'рестарт № ' + restarts)
                              : 'β = ' + num.fmt(beta, 3);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f convex with L-Lipschitz gradient; μ need not be known',
                        'f выпукла, градиент L-липшицев; знать μ не нужно'),
      formula: Atlas.L('t<sub>k+1</sub>&nbsp;=&nbsp;(1&nbsp;+&nbsp;√(1&nbsp;+&nbsp;4t<sub>k</sub>²))/2, β<sub>k</sub>&nbsp;=&nbsp;(t<sub>k</sub>&nbsp;−&nbsp;1)/t<sub>k+1</sub><br>reset&nbsp;t&nbsp;←&nbsp;1 whenever&nbsp;∇f(y<sub>k</sub>)ᵀ(x<sub>k+1</sub>&nbsp;−&nbsp;x<sub>k</sub>)&nbsp;>&nbsp;0',
                       't<sub>k+1</sub>&nbsp;=&nbsp;(1&nbsp;+&nbsp;√(1&nbsp;+&nbsp;4t<sub>k</sub>²))/2, β<sub>k</sub>&nbsp;=&nbsp;(t<sub>k</sub>&nbsp;−&nbsp;1)/t<sub>k+1</sub><br>сбрасываем&nbsp;t&nbsp;←&nbsp;1, если&nbsp;∇f(y<sub>k</sub>)ᵀ(x<sub>k+1</sub>&nbsp;−&nbsp;x<sub>k</sub>)&nbsp;>&nbsp;0'),
      intuition: Atlas.L('The fixed momentum schedule makes the iterates ripple around a strongly convex minimum. Restarting the schedule the moment the step starts working against the gradient removes the ripples and recovers linear convergence without knowing μ.',
                         'При фиксированном расписании импульса точки траектории колеблются вокруг минимума сильно выпуклой функции. Если перезапускать расписание, как только шаг перестаёт быть направлением спуска, колебания исчезают и линейная сходимость возвращается без знания μ.'),
      cost: Atlas.L('one gradient, O(n)', 'один градиент, O(n)'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/k²), the schedule is unchanged between restarts',
                          'O(1/k²); между рестартами расписание не меняется'),
      rateStrong: Atlas.L('linear in practice, close to (1 − 1/√κ)<sup>k</sup>, with no knowledge of μ',
                          'на практике линейная, около (1 − 1/√κ)<sup>k</sup>, без знания μ'),
      hyper: Atlas.L('α only — the momentum is generated by the schedule, not chosen.',
                     'только α — импульс задаётся расписанием, а не выбирается.'),
      useWhen: Atlas.L('you want acceleration but do not know the strong convexity constant',
                       'нужно ускорение, но константа сильной выпуклости неизвестна'),
      avoidWhen: Atlas.L('gradients are stochastic — the restart test then fires on noise',
                         'градиенты стохастические — тогда критерий рестарта срабатывает на шуме')
    }
  });

  /* --------------------------------------------------- coordinate descent -- */
  Atlas.registerMethod({
    id: 'coordinate',
    name: Atlas.L('Coordinate descent', 'Покоординатный спуск'),
    color: C.olive,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: [],
    create: function (P, o, x0) {
      var n = x0.length;
      var t = [];
      for (var i = 0; i < n; i++) t.push(1);
      return {
        x: x0,
        i: 0,
        step: function () {
          /* Only the i-th partial derivative is used; the full gradient call
             is a convenience of this 2-D demonstration. */
          var g = P.grad(this.x);
          var idx = this.i, tries = 0;
          while (Math.abs(g[idx]) < 1e-14 && tries < n) { idx = (idx + 1) % n; tries++; }
          if (Math.abs(g[idx]) < 1e-14) {
            this.info = Atlas.L('all partial derivatives are zero', 'все частные производные равны нулю');
            return this.x;
          }
          var d = num.zeros(n);
          d[idx] = -g[idx];
          var res = LS.armijo(P, this.x, P.f(this.x), g, d, Math.min(t[idx] * 2, 1e4));
          if (!res.ok) {
            this.status = 'failed';
            this.message = Atlas.L('line search failed on coordinate ' + (idx + 1),
                                   'линейный поиск по координате ' + (idx + 1) + ' не удался');
            return this.x;
          }
          t[idx] = res.t;
          this.x = res.x;
          this.i = (idx + 1) % n;
          this.info = Atlas.L('coordinate ' + (idx + 1) + ', t = ' + num.fmt(res.t, 3),
                              'координата ' + (idx + 1) + ', t = ' + num.fmt(res.t, 3));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('cheap partial derivatives; separable structure helps',
                        'частные производные дёшевы; помогает сепарабельная структура'),
      formula: 'i&nbsp;=&nbsp;k&nbsp;mod&nbsp;n; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;t·e<sub>i</sub>·∂f/∂x<sub>i</sub>(x<sub>k</sub>)',
      intuition: Atlas.L('Move one coordinate at a time, with a line search along that axis. Every step is cheap and axis aligned, which is a bargain when a single partial derivative costs far less than the whole gradient.',
                         'Меняем по одной координате за раз, с линейным поиском вдоль этой оси. Каждый шаг дешёв и направлен вдоль оси — это выгодно, когда одна частная производная стоит гораздо меньше всего градиента.'),
      cost: Atlas.L('one partial derivative per step; O(1) on sparse models',
                    'одна частная производная за шаг; O(1) на разреженных моделях'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/k) for smooth convex f with a cyclic or random sweep',
                          'O(1/k) для гладких выпуклых f при циклическом или случайном проходе'),
      rateStrong: Atlas.L('linear, with a constant set by the coordinate-wise smoothness L<sub>i</sub>',
                          'линейная, с константой, которую задаёт покоординатная гладкость L<sub>i</sub>'),
      hyper: Atlas.L('the sweep order (cyclic, random, greedy) and the step rule along the axis.',
                     'порядок прохода (циклический, случайный, жадный) и правило выбора шага вдоль оси.'),
      useWhen: Atlas.L('separable penalties such as Lasso, or very sparse data',
                       'сепарабельные штрафы, как в лассо, или очень разреженные данные'),
      avoidWhen: Atlas.L('the variables are strongly coupled — axis-aligned moves then zigzag badly',
                         'переменные сильно связаны — тогда шаги вдоль осей складываются в долгий зигзаг')
    }
  });

  /* ---------------------------------------- nonlinear conjugate gradient -- */
  Atlas.registerMethod({
    id: 'cg',
    name: Atlas.L('Conjugate gradient', 'Сопряжённые градиенты'),
    color: C.wine,
    order: 1,
    tag: Atlas.L('1st', '1-й'),
    uses: [],
    create: function (P, o, x0) {
      var g = P.grad(x0);
      var d = num.scale(g, -1);
      var k = 0;
      var fPrev = null;
      return {
        x: x0,
        step: function () {
          var n = this.x.length;
          var fx = P.f(this.x);
          if (num.dot(g, d) >= 0) d = num.scale(g, -1);          /* keep it a descent direction */
          var dphi0 = num.dot(g, d);
          var t0;
          if (fPrev === null) t0 = 1 / Math.max(1, num.norm(d));
          else t0 = Math.min(1, 2.02 * (fx - fPrev) / dphi0);   /* both terms are negative */
          if (!(t0 > 0) || !isFinite(t0)) t0 = 1;
          var res = LS.strongWolfe(P, this.x, fx, g, d, t0);
          if (!res.ok) {
            this.status = 'failed';
            this.message = Atlas.L('line search failed: no Wolfe step along the conjugate direction',
                                   'линейный поиск не удался: вдоль сопряжённого направления нет шага, удовлетворяющего условиям Вульфа');
            return this.x;
          }
          var gNew = res.g;
          var denom = num.dot(g, g);
          var beta = denom > 1e-300
            ? Math.max(0, num.dot(gNew, num.sub(gNew, g)) / denom)     /* Polak-Ribiere+ */
            : 0;
          k++;
          /* Powell's test: drop the memory when consecutive gradients stop
             being close to orthogonal, otherwise β can explode. */
          if (Math.abs(num.dot(gNew, g)) > 0.2 * num.dot(gNew, gNew)) beta = 0;
          if (k % (2 * n) === 0) beta = 0;                            /* periodic restart */
          d = num.axpy(beta, d, num.scale(gNew, -1));
          g = gNew;
          fPrev = fx;
          this.x = res.x;
          this.info = 'β⁺ = ' + num.fmt(beta, 3) + ', t = ' + num.fmt(res.t, 3);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f differentiable; an accurate Wolfe line search',
                        'f дифференцируема; достаточно точный линейный поиск по условиям Вульфа'),
      formula: 'd<sub>k</sub>&nbsp;=&nbsp;−∇f(x<sub>k</sub>)&nbsp;+&nbsp;β<sub>k</sub>d<sub>k−1</sub>, x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;t<sub>k</sub>d<sub>k</sub><br>β<sub>k</sub><sup>PR+</sup>&nbsp;=&nbsp;max{0,&nbsp;∇f<sub>k</sub>ᵀ(∇f<sub>k</sub>&nbsp;−&nbsp;∇f<sub>k−1</sub>)&nbsp;/&nbsp;‖∇f<sub>k−1</sub>‖²}',
      intuition: Atlas.L('Bend each new direction away from the previous ones so that progress already made is not undone. On a quadratic in n variables with an exact line search it lands on the exact minimum in at most n steps, using only gradients.',
                         'Каждое новое направление отклоняем от предыдущих так, чтобы не портить уже достигнутое. На квадратичной функции n переменных с точным линейным поиском метод попадает точно в минимум не более чем за n шагов, используя только градиенты.'),
      cost: Atlas.L('one gradient plus a Wolfe line search, O(n)',
                    'один градиент и линейный поиск по условиям Вульфа, O(n)'),
      memory: Atlas.L('O(n), three vectors — never a matrix',
                      'O(n), три вектора — никаких матриц'),
      rateConvex: Atlas.L('exact after n steps on a quadratic; superlinear near a smooth minimum',
                          'точный ответ за n шагов на квадратичной функции; сверхлинейная вблизи гладкого минимума'),
      rateStrong: Atlas.L('((√κ−1)/(√κ+1))<sup>k</sup> for the linear version',
                          '((√κ−1)/(√κ+1))<sup>k</sup> для линейного варианта'),
      hyper: Atlas.L('the β formula (PR+, Fletcher-Reeves, Hestenes-Stiefel) and the restart period; needs a fairly accurate line search.',
                     'формула для β (PR+, Флетчера–Ривса, Хестенса–Штифеля) и период рестартов; нужен достаточно точный линейный поиск.'),
      useWhen: Atlas.L('n is large, the Hessian cannot be stored, and the problem is quadratic-like',
                       'n велико, гессиан не помещается в память, а задача близка к квадратичной'),
      avoidWhen: Atlas.L('gradients are inexact or noisy — conjugacy is destroyed immediately',
                         'градиенты неточные или зашумлённые — сопряжённость сразу разрушается')
    }
  });

  /* =====================================================================
     Part 2: second-order and quasi-Newton methods.
     These four solve a linear system or build an approximation of the
     curvature, so they need P.hess or a stored matrix.
     =================================================================== */

  /* ------------------------------------------------------------ Newton -- */
  Atlas.registerMethod({
    id: 'newton',
    name: Atlas.L("Newton's method", 'Метод Ньютона'),
    color: C.teal,
    order: 2,
    tag: Atlas.L('2nd', '2-й'),
    uses: [],
    needsHessian: true,
    create: function (P, o, x0) {
      return {
        x: x0,
        step: function () {
          var g = P.grad(this.x);
          var H = P.hess(this.x);
          var d = num.solve(H, num.scale(g, -1));
          if (!d) {
            this.status = 'failed';
            this.message = Atlas.L('the Hessian is singular here, so Newton has no step',
                                   'гессиан в этой точке вырожден, так что шага Ньютона нет');
            return this.x;
          }
          this.x = num.add(this.x, d);
          var e = num.eigSym2(H);
          var ev = num.fmt(e.lo, 3) + ', ' + num.fmt(e.hi, 3);
          this.info = Atlas.L('∇²f eigenvalues ' + ev +
                              (e.lo > 0 ? ' (positive definite)' : ' (NOT positive definite)'),
                              'собственные значения ∇²f: ' + ev +
                              (e.lo > 0 ? ' (положительно определён)' : ' (НЕ положительно определён)'));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f twice differentiable; ∇²f invertible and a solve affordable',
                        'f дважды дифференцируема; ∇²f обратим, и решать с ним систему не слишком дорого'),
      formula: 'x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;[∇²f(x<sub>k</sub>)]<sup>−1</sup>∇f(x<sub>k</sub>)',
      intuition: Atlas.L('Fit a quadratic to f at the current point and jump straight to that quadratic’s stationary point. Near a minimum the fit is excellent and the number of correct digits doubles every step.',
                         'Приближаем f в текущей точке квадратичной моделью и сразу прыгаем в её стационарную точку. Вблизи минимума приближение превосходно, и число верных знаков удваивается на каждом шаге.'),
      cost: Atlas.L('one gradient, one Hessian, one n×n solve: O(n³)',
                    'один градиент, один гессиан и решение системы n×n: O(n³)'),
      memory: Atlas.L('O(n²) for the Hessian', 'O(n²) на гессиан'),
      rateConvex: Atlas.L('no global guarantee at all — the pure step can increase f',
                          'никаких глобальных гарантий — чистый шаг может даже увеличить f'),
      rateStrong: Atlas.L('quadratic once close enough: ‖x<sub>k+1</sub>−x*‖ ≤ c‖x<sub>k</sub>−x*‖²',
                          'квадратичная в окрестности решения: ‖x<sub>k+1</sub>−x*‖ ≤ c‖x<sub>k</sub>−x*‖²'),
      hyper: Atlas.L('none, which is the whole appeal: there is no step size to tune.',
                     'нет — в этом вся прелесть: шаг подбирать не нужно.'),
      useWhen: Atlas.L('n is small, the Hessian is cheap, and you are already near the solution',
                       'n мало, гессиан дёшев и вы уже вблизи решения'),
      avoidWhen: Atlas.L('far from a minimum or the Hessian is indefinite — it solves ∇f = 0, so it is happy to land on a saddle',
                         'точка далеко от минимума или гессиан знаконеопределён — метод решает ∇f = 0 и охотно приходит в седловую точку')
    }
  });

  /* ----------------------------------------------------- damped Newton -- */
  Atlas.registerMethod({
    id: 'newton_damped',
    name: Atlas.L('Damped Newton', 'Демпфированный Ньютон'),
    color: C.mint,
    order: 2,
    tag: Atlas.L('2nd', '2-й'),
    uses: [],
    needsHessian: true,
    create: function (P, o, x0) {
      return {
        x: x0,
        step: function () {
          var fx = P.f(this.x);
          var g = P.grad(this.x);
          var H = P.hess(this.x);
          var d = num.solve(H, num.scale(g, -1));
          var note = 'Newton direction', noteRu = 'направление Ньютона';
          if (!d || num.dot(g, d) >= 0) {
            d = num.scale(g, -1);                 /* not a descent direction */
            note = 'fell back to −∇f, ∇²f is not positive definite';
            noteRu = 'откат к −∇f: ∇²f не положительно определён';
          }
          var res = LS.armijo(P, this.x, fx, g, d, 1);
          if (!res.ok) {
            this.status = 'failed';
            this.message = Atlas.L('line search failed along the Newton direction',
                                   'линейный поиск вдоль направления Ньютона не удался');
            return this.x;
          }
          this.x = res.x;
          this.info = Atlas.L(note + ', t = ' + num.fmt(res.t, 3),
                              noteRu + ', t = ' + num.fmt(res.t, 3));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f twice differentiable; a descent safeguard',
                        'f дважды дифференцируема; нужна страховка, гарантирующая спуск'),
      formula: Atlas.L('d<sub>k</sub>&nbsp;=&nbsp;−[∇²f(x<sub>k</sub>)]<sup>−1</sup>∇f(x<sub>k</sub>); if&nbsp;∇fᵀd<sub>k</sub>&nbsp;≥&nbsp;0 use&nbsp;d<sub>k</sub>&nbsp;=&nbsp;−∇f; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;t<sub>k</sub>d<sub>k</sub>, t<sub>k</sub>&nbsp;by&nbsp;backtracking&nbsp;from&nbsp;1',
                       'd<sub>k</sub>&nbsp;=&nbsp;−[∇²f(x<sub>k</sub>)]<sup>−1</sup>∇f(x<sub>k</sub>); если&nbsp;∇fᵀd<sub>k</sub>&nbsp;≥&nbsp;0, берём&nbsp;d<sub>k</sub>&nbsp;=&nbsp;−∇f; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;t<sub>k</sub>d<sub>k</sub>, t<sub>k</sub>&nbsp;—&nbsp;дроблением&nbsp;шага&nbsp;от&nbsp;1'),
      intuition: Atlas.L('Take the Newton direction but never trust its length: backtrack until f actually decreases, and refuse the direction entirely when the Hessian is not positive definite. This is what makes Newton safe to start far away.',
                         'Берём направление Ньютона, но не доверяем его длине: дробим шаг, пока f действительно не уменьшится, а если гессиан не положительно определён, отказываемся от этого направления совсем. Именно это делает метод Ньютона безопасным при старте издалека.'),
      cost: Atlas.L('one Hessian, one solve, plus a few function evaluations',
                    'один гессиан, одно решение системы и несколько вычислений f'),
      memory: 'O(n²)',
      rateConvex: Atlas.L('globally convergent to a stationary point with the Armijo condition',
                          'с условием Армихо глобально сходится к стационарной точке'),
      rateStrong: Atlas.L('quadratic near the solution, because t = 1 is eventually always accepted',
                          'квадратичная вблизи решения, потому что со временем t = 1 принимается всегда'),
      hyper: Atlas.L('the Armijo constant c₁ and the backtracking factor; the trial step always starts at 1 so the full Newton step is tried first.',
                     'константа Армихо c₁ и коэффициент дробления; пробный шаг всегда начинается с 1, так что сначала пробуется полный шаг Ньютона.'),
      useWhen: Atlas.L('you want Newton speed but cannot guarantee a good starting point',
                       'нужна скорость метода Ньютона, но хорошую начальную точку гарантировать нельзя'),
      avoidWhen: Atlas.L('n is large — the O(n³) solve and O(n²) storage dominate',
                         'n велико — решение системы за O(n³) и хранение O(n²) перевешивают всё остальное')
    }
  });

  /* ------------------------------------------------ Levenberg-Marquardt -- */
  Atlas.registerMethod({
    id: 'lm',
    name: Atlas.L('Levenberg-Marquardt', 'Левенберг–Марквардт'),
    color: C.amber,
    order: 2,
    tag: Atlas.L('2nd', '2-й'),
    uses: ['tau'],
    needsHessian: true,
    create: function (P, o, x0) {
      var tau = o.tau, nu = 2, n = x0.length;
      return {
        x: x0,
        rejected: false,
        step: function () {
          var fx = P.f(this.x);
          var g = P.grad(this.x);
          var H = P.hess(this.x);
          var A = [], i;
          for (i = 0; i < n; i++) { A.push(H[i].slice()); A[i][i] += tau; }
          var d = num.solve(A, num.scale(g, -1));
          if (!d) {
            tau *= nu; nu *= 2;
            this.rejected = true;
            this.info = Atlas.L('singular system, τ raised to ' + num.fmt(tau, 3),
                                'система вырождена, увеличиваем τ до ' + num.fmt(tau, 3));
            return this.x;
          }
          var xn = num.add(this.x, d);
          var fn = P.f(xn);
          /* decrease the quadratic model predicted, against the real one */
          var pred = -(num.dot(g, d) + 0.5 * num.dot(d, num.matVec(H, d)));
          var rho = (pred > 0 && isFinite(fn)) ? (fx - fn) / pred : -1;
          if (rho > 0) {
            this.x = xn;
            this.rejected = false;
            var w = 2 * rho - 1;
            tau = tau * Math.max(1 / 3, 1 - w * w * w);      /* Nielsen update */
            nu = 2;
            this.info = Atlas.L('accepted, ρ = ' + num.fmt(rho, 3) + ', τ = ' + num.fmt(tau, 4),
                                'шаг принят, ρ = ' + num.fmt(rho, 3) + ', τ = ' + num.fmt(tau, 4));
          } else {
            this.rejected = true;
            tau *= nu; nu *= 2;
            this.info = Atlas.L('step rejected, τ raised to ' + num.fmt(tau, 4),
                                'шаг отвергнут, увеличиваем τ до ' + num.fmt(tau, 4));
            if (tau > 1e12) {
              this.status = 'failed';
              this.message = Atlas.L('damping blew up: no acceptable step exists at this point',
                                     'демпфирование ушло в бесконечность: в этой точке нет приемлемого шага');
            }
          }
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f twice differentiable; one solve of (∇²f + τI) per trial',
                        'f дважды дифференцируема; одно решение системы с (∇²f + τI) на каждую пробу'),
      formula: Atlas.L('(∇²f(x<sub>k</sub>)&nbsp;+&nbsp;τI)&nbsp;d<sub>k</sub>&nbsp;=&nbsp;−∇f(x<sub>k</sub>)<br>ρ&nbsp;=&nbsp;(actual&nbsp;decrease)/(predicted&nbsp;decrease); accept&nbsp;and&nbsp;lower&nbsp;τ&nbsp;if&nbsp;ρ&nbsp;>&nbsp;0, else&nbsp;reject&nbsp;and&nbsp;raise&nbsp;τ',
                       '(∇²f(x<sub>k</sub>)&nbsp;+&nbsp;τI)&nbsp;d<sub>k</sub>&nbsp;=&nbsp;−∇f(x<sub>k</sub>)<br>ρ&nbsp;=&nbsp;(фактическое&nbsp;убывание)/(предсказанное); если&nbsp;ρ&nbsp;>&nbsp;0, принимаем&nbsp;шаг&nbsp;и&nbsp;уменьшаем&nbsp;τ, иначе&nbsp;отвергаем&nbsp;его&nbsp;и&nbsp;увеличиваем&nbsp;τ'),
      intuition: Atlas.L('One dial slides between the two extremes: with τ → 0 the step is Newton, with τ → ∞ it becomes a short gradient step. The damping is retuned every iteration from how well the quadratic model actually predicted the decrease.',
                         'Один регулятор плавно переводит метод между двумя крайностями: при τ → 0 шаг ньютоновский, при τ → ∞ он превращается в короткий градиентный шаг. Демпфирование перенастраивается на каждой итерации по тому, насколько хорошо квадратичная модель предсказала фактическое убывание.'),
      cost: Atlas.L('one Hessian and one solve per trial step, O(n³)',
                    'один гессиан и одно решение системы на каждый пробный шаг, O(n³)'),
      memory: 'O(n²)',
      rateConvex: Atlas.L('globally convergent — a rejected step only raises τ and is retried',
                          'глобально сходится — при отказе от шага τ лишь увеличивается и попытка повторяется'),
      rateStrong: Atlas.L('quadratic near the solution, where τ collapses to almost zero',
                          'квадратичная вблизи решения, где τ падает почти до нуля'),
      hyper: Atlas.L('the initial τ only; after that it adapts. Large τ is slow but safe, small τ is Newton with all of its risks.',
                     'только начальное значение τ, дальше оно подстраивается само. При большом τ метод медленный, но надёжный, при малом — это метод Ньютона со всеми его рисками.'),
      useWhen: Atlas.L('nonlinear least squares, or any problem where the Hessian is unreliable far from the solution',
                       'нелинейные задачи наименьших квадратов или любые задачи, где вдали от решения гессиану нельзя доверять'),
      avoidWhen: Atlas.L('n is large, or the Hessian is unavailable',
                         'n велико или гессиан недоступен')
    }
  });

  /* -------------------------------------------------------------- BFGS -- */
  Atlas.registerMethod({
    id: 'bfgs',
    name: Atlas.L('BFGS', 'BFGS'),
    color: C.indigo,
    order: 'quasi',
    tag: Atlas.L('qN', 'квази'),
    uses: [],
    create: function (P, o, x0) {
      var n = x0.length;
      var B = num.eye(n);                    /* approximation of the INVERSE Hessian */
      var g = P.grad(x0);
      var scaled = false;
      return {
        x: x0,
        step: function () {
          var d = num.scale(num.matVec(B, g), -1);
          if (num.dot(g, d) >= 0) { B = num.eye(n); d = num.scale(g, -1); }
          var fx = P.f(this.x);
          var res = LS.strongWolfe(P, this.x, fx, g, d, 1, { c2: 0.9 });
          if (!res.ok) {
            this.status = 'failed';
            this.message = Atlas.L('line search failed along the quasi-Newton direction',
                                   'линейный поиск вдоль квазиньютоновского направления не удался');
            return this.x;
          }
          var s = num.sub(res.x, this.x);
          var y = num.sub(res.g, g);
          var sy = num.dot(s, y);
          if (sy > 1e-12) {
            if (!scaled) {                    /* Nocedal-Wright initial scaling */
              B = num.eye(n, sy / num.dot(y, y));
              scaled = true;
            }
            var By = num.matVec(B, y);
            var yBy = num.dot(y, By);
            var c1 = (sy + yBy) / (sy * sy);
            for (var i = 0; i < n; i++) {
              for (var j = 0; j < n; j++) {
                B[i][j] += c1 * s[i] * s[j] - (By[i] * s[j] + s[i] * By[j]) / sy;
              }
            }
            this.info = 'sᵀy = ' + num.fmt(sy, 3) + ', t = ' + num.fmt(res.t, 3);
          } else {
            this.info = Atlas.L('curvature condition sᵀy > 0 failed, update skipped',
                                'условие кривизны sᵀy > 0 нарушено, обновление пропущено');
          }
          this.x = res.x;
          g = res.g;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f differentiable; exact gradients; O(n²) storage affordable',
                        'f дифференцируема; градиенты точные; память O(n²) допустима'),
      formula: 'd<sub>k</sub>&nbsp;=&nbsp;−B<sub>k</sub>∇f(x<sub>k</sub>), x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;t<sub>k</sub>d<sub>k</sub><br>s&nbsp;=&nbsp;x<sub>k+1</sub>−x<sub>k</sub>, y&nbsp;=&nbsp;∇f<sub>k+1</sub>−∇f<sub>k</sub><br>B<sub>k+1</sub>&nbsp;=&nbsp;(I&nbsp;−&nbsp;ρsyᵀ)B<sub>k</sub>(I&nbsp;−&nbsp;ρysᵀ)&nbsp;+&nbsp;ρssᵀ, ρ&nbsp;=&nbsp;1/sᵀy',
      intuition: Atlas.L('Never form the Hessian: infer its inverse from the change in gradient across the steps you have already taken. Each update is the smallest change to B that reproduces the observed curvature along the last step.',
                         'Гессиан не вычисляем вовсе: обратную к нему матрицу восстанавливаем по изменению градиента на уже сделанных шагах. Каждое обновление — наименьшее изменение B, которое воспроизводит наблюдаемую кривизну вдоль последнего шага.'),
      cost: Atlas.L('one gradient, a line search, and an O(n²) rank-two update',
                    'один градиент, линейный поиск и обновление ранга 2 за O(n²)'),
      memory: Atlas.L('O(n²) for the dense matrix — the reason L-BFGS exists',
                      'O(n²) на плотную матрицу — именно поэтому и появился L-BFGS'),
      rateConvex: Atlas.L('globally convergent with a Wolfe line search on smooth convex f',
                          'глобально сходится на гладких выпуклых f с линейным поиском по условиям Вульфа'),
      rateStrong: Atlas.L('superlinear, without ever computing a second derivative; on a quadratic in n variables with exact line searches it stops in at most n steps whatever κ is',
                          'сверхлинейная, хотя вторые производные не вычисляются ни разу; на квадратичной функции n переменных с точным линейным поиском метод останавливается не более чем за n шагов при любом κ'),
      hyper: Atlas.L('only the line search constants; c₂ = 0.9 is loose on purpose so that t = 1 is usually accepted.',
                     'только константы линейного поиска; значение c₂ = 0.9 нарочно мягкое, чтобы шаг t = 1 обычно принимался.'),
      useWhen: Atlas.L('n up to a few thousand, gradients exact, Hessian expensive or unavailable',
                       'n до нескольких тысяч, градиенты точные, гессиан дорог или недоступен'),
      avoidWhen: Atlas.L('n is very large (the matrix does not fit) or gradients are noisy',
                         'n очень велико (матрица не помещается в память) или градиенты зашумлены')
    }
  });

  /* ------------------------------------------------------------ L-BFGS -- */
  Atlas.registerMethod({
    id: 'lbfgs',
    name: Atlas.L('L-BFGS, memory m', 'L-BFGS, память m'),
    color: C.violet,
    order: 'quasi',
    tag: Atlas.L('qN', 'квази'),
    uses: ['mem'],
    create: function (P, o, x0) {
      var S = [], Y = [];
      var g = P.grad(x0);
      return {
        x: x0,
        step: function () {
          var m = Math.max(1, Math.round(o.mem));
          while (S.length > m) { S.shift(); Y.shift(); }

          /* two-loop recursion: d = −H_k ∇f without ever forming H_k */
          var q = g.slice(), a = [], i, rho;
          for (i = S.length - 1; i >= 0; i--) {
            rho = 1 / num.dot(S[i], Y[i]);
            a[i] = rho * num.dot(S[i], q);
            q = num.axpy(-a[i], Y[i], q);
          }
          var gamma = 1;
          if (S.length) {
            var L = S.length - 1;
            gamma = num.dot(S[L], Y[L]) / num.dot(Y[L], Y[L]);
          }
          var r = num.scale(q, gamma);
          for (i = 0; i < S.length; i++) {
            rho = 1 / num.dot(S[i], Y[i]);
            var b = rho * num.dot(Y[i], r);
            r = num.axpy(a[i] - b, S[i], r);
          }
          var d = num.scale(r, -1);
          if (num.dot(g, d) >= 0) { S.length = 0; Y.length = 0; d = num.scale(g, -1); }

          var fx = P.f(this.x);
          var res = LS.strongWolfe(P, this.x, fx, g, d, 1, { c2: 0.9 });
          if (!res.ok) {
            this.status = 'failed';
            this.message = Atlas.L('line search failed along the L-BFGS direction',
                                   'линейный поиск вдоль направления L-BFGS не удался');
            return this.x;
          }
          var s = num.sub(res.x, this.x);
          var y = num.sub(res.g, g);
          if (num.dot(s, y) > 1e-12) {
            S.push(s); Y.push(y);
            if (S.length > m) { S.shift(); Y.shift(); }
          }
          this.x = res.x;
          g = res.g;
          this.info = Atlas.L(S.length + ' of ' + m + ' pairs stored, t = ' + num.fmt(res.t, 3),
                              'пар в памяти: ' + S.length + ' из ' + m + ', t = ' + num.fmt(res.t, 3));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f differentiable; exact gradients only',
                        'f дифференцируема; только точные градиенты'),
      formula: Atlas.L('keep&nbsp;the&nbsp;last&nbsp;m&nbsp;pairs&nbsp;(s<sub>i</sub>,&nbsp;y<sub>i</sub>); two-loop&nbsp;recursion&nbsp;gives&nbsp;d<sub>k</sub>&nbsp;=&nbsp;−H<sub>k</sub>∇f(x<sub>k</sub>) in&nbsp;O(mn), with&nbsp;H<sub>k</sub><sup>0</sup>&nbsp;=&nbsp;(sᵀy/yᵀy)·I',
                       'храним&nbsp;последние&nbsp;m&nbsp;пар&nbsp;(s<sub>i</sub>,&nbsp;y<sub>i</sub>); двухцикловая&nbsp;рекурсия: d<sub>k</sub>&nbsp;=&nbsp;−H<sub>k</sub>∇f(x<sub>k</sub>) за&nbsp;O(mn), где&nbsp;H<sub>k</sub><sup>0</sup>&nbsp;=&nbsp;(sᵀy/yᵀy)·I'),
      intuition: Atlas.L('BFGS without the matrix: the same direction is reconstructed on the fly from the last m steps and gradient differences. Old curvature information is simply forgotten, which also helps when f changes character along the path.',
                         'BFGS без матрицы: то же направление восстанавливается на лету по последним m шагам и разностям градиентов. Старая информация о кривизне просто забывается, и это даже помогает, когда характер f меняется по ходу траектории.'),
      cost: Atlas.L('one gradient plus O(mn) work — no matrix ever exists',
                    'один градиент и O(mn) операций — матрицы нет вовсе'),
      memory: Atlas.L('O(mn), typically m between 5 and 20',
                      'O(mn), обычно m от 5 до 20'),
      rateConvex: Atlas.L('globally convergent with a Wolfe line search',
                          'глобально сходится с линейным поиском по условиям Вульфа'),
      rateStrong: Atlas.L('linear with a very good constant; not quite the superlinear rate of full BFGS. Like BFGS it is untroubled by κ on a quadratic',
                          'линейная с очень хорошей константой; до сверхлинейной скорости полного BFGS немного не дотягивает. Как и BFGS, на квадратичной функции метод не чувствителен к κ'),
      hyper: Atlas.L('the memory m. Larger m means a better direction and more storage. While the memory still holds every pair the direction is the BFGS one exactly; the two paths separate later only because L-BFGS rescales its initial matrix H⁰ = (sᵀy/yᵀy)·I at every iteration instead of updating one fixed B₀.',
                     'память m. Чем больше m, тем лучше направление и тем больше памяти. Пока в памяти помещаются все пары, направление в точности совпадает с направлением BFGS; траектории двух методов расходятся позже лишь потому, что L-BFGS на каждой итерации заново масштабирует начальную матрицу H⁰ = (sᵀy/yᵀy)·I, а не обновляет одну фиксированную B₀.'),
      useWhen: Atlas.L('n is large — this is the standard workhorse for smooth large-scale problems',
                       'n велико — это стандартная «рабочая лошадка» для гладких задач большой размерности'),
      avoidWhen: Atlas.L('gradients are stochastic, or the problem is nonsmooth',
                         'градиенты стохастические или задача негладкая')
    }
  });


  /* =====================================================================
     Part 3a: stochastic optimizers (section C).

     Interface differs from the continuous one in two small ways:
       batchSize(o, n)  how many individual gradients one update consumes
       create(SP, o, x0) -> { x, lr, used, step() }
     The driver writes this.lr before every call, taking the schedule into
     account, and reads this.used to advance the epoch counter.
     SP is the finite-sum problem from Atlas.makeStochasticProblem.
     =================================================================== */

  var EPS_ADAPT = 1e-8;

  function clampBatch(o, n) {
    return Math.max(1, Math.min(n, Math.round(o.batch)));
  }

  Atlas.registerMethod({
    id: 'gd_full', name: Atlas.L('Full-batch GD', 'Полный градиентный спуск'), color: C.blue,
    category: 'stochastic', tag: Atlas.L('batch', 'батч'), uses: ['lr'],
    batchSize: function (o, n) { return n; },
    create: function (SP, o, x0) {
      return {
        x: x0, lr: 0, used: SP.n,
        step: function () {
          var g = SP.gradFull(this.x);
          this.x = num.axpy(-this.lr, g, this.x);
          this.used = SP.n;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('a finite sum you can afford to read in full every step',
                        'конечная сумма, которую не слишком дорого просматривать целиком на каждом шаге'),
      formula: 'x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·(1/n)Σ<sub>i</sub>∇f<sub>i</sub>(x<sub>k</sub>)',
      intuition: Atlas.L('Read the whole dataset, then take one step. The direction is exact, so the path is smooth and it converges to the minimum itself rather than to a cloud around it — but one step costs n gradients.',
                         'Просматриваем всю выборку и только затем делаем один шаг. Направление точное, поэтому траектория гладкая и сходится к самому минимуму, а не к облаку вокруг него, — но один шаг стоит n градиентов.'),
      cost: Atlas.L('n gradients per update, 1 update per epoch',
                    'n градиентов на обновление, 1 обновление за эпоху'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/k) in updates, and each update is n times more expensive',
                          'O(1/k) по числу обновлений, и каждое обновление в n раз дороже'),
      rateStrong: Atlas.L('linear in updates: (1 − μ/L)ᵏ, with no noise floor at all',
                          'линейная по числу обновлений: (1 − μ/L)ᵏ, и никакого шумового порога'),
      hyper: Atlas.L('α only; the usual safe choice is 1/L of the averaged problem.',
                     'только α; обычный безопасный выбор — 1/L для усреднённой задачи.'),
      useWhen: Atlas.L('n is small, or the last few digits of accuracy actually matter',
                       'n мало или действительно важны последние знаки точности'),
      avoidWhen: Atlas.L('n is large — you pay n gradients for information a handful would have given',
                         'n велико — вы платите n градиентами за информацию, которую дали бы и несколько')
    }
  });

  Atlas.registerMethod({
    id: 'sgd1', name: Atlas.L('SGD, batch 1', 'SGD, батч 1'), color: C.orange,
    category: 'stochastic', tag: Atlas.L('noisy', 'шумный'), uses: ['lr'],
    batchSize: function () { return 1; },
    create: function (SP, o, x0) {
      var sample = SP.samplerFor(1);
      return {
        x: x0, lr: 0, used: 1,
        step: function () {
          var g = SP.gradBatch(this.x, sample(1));
          this.x = num.axpy(-this.lr, g, this.x);
          this.used = 1;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('an unbiased gradient estimate from a single sample',
                        'несмещённая оценка градиента по одному объекту'),
      formula: Atlas.L('pick&nbsp;i&nbsp;at&nbsp;random; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α∇f<sub>i</sub>(x<sub>k</sub>)',
                       'выбираем&nbsp;i&nbsp;случайно; x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α∇f<sub>i</sub>(x<sub>k</sub>)'),
      intuition: Atlas.L('One sample is an unbiased but very noisy estimate of the gradient. With n updates for the price of one full-batch step it makes enormous early progress, then rattles around the minimum forever instead of reaching it.',
                         'Один объект даёт несмещённую, но очень шумную оценку градиента. За цену одного шага по полному батчу метод делает n обновлений и поначалу продвигается стремительно, а потом бесконечно мечется вокруг минимума, так и не достигая его.'),
      cost: Atlas.L('1 gradient per update, n updates per epoch',
                    '1 градиент на обновление, n обновлений за эпоху'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/√k) with a fixed step, plus a noise floor proportional to α',
                          'O(1/√k) при постоянном шаге плюс шумовой порог, пропорциональный α'),
      rateStrong: Atlas.L('converges to a ball of radius ≈ √(ασ²/μ), not to a point',
                          'сходится к шару радиуса ≈ √(ασ²/μ), а не к точке'),
      hyper: Atlas.L('α, and the schedule. A decaying α is what turns the ball into a point.',
                     'α и расписание шага. Именно затухающий шаг стягивает шар в точку.'),
      useWhen: Atlas.L('n is large and a rough solution fast is worth more than a precise one slowly',
                       'n велико и быстрое грубое решение ценнее медленного точного'),
      avoidWhen: Atlas.L('you need high accuracy at a fixed step size',
                         'нужна высокая точность при постоянном шаге')
    }
  });

  Atlas.registerMethod({
    id: 'sgd_mb', name: Atlas.L('Mini-batch SGD', 'SGD по мини-батчам'), color: C.cyan,
    category: 'stochastic', tag: Atlas.L('noisy', 'шумный'), uses: ['lr', 'batch'],
    batchSize: clampBatch,
    create: function (SP, o, x0) {
      var b = clampBatch(o, SP.n);
      var sample = SP.samplerFor(b);
      return {
        x: x0, lr: 0, used: b,
        step: function () {
          var g = SP.gradBatch(this.x, sample(b));
          this.x = num.axpy(-this.lr, g, this.x);
          this.used = b;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('an unbiased gradient estimate from a batch',
                        'несмещённая оценка градиента по батчу'),
      formula: 'x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·(1/b)Σ<sub>i∈B</sub>∇f<sub>i</sub>(x<sub>k</sub>)',
      intuition: Atlas.L('Averaging b samples divides the noise variance by b, so the cloud the iterates settle into shrinks like √(1/b). The batch size buys accuracy with gradient evaluations at exactly that exchange rate.',
                         'Усреднение по b объектам делит дисперсию шума на b, поэтому облако, в котором оседают точки траектории, сжимается как √(1/b). Размер батча обменивает вычисления градиентов на точность ровно по этому курсу.'),
      cost: Atlas.L('b gradients per update, n/b updates per epoch',
                    'b градиентов на обновление, n/b обновлений за эпоху'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/√k) with a fixed step; the noise floor scales with α/b',
                          'O(1/√k) при постоянном шаге; шумовой порог пропорционален α/b'),
      rateStrong: Atlas.L('radius of the limiting ball ∝ √(α/b)',
                          'радиус предельного шара ∝ √(α/b)'),
      hyper: Atlas.L('α and b together — doubling b lets you keep the same noise at twice the step.',
                     'α и b вместе — удвоив b, можно вдвое увеличить шаг при том же шуме.'),
      useWhen: Atlas.L('almost always in practice; b is set by what the hardware likes',
                       'на практике почти всегда; b выбирают под возможности оборудования'),
      avoidWhen: Atlas.L('b so large that you are paying full-batch prices for stochastic accuracy',
                         'b так велико, что вы платите цену полного батча за стохастическую точность')
    }
  });

  Atlas.registerMethod({
    id: 'sgd_mom', name: Atlas.L('SGD + momentum', 'SGD + импульс'), color: C.rose,
    category: 'stochastic', tag: Atlas.L('noisy', 'шумный'), uses: ['lr', 'batch', 'beta1'],
    batchSize: clampBatch,
    create: function (SP, o, x0) {
      var b = clampBatch(o, SP.n);
      var sample = SP.samplerFor(b);
      var v = num.zeros(x0.length);
      return {
        x: x0, lr: 0, used: b,
        step: function () {
          var g = SP.gradBatch(this.x, sample(b));
          for (var i = 0; i < v.length; i++) v[i] = o.beta1 * v[i] + g[i];
          this.x = num.axpy(-this.lr, v, this.x);
          this.used = b;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('as mini-batch SGD', 'как у SGD по мини-батчам'),
      formula: 'v<sub>k+1</sub>&nbsp;=&nbsp;β₁v<sub>k</sub>&nbsp;+&nbsp;g<sub>k</sub>, x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;αv<sub>k+1</sub>',
      intuition: Atlas.L('Averaging successive noisy gradients cancels part of the noise and reinforces the consistent direction, so momentum acts as a cheap variance reduction as well as an accelerator.',
                         'Усреднение последовательных шумных градиентов гасит часть шума и усиливает устойчивое направление, так что импульс работает и как дешёвое снижение дисперсии, и как ускоритель.'),
      cost: Atlas.L('b gradients per update', 'b градиентов на обновление'),
      memory: Atlas.L('O(n) for the velocity', 'O(n) на скорость'),
      rateConvex: Atlas.L('same order as SGD, with a better constant in practice',
                          'тот же порядок, что у SGD, но на практике с лучшей константой'),
      rateStrong: Atlas.L('the effective step is α/(1−β₁), so the noise ball grows unless α is reduced to match',
                          'эффективный шаг равен α/(1−β₁), поэтому шар шума растёт, если соответственно не уменьшить α'),
      hyper: Atlas.L('β₁ ≈ 0.9 is the default; remember it multiplies the effective step by about 10.',
                     'по умолчанию β₁ ≈ 0.9; помните, что это увеличивает эффективный шаг примерно в 10 раз.'),
      useWhen: Atlas.L('nearly all deep-learning training',
                       'почти любое обучение глубоких сетей'),
      avoidWhen: Atlas.L('the step size was tuned without momentum — adding β₁ silently rescales it',
                         'шаг подбирали без импульса — добавление β₁ незаметно меняет его масштаб')
    }
  });

  Atlas.registerMethod({
    id: 'adagrad', name: Atlas.L('Adagrad', 'Adagrad'), color: C.olive,
    category: 'stochastic', tag: Atlas.L('adaptive', 'адаптивный'), uses: ['lr', 'batch'],
    batchSize: clampBatch,
    create: function (SP, o, x0) {
      var b = clampBatch(o, SP.n);
      var sample = SP.samplerFor(b);
      var G = num.zeros(x0.length);
      return {
        x: x0, lr: 0, used: b,
        step: function () {
          var g = SP.gradBatch(this.x, sample(b));
          var xn = this.x.slice();
          for (var i = 0; i < g.length; i++) {
            G[i] += g[i] * g[i];
            xn[i] -= this.lr * g[i] / (Math.sqrt(G[i]) + EPS_ADAPT);
          }
          this.x = xn;
          this.used = b;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('as SGD; pays off when gradients are sparse',
                        'как у SGD; окупается при разреженных градиентах'),
      formula: 'G<sub>k</sub>&nbsp;=&nbsp;G<sub>k−1</sub>&nbsp;+&nbsp;g<sub>k</sub>², x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·g<sub>k</sub>/(√G<sub>k</sub>&nbsp;+&nbsp;ε)',
      intuition: Atlas.L('Give every coordinate its own step size, inversely proportional to how much gradient it has accumulated so far. Rare, small-gradient coordinates keep a large step; busy ones are damped.',
                         'У каждой координаты свой шаг, обратно пропорциональный тому, сколько градиента по ней уже накопилось. Редкие координаты с малыми градиентами сохраняют большой шаг, а «загруженные» притормаживаются.'),
      cost: Atlas.L('b gradients plus O(n) elementwise work',
                    'b градиентов плюс O(n) поэлементных операций'),
      memory: Atlas.L('O(n) for the accumulator', 'O(n) на накопитель'),
      rateConvex: Atlas.L('O(1/√k) regret, excellent when the gradients are sparse',
                          'регрет O(1/√k) — отличная оценка при разреженных градиентах'),
      rateStrong: Atlas.L('the accumulator only grows, so the effective step decays to zero and progress stalls',
                          'накопитель только растёт, поэтому эффективный шаг стремится к нулю и прогресс останавливается'),
      hyper: Atlas.L('α only. ε ≈ 10⁻⁸ just avoids dividing by zero.',
                     'только α. ε ≈ 10⁻⁸ лишь защищает от деления на ноль.'),
      useWhen: Atlas.L('sparse features where a few coordinates matter rarely but a lot',
                       'разреженные признаки, где некоторые координаты важны редко, но сильно'),
      avoidWhen: Atlas.L('long training runs — G never forgets, so the method eventually stops moving',
                         'долгое обучение — G ничего не забывает, и в итоге метод перестаёт двигаться')
    }
  });

  Atlas.registerMethod({
    id: 'rmsprop', name: Atlas.L('RMSProp', 'RMSProp'), color: C.teal,
    category: 'stochastic', tag: Atlas.L('adaptive', 'адаптивный'), uses: ['lr', 'batch', 'beta2'],
    batchSize: clampBatch,
    create: function (SP, o, x0) {
      var b = clampBatch(o, SP.n);
      var sample = SP.samplerFor(b);
      var v = num.zeros(x0.length);
      return {
        x: x0, lr: 0, used: b,
        step: function () {
          var g = SP.gradBatch(this.x, sample(b));
          var xn = this.x.slice();
          for (var i = 0; i < g.length; i++) {
            v[i] = o.beta2 * v[i] + (1 - o.beta2) * g[i] * g[i];
            xn[i] -= this.lr * g[i] / (Math.sqrt(v[i]) + EPS_ADAPT);
          }
          this.x = xn;
          this.used = b;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('as SGD; tolerates a non-stationary objective',
                        'как у SGD; допускает нестационарную целевую функцию'),
      formula: 'v<sub>k</sub>&nbsp;=&nbsp;β₂v<sub>k−1</sub>&nbsp;+&nbsp;(1−β₂)g<sub>k</sub>², x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·g<sub>k</sub>/(√v<sub>k</sub>&nbsp;+&nbsp;ε)',
      intuition: Atlas.L('Adagrad with a forgetting factor: the squared-gradient average is exponential rather than cumulative, so the step size can recover when the landscape changes instead of decaying forever.',
                         'Adagrad с забыванием: среднее квадратов градиента экспоненциальное, а не накопительное, поэтому шаг не затухает навсегда и может восстановиться, когда ландшафт меняется.'),
      cost: Atlas.L('b gradients plus O(n) elementwise work',
                    'b градиентов плюс O(n) поэлементных операций'),
      memory: 'O(n)',
      rateConvex: Atlas.L('no clean guarantee; it is an engineering fix that works',
                          'чётких гарантий нет; это инженерное решение, которое просто работает'),
      rateStrong: Atlas.L('still has a noise floor, set by α and the batch size',
                          'шумовой порог остаётся, его задают α и размер батча'),
      hyper: Atlas.L('β₂ ≈ 0.999 averages over roughly the last 1/(1−β₂) gradients.',
                     'β₂ ≈ 0.999 усредняет примерно по последним 1/(1−β₂) градиентам.'),
      useWhen: Atlas.L('recurrent networks and other non-stationary objectives',
                       'рекуррентные сети и другие нестационарные целевые функции'),
      avoidWhen: Atlas.L('you need a convergence proof rather than a good default',
                         'нужно доказательство сходимости, а не просто хороший выбор по умолчанию')
    }
  });

  Atlas.registerMethod({
    id: 'adam', name: Atlas.L('Adam', 'Adam'), color: C.purple,
    category: 'stochastic', tag: Atlas.L('adaptive', 'адаптивный'), uses: ['lr', 'batch', 'beta1', 'beta2', 'wd'],
    batchSize: clampBatch,
    create: function (SP, o, x0) {
      var b = clampBatch(o, SP.n);
      var sample = SP.samplerFor(b);
      var m = num.zeros(x0.length), v = num.zeros(x0.length), t = 0;
      return {
        x: x0, lr: 0, used: b,
        step: function () {
          var g = SP.gradBatch(this.x, sample(b));
          t++;
          var xn = this.x.slice(), i;
          for (i = 0; i < g.length; i++) {
            var gi = g[i] + o.wd * this.x[i];          /* L2 folded into the gradient */
            m[i] = o.beta1 * m[i] + (1 - o.beta1) * gi;
            v[i] = o.beta2 * v[i] + (1 - o.beta2) * gi * gi;
            var mh = m[i] / (1 - Math.pow(o.beta1, t));
            var vh = v[i] / (1 - Math.pow(o.beta2, t));
            xn[i] -= this.lr * mh / (Math.sqrt(vh) + EPS_ADAPT);
          }
          this.x = xn;
          this.used = b;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('as SGD', 'как у SGD'),
      formula: 'm<sub>k</sub>&nbsp;=&nbsp;β₁m<sub>k−1</sub>+(1−β₁)g<sub>k</sub>, v<sub>k</sub>&nbsp;=&nbsp;β₂v<sub>k−1</sub>+(1−β₂)g<sub>k</sub>²<br>m̂&nbsp;=&nbsp;m<sub>k</sub>/(1−β₁ᵏ), v̂&nbsp;=&nbsp;v<sub>k</sub>/(1−β₂ᵏ)<br>x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·m̂/(√v̂&nbsp;+&nbsp;ε)',
      intuition: Atlas.L('Momentum and per-coordinate scaling at once, with a bias correction that stops the first few steps from being far too small. The update size is roughly α regardless of the gradient magnitude, which is why one learning rate works across very different models.',
                         'Импульс и покоординатное масштабирование сразу, плюс поправка на смещение, которая не даёт первым шагам быть слишком маленькими. Размер обновления примерно равен α независимо от величины градиента, поэтому один и тот же шаг годится для очень разных моделей.'),
      cost: Atlas.L('b gradients plus O(n) elementwise work',
                    'b градиентов плюс O(n) поэлементных операций'),
      memory: Atlas.L('O(n) for two moment vectors', 'O(n) на два вектора моментов'),
      rateConvex: Atlas.L('the original proof was wrong; AMSGrad and others patch it',
                          'исходное доказательство оказалось ошибочным; AMSGrad и другие варианты это исправляют'),
      rateStrong: Atlas.L('a noise floor like SGD, but far less sensitive to the scale of the problem',
                          'шумовой порог, как у SGD, но гораздо меньшая чувствительность к масштабу задачи'),
      hyper: Atlas.L('β₁ = 0.9, β₂ = 0.999, α ≈ 10⁻³ works almost everywhere. Weight decay here is added to the gradient, so the adaptive denominator rescales it.',
                     'β₁ = 0.9, β₂ = 0.999, α ≈ 10⁻³ подходят почти везде. Затухание весов здесь прибавляется к градиенту, поэтому адаптивный знаменатель его перемасштабирует.'),
      useWhen: Atlas.L('the default first thing to try on any deep model',
                       'первое, что стоит попробовать на любой глубокой модели'),
      avoidWhen: Atlas.L('the last digits matter, or when its coupled weight decay is unwanted',
                         'важны последние знаки точности или нежелательно затухание весов, связанное с градиентом')
    }
  });

  Atlas.registerMethod({
    id: 'adamw', name: Atlas.L('AdamW', 'AdamW'), color: C.violet,
    category: 'stochastic', tag: Atlas.L('adaptive', 'адаптивный'), uses: ['lr', 'batch', 'beta1', 'beta2', 'wd'],
    batchSize: clampBatch,
    create: function (SP, o, x0) {
      var b = clampBatch(o, SP.n);
      var sample = SP.samplerFor(b);
      var m = num.zeros(x0.length), v = num.zeros(x0.length), t = 0;
      return {
        x: x0, lr: 0, used: b,
        step: function () {
          var g = SP.gradBatch(this.x, sample(b));
          t++;
          var xn = this.x.slice(), i;
          for (i = 0; i < g.length; i++) {
            m[i] = o.beta1 * m[i] + (1 - o.beta1) * g[i];
            v[i] = o.beta2 * v[i] + (1 - o.beta2) * g[i] * g[i];
            var mh = m[i] / (1 - Math.pow(o.beta1, t));
            var vh = v[i] / (1 - Math.pow(o.beta2, t));
            /* decoupled: the decay is NOT divided by √v̂ */
            xn[i] -= this.lr * (mh / (Math.sqrt(vh) + EPS_ADAPT) + o.wd * this.x[i]);
          }
          this.x = xn;
          this.used = b;
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('as SGD, with weight decay wanted',
                        'как у SGD, когда нужно затухание весов'),
      formula: Atlas.L('same&nbsp;m̂,&nbsp;v̂&nbsp;as&nbsp;Adam,&nbsp;but&nbsp;computed&nbsp;from&nbsp;g&nbsp;alone<br>x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·(m̂/(√v̂&nbsp;+&nbsp;ε)&nbsp;+&nbsp;λ<sub>wd</sub>x<sub>k</sub>)',
                       'те&nbsp;же&nbsp;m̂,&nbsp;v̂,&nbsp;что&nbsp;и&nbsp;в&nbsp;Adam, но&nbsp;вычисленные&nbsp;только&nbsp;по&nbsp;g<br>x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;α·(m̂/(√v̂&nbsp;+&nbsp;ε)&nbsp;+&nbsp;λ<sub>wd</sub>x<sub>k</sub>)'),
      intuition: Atlas.L('The only change from Adam is where the weight decay enters. Adam adds it to the gradient, so the adaptive denominator divides it by √v̂ and every coordinate is decayed by a different amount; AdamW applies it directly to the weights, so decay means the same thing everywhere.',
                         'Единственное отличие от Adam — то, куда входит затухание весов. Adam прибавляет его к градиенту, поэтому адаптивный знаменатель делит его на √v̂ и каждая координата затухает по-своему; AdamW применяет затухание прямо к весам, так что оно везде означает одно и то же.'),
      cost: Atlas.L('identical to Adam', 'как у Adam'),
      memory: 'O(n)',
      rateConvex: Atlas.L('as for Adam', 'как у Adam'),
      rateStrong: Atlas.L('as for Adam; the fixed point sits where the decay balances the gradient',
                          'как у Adam; неподвижная точка там, где затухание уравновешивает градиент'),
      hyper: Atlas.L('the same as Adam plus the decay λ. Set the decay to 0 and AdamW and Adam become the same algorithm.',
                     'те же, что у Adam, плюс коэффициент затухания λ. При нулевом затухании AdamW и Adam совпадают.'),
      useWhen: Atlas.L('any model where weight decay is used as regularization — this is the modern default',
                       'любые модели, где затухание весов служит регуляризацией, — это современный выбор по умолчанию'),
      avoidWhen: Atlas.L('you are reproducing a paper that specifically used Adam with L2',
                         'вы воспроизводите статью, в которой использовали именно Adam с L2')
    }
  });

  /* =====================================================================
     Part 3b: constrained and nonsmooth methods (section D).

     The problem object carries the extra operators these need:
       P.project(x)   Euclidean projection onto the feasible set
       P.lmo(g)       argmin over the set of ⟨g, s⟩, for Frank-Wolfe
       P.prox(x, t)   proximal operator of the nonsmooth part
       P.gradSmooth(x)   gradient of the SMOOTH part only
     =================================================================== */

  Atlas.registerMethod({
    id: 'proj_grad', name: Atlas.L('Projected gradient', 'Метод проекции градиента'), color: C.blue,
    category: 'constrained', tag: Atlas.L('set', 'множ.'), uses: ['alpha'],
    needsSet: true,
    create: function (P, o, x0) {
      return {
        x: P.project(x0),
        step: function () {
          var g = P.gradSmooth(this.x);
          var y = num.axpy(-o.alpha, g, this.x);
          this.trial = y;                          /* drawn as the pre-projection point */
          this.x = P.project(y);
          this.info = 'α = ' + num.fmt(o.alpha, 4);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('a cheap Euclidean projection onto C',
                        'дешёвая евклидова проекция на C'),
      formula: 'x<sub>k+1</sub>&nbsp;=&nbsp;P<sub>C</sub>(x<sub>k</sub>&nbsp;−&nbsp;α∇f(x<sub>k</sub>))',
      intuition: Atlas.L('Take the ordinary gradient step, then snap back to the nearest feasible point. Feasibility is restored exactly at every iteration, so the iterate is always a usable answer.',
                         'Делаем обычный градиентный шаг, а затем возвращаемся в ближайшую допустимую точку. Допустимость точно восстанавливается на каждой итерации, так что текущая точка всегда годится как ответ.'),
      cost: Atlas.L('one gradient plus one projection', 'один градиент и одна проекция'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/k), exactly as in the unconstrained case',
                          'O(1/k), в точности как без ограничений'),
      rateStrong: Atlas.L('linear, (1 − μ/L)ᵏ — projection is nonexpansive and costs nothing in rate',
                          'линейная, (1 − μ/L)ᵏ — проекция нерастягивающая и скорость не ухудшает'),
      hyper: Atlas.L('α, with the same 1/L rule as gradient descent.',
                     'α, по тому же правилу 1/L, что и в градиентном спуске.'),
      useWhen: Atlas.L('the projection is cheap: a ball, a box, a simplex',
                       'проекция дешёвая: шар, брус, симплекс'),
      avoidWhen: Atlas.L('projecting is itself hard — onto an intersection it needs its own iterative solver',
                         'проецирование само по себе трудно — для проекции на пересечение нужен собственный итерационный алгоритм')
    }
  });

  Atlas.registerMethod({
    id: 'frank_wolfe', name: Atlas.L('Frank-Wolfe', 'Франк–Вульф'), color: C.orange,
    category: 'constrained', tag: Atlas.L('set', 'множ.'), uses: [],
    needsSet: true,
    create: function (P, o, x0) {
      var k = 0;
      return {
        x: P.project(x0),
        step: function () {
          var g = P.gradSmooth(this.x);
          var s = P.lmo(g);
          this.vertex = s;                          /* drawn, with the segment to it */
          var gamma = 2 / (k + 2);
          this.gap = num.dot(g, num.sub(this.x, s)); /* the Frank-Wolfe duality gap */
          this.x = num.axpy(gamma, num.sub(s, this.x), this.x);
          k++;
          this.info = Atlas.L('γ = ' + num.fmt(gamma, 3) + ', gap = ' + num.fmt(this.gap, 3),
                              'γ = ' + num.fmt(gamma, 3) + ', зазор = ' + num.fmt(this.gap, 3));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('a cheap linear oracle over C, and C bounded',
                        'дешёвый линейный оракул на C, и C ограничено'),
      formula: 's<sub>k</sub>&nbsp;=&nbsp;argmin<sub>s∈C</sub>&nbsp;⟨∇f(x<sub>k</sub>),&nbsp;s⟩, γ<sub>k</sub>&nbsp;=&nbsp;2/(k+2)<br>x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;+&nbsp;γ<sub>k</sub>(s<sub>k</sub>&nbsp;−&nbsp;x<sub>k</sub>)',
      intuition: Atlas.L('Never project. Minimise a linear model over the set instead — which lands on a vertex — and move part of the way there. Every iterate is a convex combination of vertices, so it stays feasible and stays sparse.',
                         'Никаких проекций. Вместо них минимизируем линейную модель на множестве — минимум приходится на вершину — и проходим часть пути к ней. Каждая точка траектории — выпуклая комбинация вершин, поэтому она остаётся допустимой и разреженной.'),
      cost: Atlas.L('one gradient plus one linear oracle call, often far cheaper than a projection',
                    'один градиент и один вызов линейного оракула — часто гораздо дешевле проекции'),
      memory: Atlas.L('O(n); the iterate is a combination of at most k vertices',
                      'O(n); текущая точка — комбинация не более чем k вершин'),
      rateConvex: Atlas.L('O(1/k), and ⟨∇f, x−s⟩ is a free certificate of how far from optimal you are',
                          'O(1/k), а ⟨∇f, x−s⟩ — бесплатный сертификат того, насколько вы далеки от оптимума'),
      rateStrong: Atlas.L('still O(1/k) when the optimum lies on the boundary — it zigzags between vertices',
                          'всё ещё O(1/k), если оптимум лежит на границе, — метод зигзагом мечется между вершинами'),
      hyper: Atlas.L('none with the 2/(k+2) schedule; a line search along the segment is the usual improvement.',
                     'нет при расписании 2/(k+2); обычное улучшение — линейный поиск вдоль отрезка.'),
      useWhen: Atlas.L('the linear oracle is cheap and the projection is not: nuclear-norm balls, flow polytopes',
                       'линейный оракул дешёв, а проекция — нет: шары ядерной нормы, многогранники потоков'),
      avoidWhen: Atlas.L('you need high accuracy — the zigzagging is real and O(1/k) is the honest rate',
                         'нужна высокая точность — зигзаги реальны, и O(1/k) — честная скорость')
    }
  });

  Atlas.registerMethod({
    id: 'subgradient', name: Atlas.L('Subgradient method', 'Субградиентный метод'), color: C.olive,
    category: 'constrained', tag: Atlas.L('nonsmooth', 'негладк.'), uses: ['alpha'],
    needsProx: true,
    create: function (P, o, x0) {
      var k = 0;
      return {
        x: x0,
        step: function () {
          var g = P.grad(this.x);                  /* a subgradient, not a gradient */
          var t = o.alpha / Math.sqrt(k + 1);
          var y = num.axpy(-t, g, this.x);
          this.x = P.project ? P.project(y) : y;
          k++;
          this.info = Atlas.L('step = α/√k = ' + num.fmt(t, 4),
                              'шаг = α/√k = ' + num.fmt(t, 4));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f convex; any one subgradient at each point',
                        'f выпукла; в каждой точке достаточно любого одного субградиента'),
      formula: 'g<sub>k</sub>&nbsp;∈&nbsp;∂f(x<sub>k</sub>), x<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k</sub>&nbsp;−&nbsp;(α/√k)·g<sub>k</sub>',
      intuition: Atlas.L('When f has a kink there is no gradient, only a set of subgradients, and any of them will do. The catch is that a subgradient is not a descent direction, so f does not decrease monotonically and the step must be forced to zero by hand.',
                         'В точке излома градиента нет, есть только множество субградиентов, и годится любой из них. Подвох в том, что субградиент не обязательно задаёт направление спуска, поэтому f убывает немонотонно и шаг приходится принудительно уводить к нулю.'),
      cost: Atlas.L('one subgradient, O(n)', 'один субградиент, O(n)'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/√k) — and that is optimal for general nonsmooth convex f',
                          'O(1/√k) — и это оптимально для общих негладких выпуклых f'),
      rateStrong: Atlas.L('O(1/k) with a 1/k step; still far slower than anything smooth',
                          'O(1/k) с шагом 1/k; всё равно гораздо медленнее, чем в гладком случае'),
      hyper: Atlas.L('the step schedule is everything: it must sum to infinity while its squares stay summable.',
                     'расписание шага решает всё: сумма шагов должна быть бесконечной, а сумма их квадратов — конечной.'),
      useWhen: Atlas.L('the nonsmooth part has no usable prox and nothing better applies',
                       'для негладкой части нет удобного prox и ничего лучшего не подходит'),
      avoidWhen: Atlas.L('the nonsmooth part is a known regularizer — then ISTA or FISTA is far faster',
                         'негладкая часть — известный регуляризатор; тогда ISTA или FISTA гораздо быстрее')
    }
  });

  Atlas.registerMethod({
    id: 'ista', name: Atlas.L('ISTA (proximal gradient)', 'ISTA (проксимальный градиент)'), color: C.teal,
    category: 'constrained', tag: Atlas.L('prox', 'prox'), uses: ['alpha'],
    needsProx: true,
    create: function (P, o, x0) {
      return {
        x: x0,
        step: function () {
          var g = P.gradSmooth(this.x);
          var y = num.axpy(-o.alpha, g, this.x);
          this.trial = y;
          this.x = P.prox(y, o.alpha);
          this.info = 'α = ' + num.fmt(o.alpha, 4);
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('f = g + h with ∇g Lipschitz and prox_h in closed form',
                        'f = g + h, где ∇g липшицев, а prox_h выписывается явно'),
      formula: Atlas.L('x<sub>k+1</sub>&nbsp;=&nbsp;prox<sub>αh</sub>(x<sub>k</sub>&nbsp;−&nbsp;α∇g(x<sub>k</sub>))<br>for&nbsp;h&nbsp;=&nbsp;λ‖x‖₁: prox<sub>αλ</sub>(z)<sub>i</sub>&nbsp;=&nbsp;sign(z<sub>i</sub>)max(|z<sub>i</sub>|−αλ,&nbsp;0)',
                       'x<sub>k+1</sub>&nbsp;=&nbsp;prox<sub>αh</sub>(x<sub>k</sub>&nbsp;−&nbsp;α∇g(x<sub>k</sub>))<br>для&nbsp;h&nbsp;=&nbsp;λ‖x‖₁: prox<sub>αλ</sub>(z)<sub>i</sub>&nbsp;=&nbsp;sign(z<sub>i</sub>)max(|z<sub>i</sub>|−αλ,&nbsp;0)'),
      intuition: Atlas.L('Split f into a smooth part and a nonsmooth part you can solve exactly. Take a gradient step on the smooth half, then apply the proximal operator of the other half — for the L1 norm that is soft thresholding, which sets small coordinates to exactly zero.',
                         'Разбиваем f на гладкую часть и негладкую, с которой можно справиться точно. Делаем градиентный шаг по гладкой части, затем применяем проксимальный оператор второй части — для нормы L1 это мягкая пороговая функция: она делает малые координаты в точности нулевыми.'),
      cost: Atlas.L('one gradient plus one prox, both O(n) for separable penalties',
                    'один градиент и один prox, оба за O(n) для сепарабельных штрафов'),
      memory: 'O(n)',
      rateConvex: Atlas.L('O(1/k), the same as smooth gradient descent — the kink costs nothing',
                          'O(1/k), как у гладкого градиентного спуска, — излом ничего не стоит'),
      rateStrong: Atlas.L('linear when the smooth part is strongly convex',
                          'линейная, если гладкая часть сильно выпукла'),
      hyper: Atlas.L('α ≤ 1/L, where L belongs to the smooth part only.',
                     'α ≤ 1/L, где L относится только к гладкой части.'),
      useWhen: Atlas.L('Lasso, group Lasso, nuclear norm — any penalty with a closed-form prox',
                       'лассо, групповое лассо, ядерная норма — любой штраф с prox в явном виде'),
      avoidWhen: Atlas.L('the prox has no closed form and must itself be solved numerically',
                         'prox не выписывается явно, и его самого приходится находить численно')
    }
  });

  Atlas.registerMethod({
    id: 'fista', name: Atlas.L('FISTA', 'FISTA'), color: C.purple,
    category: 'constrained', tag: Atlas.L('prox', 'prox'), uses: ['alpha'],
    needsProx: true,
    create: function (P, o, x0) {
      var y = x0.slice(), t = 1;
      return {
        x: x0,
        step: function () {
          var g = P.gradSmooth(y);
          var z = num.axpy(-o.alpha, g, y);
          var xNew = P.prox(z, o.alpha);
          var tNew = 0.5 * (1 + Math.sqrt(1 + 4 * t * t));
          y = num.axpy((t - 1) / tNew, num.sub(xNew, this.x), xNew);
          t = tNew;
          this.x = xNew;
          this.info = Atlas.L('momentum (t−1)/t⁺ = ' + num.fmt((tNew - 1) / tNew, 3),
                              'импульс (t−1)/t⁺ = ' + num.fmt((tNew - 1) / tNew, 3));
          return this.x;
        }
      };
    },
    card: {
      requires: Atlas.L('as ISTA', 'как у ISTA'),
      formula: 'x<sub>k+1</sub>&nbsp;=&nbsp;prox<sub>αh</sub>(y<sub>k</sub>&nbsp;−&nbsp;α∇g(y<sub>k</sub>))<br>t<sub>k+1</sub>&nbsp;=&nbsp;(1+√(1+4t<sub>k</sub>²))/2<br>y<sub>k+1</sub>&nbsp;=&nbsp;x<sub>k+1</sub>&nbsp;+&nbsp;((t<sub>k</sub>−1)/t<sub>k+1</sub>)(x<sub>k+1</sub>&nbsp;−&nbsp;x<sub>k</sub>)',
      intuition: Atlas.L('ISTA with Nesterov momentum bolted on. The same prox, the same cost per iteration, and the rate improves from O(1/k) to O(1/k²) — the cheapest acceleration in the whole subject.',
                         'ISTA с добавленным импульсом Нестерова. Тот же prox, та же стоимость итерации, а скорость улучшается с O(1/k) до O(1/k²) — самое дешёвое ускорение во всём курсе.'),
      cost: Atlas.L('identical to ISTA: one gradient, one prox',
                    'как у ISTA: один градиент, один prox'),
      memory: Atlas.L('O(n) for the extrapolation point', 'O(n) на точку экстраполяции'),
      rateConvex: Atlas.L('O(1/k²), optimal for this problem class',
                          'O(1/k²), оптимально для этого класса задач'),
      rateStrong: Atlas.L('linear with restarts; the plain schedule ripples like Nesterov does',
                          'линейная с рестартами; при обычном расписании точки траектории колеблются, как у метода Нестерова'),
      hyper: Atlas.L('α ≤ 1/L. The momentum is scheduled, not tuned.',
                     'α ≤ 1/L. Импульс задаётся расписанием, а не подбирается.'),
      useWhen: Atlas.L('anywhere ISTA applies — there is essentially no reason to prefer plain ISTA',
                       'везде, где применим ISTA, — причин предпочесть обычный ISTA по сути нет'),
      avoidWhen: Atlas.L('f values are noisy, or monotone decrease is required (FISTA is not monotone)',
                         'значения f зашумлены или нужно монотонное убывание (FISTA немонотонен)')
    }
  });


})();
