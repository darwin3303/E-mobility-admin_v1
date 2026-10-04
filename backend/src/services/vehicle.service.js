import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, isPostgresConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Vehicle Registry Cache (Loaded from 7,000 CSV Records)
const registryByPlate = new Map();
const registryByCleanPlate = new Map();
const registryList = [];

// In-Memory User Registered Vehicles (Synced across both portals)
const userVehicles = [
  {
    id: 'veh_01',
    plate: 'WP-CBM-4821',
    make: 'Nissan',
    model: 'Leaf ZE1',
    year: 2022,
    type: 'Electric Car (BEV)',
    color: 'Silver Metallic',
    batteryLevel: 84,
    revenueLicenseStatus: 'Valid',
    licenseExpiry: '2027-03-31',
    qrCode: 'EM-LK-4821-VERIFIED',
    ownerNic: '200012345678',
    ownerName: 'Kavinda Perera'
  },
  {
    id: 'veh_02',
    plate: 'CP-BEG-1092',
    make: 'BYD',
    model: 'Atto 3',
    year: 2024,
    type: 'Electric SUV',
    color: 'Ski White',
    batteryLevel: 92,
    revenueLicenseStatus: 'Valid',
    licenseExpiry: '2027-11-15',
    qrCode: 'EM-LK-1092-VERIFIED',
    ownerNic: '198512345678',
    ownerName: 'Admin Commander'
  }
];

/**
 * Load and index all 7,000 records from CSV on server startup
 */
function loadRegistryFromCsv() {
  try {
    const csvPath = path.resolve(__dirname, '../../data/vehicle_registry_7000_records.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn('⚠️ Vehicle registry CSV file not found at:', csvPath);
      return;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length >= 19) {
        const item = {
          registrationId: cols[0].trim(),
          vin: cols[1].trim(),
          plate: cols[2].trim().toUpperCase(),
          make: cols[3].trim(),
          model: cols[4].trim(),
          year: parseInt(cols[5].trim(), 10) || 2020,
          color: cols[6].trim(),
          fuelType: cols[7].trim(),
          bodyType: cols[8].trim(),
          ownerFirstName: cols[9].trim(),
          ownerLastName: cols[10].trim(),
          ownerEmail: cols[11].trim(),
          ownerPhone: cols[12].trim(),
          registrationIssueDate: cols[13].trim(),
          registrationExpiryDate: cols[14].trim(),
          registrationStatus: cols[15].trim(),
          lastInspectionDate: cols[16].trim(),
          inspectionResult: cols[17].trim(),
          stationCode: cols[18].trim()
        };

        const cleanPlate = item.plate.replace(/[^A-Z0-9]/g, '');
        registryByPlate.set(item.plate, item);
        registryByCleanPlate.set(cleanPlate, item);
        registryList.push(item);
      }
    }

    console.log(`🚗 Loaded ${registryList.length} vehicles into National Vehicle Registry index!`);
  } catch (err) {
    console.error('Error loading vehicle registry CSV:', err.message);
  }
}

// Initialize on service load
loadRegistryFromCsv();

