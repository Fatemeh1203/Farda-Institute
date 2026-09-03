// ⚠️ سند تاریخی — نسخهٔ اولیهٔ ورک‌فلوی ۰۱ در زمان ساخت.
// ورک‌فلوی زنده (40Qh2f0Bm3B2VcqF) از آن زمان تغییر کرده است:
//   • مسیرهای «درآمد» و «هزینه» حذف شدند (به ورک‌فلوی ۰۵ منتقل شدند)
//   • fieldOptions در فرم‌های JSON باید {values:[{option:'...'}]} باشد، نه آرایهٔ رشته
//     — شکل قدیمیِ زیر باعث خطای «Field dropdown in field N has an invalid option 0» می‌شد
//   • toNum جداکنندهٔ هزارگان (20.000.000) را می‌خواند
//   • مسیر «آورده سرمایه‌گذار» حذف شد و به ورک‌فلوی مستقل ۰۷ (h0g5qfadXBC5VzSv) رفت
//   • مسیر تازهٔ «برنامهٔ کلاسی شاگرد» اضافه شد که در شیت «برنامه_هفتگی» می‌نویسد
//   • واژهٔ «شاگرد» به «فراگیر» تغییر کرد؛ فرم کلاس حالا نوع کلاس، قالب،
//     مکان، نام مدرس و تعداد روز/ساعت هفته را می‌گیرد و برای هر روز یک ردیف می‌سازد
// برای نسخهٔ درست، ورک‌فلو را از خود n8n بگیرید.

import { workflow, node, trigger, sticky, switchCase, expr } from '@n8n/workflow-sdk';

const GS = { id: '3SQAvMC4NM0Q506Y', name: 'Google Sheets account 5' };
const NERKH = { id: 'yp6igAQ1JCyHKRxV', name: 'Nerkh API Key' };
const DOC = { __rl: true, mode: 'id', value: '12j12zy8lqxlft1mBIZ0THmG-Ro24TZmUqijVwMpuTg4', cachedResultName: 'حسابداری آموزشگاه علمی فردا' };

const intakeForm = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: {
    name: 'فرم ثبت سریع',
    position: [-1120, 0],
    parameters: {
      authentication: 'none',
      formTitle: 'ثبت سریع — آموزشگاه علمی فردا',
      formDescription: 'یک مورد را انتخاب کنید تا فرم مخصوص همان مورد باز شود.',
      formFields: {
        values: [
          {
            fieldName: 'نوع_ثبت',
            fieldLabel: 'چه چیزی می‌خواهید ثبت کنید؟',
            fieldType: 'radio',
            requiredField: true,
            fieldOptions: {
              values: [
                { option: 'درآمد (شهریه شاگرد یا مجموعه همکار)' },
                { option: 'هزینه' },
                { option: 'جلسه تدریس' },
                { option: 'آورده سرمایه‌گذار' },
              ],
            },
          },
        ],
      },
      responseMode: 'onReceived',
      options: {
        path: 'sabt-farda',
        buttonLabel: 'ادامه',
        appendAttribution: false,
        useWorkflowTimezone: true,
        ignoreBots: true,
      },
    },
  },
  output: [{ 'نوع_ثبت': 'هزینه', submittedAt: '2026-08-09T10:00:00.000+03:30' }],
});

const readSettings = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'خواندن تنظیمات',
    position: [-900, 0],
    alwaysOutputData: true,
    parameters: {
      resource: 'sheet',
      operation: 'read',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '1854744989', cachedResultName: 'تنظیمات' },
      options: { returnAllMatches: 'returnAllMatches' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'کلید': 'درصد_پیشفرض_حضوری', 'مقدار': 70, 'توضیح': '' }],
});

const readTeachers = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'خواندن مدرسین',
    position: [-680, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'sheet',
      operation: 'read',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '486168317', cachedResultName: 'مدرسین' },
      options: { returnAllMatches: 'returnAllMatches' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'کد_مدرس': 'M001', 'نام_مدرس': 'علی رضایی', 'درصد_حضوری': 70, 'درصد_آنلاین': 60, 'وضعیت': 'فعال' }],
});

const readClasses = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'خواندن کلاس‌ها',
    position: [-460, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'sheet',
      operation: 'read',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '337802420', cachedResultName: 'کلاس‌ها' },
      options: { returnAllMatches: 'returnAllMatches' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'کد_کلاس': 'C001', 'نام_کلاس': 'ریاضی دهم', 'کد_مدرس': 'M001', 'نوع_کلاس': 'حضوری', 'شهریه_هر_نفر': 800000, 'تعداد_جلسات_دوره': 12 }],
});

const readInvestors = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'خواندن سرمایه‌گذاران',
    position: [-240, 0],
    executeOnce: true,
    alwaysOutputData: true,
    parameters: {
      resource: 'sheet',
      operation: 'read',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '1961762436', cachedResultName: 'سرمایه‌گذاران' },
      options: { returnAllMatches: 'returnAllMatches' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'کد_سرمایه_گذار': 'S001', 'نام_سرمایه_گذار': 'سرمایه‌گذار اول' }],
});

