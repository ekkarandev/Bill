// สลับภาษา ไทย / English
// ตัวแอปเขียนเป็นภาษาไทย เมื่อเลือก English จะแปลข้อความบนหน้าจอตามพจนานุกรมในไฟล์นี้
// เพิ่ม/แก้คำแปล: แก้ที่ D (ข้อความตรงตัว) หรือ P (ข้อความที่มีตัวเลข/ชื่อแทรก)
import { S, MN, MS, WDN } from "./core.js";

const MN_TH = [...MN], MS_TH = [...MS], WDN_TH = [...WDN];
const MN_EN = "January February March April May June July August September October November December".split(" ");
const MS_EN = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const WDN_EN = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");

/* ───────── ข้อความตรงตัว ───────── */
const D = {
  // เมนู / หัวข้อ
  "ภาพรวม": "Overview", "รายการ": "List", "ปฏิทิน": "Calendar", "ประวัติ": "History", "ตั้งค่า": "Settings", "เมนูหลัก": "Main menu",
  "ปิด": "Close", "กลับ": "Back", "ยกเลิก": "Cancel", "บันทึก": "Save", "เพิ่ม": "Add", "แก้ไข": "Edit", "ลบ": "Delete", "นำเข้า": "Import",
  "เสร็จ": "Done", "จัดเรียง": "Reorder", "ลองใหม่": "Try again", "ผู้ใช้": "User", "จดบิล": "JotBill",
  "จดบิล – จดค่า Subscription ให้ไม่หลุดสักรายการ": "JotBill – never miss a subscription",
  // วันที่ / สถานะ
  "วันนี้": "Today", "พรุ่งนี้": "Tomorrow", "ตัดวันนี้": "Charges today", "หยุดชั่วคราว": "Paused", "สิ้นสุดแล้ว": "Ended",
  "อาทิตย์": "Sunday", "จันทร์": "Monday", "อังคาร": "Tuesday", "พุธ": "Wednesday", "พฤหัสบดี": "Thursday", "ศุกร์": "Friday", "เสาร์": "Saturday",
  "อา": "Su", "จ": "Mo", "อ": "Tu", "พ": "We", "พฤ": "Th", "ศ": "Fr", "ส": "Sa",
  "วัน": "Days", "สัปดาห์": "Weeks", "เดือน": "Months", "ปี": "Years", "ครั้ง": "times",
  // ภาพรวม
  "เริ่มจดรายการแรก": "Add your first subscription",
  "เพิ่ม subscription ที่ตัดเงินอัตโนมัติ แล้วแอปจะรวมยอดรายเดือนรายปี และบอกก่อนถึงวันตัดเงิน": "Add subscriptions that renew automatically. The app totals your monthly and yearly spend and reminds you before each charge.",
  "เพิ่มรายการแรก": "Add first item", "ลองเพิ่มข้อมูลตัวอย่าง": "Try sample data",
  "ใกล้ตัดเงินแล้ว": "Charging soon", "หักเดือนนี้": "Charged this month",
  "ต้องจ่ายเดือนนี้": "Due this month", "นับตามวันตัดจริง": "Counted by billing date",
  "เฉลี่ยต่อเดือน": "Monthly average", "รวมรายปีหารเฉลี่ยแล้ว": "Yearly plans averaged in",
  "รวมต่อปี": "Yearly total", "ประมาณการทั้งปี": "Estimate for the year",
  "รายการที่ใช้อยู่": "Active items", "ไม่นับที่หยุดชั่วคราว": "Excluding paused",
  "ตัดเงินถัดไป": "Up next", "ค่าใช้จ่ายต่อเดือนตามหมวด": "Monthly spend by category",
  "ช่วงทดลองใช้ฟรี": "Free trial", "วันที่เหลือ": "days left", "จ่ายแล้วเดือนนี้": "Paid this month",
  // รายการทั้งหมด
  "รายการทั้งหมด": "All items", "ทั้งหมด": "All", "รายเดือน": "Monthly", "รายปี": "Yearly", "อื่นๆ": "Other",
  "ค้นหา": "Search", "ค้นหา...": "Search…", "กรองหมวดหมู่": "Filter by category", "เรียงลำดับ": "Sort", "ทุกหมวด": "All categories",
  "ใกล้ตัดเงิน": "Soonest charge", "ราคาสูงสุด": "Highest price", "ชื่อ ก-ฮ": "Name A–Z",
  "ไม่พบรายการ ลองเปลี่ยนคำค้นหาหรือตัวกรอง": "No items found. Try a different search or filter.",
  "ยังไม่มีรายการ กดปุ่ม เพิ่ม เพื่อเริ่มจด": "No items yet. Tap Add to get started.",
  "เข้าสู่ระบบ": "Sign in", "ภาษาไทย": "Thai", "ตั้งค่าบัญชี": "Account settings",
  // ปัดแถว / ปุ่มลอย / การสั่น
  "หยุด": "Pause", "ต่อ": "Resume", "เพิ่มรายการ": "Add item",
  "เลื่อนรายการไปทางซ้ายเพื่อหยุดพักหรือลบ": "Swipe an item left to pause or delete",
  "การสั่นเมื่อกดปุ่ม": "Haptic feedback", "เปิดสั่น": "On", "ปิดสั่น": "Off",
  // โหมดลองใช้
  "เข้าสู่ระบบ": "Sign in", "ลองใช้ก่อน ไม่ต้องล็อกอิน": "Try it first, no sign-in", "โหมดลองใช้": "Trial mode",
  "ข้อมูลอยู่ในเครื่องนี้": "Data on this device only",
  "ใช้บัญชี Google เพื่อระบุว่าข้อมูลเป็นของใคร ไม่มีการโพสต์หรืออ่านอะไรจากบัญชีของคุณ ส่วนโหมดลองใช้จะเก็บข้อมูลในเครื่องนี้เท่านั้น เข้าสู่ระบบทีหลังแล้วนำมาไว้ในบัญชีได้": "Your Google account only identifies whose data this is. Nothing is posted or read from it. Trial mode keeps data on this device only, and you can sign in later to bring it into your account.",
  "โหมดลองใช้: ข้อมูลที่จดเก็บอยู่ในเครื่องนี้เท่านั้น": "Trial mode: your data is stored on this device only",
  "ถ้าล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง ข้อมูลจะหายไป เข้าสู่ระบบด้วย Google เพื่อสำรองและใช้ได้ทุกเครื่อง": "If you clear browser data or switch devices, your data is lost. Sign in with Google to back it up and use it on every device.",
  "ล้างข้อมูลในเครื่องนี้": "Clear data on this device", "ล้างข้อมูลในเครื่องนี้?": "Clear data on this device?",
  "รายการและการตั้งค่าที่จดไว้ในโหมดลองใช้จะถูกลบถาวร ย้อนกลับไม่ได้": "Everything you logged in trial mode will be deleted permanently. This can't be undone.",
  "ล้างข้อมูล": "Clear data", "ล้างข้อมูลในเครื่องแล้ว": "Data on this device cleared",
  "นำข้อมูลที่ลองใช้ไปไว้ในบัญชีไหม?": "Move your trial data into your account?", "นำมาไว้ในบัญชี": "Add to account",
  "นำข้อมูลมาไว้ในบัญชีแล้ว": "Trial data added to your account", "นำข้อมูลมาไม่สำเร็จ ลองใหม่อีกครั้ง": "Couldn't add the data. Please try again.",
  // ลบบัญชี
  "ลบบัญชีและข้อมูลทั้งหมด": "Delete account and all data", "ลบบัญชีและข้อมูลทั้งหมด?": "Delete account and all data?",
  "สิ่งที่จะถูกลบถาวร และกู้คืนไม่ได้:": "This will be permanently deleted and can't be recovered:",
  "หมวดหมู่ ช่องทางหักเงิน และการตั้งค่า": "Categories, payment methods and settings",
  "บัญชีผู้ใช้ของแอปนี้ (บัญชี Google ของคุณไม่ถูกลบ)": "Your account in this app (your Google account itself is not deleted)",
  "ดาวน์โหลดไฟล์สำรองก่อน": "Download a backup first", "พิมพ์ ลบ เพื่อยืนยัน": "Type delete to confirm",
  "พิมพ์คำว่า ลบ เพื่อยืนยัน": "Type the word delete to confirm",
  "ระบบจะให้เลือกบัญชี Google เพื่อยืนยันตัวตนอีกครั้งก่อนลบ": "You'll be asked to confirm with your Google account again before deleting.",
  "ลบบัญชีถาวร": "Delete account permanently",
  "การลบบัญชีจะลบรายการและการตั้งค่าทั้งหมดถาวร ย้อนกลับไม่ได้": "Deleting your account permanently removes all items and settings. This can't be undone.",
  "ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว": "Your account and all data have been deleted",
  "ต้องยืนยันด้วยบัญชี Google เดียวกับที่ล็อกอินอยู่": "Please confirm with the same Google account you're signed in with.",
  "เบราว์เซอร์บล็อกหน้าต่างยืนยันตัวตน อนุญาตป๊อปอัปแล้วลองใหม่": "Your browser blocked the confirmation window. Allow pop-ups and try again.",
  "ยืนยันตัวตนไม่สำเร็จ ลองใหม่อีกครั้ง": "Couldn't confirm your identity. Please try again.",
  "ลบบัญชีไม่สำเร็จ ลองใหม่อีกครั้ง": "Couldn't delete the account. Please try again.",
  // ฟอร์ม: การ์ดตัวอย่าง / ดึงโลโก้
  "บริการ": "Service", "ตัวอย่าง": "Preview", "ตัดครั้งแรก": "First charge", "จ่ายด้วย": "Paid with", "แจ้งเตือน": "Reminder",
  "ทุกเดือน": "Every month", "ทุกปี": "Every year", "เว็บไซต์ (ใช้ดึงโลโก้)": "Website (used to fetch the logo)",
  "พิมพ์โดเมน เช่น netflix.com แล้วแอปจะลองดึงโลโก้ให้": "Enter a domain like netflix.com and the app will try to fetch the logo.",
  "กำลังดึงโลโก้…": "Fetching logo…", "ดึงโลโก้แล้ว": "Logo fetched",
  "ดึงโลโก้ไม่ได้ อัปโหลดเองได้ที่ไอคอนซ้ายของชื่อบริการ": "Couldn't fetch the logo. You can upload one with the icon next to the name.",
  "โดเมนไม่ถูกต้อง ลองพิมพ์แบบ netflix.com": "That domain looks invalid. Try something like netflix.com.",
  // ปฏิทิน
  "วันตัดเงินของทุกรายการในเดือนนี้": "Billing dates for every item this month", "เดือนก่อน": "Previous month", "เดือนถัดไป": "Next month",
  "รวมเดือนนี้": "Month total", "ตัดเงิน": "Charges", "วันที่หนักสุด": "Heaviest day",
  "แตะวันเพื่อดูรายการ · วงส้ม = วันหมดช่วงทดลอง": "Tap a day to see items · orange ring = trial ends",
  "หมดช่วงทดลอง": "Trial ends", "หมดช่วงทดลองใช้ฟรี": "Free trial ends",
  "ไม่มีรายการในวันนี้": "No items on this day", "เดือนนี้ยังไม่มีรายการตัดเงิน": "No charges this month",
  // รายละเอียด
  "รายละเอียดรายการ": "Item details", "ตัดครั้งถัดไป": "Next charge", "ยอดต่อรอบ": "Amount per cycle", "ต่อปี": "Per year",
  "จ่ายไปแล้ว": "Paid so far", "หมวดหมู่": "Category", "ช่องทางหักเงิน": "Payment method", "หารกับคนอื่น": "Split with others",
  "วันสิ้นสุด": "End date", "เตือนล่วงหน้า": "Reminder", "โน้ต": "Note",
  "เปิดใช้ต่อ": "Resume", "ลบรายการ": "Delete item", "รายการนี้จะถูกลบถาวร": "This item will be permanently deleted.",
  "วันตัดเงิน": "Billing day", "ไม่เตือน": "No reminder", "กำหนดเอง": "Custom", "ตามตั้งค่า": "Default",
  // ฟอร์ม
  "เพิ่มรายการใหม่": "Add new item", "แก้ไขรายการ": "Edit item", "ชื่อบริการ": "Service name", "เพิ่มโลโก้": "Add logo",
  "เช่น Netflix, Spotify": "e.g. Netflix, Spotify", "รายละเอียดบริการ": "Service details",
  "แพลน (ไม่บังคับ)": "Plan (optional)", "เช่น Premium": "e.g. Premium", "เว็บไซต์ (ไม่บังคับ)": "Website (optional)", "เช่น netflix.com": "e.g. netflix.com",
  "สีประจำรายการ (ใช้เมื่อไม่มีโลโก้)": "Item color (used when there's no logo)",
  "ราคาและรอบการจ่าย": "Price and billing cycle", "ราคา": "Price", "สกุลเงิน": "Currency", "รอบการจ่าย": "Billing cycle",
  "รอบอื่น ๆ": "Custom cycle", "ทุก": "Every", "จำนวนรอบ": "Number of cycles", "หน่วย": "Unit",
  "วันตัดเงินครั้งแรก": "First billing date", "จัดหมวด": "Categorize", "ไม่ระบุ": "Not specified",
  "ตัวเลือกเพิ่มเติม": "More options", "มีช่วงทดลองใช้ฟรี": "Has a free trial", "หมดทดลองวันที่": "Trial ends on",
  "บัญชีที่แชร์กัน เช่น MS365 หรือ Netflix ครอบครัว": "Shared accounts, e.g. MS365 or a Netflix family plan",
  "ใส่แค่ชื่อเล่นพอ ไม่ต้องใส่อีเมลหรือข้อมูลส่วนตัวของคนอื่น": "A nickname is enough. No emails or personal info needed.",
  "เช่น บอส": "e.g. Boss", "ชื่อเล่น": "Nickname", "ลบคนนี้": "Remove this person", "จ่ายคนละ": "Each pays", "ถึง (ไม่บังคับ)": "Until (optional)",
  "＋ เพิ่มคน": "+ Add person", "หารเท่ากัน": "Split equally",
  "มีวันสิ้นสุด": "Has an end date", "กำหนดจำนวนครั้ง": "Set number of charges", "ถึงวันที่": "Until a date",
  "จำนวนครั้ง": "Number of charges", "วันที่สิ้นสุด": "End date",
  "เช่น ผ่อนสินค้า 10 งวด, สัญญา 12 เดือน, จ่ายล่วงหน้า 3 ครั้ง ใส่ยอดต่อครั้งในช่องราคา": "e.g. 10 installments, a 12-month contract, 3 prepaid charges. Enter the per-charge amount in the price field.",
  "ตั้งจำนวนครั้งหรือวันที่สิ้นสุด": "Set the number of charges or an end date",
  "เตือนรายการนี้": "Remind me about this item", "ปรับวันเตือน": "Adjust reminder days", "เช่น แชร์กับเพื่อน 4 คน": "e.g. Shared with 4 friends",
  "ใส่ชื่อบริการก่อน": "Enter a service name first", "ใส่ราคาก่อน": "Enter a price first", "เลือกวันตัดเงินครั้งแรก": "Pick the first billing date",
  "ใส่จำนวนครั้งหรือวันสิ้นสุด": "Enter the number of charges or an end date", "บันทึกการแก้ไขแล้ว": "Changes saved",
  // บัญชี / ช่องทางหักเงิน
  "บัญชีใหม่": "New account", "ประเภท": "Type", "ชื่อที่แสดง": "Display name", "เลขท้าย 4 ตัว": "Last 4 digits", "สี": "Color",
  "เพิ่มบัญชี": "Add account", "เพิ่มบัญชีแล้ว": "Account added",
  "บัตรเครดิต/เดบิต": "Credit/debit card", "กระเป๋าเงิน": "Wallet", "ธนาคาร": "Bank", "บิลมือถือ": "Mobile bill", "แอปสโตร์": "App store",
  "เงินสด": "Cash", "ธนาคารอื่น": "Other bank", "บิล AIS": "AIS bill", "บิล True": "True bill", "บิล dtac": "dtac bill",
  "กสิกรไทย (KBank)": "KBank", "ไทยพาณิชย์ (SCB)": "SCB", "กรุงไทย (Krungthai)": "Krungthai", "กรุงเทพ (Bangkok Bank)": "Bangkok Bank",
  "กรุงศรี (Krungsri)": "Krungsri", "ทีทีบี (ttb)": "ttb", "ออมสิน (GSB)": "GSB",
  // หมวดเริ่มต้น
  "บันเทิง": "Entertainment", "เพลง": "Music", "เกม": "Games", "งาน/ซอฟต์แวร์": "Work/Software", "คลาวด์": "Cloud",
  "สุขภาพ": "Health", "การศึกษา": "Education", "ข่าว/นิตยสาร": "News/Magazines", "โดเมนเว็บไซต์": "Website domain",
  // ประวัติ / กราฟ
  "รายการที่ตัดเงินไปแล้ว": "Charges that have already gone through", "ประวัติการจ่าย": "Payment history", "กราฟสรุป": "Charts",
  "ยังไม่มีประวัติการจ่าย": "No payment history yet",
  "เมื่อรายการผ่านวันตัดเงินไปแล้ว จะมาอยู่ที่นี่อัตโนมัติ ดูย้อนหลังได้ และลบออกได้ถ้าไม่ได้ตัดจริง": "Once an item's billing date has passed, it shows up here automatically. Browse past charges, or delete one if it wasn't actually charged.",
  "จ่ายไปแล้วรวม": "Total paid", "ล่าสุด": "Latest", "ดูเดือนก่อนหน้า": "Show earlier months",
  "ลบรายการนี้ออกจากประวัติ": "Remove this entry from history", "ลบรายการที่จ่ายแล้ว?": "Delete this payment?", "ลบออกจากประวัติแล้ว": "Removed from history",
  "ค่าใช้จ่ายตามหมวด": "Spending by category", "ยอดจ่ายรายเดือน 6 เดือนล่าสุด": "Monthly spending, last 6 months",
  "นับรวมรายการที่ยังไม่ถึงวันตัดของเดือนนั้นด้วย": "Includes charges not yet due in that month.",
  // ตั้งค่า
  "ทั่วไป": "General", "ธีม ภาษา สกุลเงิน และอัตราแลกเปลี่ยน": "Theme, language, currency and exchange rates",
  "ธีม ภาษา และสกุลเงินที่ใช้สรุปยอด": "Theme, language and the currency used for totals",
  "เพิ่ม แก้ชื่อ เปลี่ยนไอคอนได้ตามใจ": "Add, rename and change icons freely",
  "บัตรและกระเป๋าเงินที่ใช้จ่าย": "Cards and wallets you pay with",
  "ตั้งครั้งเดียว ใช้กับทุกรายการ": "Set once, applies to every item",
  "สำรอง นำเข้า และย้ายข้อมูล": "Back up, import and move data",
  "บัญชี Google และการออกจากระบบ": "Google account and sign out",
  "ธีม": "Theme", "สว่าง": "Light", "มืด": "Dark", "ตามระบบ": "System", "ภาษา": "Language",
  "สกุลเงินหลัก (ยอดรวมทุกหน้าจะแปลงเป็นสกุลนี้)": "Main currency (all totals are converted to this)",
  "อัตราแลกเปลี่ยน": "Exchange rates", "อัตโนมัติ": "Automatic", "ตั้งเอง": "Manual",
  "ใช้เรทที่ตั้งเอง ด้านล่างแก้ไขได้": "Using your own rates. You can edit them below.",
  "ยังไม่ได้ดึงเรท ใช้ค่าเริ่มต้นไปก่อน": "Rates not fetched yet. Using defaults for now.",
  "อัปเดตตอนนี้": "Update now", "อัปเดตเรทแล้ว": "Rates updated", "ดึงเรทไม่สำเร็จ ใช้เรทเดิมต่อไป": "Couldn't fetch rates. Keeping the current ones.",
  "โซนเวลา": "Time zone",
  "เพิ่ม แก้ชื่อ เปลี่ยนไอคอนได้ตามใจ ใช้ในตัวกรองและฟอร์ม": "Add, rename and change icons freely. Used in filters and forms.",
  "เพิ่มหมวด": "Add category", "เลื่อนขึ้น": "Move up", "เลื่อนลง": "Move down", "แก้หมวด": "Edit category", "ชื่อหมวดหมู่": "Category name",
  "ชื่อ": "Name", "ไอคอน": "Icon", "ลบหมวด": "Delete category", "ลบหมวดนี้ออกจากรายการ": "This category will be removed from the list.",
  "ต้องเหลืออย่างน้อย 1 หมวด": "Keep at least 1 category", "ใส่ชื่อหมวดก่อน": "Enter a category name first", "มีหมวดนี้แล้ว": "This category already exists",
  "บัตรและกระเป๋าเงินที่ใช้จ่าย เพื่อดูยอดรวมแยกตามช่องทาง": "Cards and wallets you pay with, to see totals by method",
  "เพิ่มช่องทาง": "Add method", "ยังไม่มีช่องทาง": "No payment methods yet", "ลบช่องทาง": "Delete method",
  "รายการที่ใช้ช่องทางนี้จะกลายเป็น ไม่ระบุ": "Items using this method will become Not specified.",
  "การแจ้งเตือน": "Notifications",
  "ตั้งครั้งเดียว ใช้กับทุกรายการ (ปรับเฉพาะรายการได้ตอนเพิ่มหรือแก้ไข)": "Set once for every item (adjustable per item when adding or editing)",
  "เตือนล่วงหน้าเป็นค่าเริ่มต้น": "Default reminder lead time",
  "รายการที่ใกล้ตัดเงินตามวันที่เลือกจะขึ้นเตือนที่หน้าภาพรวมทุกครั้งที่เปิดแอป ส่วนการเตือนทางอีเมลหรือมือถือเมื่อปิดแอปอยู่ต้องต่อบริการเพิ่ม (ดู README)": "Items nearing their billing date appear as a reminder on the Overview each time you open the app. Email or phone notifications while the app is closed need extra services (see README).",
  "ข้อมูล": "Data", "สำรองหรือย้ายข้อมูล ไฟล์นำเข้าได้ทั้งจากแอปนี้และจากเดโมรุ่นแรก": "Back up or move your data. You can import files from this app and from the first demo version.",
  "ดาวน์โหลดไฟล์สำรอง": "Download backup file", "เลือกไฟล์เพื่อนำเข้า": "Choose a file to import", "หรือวางข้อความ": "Or paste text",
  "วางข้อมูลสำรอง (JSON) ที่นี่ แล้วกดนำเข้า": "Paste backup data (JSON) here, then tap Import", "ข้อมูลสำรอง": "Backup data",
  "นำเข้าจากข้อความ": "Import from text", "ลบรายการทั้งหมด": "Delete all items", "ลบรายการทั้งหมด?": "Delete all items?",
  "ลบทั้งหมด": "Delete all", "ลบรายการทั้งหมดแล้ว": "All items deleted", "ไม่พบรายการในไฟล์": "No items found in the file",
  "รายการที่นำเข้าจะถูกเพิ่มต่อจากข้อมูลเดิม ไม่ทับของเดิม": "Imported items are added to your existing data. Nothing is overwritten.",
  "นำเข้าแล้ว": "Imported", "ไฟล์หรือข้อความไม่ถูกต้อง": "Invalid file or text",
  "เพิ่มข้อมูลตัวอย่างแล้ว ลบได้ภายหลัง": "Sample data added. You can delete it later.",
  "บัญชี": "Account", "ข้อมูลของคุณเก็บแยกตามบัญชี Google นี้ ซิงค์ทุกเครื่องที่ล็อกอิน": "Your data is stored per Google account and syncs across every device you sign in on.",
  "ออกจากระบบ": "Sign out",
  // หน้าเข้าสู่ระบบ
  "จดค่า Subscription ให้ไม่หลุดสักรายการ": "Never miss a single subscription",
  "รวมทุกรายการที่ตัดเงินอัตโนมัติไว้ที่เดียว เห็นยอดรายเดือนและรายปี แล้วรู้ล่วงหน้าก่อนถูกตัดเงินหรือก่อนหมดช่วงทดลองใช้": "Keep every auto-renewing charge in one place, see monthly and yearly totals, and know before you're charged or before a trial ends.",
  "เข้าสู่ระบบด้วย Google": "Sign in with Google",
  "เตือนก่อนตัดเงิน": "Charge reminders", "เลือกได้ว่าจะให้เตือนก่อนกี่วัน": "Choose how many days ahead to be reminded",
  "รวมหลายสกุลเงิน": "Multi-currency", "บาท ดอลลาร์ ยูโร เยน แปลงเป็นยอดเดียว": "Baht, dollars, euros and yen combined into one total",
  "หารกับเพื่อน": "Split with friends", "คิดเฉพาะส่วนที่คุณจ่ายจริง": "Counts only your actual share",
  "ใช้บัญชี Google เพื่อระบุว่าข้อมูลเป็นของใคร ไม่มีการโพสต์หรืออ่านอะไรจากบัญชีของคุณ": "Your Google account only identifies whose data this is. Nothing is posted or read from your account.",
  "เดือนนี้": "This month", "หารกับเพื่อนแล้ว": "Split with friends",
  "Google ไม่อนุญาตให้ล็อกอินในเบราว์เซอร์ของแอปแชต เปิดลิงก์นี้ใน Chrome หรือ Safari แทน": "Google doesn't allow sign-in inside chat-app browsers. Open this link in Chrome or Safari instead.",
  // ข้อผิดพลาด
  "อ่านข้อมูลไม่ได้เพราะยังไม่ได้ตั้ง Firestore rules ทำตาม README ข้อ 5 แล้วลองใหม่": "Can't read data because Firestore rules aren't set up yet. Follow README step 5 and try again.",
  "เชื่อมต่อ Firestore ไม่ได้ ตรวจสอบว่าสร้าง Firestore Database แล้ว (README ข้อ 4) และอินเทอร์เน็ตปกติ": "Can't connect to Firestore. Check that the database exists (README step 4) and that you're online.",
  "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ": "Unknown error",
  "โดเมนนี้ยังไม่ได้รับอนุญาต เพิ่มโดเมนใน Firebase Console › Authentication › Settings › Authorized domains": "This domain isn't authorized. Add it in Firebase Console › Authentication › Settings › Authorized domains.",
  "ยังไม่ได้เปิดใช้ Google Sign-in ใน Firebase Console › Authentication › Sign-in method": "Google Sign-in isn't enabled in Firebase Console › Authentication › Sign-in method.",
  "เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองใหม่อีกครั้ง": "No internet connection. Please try again.",
  "ใช้เวลานานเกินไป ตรวจสอบอินเทอร์เน็ตและการตั้งค่า Firestore": "Taking too long. Check your internet connection and Firestore setup.",
  "โหลด Firebase ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่": "Couldn't load Firebase. Check your internet connection and try again.",
  "เชื่อมต่อไม่สำเร็จ": "Connection failed", "ยังไม่ได้ตั้งค่า Firebase": "Firebase isn't set up yet",
  "บันทึกไม่ได้ ตรวจสอบ Firestore rules (ดู README ข้อ 5)": "Couldn't save. Check your Firestore rules (see README step 5).",
  "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง": "Couldn't save. Please try again.",
};
// ปุ่ม .btn ที่ความหมายต่างจากสถานะ
const D_BTN = { "หยุดชั่วคราว": "Pause" };

