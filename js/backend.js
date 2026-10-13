// ชั้นเชื่อมต่อ Firebase (Auth + Firestore) ไฟล์เดียวที่แตะ Firebase SDK
import { firebaseConfig } from "./config.js";

const VER = "10.14.1";
const CDN = `https://www.gstatic.com/firebasejs/${VER}/`;
let AU, FS, auth, db, uid;

const clean = o => JSON.parse(JSON.stringify(o));

export const isConfigured = () =>
  !!(firebaseConfig && /^AIza/.test(firebaseConfig.apiKey || "") && firebaseConfig.projectId && !/^YOUR/i.test(firebaseConfig.projectId));

export async function init() {
  const [app, au, fs] = await Promise.all([
    import(CDN + "firebase-app.js"),
    import(CDN + "firebase-auth.js"),
    import(CDN + "firebase-firestore.js"),
  ]);
  AU = au; FS = fs;
  const a = app.initializeApp(firebaseConfig);
  auth = AU.getAuth(a);
  try {
    // เก็บแคชในเครื่อง ใช้งานออฟไลน์ได้และเปิดแอปไวขึ้น
    db = FS.initializeFirestore(a, { localCache: FS.persistentLocalCache({ tabManager: FS.persistentMultipleTabManager() }) });
  } catch (e) {
    db = FS.getFirestore(a);
  }
}

export const onAuth = cb => AU.onAuthStateChanged(auth, cb);

export async function signIn() {
  const p = new AU.GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  try {
    await AU.signInWithPopup(auth, p);
  } catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
      await AU.signInWithRedirect(auth, p);
    } else if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
      throw e;
    }
  }
}
export const signOutUser = () => AU.signOut(auth);

const uref = () => FS.doc(db, "users", uid);
const scol = () => FS.collection(db, "users", uid, "subs");

/* ───── โหมดลองใช้: เก็บข้อมูลในเครื่อง (localStorage) ไม่ต้องล็อกอิน ───── */
const LK = "jb-local";
let mode = "cloud", L = { user: null, subs: {} }, ls = [];
const lload = () => {
  try { const j = JSON.parse(localStorage.getItem(LK) || "null"); L = { user: (j && j.user) || null, subs: (j && j.subs) || {} }; } catch (e) { L = { user: null, subs: {} }; }
};
const lemit = () => ls.forEach(f => f());
const lsave = () => new Promise((ok, no) => {
  try { localStorage.setItem(LK, JSON.stringify(L)); setTimeout(lemit, 0); ok(); } catch (e) { no(e); }
});
export const setMode = m => { mode = m; };
export const localSnapshot = () => { lload(); return { settings: L.user, subs: Object.entries(L.subs).map(([id, d]) => ({ ...d, id })) }; };
export const clearLocal = () => { L = { user: null, subs: {} }; try { localStorage.removeItem(LK); } catch (e) { /* ignore */ } };

export function listen(userId, onUser, onSubs, onErr) {
  if (mode === "local") {
    lload();
    const f = () => { onUser(L.user); onSubs(Object.entries(L.subs).map(([id, d]) => ({ ...d, id }))); };
    ls.push(f);
    setTimeout(f, 0);
    return () => { ls = ls.filter(x => x !== f); };
  }
  uid = userId;
  const u1 = FS.onSnapshot(uref(), s => onUser(s.exists() ? s.data() : null), onErr);
  const u2 = FS.onSnapshot(scol(), s => onSubs(s.docs.map(d => ({ ...d.data(), id: d.id }))), onErr);
  return () => { u1(); u2(); };
}

export const saveSettings = data => {
  if (mode === "local") { L.user = { ...(L.user || {}), ...clean(data) }; return lsave(); }
  return FS.setDoc(uref(), clean(data), { merge: true });
};
export const newId = () => (mode === "local" ? "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) : FS.doc(scol()).id);
export const saveSub = s => {
  const { id, ...rest } = s;
  if (mode === "local") { L.subs[id] = clean(rest); return lsave(); }
  return FS.setDoc(FS.doc(scol(), id), clean(rest));
};
export const removeSub = id => {
  if (mode === "local") { delete L.subs[id]; return lsave(); }
  return FS.deleteDoc(FS.doc(scol(), id));
};

// ops: [{set: sub} | {del: id}] แบ่งเป็นชุดละ 400 รายการ
export async function batch(ops) {
  if (mode === "local") {
    for (const o of ops) { if (o.del) delete L.subs[o.del]; else { const { id, ...rest } = o.set; L.subs[id] = clean(rest); } }
    return lsave();
  }
  for (let i = 0; i < ops.length; i += 400) {
    const b = FS.writeBatch(db);
    for (const o of ops.slice(i, i + 400)) {
      if (o.del) b.delete(FS.doc(scol(), o.del));
      else { const { id, ...rest } = o.set; b.set(FS.doc(scol(), id), clean(rest)); }
    }
    await b.commit();
  }
}

/* ───── ลบบัญชี: ยืนยันตัวตนใหม่ → ลบรายการ → ลบค่าตั้งค่า → ลบผู้ใช้ ───── */
export async function reauth() {
  const u = auth && auth.currentUser;
  if (!u) throw Object.assign(new Error("no user"), { code: "auth/no-current-user" });
  const p = new AU.GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  await AU.reauthenticateWithPopup(u, p);
}
export async function wipeAccount() {
  const u = auth.currentUser;
  const snap = await FS.getDocs(scol());
  await batch(snap.docs.map(d => ({ del: d.id })));
  await FS.deleteDoc(uref());
  await AU.deleteUser(u);
}
