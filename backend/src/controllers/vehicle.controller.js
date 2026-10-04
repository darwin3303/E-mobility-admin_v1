import { vehicleService } from '../services/vehicle.service.js';

export const vehicleController = {
  /**
   * GET /api/vehicles/lookup/:plate or /api/vehicles/lookup?plate=...
   * Lookup real vehicle details in the National Vehicle Registry (7,000 CSV dataset)
   */
  async lookup(req, res, next) {
    try {
      const plate = req.params.plate || req.query.plate;
      if (!plate) {
        return res.status(400).json({
          matched: false,
          message: 'Please provide a license plate number to lookup.'
        });
      }

      const result = await vehicleService.lookupByPlate(plate);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/vehicles
   */
  async getAll(req, res, next) {
    try {
      const ownerNic = req.query.ownerNic || req.query.nic;
      const vehicles = await vehicleService.getAllVehicles(ownerNic);
      return res.status(200).json(vehicles);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/vehicles
   */
  async addVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.addVehicle(req.body);
      return res.status(201).json(vehicle);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
};
