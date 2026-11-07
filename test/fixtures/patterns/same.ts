import type { Case } from '../cases';

/**
 * 「帰省先・休暇中の連絡先は現住所と同じ」を示す欄の言い回し。
 * 「現住所と同様の場合はチェック」（snar.jp イビデン）を読めず、帰省先の欄に現住所を入れてしまった（2026-11-08）。
 * テストのプロフィールは帰省先が現住所と同じ（kiseiSame: true）。違う人は profile で変える。
 */

const PREFS = ['北海道', '東京都', '大阪府'];
const pref = (name: string) => `<select name="${name}"><option value=""></option>${PREFS.map((p) => `<option>${p}</option>`).join('')}</select>`;
const address = (p: string) =>
  `<tr><th>郵便番号</th><td><input name="${p}zip"></td></tr><tr><th>都道府県</th><td>${pref(`${p}pref`)}</td></tr><tr><th>住所</th><td><input name="${p}addr"></td></tr>`;
const OTHER = { kiseiSame: false, kiseiPostalCode: '530-0001', kiseiPrefecture: '大阪府', kiseiCity: '大阪市北区', kiseiAddressLine: '梅田1-2-3' };

/** 現住所の表のあとに、チェックボックスの文言と帰省先の表が続くフォーム */
const checkForm = (text: string, heading = '') =>
  `<form><table>${address('')}</table>${heading}<p><label><input type="checkbox" name="same">${text}</label></p><table>${address('k')}</table></form>`;
const sameExpect = { '[name=same]': true, '[name=kzip]': '', '[name=kpref]': '', '[name=kaddr]': '' };

export const CASES: Case[] = [
  { name: 'C-01 「現住所と同様の場合はチェック」', html: checkForm('現住所と同様の場合はチェックしてください'), expect: sameExpect },
  { name: 'C-02 「現住所と一緒の方はチェック」', html: checkForm('現住所と一緒の方はチェック'), expect: sameExpect },
  { name: 'C-03 「帰郷先は現住所と同じ」', html: checkForm('帰郷先は現住所と同じ'), expect: sameExpect },
  { name: 'C-04 見出し「休暇期間中の連絡先」、チェックは「上記と同じ」', html: checkForm('上記と同じ', '<h3>休暇期間中の連絡先</h3>'), expect: sameExpect },
  { name: 'C-05 「現住所から変更なし」', html: checkForm('現住所から変更なし'), expect: sameExpect },
  {
    name: 'C-06 「同意する」のチェックには触らない（住所の話ではない）',
    html: `<form><table>${address('')}</table><p><label><input type="checkbox" name="agree">上記の内容に同意する</label></p></form>`,
    expect: { '[name=agree]': false },
  },
  {
    name: 'C-07 ラジオ「現住所と同じ／現住所と異なる」（同じ人）',
    html: `<form><table>${address('')}</table><h3>帰省先</h3><p><label><input type="radio" name="ks" value="1">現住所と同じ</label><label><input type="radio" name="ks" value="2">現住所と異なる</label></p><table>${address('k')}</table></form>`,
    expect: { '[name=ks][value="1"]': true, '[name=kzip]': '', '[name=kaddr]': '' },
  },
  {
    name: 'C-08 ラジオ「同様／別の住所」（違う人は「別の住所」を選び、帰省先を入れる）',
    html: `<form><table>${address('')}</table><h3>休暇中の連絡先</h3><p><label><input type="radio" name="ks" value="1">同様</label><label><input type="radio" name="ks" value="2">別の住所</label></p><table>${address('k')}</table></form>`,
    profile: OTHER,
    expect: { '[name=ks][value="2"]': true, '[name=kzip]': '530-0001', '[name=kpref]': '大阪府' },
  },
  {
    name: 'C-09 プルダウン「帰省先」：現住所と同じ／現住所と異なる（同じ人）',
    html: `<form><table>${address('')}<tr><th>帰省先</th><td><select name="ks"><option value=""></option><option value="1">現住所と同じ</option><option value="2">現住所と異なる</option></select></td></tr></table></form>`,
    expect: { '[name=ks]': '1' },
  },
];
