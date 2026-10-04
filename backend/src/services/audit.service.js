import { pool, isPostgresConnected } from '../config/db.js';
import { storageService, PHOTO_RETENTION_MS } from './storage.service.js';

// Fallback in-memory store for login audits
let memoryAudits = [
  {
    id: 1,
    user_id: 5,
    user_name: 'Nipun Sudusinghe',
    user_email: 'nipunsudusinghe523@gmail.com',
    role: 'admin',
    ip_address: '192.168.1.104',
    device_info: 'Chrome 122.0.0 (Windows NT 10.0; Win64; x64)',
    login_status: 'SUCCESS',
    verification_status: 'VERIFIED',
    photo_filename: null,
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 35 * 60 * 1000 + PHOTO_RETENTION_MS).toISOString()
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Admin Commander',
    user_email: 'admin@example.com',
    role: 'admin',
    ip_address: '192.168.1.115',
    device_info: 'Firefox 123.0 (Windows NT 10.0; Win64; x64)',
    login_status: 'SUCCESS',
    verification_status: 'VERIFIED',
    photo_filename: null,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + PHOTO_RETENTION_MS).toISOString()
  }
];

let nextAuditId = 3;

// In-memory store for audit photo view tracking: { id, audit_id, super_admin_id, super_admin_email, ip_address, viewed_at }
let memoryPhotoViews = [];
let nextViewId = 1;

export const auditService = {
  /**
   * Record a new login audit attempt with verification photo
   */
  async recordLoginAudit({
    userId,
    userName,
    userEmail,
    role = 'admin',
    ipAddress = '127.0.0.1',
    deviceInfo = 'Unknown Device',
    loginStatus = 'SUCCESS',
    verificationStatus = 'VERIFIED',
    photoFilename = null
  }) {
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + PHOTO_RETENTION_MS);

    if (isPostgresConnected()) {
      try {
        const result = await pool.query(
          `INSERT INTO login_audits 
           (user_id, user_name, user_email, role, ip_address, device_info, login_status, verification_status, photo_filename, timestamp, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [userId, userName, userEmail, role, ipAddress, deviceInfo, loginStatus, verificationStatus, photoFilename, timestamp, expiresAt]
        );
        return result.rows[0];
      } catch (err) {
        console.warn('⚠️ [AUDIT] DB write failed, recording in-memory:', err.message);
      }
    }

    const newAudit = {
      id: nextAuditId++,
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      role,
      ip_address: ipAddress,
      device_info: deviceInfo,
      login_status: loginStatus,
      verification_status: verificationStatus,
      photo_filename: photoFilename,
      timestamp: timestamp.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    memoryAudits.unshift(newAudit);
    return newAudit;
  },

  /**
   * Get login audits with search, filters, pagination, and retention status
   */
  async getLoginAudits({ search = '', status = 'All', role = 'All', adminId = null, limit = 50, offset = 0 } = {}) {
    const now = Date.now();

    let records = [];
    if (isPostgresConnected()) {
      try {
        const query = `
          SELECT * FROM login_audits 
          ORDER BY timestamp DESC 
          LIMIT $1 OFFSET $2
        `;
        const res = await pool.query(query, [limit, offset]);
        records = res.rows;
      } catch (err) {
        console.warn('⚠️ [AUDIT] DB read failed, using in-memory store:', err.message);
        records = [...memoryAudits];
      }
    } else {
      records = [...memoryAudits];
    }

    // Process retention and filter
    const processed = records.map(audit => {
      const recordTime = new Date(audit.timestamp).getTime();
      const ageMs = now - recordTime;
      const isPhotoExpired = ageMs > PHOTO_RETENTION_MS;
      const daysRemaining = Math.max(0, Math.ceil((PHOTO_RETENTION_MS - ageMs) / (24 * 60 * 60 * 1000)));

      return {
        ...audit,
        photo_available: Boolean(audit.photo_filename && !isPhotoExpired),
        photo_expired: isPhotoExpired,
        days_remaining: daysRemaining,
        retention_policy: '14-Day Private Storage Enforced'
      };
    });

    return processed.filter(audit => {
      const matchesSearch = !search ||
        audit.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        audit.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        audit.ip_address?.includes(search);

      const matchesStatus = status === 'All' || audit.login_status === status;
      const matchesRole = role === 'All' || audit.role === role;
      const matchesAdmin = !adminId || String(audit.user_id) === String(adminId);

      return matchesSearch && matchesStatus && matchesRole && matchesAdmin;
    });
  },

  /**
   * Get single login audit by ID
   */
  async getAuditById(auditId) {
    if (isPostgresConnected()) {
      try {
        const res = await pool.query('SELECT * FROM login_audits WHERE id = $1', [auditId]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn('⚠️ [AUDIT] DB read error:', err.message);
      }
    }
    return memoryAudits.find(a => String(a.id) === String(auditId)) || null;
  },

  /**
   * Record when a Super Admin views a login verification photo
   */
  async recordPhotoView({ auditId, superAdminId, superAdminEmail, ipAddress }) {
    const timestamp = new Date();

    if (isPostgresConnected()) {
      try {
        const res = await pool.query(
          `INSERT INTO audit_photo_views (audit_id, super_admin_id, super_admin_email, ip_address, viewed_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [auditId, superAdminId, superAdminEmail, ipAddress, timestamp]
        );
        return res.rows[0];
      } catch (err) {
        console.warn('⚠️ [AUDIT] DB write for photo view failed, using in-memory store:', err.message);
      }
    }

    const viewRecord = {
      id: nextViewId++,
      audit_id: auditId,
      super_admin_id: superAdminId,
      super_admin_email: superAdminEmail,
      ip_address: ipAddress,
      viewed_at: timestamp.toISOString()
    };
    memoryPhotoViews.unshift(viewRecord);
    return viewRecord;
  },

  /**
   * Get all Super Admin view records for a specific audit photo
   */
  async getPhotoViews(auditId) {
    if (isPostgresConnected()) {
      try {
        const res = await pool.query(
          'SELECT * FROM audit_photo_views WHERE audit_id = $1 ORDER BY viewed_at DESC',
          [auditId]
        );
        return res.rows;
      } catch (err) {
        console.warn('⚠️ [AUDIT] DB read for views failed, using in-memory store:', err.message);
      }
    }

    return memoryPhotoViews.filter(v => String(v.audit_id) === String(auditId));
  },

  /**
   * Securely retrieve the verification photo file with strict retention check
   */
  async getSecureAuditPhoto(auditId, superAdminUser, ipAddress) {
    const audit = await this.getAuditById(auditId);
    if (!audit) {
      throw new Error('Audit record not found.');
    }

    if (!audit.photo_filename) {
      throw new Error('No verification photo was captured for this session.');
    }

    // Check 14-day retention
    const recordTime = new Date(audit.timestamp).getTime();
    if (Date.now() - recordTime > PHOTO_RETENTION_MS) {
      throw new Error('Verification photo has expired under the 14-day automatic retention policy and was permanently deleted.');
    }

    const photoResult = storageService.getSecurePhoto(audit.photo_filename, 'login_audits');
    if (!photoResult || photoResult.isExpired) {
      throw new Error('Verification photo has expired or is no longer available in secure storage.');
    }

    // Log the Super Admin viewing event
    await this.recordPhotoView({
      auditId,
      superAdminId: superAdminUser.id,
      superAdminEmail: superAdminUser.email,
      ipAddress
    });

    return {
      buffer: photoResult.buffer,
      mimeType: photoResult.mimeType,
      audit
    };
  }
};
