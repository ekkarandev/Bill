// ฟอร์มเพิ่ม / แก้ไขรายการ
import { brandOf, cardColor, markEl } from "./brands.js";
import {
  NEUTRAL, $, h, svg, S, nav, COL, PCOL, PAYG, UN, SYM, iso, prs, TD, addD, dstr, fdate, nth, bdg, acc, payTxt, remTxt,
  toast, sheet, closeSheet, fld, remChips, persist, saveSub, newId,
} from "./core.js";

const opt = (ic, bg, id, title) =>
  `<div class="or"><span class="oi" style="background:${bg}">${svg(ic, 22)}</span><span class="ot"><label for="${id}">${title}</label><small class="os" id="s${id.slice(1)}" hidden></small></span><input type="checkbox" class="tg" id="${id}"></div>`;

// การ์ดตัวอย่างด้านขวา (เฉพาะจอกว้าง): เห็นผลทันทีที่กรอก พร้อมปุ่มยกเลิก/เพิ่ม
const PREV = `<aside class="prevc" aria-label="ตัวอย่าง"><div class="st">ตัวอย่าง</div>
  <div class="card pv">
    <div class="pv-h"><div class="lg" id="pvLg"></div><b id="pvNm">ชื่อบริการ</b></div>
    <div class="pv-p"><b id="pvPr">฿0.00</b><span id="pvCy">ทุกเดือน</span></div>
    <div class="pv-l">
      <div id="pvPmW" hidden><span>โปรโมชัน</span><b id="pvPm"></b></div>
      <div id="pvAfW" hidden><span>จากนั้น</span><b id="pvAf"></b></div>
      <div><span>ตัดครั้งแรก</span><b id="pvF"></b></div>
      <div><span>หมวดหมู่</span><b id="pvC"></b></div>
      <div><span>จ่ายด้วย</span><b id="pvP"></b></div>
      <div><span>แจ้งเตือน</span><b id="pvR"></b></div>
    </div>
    <div class="sbtn"><button type="button" id="pvNo">ยกเลิก</button><button type="button" class="dk" id="pvOk">เพิ่มรายการ</button></div>
  </div></aside>`;

