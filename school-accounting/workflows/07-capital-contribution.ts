import { workflow, node, trigger, sticky, expr } from '@n8n/workflow-sdk';

const SHEET_DOC = {
  __rl: true,
  mode: 'id',
  value: '12j12zy8lqxlft1mBIZ0THmG-Ro24TZmUqijVwMpuTg4',
  cachedResultName: 'حسابداری آموزشگاه علمی فردا',
};

const sheetsCred = { googleSheetsOAuth2Api: { id: '3SQAvMC4NM0Q506Y', name: 'Google Sheets account 5' } };
const nerkhCred = { httpQueryAuth: { id: 'yp6igAQ1JCyHKRxV', name: 'Nerkh API Key' } };

const formStart = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: {
    name: 'فرم آورده سرمایه',
    parameters: {
      authentication: 'none',
      formTitle: 'آموزشگاه علمی فردا',
      formDescription: 'ثبت <b>آورده سرمایه‌گذار</b>. آورده درآمد نیست و در سود ماه نمی‌آید؛ در شیت «آورده_سرمایه» با نرخ روز طلا و دلار نگهداری می‌شود.<br>برای واریزی و هزینه: <b>/form/farda</b> — برای کلاس‌ها: <b>/form/sabt-farda</b>',
      formFields: {
        values: [
          {
            fieldLabel: 'نوع آورده',
            fieldName: 'نوع_آورده',
            fieldType: 'radio',
            requiredField: true,
            fieldOptions: { values: [{ option: 'نقدی' }, { option: 'کالا' }] },
          },
        ],
      },
      responseMode: 'onReceived',
      options: {
        path: 'REDACTED', // آدرس واقعی فقط در n8n و پنل خصوصی — عمداً در مخزن عمومی نیست
        buttonLabel: 'ادامه',
        appendAttribution: false,
        useWorkflowTimezone: true,
        ignoreBots: true,
      },
    },
  },
});

const readInvestors = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'خواندن سرمایه‌گذاران',
    alwaysOutputData: true,
    parameters: {
      resource: 'sheet',
      operation: 'read',
      documentId: SHEET_DOC,
      sheetName: { __rl: true, mode: 'list', value: '1961762436', cachedResultName: 'سرمایه‌گذاران' },
      options: { returnAllMatches: 'returnAllMatches' },
    },
    credentials: sheetsCred,
  },
});

const prepForm = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'آماده‌سازی فرم',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `function safeRows(nodeName) {
  try {
    return $(nodeName).all().map(function (i) { return i.json || {}; });
  } catch (e) {
    return [];
  }
}

function opts(arr) {
  return { values: arr.map(function (o) { return { option: String(o) }; }) };
}

const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });

const isLive = function (r) {
  const s = String(r['وضعیت'] || '').trim();
  return s !== 'غیرفعال' && s !== 'حذف';
};

const investors = safeRows('خواندن سرمایه‌گذاران').filter(function (r) { return r['کد_سرمایه_گذار'] && isLive(r); });

const investorOptions = investors.map(function (s) {
  return s['کد_سرمایه_گذار'] + ' — ' + (s['نام_سرمایه_گذار'] || '');
});

const investorField = investorOptions.length
  ? { fieldLabel: 'سرمایه‌گذار', fieldType: 'dropdown', requiredField: true, fieldOptions: opts(investorOptions) }
  : { fieldLabel: 'سرمایه‌گذار (کد یا نام)', fieldType: 'text', requiredField: true, placeholder: 'هنوز سرمایه‌گذاری در شیت «سرمایه‌گذاران» ثبت نشده — نامش را بنویسید' };

const kind = String($('فرم آورده سرمایه').first().json['نوع_آورده'] || 'نقدی');
const isGoods = kind.indexOf('کالا') >= 0;

const formInvest = [
  { fieldLabel: 'تاریخ', fieldType: 'date', requiredField: true, defaultValue: todayISO },
  investorField,
  {
    fieldLabel: isGoods ? 'ارزش برآوردی کالا (تومان)' : 'مبلغ (تومان)',
    fieldType: 'text',
    requiredField: true,
    placeholder: 'مثلاً 20.000.000'
  },
  {
    fieldLabel: 'شرح آورده',
    fieldType: 'text',
    requiredField: isGoods,
    placeholder: isGoods ? 'مثلاً ۵ عدد لپ‌تاپ' : 'اختیاری — مثلاً واریز به حساب بانک ملت'
  },
  { fieldLabel: 'شماره فیش یا شناسه', fieldType: 'text', requiredField: false },
  { fieldLabel: 'ثبت‌کننده', fieldType: 'text', requiredField: true, placeholder: 'نام شما' },
  { fieldLabel: 'دسته', fieldType: 'radio', requiredField: true, fieldOptions: opts(['سرمایه اولیه (سال‌های قبل)', 'آورده ماهانه', 'آورده متفرقه']), defaultValue: 'آورده ماهانه' },
  { fieldLabel: 'توضیح', fieldType: 'textarea', requiredField: false },
];

return [{
  json: {
    kind: kind,
    todayISO: todayISO,
    investors: investors,
    formInvestJson: JSON.stringify(formInvest),
  },
}];`,
    },
  },
});

const formDetails = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'فرم جزئیات آورده',
    parameters: {
      operation: 'page',
      defineForm: 'json',
      jsonOutput: expr('{{ $json.formInvestJson }}'),
      limitWaitTime: false,
      options: {
        formTitle: 'ثبت آورده سرمایه‌گذار',
        formDescription: 'نرخ روز طلای ۱۸ عیار و دلار خودکار ذخیره می‌شود تا ارزش واقعی آورده در طول سال‌ها حفظ شود. مبلغ را با نقطه بنویسید: 20.000.000',
        buttonLabel: 'ثبت آورده',
      },
    },
  },
});

