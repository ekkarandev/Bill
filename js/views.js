// หน้าจอทั้งหมดของแอป
import {
  $, h, ico, svg, S, nav, SYM, MN, MS, COL, DEF_RATE, EMO, WDN, rate, past, syncRates,
  TD, iso, prs, addD, daysTo, dstr, fdate, dayTxt, occ, nxt, thb, mon, cyl, remList, remOf, remTxt,
  money, price, subtxt, bdg, acc, payTxt, catOf,
  toast, persist, saveSub, removeSub, batchOps, newId, applyTheme, sheet, closeSheet, ask, fld, remChips,
} from "./core.js";
import { newAcct } from "./form.js";
import { setLang } from "./i18n.js";

/* ───────── ชิ้นส่วนที่ใช้ซ้ำ ───────── */
export function logo(s) {
  const l = h("div", "lg", s.logo ? null : (s.name || "?")[0].toUpperCase());
  l.style.background = s.logo ? "transparent" : s.color || COL[0];
  if (s.logo && String(s.logo).startsWith("data:image/")) { const i = new Image(); i.src = s.logo; i.alt = ""; l.append(i); }
  return l;
}
function rowFor(s, right, sub, onclick) {
  const r = h(onclick ? "button" : "div", "row" + (s.paused ? " off" : ""), null, [
    logo(s), h("div", "rt", null, [h("div", "nm", s.name), h("div", "sb", sub || subtxt(s))]), right,
  ]);
  if (onclick) { r.type = "button"; r.onclick = onclick; }
  return r;
}
const amt = (s, d) => h("div", "am", money(thb(s, d)));
function nextChip(s) {
  if (s.paused) return h("span", "chip", "หยุดชั่วคราว");
  const d = nxt(s);
  if (!d) return h("span", "chip", "สิ้นสุดแล้ว");
  const n = daysTo(d), r = remOf(s);
  return h("span", "chip" + (r >= 0 && n <= r ? " soon" : ""), n === 0 ? "ตัดวันนี้" : "ตัดอีก " + n + " วัน");
}
const head = (title, kicker, action) =>
  h("header", "hd", null, [h("div", null, null, [kicker ? h("p", "hello", kicker) : null, h("h1", null, title)]), action]);
const addBtn = () => {
  const b = h("button", "dk", null, [ico("plus", 18), " เพิ่ม"]);
  b.type = "button";
  b.onclick = () => nav.openForm();
  return b;
};
const btn = (cls, text, fn, icon) => {
  const b = h("button", cls, null, [icon ? ico(icon, 18) : null, text]);
  b.type = "button";
  b.onclick = fn;
  return b;
};

/* ───────── รายละเอียดรายการ ───────── */
// หยุดชั่วคราว: จำวันที่หยุดไว้ ประวัติก่อนหน้านั้นยังอยู่ / เปิดใช้ต่อ: ช่วงที่หยุดไม่นับว่าจ่าย
function togglePause(s) {
  if (s.paused) {
    const gap = s.pausedAt ? occ({ ...s, paused: false, pausedAt: "" }, prs(s.pausedAt), addD(TD, -1)).map(iso) : [];
    saveSub({ ...s, paused: false, pausedAt: "", skip: [...(s.skip || []), ...gap] });
  } else saveSub({ ...s, paused: true, pausedAt: iso(TD) });
}
export function showDetail(s) {
  const nd = nxt(s), c = catOf(s.cat), a = acc(s.pay), live = { ...s, paused: false };
  const rows = [];
  const add = (k, v) => { if (v) rows.push(h("div", "fact", null, [h("dt", null, k), h("dd", null, v)])); };
  add("ตัดครั้งถัดไป", s.paused ? "หยุดชั่วคราว" : nd ? fdate(iso(nd)) + " · " + dayTxt(daysTo(nd)) : "สิ้นสุดแล้ว");
  add("ยอดต่อรอบ", price(s) + " / " + cyl(s) + (s.cur !== S.cur ? " ≈ " + money(thb(s)) : ""));
  add("เฉลี่ยต่อเดือน", money(mon(live)));
  add("ต่อปี", money(mon(live) * 12));
  const pd = past(s);
  add("จ่ายไปแล้ว", pd.length ? pd.length + " ครั้ง · " + money(pd.reduce((x, d) => x + thb(s, d), 0)) : "");
  add("หมวดหมู่", c.e + " " + c.n);
  add("ช่องทางหักเงิน", a ? payTxt(a) : "");
  add("ช่วงทดลองใช้ฟรี", s.trial ? "ถึง " + fdate(s.trial) : "");
  add("หารกับคนอื่น", (s.ppl || []).length ? (s.ppl.length + 1) + " คน · ส่วนของคุณ " + money(thb(s)) : "");
  add("วันสิ้นสุด", s.end ? "ครั้งสุดท้าย " + fdate(s.end) : "");
  add("เตือนล่วงหน้า", remTxt(remList(s)));
  add("โน้ต", s.note);
  const top = h("div", "dt-top", null, [logo(s), h("div", null, null, [h("div", "nm", s.name), h("div", "sb", subtxt(s))])]);
  const act = h("div", "dt-act", null, [
    btn("btn", "แก้ไข", () => { closeSheet(); nav.openForm(s); }, "edit"),
    btn("btn ghost", s.paused ? "เปิดใช้ต่อ" : "หยุดชั่วคราว", () => { closeSheet(); togglePause(s); toast(s.paused ? "เปิดใช้ " + s.name + " ต่อแล้ว" : "หยุด " + s.name + " ชั่วคราวแล้ว"); }, s.paused ? "play" : "pause"),
    btn("btn ghost danger-t", "ลบรายการ", () => ask("ลบ " + s.name + "?", "รายการนี้จะถูกลบถาวร", "ลบรายการ", () => { removeSub(s.id); toast("ลบ " + s.name + " แล้ว"); }), "trash"),
  ]);
  sheet("รายละเอียดรายการ", h("div", null, null, [top, h("dl", "facts", null, rows), act]));
}

