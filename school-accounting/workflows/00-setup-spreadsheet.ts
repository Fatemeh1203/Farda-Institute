import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

const GS_CRED = { id: '3SQAvMC4NM0Q506Y', name: 'Google Sheets account 5' };

const startSetup = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'شروع راه‌اندازی', position: [-460, 0] },
  output: [{}],
});

const buildStructure = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'ساخت ساختار اسپردشیت',
    position: [-240, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const SHEETS = [
  ['راهنما', [0.60, 0.60, 0.60]],
  ['تنظیمات', [0.20, 0.45, 0.75]],
  ['مدرسین', [0.25, 0.65, 0.45]],
  ['کلاس‌ها', [0.25, 0.65, 0.45]],
  ['سرمایه‌گذاران', [0.55, 0.35, 0.75]],
  ['جلسات_تدریس', [0.95, 0.75, 0.20]],
  ['درآمد', [0.30, 0.75, 0.35]],
  ['هزینه‌ها', [0.90, 0.40, 0.35]],
  ['آورده_سرمایه', [0.55, 0.35, 0.75]],
  ['حقوق_مدرسین', [0.95, 0.60, 0.20]],
  ['گزارش_ماهانه', [0.20, 0.45, 0.75]],
  ['گزارش_دوره‌ای', [0.20, 0.45, 0.75]],
  ['ارزش_سرمایه', [0.55, 0.35, 0.75]],
  ['شاخص_سالانه', [0.45, 0.45, 0.45]],
  ['لاگ_ورودی', [0.70, 0.70, 0.70]]
];

const payload = {
  properties: {
    title: 'حسابداری آموزشگاه علمی فردا',
    timeZone: 'Asia/Tehran',
    autoRecalc: 'ON_CHANGE'
  },
  sheets: SHEETS.map(function (s, i) {
    return {
      properties: {
        title: s[0],
        index: i,
        sheetType: 'GRID',
        rightToLeft: true,
        tabColor: { red: s[1][0], green: s[1][1], blue: s[1][2] },
        gridProperties: { rowCount: 3000, columnCount: 26, frozenRowCount: 1 }
      }
    };
  })
};

return [{ json: { payload: payload } }];`,
    },
  },
  output: [{ payload: { properties: { title: 'حسابداری آموزشگاه علمی فردا' }, sheets: [] } }],
});

const createSpreadsheet = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'ایجاد اسپردشیت',
    position: [-20, 0],
    parameters: {
      method: 'POST',
      url: 'https://sheets.googleapis.com/v4/spreadsheets',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.payload) }}'),
      options: { timeout: 30000 },
    },
    credentials: { googleSheetsOAuth2Api: GS_CRED },
  },
  output: [{
    spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit',
    sheets: [{ properties: { sheetId: 0, title: 'راهنما' } }],
  }],
});

const buildSeedData = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'ساخت سرستون‌ها و داده اولیه',
    position: [200, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const res = $input.first().json;

const H = {};
H['راهنما'] = ['بخش', 'توضیح'];
H['تنظیمات'] = ['کلید', 'مقدار', 'توضیح'];
H['مدرسین'] = ['کد_مدرس', 'نام_مدرس', 'ایمیل', 'موبایل', 'شماره_شبا', 'درصد_حضوری', 'درصد_آنلاین', 'نوع_قرارداد', 'حقوق_ثابت_ماهانه', 'وضعیت', 'توضیح'];
H['کلاس‌ها'] = ['کد_کلاس', 'نام_کلاس', 'کد_مدرس', 'نوع_کلاس', 'شهریه_هر_نفر', 'تعداد_جلسات_دوره', 'درصد_مدرس_اختصاصی', 'ظرفیت', 'وضعیت', 'توضیح'];
H['سرمایه‌گذاران'] = ['کد_سرمایه_گذار', 'نام_سرمایه_گذار', 'ایمیل', 'موبایل', 'تاریخ_شروع_همکاری', 'درصد_توافقی_سود', 'وضعیت', 'توضیح'];
H['جلسات_تدریس'] = ['شناسه', 'تاریخ_شمسی', 'تاریخ_میلادی', 'سال_شمسی', 'ماه_شمسی', 'کد_مدرس', 'نام_مدرس', 'کد_کلاس', 'نام_کلاس', 'نوع_کلاس', 'تعداد_جلسه', 'تعداد_شاگرد', 'درآمد_ناخالص', 'درصد_مدرس', 'سهم_مدرس', 'وضعیت_تسویه', 'توضیح', 'منبع', 'زمان_ثبت'];
H['درآمد'] = ['شناسه', 'تاریخ_شمسی', 'تاریخ_میلادی', 'سال_شمسی', 'ماه_شمسی', 'نوع_درآمد', 'پرداخت_کننده', 'کد_کلاس', 'نام_کلاس', 'کد_مدرس', 'مبلغ', 'روش_پرداخت', 'شماره_پیگیری', 'توضیح', 'منبع', 'زمان_ثبت'];
H['هزینه‌ها'] = ['شناسه', 'تاریخ_شمسی', 'تاریخ_میلادی', 'سال_شمسی', 'ماه_شمسی', 'دسته_هزینه', 'شرح', 'مبلغ', 'روش_پرداخت', 'طرف_حساب', 'نوع_هزینه', 'توضیح', 'منبع', 'زمان_ثبت'];
H['آورده_سرمایه'] = ['شناسه', 'تاریخ_شمسی', 'تاریخ_میلادی', 'سال_شمسی', 'ماه_شمسی', 'کد_سرمایه_گذار', 'نام_سرمایه_گذار', 'نوع_آورده', 'شرح_آورده', 'مبلغ_تومان', 'نرخ_طلای18_روز', 'نرخ_دلار_روز', 'معادل_گرم_طلا', 'معادل_دلار', 'دسته', 'توضیح', 'منبع', 'زمان_ثبت'];
H['حقوق_مدرسین'] = ['شناسه_دوره', 'سال_شمسی', 'ماه_شمسی', 'کد_مدرس', 'نام_مدرس', 'ایمیل', 'جلسات_حضوری', 'جلسات_آنلاین', 'درآمد_منتسب_حضوری', 'درآمد_منتسب_آنلاین', 'درصد_حضوری', 'درصد_آنلاین', 'حقوق_درصدی', 'حقوق_ثابت', 'کسورات', 'خالص_پرداختی', 'شماره_شبا', 'وضعیت_پرداخت', 'تاریخ_محاسبه'];
H['گزارش_ماهانه'] = ['شناسه_دوره', 'سال_شمسی', 'ماه_شمسی', 'نام_ماه', 'درآمد_شهریه', 'درآمد_همکاری', 'درآمد_سایر', 'جمع_درآمد', 'حقوق_مدرسین', 'سایر_هزینه‌ها', 'جمع_هزینه', 'سود_عملیاتی', 'حاشیه_سود_درصد', 'آورده_سرمایه_گذار', 'جریان_نقد_خالص', 'تعداد_جلسات', 'تعداد_شاگرد', 'تاریخ_تولید'];
H['گزارش_دوره‌ای'] = ['نوع_دوره', 'شناسه_دوره', 'سال_شمسی', 'از_ماه', 'تا_ماه', 'جمع_درآمد', 'جمع_هزینه', 'حقوق_مدرسین', 'سود', 'حاشیه_سود_درصد', 'میانگین_سود_ماهانه', 'رشد_نسبت_به_دوره_قبل_درصد', 'آورده_سرمایه_دوره', 'تاریخ_تولید'];
H['ارزش_سرمایه'] = ['تاریخ_محاسبه', 'سال_شمسی', 'کد_سرمایه_گذار', 'نام_سرمایه_گذار', 'جمع_آورده_اسمی', 'معادل_گرم_طلا', 'معادل_دلار', 'نرخ_طلای18_امروز', 'نرخ_دلار_امروز', 'ارزش_روز_طلایی', 'ارزش_روز_دلاری', 'ارزش_روز_تورمی', 'سود_تورمی_تحقق_نیافته', 'درصد_از_کل_سرمایه'];
H['شاخص_سالانه'] = ['سال_شمسی', 'نرخ_تورم_رسمی_درصد', 'نرخ_دلار_پایان_سال', 'نرخ_طلای18_پایان_سال', 'منبع', 'توضیح'];
H['لاگ_ورودی'] = ['زمان', 'منبع', 'نوع_رکورد', 'شناسه_مرتبط', 'وضعیت', 'پیام', 'داده_خام'];

const SEED = {};
SEED['راهنما'] = [
  ['۱) تنظیمات', 'درصد پیش‌فرض حقوق مدرس، ایمیل گزارش و مبنای تعدیل سرمایه. اول از همه این شیت را پر کنید.'],
  ['۲) مدرسین', 'هر مدرس یک ردیف. درصد حضوری و آنلاین جداگانه. اگر خالی بماند از «تنظیمات» خوانده می‌شود.'],
  ['۳) کلاس‌ها', 'هر کلاس یک ردیف. اگر درصد این کلاس با درصد پیش‌فرض مدرس فرق دارد، ستون «درصد_مدرس_اختصاصی» را پر کنید.'],
  ['۴) سرمایه‌گذاران', 'فهرست سرمایه‌گذارها.'],
  ['۵) جلسات_تدریس', 'مبنای محاسبه حقوق. با فرم ثبت سریع پر می‌شود.'],
  ['۶) درآمد', 'شهریه شاگردان و درآمد مجموعه‌های همکار. آورده سرمایه‌گذار اینجا ثبت نمی‌شود.'],
  ['۷) هزینه‌ها', 'همه هزینه‌های ماه به‌جز حقوق مدرسین (حقوق خودکار محاسبه می‌شود).'],
  ['۸) آورده_سرمایه', 'پول یا کالای سرمایه‌گذارها. معادل گرم طلا و دلارِ همان روز ذخیره می‌شود تا ارزش واقعی حفظ شود.'],
  ['۹) حقوق_مدرسین', 'خروجی خودکار پایان ماه. دست‌نویس نکنید.'],
  ['۱۰) گزارش_ماهانه', 'خروجی خودکار پایان هر ماه شمسی.'],
  ['۱۱) گزارش_دوره‌ای', 'خروجی خودکار سه‌ماهه، شش‌ماهه و سالانه.'],
  ['۱۲) ارزش_سرمایه', 'ارزش امروزِ آورده هر سرمایه‌گذار با تعدیل تورم (طلا / دلار / شاخص رسمی).'],
  ['۱۳) شاخص_سالانه', 'نرخ تورم رسمی و نرخ دلار/طلای پایان هر سال شمسی. سالی یک بار به‌روز کنید.'],
  ['۱۴) لاگ_ورودی', 'سابقه خام همه ثبت‌ها برای پیگیری خطا.'],
  ['نکته مهم', 'ردیف‌هایی که با «(نمونه)» شروع می‌شوند فقط برای آموزش‌اند — بعد از وارد کردن داده واقعی حذفشان کنید.']
];
SEED['تنظیمات'] = [
  ['نام_آموزشگاه', 'آموزشگاه علمی فردا', 'در سربرگ گزارش‌ها نمایش داده می‌شود'],
  ['واحد_پول', 'تومان', 'همه مبالغ به این واحد ثبت می‌شوند'],
  ['درصد_پیشفرض_حضوری', 70, 'سهم مدرس از کلاس حضوری وقتی برای مدرس/کلاس مقدار خاصی تعیین نشده'],
  ['درصد_پیشفرض_آنلاین', 60, 'سهم مدرس از کلاس آنلاین وقتی مقدار خاصی تعیین نشده'],
  ['ایمیل_گزارش', 'f.shams.apg@gmail.com', 'گزارش‌ها به این آدرس می‌رود (چند آدرس را با ویرگول جدا کنید)'],
  ['ارسال_فیش_به_مدرس', 'خیر', 'بله = فیش حقوقی هر مدرس به ایمیل خودش هم ارسال شود'],
  ['مبنای_تعدیل_سرمایه', 'طلا', 'طلا | دلار | تورم_رسمی'],
  ['درصد_مالیات', 0, 'درصد کسر مالیات از حقوق مدرسین'],
  ['درصد_بیمه', 0, 'درصد کسر بیمه از حقوق مدرسین'],
  ['سهم_سرمایه_گذار_از_سود', 0, 'درصدی از سود عملیاتی که به سرمایه‌گذارها تعلق می‌گیرد (فعلاً صفر)'],
  ['تاریخ_راه_اندازی', new Date().toISOString().slice(0, 10), 'تاریخ ساخت این فایل']
];
SEED['مدرسین'] = [
  ['M001', '(نمونه) علی رضایی', 'teacher1@example.com', '09120000000', 'IR000000000000000000000000', 70, 60, 'درصدی', 0, 'نمونه', 'این ردیف نمونه است — حذفش کنید'],
  ['M002', '(نمونه) مریم احمدی', 'teacher2@example.com', '09120000001', 'IR000000000000000000000001', 75, 65, 'درصدی', 0, 'نمونه', 'این ردیف نمونه است — حذفش کنید']
];
SEED['کلاس‌ها'] = [
  ['C001', '(نمونه) ریاضی دهم — حضوری', 'M001', 'حضوری', 800000, 12, '', 15, 'نمونه', 'حذفش کنید'],
  ['C002', '(نمونه) فیزیک کنکور — آنلاین', 'M002', 'آنلاین', 600000, 16, 65, 30, 'نمونه', 'حذفش کنید']
];
SEED['سرمایه‌گذاران'] = [
  ['S001', '(نمونه) سرمایه‌گذار اول', 'investor@example.com', '09120000002', '1400/01/01', 0, 'نمونه', 'حذفش کنید']
];
SEED['شاخص_سالانه'] = [
  [1395, 9.0, 3800, 120000, 'مرکز آمار ایران (تقریبی)', 'اعداد را با منبع رسمی بازبینی کنید'],
  [1396, 9.6, 4600, 145000, 'مرکز آمار ایران (تقریبی)', ''],
  [1397, 26.9, 11000, 380000, 'مرکز آمار ایران (تقریبی)', ''],
  [1398, 34.8, 15800, 570000, 'مرکز آمار ایران (تقریبی)', ''],
  [1399, 36.4, 24000, 1100000, 'مرکز آمار ایران (تقریبی)', ''],
  [1400, 40.2, 27000, 1250000, 'مرکز آمار ایران (تقریبی)', ''],
  [1401, 46.5, 45000, 2100000, 'مرکز آمار ایران (تقریبی)', ''],
  [1402, 40.7, 55000, 3100000, 'مرکز آمار ایران (تقریبی)', ''],
  [1403, 35.0, 78000, 5400000, 'برآورد — بازبینی کنید', 'عدد قطعی را از بانک مرکزی جایگزین کنید'],
  [1404, '', '', '', '', 'در پایان سال پر کنید'],
  [1405, '', '', '', '', 'در پایان سال پر کنید']
];

const data = [];
const titles = Object.keys(H);
for (let i = 0; i < titles.length; i++) {
  const t = titles[i];
  const rows = [H[t]].concat(SEED[t] || []);
  data.push({ range: "'" + t + "'!A1", majorDimension: 'ROWS', values: rows });
}

return [{
  json: {
    spreadsheetId: res.spreadsheetId,
    spreadsheetUrl: res.spreadsheetUrl,
    valuesPayload: { valueInputOption: 'USER_ENTERED', data: data }
  }
}];`,
    },
  },
  output: [{ spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz', spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit', valuesPayload: { valueInputOption: 'USER_ENTERED', data: [] } }],
});