const goldRate = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'نرخ طلا',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: 'https://api.nerkh.io/v1/prices/json/gold',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: nerkhCred,
  },
});

const usdRate = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'نرخ دلار',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: 'https://api.nerkh.io/v1/prices/json/currency',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: nerkhCred,
  },
});

const normalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'نرمال‌سازی آورده',
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
function toNum(v){var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[٫٬،,_\\s]/g,'').replace(/\\.(?=\\d{3}(\\D|\$))/g,'').replace(/[^0-9.\\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}

const f = $('فرم جزئیات آورده').first().json;
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

const investorLabel = String(f['سرمایه‌گذار'] || f['سرمایه‌گذار (کد یا نام)'] || '');
const investorCode = investorLabel.indexOf(' — ') > 0 ? investorLabel.split(' — ')[0].trim() : '';
const inv = (prep.investors || []).filter(function (s) { return s['کد_سرمایه_گذار'] === investorCode; })[0] || {};

const amount = toNum(f['مبلغ (تومان)'] || f['ارزش برآوردی کالا (تومان)']);
const gramGold = gold18 > 0 ? Math.round((amount / gold18) * 10000) / 10000 : '';
const usdEq = usd > 0 ? Math.round((amount / usd) * 100) / 100 : '';

const notes = [];
if (!amount) notes.push('[مبلغ معتبر خوانده نشد]');
if (!gold18) notes.push('[نرخ طلا در دسترس نبود — تعدیل با تورم رسمی انجام می‌شود]');

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
    'نوع_آورده': String(prep.kind || 'نقدی'),
    'شرح_آورده': String(f['شرح آورده'] || ''),
    'مبلغ_تومان': amount,
    'نرخ_طلای18_روز': gold18 || '',
    'نرخ_دلار_روز': usd || '',
    'معادل_گرم_طلا': gramGold,
    'معادل_دلار': usdEq,
    'دسته': String(f['دسته'] || 'آورده متفرقه'),
    'شماره_فیش': String(f['شماره فیش یا شناسه'] || ''),
    'ثبت_کننده': String(f['ثبت‌کننده'] || ''),
    'توضیح': (String(f['توضیح'] || '') + ' ' + notes.join(' ')).trim(),
    'منبع': 'فرم آورده',
    'زمان_ثبت': new Date().toISOString(),
  },
}];`,
    },
  },
});

const writeCapital = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در شیت آورده سرمایه',
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: SHEET_DOC,
      sheetName: { __rl: true, mode: 'list', value: '1019742628', cachedResultName: 'آورده_سرمایه' },
      columns: { mappingMode: 'autoMapInputData', value: {} },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: sheetsCred,
  },
});

const writeLog = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'ثبت در لاگ ورودی',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: SHEET_DOC,
      sheetName: { __rl: true, mode: 'list', value: '1430613514', cachedResultName: 'لاگ_ورودی' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          'زمان': expr('{{ $json["زمان_ثبت"] || $now.toISO() }}'),
          'منبع': 'فرم آورده',
          'نوع_رکورد': 'آورده سرمایه‌گذار',
          'شناسه_مرتبط': expr('{{ $json["شناسه"] }}'),
          'وضعیت': 'ثبت شد',
          'پیام': expr('{{ $json["توضیح"] || "" }}'),
          'داده_خام': expr('{{ JSON.stringify($json) }}'),
        },
      },
      options: { cellFormat: 'USER_ENTERED', handlingExtraData: 'ignoreIt' },
    },
    credentials: sheetsCred,
  },
});

const done = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'پایان ثبت',
    parameters: {
      operation: 'completion',
      respondWith: 'text',
      completionTitle: 'آورده ثبت شد',
      completionMessage: expr('شناسه رکورد: {{ $json["شناسه_مرتبط"] }}\n\nبرای ثبت آوردهٔ بعدی صفحه را دوباره باز کنید.'),
    },
  },
});

const note1 = sticky(
  '## فرم آورده سرمایه‌گذار\n\nمسیر: در پنل خصوصی مدیر\n\nفهرست سرمایه‌گذاران **زنده از شیت «سرمایه‌گذاران»** خوانده می‌شود؛ ردیف جدید را در شیت اضافه کنید، فرم خودش به‌روز می‌شود.',
  [formStart, readInvestors, prepForm],
  { color: 4 }
);

const note2 = sticky(
  '## چرا نرخ طلا و دلار ذخیره می‌شود؟\n\nآورده سرمایه‌گذار **درآمد نیست** — در سود ماه نمی‌آید و در شیت جداگانه ثبت می‌شود.\n\nهنگام ثبت، معادل **گرم طلای ۱۸ عیار** و **دلار** همان روز ذخیره می‌شود. سال‌ها بعد ارزش واقعی آورده = گرم طلا × نرخ روز. دقیق‌ترین راه حفظ ارزش در برابر تورم.\n\nاگر API نرخ در دسترس نباشد، ردیف باز هم ثبت می‌شود و تعدیل با «تورم رسمی» شیت شاخص انجام می‌گیرد.',
  [goldRate, usdRate, normalize],
  { color: 6 }
);

export default workflow('wf07-capital', '۰۷ | ثبت آورده سرمایه‌گذار')
  .add(note1)
  .add(note2)
  .add(formStart)
  .to(readInvestors)
  .to(prepForm)
  .to(formDetails)
  .to(goldRate)
  .to(usdRate)
  .to(normalize)
  .to(writeCapital)
  .to(writeLog)
  .to(done);