/* ───────── ภาพรวม ───────── */
// การ์ดวันที่ตัวใหญ่ บนสุดของหน้าภาพรวม พร้อมทางลัดไปประวัติ
function heroCard() {
  const A = new Date(TD.getFullYear(), TD.getMonth(), 1);
  const paid = S.subs.reduce((x, s) => x + occ(s, A, addD(TD, -1)).reduce((y, d) => y + thb(s, d), 0), 0);
  const nx = S.subs.filter(s => !s.paused && nxt(s)).map(s => [s, nxt(s)]).sort((p, q) => p[1] - q[1])[0];
  const kids = [h("div", "hero-top", null, [
    h("div", "hero-d", null, [h("b", null, TD.getDate())]),
    h("div", "hero-t", null, [h("span", null, WDN[TD.getDay()]), h("strong", null, MN[TD.getMonth()] + " " + TD.getFullYear())]),
  ])];
  if (S.subs.length) {
    const hb = h("button", "hero-b", null, [h("small", null, "จ่ายแล้วเดือนนี้"), h("b", null, money(paid)), ico("chevR", 16)]);
    hb.type = "button"; hb.onclick = () => nav.go("his");
    kids.push(h("div", "hero-row", null, [
      nx ? h("div", null, null, [h("small", null, "ตัดเงินถัดไป"), h("b", null, nx[0].name + " · " + dayTxt(daysTo(nx[1])))]) : null, hb,
    ]));
  }
  return h("section", "hero", null, kids);
}
export function renderHome() {
  const v = $("v-home");
  v.textContent = "";
  const first = ((S.user && S.user.name) || "").split(" ")[0];
  v.append(head("ภาพรวม", "สวัสดี" + (first ? " " + first : ""), addBtn()), heroCard());
  if (!S.subs.length) {
    v.append(h("div", "card empty-card", null, [
      h("div", "empty-ic", null, [ico("calendar", 34)]),
      h("h2", null, "เริ่มจดรายการแรก"),
      h("p", "mut", "เพิ่ม subscription ที่ตัดเงินอัตโนมัติ แล้วแอปจะรวมยอดรายเดือนรายปี และบอกก่อนถึงวันตัดเงิน"),
      btn("btn", "เพิ่มรายการแรก", () => nav.openForm(), "plus"),
      btn("btn ghost", "ลองเพิ่มข้อมูลตัวอย่าง", addSamples),
    ]));
    return;
  }
  const A = new Date(TD.getFullYear(), TD.getMonth(), 1), Bm = new Date(TD.getFullYear(), TD.getMonth() + 1, 0);
  const mt = s => occ(s, A, Bm).reduce((x, d) => x + thb(s, d), 0);
  const act = S.subs.filter(s => !s.paused && nxt(s));

  // เตือนล่วงหน้า
  const soon = act.map(s => [s, nxt(s)]).filter(([s, d]) => { const r = remOf(s); return r >= 0 && daysTo(d) <= r; }).sort((p, q) => p[1] - q[1]);
  if (soon.length) {
    const c = h("section", "alert", null, [h("div", "al-h", null, [ico("bell", 18), h("b", null, "ใกล้ตัดเงินแล้ว")])]);
    soon.slice(0, 4).forEach(([s, d]) => {
      const r = h("button", "al-r", null, [h("span", "nm", s.name), h("span", "mut", dayTxt(daysTo(d))), h("b", null, money(thb(s, d)))]);
      r.type = "button"; r.onclick = () => showDetail(s); c.append(r);
    });
    v.append(c);
  }

  // การ์ดช่องทางหักเงิน
  if (S.accts.length) {
    const row = h("div", "cards");
    S.accts.forEach(c => {
      const L = S.subs.filter(s => s.pay === c.id), bd = h("div", "bdg", bdg(c.type));
      bd.style.color = c.color;
      const k = h("div", "pcard", null, [
        h("div", "pt2", null, [h("div", null, null, [h("b", null, c.name), h("small", null, c.type)]), bd]),
        h("div", "dots", "•••• •••• •••• " + (c.last4 || "••••")),
        h("div", "pf", null, [h("div", null, null, [h("small", null, "หักเดือนนี้"), h("b", null, money(L.reduce((x, s) => x + mt(s), 0)))]), h("small", null, L.reduce((x, s) => x + occ(s, A, Bm).length, 0) + " รายการ")]),
      ]);
      k.style.backgroundColor = c.color;
      k.style.background = "linear-gradient(135deg," + c.color + ",color-mix(in srgb," + c.color + " 55%,#fff))";
      row.append(k);
    });
    v.append(row);
  }

  // การ์ดสรุป
  const mo = S.subs.reduce((x, s) => x + mon(s), 0);
  const st = (c, t, val, sub) => h("div", "st4 " + c, null, [h("div", null, t), h("b", null, val), h("small", null, sub)]);
  v.append(h("div", "grid4", null, [
    st("s1", "ต้องจ่ายเดือนนี้", money(S.subs.reduce((x, s) => x + mt(s), 0)), "นับตามวันตัดจริง"),
    st("s3", "เฉลี่ยต่อเดือน", money(mo), "รวมรายปีหารเฉลี่ยแล้ว"),
    st("s2", "รวมต่อปี", money(mo * 12), "ประมาณการทั้งปี"),
    st("s4", "รายการที่ใช้อยู่", act.length, "ไม่นับที่หยุดชั่วคราว"),
  ]));

  // ตัดเงินถัดไป + แยกตามหมวด
  const cols = h("div", "cols");
  const nextCard = h("section", "card", null, [h("h2", "ct", "ตัดเงินถัดไป")]);
  const up = act.map(s => [s, nxt(s)]).sort((p, q) => p[1] - q[1]).slice(0, 6);
  up.forEach(([s, d]) => nextCard.append(rowFor(s, h("div", "am", money(thb(s, d))), dayTxt(daysTo(d)), () => showDetail(s))));
  cols.append(nextCard);
  const by = {};
  act.forEach(s => { const k = s.cat || "อื่นๆ"; by[k] = (by[k] || 0) + mon(s); });
  const rows = Object.entries(by).sort((p, q) => q[1] - p[1]), tot = rows.reduce((x, r) => x + r[1], 0) || 1;
  if (rows.length) {
    const cc = h("section", "card", null, [h("h2", "ct", "ค่าใช้จ่ายต่อเดือนตามหมวด")]);
    rows.forEach(([k, x]) => {
      const i = h("i");
      i.style.width = Math.max(4, x / tot * 100) + "%";
      cc.append(h("div", "bar", null, [h("div", "bar-t", null, [h("span", null, catOf(k).e + " " + k), h("b", null, money(x))]), h("div", "bar-b", null, [i])]));
    });
    cols.append(cc);
  }
  v.append(cols);

  // ช่วงทดลองใช้ฟรี
  S.subs.filter(s => !s.paused && s.trial && prs(s.trial) >= TD).sort((p, q) => (p.trial < q.trial ? -1 : 1)).slice(0, 2).forEach(s => {
    const p = h("button", "promo", null, [
      h("div", null, null, [h("small", null, "ช่วงทดลองใช้ฟรี"), h("b", null, s.name), h("span", null, "เริ่มหัก " + price(s) + " ถ้าไม่ยกเลิก")]),
      h("div", "dn", null, [h("b", null, daysTo(prs(s.trial))), h("small", null, "วันที่เหลือ")]),
    ]);
    p.type = "button"; p.onclick = () => showDetail(s);
    v.append(p);
  });
}

