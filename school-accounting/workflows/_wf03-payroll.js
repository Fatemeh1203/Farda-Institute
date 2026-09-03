function toNum(v){var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);}).replace(/[٬٫،,_\s]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(/[^0-9.\-]/g,'');var n=Number(s);return Number.isFinite(n)?n:0;}
function rows(name){ try { return $(name).all().map(function(i){return i.json||{};}); } catch(e) { return []; } }

const period = $('تعیین دوره').first().json;
const JY = period.jy;
const JM = period.jm;

const settings = {};
rows('تنظیمات').forEach(function (r) { if (r['کلید']) settings[String(r['کلید']).trim()] = r['مقدار']; });

const taxPct = toNum(settings['درصد_مالیات']);
const insPct = toNum(settings['درصد_بیمه']);
const reportEmail = String(settings['ایمیل_گزارش'] || 'f.shams.apg@gmail.com');
const schoolName = String(settings['نام_آموزشگاه'] || 'آموزشگاه علمی فردا');

const inPeriod = function (r) { return toNum(r['سال_شمسی']) === JY && toNum(r['ماه_شمسی']) === JM; };

const teachers = rows('مدرسین').filter(function (r) { return r['کد_مدرس'] && String(r['وضعیت'] || '').trim() !== 'غیرفعال'; });
const classRows = rows('کلاس‌ها').filter(function (r) { return r['کد_کلاس']; });
const schedule = rows('برنامه کلاس‌ها').filter(function (r) { return r['شناسه'] && inPeriod(r); });
const income = rows('درآمد').filter(function (r) { return r['شناسه'] && inPeriod(r); });
const expenses = rows('هزینه‌ها').filter(function (r) { return r['شناسه'] && inPeriod(r); });
const capital = rows('آورده سرمایه').filter(function (r) { return r['شناسه'] && inPeriod(r); });

const classType = {};
classRows.forEach(function (c) { classType[String(c['کد_کلاس']).trim()] = String(c['نوع_کلاس'] || ''); });

const byTeacher = {};
function bucket(key, code, name) {
  if (!byTeacher[key]) {
    byTeacher[key] = { code: code || '', name: name || '', baseH: 0, baseO: 0, shareH: 0, shareO: 0, sessH: 0, sessO: 0, students: 0 };
  }
  if (!byTeacher[key].name && name) byTeacher[key].name = name;
  return byTeacher[key];
}

// حقوق از روی واریزی‌های وصول‌شده
income.forEach(function (r) {
  const share = toNum(r['سهم_مدرس']);
  if (share <= 0) return;
  const code = String(r['کد_مدرس'] || '').trim();
  const name = String(r['نام_مدرس'] || '').trim();
  if (!code && !name) return;
  const key = code || ('نام:' + name);
  const b = bucket(key, code, name);
  const amount = toNum(r['مبلغ']);
  const t = classType[String(r['کد_کلاس'] || '').trim()] || '';
  if (t.indexOf('آنلاین') >= 0) { b.baseO += amount; b.shareO += share; }
  else { b.baseH += amount; b.shareH += share; }
});

// شمارش جلسات فقط برای گزارش
let totalSessions = 0;
let totalStudents = 0;
schedule.forEach(function (r) {
  if (String(r['وضعیت'] || '').indexOf('لغو') >= 0) return;
  const n = toNum(r['تعداد_جلسه']) || 1;
  const st = toNum(r['تعداد_فراگیر']);
  totalSessions += n;
  totalStudents += st;
  const code = String(r['کد_مدرس'] || '').trim();
  const name = String(r['نام_مدرس'] || '').trim();
  if (!code && !name) return;
  const key = code || ('نام:' + name);
  const b = bucket(key, code, name);
  if (String(r['نوع_کلاس'] || '').indexOf('آنلاین') >= 0) b.sessO += n;
  else b.sessH += n;
  b.students += st;
});

const now = new Date().toISOString();
const payroll = [];
let payrollTotal = 0;
const EMPTY = { code: '', name: '', baseH: 0, baseO: 0, shareH: 0, shareO: 0, sessH: 0, sessO: 0, students: 0 };