const TPL = `
<div class="ah"><button id="back" type="button" class="icb" aria-label="กลับ">${svg("chevL", 24)}</button><h1 id="fTitle">เพิ่มรายการใหม่</h1><button class="dk" id="save" type="button">เพิ่ม</button></div>
<div class="fgrid"><div class="fcol"><div class="st" style="margin-top:16px">บริการ</div>
<div class="card">
  <label for="nm" style="margin-top:0">ชื่อบริการ</label>
  <div class="nr"><label class="lgb" id="lgb" title="เพิ่มโลโก้"><input type="file" accept="image/*" id="lgf"><span id="lgp">${svg("upload", 22)}</span></label><input id="nm" placeholder="เช่น Netflix, Spotify" maxlength="40" autocomplete="off"></div>
  <details id="det"><summary>รายละเอียดบริการ</summary>
    <label for="pl">แพลน (ไม่บังคับ)</label><input id="pl" placeholder="เช่น Premium" maxlength="40">
    <label for="ws">เว็บไซต์ (ใช้ดึงโลโก้)</label><input id="ws" placeholder="เช่น netflix.com" maxlength="80" autocapitalize="off" autocorrect="off">
    <p class="fine" id="wsS" style="margin:6px 0 0">พิมพ์โดเมน เช่น netflix.com แล้วแอปจะลองดึงโลโก้ให้</p>
    <label>สีประจำรายการ (ใช้เมื่อไม่มีโลโก้)</label><div class="sw" id="sw"></div>
    <p class="fine" style="margin:8px 0 0">ไม่เลือกก็ได้ จะแสดงเป็นสีเทา แตะสีที่เลือกซ้ำเพื่อล้าง</p>
  </details>
</div>
<div class="st">ราคาและรอบการจ่าย</div>
<div class="card">
  <label for="price" style="margin-top:0">ราคา</label>
  <div class="pr"><input id="price" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00"><select id="cur" aria-label="สกุลเงิน"><option>THB</option><option>USD</option><option>EUR</option><option>JPY</option></select></div>
  <label>รอบการจ่าย</label>
  <div class="seg" id="cyc"><button type="button" data-c="m">รายเดือน</button><button type="button" data-c="y">รายปี</button><button type="button" data-c="c">รอบอื่น ๆ</button></div>
  <div class="cu" id="bCu" hidden><span>ทุก</span><input id="ck" type="number" min="1" value="1" aria-label="จำนวนรอบ"><select id="cu" aria-label="หน่วย"><option value="d">วัน</option><option value="w">สัปดาห์</option><option value="m">เดือน</option><option value="y">ปี</option></select></div>
  <label for="first">วันตัดเงินครั้งแรก</label><input id="first" type="date">
  <p class="fine" id="hint" style="margin:8px 0 0"></p>
</div>
<div class="st">จัดหมวด</div>
<div class="card">
  <button type="button" class="pick" id="pCat"><span class="pi" id="piC">📦</span><span class="pt"><small>หมวดหมู่</small><b id="vCat">อื่นๆ</b></span><span class="mut">${svg("chevR", 18)}</span></button>
  <button type="button" class="pick" id="pPay"><span class="pi" id="piP">${svg("card", 20)}</span><span class="pt"><small>ช่องทางหักเงิน</small><b id="vPay">ไม่ระบุ</b></span><span class="mut">${svg("chevR", 18)}</span></button>
</div>
<div class="st">ตัวเลือกเพิ่มเติม</div>
<div class="card">
  <div class="opt">${opt("gift", "#f5a900", "tTrial", "มีช่วงทดลองใช้ฟรี")}
    <div class="ob" id="bTrial" hidden><div class="chips" id="tC"><button type="button" data-d="7">7 วัน</button><button type="button" data-d="14">14 วัน</button><button type="button" data-d="30">30 วัน</button><button type="button" data-d="60">60 วัน</button></div><label for="trialD">หมดทดลองวันที่</label><input id="trialD" type="date"></div></div>
  <div class="opt">${opt("tag", "#8b5cf6", "tPromo", "ราคาโปรโมชัน")}
    <div class="ob" id="bPromo" hidden><p class="fine" style="margin:0 0 10px">ช่องราคาด้านบนคือราคาเต็ม (ราคาหลังโปรหมด) กรอกราคาโปรและจำนวนรอบที่ใช้ราคานี้</p><div class="tr2"><div style="flex:1;min-width:0"><label for="pPr" style="margin-top:0">ราคาโปร (ต่อรอบ)</label><input id="pPr" type="number" min="0" step="any" inputmode="decimal" placeholder="เช่น 99"></div><div style="flex:1;min-width:0"><label for="pN" style="margin-top:0">ใช้กี่รอบ</label><input id="pN" type="number" min="1" value="3" inputmode="numeric"></div></div></div></div>
  <div class="opt">${opt("users", "#10b981", "tShare", "หารกับคนอื่น")}
    <div class="ob" id="bShare" hidden><p class="fine" style="margin:0">ใส่แค่ชื่อเล่นพอ ไม่ต้องใส่อีเมลหรือข้อมูลส่วนตัวของคนอื่น</p><div id="ppl"></div><div class="chips"><button type="button" class="o" id="addP">＋ เพิ่มคน</button><button type="button" class="o" id="eqP" disabled>หารเท่ากัน</button></div><p class="fine" id="mine" style="margin:12px 0 0"></p></div></div>
  <div class="opt">${opt("flag", "#0ea5e9", "tEnd", "มีวันสิ้นสุด")}
    <div class="ob" id="bEnd" hidden><div class="chips" id="eM"><button type="button" data-m="n">กำหนดจำนวนครั้ง</button><button type="button" data-m="d">ถึงวันที่</button></div><div class="tr2" id="eNw" style="margin-top:12px"><input id="eN" type="number" min="1" value="12" style="width:110px;text-align:center" aria-label="จำนวนครั้ง"><span class="mut">ครั้ง</span></div><div id="eDw" style="margin-top:12px" hidden><input id="endD" type="date" aria-label="วันที่สิ้นสุด"></div><p class="fine">เช่น ผ่อนสินค้า 10 งวด, สัญญา 12 เดือน, จ่ายล่วงหน้า 3 ครั้ง ใส่ยอดต่อครั้งในช่องราคา</p><p id="eSum" style="font-weight:700;margin:0"></p></div></div>
  <div class="opt">${opt("bell", "#f43f5e", "tRem", "เตือนรายการนี้")}
    <div class="ob" id="bRem"><button type="button" class="lnk" id="remAdj" style="padding:0">ปรับวันเตือน</button><div id="remC" hidden style="margin-top:10px"></div></div></div>
  <div class="opt">${opt("note", "#f97316", "tNote", "โน้ต")}
    <div class="ob" id="bNote" hidden><textarea id="note" rows="3" maxlength="200" placeholder="เช่น แชร์กับเพื่อน 4 คน" aria-label="โน้ต"></textarea></div></div>
</div></div>${PREV}</div>`;

