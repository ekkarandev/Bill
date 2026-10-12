// จุดเริ่มต้นของแอป: ตรวจการล็อกอิน → ฟังข้อมูลจาก Firestore → แสดงหน้าจอ
import * as B from "./backend.js";
import { $, h, ico, S, nav, DEF_RATE, defaultCats, refreshToday, applyTheme, initUi } from "./core.js";
import { initForm, openForm } from "./form.js";
import {
  renderHome, renderList, renderCal, renderSettings, resetSettingsPage, avatarOf, LOGO,
  renderLogin, loginError, renderSetup, renderError, renderSplash, showApp,
} from "./views.js";

const VIEWS = { home: renderHome, list: renderList, cal: renderCal, set: renderSettings };
const NAV = [["home", "home", "ภาพรวม"], ["list", "list", "รายการ"], ["cal", "calendar", "ปฏิทิน"], ["set", "settings", "ตั้งค่า"]];
let cur = "home", unsub = null, ready = false, formOpen = false, activeUid = null;

/* ───── เมนู ───── */
function buildNav() {
  const n = $("nav");
  n.textContent = "";
  const brand = h("div", "nav-brand");
  brand.innerHTML = LOGO + "<b>จดบิล</b>";
  const items = h("div", "nav-items");
  NAV.forEach(([v, i, t]) => {
    const b = h("button", "nav-b", null, [ico(i, 22), h("span", null, t)]);
    b.type = "button"; b.dataset.v = v; b.onclick = () => go(v);
    items.append(b);
  });
  const u = h("button", "nav-user");
  u.type = "button"; u.id = "navUser"; u.onclick = () => go("set");
  n.append(brand, items, u);
}
function updateNavUser() {
  const u = $("navUser"), s = S.user || {};
  u.textContent = "";
  u.append(avatarOf(s, "avt sm"), h("span", "nu-t", null, [h("b", null, s.name || "ผู้ใช้"), h("small", null, s.email || "")]));
}

/* ───── เปลี่ยนหน้า (ใช้ hash เพื่อให้ปุ่มย้อนกลับของมือถือทำงาน) ───── */
function show(v) {
  cur = v;
  if (v !== "add") formOpen = false;
  ["home", "list", "cal", "set", "add"].forEach(k => { $("v-" + k).hidden = k !== v; });
  document.querySelectorAll(".nav-b").forEach(b => b.setAttribute("aria-current", b.dataset.v === (v === "add" ? "list" : v)));
  if (v !== "set") resetSettingsPage();
  if (VIEWS[v]) VIEWS[v]();
  scrollTo(0, 0);
}
function go(v) {
  const hash = "#/" + v;
  if (location.hash !== hash) location.hash = hash; else show(v);
}
function viewFromHash() {
  let v = location.hash.replace("#/", "");
  if (v === "add" && !formOpen) v = "home";
  return VIEWS[v] || v === "add" ? v : "home";
}
window.addEventListener("hashchange", () => { if (ready) show(viewFromHash()); });

let raf = 0;
function refresh() {
  if (!ready) return;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    if (cur === "add" || !VIEWS[cur]) return;
    const a = document.activeElement;
    if (a && $("v-" + cur).contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return; // กำลังพิมพ์อยู่ ไม่รีเฟรชทับ
    VIEWS[cur]();
  });
}

/* ───── ข้อความผิดพลาดที่อ่านรู้เรื่อง ───── */
const dbErr = e => {
  const c = (e && e.code) || "";
  if (c === "permission-denied") return "อ่านข้อมูลไม่ได้เพราะยังไม่ได้ตั้ง Firestore rules ทำตาม README ข้อ 5 แล้วลองใหม่";
  if (c === "failed-precondition" || c === "not-found" || c === "unavailable") return "เชื่อมต่อ Firestore ไม่ได้ ตรวจสอบว่าสร้าง Firestore Database แล้ว (README ข้อ 4) และอินเทอร์เน็ตปกติ";
  return (e && e.message) || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
};
const authErr = e => {
  const c = (e && e.code) || "";
  if (c === "auth/unauthorized-domain") return "โดเมนนี้ยังไม่ได้รับอนุญาต เพิ่มโดเมนใน Firebase Console › Authentication › Settings › Authorized domains";
  if (c === "auth/operation-not-allowed") return "ยังไม่ได้เปิดใช้ Google Sign-in ใน Firebase Console › Authentication › Sign-in method";
  if (c === "auth/network-request-failed") return "เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองใหม่อีกครั้ง";
  return "เข้าสู่ระบบไม่สำเร็จ" + (c ? " (" + c + ")" : "");
};

