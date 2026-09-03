const fs = require('fs');
const body = fs.readFileSync(__dirname + '/_wf05-normalize.js', 'utf8');

const settings = [
  {'کلید':'درصد_پیشفرض_حضوری','مقدار':'70'},
  {'کلید':'درصد_پیشفرض_آنلاین','مقدار':'60'},
  {'کلید':'تلگرام_چت_آیدی','مقدار':'793296317'},
  {'کلید':'تلگرام_تأیید_لازم','مقدار':'بله'},
  {'کلید':'دسته_پیشفرض_هزینه','مقدار':'سایر'},
];
const classes = [
  {'کد_کلاس':'C001','نام_کلاس':'ریاضی دهم','کد_مدرس':'M001','نوع_کلاس':'حضوری','درصد_مدرس_اختصاصی':''},
  {'کد_کلاس':'C002','نام_کلاس':'فیزیک کنکور','کد_مدرس':'M002','نوع_کلاس':'آنلاین','درصد_مدرس_اختصاصی':'65'},
];
const teachers = [
  {'کد_مدرس':'M001','نام_مدرس':'علی رضایی','درصد_حضوری':'70','درصد_آنلاین':'60'},
  {'کد_مدرس':'M002','نام_مدرس':'مریم احمدی','درصد_حضوری':'75','درصد_آنلاین':'65'},
];

function run(nodes) {
  const $ = (name) => {
    if (!(name in nodes)) { const e = new Error('no data for ' + name); throw e; }
    const rows = nodes[name];
    return { first: () => { if (!rows.length) throw new Error('empty'); return { json: rows[0] }; },
             all: () => rows.map(r => ({ json: r })) };
  };
  const fn = new Function('$', body);
  return fn($)[0].json;
}

const base = {'تنظیمات': settings, 'کلاس‌ها': classes, 'مدرسین': teachers};

console.log('--- 1) income form, known class C001 ---');
let r = run(Object.assign({}, base, {'فرم واریزی':[{
  'پرداخت_کننده_نوع':'شاگرد','پرداخت_کننده':'سارا محمدی','مبلغ':800000,'تاریخ':'1405-06-01',
  'کلاس':'C001','نام_مدرس':'','درصد_مدرس':'','روش_پرداخت':'کارت به کارت',
  'شماره_پیگیری':'998877','ثبت_کننده':'فاطمه','submittedAt':'x','formMode':'test'}]}));
console.log(r.summary); console.log(JSON.stringify(r.row, null, 0));

console.log('\n--- 2) income form, class C002 online w/ 65% override ---');
r = run(Object.assign({}, base, {'فرم واریزی':[{
  'پرداخت_کننده_نوع':'مدرسه یا سازمان','پرداخت_کننده':'دبیرستان شهید بهشتی','مبلغ':10000000,'تاریخ':'1405-06-02',
  'کلاس':'فیزیک کنکور','روش_پرداخت':'چک','ثبت_کننده':'فاطمه'}]}));
console.log('pct', r.row['درصد_مدرس'], 'teacher', r.row['نام_مدرس'], 'share', r.row['سهم_مدرس'], 'school', r.row['سهم_آموزشگاه'], 'type', r.row['نوع_درآمد']);

console.log('\n--- 3) income form, explicit percentage overrides everything ---');
r = run(Object.assign({}, base, {'فرم واریزی':[{
  'پرداخت_کننده_نوع':'شاگرد','پرداخت_کننده':'رضا','مبلغ':1000000,'تاریخ':'1405-06-03',
  'کلاس':'C001','درصد_مدرس':50,'روش_پرداخت':'نقدی','ثبت_کننده':'فاطمه'}]}));
console.log('pct', r.row['درصد_مدرس'], 'share', r.row['سهم_مدرس'], 'school', r.row['سهم_آموزشگاه']);

console.log('\n--- 4) income, unknown course + free-text teacher ---');
r = run(Object.assign({}, base, {'فرم واریزی':[{
  'پرداخت_کننده_نوع':'شاگرد','پرداخت_کننده':'نیما','مبلغ':500000,'تاریخ':'1405-06-04',
  'کلاس':'شیمی یازدهم','نام_مدرس':'خانم کریمی','درصد_مدرس':60,'روش_پرداخت':'نقدی','ثبت_کننده':'فاطمه'}]}));
console.log(r.summary);

console.log('\n--- 5) income, no course (ندارد), no teacher ---');
r = run(Object.assign({}, base, {'فرم واریزی':[{
  'پرداخت_کننده_نوع':'سایر','پرداخت_کننده':'کمک مالی','مبلغ':2000000,'تاریخ':'1405-06-05',
  'کلاس':'ندارد','روش_پرداخت':'نقدی','ثبت_کننده':'فاطمه'}]}));
console.log('type', r.row['نوع_درآمد'], 'share', r.row['سهم_مدرس'], 'school', r.row['سهم_آموزشگاه'], 'class', JSON.stringify(r.row['نام_کلاس']));
console.log('warns in summary:', r.summary.split('\n').filter(l => l.startsWith('⚠️')));

console.log('\n--- 6) expense form ---');
r = run(Object.assign({}, base, {'فرم هزینه':[{
  'دسته':'اجاره','مبلغ':12000000,'تاریخ':'1405-06-06','شرح':'اجاره شهریور',
  'طرف_حساب':'آقای رضایی','روش_پرداخت':'کارت به کارت','ثبت_کننده':'فاطمه'}]}));
console.log(r.summary); console.log('isExpense', r.isExpense, 'origin', r.origin);

console.log('\n--- 7) webhook, expense inferred ---');
r = run(Object.assign({}, base, {'وبهوک ورودی':[{body:{'نوع':'هزینه','مبلغ':500000,'دسته':'قبوض','شرح':'برق'},headers:{}}]}));
console.log('isExpense', r.isExpense, 'origin', r.origin, 'valid', r.valid);

console.log('\n--- 8) webhook, income with class + teacher pct ---');
r = run(Object.assign({}, base, {'وبهوک ورودی':[{body:{'نوع':'درآمد','مبلغ':800000,'پرداخت_کننده':'سارا','کلاس':'C001','ثبت_کننده':'API'},headers:{}}]}));
console.log('pct', r.row['درصد_مدرس'], 'share', r.row['سهم_مدرس'], 'school', r.row['سهم_آموزشگاه'], 'teacher', r.row['نام_مدرس']);

console.log('\n--- 9) zero amount rejected ---');
r = run(Object.assign({}, base, {'فرم واریزی':[{'پرداخت_کننده_نوع':'شاگرد','پرداخت_کننده':'x','مبلغ':0,'کلاس':'C001','ثبت_کننده':'ف'}]}));
console.log('valid', r.valid, 'reason', r.reason);
