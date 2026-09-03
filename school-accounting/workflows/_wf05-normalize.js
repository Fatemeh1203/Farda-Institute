function div(a,b){return ~~(a/b);}
function mod(a,b){return a-~~(a/b)*b;}
function jalCal(jy){var bk=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],bl=bk.length,gy=jy+621,leapJ=-14,jp=bk[0],jm,jump=0,leap,n,i;if(jy<jp||jy>=bk[bl-1])throw new Error('سال شمسی نامعتبر');for(i=1;i<bl;i++){jm=bk[i];jump=jm-jp;if(jy<jm)break;leapJ=leapJ+div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ=leapJ+div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ+=1;var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;if(jump-n<6)n=n-jump+div(jump+4,33)*33;leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap:leap,gy:gy,march:march};}
function g2d(gy,gm,gd){var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d;}
function d2g(jdn){var j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;var i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy:gy,gm:gm,gd:gd};}
function d2j(jdn){var gy=d2g(jdn).gy,jy=gy-621,r=jalCal(jy),jdn1f=g2d(gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy:jy,jm:jm,jd:jd};}k-=186;}else{jy-=1;k+=179;if(r.leap===1)k+=1;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy:jy,jm:jm,jd:jd};}
function j2d(jy,jm,jd){var r=jalCal(jy);return g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1;}
function pad(n){return String(n).length<2?'0'+n:String(n);}
function jToISO(jy,jm,jd){var g=d2g(j2d(jy,jm,jd));return g.gy+'-'+pad(g.gm)+'-'+pad(g.gd);}
function toJ(iso){var p=String(iso).slice(0,10).split('-');return d2j(g2d(+p[0],+p[1],+p[2]));}
function fa2en(s){return String(s==null?'':s).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);});}
function toNum(v){var s=fa2en(v).replace(/[\u066B\u066C\u060C,_\s'\u2009\u202F]/g,'');s=s.replace(/\.(?=\d{3}(\D|$))/g,'');s=s.replace(/[^0-9.\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}
function money(n){try{return Number(n||0).toLocaleString('fa-IR');}catch(e){return String(n);}}

let src = {};
let origin = 'وبهوک';
let forced = '';
let wh = null;

try {
  wh = $('وبهوک ورودی').first().json;
  src = Object.assign({}, wh.query || {}, wh.body || {});
} catch (e) { wh = null; }

function formJson(nodeName) {
  try {
    const f = $(nodeName).first().json;
    return (f && Object.keys(f).length) ? f : null;
  } catch (e) { return null; }
}

if (!Object.keys(src).length) {
  const fi = formJson('فرم واریزی');
  const fe = formJson('فرم هزینه');
  let chosen = null, label = '', kind = '';
  if (fe && fe['دسته'] !== undefined) { chosen = fe; label = 'فرم هزینه'; kind = 'expense'; }
  else if (fi && fi['پرداخت_کننده_نوع'] !== undefined) { chosen = fi; label = 'فرم واریزی'; kind = 'income'; }
  else if (fi) { chosen = fi; label = 'فرم واریزی'; kind = 'income'; }
  else if (fe) { chosen = fe; label = 'فرم هزینه'; kind = 'expense'; }
  if (chosen) {
    const keys = Object.keys(chosen);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'submittedAt' || keys[i] === 'formMode') continue;
      src[keys[i]] = chosen[keys[i]];
    }
    origin = label;
    forced = kind;
  }
}

function pick() {
  for (let i = 0; i < arguments.length; i++) {
    const k = arguments[i];
    const keys = Object.keys(src);
    for (let j = 0; j < keys.length; j++) {
      if (String(keys[j]).trim().toLowerCase() === String(k).toLowerCase()) {
        const v = src[keys[j]];
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
      }
    }
  }
  return '';
}

function safeRows(name) { try { return $(name).all().map(function (i) { return i.json || {}; }); } catch (e) { return []; } }

const settings = {};
safeRows('تنظیمات').forEach(function (r) { if (r['کلید']) settings[String(r['کلید']).trim()] = r['مقدار']; });
const classes = safeRows('کلاس‌ها').filter(function (c) { return c['کد_کلاس']; });
const teachers = safeRows('مدرسین').filter(function (t) { return t['کد_مدرس']; });

const chatId = String(settings['تلگرام_چت_آیدی'] || '').trim();
const wantApproval = String(settings['تلگرام_تأیید_لازم'] || 'بله').trim() !== 'خیر';
const needsApproval = wantApproval && chatId !== '';
const defaultCat = String(settings['دسته_پیشفرض_هزینه'] || 'سایر').trim();
const defPresent = toNum(settings['درصد_پیشفرض_حضوری']) || 70;
const defOnline = toNum(settings['درصد_پیشفرض_آنلاین']) || 60;

let uploaded = '';
try { uploaded = String($('جمع لینک فاکتورها').first().json.linkText || ''); } catch (e) { uploaded = ''; }

const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });

const rawDate = String(pick('تاریخ', 'date', 'روز', 'تاریخ_شمسی', 'تاریخ_پرداخت')).trim();
let iso = todayISO;
let dateNote = '';
if (rawDate) {
  const p = fa2en(rawDate).split(/[\/\-\.]/).map(function (x) { return parseInt(x, 10); });
  if (p.length >= 3 && p.every(function (n) { return Number.isFinite(n); })) {
    if (p[0] > 1600) iso = p[0] + '-' + pad(p[1]) + '-' + pad(p[2]);
    else if (p[0] > 1200 && p[0] < 1600) iso = jToISO(p[0], p[1], p[2]);
    else dateNote = ' [تاریخ خوانده نشد]';
  } else {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) iso = d.toISOString().slice(0, 10);
    else dateNote = ' [تاریخ خوانده نشد]';
  }
}
const j = toJ(iso);
const shamsi = j.jy + '/' + pad(j.jm) + '/' + pad(j.jd);

const rawType = String(pick('نوع', 'type', 'kind', 'نوع_رکورد')).trim();
const category = String(pick('دسته', 'دسته_هزینه', 'category')).trim();
const vendor = String(pick('طرف_حساب', 'فروشنده', 'vendor', 'supplier')).trim();

let isExpense;
if (forced === 'expense') isExpense = true;
else if (forced === 'income') isExpense = false;
else if (rawType) isExpense = rawType.indexOf('هزینه') >= 0 || rawType.toLowerCase().indexOf('expense') >= 0 || rawType.toLowerCase().indexOf('cost') >= 0;
else isExpense = !!(category || vendor);

const amount = toNum(pick('مبلغ', 'amount', 'قیمت', 'مبلغ_تومان', 'price', 'total', 'جمع'));
const method = String(pick('روش_پرداخت', 'روش پرداخت', 'method', 'payment_method')).trim();
const desc = String(pick('شرح', 'توضیح', 'description', 'note', 'بابت')).trim();
const manualReceipt = String(pick('عکس_فاکتور', 'لینک_فاکتور', 'receipt', 'image_url', 'attachment')).trim();
const receipt = [uploaded, manualReceipt].filter(function (x) { return x; }).join(' | ');
const ref = String(pick('شماره_پیگیری', 'شماره_فیش', 'کد_رهگیری', 'ref', 'reference', 'tracking')).trim();
const payer = String(pick('پرداخت_کننده', 'نام_فراگیر', 'فراگیر', 'نام_شاگرد', 'شاگرد', 'payer', 'student')).trim();
const payerKind = String(pick('پرداخت_کننده_نوع', 'نوع_پرداخت_کننده', 'payer_type')).trim();
const paymentTerms = String(pick('نوع_پرداخت', 'payment_terms', 'terms')).trim();
const recorder = String(pick('ثبت_کننده', 'ثبت کننده', 'recorded_by', 'recorder', 'کاربر')).trim();
const classRawIn = String(pick('کلاس', 'دوره', 'کد_کلاس', 'نام_کلاس', 'class', 'course')).trim();
const classRaw = (classRawIn === 'ندارد' || classRawIn === '-') ? '' : classRawIn;
const teacherRaw = String(pick('نام_مدرس', 'مدرس', 'کد_مدرس', 'teacher')).trim();
const pctRaw = toNum(pick('درصد_مدرس', 'درصد مدرس', 'teacher_percent'));

let cls = {};
if (classRaw) {
  const code = classRaw.indexOf(' — ') > 0 ? classRaw.split(' — ')[0].trim() : classRaw;
  cls = classes.filter(function (c) { return String(c['کد_کلاس']).trim() === code; })[0]
     || classes.filter(function (c) { return String(c['نام_کلاس']).trim() === classRaw; })[0]
     || classes.filter(function (c) { return String(c['نام_کلاس']).indexOf(classRaw) >= 0; })[0]
     || {};
}