/* ───── หลังล็อกอิน ───── */
function start(u) {
  if (activeUid === u.uid) return;
  stop();
  activeUid = u.uid;
  S.user = { uid: u.uid, name: u.displayName || "", email: u.email || "", photo: u.photoURL || "" };
  renderSplash();
  let gotUser = false, gotSubs = false;
  const timer = setTimeout(() => { if (!ready) renderError("ใช้เวลานานเกินไป ตรวจสอบอินเทอร์เน็ตและการตั้งค่า Firestore", () => location.reload()); }, 20000);
  const onErr = e => { clearTimeout(timer); console.error(e); ready = false; renderError(dbErr(e), () => location.reload()); };
  const check = () => {
    if (gotUser && gotSubs && !ready) { ready = true; clearTimeout(timer); enter(); }
    else refresh();
  };
  unsub = B.listen(u.uid, d => {
    if (!d) { // ผู้ใช้ใหม่: สร้างค่าเริ่มต้น แล้วรอ snapshot รอบถัดไป
      B.saveSettings({ cats: defaultCats(), accts: [], rem: [3, 1, 0], cur: "THB", theme: S.theme, rates: { USD: DEF_RATE.USD, EUR: DEF_RATE.EUR, JPY: DEF_RATE.JPY }, createdAt: Date.now() }).catch(onErr);
      return;
    }
    S.cats = Array.isArray(d.cats) && d.cats.length ? d.cats : defaultCats();
    S.accts = Array.isArray(d.accts) ? d.accts : [];
    S.rem = Array.isArray(d.rem) ? d.rem : [3, 1, 0];
    S.cur = d.cur || "THB";
    S.rates = { USD: DEF_RATE.USD, EUR: DEF_RATE.EUR, JPY: DEF_RATE.JPY, ...(d.rates || {}) };
    if (d.theme && d.theme !== S.theme) { S.theme = d.theme; applyTheme(); }
    gotUser = true; check();
  }, list => { S.subs = list; gotSubs = true; check(); }, onErr);
}
function enter() {
  showApp();
  updateNavUser();
  show(viewFromHash());
}
function stop() {
  if (unsub) { unsub(); unsub = null; }
  ready = false; activeUid = null;
  Object.assign(S, { user: null, subs: [], accts: [], cats: defaultCats(), rem: [3, 1, 0], cur: "THB" });
}
async function doSignIn() {
  loginError("");
  try { await B.signIn(); } catch (e) { console.error(e); loginError(authErr(e)); }
}
async function signOut() {
  stop();
  try { await B.signOutUser(); } catch (e) { console.error(e); }
  location.hash = "";
}

/* ───── เริ่มต้น ───── */
async function boot() {
  try { S.theme = localStorage.getItem("jb-theme") || "system"; } catch (e) { /* ignore */ }
  applyTheme(false);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (S.theme === "system") applyTheme(false); });
  initUi(); initForm(); buildNav();
  nav.go = go;
  nav.openForm = s => { formOpen = true; openForm(s); };
  nav.signOut = signOut;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { refreshToday(); refresh(); }
  });
  if (!B.isConfigured()) { renderSetup(); return; }
  renderSplash();
  try { await B.init(); } catch (e) { console.error(e); renderError("โหลด Firebase ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่", () => location.reload()); return; }
  B.onAuth(u => { if (u) start(u); else { stop(); renderLogin(doSignIn); } });
}
boot();
