import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Bell,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  Download
} from 'lucide-react';
import {
  isIOSDevice,
  isStandaloneApp,
  canInstallPWA,
  promptPWAInstall,
  getNotificationPermission,
  requestPhoneNotificationPermission,
  sendPhoneNotification
} from '../../utils/pwaNotification';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setIsInstalled(isStandaloneApp());
    setInstallable(canInstallPWA());
    setPermission(getNotificationPermission());

    const handleInstallable = () => setInstallable(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallable(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isIOS) return;
    const success = await promptPWAInstall();
    if (success) {
      setIsInstalled(true);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPhoneNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  const handleSendTestAlert = async () => {
    setTestingNotification(true);
    await sendPhoneNotification(
      'আসন্ন খুতবাহ রিমাইন্ডার 🕋',
      'আগামীকাল জুমুআ: সোবহানবাগ জামে মসজিদ, ধানমন্ডি। খুতবাহর প্রস্তুতি নোটস সম্পন্ন হয়েছে।'
    );
    setTimeout(() => setTestingNotification(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-bengali">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#E4EBE8] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col safe-area-bottom">
        {/* Grab bar for mobile */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4EBE8] bg-[#F7F9F7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#063F35] text-white flex items-center justify-center shadow-xs">
              <Smartphone size={20} className="text-[#00A878]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#17211F]">
                মোবাইলে ইনস্টল ও নোটিফিকেশন
              </h3>
              <p className="text-xs text-[#17211F]/60">হোমস্ক্রিন ইনস্টল ও তাৎক্ষণিক ফোন রিমাইন্ডার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#E4EBE8] rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Top Banner explaining PWA without app store */}
          <div className="p-4 rounded-2xl bg-[#E8F5F0] border border-[#00A878]/20 flex items-start gap-3">
            <Sparkles size={18} className="text-[#063F35] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[#17211F]/80">
              <strong className="text-[#063F35] font-bold block text-sm">
                আধুনিক প্রোগ্রেসিভ ওয়েব অ্যাপ (PWA)
              </strong>
              <p className="leading-relaxed">
                অ্যাপ-স্টোরে খোঁজাখুঁজি ছাড়াই এটি সরাসরি আপনার অ্যান্ড্রয়েড বা আইফোনের হোমস্ক্রিনে অ্যাপ আকারে ইনস্টল হয়ে পূর্ণ স্ক্রিনে চলবে।
              </p>
            </div>
          </div>

          {/* Feature 1: Phone Notifications */}
          <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#17211F]">
                <Bell size={16} className="text-[#00A878]" />
                <span>ফোনে নোটিফিকেশন সতর্কতা</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  permission === 'granted'
                    ? 'bg-[#E8F5F0] text-[#063F35] border border-[#00A878]/20'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {permission === 'granted' ? 'সক্রিয়' : 'বন্ধ রয়েছে'}
              </span>
            </div>

            <p className="text-[#17211F]/70 leading-relaxed">
              আসন্ন জুমু'আ খুতবাহ, ক্লাসের ৩০ মিনিট আগের সতর্কবার্তা ও গুরুত্বপূর্ণ শিডিউলের সংকেত সরাসরি আপনার ফোনে নোটিফিকেশন আকারে পৌঁছে যাবে।
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {permission !== 'granted' ? (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Bell size={14} className="text-[#00A878]" />
                  <span>নোটিফিকেশন চালু করুন</span>
                </button>
              ) : (
                <button
                  onClick={handleSendTestAlert}
                  disabled={testingNotification}
                  className="px-4 py-2 bg-[#F7F9F7] hover:bg-[#E4EBE8] text-[#17211F] rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border border-[#E4EBE8]"
                >
                  <Sparkles size={14} className="text-[#00A878]" />
                  <span>{testingNotification ? 'পাঠানো হচ্ছে...' : 'টেস্ট নোটিফিকেশন পাঠান'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Feature 2: Mobile Installation (Android & iOS) */}
          <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#17211F]">
                <Smartphone size={16} className="text-[#063F35]" />
                <span>মোবাইল হোমস্ক্রিনে ইনস্টল</span>
              </div>
              {isInstalled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F5F0] text-[#063F35] flex items-center gap-1 border border-[#00A878]/20">
                  <CheckCircle2 size={11} className="text-[#00A878]" /> ইনস্টল করা আছে
                </span>
              )}
            </div>

            {isInstalled ? (
              <div className="p-3 bg-[#E8F5F0] rounded-xl border border-[#00A878]/20 text-[#063F35] flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-[#00A878] shrink-0" />
                <span>অ্যাপটি সফলভাবে ইনস্টল করা হয়েছে। হোমস্ক্রিন থেকে সরাসরি খুলুন।</span>
              </div>
            ) : isIOS ? (
              /* iOS Safari Visual Step-by-Step */
              <div className="space-y-2.5 bg-[#F7F9F7] p-3.5 rounded-2xl border border-[#E4EBE8]">
                <p className="font-bold text-[#17211F] text-xs">আইফোনে (iOS Safari) ইনস্টল করার নিয়ম:</p>
                <ol className="space-y-2 text-[#17211F]/80 list-none pl-0">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#063F35] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ১
                    </span>
                    <span>
                      সাফারি ব্রাউজারের নিচে থাকা <strong>Share (<Share2 size={12} className="inline mx-0.5 text-[#063F35]" />)</strong> বাটনে চাপ দিন।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#063F35] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ২
                    </span>
                    <span>
                      একটু নিচে স্ক্রল করে <strong>'Add to Home Screen' (<PlusSquare size={12} className="inline mx-0.5 text-[#063F35]" />)</strong> অপশনে চাপ দিন।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#063F35] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ৩
                    </span>
                    <span>
                      উপরে ডানপাশে <strong>'Add'</strong> চাপুন। আপনার হোমস্ক্রিনে শায়খ মোখতার আহমাদ অ্যাপ যুক্ত হয়ে যাবে।
                    </span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Android / Desktop Chrome 1-Click Install */
              <div className="space-y-3">
                <p className="text-[#17211F]/70 leading-relaxed">
                  অ্যান্ড্রয়েড বা ক্রোম ব্রাউজার থেকে নিচের বাটনে ক্লিক করে সহজেই ডিভাইসে ইনস্টল করতে পারেন:
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-xs"
                >
                  <Download size={15} className="text-[#00A878]" />
                  <span>ফোনে অ্যাপ ইনস্টল করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E4EBE8] bg-[#F7F9F7] flex items-center justify-between text-xs">
          <span className="text-[#17211F]/50 font-medium">শায়খ মোখতার আহমাদ ডিজিটাল সিস্টেম</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#E4EBE8] hover:bg-[#F7F9F7] rounded-xl font-bold text-[#17211F] cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
