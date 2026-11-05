import { PREFECTURES } from '../../../lib/prefectures';
import type { Case } from '../cases';

/**
 * 学校検索の画面（i-webs など）の、学校区分・学校名頭文字・所在地のラジオ。
 * 「大学」の人に「外国大学日本校」を選んでしまった（2026-11-05）ので、選択肢の文字の付け方だけを変えたものを並べる。
 * テストのプロフィールは 大学・サンプルダイガク（さ）・東京都。
 */

const KBN = ['大学', '大学院（修士）', '大学院（博士）', '外国大学日本校', '外国大学'];
const INITIALS = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const REGIONS: [string, string[]][] = [
  ['北海道・東北地区', PREFECTURES.slice(0, 7)],
  ['関東地区', PREFECTURES.slice(7, 14)],
  ['中部・北陸地区', PREFECTURES.slice(14, 23)],
  ['近畿地区', PREFECTURES.slice(23, 30)],
  ['中国・四国地区', PREFECTURES.slice(30, 39)],
  ['九州・沖縄地区', PREFECTURES.slice(39)],
];

/** 選択肢の並びを、1 行 cols 個の表のマス目にする */
function grid(items: string[], cols: number, cell: (label: string, i: number) => string): string {
  const rows: string[] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(`<tr>${items.slice(i, i + cols).map((l, j) => cell(l, i + j)).join('')}</tr>`);
  return `<table>${rows.join('')}</table>`;
}

/** 学校区分の欄の値の期待（「大学」だけ選ぶ） */
const kbnExpect = (name = 'kbn') => Object.fromEntries(KBN.map((_, i) => [`[name=${name}][value="${i + 1}"]`, i === 0]));

const page = (kbn: string, extra = '') => `<form>
  <p>学校区分、学校名頭文字を選択した後、『次へ』ボタンをクリックしてください。</p>
  <div class="box"><h3>学校区分を選択してください。</h3>${kbn}</div>${extra}</form>`;

