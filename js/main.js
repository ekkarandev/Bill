// จุดเริ่มต้นของแอป: ตรวจการล็อกอิน → ฟังข้อมูลจาก Firestore → แสดงหน้าจอ
import * as B from "./backend.js";
import { $, h, ico, S, nav, DEF_RATE, defaultCats, refreshToday, applyTheme, initUi, syncRates, buzz, persist, toast, ask } from "./core.js";
import { initForm, openForm } from "./form.js";
import { initLang, setLang } from "./i18n.js";
import {
  renderHome, renderList, renderCal, renderHistory, renderSettings, resetSettingsPage, avatarOf, LOGO,
  renderLogin, loginError, renderSetup, renderError, renderSplash, showApp, armIntro, mountTopBar, appAccount,
} from "./views.js";

const VIEWS = { home: renderHome, list: renderList, cal: renderCal, his: renderHistory, set: renderSettings };
const NAV = [["home", "home", "ภาพรวม"], ["list", "list", "รายการ"], ["cal", "calendar", "ปฏิทิน"], ["his", "history", "ประวัติ"], ["set", "settings", "ตั้งค่า"]];
let shown = "", cur = "home", unsub = null, ready = false, formOpen = false, activeUid = null;

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
  u.append(avatarOf(s, "avt sm"), h("span", "nu-t", null, [h("b", null, s.name || "ผู้ใช้"), h("small", null, s.guest ? "ข้อมูลอยู่ในเครื่องนี้" : s.email || "")]));
}

