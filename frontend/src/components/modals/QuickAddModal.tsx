import React from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  EventCalendarIcon,
  CourseBookIcon,
  JumuaMosqueIcon,
  DawahMicIcon,
  QuickDraftIcon,
  ContactsDirectoryIcon
} from '../icons/IslamicIcons';
import { ActivityType } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string, initialType?: ActivityType) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const quickItems = [
    {
      id: 'event',
      title: 'ইভেন্ট',
      subtitle: 'ক্লাস বা মিটিং',
      tag: 'ক্যালেন্ডার',
      icon: EventCalendarIcon,
      type: 'MEETING' as ActivityType,
      iconBg: 'bg-[#F2F6EC] border-[#D2DEC1] text-[#3E5514]',
      hoverBorder: 'group-hover:border-[#3E5514]',
    },
    {
      id: 'class',
      title: 'কোর্স ক্লাস',
      subtitle: 'পুনরাবৃত্ত রুটিন',
      tag: 'সিলেবাস',
      icon: CourseBookIcon,
      type: 'CLASS' as ActivityType,
      iconBg: 'bg-[#F2F6EC] border-[#D2DEC1] text-[#3E5514]',
      hoverBorder: 'group-hover:border-[#3E5514]',
    },
    {
      id: 'jumua',
      title: "জুমু'আ",
      subtitle: 'খুতবাহ ও বয়ান',
      tag: 'মসজিদ',
      icon: JumuaMosqueIcon,
      type: 'JUMUAH' as ActivityType,
      iconBg: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#065F46]',
      hoverBorder: 'group-hover:border-[#065F46]',
    },
    {
      id: 'programme',
      title: 'কর্মসূচি',
      subtitle: 'লেকচার ও মাহফিল',
      tag: 'দাওয়াহ',
      icon: DawahMicIcon,
      type: 'PROGRAMME' as ActivityType,
      iconBg: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]',
      hoverBorder: 'group-hover:border-[#0284C7]',
    },
    {
      id: 'note',
      title: 'নোট',
      subtitle: 'জরুরি খসড়া',
      tag: 'ড্রাফট',
      icon: QuickDraftIcon,
      type: undefined,
      iconBg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
      hoverBorder: 'group-hover:border-[#D97706]',
    },
    {
      id: 'contact',
      title: 'যোগাযোগ',
      subtitle: 'আয়োজক ও মসজিদ',
      tag: 'ডিরেক্টরি',
      icon: ContactsDirectoryIcon,
      type: undefined,
      iconBg: 'bg-[#F0FDFA] border-[#99F6E4] text-[#0D9488]',
      hoverBorder: 'group-hover:border-[#0D9488]',
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-bengali"
    >
      <div
        className="w-full sm:max-w-md bg-[#FCFAF6] rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(62,85,20,0.2)] border border-[#E6E0D6] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#EFECE6]">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#3E5514] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#6E3A0D]" />
              <span>স্মার্ট শিডিউল তৈরি</span>
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#16221E] font-heading mt-0.5 tracking-tight">
              দ্রুত যোগ করুন
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E6E0D6] hover:bg-[#F4EFEB] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition shadow-2xs cursor-pointer active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* 6-Card Bento Grid */}
        <div className="grid grid-cols-3 gap-3 pt-5 pb-2">
          {quickItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAction(item.id, item.type);
                  onClose();
                }}
                className={`flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6E0D6] ${item.hoverBorder} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-center cursor-pointer group relative overflow-hidden`}
              >
                {/* Dual-tone squircle icon badge */}
                <div
                  className={`w-12 h-12 rounded-2xl ${item.iconBg} border flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110 shadow-2xs`}
                >
                  <Icon size={24} />
                </div>

                <div className="space-y-0.5">
                  <span className="text-[13px] font-bold text-[#16221E] font-heading group-hover:text-[#3E5514] leading-tight block">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-[#586661] leading-tight font-medium block line-clamp-1">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
