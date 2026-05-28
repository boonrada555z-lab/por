# คู่มือเชื่อมต่อ Google Sheet สำหรับ AppPortal

AppPortal ใช้ **Google Sheets เป็นฐานข้อมูลหลัก** ผ่าน **Google Apps Script (Web App)**  
แอปบน Vercel จะเรียก API ของ Apps Script เพื่ออ่าน/เขียนข้อมูล — ไม่ใช้ไฟล์ JSON หรือ localStorage เก็บข้อมูลอีกต่อไป

---

## สารบัญ

1. [โครงสร้าง Google Sheet](#1-โครงสร้าง-google-sheet)
2. [สร้าง Apps Script](#2-สร้าง-apps-script)
3. [โค้ด Apps Script (วางใน Code.gs)](#3-โค้ด-apps-script-วางใน-codegs)
4. [Deploy เป็น Web App](#4-deploy-เป็น-web-app)
5. [ตั้งค่า Vercel Environment Variables](#5-ตั้งค่า-vercel-environment-variables)
6. [Deploy โปรเจกต์บน Vercel](#6-deploy-โปรเจกต์บน-vercel)
7. [ทดสอบการเชื่อมต่อ](#7-ทดสอบการเชื่อมต่อ)
8. [แก้ปัญหาที่พบบ่อย](#8-แก้ปัญหาที่พบบ่อย)

---

## 1. โครงสร้าง Google Sheet

สร้าง Spreadsheet ใหม่ (หรือใช้ของเดิม) แล้วสร้าง **3 แผ่นงาน (Sheets)** ดังนี้:

### แผ่น `Buttons` (ข้อมูลปุ่มลิงก์)

| คอลัมน์ | ชื่อหัวตาราง | ตัวอย่าง |
|--------|-------------|----------|
| A | id | 1779465679291 |
| B | name | PharmCalc pro |
| C | url | https://example.com |
| D | color | blue |
| E | size | medium |
| F | icon | 💊 |
| G | category | OPD |
| H | isPriority | false |
| I | clicks | 0 |
| J | description | คำอธิบาย |
| K | lastActive | Active Now |

แถวที่ 1 ต้องเป็นหัวตาราง (header) ข้อมูลเริ่มแถวที่ 2

### แผ่น `Categories` (หมวดหมู่)

| A |
|---|
| name |
| OPD |
| IPD |
| IV |
| DIS |
| ผู้ช่วย |
| อื่นๆ |

### แผ่น `Settings` (การแจ้งเตือน Pop-up)

| A | B |
|---|---|
| key | value |
| notification_enabled | false |
| notification_message | |

---

## 2. สร้าง Apps Script

1. เปิด Google Sheet ของคุณ
2. เมนู **Extensions** → **Apps Script**
3. ลบโค้ดเดิมใน `Code.gs` แล้ววางโค้ดด้านล่างทั้งหมด
4. ไปที่ **Project Settings** (ไอคอนเฟือง) → **Script properties** → เพิ่ม:

| Property | ค่า |
|----------|-----|
| `API_SECRET` | รหัสลับที่คุณตั้งเอง เช่น `bph-portal-2026-xK9mZ` (ต้องตรงกับ `GAS_API_SECRET` บน Vercel) |

5. บันทึกโปรเจกต์ Apps Script

---

## 3. โค้ด Apps Script (วางใน Code.gs)

```javascript
/**
 * AppPortal – Google Sheets API Backend
 * Deploy เป็น Web App แล้วใส่ URL ใน Vercel env: GAS_WEB_APP_URL
 */

const SHEET_BUTTONS = 'Buttons';
const SHEET_CATEGORIES = 'Categories';
const SHEET_SETTINGS = 'Settings';

const BUTTON_HEADERS = [
  'id', 'name', 'url', 'color', 'size', 'icon',
  'category', 'isPriority', 'clicks', 'description', 'lastActive'
];

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSecret_() {
  return PropertiesService.getScriptProperties().getProperty('API_SECRET') || '';
}

function checkSecret_(secret) {
  const expected = getSecret_();
  if (!expected || secret !== expected) {
    throw new Error('Unauthorized: invalid API secret');
  }
}

function jsonResponse_(data, code) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function ok_(data) {
  return jsonResponse_({ ok: true, data: data });
}

function fail_(message, code) {
  return jsonResponse_({ ok: false, error: message });
}

// ---------- GET handlers ----------

function doGet(e) {
  try {
    const action = (e.parameter.action || '').trim();
    const secret = (e.parameter.secret || '').trim();
    checkSecret_(secret);

    switch (action) {
      case 'status':
        return ok_(getStatus_());
      case 'getButtons':
        return ok_(getButtons_());
      case 'getCategories':
        return ok_(getCategories_());
      case 'getNotification':
        return ok_(getNotification_());
      default:
        return fail_('Unknown action: ' + action);
    }
  } catch (err) {
    return fail_(err.message || String(err));
  }
}

// ---------- POST handlers ----------

function doPost(e) {
  try {
    const body = e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
    const action = (body.action || '').trim();
    const secret = (body.secret || '').trim();
    checkSecret_(secret);

    switch (action) {
      case 'saveButtons':
        return ok_(saveButtons_(body.buttons || []));
      case 'saveCategories':
        return ok_(saveCategories_(body.categories || []));
      case 'saveNotification':
        return ok_(saveNotification_(body.notification || {}));
      default:
        return fail_('Unknown action: ' + action);
    }
  } catch (err) {
    return fail_(err.message || String(err));
  }
}

// ---------- Status ----------

function getStatus_() {
  const ss = getSpreadsheet_();
  const buttons = getButtons_();
  return {
    connected: true,
    spreadsheetId: ss.getId(),
    rowCount: buttons.length
  };
}

// ---------- Buttons ----------

function getSheet_(name) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_BUTTONS) {
      sheet.getRange(1, 1, 1, BUTTON_HEADERS.length).setValues([BUTTON_HEADERS]);
    } else if (name === SHEET_CATEGORIES) {
      sheet.getRange(1, 1).setValue('name');
      sheet.getRange(2, 1, 7, 1).setValues([
        ['OPD'], ['IPD'], ['IV'], ['DIS'], ['ผู้ช่วย'], ['อื่นๆ']
      ]);
    } else if (name === SHEET_SETTINGS) {
      sheet.getRange(1, 1, 3, 2).setValues([
        ['key', 'value'],
        ['notification_enabled', 'false'],
        ['notification_message', '']
      ]);
    }
  }
  return sheet;
}

function getButtons_() {
  const sheet = getSheet_(SHEET_BUTTONS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, BUTTON_HEADERS.length).getValues();
  return values
    .map(function(row) {
      return {
        id: String(row[0] || ''),
        name: String(row[1] || ''),
        url: String(row[2] || ''),
        color: String(row[3] || 'blue'),
        size: String(row[4] || 'medium'),
        icon: String(row[5] || '💊'),
        category: String(row[6] || 'OPD'),
        isPriority: row[7] === true || String(row[7]).toLowerCase() === 'true',
        clicks: Number(row[8] || 0),
        description: String(row[9] || ''),
        lastActive: String(row[10] || '')
      };
    })
    .filter(function(btn) { return btn.id && btn.name; });
}

function saveButtons_(buttons) {
  const sheet = getSheet_(SHEET_BUTTONS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, BUTTON_HEADERS.length).setValues([BUTTON_HEADERS]);

  if (!buttons || buttons.length === 0) {
    return { count: 0 };
  }

  const rows = buttons.map(function(b) {
    return [
      b.id,
      b.name,
      b.url,
      b.color || 'blue',
      b.size || 'medium',
      b.icon || '💊',
      b.category || 'OPD',
      String(!!b.isPriority),
      String(Number(b.clicks || 0)),
      b.description || '',
      b.lastActive || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, BUTTON_HEADERS.length).setValues(rows);
  return { count: buttons.length };
}

// ---------- Categories ----------

function getCategories_() {
  const sheet = getSheet_(SHEET_CATEGORIES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return values
    .map(function(row) { return String(row[0] || '').trim(); })
    .filter(Boolean);
}

function saveCategories_(categories) {
  const sheet = getSheet_(SHEET_CATEGORIES);
  sheet.clearContents();
  sheet.getRange(1, 1).setValue('name');

  const cleaned = (categories || [])
    .map(function(c) { return String(c).trim(); })
    .filter(Boolean);

  if (cleaned.length > 0) {
    const rows = cleaned.map(function(c) { return [c]; });
    sheet.getRange(2, 1, rows.length, 1).setValues(rows);
  }
  return { count: cleaned.length };
}

// ---------- Notification ----------

function getSettingsMap_() {
  const sheet = getSheet_(SHEET_SETTINGS);
  const lastRow = sheet.getLastRow();
  const map = {};
  if (lastRow < 2) return map;

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  values.forEach(function(row) {
    map[String(row[0])] = row[1];
  });
  return map;
}

function getNotification_() {
  const map = getSettingsMap_();
  return {
    enabled: map.notification_enabled === true ||
      String(map.notification_enabled).toLowerCase() === 'true',
    message: String(map.notification_message || '').trim()
  };
}

function saveNotification_(notification) {
  const sheet = getSheet_(SHEET_SETTINGS);
  sheet.clearContents();
  sheet.getRange(1, 1, 3, 2).setValues([
    ['key', 'value'],
    ['notification_enabled', String(!!notification.enabled)],
    ['notification_message', String(notification.message || '').trim()]
  ]);
  return { saved: true };
}
```

> **หมายเหตุ:** Apps Script ผูกกับ Spreadsheet ที่เปิดอยู่ (`getActiveSpreadsheet`) ดังนั้นต้องสร้าง Script จากเมนู **Extensions → Apps Script** ภายใน Sheet นั้นโดยตรง

---

## 4. Deploy เป็น Web App

1. ใน Apps Script คลิก **Deploy** → **New deployment**
2. ประเภท: **Web app**
3. ตั้งค่า:
   - **Execute as:** `Me` (บัญชีของคุณ)
   - **Who has access:** `Anyone` (หรือ Anyone with Google account ถ้าต้องการจำกัด)
4. คลิก **Deploy** แล้วคัดลอก **Web app URL**  
   รูปแบบ: `https://script.google.com/macros/s/AKfycb.../exec`
5. ใส่ URL นี้ใน Vercel เป็น `GAS_WEB_APP_URL`

ทุกครั้งที่แก้โค้ด Apps Script ต้อง **Deploy → Manage deployments → Edit → New version → Deploy** ใหม่

---

## 5. ตั้งค่า Vercel Environment Variables

ใน Vercel Dashboard → โปรเจกต์ → **Settings** → **Environment Variables**:

| ตัวแปร | ค่า | บังคับ |
|--------|-----|--------|
| `GAS_WEB_APP_URL` | URL จากขั้นตอนที่ 4 | ใช่ |
| `GAS_API_SECRET` | ค่าเดียวกับ `API_SECRET` ใน Script Properties | ใช่ |
| `SPREADSHEET_ID` | ID จาก URL ของ Sheet (`/d/THIS_PART/edit`) | ไม่บังคับ (ใช้แสดงลิงก์) |

สำหรับพัฒนาในเครื่อง สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
# แก้ค่า GAS_WEB_APP_URL และ GAS_API_SECRET
npm run dev
```

---

## 6. Deploy โปรเจกต์บน Vercel

### วิธีที่ 1: ผ่าน GitHub

1. Push โค้ดขึ้น GitHub
2. Import โปรเจกต์ใน [vercel.com](https://vercel.com)
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. ใส่ Environment Variables ตามข้อ 5
7. Deploy

### วิธีที่ 2: Vercel CLI

```bash
npm i -g vercel
vercel
vercel env add GAS_WEB_APP_URL
vercel env add GAS_API_SECRET
vercel --prod
```

โครงสร้าง API บน Vercel:

```
/api/buttons          GET, POST
/api/buttons/sync-sheet   POST
/api/categories       GET, POST
/api/notification     GET, POST
/api/sheet-status     GET
```

---

## 7. ทดสอบการเชื่อมต่อ

### ทดสอบ Apps Script โดยตรง (ในเบราว์เซอร์)

แทนที่ `YOUR_SECRET` และ `YOUR_DEPLOY_URL`:

```
YOUR_DEPLOY_URL?action=status&secret=YOUR_SECRET
```

ควรได้ JSON ประมาณ:

```json
{"ok":true,"data":{"connected":true,"spreadsheetId":"...","rowCount":5}}
```

### ทดสอบผ่าน Vercel (หลัง deploy)

เปิดในเบราว์เซอร์ (แทนที่โดเมนของคุณ):

```
https://YOUR-APP.vercel.app/api/health
```

ถ้าสำเร็จจะเห็น `"connected": true` และ `spreadsheetId`

### ทดสอบผ่านแอป

1. รัน `npm run dev` แล้วเปิด `http://localhost:3000`
2. เข้าสู่ระบบ (รหัสผ่านเริ่มต้นในแอป)
3. เปิดโหมด Admin → ดูแดชบอร์ดสถานะ Google Sheet
4. เพิ่ม/แก้ปุ่ม แล้วตรวจใน Sheet ว่าข้อมูลอัปเดต

> **สำคัญ:** หลังเพิ่ม Environment Variables บน Vercel ต้องกด **Redeploy** ทุกครั้ง (ค่า env ไม่มีผลกับ deployment เก่า)

---

## 8. แก้ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|--------|--------|
| ใส่ env แล้วยังไม่เชื่อม | กด **Deployments → Redeploy** บน Vercel (บังคับ) |
| `Unauthorized: invalid API secret` | ตรวจว่า `GAS_API_SECRET` บน Vercel ตรงกับ `API_SECRET` ใน Script Properties (ไม่มีช่องว่าง) |
| ได้ HTML แทน JSON | URL ต้องเป็น **Web app** ลงท้าย `/exec` ไม่ใช่ `/dev` (Test deployment) |
| บันทึกไม่เข้า Sheet | ตรวจ Deploy: **Execute as: Me**, **Who has access: Anyone** |
| `Unknown action` | Deploy Apps Script ใหม่ (New version) แล้วอัปเดต URL ใน Vercel |
| ข้อมูลไม่อัปเดตหลังแก้ Script | Deploy Web App ใหม่ (New version) |
| Sheet ว่างหลัง deploy | ตรวจชื่อแผ่นงาน: `Buttons`, `Categories`, `Settings` (ตัวพิมพ์ใหญ่-เล็กตรงกัน) |
| Vercel API 502 | เปิด `/api/health` ดู `error` แล้วดู Logs ใน Vercel → Functions |
| แก้ไขแล้วแต่ Sheet ไม่เปลี่ยน | ดูแถบสีแดงในโหมด Admin จะแสดงข้อความ error จาก API |

---

## สรุปการไหลของข้อมูล

```
[เบราว์เซอร์ AppPortal]
        ↓  fetch /api/*
[Vercel Serverless Functions]
        ↓  POST/GET + secret
[Google Apps Script Web App]
        ↓  SpreadsheetApp
[Google Sheet: Buttons | Categories | Settings]
```

ข้อมูลทั้งหมดอยู่บน Google Sheet เท่านั้น — ไม่มี `buttons-db.json`, Supabase หรือ localStorage สำหรับเก็บข้อมูลแอปอีกต่อไป
