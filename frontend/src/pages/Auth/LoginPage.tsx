import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { MosqueDetailedIcon, RubElHizbIcon } from '../../components/icons/IslamicIcons';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@mokhterahmad.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#05211B] via-[#031A15] to-[#010D0B] font-bengali">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-1/4 -left-20 w-[26rem] h-[26rem] bg-[#00A878]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-emerald-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Islamic Mosque Silhouette Background */}
      <div className="absolute inset-0 flex items-center justify-center text-white/[0.02] pointer-events-none select-none">
        <MosqueDetailedIcon size={560} />
      </div>

      {/* Smart, Frosted Glass Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 bg-white/[0.07] backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/70 text-white">
        
        {/* =========================================================================
            CREATIVE SCHOLAR PORTRAIT & BRAND HEADER
           ========================================================================= */}
        <div className="relative z-10 flex flex-col items-center text-center mb-8">
          
          {/* Portrait Container with Ambient Halo & Islamic Star Badge */}
          <div className="relative mb-5 group">
            {/* Ambient emerald breathing halo */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#00A878] via-emerald-400 to-[#00A878] rounded-full blur-md opacity-35 group-hover:opacity-60 transition duration-700" />
            
            {/* Double Border Circular Frame */}
            <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#00A878] via-emerald-200/40 to-white/60 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-emerald-950">
                <img
                  src="/shaikh-portrait.jpg"
                  alt="শায়খ মোখতার আহমাদ"
                  className="w-full h-full object-cover object-top hover:scale-110 transition duration-700"
                />
              </div>
            </div>

            {/* Verified Floating Badge */}
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00A878] text-white flex items-center justify-center border-2 border-[#05211B] shadow-lg">
              <CheckCircle2 size={15} strokeWidth={2.8} />
            </div>
          </div>

          {/* Product Brand: Only TadbeerGo Name (No logo icon) */}
          <div className="flex items-center justify-center">
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight font-sans text-white drop-shadow-sm">
              Tadbeer<span className="text-[#00A878] font-black">Go</span>
            </h1>
          </div>

          {/* Scholar Identification Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-200/90 shadow-2xs">
            <RubElHizbIcon size={12} className="text-[#00A878]" />
            <span>শায়খ মোখতার আহমাদ</span>
            <span className="text-white/30">·</span>
            <span className="text-emerald-300/70 text-[11px]">ডিজিটাল সহকারী</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="relative z-10 mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs rounded-xl font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-100 mb-1.5">
              ইমেইল
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 text-xs bg-white/10 border border-white/15 rounded-xl text-white placeholder-emerald-200/40 focus:outline-none focus:border-[#00A878] focus:bg-white/15 focus:ring-2 focus:ring-[#00A878]/30 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-100">
                পাসওয়ার্ড
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-emerald-300/70 hover:text-emerald-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'লুকান' : 'দেখুন'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs bg-white/10 border border-white/15 rounded-xl text-white placeholder-emerald-200/40 focus:outline-none focus:border-[#00A878] focus:bg-white/15 focus:ring-2 focus:ring-[#00A878]/30 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-5 bg-gradient-to-r from-[#00A878] to-[#008f66] hover:from-[#00b884] hover:to-[#009e71] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>প্রবেশ করা হচ্ছে...</span>
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight size={14} className="text-emerald-100" />
              </>
            )}
          </button>
        </form>

        {/* Quick Role Switchers */}
        <div className="relative z-10 mt-8 pt-5 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-emerald-200/60">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@mokhterahmad.com');
              setPassword('password123');
            }}
            className="hover:text-white font-semibold transition cursor-pointer"
          >
            স্কলার
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setEmail('ps@mokhterahmad.com');
              setPassword('password123');
            }}
            className="hover:text-white font-semibold transition cursor-pointer"
          >
            পিএস
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