export function addSamples() {
  const m = d => iso(new Date(TD.getFullYear(), TD.getMonth() - 1, TD.getDate() + d)), t = iso(addD(TD, 7));
  const base = { plan: "", site: "", logo: "", cy: "m", k: 1, u: "m", cur: "THB", cat: "บันเทิง", pay: "", trial: "", ppl: [], end: "", endN: 0, rem: null, note: "", paused: false };
  const a = { id: "a" + Date.now().toString(36), type: "Visa", name: "KBank Visa", last4: "4529", color: "#1e3a8a" };
  const list = [
    { name: "Netflix", plan: "Premium", price: 419, first: m(2), color: COL[4], pay: a.id, ppl: ["บอส", "ฟ้า", "เมย์"].map(n => ({ name: n, amt: 104.75, until: "" })) },
    { name: "Spotify", price: 149, first: m(9), color: COL[2], cat: "เพลง", pay: a.id },
    { name: "Figma", price: 15, cur: "USD", first: m(5), color: COL[0], cat: "งาน/ซอฟต์แวร์", pay: a.id },
    { name: "Disney+", price: 199, first: t, trial: t, color: COL[1], pay: a.id },
    { name: "โดเมนเว็บไซต์", price: 600, cy: "y", u: "y", first: m(40).replace(/^\d{4}/, String(TD.getFullYear() - 1)), color: COL[3], cat: "งาน/ซอฟต์แวร์" },
  ].map(x => ({ ...base, start: x.first, ...x, id: newId(), createdAt: Date.now() }));
  S.accts = [...S.accts, a];
  persist();
  batchOps(list.map(set => ({ set })));
  toast("เพิ่มข้อมูลตัวอย่างแล้ว ลบได้ภายหลัง");
}

