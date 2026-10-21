/* PROTOTYPE, throwaway. Renders three variants of the analyzer result page from the fixture.
   Reads ?variant= (a, b, or c), renders into #app, and mounts a floating switcher. */

const FIXTURE = '../fixtures/analyze-response.json';
const HEADSHOT_FALLBACK = '../../../static/headshot-default.svg';
const AVATAR_FALLBACK = '../../../static/avatar-default.svg';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

/* Join the trade sides and the graded sides by roster id, asker first. */
function model(doc) {
  const asker = doc.trade.asker;
  const sides = doc.trade.sides.map(t => ({ ...t, ...doc.sides.find(s => s.roster_id === t.roster_id), mine: t.roster_id === asker }));
  sides.sort((x, y) => (y.mine ? 1 : 0) - (x.mine ? 1 : 0));
  return { doc, asker, sides, mine: sides.find(s => s.mine) };
}

function mark(step) {
  if (step > 0) return '<span class="mark up" title="up one step">▲</span>';
  if (step < 0) return '<span class="mark down" title="down one step">▼</span>';
  return '<span class="mark flat" title="no change">–</span>';
}
const lean = l => l ? `<span class="lean">leans ${esc(l)}</span>` : '';

/* One letter when the grade holds. The start letter struck through, then the final letter, when it moved. */
function letters(s) {
  if (s.start_letter === s.final_letter) return `<span class="grade-letter">${esc(s.final_letter)}</span>`;
  return `<span class="grade-letter was" title="start">${esc(s.start_letter)}</span><span class="grade-letter">${esc(s.final_letter)}</span>`;
}
const moved = s => s.start_letter !== s.final_letter && s.final_reason;
const analysis = (doc, s) => doc.fallback ? 'Analysis unavailable' : esc(s.analysis);
const youTag = s => s.mine ? ' <span class="you">your side</span>' : '';

function teamHead(s) {
  return `<img class="avatar" src="${AVATAR_FALLBACK}" alt=""><span class="team-name">${esc(s.team)}</span>`;
}

/* The swap card in today's .trade .swap.pair language. */
function swapCard(m) {
  const col = s => `
    <div class="col">
      <div class="hd">${teamHead(s)}</div>
      <span class="gets">${s.mine ? 'You get' : 'Gets'}</span>
      <ul class="got">${s.gets.map(p => `<li class="chip"><img class="headshot" src="${esc(p.headshot)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${HEADSHOT_FALLBACK}'"><b>${esc(p.name)}</b><span class="pick">${esc(p.position)} · ${esc(p.nfl_team)}</span></li>`).join('')}</ul>
    </div>`;
  const [a, b] = m.sides;
  return `<div class="trade"><div class="swap pair">${col(a)}<div class="for"><span>For</span></div>${col(b)}</div></div>`;
}

function asOf(doc) {
  const t = new Date(doc.as_of.rosters_fetched);
  const when = t.toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
  return `<p class="asof">Chart week ${esc(doc.as_of.chart_week)} · stats through week ${esc(doc.as_of.stats_through)} · rosters fetched ${esc(when)}</p>`;
}

const choiceWord = c => ({ accept:'Accept', counter:'Counter', decline:'Decline' }[c] || c);

/* A: Scorecard. Swap card, two grade cards side by side, dark verdict block at the bottom. */
function variantA(m) {
  const { doc } = m;
  const card = s => `
    <div class="gcard${s.mine ? ' mine' : ''}">
      <div class="lbl" style="margin-bottom:0">${s.mine ? 'Your side' : 'Their side'}</div>
      <div class="letters">${letters(s)}</div>
      <div class="tn team-name">${esc(s.team)}</div>
      ${moved(s) ? `<p class="fr">${esc(s.final_reason)}</p>` : ''}
      <details>
        <summary>Why</summary>
        <ul class="adj">${s.adjusters.map(a => `<li><div class="nm">${mark(a.step)}${esc(a.name)} ${lean(a.lean)}</div><p>${esc(a.reason)}</p></li>`).join('')}</ul>
      </details>
    </div>`;
  return `
    <section class="chap"><div class="lbl">The trade</div>${swapCard(m)}</section>
    <section class="chap">
      <div class="lbl">Grades</div>
      <div class="grades">${m.sides.map(card).join('')}</div>
      <div class="analysis">${m.sides.map((s, i) => `<p class="blurb${i ? ' gap' : ''}"><b>${esc(s.team)}.</b> ${analysis(doc, s)}</p>`).join('')}</div>
    </section>
    <section class="chap dark verdict">
      <div class="lbl">Verdict for ${esc(m.mine.team)}</div>
      <p class="call">${esc(choiceWord(doc.verdict.choice))}</p>
      <p class="blurb">${esc(doc.verdict.reason)}</p>
    </section>
    <section class="chap">${asOf(doc)}</section>`;
}

