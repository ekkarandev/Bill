# จดบิล — แอปจด Subscription พร้อมล็อกอินด้วย Google

เว็บแอปจดค่า subscription ที่ตัดเงินอัตโนมัติ ดูยอดรายเดือน/รายปี เตือนก่อนตัดเงิน เตือนก่อนหมดช่วงทดลองใช้ รองรับหลายสกุลเงิน หารกับเพื่อน ใช้บนมือถือและคอมพิวเตอร์

- **ล็อกอิน:** Google เท่านั้น (Firebase Authentication)
- **ฐานข้อมูล:** Cloud Firestore ข้อมูลแยกเป็นรายบัญชี ซิงค์ทุกเครื่อง ใช้ออฟไลน์ได้
- **ไม่ต้อง build:** เป็นไฟล์ HTML/CSS/JS ล้วน วางบนโฮสต์ไหนก็ได้ที่เสิร์ฟไฟล์ static

```
index.html           หน้าเว็บหลัก
css/styles.css       ดีไซน์ทั้งหมด
js/config.js         ← ใส่ค่า Firebase ของคุณที่ไฟล์นี้ไฟล์เดียว
js/backend.js        ส่วนเชื่อมต่อ Firebase
js/core.js           state, การคำนวณวันตัดเงิน, ตัวช่วย
js/views.js          หน้าจอ: ภาพรวม รายการ ปฏิทิน ตั้งค่า เข้าสู่ระบบ
js/form.js           ฟอร์มเพิ่ม/แก้ไขรายการ
js/main.js           เริ่มต้นแอป, ระบบล็อกอิน, เปลี่ยนหน้า
firestore.rules      กฎความปลอดภัยของฐานข้อมูล
firebase.json        ตั้งค่าสำหรับ Firebase Hosting
manifest.webmanifest, icons/   ติดตั้งเป็นแอปบนมือถือ
```

---

## 1. สิ่งที่ต้องมี

- บัญชี Google (ใช้สร้างโปรเจกต์ Firebase)
- เบราว์เซอร์ และโปรแกรมแก้ไขข้อความ (เช่น VS Code หรือ Notepad)
- ไม่บังคับ: Node.js ถ้าจะใช้ `firebase-tools` เพื่อ deploy

แพ็กเกจ Spark (ฟรี) ของ Firebase พอสำหรับใช้ส่วนตัวหรือกลุ่มเล็ก ไม่ต้องผูกบัตรเครดิต

## 2. สร้างโปรเจกต์ Firebase

1. เข้า <https://console.firebase.google.com> แล้วกด **Create a project** (หรือ **Add project**)
2. ตั้งชื่อโปรเจกต์ เช่น `jotbill-ของฉัน`
3. ส่วน Google Analytics จะเปิดหรือปิดก็ได้ แอปนี้ไม่ได้ใช้

## 3. เปิด Google Sign-in และเอา config มาใส่

**เปิด Google Sign-in**

1. เมนูซ้าย **Build › Authentication** กด **Get started**
2. แท็บ **Sign-in method** เลือก **Google** → **Enable**
3. ใส่ **Project support email** (อีเมลของคุณ) แล้วกด **Save**

**ลงทะเบียน Web app และคัดลอก config**

1. กดไอคอนเฟือง › **Project settings** › เลื่อนลงที่ **Your apps** › กดไอคอน **`</>`** (Web)
2. ตั้งชื่อ app แล้วกด **Register app** (ไม่ต้องติ๊ก Firebase Hosting ตอนนี้ก็ได้)
3. จะเห็นโค้ดมี `const firebaseConfig = { ... }` ให้คัดลอกค่าข้างใน
4. เปิดไฟล์ `js/config.js` แล้ววางทับค่าตัวอย่าง ได้หน้าตาประมาณนี้

```js
export const firebaseConfig = {
  apiKey: "AIza.....",
  authDomain: "jotbill-xxxx.firebaseapp.com",
  projectId: "jotbill-xxxx",
  storageBucket: "jotbill-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

ค่าเหล่านี้ไม่ใช่ความลับ ใครเปิดเว็บก็เห็นได้ ความปลอดภัยของข้อมูลอยู่ที่ `firestore.rules` ในข้อ 5

## 4. สร้าง Firestore Database

1. เมนูซ้าย **Build › Firestore Database** กด **Create database**
2. เลือกที่ตั้ง (Location) แนะนำ `asia-southeast1` (สิงคโปร์) **เปลี่ยนภายหลังไม่ได้**
3. โหมดเริ่มต้นเลือก **Production mode** แล้วกด **Create**

## 5. ใส่กฎความปลอดภัย (สำคัญ ข้ามไม่ได้)

ถ้าไม่ทำข้อนี้ แอปจะขึ้น "อ่านข้อมูลไม่ได้" ทำได้ 2 วิธี เลือกวิธีเดียว

**วิธี A: วางในหน้าเว็บ**
1. **Firestore Database › แท็บ Rules**
2. ลบของเดิมแล้ววางเนื้อหาจากไฟล์ `firestore.rules` ทั้งไฟล์
3. กด **Publish**

**วิธี B: ใช้คำสั่ง** (ดูข้อ 7 วิธี A ประกอบ) `firebase deploy --only firestore:rules`

กฎนี้ทำให้ผู้ใช้อ่านและเขียนได้เฉพาะข้อมูลใต้ `users/<uid ของตัวเอง>` เท่านั้น คนอื่นเปิดดูข้อมูลของคุณไม่ได้

## 6. ลองรันในเครื่อง

ต้องเปิดผ่านเซิร์ฟเวอร์ (เปิดไฟล์ `index.html` ตรง ๆ ไม่ได้ เพราะใช้ ES modules) เปิดเทอร์มินัลในโฟลเดอร์โปรเจกต์ แล้วใช้อย่างใดอย่างหนึ่ง

```bash
python3 -m http.server 5173
# หรือ
npx serve .
```

เปิด <http://localhost:5173> แล้วลองกด "เข้าสู่ระบบด้วย Google" โดเมน `localhost` ได้รับอนุญาตอยู่แล้ว

## 7. เอาขึ้นเว็บ

เลือกอย่างใดอย่างหนึ่ง ทุกวิธีไม่ต้อง build

**วิธี A: Firebase Hosting (แนะนำ ทำต่อเนื่องจากข้างบน)**

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # เลือกโปรเจกต์ของคุณ
firebase deploy           # ส่งทั้งเว็บและ rules
```

