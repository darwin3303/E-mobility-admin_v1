import { pool, isPostgresConnected } from '../config/db.js';

// Fallback in-memory dataset with rich telemetry
const fallbackFines = [
  {
    id: 'TX-88421',
    policeStation: 'Southern Expressway Division',
    offence: 'Speeding — 128 km/h in 100 km/h zone',
    date: '2026-03-10',
    dateTime: '10 Mar 2026, 14:32:05',
    dueDate: '25 Mar 2026',
    amount: 3850,
    demeritPoints: 3,
    vehiclePlate: 'WP CAB-4521',
    status: 'Unpaid',
    dueDays: 11,
    locationCoords: '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)',
    location: 'Southern Expressway KM 68.4',
    camera: 'CAM-07 • SOUTHERN EXPY KM 68.4',
    evidenceImage: '/speed_cam_vehicle.png',
    speedRecorded: '128 km/h',
    speedLimit: '100 km/h',
    capturedSpeed: 128,
    postedLimit: 100,
    excessSpeed: '+28 km/h',
    radarCalibration: 'Doppler 77GHz',
    anprMatch: '99.8%',
    officerBadge: 'PO-8819 (Sgt. Jayawardena)',
    vehicleDetails: {
      make: 'Toyota',
      model: 'Aqua Hybrid',
      year: 2020,
      type: 'Hybrid EV'
    }
  },
  {
    id: 'FINE-2026-891',
    policeStation: 'Colombo Expressway Division',
    offence: 'Speeding — 112 km/h in 100 km/h zone',
    date: '2026-03-01',
    dateTime: '01 Mar 2026, 09:15:22',
    dueDate: '16 Mar 2026',
    amount: 3500,
    demeritPoints: 2,
    vehiclePlate: 'WP CBM-4821',
    status: 'Unpaid',
    dueDays: 2,
    locationCoords: '6.9271° N, 79.8612° E (Outer Circular Expressway)',
    location: 'Outer Circular Expressway KM 12.2',
    camera: 'CAM-02 • OUTER CIRCULAR EXPY KM 12.2',
    evidenceImage: '/speed_cam_vehicle.png',
    speedRecorded: '112 km/h',
    speedLimit: '100 km/h',
    capturedSpeed: 112,
    postedLimit: 100,
    excessSpeed: '+12 km/h',
    radarCalibration: 'Doppler 77GHz',
    anprMatch: '99.4%',
    officerBadge: 'PO-4412 (Sgt. Perera)',
    vehicleDetails: {
      make: 'Nissan',
      model: 'Leaf ZE1',
      year: 2022,
      type: 'Electric Car (BEV)'
    }
  },
  {
    id: 'FINE-2026-442',
    policeStation: 'Kandy Municipal Traffic',
    offence: 'EV Charging Spot Blocking',
    date: '2026-02-12',
    dateTime: '12 Feb 2026, 11:45:00',
    dueDate: '27 Feb 2026',
    amount: 1000,
    demeritPoints: 0,
    vehiclePlate: 'WP CBM-4821',
    status: 'Paid',
    dueDays: 0,
    paidAt: '2026-02-15T10:30:00Z',
    receiptNo: 'RCP-982314',
    locationCoords: '7.2906° N, 80.6337° E (Dalada Veediya, Kandy)',
    location: 'Dalada Veediya, Kandy',
    camera: 'CAM-04 • KANDY CITY GRID',
    evidenceImage: '/speed_cam_vehicle.png',
    speedRecorded: 'N/A',
    speedLimit: 'N/A',
    capturedSpeed: 0,
    postedLimit: 0,
    excessSpeed: 'N/A',
    radarCalibration: 'Optical Sensor',
    anprMatch: '98.9%',
    officerBadge: 'PO-1092 (Sgt. Bandara)',
    vehicleDetails: {
      make: 'Nissan',
      model: 'Leaf ZE1',
      year: 2022,
      type: 'Electric Car (BEV)'
    }
  },
  {
    id: 'FINE-2026-109',
    policeStation: 'Gampaha Highway Division',
    offence: 'Improper Lane Changing without Signal',
    date: '2026-02-28',
    dateTime: '28 Feb 2026, 16:20:11',
    dueDate: '14 Mar 2026',
    amount: 2500,
    demeritPoints: 1,
    vehiclePlate: 'CP BEG-1092',
    status: 'Disputed',
    dueDays: 0,
    locationCoords: '7.0840° N, 79.9925° E (Colombo-Kandy Road)',
    location: 'Colombo-Kandy Road (Gampaha)',
    camera: 'CAM-08 • GAMPAHA FLYOVER',
    evidenceImage: '/speed_cam_vehicle.png',
    speedRecorded: 'N/A',
    speedLimit: 'N/A',
    capturedSpeed: 0,
    postedLimit: 0,
    excessSpeed: 'N/A',
    radarCalibration: 'Doppler 77GHz',
    anprMatch: '99.1%',
    officerBadge: 'PO-7721 (Sgt. Fernando)',
    vehicleDetails: {
      make: 'BYD',
      model: 'Atto 3',
      year: 2024,
      type: 'Electric SUV'
    }
  }
];