const prepareForm = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'آماده‌سازی فرم',
    position: [-20, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `function div(a,b){return ~~(a/b);}
function mod(a,b){return a-~~(a/b)*b;}
function jalCal(jy){var bk=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],bl=bk.length,gy=jy+621,leapJ=-14,jp=bk[0],jm,jump=0,leap,n,i;if(jy<jp||jy>=bk[bl-1])throw new Error('سال شمسی نامعتبر');for(i=1;i<bl;i++){jm=bk[i];jump=jm-jp;if(jy<jm)break;leapJ=leapJ+div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ=leapJ+div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ+=1;var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;if(jump-n<6)n=n-jump+div(jump+4,33)*33;leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap:leap,gy:gy,march:march};}
function g2d(gy,gm,gd){var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d;}
function d2g(jdn){var j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;var i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy:gy,gm:gm,gd:gd};}
function d2j(jdn){var gy=d2g(jdn).gy,jy=gy-621,r=jalCal(jy),jdn1f=g2d(gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy:jy,jm:jm,jd:jd};}k-=186;}else{jy-=1;k+=179;if(r.leap===1)k+=1;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy:jy,jm:jm,jd:jd};}
function pad(n){return String(n).length<2?'0'+n:String(n);}
function toJ(iso){var p=String(iso).slice(0,10).split('-');return d2j(g2d(+p[0],+p[1],+p[2]));}

const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
const jt = toJ(todayISO);

function safeRows(nodeName) {
  try {
    return $(nodeName).all().map(function (i) { return i.json || {}; });
  } catch (e) {
    return [];
  }
}

const settingsRows = safeRows('خواندن تنظیمات');
const settings = {};
for (let i = 0; i < settingsRows.length; i++) {
  const k = settingsRows[i]['کلید'];
  if (k) settings[String(k).trim()] = settingsRows[i]['مقدار'];
}

const isLive = function (r) {
  const s = String(r['وضعیت'] || '').trim();
  return s !== 'غیرفعال' && s !== 'حذف';
};

const teachers = safeRows('خواندن مدرسین').filter(function (r) { return r['کد_مدرس'] && isLive(r); });
const classes = safeRows('خواندن کلاس‌ها').filter(function (r) { return r['کد_کلاس'] && isLive(r); });
const investors = safeRows('خواندن سرمایه‌گذاران').filter(function (r) { return r['کد_سرمایه_گذار'] && isLive(r); });

const classOptions = classes.map(function (c) {
  return c['کد_کلاس'] + ' — ' + (c['نام_کلاس'] || '') + ' (' + (c['نوع_کلاس'] || '') + ')';
});
const investorOptions = investors.map(function (s) {
  return s['کد_سرمایه_گذار'] + ' — ' + (s['نام_سرمایه_گذار'] || '');
});
if (!classOptions.length) classOptions.push('— هنوز کلاسی در شیت «کلاس‌ها» ثبت نشده —');
if (!investorOptions.length) investorOptions.push('— هنوز سرمایه‌گذاری در شیت «سرمایه‌گذاران» ثبت نشده —');

const PAY = ['کارت به کارت', 'نقدی', 'دستگاه POS', 'درگاه اینترنتی', 'چک', 'سایر'];
const EXPENSE_CATEGORIES = ['اجاره', 'قبوض (برق/آب/گاز)', 'اینترنت و تلفن', 'تبلیغات و بازاریابی', 'تجهیزات', 'ملزومات مصرفی', 'پذیرایی', 'حقوق پرسنل اداری', 'نرم‌افزار و سرویس', 'تعمیر و نگهداری', 'مالیات و عوارض', 'ایاب و ذهاب', 'سایر'];

const formIncome = [
  { fieldLabel: 'نوع درآمد', fieldType: 'radio', requiredField: true, fieldOptions: ['شهریه شاگرد', 'مجموعه همکار', 'سایر'] },
  { fieldLabel: 'تاریخ', fieldType: 'date', requiredField: true, defaultValue: todayISO },
  { fieldLabel: 'مبلغ (تومان)', fieldType: 'number', requiredField: true, placeholder: 'مثلاً 800000' },
  { fieldLabel: 'پرداخت‌کننده', fieldType: 'text', requiredField: true, placeholder: 'نام شاگرد یا نام مجموعه همکار' },
  { fieldLabel: 'کلاس مربوطه', fieldType: 'dropdown', requiredField: false, fieldOptions: ['— مربوط به کلاس خاصی نیست —'].concat(classOptions) },
  { fieldLabel: 'روش پرداخت', fieldType: 'dropdown', requiredField: false, fieldOptions: PAY },
  { fieldLabel: 'شماره پیگیری', fieldType: 'text', requiredField: false },
  { fieldLabel: 'توضیح', fieldType: 'textarea', requiredField: false },
];

const formExpense = [
  { fieldLabel: 'تاریخ', fieldType: 'date', requiredField: true, defaultValue: todayISO },
  { fieldLabel: 'دسته هزینه', fieldType: 'dropdown', requiredField: true, fieldOptions: EXPENSE_CATEGORIES },
  { fieldLabel: 'مبلغ (تومان)', fieldType: 'number', requiredField: true },
  { fieldLabel: 'شرح هزینه', fieldType: 'text', requiredField: true, placeholder: 'مثلاً اجاره مرداد' },
  { fieldLabel: 'طرف حساب', fieldType: 'text', requiredField: false, placeholder: 'نام فروشنده یا موجر' },
  { fieldLabel: 'روش پرداخت', fieldType: 'dropdown', requiredField: false, fieldOptions: PAY },
  { fieldLabel: 'نوع هزینه', fieldType: 'radio', requiredField: false, fieldOptions: ['متغیر', 'ثابت'], defaultValue: 'متغیر' },
  { fieldLabel: 'توضیح', fieldType: 'textarea', requiredField: false },
];

const formSession = [
  { fieldLabel: 'تاریخ', fieldType: 'date', requiredField: true, defaultValue: todayISO },
  { fieldLabel: 'کلاس', fieldType: 'dropdown', requiredField: true, fieldOptions: classOptions },
  { fieldLabel: 'تعداد جلسه', fieldType: 'number', requiredField: true, defaultValue: '1' },
  { fieldLabel: 'تعداد شاگرد حاضر', fieldType: 'number', requiredField: false },
  { fieldLabel: 'درآمد ناخالص این تدریس (تومان)', fieldType: 'number', requiredField: false, placeholder: 'خالی بگذارید تا از شهریه کلاس حساب شود' },
  { fieldLabel: 'درصد مدرس', fieldType: 'number', requiredField: false, placeholder: 'خالی = درصد پیش‌فرض همان مدرس/کلاس' },
  { fieldLabel: 'توضیح', fieldType: 'textarea', requiredField: false },
];

const formInvest = [
  { fieldLabel: 'تاریخ', fieldType: 'date', requiredField: true, defaultValue: todayISO },
  { fieldLabel: 'سرمایه‌گذار', fieldType: 'dropdown', requiredField: true, fieldOptions: investorOptions },
  { fieldLabel: 'نوع آورده', fieldType: 'radio', requiredField: true, fieldOptions: ['نقدی', 'کالا'], defaultValue: 'نقدی' },
  { fieldLabel: 'مبلغ یا ارزش برآوردی (تومان)', fieldType: 'number', requiredField: true },
  { fieldLabel: 'شرح آورده', fieldType: 'text', requiredField: false, placeholder: 'اگر کالاست: مثلاً ۵ عدد لپ‌تاپ' },
  { fieldLabel: 'دسته', fieldType: 'radio', requiredField: true, fieldOptions: ['سرمایه اولیه (سال‌های قبل)', 'آورده ماهانه', 'آورده متفرقه'], defaultValue: 'آورده ماهانه' },
  { fieldLabel: 'توضیح', fieldType: 'textarea', requiredField: false },
];

const ft = $('فرم ثبت سریع').first().json;
const kind = String(ft['نوع_ثبت'] || ft['چه چیزی می‌خواهید ثبت کنید؟'] || '');

return [{
  json: {
    kind: kind,
    todayISO: todayISO,
    todayShamsi: jt.jy + '/' + pad(jt.jm) + '/' + pad(jt.jd),
    jy: jt.jy,
    jm: jt.jm,
    settings: settings,
    teachers: teachers,
    classes: classes,
    investors: investors,
    formIncomeJson: JSON.stringify(formIncome),
    formExpenseJson: JSON.stringify(formExpense),
    formSessionJson: JSON.stringify(formSession),
    formInvestJson: JSON.stringify(formInvest),
  },
}];`,
    },
  },
  output: [{
    kind: 'هزینه',
    todayISO: '2026-08-09',
    todayShamsi: '1405/05/18',
    jy: 1405,
    jm: 5,
    settings: { 'درصد_پیشفرض_حضوری': 70, 'درصد_پیشفرض_آنلاین': 60 },
    teachers: [{ 'کد_مدرس': 'M001' }],
    classes: [{ 'کد_کلاس': 'C001' }],
    investors: [{ 'کد_سرمایه_گذار': 'S001' }],
    formIncomeJson: '[]',
    formExpenseJson: '[]',
    formSessionJson: '[]',
    formInvestJson: '[]',
  }],
});