/* ───── เปลี่ยนหน้า (ใช้ hash เพื่อให้ปุ่มย้อนกลับของมือถือทำงาน) ───── */
function show(v) {
  cur = v;
  if (v !== "add") formOpen = false;
  ["home", "list", "cal", "his", "set", "add"].forEach(k => { $("v-" + k).hidden = k !== v; });
  document.querySelectorAll(".nav-b").forEach(b => b.setAttribute("aria-current", b.dataset.v === (v === "add" ? "list" : v)));
  if (v !== "set") resetSettingsPage();
  if (v !== shown) armIntro();
  shown = v;
  $("fab").hidden = !VIEWS[v] || v === "set";
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

const delErr = e => {
  const c = (e && e.code) || "";
  if (c === "auth/user-mismatch") return "ต้องยืนยันด้วยบัญชี Google เดียวกับที่ล็อกอินอยู่";
  if (c === "auth/popup-blocked") return "เบราว์เซอร์บล็อกหน้าต่างยืนยันตัวตน อนุญาตป๊อปอัปแล้วลองใหม่";
  if (c.startsWith("auth/")) return "ยืนยันตัวตนไม่สำเร็จ ลองใหม่อีกครั้ง";
  return "ลบบัญชีไม่สำเร็จ ลองใหม่อีกครั้ง";
};
const guestOn = () => { try { return localStorage.getItem("jb-guest") === "1"; } catch (e) { return false; } };
const setGuest = on => { try { if (on) localStorage.setItem("jb-guest", "1"); else localStorage.removeItem("jb-guest"); } catch (e) { /* ignore */ } };

/* ───── หลังล็อกอิน ───── */
function start(u) {
  if (activeUid === u.uid) return;
  stop();
  activeUid = u.uid;
  B.setMode(u.guest ? "local" : "cloud");
  S.user = { uid: u.uid, guest: !!u.guest, name: u.displayName || "", email: u.email || "", photo: u.photoURL || "" };
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
      B.saveSettings({ cats: defaultCats(), accts: [], rem: [3, 1, 0], cur: "THB", theme: S.theme, lang: S.lang, autoRate: true, rates: { USD: DEF_RATE.USD, EUR: DEF_RATE.EUR, JPY: DEF_RATE.JPY }, createdAt: Date.now() }).catch(onErr);
      return;
    }
    S.cats = Array.isArray(d.cats) && d.cats.length ? d.cats : defaultCats();
    S.accts = Array.isArray(d.accts) ? d.accts : [];
    S.rem = Array.isArray(d.rem) ? d.rem : [3, 1, 0];
    S.cur = d.cur || "THB";
    S.rates = { USD: DEF_RATE.USD, EUR: DEF_RATE.EUR, JPY: DEF_RATE.JPY, ...(d.rates || {}) };
    S.autoRate = d.autoRate !== false; S.ratesAt = d.ratesAt || 0;
    // ถ้าเพิ่งเลือกภาษา/ธีมจากแถบด้านบนก่อนล็อกอิน ให้ใช้ค่านั้นต่อ (แล้วบันทึกขึ้นบัญชีตอนเข้าแอป)
    if (!S.pre) {
      if (d.lang && d.lang !== S.lang) setLang(d.lang);
      if (d.theme && d.theme !== S.theme) { S.theme = d.theme; applyTheme(); }
    }
    gotUser = true; check();
  }, list => { S.subs = list; gotSubs = true; check(); }, onErr);
}
// เพิ่งล็อกอินและยังมีข้อมูลที่จดไว้ในโหมดลองใช้ → ถามว่าจะนำมาไว้ในบัญชีไหม
function offerMigration() {
  let seen = false;
  try { seen = sessionStorage.getItem("jb-mig") === "1"; } catch (e) { /* ignore */ }
  const snap = B.localSnapshot();
  if (seen || (S.user && S.user.guest) || !snap.subs.length) return;
  try { sessionStorage.setItem("jb-mig", "1"); } catch (e) { /* ignore */ }
  ask("นำข้อมูลที่ลองใช้ไปไว้ในบัญชีไหม?", "พบ " + snap.subs.length + " รายการที่จดไว้ในโหมดลองใช้บนเครื่องนี้ ต้องการนำมาไว้ในบัญชีนี้ไหม", "นำมาไว้ในบัญชี", async () => {
    try {
      await B.batch(snap.subs.map(({ id, ...r }) => ({ set: { ...r, id: B.newId() } })));
      const st = snap.settings || {};
      S.cats = [...S.cats, ...(st.cats || []).filter(c => !S.cats.some(x => x.n === c.n))];
      S.accts = [...S.accts, ...(st.accts || []).filter(a => !S.accts.some(x => x.id === a.id))];
      persist();
      B.clearLocal();
      toast("นำข้อมูลมาไว้ในบัญชีแล้ว");
    } catch (e) { console.error(e); toast("นำข้อมูลมาไม่สำเร็จ ลองใหม่อีกครั้ง"); }
  }, false);
}
function enter() {
  try { localStorage.setItem("jb-seen", "1"); } catch (e) { /* ignore */ }
  showApp();
  mountTopBar($("topbar"), appAccount);
  if (S.pre) { S.pre = false; persist(); }
  updateNavUser();
  show(viewFromHash());
  syncRates().then(ok => { if (ok) refresh(); });
  offerMigration();
}
function stop() {
  if (unsub) { unsub(); unsub = null; }
  ready = false; activeUid = null;
  Object.assign(S, { user: null, subs: [], accts: [], cats: defaultCats(), rem: [3, 1, 0], cur: "THB" });
}
async function doSignIn() {
  loginError("");
  try { await B.signIn(); } catch (e) { console.error(e); if (S.user && S.user.guest) toast(authErr(e)); else loginError(authErr(e)); }
}
function startGuest() {
  setGuest(true);
  start({ uid: "local", guest: true, displayName: "โหมดลองใช้", email: "", photoURL: "" });
}
function clearGuest() {
  B.clearLocal(); setGuest(false);
  stop();
  location.hash = "";
  renderLogin(doSignIn, startGuest);
  toast("ล้างข้อมูลในเครื่องแล้ว");
}
async function deleteAccount() {
  try { await B.reauth(); } catch (e) {
    if (e && e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") toast(delErr(e));
    return;
  }
  try {
    if (unsub) { unsub(); unsub = null; } // หยุดฟังข้อมูลก่อน ไม่งั้นแอปจะสร้างค่าเริ่มต้นกลับมาใหม่
    ready = false;
    renderSplash();
    await B.wipeAccount();
    try { localStorage.removeItem("jb-seen"); } catch (e) { /* ignore */ }
    activeUid = null;
    location.hash = "";
    toast("ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว");
  } catch (e) { console.error(e); renderError(delErr(e), () => location.reload()); }
}
async function signOut() {
  try { localStorage.removeItem("jb-seen"); } catch (e) { /* ignore */ }
  stop();
  try { await B.signOutUser(); } catch (e) { console.error(e); }
  location.hash = "";
}

/* ───── เริ่มต้น ───── */
async function boot() {
  try { S.theme = localStorage.getItem("jb-theme") || "system"; } catch (e) { /* ignore */ }
  applyTheme(false);
  initLang();
  window.addEventListener("langchange", () => { buildNav(); if (ready) { updateNavUser(); show(cur); } });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (S.theme === "system") applyTheme(false); });
  initUi(); initForm(); buildNav();
  const fab = h("button", "fab", null, [ico("plus", 26)]); // ปุ่มเพิ่มลอย (เฉพาะจอมือถือ)
  fab.id = "fab"; fab.type = "button"; fab.hidden = true; fab.setAttribute("aria-label", "เพิ่มรายการ");
  fab.onclick = () => { buzz(8); nav.openForm(); };
  $("app").append(fab);
  nav.go = go;
  nav.openForm = s => { formOpen = true; openForm(s); };
  nav.signOut = signOut;
  nav.signIn = doSignIn;
  nav.clearGuest = clearGuest;
  nav.deleteAccount = deleteAccount;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { refreshToday(); refresh(); }
  });
  if (!B.isConfigured()) { renderSetup(); return; }
  renderSplash();
  try { await B.init(); } catch (e) { console.error(e); renderError("โหลด Firebase ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่", () => location.reload()); return; }
  B.onAuth(u => {
    if (u) { setGuest(false); start(u); }
    else if (guestOn()) startGuest();
    else { stop(); renderLogin(doSignIn, startGuest); }
  });
}
boot();
