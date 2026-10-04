import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Sparkles,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { authService } from '../services/auth.service';

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Verification state
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);

  // Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 1. Verify token on page load
  useEffect(() => {
    if (!token) {
      setIsValidatingToken(false);
      setTokenError('No password setup token provided. Please use the link provided in your credentials email.');
      return;
    }

    const checkToken = async () => {
      setIsValidatingToken(true);
      setTokenError(null);
      try {
        const res = await authService.verifySetupToken(token);
        if (res.valid) {
          setAdminDetails(res.admin);
        } else {
          setTokenError(res.message || 'Invalid or expired setup token.');
        }
      } catch (err) {
        setTokenError(
          err.response?.data?.message ||
          err.message ||
          'This password-setup link is invalid, expired, or has already been used.'
        );
      } finally {
        setIsValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  // Password strength checklist rules
  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword
  };

  const isFormValid =
    rules.length &&
    rules.upper &&
    rules.lower &&
    rules.number &&
    rules.symbol &&
    rules.match;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setFormError('Please ensure your password satisfies all security criteria below.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await authService.setPassword({
        token,
        newPassword,
        confirmPassword
      });

      setSuccessMessage(res.message || 'Password set successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login?presetEmail=' + encodeURIComponent(adminDetails?.officialEmail || ''), {
          state: { message: 'Your permanent password has been set. Please sign in.' }
        });
      }, 2000);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        err.message ||
        'Failed to set password. Please try again or contact your Super Admin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600/20 to-emerald-600/20 border border-blue-500/30 rounded-2xl mb-3 shadow-lg shadow-blue-500/10 backdrop-blur-sm">
            <ShieldCheck className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            E-Mobility Sri Lanka
          </h1>
          <p className="text-sm text-slate-400 mt-1">Administrator Security & Password Setup</p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          {/* State 1: Validating Token */}
          {isValidatingToken && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-slate-300 font-medium text-sm">Verifying one-time security token...</p>
              <p className="text-xs text-slate-500">Checking validity and 24-hour expiration window</p>
            </div>
          )}

          {/* State 2: Token Invalid / Expired */}
          {!isValidatingToken && tokenError && (
            <div className="py-6 text-center space-y-5">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">Invalid or Expired Link</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {tokenError}
                </p>
              </div>
              <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs text-slate-400 text-left space-y-1.5">
                <p className="font-semibold text-slate-300">Why might this happen?</p>
                <p>&bull; The link has expired (links remain active for 24 hours).</p>
                <p>&bull; The link has already been used to set a password.</p>
                <p>&bull; A Super Admin recently regenerated a newer setup token for your account.</p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* State 3: Success Screen */}
          {successMessage && (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Password Created!</h2>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  {successMessage}
                </p>
              </div>
              <p className="text-xs text-slate-500">Redirecting to login portal in 2 seconds...</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Sign In Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* State 4: Set Password Form */}
          {!isValidatingToken && !tokenError && !successMessage && (
            <div>
              {/* Admin Identity Card */}
              {adminDetails && (
                <div className="mb-6 p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Provisioned</p>
                    <p className="text-sm font-bold text-white truncate">{adminDetails.name}</p>
                    <p className="text-xs text-blue-400 font-mono truncate">{adminDetails.officialEmail}</p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                  Set Your Permanent Password
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a strong, unique password to secure your administrator account.
                </p>
              </div>

              {formError && (
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new permanent password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password to confirm"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Password Strength Checklist */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 mt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password Security Criteria
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-2 ${rules.length ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rules.length ? 'text-emerald-400' : 'text-slate-600'}`} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${rules.upper ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rules.upper ? 'text-emerald-400' : 'text-slate-600'}`} />
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center gap-2 ${rules.lower ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rules.lower ? 'text-emerald-400' : 'text-slate-600'}`} />
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center gap-2 ${rules.number ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rules.number ? 'text-emerald-400' : 'text-slate-600'}`} />
                      One number (0-9)
                    </div>
                    <div className={`flex items-center gap-2 ${rules.symbol ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rules.symbol ? 'text-emerald-400' : 'text-slate-600'}`} />
                      One special symbol (!@#$...)
                    </div>
                    <div className={`flex items-center gap-2 ${rules.match ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rules.match ? 'text-emerald-400' : 'text-slate-600'}`} />
                      Passwords match
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Set Permanent Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Need help? Contact the Super Administrator or your system support desk.
        </p>
      </div>
    </div>
  );
};

export default SetPassword;