const routeKind = switchCase({
  version: 3.2,
  config: {
    name: 'مسیر ثبت',
    position: [200, 0],
    parameters: {
      rules: {
        values: [
          {
            outputKey: 'درآمد',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              conditions: [{ leftValue: expr('{{ $json.kind }}'), operator: { type: 'string', operation: 'contains' }, rightValue: 'درآمد' }],
              combinator: 'and',
            },
          },
          {
            outputKey: 'هزینه',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              conditions: [{ leftValue: expr('{{ $json.kind }}'), operator: { type: 'string', operation: 'contains' }, rightValue: 'هزینه' }],
              combinator: 'and',
            },
          },
          {
            outputKey: 'جلسه تدریس',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              conditions: [{ leftValue: expr('{{ $json.kind }}'), operator: { type: 'string', operation: 'contains' }, rightValue: 'جلسه' }],
              combinator: 'and',
            },
          },
          {
            outputKey: 'آورده سرمایه',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              conditions: [{ leftValue: expr('{{ $json.kind }}'), operator: { type: 'string', operation: 'contains' }, rightValue: 'آورده' }],
              combinator: 'and',
            },
          },
        ],
      },
      options: {},
    },
  },
});

const pageIncome = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'فرم درآمد',
    position: [460, -520],
    parameters: {
      operation: 'page',
      defineForm: 'json',
      jsonOutput: expr('{{ $json.formIncomeJson }}'),
      limitWaitTime: false,
      options: { formTitle: 'ثبت درآمد', formDescription: 'شهریه شاگرد یا درآمد مجموعه همکار', buttonLabel: 'ثبت درآمد' },
    },
  },
  output: [{ 'نوع درآمد': 'شهریه شاگرد', 'تاریخ': '2026-08-09', 'مبلغ (تومان)': 800000, 'پرداخت‌کننده': 'سارا محمدی', 'کلاس مربوطه': 'C001 — ریاضی دهم (حضوری)', 'روش پرداخت': 'کارت به کارت', 'شماره پیگیری': '', 'توضیح': '' }],
});

