/*!
 * OLS diagnostic lab for "Every Linear Regression Assumption Lives in One Equation"
 * Usage in a post:  <div id="ols-lab-mount"></div>
 *                   <script src="/assets/js/ols-lab.js" defer></script>
 * Self-contained, no dependencies. Inherits font and text color from the page and uses
 * transparent backgrounds, so it follows the site's light/dark theme.
 */
(function () {
  var mount = document.getElementById('ols-lab-mount');
  if (!mount || document.getElementById('ols-lab')) return;
  var CSS = String.raw`.ols-lab{
  --lab-ols:#eb6834; --lab-wls:#2a78d6; --lab-hub:#1baf7a;
  --lab-line:color-mix(in srgb,currentColor 16%,transparent);
  --lab-faint:color-mix(in srgb,currentColor 55%,transparent);
  --lab-chip:color-mix(in srgb,currentColor 7%,transparent);
  border:1px solid var(--lab-line);border-radius:10px;padding:18px;margin:28px 0;
  font-size:14px;line-height:1.45;background:transparent;
}
.ols-lab *{box-sizing:border-box}
.ols-lab h4{margin:0 0 4px;font-size:15px;letter-spacing:.02em}
.ols-lab .lab-sub{margin:0 0 14px;color:var(--lab-faint);font-size:13px}
.ols-lab .lab-presets{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.ols-lab button{font:inherit;font-size:13px;color:inherit;background:transparent;border:1px solid var(--lab-line);border-radius:6px;padding:5px 10px;cursor:pointer}
.ols-lab button:hover{background:var(--lab-chip)}
.ols-lab button:focus-visible,.ols-lab input:focus-visible{outline:2px solid var(--lab-wls);outline-offset:2px}
.ols-lab button[aria-pressed="true"]{background:var(--lab-chip);border-color:var(--lab-faint)}
.ols-lab button.lab-primary{border-color:var(--lab-faint);font-weight:600}
.ols-lab .lab-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px 18px;margin-bottom:14px}
.ols-lab label{display:flex;flex-direction:column;gap:4px;font-size:13px}
.ols-lab .lab-lbl{display:flex;justify-content:space-between;gap:8px}
.ols-lab .lab-val{font-variant-numeric:tabular-nums;color:var(--lab-faint)}
.ols-lab input[type=range]{width:100%;accent-color:var(--lab-wls)}
.ols-lab .lab-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-bottom:12px}
.ols-lab .lab-check{flex-direction:row;align-items:center;gap:6px}
.ols-lab .lab-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:18px;align-items:start}
@media (max-width:720px){.ols-lab .lab-grid{grid-template-columns:minmax(0,1fr)}}
.ols-lab svg{display:block;width:100%;height:auto;overflow:visible}
.ols-lab .lab-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0 0;font-size:12.5px}
.ols-lab .lab-legend span{display:inline-flex;align-items:center;gap:6px}
.ols-lab .lab-sw{width:16px;height:0;border-top:2.5px solid currentColor;display:inline-block}
.ols-lab table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:13px;margin:0}
.ols-lab th,.ols-lab td{text-align:right;padding:5px 6px;border-bottom:1px solid var(--lab-line)}
.ols-lab th:first-child,.ols-lab td:first-child{text-align:left}
.ols-lab th{font-weight:600;color:var(--lab-faint);font-size:12px}
.ols-lab .lab-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:baseline}
.ols-lab .lab-note{font-size:13px;margin:12px 0 0}
.ols-lab .lab-note p{margin:0 0 6px}
.ols-lab .lab-mc{margin-top:18px;padding-top:14px;border-top:1px solid var(--lab-line)}
.ols-lab .lab-mcgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-top:10px}
.ols-lab .lab-mcgrid h5{margin:0 0 2px;font-size:13px}
.ols-lab .lab-mcgrid p{margin:0 0 8px;font-size:12.5px;color:var(--lab-faint)}
.ols-lab .lab-tip{position:absolute;pointer-events:none;font-size:12px;padding:4px 7px;border-radius:5px;border:1px solid var(--lab-line);background:Canvas;color:CanvasText;white-space:nowrap;font-variant-numeric:tabular-nums}
.ols-lab .lab-plot{position:relative}
.ols-lab .lab-status{font-size:12.5px;color:var(--lab-faint)}
@media (prefers-reduced-motion:reduce){.ols-lab *{transition:none!important}}
`;
  var MARKUP = String.raw`<h4>OLS diagnostic lab</h4>
<p class="lab-sub">Simulated data from a model you control: signal \(x\), outcome \(y = \beta x + \varepsilon\). Pick a preset or move the sliders.</p>

<div class="lab-presets" role="group" aria-label="Presets">
  <button type="button" data-preset="clean">Clean world</button>
  <button type="button" data-preset="tails">Fat tails</button>
  <button type="button" data-preset="tick">Bad tick</button>
  <button type="button" data-preset="hetero">Heteroskedastic</button>
  <button type="button" data-preset="overlap">Overlapping 10-day returns</button>
  <button type="button" data-preset="real">Real markets (all at once)</button>
</div>

<div class="lab-controls">
  <label for="lab-nu"><span class="lab-lbl">Tail heaviness of daily noise <span class="lab-val" id="lab-nu-v"></span></span>
    <input type="range" id="lab-nu" min="0" max="5" step="1" value="0"></label>
  <label for="lab-H"><span class="lab-lbl">Heteroskedasticity <span class="lab-val" id="lab-H-v"></span></span>
    <input type="range" id="lab-H" min="0" max="1" step="0.05" value="0"></label>
  <label for="lab-h"><span class="lab-lbl">Return horizon (overlapping days) <span class="lab-val" id="lab-h-v"></span></span>
    <input type="range" id="lab-h" min="1" max="20" step="1" value="1"></label>
  <label for="lab-beta"><span class="lab-lbl">True slope \(\beta\) <span class="lab-val" id="lab-beta-v"></span></span>
    <input type="range" id="lab-beta" min="0" max="0.5" step="0.05" value="0.2"></label>
  <label for="lab-n"><span class="lab-lbl">Sample size \(n\) <span class="lab-val" id="lab-n-v"></span></span>
    <input type="range" id="lab-n" min="100" max="1000" step="50" value="250"></label>
</div>

<div class="lab-row">
  <label class="lab-check" for="lab-tick"><input type="checkbox" id="lab-tick"> Inject one bad tick (a 15σ print at the most extreme signal)</label>
  <button type="button" id="lab-new">New sample</button>
</div>

<div class="lab-grid">
  <div class="lab-plot" id="lab-plot">
    <svg id="lab-svg" viewBox="0 0 640 400" role="img" aria-label="Scatter of the simulated data with the true line and three fitted lines"></svg>
    <div class="lab-legend" id="lab-legend">
      <span><i class="lab-sw" style="border-top-style:dashed"></i>True line</span>
      <span><i class="lab-sw" style="border-top-color:var(--lab-ols)"></i>OLS</span>
      <span><i class="lab-sw" style="border-top-color:var(--lab-wls)"></i>WLS</span>
      <span><i class="lab-sw" style="border-top-color:var(--lab-hub)"></i>Huber</span>
    </div>
    <div class="lab-tip" id="lab-tip" hidden></div>
  </div>
  <div>
    <table aria-label="Estimated slopes">
      <thead><tr><th>Estimator</th><th>Slope \(\hat\beta\)</th><th>Error vs. truth</th></tr></thead>
      <tbody id="lab-est"></tbody>
    </table>
    <table aria-label="t-statistics for the OLS slope" style="margin-top:12px">
      <thead><tr><th>OLS t-stat</th><th>Value</th><th>Assumes</th></tr></thead>
      <tbody id="lab-ts"></tbody>
    </table>
    <div class="lab-note" id="lab-note" aria-live="polite"></div>
  </div>
</div>

<div class="lab-mc">
  <div class="lab-row" style="margin-bottom:0">
    <button type="button" class="lab-primary" id="lab-mc-run">Run 400 backtests of a useless signal (β = 0)</button>
    <span class="lab-status" id="lab-mc-status">Uses the current settings, with the true slope set to zero.</span>
  </div>
  <div class="lab-mcgrid">
    <div>
      <h5>False discovery rate</h5>
      <p>Share of backtests where \(\lvert t \rvert > 1.96\). Honest inference gives about 5% (dashed line).</p>
      <svg id="lab-mc-fdr" viewBox="0 0 320 150" role="img" aria-label="False discovery rate by t-statistic"></svg>
    </div>
    <div>
      <h5>Typical error of the estimated slope</h5>
      <p>Root-mean-squared error of \(\hat\beta\) around the truth (zero). It counts bias and noise together; smaller is better.</p>
      <svg id="lab-mc-sd" viewBox="0 0 320 150" role="img" aria-label="Root-mean-squared error of slope estimates by estimator"></svg>
    </div>
  </div>
</div>`;
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);
  mount.innerHTML = '<div class="ols-lab" id="ols-lab">' + MARKUP + '</div>';
  var root = document.getElementById('ols-lab');
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- random numbers ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(7);
  var spare = null;
  function normal() {
    if (spare !== null) { var s = spare; spare = null; return s; }
    var u = 0, v = 0;
    while (u === 0) u = rand();
    v = rand();
    var r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  }
  function gamma(k) { /* Marsaglia-Tsang, shape k, scale 1 */
    if (k < 1) return gamma(k + 1) * Math.pow(rand(), 1 / k);
    var d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      var x, v;
      do { x = normal(); v = 1 + c * x; } while (v <= 0);
      v = v * v * v;
      var u = rand();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }
  function noise(nu) { /* standard normal, or Student-t with nu degrees of freedom (unit scale) */
    if (!isFinite(nu)) return normal();
    return normal() / Math.sqrt(2 * gamma(nu / 2) / nu);
  }

  /* ---------- settings ---------- */
  var NU = [Infinity, 10, 5, 3, 2.5, 2.1];
  var NU_LABEL = ['Normal', 't, 10 df', 't, 5 df', 't, 3 df', 't, 2.5 df', 't, 2.1 df'];
  var PRESETS = {
    clean:   { nu: 0, H: 0,   h: 1,  beta: 0.2, n: 250, tick: false },
    tails:   { nu: 3, H: 0,   h: 1,  beta: 0.2, n: 250, tick: false },
    tick:    { nu: 0, H: 0,   h: 1,  beta: 0.2, n: 250, tick: true },
    hetero:  { nu: 0, H: 1,   h: 1,  beta: 0.2, n: 250, tick: false },
    overlap: { nu: 0, H: 0,   h: 10, beta: 0,   n: 250, tick: false },
    real:    { nu: 3, H: 0.6, h: 10, beta: 0,   n: 250, tick: true }
  };
  function read() {
    return {
      nu: NU[+$('lab-nu').value], nuIdx: +$('lab-nu').value,
      H: +$('lab-H').value, h: +$('lab-h').value,
      beta: +$('lab-beta').value, n: +$('lab-n').value,
      tick: $('lab-tick').checked
    };
  }
  function showValues(p) {
    $('lab-nu-v').textContent = NU_LABEL[p.nuIdx];
    $('lab-H-v').textContent = p.H === 0 ? 'none' : p.H.toFixed(2);
    $('lab-h-v').textContent = p.h === 1 ? '1 (no overlap)' : p.h + ' days';
    $('lab-beta-v').textContent = p.beta.toFixed(2);
    $('lab-n-v').textContent = p.n;
  }

  /* ---------- data generating process ----------
     Daily signal shocks u and daily return shocks e are independent, so strict exogeneity holds.
     Signal x_t = trailing h-day sum of u (a slow-moving signal, like momentum), scaled to unit variance.
     Outcome y_t = beta * x_t + s_t * (forward h-day sum of e) / sqrt(h).
     s_t = sqrt(1 + 3H x_t^2): noise fans out as the signal grows (heteroskedasticity).
     Overlap: consecutive rows share h-1 days of both the signal and the forward return. */
  function generate(p, beta) {
    var n = p.n, h = p.h, sq = Math.sqrt(h);
    var u = new Float64Array(n + h), e = new Float64Array(n + 2 * h);
    var i;
    for (i = 0; i < u.length; i++) u[i] = normal();
    for (i = 0; i < e.length; i++) e[i] = noise(p.nu);
    var x = new Float64Array(n), y = new Float64Array(n), s = new Float64Array(n);
    var su = 0, se = 0;
    for (i = 0; i < h; i++) su += u[i];
    for (i = h; i < 2 * h; i++) se += e[i];
    for (var t = 0; t < n; t++) {
      if (t > 0) { su += u[t + h - 1] - u[t - 1]; se += e[t + 2 * h - 1] - e[t + h - 1]; }
      x[t] = su / sq;
      s[t] = Math.sqrt(1 + 3 * p.H * x[t] * x[t]);
      y[t] = beta * x[t] + s[t] * se / sq;
    }
    var tickIdx = -1;
    if (p.tick) {
      var best = 0;
      for (t = 0; t < n; t++) if (Math.abs(x[t]) > best) { best = Math.abs(x[t]); tickIdx = t; }
      y[tickIdx] = beta * x[tickIdx] - (x[tickIdx] >= 0 ? 1 : -1) * 15 * s[tickIdx];
    }
    return { x: x, y: y, s: s, tickIdx: tickIdx };
  }

  /* ---------- estimators ---------- */
  function wls(x, y, w) {
    var S = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;
    for (var i = 0; i < x.length; i++) {
      var wi = w ? w[i] : 1;
      S += wi; Sx += wi * x[i]; Sy += wi * y[i]; Sxx += wi * x[i] * x[i]; Sxy += wi * x[i] * y[i];
    }
    var det = S * Sxx - Sx * Sx;
    var b = (S * Sxy - Sx * Sy) / det;
    return { a: (Sy - b * Sx) / S, b: b };
  }
  function nwLag(n, h) {
    return Math.max(Math.ceil(1.5 * (h - 1)), Math.floor(4 * Math.pow(n / 100, 2 / 9)));
  }
  /* t-stats for the OLS slope: naive sigma^2 (X'X)^-1, White (HC1), Newey-West (Bartlett, HC1 scaling) */
  function tstats(x, y, fit, L) {
    var n = x.length, i, l;
    var Sx = 0, Sxx = 0;
    for (i = 0; i < n; i++) { Sx += x[i]; Sxx += x[i] * x[i]; }
    var det = n * Sxx - Sx * Sx, B10 = -Sx / det, B11 = n / det;
    var r = new Float64Array(n), rss = 0;
    for (i = 0; i < n; i++) { r[i] = y[i] - fit.a - fit.b * x[i]; rss += r[i] * r[i]; }
    var naiveVar = rss / (n - 2) * B11;
    var M00 = 0, M01 = 0, M11 = 0;
    for (i = 0; i < n; i++) { var r2 = r[i] * r[i]; M00 += r2; M01 += r2 * x[i]; M11 += r2 * x[i] * x[i]; }
    var adj = n / (n - 2);
    var quad = function (a, b, c) { return (B10 * B10 * a + 2 * B10 * B11 * b + B11 * B11 * c) * adj; };
    var whiteVar = quad(M00, M01, M11);
    var N00 = M00, N01 = M01, N11 = M11;
    for (l = 1; l <= L && l < n; l++) {
      var w = 1 - l / (L + 1), G00 = 0, G01 = 0, G10 = 0, G11 = 0;
      for (i = l; i < n; i++) {
        var p = r[i] * r[i - l];
        G00 += p; G01 += p * x[i - l]; G10 += p * x[i]; G11 += p * x[i] * x[i - l];
      }
      N00 += 2 * w * G00; N01 += w * (G01 + G10); N11 += 2 * w * G11;
    }
    var nwVar = quad(N00, N01, N11);
    return {
      naive: fit.b / Math.sqrt(naiveVar),
      white: fit.b / Math.sqrt(whiteVar),
      nw: nwVar > 0 ? fit.b / Math.sqrt(nwVar) : NaN
    };
  }
  /* Huber M-estimator via IRLS; scale fixed from the OLS residuals' MAD; delta = 1.345 * scale */
  function huber(x, y, start) {
    var n = x.length, i, a = start.a, b = start.b;
    var absr = new Float64Array(n);
    for (i = 0; i < n; i++) absr[i] = Math.abs(y[i] - a - b * x[i]);
    var sorted = Float64Array.from(absr).sort();
    var scale = sorted[n >> 1] / 0.6745 || 1e-9;
    var delta = 1.345 * scale, w = new Float64Array(n);
    for (var it = 0; it < 30; it++) {
      for (i = 0; i < n; i++) {
        var ri = Math.abs(y[i] - a - b * x[i]);
        w[i] = ri <= delta ? 1 : delta / ri;
      }
      var f = wls(x, y, w);
      var done = Math.abs(f.b - b) < 1e-7 && Math.abs(f.a - a) < 1e-7;
      a = f.a; b = f.b;
      if (done) break;
    }
    return { a: a, b: b };
  }
  function fitAll(d) {
    var ols = wls(d.x, d.y, null);
    var w = new Float64Array(d.x.length);
    for (var i = 0; i < w.length; i++) w[i] = 1 / (d.s[i] * d.s[i]);
    return { ols: ols, wls: wls(d.x, d.y, w), hub: huber(d.x, d.y, ols) };
  }

  /* ---------- drawing ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) {
      var v = String(attrs[k]);
      /* CSS variables and color-mix are only reliable through style, not presentation attributes */
      if ((k === 'fill' || k === 'stroke') && /var\(|color-mix/.test(v)) e.style.setProperty(k, v);
      else e.setAttribute(k, v);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function quantile(arr, q) {
    var s = Float64Array.from(arr).sort();
    return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))];
  }
  function niceTicks(lo, hi, count) {
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var err = span / count / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var out = [];
    for (var v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
    return out;
  }
  var state = { d: null, f: null, p: null, pts: [] };

  function drawScatter(d, f, p) {
    var svg = $('lab-svg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = 640, Hh = 400, m = { l: 46, r: 14, t: 12, b: 38 };
    var xs = 3.6, xlo = -xs, xhi = xs;
    var ylo = quantile(d.y, 0.005), yhi = quantile(d.y, 0.995);
    var pad = (yhi - ylo) * 0.25; ylo -= pad; yhi += pad;
    var X = function (v) { return m.l + (v - xlo) / (xhi - xlo) * (W - m.l - m.r); };
    var Y = function (v) { return m.t + (yhi - v) / (yhi - ylo) * (Hh - m.t - m.b); };
    var defs = el('defs', {}, svg);
    var cp = el('clipPath', { id: 'lab-clip' }, defs);
    el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: Hh - m.t - m.b }, cp);
    var g = el('g', { 'font-size': 11, fill: 'currentColor' }, svg);
    niceTicks(ylo, yhi, 6).forEach(function (v) {
      el('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: 'currentColor', 'stroke-opacity': v === 0 ? 0.28 : 0.1 }, g);
      el('text', { x: m.l - 6, y: Y(v) + 3.5, 'text-anchor': 'end', 'fill-opacity': 0.6 }, g).textContent = +v.toFixed(2);
    });
    niceTicks(xlo, xhi, 8).forEach(function (v) {
      el('line', { y1: m.t, y2: Hh - m.b, x1: X(v), x2: X(v), stroke: 'currentColor', 'stroke-opacity': v === 0 ? 0.28 : 0.1 }, g);
      el('text', { x: X(v), y: Hh - m.b + 15, 'text-anchor': 'middle', 'fill-opacity': 0.6 }, g).textContent = v;
    });
    el('text', { x: (m.l + W - m.r) / 2, y: Hh - 4, 'text-anchor': 'middle', 'fill-opacity': 0.75 }, g).textContent = 'signal x (standardized)';
    var yl = el('text', { x: 12, y: (m.t + Hh - m.b) / 2, 'text-anchor': 'middle', 'fill-opacity': 0.75, transform: 'rotate(-90 12 ' + (m.t + Hh - m.b) / 2 + ')' }, g);
    yl.textContent = p.h > 1 ? 'forward ' + p.h + '-day return y' : 'next-period return y';

    var pts = el('g', { fill: 'currentColor' }, svg);
    state.pts = [];
    var r = d.x.length > 600 ? 1.8 : 2.4;
    for (var i = 0; i < d.x.length; i++) {
      var xv = Math.max(xlo, Math.min(xhi, d.x[i])), yv = d.y[i];
      var px = X(xv), py;
      if (yv > yhi || yv < ylo) {
        py = yv > yhi ? m.t + 4 : Hh - m.b - 4;
        var dir = yv > yhi ? -1 : 1;
        el('path', { d: 'M' + (px - 5) + ' ' + (py - dir * 4) + 'L' + (px + 5) + ' ' + (py - dir * 4) + 'L' + px + ' ' + (py + dir * 4) + 'Z',
          fill: i === d.tickIdx ? 'var(--lab-ols)' : 'currentColor', 'fill-opacity': i === d.tickIdx ? 1 : 0.55 }, pts);
      } else {
        py = Y(yv);
        el('circle', { cx: px, cy: py, r: i === d.tickIdx ? 5 : r, 'fill-opacity': i === d.tickIdx ? 1 : 0.32,
          fill: i === d.tickIdx ? 'var(--lab-ols)' : 'currentColor' }, pts);
      }
      state.pts.push({ px: px, py: py, x: d.x[i], y: d.y[i], tick: i === d.tickIdx });
    }
    if (d.tickIdx >= 0) {
      var tp = state.pts[d.tickIdx];
      var lx = tp.px + (tp.px > W / 2 ? -10 : 10);
      el('text', { x: lx, y: tp.py + (tp.py < Hh / 2 ? 16 : -10), 'text-anchor': tp.px > W / 2 ? 'end' : 'start', 'font-size': 11.5, fill: 'currentColor' }, svg).textContent = 'bad tick (15σ)';
    }

    var lines = el('g', { 'clip-path': 'url(#lab-clip)', fill: 'none', 'stroke-linecap': 'round' }, svg);
    function line(a, b, color, dash, wdt) {
      var attrs = { x1: X(xlo), y1: Y(a + b * xlo), x2: X(xhi), y2: Y(a + b * xhi), stroke: color, 'stroke-width': wdt || 2.5 };
      if (dash) attrs['stroke-dasharray'] = dash;
      el('line', attrs, lines);
    }
    line(0, p.beta, 'currentColor', '6 5', 2);
    line(f.wls.a, f.wls.b, 'var(--lab-wls)');
    line(f.hub.a, f.hub.b, 'var(--lab-hub)');
    line(f.ols.a, f.ols.b, 'var(--lab-ols)');
    state.geom = { X: X, Y: Y, m: m, W: W, H: Hh };
  }

  function fmt(v, d) { return isFinite(v) ? (v >= 0 ? '' : '−') + Math.abs(v).toFixed(d === undefined ? 3 : d) : 'n/a'; }

  function renderTables(d, f, p) {
    var L = nwLag(p.n, p.h);
    var t = tstats(d.x, d.y, f.ols, L);
    var rows = [['OLS', 'var(--lab-ols)', f.ols.b], ['WLS', 'var(--lab-wls)', f.wls.b], ['Huber', 'var(--lab-hub)', f.hub.b]];
    $('lab-est').innerHTML = rows.map(function (r) {
      return '<tr><td><span class="lab-dot" style="background:' + r[1] + '"></span>' + r[0] + '</td><td>' + fmt(r[2]) + '</td><td>' + fmt(r[2] - p.beta) + '</td></tr>';
    }).join('') + '<tr><td>True β</td><td>' + fmt(p.beta) + '</td><td></td></tr>';
    $('lab-ts').innerHTML =
      '<tr><td>Naive</td><td>' + fmt(t.naive, 2) + '</td><td>Ω = σ²I</td></tr>' +
      '<tr><td>White</td><td>' + fmt(t.white, 2) + '</td><td>No autocorrelation</td></tr>' +
      '<tr><td>Newey–West, lag ' + L + '</td><td>' + fmt(t.nw, 2) + '</td><td>Autocorrelation ≤ ' + L + ' lags</td></tr>';
    renderNote(d, f, p, t);
  }

  function renderNote(d, f, p, t) {
    var notes = [];
    var clean = !isFinite(p.nu) && p.H === 0 && p.h === 1 && !p.tick;
    if (clean) notes.push('Every assumption holds. The three lines sit on top of each other and the three t-stats agree. This is the only setting where the default regression printout is the whole truth.');
    if (p.tick) notes.push('The bad tick sits at the most extreme signal value, where it has the most leverage. OLS moves to ' + fmt(f.ols.b) + ' (truth ' + fmt(p.beta) + '); Huber caps that point’s pull and lands at ' + fmt(f.hub.b) + '. In the backtests, that one point drags OLS far enough that the naive t-stat finds a “signal” in a useless one most of the time.');
    if (isFinite(p.nu)) notes.push('Daily noise is Student-t with ' + p.nu + ' degrees of freedom: the same typical day, much wilder extremes. Run the backtests and compare the spread of OLS and Huber.');
    if (p.H > 0) notes.push('Noise grows with the size of the signal. All three estimators stay roughly unbiased, but WLS down-weights the noisy rows, so its slope varies less from sample to sample.');
    if (p.h > 1) {
      var ratio = Math.abs(t.naive / t.nw);
      notes.push('Consecutive rows share ' + (p.h - 1) + ' of their ' + p.h + ' days, so these ' + p.n + ' rows hold only about ' + Math.round(p.n / p.h) + ' independent observations. In this sample the naive t-stat is ' + (isFinite(ratio) ? ratio.toFixed(1) + '×' : 'far') + ' the Newey–West one. White does not help: it fixes the diagonal of Ω, not the off-diagonals.');
    }
    $('lab-note').innerHTML = notes.map(function (s) { return '<p>' + s + '</p>'; }).join('');
  }

  function update(resample) {
    var p = read();
    showValues(p);
    if (resample) state.seed = (Math.random() * 1e9) | 0;
    rand = mulberry32(state.seed); spare = null;
    var d = generate(p, p.beta), f = fitAll(d);
    state.d = d; state.f = f; state.p = p;
    drawScatter(d, f, p);
    renderTables(d, f, p);
    markPreset();
  }
  state.seed = 20261019;

  /* ---------- hover ---------- */
  var plot = $('lab-plot'), tip = $('lab-tip'), svgEl = $('lab-svg');
  svgEl.addEventListener('mousemove', function (ev) {
    if (!state.pts.length) return;
    var rect = svgEl.getBoundingClientRect(), k = 640 / rect.width;
    var mx = (ev.clientX - rect.left) * k, my = (ev.clientY - rect.top) * k, best = null, bd = 144;
    for (var i = 0; i < state.pts.length; i++) {
      var q = state.pts[i], dd = (q.px - mx) * (q.px - mx) + (q.py - my) * (q.py - my);
      if (dd < bd) { bd = dd; best = q; }
    }
    if (!best) { tip.hidden = true; return; }
    tip.textContent = (best.tick ? 'Bad tick  ' : '') + 'x = ' + fmt(best.x, 2) + ',  y = ' + fmt(best.y, 2);
    tip.hidden = false;
    var prect = plot.getBoundingClientRect();
    var left = best.px / k + rect.left - prect.left + 10, top = best.py / k + rect.top - prect.top - 30;
    tip.style.left = Math.min(left, prect.width - tip.offsetWidth - 4) + 'px';
    tip.style.top = Math.max(0, top) + 'px';
  });
  svgEl.addEventListener('mouseleave', function () { tip.hidden = true; });

  /* ---------- Monte Carlo ---------- */
  function bars(svgId, items, opts) {
    var svg = $(svgId);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = 320, left = 96, right = 52, top = 6, rowH = 30, gap = 12;
    var max = opts.max || Math.max.apply(null, items.map(function (i) { return i.v; })) * 1.1 || 1;
    var X = function (v) { return left + Math.min(v, max) / max * (W - left - right); };
    var h = top + items.length * (rowH + gap) + 14;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + h);
    items.forEach(function (it, i) {
      var y = top + i * (rowH + gap);
      el('text', { x: left - 8, y: y + rowH / 2 + 4, 'text-anchor': 'end', 'font-size': 12, fill: 'currentColor' }, svg).textContent = it.label;
      el('rect', { x: left, y: y + 4, width: W - left - right, height: rowH - 8, rx: 4, fill: 'currentColor', 'fill-opacity': 0.06 }, svg);
      var wd = Math.max(0, X(it.v) - left);
      if (wd > 0) el('rect', { x: left, y: y + 4, width: wd, height: rowH - 8, rx: 4, fill: it.color }, svg);
      el('text', { x: X(it.v) + 6, y: y + rowH / 2 + 4, 'font-size': 12, fill: 'currentColor', style: 'font-variant-numeric:tabular-nums' }, svg).textContent = opts.fmt(it.v);
    });
    if (opts.ref !== undefined) {
      var rx = X(opts.ref), yb = top + items.length * (rowH + gap) - gap + 2;
      el('line', { x1: rx, x2: rx, y1: top, y2: yb, stroke: 'currentColor', 'stroke-dasharray': '3 3', 'stroke-opacity': 0.7 }, svg);
      el('text', { x: rx, y: yb + 12, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'currentColor', 'fill-opacity': 0.7 }, svg).textContent = opts.refLabel;
    }
  }
  function emptyBars() {
    var placeholder = function (id, labels, colors) {
      bars(id, labels.map(function (l, i) { return { label: l, v: 0, color: colors[i] }; }), { max: 1, fmt: function () { return '–'; } });
    };
    placeholder('lab-mc-fdr', ['Naive t', 'White t', 'Newey–West t'], ['currentColor', 'currentColor', 'currentColor']);
    placeholder('lab-mc-sd', ['OLS', 'WLS', 'Huber'], ['var(--lab-ols)', 'var(--lab-wls)', 'var(--lab-hub)']);
  }
  var running = false;
  $('lab-mc-run').addEventListener('click', function () {
    if (running) return;
    running = true;
    var p = read(), L = nwLag(p.n, p.h), total = 400, done = 0;
    var rej = [0, 0, 0], bs = [[], [], []];
    rand = mulberry32((Math.random() * 1e9) | 0); spare = null;
    var btn = $('lab-mc-run'), status = $('lab-mc-status');
    btn.disabled = true;
    function chunk() {
      var end = Math.min(total, done + 25);
      for (; done < end; done++) {
        var d = generate(p, 0), f = fitAll(d), t = tstats(d.x, d.y, f.ols, L);
        if (Math.abs(t.naive) > 1.96) rej[0]++;
        if (Math.abs(t.white) > 1.96) rej[1]++;
        if (Math.abs(t.nw) > 1.96) rej[2]++;
        bs[0].push(f.ols.b); bs[1].push(f.wls.b); bs[2].push(f.hub.b);
      }
      status.textContent = 'Running… ' + done + ' / ' + total;
      if (done < total) { setTimeout(chunk, 0); return; }
      var sd = bs.map(function (a) { /* RMSE around the true slope, which is 0 in these backtests */
        return Math.sqrt(a.reduce(function (s, v) { return s + v * v; }, 0) / a.length);
      });
      var fdr = rej.map(function (r) { return r / total; });
      bars('lab-mc-fdr', [
        { label: 'Naive t', v: fdr[0], color: 'color-mix(in srgb, currentColor 55%, transparent)' },
        { label: 'White t', v: fdr[1], color: 'color-mix(in srgb, currentColor 55%, transparent)' },
        { label: 'Newey–West t', v: fdr[2], color: 'color-mix(in srgb, currentColor 55%, transparent)' }
      ], { max: Math.max(0.2, Math.max.apply(null, fdr) * 1.15), ref: 0.05, refLabel: '5%', fmt: function (v) { return (v * 100).toFixed(1) + '%'; } });
      bars('lab-mc-sd', [
        { label: 'OLS', v: sd[0], color: 'var(--lab-ols)' },
        { label: 'WLS', v: sd[1], color: 'var(--lab-wls)' },
        { label: 'Huber', v: sd[2], color: 'var(--lab-hub)' }
      ], { fmt: function (v) { return v.toFixed(3); } });
      status.textContent = total + ' backtests with ' + NU_LABEL[p.nuIdx].toLowerCase() + ' noise, heteroskedasticity ' + p.H.toFixed(2) + ', ' + p.h + '-day horizon, n = ' + p.n + (p.tick ? ', bad tick on' : '') + '. A useless signal looked significant to the naive t-stat ' + (fdr[0] * 100).toFixed(0) + '% of the time.';
      btn.disabled = false;
      running = false;
      rand = mulberry32(state.seed); spare = null;
    }
    chunk();
  });

  /* ---------- wiring ---------- */
  function markPreset() {
    var p = read();
    root.querySelectorAll('[data-preset]').forEach(function (b) {
      var q = PRESETS[b.getAttribute('data-preset')];
      var on = q.nu === p.nuIdx && q.H === p.H && q.h === p.h && q.beta === p.beta && q.n === p.n && q.tick === p.tick;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  root.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var q = PRESETS[b.getAttribute('data-preset')];
      $('lab-nu').value = q.nu; $('lab-H').value = q.H; $('lab-h').value = q.h;
      $('lab-beta').value = q.beta; $('lab-n').value = q.n; $('lab-tick').checked = q.tick;
      emptyBars();
      $('lab-mc-status').textContent = 'Uses the current settings, with the true slope set to zero.';
      update(false);
    });
  });
  ['lab-nu', 'lab-H', 'lab-h', 'lab-beta', 'lab-n'].forEach(function (id) {
    $(id).addEventListener('input', function () { update(false); });
  });
  $('lab-tick').addEventListener('change', function () { update(false); });
  $('lab-new').addEventListener('click', function () { update(true); });

  emptyBars();
  update(false);
  if (window.MathJax && window.MathJax.typesetPromise) { window.MathJax.typesetPromise([root]).catch(function () {}); }
})();
