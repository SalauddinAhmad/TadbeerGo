import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  MapPin,
  Plus,
  Compass,
  Copy,
  Check,
  X
} from 'lucide-react';
import { MosqueIcon } from '../../components/icons/IslamicIcons';
import { Contact, Mosque } from '../../types';
import { api } from '../../api/client';
import { toBengaliDigits } from '../../utils/bengali';

export const ContactsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'mosques'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Add Contact Modal
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [organization, setOrganization] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Add Mosque Modal
  const [isAddMosqueOpen, setIsAddMosqueOpen] = useState(false);
  const [mosqueName, setMosqueName] = useState('');
  const [mosqueAddress, setMosqueAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [mutawalli, setMutawalli] = useState('');
  const [mosquePhone, setMosquePhone] = useState('');
  const [isSubmittingMosque, setIsSubmittingMosque] = useState(false);

  const fetchData = async () => {
    try {
      if (activeTab === 'contacts') {
        const query = searchQuery ? `?q=${searchQuery}` : '';
        const res = await api.get<{ contacts: Contact[] }>(`/contacts${query}`);
        setContacts(res.contacts || []);
      } else {
        const query = searchQuery ? `?q=${searchQuery}` : '';
        const res = await api.get<{ mosques: Mosque[] }>(`/mosques${query}`);
        setMosques(res.mosques || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery]);

  const handleCopyPhone = (ph: string) => {
    navigator.clipboard.writeText(ph);
    setCopiedPhone(ph);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    setIsSubmittingContact(true);
    try {
      await api.post('/contacts', {
        name: contactName,
        designation: organization ? `${designation} • ${organization}` : designation,
        phone,
        whatsapp: whatsapp || phone,
        address: contactAddress,
        notes,
      });
      setIsAddContactOpen(false);
      setContactName('');
      setDesignation('');
      setOrganization('');
      setContactAddress('');
      setPhone('');
      setWhatsapp('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'পরিচিতি সংরক্ষণ করা যায়নি');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleCreateMosque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mosqueName.trim()) return;

    setIsSubmittingMosque(true);
    try {
      await api.post('/mosques', {
        name: mosqueName,
        address: mosqueAddress,
        district: district || 'ঢাকা',
        contact_person: mutawalli,
        phone: mosquePhone,
      });
      setIsAddMosqueOpen(false);
      setMosqueName('');
      setMosqueAddress('');
      setMutawalli('');
      setMosquePhone('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'মসজিদ সংরক্ষণ করা যায়নি');
    } finally {
      setIsSubmittingMosque(false);
    }
  };

  return (
    <div className="space-y-6 font-bengali">
      {/* 1. Header & Switcher Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E4EBE8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex rounded-2xl bg-[#F7F9F7] p-1.5 border border-[#E4EBE8]">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-[#063F35] text-white shadow-xs'
                  : 'text-[#17211F]/70 hover:text-[#17211F]'
              }`}
            >
              <Users size={15} />
              <span>গুরুত্বপূর্ণ ব্যক্তিবর্গ ({toBengaliDigits(contacts.length)})</span>
            </button>
            <button
              onClick={() => setActiveTab('mosques')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'mosques'
                  ? 'bg-[#063F35] text-white shadow-xs'
                  : 'text-[#17211F]/70 hover:text-[#17211F]'
              }`}
            >
              <MosqueIcon size={15} className={activeTab === 'mosques' ? 'text-white' : 'text-[#063F35]'} />
              <span>মসজিদ ও কমপ্লেক্স ({toBengaliDigits(mosques.length)})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3.5 top-3 text-[#17211F]/50" />
            <input
              type="text"
              placeholder={activeTab === 'contacts' ? 'নাম, পদবী বা প্রতিষ্ঠান খুঁজুন...' : 'মসজিদের নাম, এলাকা খুঁজুন...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00A878] font-medium text-[#17211F] placeholder:text-[#17211F]/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#17211F]/50 hover:text-[#17211F] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Add Button */}
          {activeTab === 'contacts' ? (
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#063F35] hover:bg-[#042F28] text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ নতুন পরিচিতি</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddMosqueOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#063F35] hover:bg-[#042F28] text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ নতুন মসজিদ</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Tabs */}
      {activeTab === 'contacts' ? (
        /* CONTACTS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => {
            const initials = c.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2);

            const waNumber = (c.whatsapp || c.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[#E4EBE8] hover:border-[#00A878]/40 hover:shadow-md transition bg-white space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#E8F5F0] text-[#063F35] flex items-center justify-center font-bold text-sm tracking-wider shrink-0 border border-[#00A878]/20 shadow-2xs">
                    {initials || 'মা'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#17211F] truncate">
                      {c.name}
                    </h3>
                    <p className="text-xs text-[#17211F]/60 truncate mt-0.5">
                      {c.designation || 'বিশিষ্ট আলেম / শুভাকাঙ্ক্ষী'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#17211F]/70 bg-[#F7F9F7] p-3 rounded-xl border border-[#E4EBE8]">
                  {c.phone && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[#17211F] font-medium">
                        <Phone size={13} className="text-[#063F35]" />
                        {toBengaliDigits(c.phone)}
                      </span>
                      <button
                        onClick={() => handleCopyPhone(c.phone!)}
                        className="text-[10px] text-[#17211F]/60 hover:text-[#063F35] transition cursor-pointer"
                        title="নম্বর কপি করুন"
                      >
                        {copiedPhone === c.phone ? <Check size={12} className="text-[#00A878]" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                  {c.whatsapp && (
                    <div className="flex items-center gap-2 text-[#17211F] font-medium">
                      <MessageSquare size={13} className="text-[#00A878]" />
                      <span>হোয়াটসঅ্যাপ: {toBengaliDigits(c.whatsapp)}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-start gap-2 text-[#17211F]/80 pt-1 border-t border-[#E4EBE8]/60">
                      <MapPin size={13} className="text-[#00A878] shrink-0 mt-0.5" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                  {c.notes && (
                    <p className="text-[10px] text-[#063F35] bg-[#E8F5F0]/70 px-2 py-1 rounded-md border border-[#00A878]/20 truncate">
                      {c.notes}
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="flex-1 py-2 bg-[#F7F9F7] hover:bg-[#E8F5F0] text-[#063F35] border border-[#E4EBE8] rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                    >
                      <Phone size={12} /> কল
                    </a>
                  )}
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}?text=Assalamu%20Alaikum%20wa%20Rahmatullah`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <MessageSquare size={12} /> হোয়াটসঅ্যাপ
                    </a>
                  )}
                  {c.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address + (c.address.includes('ঢাকা') ? '' : ' ঢাকা'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#F7F9F7] hover:bg-[#E8F5F0] text-[#063F35] border border-[#E4EBE8] rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 shadow-2xs"
                      title="গুগল ম্যাপসে অবস্থান দেখুন"
                    >
                      <Compass size={14} className="text-[#00A878]" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {contacts.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#17211F]/50 bg-white rounded-2xl border border-dashed border-[#E4EBE8]">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs">কোনো পরিচিতি পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      ) : (
        /* MOSQUES GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mosques.map((m) => {
            const mapQuery = encodeURIComponent(`${m.name} ${m.address || ''} ${m.district || ''}`);
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl border border-[#E4EBE8] hover:border-[#00A878]/40 hover:shadow-md transition bg-white space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#063F35] text-white flex items-center justify-center shrink-0 border border-[#00A878]/30 shadow-xs">
                    <MosqueIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#17211F] truncate">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#063F35] font-semibold truncate mt-0.5">
                      {m.district || 'ঢাকা'} এলাকা
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#17211F]/70 bg-[#E8F5F0]/40 p-3 rounded-xl border border-[#00A878]/15">
                  <p className="flex items-start gap-2">
                    <MapPin size={13} className="text-[#063F35] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{m.address || 'ঠিকানা সংরক্ষিত নেই'}</span>
                  </p>
                  {m.contact_person && (
                    <p className="flex items-center gap-2 pt-1 border-t border-[#E4EBE8] text-[#17211F]">
                      <Users size={13} className="text-[#063F35] shrink-0" />
                      <span>মুতাওয়াল্লী / সভাপতি: <strong className="text-[#17211F]">{m.contact_person}</strong></span>
                    </p>
                  )}
                  {m.phone && (
                    <p className="flex items-center gap-2 text-[#17211F]">
                      <Phone size={13} className="text-[#063F35] shrink-0" />
                      <span>{toBengaliDigits(m.phone)}</span>
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-[#F7F9F7] hover:bg-[#E8F5F0] text-[#063F35] border border-[#E4EBE8] rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                  >
                    <Compass size={12} /> গুগল ম্যাপস
                  </a>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="py-2 px-4 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Phone size={12} /> কল
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {mosques.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#17211F]/50 bg-white rounded-2xl border border-dashed border-[#E4EBE8]">
              <MosqueIcon size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs">এখনো কোনো মসজিদ যুক্ত করা হয়নি।</p>
            </div>
          )}
        </div>
      )}

      {/* =======================================================
          MODAL: ADD VIP CONTACT
         ======================================================= */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateContact}
            className="max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    নতুন পরিচিতি যুক্ত করুন
                  </h3>
                  <p className="text-xs text-[#17211F]/60">আলেম, আয়োজক বা শুভাকাঙ্ক্ষীর বিবরণ সংরক্ষণ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                পূর্ণ নাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: ড. মুহাম্মদ জাকারিয়া"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] focus:outline-hidden text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  পদবী / দ্বীনি পরিচয়
                </label>
                <input
                  type="text"
                  placeholder="যেমন: খতিব / অধ্যাপক"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  প্রতিষ্ঠান / মসজিদ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বায়তুল মোকাররম কমিটি"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  ফোন নম্বর
                </label>
                <input
                  type="text"
                  placeholder="+৮৮০১৭..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  হোয়াটসঅ্যাপ নম্বর
                </label>
                <input
                  type="text"
                  placeholder="+৮৮০১৭..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                ঠিকানা ও এলাকা
              </label>
              <input
                type="text"
                placeholder="যেমন: ধানমন্ডি ২৭, ঢাকা"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                বিশেষ নোট / রেফারেন্স
              </label>
              <textarea
                rows={2}
                placeholder="গুরুত্বপূর্ণ প্রেক্ষাপট, সম্পর্ক বা বৈঠকের নোট..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingContact}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmittingContact ? 'সংরক্ষণ করা হচ্ছে...' : 'পরিচিতি সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL: ADD MOSQUE SANCTUARY
         ======================================================= */}
      {isAddMosqueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateMosque}
            className="max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <MosqueIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    মসজিদ ও কমপ্লেক্স নিবন্ধন করুন
                  </h3>
                  <p className="text-xs text-[#17211F]/60">অবস্থান, ঠিকানা ও মসজিদ কমিটির যোগাযোগের তথ্য লিপিবদ্ধ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMosqueOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                মসজিদের নাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: সোবহানবাগ জামে মসজিদ"
                value={mosqueName}
                onChange={(e) => setMosqueName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] focus:outline-hidden text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  জেলা / এলাকা *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঢাকা"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  মুতাওয়াল্লী / সভাপতি
                </label>
                <input
                  type="text"
                  placeholder="সেক্রেটারি / সভাপতি"
                  value={mutawalli}
                  onChange={(e) => setMutawalli(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                পূর্ণ ঠিকানা / ল্যান্ডমার্ক
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: ধানমন্ডি ২৭, সোবহানবাগ, ঢাকা ১২০৭"
                value={mosqueAddress}
                onChange={(e) => setMosqueAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                মসজিদ বা দায়িত্বশীল ব্যক্তির ফোন
              </label>
              <input
                type="text"
                placeholder="+৮৮০১৭..."
                value={mosquePhone}
                onChange={(e) => setMosquePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsAddMosqueOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingMosque}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmittingMosque ? 'সংরক্ষণ করা হচ্ছে...' : 'মসজিদ সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