let lgAuto = true, cyc = "m", col = "", lg = "", curCat = "อื่นๆ", curPay = "", endM = "n", trialN = 7;
let remSel = [], remCustom = false, P = [], editing = null;

const hint = () => {
  $("hint").textContent = "จากนั้นทุก" + (cyc === "m" ? "เดือน" : cyc === "y" ? "ปี" : " " + ($("ck").value || 1) + " " + UN[$("cu").value]);
};
const ft = () => ($("tTrial").checked && $("trialD").value ? $("trialD").value : $("first").value);
const draftSub = () => ({
  first: ft(), cy: cyc,
  k: cyc === "c" ? Math.max(1, parseInt($("ck").value) || 1) : 1,
  u: cyc === "c" ? $("cu").value : cyc,
});
function endInfo() {
  const d = draftSub();
  if (!d.first) return null;
  const f = prs(d.first);
  if (endM === "n") { const n = Math.max(1, parseInt($("eN").value) || 1); return { n, last: nth(d, f, n - 1) }; }
  const e = $("endD").value;
  if (!e) return null;
  const ed = prs(e);
  let n = 0, last = null;
  for (let i = 0; i < 5000; i++) { const x = nth(d, f, i); if (x > ed) break; n++; last = x; }
  return n ? { n, last } : null;
}

