import { pool, isPostgresConnected } from '../config/db.js';

// Fallback in-memory dataset
const fallbackDisputes = [
  {
    id: 'DSP-9982',
    fineId: 'FINE-2026-442',
    reason: 'Vehicle was legitimately connected to charging cable',
    dateSubmitted: '2026-06-14',
    status: 'Under Review',
    remarks: 'Awaiting CCTV footage verification from Kandy City Council.'
  },
  {
    id: 'DSP-7841',
    fineId: 'FINE-2026-109',
    reason: 'Emergency avoidance of road hazard / animal crossing',
    dateSubmitted: '2026-03-02',
    status: 'Under Review',
    remarks: 'Assigned to Magistrate Review Division.'
  }
];

export const disputeService = {
  /**
   * Get all filed disputes
   */
  async getDisputes() {
    if (isPostgresConnected()) {
      try {
        const result = await pool.query('SELECT * FROM disputes ORDER BY date_submitted DESC');
        if (result.rows.length > 0) {
          return result.rows.map(r => ({
            id: r.id,
            fineId: r.fine_id,
            reason: r.reason,
            dateSubmitted: new Date(r.date_submitted).toISOString().split('T')[0],
            status: r.status,
            remarks: r.remarks
          }));
        }
      } catch (err) {
        console.warn('DB Disputes query fallback:', err.message);
      }
    }

    return fallbackDisputes;
  },

  /**
   * File a new dispute against a fine
   */
  async fileDispute({ fineId, reason, remarks }) {
    const disputeId = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDispute = {
      id: disputeId,
      fineId: fineId || 'TX-88421',
      reason: reason || 'Disputed fine penalty',
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      remarks: remarks || 'Dispute queued for magistrate review.'
    };

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `INSERT INTO disputes (id, fine_id, reason, date_submitted, status, remarks)
           VALUES ($1, $2, $3, CURRENT_DATE, $4, $5)`,
          [newDispute.id, newDispute.fineId, newDispute.reason, newDispute.status, newDispute.remarks]
        );
      } catch (err) {
        console.warn('DB fileDispute fallback:', err.message);
      }
    }

    fallbackDisputes.unshift(newDispute);
    return newDispute;
  }
};