/* ───────── รายการทั้งหมด ───────── */
let lt = "all", lq = "", lc = "", ls = "next";
export function renderList() {
  const v = $("v-list");
  v.textContent = "";
  v.append(head("รายการทั้งหมด", S.subs.length + " รายการ", addBtn()));
  const cnt = k => S.subs.filter(s => k === "all" || s.cy === k).length, body = h("div", "card list-card"), seg = h("div", "seg");
  const draw = () => {
    body.textContent = "";
    const q = lq.trim().toLowerCase(), nx = s => { const d = nxt(s); return d ? +d : 9e15; };
    const L = S.subs.filter(s => (lt === "all" || s.cy === lt) && (!lc || s.cat === lc) && (!q || (s.name + " " + (s.plan || "")).toLowerCase().includes(q)));
    L.sort(ls === "price" ? (x, y) => mon({ ...y, paused: false }) - mon({ ...x, paused: false }) : ls === "name" ? (x, y) => x.name.localeCompare(y.name, "th") : (x, y) => nx(x) - nx(y));
    if (!L.length) body.append(h("p", "empty", S.subs.length ? "ไม่พบรายการ ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "ยังไม่มีรายการ กดปุ่ม เพิ่ม เพื่อเริ่มจด"));
    L.forEach(s => body.append(rowFor(s, h("div", "rr", null, [amt(s), nextChip(s)]), null, () => showDetail(s))));
  };
  [["all", "ทั้งหมด"], ["m", "รายเดือน"], ["y", "รายปี"], ["c", "อื่นๆ"]].forEach(([k, t]) => {
    const b = h("button", null, t + " " + cnt(k));
    b.type = "button"; b.setAttribute("aria-pressed", lt === k);
    b.onclick = () => { lt = k; renderList(); };
    seg.append(b);
  });
  const q = h("input"), fc = h("select"), fs = h("select");
  q.type = "search"; q.placeholder = "ค้นหา..."; q.value = lq; q.setAttribute("aria-label", "ค้นหา");
  q.oninput = () => { lq = q.value; draw(); };
  fc.setAttribute("aria-label", "กรองหมวดหมู่"); fs.setAttribute("aria-label", "เรียงลำดับ");
  fc.append(new Option("ทุกหมวด", ""));
  S.cats.forEach(c => fc.append(new Option(c.e + " " + c.n, c.n)));
  fc.value = lc; fc.onchange = () => { lc = fc.value; draw(); };
  [["next", "ใกล้ตัดเงิน"], ["price", "ราคาสูงสุด"], ["name", "ชื่อ ก-ฮ"]].forEach(o => fs.append(new Option(o[1], o[0])));
  fs.value = ls; fs.onchange = () => { ls = fs.value; draw(); };
  v.append(h("div", "card fc", null, [seg, q, h("div", "fl", null, [fc, fs])]), body);
  draw();
}

/* ───────── ปฏิทิน ───────── */
let cY = TD.getFullYear(), cM = TD.getMonth(), sel = null;
export function renderCal() {
  const v = $("v-cal");
  v.textContent = "";
  v.append(head("ปฏิทิน", "วันตัดเงินของทุกรายการในเดือนนี้", null));
  const pv = h("button", null, null, [ico("chevL", 22)]), nx = h("button", null, null, [ico("chevR", 22)]);
  pv.type = nx.type = "button";
  pv.setAttribute("aria-label", "เดือนก่อน"); nx.setAttribute("aria-label", "เดือนถัดไป");
  pv.onclick = () => { if (--cM < 0) { cM = 11; cY--; } sel = null; renderCal(); };
  nx.onclick = () => { if (++cM > 11) { cM = 0; cY++; } sel = null; renderCal(); };
  v.append(h("div", "mn", null, [pv, h("b", null, MN[cM] + " " + cY), nx]));
  const a = new Date(cY, cM, 1), b = new Date(cY, cM + 1, 0), M = {}, T = {}, ev = [];
  S.subs.forEach(s => {
    occ(s, a, b).forEach(d => { const k = iso(d); (M[k] = M[k] || []).push(s); ev.push([d, s]); });
    if (!s.paused && s.trial && s.trial >= iso(a) && s.trial <= iso(b)) (T[s.trial] = T[s.trial] || []).push(s);
  });
  const tot = ev.reduce((x, e) => x + thb(e[1], e[0]), 0);
  let hv = null, hs = 0;
  for (const k in M) { const t = M[k].reduce((x, s) => x + thb(s, prs(k)), 0); if (t > hs) { hs = t; hv = k; } }
  v.append(h("div", "sum", null, [
    h("div", "s1", null, [h("small", null, "รวมเดือนนี้"), h("b", null, money(tot))]),
    h("div", "s2", null, [h("small", null, "ตัดเงิน"), h("b", null, ev.length + " ครั้ง")]),
    h("div", "s3", null, [h("small", null, "วันที่หนักสุด"), h("b", null, hv ? dstr(prs(hv)) : "—")]),
  ]));
  const g = h("div", "card cal");
  ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].forEach(t => g.append(h("div", "wd", t)));
  const sd = a.getDay(), n = Math.ceil((sd + b.getDate()) / 7) * 7;
  for (let i = 0; i < n; i++) {
    const d = new Date(cY, cM, 1 - sd + i), k = iso(d), inM = d.getMonth() === cM;
    const c = h("button", "dy" + (inM ? "" : " out") + (k === iso(TD) ? " today" : "") + (k === sel ? " sel" : "") + (T[k] ? " tr" : ""), null, [h("span", null, d.getDate()), h("i", M[k] ? "dt" : "")]);
    c.type = "button";
    c.setAttribute("aria-label", d.getDate() + " " + MN[d.getMonth()] + (M[k] ? " มี " + M[k].length + " รายการ" : ""));
    c.onclick = () => { sel = sel === k ? null : k; if (!inM) { cY = d.getFullYear(); cM = d.getMonth(); } renderCal(); };
    g.append(c);
  }
  g.append(h("p", "hint", "แตะวันเพื่อดูรายการ · วงส้ม = วันหมดช่วงทดลอง"));
  v.append(g);
  const rows = [];
  if (sel) {
    v.append(h("h2", "ct2", "รายการวันที่ " + dstr(prs(sel))));
    (M[sel] || []).forEach(s => rows.push(rowFor(s, amt(s, prs(sel)), null, () => showDetail(s))));
    (T[sel] || []).forEach(s => rows.push(rowFor(s, h("span", "chip soon", "หมดช่วงทดลอง"), "หมดช่วงทดลองใช้ฟรี", () => showDetail(s))));
  } else {
    v.append(h("h2", "ct2", "รายการเดือน" + MN[cM]));
    ev.sort((x, y) => x[0] - y[0]).forEach(e => rows.push(rowFor(e[1], amt(e[1], e[0]), dstr(e[0]) + " · " + subtxt(e[1]), () => showDetail(e[1]))));
  }
  const c = h("div", "card");
  if (rows.length) rows.forEach(r => c.append(r)); else c.append(h("p", "empty", sel ? "ไม่มีรายการในวันนี้" : "เดือนนี้ยังไม่มีรายการตัดเงิน"));
  v.append(c);
}

/* ───────── ประวัติการจ่าย + กราฟสรุป ───────── */
let hv = "list", hn = 3, hY = TD.getFullYear(), hM = TD.getMonth();
const DC = ["#6c5ce7", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#64748b"];
const short = x => { const n = x / rate(S.cur); return SYM[S.cur] + (n >= 1e4 ? Math.round(n / 1e3) + "k" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : Math.round(n)); };
const monthSum = (y, m) => { const a = new Date(y, m, 1), b = new Date(y, m + 1, 0); return S.subs.reduce((x, s) => x + occ(s, a, b).reduce((z, d) => z + thb(s, d), 0), 0); };

function histRow(d, s) {
  const del = h("button", "x", null, [ico("trash", 18)]);
  del.type = "button"; del.setAttribute("aria-label", "ลบรายการนี้ออกจากประวัติ");
  del.onclick = e => {
    e.stopPropagation();
    ask("ลบรายการที่จ่ายแล้ว?", s.name + " วันที่ " + fdate(iso(d)) + " จะถูกลบออกจากประวัติและยอดรวมของเดือนนั้น ตัวรายการยังอยู่ตามเดิม", "ลบ", () => {
      saveSub({ ...s, skip: [...(s.skip || []), iso(d)] });
      toast("ลบออกจากประวัติแล้ว");
    });
  };
  const r = h("div", "row hrow", null, [
    h("div", "dbox", null, [h("b", null, d.getDate()), h("small", null, MS[d.getMonth()])]),
    h("div", "rt", null, [h("div", "nm", s.name), h("div", "sb", subtxt(s))]), h("div", "am", money(thb(s, d))), del,
  ]);
  r.onclick = () => showDetail(s);
  return r;
}
function histList(v) {
  const L = [];
  S.subs.forEach(s => past(s).forEach(d => L.push([d, s])));
  L.sort((p, q) => q[0] - p[0] || p[1].name.localeCompare(q[1].name));
  if (!L.length) {
    v.append(h("div", "card empty-card", null, [h("div", "empty-ic", null, [ico("history", 34)]), h("h2", null, "ยังไม่มีประวัติการจ่าย"),
      h("p", "mut", "เมื่อรายการผ่านวันตัดเงินไปแล้ว จะมาอยู่ที่นี่อัตโนมัติ ดูย้อนหลังได้ และลบออกได้ถ้าไม่ได้ตัดจริง")]));
    return;
  }
  v.append(h("div", "sum", null, [
    h("div", "s1", null, [h("small", null, "จ่ายไปแล้วรวม"), h("b", null, money(L.reduce((x, e) => x + thb(e[1], e[0]), 0)))]),
    h("div", "s2", null, [h("small", null, "ตัดเงิน"), h("b", null, L.length + " ครั้ง")]),
    h("div", "s3", null, [h("small", null, "ล่าสุด"), h("b", null, dstr(L[0][0]))]),
  ]));
  const G = new Map();
  L.forEach(e => { const k = e[0].getFullYear() * 12 + e[0].getMonth(); if (!G.has(k)) G.set(k, []); G.get(k).push(e); });
  const keys = [...G.keys()];
  keys.slice(0, hn).forEach(k => {
    const g = G.get(k), c = h("div", "card list-card");
    v.append(h("div", "mh", null, [h("h2", null, MN[k % 12] + " " + Math.floor(k / 12)), h("span", null, money(g.reduce((x, e) => x + thb(e[1], e[0]), 0)) + " · " + g.length + " ครั้ง")]));
    g.forEach(e => c.append(histRow(e[0], e[1])));
    v.append(c);
  });
  if (keys.length > hn) v.append(btn("btn ghost", "ดูเดือนก่อนหน้า", () => { hn += 3; renderHistory(); }));
}
function histCharts(v) {
  const pv = h("button", null, null, [ico("chevL", 22)]), nx = h("button", null, null, [ico("chevR", 22)]);
  pv.type = nx.type = "button";
  pv.setAttribute("aria-label", "เดือนก่อน"); nx.setAttribute("aria-label", "เดือนถัดไป");
  pv.onclick = () => { if (--hM < 0) { hM = 11; hY--; } renderHistory(); };
  nx.onclick = () => { if (++hM > 11) { hM = 0; hY++; } renderHistory(); };
  v.append(h("div", "mn", null, [pv, h("b", null, MN[hM] + " " + hY), nx]));

  const a = new Date(hY, hM, 1), b = new Date(hY, hM + 1, 0), by = {};
  S.subs.forEach(s => { const x = occ(s, a, b).reduce((z, d) => z + thb(s, d), 0), k = s.cat || "อื่นๆ"; if (x) by[k] = (by[k] || 0) + x; });
  const rows = Object.entries(by).sort((p, q) => q[1] - p[1]), tot = rows.reduce((x, r) => x + r[1], 0);
  const c1 = h("section", "card", null, [h("h2", "ct", "ค่าใช้จ่ายตามหมวด")]);
  if (!tot) c1.append(h("p", "empty", "เดือนนี้ยังไม่มีรายการตัดเงิน"));
  else {
    let acc = 0;
    const segs = rows.map(([, x], i) => { const p = x / tot * 100, o = 25 - acc; acc += p; return `<circle r="15.9155" cx="21" cy="21" fill="none" stroke="${DC[i % DC.length]}" stroke-width="6" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${o}"/>`; }).join("");
    const dn = h("div");
    dn.innerHTML = `<svg class="donut" viewBox="0 0 42 42" aria-hidden="true"><circle r="15.9155" cx="21" cy="21" fill="none" stroke="var(--fld)" stroke-width="6"/>${segs}<text x="21" y="23" text-anchor="middle">${short(tot)}</text></svg>`;
    const lg = h("div", "legend");
    rows.forEach(([k, x], i) => {
      const dot = h("i"); dot.style.background = DC[i % DC.length];
      lg.append(h("div", "lgd", null, [dot, h("span", null, catOf(k).e + " " + k), h("b", null, money(x)), h("small", "mut", Math.round(x / tot * 100) + "%")]));
    });
    c1.append(h("div", "donut-w", null, [dn, lg]));
  }
  v.append(c1);

  const N = 6, T = [];
  for (let i = N - 1; i >= 0; i--) { const m = new Date(hY, hM - i, 1); T.push([m, monthSum(m.getFullYear(), m.getMonth())]); }
  const mx = Math.max(...T.map(t => t[1]), 1), W = 320, bw = 36, gp = (W - N * bw) / (N + 1);
  const bars = T.map(([m, t], i) => {
    const bh = Math.max(3, t / mx * 110), x = gp + i * (bw + gp), y = 130 - bh;
    return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" class="${i === N - 1 ? "on" : ""}"/><text class="v" x="${x + bw / 2}" y="${y - 6}" text-anchor="middle">${t ? short(t) : ""}</text><text x="${x + bw / 2}" y="150" text-anchor="middle">${MS[m.getMonth()]}</text>`;
  }).join("");
  const c2 = h("section", "card", null, [h("h2", "ct", "ยอดจ่ายรายเดือน 6 เดือนล่าสุด")]), bw2 = h("div");
  bw2.innerHTML = `<svg class="bars" viewBox="0 0 ${W} 158" aria-hidden="true">${bars}</svg>`;
  c2.append(bw2, h("p", "fine", "นับรวมรายการที่ยังไม่ถึงวันตัดของเดือนนั้นด้วย"));
  v.append(c2);
}
export function renderHistory() {
  const v = $("v-his");
  v.textContent = "";
  v.append(head("ประวัติ", "รายการที่ตัดเงินไปแล้ว", null));
  const seg = h("div", "seg");
  seg.style.marginBottom = "14px";
  [["list", "ประวัติการจ่าย"], ["chart", "กราฟสรุป"]].forEach(([k, t]) => {
    const b = h("button", null, t);
    b.type = "button"; b.setAttribute("aria-pressed", hv === k);
    b.onclick = () => { hv = k; renderHistory(); };
    seg.append(b);
  });
  v.append(seg);
  (hv === "list" ? histList : histCharts)(v);
}

/* ───────── ตั้งค่า ───────── */
let sp = "", sorting = false;
export const resetSettingsPage = () => { sp = ""; };

function themeSeg() {
  const w = h("div", "seg tsg");
  [["light", "สว่าง", "sun"], ["dark", "มืด", "moon"], ["system", "ตามระบบ", "monitor"]].forEach(([k, t, i]) => {
    const b = h("button", null, null, [ico(i, 18)]);
    b.type = "button"; b.setAttribute("aria-label", t); b.setAttribute("aria-pressed", S.theme === k);
    b.onclick = () => { S.theme = k; applyTheme(); persist(); w.replaceWith(themeSeg()); };
    w.append(b);
  });
  return w;
}
export const themeToggle = themeSeg;

function catEdit(i) {
  let e = i < 0 ? "📦" : S.cats[i].e;
  const nm = h("input"), w = h("div", "emo"), paint = () => w.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.textContent === e));
  nm.value = i < 0 ? "" : S.cats[i].n; nm.maxLength = 20; nm.placeholder = "ชื่อหมวดหมู่";
  EMO.forEach(x => { const b = h("button", null, x); b.type = "button"; b.onclick = () => { e = x; paint(); }; w.append(b); });
  paint();
  const no = h("button", null, "ยกเลิก"), ok = h("button", "dk", "บันทึก");
  no.type = ok.type = "button";
  no.onclick = closeSheet;
  ok.onclick = () => {
    const t = nm.value.trim();
    if (!t) return toast("ใส่ชื่อหมวดก่อน");
    if (S.cats.some((c, j) => j !== i && c.n === t)) return toast("มีหมวดนี้แล้ว");
    const cats = S.cats.map(c => ({ ...c }));
    if (i < 0) cats.push({ n: t, e });
    else {
      const o = cats[i].n; cats[i] = { n: t, e };
      const ops = S.subs.filter(s => s.cat === o).map(s => ({ set: { ...s, cat: t } }));
      if (ops.length) batchOps(ops);
    }
    S.cats = cats; persist(); closeSheet(); renderSettings();
  };
  sheet(i < 0 ? "เพิ่มหมวด" : "แก้หมวด", h("div", null, null, [fld("ชื่อ", nm), h("label", null, "ไอคอน"), w, h("div", "sbtn", null, [no, ok])]));
}
const xb = (icon, label, fn) => { const b = h("button", "x", null, [ico(icon, 18)]); b.type = "button"; b.setAttribute("aria-label", label); b.onclick = fn; return b; };
const card = (title, desc, kids) => h("section", "card", null, [h("h2", "ct", title), desc ? h("p", "mut", desc) : null, ...kids]);

