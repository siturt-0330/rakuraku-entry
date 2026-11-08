import type { Case } from '../cases';

/**
 * 2026-11-08 にコードを読んで見つけた入力ミス（見出しの読み取り・項目の判定・値の書式・選択肢の選び方）。
 * テストのプロフィールは fixtures/profile.ts（山田 太郎・090-1234-5678・サンプル大学 経済学部・文系の学部生）。
 */

const sel = (name: string, opts: string[]) => `<select name="${name}"><option value="">選択してください</option>${opts.map((o) => `<option>${o}</option>`).join('')}</select>`;

export const CASES: Case[] = [
  // 見出しの読み取り
  {
    name: 'A-01 td だけの行「姓｜［ ］｜名｜［ ］」は、それぞれすぐ左のマスが見出し',
    html: `<form><table><tr><td>姓</td><td><input name="a1"></td><td>名</td><td><input name="a2"></td></tr></table></form>`,
    expect: { '[name=a1]': '山田', '[name=a2]': '太郎' },
  },
  {
    name: 'A-02 見出しの中の隠れたエラー文（電話番号の形式〜）を読まない',
    html: `<form><label for="g">メールアドレス<span style="display:none">電話番号の形式が正しくありません</span></label><input id="g" name="g"></form>`,
    expect: { '[name=g]': 'taro@example.com' },
  },
  {
    name: 'A-03 「placeholder」というクラスの箱の中の dl の見出しも読む',
    html: `<form><div class="placeholder-area"><dl><dt>電話番号</dt><dd><input name="t"></dd></dl></div></form>`,
    expect: { '[name=t]': '090-1234-5678' },
  },
  {
    name: 'A-04 入れ子の表：外の行見出し「氏名」の中に姓・名の欄だけの表',
    html: `<form><table><tr><th>氏名</th><td><div><table><tr><td><span><input name="n1"></span></td><td><span><input name="n2"></span></td></tr></table></div></td></tr></table></form>`,
    expect: { '[name=n1]': '山田', '[name=n2]': '太郎' },
  },
  // 項目の判定：本人以外・勤務先・学校
  {
    name: 'A-05 「父の氏名」「母の電話番号」に本人の情報を入れない',
    html: `<form><table><tr><th>父の氏名</th><td><input name="f"></td></tr><tr><th>母の電話番号</th><td><input name="m"></td></tr><tr><th>氏名</th><td><input name="me"></td></tr></table></form>`,
    expect: { '[name=f]': '', '[name=m]': '', '[name=me]': '山田　太郎' },
  },
  {
    name: 'A-06 「勤務先電話番号」「大学の電話番号」に本人の電話番号を入れない',
    html: `<form><table><tr><th>勤務先電話番号</th><td><input name="w"></td></tr><tr><th>大学の電話番号</th><td><input name="u"></td></tr><tr><th>電話番号</th><td><input name="p"></td></tr></table></form>`,
    expect: { '[name=w]': '', '[name=u]': '', '[name=p]': '090-1234-5678' },
  },
  {
    name: 'A-07 「最終学歴の学校名」は学校名（学校区分の「大学」ではない）',
    html: `<form><table><tr><th>最終学歴の学校名</th><td><input name="s"></td></tr></table></form>`,
    expect: { '[name=s]': 'サンプル大学' },
  },
  {
    name: 'A-08 「個人のメールアドレス」はふつうのメールアドレス',
    html: `<form><table><tr><th>個人のメールアドレス</th><td><input name="e"></td></tr></table></form>`,
    expect: { '[name=e]': 'taro@example.com' },
  },
  // 選択肢の選び方
  {
    name: 'A-09 番号付きの学部の選択肢：「経済学部」を「国際経済学部」と取り違えない',
    html: `<form><table><tr><th>学部</th><td>${sel('f', ['A 国際経済学部', 'B 経済学部'])}</td></tr></table></form>`,
    expect: { '[name=f]': 'B 経済学部' },
  },
  {
    name: 'A-10 学校区分「大学」は「短期大学」ではなく「四年制大学」',
    html: `<form><table><tr><th>学校区分</th><td>${sel('k', ['短期大学', '四年制大学（学部）', '大学院'])}</td></tr></table></form>`,
    expect: { '[name=k]': '四年制大学（学部）' },
  },
  // 条件付きの欄
  {
    name: 'A-11 「学部生・大学院生のみ対象」の区切りは、学部生にも入れる',
    html: `<form><h3>在籍校</h3><p>※学部生・大学院生のみ対象</p><table><tr><th>学校名</th><td><input name="s"></td></tr></table></form>`,
    expect: { '[name=s]': 'サンプル大学' },
  },
  {
    name: 'A-12 「理系だけでなく文系も歓迎」の欄は、文系の人にも入れる',
    html: `<form><table><tr><th>学部</th><td><p>理系だけでなく文系も歓迎です</p><input name="f"></td></tr></table></form>`,
    expect: { '[name=f]': '経済学部' },
  },
  // 値の書式
  {
    name: 'A-13 国際形式で保存した電話番号（+81 90-…）を 3 つの欄に分ける',
    html: `<form><table><tr><th>電話番号</th><td><input name="p1" maxlength="4">-<input name="p2" maxlength="4">-<input name="p3" maxlength="4"></td></tr></table></form>`,
    profile: { phone: '+81 90-1234-5678' },
    expect: { '[name=p1]': '090', '[name=p2]': '1234', '[name=p3]': '5678' },
  },
  {
    name: 'A-14 年月の欄の入力例が「2022-04」なら、ハイフンで入れる',
    html: `<form><table><tr><th>入学年月</th><td><input name="a" placeholder="2022-04"></td></tr></table></form>`,
    expect: { '[name=a]': '2022-04' },
  },
];