const normalizeIncome = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'نرمال‌سازی درآمد',
    position: [680, -520],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `function div(a,b){return ~~(a/b);}
function mod(a,b){return a-~~(a/b)*b;}
function jalCal(jy){var bk=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],bl=bk.length,gy=jy+621,leapJ=-14,jp=bk[0],jm,jump=0,leap,n,i;if(jy<jp||jy>=bk[bl-1])throw new Error('سال شمسی نامعتبر');for(i=1;i<bl;i++){jm=bk[i];jump=jm-jp;if(jy<jm)break;leapJ=leapJ+div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ=leapJ+div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ+=1;var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;if(jump-n<6)n=n-jump+div(jump+4,33)*33;leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap:leap,gy:gy,march:march};}
function g2d(gy,gm,gd){var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d;}
function d2g(jdn){var j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;var i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy:gy,gm:gm,gd:gd};}
function d2j(jdn){var gy=d2g(jdn).gy,jy=gy-621,r=jalCal(jy),jdn1f=g2d(gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy:jy,jm:jm,jd:jd};}k-=186;}else{jy-=1;k+=179;if(r.leap===1)k+=1;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy:jy,jm:jm,jd:jd};}
function pad(n){return String(n).length<2?'0'+n:String(n);}
function toJ(iso){var p=String(iso).slice(0,10).split('-');return d2j(g2d(+p[0],+p[1],+p[2]));}
function toNum(v){var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[^0-9.\\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}

const f = $input.first().json;
const prep = $('آماده‌سازی فرم').first().json;

const iso = String(f['تاریخ'] || prep.todayISO).slice(0, 10);
const j = toJ(iso);

const classLabel = String(f['کلاس مربوطه'] || '');
const classCode = classLabel.indexOf(' — ') > 0 ? classLabel.split(' — ')[0] : '';
const cls = (prep.classes || []).filter(function (c) { return c['کد_کلاس'] === classCode; })[0] || {};

const id = 'IN-' + j.jy + pad(j.jm) + '-' + Date.now().toString(36).slice(-5).toUpperCase();

return [{
  json: {
    'شناسه': id,
    'تاریخ_شمسی': j.jy + '/' + pad(j.jm) + '/' + pad(j.jd),
    'تاریخ_میلادی': iso,
    'سال_شمسی': j.jy,
    'ماه_شمسی': j.jm,
    'نوع_درآمد': String(f['نوع درآمد'] || 'سایر'),
    'پرداخت_کننده': String(f['پرداخت‌کننده'] || ''),
    'کد_کلاس': classCode,
    'نام_کلاس': cls['نام_کلاس'] || '',
    'کد_مدرس': cls['کد_مدرس'] || '',
    'مبلغ': toNum(f['مبلغ (تومان)']),
    'روش_پرداخت': String(f['روش پرداخت'] || ''),
    'شماره_پیگیری': String(f['شماره پیگیری'] || ''),
    'توضیح': String(f['توضیح'] || ''),
    'منبع': 'فرم',
    'زمان_ثبت': new Date().toISOString(),
  },
}];`,
    },
  },
  output: [{ 'شناسه': 'IN-140505-A1B2C', 'تاریخ_شمسی': '1405/05/18', 'تاریخ_میلادی': '2026-08-09', 'سال_شمسی': 1405, 'ماه_شمسی': 5, 'نوع_درآمد': 'شهریه شاگرد', 'پرداخت_کننده': 'سارا محمدی', 'کد_کلاس': 'C001', 'نام_کلاس': 'ریاضی دهم', 'کد_مدرس': 'M001', 'مبلغ': 800000, 'روش_پرداخت': 'کارت به کارت', 'شماره_پیگیری': '', 'توضیح': '', 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z' }],
});

const saveIncome = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در شیت درآمد',
    position: [900, -520],
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '1223345002', cachedResultName: 'درآمد' },
      columns: { mappingMode: 'autoMapInputData', value: {} },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'شناسه': 'IN-140505-A1B2C', 'مبلغ': 800000, 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z', 'توضیح': '' }],
});

const pageExpense = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'فرم هزینه',
    position: [460, -180],
    parameters: {
      operation: 'page',
      defineForm: 'json',
      jsonOutput: expr('{{ $json.formExpenseJson }}'),
      limitWaitTime: false,
      options: { formTitle: 'ثبت هزینه', formDescription: 'هزینه‌های جاری آموزشگاه (حقوق مدرسین را ثبت نکنید — خودکار محاسبه می‌شود)', buttonLabel: 'ثبت هزینه' },
    },
  },
  output: [{ 'تاریخ': '2026-08-09', 'دسته هزینه': 'اجاره', 'مبلغ (تومان)': 12000000, 'شرح هزینه': 'اجاره مرداد', 'طرف حساب': '', 'روش پرداخت': 'کارت به کارت', 'نوع هزینه': 'ثابت', 'توضیح': '' }],
});

