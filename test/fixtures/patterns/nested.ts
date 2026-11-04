import type { Case } from '../cases';

/**
 * 大きな見出し（「現住所」「連絡先」「氏名」）の中に、小さな項目（郵便番号・市区町村・姓・名）が並ぶフォーム。
 * 大きな見出しだけを拾うと、郵便番号の欄に住所を入れてしまう（axol の伊藤園で起きた）。
 * 小さな項目の見出しの付け方だけを変え、name は a1〜a9 のように手がかりにならない値にする。
 */

const PREFS = ['北海道', '東京都', '大阪府'];
const prefSelect = (name: string, attrs = '') =>
  `<select name="${name}" ${attrs}><option value="">選択してください</option>${PREFS.map((p) => `<option>${p}</option>`).join('')}</select>`;

const ADDRESS = { '[name=a1]': '150', '[name=a2]': '0041', '[name=a3]': '東京都', '[name=a4]': '渋谷区', '[name=a5]': '神南1-2-3', '[name=a6]': 'サンプルマンション101' };

export const CASES: Case[] = [
  {
    name: 'N-01 role=group の「現住所」の中に、小見出しの div（欄とは紐づけなし）と aria-label「上3桁」「下4桁」',
    html: `<form><div role="group" aria-labelledby="g1"><div id="g1">現住所</div>
      <div><div>郵便番号</div><div><input name="a1" aria-label="上3桁" size="3"> - <input name="a2" aria-label="下4桁" size="4"></div></div>
      <div><div>都道府県</div><div>${prefSelect('a3')}</div></div>
      <div><div>市区町村</div><div><input name="a4"></div></div>
      <div><div>番地</div><div><input name="a5"></div></div>
      <div><div>建物名</div><div><input name="a6"></div></div>
    </div></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-02 role=group の「現住所」の中で、欄を包む div に aria-labelledby（role なし）',
    html: `<form><div role="group" aria-labelledby="g2"><div id="g2">現住所</div>
      <p id="t1">郵便番号</p><div aria-labelledby="t1"><input name="a1" size="3"> - <input name="a2" size="4"></div>
      <p id="t3">都道府県</p><div aria-labelledby="t3">${prefSelect('a3')}</div>
      <p id="t4">市区町村</p><div aria-labelledby="t4"><input name="a4"></div>
      <p id="t5">番地</p><div aria-labelledby="t5"><input name="a5"></div>
      <p id="t6">建物名</p><div aria-labelledby="t6"><input name="a6"></div>
    </div></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-03 fieldset / legend「現住所」の中に、小見出しの span と欄',
    html: `<form><fieldset><legend>現住所</legend>
      <div><span>郵便番号</span> <input name="a1" size="3">-<input name="a2" size="4"></div>
      <div><span>都道府県</span> ${prefSelect('a3')}</div>
      <div><span>市区町村</span> <input name="a4"></div>
      <div><span>番地</span> <input name="a5"></div>
      <div><span>建物名</span> <input name="a6"></div>
    </fieldset></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-04 表の th「現住所」、td の中に「〒」と小見出しを <br> で並べる',
    html: `<form><table><tr><th>現住所</th><td>
      〒 <input name="a1" size="3">-<input name="a2" size="4"><br>
      都道府県 ${prefSelect('a3')}<br>
      市区町村 <input name="a4"><br>
      番地 <input name="a5"><br>
      建物名 <input name="a6">
    </td></tr></table></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-05 dl の dt「現住所」、dd の中の dl に小見出し（dt）',
    html: `<form><dl><dt>現住所</dt><dd><dl>
      <dt>郵便番号</dt><dd><input name="a1" size="3">-<input name="a2" size="4"></dd>
      <dt>都道府県</dt><dd>${prefSelect('a3')}</dd>
      <dt>市区町村</dt><dd><input name="a4"></dd>
      <dt>番地</dt><dd><input name="a5"></dd>
      <dt>建物名</dt><dd><input name="a6"></dd>
    </dl></dd></dl></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-06 role=group「現住所」の中に role=group の小項目（郵便番号）が入れ子',
    html: `<form><div role="group" aria-labelledby="g6"><div id="g6">現住所</div>
      <div role="group" aria-labelledby="s1"><span id="s1">郵便番号</span><input name="a1" aria-label="前半" size="3">-<input name="a2" aria-label="後半" size="4"></div>
      <div role="group" aria-labelledby="s3"><span id="s3">都道府県</span>${prefSelect('a3')}</div>
      <div role="group" aria-labelledby="s4"><span id="s4">市区町村</span><input name="a4"></div>
      <div role="group" aria-labelledby="s5"><span id="s5">番地</span><input name="a5"></div>
      <div role="group" aria-labelledby="s6"><span id="s6">建物名</span><input name="a6"></div>
    </div></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-07 「現住所」の見出しの中で、欄には placeholder だけ（郵便番号・市区町村・番地・建物名）',
    html: `<form><div class="item"><div class="title">現住所</div><div class="body">
      <input name="a1" size="3" placeholder="郵便番号（前半）">-<input name="a2" size="4" placeholder="郵便番号（後半）">
      ${prefSelect('a3', 'aria-label="都道府県"')}
      <input name="a4" placeholder="市区町村"><input name="a5" placeholder="番地"><input name="a6" placeholder="建物名・部屋番号">
    </div></div></form>`,
    expect: ADDRESS,
  },
  {
    name: 'N-08 role=group の「連絡先」の中に、小見出しの div と携帯電話の3分割・メール',
    html: `<form><div role="group" aria-labelledby="g8"><div id="g8">連絡先</div>
      <div><div>携帯電話</div><div><input name="b1" size="4">-<input name="b2" size="4">-<input name="b3" size="4"></div></div>
      <div><div>メールアドレス</div><div><input name="b4"></div></div>
    </div></form>`,
    expect: { '[name=b1]': '090', '[name=b2]': '1234', '[name=b3]': '5678', '[name=b4]': 'taro@example.com' },
  },
  {
    name: 'N-09 role=group の「氏名」の中で、姓・名を包む span に aria-labelledby',
    html: `<form><div role="group" aria-labelledby="g9"><div id="g9">氏名</div>
      <span id="l1">姓</span><span aria-labelledby="l1"><input name="c1"></span>
      <span id="l2">名</span><span aria-labelledby="l2"><input name="c2"></span>
    </div>
    <div role="group" aria-labelledby="g10"><div id="g10">フリガナ</div>
      <span id="l3">セイ</span><span aria-labelledby="l3"><input name="c3"></span>
      <span id="l4">メイ</span><span aria-labelledby="l4"><input name="c4"></span>
    </div></form>`,
    expect: { '[name=c1]': '山田', '[name=c2]': '太郎', '[name=c3]': 'ヤマダ', '[name=c4]': 'タロウ' },
  },
  {
    name: 'N-10 欄を包む span の aria-labelledby が2つの id（大きな見出し＋小見出し）',
    html: `<form><div role="group" aria-labelledby="g11"><div id="g11">現住所</div>
      <span id="t11">郵便番号</span><span aria-labelledby="g11 t11"><input name="a1" aria-label="上3桁" size="3">-<input name="a2" aria-label="下4桁" size="4"></span>
      <span id="t14">市区町村</span><span aria-labelledby="g11 t14"><input name="a4"></span>
    </div></form>`,
    expect: { '[name=a1]': '150', '[name=a2]': '0041', '[name=a4]': '渋谷区' },
  },
  {
    name: 'N-11 「帰省先」の大きな見出しの中に、郵便番号・住所（帰省先は現住所と同じ）',
    html: `<form><div role="group" aria-labelledby="g12"><div id="g12">帰省先</div>
      <div><div>郵便番号</div><div><input name="k1" aria-label="上3桁" size="3">-<input name="k2" aria-label="下4桁" size="4"></div></div>
      <div><div>市区町村</div><div><input name="k4"></div></div>
    </div></form>`,
    expect: { '[name=k1]': '150', '[name=k2]': '0041', '[name=k4]': '渋谷区' },
  },
];
