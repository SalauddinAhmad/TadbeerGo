import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, MapPin, Calendar as CalIcon, Shield, Users, Compass, CheckSquare, Sparkles } from 'lucide-react';
import {
  MosqueIcon,
  QuranRehalIcon,
  MinbarIcon,
  HalqaCircleIcon,
  TasbihIcon,
  RubElHizbIcon
} from '../icons/IslamicIcons';
import { ActivityType } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

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
      alert(err.message || 'Failed to create activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypes: { type: ActivityType; label: string; icon: React.FC<any> }[] = [
    { type: 'PROGRAMME', label: 'Programme', icon: HalqaCircleIcon },
    { type: 'LECTURE', label: 'Lecture', icon: MinbarIcon },
    { type: 'CLASS', label: 'Class Session', icon: QuranRehalIcon },
    { type: 'JUMUAH', label: 'Jumu\'ah', icon: MosqueIcon },
    { type: 'KHUTBAH', label: 'Khutbah', icon: MinbarIcon },
    { type: 'MEETING', label: 'Meeting', icon: Users },
    { type: 'TRAVEL', label: 'Travel', icon: Compass },
    { type: 'PERSONAL', label: 'Personal', icon: TasbihIcon },
    { type: 'TASK', label: 'Task', icon: CheckSquare },
    { type: 'OTHER', label: 'Other', icon: RubElHizbIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] animate-slide-up-mobile sm:animate-none safe-area-bottom">
        {/* Grab Handle for mobile bottom sheet */}
        <div className="sm:hidden w-12 h-1 rounded-full bg-slate-300 mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <RubElHizbIcon size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                + নতুন শিডিউল যোগ করুন
              </h2>
              <p className="text-xs text-slate-600 font-medium">Record a lecture, class, Jumu'ah or commitment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-900">
          {/* Conflict Alert Banner */}
          {conflicts.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs shadow-2xs">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold text-amber-950">Schedule Conflict Detected!</span>
                <p className="mt-0.5 text-amber-900">
                  Collides with: <strong>{conflicts[0].title}</strong> ({conflicts[0].start_time?.substring(0, 5)} - {conflicts[0].end_time?.substring(0, 5)})
                </p>
              </div>
            </div>
          )}

          {/* Activity Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              কার্যক্রমের ধরন / Activity Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {activityTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 border-emerald-900 text-white shadow-xs'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-emerald-200' : 'text-emerald-700'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              শিরোনাম / Title *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: সূরা আল-বাকারাহ তাফসীর ক্লাস, ঢাকা বিশ্ববিদ্যালয় যুব সম্মেলন..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <CalIcon size={13} className="text-emerald-700" /> তারিখ / Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Clock size={13} className="text-emerald-700" /> শুরু / Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Clock size={13} className="text-emerald-700" /> সমাপ্তি / End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Location & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-emerald-700" /> ভেন্যু / Location
              </label>
              <input
                type="text"
                placeholder="যেমন: সোবহানবাগ জামে মসজিদ / জুম অনলাইন"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                টপিক বা বিষয়বস্তু / Topic
              </label>
              <input
                type="text"
                placeholder="যেমন: তাকওয়ার তাৎপর্য ও আধুনিক বাস্তবতা"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Priority & Privacy */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-800">অগ্রাধিকার / Priority:</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="LOW">Low (সাধারণ)</option>
                <option value="MEDIUM">Medium (মাঝারি)</option>
                <option value="HIGH">High (জরুরি)</option>
                <option value="URGENT">Urgent (অতি জরুরি)</option>
              </select>
            </div>

            {isOwner && (
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Shield size={13} className="text-emerald-700" /> Scholar Confidential (গোপনীয়)
                </span>
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              নোটস ও নির্দেশনা / Notes & Reminders
            </label>
            <textarea
              rows={2}
              placeholder="গুরুত্বপূর্ণ পয়েন্ট, আয়োজকদের যোগাযোগ নম্বর বা খুতবাহর বিশেষ রেফারেন্স..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
            >
              বাতিল / Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন / Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
