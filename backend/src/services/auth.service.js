import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool, isPostgresConnected } from '../config/db.js';
import { config } from '../config/env.js';
import {
  sendPasswordResetEmail,
  sendAdminInvitationEmail,
  sendAdminCredentialsEmail,
  sendAdminApprovedEmail
} from './email.service.js';
import { storageService } from './storage.service.js';
import { auditService } from './audit.service.js';
import { vehicleService } from './vehicle.service.js';
import {
  encryptEmail,
  decryptEmail,
  hashEmail,
  hashPassword,
  verifyPassword,
  generateSecureTemporaryPassword
} from '../utils/crypto.utils.js';

/**
 * Generate cryptographically secure temporary password
 */
function generateSecureTempPassword(length = 10) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digits + special;
  
  let pwd = '';
  pwd += upper[crypto.randomInt(0, upper.length)];
  pwd += lower[crypto.randomInt(0, lower.length)];
  pwd += digits[crypto.randomInt(0, digits.length)];
  pwd += special[crypto.randomInt(0, special.length)];

  for (let i = 4; i < length; i++) {
    pwd += all[crypto.randomInt(0, all.length)];
  }
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

// In-memory token store for resilience: token -> { email, expiresAt, createdAt }
const resetTokens = new Map();

// In-memory OTP store: mobile -> { code, expiresAt }
const otpStore = new Map();

// Default Super Admin credentials from environment
const defaultSaEmail = config.superAdminEmail || 'emobilitysuperadmin@gmail.com';
const defaultSaPass = config.superAdminPassword || 'Admin@123';

// In-memory registered users store for fallback when PostgreSQL is in standby
const fallbackUsers = [
  {
    id: 99,
    nic: '000000000000',
    name: 'Super Administrator',
    email: encryptEmail(defaultSaEmail),
    email_hash: hashEmail(defaultSaEmail),
    password: hashPassword(defaultSaPass, 10),
    mobile: '0770000000',
    role: 'super_admin',
    licenseNo: 'SA-0000001',
    district: 'Colombo',
    status: 'Active',
    registeredDate: '2024-01-01',
    vehiclesCount: 0
  },
  {
    id: 5,
    nic: '199852300001',
    name: 'Nipun Sudusinghe',
    email: encryptEmail('nipunsudusinghe523@gmail.com'),
    email_hash: hashEmail('nipunsudusinghe523@gmail.com'),
    password: hashPassword('123456', 10),
    mobile: '0771234567',
    role: 'admin',
    licenseNo: 'A-9928102',
    district: 'Colombo',
    status: 'Active',
    registeredDate: '2024-01-01',
    vehiclesCount: 1
  },
  {
    id: 1,
    nic: '200012345678',
    name: 'Kavinda Perera',
    email: encryptEmail('kavinda.perera@example.lk'),
    email_hash: hashEmail('kavinda.perera@example.lk'),
    password: hashPassword('123456', 10),
    mobile: '0771234567',
    role: 'user',
    licenseNo: 'B-4819201',
    district: 'Colombo',
    status: 'Active',
    registeredDate: '2025-01-15',
    vehiclesCount: 1
  },
  {
    id: 2,
    nic: '198512345678',
    name: 'Admin Commander',
    email: encryptEmail('admin@example.com'),
    email_hash: hashEmail('admin@example.com'),
    password: hashPassword('123456', 10),
    mobile: '0712345678',
    role: 'admin',
    licenseNo: 'A-1029384',
    district: 'Colombo',
    status: 'Active',
    registeredDate: '2024-01-01',
    vehiclesCount: 1
  },
  {
    id: 3,
    nic: '198810293847',
    name: 'Dr. Nimal Wickramasinghe',
    email: encryptEmail('nimal.w@gov.lk'),
    email_hash: hashEmail('nimal.w@gov.lk'),
    password: hashPassword('123456', 10),
    mobile: '0712345678',
    role: 'user',
    licenseNo: 'B-9918231',
    district: 'Kandy',
    status: 'Active',
    registeredDate: '2024-06-10',
    vehiclesCount: 1
  }
];

/**
 * Validates Sri Lankan National Identity Card (NIC) format
 * - Old NIC: 9 digits + 'V' or 'X' (e.g. 901234567V)
 * - New NIC: 12 digits numeric only (e.g. 200012345678)
 */
export function isValidSriLankanNIC(nic) {
  if (!nic || typeof nic !== 'string') return false;
  const clean = nic.trim().toUpperCase();
  const oldNicRegex = /^[0-9]{9}[VX]$/;
  const newNicRegex = /^[0-9]{12}$/;
  return oldNicRegex.test(clean) || newNicRegex.test(clean);
}

