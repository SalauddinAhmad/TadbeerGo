import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  CheckSquare,
  Square,
  Bell,
  ExternalLink,
  Share2,
  Monitor,
  Navigation,
  Phone,
  Edit3,
  Trash2
} from 'lucide-react';
import { formatBanglaDate, formatBanglaTime } from '../../utils/bengali';

interface EventDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  eventData?: any;
  onEdit?: (event: any) => void;
  onDelete?: (event: any) => void;
}

export const EventDetailsSheet: React.FC<EventDetailsSheetProps> = ({
  isOpen,
  onClose,
  eventData,
  onEdit,
  onDelete
}) => {
  const [prepTasks, setPrepTasks] = useState([
    { id: 1, title: 'অধ্যায় ৪: বালাগাত উদাহরণ সংক্রান্ত নোটসমূহ পর্যালোচনা', done: true },
    { id: 2, title: 'জুম অডিও ও রেকর্ডিং স্টুডিও লাইটিং প্রস্তুত করা', done: true },
    { id: 3, title: 'ব্যাচ #১১ এর শিক্ষার্থীদের মূল্যায়ন ও হোমওয়ার্ক যাচাই', done: false }
  ]);

  if (!isOpen) return null;

  const title = eventData?.title || 'বালাগাহ ও ফাসাহাহ';
  const subtitle = eventData?.topic || eventData?.subtitle || 'ক্লাস #১২ · অনলাইন কোর্স';
  const time = eventData?.start_time ? `${formatBanglaTime(eventData.start_time)} – ${formatBanglaTime(eventData.end_time || '18:30')}` : (eventData?.time || 'বিকাল ৫:০০ – সন্ধ্যা ৬:৩০');
  const formattedDate = eventData?.date ? formatBanglaDate(eventData.date) : 'বৃহস্পতিবার, ১৭ সেপ্টেম্বর';
  const location = eventData?.location || (eventData?.subtitle?.includes('Online') ? 'অনলাইন স্টুডিও ও জুম লাইভ' : 'মসজিদ কমপ্লেক্স');
  const isOnline = eventData?.is_online === 1 || 
    (location.toLowerCase().includes('অনলাইন') || location.toLowerCase().includes('online') || location.toLowerCase().includes('zoom') || location.toLowerCase().includes('জুম'));

  const mapsQuery = location && !location.includes('অনলাইন') ? location : (eventData?.venue || title);
  const mapsUrl = eventData?.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery + (mapsQuery.includes('ঢাকা') ? '' : ' ঢাকা'))}`;

  const handleAction = () => {
    if (isOnline) {
      window.open(eventData?.meeting_link || eventData?.zoom_link || 'https://zoom.us', '_blank');
    } else {
      window.open(mapsUrl, '_blank');
    }
  };

  const toggleTask = (id: number) => {
    setPrepTasks(tasks =>
      tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 font-bengali">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-[#E4EBE8] max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EBE8]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5F0] text-[#063F35]">
              {eventData?.category || eventData?.type || 'কর্মসূচি'}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#00A878]">
              {eventData?.status || 'নিশ্চিত'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(eventData);
                }}
                className="w-8 h-8 rounded-full bg-[#F7F9F7] hover:bg-[#E8F5F0] flex items-center justify-center text-[#063F35] transition cursor-pointer"
                title="সম্পাদনা করুন"
              >
                <Edit3 size={15} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(eventData);
                }}
                className="w-8 h-8 rounded-full bg-[#F7F9F7] hover:bg-rose-50 flex items-center justify-center text-rose-600 transition cursor-pointer"
                title="মুছে ফেলুন বা বাতিল করুন"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#6F7D78] transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 py-3 flex-1 pr-0.5">
          {/* Main Title & Time */}
          <div>
            <h2 className="text-xl font-bold font-heading text-[#17211F] leading-tight">
              {title}
            </h2>
            <p className="text-xs text-[#6F7D78] mt-0.5 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Time & Venue Card */}
          <div className="bg-[#F7F9F7] rounded-2xl p-3.5 border border-[#E4EBE8] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#17211F] font-semibold">
              <Clock size={15} className="text-[#00A878]" />
              <span>{time}</span>
              <span className="text-[#9AA6A2] font-normal">• {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6F7D78]">
              {isOnline ? (
                <Monitor size={15} className="text-[#00A878]" />
              ) : (
                <MapPin size={15} className="text-[#00A878]" />
              )}
              <span>{location}</span>
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-heading text-[#17211F]">
                প্রস্তুতির কাজ
              </h4>
              <span className="text-[11px] text-[#00A878] font-medium">
                সংরক্ষিত
              </span>
            </div>
            <div className="space-y-1.5">
              {prepTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start gap-2 text-xs text-[#17211F] bg-[#F7F9F7] hover:bg-[#E8F5F0] p-2.5 rounded-xl border border-[#E4EBE8] transition cursor-pointer"
                >
                  {task.done ? (
                    <CheckSquare size={16} className="text-[#00A878] shrink-0 mt-0.5" />
                  ) : (
                    <Square size={16} className="text-[#9AA6A2] shrink-0 mt-0.5" />
                  )}
                  <span className={task.done ? 'line-through text-[#9AA6A2]' : 'font-medium'}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-1.5 pt-1">
            <h4 className="text-xs font-bold font-heading text-[#17211F]">
              সক্রিয় রিমাইন্ডার
            </h4>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#E8F5F0] text-[#063F35] font-semibold text-[11px] flex items-center gap-1">
                <Bell size={11} className="text-[#00A878]" />
                <span>১ দিন পূর্বে</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#E8F5F0] text-[#063F35] font-semibold text-[11px] flex items-center gap-1">
                <Bell size={11} className="text-[#00A878]" />
                <span>১ ঘণ্টা পূর্বে</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#6F7D78] font-semibold text-[11px] flex items-center gap-1">
                <span>১৫মি পূর্বে</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E4EBE8] flex items-center gap-2">
          <button
            onClick={handleAction}
            className="flex-1 py-2.5 rounded-xl bg-[#063F35] hover:bg-[#042F28] active:scale-[0.99] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isOnline ? (
              <>
                <Monitor size={14} className="text-[#00A878]" />
                <span>অনলাইন সেশনে যুক্ত হোন</span>
                <ExternalLink size={12} />
              </>
            ) : (
              <>
                <Navigation size={14} className="text-[#00A878]" />
                <span>গুগল ম্যাপসে লোকেশন দেখুন</span>
                <ExternalLink size={12} />
              </>
            )}
          </button>

          {eventData?.phone && (
            <a
              href={`tel:${eventData.phone}`}
              className="w-10 h-10 rounded-xl border border-[#E4EBE8] hover:bg-[#E8F5F0] flex items-center justify-center text-[#063F35] transition cursor-pointer shrink-0"
              title="সরাসরি কল করুন"
            >
              <Phone size={15} />
            </a>
          )}

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, text: `${title} - ${time} (${location})` }).catch(() => {});
              }
            }}
            className="w-10 h-10 rounded-xl border border-[#E4EBE8] hover:bg-slate-50 flex items-center justify-center text-[#6F7D78] transition cursor-pointer shrink-0"
            title="শেয়ার করুন"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
