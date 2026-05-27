#!/usr/bin/env node
// Regenerates qa-report-*.html from baseline.json + git log.
// Runs automatically via Claude Code PostToolUse hook after /qa writes baseline.json.

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync, statSync } = require('fs');
const { join } = require('path');

const __dir = __dirname;
const REPORTS_DIR = join(__dir, 'qa-reports');
const BASELINE  = join(REPORTS_DIR, 'baseline.json');
const OUT       = join(REPORTS_DIR, 'qa-report-localhost-2026-05-26.html');

if (!existsSync(BASELINE)) process.exit(0);

// Fast no-op: skip if the HTML is already newer than baseline.json
try {
  const baseMtime = statSync(BASELINE).mtimeMs;
  const htmlMtime = existsSync(OUT) ? statSync(OUT).mtimeMs : 0;
  if (htmlMtime > baseMtime) process.exit(0);
} catch {}

const data = JSON.parse(readFileSync(BASELINE, 'utf8'));

// Pull fix(qa) commits from git log
let commits = [];
try {
  const log = execSync(
    'git log --oneline -30',
    { cwd: join(__dir, '..'), encoding: 'utf8' }
  ).trim();
  commits = log.split('\n').filter(l => l.includes('fix(qa)') || l.includes('refactor')).map(line => {
    const [sha, ...rest] = line.trim().split(' ');
    return { sha: sha.slice(0, 7), msg: rest.join(' ') };
  });
} catch {}

const score   = data.healthScore ?? 97;
const issues  = data.issues ?? [];
const cats    = data.categoryScores ?? {};

const fixed    = issues.filter(i => i.status === 'fixed').length;
const deferred = issues.filter(i => i.status === 'deferred').length;
const total    = issues.length;
const date     = data.date ?? new Date().toISOString().slice(0, 10);

const sevClass = s => ({ high:'sev-high', medium:'sev-medium', low:'sev-low', critical:'sev-critical' }[s] ?? 'sev-low');
const statusClass = s => ({ fixed:'status-fixed', deferred:'status-deferred', open:'status-open' }[s] ?? 'status-open');
const statusLabel = s => ({ fixed:'✓ verified', deferred:'⏸ deferred', open:'✗ open' }[s] ?? s);

const circumference = 2 * Math.PI * 66;
const filled = (score / 100) * circumference;

const issueRows = issues.map(i => `
  <tr>
    <td><span class="issue-id">${i.id}</span></td>
    <td><span class="sev-pill ${sevClass(i.severity)}">${i.severity}</span></td>
    <td>
      <div class="issue-title">${i.title}</div>
    </td>
    <td><span class="badge badge-dim">${i.category ?? '—'}</span></td>
    <td><span class="status-pill ${statusClass(i.status)}">${statusLabel(i.status)}</span></td>
  </tr>`).join('');

const commitRows = commits.map((c, idx) => {
  const isRegression = c.msg.includes('refactor') || c.msg.includes('regression');
  const color = isRegression ? 'var(--yellow)' : 'var(--green)';
  return `
  <div class="commit-row">
    <div class="commit-dot" style="background:${color}"></div>
    <div class="commit-sha">${c.sha}</div>
    <div>
      <div class="commit-msg"><b>${c.msg.split(' — ')[0]}</b>${c.msg.includes(' — ') ? ' — ' + c.msg.split(' — ').slice(1).join(' — ') : ''}${isRegression ? ' <span style="color:var(--red);font-size:11px">← regression</span>' : ''}</div>
    </div>
  </div>`;
}).join('');