function pushRow(code, name, email, iban, b, fixed) {
  const variable = b.shareH + b.shareO;
  if (variable === 0 && fixed === 0) return;
  const gross = variable + fixed;
  const deductions = Math.round(gross * (taxPct + insPct) / 100);
  const net = gross - deductions;
  payrollTotal += net;
  payroll.push({
    'شناسه_دوره': period.periodId + '|' + (code || name),
    'سال_شمسی': JY,
    'ماه_شمسی': JM,
    'کد_مدرس': code,
    'نام_مدرس': name,
    'ایمیل': email,
    'جلسات_حضوری': b.sessH,
    'جلسات_آنلاین': b.sessO,
    'درآمد_منتسب_حضوری': b.baseH,
    'درآمد_منتسب_آنلاین': b.baseO,
    'درصد_حضوری': b.baseH > 0 ? Math.round(b.shareH / b.baseH * 1000) / 10 : 0,
    'درصد_آنلاین': b.baseO > 0 ? Math.round(b.shareO / b.baseO * 1000) / 10 : 0,
    'حقوق_درصدی': variable,
    'حقوق_ثابت': fixed,
    'کسورات': deductions,
    'خالص_پرداختی': net,
    'شماره_شبا': iban,
    'وضعیت_پرداخت': 'پرداخت نشده',
    'تاریخ_محاسبه': now,
  });
}

const seen = {};
teachers.forEach(function (t) {
  const code = String(t['کد_مدرس']).trim();
  seen[code] = true;
  const b = byTeacher[code] || EMPTY;
  const contract = String(t['نوع_قرارداد'] || 'درصدی');
  const hasFixed = contract.indexOf('ثابت') >= 0 || contract.indexOf('ترکیبی') >= 0;
  const fixed = hasFixed ? toNum(t['حقوق_ثابت_ماهانه']) : 0;
  pushRow(code, String(t['نام_مدرس'] || ''), String(t['ایمیل'] || ''), String(t['شماره_شبا'] || ''), b, fixed);
});

// مدرس‌هایی که در شیت «مدرسین» نیستند ولی سهمشان ثبت شده
Object.keys(byTeacher).forEach(function (key) {
  const b = byTeacher[key];
  if (b.code && seen[b.code]) return;
  pushRow(b.code, b.name || b.code, '', '', b, 0);
});

payroll.sort(function (a, b) { return b['خالص_پرداختی'] - a['خالص_پرداختی']; });

let tuition = 0, partner = 0, other = 0;
income.forEach(function (r) {
  const kind = String(r['نوع_درآمد'] || '');
  const amount = toNum(r['مبلغ']);
  if (kind.indexOf('شهریه') >= 0) tuition += amount;
  else if (kind.indexOf('همکار') >= 0) partner += amount;
  else other += amount;
});
const totalIncome = tuition + partner + other;

const expenseByCategory = {};
let otherExpenses = 0;
expenses.forEach(function (r) {
  const c = String(r['دسته_هزینه'] || 'سایر');
  const amount = toNum(r['مبلغ']);
  expenseByCategory[c] = (expenseByCategory[c] || 0) + amount;
  otherExpenses += amount;
});

const totalExpenses = otherExpenses + payrollTotal;
const profit = totalIncome - totalExpenses;
const margin = totalIncome > 0 ? Math.round(profit / totalIncome * 1000) / 10 : 0;
let capitalIn = 0;
capital.forEach(function (r) { capitalIn += toNum(r['مبلغ_تومان']); });

const summary = {
  'شناسه_دوره': period.periodId,
  'سال_شمسی': JY,
  'ماه_شمسی': JM,
  'نام_ماه': period.monthName,
  'درآمد_شهریه': tuition,
  'درآمد_همکاری': partner,
  'درآمد_سایر': other,
  'جمع_درآمد': totalIncome,
  'حقوق_مدرسین': payrollTotal,
  'سایر_هزینه‌ها': otherExpenses,
  'جمع_هزینه': totalExpenses,
  'سود_عملیاتی': profit,
  'حاشیه_سود_درصد': margin,
  'آورده_سرمایه_گذار': capitalIn,
  'جریان_نقد_خالص': profit + capitalIn,
  'تعداد_جلسات': totalSessions,
  'تعداد_فراگیر': totalStudents,
  'تاریخ_تولید': now,
};

return [{
  json: {
    period: period,
    schoolName: schoolName,
    reportEmail: reportEmail,
    taxPct: taxPct,
    insPct: insPct,
    payroll: payroll,
    summary: summary,
    expenseByCategory: expenseByCategory,
  },
}];