ได้ลิงก์ `https://โปรเจกต์.web.app` ใช้ได้ทันที และโดเมนนี้ได้รับอนุญาตให้ล็อกอินอัตโนมัติ

**วิธี B: Netlify / Vercel / Cloudflare Pages**
ลากโฟลเดอร์โปรเจกต์ไปวาง (หรือเชื่อม Git) ตั้ง Build command ว่าง และ Publish directory เป็น `.` จากนั้นทำข้อ 8

**วิธี C: GitHub Pages**
อัปโหลดไฟล์ขึ้น repo แล้วเปิด Pages ที่ Settings › Pages จากนั้นทำข้อ 8

## 8. อนุญาตโดเมนของคุณให้ล็อกอินได้

ถ้าใช้โดเมนอื่นนอกจาก `*.web.app` / `*.firebaseapp.com` / `localhost`

1. **Authentication › Settings › Authorized domains**
2. กด **Add domain** แล้วใส่โดเมน เช่น `jotbill.netlify.app` หรือ `bill.example.com`

ถ้าไม่ทำ ตอนกดล็อกอินจะขึ้นข้อความว่าโดเมนยังไม่ได้รับอนุญาต

## 9. ติดตั้งเป็นแอปบนมือถือ

- **Android (Chrome):** เมนู ⋮ › **Add to Home screen / Install app**
- **iPhone (Safari):** ปุ่มแชร์ › **Add to Home Screen**

---

## ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| หน้า "ยังไม่ได้ตั้งค่า Firebase" | ยังไม่ได้ใส่ค่าใน `js/config.js` (ข้อ 3) |
| "อ่านข้อมูลไม่ได้เพราะยังไม่ได้ตั้ง Firestore rules" | ยังไม่ได้ทำข้อ 5 |
| "เชื่อมต่อ Firestore ไม่ได้" | ยังไม่ได้สร้าง Firestore Database (ข้อ 4) หรืออินเทอร์เน็ตมีปัญหา |
| "โดเมนนี้ยังไม่ได้รับอนุญาต" | เพิ่มโดเมนที่ข้อ 8 |
| "ยังไม่ได้เปิดใช้ Google Sign-in" | เปิดที่ข้อ 3 |
| กดล็อกอินแล้ว Google ขึ้นว่าเบราว์เซอร์ไม่ปลอดภัย | เปิดลิงก์ใน Chrome/Safari แทนเบราว์เซอร์ในแอป LINE, Facebook, Instagram |
| หน้าจอว่างตอนเปิดไฟล์ตรง ๆ | ต้องเปิดผ่านเซิร์ฟเวอร์ (ข้อ 6) |
| ป๊อปอัปล็อกอินถูกบล็อก | แอปจะสลับไปใช้การ redirect ให้เอง หรืออนุญาตป๊อปอัปให้เว็บนี้ |

## ข้อมูลที่เก็บใน Firestore

```
users/{uid}                 การตั้งค่า: หมวดหมู่, ช่องทางหักเงิน, วันเตือน, สกุลเงินหลัก, อัตราแลกเปลี่ยน, ธีม
users/{uid}/subs/{id}       รายการ subscription (1 เอกสารต่อ 1 รายการ)
```

ผู้ใช้ย้ายหรือสำรองข้อมูลได้เองที่ **ตั้งค่า › ข้อมูล** (ดาวน์โหลด/นำเข้าไฟล์ JSON ไฟล์สำรองจากเดโมรุ่นแรกก็นำเข้าได้)

## สิ่งที่ยังไม่มี (ต่อยอดได้)

- **การแจ้งเตือนเมื่อปิดแอป (อีเมล / push):** ตอนนี้แอปเตือนที่หน้าภาพรวมเมื่อเปิดใช้งาน ถ้าต้องการส่งอีเมลหรือ push จริง ต้องเพิ่ม Cloud Functions แบบตั้งเวลา (Firebase ต้องใช้แพ็กเกจ Blaze แบบจ่ายตามใช้ในการ deploy Functions) คู่กับบริการส่งอีเมล หรือ Firebase Cloud Messaging
- **สลับภาษา English:** ข้อความทั้งหมดเป็นภาษาไทย
- **อัตราแลกเปลี่ยน:** ตั้งเองได้ที่ตั้งค่า แอปไม่ดึงเรทสด
- **ลบบัญชีล็อกอินถาวร:** ปุ่มลบรายการทั้งหมดลบข้อมูลได้ แต่ตัวบัญชีผู้ใช้ลบได้ที่ Firebase Console › Authentication › Users

## ปรับแต่ง

- สีและฟอนต์อยู่ที่ตัวแปรต้นไฟล์ `css/styles.css`
- ชื่อแอปและข้อความหน้าเข้าสู่ระบบอยู่ใน `js/views.js` (ฟังก์ชัน `renderLogin`) และ `index.html`
- เปลี่ยนเวอร์ชัน Firebase SDK ที่ `js/backend.js` (ตัวแปร `VER`)