let teacher = {};
const clsTeacherCode = String(cls['کد_مدرس'] || '').trim();
if (clsTeacherCode) {
  teacher = teachers.filter(function (t) { return String(t['کد_مدرس']).trim() === clsTeacherCode; })[0] || {};
}
if (!teacher['کد_مدرس'] && teacherRaw) {
  teacher = teachers.filter(function (t) { return String(t['کد_مدرس']).trim() === teacherRaw; })[0]
         || teachers.filter(function (t) { return String(t['نام_مدرس']).trim() === teacherRaw; })[0]
         || teachers.filter(function (t) { return String(t['نام_مدرس']).indexOf(teacherRaw) >= 0; })[0]
         || {};
}
const teacherCode = String(teacher['کد_مدرس'] || '').trim();
const teacherName = String(teacher['نام_مدرس'] || '').trim() || teacherRaw;

const isOnline = String(cls['نوع_کلاس'] || '').indexOf('آنلاین') >= 0;
let pct = pctRaw;
if (!pct) pct = toNum(cls['درصد_مدرس_اختصاصی']);
if (!pct) pct = isOnline ? toNum(teacher['درصد_آنلاین']) : toNum(teacher['درصد_حضوری']);
if (!pct && teacherName) pct = isOnline ? defOnline : defPresent;
if (pct < 0) pct = 0;
if (pct > 100) pct = 100;

const teacherShare = teacherName ? Math.round(amount * pct / 100) : 0;
const schoolShare = amount - teacherShare;

const senderIp = wh ? String((wh.headers && (wh.headers['x-forwarded-for'] || wh.headers['x-real-ip'])) || '').split(',')[0].trim() : '';
const now = new Date().toISOString();
const uid = Date.now().toString(36).slice(-5).toUpperCase();

const warns = [];
let valid = true;
let reason = '';
if (amount <= 0) { valid = false; reason = 'مبلغ معتبر پیدا نشد'; }

const payerOut = isExpense ? payer : (payer || 'نامشخص');
if (!isExpense) {
  if (!payer) warns.push('نام پرداخت‌کننده خالی بود — «نامشخص» ثبت می‌شود');
  if (classRaw && !cls['کد_کلاس']) warns.push('دوره «' + classRaw + '» در شیت «کلاس‌ها» پیدا نشد — نامش عیناً ثبت می‌شود');
  if (!teacherName) warns.push('مدرسی مشخص نشد — سهم مدرس صفر ثبت می‌شود');
  else if (!teacher['کد_مدرس']) warns.push('مدرس «' + teacherName + '» در شیت «مدرسین» نیست — فقط نامش ثبت می‌شود');
}
if (dateNote) warns.push('تاریخ خوانده نشد — امروز ثبت می‌شود');

let incomeType = String(pick('نوع_درآمد', 'income_type')).trim();
if (!incomeType) {
  if (payerKind.indexOf('فراگیر') >= 0 || payerKind.indexOf('شاگرد') >= 0 || payerKind.indexOf('دانش') >= 0) incomeType = 'شهریه فراگیر';
  else if (payerKind.indexOf('سفارش') >= 0 || payerKind.indexOf('پروژه') >= 0) incomeType = 'سفارش پروژه';
  else if (payerKind.indexOf('مدرسه') >= 0 || payerKind.indexOf('سازمان') >= 0 || payerKind.indexOf('مجموعه') >= 0) incomeType = 'مجموعه همکار';
  else if (payerKind) incomeType = 'سایر';
  else {
    const blob = (desc + ' ' + classRaw + ' ' + payer).trim();
    if (cls['کد_کلاس'] || classRaw || blob.indexOf('شهریه') >= 0) incomeType = 'شهریه فراگیر';
    else if (blob.indexOf('همکار') >= 0 || blob.indexOf('مجموعه') >= 0) incomeType = 'مجموعه همکار';
    else incomeType = 'سایر';
  }
}

