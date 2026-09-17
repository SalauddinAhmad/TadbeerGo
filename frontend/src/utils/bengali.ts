// Bengali numeral and formatting utilities

export const toBengaliDigits = (num: number | string): string => {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const bengaliNumerals: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return str.replace(/[0-9]/g, (digit) => bengaliNumerals[digit] || digit);
};

export const formatBanglaTime = (timeStr?: string): string => {
  if (!timeStr) return 'বিকাল ৫:০০';
  const parts = timeStr.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;

  let period = 'সকাল';
  if (h >= 12 && h < 16) {
    period = 'দুপুর';
  } else if (h >= 16 && h < 19) {
    period = 'বিকাল';
  } else if (h >= 19 && h < 24) {
    period = 'রাত';
  } else if (h >= 0 && h < 4) {
    period = 'রাত';
  } else if (h >= 4 && h < 6) {
    period = 'ভোর';
  } else {
    period = 'সকাল';
  }

  const hour12 = h % 12 || 12;
  const minuteStr = String(m).padStart(2, '0');

  return `${period} ${toBengaliDigits(hour12)}:${toBengaliDigits(minuteStr)}`;
};

export const banglaMonthNames = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
];

export const banglaDayNames = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার'
];

export const formatBanglaDate = (dateStr?: string): string => {
  if (!dateStr) return 'বৃহস্পতিবার, ১৭ সেপ্টেম্বর';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayName = banglaDayNames[dateObj.getDay()];
  const dayNum = toBengaliDigits(parts[2]);
  const monthName = banglaMonthNames[parts[1] - 1];
  return `${dayName}, ${dayNum} ${monthName}`;
};