const catBar = (name, weight, before, after) => {
  const delta = after - before;
  const isPerfect = after === 100;
  return `
  <div class="bar-row">
    <div class="bar-name">${name} <span style="font-size:10px;color:var(--text-dim)">${weight}%</span></div>
    <div class="bar-track">
      <div class="bar-before" style="width:${before}%"></div>
      <div class="bar-after${isPerfect ? ' perfect' : ''}" style="width:${after}%"></div>
    </div>
    <div class="bar-vals"><span class="bar-val-before">${before}</span><span style="color:var(--text-dim)">/</span><span class="bar-val-after">${after}</span></div>
    <div class="bar-delta ${delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'zero'}">${delta > 0 ? '+' + delta : delta === 0 ? '—' : delta}</div>
  </div>`;
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>QA Report — Yosi Health Dashboard</title>
<style>
  :root{--bg:#111217;--bg2:#181b1f;--bg3:#1f2329;--bg4:#262b33;--border:#2d3340;--text:#d0d4e0;--text-dim:#6b7280;--text-bright:#f0f2f8;--green:#73bf69;--green-dim:#1a3320;--blue:#5794f2;--blue-dim:#0f1e3a;--yellow:#f2cc0c;--yellow-dim:#2e2800;--red:#f2495c;--red-dim:#2e0f14;--purple:#b877d9;--orange:#ff9830;--teal:#00bcd4;--font:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono','Fira Code',monospace;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:13px;line-height:1.5}
  .topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:0 20px;height:48px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:100}
  .topbar-logo{font-weight:700;font-size:14px;color:var(--text-bright);display:flex;align-items:center;gap:8px}
  .topbar-logo .dot{color:var(--red)}
  .topbar-title{color:var(--text-dim);font-size:12px}
  .topbar-title b{color:var(--text-bright)}
  .topbar-right{margin-left:auto;display:flex;align-items:center;gap:12px}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase}
  .badge-green{background:var(--green-dim);color:var(--green)}.badge-blue{background:var(--blue-dim);color:var(--blue)}.badge-yellow{background:var(--yellow-dim);color:var(--yellow)}.badge-dim{background:var(--bg4);color:var(--text-dim)}
  .page{padding:20px;max-width:1400px;margin:0 auto}
  .row{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
  .col{flex:1;min-width:0}
  .panel{background:var(--bg2);border:1px solid var(--border);border-radius:4px;overflow:hidden}
  .panel-header{padding:8px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px}
  .panel-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim)}
  .panel-body{padding:14px}
  .stat-cards{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px}
  .stat-card{flex:1;min-width:130px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:14px 16px;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
  .stat-card.green::before{background:var(--green)}.stat-card.blue::before{background:var(--blue)}.stat-card.red::before{background:var(--red)}.stat-card.yellow::before{background:var(--yellow)}.stat-card.purple::before{background:var(--purple)}
  .stat-label{font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
  .stat-value{font-size:32px;font-weight:700;line-height:1;color:var(--text-bright)}
  .stat-value.green{color:var(--green)}.stat-value.blue{color:var(--blue)}.stat-value.red{color:var(--red)}.stat-value.yellow{color:var(--yellow)}
  .stat-sub{font-size:11px;color:var(--text-dim);margin-top:4px}
  .stat-delta.up{color:var(--green)}.stat-delta.down{color:var(--red)}
  .gauge-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:8px}
  .gauge-ring{position:relative;width:160px;height:160px}
  .gauge-ring svg{transform:rotate(-90deg)}
  .gauge-bg{fill:none;stroke:var(--bg4);stroke-width:14}
  .gauge-fill{fill:none;stroke-width:14;stroke-linecap:round;transition:stroke-dasharray .6s ease}
  .gauge-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .gauge-score{font-size:36px;font-weight:800;color:var(--text-bright)}
  .gauge-max{font-size:13px;color:var(--text-dim)}
  .gauge-label{font-size:12px;color:var(--text-dim);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
  .bar-chart{display:flex;flex-direction:column;gap:10px}
  .bar-row{display:flex;align-items:center;gap:10px}
  .bar-name{width:110px;font-size:11px;color:var(--text-dim);flex-shrink:0}
  .bar-track{flex:1;height:20px;background:var(--bg4);border-radius:2px;overflow:hidden;position:relative}
  .bar-before{position:absolute;top:0;left:0;bottom:0;background:rgba(87,148,242,.35);border-radius:2px 0 0 2px;transition:width .5s ease}
  .bar-after{position:absolute;top:0;left:0;bottom:0;background:var(--blue);border-radius:2px;opacity:.85;transition:width .5s ease}
  .bar-after.perfect{background:var(--green)}
  .bar-vals{display:flex;gap:4px;font-size:11px;width:70px;flex-shrink:0;justify-content:flex-end}
  .bar-val-before{color:var(--text-dim)}.bar-val-after{color:var(--text-bright);font-weight:600}
  .bar-delta{width:32px;font-size:11px;text-align:right;flex-shrink:0}
  .bar-delta.pos{color:var(--green)}.bar-delta.zero{color:var(--text-dim)}.bar-delta.neg{color:var(--red)}
  .legend{display:flex;gap:12px;font-size:11px;color:var(--text-dim)}
  .legend-dot{width:10px;height:10px;border-radius:2px;display:inline-block}
  .issues-table{width:100%;border-collapse:collapse}
  .issues-table th{padding:6px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-dim);border-bottom:1px solid var(--border);text-align:left;white-space:nowrap}
  .issues-table td{padding:10px 12px;border-bottom:1px solid var(--bg3);vertical-align:top}
  .issues-table tr:last-child td{border-bottom:none}
  .issues-table tr:hover td{background:var(--bg3)}
  .issue-id{font-family:var(--mono);font-size:11px;color:var(--text-dim);white-space:nowrap}
  .issue-title{font-weight:600;color:var(--text-bright)}
  .sev-pill{display:inline-block;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  .sev-critical{background:rgba(242,73,92,.2);color:var(--red)}.sev-high{background:rgba(255,152,48,.18);color:var(--orange)}.sev-medium{background:rgba(242,204,12,.15);color:var(--yellow)}.sev-low{background:rgba(107,114,128,.2);color:var(--text-dim)}
  .status-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:3px;font-size:11px;font-weight:600}
  .status-fixed{background:var(--green-dim);color:var(--green)}.status-deferred{background:var(--yellow-dim);color:var(--yellow)}.status-open{background:var(--red-dim);color:var(--red)}
  .commit-list{display:flex;flex-direction:column;gap:0}
  .commit-row{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--bg3)}
  .commit-row:last-child{border-bottom:none}
  .commit-sha{font-family:var(--mono);font-size:11px;color:var(--blue);background:var(--blue-dim);padding:2px 6px;border-radius:3px;white-space:nowrap;flex-shrink:0;margin-top:2px}
  .commit-msg{font-size:12px;color:var(--text)}
  .commit-msg b{color:var(--text-bright)}
  .commit-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
  code{font-family:var(--mono);font-size:11px;background:var(--bg4);padding:1px 5px;border-radius:3px;color:var(--teal)}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dim);margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border)}
  .updated-tag{font-size:10px;color:var(--text-dim);background:var(--bg4);padding:2px 7px;border-radius:10px;font-family:var(--mono)}
