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
  // キャンパス名・学科系統（2026-11-08 に本人の画面から）
  {
    name: 'A-15 設問「大学のキャンパス名（キャンパスの文言は不要）」：最寄り駅の話があっても駅ではなくキャンパス名',
    html: `<form><table><tr><th>設問 6</th><td><p>大学のキャンパス名を記入してください。</p><p>キャンパス名のみ記載ください。（キャンパスの文言は不要）</p><p>例）住友大学　淀屋橋キャンパスの場合→淀屋橋</p><p>※キャンパス名が無い場合、最寄り駅「○○駅」と記載してください。</p><input name="c"></td></tr></table></form>`,
    profile: { campus: '本郷キャンパス' },
    expect: { '[name=c]': '本郷' },
  },
  {
    name: 'A-16 学科系統が空なら、学科（経済学科）から選ぶ',
    html: `<form><table><tr><th>学科系統</th><td>${sel('fc', ['人文・教養・総合科学系', '社会科学系', '理学系', '工学系'])}</td></tr></table></form>`,
    expect: { '[name=fc]': '社会科学系' },
  },
  {
    name: 'A-17 学科系統：理工学部 機械工学科は工学系',
    html: `<form><table><tr><th>学科系統</th><td>${sel('fc', ['人文科学系', '社会科学系', '理学系', '工学系'])}</td></tr></table></form>`,
    profile: { faculty: '理工学部', department: '機械工学科' },
    expect: { '[name=fc]': '工学系' },
  },
  {
    name: 'A-18 学校検索（i-webs）：頭文字を入れて「学校検索」を押し、出てきた一覧から学校・学部・学科・学科系統を順に選ぶ',
    html: `<form><table>
      <tr><th>学校名の頭文字</th><td><p>（全角カタカナ１文字＜濁点含む＞、日本国外の場合は空欄）</p><input name="init" maxlength="1" size="3"> <input type="button" name="search" value="学校検索"></td></tr>
      <tr><th>学校</th><td><p>リストに学校が表示されない場合は（リストにない学校）を選択してください。</p><select name="sch" size="8"><option value="">（選択してください）</option></select></td></tr>
      <tr><th>学部</th><td><select name="fac"><option value="">（選択してください）</option></select></td></tr>
      <tr><th>学科</th><td><select name="dep"><option value="">（選択してください）</option></select></td></tr>
      <tr><th>学科系統</th><td>${sel('fc', ['人文・教養・総合科学系', '社会科学系', '理学系', '工学系'])} <input type="button" value="学科から自動選択"></td></tr>
    </table></form>`,
    setup(root) {
      const $ = <T extends HTMLElement>(q: string) => root.querySelector<T>(q)!;
      const fill = (name: string, list: string[]) => {
        $<HTMLSelectElement>(`[name=${name}]`).innerHTML = ['（選択してください）', ...list].map((t, i) => `<option value="${i ? t : ''}">${t}</option>`).join('');
      };
      // 頭文字が「サ」のときだけ学校が出る。選ぶと学部、学部を選ぶと学科の選択肢が少し遅れて入る（サーバーに聞く）
      $('[name=search]').addEventListener('click', () =>
        setTimeout(() => fill('sch', $<HTMLInputElement>('[name=init]').value === 'サ' ? ['サンプル大学', 'サンプル工業大学', '（リストにない学校）'] : ['（リストにない学校）']), 200),
      );
      $('[name=sch]').addEventListener('change', () => setTimeout(() => fill('fac', ['国際経済学部', '経済学部', '工学部']), 200));
      $('[name=fac]').addEventListener('change', () => setTimeout(() => fill('dep', ['経済学科', '経営学科']), 200));
    },
    expect: { '[name=init]': 'サ', '[name=sch]': 'サンプル大学', '[name=fac]': '経済学部', '[name=dep]': '経済学科', '[name=fc]': '社会科学系' },
  },
  // 指導教官の職位・研究テーマの「未定」（2026-11-08 に本人の画面から）
  {
    name: 'A-19 「指導教官の職位について選択」：准教授',
    html: `<form><table><tr><th>設問 3</th><td><p>指導教官の職位について選択してください。</p><p>※ゼミ・研究室の該当が無い場合は、「無」を選択してください。</p>${sel('t', ['教授', '准教授', '助教', '講師', 'その他', '無'])}</td></tr></table></form>`,
    profile: { lab: '山本ゼミ', advisor: '山本 一郎', advisorTitle: '准教授' },
    expect: { '[name=t]': '准教授' },
  },
  {
    name: 'A-20 「指導教官の職位」：ゼミ・研究室がない人は「無」',
    html: `<form><table><tr><th>設問 3</th><td><p>指導教官の職位について選択してください。</p><p>※ゼミ・研究室の該当が無い場合は、「無」を選択してください。</p>${sel('t', ['教授', '准教授', '助教', '講師', 'その他', '無'])}</td></tr></table></form>`,
    profile: { lab: '', advisor: '', advisorTitle: '' },
    expect: { '[name=t]': '無' },
  },
  {
    name: 'A-21 研究テーマが決まっていない人は「未定」',
    html: `<form><table><tr><th>設問 4</th><td><p>研究テーマを記入してください。</p><p>※決まっていない場合は「未定」とご記入ください。</p><input name="r"></td></tr></table></form>`,
    profile: { researchTheme: '' },
    expect: { '[name=r]': '未定' },
  },
  // 学年・TOEIC のリスニングとリーディング・TOEFL の有無（2026-11-09 に本人の画面から）
  (() => {
    // 今日が何年度でも 3 年生になる入学年月
    const t = new Date();
    const fy = t.getMonth() + 1 >= 4 ? t.getFullYear() : t.getFullYear() - 1;
    return {
      name: 'A-22 「現在の学年を選択してください」：入学年月から数えて学部3年',
      html: `<form><table><tr><th>設問 4</th><td><p>現在の学年を選択してください。</p>${sel('g', ['学部1年', '学部2年', '学部3年', '学部4年', '修士1年', '修士2年', 'その他'])}</td></tr></table></form>`,
      profile: { admission: `${fy - 2}-04` },
      expect: { '[name=g]': '学部3年' },
    } as Case;
  })(),
  {
    name: 'A-23 TOEIC：合計・リスニング・リーディングを別々に入れ、TOEFL は取得していない',
    html: `<form><table><tr><th>設問 5</th><td>
      <p>TOEICスコアを取得していますか？</p>${sel('has', ['取得している', '取得していない'])}
      <p>最新のTOEICスコアを入力してください。</p><input name="total">
      <p>最新のTOEICスコア（リスニング）を入力してください。</p><input name="l">
      <p>最新のTOEICスコア（リーディング）を入力してください。</p><input name="r">
      <p>TOEFLスコアを取得していますか？</p>${sel('toefl', ['取得している', '取得していない'])}
    </td></tr></table></form>`,
    profile: { toeic: '675', toeicListening: '360', toeicReading: '315', toefl: '' },
    expect: { '[name=has]': '取得している', '[name=total]': '675', '[name=l]': '360', '[name=r]': '315', '[name=toefl]': '取得していない' },
  },
  {
    name: 'A-24 TOEIC のリスニング・リーディングが空なら、合計を入れない',
    html: `<form><table><tr><th>TOEICスコア（リスニング）</th><td><input name="l"></td></tr><tr><th>TOEICスコア（リーディング）</th><td><input name="r"></td></tr></table></form>`,
    profile: { toeic: '675' },
    expect: { '[name=l]': '', '[name=r]': '' },
  },
];
