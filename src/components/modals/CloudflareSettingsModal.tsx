/**
 * Cloudflare Configuration Modal
 * Configures server-side Cloudflare Account ID and Pages API Token.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Cloud,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

interface CloudflareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareSettingsModal: React.FC<CloudflareSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [maskedToken, setMaskedToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [baseDomain, setBaseDomain] = useState('pages.dev');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; projectsCount?: number; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await api.getCloudflareSettings();
      setAccountId(data.accountId || '');
      setHasToken(data.hasToken);
      setMaskedToken(data.maskedToken || '');
      setBaseDomain(data.baseDomain || 'pages.dev');
    } catch (err: any) {
      console.error('Error loading Cloudflare settings:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setVerifyResult(null);
    try {
      await api.saveCloudflareSettings({
        accountId,
        apiToken: apiToken.trim() || undefined,
        baseDomain,
      });
      setStatusMessage('Credenziali Cloudflare salvate con successo sul server.');
      setApiToken('');
      await loadSettings();
    } catch (err: any) {
      setStatusMessage(`Errore durante il salvataggio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyCloudflare(accountId, apiToken.trim() || undefined);
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ valid: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0D121D] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#080B12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurazione Cloudflare Pages</h2>
              <p className="text-xs text-slate-400">Parametri server-side per deploy automatico dei progetti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-[#080B12] border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Conservazione Sicura Server-Side:</strong> Le credenziali Cloudflare sono salvate esclusivamente nel backend privato e non vengono mai trasmesse al client né incluse nel codice Astro esportato.
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Cloudflare Account ID *
              </label>
              <input
                type="text"
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="es. 3a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d"
                className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Disponibile nella barra laterale destra della dashboard Cloudflare.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Cloudflare Pages API Token *
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder={hasToken ? `Token salvato (${maskedToken}) - lascia vuoto per non modificare` : 'Inserisci API Token con permessi Cloudflare Pages'}
                className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Richiede permesso: <code className="text-amber-300">Cloudflare Pages: Edit</code></span>
                <a
                  href="https://dash.cloudflare.com/profile/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                >
                  Crea Token su Cloudflare <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Dominio Base Predefinito
              </label>
              <input
                type="text"
                value={baseDomain}
                onChange={(e) => setBaseDomain(e.target.value)}
                placeholder="pages.dev"
                className="w-full bg-[#080B12] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-slate-800 text-xs text-slate-200">
                {statusMessage}
              </div>
            )}

            {verifyResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  verifyResult.valid
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/30 text-red-200'
                }`}
              >
                {verifyResult.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Connessione Verificata!</strong> Token valido per l’account Cloudflare. Rilevati {verifyResult.projectsCount ?? 0} progetti Pages esistenti.
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Verifica fallita:</strong> {verifyResult.error}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={verifying || (!accountId && !hasToken)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {verifying ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Key className="w-3.5 h-3.5" />
                )}
                <span>Verifica Connessione</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                {loading ? 'Salvataggio...' : 'Salva Impostazioni'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
