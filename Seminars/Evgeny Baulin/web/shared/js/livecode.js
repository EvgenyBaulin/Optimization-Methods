// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Evgeny Baulin
// Live Python cells: an editor with highlighting, a Run button, the printed output and the Matplotlib figures. Python is
// Pyodide from shared/vendor/pyodide, loaded on the first run and kept for the life of the page; it needs
// http(s), so a page opened from a file shows a note instead.
(function () {
  'use strict';
  var SEM = window.SEM;
  var dom = SEM.dom;
  var el = dom.el;
  var render = SEM.render;

  var script = document.currentScript;
  var base = script ? script.src.replace(/js\/livecode\.js(\?.*)?$/, 'vendor/pyodide/') : '';
  var edits = {};
  var ready = null;

  // Runs a cell in a fresh namespace and returns the output, the traceback and the figures as PNG.
  var SETUP = [
    'import io, os, sys, json, base64, traceback',
    "os.environ['MPLBACKEND'] = 'Agg'",
    'import matplotlib',
    "matplotlib.use('Agg')",
    'import numpy as np',
    'import matplotlib.pyplot as plt',
    'plt.show = lambda *args, **kwargs: None',
    '',
    'def _om_run(src):',
    '    out = io.StringIO()',
    '    old = sys.stdout, sys.stderr',
    '    sys.stdout = sys.stderr = out',
    '    err = ""',
    "    plt.close('all')",
    '    try:',
    "        exec(compile(src, '<cell>', 'exec'), {'np': np, 'plt': plt, '__name__': '__main__'})",
    '    except BaseException:',
    '        kind, value, tb = sys.exc_info()',
    "        frames = [f for f in traceback.extract_tb(tb) if f.filename == '<cell>']",
    "        err = ''.join(traceback.format_list(frames) + traceback.format_exception_only(kind, value))",
    '    finally:',
    '        sys.stdout, sys.stderr = old',
    '    figs = []',
    '    for n in plt.get_fignums():',
    '        buf = io.BytesIO()',
    "        plt.figure(n).savefig(buf, format='png', dpi=110, bbox_inches='tight')",
    "        figs.append(base64.b64encode(buf.getvalue()).decode('ascii'))",
    "    plt.close('all')",
    "    return json.dumps({'out': out.getvalue(), 'err': err, 'figs': figs})"
  ].join('\n');

  function addScript(src) {
    return new Promise(function (resolve, reject) {
      var s = el('script', { src: src });
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // The site's server sends .wasm as application/octet-stream, which the streaming compilers refuse, so they
  // compile from the whole buffer instead.
  function bufferedWasm() {
    var W = window.WebAssembly;
    if (!W || W.omBuffered) return;
    W.omBuffered = true;
    W.compileStreaming = function (source) {
      return Promise.resolve(source).then(function (r) {
        return r.arrayBuffer();
      }).then(function (bytes) {
        return W.compile(bytes);
      });
    };
    W.instantiateStreaming = function (source, imports) {
      return Promise.resolve(source).then(function (r) {
        return r.arrayBuffer();
      }).then(function (bytes) {
        return W.instantiate(bytes, imports);
      });
    };
  }

  function python() {
    if (!ready) {
      ready = addScript(base + 'pyodide.js')
        .then(function () {
          bufferedWasm();
          return window.loadPyodide({ indexURL: base, stdLibURL: base + 'python_stdlib.bin' });
        })
        .then(function (py) {
          return py.loadPackage(['numpy', 'matplotlib']).then(function () {
            return py.runPythonAsync(SETUP);
          }).then(function () {
            return py;
          });
        });
      ready.catch(function () {
        ready = null;
      });
    }
    return ready;
  }

  function status(node, path) {
    node.textContent = SEM.tu(path);
  }

  // The editor: CodeMirror (shared/vendor/codemirror) when the page loads it, else a plain textarea.
  function editor(parent, value, onChange, onRun) {
    var area = el('textarea', { class: 'live-editor', spellcheck: 'false', autocomplete: 'off' });
    area.setAttribute('autocapitalize', 'off');
    area.value = value;
    parent.appendChild(area);
    if (window.CodeMirror) {
      var cm = window.CodeMirror.fromTextArea(area, {
        mode: 'python',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        viewportMargin: Infinity,
        extraKeys: {
          Tab: function (c) {
            if (c.somethingSelected()) c.indentSelection('add');
            else c.replaceSelection('    ', 'end');
          },
          'Shift-Tab': function (c) {
            c.indentSelection('subtract');
          },
          'Ctrl-Enter': onRun,
          'Cmd-Enter': onRun
        }
      });
      cm.on('change', function () {
        onChange(cm.getValue());
      });
      // built while detached or hidden, it measures itself again once it is on screen
      if (window.IntersectionObserver) {
        var seen = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) cm.refresh();
        });
        seen.observe(cm.getWrapperElement());
      }
      return {
        refresh: function () {
          cm.refresh();
        },
        get: function () {
          return cm.getValue();
        },
        set: function (v) {
          cm.setValue(v);
        }
      };
    }
    var fit = function () {
      area.rows = Math.max(6, area.value.split('\n').length + 1);
    };
    fit();
    area.addEventListener('input', function () {
      onChange(area.value);
      fit();
    });
    area.addEventListener('keydown', function (ev) {
      if (ev.key === 'Tab' && !ev.shiftKey) {
        ev.preventDefault();
        area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end');
        onChange(area.value);
      } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault();
        onRun();
      }
    });
    return {
      refresh: function () {},
      get: function () {
        return area.value;
      },
      set: function (v) {
        area.value = v;
        fit();
      }
    };
  }

  // cell(parent, key, title, note): key names the source in SEM.livecodeSources.
  function cell(parent, key, title, note) {
    var original = ((SEM.livecodeSources || {})[key] || '').replace(/\s+$/, '') + '\n';
    var box = el('div', { class: 'live-code', dataset: { live: key } });
    var head = el('h4', { class: 'live-title' });
    SEM.i18n.bind(function () {
      render.rich(head, title);
    });
    box.appendChild(head);
    if (note) {
      var p = el('p', { class: 'code-note' });
      SEM.i18n.bind(function () {
        render.rich(p, note);
      });
      box.appendChild(p);
    }
    var pre = el('p', { class: 'code-note' });
    SEM.i18n.bind(function () {
      render.rich(pre, SEM.ui('livecode.preloaded'));
    });
    box.appendChild(pre);

    var ed = editor(box, edits[key] || original, function (v) {
      edits[key] = v;
    }, function () {
      run();
    });

    var row = el('p', { class: 'link-row live-buttons' });
    var runBtn = el('button', { type: 'button', class: 'btn' });
    var restoreBtn = el('button', { type: 'button', class: 'btn btn-quiet' });
    SEM.i18n.bind(function () {
      runBtn.textContent = SEM.tu('livecode.run');
      restoreBtn.textContent = SEM.tu('livecode.restore');
    });
    row.appendChild(runBtn);
    row.appendChild(restoreBtn);
    var state = el('span', { class: 'live-status', 'aria-live': 'polite' });
    row.appendChild(state);
    box.appendChild(row);

    var output = el('pre', { class: 'code live-output' });
    output.hidden = true;
    var figs = el('div', { class: 'live-figures' });
    box.appendChild(output);
    box.appendChild(figs);

    var local = location.protocol === 'file:';
    if (local) {
      runBtn.disabled = true;
      SEM.i18n.bind(function () {
        status(state, 'livecode.fileNote');
      });
    }

    function run() {
      if (local || runBtn.disabled) return;
      runBtn.disabled = true;
      status(state, ready ? 'livecode.running' : 'livecode.loading');
      python()
        .then(function (py) {
          status(state, 'livecode.running');
          // let the status paint before Python takes the main thread
          return new Promise(function (resolve) {
            setTimeout(resolve, 30);
          }).then(function () {
            var fn = py.globals.get('_om_run');
            var res = JSON.parse(fn(ed.get()));
            fn.destroy();
            return res;
          });
        })
        .then(function (res) {
          var text = res.out + (res.err ? (res.out ? '\n' : '') + res.err : '');
          output.textContent = text;
          output.hidden = !text;
          output.classList.toggle('is-error', !!res.err);
          dom.clear(figs);
          res.figs.forEach(function (b64) {
            figs.appendChild(el('img', { src: 'data:image/png;base64,' + b64, alt: '' }));
          });
          status(state, 'livecode.done');
        })
        .catch(function (e) {
          output.textContent = String(e && e.message ? e.message : e);
          output.hidden = false;
          output.classList.add('is-error');
          status(state, 'livecode.failed');
        })
        .then(function () {
          runBtn.disabled = false;
        });
    }

    runBtn.addEventListener('click', run);
    restoreBtn.addEventListener('click', function () {
      ed.set(original);
      delete edits[key];
    });
    parent.appendChild(box);
    ed.refresh();
    return box;
  }

  SEM.livecode = { cell: cell };
})();
