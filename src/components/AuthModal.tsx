import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { UserAccount } from '../types';
import { sound } from '../audio/soundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

type AuthMode = 'login' | 'register' | 'verify' | 'recovery' | 'secondary-key';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [securityPassword, setSecurityPassword] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('749210');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);

  if (!isOpen) return null;

  const calculatePasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score, label: 'Moderate', color: 'bg-amber-500' };
      case 3:
        return { score, label: 'Strong', color: 'bg-blue-500' };
      case 4:
      default:
        return { score, label: 'Maximum Security', color: 'bg-green-500' };
    }
  };

  const strength = calculatePasswordStrength(password);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (strength.score < 2) {
      setErrorMsg('Please choose a stronger password (at least 8 chars, mixed case or numbers).');
      return;
    }

    // Generate mock verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setMode('verify');
    setErrorMsg('');
    setSuccessMsg(`A 6-digit verification code has been dispatched to ${email}: [DEMO CODE: ${code}]`);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (verificationCode !== generatedCode) {
      setErrorMsg('Invalid verification code. Please check and retry.');
      return;
    }

    // Save account locally
    const newUser: UserAccount = {
      email,
      isVerified: true,
      securityPasswordHash: securityPassword || undefined,
      createdAt: Date.now(),
    };

    try {
      localStorage.setItem(`user_${email}`, JSON.stringify({ ...newUser, password }));
      localStorage.setItem('active_operator_email', email);
    } catch {
      // ignore
    }

    sound.playChime();
    setSuccessMsg('Account verified successfully! Terminal credentials active.');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 1200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    try {
      const stored = localStorage.getItem(`user_${email}`);
      if (!stored) {
        // Allow automatic demo registration for smooth testing
        const newUser: UserAccount = {
          email,
          isVerified: true,
          createdAt: Date.now(),
        };
        localStorage.setItem(`user_${email}`, JSON.stringify({ ...newUser, password }));
        localStorage.setItem('active_operator_email', email);
        sound.playChime();
        onLoginSuccess(newUser);
        onClose();
        return;
      }

      const userData = JSON.parse(stored);
      if (userData.password && userData.password !== password) {
        setErrorMsg('Invalid password for this operator account.');
        sound.playHeartbeat();
        return;
      }

      sound.playChime();
      localStorage.setItem('active_operator_email', email);
      onLoginSuccess(userData);
      onClose();
    } catch {
      setErrorMsg('Authentication error. Try again.');
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!email) {
      setErrorMsg('Please specify your registered operator email.');
      return;
    }

    const code = '918342';
    setGeneratedCode(code);
    setMode('verify');
    setSuccessMsg(`Recovery token dispatched to ${email}: [CODE: ${code}]`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 text-red-500 mb-5">
          <KeyRound className="h-5 w-5" />
          <h3 className="font-bold text-sm tracking-widest uppercase">
            OPERATOR AUTHENTICATION TERMINAL
          </h3>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-950/40 border border-red-900 rounded text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-green-950/40 border border-green-900 rounded text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-neutral-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@station108.net"
                  className="w-full rounded border border-neutral-800 bg-black pl-10 pr-3 py-2 text-neutral-200 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-neutral-800 bg-black pl-10 pr-10 py-2 text-neutral-200 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded transition-colors"
            >
              Authorize Terminal Access
            </button>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('register');
                  setErrorMsg('');
                }}
                className="hover:text-red-400 transition-colors"
              >
                Create New Operator Account &rarr;
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('recovery');
                  setErrorMsg('');
                }}
                className="hover:text-neutral-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-neutral-400 mb-1">Email (No phone number required)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full rounded border border-neutral-800 bg-black pl-10 pr-3 py-2 text-neutral-200 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full rounded border border-neutral-800 bg-black pl-10 pr-10 py-2 text-neutral-200 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Strength: {strength.label}</span>
                    <span>{strength.score}/4 Requirements</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-900 rounded overflow-hidden flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 transition-all ${
                          i < strength.score ? strength.color : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">
                Secondary Security Password / Duress Key (Optional)
              </label>
              <div className="relative">
                <ShieldAlert className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  value={securityPassword}
                  onChange={(e) => setSecurityPassword(e.target.value)}
                  placeholder="Secondary authorization key..."
                  className="w-full rounded border border-neutral-800 bg-black pl-10 pr-3 py-2 text-neutral-200 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Emergency duress pin for wiping sensitive logs or locking the terminal.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded transition-colors"
            >
              Dispatch Email Verification Code
            </button>

            <div className="text-center text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-red-400 hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* VERIFICATION CODE MODE */}
        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-neutral-300 text-xs">
              Enter the 6-digit verification code transmitted to <strong>{email}</strong>:
            </p>

            <div>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code..."
                className="w-full rounded border border-neutral-800 bg-black px-4 py-3 text-center text-xl font-bold tracking-widest text-red-400 focus:border-red-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-green-800 hover:bg-green-700 text-white font-bold rounded transition-colors"
            >
              Verify & Activate Account
            </button>

            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <button
                type="button"
                onClick={() => {
                  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedCode(newCode);
                  setSuccessMsg(`New code dispatched: [CODE: ${newCode}]`);
                }}
                className="hover:text-neutral-300"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="hover:text-red-400"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* RECOVERY MODE */}
        {mode === 'recovery' && (
          <form onSubmit={handleRecovery} className="space-y-4">
            <p className="text-neutral-300 text-xs">
              Specify your operator email address to receive an emergency recovery code.
            </p>

            <div>
              <label className="block text-neutral-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@station108.net"
                className="w-full rounded border border-neutral-800 bg-black px-3 py-2 text-neutral-200 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded transition-colors"
            >
              Dispatch Recovery Code
            </button>

            <div className="text-center text-[11px] text-neutral-500">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-neutral-400 hover:text-white"
              >
                Return to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
