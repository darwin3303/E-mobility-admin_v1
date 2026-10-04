import { authService } from '../services/auth.service.js';
import { resetLoginAttempts } from '../middleware/rateLimit.middleware.js';

export const authController = {
  /**
   * GET /api/users or /api/auth/users
   * Retrieve all registered users for Admin Dashboard
   */
  async getUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      return res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/super-admin/dashboard
   * Server-side protected Super Admin endpoint
   */
  async getSuperAdminData(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Access granted to Super Admin Dashboard.',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name || 'Super Administrator'
      },
      timestamp: new Date().toISOString()
    });
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { nicOrMobile, email, password } = req.body;
      const identifier = nicOrMobile || email;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'NIC, Mobile, or Email and password are required.'
        });
      }

      const result = await authService.login(identifier, password, ipAddress, userAgent);
      resetLoginAttempts(req);

      if (result.mustChangePassword) {
        return res.status(200).json({
          success: false,
          mustChangePassword: true,
          redirect: result.redirect,
          token: result.token,
          email: result.email,
          message: result.message
        });
      }

      if (result.requiresPhotoVerification) {
        return res.status(200).json({
          success: true,
          requiresPhotoVerification: true,
          pendingToken: result.pendingToken,
          user: result.user,
          message: 'Daily admin login verification required. Please capture a verification photo.'
        });
      }

      return res.status(200).json({
        success: true,
        token: result.token,
        user: result.user
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message || 'Invalid email or password.'
      });
    }
  },

  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { nic, name, mobile, email, password, role, licenseNo, district } = req.body;
      const result = await authService.register({ nic, name, mobile, email, password, role, licenseNo, district });
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/otp/request
   */
  async requestOtp(req, res, next) {
    try {
      const { mobile } = req.body;
      const result = await authService.requestOtp(mobile);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/otp/verify
   */
  async verifyOtp(req, res, next) {
    try {
      const { otp, code, mobile } = req.body;
      const otpCode = otp || code;
      const result = await authService.verifyOtp(otpCode, mobile);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/gov-sso
   */
  async govSso(req, res, next) {
    try {
      const { govId } = req.body;
      const result = await authService.govSsoLogin(govId);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const origin = req.headers.origin;
      const result = await authService.requestPasswordReset(email, origin);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/verify-reset-token
   */
  async verifyResetToken(req, res, next) {
    try {
      const { token, email } = req.body;
      const result = authService.verifyResetToken(token, email);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        valid: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, email, newPassword } = req.body;
      const result = await authService.resetPassword(token, email, newPassword);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * GET /api/auth/verify
   */
  async verifySession(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return res.status(200).json({ valid: true, user: req.user || null });
    }
    return res.status(401).json({ valid: false });
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  },

  /**
   * POST /api/auth/admins
   * Super Admin → Create Admin User
   */
  async createAdmin(req, res, next) {
    try {
      const { name, email, officialEmail, personalEmail } = req.body;
      const origin = req.headers.origin;
      const result = await authService.createAdmin({
        name,
        email,
        officialEmail: officialEmail || email,
        personalEmail,
        superAdminUser: req.user,
        originHeader: origin
      });
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/admins/:id/resend-credentials
   * Super Admin → Resend Credentials (regenerates temp password & setup token)
   */
  async resendCredentials(req, res, next) {
    try {
      const adminId = req.params.id;
      const { personalEmail } = req.body;
      const origin = req.headers.origin;
      const result = await authService.resendCredentials(adminId, req.user, origin, personalEmail);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * GET or POST /api/auth/verify-setup-token
   * Public check for single-use password setup token validity
   */
  async verifySetupToken(req, res, next) {
    try {
      const token = req.query.token || req.body.token;
      const result = await authService.verifySetupToken(token);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        valid: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/set-password
   * Public endpoint with rate limiting to set permanent password
   */
  async setPassword(req, res, next) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await authService.setPassword({ token, newPassword, confirmPassword });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/verify-activation-token
   * Public check for token validity
   */
  async verifyActivationToken(req, res, next) {
    try {
      const { token, email } = req.body;
      const result = await authService.verifyActivationToken(token, email);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        valid: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/activate
   * First Activation: Set password & capture profile photo with consent
   */
  async activateAdmin(req, res, next) {
    try {
      const { token, email, newPassword, profilePhoto } = req.body;
      const result = await authService.activateAdmin({
        token,
        email,
        newPassword,
        profilePhotoBase64: profilePhoto
      });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/admins/:id/approve
   * Super Admin approves pending admin
   */
  async approveAdmin(req, res, next) {
    try {
      const adminId = req.params.id;
      const origin = req.headers.origin;
      const result = await authService.approveAdmin(adminId, req.user, origin);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/admins/:id/reject
   * Super Admin rejects pending admin
   */
  async rejectAdmin(req, res, next) {
    try {
      const adminId = req.params.id;
      const result = await authService.rejectAdmin(adminId, req.user);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/admins/:id/suspend
   * Super Admin toggles suspension
   */
  async toggleSuspendAdmin(req, res, next) {
    try {
      const adminId = req.params.id;
      const result = await authService.toggleSuspendAdmin(adminId, req.user);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * POST /api/auth/verify-login-photo
   * Daily Admin Login Verification: Camera photo submission
   */
  async verifyLoginPhoto(req, res, next) {
    try {
      const { pendingToken, photo } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      const result = await authService.verifyLoginPhoto({
        pendingToken,
        photoBase64: photo,
        ipAddress,
        userAgent
      });

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * GET /api/auth/audit/login-audits
   * Super Admin: View login audit log
   */
  async getLoginAudits(req, res, next) {
    try {
      const { search, status, role, adminId } = req.query;
      const audits = await authService.getLoginAudits({ search, status, role, adminId });
      return res.status(200).json({
        success: true,
        count: audits.length,
        audits
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * GET /api/auth/audit/login-photo/:id
   * Super Admin: Securely retrieve verification photo (with view logging & 14-day retention enforcement)
   */
  async getAuditPhoto(req, res, next) {
    try {
      const auditId = req.params.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

      const photoData = await authService.getAuditPhoto(auditId, req.user, ipAddress);

      res.setHeader('Content-Type', photoData.mimeType);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return res.status(200).send(photoData.buffer);
    } catch (err) {
      const isRetentionExpiry = err.message.includes('expired') || err.message.includes('14-day');
      return res.status(isRetentionExpiry ? 410 : 404).json({
        success: false,
        message: err.message
      });
    }
  },

  /**
   * GET /api/auth/audit/photo-views/:id
   * Super Admin: View access log showing which Super Admin viewed this audit photo
   */
  async getAuditPhotoViews(req, res, next) {
    try {
      const auditId = req.params.id;
      const views = await authService.getAuditPhotoViews(auditId);
      return res.status(200).json({
        success: true,
        views
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};