const normalizeExpense = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'نرمال‌سازی هزینه',
    position: [680, -180],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `function div(a,b){return ~~(a/b);}
function mod(a,b){return a-~~(a/b)*b;}
function jalCal(jy){var bk=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],bl=bk.length,gy=jy+621,leapJ=-14,jp=bk[0],jm,jump=0,leap,n,i;if(jy<jp||jy>=bk[bl-1])throw new Error('سال شمسی نامعتبر');for(i=1;i<bl;i++){jm=bk[i];jump=jm-jp;if(jy<jm)break;leapJ=leapJ+div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ=leapJ+div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ+=1;var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;if(jump-n<6)n=n-jump+div(jump+4,33)*33;leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap:leap,gy:gy,march:march};}
function g2d(gy,gm,gd){var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d;}
function d2g(jdn){var j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;var i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy:gy,gm:gm,gd:gd};}
function d2j(jdn){var gy=d2g(jdn).gy,jy=gy-621,r=jalCal(jy),jdn1f=g2d(gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy:jy,jm:jm,jd:jd};}k-=186;}else{jy-=1;k+=179;if(r.leap===1)k+=1;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy:jy,jm:jm,jd:jd};}
function pad(n){return String(n).length<2?'0'+n:String(n);}
function toJ(iso){var p=String(iso).slice(0,10).split('-');return d2j(g2d(+p[0],+p[1],+p[2]));}
function toNum(v){var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[^0-9.\\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}

const f = $input.first().json;
const prep = $('آماده‌سازی فرم').first().json;

const iso = String(f['تاریخ'] || prep.todayISO).slice(0, 10);
const j = toJ(iso);
const id = 'EX-' + j.jy + pad(j.jm) + '-' + Date.now().toString(36).slice(-5).toUpperCase();

return [{
  json: {
    'شناسه': id,
    'تاریخ_شمسی': j.jy + '/' + pad(j.jm) + '/' + pad(j.jd),
    'تاریخ_میلادی': iso,
    'سال_شمسی': j.jy,
    'ماه_شمسی': j.jm,
    'دسته_هزینه': String(f['دسته هزینه'] || 'سایر'),
    'شرح': String(f['شرح هزینه'] || ''),
    'مبلغ': toNum(f['مبلغ (تومان)']),
    'روش_پرداخت': String(f['روش پرداخت'] || ''),
    'طرف_حساب': String(f['طرف حساب'] || ''),
    'نوع_هزینه': String(f['نوع هزینه'] || 'متغیر'),
    'توضیح': String(f['توضیح'] || ''),
    'منبع': 'فرم',
    'زمان_ثبت': new Date().toISOString(),
  },
}];`,
    },
  },
  output: [{ 'شناسه': 'EX-140505-B2C3D', 'تاریخ_شمسی': '1405/05/18', 'تاریخ_میلادی': '2026-08-09', 'سال_شمسی': 1405, 'ماه_شمسی': 5, 'دسته_هزینه': 'اجاره', 'شرح': 'اجاره مرداد', 'مبلغ': 12000000, 'روش_پرداخت': 'کارت به کارت', 'طرف_حساب': '', 'نوع_هزینه': 'ثابت', 'توضیح': '', 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z' }],
});

const saveExpense = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در شیت هزینه‌ها',
    position: [900, -180],
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '226026858', cachedResultName: 'هزینه‌ها' },
      columns: { mappingMode: 'autoMapInputData', value: {} },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'شناسه': 'EX-140505-B2C3D', 'مبلغ': 12000000, 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z', 'توضیح': '' }],
});

const pageSession = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'فرم جلسه تدریس',
    position: [460, 160],
    parameters: {
      operation: 'page',
      defineForm: 'json',
      jsonOutput: expr('{{ $json.formSessionJson }}'),
      limitWaitTime: false,
      options: { formTitle: 'ثبت جلسه تدریس', formDescription: 'مبنای محاسبه حقوق مدرس در پایان ماه', buttonLabel: 'ثبت جلسه' },
    },
  },
  output: [{ 'تاریخ': '2026-08-09', 'کلاس': 'C001 — ریاضی دهم (حضوری)', 'تعداد جلسه': 1, 'تعداد شاگرد حاضر': 12, 'درآمد ناخالص این تدریس (تومان)': '', 'درصد مدرس': '', 'توضیح': '' }],
});