function normSub(s) {
  return {
    name: String(s.name).slice(0, 40), plan: String(s.plan || "").slice(0, 40), site: String(s.site || "").slice(0, 80),
    color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : COL[0],
    logo: typeof s.logo === "string" && s.logo.startsWith("data:image/") && s.logo.length < 30000 ? s.logo : "",
    price: +s.price, cur: SYM[s.cur] ? s.cur : "THB",
    cy: ["m", "y", "c"].includes(s.cy) ? s.cy : "m", k: Math.max(1, parseInt(s.k) || 1), u: ["d", "w", "m", "y"].includes(s.u) ? s.u : "m",
    first: s.first, start: s.start || s.first, cat: s.cat || "อื่นๆ", pay: s.pay || "", trial: s.trial || "",
    ppl: Array.isArray(s.ppl) ? s.ppl.map(p => ({ name: String(p.name || "").slice(0, 20), amt: +p.amt || 0, until: p.until || "" })) : [],
    end: s.end || "", endN: +s.endN || 0, rem: s.rem === -1 || Array.isArray(s.rem) ? s.rem : null,
    note: String(s.note || "").slice(0, 200), paused: !!s.paused, pausedAt: s.paused && /^\d{4}-\d\d-\d\d$/.test(s.pausedAt || "") ? s.pausedAt : "",
    skip: Array.isArray(s.skip) ? s.skip.filter(x => /^\d{4}-\d\d-\d\d$/.test(x)).slice(0, 1000) : [], createdAt: Date.now(),
  };
}
function importText(txt) {
  try {
    const o = JSON.parse(txt);
    if (!o || !Array.isArray(o.subs)) throw new Error("bad");
    const subs = o.subs.filter(s => s && typeof s.name === "string" && typeof s.first === "string" && isFinite(+s.price)).map(normSub);
    const cats = (Array.isArray(o.cats) ? o.cats : []).map(c => (Array.isArray(c) ? { n: c[0], e: c[1] } : { n: c && c.n, e: c && c.e })).filter(c => c.n);
    const accts = (Array.isArray(o.accts) ? o.accts : []).filter(a => a && a.id && a.type && a.name);
    if (!subs.length) return toast("ไม่พบรายการในไฟล์");
    ask("นำเข้า " + subs.length + " รายการ?", "รายการที่นำเข้าจะถูกเพิ่มต่อจากข้อมูลเดิม ไม่ทับของเดิม", "นำเข้า", () => {
      S.cats = [...S.cats, ...cats.filter(c => !S.cats.some(x => x.n === c.n))];
      S.accts = [...S.accts, ...accts.filter(a => !S.accts.some(x => x.id === a.id))];
      persist();
      batchOps(subs.map(s => ({ set: { ...s, id: newId() } })));
      toast("นำเข้าแล้ว");
    }, false);
  } catch (e) { toast("ไฟล์หรือข้อความไม่ถูกต้อง"); }
}

