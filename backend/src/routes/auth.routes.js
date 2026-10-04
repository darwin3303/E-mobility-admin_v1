import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { loginRateLimiter, setPasswordRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// User Management (Protected by requireAuth and requireRole)
router.get('/users', requireAuth, requireRole('admin', 'super_admin'), authController.getUsers);

// Super Admin Protected Route (Server-side RBAC guard)
router.get('/super-admin/dashboard', requireAuth, requireRole('super_admin'), authController.getSuperAdminData);

// Login & Session (With basic rate limiting & generic errors)
router.post('/login', loginRateLimiter, authController.login);
router.get('/verify', optionalAuth, authController.verifySession);
router.get('/me', requireAuth, authController.verifySession);  // ← alias used by frontends
router.post('/logout', authController.logout);

// User Registration
router.post('/register', authController.register);

// OTP Authentication
router.post('/otp/request', authController.requestOtp);
router.post('/otp/verify', authController.verifyOtp);

// Government SSO Authentication
router.post('/gov-sso', authController.govSso);

// Password Reset Flow
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// First-Time Activation Flow (Single-use expiring token & camera consent)
router.post('/verify-activation-token', authController.verifyActivationToken);
router.post('/activate', authController.activateAdmin);

// Set-Password Flow (Rate-limited, single-use 24-hour token verification)
router.get('/verify-setup-token', authController.verifySetupToken);
router.post('/verify-setup-token', authController.verifySetupToken);
router.post('/set-password', setPasswordRateLimiter, authController.setPassword);

// Daily Admin Login Verification (Post-credentials camera verification)
router.post('/verify-login-photo', authController.verifyLoginPhoto);

// Admin Provisioning & Lifecycle (Super Admin RBAC Protected)
router.post('/admins', requireAuth, requireRole('super_admin'), authController.createAdmin);
router.post('/admins/:id/resend-credentials', requireAuth, requireRole('super_admin'), authController.resendCredentials);
router.post('/admins/:id/approve', requireAuth, requireRole('super_admin'), authController.approveAdmin);
router.post('/admins/:id/reject', requireAuth, requireRole('super_admin'), authController.rejectAdmin);
router.post('/admins/:id/suspend', requireAuth, requireRole('super_admin'), authController.toggleSuspendAdmin);

// Super Admin Login Photo Audit & Verification Access Log (Super Admin RBAC Protected)
router.get('/audit/login-audits', requireAuth, requireRole('super_admin'), authController.getLoginAudits);
router.get('/audit/login-photo/:id', requireAuth, requireRole('super_admin'), authController.getAuditPhoto);
router.get('/audit/photo-views/:id', requireAuth, requireRole('super_admin'), authController.getAuditPhotoViews);

export default router;

