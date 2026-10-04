import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  User,
  RefreshCw,
  ArrowRight,
  Shield,
  KeyRound,
  Check
} from 'lucide-react';

export default function FirstActivation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  // Verification state
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenError, setTokenError] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Camera & Consent states
  const [cameraConsent, setCameraConsent] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activationComplete, setActivationComplete] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setTokenError('Activation token is missing. Please click the link received in your invitation email.');
        setVerifyingToken(false);
        return;
      }

      try {
        const res = await authService.verifyActivationToken({ token, email: emailParam });
        if (res.valid) {
          setAdminData(res.admin);
        } else {
          setTokenError(res.message || 'Invalid or expired activation link.');
        }
      } catch (err) {
        setTokenError(err.response?.data?.message || err.message || 'Invalid or expired activation link.');
      } finally {
        setVerifyingToken(false);
      }
    }

    verify();

    return () => {
      stopCamera();
    };
  }, [token, emailParam]);

  // Start webcam
  const startCamera = async () => {
    if (!cameraConsent) {
      setCameraError('You must grant explicit consent before activating the camera.');
      return;
    }

    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check your browser camera permissions.');
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture snapshot from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/webp', 0.9);
    setCapturedPhoto(base64);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Handle submit activation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isPasswordValid) {
      setSubmitError('Please meet all password strength requirements.');
      return;
    }

    if (!passwordsMatch) {
      setSubmitError('Passwords do not match.');
      return;
    }

    if (!capturedPhoto) {
      setSubmitError('Please capture your administrative profile photo to proceed.');
      return;
    }

    if (!cameraConsent) {
      setSubmitError('Explicit camera consent is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.activateAdmin({
        token,
        email: emailParam || adminData?.email,
        newPassword,
        profilePhoto: capturedPhoto
      });
      setActivationComplete(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Activation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-bold">Verifying One-Time Activation Token...</h2>
          <p className="text-xs text-slate-400">Validating cryptographic credentials with E-Mobility Lanka Central Command</p>
        </div>
      </div>
    );
  }

  // Token Error / Invalid link
  if (tokenError) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d1420] border border-rose-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Activation Link Invalid or Expired</h2>
            <p className="text-xs text-rose-300/90 mt-2 leading-relaxed">{tokenError}</p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Activation Complete Screen (Awaiting Super Admin Approval)
  if (activationComplete) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[#0d1420] border border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold uppercase rounded-full tracking-wider mb-2">
              Status: Awaiting Super Admin Approval
            </span>
            <h2 className="text-2xl font-black text-white mt-1">Activation Completed Successfully!</h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Your password has been securely configured, email verification confirmed, and your initial profile photo recorded.
            </p>
          </div>

          <div className="bg-[#111928] border border-slate-800 rounded-2xl p-5 text-left space-y-3 text-xs">
            <div className="flex items-start gap-3 text-amber-300/90">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>System Access Restriction:</strong> In accordance with national cyber-governance protocols, you cannot access the system until the Super Administrator reviews and officially approves your account.
              </span>
            </div>
            <div className="flex items-start gap-3 text-slate-400 border-t border-slate-800/80 pt-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>You will receive an automated notification email as soon as your account is approved.</span>
            </div>
          </div>

          <div>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Go to Portal Login Page
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              E-Mobility Sri Lanka
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">Admin First-Time Activation</h1>
          </div>
        </div>

        {/* Activation Form Card */}
        <div className="bg-[#0d1420] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/40">
          {/* Administrator Profile Banner */}
          <div className="bg-[#111928] border border-slate-800 rounded-2xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono">
                {adminData?.name ? adminData.name.charAt(0) : 'A'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{adminData?.name || 'Administrator'}</p>
                <p className="text-xs text-slate-400 font-mono">{adminData?.email || emailParam}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded-lg">
              Pending Activation
            </span>
          </div>

          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: FORCE CREATE NEW PASSWORD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/20">
                  1
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  Set Permanent Secure Password
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-[#111928] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#111928] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="bg-[#111928]/60 border border-slate-800/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Symbol (!@#$)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            {/* STEP 2: CAPTURE INITIAL PROFILE PHOTO WITH EXPLICIT CONSENT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/20">
                  2
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Initial Profile Photo Verification
                </h3>
              </div>

              {/* Explicit Camera Consent Checkbox */}
              <div className="bg-[#111928] border border-slate-800 rounded-xl p-4 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cameraConsent}
                    onChange={(e) => {
                      setCameraConsent(e.target.checked);
                      if (!e.target.checked) {
                        stopCamera();
                      }
                    }}
                    className="mt-0.5 w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500 bg-[#0d1420]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      Explicit Camera Consent & Identity Verification
                    </span>
                    <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">
                      I hereby give explicit consent to activate my webcam and capture my official administrator profile photograph. I understand this photo is securely stored and used for identity verification on the E-Mobility Lanka Command Center.
                    </span>
                  </div>
                </label>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Camera Preview / Captured Photo Container */}
              <div className="relative bg-[#070b12] border border-slate-800 rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center">
                {/* 1. Live Camera Stream */}
                {isCameraActive && !capturedPhoto && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto max-h-[320px] object-contain rounded-2xl transform -scale-x-100"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-emerald-400/60 rounded-full border-dashed animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* 2. Captured Photo Preview */}
                {capturedPhoto && (
                  <div className="relative p-4 flex flex-col items-center">
                    <img
                      src={capturedPhoto}
                      alt="Captured Profile"
                      className="w-48 h-48 object-cover rounded-full border-4 border-emerald-500 shadow-xl"
                    />
                    <span className="mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Captured Successfully
                    </span>
                  </div>
                )}

                {/* 3. Idle Camera State */}
                {!isCameraActive && !capturedPhoto && (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Check the consent box above, then click below to grant camera access and capture your initial profile photo.
                    </p>
                  </div>
                )}

                {/* Hidden canvas for snapshot rasterization */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!isCameraActive && !capturedPhoto && (
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={!cameraConsent}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                      cameraConsent
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Enable Camera Preview
                  </button>
                )}

                {isCameraActive && !capturedPhoto && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Profile Photo
                  </button>
                )}

                {capturedPhoto && (
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retake Photo
                  </button>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid || !passwordsMatch || !capturedPhoto}
                className={`w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isSubmitting || !isPasswordValid || !passwordsMatch || !capturedPhoto
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Activation...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Complete Activation & Submit for Approval
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-3">
                Single-Use Activation • AES-256-GCM Cryptographic Protocol • 14-Day Retention Policy
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