export const CASES: Case[] = [
  {
    name: 'R-01 学校区分：表のマス目、マスの中に input と label[for]',
    html: page(grid(KBN, 3, (l, i) => `<td><input type="radio" id="k${i}" name="kbn" value="${i + 1}"><label for="k${i}">${l}</label></td>`)),
    expect: kbnExpect(),
  },
  {
    name: 'R-02 学校区分：表のマス目、label で input と文字を包む',
    html: page(grid(KBN, 3, (l, i) => `<td><label><input type="radio" name="kbn" value="${i + 1}">${l}</label></td>`)),
    expect: kbnExpect(),
  },
  {
    name: 'R-03 学校区分：表のマス目、input のマスと文字のマスが別',
    html: page(grid(KBN, 3, (l, i) => `<td><input type="radio" name="kbn" value="${i + 1}"></td><td>${l}</td>`)),
    expect: kbnExpect(),
  },
  {
    name: 'R-04 学校区分：表のマス目、マスの中で input の後ろに文字だけ（label なし）',
    html: page(grid(KBN, 3, (l, i) => `<td><input type="radio" name="kbn" value="${i + 1}">${l}</td>`)),
    expect: kbnExpect(),
  },
  {
    name: 'R-05 学校区分：1つの箱に「［○］大学　［○］大学院（修士）…」を平らに並べ、3つごとに <br>',
    html: page(`<div>${KBN.map((l, i) => `<input type="radio" name="kbn" value="${i + 1}">${l}${i % 3 === 2 ? '<br>' : '　'}`).join('')}</div>`),
    expect: kbnExpect(),
  },
  {
    name: 'R-06 学校区分：1つの箱に label[for] と input を平らに並べる（label が後ろ）',
    html: page(`<div>${KBN.map((l, i) => `<input type="radio" id="k${i}" name="kbn" value="${i + 1}"><label for="k${i}">${l}</label>${i % 3 === 2 ? '<br>' : ''}`).join('')}</div>`),
    expect: kbnExpect(),
  },
  {
    name: 'R-07 学校区分：jqTransform のラジオ（飾りの a・本物の input は隠す）と label[for]、表のマス目',
    html: page(
      grid(KBN, 3, (l, i) => `<td><span class="jqTransformRadioWrapper"><a href="#" class="jqTransformRadio" rel="kbn"></a><input type="radio" id="k${i}" name="kbn" value="${i + 1}" class="jqTransformHidden" style="display:none"></span><label for="k${i}">${l}</label></td>`),
    ),
    expect: kbnExpect(),
  },
  {
    name: 'R-08 学校区分：jqTransform のラジオと label for="text"（紐づかない label）、表のマス目',
    html: page(
      grid(KBN, 3, (l, i) => `<td><span class="jqTransformRadioWrapper"><a href="#" class="jqTransformRadio" rel="kbn"></a><input type="radio" name="kbn" value="${i + 1}" class="jqTransformHidden" style="display:none"></span><label for="text">${l}</label></td>`),
    ),
    expect: kbnExpect(),
  },
  {
    name: 'R-09 学校区分：value が選択肢の文字（value="外国大学日本校"）で、文字は label[for]',
    html: page(grid(KBN, 3, (l, i) => `<td><input type="radio" id="k${i}" name="kbn" value="${l}"><label for="k${i}">${l}</label></td>`)),
    expect: Object.fromEntries(KBN.map((l, i) => [`[name=kbn][value="${l}"]`, i === 0])),
  },
  {
    name: 'R-10 学校区分：外国大学日本校・外国大学が先に並ぶ',
    html: page(grid([...KBN].reverse(), 3, (l) => `<td><label><input type="radio" name="kbn" value="${KBN.indexOf(l) + 1}">${l}</label></td>`)),
    expect: kbnExpect(),
  },
  {
    name: 'R-11 学校区分・頭文字・所在地をまとめた画面（表のマス目・地区ごとの見出し・「所在地を検索対象にする」チェック）',
    html: page(
      grid(KBN, 3, (l, i) => `<td><label><input type="radio" name="kbn" value="${i + 1}">${l}</label></td>`),
      `<div class="box"><h3>学校名頭文字を選択してください。</h3>${grid(INITIALS, 10, (l, i) => `<td><label><input type="radio" name="init" value="${i + 1}">${l}</label></td>`)}</div>
      <div class="box"><label><input type="checkbox" name="usepref" value="1">所在地を検索対象にする場合はこちらにチェックの上、下記より所在地を選択してください。</label>
      ${REGIONS.map(([r, ps]) => `<h4>${r}</h4>${grid(ps, 7, (p) => `<td><label><input type="radio" name="pref" value="${PREFECTURES.indexOf(p) + 1}">${p}</label></td>`)}`).join('')}</div>`,
    ),
    expect: { ...kbnExpect(), '[name=init][value="11"]': true, '[name=init][value="4"]': false, '[name=pref][value="13"]': true },
  },
  {
    name: 'R-14 学校区分：1行分のラジオを1つの label で包む（label の中に3つの input と文字）',
    html: page(
      [KBN.slice(0, 3), KBN.slice(3)]
        .map((row, r) => `<label class="row">${row.map((l, j) => `<input type="radio" name="kbn" value="${r * 3 + j + 1}">${l}　`).join('')}</label><br>`)
        .join(''),
    ),
    expect: kbnExpect(),
  },
  {
    name: 'R-15 学校区分：選択肢全部を1つの label で包み、選択肢ごとに span',
    html: page(`<label>${KBN.map((l, i) => `<span class="item"><input type="radio" name="kbn" value="${i + 1}"><span>${l}</span></span>`).join('')}</label>`),
    expect: kbnExpect(),
  },
  {
    name: 'R-16 頭文字：1行分を1つの label で包む（あ か さ た な…）',
    html: `<form><h3>学校名頭文字を選択してください。</h3>${[0, 1, 2, 3, 4]
      .map((r) => `<label>${[0, 5, 10, 15, 20, 25, 30].map((c) => `<input type="radio" name="init" value="${c + r + 1}">${INITIALS[c + r]}　`).join('')}</label><br>`)
      .join('')}</form>`,
    expect: { '[name=init][value="11"]': true, '[name=init][value="1"]': false },
  },
  {
    name: 'R-12 頭文字：五十音表を縦に並べる（あ行が1列目）、input の後ろに文字だけ',
    html: `<form><h3>学校名頭文字を選択してください。</h3><table>${[0, 1, 2, 3, 4]
      .map((r) => `<tr>${[0, 5, 10, 15, 20, 25, 30].map((c) => `<td><input type="radio" name="init" value="${c + r + 1}">${INITIALS[c + r]}</td>`).join('')}</tr>`)
      .join('')}</table></form>`,
    expect: { '[name=init][value="11"]': true, '[name=init][value="1"]': false },
  },
  {
    name: 'R-13 所在地：地区ごとの見出し（div）の下に、label で包んだ都道府県のラジオ（大阪の大学の人）',
    html: `<form><h3>所在地を選択してください。</h3>${REGIONS.map(([r, ps]) => `<div class="area">${r}</div><div>${ps.map((p) => `<label><input type="radio" name="pref" value="${p}">${p}</label>`).join('')}</div>`).join('')}</form>`,
    profile: { schoolPrefecture: '大阪府' },
    expect: { '[name=pref][value="大阪府"]': true, '[name=pref][value="東京都"]': false },
  },
];