const normalizeSession = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'نرمال‌سازی جلسه',
    position: [680, 160],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `function div(a,b){return ~~(a/b);}
function mod(a,b){return a-~~(a/b)*b;}
function jalCal(jy){var bk=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],bl=bk.length,gy=jy+621,leapJ=-14,jp=bk[0],jm,jump=0,leap,n,i;if(jy<jp||jy>=bk[bl-1])throw new Error('سال شمسی نامعتبر');for(i=1;i<bl;i++){jm=bk[i];jump=jm-jp;if(jy<jm)break;leapJ=leapJ+div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ=leapJ+div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ+=1;var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;if(jump-n<6)n=n-jump+div(jump+4,33)*33;leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap:leap,gy:gy,march:march};}
function g2d(gy,gm,gd){var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d;}
function d2g(jdn){var j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;var i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy:gy,gm:gm,gd:gd};}
function d2j(jdn){var gy=d2g(jdn).gy,jy=gy-621,r=jalCal(jy),jdn1f=g2d(gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy:jy,jm:jm,jd:jd};}k-=186;}else{jy-=1;k+=179;if(r.leap===1)k+=1;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy:jy,jm:jm,jd:jd};}
function pad(n){return String(n).length<2?'0'+n:String(n);}
function toJ(iso){var p=String(iso).slice(0,10).split('-');return d2j(g2d(+p[0],+p[1],+p[2]));}
function toNum(v){var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[^0-9.\\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}

const f = $input.first().json;
const prep = $('آماده‌سازی فرم').first().json;
const settings = prep.settings || {};

const iso = String(f['تاریخ'] || prep.todayISO).slice(0, 10);
const j = toJ(iso);

const classLabel = String(f['کلاس'] || '');
const classCode = classLabel.indexOf(' — ') > 0 ? classLabel.split(' — ')[0] : classLabel;
const cls = (prep.classes || []).filter(function (c) { return c['کد_کلاس'] === classCode; })[0] || {};
const teacher = (prep.teachers || []).filter(function (t) { return t['کد_مدرس'] === cls['کد_مدرس']; })[0] || {};

const type = String(cls['نوع_کلاس'] || 'حضوری');
const isOnline = type.indexOf('آنلاین') >= 0;

const sessions = toNum(f['تعداد جلسه']) || 1;
const students = toNum(f['تعداد شاگرد حاضر']);

let gross = toNum(f['درآمد ناخالص این تدریس (تومان)']);
if (!gross) {
  const tuition = toNum(cls['شهریه_هر_نفر']);
  const totalSessions = toNum(cls['تعداد_جلسات_دوره']);
  const perSession = totalSessions > 0 ? tuition / totalSessions : tuition;
  gross = Math.round(perSession * students * sessions);
}

let pct = toNum(f['درصد مدرس']);
if (!pct) pct = toNum(cls['درصد_مدرس_اختصاصی']);
if (!pct) pct = isOnline ? toNum(teacher['درصد_آنلاین']) : toNum(teacher['درصد_حضوری']);
if (!pct) pct = isOnline ? (toNum(settings['درصد_پیشفرض_آنلاین']) || 60) : (toNum(settings['درصد_پیشفرض_حضوری']) || 70);

const share = Math.round(gross * pct / 100);
const id = 'TS-' + j.jy + pad(j.jm) + '-' + Date.now().toString(36).slice(-5).toUpperCase();

return [{
  json: {
    'شناسه': id,
    'تاریخ_شمسی': j.jy + '/' + pad(j.jm) + '/' + pad(j.jd),
    'تاریخ_میلادی': iso,
    'سال_شمسی': j.jy,
    'ماه_شمسی': j.jm,
    'کد_مدرس': cls['کد_مدرس'] || '',
    'نام_مدرس': teacher['نام_مدرس'] || '',
    'کد_کلاس': classCode,
    'نام_کلاس': cls['نام_کلاس'] || '',
    'نوع_کلاس': type,
    'تعداد_جلسه': sessions,
    'تعداد_شاگرد': students,
    'درآمد_ناخالص': gross,
    'درصد_مدرس': pct,
    'سهم_مدرس': share,
    'وضعیت_تسویه': 'تسویه نشده',
    'توضیح': String(f['توضیح'] || ''),
    'منبع': 'فرم',
    'زمان_ثبت': new Date().toISOString(),
  },
}];`,
    },
  },
  output: [{ 'شناسه': 'TS-140505-C3D4E', 'تاریخ_شمسی': '1405/05/18', 'تاریخ_میلادی': '2026-08-09', 'سال_شمسی': 1405, 'ماه_شمسی': 5, 'کد_مدرس': 'M001', 'نام_مدرس': 'علی رضایی', 'کد_کلاس': 'C001', 'نام_کلاس': 'ریاضی دهم', 'نوع_کلاس': 'حضوری', 'تعداد_جلسه': 1, 'تعداد_شاگرد': 12, 'درآمد_ناخالص': 800000, 'درصد_مدرس': 70, 'سهم_مدرس': 560000, 'وضعیت_تسویه': 'تسویه نشده', 'توضیح': '', 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z' }],
});

const saveSession = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در شیت جلسات تدریس',
    position: [900, 160],
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '1908843345', cachedResultName: 'جلسات_تدریس' },
      columns: { mappingMode: 'autoMapInputData', value: {} },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'شناسه': 'TS-140505-C3D4E', 'سهم_مدرس': 560000, 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z', 'توضیح': '' }],
});

const pageInvest = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'فرم آورده سرمایه',
    position: [460, 520],
    parameters: {
      operation: 'page',
      defineForm: 'json',
      jsonOutput: expr('{{ $json.formInvestJson }}'),
      limitWaitTime: false,
      options: { formTitle: 'ثبت آورده سرمایه‌گذار', formDescription: 'نرخ روز طلا و دلار خودکار ذخیره می‌شود تا ارزش واقعی آورده در طول سال‌ها حفظ شود.', buttonLabel: 'ثبت آورده' },
    },
  },
  output: [{ 'تاریخ': '2026-08-09', 'سرمایه‌گذار': 'S001 — سرمایه‌گذار اول', 'نوع آورده': 'نقدی', 'مبلغ یا ارزش برآوردی (تومان)': 50000000, 'شرح آورده': '', 'دسته': 'آورده ماهانه', 'توضیح': '' }],
});

