import { stationService } from '../services/station.service.js';

export const stationController = {
  /**
   * GET /api/stations
   */
  async getStations(req, res, next) {
    try {
      const stations = await stationService.getStations();
      return res.status(200).json(stations);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/stations/:id
   */
  async getStationById(req, res, next) {
    try {
      const { id } = req.params;
      const station = await stationService.getStationById(id);
      if (!station) {
        return res.status(404).json({ success: false, message: 'Charging station not found' });
      }
      return res.status(200).json(station);
    } catch (err) {
      next(err);
    }
  }
};
