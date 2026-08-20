import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  UserCheck,
  LogIn,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  claimUsername,
  recoverIdentity,
  checkUsernameAvailable
} from '../utils/userIdentity';
import type { UserIdentity } from '../types/game';

interface UsernameSetupProps {
  onIdentityReady: (identity: UserIdentity) => void;
}

type Tab = 'NEW' | 'RETURNING';
type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export const UsernameSetup: React.FC<UsernameSetupProps> = ({ onIdentityReady }) => {
  const [activeTab, setActiveTab] = useState<Tab>('NEW');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── NEW PLAYER state ──────────────────────────────────────────
  const [newUsername, setNewUsername]   = useState('');
  const [displayName, setDisplayName]   = useState('');
  const [pin, setPin]                   = useState('');
  const [confirmPin, setConfirmPin]     = useState('');
  const [showPin, setShowPin]           = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus>('idle');

  // ── RETURNING state ───────────────────────────────────────────
  const [retUsername, setRetUsername] = useState('');
  const [retPin, setRetPin]           = useState('');
  const [showRetPin, setShowRetPin]   = useState(false);

  // ── Debounced availability check ──────────────────────────────
  const checkAvailability = useCallback(async (value: string) => {
    const clean = value.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setAvailability(clean.length > 0 ? 'invalid' : 'idle');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(clean)) {
      setAvailability('invalid');
      return;
    }
    setAvailability('checking');
    const available = await checkUsernameAvailable(clean);
    setAvailability(available ? 'available' : 'taken');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkAvailability(newUsername), 500);
    return () => clearTimeout(timer);
  }, [newUsername, checkAvailability]);

  // ── Submit handlers ───────────────────────────────────────────
  const handleNewPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (pin !== confirmPin) { setErrorMsg('PINs do not match.'); return; }
    if (availability !== 'available') { setErrorMsg('Choose a valid, available username.'); return; }
    setIsLoading(true);
    const result = await claimUsername(newUsername.trim().toLowerCase(), displayName.trim(), pin);
    setIsLoading(false);
    if ('error' in result) setErrorMsg(result.error);
    else onIdentityReady(result.identity);
  };

  const handleReturningPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    const result = await recoverIdentity(retUsername.trim().toLowerCase(), retPin);
    setIsLoading(false);
    if ('error' in result) setErrorMsg(result.error);
    else onIdentityReady(result.identity);
  };

  const switchTab = (tab: Tab) => { setActiveTab(tab); setErrorMsg(''); };

  // ── Availability indicator ────────────────────────────────────
  const AvailabilityNote = () => {
    if (availability === 'idle')      return null;
    if (availability === 'checking')  return <span className="su-avail su-avail--checking"><Loader2 className="w-3 h-3 animate-spin" /> Checking…</span>;
    if (availability === 'available') return <span className="su-avail su-avail--ok"><CheckCircle2 className="w-3 h-3" /> Available</span>;
    if (availability === 'taken')     return <span className="su-avail su-avail--taken"><XCircle className="w-3 h-3" /> Already taken</span>;
    return <span className="su-avail su-avail--invalid"><AlertCircle className="w-3 h-3" /> Letters, numbers, underscores — min 3 chars</span>;
  };

  const pinMatch = confirmPin.length === 4 && confirmPin === pin;
  const pinMismatch = confirmPin.length === 4 && confirmPin !== pin;

  return (
    <div className="su-root">

      {/* Wordmark */}
      <div className="su-wordmark">
        <div className="su-wordmark-icon">
          <BookOpen className="w-5 h-5 text-[#ccff00]" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="su-wordmark-title">Bible Game Arcade</h1>
          <p className="su-wordmark-sub">Player identity</p>
        </div>
      </div>

      {/* Card */}
      <div className="su-card">

        {/* Tab switcher */}
        <div className="su-tabs" role="tablist">
          <button
            id="tab-new-player"
            role="tab"
            aria-selected={activeTab === 'NEW'}
            onClick={() => switchTab('NEW')}
            className={`su-tab${activeTab === 'NEW' ? ' su-tab--active' : ''}`}
          >
            <UserCheck className="w-4 h-4" strokeWidth={2} />
            New player
          </button>
          <button
            id="tab-returning-player"
            role="tab"
            aria-selected={activeTab === 'RETURNING'}
            onClick={() => switchTab('RETURNING')}
            className={`su-tab${activeTab === 'RETURNING' ? ' su-tab--active' : ''}`}
          >
            <LogIn className="w-4 h-4" strokeWidth={2} />
            Sign back in
          </button>
        </div>

        <div className="su-body">

          {/* Error banner */}
          {errorMsg && (
            <div className="su-error-banner">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── NEW PLAYER ─────────────────────────────────────── */}
          {activeTab === 'NEW' && (
            <form id="form-new-player" onSubmit={handleNewPlayer} className="su-form" noValidate>

              <div className="su-field">
                <label htmlFor="input-new-username" className="su-label">
                  Username <span className="su-label-note">— shown to all players</span>
                </label>
                <input
                  id="input-new-username"
                  type="text"
                  maxLength={20}
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. samuel_b"
                  className="su-input su-input--mono"
                  autoComplete="off"
                  autoFocus
                  required
                />
                <AvailabilityNote />
                <p className="su-hint">Your real name is always hidden from other players.</p>
              </div>

              <div className="su-field">
                <label htmlFor="input-display-name" className="su-label">
                  Your real name <span className="su-label-note">— private, only you see this</span>
                </label>
                <input
                  id="input-display-name"
                  type="text"
                  maxLength={30}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Samuel Johnson"
                  className="su-input"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="su-pin-row">
                <div className="su-field">
                  <label htmlFor="input-pin" className="su-label">4-digit PIN</label>
                  <div className="su-pin-wrap">
                    <input
                      id="input-pin"
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="••••"
                      className="su-input su-input--pin"
                      required
                    />
                    <button type="button" onClick={() => setShowPin(v => !v)} className="su-pin-eye" tabIndex={-1}>
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="su-field">
                  <label htmlFor="input-confirm-pin" className="su-label">Confirm PIN</label>
                  <input
                    id="input-confirm-pin"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className={`su-input su-input--pin${pinMismatch ? ' su-input--error' : pinMatch ? ' su-input--ok' : ''}`}
                    required
                  />
                </div>
              </div>
              <p className="su-hint">You'll need your PIN to sign in on a new device.</p>

              <button
                id="btn-create-identity"
                type="submit"
                disabled={isLoading || availability !== 'available'}
                className="su-btn-primary"
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Claiming username…</>
                  : 'Create my identity'
                }
              </button>
            </form>
          )}

          {/* ── RETURNING PLAYER ───────────────────────────────── */}
          {activeTab === 'RETURNING' && (
            <form id="form-returning-player" onSubmit={handleReturningPlayer} className="su-form" noValidate>

              <div className="su-field">
                <label htmlFor="input-ret-username" className="su-label">Username</label>
                <input
                  id="input-ret-username"
                  type="text"
                  maxLength={20}
                  value={retUsername}
                  onChange={e => setRetUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Your username"
                  className="su-input su-input--mono"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </div>

              <div className="su-field">
                <label htmlFor="input-ret-pin" className="su-label">4-digit PIN</label>
                <div className="su-pin-wrap">
                  <input
                    id="input-ret-pin"
                    type={showRetPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={retPin}
                    onChange={e => setRetPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="su-input su-input--pin"
                    required
                  />
                  <button type="button" onClick={() => setShowRetPin(v => !v)} className="su-pin-eye" tabIndex={-1}>
                    {showRetPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-recover-identity"
                type="submit"
                disabled={isLoading}
                className="su-btn-primary"
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  : 'Sign back in'
                }
              </button>

              <p className="su-hint su-hint--center">
                Forgot your PIN? Ask your game organiser to reset your account.
              </p>
            </form>
          )}

        </div>
      </div>

      <p className="su-footer-note">
        Your username is permanent and unique across all sessions.
      </p>
    </div>
  );
};