const fetchGold = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'نرخ طلا',
    position: [680, 440],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: 'https://api.nerkh.io/v1/prices/json/gold',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: { httpQueryAuth: NERKH },
  },
  output: [{ data: { prices: { GOLD18K: { current: 9800000 } } } }],
});

const fetchUsd = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'نرخ دلار',
    position: [680, 600],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: 'https://api.nerkh.io/v1/prices/json/currency',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: { httpQueryAuth: NERKH },
  },
  output: [{ data: { prices: { USD: { current: 105000 } } } }],
});

const normalizeInvest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'نرمال‌سازی آورده',
    position: [900, 520],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `function div(a,b){return ~~(a/b);}
function mod(a,b){return a-~~(a/b)*b;}
function jalCal(jy){var bk=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],bl=bk.length,gy=jy+621,leapJ=-14,jp=bk[0],jm,jump=0,leap,n,i;if(jy<jp||jy>=bk[bl-1])throw new Error('سال شمسی نامعتبر');for(i=1;i<bl;i++){jm=bk[i];jump=jm-jp;if(jy<jm)break;leapJ=leapJ+div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ=leapJ+div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ+=1;var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;if(jump-n<6)n=n-jump+div(jump+4,33)*33;leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap:leap,gy:gy,march:march};}
function g2d(gy,gm,gd){var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d;}
function d2g(jdn){var j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;var i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy:gy,gm:gm,gd:gd};}
function d2j(jdn){var gy=d2g(jdn).gy,jy=gy-621,r=jalCal(jy),jdn1f=g2d(gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy:jy,jm:jm,jd:jd};}k-=186;}else{jy-=1;k+=179;if(r.leap===1)k+=1;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy:jy,jm:jm,jd:jd};}
function pad(n){return String(n).length<2?'0'+n:String(n);}
function toJ(iso){var p=String(iso).slice(0,10).split('-');return d2j(g2d(+p[0],+p[1],+p[2]));}
function toNum(v){var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[^0-9.\\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}

const f = $('فرم آورده سرمایه').first().json;
const prep = $('آماده‌سازی فرم').first().json;

function priceOf(nodeName, symbol) {
  try {
    const p = $(nodeName).first().json;
    const v = p && p.data && p.data.prices && p.data.prices[symbol] ? p.data.prices[symbol].current : null;
    return toNum(v);
  } catch (e) {
    return 0;
  }
}

const gold18 = priceOf('نرخ طلا', 'GOLD18K');
const usd = priceOf('نرخ دلار', 'USD');

const iso = String(f['تاریخ'] || prep.todayISO).slice(0, 10);
const j = toJ(iso);

const investorLabel = String(f['سرمایه‌گذار'] || '');
const investorCode = investorLabel.indexOf(' — ') > 0 ? investorLabel.split(' — ')[0] : '';
const inv = (prep.investors || []).filter(function (s) { return s['کد_سرمایه_گذار'] === investorCode; })[0] || {};

const amount = toNum(f['مبلغ یا ارزش برآوردی (تومان)']);
const gramGold = gold18 > 0 ? Math.round((amount / gold18) * 10000) / 10000 : '';
const usdEq = usd > 0 ? Math.round((amount / usd) * 100) / 100 : '';

const id = 'CP-' + j.jy + pad(j.jm) + '-' + Date.now().toString(36).slice(-5).toUpperCase();

return [{
  json: {
    'شناسه': id,
    'تاریخ_شمسی': j.jy + '/' + pad(j.jm) + '/' + pad(j.jd),
    'تاریخ_میلادی': iso,
    'سال_شمسی': j.jy,
    'ماه_شمسی': j.jm,
    'کد_سرمایه_گذار': investorCode,
    'نام_سرمایه_گذار': inv['نام_سرمایه_گذار'] || investorLabel,
    'نوع_آورده': String(f['نوع آورده'] || 'نقدی'),
    'شرح_آورده': String(f['شرح آورده'] || ''),
    'مبلغ_تومان': amount,
    'نرخ_طلای18_روز': gold18 || '',
    'نرخ_دلار_روز': usd || '',
    'معادل_گرم_طلا': gramGold,
    'معادل_دلار': usdEq,
    'دسته': String(f['دسته'] || 'آورده متفرقه'),
    'توضیح': String(f['توضیح'] || '') + (gold18 ? '' : ' [نرخ طلا در دسترس نبود — تعدیل با تورم رسمی انجام می‌شود]'),
    'منبع': 'فرم',
    'زمان_ثبت': new Date().toISOString(),
  },
}];`,
    },
  },
  output: [{ 'شناسه': 'CP-140505-D4E5F', 'تاریخ_شمسی': '1405/05/18', 'تاریخ_میلادی': '2026-08-09', 'سال_شمسی': 1405, 'ماه_شمسی': 5, 'کد_سرمایه_گذار': 'S001', 'نام_سرمایه_گذار': 'سرمایه‌گذار اول', 'نوع_آورده': 'نقدی', 'شرح_آورده': '', 'مبلغ_تومان': 50000000, 'نرخ_طلای18_روز': 9800000, 'نرخ_دلار_روز': 105000, 'معادل_گرم_طلا': 5.102, 'معادل_دلار': 476.19, 'دسته': 'آورده ماهانه', 'توضیح': '', 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z' }],
});

