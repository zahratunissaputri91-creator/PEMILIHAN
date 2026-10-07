import React, { useState, useEffect } from 'react';
import { db } from './lib/storage';
import { UserRole, School, ElectionPeriod } from './types';
import { Header } from './components/common/Header';
import { QuickCountDashboard } from './components/public/QuickCountDashboard';
import { VotingBooth } from './components/voting/VotingBooth';
import { PanitiaDashboard } from './components/panitia/PanitiaDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PrdArchitectureModal } from './components/prd/PrdArchitectureModal';
import { ShieldCheck, Vote, Heart } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('publik');
  const [school, setSchool] = useState<School>(db.getSchool());
  const [activePeriod, setActivePeriod] = useState<ElectionPeriod>(db.getActivePeriod());
  const [isPrdOpen, setIsPrdOpen] = useState(false);

  const refreshState = () => {
    setSchool(db.getSchool());
    setActivePeriod(db.getActivePeriod());
  };

  useEffect(() => {
    refreshState();
    const handleStorageChange = () => refreshState();
    window.addEventListener('epilketos_state_change', handleStorageChange);
    return () => window.removeEventListener('epilketos_state_change', handleStorageChange);
  }, []);

  const handleResetDemo = () => {
    db.resetToDefault();
    refreshState();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Bar - Hidden in student voting booth mode for clean dedicated kiosk */}
      {currentRole !== 'siswa' && (
        <Header
          school={school}
          activePeriod={activePeriod}
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          onOpenPrd={() => setIsPrdOpen(true)}
          onResetDemo={handleResetDemo}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentRole === 'publik' && (
          <QuickCountDashboard
            onNavigateToBooth={() => setCurrentRole('siswa')}
            onNavigateToPrd={() => setIsPrdOpen(true)}
          />
        )}

        {currentRole === 'siswa' && (
          <VotingBooth
            onBackToHome={() => setCurrentRole('publik')}
          />
        )}

        {currentRole === 'panitia' && (
          <PanitiaDashboard
            onBackToHome={() => setCurrentRole('publik')}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            onBackToHome={() => setCurrentRole('publik')}
          />
        )}
      </main>

      {/* PRD & Architecture Modal */}
      {isPrdOpen && (
        <PrdArchitectureModal
          onClose={() => setIsPrdOpen(false)}
        />
      )}

      {/* Footer - Sembunyikan saat siswa di bilik suara untuk tampilan bersih tanpa menu distraksi */}
      {currentRole !== 'siswa' && (
        <footer className="no-print bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <Vote className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800">
                {school.name}
              </span>
              <span>•</span>
              <span>E-{school.type} Digital v2.4 Enterprise</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Asas LUBER-JURDIL Terjamin
              </span>
              <span>•</span>
              <button
                onClick={() => setIsPrdOpen(true)}
                className="hover:text-indigo-600 underline font-medium cursor-pointer"
              >
                Dokumen PRD & Skema Database
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
