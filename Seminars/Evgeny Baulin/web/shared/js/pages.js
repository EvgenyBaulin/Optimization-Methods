// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Builders of theory.html (the handout), cheatsheet.html (one printed A4 page) and the landing page index.html.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var render = SEM.render;
  var el = dom.el;

  var pages = (SEM.pages = {});

  function text(tag, attrs, path, values) {
    var node = el(tag, attrs);
    SEM.i18n.bind(function () {
      node.textContent = values ? SEM.tuf(path, values) : SEM.tu(path);
    });
    return node;
  }
  function rich(tag, attrs, pair) {
    return render.el(tag, attrs, pair);
  }
  // The label line of a box, worded as in the LaTeX handout: the UI string and a final period ("Trap.").
  function boxLabel(path, cls) {
    var node = el('p', { class: 'note-label' + (cls ? ' ' + cls : '') });
    SEM.i18n.bind(function () {
      node.textContent = SEM.tu(path) + '.';
    });
    return node;
  }

  // The LaTeX PDF of the current seminar, in the theory folder next to web/. The site publishes
  // no PDFs, so the button is there only when the pages are opened from the repository.
  function pdfLink(parent, base) {
    if (!SEM.course.inRepository()) return;
    var p = el('p', { class: 'pdf-link' });
    var a = el('a', { class: 'btn' });
    SEM.i18n.bind(function (lang) {
      a.setAttribute('href', SEM.course.pdfHref(SEM.course.topic(), base, lang, 1));
      a.textContent = SEM.tu('pages.pdf');
    });
    p.appendChild(a);
    parent.appendChild(p);
  }

  /* ------------------------------------------------------------------ handout */

  // A problem by id: the problems of the seminar, else a home problem of any block.
  function findProblem(pid) {
    var found = (SEM.content.problems || {})[pid];
    if (found) return found;
    var blocks = (SEM.content.main && SEM.content.main.blocks) || {};
    Object.keys(blocks).forEach(function (key) {
      var items = (blocks[key].home && blocks[key].home.items) || [];
      items.forEach(function (item) {
        if (!found && item && item.id === pid) found = item;
      });
    });
    return found;
  }

  // Who solves it: the problems of a block say so, a home problem is by hand or in code.
  function whoPath(prob) {
    if (prob.who === 'board') return 'problem.board';
    if (prob.who === 'students') return 'problem.students';
    return prob.kind === 'code' ? 'problem.inCode' : 'problem.byHand';
  }

  function problemBlock(pid) {
    var prob = findProblem(pid);
    var box = el('div', { class: 'handout-problem', id: 'problem-' + pid });
    var head = el('h4', { class: 'handout-problem-title' });
    if (!prob) {
      // no content file has this id: the page names it and the selftest fails on the missing UI string
      head.appendChild(el('span', { class: 'problem-id', text: pid }));
      box.appendChild(head);
      box.appendChild(text('p', { class: 'problem-who' }, 'problem.missing.' + pid));
      return box;
    }
    dom.append(head, [el('span', { class: 'problem-id', text: pid }), ' ', render.el('span', null, prob.title)]);
    box.appendChild(head);
    var who = text('p', { class: 'problem-who' }, whoPath(prob));
    box.appendChild(who);
    box.appendChild(rich('div', { class: 'problem-statement' }, prob.statement));
    var sol = text('h5', { class: 'solution-title' }, 'problem.solution');
    box.appendChild(sol);
    var ol = el('ol', { class: 'steps steps-static' });
    prob.steps.forEach(function (s) {
      var li = el('li', { class: 'step' });
      li.appendChild(rich('div', { class: 'step-text' }, s.text));
      if (s.table) li.appendChild(SEM.problems.simplexTable(s.table));
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var ans = el('p', { class: 'answer-text' });
    dom.append(ans, [text('strong', null, 'problem.answer'), ' ', render.el('span', null, prob.answerText)]);
    box.appendChild(ans);
    return box;
  }

  // The code of data.code[key] (a key or a list of keys): the kit's collapsible block, open, where the page
  // loads the kit; a titled read-only listing otherwise.
  function codeBlock(b) {
    var holder = el('div', { class: 'handout-code' });
    if (SEM.kit && SEM.kit.code) {
      SEM.kit.code(holder, b.key, b.title || 'pages.code', b.text).open = true;
      return holder;
    }
    var keys = Array.isArray(b.key) ? b.key : [b.key];
    holder.setAttribute('data-code', keys.join(' '));
    holder.appendChild(b.title ? rich('p', { class: 'note-label' }, b.title) : text('p', { class: 'note-label' }, 'pages.code'));
    if (b.text) holder.appendChild(rich('p', { class: 'code-note' }, b.text));
    var source = keys
      .map(function (k) {
        return (SEM.util.data('code.' + k) || '').replace(/\s+$/, '');
      })
      .join('\n\n\n');
    holder.appendChild(el('pre', { class: 'code' }, el('code', { text: source })));
    return holder;
  }

  // level: the heading level of a question in the block (3 in a section, 4 in a subsection).
  function block(b, level) {
    switch (b.type) {
      case 'p':
        return rich('p', null, b.text);
      case 'example':
      case 'intuition': {
        var box = el('div', { class: 'note note-' + b.type });
        box.appendChild(text('p', { class: 'note-label' }, 'pages.' + b.type));
        box.appendChild(rich('div', { class: 'note-body' }, b.text));
        return box;
      }
      case 'definition':
      case 'theorem': {
        // "Definition.", "Theorem: Weierstrass.": the label of the kind, then ": " and the optional title,
        // then a period, as in the LaTeX boxes
        var kind = b.type === 'definition' ? 'definition' : ['lemma', 'corollary', 'proposition'].indexOf(b.kind) >= 0 ? b.kind : 'theorem';
        var stated = el('div', { class: 'note note-' + b.type, dataset: { kind: kind } });
        var head = el('p', { class: 'note-label' });
        head.appendChild(text('span', null, 'pages.' + kind));
        if (b.title) dom.append(head, [': ', rich('span', { class: 'note-title' }, b.title)]);
        head.appendChild(document.createTextNode('.'));
        stated.appendChild(head);
        stated.appendChild(rich('div', { class: 'note-body' }, b.text));
        return stated;
      }
      case 'proof': {
        // fully visible: the label line "Proof.", then the text, which the end mark closes
        var proof = el('div', { class: 'note note-proof' });
        var proofBody = el('div', { class: 'note-body' });
        dom.append(proofBody, [rich('span', { class: 'proof-text' }, b.text), el('span', { class: 'proof-end', 'aria-hidden': 'true', text: '∎' })]);
        dom.append(proof, [boxLabel('pages.proof', 'proof-label'), proofBody]);
        return proof;
      }
      case 'note':
      case 'trap': {
        var aside = el('div', { class: 'note note-' + b.type });
        aside.appendChild(b.type === 'note' ? rich('p', { class: 'note-label' }, b.title) : boxLabel('pages.trap'));
        aside.appendChild(rich('div', { class: 'note-body' }, b.text));
        return aside;
      }
      case 'selfcheck': {
        // the question is visible, the answer opens on request (and for printing, see start.js and print.css)
        var check = el('div', { class: 'note note-selfcheck' });
        check.appendChild(boxLabel('pages.selfcheck'));
        check.appendChild(rich('div', { class: 'note-body' }, b.question));
        var answer = el('details', { class: 'selfcheck-answer' });
        answer.appendChild(text('summary', null, 'pages.answer'));
        answer.appendChild(rich('div', { class: 'selfcheck-answer-body' }, b.answer));
        if (SEM.param('reveal') === 'all') answer.open = true;
        check.appendChild(answer);
        return check;
      }
      case 'code':
        return codeBlock(b);
      case 'faq': {
        var faq = el('div', { class: 'faq' });
        faq.appendChild(rich('h' + (level || 4), { class: 'faq-q' }, b.question));
        faq.appendChild(rich('div', { class: 'faq-a' }, b.answer));
        return faq;
      }
      case 'list': {
        var ul = el('ul');
        b.items.forEach(function (it) {
          ul.appendChild(rich('li', null, it));
        });
        return ul;
      }
      case 'figure': {
        var fig = el('figure', { class: 'figure' });
        var img = el('img', { src: b.src, loading: 'lazy' });
        SEM.i18n.bind(function () {
          img.setAttribute('alt', render.plain(b.alt));
        });
        fig.appendChild(el('div', { class: 'figure-panel' }, img));
        if (b.caption) fig.appendChild(rich('figcaption', null, b.caption));
        return fig;
      }
      case 'table': {
        var wrap = el('div', { class: 'table-wrap' });
        var table = el('table', { class: 'data-table' });
        var tr = el('tr');
        (b.head || []).forEach(function (h) {
          tr.appendChild(rich('th', { scope: 'col' }, h));
        });
        table.appendChild(el('thead', null, tr));
        var body = el('tbody');
        (b.rows || []).forEach(function (row) {
          var r = el('tr');
          row.forEach(function (c) {
            r.appendChild(rich('td', null, c));
          });
          body.appendChild(r);
        });
        table.appendChild(body);
        wrap.appendChild(table);
        return wrap;
      }
      case 'problem':
        return problemBlock(b.id);
      case 'mistakes': {
        var ml = el('ul', { class: 'mistake-list' });
        (SEM.content.main.mistakes[b.block] || []).forEach(function (m) {
          ml.appendChild(rich('li', null, m));
        });
        return ml;
      }
      case 'glossary': {
        // a third column with the meaning in the current language when some item has a note (plain text)
        var withNote = b.items.some(function (item) {
          return !!item.note;
        });
        var gw = el('div', { class: 'table-wrap' });
        var gt = el('table', { class: 'data-table glossary' + (withNote ? ' has-note' : '') });
        var gh = el('tr');
        gh.appendChild(text('th', { scope: 'col' }, 'pages.glossaryEn'));
        gh.appendChild(text('th', { scope: 'col' }, 'pages.glossaryRu'));
        if (withNote) gh.appendChild(text('th', { scope: 'col' }, 'pages.glossaryNote'));
        gt.appendChild(el('thead', null, gh));
        var gb = el('tbody');
        b.items.forEach(function (item) {
          var r = el('tr');
          r.appendChild(el('td', { lang: 'en', text: item.en }));
          r.appendChild(el('td', { lang: 'ru', text: item.ru }));
          if (withNote) {
            var note = el('td', { class: 'glossary-note' });
            SEM.i18n.bind(function () {
              note.textContent = item.note ? SEM.t(item.note) : '';
            });
            r.appendChild(note);
          }
          gb.appendChild(r);
        });
        gt.appendChild(gb);
        gw.appendChild(gt);
        return gw;
      }
      case 'references': {
        var rl = el('ol', { class: 'references' });
        b.items.forEach(function (it) {
          rl.appendChild(rich('li', null, it));
        });
        return rl;
      }
      default:
        return el('div');
    }
  }

  pages.theory = function (main) {
    var H = SEM.content.handout;
    var article = el('article', { class: 'handout' });
    var head = el('header', { class: 'handout-head' });
    head.appendChild(rich('h2', { class: 'handout-title' }, H.title));
    head.appendChild(rich('p', { class: 'lead' }, H.intro));
    var conv = el('div', { class: 'note note-convention' });
    conv.appendChild(text('p', { class: 'note-label' }, 'pages.convention'));
    conv.appendChild(rich('div', { class: 'note-body' }, H.convention));
    head.appendChild(conv);
    pdfLink(head, 'Theory');
    article.appendChild(head);

    var toc = el('nav', { class: 'toc' });
    SEM.i18n.bind(function () {
      toc.setAttribute('aria-label', SEM.tu('pages.toc'));
    });
    toc.appendChild(text('h2', { class: 'toc-title' }, 'pages.toc'));
    var tocList = el('ol');
    H.sections.forEach(function (sec) {
      var li = el('li');
      var a = rich('a', { href: '#sec-' + sec.id }, sec.title);
      li.appendChild(a);
      if (sec.subsections && sec.subsections.length) {
        var subList = el('ol');
        sec.subsections.forEach(function (sub) {
          subList.appendChild(el('li', null, rich('a', { href: '#sub-' + sub.id }, sub.title)));
        });
        li.appendChild(subList);
      }
      tocList.appendChild(li);
    });
    toc.appendChild(tocList);
    article.appendChild(toc);

    H.sections.forEach(function (sec, i) {
      var s = el('section', { class: 'handout-section', id: 'sec-' + sec.id, dataset: { anchor: sec.id } });
      var h2 = el('h2');
      dom.append(h2, [el('span', { class: 'section-number', text: String(i + 1) + '.' }), ' ', render.el('span', null, sec.title)]);
      s.appendChild(h2);
      (sec.blocks || []).forEach(function (b) {
        s.appendChild(block(b, 3));
      });
      (sec.subsections || []).forEach(function (sub) {
        var ss = el('section', { class: 'handout-subsection', id: 'sub-' + sub.id });
        ss.appendChild(rich('h3', null, sub.title));
        (sub.blocks || []).forEach(function (b) {
          ss.appendChild(block(b, 4));
        });
        s.appendChild(ss);
      });
      article.appendChild(s);
    });
    main.appendChild(article);
  };

  /* ------------------------------------------------------------------ cheat sheet */

  pages.cheatsheet = function (main) {
    var C = SEM.content.cheatsheet;
    var article = el('article', { class: 'cheatsheet' });
    var head = el('header', { class: 'cs-head' });
    head.appendChild(rich('h2', { class: 'cs-title' }, C.title));
    if (C.subtitle) head.appendChild(rich('p', { class: 'cs-subtitle' }, C.subtitle));
    article.appendChild(head);
    var grid = el('div', { class: 'cs-grid' });
    C.sections.forEach(function (sec) {
      var s = el('section', { class: 'cs-section', id: 'cs-' + sec.id });
      s.appendChild(rich('h3', null, sec.title));
      var ul = el('ul');
      sec.items.forEach(function (it) {
        ul.appendChild(rich('li', null, it));
      });
      s.appendChild(ul);
      grid.appendChild(s);
    });
    article.appendChild(grid);
    var print = el('div', { class: 'cs-print-footer' });
    var line = el('p');
    dom.append(line, [text('span', null, 'meta.author'), el('br'), text('span', null, 'meta.telegram'), el('br'), text('span', null, 'meta.license')]);
    print.appendChild(line);
    article.appendChild(print);
    pdfLink(article, 'Cheatsheet');
    main.appendChild(article);
  };

  /* ------------------------------------------------------------------ landing page */

  // One card per topic of the course: the three pages and the two PDFs in the current language,
  // or a note that the topic comes later.
  function topicCard(topic) {
    var card = el('li', { class: 'topic-card ' + (topic.available ? 'is-available' : 'is-later') });
    var number = el('p', { class: 'topic-number' });
    var title = el('h3', { class: 'topic-title' });
    SEM.i18n.bind(function () {
      number.textContent = SEM.tuf('home.number', { n: topic.n, nn: SEM.course.pad2(topic.n) });
      title.textContent = SEM.t(topic.title);
    });
    dom.append(card, [number, title]);
    var foot = el('div', { class: 'topic-foot' });
    if (topic.available) {
      var web = el('ul', { class: 'topic-links' });
      ['main', 'theory', 'cheatsheet'].forEach(function (p) {
        web.appendChild(el('li', null, text('a', { href: topic.dir + '/' + p + '.html' }, 'courseNav.pages.' + p)));
      });
      foot.appendChild(web);
      // the PDFs are in the repository only; the site does not have them
      if (SEM.course.inRepository()) {
        var pdf = el('ul', { class: 'topic-links is-pdf' });
        [['Theory', 'home.theoryPdf'], ['Cheatsheet', 'home.cheatsheetPdf']].forEach(function (d) {
          var a = text('a', { type: 'application/pdf' }, d[1]);
          SEM.i18n.bind(function (lang) {
            a.setAttribute('href', SEM.course.pdfHref(topic, d[0], lang, 0));
          });
          pdf.appendChild(el('li', null, a));
        });
        foot.appendChild(pdf);
      }
    } else {
      foot.appendChild(text('p', { class: 'topic-later' }, 'courseNav.later'));
    }
    card.appendChild(foot);
    return card;
  }

  pages.home = function (main) {
    var section = el('section', { class: 'home' });
    section.appendChild(text('p', { class: 'lead home-lead' }, 'home.lead'));
    section.appendChild(text('h2', { class: 'home-title', id: 'home-topics' }, 'home.topics'));
    var grid = el('ol', { class: 'topic-grid', 'aria-labelledby': 'home-topics' });
    SEM.course.topics().forEach(function (topic) {
      grid.appendChild(topicCard(topic));
    });
    section.appendChild(grid);
    main.appendChild(section);
  };
})();
