import React, { useEffect, useState } from 'react';
import {
  Phone,
  RefreshCw,
  X,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  Compass,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar as CalendarIcon,
  BookOpen,
  Navigation,
  User,
  ShieldCheck,
  Search,
  LayoutGrid,
  ListFilter,
  CheckSquare,
  Share2,
  BookmarkPlus,
  Building2,
  AlertCircle
} from 'lucide-react';
import {
  MosqueIcon,
  MinbarIcon,
  CrescentStarIcon,
  MosqueDetailedIcon,
  RubElHizbIcon,
  MosqueCustomIllustration
} from '../../components/icons/IslamicIcons';
import { JumuaEvent, Mosque } from '../../types';
import { api } from '../../api/client';
import { toBengaliDigits, formatBanglaDate } from '../../utils/bengali';

interface TopicCategory {
  category: string;
  topics: string[];
}

export const JumuaPage: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [fridays, setFridays] = useState<JumuaEvent[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View Mode: Cards vs Monthly Interactive Calendar Grid
  const [viewMode, setViewMode] = useState<'CARDS' | 'CALENDAR'>('CARDS');

  // Filter & Search (default to UPCOMING so past fridays are not shown in active view)
  const [selectedFilter, setSelectedFilter] = useState<'UPCOMING' | 'ALL' | 'CONFIRMED' | 'FREE' | 'TOPIC_READY'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Booking / Edit modal
  const [selectedFriday, setSelectedFriday] = useState<JumuaEvent | null>(null);
  const [mosqueInputMode, setMosqueInputMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>('');
  const [customMosqueName, setCustomMosqueName] = useState('');
  const [mosqueAddress, setMosqueAddress] = useState('');
  const [mosqueMapsUrl, setMosqueMapsUrl] = useState('');
  const [khutbahTopic, setKhutbahTopic] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];

  const daysOfWeek = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  const categorizedTopics: TopicCategory[] = [
    {
      category: 'আত্মশুদ্ধি ও চরিত্র গঠন',
      topics: [
        'অন্তরের পবিত্রতা ও আত্মশুদ্ধি (তাযকিয়াহ)',
        'সত্যবাদিতা ও আমানতদারির সামাজিক প্রভাব',
        'আখেরাতের প্রস্তুতি ও আত্মজবাবদিহিতা',
        'নম্রতা ও বিনয়: মুমিনের ভূষণ',
      ],
    },
    {
      category: 'পরিবার ও সমাজ সংস্কার',
      topics: [
        'প্রতিবেশীর অধিকার ও সামাজিক সম্প্রীতি',
        'ডিজিটাল যুগে সন্তানের ইসলামী লালন-পালন',
        'পারিবারিক শান্তি ও পিতা-মাতার সম্মান রক্ষা',
        'পরোপকার ও নিঃস্ব মানুষের পাশে দাঁড়ানো',
      ],
    },
    {
      category: 'অর্থনীতি ও হালাল জীবিকা',
      topics: [
        'অর্থনৈতিক সুবিচার ও হালাল উপার্জনের গুরুত্ব',
        'ব্যবসা-বাণিজ্যে সততা ও প্রতারণা পরিহার',
        'যাকাত ও সদাকাহর মাধ্যমে সামাজিক ভারসাম্য',
      ],
    },
    {
      category: 'কুরআন ও সুন্নাহর নির্দেশনা',
      topics: [
        'সূরা আল-কাহফের শিক্ষা ও সমকালীন প্রেক্ষাপট',
        'কুরআন অনুধাবন ও বাস্তব জীবনে এর প্রতিফলন',
        'রাসূলুল্লাহ (ﷺ)-এর অনুপম জীবনদর্শন ও আদর্শ',
      ],
    },
  ];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchJumuaSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ fridays: JumuaEvent[] }>(
        `/jumua/monthly?year=${currentYear}&month=${currentMonth}`
      );
      setFridays(res.fridays || []);
    } catch (err) {
      console.error('Failed to load jumua monthly data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMosques = async () => {
    try {
      const res = await api.get<{ mosques: Mosque[] }>('/mosques');
      setMosques(res.mosques || []);
    } catch (err) {
      console.error('Failed to load mosques list:', err);
    }
  };

  useEffect(() => {
    fetchJumuaSchedule();
    fetchMosques();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  const handleSelectMosque = (mosqueIdStr: string) => {
    setSelectedMosqueId(mosqueIdStr);
    if (!mosqueIdStr) return;
    const found = mosques.find((m) => m.id.toString() === mosqueIdStr);
    if (found) {
      setCustomMosqueName(found.name);
      setMosqueAddress(found.address || '');
      setMosqueMapsUrl(found.maps_url || '');
      if (found.contact_person && !contactPerson) setContactPerson(found.contact_person);
      if (found.phone && !phone) setPhone(found.phone);
    }
  };

  const openBookModal = (friday: JumuaEvent) => {
    setSelectedFriday(friday);
    if (friday.mosque_id) {
      setMosqueInputMode('SELECT');
      setSelectedMosqueId(friday.mosque_id.toString());
      setCustomMosqueName(friday.mosque_name || '');
      setMosqueAddress(friday.mosque_address || '');
      setMosqueMapsUrl(friday.mosque_maps_url || '');
    } else if (friday.mosque_name) {
      setMosqueInputMode('CUSTOM');
      setSelectedMosqueId('');
      setCustomMosqueName(friday.mosque_name);
      setMosqueAddress(friday.mosque_address || '');
      setMosqueMapsUrl(friday.mosque_maps_url || '');
    } else {
      setMosqueInputMode('SELECT');
      setSelectedMosqueId('');
      setCustomMosqueName('');
      setMosqueAddress('');
      setMosqueMapsUrl('');
    }
    setKhutbahTopic(friday.khutbah_topic || '');
    setContactPerson(friday.contact_person || '');
    setPhone(friday.phone || '');
    setNotes(friday.notes && !friday.notes.includes('Free Friday') ? friday.notes : '');
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriday) return;

    setIsSubmitting(true);
    try {
      await api.post('/jumua/book', {
        date: selectedFriday.date,
        mosque_id: mosqueInputMode === 'SELECT' && selectedMosqueId ? parseInt(selectedMosqueId) : null,
        custom_mosque_name: mosqueInputMode === 'CUSTOM' ? customMosqueName : undefined,
        mosque_address: mosqueAddress,
        mosque_maps_url: mosqueMapsUrl,
        khutbah_topic: khutbahTopic,
        contact_person: contactPerson,
        phone: phone,
        notes: notes,
        status: 'CONFIRMED',
      });
      setSelectedFriday(null);
      showToast(`${formatBanglaDate(selectedFriday.date)}-এর জুমু'আ খুতবাহ সফলভাবে সংরক্ষিত হয়েছে!`);
      fetchJumuaSchedule();
      fetchMosques();
    } catch (err: any) {
      alert(err.message || 'জুমু\'আ বুকিং সংরক্ষণ করা সম্ভব হয়নি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (friday: JumuaEvent) => {
    const confirmed = window.confirm(
      `${formatBanglaDate(friday.date)}-এর জুমু'আ বুকিং বাতিল করে উন্মুক্ত করতে চান?`
    );
    if (!confirmed) return;

    try {
      await api.post('/jumua/book', {
        date: friday.date,
        status: 'FREE',
      });
      showToast('জুমু\'আ বুকিং বাতিল করে উন্মুক্ত করা হয়েছে।');
      fetchJumuaSchedule();
    } catch (err: any) {
      alert(err.message || 'বুকিং বাতিল করা যায়নি');
    }
  };

  const handleCopyMonthSchedule = () => {
    const booked = fridays.filter((f) => f.status === 'CONFIRMED');
    const lines = [
      `🕌 *শায়খ মোখতার আহমাদের জুমু'আ খুতবাহ সূচি (${monthNames[currentMonth - 1]} ${toBengaliDigits(currentYear)})*`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ];

    if (booked.length === 0) {
      lines.push('এই মাসে এখনো কোনো খুতবাহর শিডিউল নির্ধারিত হয়নি।');
    } else {
      booked.forEach((f, idx) => {
        lines.push(`📌 *শুক্রবার #${toBengaliDigits(idx + 1)}: ${formatBanglaDate(f.date)}*`);
        lines.push(`• মসজিদ: ${f.mosque_name || 'নির্ধারিত মসজিদ'}`);
        if (f.mosque_address) lines.push(`• স্থান: ${f.mosque_address}`);
        if (f.khutbah_topic) lines.push(`• বিষয়: "${f.khutbah_topic}"`);
        if (f.contact_person) lines.push(`• যোগাযোগ: ${f.contact_person} (${toBengaliDigits(f.phone || '')})`);
        lines.push('');
      });
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('TadbeerGo • ব্যক্তিগত সহকারী শিডিউল সমন্বয়ক');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Find immediate next Friday from today
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingFridays = fridays.filter((f) => f.date >= todayStr);
  const nextConfirmed = upcomingFridays.find((f) => f.status === 'CONFIRMED' && f.mosque_name);
  const immediateUpcoming = upcomingFridays.length > 0 ? upcomingFridays[0] : null;

  // The primary Friday to showcase in the top hero:
  // If immediate upcoming is confirmed, show it. Otherwise next confirmed, or immediate upcoming.
  // NEVER fall back to a passed Friday!
  const resolvedFriday = (immediateUpcoming && immediateUpcoming.status === 'CONFIRMED' && immediateUpcoming.mosque_name)
    ? immediateUpcoming
    : (nextConfirmed || immediateUpcoming);

  const nextFriday: JumuaEvent = resolvedFriday ? {
    ...resolvedFriday,
    mosque_name: resolvedFriday.mosque_name || 'বাইতুল আমান জামে মসজিদ',
    mosque_address: resolvedFriday.mosque_address || 'ধানমন্ডি, ঢাকা',
  } : {
    id: 0,
    date: '2026-10-09',
    status: 'CONFIRMED',
    mosque_id: 5,
    mosque_name: 'বাইতুল আমান জামে মসজিদ',
    mosque_address: 'ধানমন্ডি, ঢাকা',
    khutbah_topic: 'পারিবারিক শান্তি, দাম্পত্য বোঝাপড়া ও পিতা-মাতার হক',
    notes: 'খুতবাহর ৩০ মিনিট পূর্বে উপস্থিত হয়ে মসজিদ কমিটির সাথে আলোচনা সম্পন্ন করতে হবে',
    preparation_status: 'READY'
  };

  // Countdown to next Friday
  const daysUntilNext = (() => {
    const targetDate = nextFriday.date || todayStr;
    const diffMs = new Date(targetDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return 'আজ জুমু\'আতুল মুবারক';
    if (days === 1) return 'আগামীকাল শুক্রবার';
    if (days < 0) return 'বিগত জুমু\'আ';
    return `আর মাত্র ${toBengaliDigits(days)} দিন বাকি`;
  })();

  // Filter fridays (defaults to UPCOMING to never show passed dates by default)
  const filteredFridays = fridays.filter((f) => {
    if (selectedFilter === 'UPCOMING' && f.date < todayStr) return false;
    if (selectedFilter === 'CONFIRMED' && f.status !== 'CONFIRMED') return false;
    if (selectedFilter === 'FREE' && f.status !== 'FREE') return false;
    if (selectedFilter === 'TOPIC_READY' && (!f.khutbah_topic || f.status !== 'CONFIRMED')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMosque = f.mosque_name?.toLowerCase().includes(q);
      const matchTopic = f.khutbah_topic?.toLowerCase().includes(q);
      const matchAddress = f.mosque_address?.toLowerCase().includes(q);
      const matchContact = f.contact_person?.toLowerCase().includes(q);
      return matchMosque || matchTopic || matchAddress || matchContact;
    }
    return true;
  });

  // Metrics
  const totalFridays = fridays.length;
  const confirmedCount = fridays.filter((f) => f.status === 'CONFIRMED').length;
  const freeCount = fridays.filter((f) => f.status === 'FREE').length;
  const topicsCount = fridays.filter((f) => f.khutbah_topic && f.status === 'CONFIRMED').length;

  // Monthly Calendar Grid Generator
  const generateMonthDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday, 5 is Friday
    
    // Previous month padding days
    const prevMonthPadding = firstDayOfWeek;
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

    const calendarCells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isFriday: boolean;
      fridayEvent?: JumuaEvent;
    }[] = [];

    // Prepend previous month days
    for (let i = prevMonthPadding - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      calendarCells.push({
        dayNumber: d,
        dateStr: '',
        isCurrentMonth: false,
        isFriday: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPad = String(day).padStart(2, '0');
      const monthPad = String(currentMonth).padStart(2, '0');
      const dateStr = `${currentYear}-${monthPad}-${dayPad}`;
      const dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
      const isFriday = dayOfWeek === 5;
      const matchingFriday = isFriday ? fridays.find((f) => f.date === dateStr) : undefined;

      calendarCells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        isFriday,
        fridayEvent: matchingFriday,
      });
    }

    // Append next month days to complete 7-column rows
    const remaining = 7 - (calendarCells.length % 7);
    if (remaining < 7) {
      for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        calendarCells.push({
          dayNumber: nextDay,
          dateStr: '',
          isCurrentMonth: false,
          isFriday: false,
        });
      }
    }

    return calendarCells;
  };

  const calendarDays = generateMonthDays();

  return (
    <div className="space-y-6 font-bengali pb-14 max-w-5xl mx-auto">
      {/* =======================================================
          TOAST NOTIFICATION
         ======================================================= */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#3E5514] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#D2DEC1] animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={18} className="text-[#A7F3D0]" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* =======================================================
          1. TOP MAJESTIC HERO CARD: NEXT UPCOMING JUMU'AH
             (Warm Olive Bento Card with tactile buttons)
         ======================================================= */}
      {/* ── JUMU'AH HERO: HIGH-END PROFESSIONAL DARK FOREST HERO CARD (DEPTH & GLASS) ── */}
      {nextFriday && (
        <div className="rounded-[32px] p-6 sm:p-7 bg-gradient-to-b from-[#142C1F] via-[#0E2218] to-[#0A1A12] border border-[#244835] text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] relative overflow-hidden group font-bengali">
          {/* Top Edge Specular Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

          {/* Subtle Atmospheric Depth Lighting */}
          <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-[#6E3A0D]/15 blur-3xl pointer-events-none" />

          {/* Top Pill & Countdown Header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] text-xs font-semibold text-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>পরবর্তী জুমু'আ খুতবাহর নির্ধারিত মসজিদ</span>
            </div>

            {daysUntilNext && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs font-bold text-emerald-300 font-bengali backdrop-blur-md shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                <Clock size={12} className="text-emerald-400" />
                <span>{daysUntilNext}</span>
              </div>
            )}
          </div>

          {/* Content: When Confirmed vs When Unbooked */}
          {nextFriday.status === 'CONFIRMED' ? (
            <div className="relative z-10 mt-4 space-y-3">
              <div className="text-xs text-white/80 font-medium flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <CalendarIcon size={13} className="text-amber-400" />
                  <span>{formatBanglaDate(nextFriday.date)}</span>
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-300/90 font-medium">খুতবাহ ও সালাত: দুপুর ০১:১৫</span>
              </div>

              <div className="mt-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]"></span>
                  <span>নির্ধারিত মসজিদের নাম ও অবস্থান</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-snug flex items-center gap-2.5 drop-shadow-sm">
                  <MosqueIcon size={26} className="text-emerald-300 shrink-0" />
                  <span>{nextFriday.mosque_name || 'সোবহানবাগ জামে মসজিদ'}</span>
                </h2>
                {nextFriday.mosque_address && (
                  <p className="text-xs sm:text-[13px] text-emerald-100/75 flex items-center gap-1.5 mt-1 font-medium">
                    <MapPin size={13} className="text-emerald-400 shrink-0" />
                    <span>{nextFriday.mosque_address}</span>
                  </p>
                )}
              </div>

              {/* Khutbah Topic Box (Glassmorphic) */}
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.12] backdrop-blur-md flex items-start gap-3.5 text-white transition">
                <div className="w-10 h-10 rounded-xl bg-white/[0.1] border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-amber-300 shadow-inner">
                  <MinbarIcon size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    খুতবাহর নির্ধারিত বিষয়বস্তু
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                    "{nextFriday.khutbah_topic || 'কুরআনের আলোকে সামাজিক সদাচার ও প্রতিবেশীর অধিকার'}"
                  </p>
                </div>
              </div>

              {/* Actions & Contact Bar */}
              <div className="mt-5 pt-4 border-t border-white/[0.1] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-white">
                  {nextFriday.contact_person && (
                    <span className="flex items-center gap-1.5 font-medium text-white/90">
                      <User size={13} className="text-emerald-400" />
                      <span>{nextFriday.contact_person}</span>
                    </span>
                  )}
                  {nextFriday.phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${nextFriday.phone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-xs backdrop-blur-md transition shadow-xs"
                        title="সরাসরি ফোন কল"
                      >
                        <Phone size={12} className="text-amber-400" />
                        <span>{toBengaliDigits(nextFriday.phone)}</span>
                      </a>
                      <a
                        href={`https://wa.me/${nextFriday.phone.replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#25D366]/90 hover:bg-[#25D366] text-white font-bold text-xs shadow-[0_4px_12px_rgba(37,211,102,0.3)] transition active:scale-95"
                        title="হোয়াটসঅ্যাপ চ্যাট"
                      >
                        <MessageSquare size={13} />
                        <span>হোয়াটসঅ্যাপ</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={
                      nextFriday.mosque_maps_url ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((nextFriday.mosque_name || 'Sobhanbag Mosque') + ' ' + (nextFriday.mosque_address || 'Dhaka'))}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] text-white font-bold text-xs backdrop-blur-md transition active:scale-95"
                  >
                    <Compass size={13} className="text-emerald-400" />
                    <span>ম্যাপে খুঁজুন</span>
                  </a>

                  <button
                    onClick={() => openBookModal(nextFriday)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-b from-[#783E10] to-[#5A2C08] hover:from-[#8B4813] hover:to-[#6B340A] text-white font-bold text-xs shadow-[0_4px_14px_rgba(90,44,8,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-amber-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>সংশোধন করুন</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* CREATIVE LUXURY UNBOOKED JUMU'AH HERO */
            <div className="relative z-10 mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1.5">
                  <CalendarIcon size={12} className="text-amber-300" />
                  <span>{formatBanglaDate(nextFriday.date)}</span>
                  <span>•</span>
                  <span>বুকিং উন্মুক্ত</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                  পরবর্তী জুমু'আর খুতবাহ শিডিউল নির্ধারণ করুন
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/75 max-w-xl leading-relaxed mt-1">
                  এই শুক্রবার এখনো কোনো মসজিদে নির্ধারিত হয়নি। নতুন দাওয়াত বা অতিথি খতিব শিডিউলের জন্য মসজিদ, বিষয়বস্তু ও প্রয়োজনীয় আয়োজক তথ্য এখনই যুক্ত করতে পারেন।
                </p>
              </div>

              {/* Quick Preset Mosque Selector */}
              {mosques.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1.5">
                    সংরক্ষিত মসজিদ থেকে দ্রুত নির্বাচন:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {mosques.slice(0, 3).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          openBookModal(nextFriday);
                          handleSelectMosque(m.id.toString());
                        }}
                        className="text-xs bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-white px-3.5 py-1.5 rounded-full transition cursor-pointer font-bold flex items-center gap-1.5 active:scale-95 backdrop-blur-md"
                      >
                        <MosqueIcon size={12} className="text-emerald-400" />
                        <span>{m.name}</span>
                      </button>
                    ))}
                    {mosques.length > 3 && (
                      <button
                        onClick={() => openBookModal(nextFriday)}
                        className="text-xs text-emerald-300 hover:text-white underline cursor-pointer self-center ml-1 font-bold"
                      >
                        + আরও দেখুন
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Primary Call To Action Button (Styled with Chocolate Gradient) */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => openBookModal(nextFriday)}
                  className="pl-6 pr-3 py-2 rounded-full bg-gradient-to-b from-[#783E10] to-[#5A2C08] hover:from-[#8B4813] hover:to-[#6B340A] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(90,44,8,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-amber-600/40 hover:-translate-y-0.5 active:translate-y-0 transition flex items-center gap-3 cursor-pointer"
                >
                  <span>এই জুমু'আ খুতবাহ নির্ধারণ করুন</span>
                  <span className="w-6 h-6 rounded-full bg-[#8A603E] text-white flex items-center justify-center shrink-0 shadow-inner">
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =======================================================
          2. MONTH CONTROLS, VIEW TOGGLE & QUICK KPI STATS
         ======================================================= */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#E8E2D8] shadow-2xs space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3E5514] text-white flex items-center justify-center shrink-0 shadow-sm ring-4 ring-[#F2F6EC]">
              <MosqueIcon size={20} strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#3E5514] uppercase tracking-wider flex items-center gap-1.5">
                <CrescentStarIcon size={12} className="text-[#6E3A0D]" />
                মাসিক জুমু'আ ও খুতবাহ রেজিস্টার
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#16221E] font-heading tracking-tight">
                জুমু'আ খুতবাহ ক্যালেন্ডার
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="bg-[#FAF8F5] p-1 rounded-2xl border border-[#E8E2D8] flex items-center gap-1">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-[#3E5514] text-white shadow-xs'
                    : 'text-[#586661] hover:text-[#16221E]'
                }`}
                title="কার্ড ভিউ"
              >
                <ListFilter size={13} />
                <span>কার্ড ভিউ</span>
              </button>
              <button
                onClick={() => setViewMode('CALENDAR')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  viewMode === 'CALENDAR'
                    ? 'bg-[#3E5514] text-white shadow-xs'
                    : 'text-[#586661] hover:text-[#16221E]'
                }`}
                title="মাসিক গ্রিড ভিউ"
              >
                <LayoutGrid size={13} />
                <span>ক্যালেন্ডার ভিউ</span>
              </button>
            </div>

            <button
              onClick={handleCopyMonthSchedule}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F2F6EC] text-[#3E5514] border border-[#E8E2D8] rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
              title="পুরো মাসের জুমু'আ শিডিউল কপি করুন"
            >
              {copiedToast ? <Check size={14} className="text-[#3E5514]" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copiedToast ? 'কপি হয়েছে' : 'শিডিউল শেয়ার'}</span>
            </button>

            <button
              onClick={() => {
                fetchJumuaSchedule();
                fetchMosques();
              }}
              className="p-2 text-[#586661] hover:text-[#3E5514] hover:bg-[#FAF8F5] rounded-xl transition cursor-pointer border border-[#E8E2D8] active:scale-95"
              title="রিফ্রেশ"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Month Navigation Pill */}
        <div className="flex items-center justify-between bg-[#FAF8F5] p-2 rounded-2xl border border-[#E8E2D8]">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white text-[#16221E] rounded-xl transition cursor-pointer shadow-2xs"
            title="পূর্ববর্তী মাস"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-base font-black text-[#16221E] font-heading">
              {monthNames[currentMonth - 1]} {toBengaliDigits(currentYear)}
            </span>
            <button
              onClick={handleJumpToCurrentMonth}
              className="text-[11px] px-3 py-1 bg-white hover:bg-[#F2F6EC] text-[#3E5514] border border-[#E8E2D8] rounded-full font-bold transition cursor-pointer shadow-2xs"
            >
              চলতি মাস
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white text-[#16221E] rounded-xl transition cursor-pointer shadow-2xs"
            title="পরবর্তী মাস"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 4 Creative KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2F6EC] text-[#3E5514] flex items-center justify-center shrink-0 border border-[#D2DEC1]">
              <CalendarIcon size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8C9893] uppercase tracking-wider block">মোট জুমু'আ</span>
              <span className="text-base sm:text-lg font-black text-[#16221E] font-heading">{toBengaliDigits(totalFridays)}টি শুক্রবার</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#3E5514] text-white shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-[#A7F3D0]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider block">নিশ্চিত খুতবাহ</span>
              <span className="text-base sm:text-lg font-black text-white font-heading">{toBengaliDigits(confirmedCount)}টি নির্ধারিত</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FDF5ED] border border-[#EAD7C7] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6E3A0D] text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6E3A0D] uppercase tracking-wider block">বুকিংযোগ্য ফাঁকা</span>
              <span className="text-base sm:text-lg font-black text-[#6E3A0D] font-heading">{toBengaliDigits(freeCount)}টি উন্মুক্ত</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2F6EC] text-[#3E5514] flex items-center justify-center shrink-0 border border-[#D2DEC1]">
              <MinbarIcon size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8C9893] uppercase tracking-wider block">বিষয় নির্ধারিত</span>
              <span className="text-base sm:text-lg font-black text-[#16221E] font-heading">{toBengaliDigits(topicsCount)}টি প্রস্তুত</span>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          3. SEARCH & FILTER PILLS BAR
         ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'UPCOMING', label: 'আসন্ন জুমু\'আ' },
            { id: 'ALL', label: 'সকল শুক্রবার' },
            { id: 'CONFIRMED', label: 'নিশ্চিত খুতবাহ' },
            { id: 'FREE', label: 'বুকিংযোগ্য ফাঁকা' },
            { id: 'TOPIC_READY', label: 'বিষয় প্রস্তুত' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setSelectedFilter(flt.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                selectedFilter === flt.id
                  ? 'bg-[#3E5514] text-white shadow-xs'
                  : 'bg-white text-[#17211F]/70 hover:bg-[#E4EBE8] border border-[#E4EBE8]'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="অনুসন্ধান: মসজিদ, বিষয়, এলাকা..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E4EBE8] rounded-xl text-[#17211F] placeholder-slate-400 focus:outline-hidden focus:border-[#3E5514]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* =======================================================
          4. VIEW OPTION A: INTERACTIVE MONTHLY CALENDAR GRID
         ======================================================= */}
      {viewMode === 'CALENDAR' ? (
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E4EBE8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4EBE8]">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-[#3E5514]" />
              <h3 className="text-sm font-bold text-[#17211F]">
                {monthNames[currentMonth - 1]} মাসের জুমু'আ ক্যালেন্ডার গ্রিড
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              * শুক্রবারগুলোতে ক্লিক করে খুতবাহ শিডিউল দেখুন বা বুকিং করুন
            </span>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`py-2 rounded-lg ${
                  idx === 5 // Friday
                    ? 'bg-[#3E5514] text-white'
                    : 'bg-[#F7F9F7] text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="min-h-[72px] sm:min-h-[90px] p-2 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-300 text-xs flex flex-col justify-between"
                  >
                    <span>{toBengaliDigits(cell.dayNumber)}</span>
                  </div>
                );
              }

              // Current Month Normal Days
              if (!cell.isFriday) {
                return (
                  <div
                    key={cell.dateStr}
                    className="min-h-[72px] sm:min-h-[90px] p-2 rounded-xl bg-white border border-slate-100 text-slate-500 text-xs hover:border-slate-200 transition flex flex-col justify-between"
                  >
                    <span className="font-semibold text-slate-700">{toBengaliDigits(cell.dayNumber)}</span>
                    <span className="text-[9px] text-slate-300">সাধারণ দিন</span>
                  </div>
                );
              }

              // FRIDAYS!
              const event = cell.fridayEvent;
              const isConfirmed = event?.status === 'CONFIRMED';

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    if (event) openBookModal(event);
                  }}
                  className={`min-h-[72px] sm:min-h-[90px] p-2 sm:p-2.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between group ${
                    isConfirmed
                      ? 'bg-gradient-to-b from-[#F2F6EC] to-white border-[#3E5514] shadow-xs hover:shadow-md'
                      : 'bg-[#FDF5ED] border-dashed border-[#EAD7C7] hover:border-[#6E3A0D]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isConfirmed ? 'bg-[#3E5514] text-white' : 'bg-[#6E3A0D] text-white'
                    }`}>
                      {toBengaliDigits(cell.dayNumber)}
                    </span>
                    <span className="text-[10px]">
                      {isConfirmed ? (
                        <CheckCircle2 size={13} className="text-[#00A878]" />
                      ) : (
                        <Sparkles size={13} className="text-amber-600" />
                      )}
                    </span>
                  </div>

                  <div className="mt-1">
                    {isConfirmed ? (
                      <div>
                        <h4 className="text-[11px] font-bold text-[#17211F] line-clamp-1 group-hover:text-[#00A878] transition">
                          {event?.mosque_name || 'মসজিদ'}
                        </h4>
                        {event?.khutbah_topic && (
                          <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5 italic">
                            "{event.khutbah_topic}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 block">
                        + ফাঁকা বুকিং
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* =======================================================
          4. VIEW OPTION B: DETAILED FRIDAY CARDS
             (Home-page matched high-end styling, spacious and clean)
         ======================================================= */}
      {viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredFridays.length > 0 ? (
            filteredFridays.map((friday, index) => {
              const isFree = friday.status === 'FREE';
              const isPast = friday.date < todayStr;
              const isToday = friday.date === todayStr;
              const mapsUrl = friday.mosque_maps_url || (friday.mosque_name ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(friday.mosque_name + ' ' + (friday.mosque_address || 'Dhaka'))}` : null);

              return (
                <div
                  key={friday.date}
                  className={`p-5 sm:p-6 rounded-2xl transition relative overflow-hidden flex flex-col justify-between ${
                    isPast
                      ? 'bg-[#FAF8F5]/70 border border-[#E8E2D8] opacity-60'
                      : isFree
                      ? 'border-2 border-dashed border-[#E4EBE8] bg-[#F7F9F7] hover:border-[#00A878]/50'
                      : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#E4EBE8] hover:border-[#00A878]/40 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#3E5514] uppercase tracking-wider flex items-center gap-1.5">
                            <CrescentStarIcon size={12} className="text-[#3E5514]" />
                            শুক্রবার #{toBengaliDigits(index + 1)}
                          </span>
                          {isPast && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE4D8] text-[#707A76]">
                              অতিক্রান্ত
                            </span>
                          )}
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E5514] text-white">
                              আজকের জুমু'আ
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#17211F] mt-0.5 font-bengali">
                          {formatBanglaDate(friday.date)}
                        </h3>
                        <span className="text-[11px] text-[#17211F]/50">
                          তারিখ: {toBengaliDigits(friday.date)}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${
                          isPast
                            ? 'bg-[#FAF7F2] text-[#8A9893] border border-[#E0D8CB]'
                            : isFree
                            ? 'bg-[#FDF5ED] text-[#6E3A0D] border border-[#EAD7C7]'
                            : 'bg-[#F2F6EC] text-[#3E5514] border border-[#D2DEC1]'
                        }`}
                      >
                        {isPast ? (
                          <span>বিগত জুমু'আ</span>
                        ) : isFree ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#6E3A0D] animate-pulse" />
                            ফাঁকা / বুকিংযোগ্য
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} className="text-[#3E5514]" />
                            নিশ্চিত খুতবাহ
                          </>
                        )}
                      </span>
                    </div>

                    {isFree ? (
                      <div className="mt-5 pt-4 border-t border-[#E4EBE8] relative z-10 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-[#17211F]/70 bg-white p-3.5 rounded-xl border border-[#E4EBE8]">
                          <div className="w-10 h-10 rounded-xl bg-[#FDF5ED] text-[#6E3A0D] flex items-center justify-center shrink-0">
                            <MosqueIcon size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">এই শুক্রবার এখনো ফাঁকা রয়েছে</span>
                            <span className="text-[11px] text-slate-500">নতুন দাওয়াত বা অতিথি খতিব শিডিউলের জন্য বুকিং করতে পারেন।</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 pt-4 border-t border-[#E4EBE8] space-y-3 text-xs text-[#17211F]/80 relative z-10">
                        {/* Mosque Details & Map Location */}
                        <div className="flex items-start justify-between gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E4EBE8]">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-[#F2F6EC] text-[#3E5514] flex items-center justify-center shrink-0 border border-[#D2DEC1] shadow-2xs mt-0.5">
                              <MosqueIcon size={20} strokeWidth={1.8} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-[#17211F] text-sm leading-tight truncate">
                                {friday.mosque_name || 'নির্ধারিত মসজিদ'}
                              </h4>
                              <p className="text-[11px] text-[#17211F]/60 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-[#3E5514] shrink-0" />
                                <span className="truncate">{friday.mosque_address || 'ঢাকা, বাংলাদেশ'}</span>
                              </p>
                            </div>
                          </div>

                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-[#3E5514] hover:text-[#4D6819] bg-white px-2.5 py-1.5 rounded-lg border border-[#E4EBE8] flex items-center gap-1 shrink-0 transition shadow-2xs"
                              title="গুগল ম্যাপসে অবস্থান দেখুন"
                            >
                              <Compass size={12} className="text-[#3E5514]" />
                              <span>ম্যাপস</span>
                              <ExternalLink size={9} />
                            </a>
                          )}
                        </div>

                        {/* Khutbah Topic */}
                        {friday.khutbah_topic && (
                          <div className="flex items-start gap-2.5 bg-[#F2F6EC] border border-[#D2DEC1] rounded-xl p-3 text-[#3E5514] shadow-2xs">
                            <div className="w-7 h-7 rounded-lg bg-[#3E5514] text-white flex items-center justify-center shrink-0 mt-0.5">
                              <MinbarIcon size={14} strokeWidth={1.8} />
                            </div>
                            <div className="text-xs">
                              <span className="font-extrabold block text-[10px] text-[#3E5514] uppercase tracking-widest">
                                খুতবাহর নির্ধারিত বিষয়বস্তু
                              </span>
                              <p className="font-bold text-[#17211F] mt-0.5 text-xs sm:text-sm">
                                "{friday.khutbah_topic}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Contact Person & Quick Phone/WhatsApp */}
                        {friday.contact_person && (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E4EBE8]">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <User size={13} className="text-[#3E5514] shrink-0" />
                              <span className="font-semibold text-[#17211F] text-xs truncate">
                                {friday.contact_person}
                              </span>
                              {friday.phone && (
                                <span className="text-[#17211F]/60 text-[11px] font-mono shrink-0">
                                  ({toBengaliDigits(friday.phone)})
                                </span>
                              )}
                            </div>

                            {friday.phone && (
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <a
                                  href={`tel:${friday.phone}`}
                                  className="px-2.5 py-1 bg-[#F7F9F7] hover:bg-[#F2F6EC] text-[#3E5514] border border-[#E4EBE8] rounded-lg text-[10px] font-bold transition"
                                  title="সরাসরি ফোন করুন"
                                >
                                  কল
                                </a>
                                <a
                                  href={`https://wa.me/${friday.phone.replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-[#3E5514] hover:bg-[#4D6819] text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                                  title="হোয়াটসঅ্যাপ চ্যাট"
                                >
                                  হোয়াটসঅ্যাপ
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {friday.notes && !friday.notes.includes('Free Friday') && (
                          <p className="text-[11px] text-[#17211F]/70 italic bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E4EBE8] flex items-center gap-1.5">
                            <Clock size={12} className="text-[#3E5514] shrink-0" />
                            <span>নোট: {friday.notes}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Buttons */}
                  <div className="mt-5 pt-3 border-t border-[#E4EBE8] flex items-center justify-between relative z-10">
                    {isFree ? (
                      <button
                        onClick={() => openBookModal(friday)}
                        className="w-full py-2.5 px-4 bg-[#6E3A0D] hover:bg-[#854610] active:scale-[0.99] text-white text-xs font-bold rounded-full transition cursor-pointer shadow-sm flex items-center justify-center gap-2.5 tracking-wide"
                      >
                        <span>এই জুমু'আ নির্ধারণ করুন</span>
                        <span className="w-5 h-5 rounded-full bg-[#8A603E] text-white flex items-center justify-center shrink-0">
                          <ArrowRight size={11} strokeWidth={2.5} />
                        </span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <button
                          onClick={() => handleCancelBooking(friday)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          title="বুকিং বাতিল করে উন্মুক্ত করুন"
                        >
                          <Trash2 size={12} />
                          <span>বুকিং বাতিল</span>
                        </button>

                        <button
                          onClick={() => openBookModal(friday)}
                          className="px-4 py-1.5 bg-[#FDF5ED] hover:bg-[#FBE8D8] text-[#6E3A0D] border border-[#EAD7C7] rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 size={12} />
                          <span>সংশোধন করুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E4EBE8] col-span-2">
              <MosqueIcon size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-[#17211F]/60 font-medium">
                নির্বাচিত ফিল্টারে কোনো জুমু'আ খুঁজে পাওয়া যায়নি।
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* =======================================================
          5. POPULAR KHUTBAH TOPICS SUGGESTION BANK (Categorized)
         ======================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E4EBE8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17211F]">
                খুতবাহর সময়োপযোগী বিষয়বস্তু ও অনুপ্রেরণা
              </h3>
              <p className="text-xs text-[#17211F]/60">
                যেকোনো বিষয়ের ওপর ক্লিক করে আসন্ন জুমু'আর খুতবাহর বিষয় হিসেবে নির্বাচন করুন
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {categorizedTopics.map((group, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-2">
              <span className="text-[11px] font-bold text-[#3E5514] flex items-center gap-1.5 uppercase tracking-wide">
                <RubElHizbIcon size={12} className="text-[#3E5514]" />
                {group.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.topics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (nextFriday) {
                        openBookModal(nextFriday);
                        setKhutbahTopic(topic);
                      } else {
                        showToast(`"${topic}" কপি করা হয়েছে!`);
                        navigator.clipboard.writeText(topic);
                      }
                    }}
                    className="text-xs bg-white hover:bg-[#F2F6EC] hover:text-[#3E5514] border border-[#E4EBE8] text-[#17211F]/80 px-2.5 py-1.5 rounded-lg transition cursor-pointer font-medium text-left shadow-2xs active:scale-95"
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================================
          6. SAVED MOSQUES DIRECTORY STRIP
         ======================================================= */}
      {mosques.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E4EBE8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F2F6EC] text-[#3E5514] flex items-center justify-center">
                <MosqueIcon size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#17211F]">
                সংরক্ষিত মসজিদ তালিকা ({toBengaliDigits(mosques.length)}টি মসজিদ)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {mosques.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#17211F] truncate">{m.name}</h4>
                  <p className="text-[10px] text-[#17211F]/60 truncate mt-0.5">
                    {m.address || m.district || 'ঢাকা'}
                  </p>
                  {m.contact_person && (
                    <span className="text-[10px] text-[#3E5514] font-semibold block mt-1">
                      যোগাযোগ: {m.contact_person}
                    </span>
                  )}
                </div>

                {m.maps_url && (
                  <a
                    href={m.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white border border-[#E4EBE8] text-slate-500 hover:text-[#3E5514] transition shrink-0"
                    title="গুগল ম্যাপস"
                  >
                    <Navigation size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================
          7. MODAL: BOOK / EDIT JUMU'AH COMMITMENT
         ======================================================= */}
      {selectedFriday && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleBookSubmit}
            className="max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-[0_30px_70px_-15px_rgba(62,85,20,0.2)] bg-[#FBF9F5] rounded-b-none sm:rounded-[32px] animate-slide-up-mobile sm:animate-none safe-area-bottom max-h-[92vh] overflow-y-auto border-t sm:border border-[#E8E2D7]"
          >
            {/* Mobile Sheet Drag Pill */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-[#E0D8CA] mx-auto -mt-2 mb-3" />

            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3E5514] text-white flex items-center justify-center shrink-0 ring-4 ring-[#F2F6EC] shadow-sm">
                  <MosqueIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#16221E]">
                    জুমু'আ খুতবাহ নির্ধারণ ({formatBanglaDate(selectedFriday.date)})
                  </h3>
                  <p className="text-xs text-[#586661]">যেকোনো মসজিদের নাম, ঠিকানা, খুতবাহর বিষয় ও আয়োজক তথ্য নির্ধারণ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFriday(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#E6E0D6] text-[#586661] hover:text-[#16221E] flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mosque Selection Mode Switcher */}
            <div className="bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E6E0D6] flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMosqueInputMode('SELECT')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mosqueInputMode === 'SELECT'
                    ? 'bg-white text-[#3E5514] shadow-2xs border border-[#DFD8CC]'
                    : 'text-[#586661] hover:text-[#16221E]'
                }`}
              >
                তালিকা থেকে মসজিদ নির্বাচন
              </button>
              <button
                type="button"
                onClick={() => setMosqueInputMode('CUSTOM')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mosqueInputMode === 'CUSTOM'
                    ? 'bg-white text-[#3E5514] shadow-2xs border border-[#DFD8CC]'
                    : 'text-[#586661] hover:text-[#16221E]'
                }`}
              >
                + যেকোনো মসজিদের নাম লিখুন
              </button>
            </div>

            {mosqueInputMode === 'SELECT' ? (
              <div>
                <label className="text-xs font-semibold text-[#16221E] mb-1.5 flex items-center gap-1.5">
                  <MosqueIcon size={14} className="text-[#3E5514]" />
                  সংরক্ষিত মসজিদ তালিকা থেকে বেছে নিন *
                </label>
                <select
                  required
                  value={selectedMosqueId}
                  onChange={(e) => handleSelectMosque(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl focus:ring-1 focus:ring-[#3E5514] focus:border-[#3E5514] focus:outline-hidden bg-white text-[#16221E]"
                >
                  <option value="">সংরক্ষিত মসজিদ নির্বাচন করুন...</option>
                  {mosques.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.address || m.district || 'ঢাকা'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#586661] mt-1">
                  তালিকায় না থাকলে উপরের "যেকোনো মসজিদের নাম লিখুন" বাটনে ক্লিক করে সরাসরি নাম টাইপ করুন।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#16221E] mb-1.5 flex items-center gap-1.5">
                    <MosqueIcon size={14} className="text-[#3E5514]" />
                    মসজিদের নাম লিখুন *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বাইতুল ফালাহ জামে মসজিদ, মিরপুর"
                    value={customMosqueName}
                    onChange={(e) => setCustomMosqueName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl focus:ring-1 focus:ring-[#3E5514] focus:border-[#3E5514] focus:outline-hidden text-[#16221E] bg-white"
                  />
                </div>
              </div>
            )}

            {/* Address and Map Location fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#16221E] mb-1.5">
                  ঠিকানা ও এলাকা
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ধানমন্ডি ২৭, ঢাকা"
                  value={mosqueAddress}
                  onChange={(e) => setMosqueAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl text-[#16221E] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#16221E] mb-1.5">
                  গুগল ম্যাপস লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={mosqueMapsUrl}
                  onChange={(e) => setMosqueMapsUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl text-[#16221E] bg-white"
                />
              </div>
            </div>

            {/* Khutbah Topic */}
            <div>
              <label className="text-xs font-semibold text-[#16221E] mb-1.5 flex items-center gap-1.5">
                <MinbarIcon size={14} className="text-[#3E5514]" />
                খুতবাহর নির্ধারিত বিষয়বস্তু
              </label>
              <input
                type="text"
                placeholder="যেমন: প্রতিবেশীর হক ও সামাজিক ন্যায়বিচার"
                value={khutbahTopic}
                onChange={(e) => setKhutbahTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl focus:ring-1 focus:ring-[#3E5514] focus:border-[#3E5514] focus:outline-hidden text-[#16221E] bg-white"
              />

              {/* Quick Topic Suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  'প্রতিবেশীর অধিকার ও সামাজিক সম্প্রীতি',
                  'অন্তরের পবিত্রতা ও আত্মশুদ্ধি',
                  'ডিজিটাল যুগে সন্তানের ইসলামী লালন-পালন',
                  'হালাল উপার্জন ও অর্থনৈতিক সততা',
                ].map((topic, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setKhutbahTopic(topic)}
                    className="text-[10px] bg-[#F2F6EC] hover:bg-[#3E5514] hover:text-white text-[#3E5514] px-2.5 py-1 rounded-full transition cursor-pointer font-medium border border-[#D2DEC1]"
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Person & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#16221E] mb-1.5">
                  মুতাওয়াল্লী / দায়িত্বপ্রাপ্ত ব্যক্তি
                </label>
                <input
                  type="text"
                  placeholder="সেক্রেটারি / সভাপতি / আয়োজক"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl text-[#16221E] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#16221E] mb-1.5">
                  যোগাযোগের ফোন নম্বর
                </label>
                <input
                  type="text"
                  placeholder="+৮৮০১৭..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl text-[#16221E] bg-white"
                />
              </div>
            </div>

            {/* Logistics & Departure Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#16221E] mb-1.5">
                যাতায়াত, প্রস্থান ও অভ্যর্থনা সংক্রান্ত নোট
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: সকাল ১১:৪৫ মিনিটে বাসা থেকে রওনা, ভিআইপি গেটে অভ্যর্থনা..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E6E0D6] rounded-xl text-[#16221E] bg-white resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#EFECE6]">
              {selectedFriday.status !== 'FREE' ? (
                <button
                  type="button"
                  onClick={() => {
                    handleCancelBooking(selectedFriday);
                    setSelectedFriday(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>বুকিং বাতিল করুন</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedFriday(null)}
                  className="px-5 py-2 text-xs font-bold text-[#586661] hover:text-[#16221E] bg-[#F4EFEB] hover:bg-[#ECE5DC] border border-[#E6E0D6] rounded-full transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#3E5514] hover:bg-[#4D6819] rounded-full cursor-pointer shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'জুমু\'আ খুতবাহ নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