let row;
if (isExpense) {
  row = {
    'شناسه': 'EX-' + j.jy + pad(j.jm) + '-W' + uid,
    'تاریخ_شمسی': shamsi, 'تاریخ_میلادی': iso, 'سال_شمسی': j.jy, 'ماه_شمسی': j.jm,
    'دسته_هزینه': category || defaultCat,
    'شرح': desc || ('فاکتور از ' + origin),
    'مبلغ': amount,
    'روش_پرداخت': method,
    'طرف_حساب': vendor,
    'نوع_هزینه': 'متغیر',
    'توضیح': dateNote.trim(),
    'منبع': origin + (needsApproval ? '' : ' (بدون تأیید)'),
    'زمان_ثبت': now,
    'ثبت_کننده': recorder,
    'لینک_فاکتور': receipt,
  };
} else {
  row = {
    'شناسه': 'IN-' + j.jy + pad(j.jm) + '-W' + uid,
    'تاریخ_شمسی': shamsi, 'تاریخ_میلادی': iso, 'سال_شمسی': j.jy, 'ماه_شمسی': j.jm,
    'نوع_درآمد': incomeType,
    'پرداخت_کننده': payerOut,
    'کد_کلاس': cls['کد_کلاس'] || '',
    'نام_کلاس': cls['نام_کلاس'] || classRaw,
    'کد_مدرس': teacherCode,
    'مبلغ': amount,
    'روش_پرداخت': method,
    'شماره_پیگیری': ref,
    'توضیح': (desc + dateNote).trim(),
    'منبع': origin + (needsApproval ? '' : ' (بدون تأیید)'),
    'زمان_ثبت': now,
    'ثبت_کننده': recorder,
    'لینک_فاکتور': receipt,
    'نوع_پرداخت_کننده': payerKind,
    'نوع_پرداخت': paymentTerms,
    'نام_مدرس': teacherName,
    'درصد_مدرس': teacherName ? pct : '',
    'سهم_مدرس': teacherShare,
    'سهم_آموزشگاه': schoolShare,
  };
}

const lines = [];
lines.push(isExpense ? '🧾 فاکتور هزینه — درخواست ثبت' : '💰 واریزی جدید — درخواست ثبت');
lines.push('');
lines.push('مبلغ: ' + money(amount) + ' تومان');
lines.push('تاریخ پرداخت: ' + shamsi);
if (isExpense) {
  lines.push('دسته: ' + (category || defaultCat));
  lines.push('شرح: ' + (desc || '—'));
  if (vendor) lines.push('طرف حساب: ' + vendor);
} else {
  lines.push('پرداخت‌کننده: ' + payerOut + (payerKind ? ' (' + payerKind + ')' : ''));
  lines.push('نوع درآمد: ' + incomeType);
  if (paymentTerms) lines.push('نوع پرداخت: ' + paymentTerms);
  if (cls['کد_کلاس']) lines.push('دوره: ' + cls['کد_کلاس'] + ' — ' + cls['نام_کلاس'] + (cls['نوع_کلاس'] ? ' (' + cls['نوع_کلاس'] + ')' : ''));
  else if (classRaw) lines.push('دوره: ' + classRaw);
  if (teacherName) {
    lines.push('مدرس: ' + teacherName + (teacherCode ? ' (' + teacherCode + ')' : ''));
    lines.push('درصد مدرس: ' + pct + '٪');
    lines.push('سهم مدرس: ' + money(teacherShare) + ' تومان');
    lines.push('سهم آموزشگاه: ' + money(schoolShare) + ' تومان');
  }
  if (desc) lines.push('شرح: ' + desc);
}
if (method) lines.push('روش پرداخت: ' + method);
if (ref) lines.push('شماره فیش: ' + ref);
if (recorder) lines.push('ثبت‌کننده: ' + recorder);
if (receipt) lines.push('فاکتور: ' + receipt);
lines.push('');
lines.push('شناسه: ' + row['شناسه']);
lines.push('منبع: ' + origin);
if (senderIp) lines.push('فرستنده: ' + senderIp);
for (let w = 0; w < warns.length; w++) lines.push('⚠️ ' + warns[w]);
lines.push('');
lines.push(isExpense ? 'با تأیید شما در شیت «هزینه‌ها» ثبت می‌شود.' : 'با تأیید شما در شیت «درآمد» ثبت می‌شود.');

return [{
  json: {
    valid: valid,
    reason: reason,
    chatId: chatId,
    hasChat: chatId !== '',
    needsApproval: needsApproval,
    isExpense: isExpense,
    origin: origin,
    receipt: receipt,
    summary: lines.join('\n'),
    row: row,
    rawPayload: JSON.stringify(src).slice(0, 4000),
  },
}];