/* ───────── ข้อความที่มีตัวเลข/ชื่อแทรก ───────── */
const UNIT = { "วัน": ["day", "days"], "สัปดาห์": ["week", "weeks"], "เดือน": ["month", "months"], "ปี": ["year", "years"] };
const pl = (n, one, many) => n + " " + (+n === 1 ? one : many);
const P = [
  [/^พบ (\d+) รายการที่จดไว้ในโหมดลองใช้บนเครื่องนี้ ต้องการนำมาไว้ในบัญชีนี้ไหม$/, (_, n) => "Found " + pl(n, "item", "items") + " logged in trial mode on this device. Add them to this account?"],
  [/^รายการ subscription และประวัติทั้งหมด \((\d+) รายการ\)$/, (_, n) => "All subscriptions and history (" + pl(n, "item", "items") + ")"],
  [/^ทุก (\d+) (วัน|สัปดาห์|เดือน|ปี)$/, (_, n, u) => "Every " + (+n === 1 ? UNIT[u][0] : n + " " + UNIT[u][1])],
  [/^(อรุณสวัสดิ์|สวัสดียามบ่าย|สวัสดียามเย็น|ดึกแล้วนะ|สวัสดี)(?: (.+))?$/, (_, g, n) => ({ "อรุณสวัสดิ์": "Good morning", "สวัสดียามบ่าย": "Good afternoon", "สวัสดียามเย็น": "Good evening", "ดึกแล้วนะ": "Up late" }[g] || "Hello") + (n ? ", " + n : "")],
  [/^ตัดอีก (\d+) วัน$/, (_, n) => "Charges in " + pl(n, "day", "days")],
  [/^เริ่มหัก (.+) ถ้าไม่ยกเลิก$/, (_, p) => "Starts charging " + p + " unless cancelled"],
  [/^ถึง (.+)$/, (_, d) => "Until " + d],
  [/^ครั้งสุดท้าย (.+)$/, (_, d) => "Last charge " + d],
  [/^(\d+) คน · ส่วนของคุณ (.+)$/, (_, n, m) => pl(n, "person", "people") + " · your share " + m],
  [/^ส่วนของคุณ (.+)$/, (_, m) => "Your share " + m],
  [/^เปิดใช้ (.+) ต่อแล้ว$/, (_, n) => "Resumed " + n],
  [/^หยุด (.+) ชั่วคราวแล้ว$/, (_, n) => "Paused " + n],
  [/^ลบหมวด (.+)\?$/, (_, n) => "Delete category " + n + "?"],
  [/^รายการในหมวดนี้ (\d+) รายการจะย้ายไปหมวดอื่น$/, (_, n) => pl(n, "item", "items") + " in this category will move to another category."],
  [/^ลบ (\d+) รายการออกจากบัญชีนี้ถาวร ย้อนกลับไม่ได้$/, (_, n) => "This permanently deletes " + pl(n, "item", "items") + " from this account. It can't be undone."],
  [/^นำเข้า (\d+) รายการ\?$/, (_, n) => "Import " + pl(n, "item", "items") + "?"],
  [/^ลบ (.+) แล้ว$/, (_, n) => "Deleted " + n],
  [/^เพิ่ม (.+) แล้ว$/, (_, n) => "Added " + n],
  [/^ลบ (.+)\?$/, (_, n) => "Delete " + n + "?"],
  [/^ลบ (.+)$/, (_, n) => "Delete " + n],
  [/^1 (\w+) = \(บาท\)$/, (_, c) => "1 " + c + " = (THB)"],
  [/^อัปเดตล่าสุด (.+)$/, (_, d) => "Last updated " + d],
  [/^รายการวันที่ (.+)$/, (_, d) => "Items on " + d],
  [/^รายการเดือน(.+)$/, (_, m) => "Items in " + m],
  [/^(.+) มี (\d+) รายการ$/, (_, d, n) => d + ": " + pl(n, "item", "items")],
  [/^(.+) วันที่ (.+) จะถูกลบออกจากประวัติและยอดรวมของเดือนนั้น ตัวรายการยังอยู่ตามเดิม$/, (_, n, d) => n + " on " + d + " will be removed from the history and that month's total. The item itself stays."],
  [/^จากนั้นทุก(.*)$/, (_, r) => "Then every " + ({ "เดือน": "month", "ปี": "year" }[r] || tr(r.trim()))],
  [/^ตัดเงินครั้งแรก (.+) จะมีป้ายเตือนบนหน้าแรกก่อนหมดทดลอง$/, (_, d) => "First charge " + d + ". A reminder will appear on the home screen before the trial ends."],
  [/^ตัด (\d+) ครั้ง ถึง (.+)$/, (_, n, d) => pl(n, "charge", "charges") + ", until " + d],
  [/^ตัดทั้งหมด (\d+) ครั้ง · ครั้งสุดท้าย (.+)$/, (_, n, d) => pl(n, "charge", "charges") + " in total · last on " + d],
  [/^ทดลองใช้ เหลือ (\d+) วัน$/, (_, n) => "Trial · " + pl(n, "day", "days") + " left"],
  [/^เตือนก่อนตัดเงิน (\d+) วัน$/, (_, n) => "Reminder " + pl(n, "day", "days") + " before"],
  [/^เข้าสู่ระบบไม่สำเร็จ(.*)$/, (_, c) => "Sign-in failed" + c],
  [/^สี (#.+)$/, (_, c) => "Color " + c],
  [/^(กำหนดเอง|ตามตั้งค่า) · (.+)$/, (_, a, b) => ({ "กำหนดเอง": "Custom", "ตามตั้งค่า": "Default" }[a]) + " · " + tr(b)],
];
// ตัวเลข + หน่วย ที่แทรกอยู่กลางข้อความ
const TOK = [
  [/· หาร (\d+) คน/g, (_, n) => "· split " + n + " ways"],
  [/อีก (\d+) วัน/g, (_, n) => "in " + pl(n, "day", "days")],
  [/(\d+) รายการ/g, (_, n) => pl(n, "item", "items")],
  [/(\d+) ครั้ง/g, (_, n) => pl(n, "charge", "charges")],
  [/(\d+) คน/g, (_, n) => pl(n, "person", "people")],
  [/(\d+) (วัน|สัปดาห์|เดือน|ปี)/g, (_, n, u) => pl(n, ...UNIT[u])],
  [/\/ (วัน|สัปดาห์|เดือน|ปี)/g, (_, u) => "/ " + UNIT[u][0]],
];
const KEYS = Object.keys(D).filter(k => k.length >= 5).sort((a, b) => b.length - a.length);
const TH = /[\u0E00-\u0E3E\u0E40-\u0E7F]/; // ไม่นับ ฿
const cache = new Map();

export function tr(s, ctx) {
  const key = (ctx || "") + "\0" + s;
  if (cache.has(key)) return cache.get(key);
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), c = m[2];
  let r = (ctx === "btn" && D_BTN[c]) || D[c];
  if (r == null) for (const [re, f] of P) { const x = c.match(re); if (x) { r = f(...x); break; } }
  if (r == null) {
    r = c;
    for (const [re, f] of TOK) r = r.replace(re, f);
    if (TH.test(r)) for (const k of KEYS) if (r.includes(k)) r = r.split(k).join(D[k]);
  }
  const out = m[1] + r + m[3];
  if (cache.size > 3000) cache.clear();
  cache.set(key, out);
  return out;
}

/* ───────── แปลบน DOM (จำข้อความเดิมไว้ เพื่อสลับกลับเป็นไทยได้) ───────── */
const ATTR = ["placeholder", "aria-label", "title", "alt"];
const txt = new WeakMap(), att = new WeakMap();

function doText(n) {
  const e = txt.get(n), en = S.lang === "en";
  if (e && n.data === e.t) { if (!en) { n.data = e.o; txt.delete(n); } return; }
  if (e) txt.delete(n);
  if (!en || !TH.test(n.data)) return;
  const p = n.parentNode, t = tr(n.data, p && p.nodeName === "BUTTON" && p.classList.contains("btn") ? "btn" : "");
  if (t !== n.data) { txt.set(n, { o: n.data, t }); n.data = t; }
}
function doAttrs(el) {
  const en = S.lang === "en";
  for (const a of ATTR) {
    if (!el.hasAttribute(a)) continue;
    const v = el.getAttribute(a), m = att.get(el), e = m && m[a];
    if (e && v === e.t) { if (!en) { el.setAttribute(a, e.o); delete m[a]; } continue; }
    if (e) delete m[a];
    if (!en || !TH.test(v)) continue;
    const t = tr(v);
    if (t !== v) { let mm = m; if (!mm) { mm = {}; att.set(el, mm); } mm[a] = { o: v, t }; el.setAttribute(a, t); }
  }
}
function walk(n) {
  if (n.nodeType === 3) return doText(n);
  if (n.nodeType !== 1 || n.nodeName === "SCRIPT" || n.nodeName === "STYLE") return;
  doAttrs(n);
  n.childNodes.forEach(walk);
}

if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
  new MutationObserver(list => {
    if (S.lang !== "en") return;
    for (const m of list) {
      if (m.type === "characterData") doText(m.target);
      else if (m.type === "attributes") doAttrs(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR });
}

export function setLang(l) {
  S.lang = l === "en" ? "en" : "th";
  try { localStorage.setItem("jb-lang", S.lang); } catch (e) { /* ignore */ }
  const en = S.lang === "en";
  document.documentElement.lang = S.lang;
  MN.splice(0, 12, ...(en ? MN_EN : MN_TH));
  MS.splice(0, 12, ...(en ? MS_EN : MS_TH));
  WDN.splice(0, 7, ...(en ? WDN_EN : WDN_TH));
  walk(document.documentElement);
  window.dispatchEvent(new Event("langchange"));
}
export function initLang() {
  let l = "th";
  try { l = localStorage.getItem("jb-lang") || "th"; } catch (e) { /* ignore */ }
  if (l === "en") setLang("en");
}