const SP = {
  gen(v) {
    const cards = h("div", "themes"), cur = h("select"), rt = h("div", "rates");
    [["light", "สว่าง", "#f1f0fb"], ["dark", "มืด", "#16132e"], ["system", "ตามระบบ", "linear-gradient(90deg,#f1f0fb 50%,#16132e 50%)"]].forEach(([k, t, bg]) => {
      const p = h("span", "tp"), b = h("button", "tcard", null, [p, h("span", "tl", null, [h("i", "rd" + (S.theme === k ? " on" : "")), t])]);
      p.style.background = bg; b.type = "button"; b.setAttribute("aria-pressed", S.theme === k);
      b.onclick = () => { S.theme = k; applyTheme(); persist(); renderSettings(); };
      cards.append(b);
    });
    Object.keys(SYM).forEach(c => cur.append(new Option(c, c)));
    const lang = h("div", "seg tsg"), rtSeg = h("div", "seg tsg"), rtInfo = h("p", "fine");
    [["th", "ไทย"], ["en", "English"]].forEach(([k, t]) => {
      const b = h("button", null, t);
      b.type = "button"; b.setAttribute("aria-pressed", S.lang === k);
      b.onclick = () => { setLang(k); persist(); renderSettings(); };
      lang.append(b);
    });
    [[true, "อัตโนมัติ"], [false, "ตั้งเอง"]].forEach(([k, t]) => {
      const b = h("button", null, t);
      b.type = "button"; b.setAttribute("aria-pressed", S.autoRate === k);
      b.onclick = () => { S.autoRate = k; persist(); if (k) syncRates(true).then(() => renderSettings()); renderSettings(); };
      rtSeg.append(b);
    });
    rtInfo.textContent = !S.autoRate ? "ใช้เรทที่ตั้งเอง ด้านล่างแก้ไขได้" : S.ratesAt ? "อัปเดตล่าสุด " + new Date(S.ratesAt).toLocaleString(S.lang === "en" ? "en-GB" : "th-TH-u-ca-gregory", { dateStyle: "medium", timeStyle: "short" }) : "ยังไม่ได้ดึงเรท ใช้ค่าเริ่มต้นไปก่อน";
    if (S.autoRate) rtInfo.append(" ", btn("lnk", "อัปเดตตอนนี้", () => syncRates(true).then(ok => { toast(ok ? "อัปเดตเรทแล้ว" : "ดึงเรทไม่สำเร็จ ใช้เรทเดิมต่อไป"); renderSettings(); })));
    cur.value = S.cur; cur.onchange = () => { S.cur = cur.value; persist(); };
    ["USD", "EUR", "JPY"].forEach(c => {
      const i = h("input"); i.type = "number"; i.min = 0; i.step = "any"; i.value = S.rates[c] ?? DEF_RATE[c]; i.disabled = S.autoRate;
      i.onchange = () => { const x = parseFloat(i.value); if (x > 0) { S.rates = { ...S.rates, [c]: x }; persist(); } else i.value = S.rates[c]; };
      rt.append(fld("1 " + c + " = (บาท)", i));
    });
    v.append(card("ทั่วไป", "ธีม ภาษา และสกุลเงินที่ใช้สรุปยอด", [
      h("label", null, "ธีม"), cards, h("label", null, "ภาษา"), lang,
      fld("สกุลเงินหลัก (ยอดรวมทุกหน้าจะแปลงเป็นสกุลนี้)", cur),
      h("label", null, "อัตราแลกเปลี่ยน"), rtSeg, rtInfo, rt,
      h("label", null, "โซนเวลา"), h("p", "mut", Intl.DateTimeFormat().resolvedOptions().timeZone),
    ]));
  },
  cat(v) {
    const ad = btn("dk", " เพิ่มหมวด", () => catEdit(-1), "plus"), so = btn("gh", sorting ? "เสร็จ" : "จัดเรียง", () => { sorting = !sorting; renderSettings(); });
    const bar = h("div", "tr2 end", null, [so, ad]);
    const c = card("หมวดหมู่", "เพิ่ม แก้ชื่อ เปลี่ยนไอคอนได้ตามใจ ใช้ในตัวกรองและฟอร์ม", [bar]);
    S.cats.forEach((k, i) => {
      const n = S.subs.filter(s => s.cat === k.n).length;
      const mv = d => { const j = i + d; if (j < 0 || j >= S.cats.length) return; const cats = S.cats.slice(); [cats[i], cats[j]] = [cats[j], cats[i]]; S.cats = cats; persist(); renderSettings(); };
      const del = () => {
        if (S.cats.length < 2) return toast("ต้องเหลืออย่างน้อย 1 หมวด");
        ask("ลบหมวด " + k.n + "?", n ? "รายการในหมวดนี้ " + n + " รายการจะย้ายไปหมวดอื่น" : "ลบหมวดนี้ออกจากรายการ", "ลบหมวด", () => {
          const cats = S.cats.filter((_, j) => j !== i), f = (cats.find(q => q.n === "อื่นๆ") || cats[0]).n;
          const ops = S.subs.filter(s => s.cat === k.n).map(s => ({ set: { ...s, cat: f } }));
          if (ops.length) batchOps(ops);
          S.cats = cats; persist(); renderSettings();
        });
      };
      c.append(h("div", "cr", null, [h("span", "pi", k.e), h("div", "rt", null, [h("div", "nm", k.n), h("div", "sb", n ? n + " รายการ" : "—")]),
        ...(sorting ? [xb("chevL", "เลื่อนขึ้น", () => mv(-1)), xb("chevR", "เลื่อนลง", () => mv(1))] : [xb("edit", "แก้ไข", () => catEdit(i)), xb("trash", "ลบ", del)])]));
    });
    v.append(c);
  },
  pay(v) {
    const c = card("ช่องทางหักเงิน", "บัตรและกระเป๋าเงินที่ใช้จ่าย เพื่อดูยอดรวมแยกตามช่องทาง", [h("div", "tr2 end", null, [btn("dk", " เพิ่มช่องทาง", () => newAcct(() => renderSettings()), "plus")])]);
    if (!S.accts.length) c.append(h("p", "empty", "ยังไม่มีช่องทาง"));
    S.accts.forEach(a => {
      const t = h("div", "lg", bdg(a.type).slice(0, 4));
      t.style.background = a.color; t.style.fontSize = "12px";
      c.append(h("div", "cr", null, [t, h("div", "rt", null, [h("div", "nm", a.name), h("div", "sb", a.type + (a.last4 ? " ••" + a.last4 : ""))]),
        xb("trash", "ลบ " + a.name, () => ask("ลบ " + a.name + "?", "รายการที่ใช้ช่องทางนี้จะกลายเป็น ไม่ระบุ", "ลบช่องทาง", () => {
          const ops = S.subs.filter(s => s.pay === a.id).map(s => ({ set: { ...s, pay: "" } }));
          if (ops.length) batchOps(ops);
          S.accts = S.accts.filter(q => q.id !== a.id); persist(); renderSettings();
        }))]));
    });
    v.append(c);
  },
  ntf(v) {
    v.append(card("การแจ้งเตือน", "ตั้งครั้งเดียว ใช้กับทุกรายการ (ปรับเฉพาะรายการได้ตอนเพิ่มหรือแก้ไข)", [
      h("label", null, "เตือนล่วงหน้าเป็นค่าเริ่มต้น"), remChips(S.rem, persist),
      h("p", "fine", "รายการที่ใกล้ตัดเงินตามวันที่เลือกจะขึ้นเตือนที่หน้าภาพรวมทุกครั้งที่เปิดแอป ส่วนการเตือนทางอีเมลหรือมือถือเมื่อปิดแอปอยู่ต้องต่อบริการเพิ่ม (ดู README)"),
    ]));
  },
  dat(v) {
    const file = h("input"), ta = h("textarea");
    file.type = "file"; file.accept = "application/json,.json"; file.hidden = true;
    ta.rows = 5; ta.placeholder = "วางข้อมูลสำรอง (JSON) ที่นี่ แล้วกดนำเข้า"; ta.setAttribute("aria-label", "ข้อมูลสำรอง");
    const exportData = () => ({ app: "jotbill", v: 2, exportedAt: new Date().toISOString(), subs: S.subs.map(({ id, ...r }) => r), accts: S.accts, cats: S.cats, rem: S.rem, cur: S.cur, rates: S.rates });
    const dl = btn("btn", " ดาวน์โหลดไฟล์สำรอง", () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" }));
      a.download = "jotbill-" + iso(TD) + ".json";
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "download");
    const pick = btn("btn ghost", " เลือกไฟล์เพื่อนำเข้า", () => file.click(), "upload");
    file.onchange = () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importText(String(r.result)); r.readAsText(f); file.value = ""; };
    const im = btn("btn ghost", "นำเข้าจากข้อความ", () => importText(ta.value));
    const rs = btn("btn ghost danger-t", " ลบรายการทั้งหมด", () => ask("ลบรายการทั้งหมด?", "ลบ " + S.subs.length + " รายการออกจากบัญชีนี้ถาวร ย้อนกลับไม่ได้", "ลบทั้งหมด", () => { batchOps(S.subs.map(s => ({ del: s.id }))); toast("ลบรายการทั้งหมดแล้ว"); }), "trash");
    v.append(card("ข้อมูล", "สำรองหรือย้ายข้อมูล ไฟล์นำเข้าได้ทั้งจากแอปนี้และจากเดโมรุ่นแรก", [dl, pick, file, h("label", null, "หรือวางข้อความ"), ta, im, rs]));
  },
  acc(v) {
    const u = S.user || {};
    v.append(card("บัญชี", "ข้อมูลของคุณเก็บแยกตามบัญชี Google นี้ ซิงค์ทุกเครื่องที่ล็อกอิน", [
      h("div", "prof inner", null, [avatar(u, "avt"), h("div", "rt", null, [h("div", "nm", u.name || "ผู้ใช้"), h("div", "sb", u.email || "")])]),
      btn("btn ghost", " ออกจากระบบ", () => nav.signOut(), "logout"),
    ]));
  },
};
function avatar(u, cls) {
  const letter = (u.name || u.email || "?")[0].toUpperCase(), a = h("div", cls, letter);
  if (u.photo) {
    const i = new Image();
    i.alt = ""; i.referrerPolicy = "no-referrer";
    i.onload = () => { a.textContent = ""; a.append(i); };
    i.src = u.photo;
  }
  return a;
}
export const avatarOf = avatar;
export function renderSettings() {
  const v = $("v-set");
  v.textContent = "";
  if (!sp) {
    const u = S.user || {};
    const c = h("div", "card");
    [["gen", "settings", "ทั่วไป", "ธีม ภาษา สกุลเงิน และอัตราแลกเปลี่ยน"], ["cat", "tag", "หมวดหมู่", "เพิ่ม แก้ชื่อ เปลี่ยนไอคอนได้ตามใจ"], ["pay", "card", "ช่องทางหักเงิน", "บัตรและกระเป๋าเงินที่ใช้จ่าย"],
      ["ntf", "bell", "การแจ้งเตือน", "ตั้งครั้งเดียว ใช้กับทุกรายการ"], ["dat", "db", "ข้อมูล", "สำรอง นำเข้า และย้ายข้อมูล"], ["acc", "user", "บัญชี", "บัญชี Google และการออกจากระบบ"]].forEach(m => {
      const k = h("button", "pick", null, [h("span", "pi", null, [ico(m[1], 20)]), h("span", "pt", null, [h("b", null, m[2]), h("small", null, m[3])]), h("span", "mut", null, [ico("chevR", 18)])]);
      k.type = "button"; k.onclick = () => { sp = m[0]; renderSettings(); }; c.append(k);
    });
    v.append(head("ตั้งค่า", null, null), h("div", "card prof", null, [avatar(u, "avt"), h("div", "rt", null, [h("div", "nm", u.name || "ผู้ใช้"), h("div", "sb", u.email || "")]), btn("gh", "ออกจากระบบ", () => nav.signOut())]), c);
    return;
  }
  const bk = h("button", "bk", null, [ico("chevL", 18), " ตั้งค่า"]);
  bk.type = "button"; bk.onclick = () => { sp = ""; renderSettings(); };
  v.append(bk);
  SP[sp](v);
}

