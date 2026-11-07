// 回帰テストをターミナルから流す：npm run test:forms
// vite のサーバーを起動し、パソコンの Chrome を画面なしで開いて、テストを n 個のタブに分けて同時に流し、結果を待つ。
// 前から失敗しているテスト（test/known-failures.json）と比べ、新しく失敗したテストがあれば終了コード 1。
//
//   npm run test:forms                     すべての組（?set=all）を 8 並列で
//   npm run test:forms -- --set=e2r        1 つの組だけ
//   npm run test:forms -- --only=伊藤園     名前の一部が合うテストだけ
//   npm run test:forms -- --n=12           並べる数
//   npm run test:forms -- --update         今の失敗を known-failures.json に書き直す（直した・増えたテストを確かめてから）
//
// Chrome の場所は CHROME_PATH で変えられる。画面が隠れていても時計を遅らせない設定で開くので、ブラウザのタブで流すより結果が揺れにくい。
// F-R6・F-V5・F-K2・Microsoft Forms（切り出し）の 4 件は、画面の見えている Chrome では通るが、画面なしの Chrome では
// 「元に戻す」が効かず失敗する（2026-11-08 に確認。コードの版によらない）ので、known-failures.json に入れてある
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const set = args.set ?? 'all';
const n = Number(args.n) || 8;
const knownPath = path.join(here, 'known-failures.json');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!chromePath) {
  console.error('Chrome が見つかりません。CHROME_PATH に chrome の場所を入れてください');
  process.exit(2);
}

const server = await createServer({ configFile: path.join(here, 'vite.config.ts'), server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const shardUrl = (i) =>
  `${base}/test/suite.html?${new URLSearchParams({ set, shard: String(i), of: String(n), ...(args.only ? { only: args.only } : {}) })}`;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'recruitai-test-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--window-size=1280,900',
    // テストのページは、フォーカスがあるふりをさせてから開く（waitForResults）。画面なしの Chrome はフォーカスがなく、
    // blur で値を確かめるサイトをまねたテスト（F-K2 など）が、本物のブラウザと違う動きになる
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let exitCode = 2;
try {
  const result = await waitForResults();
  exitCode = report(result);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
} finally {
  chrome.kill();
  await server.close();
  // Chrome がファイルを離すまで少し待ってから消す
  setTimeout(() => {
    try {
      fs.rmSync(profile, { recursive: true, force: true });
    } catch {
      // 消せなくても一時フォルダなので放っておく
    }
    process.exit(exitCode);
  }, 500);
}

/**
 * Chrome のタブを n 個開き、それぞれで suite.html の 1/n を流して、window.suiteResults を DevTools プロトコルで読む。
 * iframe に分けると、フォーカスを持てるのが 1 つの iframe だけになり、blur を使うテスト（F-K2 など）が本物と違う動きになるので、
 * タブごとに「フォーカスがあるふり」（Emulation.setFocusEmulationEnabled）をさせてから開く
 */
async function waitForResults() {
  const started = Date.now();
  const portFile = path.join(profile, 'DevToolsActivePort');
  const deadline = Date.now() + 30 * 60 * 1000;
  while (!fs.existsSync(portFile)) {
    if (Date.now() > deadline) throw new Error('Chrome が起動しませんでした');
    await sleep(200);
  }
  const port = fs.readFileSync(portFile, 'utf8').split(/\r?\n/)[0];
  const tabs = [];
  for (let i = 0; i < n; i++) {
    const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
    const tab = await connect(target.webSocketDebuggerUrl);
    await tab.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await tab.send('Page.navigate', { url: shardUrl(i) });
    tabs.push(tab);
  }
  const results = new Map();
  while (Date.now() < deadline) {
    for (const [i, tab] of tabs.entries()) {
      if (results.has(i)) continue;
      const json = await tab.evaluate('window.suiteResults ? JSON.stringify(window.suiteResults) : null');
      if (json) results.set(i, JSON.parse(json));
    }
    process.stdout.write(`実行中…（${results.size} / ${n}）   `);
    if (results.size === n) break;
    await sleep(1000);
  }
  tabs.forEach((t) => t.close());
  if (results.size < n) throw new Error('30 分たっても終わりませんでした');
  const all = [...results.values()].flat().sort((x, y) => (x.index ?? 0) - (y.index ?? 0));
  const failed = all.filter((r) => r.failures.length || r.undoFailures.length || r.error).map((r) => r.name);
  const known = new Set(JSON.parse(fs.readFileSync(knownPath, 'utf8')));
  return {
    results: all,
    newly: failed.filter((name) => !known.has(name)),
    fixed: [...known].filter((name) => all.some((r) => r.name === name && !failed.includes(name))),
    seconds: Math.round((Date.now() - started) / 1000),
  };
}

/** DevTools プロトコルの WebSocket につなぎ、命令を送る関数を返す */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id;
      pending.set(i, resolve);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = (expression) => send('Runtime.evaluate', { expression, returnByValue: true }).then((msg) => msg.result?.result?.value);
  return { send, evaluate, close: () => ws.close() };
}

function report({ results, newly, fixed, seconds }) {
  const failed = results.filter((r) => r.failures.length || r.undoFailures.length || r.error);
  process.stdout.write('\r');
  console.log(`${results.length - failed.length} / ${results.length} 件 成功（${seconds} 秒・${n} 並列・set=${set}${args.only ? `・only=${args.only}` : ''}）`);
  console.log(`新しく失敗：${newly.length} 件 ／ 前から失敗：${failed.length - newly.length} 件 ／ 直った：${fixed.length} 件`);
  for (const name of newly) {
    const r = results.find((x) => x.name === name);
    console.log(`\n✗ ${name}`);
    for (const f of r.failures) console.log(`    ${f.selector}：期待 ${JSON.stringify(f.expected)} / 実際 ${JSON.stringify(f.actual)}`);
    for (const u of r.undoFailures) console.log(`    元に戻らない：${u}`);
    if (r.error) console.log(`    ${r.error.split('\n')[0]}`);
  }
  if (fixed.length) console.log(`\n直った（--update で known-failures.json から外せます）：\n${fixed.map((x) => `  ✓ ${x}`).join('\n')}`);
  if (args.update) {
    if (set !== 'all' || args.only) {
      console.log('\n--update は、すべての組（--set と --only なし）で流したときだけ使えます');
    } else {
      fs.writeFileSync(knownPath, JSON.stringify(failed.map((r) => r.name), null, 2) + '\n');
      console.log(`\nknown-failures.json を ${failed.length} 件で書き直しました`);
    }
  }
  return newly.length ? 1 : 0;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
