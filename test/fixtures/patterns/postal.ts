import type { Case } from '../cases';

/**
 * 郵便番号の書き方（ハイフンを入れるか）の手がかりと、分割の欄の形。
 * 値はテスト用のプロフィール（150-0041）。hints.ts の H-Z1〜7 にないものを置く。
 */

const one = (n: string, label: string, input: string, exp: string, profile?: Case['profile']): Case => ({
  name: `${n} ${label}`,
  html: `<form><div><span>郵便番号</span> ${input}</div></form>`,
  expect: { '[name=z]': exp },
  ...(profile ? { profile } : {}),
});

export const CASES: Case[] = [
  one('P-01', 'type="number"（ハイフンを入れられない）', '<input type="number" name="z">', '1500041'),
  one('P-02', 'maxlength=7 だけ（注意書きなし）', '<input name="z" maxlength="7">', '1500041'),
  one('P-03', 'placeholder「000-0000」', '<input name="z" placeholder="000-0000">', '150-0041'),
  one('P-04', 'placeholder「0000000」', '<input name="z" placeholder="0000000">', '1500041'),
  one('P-05', 'placeholder「例）123-4567」', '<input name="z" placeholder="例）123-4567">', '150-0041'),
  one('P-06', 'placeholder「例：1234567」', '<input name="z" placeholder="例：1234567">', '1500041'),
  one('P-07', '注意書き「ハイフン（-）不要」', '<input name="z"> <small>ハイフン（-）不要</small>', '1500041'),
  one('P-08', '注意書き「「-」は入れずに入力」', '<input name="z"> <small>「-」は入れずに入力してください</small>', '1500041'),
  one('P-09', 'maxlength=8 だが注意書き「ハイフンなし」', '<input name="z" maxlength="8"> <small>ハイフンなしで入力</small>', '1500041'),
  one('P-10', 'type="tel" maxlength=8', '<input type="tel" name="z" maxlength="8">', '150-0041'),
  one('P-11', 'aria-describedby の記入例「1000001」（axol の caption）', '<span id="cz">記入例 1000001</span><input name="z" aria-describedby="cz">', '1500041'),
  one('P-12', 'aria-describedby の記入例「100-0001」', '<span id="cz">記入例 100-0001</span><input name="z" aria-describedby="cz">', '150-0041'),
  one('P-13', 'プロフィールがハイフンなし（1500041）で、欄は placeholder「000-0000」', '<input name="z" placeholder="000-0000">', '150-0041', { postalCode: '1500041' }),
  one('P-14', 'プロフィールが全角（１５０－００４１）で、欄は maxlength=7', '<input name="z" maxlength="7">', '1500041', { postalCode: '１５０－００４１' }),
  {
    name: 'P-15 分割（3桁・4桁）を全角のダッシュの span でつなぐ',
    html: `<form><div><span>郵便番号</span> <input name="z1" maxlength="3"><span>－</span><input name="z2" maxlength="4"></div></form>`,
    expect: { '[name=z1]': '150', '[name=z2]': '0041' },
  },
  {
    name: 'P-16 分割を長音「ー」でつなぎ、見出しは「〒」だけ',
    html: `<form><p>〒<input name="z1" size="3">ー<input name="z2" size="4"></p></form>`,
    expect: { '[name=z1]': '150', '[name=z2]': '0041' },
  },
  {
    name: 'P-17 分割の欄が maxlength なし・placeholder「123」「4567」',
    html: `<form><div><label>郵便番号</label><input name="z1" placeholder="123"> - <input name="z2" placeholder="4567"></div></form>`,
    expect: { '[name=z1]': '150', '[name=z2]': '0041' },
  },
  {
    name: 'P-18 分割の後ろに「郵便番号から住所を検索」のボタンと、次の行に住所',
    html: `<form><div><span>郵便番号</span><input name="z1" maxlength="3">-<input name="z2" maxlength="4"><button type="button">住所検索</button></div>
      <div><span>住所</span><input name="ad"></div></form>`,
    expect: { '[name=z1]': '150', '[name=z2]': '0041' },
  },
  {
    name: 'P-19 帰省先の分割（帰省先は別の住所）',
    html: `<form><h3>帰省先</h3><div><span>郵便番号</span><input name="k1" maxlength="3">-<input name="k2" maxlength="4"></div></form>`,
    profile: { kiseiSame: false, kiseiPostalCode: '530-0001', kiseiPrefecture: '大阪府', kiseiCity: '大阪市北区', kiseiAddressLine: '梅田1-2-3' },
    expect: { '[name=k1]': '530', '[name=k2]': '0001' },
  },
  {
    name: 'P-20 現住所と帰省先の分割が続けて並ぶ（帰省先は別の住所）',
    html: `<form><h3>現住所</h3><div><span>郵便番号</span><input name="z1" maxlength="3">-<input name="z2" maxlength="4"></div>
      <h3>帰省先</h3><div><span>郵便番号</span><input name="k1" maxlength="3">-<input name="k2" maxlength="4"></div></form>`,
    profile: { kiseiSame: false, kiseiPostalCode: '530-0001', kiseiPrefecture: '大阪府', kiseiCity: '大阪市北区', kiseiAddressLine: '梅田1-2-3' },
    expect: { '[name=z1]': '150', '[name=z2]': '0041', '[name=k1]': '530', '[name=k2]': '0001' },
  },
];