export const vehicleService = {
  /**
   * Lookup a vehicle in the National Registry by Number Plate
   * Accepts normalized formats: e.g. "NW-CAC-1860", "NW CAC 1860", "NWCAC1860", "CAC-1860"
   */
  async lookupByPlate(plate) {
    if (!plate || typeof plate !== 'string') {
      return { matched: false, message: 'No vehicle found in the registry.' };
    }

    const cleanInput = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanInput.length < 3) {
      return { matched: false, message: 'No vehicle found in the registry.' };
    }

    // 1. Try PostgreSQL if connected
    if (isPostgresConnected()) {
      try {
        const queryText = `
          SELECT * FROM vehicle_registry 
          WHERE REPLACE(REPLACE(UPPER(license_plate), '-', ''), ' ', '') = $1
             OR UPPER(license_plate) = $2
             OR REPLACE(REPLACE(UPPER(license_plate), '-', ''), ' ', '') LIKE '%' || $1
          LIMIT 1;
        `;
        const res = await pool.query(queryText, [cleanInput, plate.trim().toUpperCase()]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            matched: true,
            vehicle: {
              registrationId: row.registration_id,
              vin: row.vin,
              plate: row.license_plate,
              make: row.make,
              model: row.model,
              year: row.year,
              color: row.color,
              fuelType: row.fuel_type,
              bodyType: row.body_type,
              ownerName: `${row.owner_first_name} ${row.owner_last_name}`.trim(),
              ownerEmail: row.owner_email,
              ownerPhone: row.owner_phone,
              issueDate: row.registration_issue_date,
              expiryDate: row.registration_expiry_date,
              status: row.registration_status,
              stationCode: row.station_code
            }
          };
        }
      } catch (err) {
        console.warn('DB lookupByPlate fallback:', err.message);
      }
    }

    // 2. Query in-memory registry index (Exact match)
    if (registryByCleanPlate.has(cleanInput)) {
      const match = registryByCleanPlate.get(cleanInput);
      return {
        matched: true,
        vehicle: {
          ...match,
          ownerName: `${match.ownerFirstName} ${match.ownerLastName}`.trim()
        }
      };
    }

    // 3. Query in-memory registry index (Suffix / Substring match for plates entered without province code)
    if (cleanInput.length >= 4) {
      for (const [cleanPlate, item] of registryByCleanPlate.entries()) {
        if (cleanPlate.endsWith(cleanInput) || cleanPlate === cleanInput) {
          return {
            matched: true,
            vehicle: {
              ...item,
              ownerName: `${item.ownerFirstName} ${item.ownerLastName}`.trim()
            }
          };
        }
      }
    }

    return {
      matched: false,
      message: 'No vehicle found in the registry.'
    };
  },

  /**
   * Get all registered vehicles
   */
  async getAllVehicles(ownerNic) {
    if (isPostgresConnected()) {
      try {
        let queryText = 'SELECT * FROM vehicles';
        const params = [];
        if (ownerNic) {
          queryText += ' WHERE owner_nic = $1';
          params.push(ownerNic.trim().toUpperCase());
        }
        const res = await pool.query(queryText, params);
        if (res.rows.length > 0) {
          return res.rows;
        }
      } catch (err) {
        console.warn('DB getAllVehicles fallback:', err.message);
      }
    }

    if (ownerNic) {
      const cleanNic = ownerNic.trim().toUpperCase();
      return userVehicles.filter(v => v.ownerNic === cleanNic);
    }
    return userVehicles;
  },

  /**
   * Add / Register a vehicle linked to a citizen
   */
  async addVehicle(vehicleData) {
    const { plate, make, model, year, type, ownerNic, ownerName, ownerId, color } = vehicleData;
    if (!plate) throw new Error('Vehicle plate is required');

    const cleanPlate = plate.trim().toUpperCase();

    // Check if plate exists in official National Registry to enrich with verified data
    const lookup = await this.lookupByPlate(cleanPlate);
    const verified = lookup.matched ? lookup.vehicle : null;

    const newVehicle = {
      id: `veh_${Date.now()}`,
      plate: verified?.plate || cleanPlate,
      make: verified?.make || make || 'Electric Vehicle',
      model: verified?.model || model || 'BEV Model',
      year: verified?.year || parseInt(year, 10) || 2024,
      type: verified?.bodyType || type || 'Electric Car (BEV)',
      color: verified?.color || color || 'Pearl White',
      vin: verified?.vin || `1HGCR2F83HA${Math.floor(100000 + Math.random() * 900000)}`,
      batteryLevel: 95,
      revenueLicenseStatus: verified?.status === 'Active' ? 'Valid' : (verified?.status || 'Valid'),
      licenseExpiry: verified?.expiryDate || '2027-12-31',
      qrCode: `EM-LK-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-VERIFIED`,
      ownerNic: ownerNic ? ownerNic.trim().toUpperCase() : null,
      ownerName: ownerName || verified?.ownerName || 'Citizen Driver',
      ownerId: ownerId || null
    };

    if (isPostgresConnected()) {
      try {
        await pool.query(
          `INSERT INTO vehicles (id, plate, make, model, year, type, battery_level, revenue_license_status, license_expiry, qr_code, owner_nic, owner_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (plate) DO UPDATE
           SET make = EXCLUDED.make, model = EXCLUDED.model, year = EXCLUDED.year, owner_nic = EXCLUDED.owner_nic;`,
          [
            newVehicle.id,
            newVehicle.plate,
            newVehicle.make,
            newVehicle.model,
            newVehicle.year,
            newVehicle.type,
            newVehicle.batteryLevel,
            newVehicle.revenueLicenseStatus,
            newVehicle.licenseExpiry,
            newVehicle.qrCode,
            newVehicle.ownerNic,
            newVehicle.ownerId
          ]
        );
      } catch (err) {
        console.warn('DB addVehicle fallback:', err.message);
      }
    }

    const existingIdx = userVehicles.findIndex(v => v.plate === newVehicle.plate);
    if (existingIdx >= 0) {
      userVehicles[existingIdx] = { ...userVehicles[existingIdx], ...newVehicle };
    } else {
      userVehicles.unshift(newVehicle);
    }

    console.log(`🚗 Vehicle linked to citizen: ${newVehicle.plate} (${newVehicle.make} ${newVehicle.model}) -> NIC: ${newVehicle.ownerNic}`);
    return newVehicle;
  }
};