const writeSeedData = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'نوشتن سرستون‌ها',
    position: [420, 0],
    parameters: {
      method: 'POST',
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.spreadsheetId }}/values:batchUpdate'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.valuesPayload) }}'),
      options: { timeout: 30000 },
    },
    credentials: { googleSheetsOAuth2Api: GS_CRED },
  },
  output: [{ spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz', totalUpdatedCells: 260 }],
});

const buildFormatting = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'ساخت درخواست قالب‌بندی',
    position: [640, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const created = $('ایجاد اسپردشیت').first().json;
const sheets = created.sheets || [];

const MONEY = {
  'مدرسین': ['حقوق_ثابت_ماهانه'],
  'کلاس‌ها': ['شهریه_هر_نفر'],
  'جلسات_تدریس': ['درآمد_ناخالص', 'سهم_مدرس'],
  'درآمد': ['مبلغ'],
  'هزینه‌ها': ['مبلغ'],
  'آورده_سرمایه': ['مبلغ_تومان', 'نرخ_طلای18_روز', 'نرخ_دلار_روز'],
  'حقوق_مدرسین': ['درآمد_منتسب_حضوری', 'درآمد_منتسب_آنلاین', 'حقوق_درصدی', 'حقوق_ثابت', 'کسورات', 'خالص_پرداختی'],
  'گزارش_ماهانه': ['درآمد_شهریه', 'درآمد_همکاری', 'درآمد_سایر', 'جمع_درآمد', 'حقوق_مدرسین', 'سایر_هزینه‌ها', 'جمع_هزینه', 'سود_عملیاتی', 'آورده_سرمایه_گذار', 'جریان_نقد_خالص'],
  'گزارش_دوره‌ای': ['جمع_درآمد', 'جمع_هزینه', 'حقوق_مدرسین', 'سود', 'میانگین_سود_ماهانه', 'آورده_سرمایه_دوره'],
  'ارزش_سرمایه': ['جمع_آورده_اسمی', 'نرخ_طلای18_امروز', 'نرخ_دلار_امروز', 'ارزش_روز_طلایی', 'ارزش_روز_دلاری', 'ارزش_روز_تورمی', 'سود_تورمی_تحقق_نیافته']
};

const headerRows = {};
const seedData = $('ساخت سرستون‌ها و داده اولیه').first().json.valuesPayload.data || [];
for (let i = 0; i < seedData.length; i++) {
  const title = seedData[i].range.replace(/^'/, '').replace(/'!A1$/, '');
  headerRows[title] = seedData[i].values[0];
}

const requests = [];
for (let i = 0; i < sheets.length; i++) {
  const p = sheets[i].properties;
  requests.push({
    repeatCell: {
      range: { sheetId: p.sheetId, startRowIndex: 0, endRowIndex: 1 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.16, green: 0.23, blue: 0.33 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          wrapStrategy: 'WRAP',
          textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10, bold: true }
        }
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
    }
  });
  requests.push({
    autoResizeDimensions: {
      dimensions: { sheetId: p.sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 26 }
    }
  });
  const money = MONEY[p.title];
  const header = headerRows[p.title] || [];
  if (money && header.length) {
    for (let m = 0; m < money.length; m++) {
      const idx = header.indexOf(money[m]);
      if (idx < 0) continue;
      requests.push({
        repeatCell: {
          range: { sheetId: p.sheetId, startRowIndex: 1, startColumnIndex: idx, endColumnIndex: idx + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: '#,##0' } } },
          fields: 'userEnteredFormat.numberFormat'
        }
      });
    }
  }
}

