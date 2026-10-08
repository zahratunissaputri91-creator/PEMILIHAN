import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured
} from '../../lib/supabase';
import { cloudSync } from '../../lib/supabaseSync';
import { SupabaseConfig } from '../../types';
import {
  Cloud,
  X,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Download,
  Upload
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted?: (msg: string) => void;
}

export const CloudSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSyncCompleted
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [activeTab, setActiveTab] = useState<'SHARE' | 'CONNECT' | 'SYNC'>('SHARE');
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false
  });
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const shareLink = cloudSync.getShareableConnectLink();

  useEffect(() => {
    if (isOpen) {
      const cur = getSupabaseConfig();
      setConfig(cur);
      if (cur.isEnabled && cur.url && cur.anonKey) {
        const link = cloudSync.getShareableConnectLink();
        if (link) {
          QRCode.toDataURL(link, { width: 220, margin: 2 })
            .then(url => setQrCodeDataUrl(url))
            .catch(() => {});
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    const res = await testSupabaseConnection(config.url, config.anonKey);
    setTestStatus({ loading: false, success: res.success, message: res.message });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(config);
    setNotice('Konfigurasi Supabase berhasil disimpan!');
    setTimeout(() => setNotice(null), 3000);

    // If connected, automatically generate QR code
    if (config.url && config.anonKey && config.isEnabled) {
      const link = cloudSync.getShareableConnectLink();
      QRCode.toDataURL(link, { width: 220, margin: 2 })
        .then(url => setQrCodeDataUrl(url))
        .catch(() => {});

      // Auto pull
      handlePullData();
    }
  };

  const handlePullData = async () => {
    setIsPulling(true);
    setNotice('Sedang mengunduh data terbaru dari Supabase Cloud...');
    const res = await cloudSync.pullAll();
    setIsPulling(false);
    if (res.success) {
      setNotice(res.message);
      if (onSyncCompleted) onSyncCompleted(res.message);
    } else {
      setNotice(`Gagal menarik data: ${res.message}`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handlePushData = async () => {
    setIsPushing(true);
    setNotice('Sedang mengunggah data lokal ke Supabase Cloud...');
    const res = await cloudSync.pushAll();
    setIsPushing(false);
    if (res.success) {
      setNotice(res.message);
      if (onSyncCompleted) onSyncCompleted(res.message);
    } else {
      setNotice(`Gagal mengunggah: ${res.message}`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
            }`}>
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Sinkronisasi Supabase Cloud
                </h3>
                {isConnected ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    Terhubung
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                    Mode Lokal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Hubungkan PC Bilik Suara, Admin, dan Quick Count ke database PostgreSQL terpusat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notice Banner */}
        {notice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('SHARE')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SHARE'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Sambungkan PC Lain (Bilik Suara)</span>
          </button>
          <button
            onClick={() => setActiveTab('CONNECT')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CONNECT'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Setup di PC Ini</span>
          </button>
          <button
            onClick={() => setActiveTab('SYNC')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SYNC'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tarik / Unggah Data</span>
          </button>
        </div>

        {/* TAB 1: SHARE KE PC LAIN */}
        {activeTab === 'SHARE' && (
          <div className="space-y-4 text-xs">
            {isConnected ? (
              <>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Supabase Siap Digunakan Antar-PC!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    Buka tautan ini di PC/Laptop <strong>Bilik Suara</strong>, <strong>Laptop Panitia</strong>, atau <strong>Layar Proyektor Quick Count</strong>. PC lain akan langsung terhubung ke database yang sama tanpa perlu login atau memasukkan API key!
                  </p>
                </div>

                {/* Share Link Box */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold">
                    Tautan Cepat Sambungkan PC Lain:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareLink}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-700 select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeDataUrl && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code Sambung Supabase"
                      className="w-32 h-32 rounded-xl bg-white p-2 shadow-xs border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 justify-center sm:justify-start">
                        <QrCode className="w-4 h-4 text-indigo-600" />
                        <span>Scan QR Code (Tablet / Smartphone)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Jika menggunakan tablet atau smartphone sebagai bilik suara, cukup arahkan kamera ke QR code ini untuk otomatis tersambung.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-800">Supabase Cloud Belum Dikonfigurasi di PC Ini</h4>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                  Untuk membagikan koneksi ke PC lain, silakan isi Project URL dan Anon Key di tab <strong>"Setup di PC Ini"</strong> terlebih dahulu.
                </p>
                <button
                  onClick={() => setActiveTab('CONNECT')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Buka Setup Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONNECT MANUAL DI PC INI */}
        {activeTab === 'CONNECT' && (
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzprojectid.supabase.co"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value.trim() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Anon (Public API) Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value.trim() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
              <span>Aktifkan Penyimpanan Supabase Cloud PostgreSQL</span>
            </label>

            {/* Test Status Feedback */}
            {testStatus.message && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                testStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {testStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                <span>{testStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus.loading || !config.url || !config.anonKey}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus.loading ? 'animate-spin' : ''}`} />
                <span>{testStatus.loading ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Simpan & Sambungkan</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SINKRONISASI MANUAL */}
        {activeTab === 'SYNC' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Tarik Data Terbaru dari Supabase Cloud (PULL)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Gunakan saat baru membuka website di laptop lain agar seluruh DPT, kandidat, dan suara ter-update sama persis dengan yang ada di server cloud.
                </p>
              </div>

              <button
                onClick={handlePullData}
                disabled={isPulling || !isConnected}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                <span>{isPulling ? 'Mengunduh Data...' : 'Tarik Data Sekarang (Sinkronkan)'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Unggah Data Lokal ke Supabase Cloud (PUSH)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Unggah seluruh data DPT, kandidat, dan konfigurasi saat ini dari komputer ini ke Supabase Cloud agar dapat diakses PC lain.
                </p>
              </div>

              <button
                onClick={handlePushData}
                disabled={isPushing || !isConnected}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
                <span>{isPushing ? 'Mengunggah Data...' : 'Unggah Data Lokal ke Cloud'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
