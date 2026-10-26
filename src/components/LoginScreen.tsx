/**
 * Private Studio Access Gate
 * Enforces authenticated owner access to Siracusa Labs AI Landing Studio.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Shield, Lock, ArrowRight, Sparkles, Building, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('mattialacanna@gmail.com');
  const [pin, setPin] = useState('siracusa2026');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await login(email, pin);
    } catch (err: any) {
      setLocalError(err.message || 'Accesso negato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <header className="relative z-10 px-8 py-6 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black text-sm tracking-wider shadow-lg shadow-amber-500/10">
            SL
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide text-white uppercase flex items-center gap-2">
              SIRACUSA LABS
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/20">
                PROD STUDIO
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">AI Landing Studio v2.6</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Accesso Riservato Proprietario</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#0D121D] border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/80 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Autenticazione Studio</h1>
                <p className="text-xs text-slate-400">Inserisci le credenziali di operatore autorizzato</p>
              </div>
            </div>

            {(localError || error) && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Email Proprietario Autorizzato
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                    placeholder="mattialacanna@gmail.com"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Account titolare registrato: <span className="text-slate-300">mattialacanna@gmail.com</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  PIN di Accesso / Studio Secret
                </label>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  placeholder="Inserisci PIN o Studio Secret"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Accedi a AI Landing Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Backend & Cloudflare Ready
              </span>
              <span>Siracusa Labs &copy; 2026</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-800/40">
        AI Landing Studio &mdash; Ambiente privato per la generazione di landing Astro e pubblicazione Cloudflare Pages
      </footer>
    </div>
  );
};
