/* eslint-disable */
/**
 * قطعه‌کد مشترک تاریخ شمسی + کمکی‌های عددی.
 * این بلوک عیناً در ابتدای نودهای Code همه‌ی ورک‌فلوها اینلاین می‌شود
 * (سندباکس n8n اجازه‌ی require یا import ندارد).
 * برای نسخه‌ی خوانا و تست‌شده به ../lib/jalali.js نگاه کنید.
 */
function _div(a, b) { return ~~(a / b); }
function _mod(a, b) { return a - ~~(a / b) * b; }
function jalCal(jy) {
  var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  var bl = breaks.length, gy = jy + 621, leapJ = -14, jp = breaks[0], jm, jump = 0, leap, n, i;
  if (jy < jp || jy >= breaks[bl - 1]) throw new Error('سال شمسی نامعتبر: ' + jy);
  for (i = 1; i < bl; i++) { jm = breaks[i]; jump = jm - jp; if (jy < jm) break; leapJ = leapJ + _div(jump, 33) * 8 + _div(_mod(jump, 33), 4); jp = jm; }
  n = jy - jp;
  leapJ = leapJ + _div(n, 33) * 8 + _div(_mod(n, 33) + 3, 4);
  if (_mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  var leapG = _div(gy, 4) - _div((_div(gy, 100) + 1) * 3, 4) - 150;
  var march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + _div(jump + 4, 33) * 33;
  leap = _mod(_mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap: leap, gy: gy, march: march };
}
function g2d(gy, gm, gd) {
  var d = _div((gy + _div(gm - 8, 6) + 100100) * 1461, 4) + _div(153 * _mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  return d - _div(_div(gy + 100100 + _div(gm - 8, 6), 100) * 3, 4) + 752;
}
function d2g(jdn) {
  var j = 4 * jdn + 139361631;
  j = j + _div(_div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  var i = _div(_mod(j, 1461), 4) * 5 + 308;
  var gd = _div(_mod(i, 153), 5) + 1;
  var gm = _mod(_div(i, 153), 12) + 1;
  var gy = _div(j, 1461) - 100100 + _div(8 - gm, 6);
  return { gy: gy, gm: gm, gd: gd };
}
function j2d(jy, jm, jd) { var r = jalCal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - _div(jm, 7) * (jm - 7) + jd - 1; }
function d2j(jdn) {
  var gy = d2g(jdn).gy, jy = gy - 621, r = jalCal(jy), jdn1f = g2d(gy, 3, r.march), jm, jd, k = jdn - jdn1f;
  if (k >= 0) { if (k <= 185) { jm = 1 + _div(k, 31); jd = _mod(k, 31) + 1; return { jy: jy, jm: jm, jd: jd }; } k -= 186; }
  else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
  jm = 7 + _div(k, 30); jd = _mod(k, 30) + 1;
  return { jy: jy, jm: jm, jd: jd };
}
function toJalaali(gy, gm, gd) { return d2j(g2d(gy, gm, gd)); }
function toGregorian(jy, jm, jd) { return d2g(j2d(jy, jm, jd)); }
function jLeap(jy) { return jalCal(jy).leap === 0; }
function jMonthLen(jy, jm) { return jm <= 6 ? 31 : (jm <= 11 ? 30 : (jLeap(jy) ? 30 : 29)); }

var JM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

function fa2en(s) {
  return String(s == null ? '' : s)
    .replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
    .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
}
function num(v) {
  var s = fa2en(v).replace(/,/g, '').replace(/[^0-9.\-]/g, '');
  if (s === '' || s === '-' || s === '.') return 0;
  var n = Number(s);
  return isFinite(n) ? n : 0;
}
function pad2(n) { return String(n).padStart(2, '0'); }
function todayJ() {
  var t = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
  return toJalaali(t.getFullYear(), t.getMonth() + 1, t.getDate());
}
/** ورودی خالی → امروز؛ 1405/05/18 → شمسی؛ 2026-08-09 → میلادی. */
function parseDate(input) {
  var s = fa2en(input).trim();
  var j = null;
  if (s) {
    var m = s.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    if (m) {
      var a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);
      if (a >= 1200 && a <= 1600) {
        try { if (b >= 1 && b <= 12 && c >= 1 && c <= jMonthLen(a, b)) j = { jy: a, jm: b, jd: c }; } catch (e) { j = null; }
      } else if (a >= 1900 && a <= 2200) {
        try { if (b >= 1 && b <= 12 && c >= 1 && c <= 31) j = toJalaali(a, b, c); } catch (e) { j = null; }
      }
    }
  }
  if (!j) j = todayJ();
  var g = toGregorian(j.jy, j.jm, j.jd);
  return {
    shamsi: j.jy + '/' + pad2(j.jm) + '/' + pad2(j.jd),
    miladi: g.gy + '-' + pad2(g.gm) + '-' + pad2(g.gd),
    jy: j.jy, jm: j.jm, jd: j.jd,
    key: j.jy + '-' + pad2(j.jm),
    monthName: JM[j.jm - 1],
  };
}
function nowTehran() {
  var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}
function newId(prefix) {
  return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
}
/** مقدار اولین کلید موجود از میان چند نام محتمل */
function pick(obj, names, dflt) {
  for (var i = 0; i < names.length; i++) {
    if (obj && obj[names[i]] !== undefined && obj[names[i]] !== null && obj[names[i]] !== '') return obj[names[i]];
  }
  return dflt === undefined ? '' : dflt;
}
