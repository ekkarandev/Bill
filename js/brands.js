// สีและโลโก้ประจำช่องทางหักเงิน (บัตร กระเป๋าเงิน ธนาคาร ฯลฯ)
// โลโก้เป็นสัญลักษณ์แบบย่อที่วาดเอง (ข้อความ/รูปทรงง่าย ๆ) ไม่ได้ใช้ไฟล์โลโก้จริงของแบรนด์
import { h, PCOL } from "./core.js";

// key = ข้อความที่พบในชื่อประเภท (ตัวพิมพ์เล็ก) เรียงตามลำดับความเฉพาะเจาะจง
const B = [
  ["visa", { c: "#1d4bb5", t: "VISA", mk: "#1a1f71", it: 1 }],
  ["mastercard", { c: "#d92d2d", svg: "mc" }],
  ["jcb", { c: "#0b5aa6", t: "JCB", mk: "#0b5aa6" }],
  ["american express", { c: "#3f78b8", t: "AMEX", solid: "#2b62ab" }],
  ["unionpay", { c: "#b3262d", t: "UP", mk: "#b3262d" }],
  ["truemoney", { c: "#e8793a", svg: "tm" }],
  ["apple pay", { c: "#1c1c1e", t: "Pay", mk: "#111" }],
  ["google pay", { c: "#4285f4", t: "G Pay", mk: "#4285f4" }],
  ["paypal", { c: "#0b6fb8", t: "PP", mk: "#003087", it: 1 }],
  ["line pay", { c: "#06c755", t: "LINE", mk: "#06a94a" }],
  ["shopeepay", { c: "#ee4d2d", t: "S", mk: "#ee4d2d" }],
  ["promptpay", { c: "#1d4f91", t: "PP", mk: "#1d4f91" }],
  ["kbank", { c: "#138f2d", t: "K", mk: "#138f2d" }],
  ["scb", { c: "#4e2e7f", t: "SCB", mk: "#4e2e7f" }],
  ["krungthai", { c: "#1ba5e0", t: "KTB", mk: "#1ba5e0" }],
  ["bangkok bank", { c: "#1e3a8a", t: "BBL", mk: "#1e3a8a" }],
  ["krungsri", { c: "#f2b01e", t: "BAY", mk: "#a86f00" }],
  ["ttb", { c: "#2563b0", t: "ttb", mk: "#e8730a" }],
  ["gsb", { c: "#e91e8c", t: "GSB", mk: "#e91e8c" }],
  ["ธนาคารอื่น", { c: "#475569", t: "BANK", mk: "#475569" }],
  ["ais", { c: "#7cb342", t: "AIS", mk: "#4f8a14" }],
  ["true", { c: "#e11d2e", t: "true", mk: "#e11d2e" }],
  ["dtac", { c: "#0099e5", t: "dtac", mk: "#0099e5" }],
  ["app store", { c: "#0d84ff", t: "A", mk: "#0d84ff" }],
  ["google play", { c: "#0f9d58", t: "Play", mk: "#0f9d58" }],
  ["เงินสด", { c: "#16a34a", t: "฿", mk: "#16a34a" }],
];
export const brandOf = type => { const k = String(type || "").toLowerCase(); const m = B.find(x => k.includes(x[0])); return m ? m[1] : null; };

const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const toHex = a => "#" + a.map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
export const mix = (c, d, t) => { const x = hex(c), y = hex(d); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = c => { const [r, g, b] = hex(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

// สีของการ์ด: บัญชีเก่าที่ยังเป็นสีเริ่มต้น (กรมท่า) จะใช้สีแบรนด์ให้อัตโนมัติ
export const cardColor = a => { const b = brandOf(a.type); return b && (!a.color || a.color === PCOL[0]) ? b.c : a.color || "#4f46e5"; };
export const gradOf = c => ({ c1: c, c2: mix(c, "#ffffff", 0.32), light: lum(c) > 0.62 });

const MC = '<svg viewBox="0 0 38 24" aria-hidden="true"><circle cx="14" cy="12" r="10" fill="#eb001b"/><circle cx="24" cy="12" r="10" fill="#f79e1b" fill-opacity=".92"/></svg>';
const TM = '<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M5 5l6.5 14L16 10l4.5 9L27 5" fill="none" stroke="#f26b1d" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 5l4 8.5L35 5" fill="none" stroke="#e11d2e" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></svg>';

// ป้ายโลโก้เล็ก ๆ (พื้นขาว สัญลักษณ์สีแบรนด์) size: "" | "sm"
export function markEl(type, size = "") {
  const b = brandOf(type), e = h("span", "pmk" + (size ? " " + size : "") + (b && b.solid ? " solid" : ""));
  if (!b) { e.textContent = String(type || "?").replace(/\(.*\)/, "").trim().slice(0, 3).toUpperCase(); return e; }
  if (b.svg) { e.innerHTML = b.svg === "mc" ? MC : TM; return e; }
  e.textContent = b.t;
  if (b.solid) e.style.setProperty("--mkbg", b.solid); else e.style.color = b.mk;
  if (b.it) e.style.fontStyle = "italic";
  return e;
}
