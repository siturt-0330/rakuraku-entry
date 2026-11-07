import type { Case } from '../cases';

/**
 * e2r（eARTH）の登録画面の現住所。「■現住所情報」の区切りの下に、見出しの帯（現住所郵便番号 ※）と欄が縦に並ぶ。
 * 郵便番号が空のまま、番地の欄に市区町村から入ってしまった（2026-11-06、KOKUSAI ELECTRIC）。
 * 画面を開けなかったので、見た目が同じになる作りを並べる。値はテスト用のプロフィール（150-0041・東京都渋谷区神南1-2-3）。
 */

const PREFS = ['北海道', '東京都', '大阪府'];
const pref = (name: string) => `<select name="${name}"><option value="">選択してください</option>${PREFS.map((p) => `<option>${p}</option>`).join('')}</select>`;
const zip = '<input type="text" name="zip1" size="4" maxlength="3"> - <input type="text" name="zip2" size="5" maxlength="4"> <button type="button">郵便番号検索</button>';
const req = '<span class="req">※</span>';
const ITEMS: [string, string][] = [
  ['現住所郵便番号', zip],
  ['現住所都道府県', pref('pref')],
  ['現住所市区町村', '<input type="text" name="city" size="40">'],
  ['現住所番地', '<input type="text" name="addr" size="40">'],
  ['現住所建物名', '<input type="text" name="bldg" size="40">'],
];
const EXPECT = { '[name=zip1]': '150', '[name=zip2]': '0041', '[name=pref]': '東京都', '[name=city]': '渋谷区', '[name=addr]': '神南1-2-3', '[name=bldg]': 'サンプルマンション101' };

export const CASES: Case[] = [
  {
    name: 'E-01 見出しの行（th）と欄の行（td）が縦に並ぶ表',
    html: `<form><p>■現住所情報</p><table>${ITEMS.map(([h, c]) => `<tr><th>${h}${req}</th></tr><tr><td>${c}</td></tr>`).join('')}</table></form>`,
    expect: EXPECT,
  },
  {
    name: 'E-02 dl の dt（見出しの帯）と dd（欄）',
    html: `<form><p>■現住所情報</p><dl>${ITEMS.map(([h, c]) => `<dt>${h}${req}</dt><dd>${c}</dd>`).join('')}</dl></form>`,
    expect: EXPECT,
  },
  {
    name: 'E-03 div の見出しの帯と div の欄',
    html: `<form><div class="sec">■現住所情報</div>${ITEMS.map(([h, c]) => `<div class="item"><div class="item-title">${h}${req}</div><div class="item-body">${c}</div></div>`).join('')}</form>`,
    expect: EXPECT,
  },
  {
    name: 'E-04 1つの表に見出しの行と欄の行が交互（見出しの行は td、欄にラベルなし）',
    html: `<form><table><tr><td colspan="2">■現住所情報</td></tr>${ITEMS.map(([h, c]) => `<tr class="head"><td>${h}${req}</td></tr><tr><td>${c}</td></tr>`).join('')}</table></form>`,
    expect: EXPECT,
  },
];
