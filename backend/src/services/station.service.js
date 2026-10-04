import { pool, isPostgresConnected } from '../config/db.js';

// Fallback in-memory dataset
const fallbackStations = [
  {
    id: 'st_01',
    name: 'Colombo Central EV Hub - One Galle Face',
    location: 'Galle Face Center Rd, Colombo 02',
    distance: '1.2 km',
    availablePlugs: 4,
    totalPlugs: 6,
    power: '60 kW DC Fast',
    pricePerKwh: 'LKR 85 / kWh',
    status: 'Available'
  },
  {
    id: 'st_02',
    name: 'Kottawa Expressway Interchange Station',
    location: 'Southern Expressway, Kottawa',
    distance: '8.5 km',
    availablePlugs: 2,
    totalPlugs: 4,
    power: '120 kW Super Fast',
    pricePerKwh: 'LKR 95 / kWh',
    status: 'Available'
  },
  {
    id: 'st_03',
    name: 'Kandy City Center Charging Plaza',
    location: 'Dalada Veediya, Kandy',
    distance: '115 km',
    availablePlugs: 1,
    totalPlugs: 2,
    power: '22 kW AC',
    pricePerKwh: 'LKR 60 / kWh',
    status: 'Busy'
  }
];

export const stationService = {
  /**
   * Get all EV charging stations
   */
  async getStations() {
    if (isPostgresConnected()) {
      try {
        const result = await pool.query('SELECT * FROM charging_stations ORDER BY id ASC');
        if (result.rows.length > 0) {
          return result.rows.map(r => ({
            id: r.id,
            name: r.name,
            location: r.location,
            distance: r.distance,
            availablePlugs: r.available_plugs,
            totalPlugs: r.total_plugs,
            power: r.power,
            pricePerKwh: r.price_per_kwh,
            status: r.status
          }));
        }
      } catch (err) {
        console.warn('DB Stations query fallback:', err.message);
      }
    }

    return fallbackStations;
  },

  /**
   * Get single station by ID
   */
  async getStationById(id) {
    const stations = await this.getStations();
    return stations.find(s => s.id === id) || null;
  }
};
