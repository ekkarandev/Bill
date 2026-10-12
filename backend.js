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

export function listen(userId, onUser, onSubs, onErr) {
  uid = userId;
  const u1 = FS.onSnapshot(uref(), s => onUser(s.exists() ? s.data() : null), onErr);
  const u2 = FS.onSnapshot(scol(), s => onSubs(s.docs.map(d => ({ ...d.data(), id: d.id }))), onErr);
  return () => { u1(); u2(); };
}

export const saveSettings = data => FS.setDoc(uref(), clean(data), { merge: true });
export const newId = () => FS.doc(scol()).id;
export const saveSub = s => { const { id, ...rest } = s; return FS.setDoc(FS.doc(scol(), id), clean(rest)); };
export const removeSub = id => FS.deleteDoc(FS.doc(scol(), id));

// ops: [{set: sub} | {del: id}] แบ่งเป็นชุดละ 400 รายการ
export async function batch(ops) {
  for (let i = 0; i < ops.length; i += 400) {
    const b = FS.writeBatch(db);
    for (const o of ops.slice(i, i + 400)) {
      if (o.del) b.delete(FS.doc(scol(), o.del));
      else { const { id, ...rest } = o.set; b.set(FS.doc(scol(), id), clean(rest)); }
    }
    await b.commit();
  }
}