// ราคาโปรโมชันที่กรอกอยู่ (null ถ้าปิดอยู่หรือกรอกไม่ครบ)
function promoOf() {
  if (!$("tPromo").checked) return null;
  const p = parseFloat($("pPr").value), n = parseInt($("pN").value);
  return p >= 0 && n >= 1 ? { price: p, n } : null;
}
// อัปเดตการ์ดตัวอย่าง
function prev() {
  if (!$("pvNm")) return;
  const nm = $("nm").value.trim(), pr = parseFloat($("price").value) || 0, cu = $("cur").value, l = $("pvLg"), a = acc(curPay);
  l.textContent = ""; l.className = "lg" + (lg || nm ? "" : " empty");
  l.style.background = lg || !nm ? "transparent" : col || NEUTRAL;
  if (lg) { const i = new Image(); i.src = lg; i.alt = ""; l.append(i); } else if (nm) l.textContent = nm[0].toUpperCase();
  $("pvNm").textContent = nm || "ชื่อบริการ"; $("pvNm").classList.toggle("ph", !nm);
  const f2 = x => SYM[cu] + x.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), pm = promoOf();
  const cyT = cyc === "m" ? "ทุกเดือน" : cyc === "y" ? "ทุกปี" : "ทุก " + (parseInt($("ck").value) || 1) + " " + UN[$("cu").value];
  $("pvPr").textContent = f2(pm ? pm.price : pr);
  $("pvCy").textContent = cyT;
  $("pvPmW").hidden = $("pvAfW").hidden = !pm;
  if (pm) { $("pvPm").textContent = pm.n + " ครั้งแรก"; $("pvAf").textContent = f2(pr) + " / " + (cyc === "m" ? "เดือน" : cyc === "y" ? "ปี" : (parseInt($("ck").value) || 1) + " " + UN[$("cu").value]); }
  $("pvF").textContent = ft() ? fdate(ft()) : "—";
  $("pvC").textContent = curCat;
  $("pvP").textContent = a ? payTxt(a) : "ไม่ระบุ";
  $("pvR").textContent = $("tRem").checked ? remTxt(remSel) : "ไม่เตือน";
  $("pvOk").textContent = editing ? "บันทึก" : "เพิ่มรายการ";
}
function upd() {
  hint();
  const sub = (id, on, t) => { $(id).hidden = !on; $(id).textContent = t; }, c = i => $(i).checked;
  sub("sTrial", c("tTrial"), "ตัดเงินครั้งแรก " + fdate(ft()) + " จะมีป้ายเตือนบนหน้าแรกก่อนหมดทดลอง");
  sub("sShare", c("tShare"), "บัญชีที่แชร์กัน เช่น MS365 หรือ Netflix ครอบครัว");
  const e = c("tEnd") ? endInfo() : null;
  sub("sEnd", c("tEnd"), e ? "ตัด " + e.n + " ครั้ง ถึง " + dstr(e.last).split(" ")[1] + " " + String(e.last.getFullYear()).slice(-2) : "ตั้งจำนวนครั้งหรือวันที่สิ้นสุด");
  $("eSum").textContent = e ? "ตัดทั้งหมด " + e.n + " ครั้ง · ครั้งสุดท้าย " + fdate(iso(e.last)) : "";
  sub("sRem", c("tRem"), (remCustom ? "กำหนดเอง" : "ตามตั้งค่า") + " · " + remTxt(remSel));
  sub("sNote", c("tNote"), "เช่น แชร์กับเพื่อน 4 คน");
  const pm = promoOf(), cu0 = SYM[$("cur").value], pr0 = parseFloat($("price").value) || 0;
  sub("sPromo", c("tPromo"), pm ? cu0 + pm.price.toLocaleString("th-TH") + " × " + pm.n + " ครั้งแรก · จากนั้น " + cu0 + pr0.toLocaleString("th-TH") : "ใส่ราคาโปรและจำนวนรอบ");
  const pr = parseFloat($("price").value) || 0;
  $("mine").textContent = "ส่วนของคุณ " + SYM[$("cur").value] + Math.max(0, pr - P.reduce((a, p) => a + (+p.amt || 0), 0)).toLocaleString("th-TH");
  $("vCat").textContent = curCat;
  $("piC").textContent = (S.cats.find(x => x.n === curCat) || { e: "📦" }).e;
  const a = acc(curPay);
  $("vPay").textContent = a ? payTxt(a) : "ไม่ระบุ";
  const pp = $("piP"); pp.textContent = "";
  if (a) pp.append(markEl(a.type, "sm")); else pp.innerHTML = svg("card", 20);
  prev();
}
function setCyc(c) {
  cyc = c;
  document.querySelectorAll("#cyc button").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === c));
  $("bCu").hidden = c !== "c";
  upd();
}
function setEM(m) {
  endM = m;
  document.querySelectorAll("#eM button").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === m));
  $("eNw").hidden = m !== "n";
  $("eDw").hidden = m !== "d";
  upd();
}
function setTN(n) {
  trialN = n;
  document.querySelectorAll("#tC button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.d === n));
  if (n) $("trialD").value = iso(addD(prs($("first").value || iso(TD)), n));
}
const setCol = c => {
  col = c;
  document.querySelectorAll("#sw button").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === c));
};
const WS_HINT = "พิมพ์โดเมน เช่น netflix.com แล้วแอปจะลองดึงโลโก้ให้";
// ดึงโลโก้จากโดเมนเว็บไซต์ (ต้องเป็นบริการที่อนุญาต CORS เพื่อย่อเป็นไฟล์เล็กเก็บในแอปได้) ถ้าไม่ได้ก็บอกให้อัปโหลดเอง
const domOf = v => v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
const LOGO_SRC = d => ["https://icon.horse/icon/" + d, "https://www.google.com/s2/favicons?domain=" + d + "&sz=128"];
async function fetchLogo(d) {
  for (const u of LOGO_SRC(d)) {
    try {
      const im = await new Promise((ok, no) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = no; i.src = u; setTimeout(() => no(new Error("timeout")), 7000); });
      if (im.width < 16) continue;
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const x = c.getContext("2d"), sc = Math.max(64 / im.width, 64 / im.height);
      x.drawImage(im, (64 - im.width * sc) / 2, (64 - im.height * sc) / 2, im.width * sc, im.height * sc);
      const url = c.toDataURL("image/webp", 0.85);
      if (url.startsWith("data:image/")) return url;
    } catch (e) { /* ลองแหล่งถัดไป */ }
  }
  return "";
}
async function autoLogo() {
  const d = domOf($("ws").value), st = $("wsS");
  if (!d) { st.textContent = WS_HINT; return; }
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) { st.textContent = "โดเมนไม่ถูกต้อง ลองพิมพ์แบบ netflix.com"; return; }
  if (lg && !lgAuto) { st.textContent = WS_HINT; return; } // มีโลโก้ที่อัปโหลดเองแล้ว ไม่ทับ
  st.textContent = "กำลังดึงโลโก้…";
  const url = await fetchLogo(d);
  if (domOf($("ws").value) !== d) return; // ผู้ใช้แก้โดเมนระหว่างรอ
  if (url) { setLogo(url); lgAuto = true; st.textContent = "ดึงโลโก้แล้ว"; upd(); }
  else { if (lgAuto && lg) { setLogo(""); upd(); } st.textContent = "ดึงโลโก้ไม่ได้ อัปโหลดเองได้ที่ไอคอนซ้ายของชื่อบริการ"; } // โลโก้เก่าที่ดึงมาเองจากโดเมนก่อนหน้า ล้างทิ้ง
}
function setLogo(url) {
  lg = url || "";
  $("lgb").style.backgroundImage = lg ? "url(" + lg + ")" : "";
  $("lgp").hidden = !!lg;
}

