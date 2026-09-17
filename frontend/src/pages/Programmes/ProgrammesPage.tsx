import React, { useEffect, useState } from 'react';
import {
  MapPin,
  CheckSquare,
  Square,
  Plus,
  Car,
  X,
  MessageSquare,
  Copy,
  Check,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Navigation,
  ExternalLink,
  Edit3,
  Trash2,
  Search,
  User,
  Building2,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  MinbarIcon,
  CrescentStarIcon
} from '../../components/icons/IslamicIcons';
import { Programme } from '../../types';
import { api } from '../../api/client';
import { toBengaliDigits } from '../../utils/bengali';

export const ProgrammesPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [programmeToEdit, setProgrammeToEdit] = useState<Programme | null>(null);
  const [programmeToDelete, setProgrammeToDelete] = useState<Programme | null>(null);

  // Add Preparation Task Modal / Input state
  const [prepModalProgrammeId, setPrepModalProgrammeId] = useState<number | null>(null);
  const [newPrepTitle, setNewPrepTitle] = useState('');

  // Form states for Add / Edit Programme
  const [title, setTitle] = useState('');
  const [programmeType, setProgrammeType] = useState('পাবলিক লেকচার');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('19:30');
  const [endTime, setEndTime] = useState('21:00');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [topic, setTopic] = useState('');
  const [audienceType, setAudienceType] = useState('সাধারণ জনতা ও তরুণ সমাজ');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [prepRequired, setPrepRequired] = useState(true);
  const [travelRequired, setTravelRequired] = useState(true);
  const [status, setStatus] = useState('CONFIRMED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bengaliWeekDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchProgrammes = async () => {
    try {
      const query = selectedStatus !== 'ALL' ? `?status=${selectedStatus}` : '';
      const res = await api.get<{ programmes: Programme[] }>(`/programmes${query}`);
      setProgrammes(res.programmes || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProgrammes();
  }, [selectedStatus]);

  // Open Add Programme Modal
  const openAddModal = () => {
    setTitle('');
    setProgrammeType('পাবলিক লেকচার');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('19:30');
    setEndTime('21:00');
    setVenue('');
    setLocation('');
    setMapsUrl('');
    setContactPerson('');
    setPhone('');
    setWhatsapp('');
    setTopic('');
    setAudienceType('সাধারণ জনতা ও তরুণ সমাজ');
    setDescription('');
    setNotes('');
    setPrepRequired(true);
    setTravelRequired(true);
    setStatus('CONFIRMED');
    setIsAddModalOpen(true);
  };

  // Open Edit Programme Modal
  const openEditModal = (prog: Programme) => {
    setProgrammeToEdit(prog);
    setTitle(prog.title);
    setProgrammeType(prog.programme_type || 'পাবলিক লেকচার');
    setDate(prog.date);
    setStartTime(prog.start_time ? prog.start_time.substring(0, 5) : '19:30');
    setEndTime(prog.end_time ? prog.end_time.substring(0, 5) : '21:00');
    setVenue(prog.venue || '');
    setLocation(prog.location || '');
    setMapsUrl(prog.maps_url || '');
    setContactPerson(prog.contact_person || '');
    setPhone(prog.phone || '');
    setWhatsapp(prog.whatsapp || prog.phone || '');
    setTopic(prog.topic || '');
    setAudienceType(prog.audience_type || 'সাধারণ জনতা ও তরুণ সমাজ');
    setDescription(prog.description || '');
    setNotes(prog.notes || '');
    setPrepRequired(Boolean(prog.preparation_required));
    setTravelRequired(Boolean(prog.travel_required));
    setStatus(prog.status || 'CONFIRMED');
  };

  const handleAddProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await api.post('/programmes', {
        title,
        programme_type: programmeType,
        date,
        start_time: startTime ? `${startTime}:00` : null,
        end_time: endTime ? `${endTime}:00` : null,
        venue,
        location,
        maps_url: mapsUrl || (venue ? `https://maps.google.com/?q=${encodeURIComponent(venue + ' ' + location)}` : null),
        contact_person: contactPerson,
        phone,
        whatsapp: whatsapp || phone,
        topic,
        audience_type: audienceType,
        description,
        notes,
        preparation_required: prepRequired,
        travel_required: travelRequired,
        status,
      });

      setIsAddModalOpen(false);
      showToast('নতুন কর্মসূচি সফলভাবে যুক্ত করা হয়েছে!');
      fetchProgrammes();
    } catch (err: any) {
      alert(err.message || 'কর্মসূচি সংরক্ষণ করা যায়নি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programmeToEdit || !title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await api.put(`/programmes/${programmeToEdit.id}`, {
        title,
        programme_type: programmeType,
        date,
        start_time: startTime ? `${startTime}:00` : null,
        end_time: endTime ? `${endTime}:00` : null,
        venue,
        location,
        maps_url: mapsUrl || (venue ? `https://maps.google.com/?q=${encodeURIComponent(venue + ' ' + location)}` : null),
        contact_person: contactPerson,
        phone,
        whatsapp: whatsapp || phone,
        topic,
        audience_type: audienceType,
        description,
        notes,
        preparation_required: prepRequired,
        travel_required: travelRequired,
        status,
      });

      setProgrammeToEdit(null);
      showToast('কর্মসূচির তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
      fetchProgrammes();
    } catch (err: any) {
      alert(err.message || 'কর্মসূচি আপডেট করা সম্ভব হয়নি');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgramme = async () => {
    if (!programmeToDelete) return;
    try {
      await api.delete(`/programmes/${programmeToDelete.id}`);
      showToast('কর্মসূচিটি সফলভাবে মুছে ফেলা হয়েছে।');
      setProgrammeToDelete(null);
      fetchProgrammes();
    } catch (err: any) {
      alert(err.message || 'কর্মসূচি মোছা সম্ভব হয়নি');
    }
  };

  const handleTogglePrep = async (prepId: number) => {
    try {
      await api.put(`/programmes/preparations/${prepId}/toggle`);
      fetchProgrammes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPrepTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prepModalProgrammeId || !newPrepTitle.trim()) return;

    try {
      await api.post(`/programmes/${prepModalProgrammeId}/preparations`, {
        title: newPrepTitle.trim()
      });
      setNewPrepTitle('');
      setPrepModalProgrammeId(null);
      showToast('নতুন প্রস্তুতি টাস্ক যুক্ত হয়েছে!');
      fetchProgrammes();
    } catch (err: any) {
      alert(err.message || 'টাস্ক যোগ করা সম্ভব হয়নি');
    }
  };

  const handleDeletePrepTask = async (prepId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/programmes/preparations/${prepId}`);
      fetchProgrammes();
    } catch (err: any) {
      alert(err.message || 'টাস্ক মোছা সম্ভব হয়নি');
    }
  };

  const handleStatusChange = async (progId: number, newStatus: string) => {
    try {
      await api.put(`/programmes/${progId}/status`, { status: newStatus });
      showToast(`স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে।`);
      fetchProgrammes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyProgrammeBrief = (prog: Programme) => {
    const text = [
      `🎤 *কর্মসূচি বিবরণ: ${prog.title}*`,
      `ধরণ: ${prog.programme_type}`,
      `তারিখ: ${toBengaliDigits(prog.date)}`,
      `সময়: ${prog.start_time ? toBengaliDigits(prog.start_time.substring(0, 5)) : 'অনির্ধারিত'} - ${prog.end_time ? toBengaliDigits(prog.end_time.substring(0, 5)) : ''}`,
      prog.venue ? `স্থান / ভেন্যু: ${prog.venue}` : '',
      prog.location ? `ঠিকানা ও এলাকা: ${prog.location}` : '',
      prog.maps_url ? `গুগল ম্যাপস লোকেশন: ${prog.maps_url}` : '',
      prog.topic ? `বিষয়: ${prog.topic}` : '',
      prog.contact_person ? `যোগাযোগকারী: ${prog.contact_person}` : '',
      prog.phone ? `মোবাইল: ${toBengaliDigits(prog.phone)}` : '',
      prog.whatsapp ? `হোয়াটসঅ্যাপ: ${toBengaliDigits(prog.whatsapp)}` : '',
      prog.travel_required ? `নোট: যাতায়াত সমন্বয় আবশ্যক` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(prog.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Filter programmes by status and search query
  const filteredProgrammes = programmes.filter((prog) => {
    if (selectedStatus !== 'ALL' && prog.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prog.title?.toLowerCase().includes(q);
      const matchVenue = prog.venue?.toLowerCase().includes(q);
      const matchLocation = prog.location?.toLowerCase().includes(q);
      const matchTopic = prog.topic?.toLowerCase().includes(q);
      const matchContact = prog.contact_person?.toLowerCase().includes(q);
      return matchTitle || matchVenue || matchLocation || matchTopic || matchContact;
    }
    return true;
  });

  // Metrics
  const totalCount = programmes.length;
  const confirmedCount = programmes.filter((p) => p.status === 'CONFIRMED').length;
  const travelCount = programmes.filter((p) => p.travel_required).length;
  const pendingPrepCount = programmes.filter((p) => {
    const total = p.total_prep_tasks || 0;
    const done = p.completed_prep_tasks || 0;
    return total > 0 && done < total;
  }).length;

  return (
    <div className="space-y-6 font-bengali">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#063F35] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#00A878]/30 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={18} className="text-[#00A878]" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* 1. Top Analytics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5F0] text-[#063F35] flex items-center justify-center shrink-0 border border-[#00A878]/20">
            <MinbarIcon size={22} strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">মোট কর্মসূচি</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(totalCount)}টি ইভেন্ট</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#063F35] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-[#00A878]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">নিশ্চিত লেকচার</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(confirmedCount)}টি সেশন</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">প্রস্তুতি বাকি</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(pendingPrepCount)}টি বিষয়</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5F0] text-[#063F35] flex items-center justify-center shrink-0 border border-[#00A878]/20">
            <Car size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">যাতায়াত ব্যবস্থা</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(travelCount)}টি সফর</span>
          </div>
        </div>
      </div>

      {/* 2. Top Header & Action Controls Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E4EBE8] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#063F35] text-white flex items-center justify-center shrink-0 shadow-xs">
            <MinbarIcon size={20} strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#063F35] uppercase tracking-widest flex items-center gap-1.5">
              <CrescentStarIcon size={12} className="text-[#00A878]" />
              দ্বীনি আলোচনা, মাহফিল ও সম্মেলন
            </span>
            <h2 className="text-xl font-bold text-[#17211F]">
              কর্মসূচি ও লেকচার ডায়েরি
            </h2>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>+ নতুন কর্মসূচি যুক্ত করুন</span>
        </button>
      </div>

      {/* 3. Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'সকল' },
            { id: 'CONFIRMED', label: 'নিশ্চিত' },
            { id: 'PENDING', label: 'অপেক্ষমাণ' },
            { id: 'INVITED', label: 'আমন্ত্রণ প্রাপ্ত' },
            { id: 'COMPLETED', label: 'সম্পন্ন' },
            { id: 'CANCELLED', label: 'স্থগিত' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-[#063F35] text-white shadow-xs'
                  : 'bg-white text-[#17211F]/70 hover:bg-[#E4EBE8] border border-[#E4EBE8]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="অনুসন্ধান: শিরোনাম, স্থান, আয়োজক..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E4EBE8] rounded-xl text-[#17211F] placeholder-slate-400 focus:outline-hidden focus:border-[#00A878]"
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

      {/* 4. Programme Cards List */}
      <div className="space-y-4">
        {filteredProgrammes.length > 0 ? (
          filteredProgrammes.map((prog) => {
            const isConfirmed = prog.status === 'CONFIRMED';
            const isPending = prog.status === 'PENDING' || prog.status === 'INVITED';
            const isCancelled = prog.status === 'CANCELLED';
            const isCompleted = prog.status === 'COMPLETED';

            const prepCompleted = prog.completed_prep_tasks || 0;
            const prepTotal = prog.total_prep_tasks || 0;
            const prepPct = prepTotal > 0 ? Math.round((prepCompleted / prepTotal) * 100) : 100;
            const dateObj = new Date(prog.date + 'T00:00:00');
            const dayName = isNaN(dateObj.getTime()) ? 'দিন' : bengaliWeekDays[dateObj.getDay()];
            const dayNum = isNaN(dateObj.getTime()) ? prog.date : toBengaliDigits(dateObj.getDate());
            const monthName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('bn-BD', { month: 'short' });

            // Google Maps URL fallback if maps_url is not set
            const resolvedMapsUrl = prog.maps_url || (prog.venue || prog.location
              ? `https://maps.google.com/?q=${encodeURIComponent((prog.venue || '') + ' ' + (prog.location || ''))}`
              : null);

            return (
              <div
                key={prog.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E4EBE8] shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top Row: Date, Title, Badges, Header Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Date + Time + Title */}
                  <div className="flex items-start space-x-3.5 min-w-0">
                    {/* Date Block */}
                    <div className="text-center w-14 shrink-0 bg-[#F7F9F7] py-2 rounded-xl border border-[#E4EBE8]">
                      <span className={`text-[11px] font-bold block leading-none ${isPending ? 'text-[#063F35]' : 'text-[#17211F]/40'}`}>
                        {dayName}
                      </span>
                      <span className="text-xl font-black text-[#17211F] block mt-1">
                        {dayNum}
                      </span>
                      <span className="text-[10px] text-[#17211F]/50 block">
                        {monthName}
                      </span>
                    </div>

                    {/* Title, Badges, Topic */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-[#063F35] text-white'
                          }`}
                        >
                          {isConfirmed ? 'নিশ্চিত' : isPending ? (prog.status === 'INVITED' ? 'আমন্ত্রণ প্রাপ্ত' : 'অপেক্ষমাণ') : isCancelled ? 'স্থগিত' : 'সম্পন্ন'}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5F0] text-[#063F35] border border-[#00A878]/20">
                          {prog.programme_type || 'লেকচার'}
                        </span>

                        {prog.audience_type && (
                          <span className="text-[10px] text-[#17211F]/60 bg-[#F7F9F7] px-2 py-0.5 rounded-md border border-[#E4EBE8]">
                            শ্রোতা: {prog.audience_type}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#17211F] leading-snug">
                        {prog.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#17211F]/70">
                        <div className="flex items-center gap-1.5 font-semibold text-[#17211F]">
                          <Clock size={13} className="text-[#00A878]" />
                          <span>
                            {prog.start_time ? toBengaliDigits(prog.start_time.substring(0, 5)) : 'অনির্ধারিত'}
                            {prog.end_time ? ` - ${toBengaliDigits(prog.end_time.substring(0, 5))}` : ''}
                          </span>
                        </div>

                        {prog.topic && (
                          <>
                            <span>•</span>
                            <span className="text-[#063F35] font-semibold">
                              বিষয়: {prog.topic}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-start">
                    <button
                      onClick={() => handleCopyProgrammeBrief(prog)}
                      className="px-3 py-1.5 bg-[#F7F9F7] hover:bg-[#E4EBE8] text-[#17211F] border border-[#E4EBE8] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="কর্মসূচির সারসংক্ষেপ কপি করুন"
                    >
                      {copiedId === prog.id ? <Check size={13} className="text-[#00A878]" /> : <Copy size={13} />}
                      <span className="hidden sm:inline">{copiedId === prog.id ? 'কপি হয়েছে' : 'শেয়ার'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(prog)}
                      className="px-3 py-1.5 bg-white hover:bg-[#E8F5F0] hover:text-[#063F35] text-[#17211F]/80 border border-[#E4EBE8] rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>সম্পাদনা</span>
                    </button>

                    {/* Status Dropdown */}
                    <select
                      value={prog.status}
                      onChange={(e) => handleStatusChange(prog.id, e.target.value)}
                      className="text-xs bg-white border border-[#E4EBE8] rounded-xl px-2.5 py-1.5 font-bold text-[#17211F] cursor-pointer focus:outline-hidden"
                    >
                      <option value="CONFIRMED">নিশ্চিত</option>
                      <option value="PENDING">অপেক্ষমাণ</option>
                      <option value="INVITED">আমন্ত্রণ প্রাপ্ত</option>
                      <option value="COMPLETED">সম্পন্ন</option>
                      <option value="CANCELLED">স্থগিত</option>
                    </select>

                    <button
                      onClick={() => setProgrammeToDelete(prog)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition cursor-pointer"
                      title="কর্মসূচি মুছুন"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Middle Info Section: ঠিকানা, লোকেশন, গুগল ম্যাপ ও যোগাযোগ বিবরণ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#E4EBE8]">
                  {/* Left: ভেন্যু ও বিস্তারিত ঠিকানা */}
                  <div className="p-3.5 bg-[#F7F9F7] rounded-xl border border-[#E4EBE8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#063F35] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#00A878]" />
                        স্থান ও পূর্ণাঙ্গ ঠিকানা
                      </span>

                      {resolvedMapsUrl && (
                        <a
                          href={resolvedMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#063F35] hover:text-[#00A878] flex items-center gap-1 hover:underline"
                        >
                          <Navigation size={11} />
                          <span>গুগল ম্যাপ</span>
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-[#17211F]">
                      <p className="font-bold text-sm">
                        {prog.venue || 'ভেন্যুর নাম উল্লেখ নেই'}
                      </p>
                      {prog.location && (
                        <p className="text-[#17211F]/70 mt-0.5">
                          {prog.location}
                        </p>
                      )}
                    </div>

                    {prog.travel_required ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#063F35] font-semibold bg-[#E8F5F0] px-2.5 py-1 rounded-lg border border-[#00A878]/20">
                        <Car size={12} className="text-[#00A878] shrink-0" />
                        <span>যাতায়াত সমন্বয় আবশ্যক</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Right: যোগাযোগের তথ্য (Contact Person, Phone, WhatsApp) */}
                  <div className="p-3.5 bg-[#F7F9F7] rounded-xl border border-[#E4EBE8] space-y-2">
                    <span className="text-[11px] font-bold text-[#063F35] uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} className="text-[#00A878]" />
                      দায়িত্বপ্রাপ্ত ব্যক্তি ও যোগাযোগ
                    </span>

                    <div className="text-xs text-[#17211F]">
                      <p className="font-bold text-sm">
                        {prog.contact_person || 'সমন্বয়কারী উল্লেখ নেই'}
                      </p>
                      {prog.organizer_name && (
                        <p className="text-[#17211F]/70 flex items-center gap-1 mt-0.5">
                          <Building2 size={11} className="text-slate-400" />
                          <span>{prog.organizer_name}</span>
                        </p>
                      )}
                    </div>

                    {/* Quick Call and WhatsApp Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {prog.phone ? (
                        <a
                          href={`tel:${prog.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#063F35] border border-[#E4EBE8] hover:border-emerald-300 rounded-xl text-xs font-bold transition shadow-2xs"
                        >
                          <Phone size={12} className="text-[#00A878]" />
                          <span>{toBengaliDigits(prog.phone)}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">ফোন নম্বর নেই</span>
                      )}

                      {(prog.whatsapp || prog.phone) && (
                        <a
                          href={`https://wa.me/${(prog.whatsapp || prog.phone || '').replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                          title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                        >
                          <MessageSquare size={12} />
                          <span>হোয়াটসঅ্যাপ</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Description or Teacher Notes */}
                {(prog.description || prog.notes) && (
                  <div className="text-xs bg-white p-3 rounded-xl border border-[#E4EBE8] text-[#17211F]/80 space-y-1">
                    {prog.description && (
                      <p>
                        <strong className="text-[#063F35]">বিস্তারিত বিবরণ:</strong> {prog.description}
                      </p>
                    )}
                    {prog.notes && (
                      <p className="text-[#17211F]/60">
                        <strong className="text-[#063F35]">নোট:</strong> {prog.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Preparation Checklist */}
                {prog.preparation_required ? (
                  <div className="pt-2 border-t border-[#E4EBE8] space-y-2.5 w-full">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-[#17211F] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#00A878]" />
                        বক্তব্য ও লজিস্টিকস প্রস্তুতি ({toBengaliDigits(prepCompleted)}/{toBengaliDigits(prepTotal)})
                      </h5>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#063F35]">{toBengaliDigits(prepPct)}% প্রস্তুত</span>
                        <button
                          onClick={() => {
                            setPrepModalProgrammeId(prog.id);
                            setNewPrepTitle('');
                          }}
                          className="text-[11px] font-bold text-[#063F35] hover:text-[#00A878] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>+ টাস্ক যোগ করুন</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#E4EBE8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00A878] to-[#063F35] rounded-full transition-all"
                        style={{ width: `${prepPct}%` }}
                      />
                    </div>

                    {/* Preparation Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {prog.preparations && prog.preparations.length > 0 ? (
                        prog.preparations.map((prep) => {
                          const isDone = prep.status === 'COMPLETED';
                          return (
                            <div
                              key={prep.id}
                              onClick={() => handleTogglePrep(prep.id)}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer border ${
                                isDone
                                  ? 'text-[#17211F]/40 line-through bg-[#F7F9F7] border-[#E4EBE8] font-medium'
                                  : 'text-[#17211F] bg-white border-[#E4EBE8] hover:border-[#00A878] shadow-2xs font-semibold'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                {isDone ? (
                                  <CheckSquare size={15} className="text-[#00A878] shrink-0" />
                                ) : (
                                  <Square size={15} className="text-slate-400 shrink-0" />
                                )}
                                <span className="truncate">{prep.title}</span>
                              </div>

                              <button
                                onClick={(e) => handleDeletePrepTask(prep.id, e)}
                                className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition"
                                title="টাস্ক মুছুন"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-[#17211F]/50 col-span-2 italic">
                          কোনো নির্দিষ্ট প্রস্তুতি টাস্ক এখনো যুক্ত করা হয়নি।
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E4EBE8]">
            <MinbarIcon size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-[#17211F]/60 font-medium">
              কোনো কর্মসূচি খুঁজে পাওয়া যায়নি।
            </p>
            <button
              onClick={openAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#063F35] text-white text-xs font-bold rounded-xl hover:bg-[#042F28] transition cursor-pointer"
            >
              <Plus size={14} />
              <span>নতুন কর্মসূচি যোগ করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* =======================================================
          MODAL 1: ADD NEW PROGRAMME
         ======================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleAddProgramme}
            className="max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[92vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <MinbarIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    নতুন দ্বীনি কর্মসূচি যুক্ত করুন
                  </h3>
                  <p className="text-xs text-[#17211F]/60">স্থান, ঠিকানা, ম্যাপস লোকেশন ও যোগাযোগের বিবরণ লিপিবদ্ধ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কর্মসূচির শিরোনাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: বার্ষিক ইসলামী যুব সম্মেলন ২০২৬"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] focus:outline-hidden text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  কর্মসূচির ধরণ
                </label>
                <select
                  value={programmeType}
                  onChange={(e) => setProgrammeType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] bg-white text-[#17211F]"
                >
                  <option value="পাবলিক লেকচার">পাবলিক লেকচার / বয়ান</option>
                  <option value="ইসলামী সম্মেলন">ইসলামী সম্মেলন / কনফারেন্স</option>
                  <option value="সিম্পোজিয়াম / সেমিনার">সিম্পোজিয়াম / সেমিনার</option>
                  <option value="আলোচনা সভা">আলোচনা সভা / মতবিনিময়</option>
                  <option value="টিভি / মিডিয়া টক">টিভি / মিডিয়া টক</option>
                  <option value="ওয়েবিনার / অনলাইন">ওয়েবিনার / অনলাইন</option>
                  <option value="প্রাতিষ্ঠানিক বক্তব্য">প্রাতিষ্ঠানিক বক্তব্য</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শ্রোতা বা শিক্ষার্থী সমাজ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিশ্ববিদ্যালয়ের শিক্ষার্থী ও সাধারণ জনতা"
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">শুরুর সময়</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">সমাপ্তির সময়</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            {/* ঠিকানা ও ভেন্যু সেকশন */}
            <div className="p-3.5 bg-[#F7F9F7] rounded-2xl border border-[#E4EBE8] space-y-3">
              <span className="text-xs font-bold text-[#063F35] flex items-center gap-1.5">
                <MapPin size={14} className="text-[#00A878]" />
                ঠিকানা ও ভৌগোলিক অবস্থান (Location)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    স্থানের নাম বা অডিটোরিয়াম / ভেন্যু *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সেন্ট্রাল অডিটোরিয়াম, ঢাকা বিশ্ববিদ্যালয়"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    এলাকা / জেলা / শহর
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: শাহবাগ, ঢাকা"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                  গুগল ম্যাপস লিংক (Google Maps URL)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                />
              </div>
            </div>

            {/* যোগাযোগের বিবরণ সেকশন */}
            <div className="p-3.5 bg-[#F7F9F7] rounded-2xl border border-[#E4EBE8] space-y-3">
              <span className="text-xs font-bold text-[#063F35] flex items-center gap-1.5">
                <User size={14} className="text-[#00A878]" />
                যোগাযোগ ও আয়োজক বিবরণ (Contact Details)
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                  দায়িত্বপ্রাপ্ত সমন্বয়কারী বা আয়োজকের নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মাওলানা আব্দুর রহমান (সেক্রেটারি)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    মোবাইল / ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="+৮৮০১৭..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    হোয়াটসঅ্যাপ নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="+৮৮০১৭... (হোয়াটসঅ্যাপ)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                নির্ধারিত বিষয়বস্তু
              </label>
              <input
                type="text"
                placeholder="যেমন: আধুনিক যুগে নৈতিক সংকট উত্তরণে ইসলামের ভূমিকা"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                বিস্তারিত বিবরণ বা কর্মসূচি নোট
              </label>
              <textarea
                rows={2}
                placeholder="কর্মসূচির বিস্তারিত কর্মসূচি, আয়োজক প্রতিষ্ঠানের নির্দেশনা বা বিশেষ কোনো মন্তব্য..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            {/* Checklist options */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#17211F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={prepRequired}
                  onChange={(e) => setPrepRequired(e.target.checked)}
                  className="rounded text-[#063F35]"
                />
                বক্তব্যের প্রস্তুতি তালিকা প্রয়োজন
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#17211F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={travelRequired}
                  onChange={(e) => setTravelRequired(e.target.checked)}
                  className="rounded text-[#063F35]"
                />
                যাতায়াত ও প্রস্থান ব্যবস্থা প্রয়োজন
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'কর্মসূচি যোগ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 2: EDIT PROGRAMME
         ======================================================= */}
      {programmeToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleUpdateProgramme}
            className="max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[92vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    কর্মসূচির তথ্য সম্পাদনা
                  </h3>
                  <p className="text-xs text-[#17211F]/60">স্থান, ঠিকানা, ম্যাপস ও যোগাযোগ বিবরণ পরিবর্তন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProgrammeToEdit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কর্মসূচির শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] focus:outline-hidden text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  কর্মসূচির ধরণ
                </label>
                <select
                  value={programmeType}
                  onChange={(e) => setProgrammeType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] bg-white text-[#17211F]"
                >
                  <option value="পাবলিক লেকচার">পাবলিক লেকচার / বয়ান</option>
                  <option value="ইসলামী সম্মেলন">ইসলামী সম্মেলন / কনফারেন্স</option>
                  <option value="সিম্পোজিয়াম / সেমিনার">সিম্পোজিয়াম / সেমিনার</option>
                  <option value="আলোচনা সভা">আলোচনা সভা / মতবিনিময়</option>
                  <option value="টিভি / মিডিয়া টক">টিভি / মিডিয়া টক</option>
                  <option value="ওয়েবিনার / অনলাইন">ওয়েবিনার / অনলাইন</option>
                  <option value="প্রাতিষ্ঠানিক বক্তব্য">প্রাতিষ্ঠানিক বক্তব্য</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শ্রোতা বা শিক্ষার্থী সমাজ
                </label>
                <input
                  type="text"
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">শুরুর সময়</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">সমাপ্তির সময়</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            {/* ঠিকানা ও ভেন্যু সেকশন */}
            <div className="p-3.5 bg-[#F7F9F7] rounded-2xl border border-[#E4EBE8] space-y-3">
              <span className="text-xs font-bold text-[#063F35] flex items-center gap-1.5">
                <MapPin size={14} className="text-[#00A878]" />
                ঠিকানা ও ভৌগোলিক অবস্থান (Location)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    স্থানের নাম বা অডিটোরিয়াম / ভেন্যু *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    এলাকা / জেলা / শহর
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                  গুগল ম্যাপস লিংক (Google Maps URL)
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                />
              </div>
            </div>

            {/* যোগাযোগের বিবরণ সেকশন */}
            <div className="p-3.5 bg-[#F7F9F7] rounded-2xl border border-[#E4EBE8] space-y-3">
              <span className="text-xs font-bold text-[#063F35] flex items-center gap-1.5">
                <User size={14} className="text-[#00A878]" />
                যোগাযোগ ও আয়োজক বিবরণ (Contact Details)
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                  দায়িত্বপ্রাপ্ত সমন্বয়কারী বা আয়োজকের নাম
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    মোবাইল / ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#17211F] mb-1">
                    হোয়াটসঅ্যাপ নম্বর
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                নির্ধারিত বিষয়বস্তু
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  স্ট্যাটাস
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="CONFIRMED">নিশ্চিত (Confirmed)</option>
                  <option value="PENDING">অপেক্ষমাণ (Pending)</option>
                  <option value="INVITED">আমন্ত্রণ প্রাপ্ত (Invited)</option>
                  <option value="COMPLETED">সম্পন্ন (Completed)</option>
                  <option value="CANCELLED">স্থগিত (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  বিশেষ নোট
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                বিস্তারিত বিবরণ
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            {/* Checklist options */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#17211F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={prepRequired}
                  onChange={(e) => setPrepRequired(e.target.checked)}
                  className="rounded text-[#063F35]"
                />
                বক্তব্যের প্রস্তুতি তালিকা প্রয়োজন
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#17211F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={travelRequired}
                  onChange={(e) => setTravelRequired(e.target.checked)}
                  className="rounded text-[#063F35]"
                />
                যাতায়াত ও প্রস্থান ব্যবস্থা প্রয়োজন
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setProgrammeToEdit(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'হালনাগাদ সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 3: CONFIRM DELETE PROGRAMME
         ======================================================= */}
      {programmeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold">কর্মসূচি মুছে ফেলা</h3>
                <p className="text-xs text-[#17211F]/60">এই সিদ্ধান্তটি অপরিবর্তনযোগ্য</p>
              </div>
            </div>

            <p className="text-xs text-[#17211F]/80 leading-relaxed bg-[#F7F9F7] p-3 rounded-xl border border-[#E4EBE8]">
              আপনি কি নিশ্চিত যে আপনি <strong className="text-rose-700">{programmeToDelete.title}</strong> কর্মসূচি এবং এর সাথে যুক্ত সমস্ত প্রস্তুতি টাস্ক স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setProgrammeToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDeleteProgramme}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl cursor-pointer shadow-xs transition"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 4: ADD PREPARATION TASK
         ======================================================= */}
      {prepModalProgrammeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleAddPrepTask}
            className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#00A878]" />
                <h3 className="text-base font-bold text-[#17211F]">
                  নতুন প্রস্তুতি টাস্ক যোগ করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPrepModalProgrammeId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কী প্রস্তুতি নিতে হবে? *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: সংশ্লিষ্ট বিষয়ের মূল রেফারেন্স ও হাদিস নোট প্রস্তুত"
                value={newPrepTitle}
                onChange={(e) => setNewPrepTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPrepModalProgrammeId(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                টাস্ক যোগ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