export const authService = {
  /**
   * Get all registered users for Admin User Management with linked vehicles
   */
  async getAllUsers() {
    let allVehicles = [];
    try {
      allVehicles = await vehicleService.getAllVehicles();
    } catch (e) {
      console.warn('getAllVehicles in authService warning:', e.message);
    }

    if (isPostgresConnected()) {
      try {
        const res = await pool.query(`
          SELECT 
            u.id, 
            u.nic, 
            u.name, 
            u.mobile, 
            u.email, 
            COALESCE(u.role, 'user') AS role, 
            COALESCE(u.status, 'active') AS status,
            u.profile_photo AS "profilePhoto",
            u.email_verified AS "emailVerified",
            TO_CHAR(u.created_at, 'YYYY-MM-DD') AS "registeredDate",
            COUNT(v.id) AS "vehiclesCount",
            COALESCE(
              json_agg(
                json_build_object(
                  'plate', v.plate,
                  'make', v.make,
                  'model', v.model,
                  'year', v.year,
                  'type', v.type
                )
              ) FILTER (WHERE v.id IS NOT NULL),
              '[]'
            ) AS vehicles
          FROM users u
          LEFT JOIN vehicles v ON v.owner_id = u.id OR v.owner_nic = u.nic
          GROUP BY u.id, u.nic, u.name, u.mobile, u.email, u.role, u.status, u.profile_photo, u.email_verified, u.created_at
          ORDER BY u.id DESC;
        `);
        if (res.rows.length > 0) {
          const dbNics = new Set(res.rows.map(u => u.nic));
          const extra = fallbackUsers
            .filter(u => !dbNics.has(u.nic))
            .map(u => {
              const uVehs = allVehicles.filter(v => v.ownerNic === u.nic);
              return {
                ...u,
                vehiclesCount: uVehs.length,
                vehicles: uVehs
              };
            });
          return [...res.rows, ...extra].map(u => {
            const rawStatus = (u.status || 'active').toLowerCase();
            let displayStatus = 'Active';
            if (rawStatus === 'pending_activation') displayStatus = 'Pending Activation';
            else if (rawStatus === 'awaiting_approval' || rawStatus === 'pending approval') displayStatus = 'Pending Approval';
            else if (rawStatus === 'suspended') displayStatus = 'Suspended';
            else if (rawStatus === 'rejected') displayStatus = 'Rejected';

            return {
              ...u,
              email: decryptEmail(u.email),
              role: u.role || 'admin',
              status: displayStatus,
              rawStatus: u.status || 'active'
            };
          });
        }
      } catch (err) {
        console.warn('DB getAllUsers fallback:', err.message);
      }
    }

    return fallbackUsers.map(u => {
      const uVehs = allVehicles.filter(v => v.ownerNic === u.nic);
      const rawStatus = (u.status || 'active').toLowerCase();
      let displayStatus = 'Active';
      if (rawStatus === 'pending_activation') displayStatus = 'Pending Activation';
      else if (rawStatus === 'awaiting_approval' || rawStatus === 'pending approval') displayStatus = 'Pending Approval';
      else if (rawStatus === 'suspended') displayStatus = 'Suspended';
      else if (rawStatus === 'rejected') displayStatus = 'Rejected';

      return {
        ...u,
        email: decryptEmail(u.email),
        role: u.role || 'admin',
        status: displayStatus,
        rawStatus: u.status || 'active',
        vehiclesCount: uVehs.length,
        vehicles: uVehs
      };
    });
  },

  /**
   * Authenticate user with NIC / Mobile or Email + Password
   * Security:
   * - Queries by deterministic HMAC-SHA256 email_hash
   * - Plaintext passwords and decrypted emails are never logged
   * - Enforces account status checks
   * - Enforces daily login verification photo step for Admin accounts
   */
  async login(identifier, password, ipAddress = '127.0.0.1', userAgent = 'Unknown') {
    if (!identifier || !password) {
      throw new Error('NIC, Mobile, or Email and password are required.');
    }

    const cleanIdentifier = identifier.trim();
    const emailHash = hashEmail(cleanIdentifier);

    // 1. Try PostgreSQL if connected
    if (isPostgresConnected()) {
      try {
        const userRes = await pool.query(
          'SELECT * FROM users WHERE email_hash = $1 OR LOWER(email) = LOWER($2) OR nic = $2 OR mobile = $2',
          [emailHash, cleanIdentifier]
        );

        if (userRes.rows.length > 0) {
          const user = userRes.rows[0];
          const isMatch = verifyPassword(password, user.password);

          if (!isMatch) {
            throw new Error('Invalid email or password.');
          }

          const plainEmail = decryptEmail(user.email);
          const userRole = user.role || 'admin';
          const userStatus = (user.status || 'active').toLowerCase();

          // Forced redirect if administrator is required to set a new password
          if (user.must_change_password) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            try {
              await pool.query(
                'UPDATE users SET password_setup_token = $1, password_setup_expires_at = $2 WHERE id = $3',
                [hashedToken, expiresAt, user.id]
              );
            } catch (e) {
              console.warn('DB update setup token fallback:', e.message);
            }

            return {
              mustChangePassword: true,
              redirect: `/set-password?token=${rawToken}`,
              token: rawToken,
              email: plainEmail,
              name: user.name,
              message: 'Temporary password detected. You must set a permanent password before accessing the system.'
            };
          }

          // Account status enforcement
          if (userStatus === 'pending_activation') {
            throw new Error('Account pending activation. Please check your invitation email to complete initial activation and set your password.');
          }
          if (userStatus === 'awaiting_approval' || userStatus === 'pending approval') {
            throw new Error('Account activation complete. Your account is currently awaiting Super Admin approval before access can be granted.');
          }
          if (userStatus === 'suspended') {
            throw new Error('This account has been suspended. Please contact the Super Administrator.');
          }
          if (userStatus === 'rejected') {
            throw new Error('Account registration was not approved. Please contact the Super Administrator.');
          }

          // Daily Admin Login Verification: require camera verification photo for Admin accounts
          if (userRole === 'admin') {
            const pendingToken = jwt.sign(
              {
                id: user.id,
                nic: user.nic,
                email: plainEmail,
                name: user.name,
                role: userRole,
                stage: 'photo_verification'
              },
              config.jwtSecret,
              { expiresIn: '15m' }
            );

            return {
              requiresPhotoVerification: true,
              pendingToken,
              user: {
                id: user.id,
                nic: user.nic,
                email: plainEmail,
                name: user.name,
                role: userRole
              }
            };
          }

          const token = jwt.sign(
            { id: user.id, nic: user.nic, email: plainEmail, role: userRole },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
          );

          return {
            token,
            user: {
              id: user.id,
              nic: user.nic,
              email: plainEmail,
              name: user.name,
              mobile: user.mobile,
              role: userRole,
              registeredDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '2025-01-15'
            }
          };
        }

        const ownerRes = await pool.query(
          'SELECT * FROM owners WHERE LOWER(email) = LOWER($1) OR nic = $1 OR phone = $1',
          [cleanIdentifier]
        );

        if (ownerRes.rows.length > 0) {
          const owner = ownerRes.rows[0];
          if (owner.password && !verifyPassword(password, owner.password)) {
            throw new Error('Invalid email or password.');
          }

          const plainEmail = decryptEmail(owner.email);
          const token = jwt.sign(
            { id: owner.owner_id, nic: owner.nic, email: plainEmail, role: 'user' },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
          );

          return {
            token,
            user: {
              id: owner.owner_id,
              nic: owner.nic,
              email: plainEmail,
              name: owner.full_name,
              mobile: owner.phone,
              role: 'user',
              registeredDate: '2025-01-15'
            }
          };
        }
      } catch (err) {
        if (err.message.includes('Account') || err.message.includes('suspended') || err.message === 'Invalid email or password.') {
          throw err;
        }
        console.warn('DB login query fallback:', err.message);
      }
    }

    // 2. Fallback in-memory matching
    const existing = fallbackUsers.find(
      u => (u.email_hash && u.email_hash === emailHash) ||
           (u.email && u.email.toLowerCase() === cleanIdentifier.toLowerCase()) ||
           (decryptEmail(u.email).toLowerCase() === cleanIdentifier.toLowerCase()) ||
           u.nic === cleanIdentifier ||
           u.mobile === cleanIdentifier
    );

    if (existing) {
      const isMatch = verifyPassword(password, existing.password);

      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      const plainEmail = decryptEmail(existing.email);
      const userRole = existing.role || 'admin';
      const userStatus = (existing.status || 'active').toLowerCase();

      // Forced redirect if administrator is required to set a new password
      if (existing.must_change_password) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        existing.password_setup_token = hashedToken;
        existing.password_setup_expires_at = expiresAt;

        return {
          mustChangePassword: true,
          redirect: `/set-password?token=${rawToken}`,
          token: rawToken,
          email: plainEmail,
          name: existing.name,
          message: 'Temporary password detected. You must set a permanent password before accessing the system.'
        };
      }

      // Account status enforcement
      if (userStatus === 'pending_activation') {
        throw new Error('Account pending activation. Please check your invitation email to complete initial activation and set your password.');
      }
      if (userStatus === 'awaiting_approval' || userStatus === 'pending approval') {
        throw new Error('Account activation complete. Your account is currently awaiting Super Admin approval before access can be granted.');
      }
      if (userStatus === 'suspended') {
        throw new Error('This account has been suspended. Please contact the Super Administrator.');
      }
      if (userStatus === 'rejected') {
        throw new Error('Account registration was not approved. Please contact the Super Administrator.');
      }

      // Daily Admin Login Verification: require camera verification photo for Admin accounts
      if (userRole === 'admin') {
        const pendingToken = jwt.sign(
          {
            id: existing.id,
            nic: existing.nic,
            email: plainEmail,
            name: existing.name,
            role: userRole,
            stage: 'photo_verification'
          },
          config.jwtSecret,
          { expiresIn: '15m' }
        );

        return {
          requiresPhotoVerification: true,
          pendingToken,
          user: {
            id: existing.id,
            nic: existing.nic,
            email: plainEmail,
            name: existing.name,
            role: userRole
          }
        };
      }

      const token = jwt.sign(
        { id: existing.id, nic: existing.nic, email: plainEmail, role: userRole },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return {
        token,
        user: {
          ...existing,
          email: plainEmail,
          role: userRole
        }
      };
    }

    // User not found in any source: generic error for security
    throw new Error('Invalid email or password.');
  },

  /**
   * Register a new citizen/user (with strict Sri Lankan NIC validation and duplicate prevention)
   */
  async register({ nic, name, mobile, email, password, role = 'user', licenseNo, district }) {
    if (!nic || !name || !mobile) {
      throw new Error('NIC, Name, and Mobile number are required for registration.');
    }

    const cleanNic = nic.trim().toUpperCase();

    // 1. Strict Sri Lankan NIC Format Validation
    if (!isValidSriLankanNIC(cleanNic)) {
      throw new Error('Please enter a valid Sri Lankan NIC number.');
    }

    // 2. Check for duplicate NIC in database
    if (isPostgresConnected()) {
      try {
        const dupCheck = await pool.query('SELECT id, nic FROM users WHERE nic = $1', [cleanNic]);
        if (dupCheck.rows.length > 0) {
          throw new Error('An account with this NIC number already exists. Please log in.');
        }
      } catch (err) {
        if (err.message.includes('already exists')) throw err;
        console.warn('DB duplicate NIC check fallback:', err.message);
      }
    }

    // 3. Check for duplicate NIC in central fallback registry
    const existingFallback = fallbackUsers.find(u => u.nic === cleanNic);
    if (existingFallback) {
      throw new Error('An account with this NIC number already exists. Please log in.');
    }

    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanNic.toLowerCase()}@emobility.lk`;

    const newUser = {
      id: Date.now(),
      nic: cleanNic,
      name: name.trim(),
      mobile: mobile.trim(),
      email: cleanEmail,
      role: role || 'user',
      licenseNo: licenseNo || `B-${Math.floor(1000000 + Math.random() * 9000000)}`,
      district: district || 'Western',
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      vehiclesCount: 0,
      vehicles: []
    };

    if (isPostgresConnected()) {
      try {
        // CRITICAL: Always hash password before storing — never store plaintext!
        const hashedPassword = password
          ? await bcrypt.hash(password, 10)
          : await bcrypt.hash('default123', 10);

        const res = await pool.query(
          `INSERT INTO users (nic, name, mobile, email, password, role)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *;`,
          [newUser.nic, newUser.name, newUser.mobile, newUser.email, hashedPassword, newUser.role]
        );
        if (res.rows.length > 0) {
          newUser.id = res.rows[0].id;
        }
      } catch (err) {
        if (err.message.includes('unique') || err.message.includes('duplicate')) {
          throw new Error('An account with this NIC number already exists. Please log in.');
        }
        console.warn('DB Register query fallback:', err.message);
      }
    }

    fallbackUsers.unshift(newUser);

    console.log(`👤 New user registered: ${newUser.name} (${newUser.nic}) - Stored in shared backend.`);

    const token = jwt.sign(
      { id: newUser.id, nic: newUser.nic, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return { success: true, token, user: newUser };
  },

  /**
   * Request an OTP for Mobile Login
   */
  async requestOtp(mobile) {
    if (!mobile) throw new Error('Mobile number is required');
    const cleanMobile = mobile.trim();
    const code = '123456';
    otpStore.set(cleanMobile, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
    console.log(`📱 OTP generated for ${cleanMobile}: ${code}`);
    return { success: true, message: `OTP sent to ${cleanMobile}`, demoCode: code };
  },

  /**
   * Verify an OTP for Mobile Login
   */
  async verifyOtp(code, mobile) {
    if (!code) throw new Error('OTP code is required');

    const valid = code === '123456' || (mobile && otpStore.get(mobile)?.code === code);
    if (!valid) {
      throw new Error('Invalid OTP code. Please enter 123456 or request a new code.');
    }

    const cleanMobile = mobile || '0719876543';
    let user = fallbackUsers.find(u => u.mobile === cleanMobile);

    if (!user) {
      user = {
        id: Date.now(),
        nic: '199518901234',
        name: 'Saman Silva (OTP User)',
        mobile: cleanMobile,
        email: 'saman.silva@example.lk',
        role: 'user',
        licenseNo: 'B-7728192',
        district: 'Colombo',
        status: 'Active',
        registeredDate: new Date().toISOString().split('T')[0],
        vehiclesCount: 1,
        vehicles: []
      };
      fallbackUsers.unshift(user);
    }

    const token = jwt.sign(
      { id: user.id, nic: user.nic, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return { success: true, token, user };
  },

  /**
   * Authenticate via Government SSO (Digital Citizen ID)
   */
  async govSsoLogin(govId) {
    let user = fallbackUsers.find(u => u.nic === '198810293847');
    if (!user) {
      user = {
        id: 882,
        nic: '198810293847',
        name: 'Dr. Nimal Wickramasinghe',
        mobile: '0712345678',
        email: 'nimal.w@gov.lk',
        govId: govId || 'GOV-LK-9948102',
        licenseNo: 'B-9918231',
        district: 'Colombo',
        status: 'Active',
        role: 'user',
        registeredDate: '2024-06-10',
        vehiclesCount: 1,
        vehicles: []
      };
      fallbackUsers.unshift(user);
    }

    const token = jwt.sign(
      { id: user.id, nic: user.nic, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return { success: true, token, user };
  },

  /**
   * Password Reset Flow: Request Token & Dispatch Email
   */
  async requestPasswordReset(email, originHeader) {
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`🔑 Password reset requested for: ${normalizedEmail}`);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000;

    resetTokens.set(token, {
      email: normalizedEmail,
      expiresAt,
      createdAt: Date.now(),
    });

    for (const [t, data] of resetTokens.entries()) {
      if (data.email === normalizedEmail && t !== token) {
        resetTokens.delete(t);
      }
    }

    const frontendUrl = originHeader || config.adminFrontendUrl;
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    const emailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      token,
      resetUrl,
    });

    return {
      success: true,
      message: `Password reset instructions have been sent to ${normalizedEmail}.`,
      expiresIn: '60 minutes',
      previewUrl: emailResult.previewUrl || null,
      resetUrl: config.nodeEnv === 'development' ? resetUrl : undefined,
    };
  },

  /**
   * Verify Reset Token
   */
  verifyResetToken(token, email) {
    if (!token) throw new Error('Reset token is required.');

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      throw new Error('Invalid or expired password reset link.');
    }

    if (Date.now() > tokenData.expiresAt) {
      resetTokens.delete(token);
      throw new Error('Password reset link has expired. Please request a new one.');
    }

    if (email && tokenData.email !== email.trim().toLowerCase()) {
      throw new Error('Token does not match the specified email address.');
    }

    return { valid: true, email: tokenData.email };
  },

  /**
   * Reset Password with Token
   */
  async resetPassword(token, email, newPassword) {
    if (!token || !newPassword) {
      throw new Error('Reset token and new password are required.');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      throw new Error('Invalid or expired password reset link. Please request a new password reset.');
    }

    if (Date.now() > tokenData.expiresAt) {
      resetTokens.delete(token);
      throw new Error('Password reset link has expired. Please request a new one.');
    }

    const targetEmail = tokenData.email;
    resetTokens.delete(token);

    if (isPostgresConnected()) {
      try {
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newPassword, targetEmail]);
      } catch (err) {
        console.warn('DB Password update fallback:', err.message);
      }
    }

    console.log(`✅ Password successfully reset for: ${targetEmail}`);
    return {
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new credentials.'
    };
  },

  /**
   * Super Admin → Create Admin User
   * Fields: Full Name (required), Official Email (required, unique, login username), Personal Email (required, delivery)
   * Generates secure temporary password (min 12 chars, CSPRNG), hashes with bcrypt, sets must_change_password = true,
   * generates 24h single-use password-setup token, and emails credentials to personal email.
   */
  async createAdmin({ name, email, officialEmail, personalEmail, superAdminUser, originHeader }) {
    if (!name || name.trim().length < 2) {
      throw new Error('Administrator Full Name is required (minimum 2 characters).');
    }

    const cleanOfficial = (officialEmail || email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanOfficial || !emailRegex.test(cleanOfficial)) {
      throw new Error('A valid Official Email address is required (e.g. admin@yourdomain.com).');
    }

    const cleanPersonal = (personalEmail || '').trim().toLowerCase();
    if (!cleanPersonal || !emailRegex.test(cleanPersonal)) {
      throw new Error('A valid Personal/Private Email address is required to deliver initial credentials.');
    }

    const cleanName = name.trim();
    const officialEmailHash = hashEmail(cleanOfficial);
    const personalEmailHash = hashEmail(cleanPersonal);

    // 1. Duplicate Official Email Check
    if (isPostgresConnected()) {
      try {
        const check = await pool.query('SELECT id FROM users WHERE email_hash = $1', [officialEmailHash]);
        if (check.rows.length > 0) {
          throw new Error(`An administrator account with official email "${cleanOfficial}" already exists.`);
        }
      } catch (err) {
        if (err.message.includes('already exists')) throw err;
        console.warn('DB createAdmin duplicate check fallback:', err.message);
      }
    }

    const memExists = fallbackUsers.find(
      u => u.email_hash === officialEmailHash || decryptEmail(u.email).toLowerCase() === cleanOfficial
    );
    if (memExists) {
      throw new Error(`An administrator account with official email "${cleanOfficial}" already exists.`);
    }

    // 2. Generate secure random temporary password (min 12 chars, mix of upper, lower, numbers, symbols)
    const tempPassword = generateSecureTemporaryPassword(14);
    const hashedTempPassword = hashPassword(tempPassword, 10);

    // 3. Generate single-use password-setup token (valid for 24 hours, stored as SHA-256 hash)
    const rawSetupToken = crypto.randomBytes(32).toString('hex');
    const hashedSetupToken = crypto.createHash('sha256').update(rawSetupToken).digest('hex');
    const setupExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const encryptedOfficialEmail = encryptEmail(cleanOfficial);
    const encryptedPersonalEmail = encryptEmail(cleanPersonal);
    const generatedNic = `ADM-${Date.now().toString().slice(-8)}`;

    let newAdmin = null;

    if (isPostgresConnected()) {
      try {
        const res = await pool.query(
          `INSERT INTO users 
           (nic, name, mobile, email, email_hash, personal_email, personal_email_hash, password, role, status, must_change_password, password_setup_token, password_setup_expires_at, activation_token, activation_expires_at, email_verified, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING id, nic, name, mobile, role, status, must_change_password, created_at`,
          [
            generatedNic,
            cleanName,
            '0700000000',
            encryptedOfficialEmail,
            officialEmailHash,
            encryptedPersonalEmail,
            personalEmailHash,
            hashedTempPassword,
            'admin',
            'active',
            true,
            hashedSetupToken,
            setupExpiresAt,
            rawSetupToken,
            setupExpiresAt,
            false,
            superAdminUser?.id || null
          ]
        );
        newAdmin = {
          ...res.rows[0],
          email: cleanOfficial,
          personalEmail: cleanPersonal
        };
      } catch (err) {
        console.warn('DB createAdmin fallback:', err.message);
      }
    }

    if (!newAdmin) {
      const fallbackId = Date.now();
      newAdmin = {
        id: fallbackId,
        nic: generatedNic,
        name: cleanName,
        mobile: '0700000000',
        email: encryptedOfficialEmail,
        email_hash: officialEmailHash,
        personal_email: encryptedPersonalEmail,
        personal_email_hash: personalEmailHash,
        password: hashedTempPassword,
        role: 'admin',
        status: 'active',
        must_change_password: true,
        password_setup_token: hashedSetupToken,
        password_setup_expires_at: setupExpiresAt,
        activation_token: rawSetupToken,
        activation_expires_at: setupExpiresAt,
        email_verified: false,
        created_by: superAdminUser?.id || null,
        registeredDate: new Date().toISOString().split('T')[0]
      };
      fallbackUsers.unshift(newAdmin);
    }

    const appUrl = originHeader || config.appUrl || config.adminFrontendUrl || 'http://localhost:5173';
    const setPasswordUrl = `${appUrl}/set-password?token=${rawSetupToken}`;
    const loginUrl = `${appUrl}/login`;
    const activationUrl = `${appUrl}/activate?token=${rawSetupToken}&email=${encodeURIComponent(cleanOfficial)}`;

    // 4. Send email to admin's PERSONAL email
    let emailSent = false;
    let emailError = null;
    try {
      await sendAdminCredentialsEmail({
        name: cleanName,
        officialEmail: cleanOfficial,
        personalEmail: cleanPersonal,
        tempPassword,
        setPasswordUrl,
        loginUrl
      });
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message || 'SMTP delivery failed';
      console.warn(`⚠️ [EMAIL] Credentials email delivery note: ${emailError}`);
    }

    return {
      success: true,
      emailSent,
      emailError,
      message: emailSent
        ? `Administrator account provisioned for ${cleanName}. Credentials dispatched to ${cleanPersonal}.`
        : `Administrator created for ${cleanName}, but initial email dispatch failed (${emailError}). You can use "Resend Credentials" below.`,
      admin: {
        id: newAdmin.id,
        name: cleanName,
        officialEmail: cleanOfficial,
        personalEmail: cleanPersonal,
        role: 'admin',
        mustChangePassword: true,
        status: 'Active'
      },
      setPasswordUrl,
      loginUrl,
      tempPassword,
      activationUrl
    };
  },

  /**
   * Super Admin → Resend Credentials
   * Regenerates a new temporary password and 24h setup token, invalidating old ones,
   * and dispatches a fresh email to the admin's personal email.
   */
  async resendCredentials(adminId, superAdminUser, originHeader, customPersonalEmail) {
    let user = null;
    if (isPostgresConnected()) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [adminId]);
        if (res.rows.length > 0) user = res.rows[0];
      } catch (err) {
        console.warn('DB resendCredentials lookup fallback:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.find(u => String(u.id) === String(adminId));
    }

    if (!user) {
      throw new Error('Administrator account not found.');
    }

    const officialEmail = decryptEmail(user.email);
    const targetPersonalEmail = customPersonalEmail ||
      (user.personal_email ? decryptEmail(user.personal_email) : officialEmail);

    // Generate fresh temporary password and 24h setup token
    const newTempPassword = generateSecureTemporaryPassword(14);
    const hashedTempPassword = hashPassword(newTempPassword, 10);
    const rawSetupToken = crypto.randomBytes(32).toString('hex');
    const hashedSetupToken = crypto.createHash('sha256').update(rawSetupToken).digest('hex');
    const setupExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `UPDATE users 
           SET password = $1, 
               must_change_password = TRUE, 
               password_setup_token = $2, 
               password_setup_expires_at = $3,
               activation_token = $4,
               activation_expires_at = $5
           WHERE id = $6`,
          [hashedTempPassword, hashedSetupToken, setupExpiresAt, rawSetupToken, setupExpiresAt, adminId]
        );
      } catch (err) {
        console.warn('DB resendCredentials update fallback:', err.message);
      }
    }

    user.password = hashedTempPassword;
    user.must_change_password = true;
    user.password_setup_token = hashedSetupToken;
    user.password_setup_expires_at = setupExpiresAt;
    user.activation_token = rawSetupToken;
    user.activation_expires_at = setupExpiresAt;

    const appUrl = originHeader || config.appUrl || config.adminFrontendUrl || 'http://localhost:5173';
    const setPasswordUrl = `${appUrl}/set-password?token=${rawSetupToken}`;
    const loginUrl = `${appUrl}/login`;

    await sendAdminCredentialsEmail({
      name: user.name,
      officialEmail,
      personalEmail: targetPersonalEmail,
      tempPassword: newTempPassword,
      setPasswordUrl,
      loginUrl
    });

    return {
      success: true,
      message: `Fresh credentials generated and dispatched to ${targetPersonalEmail}.`,
      setPasswordUrl,
      tempPassword: newTempPassword
    };
  },

  /**
   * Verify Password Setup Token
   * Verifies that the single-use token exists, is not expired, and has not yet been used.
   */
  async verifySetupToken(token) {
    if (!token) throw new Error('Password setup token is required.');

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    let user = null;

    if (isPostgresConnected()) {
      try {
        const res = await pool.query(
          `SELECT * FROM users 
           WHERE (password_setup_token = $1 OR activation_token = $2)
             AND (password_setup_expires_at > CURRENT_TIMESTAMP OR activation_expires_at > CURRENT_TIMESTAMP)`,
          [hashedToken, token.trim()]
        );
        if (res.rows.length > 0) user = res.rows[0];
      } catch (err) {
        console.warn('DB verifySetupToken lookup fallback:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.find(
        u => (u.password_setup_token === hashedToken || u.activation_token === token.trim()) &&
             (!u.password_setup_expires_at || new Date() <= new Date(u.password_setup_expires_at))
      );
    }

    if (!user) {
      throw new Error('This password-setup link is invalid, expired, or has already been used. Please request a new setup link from your Super Administrator.');
    }

    const officialEmail = decryptEmail(user.email);
    return {
      valid: true,
      admin: {
        id: user.id,
        name: user.name,
        officialEmail
      }
    };
  },

  /**
   * Set Permanent Password
   * Updates password, invalidates setup token, and clears must_change_password flag.
   */
  async setPassword({ token, newPassword, confirmPassword }) {
    if (!token) throw new Error('Password setup token is required.');
    if (!newPassword || !confirmPassword) {
      throw new Error('New password and password confirmation are required.');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirmation password do not match.');
    }

    // Password strength verification
    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol.');
    }

    // Verify token validity
    const tokenCheck = await this.verifySetupToken(token);
    const adminId = tokenCheck.admin.id;

    // Hash new password using bcrypt
    const hashedPassword = hashPassword(newPassword, 10);

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `UPDATE users 
           SET password = $1, 
               must_change_password = FALSE, 
               password_setup_token = NULL, 
               password_setup_expires_at = NULL, 
               activation_token = NULL,
               activation_expires_at = NULL,
               status = 'active'
           WHERE id = $2`,
          [hashedPassword, adminId]
        );
      } catch (err) {
        console.warn('DB setPassword update fallback:', err.message);
      }
    }

    const memUser = fallbackUsers.find(u => String(u.id) === String(adminId));
    if (memUser) {
      memUser.password = hashedPassword;
      memUser.must_change_password = false;
      memUser.password_setup_token = null;
      memUser.password_setup_expires_at = null;
      memUser.activation_token = null;
      memUser.activation_expires_at = null;
      memUser.status = 'active';
    }

    return {
      success: true,
      message: 'Password set successfully! You can now log in with your official email and new password.'
    };
  },

  /**
   * First Activation: Verify One-Time Token
   */
  async verifyActivationToken(token, email) {
    if (!token) throw new Error('Activation token is required.');

    let user = null;
    if (isPostgresConnected()) {
      try {
        const res = await pool.query(
          'SELECT * FROM users WHERE activation_token = $1',
          [token]
        );
        if (res.rows.length > 0) user = res.rows[0];
      } catch (err) {
        console.warn('DB verifyActivationToken fallback:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.find(u => u.activation_token === token);
    }

    if (!user) {
      throw new Error('Invalid or already used activation token. Please contact the Super Administrator.');
    }

    if (user.activation_expires_at && new Date() > new Date(user.activation_expires_at)) {
      throw new Error('This activation link has expired. Please contact the Super Administrator for a new invitation.');
    }

    if (user.status !== 'pending_activation') {
      throw new Error('This account has already completed first-time activation.');
    }

    const decryptedEmail = decryptEmail(user.email);
    if (email && decryptedEmail.toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error('Activation token does not match the provided email address.');
    }

    return {
      valid: true,
      admin: {
        id: user.id,
        name: user.name,
        email: decryptedEmail
      }
    };
  },

  /**
   * First Activation: Set Password & Profile Photo with Consent
   * Sets status to 'awaiting_approval', invalidates token (single-use).
   */
  async activateAdmin({ token, email, newPassword, profilePhotoBase64 }) {
    if (!token) throw new Error('Activation token is required.');
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (!profilePhotoBase64) {
      throw new Error('Initial profile photo is required to complete administrator activation.');
    }

    // Verify token validity
    const tokenCheck = await this.verifyActivationToken(token, email);
    const adminId = tokenCheck.admin.id;

    // Securely save initial profile photo in private disk storage
    const profilePhotoFilename = storageService.saveSecurePhoto(profilePhotoBase64, 'profiles');

    // Hash new password using bcrypt
    const hashedNewPassword = hashPassword(newPassword, 10);

    // Update user record: single-use token invalidated, email verified, status -> awaiting_approval
    if (isPostgresConnected()) {
      try {
        await pool.query(
          `UPDATE users 
           SET password = $1, 
               profile_photo = $2, 
               email_verified = TRUE, 
               status = 'awaiting_approval', 
               activation_token = NULL, 
               activation_expires_at = NULL 
           WHERE id = $3`,
          [hashedNewPassword, profilePhotoFilename, adminId]
        );
      } catch (err) {
        console.warn('DB activateAdmin fallback:', err.message);
      }
    }

    const memUser = fallbackUsers.find(u => u.id === adminId);
    if (memUser) {
      memUser.password = hashedNewPassword;
      memUser.profile_photo = profilePhotoFilename;
      memUser.email_verified = true;
      memUser.status = 'awaiting_approval';
      memUser.activation_token = null;
      memUser.activation_expires_at = null;
    }

    return {
      success: true,
      message: 'Account activation completed! Your account is now Awaiting Super Admin Approval. You will be granted system access once approved.'
    };
  },

  /**
   * Super Admin → Approve Pending Admin
   */
  async approveAdmin(adminId, superAdminUser, originHeader) {
    let user = null;
    if (isPostgresConnected()) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [adminId]);
        if (res.rows.length > 0) user = res.rows[0];
      } catch (err) {
        console.warn('DB approveAdmin read fallback:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.find(u => String(u.id) === String(adminId));
    }

    if (!user) {
      throw new Error('Administrator account not found.');
    }

    const plainEmail = decryptEmail(user.email);

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `UPDATE users 
           SET status = 'active', 
               approved_by = $1, 
               approved_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [superAdminUser?.id || null, adminId]
        );
      } catch (err) {
        console.warn('DB approveAdmin update fallback:', err.message);
      }
    }

    if (user) {
      user.status = 'active';
      user.approved_by = superAdminUser?.id || null;
      user.approved_at = new Date().toISOString();
    }

    // Send Approval Email to Admin
    const frontendUrl = originHeader || config.adminFrontendUrl || 'http://localhost:5173';
    const loginUrl = `${frontendUrl}/login`;
    await sendAdminApprovedEmail({
      name: user.name,
      email: plainEmail,
      loginUrl
    });

    return {
      success: true,
      message: `Administrator ${user.name} has been approved successfully!`
    };
  },

  /**
   * Super Admin → Reject Pending Admin
   */
  async rejectAdmin(adminId, superAdminUser) {
    if (isPostgresConnected()) {
      try {
        await pool.query("UPDATE users SET status = 'rejected' WHERE id = $1", [adminId]);
      } catch (err) {
        console.warn('DB rejectAdmin fallback:', err.message);
      }
    }

    const memUser = fallbackUsers.find(u => String(u.id) === String(adminId));
    if (memUser) {
      memUser.status = 'rejected';
    }

    return {
      success: true,
      message: 'Administrator application has been rejected.'
    };
  },

  /**
   * Super Admin → Toggle Suspend / Reactivate Admin
   */
  async toggleSuspendAdmin(adminId, superAdminUser) {
    let currentStatus = 'active';
    let user = null;

    if (isPostgresConnected()) {
      try {
        const res = await pool.query('SELECT status FROM users WHERE id = $1', [adminId]);
        if (res.rows.length > 0) currentStatus = res.rows[0].status;
      } catch (err) {
        console.warn('DB toggleSuspendAdmin read fallback:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.find(u => String(u.id) === String(adminId));
      if (user) currentStatus = user.status;
    }

    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

    if (isPostgresConnected()) {
      try {
        await pool.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, adminId]);
      } catch (err) {
        console.warn('DB toggleSuspendAdmin update fallback:', err.message);
      }
    }

    if (user) {
      user.status = newStatus;
    }

    return {
      success: true,
      newStatus,
      message: `Administrator account has been ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}.`
    };
  },

  /**
   * Daily Admin Login Verification: Verify camera photo snapshot and grant session
   */
  async verifyLoginPhoto({ pendingToken, photoBase64, ipAddress = '127.0.0.1', userAgent = 'Unknown' }) {
    if (!pendingToken) {
      throw new Error('Pending login verification token is required.');
    }
    if (!photoBase64) {
      throw new Error('Login verification photo is required to complete sign-in.');
    }

    let decoded;
    try {
      decoded = jwt.verify(pendingToken, config.jwtSecret);
    } catch {
      throw new Error('Login verification session has expired. Please sign in again.');
    }

    if (decoded.stage !== 'photo_verification') {
      throw new Error('Invalid verification token.');
    }

    // Save photo securely in private storage (14-day retention enforced)
    const photoFilename = storageService.saveSecurePhoto(photoBase64, 'login_audits');

    // Create Login Audit record
    const auditRecord = await auditService.recordLoginAudit({
      userId: decoded.id,
      userName: decoded.name,
      userEmail: decoded.email,
      role: decoded.role || 'admin',
      ipAddress,
      deviceInfo: userAgent,
      loginStatus: 'SUCCESS',
      verificationStatus: 'VERIFIED',
      photoFilename
    });

    // Issue permanent full access JWT token
    const token = jwt.sign(
      { id: decoded.id, nic: decoded.nic, email: decoded.email, role: decoded.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      success: true,
      token,
      user: {
        id: decoded.id,
        nic: decoded.nic,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      },
      auditId: auditRecord.id,
      message: 'Daily identity verification confirmed. Access granted.'
    };
  },

  /**
   * Super Admin Login Photo Audit: Fetch login audit logs
   */
  async getLoginAudits(params) {
    return auditService.getLoginAudits(params);
  },

  /**
   * Super Admin Login Photo Audit: Retrieve secure verification photo
   */
  async getAuditPhoto(auditId, superAdminUser, ipAddress) {
    return auditService.getSecureAuditPhoto(auditId, superAdminUser, ipAddress);
  },

  /**
   * Super Admin Login Photo Audit: View audit trail of who viewed this photo
   */
  async getAuditPhotoViews(auditId) {
    return auditService.getPhotoViews(auditId);
  }
};

