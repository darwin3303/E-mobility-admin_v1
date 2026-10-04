import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Mail, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { authService } from '../services/auth.service';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
  const [directResetUrl, setDirectResetUrl] = useState(null);

  // Sync initial email when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setError(null);
      setIsSubmitted(false);
      setIsClosing(false);
      setEmailPreviewUrl(null);
      setDirectResetUrl(null);
    }
  }, [isOpen, initialEmail]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading]);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250); // Matches exit animation duration
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.requestPasswordReset(email);
      if (res?.previewUrl) setEmailPreviewUrl(res.previewUrl);
      if (res?.resetUrl) setDirectResetUrl(res.resetUrl);
      setIsSubmitted(true);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.requestPasswordReset(email);
      if (res?.previewUrl) setEmailPreviewUrl(res.previewUrl);
      if (res?.resetUrl) setDirectResetUrl(res.resetUrl);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
      isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Darkened Glassmorphic Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden transform transition-all duration-300 ${
          isClosing ? 'scale-95 translate-y-4 opacity-0' : 'animate-modalPopIn'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Ambient Blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          /* ================= STEP 1: RESET REQUEST FORM ================= */
          <div className="animate-fadeIn">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                  <KeyRound size={28} className="animate-bounce-subtle" />
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Reset Your Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Enter your account email address below. We'll send you secure instructions to restore access.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 dark:bg-red-950/70 dark:border-red-800/80 rounded-xl p-3.5 flex items-start space-x-3 animate-shake">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300 font-medium leading-tight">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Registered Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/70 dark:border-slate-700/60 dark:text-slate-100 dark:placeholder:text-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full sm:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300 text-sm font-medium py-3 rounded-xl border border-slate-200 dark:border-slate-700/60 transition-all duration-200 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-2/3 relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-800 disabled:to-blue-800 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Instructions</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
              <span>End-to-End Encrypted Password Recovery</span>
            </div>
          </div>
        ) : (
          /* ================= STEP 2: SUCCESS CONFIRMATION ================= */
          <div className="animate-fadeIn text-center py-2">
            {/* Animated Checkmark Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-emerald-500/10 border-2 border-emerald-500/40 p-4 rounded-full text-emerald-500 dark:text-emerald-400 animate-scaleCheck">
                  <CheckCircle2 size={44} />
                </div>
              </div>
            </div>

            {/* Success Title */}
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Instructions Sent!
            </h2>

            {/* Confirmation text with highlighted email */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              We have dispatched a password reset link to:
            </p>

            <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-blue-600 dark:text-blue-300 font-semibold text-xs sm:text-sm break-all mb-6 flex items-center justify-center space-x-2 shadow-inner">
              <Mail size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span>{email}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Please check your inbox (and spam folder) and follow the provided link to update your credentials.
            </p>

            {/* Optional Dev Mail Preview / Direct Reset Link */}
            {(emailPreviewUrl || directResetUrl) && (
              <div className="mb-5 bg-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 text-left space-y-2">
                <div className="flex items-center space-x-1.5 text-xs text-blue-300 font-semibold">
                  <Sparkles size={13} className="text-blue-400" />
                  <span>Email Dispatched</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {emailPreviewUrl && (
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs rounded-lg transition-colors font-medium"
                    >
                      <span>📧 View Inbox Web Preview</span>
                      <ArrowRight size={12} />
                    </a>
                  )}
                  {directResetUrl && (
                    <a
                      href={directResetUrl}
                      className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs rounded-lg transition-colors font-medium"
                    >
                      <span>🔗 Open Reset Page</span>
                      <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Error handling for resend */}
            {error && (
              <div className="mb-4 bg-red-950/70 border border-red-800/80 rounded-xl p-3 flex items-center justify-center space-x-2">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-xs text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Resend & Done buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full bg-slate-800/80 hover:bg-slate-800 disabled:bg-slate-900 border border-slate-700/60 disabled:border-slate-800 text-slate-300 hover:text-white disabled:text-slate-600 text-xs sm:text-sm font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-slate-500" />
                    <span>Resend in {resendCooldown}s</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Didn't receive email? Resend</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Keyframe Animations */}
      <style>{`
        @keyframes modalPopIn {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleCheck {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-modalPopIn { animation: modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleCheck { animation: scaleCheck 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out forwards; }
        .animate-bounce-subtle { animation: bounceSubtle 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ForgotPasswordModal;