function formatFineRow(r) {
  const speedInt = parseInt(String(r.speed_recorded || '').replace(/\D/g, ''), 10) || (r.offence?.includes('128') ? 128 : (r.offence?.includes('112') ? 112 : 0));
  const limitInt = parseInt(String(r.speed_limit || '').replace(/\D/g, ''), 10) || 100;
  const excess = speedInt > limitInt ? `+${speedInt - limitInt} km/h` : 'N/A';

  const dateObj = r.date ? new Date(r.date) : new Date();
  const dateFormatted = dateObj.toISOString().split('T')[0];
  const dateTimeFormatted = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 14:32:05';

  return {
    id: r.id,
    citationNo: r.id.startsWith('TX-') ? r.id : `#${r.id}`,
    policeStation: r.police_station || 'Expressway Traffic Division',
    offence: r.offence || 'Traffic Violation',
    date: dateFormatted,
    dateTime: dateTimeFormatted,
    dueDate: r.due_date ? (typeof r.due_date === 'string' ? r.due_date : new Date(r.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })) : '25 Mar 2026',
    amount: parseInt(r.amount, 10) || 3850,
    demeritPoints: r.demerit_points || 0,
    vehiclePlate: r.vehicle_plate || 'WP CAB-4521',
    status: r.status === 'Paid' ? 'Paid' : (r.status === 'Disputed' ? 'Disputed' : 'Unpaid'),
    dueDays: r.due_days !== undefined ? r.due_days : 14,
    locationCoords: r.location_coords || '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)',
    location: r.police_station?.includes('Southern') ? 'Southern Expressway KM 68.4' : (r.location_coords?.split('(')[1]?.replace(')', '') || 'Highway Grid'),
    camera: r.police_station?.includes('Southern') ? 'CAM-07 • SOUTHERN EXPY KM 68.4' : (r.police_station?.includes('Colombo') ? 'CAM-02 • OUTER CIRCULAR EXPY KM 12.2' : 'CAM-01 • TRAFFIC RADAR'),
    evidenceImage: '/speed_cam_vehicle.png',
    speedRecorded: speedInt > 0 ? `${speedInt} km/h` : 'N/A',
    speedLimit: `${limitInt} km/h`,
    capturedSpeed: speedInt,
    postedLimit: limitInt,
    excessSpeed: excess,
    radarCalibration: 'Doppler 77GHz',
    anprMatch: '99.8%',
    officerBadge: r.officer_badge || 'PO-8819 (Sgt. Jayawardena)',
    receiptNo: r.receipt_no || null,
    paidAt: r.paid_at || null,
    vehicleDetails: {
      make: r.make || 'Toyota',
      model: r.model || 'Aqua Hybrid',
      year: r.year || 2020,
      type: r.type || 'Hybrid EV',
      ownerNic: r.owner_nic || '200012345678'
    }
  };
}

