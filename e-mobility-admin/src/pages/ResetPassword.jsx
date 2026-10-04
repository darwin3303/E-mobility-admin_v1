import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  Check,
  XCircle,
} from 'lucide-react';
import { authService } from '../services/auth.service';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password criteria calculations
  const criteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const strengthScore = Object.values(criteria).filter(Boolean).length;
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Verify token on mount
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Missing password reset security token. Please request a new reset link.');
        setIsVerifying(false);
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await authService.verifyResetToken({ token, email: emailParam });
        if (response.valid) {
          setIsTokenValid(true);
          if (response.email) setEmail(response.email);
        } else {
          setError(response.message || 'Invalid or expired password reset link.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired password reset link. Please request a new one.');
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyToken();
  }, [token, emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword({
        token,
        email,
        newPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.15)] p-6 sm:p-8 z-10">
        {/* Brand / Title Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                <KeyRound size={26} />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Account Security</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {isSuccess ? 'Password Reset Complete' : 'Set New Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isSuccess
              ? 'Your password has been successfully updated.'
              : email
              ? `Creating a new password for ${email}`
              : 'Choose a strong and secure password for your account.'}
          </p>
        </div>

        {/* LOADING TOKEN VALIDATION STATE */}
        {isVerifying ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-400">Verifying secure reset link...</p>
          </div>
        ) : !isTokenValid && !isSuccess ? (
          /* INVALID / EXPIRED TOKEN STATE */
          <div className="space-y-6 animate-fadeIn text-center">
            <div className="bg-red-950/70 border border-red-800/80 rounded-2xl p-5 text-left flex items-start space-x-3">
              <XCircle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-200">Invalid or Expired Link</h4>
                <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
                  {error || 'This password reset link is invalid or has expired for security reasons.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Return to Login & Request New Link</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          /* SUCCESS STATE */
          <div className="space-y-6 animate-fadeIn text-center">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-emerald-500/10 border-2 border-emerald-500/40 p-4 rounded-full text-emerald-400">
                  <CheckCircle2 size={48} />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-left">
              <p className="text-xs text-slate-300 leading-relaxed">
                🎉 Your account credentials have been updated. You can now use your new password to sign into the E-Mobility Admin Portal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* NEW PASSWORD FORM */
          <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
            {error && (
              <div className="bg-red-950/70 border border-red-800/80 rounded-xl p-3.5 flex items-start space-x-3">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium leading-tight">{error}</p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  className="w-full bg-slate-950/70 border-2 border-slate-700/60 focus:border-blue-500 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                  required
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Strength indicator */}
            {newPassword && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Password Strength</span>
                  <span
                    className={
                      strengthScore <= 1
                        ? 'text-red-400'
                        : strengthScore <= 3
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`rounded-full transition-all duration-300 ${
                        level <= strengthScore
                          ? strengthScore <= 1
                            ? 'bg-red-500'
                            : strengthScore <= 3
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-slate-950/70 border-2 border-slate-700/60 focus:border-blue-500 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center space-x-1.5 mt-2 text-[11px]">
                  {isMatch ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-400" />
                      <span className="text-red-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || (confirmPassword && !isMatch)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-900 disabled:to-blue-900 text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 disabled:shadow-none transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Security note & Back link */}
            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">
                ← Back to Sign In
              </Link>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Encrypted</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
