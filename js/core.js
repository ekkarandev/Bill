// แกนกลางของแอป: state, ค่าคงที่, ตัวช่วยคำนวณวันตัดเงิน, ตัวช่วยสร้าง DOM
import * as B from "./backend.js";

/* ───────── DOM helpers ───────── */
export const $ = id => document.getElementById(id);
export function h(tag, cls, text, kids = []) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  for (const n of kids) if (n != null && n !== false) e.append(n);
  return e;
}

const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>',
  settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8C10 4 6 5 7 8m5 0c2-4 6-3 5 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  flag: '<path d="M5 21V4M5 4h13l-2.5 4.5L18 13H5"/>',
  note: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6 15h4"/>',
  db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
};
export const svg = (n, s = 20) =>
  `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
export function ico(n, s = 20) {
  const e = document.createElement("span");
  e.className = "ic";
  e.innerHTML = svg(n, s);
  return e;
}

/* ───────── ค่าคงที่ ───────── */
export const SYM = { THB: "฿", USD: "$", EUR: "€", JPY: "¥" };
export const DEF_RATE = { THB: 1, USD: 35, EUR: 38, JPY: 0.23 };
export const UN = { d: "วัน", w: "สัปดาห์", m: "เดือน", y: "ปี" };
export const MN = "มกราคม กุมภาพันธ์ มีนาคม เมษายน พฤษภาคม มิถุนายน กรกฎาคม สิงหาคม กันยายน ตุลาคม พฤศจิกายน ธันวาคม".split(" ");
export const MS = "ม.ค. ก.พ. มี.ค. เม.ย. พ.ค. มิ.ย. ก.ค. ส.ค. ก.ย. ต.ค. พ.ย. ธ.ค.".split(" ");
export const COL = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];
export const PCOL = ["#1e1b6b", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#64748b"];
export const EMO = "🎞️ 🎵 🎮 💼 ☁️ 💚 📙 📰 📦 🛒 🚗 🏠 ✈️ 🍔 📱 💡".split(" ");
export const PAYG = [
  ["บัตรเครดิต/เดบิต", "Visa|Mastercard|JCB|American Express|UnionPay"],
  ["กระเป๋าเงิน", "TrueMoney Wallet|Apple Pay|Google Pay|PayPal|LINE Pay|ShopeePay"],
  ["ธนาคาร", "PromptPay|กสิกรไทย (KBank)|ไทยพาณิชย์ (SCB)|กรุงไทย (Krungthai)|กรุงเทพ (Bangkok Bank)|กรุงศรี (Krungsri)|ทีทีบี (ttb)|ออมสิน (GSB)|ธนาคารอื่น"],
  ["บิลมือถือ", "บิล AIS|บิล True|บิล dtac"],
  ["แอปสโตร์", "App Store|Google Play"],
  ["อื่นๆ", "เงินสด|กำหนดเอง"],
];
export const defaultCats = () => [
  { n: "บันเทิง", e: "🎞️" }, { n: "เพลง", e: "🎵" }, { n: "เกม", e: "🎮" },
  { n: "งาน/ซอฟต์แวร์", e: "💼" }, { n: "คลาวด์", e: "☁️" }, { n: "สุขภาพ", e: "💚" },
  { n: "การศึกษา", e: "📙" }, { n: "ข่าว/นิตยสาร", e: "📰" }, { n: "อื่นๆ", e: "📦" },
];

/* ───────── State ───────── */
export const S = {
  user: null, subs: [], accts: [], cats: defaultCats(),
  rem: [3, 1, 0], cur: "THB", theme: "system",
  rates: { USD: DEF_RATE.USD, EUR: DEF_RATE.EUR, JPY: DEF_RATE.JPY },
};
export const nav = { go: () => {}, openForm: () => {}, signOut: () => {} };
export const rate = c => (c === "THB" ? 1 : (S.rates && S.rates[c]) || DEF_RATE[c] || 1);

/* ───────── วันที่ ───────── */
const pad = n => String(n).padStart(2, "0");
export const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const prs = s => { const a = s.split("-"); return new Date(+a[0], a[1] - 1, +a[2]); };
const day0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export let TD = day0(new Date());
export const refreshToday = () => { TD = day0(new Date()); };
export const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const daysTo = d => Math.round((d - TD) / 864e5);
export const dstr = d => d.getDate() + " " + MS[d.getMonth()];
export const fdate = s => { if (!s) return "—"; const d = prs(s); return dstr(d) + " " + d.getFullYear(); };
export const dayTxt = n => (n === 0 ? "วันนี้" : n === 1 ? "พรุ่งนี้" : "อีก " + n + " วัน");

/* ───────── รอบตัดเงิน ───────── */
export const unitOf = s => (s.cy === "m" ? ["m", 1] : s.cy === "y" ? ["y", 1] : [s.u, s.k]);
export function nth(s, f, n) {
  const [u, k] = unitOf(s);
  if (u === "d") return new Date(f.getFullYear(), f.getMonth(), f.getDate() + n * k);
  if (u === "w") return new Date(f.getFullYear(), f.getMonth(), f.getDate() + n * k * 7);
  const t = new Date(f.getFullYear(), f.getMonth() + n * k * (u === "y" ? 12 : 1), 1);
  t.setDate(Math.min(f.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
  return t;
}
// วันตัดเงินทั้งหมดของรายการ s ระหว่าง a ถึง b (รายการที่หยุดชั่วคราวไม่ถูกนับ)
export function occ(s, a, b) {
  if (s.paused) return [];
  const f = prs(s.first), e = s.end ? prs(s.end) : null, o = [];
  for (let n = 0; n < 5000; n++) {
    const d = nth(s, f, n);
    if (d > b || (e && d > e)) break;
    if (d >= a) o.push(d);
  }
  return o;
}
export const nxt = s => occ(s, TD, new Date(TD.getFullYear() + 2, TD.getMonth(), TD.getDate()))[0];

// ยอดที่ "เราจ่าย" ในรอบวันที่ d เป็นบาท (หักส่วนของคนที่หารด้วยออก)
export function thb(s, d) {
  d = d || TD;
  const others = (s.ppl || []).reduce((a, p) => a + (p.until && d > prs(p.until) ? 0 : +p.amt || 0), 0);
  return Math.max(0, s.price - others) * rate(s.cur);
}
// เฉลี่ยต่อเดือนเป็นบาท
export function mon(s) {
  if (s.paused) return 0;
  const [u, k] = unitOf(s), x = thb(s);
  return u === "d" ? x * 30.44 / k : u === "w" ? x * 4.348 / k : u === "m" ? x / k : x / (12 * k);
}
export const cyl = s => (s.cy === "m" ? "เดือน" : s.cy === "y" ? "ปี" : s.k === 1 ? UN[s.u] : s.k + " " + UN[s.u]);
export const remList = s => (s.rem === -1 ? [] : Array.isArray(s.rem) ? s.rem : S.rem);
export const remOf = s => { const l = remList(s); return l.length ? Math.max(...l) : -1; };
export const remTxt = a => a.slice().sort((x, y) => y - x).map(d => (d === 0 ? "วันตัดเงิน" : d + " วัน")).join(" · ") || "ไม่เตือน";

/* ───────── แสดงเงิน ───────── */
const dec = c => (c === "JPY" ? 0 : 2);
export function money(x) {
  const c = S.cur;
  return SYM[c] + (x / rate(c)).toLocaleString("th-TH", { minimumFractionDigits: dec(c), maximumFractionDigits: dec(c) });
}
export function price(s) {
  return (s.cur === "USD" ? "US$" : SYM[s.cur]) + s.price.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
export function subtxt(s) {
  return [s.plan, price(s) + " / " + cyl(s)].filter(Boolean).join(" · ") + ((s.ppl || []).length ? " · หาร " + (s.ppl.length + 1) + " คน" : "");
}
export const bdg = t => { const m = t.match(/\((.*)\)/); return m ? m[1] : t.split(" ")[0]; };
export const acc = id => S.accts.find(a => a.id === id);
export const payTxt = a => a.name + (a.last4 ? " ••" + a.last4 : "");
export const catOf = n => S.cats.find(c => c.n === n) || { n: n || "อื่นๆ", e: "📦" };

/* ───────── บันทึกข้อมูล (ผ่าน Firebase) ───────── */
export function toast(t) {
  const e = $("toast");
  e.textContent = t;
  e.className = "on";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { e.className = ""; }, 2800);
}
export function fail(e) {
  console.error(e);
  const c = (e && e.code) || "";
  toast(c === "permission-denied" ? "บันทึกไม่ได้ ตรวจสอบ Firestore rules (ดู README ข้อ 5)" : "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
}
export const persist = () =>
  B.saveSettings({ cats: S.cats, accts: S.accts, rem: S.rem, cur: S.cur, theme: S.theme, rates: S.rates }).catch(fail);
export const saveSub = s => B.saveSub(s).catch(fail);
export const removeSub = id => B.removeSub(id).catch(fail);
export const batchOps = ops => B.batch(ops).catch(fail);
export const newId = () => B.newId();

export function applyTheme(store = true) {
  const t = S.theme, r = document.documentElement;
  if (t === "light" || t === "dark") r.dataset.theme = t; else delete r.dataset.theme;
  try { if (store) localStorage.setItem("jb-theme", t); } catch (e) { /* ignore */ }
  const dark = t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = dark ? "#16132e" : "#7b6ef6";
}

/* ───────── Bottom sheet / dialog ───────── */
let lastFocus = null;
export function sheet(title, body) {
  if ($("sheet").hidden) lastFocus = document.activeElement;
  $("shT").textContent = title;
  const b = $("shB");
  b.textContent = "";
  b.append(body);
  $("sheet").hidden = false;
  $("shX").focus();
}
export function closeSheet() {
  if ($("sheet").hidden) return;
  $("sheet").hidden = true;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
export function initUi() {
  $("shX").onclick = closeSheet;
  $("sheet").onclick = e => { if (e.target === $("sheet")) closeSheet(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
}
export function ask(title, msg, okText, fn, danger = true) {
  const ok = h("button", "btn" + (danger ? " danger" : ""), okText), no = h("button", "btn ghost", "ยกเลิก");
  ok.type = no.type = "button";
  no.onclick = closeSheet;
  ok.onclick = () => { closeSheet(); fn(); };
  sheet(title, h("div", null, null, [h("p", "mut", msg), h("div", "sbtn", null, [no, ok])]));
}
export function fld(t, el) {
  el.id = el.id || "f" + Math.random().toString(36).slice(2, 7);
  const l = h("label", null, t);
  l.htmlFor = el.id;
  return h("div", null, null, [l, el]);
}
export function remChips(arr, cb) {
  const w = h("div", "chips");
  [[7, "7 วัน"], [3, "3 วัน"], [1, "1 วัน"], [0, "วันตัดเงิน"]].forEach(([d, t]) => {
    const b = h("button", null, t);
    b.type = "button";
    const sync = () => b.setAttribute("aria-pressed", arr.includes(d));
    sync();
    b.onclick = () => { const i = arr.indexOf(d); if (i < 0) arr.push(d); else arr.splice(i, 1); sync(); cb(); };
    w.append(b);
  });
  return w;
}