function drawP() {
  const w = $("ppl");
  w.textContent = "";
  P.forEach((p, i) => {
    const n = h("input"), d = h("button", "x"), a = h("input"), u = h("input");
    d.innerHTML = svg("trash", 18);
    n.placeholder = "เช่น บอส"; n.value = p.name; n.maxLength = 20; n.setAttribute("aria-label", "ชื่อเล่น");
    n.oninput = () => { p.name = n.value; };
    d.type = "button"; d.setAttribute("aria-label", "ลบคนนี้");
    d.onclick = () => { P.splice(i, 1); drawP(); upd(); };
    a.type = "number"; a.min = 0; a.step = "any"; a.value = p.amt;
    a.oninput = () => { p.amt = a.value; };
    u.type = "date"; u.value = p.until || "";
    u.oninput = () => { p.until = u.value; };
    w.append(h("div", "pc", null, [h("div", "nr", null, [n, d]), fld("จ่ายคนละ", a), fld("ถึง (ไม่บังคับ)", u)]));
  });
  $("eqP").disabled = !P.length;
}
function drawRem() {
  const w = $("remC");
  w.textContent = "";
  w.append(remChips(remSel, () => { remCustom = true; upd(); }));
}

/* ───── ตัวเลือกหมวด / ช่องทางหักเงิน ───── */
function orow(ic, t, on, fn) {
  const i = h("span", "oic");
  if (ic instanceof Node) i.append(ic); else if (ic.startsWith("<")) i.innerHTML = ic; else i.textContent = ic;
  const b = h("button", "orow" + (on ? " on" : ""), null, [i, h("span", "otx", t), h("span", "ck", on ? "✓" : "")]);
  b.type = "button";
  b.onclick = fn;
  return b;
}
export function newAcct(after) {
  let touched = false, picked = false, c = PCOL[0];
  const sel = h("select"), b = h("div", "bdg"), nm = h("input"), l4 = h("input"), sw = h("div", "sw");
  PAYG.forEach(g => {
    const og = document.createElement("optgroup");
    og.label = g[0];
    g[1].split("|").forEach(t => og.append(new Option(t, t)));
    sel.append(og);
  });
  sel.id = "npt"; nm.value = sel.value; nm.maxLength = 30; l4.placeholder = "1234"; l4.maxLength = 4; l4.inputMode = "numeric";
  const bc = () => (brandOf(sel.value) || {}).c;
  const paint = () => {
    b.textContent = ""; b.append(markEl(sel.value));
    sw.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x.dataset.c === c));
  };
  // สีแรกในชุดสีคือสีแบรนด์ของช่องทางที่เลือก (ถ้ามี)
  const sws = () => {
    const bcol = bc(), list = bcol ? [bcol, ...PCOL.filter(k => k !== bcol)] : PCOL;
    sw.textContent = "";
    list.forEach(k => {
      const x = h("button"); x.type = "button"; x.dataset.c = k; x.style.background = k;
      x.setAttribute("aria-label", "สี " + k); x.onclick = () => { c = k; picked = true; paint(); }; sw.append(x);
    });
  };
  sel.onchange = () => { if (!touched) nm.value = sel.value; if (!picked) c = bc() || PCOL[0]; sws(); paint(); };
  nm.oninput = () => { touched = true; };
  c = bc() || PCOL[0]; sws(); paint();
  const no = h("button", null, "ยกเลิก"), ok = h("button", "dk", "เพิ่มบัญชี");
  no.type = ok.type = "button";
  no.onclick = closeSheet;
  ok.onclick = () => {
    const a = { id: "a" + Date.now().toString(36), type: sel.value, name: nm.value.trim() || sel.value, last4: l4.value.replace(/\D/g, "").slice(0, 4), color: c };
    S.accts = [...S.accts, a];
    persist();
    closeSheet();
    toast("เพิ่มบัญชีแล้ว");
    if (after) after(a);
  };
  const lb = h("label", null, "ประเภท"); lb.htmlFor = "npt"; lb.style.marginTop = "0";
  sheet("บัญชีใหม่", h("div", null, null, [lb, h("div", "tr2", null, [b, sel]), h("div", "two", null, [fld("ชื่อที่แสดง", nm), fld("เลขท้าย 4 ตัว", l4)]), h("label", null, "สี"), sw, h("div", "sbtn", null, [no, ok])]));
}