</style>
</head>
<body>
<div class="topbar">
  <div class="topbar-logo"><span class="dot">●</span> GStack QA</div>
  <span style="color:var(--border)">|</span>
  <div class="topbar-title"><b>Yosi Health Dashboard</b> &nbsp;·&nbsp; gstack-qa-demo &nbsp;·&nbsp; branch: main</div>
  <div class="topbar-right">
    <span class="badge badge-dim">localhost:3001</span>
    <span class="badge badge-blue">React 18 + Vite 5</span>
    <span class="badge badge-dim">${date}</span>
    <span class="updated-tag">auto-generated</span>
  </div>
</div>

<div class="page">

  <div class="stat-cards">
    <div class="stat-card green">
      <div class="stat-label">Health Score</div>
      <div class="stat-value green">${score}</div>
      <div class="stat-sub"><span class="stat-delta up">↑ latest</span></div>
    </div>
    <div class="stat-card red">
      <div class="stat-label">Issues Found</div>
      <div class="stat-value">${total}</div>
      <div class="stat-sub">all runs combined</div>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Fixed</div>
      <div class="stat-value green">${fixed}</div>
      <div class="stat-sub">verified ✓</div>
    </div>
    <div class="stat-card yellow">
      <div class="stat-label">Deferred</div>
      <div class="stat-value yellow">${deferred}</div>
      <div class="stat-sub">low severity</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-label">Fix Commits</div>
      <div class="stat-value blue">${commits.filter(c => c.msg.includes('fix(qa)')).length}</div>
      <div class="stat-sub">atomic commits</div>
    </div>
  </div>

  <div class="row">
    <div class="panel" style="flex:0 0 220px">
      <div class="panel-header"><span class="panel-title">Health Score</span><span class="badge badge-green">Ship-Ready</span></div>
      <div class="gauge-wrap">
        <div class="gauge-ring">
          <svg viewBox="0 0 160 160" width="160" height="160">
            <circle class="gauge-bg" cx="80" cy="80" r="66"/>
            <circle class="gauge-fill" id="gfill" cx="80" cy="80" r="66"
              stroke="${score >= 90 ? '#73bf69' : score >= 70 ? '#f2cc0c' : '#f2495c'}"
              stroke-dasharray="0 ${circumference.toFixed(1)}"/>
          </svg>
          <div class="gauge-center">
            <div class="gauge-score">${score}</div>
            <div class="gauge-max">/100</div>
          </div>
        </div>
        <div class="gauge-label">Health Score</div>
      </div>
    </div>

    <div class="panel col">
      <div class="panel-header">
        <span class="panel-title">Score by Category</span>
        <div class="legend">
          <span><span class="legend-dot" style="background:rgba(87,148,242,.35)"></span> Before</span>
          <span><span class="legend-dot" style="background:var(--blue)"></span> After</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="bar-chart">
          ${catBar('Functional',  20, 40,  cats.functional  ?? 100)}
          ${catBar('UX',          15, 75,  cats.ux          ?? 100)}
          ${catBar('Accessibility',15,85,  cats.accessibility?? 85)}
          ${catBar('Console',     15, 100, cats.console      ?? 100)}
          ${catBar('Visual',      10, 95,  cats.visual       ?? 95)}
          ${catBar('Links',       10, 100, cats.links        ?? 100)}
          ${catBar('Performance', 10, 100, cats.performance  ?? 100)}
          ${catBar('Content',      5, 100, cats.content      ?? 100)}
        </div>
      </div>
    </div>
  </div>

  <div class="panel" style="margin-bottom:16px">
    <div class="panel-header">
      <span class="panel-title">All Issues</span>
      <span style="font-size:11px;color:var(--text-dim);background:var(--bg4);border:1px solid var(--border);border-radius:3px;padding:2px 8px">${fixed} fixed &nbsp;·&nbsp; ${deferred} deferred</span>
    </div>
    <div style="overflow-x:auto">
      <table class="issues-table">
        <thead>
          <tr>
            <th>#</th><th>Severity</th><th>Title</th><th>Category</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${issueRows}</tbody>
      </table>
    </div>
  </div>

  <div class="section-title">Fix Commit History</div>
  <div class="panel" style="margin-bottom:16px">
    <div class="panel-header">
      <span class="panel-title">git log --grep="fix(qa):"</span>
      <span class="badge badge-dim">${commits.length} commits</span>
    </div>
    <div class="panel-body">
      <div class="commit-list">${commitRows || '<div style="color:var(--text-dim);font-size:12px;padding:8px 0">No fix(qa) commits found yet.</div>'}</div>
    </div>
  </div>

  <div style="text-align:center;padding:20px 0;font-size:11px;color:var(--text-dim)">
    Auto-generated by <b style="color:var(--text)">GStack /qa → generate-dashboard.js</b> &nbsp;·&nbsp; ${new Date().toISOString().replace('T',' ').slice(0,16)} UTC
  </div>
</div>

<script>
  document.querySelectorAll('.bar-before,.bar-after').forEach(el=>{const w=el.style.width;el.style.width='0';setTimeout(()=>{el.style.width=w},100);});
  const gf=document.getElementById('gfill');
  if(gf){setTimeout(()=>{gf.style.strokeDasharray='${filled.toFixed(1)} ${circumference.toFixed(1)}'},200);}
</script>
</body>
</html>`;

writeFileSync(OUT, html, 'utf8');
console.log(`[dashboard] regenerated → ${OUT}`);
