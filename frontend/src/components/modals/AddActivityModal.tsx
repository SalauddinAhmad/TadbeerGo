import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, MapPin, Calendar as CalIcon, Shield, Sparkles, Check, ChevronDown } from 'lucide-react';
import {
  EventCalendarIcon,
  CourseBookIcon,
  JumuaMosqueIcon,
  DawahMicIcon,
  QuickDraftIcon,
  ContactsDirectoryIcon,
  MinbarIcon,
  MihrabIcon,
  TasbihIcon,
  HalqaCircleIcon
} from '../icons/IslamicIcons';
import { ActivityType } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toBengaliDigits, formatBanglaDate } from '../../utils/bengali';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
}) => {
  const { isOwner } = useAuth();
  const [type, setType] = useState<ActivityType>('PROGRAMME');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  // Check conflicts
  useEffect(() => {
    if (date && startTime && endTime) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.get<{ has_conflict: boolean; conflicts: any[] }>(
            `/activities/check-conflicts?date=${date}&start_time=${startTime}&end_time=${endTime}`
          );
          setConflicts(res.conflicts || []);
        } catch {
          setConflicts([]);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [date, startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await api.post('/activities', {
        title,
        type,
        date,
        start_time: startTime ? `${startTime}:00` : null,
        end_time: endTime ? `${endTime}:00` : null,
        location,
        topic,
        notes,
        priority,
        is_private: isOwner && isPrivate ? 1 : 0,
        status: 'CONFIRMED',
      });

      setTitle('');
      setLocation('');
      setTopic('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'শিডিউল সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick title autofill suggestions
  const titleSuggestions = [
    'সূরা আল-বাক্বারাহ তাফসির ক্লাস',
    'জাতীয় যুব সম্মেলন ও নসিহত',
    'মাসিক তাফসিরুল কুরআন মাহফিল',
    'জুমু\'আ প্রস্তুতি ও বয়ান',
    'শূরা ও পরামর্শ অধিবেশন'
  ];

  // Quick venue suggestions
  const venueSuggestions = [
    'সোবহানবাগ জামে মসজিদ',
    'ধানমন্ডি ক্যাম্পাস',
    'অনলাইন জুম স্টুডিও',
    'উত্তরা মারকাজ',
    'মিরপুর কেন্দ্রীয় মিলনায়তন'
  ];

  // Quick date presets
  const setQuickDate = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setDate(d.toISOString().split('T')[0]);
  };

  const setNextFriday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    setDate(d.toISOString().split('T')[0]);
  };

  // Calculate duration between startTime and endTime
  const calculateDuration = () => {
    if (!startTime || !endTime) return null;
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMins <= 0) return null;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0 && mins > 0) return `${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(mins)} মিনিট`;
    if (hours > 0) return `${toBengaliDigits(hours)} ঘণ্টা`;
    return `${toBengaliDigits(mins)} মিনিট`;
  };

  const durationStr = calculateDuration();

  // 4 Primary Bento Categories
  const primaryCategories: { type: ActivityType; label: string; subtitle: string; icon: React.FC<any> }[] = [
    { type: 'PROGRAMME', label: 'দাওয়াহ কর্মসূচি', subtitle: 'সম্মেলন ও মাহফিল', icon: HalqaCircleIcon },
    { type: 'CLASS', label: 'কোর্স ক্লাস', subtitle: 'তাফসির ও হাদিস দরস', icon: CourseBookIcon },
    { type: 'JUMUAH', label: 'জুমু\'আ খুতবাহ', subtitle: 'মসজিদ ও জুমার খুতবাহ', icon: JumuaMosqueIcon },
    { type: 'MEETING', label: 'পরামর্শ বৈঠক', subtitle: 'শূরা ও কাউন্সিলিং', icon: ContactsDirectoryIcon },
  ];

  // Secondary Compact Categories
  const secondaryCategories: { type: ActivityType; label: string; icon: React.FC<any> }[] = [
    { type: 'LECTURE', label: 'ইলমি বয়ান', icon: DawahMicIcon },
    { type: 'TRAVEL', label: 'সফর ও ভ্রমণ', icon: EventCalendarIcon },
    { type: 'PERSONAL', label: 'ব্যক্তিগত সময়', icon: TasbihIcon },
    { type: 'TASK', label: 'জরুরি তাগিদ', icon: QuickDraftIcon },
    { type: 'KHUTBAH', label: 'খুতবাহ প্রস্তুতি', icon: MinbarIcon },
    { type: 'OTHER', label: 'অন্যান্য বিষয়', icon: MihrabIcon },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 font-bengali"
    >
      <div
        className="relative w-full max-w-xl overflow-hidden bg-[#FBF9F5] rounded-t-[32px] sm:rounded-[32px] border border-[#E8E2D7] shadow-[0_30px_70px_-15px_rgba(62,85,20,0.2)] flex flex-col max-h-[92vh] animate-slide-up-mobile sm:animate-none safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-[#E0D8CA] mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EFECE6] bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3E5514] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-[#F2F6EC]">
              <EventCalendarIcon size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F4EFEB] text-[#3E5514] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span>দ্বীনি শিডিউলার · ২০২৬</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-heading text-[#16221E] tracking-tight">
                নতুন শিডিউল যোগ করুন
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4EFEB] hover:bg-[#EAE4DC] border border-[#E6E0D6] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition cursor-pointer active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body with Bento Grid Sections */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-[#16221E]">
          {/* Conflict Alert Banner */}
          {conflicts.length > 0 && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs shadow-2xs animate-pulse">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold text-amber-950">সময়ের সাংঘর্ষিকতা ধরা পড়েছে!</span>
                <p className="mt-0.5 text-amber-900 font-medium">
                  এই সময়ে আরেকটি কর্মসূচি রয়েছে: <strong>{conflicts[0].title}</strong> ({conflicts[0].start_time?.substring(0, 5)} - {conflicts[0].end_time?.substring(0, 5)})
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 1: BENTO ACTIVITY TYPE SELECTOR
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3E5514]" />
                কর্মসূচির ধরন নির্বাচন করুন
              </span>
              <span className="text-[11px] text-[#8C9893] font-medium">নির্ধারিত বিভাগ</span>
            </div>

            {/* 4 Primary Bento Tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              {primaryCategories.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-[#3E5514] border-[#3E5514] text-white shadow-sm ring-2 ring-[#3E5514]/20'
                        : 'bg-[#FAF8F5] border-[#EAE4DC] text-[#16221E] hover:bg-white hover:border-[#3E5514]/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#1E7E56] border border-[#E2DDD3] shadow-2xs'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black truncate">{item.label}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-[#8C9893]'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Secondary Category Pills */}
            <div className="pt-1 flex flex-wrap gap-1.5">
              {secondaryCategories.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#1E7E56] border-[#1E7E56] text-white shadow-xs'
                        : 'bg-[#F4EFEB] border-[#E4DDD3] text-[#586661] hover:text-[#16221E] hover:bg-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              SECTION 2: TITLE & TOPIC BENTO BLOCK
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E28743]" />
                  কর্মসূচির মূল শিরোনাম *
                </label>
                <span className="text-[11px] text-[#8C9893]">ক্লাস, লেকচার বা সেশনের নাম</span>
              </div>
              <input
                type="text"
                required
                placeholder="যেমন: সূরা আল-বাক্বারাহ তাফসির ক্লাস, জাতীয় যুব সম্মেলন..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#1E7E56] focus:outline-none focus:ring-2 focus:ring-[#1E7E56]/15 text-[#16221E] font-medium placeholder:text-[#9AA6A0] transition"
              />
            </div>

            {/* Quick Title Autofill Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] text-[#8C9893] font-bold self-center mr-1">সাজেশন:</span>
              {titleSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FAF8F5] hover:bg-[#F0FDF4] hover:text-[#1E7E56] border border-[#E6E0D6] hover:border-[#A7F3D0] rounded-lg text-[#586661] transition cursor-pointer active:scale-95"
                >
                  + {sug}
                </button>
              ))}
            </div>

            {/* Topic Input */}
            <div className="pt-1">
              <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                নির্ধারিত বিষয়বস্তু বা আলোচনার টপিক
              </label>
              <input
                type="text"
                placeholder="যেমন: তাকওয়ার তাৎপর্য ও আধুনিক বাস্তবতা, আয়াত নং ৩৫–৪০..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#1E7E56] focus:outline-none focus:ring-1 focus:ring-[#1E7E56] text-[#16221E] font-medium placeholder:text-[#9AA6A0] transition"
              />
            </div>
          </div>

          {/* ========================================================
              SECTION 3: DATE & TIME CAPSULE BENTO BLOCK
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <CalIcon size={14} className="text-[#1E7E56]" />
                তারিখ ও সময়সূচি
              </span>
              {durationStr && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF7F2] text-[#1E7E56] text-[11px] font-bold border border-[#D1EBE1]">
                  <Clock size={11} /> {durationStr}
                </span>
              )}
            </div>

            {/* Date Row with Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#1E7E56] focus:outline-none text-[#16221E] font-bold"
                />
                <span className="text-xs font-bold text-[#586661] bg-[#F4EFEB] px-3 py-2 rounded-xl border border-[#E4DDD3] shrink-0">
                  {formatBanglaDate(date)}
                </span>
              </div>

              {/* Quick Date Chips */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FAF8F5] hover:bg-white border border-[#E6E0D6] rounded-lg text-[#586661] hover:text-[#16221E] transition cursor-pointer"
                >
                  আজ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FAF8F5] hover:bg-white border border-[#E6E0D6] rounded-lg text-[#586661] hover:text-[#16221E] transition cursor-pointer"
                >
                  আগামীকাল
                </button>
                <button
                  type="button"
                  onClick={setNextFriday}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FAF8F5] hover:bg-white border border-[#E6E0D6] rounded-lg text-[#1E7E56] hover:bg-[#F0FDF4] transition cursor-pointer"
                >
                  পরবর্তী জুমু'আ
                </button>
              </div>
            </div>

            {/* Time Slot Row */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#F2EEE7]">
              <div>
                <label className="text-[11px] font-bold text-[#586661] block mb-1 flex items-center gap-1">
                  <Clock size={11} className="text-[#E28743]" />
                  <span>শুরুর সময়</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#1E7E56] focus:outline-none text-[#16221E] font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#586661] block mb-1 flex items-center gap-1">
                  <Clock size={11} className="text-[#1E7E56]" />
                  <span>সমাপ্তির সময়</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#1E7E56] focus:outline-none text-[#16221E] font-bold"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              SECTION 4: VENUE & LOCATION BENTO BLOCK
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <MapPin size={14} className="text-[#1E7E56]" />
                ভেন্যু বা অনুষ্ঠানের স্থান
              </label>
              <span className="text-[11px] text-[#8C9893]">অনলাইন বা অফলাইন ঠিকানা</span>
            </div>
            <input
              type="text"
              placeholder="যেমন: সোবহানবাগ জামে মসজিদ / ধানমন্ডি ক্যাম্পাস / জুম অনলাইন..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#1E7E56] focus:outline-none text-[#16221E] font-medium placeholder:text-[#9AA6A0] transition"
            />
            {/* Quick Venue Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {venueSuggestions.map((venue, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLocation(venue)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FAF8F5] hover:bg-white border border-[#E6E0D6] hover:border-[#1E7E56]/40 rounded-lg text-[#586661] hover:text-[#16221E] transition cursor-pointer active:scale-95"
                >
                  📍 {venue}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION 5: PRIORITY & PRIVACY BENTO BLOCK
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3.5">
            {/* Priority Selector as Segmented Pills */}
            <div>
              <label className="text-xs font-bold text-[#16221E] font-heading block mb-2">
                কর্মসূচির অগ্রাধিকার নির্ধারণ
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6E0D6]">
                {[
                  { key: 'LOW', label: 'সাধারণ', color: 'hover:text-[#586661]' },
                  { key: 'MEDIUM', label: 'মাঝারি', color: 'hover:text-[#0284C7]' },
                  { key: 'HIGH', label: 'উচ্চ গুরুত্ব', color: 'hover:text-[#D97706]' },
                  { key: 'URGENT', label: 'অতি জরুরি', color: 'hover:text-[#DC2626]' },
                ].map((item) => {
                  const isSelected = priority === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPriority(item.key as any)}
                      className={`py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3E5514] text-white shadow-xs'
                          : 'text-[#586661] hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scholar Confidential Toggle */}
            {isOwner && (
              <div className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-2xl border border-[#E6E0D6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F2F6EC] text-[#3E5514] flex items-center justify-center shrink-0 border border-[#D2DEC1]">
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#16221E]">স্কলার কনফিডেনশিয়াল শিডিউল</div>
                    <div className="text-[10px] text-[#586661]">শুধুমাত্র শায়খের নিজস্ব অ্যাপ ভিউতে দৃশ্যমান থাকবে</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isPrivate ? 'bg-[#3E5514]' : 'bg-[#D1C9BE]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      isPrivate ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              SECTION 6: NOTES & REMINDERS BENTO BLOCK
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-1.5">
            <label className="text-xs font-bold text-[#16221E] font-heading block">
              নোটস, বিশেষ প্রস্তুতি ও আয়োজক বিবরণ
            </label>
            <textarea
              rows={2}
              placeholder="আয়োজকদের যোগাযোগ নম্বর, আলোচনা বা খুতবাহর বিশেষ রেফারেন্স..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#3E5514] focus:outline-none text-[#16221E] font-medium placeholder:text-[#9AA6A0] transition"
            />
          </div>

          {/* ========================================================
              SECTION 7: TACTILE ACTIONS FOOTER
             ======================================================== */}
          <div className="flex items-center justify-end gap-3 pt-3 pb-1 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-[#586661] hover:text-[#16221E] bg-[#F4EFEB] hover:bg-[#ECE5DC] border border-[#E6E0D6] rounded-full transition cursor-pointer active:scale-95"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 text-xs font-bold text-white bg-[#3E5514] hover:bg-[#4D6819] rounded-full shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              <Sparkles size={14} className="text-[#6E3A0D]" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'শিডিউলে সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