/* ───── เปิดฟอร์ม ───── */
function reset() {
  ["nm", "pl", "ws", "price", "note", "endD"].forEach(i => { $(i).value = ""; });
  $("cur").value = "THB"; $("first").value = iso(TD); $("ck").value = 1; $("cu").value = "m"; $("eN").value = 12;
  document.querySelectorAll(".tg").forEach(c => { c.checked = false; c.onchange(); });
  P = []; drawP();
  remSel = S.rem.slice(); remCustom = false; drawRem(); $("remC").hidden = true;
  curCat = (S.cats.find(c => c.n === "อื่นๆ") || S.cats[0]).n; curPay = "";
  setEM("n"); setTN(7); setCyc("m"); setCol(""); $("det").open = false; $("pPr").value = ""; $("pN").value = 3; setLogo(""); lgAuto = true; $("wsS").textContent = WS_HINT;
}
function fill(s) {
  reset();
  $("nm").value = s.name; $("pl").value = s.plan || ""; $("ws").value = s.site || "";
  $("price").value = s.price; $("cur").value = s.cur; $("first").value = s.start || s.first;
  setCyc(s.cy); $("ck").value = s.cy === "c" ? s.k : 1; $("cu").value = s.cy === "c" ? s.u : "m";
  setCol(s.color || ""); setLogo(s.logo); lgAuto = !s.logo;
  $("det").open = !!(s.plan || s.site || s.color);
  if (s.promo && s.promo.n > 0) { $("tPromo").checked = true; $("pPr").value = s.promo.price; $("pN").value = s.promo.n; }
  curCat = s.cat || curCat; curPay = s.pay || "";
  if (s.trial) { $("tTrial").checked = true; $("trialD").value = s.trial; setTN(0); }
  if ((s.ppl || []).length) { $("tShare").checked = true; P = s.ppl.map(p => ({ name: p.name, amt: p.amt, until: p.until || "" })); drawP(); }
  if (s.end) { $("tEnd").checked = true; $("endD").value = s.end; $("eN").value = s.endN || 12; setEM(s.endN ? "n" : "d"); }
  $("tRem").checked = s.rem !== -1;
  if (Array.isArray(s.rem)) { remSel = s.rem.slice(); remCustom = true; drawRem(); }
  if (s.note) { $("tNote").checked = true; $("note").value = s.note; }
  document.querySelectorAll(".tg").forEach(c => c.onchange());
  upd();
}
export function openForm(sub) {
  editing = sub || null;
  if (sub) fill(sub); else reset();
  $("fTitle").textContent = sub ? "แก้ไขรายการ" : "เพิ่มรายการใหม่";
  $("save").textContent = sub ? "บันทึก" : "เพิ่ม";
  upd();
  nav.go("add");
}

