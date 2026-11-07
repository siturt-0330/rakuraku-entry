// 回帰テスト（suite.html）を n 個の iframe に分けて同時に流す。エンジンの待ち時間（自動入力の待ち・プルダウンの選び直し）は
// ほとんどが何もしない待ちなので、分けて流すと全体の時間がほぼ 1/n になる。
// ?set= と ?only= は suite.html と同じ。?n= で分ける数（初期値 8）。
// 終わると window.suiteResults に結果、window.suiteDone に true を入れる（scripts/test-forms.mjs が読む）
import knownFailures from './known-failures.json';

interface CaseResult {
  name: string;
  failures: { selector: string; expected: unknown; actual: unknown }[];
  undoFailures: string[];
  error?: string;
}

const params = new URLSearchParams(location.search);
const n = Math.max(1, Math.min(32, Number(params.get('n')) || 8));
const frames = document.getElementById('frames')!;
const out = document.getElementById('results')!;
const started = performance.now();

const shards = new Map<number, CaseResult[]>();
const failedOf = (r: CaseResult) => r.failures.length > 0 || r.undoFailures.length > 0 || !!r.error;

window.addEventListener('message', (e) => {
  const data = e.data as { type?: string; shard?: number; results?: CaseResult[] };
  if (data?.type !== 'suite-results' || typeof data.shard !== 'number') return;
  shards.set(data.shard, data.results ?? []);
  out.textContent = `実行中…（${shards.size} / ${n}）`;
  if (shards.size === n) finish();
});

for (let i = 0; i < n; i++) {
  const q = new URLSearchParams(params);
  q.delete('n');
  q.set('shard', String(i));
  q.set('of', String(n));
  const f = document.createElement('iframe');
  f.src = `./suite.html?${q}`;
  frames.append(f);
}

function finish() {
  // suite.ts と同じ並び（ケースの番号順）に戻す
  const results = [...shards.values()].flat().sort((a, b) => order(a) - order(b));
  const failed = results.filter(failedOf);
  const known = new Set(knownFailures as string[]);
  const newly = failed.filter((r) => !known.has(r.name));
  const fixed = [...known].filter((name) => results.some((r) => r.name === name && !failedOf(r)));
  const seconds = Math.round((performance.now() - started) / 1000);
  const esc = (s: unknown) => String(s).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]!);
  const item = (r: CaseResult) => `<li class="${failedOf(r) ? 'ng' : 'ok'}">${esc(r.name)}
    ${r.failures.map((f) => `<div class="d">${esc(f.selector)}：期待 <b>${esc(JSON.stringify(f.expected))}</b> / 実際 <b>${esc(JSON.stringify(f.actual))}</b></div>`).join('')}
    ${r.undoFailures.map((u) => `<div class="d">元に戻らない：${esc(u)}</div>`).join('')}
    ${r.error ? `<pre class="d">${esc(r.error)}</pre>` : ''}</li>`;
  out.innerHTML = `
    <h2 class="${newly.length ? 'ng' : 'ok'}">${results.length - failed.length} / ${results.length} 件 成功（${seconds} 秒・${n} 並列）</h2>
    <p class="${newly.length ? 'ng' : 'ok'}">新しく失敗：${newly.length} 件 ／ 前から失敗（known-failures.json）：${failed.length - newly.length} 件 ／ 直った：${fixed.length} 件</p>
    ${newly.length ? `<h3 class="ng">新しく失敗</h3><ol>${newly.map(item).join('')}</ol>` : ''}
    <h3>すべて</h3><ol>${results.map(item).join('')}</ol>`;
  Object.assign(window, { suiteResults: results, suiteNewFailures: newly.map((r) => r.name), suiteFixed: fixed, suiteSeconds: seconds, suiteDone: true });
}

/** suite.ts はケースの通し番号を名前の前に付けないので、shard の割り振り（index % n）から元の順番を戻す */
function order(r: CaseResult & { index?: number }) {
  return r.index ?? 0;
}