/* B: Verdict first. Dark hero with the asker's letter and call, then the swap, then stacked side cards. */
function variantB(m) {
  const { doc, mine } = m;
  const side = s => `
    <article class="side${s.mine ? ' mine' : ''}">
      <div class="top">
        <div><div class="tn team-name">${esc(s.team)}</div>${youTag(s)}</div>
        <div class="letters">${letters(s)}</div>
      </div>
      ${moved(s) ? `<p class="fr">${esc(s.final_reason)}</p>` : ''}
      <div class="rows">${s.adjusters.map(a => `<div class="r">${mark(a.step)}<div><b>${esc(a.name)}</b> ${lean(a.lean)}</div><p>${esc(a.reason)}</p></div>`).join('')}</div>
      <p class="blurb">${analysis(doc, s)}</p>
    </article>`;
  return `
    <section class="chap dark hero">
      <div class="lbl">Your grade</div>
      <div class="who-line">${esc(mine.team)}</div>
      <div class="row">${letters(mine)}<span class="tag">${esc(choiceWord(doc.verdict.choice))}</span></div>
      <p class="lead">${esc(doc.verdict.reason)}</p>
      ${moved(mine) ? `<p class="blurb gap">${esc(mine.final_reason)}</p>` : ''}
    </section>
    <section class="chap"><div class="lbl">The trade</div>${swapCard(m)}</section>
    <section class="chap"><div class="lbl">Breakdown</div>${m.sides.map(side).join('')}</section>
    <section class="chap">${asOf(doc)}</section>`;
}

/* C: Ledger. Swap card, one table with adjusters down and sides across, analysis, red-rule verdict callout. */
function variantC(m) {
  const { doc, sides } = m;
  const cls = s => s.mine ? ' mine' : '';
  const names = sides[0].adjusters.map(a => a.name);
  const cell = (s, name) => {
    const a = s.adjusters.find(x => x.name === name);
    if (!a) return `<div class="c${cls(s)}">${mark(0)}<span>n/a</span></div>`;
    return `<div class="c${cls(s)}">${mark(a.step)}<span>${esc(a.reason)}</span>${lean(a.lean)}</div>`;
  };
  // Brian's call: one grade per side, no start letter, no "reads it one step off" line.
  const head = s => `<div class="h${cls(s)}"><span class="team-name">${esc(s.team)}</span>${youTag(s)}<span class="grade-letter">${esc(s.final_letter)}</span></div>`;
  return `
    <section class="chap"><div class="lbl">The trade</div>${swapCard(m)}</section>
    <section class="chap">
      <div class="lbl">Ledger</div>
      <div class="ledger">
        <div class="h"><span class="k">Adjuster</span></div>${sides.map(head).join('')}
        ${names.map(n => `<div class="k">${esc(n)}</div>${sides.map(s => cell(s, n)).join('')}`).join('')}
      </div>
    </section>
    <section class="chap">
      ${sides.map((s, i) => `<div class="lbl"${i ? ' style="margin-top:var(--sp-4)"' : ''}>${esc(s.team)}${s.mine ? ' · your side' : ''}</div><p class="blurb">${analysis(doc, s)}</p>`).join('')}
    </section>
    <section class="chap">
      <div class="callout">
        <div class="lbl">Verdict for ${esc(m.mine.team)}</div>
        <p class="call">${esc(choiceWord(doc.verdict.choice))}</p>
        <p class="blurb">${esc(doc.verdict.reason)}</p>
      </div>
    </section>
    <section class="chap">
      <div class="lbl">Suggested counters</div>
      <p class="blurb">Slot only. The API has no counters yet.</p>
    </section>
    <section class="chap">${asOf(doc)}</section>`;
}

const VARIANTS = [
  { key:'a', name:'Scorecard', render:variantA },
  { key:'b', name:'Verdict first', render:variantB },
  { key:'c', name:'Ledger', render:variantC },
];

let data = null;
let current = 0;

function render() {
  const v = VARIANTS[current];
  const app = document.getElementById('app');
  app.className = `variant-${v.key}`;
  app.innerHTML = v.render(data);
  document.querySelector('.proto-switch span').textContent = `${v.key.toUpperCase()} — ${v.name}`;
}

function go(delta) {
  current = (current + delta + VARIANTS.length) % VARIANTS.length;
  const url = new URL(location.href);
  url.searchParams.set('variant', VARIANTS[current].key);
  history.replaceState(null, '', url);
  render();
}

function mountSwitcher() {
  const bar = document.createElement('div');
  bar.className = 'proto-switch';
  bar.innerHTML = '<button type="button" aria-label="Previous variant">←</button><span></span><button type="button" aria-label="Next variant">→</button>';
  const [prev, next] = bar.querySelectorAll('button');
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  document.body.appendChild(bar);
  document.addEventListener('keydown', e => {
    const el = document.activeElement;
    if (el && el.matches('input, textarea, [contenteditable], [contenteditable] *')) return;
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
}

async function main() {
  const res = await fetch(FIXTURE);
  data = model(await res.json());
  const want = new URLSearchParams(location.search).get('variant') || 'a';
  current = Math.max(0, VARIANTS.findIndex(v => v.key === want.toLowerCase()));
  mountSwitcher();
  render();
}

main().catch(err => {
  document.getElementById('app').innerHTML = `<section class="chap"><p class="blurb">Fixture failed to load: ${esc(err.message)}</p></section>`;
});