/* ───────── หน้าก่อนเข้าสู่ระบบ ───────── */
const GOOGLE = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
export const LOGO = '<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#6c5ce7"/><path d="M14 10h20a2 2 0 0 1 2 2v26l-4-2.6-4 2.6-4-2.6-4 2.6-4-2.6-4 2.6V12a2 2 0 0 1 2-2z" transform="translate(-1 0)" fill="#fff"/><path d="M17.5 18h13M17.5 24h13M17.5 30h7" stroke="#6c5ce7" stroke-width="2.4" stroke-linecap="round"/></svg>';
const root = () => $("root");
function show(html) {
  $("app").hidden = true;
  root().hidden = false;
  root().innerHTML = html;
}
export function showApp() { root().hidden = true; $("app").hidden = false; }
export function renderSplash() {
  show(`<div class="splash"><div class="splash-in">${LOGO}<div class="sk"></div></div></div>`);
}
export function renderLogin(onSign) {
  show(`<main class="login"><button class="lang-b" id="lgLang" type="button">${S.lang === "th" ? "English" : "ไทย"}</button><div class="lg-wrap">
    <section class="lg-copy">
      <div class="brand">${LOGO}<b>จดบิล</b></div>
      <h1>จดค่า Subscription ให้ไม่หลุดสักรายการ</h1>
      <p class="lead">รวมทุกรายการที่ตัดเงินอัตโนมัติไว้ที่เดียว เห็นยอดรายเดือนและรายปี แล้วรู้ล่วงหน้าก่อนถูกตัดเงินหรือก่อนหมดช่วงทดลองใช้</p>
      <button class="gbtn" id="gsign" type="button">${GOOGLE}<span>เข้าสู่ระบบด้วย Google</span></button>
      <p class="fine" id="lgerr" role="alert"></p>
      <ul class="perks">
        <li>${svg("bell", 20)}<span><b>เตือนก่อนตัดเงิน</b> เลือกได้ว่าจะให้เตือนก่อนกี่วัน</span></li>
        <li>${svg("globe", 20)}<span><b>รวมหลายสกุลเงิน</b> บาท ดอลลาร์ ยูโร เยน แปลงเป็นยอดเดียว</span></li>
        <li>${svg("users", 20)}<span><b>หารกับเพื่อน</b> คิดเฉพาะส่วนที่คุณจ่ายจริง</span></li>
      </ul>
      <p class="fine">ใช้บัญชี Google เพื่อระบุว่าข้อมูลเป็นของใคร ไม่มีการโพสต์หรืออ่านอะไรจากบัญชีของคุณ</p>
    </section>
    <section class="lg-art" aria-hidden="true">
      <div class="blob"></div>
      <div class="receipt">
        <div class="r-h"><b>จดบิล</b><span>เดือนนี้</span></div>
        <div class="r-row"><i style="background:#e50914">N</i><span>Netflix<small>พรุ่งนี้</small></span><b>419.00</b></div>
        <div class="r-row"><i style="background:#1db954">S</i><span>Spotify<small>อีก 3 วัน</small></span><b>149.00</b></div>
        <div class="r-row"><i style="background:#ff0033">Y</i><span>YouTube Premium<small>อีก 6 วัน</small></span><b>179.00</b></div>
        <div class="r-row"><i style="background:#10a37f">C</i><span>ChatGPT Plus<small>ทดลองใช้ เหลือ 5 วัน</small></span><b>US$20</b></div>
        <div class="r-sum"><span>รวมเดือนนี้</span><b>฿1,606.00</b></div>
      </div>
      <div class="fchip y">${svg("bell", 16)} เตือนก่อนตัดเงิน 3 วัน</div>
      <div class="fchip m">${svg("check", 16)} หารกับเพื่อนแล้ว</div>
    </section>
  </div></main>`);
  $("gsign").onclick = onSign;
  $("lgLang").onclick = () => { setLang(S.lang === "th" ? "en" : "th"); $("lgLang").textContent = S.lang === "th" ? "English" : "ไทย"; };
  if (/Line\/|FBAN|FBAV|Instagram/i.test(navigator.userAgent)) loginError("Google ไม่อนุญาตให้ล็อกอินในเบราว์เซอร์ของแอปแชต เปิดลิงก์นี้ใน Chrome หรือ Safari แทน");
}
export function loginError(msg) { const e = $("lgerr"); if (e) e.textContent = msg; }
export function renderSetup() {
  show(`<main class="setup"><div class="card"><div class="brand">${LOGO}<b>จดบิล</b></div>
    <h1>ยังไม่ได้ตั้งค่า Firebase</h1>
    <p class="mut">แอปนี้ใช้ Firebase เป็นระบบล็อกอินด้วย Google และฐานข้อมูล ทำตามนี้ก่อนใช้งาน</p>
    <ol><li>สร้างโปรเจกต์ที่ <b>console.firebase.google.com</b> แล้วเปิดใช้ Google Sign-in และ Firestore</li>
    <li>คัดลอกค่า <code>firebaseConfig</code> ของ Web app</li>
    <li>วางลงในไฟล์ <code>js/config.js</code> แล้วรีเฟรชหน้านี้</li></ol>
    <p class="fine">ขั้นตอนละเอียดอยู่ในไฟล์ README.md</p></div></main>`);
}
export function renderError(msg, retry) {
  show(`<main class="setup"><div class="card"><div class="brand">${LOGO}<b>จดบิล</b></div>
    <h1>เชื่อมต่อไม่สำเร็จ</h1><p class="mut" id="emsg"></p>
    <button class="btn" id="retry" type="button">ลองใหม่</button></div></main>`);
  $("emsg").textContent = msg;
  $("retry").onclick = retry;
}
