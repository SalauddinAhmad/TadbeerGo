import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  Users,
  Mic,
  Calendar as CalIcon,
  Clock,
  MapPin,
  X,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MosqueIcon } from '../../components/icons/IslamicIcons';
import { api } from '../../api/client';
import { Activity } from '../../types';
import { EventDetailsSheet } from '../../components/modals/EventDetailsSheet';
import { toBengaliDigits, formatBanglaDate, formatBanglaTime } from '../../utils/bengali';

interface DayScheduleItem {
  id: string | number;
  time: string;
  endTime?: string;
  title: string;
  subtitle: string;
  location?: string;
  type: 'CLASS' | 'JUMUAH' | 'PROGRAMME' | 'MEETING' | 'LECTURE' | 'OTHER';
  status?: string;
  isActive?: boolean;
}

export const CalendarPage: React.FC = () => {
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-17');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('ALL');
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Local interactive events state per date
  const [localDayEvents, setLocalDayEvents] = useState<Record<string, DayScheduleItem[]>>({
    '2026-09-15': [
      {
        id: 'ev-15-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:০০',
        title: 'কোরআন হিফজ ও তাজবিদ',
        subtitle: 'ব্যাচ ০২ · অনলাইন ক্লাস',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'সম্পন্ন',
        isActive: false
      },
      {
        id: 'ev-15-2',
        time: 'বিকাল ৫:০০',
        endTime: '১৮:৩০',
        title: 'বালাগাত শাস্ত্রের মূলনীতি',
        subtitle: 'ক্লাস #১০ · অনলাইন',
        location: 'অনলাইন জুম',
        type: 'CLASS',
        status: 'সম্পন্ন',
        isActive: false
      }
    ],
    '2026-09-16': [
      {
        id: 'ev-16-1',
        time: 'সকাল ১০:৩০',
        endTime: '১১:৪৫',
        title: 'গবেষণা পরিষদ পরামর্শ বৈঠক',
        subtitle: 'দ্বীনি শিক্ষা কারিকুলাম পর্যালোচনা',
        location: 'গবেষণা কক্ষ, ধানমন্ডি',
        type: 'MEETING',
        status: 'সম্পন্ন',
        isActive: false
      },
      {
        id: 'ev-16-2',
        time: 'সন্ধ্যা ৭:০০',
        endTime: '২০:৩০',
        title: 'উচ্চতর হাদিস পাঠদান',
        subtitle: 'মিশকাতুল মাসাবীহ দরস',
        location: 'হলকা স্টুডিও',
        type: 'CLASS',
        status: 'সম্পন্ন',
        isActive: false
      }
    ],
    '2026-09-17': [
      {
        id: 'ev-17-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:০০',
        title: 'কোরআন হিফজ',
        subtitle: 'অনলাইন ক্লাস · ১ঘণ্টা',
        location: 'অনলাইন জুম',
        type: 'CLASS',
        status: 'সম্পন্ন',
        isActive: false
      },
      {
        id: 'ev-17-2',
        time: 'দুপুর ২:৩০',
        endTime: '১৫:৪৫',
        title: 'কমিটি মিটিং',
        subtitle: 'মসজিদ কমিটি · ধানমন্ডি',
        location: 'মসজিদ কনফারেন্স কক্ষ',
        type: 'MEETING',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-17-3',
        time: 'বিকাল ৫:০০',
        endTime: '১৮:৩০',
        title: 'বালাগাহ ও ফাসাহাহ',
        subtitle: 'ক্লাস #১২ · অনলাইন · ১ঘণ্টা ৩০মি',
        location: 'অনলাইন স্টুডিও ও জুম লাইভ',
        type: 'CLASS',
        status: 'চলমান',
        isActive: true
      },
      {
        id: 'ev-17-4',
        time: 'রাত ৮:০০',
        endTime: '২১:৩০',
        title: 'বিশেষ দ্বীনি লেকচার',
        subtitle: 'অনলাইন লাইভ প্রোগ্রাম',
        location: 'লাইভ ব্রডকাস্ট স্টুডিও',
        type: 'PROGRAMME',
        status: 'আসন্ন',
        isActive: false
      }
    ],
    '2026-09-18': [
      {
        id: 'ev-18-1',
        time: 'দুপুর ১২:১৫',
        endTime: '১৪:০০',
        title: "জুমু'আ খুতবাহ ও নামাজ",
        subtitle: 'বাইতুল আমান জামে মসজিদ, ধানমন্ডি',
        location: 'বাইতুল আমান জামে মসজিদ, ঢাকা',
        type: 'JUMUAH',
        status: 'নিশ্চিত',
        isActive: true
      },
      {
        id: 'ev-18-2',
        time: 'বিকাল ৫:১৫',
        endTime: '১৮:৪৫',
        title: 'মাসিক তরুণ সুধী সমাবেশ',
        subtitle: 'নৈতিক জাগরণ ও ক্যারিয়ার গাইডলাইন',
        location: 'সেন্ট্রাল মিলনায়তন',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-09-19': [
      {
        id: 'ev-19-1',
        time: 'সকাল ১০:০০',
        endTime: '১১:৩০',
        title: 'উস্তায ও শিক্ষক পর্যালোচনা সভা',
        subtitle: 'পাঠ্যক্রমের গুণগত মান নিশ্চিতকরণ',
        location: 'উত্তরা সেন্টার',
        type: 'MEETING',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-19-2',
        time: 'সন্ধ্যা ৭:৩০',
        endTime: '২১:০০',
        title: 'সিরাতুন্নবী ﷺ বিশেষ লেকচার',
        subtitle: 'উত্তরা ইসলামিক সেন্টার',
        location: 'উত্তরা সেক্টর ৭, ঢাকা',
        type: 'PROGRAMME',
        status: 'প্রস্তুতি প্রয়োজন',
        isActive: false
      }
    ],
    '2026-09-20': [
      {
        id: 'ev-20-1',
        time: 'সকাল ৯:৩০',
        endTime: '১১:০০',
        title: 'কোরআনিক আরবি ভাষা শিক্ষা',
        subtitle: 'মডিউল ৩ · ব্যাকরণ ও প্রয়োগ',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-20-2',
        time: 'সন্ধ্যা ৬:৩০',
        endTime: '২০:০০',
        title: 'ইয়ুথ কনফারেন্স ২০২৬ প্রস্তুতি',
        subtitle: 'স্বেচ্ছাসেবক ও উপস্থাপনা সমন্বয়',
        location: 'মিরপুর, ঢাকা',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-09-21': [
      {
        id: 'ev-21-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:০০',
        title: 'কোরআন হিফজ ও অনুধাবন',
        subtitle: 'নিয়মিত সাপ্তাহিক সেশন',
        location: 'অনলাইন জুম',
        type: 'CLASS',
        status: 'আসন্ন',
        isActive: false
      },
      {
        id: 'ev-21-2',
        time: 'রাত ৮:০০',
        endTime: '২১:১৫',
        title: 'তাফসিরুল কুরআন ধারাবাহিক দরস',
        subtitle: 'সূরা আল-ইমরান পর্যালোচনা',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'আসন্ন',
        isActive: false
      }
    ]
  });

  // Modal states
  const [selectedEventData, setSelectedEventData] = useState<any>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DayScheduleItem | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formTime, setFormTime] = useState('০৯:০০');
  const [formEndTime, setFormEndTime] = useState('১০:৩০');
  const [formLocation, setFormLocation] = useState('অনলাইন স্টুডিও');
  const [formType, setFormType] = useState<'CLASS' | 'JUMUAH' | 'PROGRAMME' | 'MEETING' | 'LECTURE' | 'OTHER'>('CLASS');
  const [formStatus, setFormStatus] = useState('নিশ্চিত');

  // Week days strip Mon 15 to Mon 21 in Bengali
  const weekDays = [
    { dayName: 'সোম', dayNum: 15, dayNumBn: '১৫', dateStr: '2026-09-15' },
    { dayName: 'মঙ্গল', dayNum: 16, dayNumBn: '১৬', dateStr: '2026-09-16' },
    { dayName: 'বৃহঃ', dayNum: 17, dayNumBn: '১৭', dateStr: '2026-09-17' },
    { dayName: 'শুক্র', dayNum: 18, dayNumBn: '১৮', dateStr: '2026-09-18' },
    { dayName: 'শনি', dayNum: 19, dayNumBn: '১৯', dateStr: '2026-09-19' },
    { dayName: 'রবি', dayNum: 20, dayNumBn: '২০', dateStr: '2026-09-20' },
    { dayName: 'সোম', dayNum: 21, dayNumBn: '২১', dateStr: '2026-09-21' },
  ];

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/activities');
      const list = res?.activities || (Array.isArray(res) ? res : []);
      setEvents(list);
    } catch (err) {
      console.error('Failed to fetch schedule activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Compute current day items (merging API activities with local interactive items)
  const currentDayEvents: DayScheduleItem[] = (() => {
    const apiForDay = events
      .filter((a) => a.date === selectedDateStr)
      .map((a) => ({
        id: a.id,
        time: a.start_time ? formatBanglaTime(a.start_time) : 'সকাল ৯:০০',
        endTime: a.end_time ? formatBanglaTime(a.end_time) : undefined,
        title: a.title,
        subtitle: a.topic || a.description || a.location || 'নির্ধারিত কর্মসূচি',
        location: a.location || 'স্থান অনির্ধারিত',
        type: (a.type as any) || 'OTHER',
        status: a.status === 'COMPLETED' ? 'সম্পন্ন' : a.status === 'CONFIRMED' ? 'নিশ্চিত' : 'আসন্ন',
        isActive: false
      }));

    if (apiForDay.length > 0) {
      return apiForDay;
    }

    return localDayEvents[selectedDateStr] || [
      {
        id: `def-${selectedDateStr}-1`,
        time: 'সকাল ১০:০০',
        endTime: '১১:০০',
        title: 'দ্বীনি পাঠ্যক্রম ও অধ্যয়ন',
        subtitle: 'ব্যক্তিগত প্রস্তুতি ও মুতালাআ',
        location: 'ব্যক্তিগত লাইব্রেরি',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      }
    ];
  })();

  // Filter items by category and search
  const filteredEvents = currentDayEvents.filter((ev) => {
    if (selectedFilterType !== 'ALL') {
      if (selectedFilterType === 'CLASS' && ev.type !== 'CLASS') return false;
      if (selectedFilterType === 'JUMUAH' && ev.type !== 'JUMUAH') return false;
      if (selectedFilterType === 'PROGRAMME' && ev.type !== 'PROGRAMME' && ev.type !== 'LECTURE') return false;
      if (selectedFilterType === 'MEETING' && ev.type !== 'MEETING') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchSub = ev.subtitle.toLowerCase().includes(q);
      const matchLoc = (ev.location || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchLoc) return false;
    }
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'CLASS':
        return { icon: BookOpen, color: 'text-[#063F35]', bg: 'bg-[#E8F5F0]' };
      case 'JUMUAH':
        return { icon: MosqueIcon, color: 'text-[#00A878]', bg: 'bg-[#E8F5F0]' };
      case 'PROGRAMME':
      case 'LECTURE':
        return { icon: Mic, color: 'text-blue-700', bg: 'bg-blue-50' };
      case 'MEETING':
        return { icon: Users, color: 'text-amber-700', bg: 'bg-amber-50' };
      default:
        return { icon: CalIcon, color: 'text-[#063F35]', bg: 'bg-[#E8F5F0]' };
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: DayScheduleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle);
    setFormTime(item.time);
    setFormEndTime(item.endTime || '১০:৩০');
    setFormLocation(item.location || 'অনলাইন স্টুডিও');
    setFormType(item.type);
    setFormStatus(item.status || 'নিশ্চিত');
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    // If ID is numeric, attempt API call
    if (typeof editingItem.id === 'number') {
      try {
        await api.put(`/activities/${editingItem.id}`, {
          title: formTitle,
          topic: formSubtitle,
          location: formLocation,
          status: formStatus === 'সম্পন্ন' ? 'COMPLETED' : 'CONFIRMED'
        });
      } catch (err) {
        console.warn('API update failed, updating local state:', err);
      }
    }

    // Update local state
    setLocalDayEvents((prev) => {
      const existing = prev[selectedDateStr] || currentDayEvents;
      const updated = existing.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle,
              subtitle: formSubtitle,
              time: formTime,
              endTime: formEndTime,
              location: formLocation,
              type: formType,
              status: formStatus
            }
          : item
      );
      return { ...prev, [selectedDateStr]: updated };
    });

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Delete / Cancel Event
  const handleDeleteEvent = async (item: DayScheduleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(`"${item.title}" কর্মসূচিটি বাতিল/মুছে ফেলতে চান?`);
    if (!confirmed) return;

    if (typeof item.id === 'number') {
      try {
        await api.delete(`/activities/${item.id}`);
      } catch (err) {
        console.warn('API delete failed, updating local state:', err);
      }
    }

    setLocalDayEvents((prev) => {
      const existing = prev[selectedDateStr] || currentDayEvents;
      const filtered = existing.filter((it) => it.id !== item.id);
      return { ...prev, [selectedDateStr]: filtered };
    });

    // Also remove from events list if present
    setEvents((prev) => prev.filter((it) => it.id !== item.id));
    if (selectedEventData?.id === item.id) {
      setIsEventSheetOpen(false);
    }
  };

  // Add New Event for Selected Day
  const handleCreateNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newItem: DayScheduleItem = {
      id: `new-${Date.now()}`,
      time: formTime,
      endTime: formEndTime,
      title: formTitle,
      subtitle: formSubtitle || 'বিশেষ শিডিউল',
      location: formLocation,
      type: formType,
      status: formStatus,
      isActive: false
    };

    try {
      const res = await api.post<any>('/activities', {
        title: formTitle,
        topic: formSubtitle,
        date: selectedDateStr,
        start_time: '10:00:00',
        end_time: '11:30:00',
        location: formLocation,
        type: formType,
        status: 'CONFIRMED'
      });
      if (res?.activity?.id) {
        newItem.id = res.activity.id;
      }
    } catch (err) {
      console.warn('API post failed, adding to local state:', err);
    }

    setLocalDayEvents((prev) => {
      const existing = prev[selectedDateStr] || currentDayEvents;
      return { ...prev, [selectedDateStr]: [...existing, newItem] };
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormSubtitle('');
  };

  return (
    <div className="space-y-4 pb-12 max-w-md mx-auto font-bengali">
      {/* 1. HEADER */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold text-[#17211F] tracking-tight leading-tight">
            শিডিউল
          </h1>
          <p className="text-xs text-[#17211F]/60 font-medium mt-0.5">
            ক্লাস, দ্বীনি কর্মসূচি ও বৈঠকের সমন্বিত সময়সূচি
          </p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-9 h-9 rounded-full bg-white border border-[#E4EBE8] hover:bg-[#F7F9F7] flex items-center justify-center text-[#17211F] transition cursor-pointer shadow-2xs"
            title="অনুসন্ধান"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-9 h-9 rounded-full bg-white border border-[#E4EBE8] hover:bg-[#F7F9F7] flex items-center justify-center text-[#17211F] transition cursor-pointer shadow-2xs"
            title="ফিল্টার"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            onClick={() => {
              setFormTitle('');
              setFormSubtitle('');
              setFormTime('সকাল ১০:০০');
              setFormEndTime('১১:৩০');
              setFormLocation('অনলাইন স্টুডিও');
              setFormType('CLASS');
              setFormStatus('নিশ্চিত');
              setIsAddModalOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-[#063F35] hover:bg-[#042F28] text-white flex items-center justify-center transition cursor-pointer shadow-xs"
            title="নতুন কর্মসূচি যোগ করুন"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="px-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative">
            <input
              type="text"
              placeholder="কীওয়ার্ড বা স্থান দিয়ে শিডিউল খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-[#E4EBE8] text-xs text-[#17211F] placeholder:text-[#17211F]/50 outline-hidden focus:border-[#063F35] focus:ring-1 focus:ring-[#063F35]"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-[#17211F]/40" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expandable Category Filter */}
      {isFilterOpen && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-none animate-in fade-in duration-150">
          {[
            { id: 'ALL', label: 'সকল' },
            { id: 'CLASS', label: 'ক্লাস' },
            { id: 'JUMUAH', label: "জুমু'আ" },
            { id: 'PROGRAMME', label: 'কর্মসূচি' },
            { id: 'MEETING', label: 'মিটিং' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilterType(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilterType === cat.id
                  ? 'bg-[#063F35] text-white shadow-2xs'
                  : 'bg-white border border-[#E4EBE8] text-[#17211F]/70 hover:bg-[#F7F9F7]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* 2. HORIZONTAL WEEK SELECTOR STRIP */}
      <div className="bg-white rounded-2xl p-2 border border-[#E4EBE8] shadow-xs">
        <div className="flex items-center justify-between gap-1">
          {weekDays.map((item) => {
            const isActive = selectedDateStr === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#063F35] text-white shadow-xs font-bold'
                    : 'text-[#17211F]/70 hover:bg-[#F7F9F7]'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-[#00A878]' : 'text-[#17211F]/50'}`}>
                  {item.dayName}
                </span>
                <span className="text-sm font-bold mt-0.5 font-bengali">
                  {item.dayNumBn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Jump to specific date picker */}
        <div className="mt-2 pt-2 border-t border-[#E4EBE8] flex items-center justify-between px-1 text-[11px] text-[#17211F]/60">
          <span className="flex items-center gap-1 font-medium">
            <CalIcon size={12} className="text-[#00A878]" />
            অন্য তারিখ নির্বাচন করুন:
          </span>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => {
              if (e.target.value) setSelectedDateStr(e.target.value);
            }}
            className="px-2 py-0.5 rounded-lg border border-[#E4EBE8] text-xs bg-[#F7F9F7] text-[#17211F] cursor-pointer"
          />
        </div>
      </div>

      {/* 3. DYNAMIC SELECTED DAY'S SCHEDULE */}
      <div className="space-y-2.5">
        {/* Section Dynamic Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#17211F]">
            {formatBanglaDate(selectedDateStr)}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#17211F]/60">
              {toBengaliDigits(filteredEvents.length)}টি কর্মসূচি
            </span>
            <button
              onClick={() => {
                setFormTitle('');
                setFormSubtitle('');
                setFormTime('সকাল ১০:০০');
                setFormEndTime('১১:৩০');
                setFormLocation('অনলাইন স্টুডিও');
                setFormType('CLASS');
                setFormStatus('নিশ্চিত');
                setIsAddModalOpen(true);
              }}
              className="text-[11px] text-[#063F35] hover:text-[#00A878] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> যোগ করুন
            </button>
          </div>
        </div>

        {/* Event Cards */}
        <div className="space-y-2">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => {
              const { icon: Icon, color, bg } = getIconForType(ev.type);

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventData({
                      ...ev,
                      date: selectedDateStr,
                      start_time: ev.time,
                      end_time: ev.endTime,
                      category: ev.type,
                      status: ev.status
                    });
                    setIsEventSheetOpen(true);
                  }}
                  className={`bg-white rounded-2xl p-3 border shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between gap-3 ${
                    ev.isActive
                      ? 'border-[#063F35] ring-1 ring-[#00A878]/30'
                      : 'border-[#E4EBE8]'
                  }`}
                >
                  {/* Left Icon */}
                  <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 border border-black/5`}>
                    <Icon size={18} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#17211F]">
                        {ev.time}
                      </span>
                      {ev.status && (
                        <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-[#E8F5F0] text-[#063F35]">
                          {ev.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-[#17211F] truncate mt-0.5">
                      {ev.title}
                    </h3>
                    <p className="text-[11px] text-[#17211F]/60 truncate">
                      {ev.subtitle}
                    </p>
                  </div>

                  {/* Actions: Edit & Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleOpenEdit(ev, e)}
                      className="w-7 h-7 rounded-lg bg-[#F7F9F7] hover:bg-[#E8F5F0] text-[#063F35] flex items-center justify-center transition cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteEvent(ev, e)}
                      className="w-7 h-7 rounded-lg bg-[#F7F9F7] hover:bg-rose-50 text-rose-600 flex items-center justify-center transition cursor-pointer"
                      title="বাতিল বা মুছে ফেলুন"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#E4EBE8] space-y-2">
              <CalIcon size={28} className="mx-auto text-slate-300" />
              <p className="text-xs text-[#17211F]/60 font-medium">
                এই দিনে কোনো কর্মসূচি নির্ধারিত নেই।
              </p>
              <button
                onClick={() => {
                  setFormTitle('');
                  setFormSubtitle('');
                  setFormTime('সকাল ১০:০০');
                  setFormEndTime('১১:৩০');
                  setFormLocation('অনলাইন স্টুডিও');
                  setFormType('CLASS');
                  setFormStatus('নিশ্চিত');
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-1.5 bg-[#063F35] hover:bg-[#042F28] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>+ কর্মসূচি যোগ করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. UPCOMING ENGAGEMENTS SECTION */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#17211F]">
            আসন্ন কর্মসূচি
          </h2>
          <span className="text-xs font-semibold text-[#063F35]">
            সব দেখুন
          </span>
        </div>

        <div className="space-y-2">
          {[
            {
              day: '২০',
              month: 'সেপ',
              dateStr: '2026-09-20',
              icon: Mic,
              color: 'text-blue-700',
              bg: 'bg-blue-50',
              title: 'সিরাতুন্নবী ﷺ বিশেষ লেকচার',
              subtitle: 'সন্ধ্যা ৭:৩০ · উত্তরা ইসলামিক সেন্টার',
              status: 'প্রস্তুতি প্রয়োজন',
              statusStyle: 'bg-amber-50 text-amber-800'
            },
            {
              day: '২২',
              month: 'সেপ',
              dateStr: '2026-09-22',
              icon: Users,
              color: 'text-[#063F35]',
              bg: 'bg-[#E8F5F0]',
              title: 'ইয়ুথ কনফারেন্স ২০২৬',
              subtitle: 'সন্ধ্যা ৬:৩০ · মিরপুর, ঢাকা',
              status: 'নিশ্চিত',
              statusStyle: 'bg-[#E8F5F0] text-[#063F35]'
            },
            {
              day: '২৫',
              month: 'সেপ',
              dateStr: '2026-09-25',
              icon: MosqueIcon,
              color: 'text-[#00A878]',
              bg: 'bg-[#E8F5F0]',
              title: "জুমু'আ খুতবাহ ও বয়ান",
              subtitle: 'দুপুর ১:১৫ · উত্তরা সেন্ট্রাল মসজিদ',
              status: 'অপেক্ষমাণ',
              statusStyle: 'bg-amber-50 text-amber-800'
            }
          ].map((up) => {
            const Icon = up.icon;
            return (
              <div
                key={up.title}
                onClick={() => setSelectedDateStr(up.dateStr)}
                className="bg-white rounded-2xl p-3 border border-[#E4EBE8] shadow-xs hover:border-[#00A878]/40 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Date Block */}
                  <div className="w-10 h-10 rounded-xl bg-[#F7F9F7] border border-[#E4EBE8] flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-black text-[#17211F] leading-none">
                      {up.day}
                    </span>
                    <span className="text-[9px] text-[#17211F]/50 font-medium mt-0.5 leading-none">
                      {up.month}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#17211F] truncate">
                      {up.title}
                    </h4>
                    <p className="text-[11px] text-[#17211F]/60 truncate mt-0.5">
                      {up.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${up.statusStyle}`}>
                    {up.status}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =======================================================
          MODAL: ADD SCHEDULE ITEM
         ======================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateNewEvent}
            className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8] max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    নতুন কর্মসূচি যুক্ত করুন
                  </h3>
                  <p className="text-xs text-[#17211F]/60">{formatBanglaDate(selectedDateStr)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1">
                কর্মসূচির শিরোনাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: সূরা আল-বাক্বারাহ তাফসির ক্লাস"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1">
                বিষয়বস্তু / বিবরণ
              </label>
              <input
                type="text"
                placeholder="যেমন: ক্লাস #১৩ · আয়াত ৩৫–৪০"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  শুরুর সময়
                </label>
                <input
                  type="text"
                  placeholder="সকাল ৯:০০ বা বিকাল ৫:০০"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  সমাপ্তির সময়
                </label>
                <input
                  type="text"
                  placeholder="১০:৩০ বা ৬:৩০"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  ধরণ
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="CLASS">ক্লাস</option>
                  <option value="JUMUAH">জুমু'আ</option>
                  <option value="PROGRAMME">কর্মসূচি / লেকচার</option>
                  <option value="MEETING">মিটিং</option>
                  <option value="OTHER">অন্যান্য</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  স্ট্যাটাস
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="নিশ্চিত">নিশ্চিত</option>
                  <option value="চলমান">চলমান</option>
                  <option value="আসন্ন">আসন্ন</option>
                  <option value="সম্পন্ন">সম্পন্ন</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1">
                স্থান বা মাধ্যম
              </label>
              <input
                type="text"
                placeholder="যেমন: অনলাইন জুম বা সোবহানবাগ মসজিদ"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F7F9F7] rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                যোগ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL: EDIT SCHEDULE ITEM
         ======================================================= */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEdit}
            className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8] max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    কর্মসূচি সম্পাদনা
                  </h3>
                  <p className="text-xs text-[#17211F]/60">{formatBanglaDate(selectedDateStr)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1">
                কর্মসূচির শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1">
                বিষয়বস্তু / বিবরণ
              </label>
              <input
                type="text"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  শুরুর সময়
                </label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  সমাপ্তির সময়
                </label>
                <input
                  type="text"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  ধরণ
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="CLASS">ক্লাস</option>
                  <option value="JUMUAH">জুমু'আ</option>
                  <option value="PROGRAMME">কর্মসূচি / লেকচার</option>
                  <option value="MEETING">মিটিং</option>
                  <option value="OTHER">অন্যান্য</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1">
                  স্ট্যাটাস
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="নিশ্চিত">নিশ্চিত</option>
                  <option value="চলমান">চলমান</option>
                  <option value="আসন্ন">আসন্ন</option>
                  <option value="সম্পন্ন">সম্পন্ন</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1">
                স্থান বা মাধ্যম
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => handleDeleteEvent(editingItem)}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>মুছে ফেলুন</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F7F9F7] rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 5. EVENT DETAILS BOTTOM SHEET */}
      <EventDetailsSheet
        isOpen={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
        eventData={selectedEventData}
        onEdit={(data) => {
          if (data) handleOpenEdit(data);
        }}
        onDelete={(data) => {
          if (data) handleDeleteEvent(data);
        }}
      />
    </div>
  );
};
