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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-bengali"
    >
      <div
        className="w-full sm:max-w-md bg-[#FCFAF6] rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(62,85,20,0.2)] border border-[#E6E0D6] max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-[#E0D8CA] mx-auto mt-0 mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFECE6] bg-white -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 p-6 sm:p-7 rounded-t-[32px]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F2F6EC] border border-[#D2DEC1] text-[#3E5514]">
              {eventData?.category || eventData?.type || 'কর্মসূচি'}
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F2F6EC] border border-[#D2DEC1] text-[#3E5514]">
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
                className="w-9 h-9 rounded-full bg-white border border-[#E6E0D6] hover:bg-[#F2F6EC] flex items-center justify-center text-[#3E5514] transition shadow-2xs cursor-pointer active:scale-95"
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
                className="w-9 h-9 rounded-full bg-white border border-[#E6E0D6] hover:bg-rose-50 flex items-center justify-center text-rose-600 transition shadow-2xs cursor-pointer active:scale-95"
                title="মুছে ফেলুন বা বাতিল করুন"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#E6E0D6] hover:bg-[#F4EFEB] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition shadow-2xs cursor-pointer active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pt-5 pb-2 flex-1 pr-0.5">
          {/* Main Title & Time */}
          <div>
            <h2 className="text-xl font-black font-heading text-[#16221E] leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#586661] mt-1 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Time & Venue Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E6E0D6] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#16221E] font-bold">
              <Clock size={15} className="text-[#E28743]" />
              <span>{time}</span>
              <span className="text-[#9AA6A2] font-normal">• {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#586661] font-medium">
              {isOnline ? (
                <Monitor size={15} className="text-[#1E7E56]" />
              ) : (
                <MapPin size={15} className="text-[#1E7E56]" />
              )}
              <span>{location}</span>
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-heading text-[#16221E]">
                প্রস্তুতির কাজ
              </h4>
              <span className="text-[11px] font-bold text-[#1E7E56]">
                {prepTasks.filter(t => t.done).length}/{prepTasks.length} সম্পন্ন
              </span>
            </div>
            <div className="space-y-1.5">
              {prepTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start gap-2.5 text-xs text-[#16221E] bg-white hover:bg-emerald-50/20 p-3 rounded-xl border border-[#E6E0D6] shadow-2xs transition cursor-pointer active:scale-98"
                >
                  {task.done ? (
                    <CheckSquare size={16} className="text-[#1E7E56] shrink-0 mt-0.5" />
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
            <h4 className="text-xs font-bold font-heading text-[#16221E]">
              সক্রিয় রিমাইন্ডার
            </h4>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-1 rounded-full bg-[#F2F6EC] border border-[#D2DEC1] text-[#3E5514] font-bold text-[11px] flex items-center gap-1.5">
                <Bell size={11} className="text-[#3E5514]" />
                <span>১ দিন পূর্বে</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F2F6EC] border border-[#D2DEC1] text-[#3E5514] font-bold text-[11px] flex items-center gap-1.5">
                <Bell size={11} className="text-[#3E5514]" />
                <span>১ ঘণ্টা পূর্বে</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#E6E0D6] text-[#586661] font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                <span>১৫মি পূর্বে</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#EFECE6] flex items-center gap-2.5">
          <button
            onClick={handleAction}
            className="flex-1 py-3 rounded-full bg-[#3E5514] hover:bg-[#4D6819] active:scale-[0.99] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isOnline ? (
              <>
                <Monitor size={14} className="text-[#F2F6EC]" />
                <span>অনলাইন সেশনে যুক্ত হোন</span>
                <ExternalLink size={12} />
              </>
            ) : (
              <>
                <Navigation size={14} className="text-[#F2F6EC]" />
                <span>গুগল ম্যাপসে লোকেশন দেখুন</span>
                <ExternalLink size={12} />
              </>
            )}
          </button>

          {eventData?.phone && (
            <a
              href={`tel:${eventData.phone}`}
              className="w-11 h-11 rounded-full bg-white border border-[#E6E0D6] hover:bg-[#F2F6EC] flex items-center justify-center text-[#3E5514] transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
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
            className="w-11 h-11 rounded-full bg-white border border-[#E6E0D6] hover:bg-[#F4EFEB] flex items-center justify-center text-[#586661] transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
            title="শেয়ার করুন"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
