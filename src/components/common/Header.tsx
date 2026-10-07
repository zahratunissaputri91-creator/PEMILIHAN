import React, { useState, useEffect } from 'react';
import { School, ElectionPeriod, UserRole } from '../../types';
import { getSupabaseConfig } from '../../lib/supabase';
import {
  Vote,
  TrendingUp,
  Users,
  ShieldAlert,
  FileCode2,
  Building,
  RotateCcw,
  Cloud,
  Database
} from 'lucide-react';

interface Props {
  school: School;
  activePeriod: ElectionPeriod;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenPrd: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<Props> = ({
  school,
  activePeriod,
  currentRole,
  onSelectRole,
  onOpenPrd,
  onResetDemo
}) => {
  const [supabaseActive, setSupabaseActive] = useState(false);

  useEffect(() => {
    const checkSupabase = () => {
      const cfg = getSupabaseConfig();
      setSupabaseActive(cfg.isEnabled && Boolean(cfg.url && cfg.anonKey));
    };
    checkSupabase();
    window.addEventListener('epilketos_supabase_config_change', checkSupabase);
    return () => window.removeEventListener('epilketos_supabase_config_change', checkSupabase);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">SISTEM E-PILKETOS / E-PILKOSIM DIGITAL RESMI</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-300">{school.name}</span>
          {supabaseActive && (
            <span className="ml-2 px-2 py-0.2 bg-emerald-950 text-emerald-400 rounded-md font-mono text-[10px] border border-emerald-800 flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Supabase Cloud
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenPrd}
            className="text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Dokumen PRD & Schema</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onResetDemo}
            className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
            title="Reset data ke default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={() => onSelectRole('publik')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-base tracking-tight">
                  E-OSIS & MPK
                </span>
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded uppercase">
                  Digital
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
                {school.name}
              </p>
            </div>
          </div>

          {/* Active Period pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-700">{activePeriod.academicYear}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">({activePeriod.status})</span>
          </div>
        </div>

        {/* Role switcher navigation buttons */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto max-w-full">
          <button
            onClick={() => onSelectRole('publik')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentRole === 'publik'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Quick Count</span>
          </button>

          <button
            onClick={() => onSelectRole('siswa')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentRole === 'siswa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Bilik Suara (Siswa)</span>
          </button>

          <button
            onClick={() => onSelectRole('panitia')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentRole === 'panitia'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Panitia (DPT)</span>
          </button>

          <button
            onClick={() => onSelectRole('admin')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentRole === 'admin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Sekolah</span>
          </button>
        </div>
      </div>
    </header>
  );
};