export const fineService = {
  /**
   * Get all traffic violation fines (optionally filtered by vehicle plate)
   */
  async getFines(vehiclePlate) {
    if (isPostgresConnected()) {
      try {
        let query = `
          SELECT 
            f.id,
            f.police_station,
            f.offence,
            f.date,
            f.due_date,
            f.amount,
            f.demerit_points,
            f.vehicle_plate,
            f.status,
            f.due_days,
            f.location_coords,
            f.evidence_image,
            f.speed_recorded,
            f.speed_limit,
            f.officer_badge,
            f.receipt_no,
            f.paid_at,
            v.make,
            v.model,
            v.year,
            v.type,
            v.owner_nic
          FROM fines f
          LEFT JOIN vehicles v ON UPPER(REPLACE(REPLACE(v.plate, '-', ''), ' ', '')) = UPPER(REPLACE(REPLACE(f.vehicle_plate, '-', ''), ' ', ''))
        `;

        const params = [];
        if (vehiclePlate) {
          const cleanPlate = vehiclePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
          query += ` WHERE UPPER(REPLACE(REPLACE(f.vehicle_plate, '-', ''), ' ', '')) = $1 OR UPPER(REPLACE(REPLACE(f.vehicle_plate, '-', ''), ' ', '')) LIKE '%' || $1`;
          params.push(cleanPlate);
        }

        query += ` ORDER BY f.date DESC, f.id DESC;`;

        const result = await pool.query(query, params);
        if (result.rows.length > 0) {
          return result.rows.map(formatFineRow);
        }
      } catch (err) {
        console.warn('DB Fines query fallback:', err.message);
      }
    }

    if (vehiclePlate) {
      const cleanPlate = vehiclePlate.replace(/[^A-Z0-9]/g, '').toUpperCase();
      return fallbackFines.filter(f => f.vehiclePlate.replace(/[^A-Z0-9]/g, '').toUpperCase().includes(cleanPlate));
    }

    return fallbackFines;
  },

  /**
   * Get fine/citation by specific ID
   */
  async getFineById(fineId) {
    if (!fineId) return null;
    const cleanId = fineId.trim();

    if (isPostgresConnected()) {
      try {
        const query = `
          SELECT 
            f.id,
            f.police_station,
            f.offence,
            f.date,
            f.due_date,
            f.amount,
            f.demerit_points,
            f.vehicle_plate,
            f.status,
            f.due_days,
            f.location_coords,
            f.evidence_image,
            f.speed_recorded,
            f.speed_limit,
            f.officer_badge,
            f.receipt_no,
            f.paid_at,
            v.make,
            v.model,
            v.year,
            v.type,
            v.owner_nic
          FROM fines f
          LEFT JOIN vehicles v ON UPPER(REPLACE(REPLACE(v.plate, '-', ''), ' ', '')) = UPPER(REPLACE(REPLACE(f.vehicle_plate, '-', ''), ' ', ''))
          WHERE f.id = $1 OR f.id = $2
          LIMIT 1;
        `;
        const res = await pool.query(query, [cleanId, cleanId.replace(/^TX-|^FINE-/, '')]);
        if (res.rows.length > 0) {
          return formatFineRow(res.rows[0]);
        }
      } catch (err) {
        console.warn('DB getFineById fallback:', err.message);
      }
    }

    return fallbackFines.find(f => f.id === cleanId) || null;
  },

  /**
   * Record a new high-speed violation (from AI camera radar detection)
   */
  async recordViolation({
    vehiclePlate = 'WP CAB-4521',
    speedDetected = 128,
    speedLimit = 100,
    location = 'Southern Expressway KM 68.4',
    locationCoords = '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)',
    policeStation = 'Southern Expressway Division',
    camera = 'CAM-07 • SOUTHERN EXPY KM 68.4',
    officerBadge = 'PO-8819 (Sgt. Jayawardena)',
    amount = 3850,
    demeritPoints = 3
  }) {
    const cleanPlate = vehiclePlate.trim().toUpperCase();
    const speed = parseInt(speedDetected, 10) || 128;
    const limit = parseInt(speedLimit, 10) || 100;
    const excess = speed - limit;
    const fineId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;

    const newFine = {
      id: fineId,
      policeStation,
      offence: `Speeding — ${speed} km/h in ${limit} km/h zone (+${excess} km/h excess)`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: parseInt(amount, 10) || 3850,
      demeritPoints: parseInt(demeritPoints, 10) || 3,
      vehiclePlate: cleanPlate,
      status: 'Unpaid',
      dueDays: 14,
      locationCoords,
      evidenceImage: true,
      speedRecorded: `${speed} km/h`,
      speedLimit: `${limit} km/h`,
      officerBadge
    };

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `INSERT INTO fines (id, police_station, offence, date, due_date, amount, demerit_points, vehicle_plate, status, due_days, location_coords, evidence_image, speed_recorded, speed_limit, officer_badge)
           VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING;`,
          [
            newFine.id,
            newFine.policeStation,
            newFine.offence,
            newFine.dueDate,
            newFine.amount,
            newFine.demeritPoints,
            newFine.vehiclePlate,
            newFine.status,
            newFine.dueDays,
            newFine.locationCoords,
            newFine.evidenceImage,
            newFine.speedRecorded,
            newFine.speedLimit,
            newFine.officerBadge
          ]
        );
      } catch (err) {
        console.warn('DB recordViolation fallback:', err.message);
      }
    }

    fallbackFines.unshift(formatFineRow({
      ...newFine,
      speed_recorded: newFine.speedRecorded,
      speed_limit: newFine.speedLimit,
      due_date: newFine.dueDate,
      police_station: newFine.policeStation,
      vehicle_plate: newFine.vehiclePlate,
      demerit_points: newFine.demeritPoints,
      location_coords: newFine.locationCoords,
      officer_badge: newFine.officerBadge
    }));

    return newFine;
  },

  /**
   * Pay a fine
   */
  async payFine(fineId, paymentDetails = {}) {
    const receiptNo = `RCP-${Math.floor(100000 + Math.random() * 900000)}`;
    const paidAt = new Date().toISOString();

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `UPDATE fines SET status = 'Paid', receipt_no = $1, paid_at = CURRENT_TIMESTAMP, due_days = 0 WHERE id = $2`,
          [receiptNo, fineId]
        );
        const rawId = fineId.replace(/^TX-|^FINE-/, '');
        await pool.query(
          `UPDATE tickets SET status = 'Paid' WHERE ticket_id = $1`,
          [parseInt(rawId, 10)]
        );
      } catch (err) {
        console.warn('DB payFine fallback:', err.message);
      }
    }

    // Update in-memory fallback list
    const fine = fallbackFines.find(f => f.id === fineId);
    if (fine) {
      fine.status = 'Paid';
      fine.paidAt = paidAt;
      fine.receiptNo = receiptNo;
      fine.dueDays = 0;
    }

    return {
      success: true,
      fineId,
      status: 'Paid',
      receiptNo,
      paidAt,
      message: `Citation ${fineId} successfully paid.`
    };
  },

  /**
   * Dispute a fine
   */
  async disputeFine(fineId, disputeData = {}) {
    const { reason, remarks } = disputeData;
    const disputeId = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `UPDATE fines SET status = 'Disputed' WHERE id = $1`,
          [fineId]
        );
        await pool.query(
          `INSERT INTO disputes (id, fine_id, reason, date_submitted, status, remarks)
           VALUES ($1, $2, $3, CURRENT_DATE, 'Under Review', $4)
           ON CONFLICT (id) DO NOTHING;`,
          [disputeId, fineId, reason || 'Disputed Speed Violation', remarks || 'Under officer and magistrate review.']
        );
      } catch (err) {
        console.warn('DB disputeFine fallback:', err.message);
      }
    }

    const fine = fallbackFines.find(f => f.id === fineId);
    if (fine) {
      fine.status = 'Disputed';
    }

    return {
      success: true,
      disputeId,
      fineId,
      status: 'Under Review',
      message: `Dispute for ${fineId} submitted successfully.`
    };
  }
};