const saveInvest = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در شیت آورده سرمایه',
    position: [1120, 520],
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '1019742628', cachedResultName: 'آورده_سرمایه' },
      columns: { mappingMode: 'autoMapInputData', value: {} },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'شناسه': 'CP-140505-D4E5F', 'مبلغ_تومان': 50000000, 'منبع': 'فرم', 'زمان_ثبت': '2026-08-09T10:00:00.000Z', 'توضیح': '' }],
});

const writeLog = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در لاگ ورودی',
    position: [1400, 0],
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: DOC,
      sheetName: { __rl: true, mode: 'list', value: '1430613514', cachedResultName: 'لاگ_ورودی' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          'زمان': expr('{{ $json["زمان_ثبت"] || $now.toISO() }}'),
          'منبع': expr('{{ $json["منبع"] || "فرم" }}'),
          'نوع_رکورد': expr('{{ $("آماده‌سازی فرم").first().json.kind }}'),
          'شناسه_مرتبط': expr('{{ $json["شناسه"] }}'),
          'وضعیت': 'ثبت شد',
          'پیام': expr('{{ $json["توضیح"] || "" }}'),
          'داده_خام': expr('{{ JSON.stringify($json) }}'),
        },
      },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: { googleSheetsOAuth2Api: GS },
  },
  output: [{ 'زمان': '2026-08-09T10:00:00.000Z', 'منبع': 'فرم', 'نوع_رکورد': 'هزینه', 'شناسه_مرتبط': 'EX-140505-B2C3D', 'وضعیت': 'ثبت شد', 'پیام': '', 'داده_خام': '{}' }],
});

const finishForm = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'پایان ثبت',
    position: [1620, 0],
    parameters: {
      operation: 'completion',
      respondWith: 'text',
      completionTitle: 'ثبت شد ✅',
      completionMessage: expr('نوع: {{ $json["نوع_رکورد"] }}\nشناسه رکورد: {{ $json["شناسه_مرتبط"] }}\n\nبرای ثبت مورد بعدی صفحه را دوباره باز کنید.'),
    },
  },
  output: [{}],
});

const noteForm = sticky(
  '## فرم ثبت سریع (لینک را روی گوشی بوکمارک کنید)\n\nآدرس فرم = **Production URL** روی نود «فرم ثبت سریع».\n\nمسیر: `/form/sabt-farda`\n\nلیست کشویی مدرس، کلاس و سرمایه‌گذار **زنده از گوگل‌شیت** خوانده می‌شود؛ کافی است ردیف جدید را در شیت اضافه کنید — فرم خودش به‌روز می‌شود.',
  [intakeForm, readSettings, readTeachers, readClasses, readInvestors, prepareForm],
  { color: 4, width: 1080, height: 240 },
);

const noteCalc = sticky(
  '## منطق محاسبه سهم مدرس\n\nاولویت درصد از بالا به پایین:\n1. عددی که در خود فرم وارد می‌کنید\n2. `درصد_مدرس_اختصاصی` آن کلاس\n3. `درصد_حضوری` / `درصد_آنلاین` همان مدرس\n4. درصد پیش‌فرض در شیت «تنظیمات»\n\nاگر «درآمد ناخالص» را خالی بگذارید:\n`(شهریه_هر_نفر ÷ تعداد_جلسات_دوره) × تعداد شاگرد × تعداد جلسه`',
  [pageSession, normalizeSession, saveSession],
  { color: 3, width: 660, height: 260 },
);

const noteInvest = sticky(
  '## چرا نرخ طلا/دلار ذخیره می‌شود؟\n\nآورده سرمایه‌گذار **درآمد نیست** — پس در سود ماه نمی‌آید و در شیت جداگانه ثبت می‌شود.\n\nهنگام ثبت، معادل **گرم طلای ۱۸ عیار** و **دلار** همان روز ذخیره می‌شود. سال‌ها بعد ارزش واقعی آورده = گرم طلا × نرخ روز. این دقیق‌ترین راه حفظ ارزش در برابر تورم است.\n\nاگر API نرخ در دسترس نباشد، ردیف ثبت می‌شود و تعدیل با «تورم رسمی» شیت شاخص انجام می‌گیرد.',
  [pageInvest, fetchGold, fetchUsd, normalizeInvest, saveInvest],
  { color: 6, width: 900, height: 280 },
);

export default workflow('school-accounting-intake', '۰۱ | ثبت سریع درآمد، هزینه، تدریس و سرمایه')
  .add(intakeForm)
  .to(readSettings)
  .to(readTeachers)
  .to(readClasses)
  .to(readInvestors)
  .to(prepareForm)
  .to(routeKind
    .onCase(0, pageIncome.to(normalizeIncome).to(saveIncome).to(writeLog))
    .onCase(1, pageExpense.to(normalizeExpense).to(saveExpense).to(writeLog))
    .onCase(2, pageSession.to(normalizeSession).to(saveSession).to(writeLog))
    .onCase(3, pageInvest.to(fetchGold).to(fetchUsd).to(normalizeInvest).to(saveInvest).to(writeLog)))
  .add(writeLog)
  .to(finishForm)
  .add(noteForm)
  .add(noteCalc)
  .add(noteInvest);