function save() {
  const name = $("nm").value.trim(), price = parseFloat($("price").value), g = i => $(i).checked, f = ft();
  if (!name) return toast("ใส่ชื่อบริการก่อน");
  if (!(price >= 0)) return toast("ใส่ราคาก่อน");
  if (!f) return toast("เลือกวันตัดเงินครั้งแรก");
  const e = g("tEnd") ? endInfo() : null;
  if (g("tEnd") && !e) return toast("ใส่จำนวนครั้งหรือวันสิ้นสุด");
  if (g("tPromo") && !promoOf()) return toast("ใส่ราคาโปรและจำนวนรอบ");
  const d = draftSub();
  const sub = {
    id: editing ? editing.id : newId(),
    name, plan: $("pl").value.trim(), site: $("ws").value.trim(), color: col, logo: lg,
    price, promo: g("tPromo") ? promoOf() : null, cur: $("cur").value, cy: cyc, k: d.k, u: d.u, first: f, start: $("first").value,
    cat: curCat, pay: curPay,
    trial: g("tTrial") ? $("trialD").value : "",
    ppl: g("tShare") ? P.filter(p => p.name.trim() || +p.amt).map(p => ({ name: p.name.trim(), amt: +p.amt || 0, until: p.until || "" })) : [],
    end: e ? iso(e.last) : "", endN: e && endM === "n" ? e.n : 0,
    rem: !g("tRem") ? -1 : remCustom ? remSel.slice() : null,
    note: g("tNote") ? $("note").value.trim() : "",
    paused: editing ? !!editing.paused : false,
    pausedAt: editing ? editing.pausedAt || "" : "",
    skip: editing ? editing.skip || [] : [],
    createdAt: editing && editing.createdAt ? editing.createdAt : Date.now(),
  };
  saveSub(sub);
  toast(editing ? "บันทึกการแก้ไขแล้ว" : "เพิ่ม " + name + " แล้ว");
  nav.go("list");
}

export function initForm() {
  $("v-add").innerHTML = TPL;
  COL.forEach(c => {
    const b = h("button"); b.type = "button"; b.style.background = c; b.dataset.c = c;
    b.setAttribute("aria-label", "สี " + c); b.onclick = () => setCol(col === c ? "" : c); $("sw").append(b);
  });
  document.querySelectorAll("#cyc button").forEach(b => { b.onclick = () => setCyc(b.dataset.c); });
  document.querySelectorAll(".tg").forEach(c => { c.onchange = () => { $("b" + c.id.slice(1)).hidden = !c.checked; }; });
  document.querySelectorAll("#eM button").forEach(b => { b.onclick = () => setEM(b.dataset.m); });
  document.querySelectorAll("#tC button").forEach(b => { b.onclick = () => { setTN(+b.dataset.d); upd(); }; });
  $("trialD").oninput = () => setTN(0);
  $("first").addEventListener("change", () => { if ($("tTrial").checked && trialN) setTN(trialN); });
  $("tTrial").addEventListener("change", () => { if ($("tTrial").checked) setTN(trialN || 7); });
  $("remAdj").onclick = () => { $("remC").hidden = false; };
  $("v-add").addEventListener("input", upd);
  $("v-add").addEventListener("change", upd);
  $("addP").onclick = () => { P.push({ name: "", amt: "", until: "" }); drawP(); upd(); };
  $("eqP").onclick = () => {
    const pr = parseFloat($("price").value);
    if (!(pr > 0)) return toast("ใส่ราคาก่อน");
    const e = Math.round(pr / (P.length + 1) * 100) / 100;
    P.forEach(p => { p.amt = e; });
    drawP(); upd();
  };
  $("pCat").onclick = () => {
    const w = h("div");
    S.cats.forEach(c => w.append(orow(c.e, c.n, c.n === curCat, () => { curCat = c.n; closeSheet(); upd(); })));
    sheet("หมวดหมู่", w);
  };
  $("pPay").onclick = () => {
    const w = h("div");
    w.append(orow("–", "ไม่ระบุ", !curPay, () => { curPay = ""; closeSheet(); upd(); }));
    S.accts.forEach(a => w.append(orow(markEl(a.type, "sm"), payTxt(a), curPay === a.id, () => { curPay = a.id; closeSheet(); upd(); })));
    w.append(orow(svg("plus", 20), "บัญชีใหม่", false, () => newAcct(a => { curPay = a.id; upd(); })));
    sheet("ช่องทางหักเงิน", w);
  };
  $("lgf").onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const x = c.getContext("2d"), sc = Math.max(64 / im.width, 64 / im.height);
        x.drawImage(im, (64 - im.width * sc) / 2, (64 - im.height * sc) / 2, im.width * sc, im.height * sc);
        setLogo(c.toDataURL("image/webp", 0.85)); lgAuto = false; upd();
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  };
  $("back").onclick = () => nav.go("list");
  $("save").onclick = save;
  $("pvNo").onclick = () => nav.go("list");
  $("pvOk").onclick = save;
  $("ws").addEventListener("change", autoLogo);
}
