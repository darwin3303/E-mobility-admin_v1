import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Camera,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, completeLoginWithPhoto, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Daily Admin Login Verification Photo state
  const [verificationPending, setVerificationPending] = useState(null); // { pendingToken, user }
  const [cameraConsent, setCameraConsent] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isVerifyingPhoto, setIsVerifyingPhoto] = useState(false);

  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);

  // If already authenticated, redirect based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!cameraConsent) {
      setCameraError('You must grant explicit consent before camera activation.');
      return;
    }
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
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
      setCameraError('Unable to access camera. Please allow camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/webp', 0.88);
    setCapturedPhoto(base64);
    // Capture single photo and immediately stop stream (not continuous)
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const cancelPhotoVerification = () => {
    stopCamera();
    setCapturedPhoto(null);
    setCameraConsent(false);
    setVerificationPending(null);
    setCameraError(null);
  };

  const handleConfirmPhotoVerification = async () => {
    if (!capturedPhoto || !verificationPending?.pendingToken) {
      setCameraError('Please capture your verification photo first.');
      return;
    }
    setIsVerifyingPhoto(true);
    setCameraError(null);

    try {
      const res = await completeLoginWithPhoto({
        pendingToken: verificationPending.pendingToken,
        photo: capturedPhoto
      });

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (res?.user?.role === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setCameraError(err.message || 'Photo verification failed. Please try again.');
    } finally {
      setIsVerifyingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      // If temporary password requires setting a permanent password
      if (result?.mustChangePassword) {
        const dest = result.redirect || `/set-password?token=${result.token || ''}`;
        navigate(dest, { replace: true });
        return;
      }

      // Check if daily photo verification is required
      if (result?.requiresPhotoVerification) {
        setVerificationPending(result);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      if (result?.user?.role === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full font-sans bg-slate-950 overflow-hidden">
      
      {/* LEFT PANEL - Realistic Image & Animations */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-950 overflow-hidden">
        <img 
          src="/realistic_police_barrier.png" 
          alt="Police Barrier" 
          className="w-full h-full object-cover origin-center"
          style={{ animation: 'panZoom 25s ease-in-out infinite alternate' }}
        />
        {/* Animated police light effects */}
        <div className="absolute inset-0 bg-blue-600/30 mix-blend-overlay animate-flashBlue"></div>
        <div className="absolute inset-0 bg-red-600/30 mix-blend-overlay animate-flashRed"></div>
        
        {/* Scanning line animation */}
        <div className="absolute inset-0 w-full h-[5px] bg-white/20 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-scanLine blur-[1px]"></div>
        
        {/* Dark gradient blend on the right edge to seamlessly blend with the form panel */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/20 to-transparent"></div>
      </div>

      {/* RIGHT PANEL - Original Glassmorphism Login Portal */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          ></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Glassmorphism Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/60 rounded-3xl shadow-2xl shadow-blue-500/10 p-8 md:p-10 transition-all duration-300 hover:shadow-blue-500/20">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>

            {/* Logo Section */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 border border-blue-400/20 transition-all duration-300">
                  <ShieldCheck size={32} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  e-Mobility Sri Lanka
                </h1>
                <p className="text-sm font-bold text-slate-100">Admin</p>
              </div>
            </div>

            {/* Conditionally Render: Photo Verification Step OR Standard Sign In */}
            {verificationPending ? (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider mb-2">
                    Daily Security Verification
                  </span>
                  <h2 className="text-2xl font-black text-white">Login Verification Photo</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Identity check for <strong className="text-slate-200">{verificationPending.user?.name}</strong>
                  </p>
                </div>

                {cameraError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Explicit Camera Consent Checkbox */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cameraConsent}
                      onChange={(e) => {
                        setCameraConsent(e.target.checked);
                        if (!e.target.checked) stopCamera();
                      }}
                      className="mt-0.5 w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-emerald-500"
                    />
                    <div className="text-[11px] leading-relaxed text-slate-300">
                      <span className="font-bold text-white block">Camera Consent & 14-Day Private Audit</span>
                      I grant explicit permission to capture one verification snapshot for this login session. Photos are securely stored and automatically purged after 14 days.
                    </div>
                  </label>
                </div>

                {/* Camera Viewport */}
                <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden min-h-[220px] flex items-center justify-center">
                  {isCameraActive && !capturedPhoto && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto max-h-[260px] object-contain rounded-2xl transform -scale-x-100"
                      />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-36 h-36 border-2 border-emerald-400/70 rounded-full border-dashed animate-pulse"></div>
                      </div>
                    </div>
                  )}

                  {capturedPhoto && (
                    <div className="p-3 flex flex-col items-center">
                      <img
                        src={capturedPhoto}
                        alt="Verification Snapshot"
                        className="w-36 h-36 object-cover rounded-full border-4 border-emerald-500 shadow-xl"
                      />
                      <span className="mt-2 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Snapshot Ready
                      </span>
                    </div>
                  )}

                  {!isCameraActive && !capturedPhoto && (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Check the consent box above, then click below to activate your webcam and capture one verification snapshot.
                      </p>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Buttons */}
                <div className="space-y-2.5">
                  {!isCameraActive && !capturedPhoto && (
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={!cameraConsent}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        cameraConsent
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      Activate Camera
                    </button>
                  )}

                  {isCameraActive && !capturedPhoto && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Verification Snapshot
                    </button>
                  )}

                  {capturedPhoto && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retake
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPhotoVerification}
                        disabled={isVerifyingPhoto}
                        className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                      >
                        {isVerifyingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Confirm & Sign In
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={cancelPhotoVerification}
                    className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Cancel & Return to Credentials
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Welcome Section */}
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-slate-100 mb-2 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-slate-400">
                    Sign in to access your automated command dashboard
                  </p>
                  <div className="flex items-center justify-center mt-3 space-x-2">
                    <Sparkles size={14} className="text-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400 font-medium">Secure · Encrypted · Fast</span>
                    <Sparkles size={14} className="text-blue-400 animate-pulse delay-500" />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 bg-red-950/60 backdrop-blur-sm border border-red-800/60 rounded-xl p-4 flex items-start space-x-3 animate-slideDown">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Authentication Failed</p>
                      <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nipunsudusinghe523@gmail.com"
                        className="w-full bg-slate-950/50 backdrop-blur-sm border-2 border-slate-700/50 hover:border-slate-600 focus:border-blue-500 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-slate-950/50 backdrop-blur-sm border-2 border-slate-700/50 hover:border-slate-600 focus:border-blue-500 rounded-xl pl-12 pr-12 py-3.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-all duration-300 hover:scale-110"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-2 focus:ring-offset-slate-900 cursor-pointer transition-all duration-200"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                        Remember me
                      </span>
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-800 disabled:to-blue-800 text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 disabled:shadow-none flex items-center justify-center space-x-2 overflow-hidden group cursor-pointer"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
              <p className="text-xs text-slate-500">
                © 2024 e-Mobility Sri Lanka. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 mt-3">
                <span className="text-[10px] text-slate-600">Secure SSL</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="text-[10px] text-slate-600">256-bit Encryption</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="text-[10px] text-slate-600">GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Powered by badge */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-600 tracking-wider">
              POWERED BY E-MOBILITY SRI LANKA · v2.0
            </p>
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        
        @keyframes panZoom {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.15) translate(1.5%, 1.5%); }
          100% { transform: scale(1.15) translate(-1.5%, -1.5%); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flashBlue {
          0%, 100% { opacity: 0; }
          40% { opacity: 0.15; }
          50% { opacity: 0.6; }
          60% { opacity: 0.15; }
        }
        @keyframes flashRed {
          0%, 100% { opacity: 0; }
          40% { opacity: 0.15; }
          50% { opacity: 0.6; }
          60% { opacity: 0.15; }
        }
        .animate-scanLine { animation: scanLine 6s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-flashBlue { animation: flashBlue 2.5s ease-in-out infinite; }
        .animate-flashRed { animation: flashRed 2.5s ease-in-out infinite 1.25s; }
      `}</style>
    </div>
  );
};

export default Login;