return [{
  json: {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    formatPayload: { requests: requests }
  }
}];`,
    },
  },
  output: [{ spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz', spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit', formatPayload: { requests: [] } }],
});

const applyFormatting = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'اعمال قالب‌بندی',
    position: [860, 0],
    parameters: {
      method: 'POST',
      url: expr('https://sheets.googleapis.com/v4/spreadsheets/{{ $json.spreadsheetId }}:batchUpdate'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleSheetsOAuth2Api',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.formatPayload) }}'),
      options: { timeout: 30000 },
    },
    credentials: { googleSheetsOAuth2Api: GS_CRED },
  },
  output: [{ spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz', replies: [] }],
});

const setupSummary = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'خلاصه راه‌اندازی',
    position: [1080, 0],
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'sid', name: 'شناسه_اسپردشیت', value: expr("{{ $('ساخت درخواست قالب‌بندی').item.json.spreadsheetId }}"), type: 'string' },
          { id: 'surl', name: 'لینک_اسپردشیت', value: expr("{{ $('ساخت درخواست قالب‌بندی').item.json.spreadsheetUrl }}"), type: 'string' },
          { id: 'next', name: 'قدم_بعدی', value: 'این شناسه را در ورک‌فلوهای ۰۱ تا ۰۴ داخل نود «پیکربندی» جای‌گذاری کنید.', type: 'string' },
        ],
      },
    },
  },
  output: [{ 'شناسه_اسپردشیت': '1AbCdEfGhIjKlMnOpQrStUvWxYz', 'لینک_اسپردشیت': 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit', 'قدم_بعدی': 'کپی شناسه در ورک‌فلوهای بعدی' }],
});

const noteSetup = sticky(
  '## راه‌اندازی یک‌باره\n\nاین ورک‌فلو را فقط **یک بار** با دکمه Execute اجرا کنید.\n\nنتیجه: یک گوگل‌شیت راست‌چین با ۱۵ شیت، سرستون فارسی، قالب‌بندی مبلغ و داده نمونه.\n\nدر پایان **شناسه اسپردشیت** در خروجی آخرین نود چاپ می‌شود — آن را در ورک‌فلوهای ۰۱ تا ۰۴ بگذارید.',
  [startSetup, buildStructure, createSpreadsheet],
  { color: 4, width: 480, height: 280 },
);

const noteApi = sticky(
  '## چرا HTTP Request به‌جای نود Google Sheets؟\n\nنود آماده Google Sheets نمی‌تواند اسپردشیت **راست‌چین با ۱۵ شیت و قالب‌بندی** بسازد.\n\nاینجا مستقیم Sheets API v4 صدا زده می‌شود، ولی احراز هویت با همان اعتبارنامه OAuth گوگل‌شیت شماست — کلید جدیدی لازم نیست.',
  [buildSeedData, writeSeedData, buildFormatting, applyFormatting],
  { color: 3, width: 660, height: 260 },
);

export default workflow('school-accounting-setup', '۰۰ | راه‌اندازی دفتر حسابداری آموزشگاه')
  .add(startSetup)
  .to(buildStructure)
  .to(createSpreadsheet)
  .to(buildSeedData)
  .to(writeSeedData)
  .to(buildFormatting)
  .to(applyFormatting)
  .to(setupSummary)
  .add(noteSetup)
  .add(noteApi);
